import { createRestAPIClient } from "masto";
const config = require("../env.json");

const rest = createRestAPIClient({
  url: `https://${config.domain}`,
  accessToken: config.accessToken,
});

export const fromNotification = async () => {
  for await (const notifications of rest.v1.notifications.list()) {
    for (const notification of notifications) {
      if (notification.type === "mention" && notification.status) {
        if (
          notification.status?.mentions.find(
            (m: any) => m.acct === config.acctMe
          ) &&
          notification.status?.mentions.length >= config.mentionCount &&
          notification.status?.account.followersCount <= config.minFollowers
        ) {
          const report = await rest.v1.reports.create({
            accountId: notification.account.id,
            category: "spam",
            forward: true,
            statusIds: [notification.status.id],
          });
          await rest.v1.admin.accounts
            .$select(notification.account.id)
            .action.create({
              type: "suspend",
              reportId: report.id,
            });
          await rest.v1.accounts.$select(notification.account.id).block();

          console.log(
            `Reported: from:${notification.account.acct} statusId:${notification.status.id}`
          );
        }
      }
    }
  }
};
