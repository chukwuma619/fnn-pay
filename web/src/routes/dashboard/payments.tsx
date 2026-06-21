import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/payments')({
  component: PaymentsPage,
})

function PaymentsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track settled and pending payments across your Fiber channels.
        </p>
      </section>
    </div>
  )
}
