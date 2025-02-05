const sendQuotation = async (recipientEmail, quotationData) => {
  try {
    // First generate/save the PDF
    const pdfResponse = await fetch('/api/quotations/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quotationData)
    });

    if (!pdfResponse.ok) {
      throw new Error('Failed to generate PDF');
    }

    const { pdfId } = await pdfResponse.json();

    // Then send the email with the PDF
    const sendResponse = await fetch('/api/quotations/send-quotation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientEmail,
        quotationData,
        pdfId
      })
    });

    if (!sendResponse.ok) {
      const errorData = await sendResponse.json();
      throw new Error(errorData.error || 'Failed to send quotation');
    }

    return await sendResponse.json();
  } catch (error) {
    console.error('Error sending quotation:', error);
    throw error;
  }
};

const handleSendQuotation = async (e) => {
  e.preventDefault();
  const sendButton = document.querySelector('#sendButton');
  
  try {
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    
    await sendQuotation(recipientEmail, quotationData);
    alert('Quotation sent successfully!');
  } catch (error) {
    console.error('Failed to send quotation:', error);
    alert('Failed to send quotation. Please try again.');
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = 'Send';
  }
}; 