import { IDENTIFIER } from '@lib/extension';
import React, { useEffect, useState } from 'react';

import { runCommand } from '@lib/runCommand';
import { useClipboard } from '@lib/useClipboard';

import { linkPullRequestToRecord } from '@lib/fields';
import bitbucketClient from '@lib/bitbucketClient';


type MenuProps = {
  record: Aha.RecordUnion;
  onPaste: Function;
};

const Menu = ({ record, onPaste }: MenuProps) => {
  return (
    <aha-menu>
      <aha-button slot="button" type="attribute" size="mini">
        <aha-icon icon="fa-solid fa-ellipsis"></aha-icon>
      </aha-button>
      <aha-menu-item onClick={() => onPaste()}>Paste PR link</aha-menu-item>
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
  const [pasteMode, setPasteMode] = useState<Boolean>(false)
  const [validation, setValidation] = useState<String | null>(null)
  const [hasConfiguredWebhook, setHasConfiguredWebhook] = useState<Boolean | null>(null);

  // aha-menu gets mad if you remove it from the DOM while the menu is open.
  // Wait 1 tick so the menu has a chance to unmount first.
  const viewPasteMode = () => {
    setTimeout(() => setPasteMode(true), 1)
  }

  const pasteLink = async (url) => {
    await bitbucketClient.auth();
    const res = await bitbucketClient.getPRByURL(url);
    if (res) {
      await linkPullRequestToRecord(res, record);
      setPasteMode(false)
    } else {
      setValidation('Please enter a valid pull request URL')
    }
  }

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

  if (pasteMode) {
    return (
      <EmptyStateBox>
        <aha-flex justify-content="space-between" align-items="flex-start">
          <div className="mb-2" style={{ fontSize: 14, fontWeight: 500 }}>
            <aha-icon icon="fa-brands fa-bitbucket" class="mr-2" />
            Paste pull request link
          </div>
          <aha-button size="mini" onClick={() => setPasteMode(false)}>
            Cancel
          </aha-button>
        </aha-flex>
        <input
          type="text"
          placeholder="https://bitbucket.org/..."
          style={{ display: 'block', width: 'calc(100% - 16px)', marginBottom: 0 }}
          onChange={e => pasteLink(e.target.value)}
        />
        {validation}
      </EmptyStateBox>
    )
  }

  if (!hasConfiguredWebhook) {
    return (
      <EmptyStateBox>
        <aha-flex justify-content="space-between" align-items="flex-start">
          <div className="mb-2" style={{ fontSize: 14, fontWeight: 500 }}>
            <aha-icon icon="fa-brands fa-bitbucket" class="mr-2" />
            Set up Bitbucket
          </div>
          <aha-button-group>
            <aha-button size="mini" href="https://github.com/aha-develop/bitbucket" target="_blank" rel="noopener noreferrer">
              Learn more
            </aha-button>
            <Menu record={record} onPaste={viewPasteMode} />
          </aha-button-group>
        </aha-flex>
        <div style={{ fontSize: 12 }}>
          Install the webhook to automatically link Bitbucket PRs
        </div>
      </EmptyStateBox>
    );
  }

  return (
    <EmptyStateBox>
      <aha-flex justify-content="space-between" align-items="flex-start">
        <div className="mb-2" style={{ fontSize: 14, fontWeight: 500 }}>
          <aha-icon icon="fa-brands fa-bitbucket" class="mr-2" />
          No pull request linked
        </div>
        <aha-button-group>
          <aha-button size="mini" onClick={(e) => onCopy(record.referenceNum)}>
            {copied ? 'Copied!' : 'Copy ID'}
          </aha-button>
          <Menu record={record} onPaste={viewPasteMode} />
        </aha-button-group>
      </aha-flex>
      <div style={{ fontSize: 12 }}>
        Include <strong>{record.referenceNum}</strong> in your branch or PR name to link automatically
      </div>
    </EmptyStateBox>
  );
};
