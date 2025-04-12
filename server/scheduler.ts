import cron from 'node-cron';
import { db } from './db';
import { users, beneficiaries, executors, checkInResponses } from '../shared/schema';
import { eq, lt, and, isNull, sql } from 'drizzle-orm';
import { sendEmail, createWeeklyCheckInEmailTemplate } from './email';

/**
 * Send weekly check-in emails to users, beneficiaries, and executors
 */
async function sendWeeklyCheckInEmails() {
  try {
    console.log('Sending weekly check-in emails...');

    // Get all users who need a weekly check-in
    // Either they have never had a check-in or their next check-in is due
    const now = new Date();
    const usersToCheckIn = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isEmailVerified, true),
          sql`(${users.nextCheckInDue} IS NULL OR ${users.nextCheckInDue} < ${now})`
        )
      );

    for (const user of usersToCheckIn) {
      // Generate unique URLs for confirmation
      const userId = user.id;
      const userEmail = user.username;
      const userName = user.fullName || userEmail;
      
      // These would be actual URLs in a production environment
      // For now, we're using placeholders
      const confirmAliveUrl = `${process.env.CLIENT_URL}/check-in/confirm?userId=${userId}&alive=true&token=${generateCheckInToken(userId, true)}`;
      const reportDeathUrl = `${process.env.CLIENT_URL}/check-in/confirm?userId=${userId}&alive=false&token=${generateCheckInToken(userId, false)}`;

      // Send email to the user
      await sendEmail(
        userEmail,
        'WillTank Weekly Check-in',
        createWeeklyCheckInEmailTemplate(userName, confirmAliveUrl, reportDeathUrl)
      );

      // Get all beneficiaries for this user
      const userBeneficiaries = await db
        .select()
        .from(beneficiaries)
        .where(
          and(
            eq(beneficiaries.userId, userId),
            eq(beneficiaries.status, 'verified')
          )
        );

      // Send emails to beneficiaries
      for (const beneficiary of userBeneficiaries) {
        // Generate unique URLs for this beneficiary
        const beneficiaryConfirmAliveUrl = `${process.env.CLIENT_URL}/check-in/beneficiary/confirm?userId=${userId}&beneficiaryId=${beneficiary.id}&alive=true&token=${generateCheckInToken(userId, true, beneficiary.id)}`;
        const beneficiaryReportDeathUrl = `${process.env.CLIENT_URL}/check-in/beneficiary/confirm?userId=${userId}&beneficiaryId=${beneficiary.id}&alive=false&token=${generateCheckInToken(userId, false, beneficiary.id)}`;

        await sendEmail(
          beneficiary.email,
          `Check-in for ${userName}'s Will on WillTank`,
          createWeeklyCheckInEmailTemplate(userName, beneficiaryConfirmAliveUrl, beneficiaryReportDeathUrl)
        );
      }

      // Get all executors for this user
      const userExecutors = await db
        .select()
        .from(executors)
        .where(
          and(
            eq(executors.userId, userId),
            eq(executors.status, 'verified')
          )
        );

      // Send emails to executors
      for (const executor of userExecutors) {
        // Generate unique URLs for this executor
        const executorConfirmAliveUrl = `${process.env.CLIENT_URL}/check-in/executor/confirm?userId=${userId}&executorId=${executor.id}&alive=true&token=${generateCheckInToken(userId, true, undefined, executor.id)}`;
        const executorReportDeathUrl = `${process.env.CLIENT_URL}/check-in/executor/confirm?userId=${userId}&executorId=${executor.id}&alive=false&token=${generateCheckInToken(userId, false, undefined, executor.id)}`;

        await sendEmail(
          executor.email,
          `Check-in for ${userName}'s Will on WillTank`,
          createWeeklyCheckInEmailTemplate(userName, executorConfirmAliveUrl, executorReportDeathUrl)
        );
      }

      // Update the user's last check-in and next check-in due dates
      const nextCheckInDue = new Date();
      nextCheckInDue.setDate(nextCheckInDue.getDate() + 7); // Next check-in in 7 days

      await db
        .update(users)
        .set({
          lastCheckIn: now,
          nextCheckInDue: nextCheckInDue,
          updatedAt: now
        })
        .where(eq(users.id, userId));
    }

    console.log(`Weekly check-in emails sent to ${usersToCheckIn.length} users`);
  } catch (error) {
    console.error('Error sending weekly check-in emails:', error);
  }
}

/**
 * Generate a secure token for check-in confirmation
 */
function generateCheckInToken(userId: number, isAlive: boolean, beneficiaryId?: number, executorId?: number): string {
  // In a production environment, this would use a more secure method like JWT
  // For now, we're using a simple string concatenation
  const data = {
    userId,
    isAlive,
    beneficiaryId,
    executorId,
    timestamp: Date.now()
  };
  
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Initialize the scheduler for weekly tasks
 */
export function initializeScheduler() {
  // Schedule weekly check-in emails to run every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', () => {
    sendWeeklyCheckInEmails();
  });

  console.log('Scheduler initialized');
}

// Function to manually trigger check-in emails (for testing)
export async function triggerCheckInEmails() {
  await sendWeeklyCheckInEmails();
}