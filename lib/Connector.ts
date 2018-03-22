import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

import Consumer from "./Consumer";
import Producer from "./Producer";

/**
 * Initially connect to consumer and producer
 */
export default class Connector {
  private consumer: Consumer;
  private producer: Producer;

  constructor(config: ConfigInterface) {
    this.publish = this.publish.bind(this);

    this.consumer = new Consumer(this.publish, config);
    this.producer = new Producer(config);
  }

  public async start(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }

  private async publish(key: string, message: ProducerMessageInterface): Promise<void> {
    await this.producer.produce(key, message);
  }
}
