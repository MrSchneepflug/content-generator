import ContentGenerator from "../";

(async () => {
  ContentGenerator({
    clientName: "generator-client",
    consumeFrom: "generator-consume",
    groupId: "generator-group2",
    produceTo: "produce-topic",
  });
})();
