import {merge} from "lodash";

import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

import {BatchConfig, KafkaConsumerConfig, KafkaProducerConfig} from "sinek";
import Connector from "./Connector";

const defaultConfig = {
  getPath: (message: ProducerMessageInterface): string => message.url,
};

const defaultConsumerConfig: KafkaConsumerConfig = {
  groupId: "amp-generator",
};

const defaultProducerConfig: KafkaProducerConfig = {
  clientName: "amp-generator",
};

const defaultBatchConfig: BatchConfig = {
  batchSize: 5,
  commitEveryNBatch: 1,
  concurrency: 1,
  commitSync: false,
  noBatchCommits: false,
  manualBatching: true,
  sortedManualBatch: false,
};

export {default as ConsumerContentInterface} from "./interfaces/ConsumerContentInterface";
export default (
  config: ConfigInterface,
  consumerConfig: KafkaConsumerConfig,
  producerConfig: KafkaProducerConfig,
  batchConfig: BatchConfig,
) => {
  return new Connector(
    merge(defaultConfig, config),
    merge(defaultConsumerConfig, consumerConfig),
    merge(defaultProducerConfig, producerConfig),
    merge(defaultBatchConfig, batchConfig),
  );
};
