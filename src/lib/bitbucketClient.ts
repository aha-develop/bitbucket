import { AxiosInstance } from 'axios';
import axios from './axios';
import { API_URL } from './config';

/**
 * @class Bitbucket API Manager
 */
class BitbucketClient {
  static _instance: BitbucketClient;

  /**
   * Create BitbucketClient Instance
   *
   * @param token
   * @returns
   */
  static create = (): BitbucketClient => {
    if (!BitbucketClient._instance) {
      BitbucketClient._instance = new BitbucketClient();
    }
    return BitbucketClient._instance;
  };

  /**
   * Create Axios Instance
   *
   * @param token
   */
  setToken = (token: string) => {
    this.axiosIns = axios(token);
  };

  axiosIns: AxiosInstance;
  constructor() {}

  /**
   * When authentication failed
   *
   * @param callBack
   * @returns
   */
  auth = async (callBack: (token: string) => any = (token) => {}) => {
    const authData = await aha.auth('atlassian', { useCachedRetry: false });
    this.setToken(authData.token);
    return await callBack(authData.token);
  };

  /**
   * Get Pull Request from Bitbucket Git by PR URL
   *
   * @param url - PR URL
   * @returns
   */
  getPRByURL = async (url: string): Promise<Bitbucket.PR> => {
    return this.getPRById(this.parseURL(url));
  };

  /**
   * Get Pull Request from Bitbucket Git by PR ID
   *
   * @param options
   * @returns
   */
  getPRById = async ({ workspace, pullRequestId, repositoryId }: Bitbucket.PRGetOptions): Promise<Bitbucket.PR> => {
    const axiosIns = this.axiosIns;
    const { data } = await axiosIns.get(`/2.0/repositories/${workspace}/${repositoryId}/pullrequests/${pullRequestId}`);

    return data;
  };

  /**
   * Error Log
   *
   * @param msg
   * @param error
   */
  log = (msg, error) => {
    console.log(`[Error in Bitbucket API Call] => `, msg, error);
  };

  private parseURL = (url: string): Bitbucket.PRGetOptions => {
    if (!this.validatePRURL(url)) {
      throw new Error('Please enter a valid pull request URL');
    }
    const parsedURL = new URL(url).pathname.split('/');
    return {
      workspace: parsedURL[1],
      repositoryId: parsedURL[2],
      pullRequestId: parsedURL[4]
    };
  };

  /**
   * Validate PR URL
   *
   * @param urlString
   * @returns
   */
  validatePRURL = (urlString: string) => {
    return true;

    const url = new URL(urlString);
    return url.origin === API_URL && url.pathname.match(/(.+?)\/(.+?)\/pull-request\/\d+/);
  };
}

export default BitbucketClient.create();
