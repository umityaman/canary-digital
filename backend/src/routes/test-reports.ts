import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ReportBuilder } from '../services/reportBuilder';
import { ReportExporter } from '../services/reportExporter';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Test endpoint to verify reporting system
 * GET /api/test-reports/templates
 */
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.reportTemplate.findMany({
      where: {
        companyId: 1, // Test company
      },
      select: {
        id: true,
        name: true,
        description: true,
        dataSource: true,
        isDefault: true,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      message: 'Report templates loaded successfully',
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load templates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Test endpoint to generate a sample report
 * GET /api/test-reports/generate/:templateId
 */
router.get('/generate/:templateId', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { format = 'json' } = req.query;

    const template = await prisma.reportTemplate.findFirst({
      where: {
        id: parseInt(templateId),
        companyId: 1, // Test company
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Generate report
    const reportBuilder = new ReportBuilder(prisma);
    const reportData = await reportBuilder.generateReport(
      template.config as any,
      1 // Test company ID
    );

    // If format is JSON, return data
    if (format === 'json') {
      return res.json({
        success: true,
        message: 'Report generated successfully',
        template: {
          id: template.id,
          name: template.name,
          dataSource: template.dataSource,
        },
        report: {
          total: reportData.total,
          fields: reportData.fields,
          rowCount: reportData.data.length,
          data: reportData.data.slice(0, 10), // First 10 rows only
        },
      });
    }

    // Export to file
    const exporter = new ReportExporter();
    let buffer: Buffer | string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'excel':
        buffer = await exporter.exportToExcel(reportData.data, { 
          filename: template.name 
        });
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${template.name.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
        break;

      case 'pdf':
        buffer = await exporter.exportToPDF(reportData.data, { 
          title: template.name 
        });
        contentType = 'application/pdf';
        filename = `${template.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        break;

      case 'csv':
        buffer = await exporter.exportToCSV(reportData.data);
        contentType = 'text/csv';
        filename = `${template.name.replace(/[^a-z0-9]/gi, '_')}.csv`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Use: json, excel, pdf, or csv',
        });
    }

    // Send file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Test all templates - quick validation
 * GET /api/test-reports/validate-all
 */
router.get('/validate-all', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.reportTemplate.findMany({
      where: {
        companyId: 1,
        isActive: true,
      },
    });

    const reportBuilder = new ReportBuilder(prisma);
    const results = [];

    for (const template of templates) {
      try {
        const startTime = Date.now();
        const reportData = await reportBuilder.generateReport(
          template.config as any,
          1
        );
        const duration = Date.now() - startTime;

        results.push({
          templateId: template.id,
          name: template.name,
          status: 'success',
          rowCount: reportData.data.length,
          fields: reportData.fields,
          duration: `${duration}ms`,
        });
      } catch (error) {
        results.push({
          templateId: template.id,
          name: template.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    res.json({
      success: true,
      message: 'Template validation completed',
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        successRate: `${((successCount / results.length) * 100).toFixed(1)}%`,
      },
      results,
    });
  } catch (error) {
    console.error('Error validating templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate templates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
