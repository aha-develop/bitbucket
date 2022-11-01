import { IDENTIFIER } from './extension';

/**
 * Link Pull Request to Aha Record
 *
 * @param pr
 * @param record
 */
export const linkPullRequestToRecord = async (pr: Bitbucket.PR, record: Aha.RecordUnion) => {
  const PRLink = BitbucketPRToPRLink(pr);

  await appendFieldToRecord(record, 'pullRequests', [
    {
      ...PRLink
    }
  ]);

  await appendFieldToAccount('bitbucketPRs', [
    {
      ...PRLink,
      ahaReference: {
        type: record?.typename,
        referenceNum: record?.referenceNum
      }
    }
  ]);

  if (pr.source.branch.name) {
    await linkBranchToRecord(pr.source.branch.name, pr.source.repository.links['html'].href, record);
  }
};

/**
 * Append a field/value pair to the given record.
 *
 * @param fieldName
 * @param newValue
 * @param record
 */
const appendField = async <T = any>(
  fieldName: IAccountExtensionField | IRecordExtensionField,
  newValue: T,
  record: Aha.RecordUnion | Aha.Account = aha.account
) => {
  console.log(`Link to ${record?.typename}:${record?.['referenceNum'] || record?.uniqueId}`);

  await replaceField(record, fieldName, (value) => {
    if (Array.isArray(value) || Array.isArray(newValue)) {
      const list = [...(value || [])];

      ((newValue ?? []) as any[]).forEach((e) => {
        const existing = list.findIndex((item) => item.id == e?.id);
        if (existing > -1) {
          list.splice(existing, 1, e);
        } else {
          list.push(e);
        }
      });

      return list;
    } else if (typeof newValue === 'object') {
      return {
        ...value,
        ...newValue
      };
    } else {
      return newValue;
    }
  });
};

/**
 * Append a field in record
 *
 * @param fieldName
 * @param newValue
 * @returns
 */
export const appendFieldToAccount = (
  fieldName: IAccountExtensionField,
  newValue: IAccountExtensionFields[IAccountExtensionField]
) => {
  return appendField(fieldName, newValue, aha.account);
};

/**
 * Append a field in account
 *
 * @param record
 * @param fieldName
 * @param newValue
 * @returns
 */
export const appendFieldToRecord = async (
  record: Aha.RecordUnion,
  fieldName: IRecordExtensionField,
  newValue: IRecordExtensionFields[IRecordExtensionField]
) => {
  return appendField(fieldName, newValue, record);
};

/**
 * Replace Extension Fields
 *
 * @param record
 * @param fieldName
 * @param replacer
 */
const replaceField = async (
  record: Aha.RecordUnion | Aha.Account,
  fieldName: IAccountExtensionField | IRecordExtensionField,
  replacer: (val: any) => any
) => {
  const fieldValue = await record.getExtensionField(IDENTIFIER, fieldName);
  const newValue = await replacer(fieldValue);
  await record.setExtensionField(IDENTIFIER, fieldName, newValue);
};

/**
 * Generate PR Id for account
 *
 * @param number
 * @param ref
 * @returns
 */
const accountPRId = (number?: string | number, ref?: string | number) => {
  return [number, ref].join('_');
};

/**
 *
 * @param PR
 * @returns
 */
export const BitbucketPRToPRLink = (pr: Bitbucket.PR): IExtensionFieldPullRequest => {
  return {
    id: pr.id.toString(),
    title: pr.title,
    webUrl: pr.links['html'].href,
    state: pr.state,
    sourceBranch: pr.source.branch.name,
    targetBranch: pr.destination.branch.name,
    projectId: pr.source.repository.uuid,
    projectWebUrl: pr.source.repository.links['html'].href
  };
};

/**
 * Link Pull Request to Aha Record
 *
 * @param PR
 * @returns
 */
export const linkPullRequest = async (pr: Bitbucket.PR) => {
  let record;

  if (pr.id) {
    record = await referenceToRecordFromId(pr.id.toString());
    if (record) {
      console.log(`Linking to ${record.referenceNum} from PR id`);
    }
  }

  if (!record && pr.source.branch.name) {
    record = await referenceToRecordFromTitle(pr.source.branch.name);
    if (record) {
      console.log(`Linking to ${record.referenceNum} from PR branch name`);
    }
  }

  if (!record && pr.title) {
    record = await referenceToRecordFromTitle(pr.title);
    if (record) {
      console.log(`Linking to ${record.referenceNum} from PR title`);
    }
  }

  if (record) {
    await linkPullRequestToRecord(pr, record);
  } else {
    throw new Error('Could not find record in pull request');
  }

  return record;
};

