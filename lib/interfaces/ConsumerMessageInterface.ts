export default interface ConsumerMessageInterface {
  topic: string;
  value: {
    id: string;
    content: string;
    url: string;
  };
}
