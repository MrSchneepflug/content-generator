# Content Generator

Consume HTML from Kafka messages, transform to AMP HTML, produce.

## Usage

Install via yarn

    yarn install knamp-content-provider

Then configure it and use it

```javascript
import ContentGenerator from "knamp-content-generator";

ContentGenerator({
  clientName: "generator-client",
  consumeFrom: "generator-consume",
  groupId: "generator-group",
  produceTo: "produce-topic",
});
```

## Uses

* [Sinek](https://github.com/nodefluent/node-sinek), connection and talking with Kafka
* [Ampli](https://github.com/knamp/ampli), transforms HTML to AMP

## License

This project is under [MIT](./LICENSE).