/**
 * UnLink Pull Request
 *
 * @param record
 * @param number
 */
export const unlinkPullRequest = async (record: Aha.RecordUnion, id: string) => {
  await replaceField(record, 'bitbucketPRs', (PRs) => {
    if (PRs) {
      return PRs.filter((PR) => PR.id != id);
    } else {
      return [];
    }
  });

  await replaceField(aha.account, 'bitbucketPRs', (PRs) => {
    if (PRs) {
      return PRs.filter((PR) => PR.id == accountPRId(id, record.referenceNum));
    } else {
      return [];
    }
  });
};

export const unlinkPullRequests = async (record: Aha.RecordUnion) => {
  const ids: string[] = [];
  await replaceField(record, 'pullRequests', (recordPRs: IExtensionFieldPullRequest[]) => {
    if (!recordPRs) return [];
    recordPRs.forEach((e) => {
      ids.push(e.id);
    });
    return;
  });

  await replaceField(aha.account, 'bitbucketPRs', (accountPRs: IExtensionFieldPullRequest[]) => {
    if (!accountPRs) return [];
    return accountPRs.filter((accountPR) => !ids.includes(accountPR.id));
  });
};

export const getExtensionFields = async (
  fieldName: IAccountExtensionField | IRecordExtensionField,
  record: Aha.RecordUnion | Aha.Account = aha.account
): Promise<IAccountExtensionFields[IAccountExtensionField] | IRecordExtensionFields[IRecordExtensionField]> => {
  return (await record.getExtensionField(IDENTIFIER, fieldName)) as any;
};

/**
 *
 * @param branchName
 * @param repoUrl
 * @param record
 */
export const linkBranchToRecord = async (branchName: string, repoUrl: string, record: Aha.RecordUnion) => {
  await appendFieldToRecord(record, 'branches', [
    {
      id: branchName,
      name: branchName,
      url: `${repoUrl}?version=GB${branchName.split('/')?.[2] ?? 'main'}`
    }
  ]);
};

export const linkBranch = async (branchName: string, repoUrl: string) => {
  const record = await referenceToRecordFromTitle(branchName);
  if (record) {
    await linkBranchToRecord(branchName, repoUrl, record);
    return record;
  }
};

export const unlinkBranches = async (record: Aha.RecordUnion) => {
  await record.setExtensionField(IDENTIFIER, 'branches', []);
};

/**
 * Get Aha Record from PR title or branch name
 *
 * @param str
 * @returns
 */
export const referenceToRecordFromTitle = async (str: string): Promise<Aha.RecordUnion | null> => {
  const ahaReference = extractReference(str);

  if (!ahaReference) {
    return null;
  }

  const RecordClass = aha.models[ahaReference.type];
  if (!RecordClass) {
    console.log(`Unknown record type ${ahaReference.type}`);
    return null;
  }

  return await RecordClass.select('id', 'referenceNum').find(ahaReference.referenceNum.toUpperCase());
};

/**
 * Get Aha Record from PR Id
 *
 * @param str
 * @returns
 */
export const referenceToRecordFromId = async (str: string): Promise<Aha.RecordUnion | null> => {
  const PRs = (await getExtensionFields('bitbucketPRs')) as IExtensionFieldPullRequest[];
  const PR = PRs?.find((e) => `${e?.id}` === `${str}`);
  const { type, referenceNum } = PR?.ahaReference ?? {};

  const RecordClass = aha.models[type as any];
  if (!RecordClass) {
    console.log(`Unknown record type ${type}`);
    return null;
  }

  return await RecordClass.select('id', 'referenceNum').find(referenceNum);
};

/**
 * @param {string} name
 */
export const extractReference = (name: string): { type: string; referenceNum: string } => {
  let matches;

  // Requirement
  if ((matches = name.match(/[a-z0-9]{1,10}-[0-9]+-[0-9]+/i))) {
    return {
      type: 'Requirement',
      referenceNum: matches[0]
    };
  }

  // Epic
  if ((matches = name.match(/[a-z0-9]{1,10}-E-[0-9]+/i))) {
    return {
      type: 'Epic',
      referenceNum: matches[0]
    };
  }

  // Feature
  if ((matches = name.match(/[a-z0-9]{1,10}-[0-9]+/i))) {
    return {
      type: 'Feature',
      referenceNum: matches[0]
    };
  }

  return null;
};
