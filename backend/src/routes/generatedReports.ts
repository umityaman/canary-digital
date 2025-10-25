import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authenticateToken);

/**
 * GET /api/generated-reports
 * Get generated reports history with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { 
      format, 
      templateId, 
      page = '1', 
      limit = '20',
      startDate,
      endDate 
    } = req.query;

    const where: any = {
      companyId: user.companyId,
    };

    if (format) {
      where.format = format as string;
    }

    if (templateId) {
      where.templateId = parseInt(templateId as string);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      prisma.generatedReport.findMany({
        where,
        include: {
          template: {
            select: { id: true, name: true, dataSource: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.generatedReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching report history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generated-reports/:id
 * Get single generated report details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const report = await prisma.generatedReport.findFirst({
      where: {
        id: parseInt(id),
        companyId: user.companyId,
      },
      include: {
        template: {
          select: { id: true, name: true, description: true, dataSource: true, config: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generated-reports/:id/download
 * Download generated report file
 */
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const report = await prisma.generatedReport.findFirst({
      where: {
        id: parseInt(id),
        companyId: user.companyId,
      },
    });

    if (!report || !report.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Report file not found',
      });
    }

    const filePath = path.join(__dirname, '../..', report.fileUrl);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Report file not found on server',
      });
    }

    // Set appropriate headers
    const ext = path.extname(filePath);
    let contentType = 'application/octet-stream';
    
    if (ext === '.xlsx') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    } else if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.csv') {
      contentType = 'text/csv';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.name}${ext}"`);
    
    const fileBuffer = await fs.readFile(filePath);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/generated-reports/:id
 * Delete generated report and its file
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const report = await prisma.generatedReport.findFirst({
      where: {
        id: parseInt(id),
        companyId: user.companyId,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    // Delete file if exists
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '../..', report.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue even if file deletion fails
      }
    }

    await prisma.generatedReport.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/generated-reports/bulk
 * Bulk delete generated reports
 */
router.delete('/bulk', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Report IDs array is required',
      });
    }

    // Get reports to delete (for file cleanup)
    const reports = await prisma.generatedReport.findMany({
      where: {
        id: { in: ids.map((id: string) => parseInt(id)) },
        companyId: user.companyId,
      },
    });

    // Delete files
    for (const report of reports) {
      if (report.fileUrl) {
        const filePath = path.join(__dirname, '../..', report.fileUrl);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error);
        }
      }
    }

    // Delete from database
    const result = await prisma.generatedReport.deleteMany({
      where: {
        id: { in: ids.map((id: string) => parseInt(id)) },
        companyId: user.companyId,
      },
    });

    res.json({
      success: true,
      message: `${result.count} reports deleted successfully`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error bulk deleting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reports',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/generated-reports/stats
 * Get statistics about generated reports
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { startDate, endDate } = req.query;

    const where: any = {
      companyId: user.companyId,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [
      totalReports,
      reportsByFormat,
      reportsByTemplate,
      totalFileSize,
    ] = await Promise.all([
      // Total count
      prisma.generatedReport.count({ where }),
      
      // Group by format
      prisma.generatedReport.groupBy({
        by: ['format'],
        where,
        _count: { id: true },
      }),
      
      // Group by template
      prisma.generatedReport.groupBy({
        by: ['templateId'],
        where: {
          ...where,
          templateId: { not: null },
        },
        _count: { id: true },
      }),
      
      // Total file size
      prisma.generatedReport.aggregate({
        where,
        _sum: { fileSize: true },
      }),
    ]);

    // Get template names for template stats
    const templateIds = reportsByTemplate
      .map(r => r.templateId)
      .filter((id): id is number => id !== null);

    const templates = await prisma.reportTemplate.findMany({
      where: { id: { in: templateIds } },
      select: { id: true, name: true },
    });

    const templateMap = new Map(templates.map(t => [t.id, t.name]));

    res.json({
      success: true,
      data: {
        totalReports,
        totalFileSize: totalFileSize._sum.fileSize || 0,
        byFormat: reportsByFormat.map(r => ({
          format: r.format,
          count: r._count.id,
        })),
        byTemplate: reportsByTemplate.map(r => ({
          templateId: r.templateId,
          templateName: r.templateId ? templateMap.get(r.templateId) : 'Unknown',
          count: r._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
