import { createStreamingAPIClient, createRestAPIClient } from "masto";
import { isTarget } from "./is-target";
import { reportAndBlock } from "./report-and-block";
const config = require("../env.json");

export const fromStreaming = async (): Promise<void> => {
  const streaming = createStreamingAPIClient({
    streamingApiUrl: `https://${config.domain}`,
    accessToken: config.accessToken,
  });

  const rest = createRestAPIClient({
    url: `https://${config.domain}`,
    accessToken: config.accessToken,
  });

  console.log("subscribed to public time line");

  for await (const event of streaming.user.notification.subscribe()) {
    switch (event.event) {
      case "notification": {
        try {
          if (
            event.payload.status &&
            isTarget({
              status: event.payload.status,
            })
          ) {
            await reportAndBlock(rest, {
              status: event.payload.status,
            });
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
