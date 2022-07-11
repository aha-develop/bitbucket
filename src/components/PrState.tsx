import React from 'react';
// @ts-ignore

export type PrStateProps = {
  pr: IExtensionFieldPullRequest;
};

export const PrState = ({ pr }: PrStateProps) => {
  return (
    <span className={`pr-state pr-state-${pr?.state?.toLowerCase() ?? 'open'}`}>
      <aha-flex gap="4px">
        <span>{pr.state}</span>
      </aha-flex>
    </span>
  );
};
