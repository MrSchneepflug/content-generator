import ContentGenerator from "../";

(async () => {
  const generator = await ContentGenerator({
    clientName: "generator-client",
    consumeFrom: "generator-consume",
    groupId: "generator-group2",
    produceTo: "produce-topic",
  });

  generator.on("error", console.error);
  generator.on("info", console.info);
})();
