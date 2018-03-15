import Ampli, { ContextInterface, OptionsInterface } from "ampli";
import { NConsumer as SinekConsumer } from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
import ConsumerContentInterface from "./interfaces/ConsumerContentInterface";
import ConsumerMessageInterface from "./interfaces/ConsumerMessageInterface";
import LoggerInterface from "./interfaces/LoggerInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";
import Logger from "./Logger";
import Producer from "./Producer";

export default class Consumer {
  private consumer: SinekConsumer;

  constructor(
    private publish: (message: ProducerMessageInterface) => void,
    private config: ConfigInterface,
  ) {
    const { consumeFrom } = config;

    this.consumer = new SinekConsumer(consumeFrom, config);

    this.consume = this.consume.bind(this);
    this.handleError = this.handleError.bind(this);

    if (process.env.DEBUG === "*") {
      Logger.info("setup consumer done");
    }
  }

  public async connect(): Promise<void> {
    // @TODO check if topic exists

    try {
      await this.consumer.connect();

      Logger.info("Connected consumer");
    } catch (error) {
      this.handleError(error);
    }

    try {
      await this.consumer.consume(this.consume);
    } catch (error) {
      this.handleError(error);
    }

    this.consumer.on("error", this.handleError);
  }

  private async consume(
    message: ConsumerMessageInterface,
    callback: (error: Error | null) => void,
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
    callback(error);
  }

  private async handleMessage(message: ConsumerMessageInterface) {
    const ampli: Ampli = new Ampli({
      logger: Logger,
    });
    let amp: string = "";

    const messageContent: ConsumerContentInterface | null = this.parseMessage(message);

    try {
      if (messageContent) {
        amp = await ampli.transform(messageContent.content);
      }
    } catch (err) {
      Logger.error("transformation with ampli failed", err);
    }

    // Publish messages via Connector
    try {
      await this.publish({
        content: amp,
      });
    } catch (err) {
      Logger.error("publishing failed", err, amp);
    }
  }

  private parseMessage(message: ConsumerMessageInterface): ConsumerContentInterface | null {
    try {
      return JSON.parse(message.value);
    } catch (error) {
      Logger.info("Cannot read message", error, message);
    }

    return null;
  }

  private handleError(error: Error) {
    Logger.error(error);
  }
}
