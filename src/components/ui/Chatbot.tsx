'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'

interface Message {
  id: number
  from: 'bot' | 'user'
  text: string
}

const QUICK_REPLIES = [
  'Track my order',
  'Search jerseys',
  'Shipping time?',
  'Return policy',
  'Size guide',
  'Payment methods',
]

const BOT_RESPONSES: { patterns: RegExp[]; reply: string }[] = [
  {
    patterns: [/ship/i, /deliver/i, /how long/i, /days/i],
    reply: '📦 We deliver across India in **5–7 business days**. Orders above ₹999 get **FREE shipping** — otherwise a flat ₹99 fee applies.',
  },
  {
    patterns: [/return/i, /refund/i, /exchange/i],
    reply: '🔄 We accept returns within **7 days** of delivery for unused items in original packaging. Contact us at support@jerseywala.com and we\'ll process your refund within 5–7 business days.',
  },
  {
    patterns: [/size/i, /fit/i, /chart/i, /small/i, /large/i, /xl/i],
    reply: '📏 **Size Guide:**\n- S → Chest 36–38"\n- M → Chest 38–40"\n- L → Chest 40–42"\n- XL → Chest 42–44"\n- XXL → Chest 44–46"\n\nWhen in doubt, go one size up — jerseys run a little snug!',
  },
  {
    patterns: [/pay/i, /payment/i, /upi/i, /card/i, /wallet/i, /razorpay/i],
    reply: '💳 We accept **UPI, Credit/Debit Cards, Net Banking, and Wallets** via Razorpay — India\'s most trusted payment gateway. All transactions are 256-bit SSL secured.',
  },
  {
    patterns: [/track/i, /order status/i, /where is my/i, /where.*order/i],
    reply: '🔍 Sure! Share your **order number** (e.g. JW-00001) and I\'ll look it up for you right now.',
  },
  {
    patterns: [/custom/i, /name/i, /number/i, /personaliz/i],
    reply: '🎨 Yes! You can add **custom player name & number** while selecting your jersey on the product page. We support all IPL and international teams.',
  },
  {
    patterns: [/ipl/i, /team/i, /mi\b/i, /csk/i, /rcb/i, /kkr/i],
    reply: '🏏 We carry jerseys for all **10 IPL 2026 teams** — MI, CSK, RCB, KKR, SRH, DC, PBKS, RR, GT, and LSG. Also stocked: international Test & ODI jerseys for India, England, Australia & more!',
  },
  {
    patterns: [/official/i, /replica/i, /original/i, /authentic/i, /edition/i],
    reply: '⭐ **Official jerseys** are match-grade with sublimation printing and authentic team badges. **Fan Edition** jerseys are premium replicas at a lower price. **Replica** is our budget-friendly option for casual fans.',
  },
  {
    patterns: [/cod/i, /cash/i, /on delivery/i],
    reply: '💵 Yes! We offer **Cash on Delivery** across India. Just select "Cash on Delivery" at checkout — pay when your jersey arrives!',
  },
  {
    patterns: [/search/i, /find/i, /look.*jersey/i, /jersey.*search/i],
    reply: '🔍 Sure! Tell me what you\'re looking for — e.g. "CSK jersey", "Dhoni jersey", "football Real Madrid" — and I\'ll search our store for you!',
  },
  {
    patterns: [/football/i, /soccer/i, /premier/i, /la liga/i, /bundesliga/i],
    reply: '⚽ We stock jerseys for all major leagues — **Premier League** (Man Utd, Liverpool, Arsenal, Chelsea), **La Liga** (Real Madrid, Barcelona), **Bundesliga**, **Ligue 1** and more. Plus national teams!',
  },
  {
    patterns: [/cricket/i, /india/i, /t20/i, /odi/i, /test/i],
    reply: '🏏 Our cricket range includes **India T20, ODI & Test jerseys** plus international teams like Australia, England, Pakistan, South Africa & more. Player name customization available!',
  },
  {
    patterns: [/hello/i, /hi\b/i, /hey/i, /help/i, /start/i],
    reply: '👋 Hey there! I\'m the Jersey Wala support bot. I can help with **shipping, returns, sizing, order tracking,** and more. What do you need?',
  },
]

const ORDER_PATTERN = /\b(JW[-–]?\d{4,}|SK[-–]?\d{4,}|\d{10,})\b/i
const SEARCH_PATTERN = /\b(csk|mi\b|rcb|kkr|srh|dc\b|pbks|rr\b|gt\b|lsg|mumbai|chennai|kolkata|delhi|punjab|rajasthan|sunrisers|gujarat|lucknow|dhoni|rohit|kohli|jadeja|football|cricket|ipl|jersey|replica|official|fan edition)\b/i
const DEFAULT_REPLY = "I'm not sure about that yet — but our team is here to help! Email us at **support@jerseywala.com** or try one of the quick options below."

function getBotReply(input: string): string {
  for (const { patterns, reply } of BOT_RESPONSES) {
    if (patterns.some((p) => p.test(input))) return reply
  }
  return DEFAULT_REPLY
}

