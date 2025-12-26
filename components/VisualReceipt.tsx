
import React from 'react';

interface ReceiptData {
    customerName: string;
    customerReference: string;
    invoiceNumber: string;
    receiptNumber: string;
    dateOfSale: string;
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    businessAddress: string;
    items: {
        description: string;
        price: number;
        quantity: number;
        taxRate: number;
        amount: number;
    }[];
    subtotal: number;
    totalTax: number;
    totalAmount: number;
    totalPaid: number;
    balanceDue: number;
    paymentMethod: string;
    currency: string;
}

interface VisualReceiptProps {
    data: ReceiptData;
    type: 'Invoice' | 'Receipt';
    template: string;
}

const generateItemsTableHTML = (items: ReceiptData['items'], currency: string) => {
    const header = `<thead style="border-bottom: 2px solid #111; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280;"><tr style="text-align: left;"><th style="padding: 0.75rem;">Description</th><th style="padding: 0.75rem; text-align: right;">Amount</th></tr></thead>`;
    const rows = items.map(item => `
        <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 1rem 0.75rem; font-weight: 700;">${item.description}</td>
            <td style="padding: 1rem 0.75rem; text-align: right; font-weight: 700;">${currency}${item.price.toFixed(2)}</td>
        </tr>
    `).join('');
    return `<table style="width: 100%; border-collapse: collapse;">${header}<tbody>${rows}</tbody></table>`;
};

const VisualReceipt: React.FC<VisualReceiptProps> = ({ data, type, template }) => {
    if (!template) {
        return <div className="p-12 text-center text-red-500">Template not found for {type}. Please configure it in Settings.</div>;
    }

    const itemsTable = generateItemsTableHTML(data.items, data.currency);
    const processedHtml = template
        .replace(/{{customerName}}/g, data.customerName)
        .replace(/{{customerReference}}/g, data.customerReference)
        .replace(/{{invoiceNumber}}/g, data.invoiceNumber)
        .replace(/{{receiptNumber}}/g, data.receiptNumber)
        .replace(/{{dateOfSale}}/g, data.dateOfSale)
        .replace(/{{businessName}}/g, data.businessName)
        .replace(/{{businessEmail}}/g, data.businessEmail)
        .replace(/{{businessPhone}}/g, data.businessPhone)
        .replace(/{{businessAddress}}/g, data.businessAddress)
        .replace(/{{items_html_table}}/g, itemsTable)
        .replace(/{{subtotal}}/g, data.subtotal.toFixed(2))
        .replace(/{{taxRate}}/g, (data.items[0]?.taxRate || 0).toString())
        .replace(/{{totalTax}}/g, data.totalTax.toFixed(2))
        .replace(/{{totalAmount}}/g, data.totalAmount.toFixed(2))
        .replace(/{{totalPaid}}/g, data.totalPaid.toFixed(2))
        .replace(/{{balanceDue}}/g, data.balanceDue.toFixed(2))
        .replace(/{{paymentMethod}}/g, data.paymentMethod)
        .replace(/{{currency}}/g, data.currency);

    return (
        <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
    );
};

export default VisualReceipt;
