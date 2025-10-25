import express from 'express';
import { authenticateToken } from './auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const router = express.Router();

/**
 * @route   POST /api/seed
 * @desc    Run database seed (ADMIN ONLY)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if ((req as any).user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can seed the database',
      });
    }

    // Run seed script
    const { stdout, stderr } = await execPromise('npx tsx prisma/seed.ts');

    res.json({
      success: true,
      message: 'Database seeded successfully',
      output: stdout,
      errors: stderr || null,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message,
    });
  }
});

export default router;
