# Insights-UI (KoalaGains)

KoalaGains is an AI-powered financial insights and stock analysis platform that democratizes investment research. It provides deep value investing insights, industry analysis, tariff impact reports, and global market coverage previously available only to institutional investors.

## Features

- **Stock Analysis & Research** - Fundamental analysis with intrinsic value calculations, industry comparisons, and AI-powered insights
- **Market Intelligence** - Daily top movers, industry reports, tariff impact analysis, and portfolio management tools
- **AI-Powered Reports** - Automated company and industry research reports generated via OpenAI, Google GenAI, and LangChain
- **Global Market Coverage** - Support for major exchanges across Americas, Europe, Asia-Pacific, and Middle East/Africa (NYSE, NASDAQ, LSE, TSE, HKEX, NSE/BSE, and more)
- **Financial Blog & Content** - Expert analysis, market commentary, and educational resources

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) 15 (App Router, Turbopack)
- **Language**: TypeScript
- **UI**: React 18, Tailwind CSS, Radix UI, Headless UI, Framer Motion
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io) ORM
- **Authentication**: NextAuth.js
- **AI/ML**: OpenAI, Google GenAI, LangChain
- **Data Visualization**: Chart.js, D3.js, react-d3-tree
- **Financial Data**: yahoo-finance2
- **Cloud**: AWS (Lambda, S3), Vercel
- **Analytics**: Microsoft Clarity, LogRocket

## Prerequisites

- Node.js >= 23.11.0
- PostgreSQL database
- Yarn (monorepo uses Yarn workspaces)
- API keys for AI providers and data services

## Getting Started

1. **Install dependencies** (from the monorepo root):

   ```bash
   yarn install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Configure database URL, API keys, and other required variables
   ```

3. **Set up the database**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Start dev server with Turbopack |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn lint-fix` | Auto-fix lint issues |
| `yarn prettier-check` | Check formatting |
| `yarn prettier-fix` | Auto-fix formatting |

## Project Structure

This project is part of the [DoDAO UI monorepo](../). It uses shared packages from `@dodao/web-core` and follows the conventions documented in `docs/ai-knowledge/`.
