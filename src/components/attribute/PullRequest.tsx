import { useClipboard } from '@lib/useClipboard';
import React from 'react';
import { PrState } from '../PrState';

export type PullRequestProps = {
  record: Aha.RecordUnion;
  pr: IExtensionFieldPullRequest;
};

export const PullRequest = ({ record, pr }: PullRequestProps) => {
  const [onCopy, copied] = useClipboard()

  return (
    <>
      <div className="pull-request">
        <PrState pr={pr} />
        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <aha-link>
            <a href={pr?.webUrl ?? ''} target="_blank">{pr?.title ?? ''}</a>
          </aha-link>
        </div>
        <div onClick={() => onCopy(pr.sourceBranch)} style={{ cursor: 'pointer' }}>
          <aha-tooltip>
            <span slot="trigger" className="text-muted">
              <aha-icon icon="fa fa-code-branch" />
            </span>
            {
              copied ?
                'Copied!' :
                <>
                  <div style={{ whiteSpace: 'nowrap' }}>
                    <strong>
                      <aha-icon icon="fa fa-code-branch" />
                      &nbsp;
                      {pr.sourceBranch}
                    </strong>
                  </div>
                  <em>Click to copy</em>
                </>
            }
          </aha-tooltip>
        </div>
      </div>
    </>
  );
};
