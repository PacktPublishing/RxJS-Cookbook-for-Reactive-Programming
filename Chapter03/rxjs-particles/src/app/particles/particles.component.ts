import { Component, ElementRef, ViewChild } from '@angular/core';
import { scan, Observable, merge, tap, TimestampProvider, animationFrames, fromEvent, map } from 'rxjs';

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
}

@Component({
  selector: 'app-particles',
  standalone: true,
  imports: [],
  templateUrl: './particles.component.html',
  styleUrl: './particles.component.scss'
})
export class ParticlesComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;  
  private mouseX!: number; 
  private mouseY!: number;
  private particles$!: Observable<Particle[]>;

  private generateParticle(): Particle {
    if (!this.canvas) return {
      x: 0,
      y: 0,
      radius: 0,
      vx: 0,
      vy: 0,
      color: ``
    };

    return {
      x: Math.random() * this.canvas.nativeElement.width,
      y: Math.random() * this.canvas.nativeElement.height,
      radius: Math.random() * 0.5 + 3.5,
      vx: Math.random() < 0.5 ? (Math.random() * 2 + 0.3) : -(Math.random() * 2 + 0.3),
      vy: Math.random() < 0.5 ? (Math.random() * 2 + 0.3) : -(Math.random() * 2 + 0.3),
      color: `rgba(255,255,255,0.6)`
    }
  };

  ngOnInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    console.log(this.ctx)
    this.mouseX = 0; 
    this.mouseY = 0;

    const initialParticles: Particle[] = Array.from({ length: 123 }, this.generateParticle, this);

    if (!initialParticles.length) return;

    let now = 0;
    const customTSProvider: TimestampProvider = {
      now() { return now++; }
    };

    const mouseMove$ = fromEvent<MouseEvent>(this.canvas.nativeElement, 'mousemove').pipe(
      map(event => {
        const rect = this.canvas.nativeElement.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left) * (this.canvas.nativeElement.width / rect.width),
          y: (event.clientY - rect.top) * (this.canvas.nativeElement.height / rect.height)
        };
      })
    );

    const animationFrame$ = animationFrames(customTSProvider);

    this.particles$ = merge(mouseMove$,animationFrame$).pipe(
      // tap(console.log),
      scan((particles: Particle[], event: any) => {
        if (typeof event !== 'number' && 'radius' in event) {
          // return [...particles, event];
          return [];
        } else if (typeof event !== 'number' && 'x' in event && 'y' in event) {
          this.mouseX = event.x;
          this.mouseY = event.y;
          
          return particles;
        } else {
          return particles.map(particle => {
            let newX = particle.x + particle.vx;
            let newY = particle.y + particle.vy;

            // Wall collision detection
            if (newX + particle.radius > this.canvas.nativeElement.width || newX - particle.radius < 0) {
              particle.vx = -particle.vx;
            }
            if (newY + particle.radius > this.canvas.nativeElement.height || newY - particle.radius < 0) {
              particle.vy = -particle.vy;
            }

            // Mouse hover radius avoidance
            const distanceToMouse = Math.sqrt((this.mouseX - particle.x) ** 2 + (this.mouseY - particle.y) ** 2);
            if (distanceToMouse <= 200) { 
              // Calculate angle between particle and mouse
              const angle = Math.atan2(particle.y - this.mouseY, particle.x - this.mouseX);
              const normalX = Math.cos(angle);
              const normalY = Math.sin(angle);
              const dotProduct = particle.vx * normalX + particle.vy * normalY;
              particle.vx = particle.vx - 1.2 * dotProduct * normalX;
              particle.vy = particle.vy - 1.2 * dotProduct * normalY;
              // Move particle away from mouse
              newX = this.mouseX + 200 * Math.cos(angle) + particle.vx; 
              newY = this.mouseY + 200 * Math.sin(angle) + particle.vy;
            }


            return { ...particle, x: newX, y: newY, vx: particle.vx, vy: particle.vy }; 
          });
        }
      }, initialParticles),
      tap(particles => this.drawParticles(particles))
    );

    this.particles$.subscribe();
  }

  drawParticles(particles: Particle[]) {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const particle1 = particles[i];
        const particle2 = particles[j];
        const distance = Math.sqrt(
          (particle1.x - particle2.x) ** 2 + (particle1.y - particle2.y) ** 2
        );

        if (distance <= 250) {
          const opacity = 1 - distance / 250;
          this.ctx.beginPath();
          this.ctx.moveTo(particle1.x, particle1.y);
          this.ctx.lineTo(particle2.x, particle2.y);
          this.ctx.strokeStyle = `rgba(255,255,255, ${opacity})`;
          this.ctx.lineWidth = 0.7;
          this.ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();  
    });
  }
}