function renderMarkdown(text: string) {
  const parts: React.ReactNode[] = []
  const lines = text.split('\n')
  lines.forEach((line, li) => {
    const segments = line.split(/\*\*(.+?)\*\*/g)
    const rendered = segments.map((seg, si) =>
      si % 2 === 1 ? <strong key={si}>{seg}</strong> : seg
    )
    parts.push(<span key={li}>{rendered}</span>)
    if (li < lines.length - 1) parts.push(<br key={`br${li}`} />)
  })
  return parts
}

let msgId = 0

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: ++msgId, from: 'bot', text: '👋 Hey! I\'m the Jersey Wala support bot. Ask me about shipping, sizing, returns, or share your order number to track it!' },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  const addBotMessage = (text: string) => {
    setMessages((m) => [...m, { id: ++msgId, from: 'bot', text }])
    setTyping(false)
    if (!open) setUnread((n) => n + 1)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: ++msgId, from: 'user', text: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)

    // Check if user provided an order number
    const orderMatch = text.match(ORDER_PATTERN)
    if (orderMatch) {
      const orderNum = orderMatch[1].toUpperCase().replace(/[-–]/, '-')
      const normalized = orderNum.startsWith('JW-') ? orderNum : `JW-${orderNum.replace(/^JW/i, '')}`
      try {
        const res = await fetch(`/api/chatbot/track?order=${encodeURIComponent(normalized)}`)
        if (res.ok) {
          const data = await res.json()
          const statusLabel = data.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
          let reply = `📦 **Order ${data.order_number}**\n\nStatus: **${statusLabel}**`
          if (data.tracking_number) reply += `\nTracking: **${data.tracking_number}**`
          if (data.shipped_at) reply += `\nShipped: ${new Date(data.shipped_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
          if (data.delivered_at) reply += `\nDelivered: ${new Date(data.delivered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
          if (data.status === 'pending' || data.status === 'confirmed') {
            reply += '\n\nYour order is being processed — we\'ll update you once it\'s shipped! 🚀'
          } else if (data.status === 'shipped' || data.status === 'out_for_delivery') {
            reply += '\n\nYour jersey is on its way! 🎉'
          } else if (data.status === 'delivered') {
            reply += '\n\nDelivered! Hope you love it. ⭐'
          }
          setTimeout(() => addBotMessage(reply), 700)
          return
        } else {
          setTimeout(() => addBotMessage(`❌ I couldn't find order **${normalized}**. Double-check the order number or email us at support@jerseywala.com.`), 700)
          return
        }
      } catch {
        // fall through to normal reply
      }
    }

    // Product search — if message looks like a product query
    const botReply = getBotReply(text)
    if (botReply === DEFAULT_REPLY && SEARCH_PATTERN.test(text)) {
      try {
        const res = await fetch(`/api/chatbot/search?q=${encodeURIComponent(text.trim())}`)
        if (res.ok) {
          const { products } = await res.json()
          if (products?.length > 0) {
            const list = products.slice(0, 4).map((p: { name: string; base_price: number; slug: string }) =>
              `• **${p.name}** — ₹${p.base_price} → [View](/shop/${p.slug})`
            ).join('\n')
            setTimeout(() => addBotMessage(`🔍 Found these jerseys for you:\n\n${list}`), 700)
            return
          }
        }
      } catch { /* fallthrough */ }
    }

    setTimeout(() => addBotMessage(botReply), 700)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Chat Window — right side */}
      {open && (
        <div
          className="fixed bottom-20 right-4 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: '340px',
            height: '500px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'var(--red)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <span className="text-white font-bold text-[10px]">JW</span>
              </div>
              <div>
                <p className="text-white font-bold text-[13px]" style={{ fontFamily: 'var(--font-inter)' }}>
                  JW Support
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                  <p className="text-white/70 text-[10px]" style={{ fontFamily: 'var(--font-inter)' }}>Online · Order tracking available</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)}>
              <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.8)' }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed"
                  style={{
                    background: msg.from === 'user' ? 'var(--red)' : 'var(--bg-raised)',
                    color: msg.from === 'user' ? '#fff' : 'var(--fg)',
                    fontFamily: 'var(--font-inter)',
                    borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-2.5 rounded-2xl"
                  style={{ background: 'var(--bg-raised)', borderRadius: '18px 18px 18px 4px' }}
                >
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: 'var(--fg-sub)',
                          animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div
            className="flex gap-1.5 px-3 py-2 overflow-x-auto shrink-0"
            style={{ borderTop: '1px solid var(--border)', scrollbarWidth: 'none' }}
          >
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr}
                onClick={() => sendMessage(qr)}
                className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg-muted)',
                  fontFamily: 'var(--font-inter)',
                  whiteSpace: 'nowrap',
                }}
              >
                {qr}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 shrink-0"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or enter order number…"
              className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                color: 'var(--fg)',
                fontFamily: 'var(--font-inter)',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--red)' }}
            >
              <Send size={13} style={{ color: '#fff' }} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle button — right side */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
        style={{ background: 'var(--red)', boxShadow: '0 4px 20px rgba(232,25,44,0.4)' }}
      >
        {open ? (
          <X size={20} style={{ color: '#fff' }} />
        ) : (
          <MessageCircle size={20} style={{ color: '#fff' }} />
        )}
        {!open && unread > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: 'var(--green)', color: '#000' }}
          >
            {unread}
          </span>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  )
}
