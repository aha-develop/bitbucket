import { IDENTIFIER } from '@lib/extension';
import React, { useEffect, useState } from 'react';

const EmptyStateBox = ({ children }) => (
  <aha-box class="m-0" style={{ color: 'var(--theme-secondary-text)' }}>
    <div style={{ margin: 'calc(-2em + 12px)' }}>
      {children}
    </div>
  </aha-box>
)

export const EmptyState = ({ record }) => {
  const [hasConfiguredWebhook, setHasConfiguredWebhook] = useState<Boolean>(false);

  // Song and dance to fetch installation status for webhook when component first loads
  useEffect(() => {
    (async () => {
      const hasConfiguredWebhook: boolean = await aha.account.getExtensionField(IDENTIFIER, 'webhookConfigured');
      setHasConfiguredWebhook(hasConfiguredWebhook);
    })();
  }, []);

  if (!hasConfiguredWebhook) {
    return (
      <EmptyStateBox>
        <div className="mb-1" style={{ fontSize: 14, fontWeight: 500 }}>
          <aha-icon icon="fa-brands fa-bitbucket" class="mr-2" />
          Set up Bitbucket
        </div>
        <aha-flex justify-content="space-between" align-items="center">
          <span style={{ fontSize: 12 }}>Configure webhook in Bitbucket</span>
          <span>
            <aha-button kind="link" class="mr-2" size="small">
              Add link
            </aha-button>
            <aha-button kind="primary" size="mini">
              Configure
            </aha-button>
          </span>
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
        <span>
          <aha-button kind="link" class="mr-2" size="small">
            Add link
          </aha-button>
          <aha-button kind="primary" size="mini">
            Copy ID
          </aha-button>
        </span>
      </aha-flex>
    </EmptyStateBox>
  );
};
