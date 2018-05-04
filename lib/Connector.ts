import * as EventEmitter from "events";

import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

import Consumer from "./Consumer";
import Producer from "./Producer";

/**
 * Initially connect to consumer and producer
 */
export default class Connector extends EventEmitter {
  private consumer: Consumer;
  private producer: Producer;

  constructor(config: ConfigInterface) {
    super();

    super.emit("info", "Connecting...");

    this.publish = this.publish.bind(this);

    this.consumer = new Consumer(this.publish, config);
    this.producer = new Producer(config);

    this.consumer.on("info", this.handleInfo.bind(this));
    this.consumer.on("error", this.handleError.bind(this));
    this.producer.on("info", this.handleInfo.bind(this));
    this.producer.on("error", this.handleError.bind(this));

  }

  public async start(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }

  private async publish(key: string, message: ProducerMessageInterface): Promise<void> {
    await this.producer.produce(key, message);
  }

  private handleError(error: Error): void {
    super.emit("error", error);
  }

  private handleInfo(info: any): void {
    super.emit("info", info);
  }
}
