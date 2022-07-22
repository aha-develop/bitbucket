import { IDENTIFIER } from '@lib/extension.js';
import { linkPullRequest, linkBranch, referenceToRecordFromTitle, linkPullRequestToRecord } from '../lib/fields.js';

aha.on('webhook', async ({ headers, payload }: { headers: Record<string, string>; payload: Webhook.Payload }) => {
  const event = headers['HTTP_X_EVENT_KEY'];

  // Flag the account as having successfully set up the webhook
  aha.account.setExtensionField(IDENTIFIER, 'webhookConfigured', true);

  const [category, action] = event.split(':');
  switch (category) {
    case 'repo':
      await handleCreateBranch(payload as Webhook.PushPayload);
      break;
    case 'pullrequest':
      await handlePullRequest(payload as Webhook.PullRequestPayload, action);
      break;
    default:
      break;
  }
});

const handlePullRequest = async (payload: Webhook.PullRequestPayload, action) => {
  const pr: Bitbucket.PR = payload.pullrequest;
  if (!pr) {
    console.error('No pull request information provided in payload');
    return;
  }

  // Make sure the MR is linked to its record.
  const record = await linkPullRequest(pr);

  // Link MR to record
  await linkPullRequestToRecord(pr, record);
  await triggerEvent('pr.update', payload, record);
  await triggerAutomation(payload, action, record);
};

async function handleCreateBranch(payload: Webhook.PushPayload) {
  const { changes } = payload.push;
  if (changes.length === 0) {
    console.error('No changes provided in payload');
    return;
  }

  // Scan all change events to look for new branches containing an Aha! reference number
  return await Promise.all(
    changes.map(async (change) => {
      const state = change.new;
      if (state.type === 'branch') {
        const branchName = state.name;
        const repoURL = state.links['html'].href;
        if (!branchName || !repoURL) {
          return;
        }

        const record = await linkBranch(branchName, repoURL);
        await triggerEvent('branch.create', payload, record);
      }
    })
  );
}

/** Trigger an automation
 *
 * @param payload
 * @param record
 */
async function triggerAutomation(payload: Webhook.PullRequestPayload, action, record: Aha.RecordUnion) {
  if (!payload) return;
  if (!payload.pullrequest) return;

  // Check the record is a supported type
  if (!['Epic', 'Feature', 'Requirement'].includes(record.typename)) {
    return;
  }

  const triggers: Record<string, (payload: Webhook.PullRequestPayload) => string> = {
    created: (payload) => 'prOpened',
    changes_request_created: (payload) => 'prChangesRequested',
    approved: (payload) => 'prApproved',
    fulfilled: (payload) => 'prMerged',
    rejected: (payload) => 'prDeclined'
  };

  const trigger = (triggers[action] || (() => null))(payload);

  if (trigger) {
    await aha.triggerAutomationOn(record, [IDENTIFIER, trigger].join('.'), true);
  }
}

/**
 * Trigger an Event
 *
 * @param event
 * @param payload
 * @param referenceText
 */
const triggerEvent = async (event: string, payload: any, referenceText) => {
  let record = referenceText;

  if (typeof referenceText === 'string') {
    record = await referenceToRecordFromTitle(referenceText);
  }

  aha.triggerServer(`aha-develop.bitbucket.${event}`, {
    record,
    payload
  });
};
