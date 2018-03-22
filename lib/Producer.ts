import { NProducer as SinekProducer } from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";
import Logger from "./Logger";

export default class Producer {
  private producer: SinekProducer;
  private timeout: number | null = null;

  constructor(public config: ConfigInterface) {
    this.producer = new SinekProducer(config, 1);

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
  public async add(message: ProducerMessageInterface): Promise<void> {
    try {
      // With version = 1
      await this.producer.buffer(this.config.produceTo, message.key, message, null, 1);
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
