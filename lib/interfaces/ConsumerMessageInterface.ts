export default interface ConsumerMessageInterface {
  topic: string;
  value: {
    key: string;
    content: string;
    url: string;
  };
}
