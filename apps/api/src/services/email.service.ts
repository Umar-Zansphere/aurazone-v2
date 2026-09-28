import { Queue, Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// Queue for emails
export const emailQueue = new Queue<EmailPayload>('emailQueue', {
  connection: { host: new URL(env.REDIS_URL).hostname, port: Number(new URL(env.REDIS_URL).port), password: new URL(env.REDIS_URL).password || undefined },
});

// Worker to process emails
export const emailWorker = new Worker<EmailPayload>(
  'emailQueue',
  async (job: Job<EmailPayload>) => {
    try {
      const { to, subject, html } = job.data;
      const info = await transporter.sendMail({
        from: `"AuraZone" <${process.env.SMTP_FROM || 'noreply@aurazone.com'}>`,
        to,
        subject,
        html,
      });
      console.log(`Email sent to ${to}: ${info.messageId}`);
    } catch (error) {
      console.error(`Failed to send email to ${job.data.to}`, error);
      throw error;
    }
  },
  {
    connection: { host: new URL(env.REDIS_URL).hostname, port: Number(new URL(env.REDIS_URL).port), password: new URL(env.REDIS_URL).password || undefined },
    concurrency: 5,
  }
);

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

export const EmailService = {
  async sendOrderConfirmation(email: string, orderNumber: string, totalAmount: number) {
    await emailQueue.add('orderConfirmation', {
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>${orderNumber}</strong> has been received.</p>
        <p>Total Amount: â‚¹${totalAmount}</p>
        <p>We'll notify you when it ships.</p>
      `,
    });
  },

  async sendOrderStatusUpdate(email: string, orderNumber: string, status: string) {
    await emailQueue.add('orderStatusUpdate', {
      to: email,
      subject: `Order Status Update - ${orderNumber}`,
      html: `
        <h1>Order Update</h1>
        <p>Your order <strong>${orderNumber}</strong> is now: <strong>${status}</strong>.</p>
      `,
    });
  }
};