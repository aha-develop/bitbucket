import React from 'react';
import { useAuth } from '@aha-app/aha-develop-react';

import { Menu } from './Menu';
import { PullRequests } from './PullRequests';
import { Branches } from './Branches';
import { EmptyState } from './EmptyState';

export type AttributeProps = {
  record: Aha.RecordUnion;
  fields: IRecordExtensionFields;
};

export const Attribute = ({ fields, record }: AttributeProps, { identifier, settings }) => {
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
            {/* // FIXME */}
            <aha-button size="mini" href="https://github.com/aha-develop/bitbucket" target="_blank" rel="noopener noreferrer">
              Copy ID
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
