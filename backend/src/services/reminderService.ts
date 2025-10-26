import { PrismaClient } from '@prisma/client';
import { emailService } from './emailService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface ReminderSettings {
  enabled: boolean;
  daysBefore: number[]; // e.g., [7, 3, 1] for 7 days, 3 days, 1 day before
  emailEnabled: boolean;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  daysBefore: [7, 3, 1],
  emailEnabled: true,
};

/**
 * Check for upcoming check due dates and send reminders
 */
export const sendCheckReminders = async (companyId: number) => {
  try {
    const settings = DEFAULT_SETTINGS;
    if (!settings.enabled) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get company with user email
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!company || company.users.length === 0) {
      logger.warn(`No admin users found for company ${companyId}`);
      return;
    }

    const adminUser = company.users[0];

    // Check for each reminder day
    for (const daysBefore of settings.daysBefore) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysBefore);
      targetDate.setHours(23, 59, 59, 999);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      // Find checks due on target date
      const upcomingChecks = await prisma.check.findMany({
        where: {
          companyId,
          status: { in: ['portfolio', 'deposited'] },
          dueDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: {
          customer: { select: { name: true } },
          supplier: { select: { name: true } },
        },
      });

      if (upcomingChecks.length > 0 && settings.emailEnabled) {
        const totalAmount = upcomingChecks.reduce((sum, check) => sum + check.amount, 0);
        
        const checkList = upcomingChecks
          .map(
            (check) =>
              `- Çek No: ${check.checkNumber}, Tutar: ${formatCurrency(check.amount)} ${check.currency}, ` +
              `Keşideci: ${check.drawerName}, Vade: ${formatDate(check.dueDate)}`
          )
          .join('\n');

        const subject = `Vade Hatırlatma: ${daysBefore} Gün İçinde ${upcomingChecks.length} Çek Vadesi Dolacak`;
        const message = `
Sayın ${adminUser.firstName} ${adminUser.lastName},

${daysBefore} gün içinde vadesi dolacak ${upcomingChecks.length} adet çek bulunmaktadır.

Toplam Tutar: ${formatCurrency(totalAmount)} TL

Çek Listesi:
${checkList}

Lütfen gerekli işlemleri zamanında yapınız.

---
Bu otomatik bir hatırlatma mesajıdır.
Canary Digital - Muhasebe Sistemi
        `.trim();

        await emailService.sendEmail({
          to: adminUser.email,
          subject,
          text: message,
        });

        logger.info(`Check reminder sent to ${adminUser.email} for ${upcomingChecks.length} checks (${daysBefore} days before)`);
      }
    }
  } catch (error) {
    logger.error('Error sending check reminders:', error);
    throw error;
  }
};

/**
 * Check for upcoming promissory note due dates and send reminders
 */
export const sendPromissoryNoteReminders = async (companyId: number) => {
  try {
    const settings = DEFAULT_SETTINGS;
    if (!settings.enabled) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get company with user email
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!company || company.users.length === 0) {
      logger.warn(`No admin users found for company ${companyId}`);
      return;
    }

    const adminUser = company.users[0];

    // Check for each reminder day
    for (const daysBefore of settings.daysBefore) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysBefore);
      targetDate.setHours(23, 59, 59, 999);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(0, 0, 0, 0);

      // Find promissory notes due on target date
      const upcomingNotes = await prisma.promissoryNote.findMany({
        where: {
          companyId,
          status: { in: ['portfolio'] },
          dueDate: {
            gte: targetDate,
            lt: nextDay,
          },
        },
        include: {
          customer: { select: { name: true } },
          supplier: { select: { name: true } },
        },
      });

      if (upcomingNotes.length > 0 && settings.emailEnabled) {
        const totalAmount = upcomingNotes.reduce((sum, note) => sum + note.amount, 0);
        
        const noteList = upcomingNotes
          .map(
            (note) =>
              `- Senet No: ${note.noteNumber}, Tutar: ${formatCurrency(note.amount)} ${note.currency}, ` +
              `Borçlu: ${note.drawerName}, Vade: ${formatDate(note.dueDate)}`
          )
          .join('\n');

        const subject = `Vade Hatırlatma: ${daysBefore} Gün İçinde ${upcomingNotes.length} Senet Vadesi Dolacak`;
        const message = `
Sayın ${adminUser.firstName} ${adminUser.lastName},

${daysBefore} gün içinde vadesi dolacak ${upcomingNotes.length} adet senet bulunmaktadır.

Toplam Tutar: ${formatCurrency(totalAmount)} TL

Senet Listesi:
${noteList}

Lütfen gerekli işlemleri zamanında yapınız.

---
Bu otomatik bir hatırlatma mesajıdır.
Canary Digital - Muhasebe Sistemi
        `.trim();

        await emailService.sendEmail({
          to: adminUser.email,
          subject,
          text: message,
        });

        logger.info(`Promissory note reminder sent to ${adminUser.email} for ${upcomingNotes.length} notes (${daysBefore} days before)`);
      }
    }
  } catch (error) {
    logger.error('Error sending promissory note reminders:', error);
    throw error;
  }
};

