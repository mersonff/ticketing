import { Kafka } from 'kafkajs';
import { TicketCreatedProducer } from './events/ticket-created-publisher';

const client = new Kafka({
  clientId: 'ticketing-producer',
  brokers: ['localhost:9092'],
});

const producer = new TicketCreatedProducer(client);

const publishEvent = async () => {
  await producer.connect();
  console.log('Publisher connected to Kafka');

  process.on('SIGINT', async () => {
    console.log('Graceful shutdown: disconnecting producer...');
    await producer.disconnect();
    console.log('Producer disconnected.');
    process.exit(0);
  });

  await producer.publish({
    id: '123',
    title: 'concert',
    price: 20,
    userId: 'user123',
  });

  console.log('Event published');
};

publishEvent().catch(console.error);
