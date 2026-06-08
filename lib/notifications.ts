// src/lib/notifications.ts
import prisma from '@/lib/prisma'
import nodemailer from 'nodemailer'

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface CreateNotificationParams {
  userId: string
  tenantId: string
  type: 'IN_APP' | 'EMAIL' | 'SMS'
  title: string
  body: string
  link?: string
  metadata?: any
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      tenantId: params.tenantId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      metadata: params.metadata || {},
    },
  })
}

export async function sendEmailNotification(params: {
  to: string
  subject: string
  html: string
}) {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@safeguard-platform.com',
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export async function notifyDSLOnCriticalConcern(params: {
  tenantId: string
  concernId: string
  studentName: string
  riskLevel: string
  category: string
}) {
  const dsls = await prisma.user.findMany({
    where: {
      tenantId: params.tenantId,
      role: { in: ['DSL', 'DEPUTY_DSL'] },
      isActive: true,
    },
  })

  for (const dsl of dsls) {
    await createNotification({
      userId: dsl.id,
      tenantId: params.tenantId,
      type: 'IN_APP',
      title: '🚨 Critical Safeguarding Concern',
      body: `A ${params.riskLevel} risk ${params.category} concern has been raised for ${params.studentName}. Immediate attention required.`,
      link: `/safeguarding/${params.concernId}`,
      metadata: { concernId: params.concernId },
    })

    if (dsl.notificationPrefs?.emailAlerts) {
      await sendEmailNotification({
        to: dsl.email,
        subject: `[URGENT] Critical Safeguarding Concern - ${params.studentName}`,
        html: `
          <h2>Critical Safeguarding Alert</h2>
          <p>A critical safeguarding concern has been raised.</p>
          <ul>
            <li><strong>Student:</strong> ${params.studentName}</li>
            <li><strong>Risk Level:</strong> ${params.riskLevel}</li>
            <li><strong>Category:</strong> ${params.category}</li>
          </ul>
          <p>Please review immediately.</p>
          <a href="${process.env.NEXT_PUBLIC_URL}/safeguarding/${params.concernId}">
            View Concern
          </a>
        `,
      })
    }
  }
}

export async function sendDigestNotifications() {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      notificationPrefs2: {
        some: {
          type: 'DIGEST',
          digest: true,
        },
      },
    },
    include: {
      notificationPrefs2: true,
    },
  })

  for (const user of users) {
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })

    if (unreadNotifications > 0) {
      await sendEmailNotification({
        to: user.email,
        subject: `Daily Digest - ${unreadNotifications} Unread Notifications`,
        html: `<p>You have ${unreadNotifications} unread notifications. Please check your dashboard.</p>`,
      })
    }
  }
}
