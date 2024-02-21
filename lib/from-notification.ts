import { createRestAPIClient } from "masto";
import { isTarget } from "./is-target";
import { reportAndBlock } from "./report-and-block";
const config = require("../env.json");

export const fromNotification = async () => {
  const rest = createRestAPIClient({
    url: `https://${config.domain}`,
    accessToken: config.accessToken,
  });

  for await (const notifications of rest.v1.notifications.list()) {
    for (const notification of notifications) {
      if (notification.type === "mention" && notification.status) {
        if (
          isTarget({
            status: notification.status,
          })
        ) {
          await reportAndBlock(rest, {
            status: notification.status,
          });
        }
      }
    }
  }
};
