import EventEmitter from "events";
import {KafkaMessage, NConsumer as SinekConsumer} from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
import ConsumerContentInterface from "./interfaces/ConsumerContentInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

export default class Consumer extends EventEmitter {
  private consumer: SinekConsumer;

  constructor(
    private publish: (key: Buffer | string, message: ProducerMessageInterface) => void,
    private config: ConfigInterface,
  ) {
    super();

    const { consumeFrom } = config;

    // @todo: revert this "arrayification" when https://github.com/nodefluent/node-sinek/pull/102 is accepted
    this.consumer = new SinekConsumer([consumeFrom], config);

    this.consume = this.consume.bind(this);
    this.handleError = this.handleError.bind(this);

    if (process.env.DEBUG === "*") {
      super.emit("info", "setup consumer done");
    }
  }

  /**
   * Initially connect to Consumer
   */
  public async connect(): Promise<void> {
    try {
      await this.consumer.connect();

      super.emit("info", "Connected consumer");
    } catch (error) {
      this.handleError(error);
    }

    // Consume as JSON with callback
    try {
      await this.consumer.consume(
        this.consume,
        true,
        true,
        this.config.consumerOptions,
      ).catch((error) => this.handleError(error));
    } catch (error) {
      this.handleError(error);
    }

    this.consumer.on("error", this.handleError);
  }

  private async consume(message: KafkaMessage | KafkaMessage[], callback: (error: any) => void): Promise<void> {
    if (Array.isArray(message)) {
      message.map((m: KafkaMessage) => this.consumeSingle(m, callback));
    } else {
      return this.consumeSingle(message, callback);
    }
  }

  /**
   * Handle consuming messages
   */
  private async consumeSingle(
    message: KafkaMessage,
    callback: (error: any) => void,
  ): Promise<void> {
    let error: Error | null;

    try {
      await this.handleMessage(message);

      error = null;
    } catch (producedError) {
      this.handleError(producedError);

      error = producedError;
    }

    // Return this callback to receive further messages
    try {
      callback(error);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle newly created messages
   */
  private async handleMessage(message: KafkaMessage) {
    super.emit(
      "info",
      `pre-parse - url: ${message.value.url} - content: ${message.value.content.substr(0, 50)} ...`,
    );

    const messageContent: ConsumerContentInterface = this.parseMessage(message);

    // Publish messages via Connector
    try {
      super.emit(
        "info",
        `pre-transform - url: ${message.value.url} - content: ${messageContent.content.substr(0, 50)} ...`,
      );

      const content = await this.config.transformer(messageContent);

      super.emit(
        "info",
        `pre-publish - url: ${message.value.url} - content: ${content.substr(0, 50)} ...`,
      );

      await this.publish(message.key, {
        content,
        url: messageContent.url,
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Parse a message from Kafka and turn it into an object
   */
  private parseMessage(message: KafkaMessage): ConsumerContentInterface {
    return {
      content: message.value.content,
      url: message.value.url,
    };
  }

  /**
   * If there is an error, please report it
   */
  private handleError(error: Error) {
    super.emit("error", error);
  }
}
