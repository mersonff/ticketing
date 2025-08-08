import { Kafka } from 'kafkajs';
import { TicketCreatedConsumer } from './events/ticket-created-consumer';

const client = new Kafka({
  clientId: 'ticketing-consumer',
  brokers: ['localhost:9092'],
});

const consumer = new TicketCreatedConsumer(client, 'ticketing-group');
consumer.connect();
