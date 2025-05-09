export enum OrderStatus {
  ACCEPTED = 'Accepted',
  COURIER_ON_THE_WAY = 'Courier on the way',
  DELIVERED = 'Delivered',
}

export const orderNotification: Record<string, any> = {
  [OrderStatus.ACCEPTED]: {
    notification: {
      title: 'Order Accepted',
      body: 'Your order has been accepted and is being prepared.',
      icon: 'http://localhost:3000/assets/burger.jpg',
    },
  },
  [OrderStatus.COURIER_ON_THE_WAY]: {
    notification: {
      title: 'Courier on the way',
      body: 'Your order is out for delivery. Track your order in real-time.',
      icon: 'http://localhost:3000/assets/burger.jpg',
      actions: [{ action: 'location', title: 'Check Location' }],
      data: {
        onActionClick: {
          default: {
            operation: 'openWindow',
            url: 'http://127.0.0.1:8080/geolocation?lat=12.9716&long=77.5946',
          },
          rate: {
            operation: 'openWindow',
            url: 'http://127.0.0.1:8080/geolocation?lat=12.9716&long=77.5946',
          },
        },
      },
    },
  },
  [OrderStatus.DELIVERED]: {
    notification: {
      title: 'Feedback Request',
      body: 'How was your experience? Rate your order and help us improve.',
      actions: [{ action: 'rate', title: 'Rate Now' }],
      icon: 'http://localhost:3000/assets/burger.jpg',
      data: {
        onActionClick: {
          default: {
            operation: 'openWindow',
            url: 'http://127.0.0.1:8080/feedback',
          },
          rate: {
            operation: 'openWindow',
            url: 'http://127.0.0.1:8080/feedback',
          },
        },
      },
    },
  },
};
