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

  for await (const event of streaming.public.subscribe()) {
    switch (event.event) {
      case "update": {
        try {
          if (
            isTarget({
              status: event.payload,
            })
          ) {
            await reportAndBlock(rest, {
              status: event.payload,
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
