const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
}

router.post('/send-quotation', async (req, res) => {
  try {
    const { recipientEmail, quotationData } = req.body;
    
    console.log('Attempting to send email to:', recipientEmail);
    console.log('Using sender email:', process.env.EMAIL_USER);

    // Create transporter with more detailed configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,      // Your Gmail address (mwontologistics@gmail.com)
        pass: process.env.EMAIL_PASSWORD   // The app password we generated earlier
      },
      debug: true // Enable debugging
    });

    // Verify connection
    await transporter.verify();
    console.log('Transporter verified successfully');

    // Send mail
    const info = await transporter.sendMail({
      from: `"Mwonto Consultants" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,  // The recipient's email (dr.kimath12@gmail.com)
      subject: 'Quotation from Mwonto Consultants',
      text: 'Please find attached your quotation.',
      html: `
        <h2>Quotation from Mwonto Consultants</h2>
        <p>Dear Sir/Madam,</p>
        <p>Please find attached your quotation.</p>
        <p>Best regards,<br>Mwonto Consultants</p>
      `,
      attachments: [{
        filename: 'quotation.pdf',
        path: quotationData.pdfPath,
        contentType: 'application/pdf'
      }]
    });

    console.log('Email sent successfully:', info.messageId);
    res.status(200).json({ message: 'Quotation sent successfully' });

  } catch (error) {
    console.error('Detailed email error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// Add this test endpoint
router.post('/test-email', async (req, res) => {
  try {
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

    // Test email without attachment
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself as a test
      subject: 'Test Email',
      text: 'If you receive this, the email configuration is working.'
    });

    res.status(200).json({ 
      message: 'Test email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message,
      code: error.code
    });
  }
}); 