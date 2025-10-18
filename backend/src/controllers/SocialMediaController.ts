import { Request, Response } from 'express';
import SocialMediaService from '../services/SocialMediaService';

class SocialMediaController {
  // ============================================
  // ACCOUNT MANAGEMENT
  // ============================================

  /**
   * Connect a social media account
   * POST /api/social-media/accounts/connect
   */
  async connectAccount(req: Request, res: Response) {
    try {
      const { platform, authCode } = req.body;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
      }

      if (!platform || !authCode) {
        return res.status(400).json({
          success: false,
          message: 'Platform and auth code are required',
        });
      }

      const account = await SocialMediaService.connectAccount(
        companyId,
        platform,
        authCode
      );

      res.status(201).json({
        success: true,
        message: `${platform} account connected successfully`,
        data: account,
      });
    } catch (error: any) {
      console.error('Error connecting account:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to connect account',
      });
    }
  }

  /**
   * Disconnect a social media account
   * DELETE /api/social-media/accounts/:accountId
   */
  async disconnectAccount(req: Request, res: Response) {
    try {
      const { accountId } = req.params;

      const account = await SocialMediaService.disconnectAccount(Number(accountId));

      res.json({
        success: true,
        message: 'Account disconnected successfully',
        data: account,
      });
    } catch (error: any) {
      console.error('Error disconnecting account:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to disconnect account',
      });
    }
  }

  /**
   * Get all social media accounts
   * GET /api/social-media/accounts
   */
  async getAccounts(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const { platform } = req.query;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
      }

      const accounts = await SocialMediaService.getAccounts(
        companyId,
        platform as string | undefined
      );

      res.json({
        success: true,
        data: accounts,
      });
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch accounts',
      });
    }
  }

  /**
   * Refresh account statistics
   * POST /api/social-media/accounts/:accountId/refresh
   */
  async refreshAccountStats(req: Request, res: Response) {
    try {
      const { accountId } = req.params;

      const account = await SocialMediaService.refreshAccountStats(Number(accountId));

      res.json({
        success: true,
        message: 'Account statistics refreshed successfully',
        data: account,
      });
    } catch (error: any) {
      console.error('Error refreshing account stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to refresh account statistics',
      });
    }
  }

  // ============================================
  // POST MANAGEMENT
  // ============================================

  /**
   * Create and publish a post
   * POST /api/social-media/posts
   */
  async publishPost(req: Request, res: Response) {
    try {
      const { accountId, content, mediaUrls, hashtags, mentions, location, scheduledFor } =
        req.body;
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId || !companyId) {
        return res.status(400).json({
          success: false,
          message: 'User ID and Company ID are required',
        });
      }

      if (!accountId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Account ID and content are required',
        });
      }

      const postContent = {
        text: content,
        mediaUrls,
        hashtags,
        mentions,
        location,
      };

      const scheduledDate = scheduledFor ? new Date(scheduledFor) : undefined;

      const post = await SocialMediaService.publishPost(
        accountId,
        userId,
        postContent,
        scheduledDate
      );

      res.status(201).json({
        success: true,
        message: scheduledFor
          ? 'Post scheduled successfully'
          : 'Post published successfully',
        data: post,
      });
    } catch (error: any) {
      console.error('Error publishing post:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to publish post',
      });
    }
  }

  /**
   * Get posts
   * GET /api/social-media/posts
   */
  async getPosts(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;
      const { accountId, status, platform, limit, offset } = req.query;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
      }

      const options = {
        accountId: accountId ? Number(accountId) : undefined,
        status: status as string | undefined,
        platform: platform as string | undefined,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      };

      const result = await SocialMediaService.getPosts(companyId, options);

      res.json({
        success: true,
        data: result.posts,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      });
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch posts',
      });
    }
  }

  /**
   * Delete a post
   * DELETE /api/social-media/posts/:postId
   */
  async deletePost(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      await SocialMediaService.deletePost(Number(postId));

      res.json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting post:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete post',
      });
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  /**
   * Sync analytics for an account
   * POST /api/social-media/accounts/:accountId/analytics/sync
   */
  async syncAnalytics(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const { date } = req.body;

      const analyticsDate = date ? new Date(date) : new Date();

      const analytics = await SocialMediaService.syncAnalytics(
        Number(accountId),
        analyticsDate
      );

      res.json({
        success: true,
        message: 'Analytics synced successfully',
        data: analytics,
      });
    } catch (error: any) {
      console.error('Error syncing analytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to sync analytics',
      });
    }
  }

  /**
   * Get analytics for an account
   * GET /api/social-media/accounts/:accountId/analytics
   */
  async getAnalytics(req: Request, res: Response) {
    try {
      const { accountId } = req.params;
      const { startDate, endDate, period } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const analytics = await SocialMediaService.getAnalytics(
        Number(accountId),
        new Date(startDate as string),
        new Date(endDate as string),
        period as string | undefined
      );

      // Calculate summary
      const summary = {
        totalImpressions: analytics.reduce((sum, a) => sum + a.impressionsCount, 0),
        totalReach: analytics.reduce((sum, a) => sum + a.reachCount, 0),
        totalEngagement: analytics.reduce(
          (sum, a) => sum + a.likesCount + a.commentsCount + a.sharesCount,
          0
        ),
        avgEngagementRate: 0,
        followersGrowth: analytics.reduce((sum, a) => sum + a.followersNet, 0),
      };

      if (summary.totalReach > 0) {
        summary.avgEngagementRate = (summary.totalEngagement / summary.totalReach) * 100;
      }

      res.json({
        success: true,
        data: {
          analytics,
          summary,
        },
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch analytics',
      });
    }
  }

  /**
   * Get OAuth URLs for social media platforms
   * GET /api/social-media/oauth/:platform
   */
  async getOAuthUrl(req: Request, res: Response) {
    try {
      const { platform } = req.params;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
      }

      let oauthUrl: string;
      const redirectUri = `${process.env.FRONTEND_URL}/social-media/callback`;

      switch (platform.toLowerCase()) {
        case 'instagram':
          oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code`;
          break;

        case 'facebook':
          oauthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=pages_manage_posts,pages_read_engagement&response_type=code`;
          break;

        case 'twitter':
          oauthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${redirectUri}&scope=tweet.read%20tweet.write%20users.read&state=${companyId}&code_challenge=challenge&code_challenge_method=plain`;
          break;

        case 'tiktok':
          oauthUrl = `https://www.tiktok.com/v2/auth/authorize?client_key=${process.env.TIKTOK_CLIENT_KEY}&redirect_uri=${redirectUri}&scope=user.info.basic,video.list,video.upload,video.publish&response_type=code&state=${companyId}`;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: `Unsupported platform: ${platform}`,
          });
      }

      res.json({
        success: true,
        data: {
          platform,
          oauthUrl,
        },
      });
    } catch (error: any) {
      console.error('Error generating OAuth URL:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate OAuth URL',
      });
    }
  }

  /**
   * Get dashboard summary
   * GET /api/social-media/dashboard
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required',
        });
      }

      const accounts = await SocialMediaService.getAccounts(companyId);
      
      const postsResult = await SocialMediaService.getPosts(companyId, {
        limit: 10,
      });

      const summary = {
        totalAccounts: accounts.length,
        activeAccounts: accounts.filter((a) => a.isActive).length,
        totalFollowers: accounts.reduce((sum, a) => sum + a.followersCount, 0),
        totalPosts: accounts.reduce((sum, a) => sum + a.postsCount, 0),
        recentPosts: postsResult.posts,
        accounts: accounts.map((account) => ({
          id: account.id,
          platform: account.platform,
          accountName: account.accountName,
          username: account.username,
          avatarUrl: account.avatarUrl,
          followersCount: account.followersCount,
          postsCount: account.postsCount,
          isActive: account.isActive,
          lastSyncAt: account.lastSyncAt,
        })),
      };

      res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard data',
      });
    }
  }
}

export default new SocialMediaController();
