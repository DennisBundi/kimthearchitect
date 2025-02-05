import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface QuotationData {
  salutation: string;
  recipientName?: string;
  reference: string;
  date: string;
  totalAmount: number;
  tasks: Array<{
    task: string;
    professional: string;
    feeBreakdown: number;
    duration: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received data for PDF:', body);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawText('MWONTO CONSULTANTS & CONSTRUCTION LOGISTICS.', {
      x: 50,
      y: height - 50,
      size: 16,
      font,
      color: rgb(1, 0, 0),
    });

    // Address and Contact
    page.drawText('KILIMANI ROAD PLAZA, KILIMANI RD, OFF', {
      x: 50,
      y: height - 80,
      size: 12,
      font,
    });

    page.drawText('MENELIK RD. P. O. BOX 51584– 00100, NAIROBI.', {
      x: 50,
      y: height - 100,
      size: 12,
      font,
    });

    page.drawText('Cell: 0719698588. Email: mwontologistics@gmail.com', {
      x: 50,
      y: height - 120,
      size: 12,
      font,
    });

    // Date
    page.drawText(`Date: ${body.date}`, {
      x: 50,
      y: height - 150,
      size: 12,
      font,
    });

    // Reference
    page.drawText(`RE: ${body.reference}`, {
      x: 50,
      y: height - 180,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // Salutation - Make sure this section is included
    const salutationText = `Dear ${body.salutation}${body.recipientName ? ' ' + body.recipientName : ''},`;
    page.drawText(salutationText, {
      x: 50,
      y: height - 220,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });

    // NB Section (if provided)
    if (body.nb) {
      page.drawText('NB/', {
        x: 50,
        y: height - 250,
        size: 12,
        font,
      });
      page.drawText(body.nb, {
        x: 50,
        y: height - 270,
        size: 12,
        font,
      });
    }

    // Table Headers
    const tableY = height - 300;
    page.drawText('TASK', { x: 50, y: tableY, size: 12, font });
    page.drawText('PROFESSIONAL', { x: 200, y: tableY, size: 12, font });
    page.drawText('FEE BREAKDOWN', { x: 350, y: tableY, size: 12, font });
    page.drawText('DURATION', { x: 500, y: tableY, size: 12, font });

    // Table Content
    if (body.tasks && body.tasks.length > 0) {
      body.tasks.forEach((task: { task: string; professional: string; feeBreakdown: any; duration: string; }, index: number) => {
        const y = tableY - (30 * (index + 1));
        page.drawText(task.task, { x: 50, y, size: 12, font });
        page.drawText(task.professional, { x: 200, y, size: 12, font });
        page.drawText(`KSH ${task.feeBreakdown}`, { x: 350, y, size: 12, font });
        page.drawText(task.duration, { x: 500, y, size: 12, font });
      });
    }

    // Total Amount
    const totalY = tableY - (30 * (body.tasks?.length + 2));
    page.drawText(`TOTAL AMOUNT: KSH ${body.totalAmount}`, {
      x: 50,
      y: totalY,
      size: 12,
      font,
    });

    // Signature
    const signatureY = totalY - 100;
    page.drawText('Yours Sincerely,', {
      x: 50,
      y: signatureY,
      size: 12,
      font,
    });
    page.drawText('Arch.N.K. KIMATHI', {
      x: 50,
      y: signatureY - 20,
      size: 12,
      font,
    });
    page.drawText('Director Mwonto consultants & construction logistics.', {
      x: 50,
      y: signatureY - 40,
      size: 12,
      font,
    });

    const pdfBytes = await pdfDoc.save();

    // Add debug log to see what data is being sent
    console.log('PDF generated with data:', {
      salutation: body.salutation,
      recipientName: body.recipientName,
      reference: body.reference,
      date: body.date,
      tasks: body.tasks,
      totalAmount: body.totalAmount
    });

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${Date.now()}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 