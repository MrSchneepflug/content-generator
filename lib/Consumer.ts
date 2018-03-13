import Ampli, { ContextInterface, OptionsInterface } from "ampli";
import { SinekConsumer } from "sinek";

import ConfigInterface from "./interfaces/ConfigInterface";
import ConsumerMessageInterface from "./interfaces/ConsumerMessageInterface";
import Logger from "./Logger";

export default class Consumer {
  private consumer: SinekConsumer;

  constructor(public config: ConfigInterface) {
    const { consumeFrom } = config;

    this.consumer = new SinekConsumer(consumeFrom, config);
  }

  private async connect(): Promise<void> {
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
    const amp: string = await ampli.transform(message.content);

    // Produce to topic
  }

  private handleError(error: Error) {
    Logger.error(error);
  }
}
