import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

import Consumer from "./Consumer";
import Producer from "./Producer";

export default class Connector {
  private consumer: Consumer;
  private producer: Producer;

  constructor(config: ConfigInterface) {
    this.consumer = new Consumer(this.public, config);
    this.producer = new Producer(config);
  }

  public async connect() {
    await this.consumer.connect();
    await this.producer.connect();
  }

  private async public(message: ProducerMessageInterface) {
    await this.producer.add(message);
  }
}
