import ContentGenerator from "../";

ContentGenerator({
  clientName: "generator-client",
  consumeFrom: "generator-consume",
  groupId: "generator-group",
  produceTo: "produce-topic",
});
