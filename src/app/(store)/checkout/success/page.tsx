import PaymentResult from '@/components/checkout/PaymentResult'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>
}) {
  const params = await searchParams

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <PaymentResult
        cashfreeOrderId={params.order_id}
      />
    </div>
  )
}
