import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/webhooks')({
  component: WebhooksPage,
})

function WebhooksPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-4">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Webhooks</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure endpoints to receive invoice and payment events.
        </p>
      </section>
    </div>
  )
}
