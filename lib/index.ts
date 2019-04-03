import {merge} from "lodash";

import ConfigInterface from "./interfaces/ConfigInterface";
import ProducerMessageInterface from "./interfaces/ProducerMessageInterface";

import {KafkaConsumerConfig, KafkaProducerConfig} from "sinek";
import Connector from "./Connector";

const defaultConfig = {
  getPath: (message: ProducerMessageInterface): string => message.url,
};

const defaultConsumerConfig: KafkaConsumerConfig = {
  kafkaHost: "127.0.0.1:9092",
  // metadata.broker.list MUST be set via kafkaHost-property. If we set it here manually, it will be used as
  // an overwrite.
  //
  // @ts-ignore
  noptions: {
    "group.id": "content-generator",
    "api.version.request": true,
    "socket.keepalive.enable": true,
    "enable.auto.commit": false,
  },
  tconf: {
    "auto.offset.reset": "earliest",
  },
};

const defaultProducerConfig: KafkaProducerConfig = {
  clientName: "amp-generator",
};

export {default as ConsumerContentInterface} from "./interfaces/ConsumerContentInterface";
export default (
  config: ConfigInterface,
  consumerConfig: KafkaConsumerConfig,
  producerConfig: KafkaProducerConfig,
) => {
  return new Connector(
    merge(defaultConfig, config),
    merge(defaultConsumerConfig, consumerConfig),
    merge(defaultProducerConfig, producerConfig),
  );
};
