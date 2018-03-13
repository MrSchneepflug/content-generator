import LoggerInterface from "./LoggerInterface";

export default interface ConfigInterface {
  kafkaHost: string;
  consumeFrom: string;
  produceTo: string;
  groupId: string;
  clientName: string;
  consumeWithBackpressure?: boolean;
  logger?: LoggerInterface | undefined;
  workerPerPartition?: number;
  options?: {
    ssl?: boolean,
    sslOptions?: {
      // https://nodejs.org/dist/latest-v8.x/docs/api/tls.html#tls_tls_createsecurecontext_options
      rejectUnauthorized?: boolean,
      key?: string,
      cert?: string,
      ca?: [string],
      passphrase?: string,
    },
    sessionTimeout?: number,
    protocol?: [string],
    fromOffset?: string,
    fetchMaxBytes?: number,
    fetchMinBytes?: number,
    fetchMaxWaitMs?: number,
    heartbeatInterval?: number,
    retryMinTimeout?: number,
    autoCommit?: boolean,
    autoCommitIntervalMs?: number,
    requireAcks?: number,
    ackTimeoutMs?: number,
    partitionerType?: number,
  };
}
