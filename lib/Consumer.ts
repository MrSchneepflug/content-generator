import EventEmitter from "events";
import {KafkaConsumerConfig, NConsumer as SinekConsumer} from "sinek";
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
    this.consumer.on("error", (error) => super.emit("error", error));
  }

  public async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      super.emit("info", "Connected consumer");
    } catch (error) {
      super.emit("error", error);
    }

    this.consumer.consume(this.consume.bind(this), true, true).catch((error) => super.emit("error", error));
  }

  private async consume(message: Message, commit: () => void): Promise<void> {
    if (!isKafkaMessage(message)) {
      throw new Error("Can only handle messages in KafkaMessage format");
    }

    try {
      const messageContent: ConsumerContentInterface = {
        content: message.value.content,
        url: message.value.url,
      };

      const content = await this.config.transformer(messageContent);
      await this.publish(message.key, {content, url: messageContent.url});
      commit();
    } catch (error) {
      super.emit("error", error);
    }
  }
}
