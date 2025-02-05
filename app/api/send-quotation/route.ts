import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipientEmail } = body;

    console.log('Starting email send process to:', recipientEmail);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Verify connection
    await transporter.verify();
    console.log('Email configuration verified');

    const info = await transporter.sendMail({
      from: `"Mwonto Consultants" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Quotation from Mwonto Consultants',
      html: `
        <h2>Quotation from Mwonto Consultants</h2>
        <p>Dear Sir/Madam,</p>
        <p>Please find attached your quotation.</p>
        <p>Best regards,<br>Mwonto Consultants</p>
      `,
      attachments: [{
        filename: 'quotation.pdf',
        path: body.quotationData.pdfPath,
        contentType: 'application/pdf'
      }]
    });

    console.log('Email sent successfully:', info.messageId);
    return NextResponse.json({ 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 