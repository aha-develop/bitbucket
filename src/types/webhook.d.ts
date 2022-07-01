declare namespace Webhook {
  interface Commit {
    hash: string;
    type: 'commit';
    message: string;
    author: object;
    date: string;
    links: Bitbucket.ResourceLinks;
  }

  interface ChangeState {
    type: 'branch' | string;
    name: string;
    target: Commit;
    links: Bitbucket.ResourceLinks;
  }

  interface ChangeReference {
    new: ChangeState;
    old: ChangeState;
    created: boolean;
    closed: boolean;
    forced: boolean;
    commits: Commit[];
    truncated: boolean;
  }

  interface PushPayload {
    actor: object;
    repository: object;
    push: {
      changes: ChangeReference[];
    };
  }

  interface PullRequestPayload {
    actor: object;
    repository: object;
    pullrequest: Bitbucket.PR;
  }

  type Payload = PushPayload | PullRequestPayload;
}
