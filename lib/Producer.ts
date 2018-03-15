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
    this.handleError = this.handleError.bind(this);

    if (process.env.DEBUG === "*") {
      Logger.info("setup producer done");
    }
  }

  /**
   * Initially connect to producer
   */
  public async connect(): Promise<void> {
    try {
      await this.producer.connect();

      Logger.info("Connected producer");
    } catch (error) {
      this.handleError(error);
    }

    this.producer.on("error", this.handleError);
  }

  /**
   * Adding a new message object
   */
  public add(message: ProducerMessageInterface): void {
    Producer.messages.push(message);

    if (!this.timeout) {
      this.timeout = setTimeout(this.flush, this.config.produceFlushEveryMs);
    }
  }

  /**
   * Flushes messages to topic producer
   */
  private async flush(): Promise<void> {
    for (const message of Producer.messages) {
      try {
        await this.produce(message);
      } catch (error) {
        Logger.error("while producing", error, message);
      }
    }

    Producer.messages = [];

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  /**
   * Produce a single message
   */
  private async produce(message: ProducerMessageInterface): Promise<void> {
    try {
      const messageString: string = JSON.stringify(message);
      await this.producer.send(this.config.produceTo, messageString);
    } catch (error) {
      Logger.error("sending message failed", error, message);
    }
  }

  /**
   * If there is an error, please report it
   */
  private handleError(error: Error): void {
    Logger.error(error);
  }
}
