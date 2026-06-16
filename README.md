# FNNPay

Self-hosted, non-custodial payment processor for CKB, stablecoins, and RGB++ assets over Fiber.

## Docker quick start

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full guide.

```bash
cp .env.example .env          # edit secrets
./scripts/init-fnn-node.sh    # ensure FNN wallet key exists
cd docker && docker compose up -d --build
curl http://localhost:3001/health
```

## Vision

FNNPay is the **merchant layer** on top of [Fiber Network Node](https://www.fiber.world/): stores, invoices, checkout, webhooks, and dashboards — while merchants keep custody of funds via their own FNN.

## Roadmap (summary)

| Phase | Focus | Outcome |
|---|---|---|
| **0** | Validate the rail | Testnet invoices + WebSocket settlement proven |
| **1** | MVP processor | Single-merchant self-hosted checkout + webhooks |
| **2** | Production | Multi-tenant, on-chain fallback, stable API |
| **3** | Apps | POS, pay button, WooCommerce, crowdfunding |
| **4** | Differentiators | Multi-asset UX, embedded FNN, CCH cross-chain |