/**
 * Check for overdue items and send alerts
 */
export const sendOverdueAlerts = async (companyId: number) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get company with user email
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!company || company.users.length === 0) return;

    const adminUser = company.users[0];

    // Find overdue checks
    const overdueChecks = await prisma.check.findMany({
      where: {
        companyId,
        status: { in: ['portfolio', 'deposited'] },
        dueDate: { lt: today },
      },
      include: {
        customer: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    });

    // Find overdue promissory notes
    const overdueNotes = await prisma.promissoryNote.findMany({
      where: {
        companyId,
        status: { in: ['portfolio'] },
        dueDate: { lt: today },
      },
      include: {
        customer: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    });

    if (overdueChecks.length > 0 || overdueNotes.length > 0) {
      let message = `Sayın ${adminUser.firstName} ${adminUser.lastName},\n\nVadesi geçmiş belgeler bulunmaktadır:\n\n`;

      if (overdueChecks.length > 0) {
        const checkTotal = overdueChecks.reduce((sum, check) => sum + check.amount, 0);
        message += `VADESİ GEÇMİŞ ÇEKLER (${overdueChecks.length} adet):\n`;
        message += `Toplam: ${formatCurrency(checkTotal)} TL\n\n`;
        overdueChecks.forEach((check) => {
          const daysPast = Math.floor((today.getTime() - new Date(check.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          message += `- Çek No: ${check.checkNumber}, Tutar: ${formatCurrency(check.amount)} ${check.currency}, `;
          message += `Keşideci: ${check.drawerName}, Vade: ${formatDate(check.dueDate)} (${daysPast} gün geçti)\n`;
        });
        message += '\n';
      }

      if (overdueNotes.length > 0) {
        const noteTotal = overdueNotes.reduce((sum, note) => sum + note.amount, 0);
        message += `VADESİ GEÇMİŞ SENETLER (${overdueNotes.length} adet):\n`;
        message += `Toplam: ${formatCurrency(noteTotal)} TL\n\n`;
        overdueNotes.forEach((note) => {
          const daysPast = Math.floor((today.getTime() - new Date(note.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          message += `- Senet No: ${note.noteNumber}, Tutar: ${formatCurrency(note.amount)} ${note.currency}, `;
          message += `Borçlu: ${note.drawerName}, Vade: ${formatDate(note.dueDate)} (${daysPast} gün geçti)\n`;
        });
      }

      message += '\nLütfen vadesi geçmiş belgeleri kontrol ediniz.\n\n---\nCanary Digital - Muhasebe Sistemi';

      await emailService.sendEmail({
        to: adminUser.email,
        subject: `⚠️ Vadesi Geçmiş Belgeler: ${overdueChecks.length} Çek + ${overdueNotes.length} Senet`,
        text: message,
      });

      logger.info(`Overdue alert sent to ${adminUser.email}: ${overdueChecks.length} checks, ${overdueNotes.length} notes`);
    }
  } catch (error) {
    logger.error('Error sending overdue alerts:', error);
    throw error;
  }
};

/**
 * Run all reminders for a company
 */
export const runAllReminders = async (companyId: number) => {
  try {
    logger.info(`Running all reminders for company ${companyId}`);
    await sendCheckReminders(companyId);
    await sendPromissoryNoteReminders(companyId);
    await sendOverdueAlerts(companyId);
    logger.info(`All reminders completed for company ${companyId}`);
  } catch (error) {
    logger.error('Error running all reminders:', error);
    throw error;
  }
};

/**
 * Schedule daily reminder check (to be called by cron job)
 */
export const scheduleDailyReminders = async () => {
  try {
    logger.info('Starting daily reminder check for all companies');
    
    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { active: true },
      select: { id: true, name: true },
    });

    for (const company of companies) {
      try {
        await runAllReminders(company.id);
      } catch (error) {
        logger.error(`Failed to run reminders for company ${company.id}:`, error);
        // Continue with next company
      }
    }

    logger.info(`Daily reminder check completed for ${companies.length} companies`);
  } catch (error) {
    logger.error('Error in daily reminder scheduler:', error);
    throw error;
  }
};

// Helper functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('tr-TR');
};

export const reminderService = {
  sendCheckReminders,
  sendPromissoryNoteReminders,
  sendOverdueAlerts,
  runAllReminders,
  scheduleDailyReminders,
};
