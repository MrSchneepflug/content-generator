export default interface ConsumerMessageInterface {
  topic: string;
  key: Buffer | string;
  value: {
    content: string;
    url: string;
  };
}
