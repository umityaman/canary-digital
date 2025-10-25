import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { ReportBuilder } from '../services/reportBuilder';
import { ReportExporter } from '../services/reportExporter';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(authenticateToken);

// ===================================
// REPORT TEMPLATES CRUD
// ===================================

/**
 * GET /api/report-templates
 * List all report templates for company
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { dataSource, isActive } = req.query;

    const where: any = {
      companyId: user.companyId,
    };

    if (dataSource) {
      where.dataSource = dataSource as string;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const templates = await prisma.reportTemplate.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            generatedReports: true,
            schedules: true,
          },
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    });

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report templates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/report-templates/:id
 * Get single report template
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const template = await prisma.reportTemplate.findFirst({
      where: {
        id: parseInt(id),
        companyId: user.companyId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            generatedReports: true,
            schedules: true,
          },
        },
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/report-templates
 * Create new report template
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, description, dataSource, config, isDefault } = req.body;

    // Validate required fields
    if (!name || !dataSource || !config) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, dataSource, config',
      });
    }

    // Validate dataSource
    const validDataSources = ['orders', 'equipment', 'customers', 'payments', 'reservations'];
    if (!validDataSources.includes(dataSource)) {
      return res.status(400).json({
        success: false,
        message: `Invalid dataSource. Must be one of: ${validDataSources.join(', ')}`,
      });
    }

    const template = await prisma.reportTemplate.create({
      data: {
        name,
        description,
        dataSource,
        config,
        isDefault: isDefault || false,
        createdBy: user.id,
        companyId: user.companyId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /api/report-templates/:id
 * Update report template
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, description, dataSource, config, isDefault, isActive } = req.body;

    // Check if template exists and belongs to company
    const existingTemplate = await prisma.reportTemplate.findFirst({
      where: {
        id: parseInt(id),
        companyId: user.companyId,
      },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (dataSource !== undefined) updateData.dataSource = dataSource;
    if (config !== undefined) updateData.config = config;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await prisma.reportTemplate.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Template updated successfully',
      data: template,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/report-templates/:id
 * Delete report template
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Check if template exists and belongs to company
    const existingTemplate = await prisma.reportTemplate.findFirst({
      where: {
        id: parseInt(id),
        companyId: user.companyId,
      },
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    // Don't allow deleting default templates
    if (existingTemplate.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default templates',
      });
    }

    await prisma.reportTemplate.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete template',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/report-templates/:id/generate
 * Generate report from template
 */
router.post('/:id/generate', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { format = 'json', customName } = req.body;

    const template = await prisma.reportTemplate.findFirst({
      where: {
        id: parseInt(id),
        companyId: user.companyId,
        isActive: true,
      },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or inactive',
      });
    }

    // Generate report data
    const reportBuilder = new ReportBuilder(prisma);
    const reportData = await reportBuilder.generateReport(
      template.config as any, 
      user.companyId
    );

    const reportName = customName || template.name;

    // If format is json, just return data
    if (format === 'json') {
      const generatedReport = await prisma.generatedReport.create({
        data: {
          templateId: template.id,
          name: reportName,
          format: 'json',
          metadata: {
            rowCount: reportData.data.length,
            fields: reportData.fields,
            generatedAt: new Date().toISOString(),
          },
          createdBy: user.id,
          companyId: user.companyId,
        },
      });

      return res.json({
        success: true,
        message: 'Report generated successfully',
        data: {
          reportId: generatedReport.id,
          report: reportData,
        },
      });
    }

    // Export to file
    const exporter = new ReportExporter();
    const uploadsDir = path.join(__dirname, '../../uploads/reports');
    await fs.mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const fileName = `${reportName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}`;
    let filePath: string;
    let buffer: Buffer | string;

    switch (format) {
      case 'excel':
        buffer = await exporter.exportToExcel(reportData.data, { filename: reportName });
        filePath = path.join(uploadsDir, `${fileName}.xlsx`);
        await fs.writeFile(filePath, buffer as Buffer);
        break;
      case 'pdf':
        buffer = await exporter.exportToPDF(reportData.data, { title: reportName });
        filePath = path.join(uploadsDir, `${fileName}.pdf`);
        await fs.writeFile(filePath, buffer as Buffer);
        break;
      case 'csv':
        buffer = await exporter.exportToCSV(reportData.data);
        filePath = path.join(uploadsDir, `${fileName}.csv`);
        await fs.writeFile(filePath, buffer as string, 'utf-8');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid format. Must be json, excel, pdf, or csv',
        });
    }

    const stats = await fs.stat(filePath);
    const fileUrl = `/uploads/reports/${path.basename(filePath)}`;

    const generatedReport = await prisma.generatedReport.create({
      data: {
        templateId: template.id,
        name: reportName,
        format,
        fileUrl,
        fileSize: stats.size,
        metadata: {
          rowCount: reportData.data.length,
          fields: reportData.fields,
          exportedAt: new Date().toISOString(),
        },
        createdBy: user.id,
        companyId: user.companyId,
      },
    });

    res.json({
      success: true,
      message: 'Report generated and exported successfully',
      data: {
        reportId: generatedReport.id,
        fileUrl,
        fileSize: stats.size,
        format,
      },
    });
  } catch (error) {
    console.error('Error generating report from template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
