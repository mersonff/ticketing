import { Kafka, Consumer as KafkaConsumer, EachMessagePayload } from 'kafkajs';
import { Subjects } from './subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class BaseConsumer<T extends Event> {
  abstract subject: T['subject']; // 🔹 Define o tópico do evento
  protected ackWait = 5 * 1000;
  private kafka: Kafka;
  private consumer: KafkaConsumer;
  protected queueGroupName: string;

  constructor(kafka: Kafka, queueGroupName: string) {
    this.kafka = kafka;
    this.queueGroupName = queueGroupName;
    this.consumer = this.kafka.consumer({ groupId: this.queueGroupName });
  }

  async connect() {
    await this.consumer.connect();
    console.log(`✅ Consumer conectado ao Kafka para o tópico: ${this.subject}`);

    await this.consumer.subscribe({ topic: this.subject, fromBeginning: true });

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async (payload: EachMessagePayload) => {
        try {
          // 🔹 Convertendo a mensagem para o tipo `T['data']`
          const parsedData: T['data'] = JSON.parse(payload.message.value?.toString() || '{}');

          console.log(`📥 Mensagem recebida no tópico ${payload.topic}:`, parsedData);

          await this.onMessage(parsedData); // 🔹 Agora `onMessage` recebe `T['data']` diretamente

          // 🔹 Faz commit manual do offset apenas se `onMessage` for bem-sucedido
          await this.consumer.commitOffsets([
            {
              topic: payload.topic,
              partition: payload.partition,
              offset: (Number(payload.message.offset) + 1).toString(),
            },
          ]);

          console.log(`✅ Offset ${payload.message.offset} confirmado para ${payload.topic}`);
        } catch (error: any) {
          console.error(`❌ Erro ao processar mensagem: ${error.message}`);
          // 🔹 Aguarda antes de tentar novamente (evita consumo rápido demais)
          await new Promise((resolve) => setTimeout(resolve, this.ackWait));
        }
      },
    });

    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
  }

  async shutdown() {
    console.log('🔻 Graceful shutdown: desconectando consumer...');
    await this.consumer.disconnect();
    console.log('🔻 Consumer desconectado.');
    process.exit(0);
  }

  // 🔹 Agora `onMessage` recebe diretamente `T['data']`
  abstract onMessage(data: T['data']): Promise<void>;
}
