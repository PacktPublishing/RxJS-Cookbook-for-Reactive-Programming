import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { CompressionTypes, Kafka, KafkaJSError, Producer } from 'kafkajs';
import { Subject, bufferToggle, catchError, filter, from, merge, fromEvent, mergeAll, retry, throwError, timer, windowToggle, fromEventPattern, switchMap, EMPTY, tap, of, NEVER, repeat, ReplaySubject } from 'rxjs';

interface KafkaMessage {
  topic: string;
  compression: CompressionTypes;
  messages: { value: string }[];
}

@Injectable()
export class MessageBrokerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka: Kafka;
  private readonly producer: Producer;
  public producerActiveState$ = new Subject<boolean>();
  public kafkaMessage$ = new ReplaySubject<KafkaMessage>();

  constructor() {
    this.kafka = new Kafka({
      brokers: ['localhost:9092'],
      retry: {
        retries: 0
      }
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    setTimeout(() => {
      console.log('Disconnecting producer...');
      this.producer.disconnect();
    }, 40000);
    setTimeout(() => {
      console.log('Connecting producer...');
      this.producer.connect();
    }, 50000);

    const producerActive$ = this.producerActiveState$.asObservable().pipe(filter(activeState => activeState));
    const producerInactive$ = this.producerActiveState$.asObservable().pipe(filter(activeState => !activeState));

    merge(
      this.kafkaMessage$.pipe(windowToggle(producerActive$, () => producerInactive$)),
      this.kafkaMessage$.pipe(bufferToggle(producerInactive$, () => producerActive$))
    ).pipe(
      mergeAll(),
      switchMap((kafkaMessage) => from(this.producer.send(kafkaMessage))),
      catchError(() => of('Error sending messages to Kafka!')),
    ).subscribe();
    
    this.handleBrokerConnection();
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }

  async produce(topic: string, message: string) {
    this.kafkaMessage$.next({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [{ value: message }],
    });
  }

  handleBrokerConnection(): void {
    const producerConnect$ = from(this.producer.connect()).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {
          console.log(
            `Attempt ${retryCount}: Error occurred during network request, retrying in ${Math.pow(2, retryCount)} seconds...`
          );
          return timer(Math.pow(2, retryCount) * 1000);
        },
      }),
      catchError(error => {
        console.error(`Error connecting to Kafka: ${error}`);
        this.producerActiveState$.next(false);
        return EMPTY;
      }),
    );
    producerConnect$.subscribe();

    this.producer.on(this.producer.events.CONNECT, () => {
      this.producerActiveState$.next(true);
    });

    const producerDisconnect$ = fromEventPattern(
      (handler) => this.producer.on('producer.disconnect', handler),
    );

    producerDisconnect$.pipe(
      switchMap(() => producerConnect$)
    ).subscribe(() => this.producerActiveState$.next(false));
  }
}
