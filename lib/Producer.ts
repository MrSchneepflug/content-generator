import { NProducer as SinekProducer } from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";
import Logger from "./Logger";

export default class Producer {
  private static messages: ProducerMessageInterface[] = [];
  private producer: SinekProducer;
  private timeout: number | null = null;

  constructor(public config: ConfigInterface) {
    this.producer = new SinekProducer(config, 1);

    this.flush = this.flush.bind(this);
  }

  public add(message: ProducerMessageInterface): void {
    Producer.messages.push(message);

    if (!this.timeout) {
      this.timeout = setTimeout(this.flush, this.config.produceFlushEveryMs);
    }
  }

  public async connect(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (error) {
      this.handleError(error);
    }

    this.producer.on("error", this.handleError);
  }

  private async flush(): Promise<void> {
    for (const message of Producer.messages) {
      await this.produce(message);
    }

    Producer.messages = [];

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  private async produce(message: ProducerMessageInterface): Promise<void> {
    this.producer.send(this.config.produceTo, message);
  }

  private handleError(error: Error): void {
    Logger.error(error);
  }
}
