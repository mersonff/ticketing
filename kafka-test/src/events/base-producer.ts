import { Kafka, Producer } from 'kafkajs';

interface Event {
  subject: string;
  data: any;
}

export abstract class BaseProducer<T extends Event> {
  abstract subject: T['subject'];
  private kafka: Kafka;
  private producer: Producer;

  constructor(kafka: Kafka) {
    this.kafka = kafka;
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    console.log(`✅ Producer conectado ao Kafka para o tópico: ${this.subject}`);
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    console.log(`❌ Producer desconectado do Kafka para o tópico: ${this.subject}`);
  }

  async publish(data: T['data']): Promise<void> {
    await this.producer.send({
      topic: this.subject,
      messages: [{ value: JSON.stringify(data) }],
    });

    console.log(`📤 Mensagem publicada no tópico ${this.subject}:`, data);
  }
}