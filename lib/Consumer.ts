import EventEmitter from "events";
import {KafkaConsumerConfig, KafkaMessage, NConsumer as SinekConsumer, SortedMessageBatch} from "sinek";

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
    private readonly publish: (key: Buffer | string, message: ProducerMessageInterface) => void,
  ) {
    super();

    this.consumer = new SinekConsumer(consumeFrom, consumerConfig);

    this.consume = this.consume.bind(this);
    this.consumer.on("error", (error) => super.emit("error", error));

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
      super.emit("error", error);
    }

    this.consumer.consume(this.consume, true, true).catch((error) => super.emit("error", error));
  }

  private consume(message: Message, callback: (error?: any) => void): void {
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
    callback: (error?: any) => void,
  ): Promise<void> {
    let error: Error | null;

    try {
      await this.handleMessage(message);

      error = null;
    } catch (producedError) {
      super.emit("error", producedError);

      error = producedError;
    }

    // Return this callback to receive further messages
    try {
      callback();
    } catch (error) {
      super.emit("error", error);
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
      super.emit("error", err);
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
}
