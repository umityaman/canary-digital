import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticateToken } from '../auth';
import { validate } from '../../middleware/validate';
import * as chartOfAccountsController from '../../controllers/accounting/chartOfAccounts.controller';

const router = Router();

/**
 * @route   GET /api/accounting/chart-of-accounts
 * @desc    Get all chart of accounts with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('type').optional().isIn(['asset', 'liability', 'equity', 'income', 'expense']).withMessage('Invalid account type'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('level').optional().isInt({ min: 1, max: 10 }).withMessage('Level must be between 1 and 10'),
    query('parentCode').optional().isString().withMessage('Parent code must be a string'),
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    query('isSystem').optional().isBoolean().withMessage('isSystem must be a boolean'),
  ],
  validate,
  chartOfAccountsController.getChartOfAccounts
);

/**
 * @route   GET /api/accounting/chart-of-accounts/hierarchy
 * @desc    Get chart of accounts in hierarchical structure
 * @access  Private
 */
router.get(
  '/hierarchy',
  authenticate,
  [
    query('type').optional().isIn(['asset', 'liability', 'equity', 'income', 'expense']).withMessage('Invalid account type'),
    query('rootCode').optional().isString().withMessage('Root code must be a string'),
  ],
  validate,
  chartOfAccountsController.getChartOfAccountsHierarchy
);

/**
 * @route   GET /api/accounting/chart-of-accounts/:code
 * @desc    Get a single chart of account by code
 * @access  Private
 */
router.get(
  '/:code',
  authenticate,
  [
    param('code').notEmpty().withMessage('Account code is required'),
  ],
  validate,
  chartOfAccountsController.getChartOfAccountByCode
);

/**
 * @route   POST /api/accounting/chart-of-accounts
 * @desc    Create a new chart of account
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  [
    body('code').notEmpty().isString().withMessage('Account code is required'),
    body('name').notEmpty().isString().withMessage('Account name is required'),
    body('nameEn').optional().isString().withMessage('English name must be a string'),
    body('type').isIn(['asset', 'liability', 'equity', 'income', 'expense']).withMessage('Invalid account type'),
    body('category').notEmpty().isString().withMessage('Category is required'),
    body('level').isInt({ min: 1, max: 10 }).withMessage('Level must be between 1 and 10'),
    body('parentCode').optional().isString().withMessage('Parent code must be a string'),
    body('normalBalance').isIn(['debit', 'credit']).withMessage('Normal balance must be debit or credit'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ],
  validate,
  chartOfAccountsController.createChartOfAccount
);

/**
 * @route   PUT /api/accounting/chart-of-accounts/:code
 * @desc    Update a chart of account
 * @access  Private (Admin only)
 */
router.put(
  '/:code',
  authenticate,
  [
    param('code').notEmpty().withMessage('Account code is required'),
    body('name').optional().isString().withMessage('Account name must be a string'),
    body('nameEn').optional().isString().withMessage('English name must be a string'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('parentCode').optional().isString().withMessage('Parent code must be a string'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  ],
  validate,
  chartOfAccountsController.updateChartOfAccount
);

/**
 * @route   DELETE /api/accounting/chart-of-accounts/:code
 * @desc    Delete (soft delete) a chart of account
 * @access  Private (Admin only)
 */
router.delete(
  '/:code',
  authenticate,
  [
    param('code').notEmpty().withMessage('Account code is required'),
  ],
  validate,
  chartOfAccountsController.deleteChartOfAccount
);

/**
 * @route   GET /api/accounting/chart-of-accounts/:code/balance
 * @desc    Get current balance and movements for an account
 * @access  Private
 */
router.get(
  '/:code/balance',
  authenticate,
  [
    param('code').notEmpty().withMessage('Account code is required'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  ],
  validate,
  chartOfAccountsController.getAccountBalance
);

export default router;
