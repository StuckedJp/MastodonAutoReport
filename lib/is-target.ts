import masto from "masto";
const config = require("../env.json");

export type IsTargetParam = {
  status: masto.mastodon.v1.Status;
};

export const isTarget = (param: IsTargetParam): boolean => {
  const retVal =
    !!param.status.mentions.find((m: any) => m.acct === config.acctMe) &&
    param.status.mentions.length >= config.mentionCount &&
    Date.now() - Date.parse(param.status.account.createdAt) <=
      config.createdAtThreshold;

  console.log(
    new Date().toISOString(),
    param.status.id,
    param.status.mentions.find((m: any) => m.acct === config.acctMe),
    param.status.mentions.length >= config.mentionCount,
    Date.now() - Date.parse(param.status.account.createdAt),
    retVal
  );

  return retVal;
};
