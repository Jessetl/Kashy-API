import { registerAs } from '@nestjs/config';

export const NOTIFICATION_QUEUE = 'notifications_queue';
export const NOTIFICATION_EXCHANGE = 'notifications_exchange';

export const rabbitmqConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queue: NOTIFICATION_QUEUE,
  exchange: NOTIFICATION_EXCHANGE,
}));
