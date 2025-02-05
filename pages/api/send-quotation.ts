import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

interface QuotationRequest {
  recipientEmail: string;
  quotationData: {
    pdfPath: string;
    reference: string;
    date: string;
    totalAmount: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('1. Starting API handler');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Log the incoming request body
    console.log('2. Request body:', JSON.stringify(req.body, null, 2));

    // Check environment variables
    console.log('3. Checking environment variables:', {
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASSWORD
    });

    // Create transporter with more detailed logging
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      logger: true,
      debug: true
    });

    console.log('4. Transporter created');

    // Test the connection
    try {
      await transporter.verify();
      console.log('5. Email configuration verified successfully');
    } catch (verifyError) {
      console.error('5. Email verification failed:', verifyError);
      throw verifyError;
    }

    const { recipientEmail } = req.body;

    // Attempt to send email
    console.log('6. Attempting to send email to:', recipientEmail);

    const info = await transporter.sendMail({
      from: `"Mwonto Consultants" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: 'Test Email from Mwonto Consultants',
      text: 'This is a test email to verify the email sending functionality.',
      html: '<p>This is a test email to verify the email sending functionality.</p>'
    });

    console.log('7. Email sent successfully:', info.messageId);
    return res.status(200).json({ 
      message: 'Email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('ERROR in send-quotation:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return res.status(500).json({ 
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 