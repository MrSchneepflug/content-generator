import ConfigInterface from "./lib/interfaces/ConfigInterface";

import Connector from "./lib/Connector";
import Logger, { set as setLogger } from "./lib/Logger";

const defaultOptions = {
  consumeWithBackpressure: true,
  kafkaHost: "127.0.0.1:9092",
  options: {
    ackTimeoutMs: 100,
    autoCommit: true,
    autoCommitIntervalMs: 1000,
    fetchMaxBytes: 1024 * 1024,
    fetchMaxWaitMs: 10,
    fetchMinBytes: 1,
    fromOffset: "latest",
    heartbeatInterval: 250,
    partitionerType: 3,
    protocol: ["roundrobin"],
    requireAcks: 1,
    retryMinTimeout: 250,
    sessionTimeout: 8000,
    ssl: false,
  },
  produceFlushEveryMs: 1000,
  workerPerPartition: 1,
};

export default async (options: ConfigInterface) => {
  const config: ConfigInterface = Object.assign(defaultOptions, options);

  if (config.logger) {
    setLogger(config.logger);
  }

  Logger.info("Connecting...");

  const connect = new Connector(config);

  await connect.start();
};
