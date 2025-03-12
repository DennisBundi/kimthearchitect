"use client";

import { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import React from "react";
import { receiptService } from "@/services/receiptService";
import { supabase } from "@/lib/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ReceiptItem {
  quantity: string;
  description: string;
  amount: string;
  cents: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentReceiptNumber?: number;
}

export const ReceiptModal = ({
  isOpen,
  onClose,
  currentReceiptNumber = 0,
}: ReceiptModalProps) => {
  const [items, setItems] = useState([
    {
      quantity: "",
      description: "",
      amount: "0",
      cents: "00",
    },
  ]);
  const [msValue, setMsValue] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [name, setName] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Define calculateTotal at the beginning of the component
  const calculateTotal = () => {
    const amountInputs = document.querySelectorAll('input[name="amount"]');
    let total = 0;

    amountInputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      const value = parseFloat(inputElement.value || "0");
      if (!isNaN(value)) {
        total += value;
      }
    });

    return total;
  };

  // Setup amount listeners
  useEffect(() => {
    if (isOpen) {
      const amountInputs = document.querySelectorAll('input[name="amount"]');
      amountInputs.forEach((input) => {
        input.addEventListener("input", () => {
          const totalAmount = calculateTotal();
          const totalElement = document.querySelector(".total-amount-value");
          if (totalElement) {
            totalElement.textContent = `ksh ${totalAmount.toLocaleString(
              "en-KE",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`;
          }
        });
      });
    }
  }, [isOpen]);

  const handleSaveReceipt = async () => {
    try {
      const supabase = createClientComponentClient();

      // Format items and ensure amounts are numbers
      const formattedItems = items.map((item) => ({
        quantity: item.quantity || "0",
        description: item.description || "",
        amount: parseFloat(item.amount.replace(/,/g, "")) || 0,
      }));

      // Calculate total amount
      const totalAmount = calculateTotal();

      // Simplified receipt data matching your schema
      const receiptData = {
        receipt_number: `RCP-${String(currentReceiptNumber).padStart(3, "0")}`,
        date: signatureDate || new Date().toISOString(),
        client_name: msValue,
        items: formattedItems,
        amount: totalAmount,
        status: "Completed",
        received_by: receivedBy,
        created_at: new Date().toISOString(),
      };

      console.log("Saving receipt with data:", receiptData);

      const { data, error } = await supabase
        .from("receipts")
        .insert([receiptData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Receipt saved successfully:", data);
      return data;
    } catch (error) {
      console.error("Error saving receipt:", error);
      throw error;
    }
  };

  const handleDownloadPDF2 = async () => {
    try {
      setIsGeneratingPDF(true);

      // First save to database
      console.log("Starting receipt save...");
      const savedReceipt = await handleSaveReceipt();
      console.log("Receipt saved successfully:", savedReceipt);

      if (!receiptRef.current) {
        throw new Error("Receipt content is not available.");
      }

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

      // Save the PDF
      console.log("Saving PDF...");
      pdf.save(`receipt-${currentReceiptNumber}.pdf`);
      console.log("PDF saved successfully");

      // Close modal after both operations succeed
      onClose();
    } catch (error) {
      console.error("Failed to process receipt:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process receipt. Please try again."
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const addNewRow = () => {
    setItems([
      ...items,
      { quantity: "", description: "", amount: "", cents: "" },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  const getTableItems = () => {
    const items: ReceiptItem[] = [];
    const rows = document.querySelectorAll("tr:not(:first-child)");

    rows.forEach((row) => {
      const quantity =
        (row.querySelector('input[name="quantity"]') as HTMLInputElement)
          ?.value || "";
      const description =
        (row.querySelector('input[name="description"]') as HTMLInputElement)
          ?.value || "";
      const amount = parseFloat(
        (row.querySelector('input[name="amount"]') as HTMLInputElement)
          ?.value || "0"
      );

      items.push({
        quantity,
        description,
        amount: amount.toString(),
        cents: "00",
      });
    });
    return items;
  };

  // Create a separate stylesheet for the receipt table
  const receiptTableStyles = `
    .receipt-table-container {
      width: 100%;
      padding: 20px;
    }

    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid black;
      table-layout: fixed;
    }

    .receipt-table thead tr th {
      border: 1px solid black;
      padding: 8px;
      background-color: white;
      font-weight: bold;
    }

    .receipt-table tbody tr td {
      border: 1px solid black;
      padding: 8px;
      position: relative;
    }

    .receipt-table th:first-child,
    .receipt-table td:first-child {
      width: 100px;
    }

    .receipt-table th:nth-child(2),
    .receipt-table td:nth-child(2) {
      width: auto;
    }

    .receipt-table th:nth-child(3),
    .receipt-table td:nth-child(3) {
      width: 120px;
    }

    .receipt-table th:last-child,
    .receipt-table td:last-child {
      width: 60px;
      text-align: center;
    }

    .receipt-table input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      padding: 0;
      margin: 0;
    }

    .receipt-table td input[name="amount"] {
    }

    .receipt-table .total-row td {
      border: 1px solid black;
      background-color: white;
    }

    .receipt-table .total-row td:nth-child(2) {
      text-align: right;
    }

    /* Updated Add Row Button styles */
    .add-row-button {
      color: #4169E1;
      background: none;
      border: none;
      padding: 8px;
      margin-top: 8px;
      cursor: pointer;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      text-decoration: underline;
    }

    .add-row-button:hover {
      color: #0000CD;
    }

    .add-row-button span {
      margin-left: 4px;
    }
  `;

  // Add styles in component
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = receiptTableStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[595px] max-h-[90vh] flex flex-col relative">
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div ref={receiptRef} className="bg-white p-8 m-4 modal-content">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img
                  src="/mainlogo.svg"
                  alt="Kimthearchitect Logo"
                  className="h-16 object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold text-[#1a237e] mb-4">
                KIMTHEARCHITECT LTD
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p>THE PREMIER NORTH PARK HUB, OFF EASTERN BYPASS</p>
                <p>P. O. BOX 51584– 00100, NAIROBI</p>
                <p>Cell: 0719 698 588</p>
                <p>Email: kimthearchitect0@gmail.com</p>
              </div>
            </div>

            {/* Receipt Label and Date */}
            <div className="flex justify-between items-center mb-6">
              <div className="inline-block">
                <div className="bg-[#1a237e] px-6 py-2 rounded">
                  <span className="text-white text-sm font-medium block text-center w-full">
                    RECEIPT
                  </span>
                </div>
              </div>
              <div className="text-[12px]">
                Date:{" "}
                <input type="date" className="border-b border-gray-400 ml-2" />
              </div>
            </div>

            {/* M/S Field */}
            <div className="mb-4 text-[12px] flex items-center">
              <span>M/S:</span>
              <input
                type="text"
                value={msValue}
                onChange={(e) => setMsValue(e.target.value)}
                className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
              />
            </div>

            {/* Table */}
            <div className="receipt-table-container">
              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>QUANTITY</th>
                    <th>DESCRIPTION</th>
                    <th>AMOUNT Kshs.</th>
                    <th>Cts.</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="description"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={item.amount}
                          onChange={(e) =>
                            handleItemChange(index, "amount", e.target.value)
                          }
                        />
                      </td>
                      <td>00</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={2}>E&O.E No. 006</td>
                    <td style={{ fontWeight: "bold" }}>
                      {calculateTotal().toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>00</td>
                  </tr>
                </tbody>
              </table>
              <button
                type="button"
                className="add-row-button"
                onClick={addNewRow}
              >
                + <span>Add New Row</span>
              </button>
            </div>

            {/* Footer */}
            <div className="text-[12px] space-y-4">
              <p>Account are due on demand.</p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span>Received by:</span>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <span>Date:</span>
                  <input
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    className="flex-1 ml-2 border-b border-gray-400 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col items-end mt-6">
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

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            className="bg-[#DBA463] text-white px-4 py-2 rounded-lg hover:bg-[#c28a4f] transition-colors"
            onClick={handleDownloadPDF2}
            disabled={isGeneratingPDF}
          >
            Download Receipt PDF
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
