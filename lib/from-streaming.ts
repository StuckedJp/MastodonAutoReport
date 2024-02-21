import { createStreamingAPIClient, createRestAPIClient } from "masto";
const config = require("../env.json");

const isTarget = (event: any): boolean => {
  console.log(
    new Date().toISOString(),
    event.payload.id,
    event.payload.mentions.find((m: any) => m.acct === config.acctMe),
    event.payload.mentions.length >= config.mentionCount,
    event.payload.account.followersCount <= config.minFollowers,
    event.payload.mentions.find((m: any) => m.acct === config.acctMe) &&
      event.payload.mentions.length >= config.mentionCount &&
      event.payload.account.followersCount <= config.minFollowers
  );
  return (
    event.payload.mentions.find((m: any) => m.acct === config.acctMe) &&
    event.payload.mentions.length >= config.mentionCount &&
    event.payload.account.followersCount <= config.minFollowers
  );
};

const streaming = createStreamingAPIClient({
  streamingApiUrl: `wss://${config.domain}/api/v1/streaming/?`,
  accessToken: config.accessToken,
});

const rest = createRestAPIClient({
  url: `https://${config.domain}`,
  accessToken: config.accessToken,
});

export const fromStreaming = async (): Promise<void> => {
  console.log("subscribed to public time line");

  for await (const event of streaming.public.subscribe()) {
    switch (event.event) {
      case "update": {
        try {
          if (isTarget(event)) {
            const report = await rest.v1.reports.create({
              accountId: event.payload.account.id,
              category: "spam",
              forward: true,
              statusIds: [event.payload.id],
            });
            await rest.v1.admin.accounts
              .$select(event.payload.account.id)
              .action.create({
                type: "suspend",
                reportId: report.id,
              });
            await rest.v1.accounts.$select(event.payload.account.id).block();
            console.log(
              `#############################################################################`
            );
            console.log(
              `Reported: from:${event.payload.account.acct} statusId:${event.payload.id} URI:${event.payload.uri} content:${event.payload.content}`
            );
          }
        } catch (err) {
          console.error(err);
        }
        break;
      }
      default: {
        break;
      }
    }
  }
};
