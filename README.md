# Assure Code - Compliance Automation Platform

Assure Code is a microservices-based SaaS platform designed to automate regulatory compliance for software specifications. It leverages AI (RAG) to monitor regulations (GDPR, SOC 2, etc.) and automatically update technical specifications via GitHub Pull Requests.

## Architecture

The project follows a **Monorepo** structure with the following key components:

### 1. Apps
- **Web (`apps/web`)**: Customer-facing Next.js dashboard for workspace management, specification viewing, and billing.
- **Admin (`apps/admin`)**: Internal Next.js dashboard for system monitoring, queue management, and health checks.

### 2. Services
- **API Gateway (`services/api-gateway`)**: NestJS application acting as the central backend. Handles Auth, billing, and orchestrates the automation logic.
- **Draft Engine (`services/draft-engine`)**: Python/Flask service utilizing Google Gemini for generating compliant specification drafts.
- **Scanner Service (`services/scanner-service`)**: Python/Flask service using OpenAI to validate drafts against a "Gold Standard" threshold.
- **Orchestrator (`services/orchestrator`)**: Go service handling high-throughput event routing via Kafka.

### 3. Infrastructure
- **Database**: PostgreSQL with `pgvector` extension (via Supabase) for RAG capability.
- **Messaging**: Kafka (cross-service events) and Redis (BullMQ for background jobs).

## Installation & Setup

### Prerequisites
- Docker & Docker Compose
- Node.js v18+
- Python 3.10+
- Go 1.21+

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Architect/full-stack-app.git
   cd full-stack-app
   ```

2. **Environment Setup**
   Create `.env` files in `services/api-gateway`, `services/draft-engine`, and `services/scanner-service` based on their requirements (API Keys for OpenAI, Stripe, etc.).

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   This will start Postgres, Redis, Kafka, Zookeeper, and the API Gateway.

4. **Access the Applications**
   - API Gateway: `http://localhost:4000`
   - Customer App: (Run `cd apps/web && npm run dev`) -> `http://localhost:3000`
   - Admin App: (Run `cd apps/admin && npm run dev`) -> `http://localhost:3001`

## Deployment

The system is designed for containerized deployment (Kubernetes/ECS). Ensure `pgvector` is enabled on your production database.

## API Documentation

The API Gateway exposes Swagger documentation at `http://localhost:4000/api/docs`.