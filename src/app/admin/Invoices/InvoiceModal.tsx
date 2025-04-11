"use client";

import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { invoiceService } from "@/services/invoiceService";
import { InvoiceItem, Invoice, InvoiceStatus } from "@/types/invoice";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoiceNumber?: number;
}

export const InvoiceModal = ({
  isOpen,
  onClose,
  currentInvoiceNumber = 0,
}: InvoiceModalProps) => {
  const [invoiceNumber, setInvoiceNumber] = useState(
    (currentInvoiceNumber + 1).toString().padStart(3, "0")
  );

  const [items, setItems] = useState<InvoiceItem[]>([
    { quantity: "", description: "", amount: "", cents: "" },
    { quantity: "", description: "", amount: "", cents: "" },
  ]);

  const [total, setTotal] = useState({ amount: "0", cents: "00" });
  const [receivedBy, setReceivedBy] = useState("");
  const [name, setName] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [msValue, setMsValue] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Calculate total whenever items change
  useEffect(() => {
    const calculateTotal = () => {
      let totalAmount = 0;
      let totalCents = 0;

      items.forEach((item) => {
        // Convert amount and cents to numbers, default to 0 if empty or invalid
        const amount = parseFloat(item.amount) || 0;
        const cents = parseInt(item.cents) || 0;

        totalAmount += amount;
        totalCents += cents;
      });

      // Handle cents overflow
      if (totalCents >= 100) {
        totalAmount += Math.floor(totalCents / 100);
        totalCents = totalCents % 100;
      }

      setTotal({
        amount: totalAmount.toString(),
        cents: totalCents.toString().padStart(2, "0"),
      });
    };

    calculateTotal();
  }, [items]);

  // Update invoice number when currentInvoiceNumber changes
  useEffect(() => {
    setInvoiceNumber((currentInvoiceNumber + 1).toString().padStart(3, "0"));
  }, [currentInvoiceNumber]);

  const addNewRow = () => {
    setItems([
      ...items,
      { quantity: "", description: "", amount: "", cents: "" },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const amount = parseFloat(item.amount) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      return total + amount * quantity;
    }, 0);
  };

  const handleSaveInvoice = async () => {
    try {
      const supabase = createClientComponentClient();

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session found");

      // Format the date properly
      const formattedDate = new Date(signatureDate).toISOString();

      // Format items and ensure amounts are numbers
      const formattedItems = items
        .filter((item) => item.quantity || item.description || item.amount) // Only include non-empty items
        .map((item) => ({
          quantity: parseInt(item.quantity) || 0,
          description: item.description || "",
          amount: parseFloat(item.amount.replace(/,/g, "")) || 0,
          cents: parseInt(item.cents) || 0,
        }));

      // Calculate total amount including cents
      const totalAmount = formattedItems.reduce((sum, item) => {
        const itemAmount = item.amount;
        const itemQuantity = item.quantity;
        return sum + itemAmount * itemQuantity;
      }, 0);

      const invoiceData = {
        invoice_number: `INV-${invoiceNumber}`,
        date: formattedDate,
        client_name: name || "",
        received_by: receivedBy || "",
        items: formattedItems,
        amount: totalAmount,
        total_amount: totalAmount,
        status: "pending" as InvoiceStatus,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      };

      console.log("Saving invoice with data:", invoiceData);

      const { data, error } = await supabase
        .from("invoices")
        .insert([invoiceData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Invoice saved successfully:", data);
      return data;
    } catch (error) {
      console.error("Error saving invoice:", error);
      throw error;
    }
  };

  const handleDownloadPDF2 = async () => {
    try {
      setIsGeneratingPDF(true);

      // First try to save to database
      console.log("Starting invoice save...");
      const savedInvoice = await handleSaveInvoice();
      console.log("Invoice saved successfully:", savedInvoice);

      // Then generate and download PDF
      console.log("Starting PDF generation...");

      // Make sure we're selecting the correct content
      const modalContent = document.querySelector(
        ".modal-content"
      ) as HTMLDivElement;
      if (!modalContent) {
        throw new Error("Could not find modal content");
      }

      // Create a deep clone of the content
      const clone = modalContent.cloneNode(true) as HTMLDivElement;

      // Convert all inputs to spans with their values
      clone.querySelectorAll("input").forEach((input: HTMLInputElement) => {
        const span = document.createElement("span");
        span.textContent = input.value;
        span.style.width = "100%";
        span.style.display = "inline-block";
        input.parentNode?.replaceChild(span, input);
      });

      // Style the clone for PDF
      clone.style.width = "210mm";
      clone.style.padding = "20mm";
      clone.style.backgroundColor = "white";
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.zIndex = "-9999";

      // Update the signature image in the clone
      const signatureImg = clone.querySelector(
        'img[alt="Signature"]'
      ) as HTMLImageElement;
      if (signatureImg) {
        const newSignature = new Image();
        newSignature.src = "/signature.jpeg";
        newSignature.alt = "Signature";
        newSignature.className = signatureImg.className;
        // Replace the old image with the new one
        signatureImg.parentNode?.replaceChild(newSignature, signatureImg);

        // Wait for the image to load
        await new Promise((resolve) => {
          newSignature.onload = resolve;
        });
      }

      // Hide buttons and unnecessary elements in clone
      const buttonsToHide = clone.querySelectorAll(
        "button, .action-button, .close-button"
      );
      buttonsToHide.forEach(
        (button) => ((button as HTMLElement).style.display = "none")
      );

      // Add clone to body
      document.body.appendChild(clone);

      // Wait for everything to render
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
        imageTimeout: 5000, // Increased timeout for images
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add image to PDF with proper dimensions
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, "", "FAST");
      // pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Save the PDF
      console.log("Saving PDF...");
      pdf.save(`invoice-${Date.now()}.pdf`);
      console.log("PDF saved successfully");

      // Close modal after both operations succeed
      onClose();
    } catch (error) {
      console.error("Failed to process invoice:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process invoice. Please try again."
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[595px] max-h-[90vh] flex flex-col relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div ref={invoiceRef} className="bg-white p-8 m-4 modal-content">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img
                  src="/mainlogo.svg"
                  alt="Kimthearchitect Logo"
                  className="h-20 object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold text-[#1a237e] mb-4">
                Kimthearchitect LTD
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>THE PREMIER NORTH PARK HUB, OFF EASTERN BYPASS</p>
                <p>P. O. BOX 51584– 00100, NAIROBI</p>
                <p>Cell: 0719 698 588</p>
                <p>Email: Kimthearchitect0@gmail.com</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="inline-block">
                <div className="bg-[#1a237e] px-6 py-2 rounded">
                  <span className="text-white text-sm font-medium block text-center w-full">
                    INVOICE
                  </span>
                </div>
              </div>
              <div className="text-[12px]">
                <div className="flex items-center gap-2">
                  <span>Date:</span>
                  <input
                    type="text"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="border-b border-gray-300 focus:outline-none px-2"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 text-[12px]">
              <div className="flex items-center">
                <span>M/S:</span>
                <input
                  type="text"
                  value={msValue}
                  onChange={(e) => setMsValue(e.target.value)}
                  className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
                />
              </div>
            </div>

            <table className="w-full border border-gray-400 text-[12px] mb-4">
              <thead>
                <tr>
                  <th className="border border-gray-400 p-2 w-20">QUANTITY</th>
                  <th className="border border-gray-400 p-2">DESCRIPTION</th>
                  <th className="border border-gray-400 p-2 w-24">
                    AMOUNT
                    <br />
                    Kshs.
                  </th>
                  <th className="border border-gray-400 p-2 w-16">Cts.</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="h-8">
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.amount}
                        onChange={(e) =>
                          updateItem(index, "amount", e.target.value)
                        }
                      />
                    </td>
                    <td className="border border-gray-400 p-2">
                      <input
                        type="text"
                        className="w-full outline-none"
                        value={item.cents}
                        onChange={(e) =>
                          updateItem(index, "cents", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                ))}
                <tr className="add-row-button">
                  <td colSpan={4} className="border border-gray-400 p-2">
                    <button
                      onClick={addNewRow}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add New Row
                    </button>
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    className="text-right border border-gray-400 p-2"
                  >
                    <span className="mr-4">E&O.E</span>
                    <span>No. {invoiceNumber}</span>
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-bold">
                    {total.amount}
                  </td>
                  <td className="border border-gray-400 p-2 text-right font-bold">
                    {total.cents}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-[12px] space-y-4">
              <p>Account are due on demand.</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span>Received by:</span>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <span>Name:</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <span>Date:</span>
                  <input
                    type="text"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col items-end mt-6 signature-section">
                  <img
                    src="/signature.jpeg"
                    alt="Signature"
                    className="h-16 object-contain mb-2"
                  />
                  <p>Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 p-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleDownloadPDF2}
            disabled={isGeneratingPDF}
            className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#c28a4f] transition-colors disabled:opacity-50"
          >
            {isGeneratingPDF ? "Generating PDF..." : "Download PDF"}
          </button>
          <button
            onClick={onClose}
            disabled={isGeneratingPDF}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
