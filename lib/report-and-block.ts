import masto from "masto";

export type ReportAndBlockParam = {
  status: masto.mastodon.v1.Status;
};

export const reportAndBlock = async (
  rest: masto.mastodon.rest.Client,
  param: ReportAndBlockParam
) => {
  try {
    const report = await rest.v1.reports.create({
      accountId: param.status.account.id,
      category: "spam",
      forward: true,
      statusIds: [param.status.id],
      comment: "Automatic report.",
    });
    await rest.v1.admin.accounts
      .$select(param.status.account.id)
      .action.create({
        type: "suspend",
        reportId: report.id,
      });
    await rest.v1.accounts.$select(param.status.account.id).block();
    console.log(
      `Reported: from:${param.status.account.acct} statusId:${param.status.id} URI:${param.status.uri} content:${param.status.content}`
    );
  } catch (err) {
    console.error(err);
  }
};
