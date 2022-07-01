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
  const isLinked = [branches, pullRequests].some((ary) => ary && ary?.length > 0);


  if (authError) {
    return (
      <aha-flex align-items="center" justify-content="space-between" gap="5px">
        {authError}
      </aha-flex>
    )
  }

  if (isLinked) {
    return (
      <>
        <aha-flex align-items="center" justify-content="space-between" gap="5px">
          <aha-flex direction="column" gap="8px" justify-content="space-between">
            <Branches branches={branches ?? []} />
            <PullRequests record={record} prs={pullRequests ?? []}></PullRequests>
          </aha-flex>
          <Menu record={record} />
        </aha-flex>

      </>
    );
  }

  return <EmptyState record={record} />
};
