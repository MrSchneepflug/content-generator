import ContentGenerator from "../";
import ConsumerContentInterface from "../lib/interfaces/ConsumerContentInterface";

(async () => {
  const generator = await ContentGenerator({
    clientName: "generator-client",
    consumeFrom: "generator-consume",
    groupId: "generator-group2",
    produceTo: "produce-topic",
    transformer: async (message: ConsumerContentInterface) => await message.content,
  });

  generator.on("error", console.error);
  generator.on("info", console.info);
})();
