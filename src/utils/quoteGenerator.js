import jsPDF from 'jspdf';
import { CURRENCIES } from './currencies';

const checkPageOverflow = (doc, yPos, margin = 30) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (yPos > pageHeight - margin) {
    doc.addPage();
    return 20;
  }
  return yPos;
};

const fetchLogoAsDataUrl = async () => {
  const response = await fetch('/linkedin-logo.png');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateQuotePDF = async (dealState, settings) => {
  const { customer, pricing, term } = dealState;
  const currencyCode = settings?.currency || 'USD';
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Helper functions
  const formatCurrency = (amountUSD) => {
    if (amountUSD === undefined || amountUSD === null) return '$0';
    const converted = amountUSD * currency.rate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(converted);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Generate quote number
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  const quoteNumber = `Q-${year}-${seq}`;
  const quoteDate = new Date();
  const validUntil = new Date(quoteDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  let yPos = 20;

  // Header with LinkedIn blue bar
  doc.setFillColor(10, 102, 194);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Add LinkedIn logo to top-left of header
  let logoLoaded = false;
  try {
    const logoDataUrl = await fetchLogoAsDataUrl();
    doc.addImage(logoDataUrl, 'PNG', 8, 4, 27, 27);
    logoLoaded = true;
  } catch (e) {
    console.error('Failed to load LinkedIn logo for PDF:', e);
  }

  // Company name in header (shifted right if logo loaded)
  const textX = logoLoaded ? 40 : 20;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LinkedIn', textX, 22);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Enterprise Program Quote', textX, 30);

  yPos = 50;

  // Quote details section
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Quote Details', 20, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Quote Number: ${quoteNumber}`, 20, yPos);
  doc.text(`Date: ${formatDate(quoteDate)}`, pageWidth - 70, yPos);

  yPos += 6;
  doc.text(`Valid Until: ${formatDate(validUntil)}`, 20, yPos);
  doc.text(`Currency: ${currency.code}`, pageWidth - 70, yPos);

  yPos += 15;

  // Customer Information
  doc.setTextColor(10, 102, 194);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Prepared For', 20, yPos);

  yPos += 8;
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(11);
  doc.text(customer?.name || 'Customer Name', 20, yPos);

  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  if (customer?.employees) {
    doc.text(`${customer.employees.toLocaleString()} employees`, 20, yPos);
    yPos += 5;
  }
  if (customer?.segment) {
    doc.text(`Segment: ${customer.segment}`, 20, yPos);
    yPos += 5;
  }
  if (customer?.industry) {
    doc.text(`Industry: ${customer.industry}`, 20, yPos);
    yPos += 5;
  }

  yPos += 15;

  // Products Section
  doc.setTextColor(10, 102, 194);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Products & Services', 20, yPos);

  yPos += 10;

  // Table header
  doc.setFillColor(10, 102, 194);
  doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Product', 25, yPos);
  doc.text('Qty', 110, yPos);
  doc.text('Unit Price', 130, yPos);
  doc.text('Total', 165, yPos);

  yPos += 10;

  // Table rows
  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'normal');

  if (pricing?.lineItems && pricing.lineItems.length > 0) {
    pricing.lineItems.forEach((item, index) => {
      yPos = checkPageOverflow(doc, yPos);
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
      }
      doc.setTextColor(51, 51, 51);
      doc.text(item.name || '', 25, yPos);
      doc.text(String(item.quantity || 0), 110, yPos);
      doc.text(formatCurrency(item.unitPrice), 130, yPos);
      doc.text(formatCurrency(item.lineTotal), 165, yPos);
      yPos += 10;
    });
  }

  yPos += 10;
  yPos = checkPageOverflow(doc, yPos);

  // Pricing Summary
  doc.setTextColor(10, 102, 194);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Pricing Summary', 20, yPos);

  yPos += 10;
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal (List Price)', 25, yPos);
  doc.text(formatCurrency(pricing?.subtotal || 0), 165, yPos);
  yPos += 8;
  yPos = checkPageOverflow(doc, yPos);

  if (pricing?.discounts?.volume?.amount > 0) {
    doc.setTextColor(34, 139, 34);
    doc.text('Volume Discount', 25, yPos);
    doc.text(`-${formatCurrency(pricing.discounts.volume.amount)}`, 165, yPos);
    yPos += 8;
    yPos = checkPageOverflow(doc, yPos);
  }

  if (pricing?.discounts?.bundle?.amount > 0) {
    doc.setTextColor(34, 139, 34);
    doc.text(`Bundle Discount (${(pricing.discounts.bundle.rate * 100).toFixed(0)}%)`, 25, yPos);
    doc.text(`-${formatCurrency(pricing.discounts.bundle.amount)}`, 165, yPos);
    yPos += 8;
    yPos = checkPageOverflow(doc, yPos);
  }

  if (pricing?.discounts?.term?.amount > 0) {
    doc.setTextColor(34, 139, 34);
    doc.text(`Multi-Year Discount (${term}yr)`, 25, yPos);
    doc.text(`-${formatCurrency(pricing.discounts.term.amount)}`, 165, yPos);
    yPos += 8;
    yPos = checkPageOverflow(doc, yPos);
  }

  if (pricing?.discounts?.special?.length > 0) {
    pricing.discounts.special.forEach(sd => {
      doc.setTextColor(34, 139, 34);
      doc.setFont('helvetica', 'normal');
      doc.text(`${sd.name} (${(sd.rate * 100).toFixed(0)}%)`, 25, yPos);
      doc.text(`-${formatCurrency(sd.amount)}`, 165, yPos);
      yPos += 8;
      yPos = checkPageOverflow(doc, yPos);
    });
  }

  if (pricing?.totalDiscountRate > 0) {
    doc.setTextColor(34, 139, 34);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Discount (${(pricing.totalDiscountRate * 100).toFixed(1)}%)`, 25, yPos);
    doc.text(`-${formatCurrency(pricing.totalDiscount)}`, 165, yPos);
    yPos += 12;
    yPos = checkPageOverflow(doc, yPos);
  }

  // Final pricing box
  yPos += 5;
  doc.setFillColor(238, 243, 248);
  doc.roundedRect(20, yPos, pageWidth - 40, term > 1 ? 30 : 20, 3, 3, 'F');

  yPos += 12;
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Annual Contract Value (ACV)', 30, yPos);
  doc.setTextColor(10, 102, 194);
  doc.setFontSize(14);
  doc.text(formatCurrency(pricing?.finalACV || 0), pageWidth - 30, yPos, { align: 'right' });

  if (term > 1) {
    yPos += 12;
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(11);
    doc.text(`Total Contract Value (${term} years)`, 30, yPos);
    doc.setTextColor(10, 102, 194);
    doc.setFontSize(14);
    doc.text(formatCurrency(pricing?.finalTCV || 0), pageWidth - 30, yPos, { align: 'right' });
  }

  yPos += 25;

  // Contract Terms
  yPos = checkPageOverflow(doc, yPos, 50);
  doc.setTextColor(10, 102, 194);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Contract Terms', 20, yPos);

  yPos += 8;
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contract Duration: ${term || 1} year${(term || 1) > 1 ? 's' : ''}`, 20, yPos);
  yPos += 5;
  doc.text('Payment Terms: Net 30', 20, yPos);
  yPos += 5;
  doc.text('This quote is subject to LinkedIn Enterprise Program Terms and Conditions.', 20, yPos);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(10, 102, 194);
  doc.setLineWidth(0.5);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.text('sales@linkedin.com', 20, footerY);
  doc.text('(650) 687-3600', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Confidential', pageWidth - 20, footerY, { align: 'right' });

  // Save the PDF
  const customerName = customer?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'Quote';
  const fileName = `${customerName}_${quoteNumber}.pdf`;
  doc.save(fileName);

  return fileName;
};
