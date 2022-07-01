declare namespace Bitbucket {
  type ID = string;

  type ResourceLinks = Record<string, { href: string }>;

  type PullRequestStatus = 'OPEN' | 'MERGED' | 'DECLINED';

  interface MergeTarget {
    branch: {
      name: string;
    };
    commit: {
      hash: string;
      type: string;
      links: ResourceLinks;
    };
    repository: Repository;
  }

  interface PR {
    id: number;
    type: string;
    links: ResourceLinks;
    state: PullRequestStatus;
    title: string;
    author: object;
    reason: string;
    source: MergeTarget;
    summary: object;
    rendered: object;
    closed_by: object;
    reviewers: object[];
    created_on: string;
    task_count: number;
    updated_on: string;
    description: string;
    destination: MergeTarget;
    merge_commit: any;
    participants: any;
    comment_count: number;
    close_source_branch: boolean;
  }

  interface Repository {
    uuid: string;
    type: 'repository';
    name: string;
    full_name: string;
    workspace: object;
    links: ResourceLinks;
    project: object;
    website: string;
    scm: 'git' | 'hg';
    is_private: boolean;
  }

  interface PRGetOptions {
    organization: string;
    project: string;
    repositoryId: string;
    pullRequestId: string;
  }
}
