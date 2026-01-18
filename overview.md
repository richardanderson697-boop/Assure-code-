# ASSURE CODE A Compliance - Complete Application Architecture

## Application Components Overview

### 1. **Customer-Facing Application** (Primary Product)
The main SaaS platform where CTOs and legal teams interact with the system.

#### Features:
- **User Authentication & Workspace Management**
  - Sign up / Login with MFA
  - Workspace creation and team invitations
  - Role-based access control (Owner, Admin, Editor, Viewer)
  
- **Specification Generation Interface**
  - Text input for project requirements
  - File upload (PDF, TXT, MD, DOCX - max 10MB)
  - Real-time processing status
  - Preview generated specifications
  
- **Specification Management Dashboard**
  - List all specifications in workspace
  - Version control and history
  - Export options (JSON, CSV, OpenAPI)
  - Compliance status indicators
  
- **GitHub Integration**
  - OAuth connection flow
  - Repository selection
  - Auto-push settings configuration
  - Pull request creation for compliance updates
  
- **Billing & Subscription**
  - Plan selection (Free, Pro, Enterprise)
  - Stripe Checkout integration
  - Subscription management
  - Usage tracking

- **Notifications Center**
  - Regulatory update alerts
  - Specification auto-update notifications
  - Team activity feed

---

### 2. **Admin Dashboard** (Internal Tool) ✅ Already Created
The internal monitoring and testing interface for operations team.

#### Features:
- RAG performance testing and evaluation
- User management and analytics
- Operations cost tracking
- Specification monitoring across all users
- System health metrics

---

### 3. **Backend API Architecture**

#### Core Services:

**Authentication Service**
- User registration and login
- MFA token validation
- Session management
- OAuth integrations (GitHub, Google)

**Specification Engine Service**
- File upload handling and malware scanning
- RAG pipeline orchestration
- LLM API integration (OpenAI/Anthropic)
- Vector database queries
- Specification generation and templating

**Regulatory Monitor Service**
- Web scraping for legal updates
- Change detection algorithms
- Specification impact analysis
- Auto-regeneration triggers

**GitHub Integration Service**
- OAuth token management
- Repository API calls
- Pull request creation
- Action file generation

**Billing Service**
- Stripe webhook handling
- Subscription state management
- Usage metering
- Invoice generation

**Notification Service**
- Email notifications (via SendGrid/Resend)
- In-app notifications
- Webhook delivery to user systems

---

## Database Architecture with Supabase

### Why Supabase for Railway?

**Supabase is ideal because:**
- ✅ **Portable**: Can run anywhere (self-hosted on Railway or use Supabase cloud)
- ✅ **PostgreSQL-based**: Full SQL database with pgvector for RAG
- ✅ **Built-in Auth**: Handles authentication, MFA, OAuth out of the box
- ✅ **Real-time subscriptions**: For live updates in the UI
- ✅ **Row-Level Security**: Perfect for multi-tenant workspaces
