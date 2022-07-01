import React from 'react';
// @ts-ignore
import { titleize } from 'https://cdn.skypack.dev/inflected';

const icon = (state: Bitbucket.PullRequestStatus) => {
  switch (state) {
    case 'OPEN':
      return 'code-branch';
    case 'MERGED':
      return 'code-merge';
    case 'DECLINED':
      return 'lock';
  }
};

export type PrStateProps = {
  pr: IExtensionFieldPullRequest;
};

export const PrState = ({ pr }: PrStateProps) => {
  return (
    <span className={`pr-state pr-state-${pr?.state?.toLowerCase() ?? 'open'}`}>
      <aha-flex gap="4px">
        <aha-icon icon={'fa-regular fa-' + icon(pr?.state ?? 'open')}></aha-icon>
        <span>{titleize(pr.state)}</span>
      </aha-flex>
    </span>
  );
};
