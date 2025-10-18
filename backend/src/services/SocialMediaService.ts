import { PrismaClient } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';

const prisma = new PrismaClient();

interface SocialMediaConfig {
  platform: string;
  accessToken: string;
  refreshToken?: string;
}

interface PostContent {
  text: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
  location?: string;
}

interface InstagramPost {
  caption: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  image_url?: string;
  video_url?: string;
  children?: any[];
}

interface FacebookPost {
  message: string;
  link?: string;
  picture?: string;
}

interface TwitterPost {
  text: string;
  media?: {
    media_ids: string[];
  };
}

class SocialMediaService {
  private instagramClient: AxiosInstance;
  private facebookClient: AxiosInstance;
  private twitterClient: AxiosInstance;

  constructor() {
    this.instagramClient = axios.create({
      baseURL: 'https://graph.instagram.com',
    });

    this.facebookClient = axios.create({
      baseURL: 'https://graph.facebook.com/v18.0',
    });

    this.twitterClient = axios.create({
      baseURL: 'https://api.twitter.com/2',
    });
  }

  // ============================================
  // ACCOUNT MANAGEMENT
  // ============================================

  /**
   * Connect a social media account
   */
  async connectAccount(companyId: number, platform: string, authCode: string) {
    try {
      let accountData;
      
      switch (platform.toLowerCase()) {
        case 'instagram':
          accountData = await this.connectInstagram(authCode);
          break;
        case 'facebook':
          accountData = await this.connectFacebook(authCode);
          break;
        case 'twitter':
          accountData = await this.connectTwitter(authCode);
          break;
        case 'tiktok':
          accountData = await this.connectTikTok(authCode);
          break;
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // Save account to database
      const account = await prisma.socialMediaAccount.create({
        data: {
          companyId,
          platform: platform.toLowerCase(),
          accountName: accountData.name,
          username: accountData.username,
          accountId: accountData.id,
          profileUrl: accountData.profileUrl,
          avatarUrl: accountData.avatarUrl,
          accessToken: accountData.accessToken,
          refreshToken: accountData.refreshToken,
          tokenExpiresAt: accountData.tokenExpiresAt,
          scopes: JSON.stringify(accountData.scopes || []),
          followersCount: accountData.followersCount || 0,
          followingCount: accountData.followingCount || 0,
          postsCount: accountData.postsCount || 0,
          isActive: true,
          isVerified: accountData.isVerified || false,
        },
      });

      return account;
    } catch (error: any) {
      console.error('Error connecting social media account:', error);
      throw new Error(`Failed to connect ${platform} account: ${error.message}`);
    }
  }

  /**
   * Connect Instagram account
   */
  private async connectInstagram(authCode: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await this.instagramClient.post('/oauth/access_token', {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code: authCode,
      });

      const { access_token, user_id } = tokenResponse.data;

      // Get user profile
      const profileResponse = await this.instagramClient.get(`/${user_id}`, {
        params: {
          fields: 'id,username,account_type,media_count,followers_count,follows_count',
          access_token,
        },
      });

      const profile = profileResponse.data;

      return {
        id: profile.id,
        name: profile.username,
        username: profile.username,
        profileUrl: `https://instagram.com/${profile.username}`,
        avatarUrl: null,
        accessToken: access_token,
        refreshToken: null,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        scopes: ['instagram_basic', 'instagram_content_publish'],
        followersCount: profile.followers_count || 0,
        followingCount: profile.follows_count || 0,
        postsCount: profile.media_count || 0,
        isVerified: profile.account_type === 'BUSINESS',
      };
    } catch (error: any) {
      console.error('Instagram connection error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Connect Facebook account
   */
  private async connectFacebook(authCode: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await this.facebookClient.get('/oauth/access_token', {
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
          code: authCode,
        },
      });

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await this.facebookClient.get('/me', {
        params: {
          fields: 'id,name,picture.type(large),followers_count',
          access_token,
        },
      });

      const profile = profileResponse.data;

      return {
        id: profile.id,
        name: profile.name,
        username: profile.name,
        profileUrl: `https://facebook.com/${profile.id}`,
        avatarUrl: profile.picture?.data?.url,
        accessToken: access_token,
        refreshToken: null,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        scopes: ['pages_manage_posts', 'pages_read_engagement'],
        followersCount: profile.followers_count || 0,
        followingCount: 0,
        postsCount: 0,
        isVerified: false,
      };
    } catch (error: any) {
      console.error('Facebook connection error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Connect Twitter account
   */
  private async connectTwitter(authCode: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await this.twitterClient.post(
        '/oauth2/token',
        new URLSearchParams({
          code: authCode,
          grant_type: 'authorization_code',
          client_id: process.env.TWITTER_CLIENT_ID!,
          redirect_uri: process.env.TWITTER_REDIRECT_URI!,
          code_verifier: 'challenge',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: process.env.TWITTER_CLIENT_ID!,
            password: process.env.TWITTER_CLIENT_SECRET!,
          },
        }
      );

      const { access_token, refresh_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await this.twitterClient.get('/users/me', {
        params: {
          'user.fields': 'id,name,username,profile_image_url,public_metrics,verified',
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const user = profileResponse.data.data;

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        profileUrl: `https://twitter.com/${user.username}`,
        avatarUrl: user.profile_image_url,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        scopes: ['tweet.read', 'tweet.write', 'users.read'],
        followersCount: user.public_metrics?.followers_count || 0,
        followingCount: user.public_metrics?.following_count || 0,
        postsCount: user.public_metrics?.tweet_count || 0,
        isVerified: user.verified || false,
      };
    } catch (error: any) {
      console.error('Twitter connection error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Connect TikTok account
   */
  private async connectTikTok(authCode: string) {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY!,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, refresh_token, expires_in, open_id } = tokenResponse.data.data;

      // Get user info
      const userResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
        params: {
          fields: 'open_id,union_id,avatar_url,display_name,follower_count,following_count,video_count',
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const user = userResponse.data.data.user;

      return {
        id: user.open_id || open_id,
        name: user.display_name,
        username: user.display_name,
        profileUrl: `https://www.tiktok.com/@${user.display_name}`,
        avatarUrl: user.avatar_url,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        scopes: ['user.info.basic', 'video.list', 'video.upload'],
        followersCount: user.follower_count || 0,
        followingCount: user.following_count || 0,
        postsCount: user.video_count || 0,
        isVerified: false,
      };
    } catch (error: any) {
      console.error('TikTok connection error:', error.response?.data || error);
      throw error;
    }
  }

  /**
   * Disconnect a social media account
   */
  async disconnectAccount(accountId: number) {
    const account = await prisma.socialMediaAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return account;
  }

  /**
   * Get all accounts for a company
   */
  async getAccounts(companyId: number, platform?: string) {
    const where: any = { companyId };
    if (platform) {
      where.platform = platform.toLowerCase();
    }

    const accounts = await prisma.socialMediaAccount.findMany({
      where,
      include: {
        _count: {
          select: {
            posts: true,
            schedules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts;
  }

  /**
   * Refresh account statistics
   */
  async refreshAccountStats(accountId: number) {
    const account = await prisma.socialMediaAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    let stats;
    switch (account.platform) {
      case 'instagram':
        stats = await this.getInstagramStats(account.accountId, account.accessToken!);
        break;
      case 'facebook':
        stats = await this.getFacebookStats(account.accountId, account.accessToken!);
        break;
      case 'twitter':
        stats = await this.getTwitterStats(account.accountId, account.accessToken!);
        break;
      case 'tiktok':
        stats = await this.getTikTokStats(account.accountId, account.accessToken!);
        break;
      default:
        throw new Error(`Unsupported platform: ${account.platform}`);
    }

    const updated = await prisma.socialMediaAccount.update({
      where: { id: accountId },
      data: {
        followersCount: stats.followersCount,
        followingCount: stats.followingCount,
        postsCount: stats.postsCount,
        lastSyncAt: new Date(),
      },
    });

    return updated;
  }

  private async getInstagramStats(accountId: string, accessToken: string) {
    const response = await this.instagramClient.get(`/${accountId}`, {
      params: {
        fields: 'media_count,followers_count,follows_count',
        access_token: accessToken,
      },
    });

    return {
      followersCount: response.data.followers_count || 0,
      followingCount: response.data.follows_count || 0,
      postsCount: response.data.media_count || 0,
    };
  }

  private async getFacebookStats(accountId: string, accessToken: string) {
    const response = await this.facebookClient.get(`/${accountId}`, {
      params: {
        fields: 'followers_count',
        access_token: accessToken,
      },
    });

    return {
      followersCount: response.data.followers_count || 0,
      followingCount: 0,
      postsCount: 0,
    };
  }

  private async getTwitterStats(accountId: string, accessToken: string) {
    const response = await this.twitterClient.get(`/users/${accountId}`, {
      params: {
        'user.fields': 'public_metrics',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const metrics = response.data.data.public_metrics;
    return {
      followersCount: metrics.followers_count || 0,
      followingCount: metrics.following_count || 0,
      postsCount: metrics.tweet_count || 0,
    };
  }

  private async getTikTokStats(accountId: string, accessToken: string) {
    const response = await axios.get('https://open.tiktokapis.com/v2/user/info/', {
      params: {
        fields: 'follower_count,following_count,video_count',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = response.data.data.user;
    return {
      followersCount: user.follower_count || 0,
      followingCount: user.following_count || 0,
      postsCount: user.video_count || 0,
    };
  }

  // ============================================
  // POST MANAGEMENT
  // ============================================

  /**
   * Create and publish a post
   */
  async publishPost(
    accountId: number,
    userId: number,
    content: PostContent,
    scheduledFor?: Date
  ) {
    const account = await prisma.socialMediaAccount.findUnique({
      where: { id: accountId },
      include: { company: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    if (!account.isActive) {
      throw new Error('Account is not active');
    }

    // Create post record
    const post = await prisma.socialMediaPost.create({
      data: {
        companyId: account.companyId,
        accountId: account.id,
        userId,
        platform: account.platform,
        content: content.text,
        contentType: content.mediaUrls && content.mediaUrls.length > 0 ? 'image' : 'text',
        mediaUrls: content.mediaUrls ? JSON.stringify(content.mediaUrls) : null,
        hashtags: content.hashtags ? JSON.stringify(content.hashtags) : null,
        mentions: content.mentions ? JSON.stringify(content.mentions) : null,
        location: content.location,
        status: scheduledFor ? 'scheduled' : 'draft',
        scheduledFor: scheduledFor,
      },
    });

    // If not scheduled, publish immediately
    if (!scheduledFor) {
      try {
        await this.publishToPlat form(post.id);
      } catch (error: any) {
        await prisma.socialMediaPost.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            errorMessage: error.message,
          },
        });
        throw error;
      }
    }

    return post;
  }

  /**
   * Publish a post to the platform
   */
  private async publishToPlatform(postId: number) {
    const post = await prisma.socialMediaPost.findUnique({
      where: { id: postId },
      include: { account: true },
    });

    if (!post || !post.account) {
      throw new Error('Post or account not found');
    }

    let platformPostId: string;
    let platformUrl: string;

    try {
      switch (post.platform) {
        case 'instagram':
          const igResult = await this.publishToInstagram(post);
          platformPostId = igResult.id;
          platformUrl = igResult.url;
          break;

        case 'facebook':
          const fbResult = await this.publishToFacebook(post);
          platformPostId = fbResult.id;
          platformUrl = fbResult.url;
          break;

        case 'twitter':
          const twResult = await this.publishToTwitter(post);
          platformPostId = twResult.id;
          platformUrl = twResult.url;
          break;

        case 'tiktok':
          const ttResult = await this.publishToTikTok(post);
          platformPostId = ttResult.id;
          platformUrl = ttResult.url;
          break;

        default:
          throw new Error(`Unsupported platform: ${post.platform}`);
      }

      // Update post status
      await prisma.socialMediaPost.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: new Date(),
          platformPostId,
          platformUrl,
        },
      });

      return { platformPostId, platformUrl };
    } catch (error: any) {
      await prisma.socialMediaPost.update({
        where: { id: postId },
        data: {
          status: 'failed',
          errorMessage: error.message,
          retryCount: post.retryCount + 1,
        },
      });
      throw error;
    }
  }

  /**
   * Publish to Instagram
   */
  private async publishToInstagram(post: any) {
    const account = post.account;
    const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];

    if (mediaUrls.length === 0) {
      throw new Error('Instagram posts require at least one image or video');
    }

    // Create media container
    const createResponse = await this.instagramClient.post(
      `/${account.accountId}/media`,
      {
        image_url: mediaUrls[0],
        caption: post.content,
        access_token: account.accessToken,
      }
    );

    const containerId = createResponse.data.id;

    // Publish media
    const publishResponse = await this.instagramClient.post(
      `/${account.accountId}/media_publish`,
      {
        creation_id: containerId,
        access_token: account.accessToken,
      }
    );

    const postId = publishResponse.data.id;

    return {
      id: postId,
      url: `https://www.instagram.com/p/${postId}`,
    };
  }

  /**
   * Publish to Facebook
   */
  private async publishToFacebook(post: any) {
    const account = post.account;
    const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];

    const postData: any = {
      message: post.content,
      access_token: account.accessToken,
    };

    if (mediaUrls.length > 0) {
      postData.picture = mediaUrls[0];
    }

    const response = await this.facebookClient.post(
      `/${account.accountId}/feed`,
      postData
    );

    const postId = response.data.id;

    return {
      id: postId,
      url: `https://www.facebook.com/${postId}`,
    };
  }

  /**
   * Publish to Twitter
   */
  private async publishToTwitter(post: any) {
    const account = post.account;

    const response = await this.twitterClient.post(
      '/tweets',
      {
        text: post.content,
      },
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      }
    );

    const tweetId = response.data.data.id;
    const username = account.username;

    return {
      id: tweetId,
      url: `https://twitter.com/${username}/status/${tweetId}`,
    };
  }

  /**
   * Publish to TikTok
   */
  private async publishToTikTok(post: any) {
    const account = post.account;
    const mediaUrls = post.mediaUrls ? JSON.parse(post.mediaUrls) : [];

    if (mediaUrls.length === 0) {
      throw new Error('TikTok requires at least one video');
    }

    // TikTok uses a multi-step upload process
    // 1. Initialize video upload
    const initResponse = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        post_info: {
          title: post.content.substring(0, 150), // Max 150 chars
          privacy_level: 'SELF_ONLY', // or PUBLIC_TO_EVERYONE
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: 0, // Will be updated
          chunk_size: 10000000, // 10MB chunks
          total_chunk_count: 1,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { publish_id, upload_url } = initResponse.data.data;

    // 2. Upload video (simplified - would need actual file handling)
    // For now, we'll return the publish_id as this requires file upload implementation

    // 3. Check publish status
    const statusResponse = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
      {
        publish_id,
      },
      {
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: publish_id,
      url: `https://www.tiktok.com/@${account.username}/video/${publish_id}`,
    };
  }

  /**
   * Get posts for an account or company
   */
  async getPosts(
    companyId: number,
    options: {
      accountId?: number;
      status?: string;
      platform?: string;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const where: any = { companyId };

    if (options.accountId) {
      where.accountId = options.accountId;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.platform) {
      where.platform = options.platform.toLowerCase();
    }

    const [posts, total] = await Promise.all([
      prisma.socialMediaPost.findMany({
        where,
        include: {
          account: {
            select: {
              id: true,
              platform: true,
              accountName: true,
              username: true,
              avatarUrl: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0,
      }),
      prisma.socialMediaPost.count({ where }),
    ]);

    return {
      posts,
      total,
      limit: options.limit || 50,
      offset: options.offset || 0,
    };
  }

  /**
   * Delete a post
   */
  async deletePost(postId: number) {
    const post = await prisma.socialMediaPost.findUnique({
      where: { id: postId },
      include: { account: true },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // Delete from platform if published
    if (post.status === 'published' && post.platformPostId) {
      try {
        await this.deleteFromPlatform(post);
      } catch (error) {
        console.error('Error deleting from platform:', error);
        // Continue with database deletion even if platform deletion fails
      }
    }

    // Delete from database
    await prisma.socialMediaPost.delete({
      where: { id: postId },
    });

    return { success: true };
  }

  /**
   * Delete post from platform
   */
  private async deleteFromPlatform(post: any) {
    const account = post.account;

    switch (post.platform) {
      case 'instagram':
        await this.instagramClient.delete(`/${post.platformPostId}`, {
          params: { access_token: account.accessToken },
        });
        break;

      case 'facebook':
        await this.facebookClient.delete(`/${post.platformPostId}`, {
          params: { access_token: account.accessToken },
        });
        break;

      case 'twitter':
        await this.twitterClient.delete(`/tweets/${post.platformPostId}`, {
          headers: { Authorization: `Bearer ${account.accessToken}` },
        });
        break;

      case 'tiktok':
        // TikTok doesn't support deleting videos via API
        // Videos must be deleted from the TikTok app
        console.log('TikTok videos cannot be deleted via API');
        break;
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Sync analytics for an account
   */
  async syncAnalytics(accountId: number, date: Date = new Date()) {
    const account = await prisma.socialMediaAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    let metrics;
    switch (account.platform) {
      case 'instagram':
        metrics = await this.getInstagramAnalytics(account, date);
        break;
      case 'facebook':
        metrics = await this.getFacebookAnalytics(account, date);
        break;
      case 'twitter':
        metrics = await this.getTwitterAnalytics(account, date);
        break;
      case 'tiktok':
        metrics = await this.getTikTokAnalytics(account, date);
        break;
      default:
        throw new Error(`Unsupported platform: ${account.platform}`);
    }

    // Save to database
    const analytics = await prisma.socialMediaAnalytics.upsert({
      where: {
        accountId_date_period: {
          accountId,
          date: new Date(date.toISOString().split('T')[0]),
          period: 'daily',
        },
      },
      update: {
        ...metrics,
        updatedAt: new Date(),
      },
      create: {
        companyId: account.companyId,
        accountId,
        date: new Date(date.toISOString().split('T')[0]),
        period: 'daily',
        ...metrics,
      },
    });

    return analytics;
  }

  private async getInstagramAnalytics(account: any, date: Date) {
    // Instagram Insights API call
    const response = await this.instagramClient.get(`/${account.accountId}/insights`, {
      params: {
        metric: 'impressions,reach,follower_count,profile_views',
        period: 'day',
        access_token: account.accessToken,
      },
    });

    const data = response.data.data;
    return {
      impressionsCount: data.find((d: any) => d.name === 'impressions')?.values[0]?.value || 0,
      reachCount: data.find((d: any) => d.name === 'reach')?.values[0]?.value || 0,
      followersTotal: data.find((d: any) => d.name === 'follower_count')?.values[0]?.value || 0,
      profileViewsCount: data.find((d: any) => d.name === 'profile_views')?.values[0]?.value || 0,
    };
  }

  private async getFacebookAnalytics(account: any, date: Date) {
    const response = await this.facebookClient.get(`/${account.accountId}/insights`, {
      params: {
        metric: 'page_impressions,page_engaged_users,page_fans',
        period: 'day',
        access_token: account.accessToken,
      },
    });

    const data = response.data.data;
    return {
      impressionsCount: data.find((d: any) => d.name === 'page_impressions')?.values[0]?.value || 0,
      reachCount: data.find((d: any) => d.name === 'page_engaged_users')?.values[0]?.value || 0,
      followersTotal: data.find((d: any) => d.name === 'page_fans')?.values[0]?.value || 0,
    };
  }

  private async getTwitterAnalytics(account: any, date: Date) {
    // Twitter doesn't provide historical analytics via API easily
    // Return current stats
    return {
      followersTotal: account.followersCount,
      postsCount: 0,
    };
  }

  private async getTikTokAnalytics(account: any, date: Date) {
    try {
      // Get video analytics
      const response = await axios.get('https://open.tiktokapis.com/v2/research/video/query/', {
        params: {
          fields: 'id,create_time,view_count,like_count,comment_count,share_count',
          start_date: date.toISOString().split('T')[0],
          end_date: date.toISOString().split('T')[0],
        },
        headers: {
          Authorization: `Bearer ${account.accessToken}`,
        },
      });

      const videos = response.data.data.videos || [];
      const totalViews = videos.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0);
      const totalLikes = videos.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0);
      const totalComments = videos.reduce((sum: number, v: any) => sum + (v.comment_count || 0), 0);
      const totalShares = videos.reduce((sum: number, v: any) => sum + (v.share_count || 0), 0);

      return {
        viewsCount: totalViews,
        likesCount: totalLikes,
        commentsCount: totalComments,
        sharesCount: totalShares,
        followersTotal: account.followersCount,
        postsCount: videos.length,
      };
    } catch (error) {
      console.error('TikTok analytics error:', error);
      return {
        followersTotal: account.followersCount,
        postsCount: 0,
      };
    }
  }

  /**
   * Get analytics for date range
   */
  async getAnalytics(
    accountId: number,
    startDate: Date,
    endDate: Date,
    period: string = 'daily'
  ) {
    const analytics = await prisma.socialMediaAnalytics.findMany({
      where: {
        accountId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        period,
      },
      orderBy: { date: 'asc' },
    });

    return analytics;
  }
}

export default new SocialMediaService();
