# CarbonPay

CarbonPay is an experimental full-stack platform that explores how carbon credits can be used as a consumer-level digital currency instead of being limited to corporate offset markets.

The core idea is simple: if individuals or communities own trees or forest land that actively sequester carbon dioxide, that environmental impact should be measurable, verifiable, and directly usable in everyday economic activity.

This project allows tree or land owners to register their trees on the platform and receive micro carbon credits, represented as digital tokens, based on verified carbon sequestration. Each token corresponds to a unit of CO2 removed from the atmosphere and is calculated using transparent and conservative assumptions. A buffer is applied to account for uncertainty and permanence risk.

Once tokens are minted, users can hold them in a wallet, retire (burn) them to offset emissions, or spend them in a demo marketplace that simulates purchasing daily-use products. This demonstrates how climate-positive actions could be directly rewarded and integrated into everyday financial behavior.

The current version focuses on clarity of system design and end-to-end flow validation. Blockchain interactions are mocked for the MVP to keep development fast and accessible, with a future roadmap that includes on-chain tokenization and registry-level verification.

This is an open-source learning and research project intended to explore new models of carbon markets, consumer participation in climate finance, and carbon-backed digital currencies.

---

## Features

- User registration and authentication
- Tree and land asset registration
- Admin-based verification workflow
- Carbon token calculation with buffer logic
- Wallet with token balance and transaction history
- Token spending in a demo marketplace
- Token retirement (burning) support

---

## Carbon Credit Model (MVP)

- 1 token = 1 kg CO2
- Average sequestration per tree (mocked): 20 kg CO2 per year
- Buffer applied: 20%
- Tokens are minted only after verification approval

This model is intentionally simplified for the MVP and will be refined with real-world methodologies in later phases.

---

## Tech Stack

Frontend:
- React

Backend:
- Node.js
- Express

Database:
- PostgreSQL

Storage:
- Cloud-based image storage for tree proof uploads

Blockchain:
- Mock token ledger (ERC-20 planned for future phase)

---

## Project Structure

carbonpay/
├── backend/
├── frontend/
├── docs/
├── README.md
└── LICENSE

---

## Disclaimer

This project is not a certified carbon market and does not issue legally recognized carbon credits. All calculations and verification flows are for demonstration and research purposes only.

---

