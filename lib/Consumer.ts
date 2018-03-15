import Ampli, { ContextInterface, OptionsInterface } from "ampli";
import { NConsumer as SinekConsumer } from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
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
  }

  public async connect(): Promise<void> {
    try {
      await this.consumer.connect(this.config.consumeWithBackpressure);
    } catch (error) {
      this.handleError(error);
    }

    this.consumer
      .consume(async (message, callback: (error: Error | null) => void) => {
        let error: Error | null;

        try {
          await this.consume(message);

          error = null;
        } catch (producedError) {
          this.handleError(producedError);

          error = producedError;
        }

        // Return this callback to receive further messages
        callback(error);
      });

    this.consumer.on("error", this.handleError);
  }

  private async consume(message: ConsumerMessageInterface) {
    const ampli: Ampli = new Ampli({
      logger: Logger,
    });
    let amp: string = "";

    try {
      amp = await ampli.transform(message.content);
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

  private handleError(error: Error) {
    Logger.error(error);
  }
}
