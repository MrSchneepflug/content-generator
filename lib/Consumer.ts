import EventEmitter from "events";
import {BatchConfig, KafkaConsumerConfig, KafkaMessage, NConsumer as SinekConsumer, SortedMessageBatch} from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
import ConsumerContentInterface from "./interfaces/ConsumerContentInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

import {isKafkaMessage, Message} from "./typeguards";

export default class Consumer extends EventEmitter {
  private consumer: SinekConsumer;

  constructor(
    private readonly consumeFrom: string,
    private readonly config: ConfigInterface,
    private readonly consumerConfig: KafkaConsumerConfig,
    private readonly batchConfig: BatchConfig,
    private readonly publish: (key: Buffer | string, message: ProducerMessageInterface) => void,
  ) {
    super();

    this.consumer = new SinekConsumer(consumeFrom, consumerConfig);

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
      await this.consumer.consume(this.consume, true, true, this.batchConfig);
    } catch (error) {
      this.handleError(error);
    }

    this.consumer.on("error", this.handleError);
  }

  private consume(message: Message, callback: (error: any) => void): void {
    if (Array.isArray(message)) {
      message.forEach((kafkaMessage: KafkaMessage) => this.consumeSingle(kafkaMessage, callback));
    } else if (isKafkaMessage(message)) {
      this.consumeSingle(message, callback);
    } else {
      this.consumeBatch(message, callback);
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

  private consumeBatch(batch: SortedMessageBatch, callback: (error: any) => void): void {
    for (const topic in batch) {
      if (!batch.hasOwnProperty(topic)) {
        continue;
      }

      for (const partition in batch[topic]) {
        if (!batch[topic].hasOwnProperty(partition)) {
          continue;
        }

        batch[topic][partition].forEach((message: KafkaMessage) => {
          this.consumeSingle(message, callback);
        });
      }
    }
  }

  /**
   * Handle newly created messages
   */
  private async handleMessage(message: KafkaMessage) {
    const messageContent: ConsumerContentInterface = this.parseMessage(message);

    // Publish messages via Connector
    try {
      const content = await this.config.transformer(messageContent);

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
