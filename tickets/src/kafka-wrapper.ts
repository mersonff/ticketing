import { Kafka } from 'kafkajs';

class KafkaWrapper {
  private _client?: Kafka;

  connect(clientId: string, brokers: string[]) {
    this._client = new Kafka({ clientId, brokers });
  }

  get client() {
    if (!this._client) {
      throw new Error('Kafka client not initialized');
    }
    return this._client;
  }
}

export const kafkaWrapper = new KafkaWrapper()