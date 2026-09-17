import { PlatformAccount } from '../types/index.js';
import { BaseSocialAdapter } from './baseAdapter.js';
import { TwitterAdapter } from './twitterAdapter.js';
import { MetaAdapter } from './metaAdapter.js';
import { YouTubeAdapter } from './youtubeAdapter.js';
import { LinkedInAdapter } from './linkedinAdapter.js';

export class AdapterFactory {
  public static getAdapter(account: PlatformAccount): BaseSocialAdapter {
    switch (account.platform) {
      case 'twitter':
        return new TwitterAdapter(account);
      case 'facebook':
      case 'instagram':
        return new MetaAdapter(account);
      case 'youtube':
        return new YouTubeAdapter(account);
      case 'linkedin':
        return new LinkedInAdapter(account);
      default:
        throw new Error(`Unsupported platform adapter: ${account.platform}`);
    }
  }
}
