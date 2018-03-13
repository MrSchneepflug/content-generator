import ConfigInterface from "./lib/interfaces/ConfigInterface";
import Logger, { set as setLogger } from "./lib/Logger";

const defaultOptions: ConfigInterface = {
  clientName: "generator-client",
  consumeFrom: "consumer-topic",
  consumeWithBackpressure: true,
  groupId: "generator-group",
  kafkaHost: "localhost:9193",
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
  },
  produceTo: "produce-topic",
  workerPerPartition: 1,
};

export default (options: ConfigInterface) => {
  const config: ConfigInterface = Object.assign(defaultOptions, options);

  if (config.logger) {
    setLogger(config.logger);
  }
};
