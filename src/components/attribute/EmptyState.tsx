import { IDENTIFIER } from '@lib/extension';
import React, { useEffect, useState } from 'react';

import { runCommand } from '@lib/runCommand';
import { useClipboard } from '@lib/useClipboard';

type MenuProps = {
  record: Aha.RecordUnion;
};

const Menu = ({ record }: MenuProps) => {
  return (
    <aha-menu>
      <aha-button slot="button" type="attribute" size="mini">
        <aha-icon icon="fa-solid fa-ellipsis"></aha-icon>
      </aha-button>
      <aha-menu-item onClick={() => runCommand(record, 'addLink')}>Link pull request</aha-menu-item>
      <aha-menu-item onClick={() => runCommand(record, 'sync')}>Scan Bitbucket</aha-menu-item>
      <hr />
      <aha-menu-item>
        <a href="https://github.com/aha-develop/bitbucket" target="_blank" rel="noopener noreferrer">
          <aha-icon icon="fa fa-external-link" />
          Read the docs
        </a>
      </aha-menu-item>
    </aha-menu>
  );
};

const EmptyStateBox = ({ children }) => (
  <aha-box class="m-0" style={{ color: 'var(--theme-secondary-text)' }}>
    <div style={{ margin: 'calc(-2em + 12px)' }}>
      {children}
    </div>
  </aha-box>
);

export const EmptyState = ({ record }) => {
  const [onCopy, copied] = useClipboard()
  const [hasConfiguredWebhook, setHasConfiguredWebhook] = useState<Boolean | null>(null);

  // Song and dance to fetch installation status for webhook when component first loads
  useEffect(() => {
    (async () => {
      const hasConfiguredWebhook: boolean = await aha.account.getExtensionField(IDENTIFIER, 'webhookConfigured');
      setHasConfiguredWebhook(hasConfiguredWebhook);
    })();
  }, []);

  if (hasConfiguredWebhook === null) {
    return <aha-spinner />
  }

  if (!hasConfiguredWebhook) {
    return (
      <EmptyStateBox>
        <div className="mb-1" style={{ fontSize: 14, fontWeight: 500 }}>
          <aha-icon icon="fa-brands fa-bitbucket" class="mr-2" />
          Set up Bitbucket
        </div>
        <aha-flex justify-content="space-between" align-items="center">
          <span style={{ fontSize: 12 }}>Configure webhook in Bitbucket</span>
          <aha-button-group>
            <aha-button size="mini" href="https://github.com/aha-develop/bitbucket" target="_blank" rel="noopener noreferrer">
              Configure
            </aha-button>
            <Menu record={record} />
          </aha-button-group>
        </aha-flex>
      </EmptyStateBox>
    );
  }

  return (
    <EmptyStateBox>
      <div className="mb-1" style={{ fontSize: 14, fontWeight: 500 }}>
        <aha-icon icon="fa-brands fa-bitbucket" class="mr-2" />
        Link pull request
      </div>
      <aha-flex justify-content="space-between" align-items="center">
        <span style={{ fontSize: 12 }}>Include <strong>{record.referenceNum}</strong> in your branch or PR name</span>
        <aha-button-group>
          <aha-button size="mini" onClick={(e) => onCopy(record.referenceNum)}>
            {copied ? 'Copied!' : 'Copy ID'}
          </aha-button>
          <Menu record={record} />
        </aha-button-group>
      </aha-flex>
    </EmptyStateBox>
  );
};
