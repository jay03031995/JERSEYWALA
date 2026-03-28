'use client'

import { Printer } from 'lucide-react'

interface PrintInvoiceProps {
  order: {
    id: string
    order_number: string
    created_at: string
    status: string
    payment_status: string
    payment_reference?: string
    subtotal: number
    shipping_cost: number
    discount_amount: number
    total: number
    shipping_address: {
      full_name?: string
      phone?: string
      address_line1?: string
      address_line2?: string
      city?: string
      state?: string
      postal_code?: string
    }
    items: {
      id: string
      product_name: string
      player_name?: string
      size: string
      quantity: number
      unit_price: number
      total_price: number
    }[]
  }
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export default function PrintInvoice({ order }: PrintInvoiceProps) {
  const handlePrint = () => {
    const addr = order.shipping_address
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

    const rows = order.items.map((item) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
          ${item.product_name}${item.player_name ? ` · ${item.player_name}` : ''}<br/>
          <small style="color:#6b7280;">Size: ${item.size} · Qty: ${item.quantity}</small>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(item.unit_price)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${fmt(item.total_price)}</td>
      </tr>
    `).join('')

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${order.order_number}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color:#111; font-size:13px; padding:40px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; padding-bottom:20px; border-bottom:2px solid #e8191c; }
    .brand { display:flex; align-items:center; gap:12px; }
    .brand-icon { width:44px; height:44px; background:#e8191c; border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:14px; letter-spacing:2px; }
    .brand-name { font-size:20px; font-weight:800; }
    .brand-sub { font-size:11px; color:#6b7280; margin-top:2px; }
    .invoice-meta { text-align:right; }
    .invoice-title { font-size:22px; font-weight:800; color:#e8191c; }
    .invoice-num { font-size:13px; color:#6b7280; margin-top:4px; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:28px; }
    .card { background:#f9fafb; padding:16px; border-radius:8px; }
    .card-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#9ca3af; margin-bottom:8px; }
    .card-value { font-size:13px; line-height:1.6; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    thead { background:#f3f4f6; }
    th { padding:10px 12px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#6b7280; }
    th:last-child, td:last-child { text-align:right; }
    .totals { margin-left:auto; width:260px; }
    .totals table { margin-bottom:0; }
    .totals td { padding:5px 12px; border:none; }
    .total-row td { font-weight:800; font-size:16px; padding-top:10px; border-top:2px solid #111; }
    .footer { margin-top:36px; padding-top:16px; border-top:1px solid #e5e7eb; text-align:center; font-size:11px; color:#9ca3af; }
    .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .paid { background:#d1fae5; color:#065f46; }
    .pending-pay { background:#fef3c7; color:#92400e; }
    @media print {
      body { padding:20px; }
      .no-print { display:none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-icon">JW</div>
      <div>
        <div class="brand-name">The Jersey Wala</div>
        <div class="brand-sub">jerseywala.com · support@jerseywala.com</div>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-num">${order.order_number}</div>
      <div style="margin-top:6px;font-size:12px;color:#6b7280;">Date: ${date}</div>
      <div style="margin-top:4px;">
        <span class="badge ${order.payment_status === 'paid' ? 'paid' : 'pending-pay'}">
          ${order.payment_status.toUpperCase()}
        </span>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Bill To</div>
      <div class="card-value">
        <strong>${addr.full_name ?? '—'}</strong><br/>
        ${addr.phone ?? ''}<br/>
        ${addr.address_line1 ?? ''}${addr.address_line2 ? ', ' + addr.address_line2 : ''}<br/>
        ${addr.city ?? ''}, ${addr.state ?? ''} – ${addr.postal_code ?? ''}
      </div>
    </div>
    <div class="card">
      <div class="card-label">Order Details</div>
      <div class="card-value">
        <strong>Order #:</strong> ${order.order_number}<br/>
        <strong>Status:</strong> ${order.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}<br/>
        ${order.payment_reference ? `<strong>Payment Ref:</strong> ${order.payment_reference}<br/>` : ''}
        <strong>Date:</strong> ${date}
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td style="color:#6b7280;">Subtotal</td>
        <td style="text-align:right;">${fmt(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="color:#6b7280;">Shipping</td>
        <td style="text-align:right;">${order.shipping_cost === 0 ? 'FREE' : fmt(order.shipping_cost)}</td>
      </tr>
      ${order.discount_amount > 0 ? `
      <tr>
        <td style="color:#059669;">Discount</td>
        <td style="text-align:right;color:#059669;">−${fmt(order.discount_amount)}</td>
      </tr>` : ''}
      <tr class="total-row">
        <td>Total</td>
        <td style="text-align:right;">${fmt(order.total)}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    Thank you for shopping with The Jersey Wala! &nbsp;·&nbsp; This is a computer-generated invoice. &nbsp;·&nbsp; support@jerseywala.com
  </div>
</body>
</html>`

    const win = window.open('', '_blank', 'width=800,height=900')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 w-full py-2.5 rounded-xl text-[13px] font-medium transition-opacity hover:opacity-80"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        color: 'var(--fg-muted)',
        fontFamily: 'var(--font-inter)',
      }}
    >
      <Printer size={14} />
      Print Invoice
    </button>
  )
}
