# Content Generator

Consume HTML from Kafka messages, transform to AMP HTML, produce.

## Usage

Install via yarn

    yarn install knamp-content-generator

Then configure it and use it

```javascript
import ContentGenerator from "knamp-content-generator";

(async () => {
  ContentGenerator({
    clientName: "generator-client",
    consumeFrom: "generator-consume",
    groupId: "generator-group",
    produceTo: "produce-topic",
  });
})();
```

## Uses

* [Sinek](https://github.com/nodefluent/node-sinek), consuming and producing messages to and from Apache Kafka
* [Ampli](https://github.com/knamp/ampli), transforms HTML to AMP

## License

This project is under [MIT](./LICENSE).
