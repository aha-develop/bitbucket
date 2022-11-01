import React from 'react';
import { useAuth } from '@aha-app/aha-develop-react';

import { Menu } from './Menu';
import { PullRequests } from './PullRequests';
import { Branches } from './Branches';
import { EmptyState } from './EmptyState';
import { useClipboard } from '@lib/useClipboard';

export type AttributeProps = {
  record: Aha.RecordUnion;
  fields: IRecordExtensionFields;
};

export const Attribute = ({ fields, record }: AttributeProps, { identifier, settings }) => {
  const [onCopy, copied] = useClipboard()
  const { branches, pullRequests } = fields;
  const { error, authed } = useAuth(async () => { });
  const authError = error && <div>{error}</div>;
  const isLinked = [pullRequests].some((ary) => ary && ary?.length > 0);

  if (authError) {
    return (
      <aha-flex align-items="center" justify-content="space-between" gap="5px">
        {authError}
      </aha-flex>
    )
  }

  if (isLinked) {
    return (
      <div className="mt-1 ml-1">
        <aha-flex align-items="center" justify-content="space-between" gap="5px">
          <div>Related PRs</div>
          <aha-button-group>
            <aha-button size="mini" onClick={(e) => onCopy(record.referenceNum)}>
              {copied ? 'Copied!' : 'Copy ID'}
            </aha-button>
            <Menu record={record} />
          </aha-button-group>
        </aha-flex>

        <PullRequests record={record} prs={pullRequests ?? []}></PullRequests>
      </div>
    );
  }

  return <EmptyState record={record} />
};
