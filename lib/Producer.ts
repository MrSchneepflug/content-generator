import * as EventEmitter from "events";

import { NProducer as SinekProducer } from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

export default class Producer extends EventEmitter {
  private producer: SinekProducer;
  private timeout: number | null = null;

  constructor(public config: ConfigInterface) {
    super();

    this.producer = new SinekProducer(config, 1);

    this.handleError = this.handleError.bind(this);

    if (process.env.DEBUG === "*") {
      super.emit("info", "setup producer done");
    }
  }

  /**
   * Initially connect to producer
   */
  public async connect(): Promise<void> {
    try {
      await this.producer.connect();

      super.emit("info", "Connected producer");
    } catch (error) {
      this.handleError(error);
    }

    this.producer.on("error", this.handleError);
  }

  /**
   * Adding a new message object
   */
  public async produce(key: string, message: ProducerMessageInterface): Promise<void> {
    try {
      // With version = 1
      message.path = "/missing"; // TODO: make this set-able via transform callback from config
      await this.producer.buffer(this.config.produceTo, key, message, null, 1);

      super.emit("info", `Message produced with id ${key}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * If there is an error, please report it
   */
  private handleError(error: Error): void {
    super.emit("error", error);
  }
}
