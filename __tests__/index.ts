import ContentGenerator from "../";

(async () => {
  ContentGenerator({
    clientName: "generator-client",
    consumeFrom: "generator-consume",
    groupId: "generator-group",
    produceTo: "produce-topic",
  });
})();
