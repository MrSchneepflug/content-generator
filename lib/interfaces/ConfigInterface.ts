import ConsumerContentInterface from "./ConsumerContentInterface";
import ProducerMessageInterface from "./ProducerMessageInterface";

export default interface ConfigInterface {
  consumeFrom: string;
  produceTo: string;
  groupId: string;
  clientName: string;
  transformer: (message: ConsumerContentInterface) => Promise<string>;
  producerPartitionCount?: number;
  getPath?: (message: ProducerMessageInterface) => string;
}
