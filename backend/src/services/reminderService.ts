import { PrismaClient } from '@prisma/client';
import { emailService } from './EmailService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface ReminderSettings {
  enabled: boolean;
  daysBefore: number[];
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

    // Get company email
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { email: true, name: true },
    });

    if (!company || !company.email) {
      logger.warn(`No email found for company ${companyId}`);
      return;
    }

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
              `- Çek No: ${check.checkNumber}, Tutar: ${formatCurrency(check.amount)}, Keşideci: ${
                check.drawerName
              }, Vade: ${formatDate(check.dueDate)}`
          )
          .join('\n');

        const subject = `Vade Hatırlatma: ${daysBefore} Gün İçinde ${upcomingChecks.length} Çek Vadesi Dolacak`;
        const body = `
Sayın ${company.name},

${daysBefore} gün içinde vadesi dolacak ${upcomingChecks.length} adet çek bulunmaktadır:

${checkList}

Toplam Tutar: ${formatCurrency(totalAmount)}

Bu çeklerin vadesinde tahsil edilmesi için gerekli hazırlıkları yapmanızı rica ederiz.

Canary Digital - Muhasebe Sistemi
        `;

        await emailService.sendEmail({
          to: company.email,
          subject,
          text: body,
        });

        logger.info(`Sent ${daysBefore}-day check reminder to ${company.email} for ${upcomingChecks.length} checks`);
      }
    }
  } catch (error: any) {
    logger.error(`Error sending check reminders for company ${companyId}:`, error);
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

    // Get company email
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { email: true, name: true },
    });

    if (!company || !company.email) {
      logger.warn(`No email found for company ${companyId}`);
      return;
    }

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
          status: 'portfolio',
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
              `- Senet No: ${note.noteNumber}, Tutar: ${formatCurrency(note.amount)}, Keşideci: ${
                note.drawerName
              }, Vade: ${formatDate(note.dueDate)}`
          )
          .join('\n');

        const subject = `Vade Hatırlatma: ${daysBefore} Gün İçinde ${upcomingNotes.length} Senet Vadesi Dolacak`;
        const body = `
Sayın ${company.name},

${daysBefore} gün içinde vadesi dolacak ${upcomingNotes.length} adet senet bulunmaktadır:

${noteList}

Toplam Tutar: ${formatCurrency(totalAmount)}

Bu senetlerin vadesinde tahsil edilmesi için gerekli hazırlıkları yapmanızı rica ederiz.

Canary Digital - Muhasebe Sistemi
        `;

        await emailService.sendEmail({
          to: company.email,
          subject,
          text: body,
        });

        logger.info(`Sent ${daysBefore}-day promissory note reminder to ${company.email} for ${upcomingNotes.length} notes`);
      }
    }
  } catch (error: any) {
    logger.error(`Error sending promissory note reminders for company ${companyId}:`, error);
    throw error;
  }
};

/**
 * Check for overdue checks and promissory notes
 */
export const sendOverdueAlerts = async (companyId: number) => {
  try {
    const settings = DEFAULT_SETTINGS;
    if (!settings.enabled || !settings.emailEnabled) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get company email
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { email: true, name: true },
    });

    if (!company || !company.email) return;

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
        status: 'portfolio',
        dueDate: { lt: today },
      },
      include: {
        customer: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    });

    if (overdueChecks.length === 0 && overdueNotes.length === 0) {
      return;
    }

    let body = `Sayın ${company.name},\n\n`;
    let totalOverdueAmount = 0;

    if (overdueChecks.length > 0) {
      const checkAmount = overdueChecks.reduce((sum, check) => sum + check.amount, 0);
      totalOverdueAmount += checkAmount;

      body += `Vadesi Geçmiş ${overdueChecks.length} Çek:\n`;
      overdueChecks.forEach((check) => {
        const daysOverdue = Math.floor((today.getTime() - new Date(check.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        body += `- Çek No: ${check.checkNumber}, Tutar: ${formatCurrency(check.amount)}, Vade: ${formatDate(
          check.dueDate
        )}, ${daysOverdue} gün gecikmiş\n`;
      });
      body += `\nToplam Gecikmiş Çek Tutarı: ${formatCurrency(checkAmount)}\n\n`;
    }

    if (overdueNotes.length > 0) {
      const noteAmount = overdueNotes.reduce((sum, note) => sum + note.amount, 0);
      totalOverdueAmount += noteAmount;

      body += `Vadesi Geçmiş ${overdueNotes.length} Senet:\n`;
      overdueNotes.forEach((note) => {
        const daysOverdue = Math.floor((today.getTime() - new Date(note.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        body += `- Senet No: ${note.noteNumber}, Tutar: ${formatCurrency(note.amount)}, Vade: ${formatDate(
          note.dueDate
        )}, ${daysOverdue} gün gecikmiş\n`;
      });
      body += `\nToplam Gecikmiş Senet Tutarı: ${formatCurrency(noteAmount)}\n\n`;
    }

    body += `\nGenel Toplam Vadesi Geçmiş Tutar: ${formatCurrency(totalOverdueAmount)}\n\n`;
    body += `Bu belgeler için acil işlem yapılması gerekmektedir.\n\n`;
    body += `Canary Digital - Muhasebe Sistemi`;

    const subject = `⚠️ Vadesi Geçmiş Belgeler: ${overdueChecks.length} Çek + ${overdueNotes.length} Senet`;

    await emailService.sendEmail({
      to: company.email,
      subject,
      text: body,
    });

    logger.info(`Sent overdue alert to ${company.email} for ${overdueChecks.length} checks and ${overdueNotes.length} notes`);
  } catch (error: any) {
    logger.error(`Error sending overdue alerts for company ${companyId}:`, error);
    throw error;
  }
};

/**
 * Run all reminder checks for a company
 */
export const runAllReminders = async (companyId: number) => {
  logger.info(`Running all reminders for company ${companyId}`);

  try {
    await sendCheckReminders(companyId);
  } catch (error: any) {
    logger.error(`Error sending check reminders:`, error);
  }

  try {
    await sendPromissoryNoteReminders(companyId);
  } catch (error: any) {
    logger.error(`Error sending promissory note reminders:`, error);
  }

  try {
    await sendOverdueAlerts(companyId);
  } catch (error: any) {
    logger.error(`Error sending overdue alerts:`, error);
  }

  logger.info(`Completed all reminders for company ${companyId}`);
};

/**
 * Run reminders for all active companies
 */
export const scheduleDailyReminders = async () => {
  logger.info('Starting daily reminder scheduler for all companies');

  try {
    // Get all companies
    const companies = await prisma.company.findMany({
      select: { id: true, name: true },
    });

    logger.info(`Found ${companies.length} companies to process`);

    for (const company of companies) {
      try {
        await runAllReminders(company.id);
      } catch (error: any) {
        logger.error(`Error processing reminders for company ${company.id} (${company.name}):`, error);
        // Continue with other companies
      }
    }

    logger.info('Completed daily reminder scheduler for all companies');
  } catch (error: any) {
    logger.error('Error in daily reminder scheduler:', error);
    throw error;
  }
};

/**
 * Helper functions
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('tr-TR');
}

export default {
  sendCheckReminders,
  sendPromissoryNoteReminders,
  sendOverdueAlerts,
  runAllReminders,
  scheduleDailyReminders,
};
