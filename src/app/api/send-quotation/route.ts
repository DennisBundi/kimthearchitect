import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import type { TransportOptions } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

export async function POST(request: Request) {
  try {
    const { email, quotationUrl, projectTitle, recipientName } = await request.json()

    // Create transporter with explicit types
    const transportConfig: SMTPTransport.Options = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    }

    const transporter = nodemailer.createTransport(transportConfig)

    // Send email with typed options
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Quotation: ${projectTitle}`,
      html: `
        <p>Dear ${recipientName},</p>
        <p>Please find attached the quotation for ${projectTitle}.</p>
        <p>You can view the quotation <a href="${quotationUrl}">here</a>.</p>
        <p>Best regards,<br>Mwonto Consultants</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 