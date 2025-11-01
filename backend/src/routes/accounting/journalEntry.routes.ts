import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import * as journalEntryController from '../../controllers/accounting/journalEntry.controller';

const router = Router();

/**
 * @route   GET /api/accounting/journal-entries
 * @desc    Get all journal entries with filtering and pagination
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('status').optional().isIn(['draft', 'posted', 'reversed']).withMessage('Invalid status'),
    query('entryType').optional().isString().withMessage('Entry type must be a string'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    query('search').optional().isString().withMessage('Search must be a string'),
  ],
  validate,
  journalEntryController.getJournalEntries
);

/**
 * @route   GET /api/accounting/journal-entries/:id
 * @desc    Get a single journal entry by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid journal entry ID is required'),
  ],
  validate,
  journalEntryController.getJournalEntryById
);

/**
 * @route   POST /api/accounting/journal-entries
 * @desc    Create a new journal entry
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  [
    body('entryDate').notEmpty().isISO8601().withMessage('Entry date is required'),
    body('entryType').optional().isString().withMessage('Entry type must be a string'),
    body('description').notEmpty().isString().withMessage('Description is required'),
    body('reference').optional().isString().withMessage('Reference must be a string'),
    body('items').isArray({ min: 2 }).withMessage('At least 2 journal entry items are required'),
    body('items.*.accountCode').notEmpty().withMessage('Account code is required for each item'),
    body('items.*.debit').isFloat({ min: 0 }).withMessage('Debit must be a positive number'),
    body('items.*.credit').isFloat({ min: 0 }).withMessage('Credit must be a positive number'),
    body('items.*.description').optional().isString().withMessage('Description must be a string'),
  ],
  validate,
  journalEntryController.createJournalEntry
);

/**
 * @route   PUT /api/accounting/journal-entries/:id
 * @desc    Update a journal entry (only if status = draft)
 * @access  Private
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid journal entry ID is required'),
    body('entryDate').optional().isISO8601().withMessage('Entry date must be a valid date'),
    body('entryType').optional().isString().withMessage('Entry type must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('reference').optional().isString().withMessage('Reference must be a string'),
    body('items').optional().isArray({ min: 2 }).withMessage('At least 2 journal entry items are required'),
    body('items.*.accountCode').optional().notEmpty().withMessage('Account code is required for each item'),
    body('items.*.debit').optional().isFloat({ min: 0 }).withMessage('Debit must be a positive number'),
    body('items.*.credit').optional().isFloat({ min: 0 }).withMessage('Credit must be a positive number'),
  ],
  validate,
  journalEntryController.updateJournalEntry
);

/**
 * @route   POST /api/accounting/journal-entries/:id/post
 * @desc    Post a journal entry (lock it, make it permanent)
 * @access  Private (Admin/Accountant only)
 */
router.post(
  '/:id/post',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid journal entry ID is required'),
  ],
  validate,
  journalEntryController.postJournalEntry
);

/**
 * @route   POST /api/accounting/journal-entries/:id/reverse
 * @desc    Reverse a posted journal entry
 * @access  Private (Admin/Accountant only)
 */
router.post(
  '/:id/reverse',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid journal entry ID is required'),
    body('reason').notEmpty().isString().withMessage('Reason for reversal is required'),
    body('reversalDate').optional().isISO8601().withMessage('Reversal date must be a valid date'),
  ],
  validate,
  journalEntryController.reverseJournalEntry
);

/**
 * @route   DELETE /api/accounting/journal-entries/:id
 * @desc    Delete a journal entry (only if status = draft)
 * @access  Private (Admin/Accountant only)
 */
router.delete(
  '/:id',
  authenticate,
  [
    param('id').isInt({ min: 1 }).withMessage('Valid journal entry ID is required'),
  ],
  validate,
  journalEntryController.deleteJournalEntry
);

/**
 * @route   POST /api/accounting/journal-entries/validate
 * @desc    Validate a journal entry before saving (check debit=credit, account codes exist)
 * @access  Private
 */
router.post(
  '/validate',
  authenticate,
  [
    body('items').isArray({ min: 2 }).withMessage('At least 2 journal entry items are required'),
    body('items.*.accountCode').notEmpty().withMessage('Account code is required for each item'),
    body('items.*.debit').isFloat({ min: 0 }).withMessage('Debit must be a positive number'),
    body('items.*.credit').isFloat({ min: 0 }).withMessage('Credit must be a positive number'),
  ],
  validate,
  journalEntryController.validateJournalEntry
);

export default router;
