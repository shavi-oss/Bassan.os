# Software Requirements Specification (SRS)
# Bassan.os Enterprise Edition v3.1
SRS_Bassan_OS_Workflow_Orchestration_Platform.md
---

## Document Control

| Attribute | Value |
|-----------|-------|
| **Document Title** | Software Requirements Specification - Bassan.os Enterprise Edition v3.1 |
| **Version** | 3.1 |
| **Status** | Draft - For Review |
| **Date** | 2026-01-08 |
| **Author** | System Architecture Team & Enterprise Business Analysts |
| **Approval** | Pending Architecture Board Review |
| **Next Review** | 2026-02-08 |
| **Document Type** | Software Requirements Specification (IEEE 830-1998 Standard) |

## Version History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 2.2 | 2026-01-08 | Original Bassan.os Enterprise Edition | CTO |
| 3.0 | 2026-01-08 | Integrated with Bassan ERP AI & Omnichannel Features | Architecture Team |
| 3.1 | 2026-01-08 | Enhanced with AI Studio, Theme System, Subscription Management, and Enterprise SaaS Features | Architecture Team |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Features (Detailed)](#5-system-features-detailed)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the **Bassan.os Enterprise Edition v3.0**, a cloud-native, AI-powered ERP & CRM platform that integrates traditional enterprise resource planning capabilities with modern AI-driven conversational interfaces and omnichannel communication capabilities.

**Integration Scope**: This document integrates the comprehensive Bassan.os Enterprise Edition v2.2 platform (56 user stories, 76 database entities, 22 business requirements) with Bassan ERP features (AI Agents, Omnichannel Communication, Enhanced CRM capabilities).

### 1.2 Scope

This SRS covers:

**Core ERP & CRM Modules**:
- Sales & CRM (Lead Management, Pipeline, Opportunities, Quotes, Activities)
- Marketing (Campaigns, Content Management, Asset Library, Attribution, Budget)
- Operations (Workflow Engine, Task Management, SLA Tracking, Resource Allocation, Quality Control)
- Finance (Invoices, Payments, Budget Planning, Commission Calculation, Financial Reporting)
- HR & People (Employee Management, Performance Tracking, Training, Skills, Compensation)
- Customer Support (Ticket Management, Knowledge Base, SLA Monitoring, Customer Health Scoring)
- Projects (Project Planning, Task Assignment, Milestone Tracking, Progress Reporting)
- Purchase & Procurement (Purchase Orders, Vendor Management, Price Tracking) - Optional

**AI-Powered Features (Bassan ERP Integration)**:
- Bassan Bot (AI-powered Lead Capture from website visitors, 24/7 availability, location detection, local dialect support)
- WhatsApp Bot (Conversational AI with context awareness, memory, audio message support)
- AI Studio (Visual Bot Builder, Conversation Flow Designer, Bot Configuration, Knowledge Base Integration)
- AI-driven Lead Qualification
- Automated Conversation Handling
- Human-in-the-Loop Handoff

**Omnichannel Communication (Bassan ERP Integration)**:
- Email Integration (send/receive, threading, templates)
- WhatsApp Business API Integration
- Instagram Messaging (automation, lead capture, engagement)
- Facebook Messenger Automation (automated responses, lead qualification, personalized messaging)
- Web Chat Widget (embedded website chat)
- Unified Conversation Management
- Channel Normalization

**Supporting Infrastructure**:
- Multi-tenancy (Complete tenant isolation)
- Identity & Access Management (RBAC, Permissions, Sessions)
- Theme System (Light Mode / Dark Mode, Purple Theme, User Preferences)
- Workflow Automation (No-code workflow designer, Conditional routing, Exception handling)
- Analytics & Reporting (Real-time dashboards, KPI tracking, Custom reports, Data visualization)
- Integration Hub (Webhook management, API gateway, Third-party integrations)
- Event-Driven Architecture (Event bus, Event sourcing, Transactional outbox)
- Subscription & Billing Management (Subscription lifecycle, billing cycles, payment processing)
- Usage Quotas & Rate Limiting (Per-tenant quotas, API rate limiting, resource management)
- Data Export & Import System (Full data export, selective export, migration tools)
- Customer Onboarding & Training (Guided onboarding, in-app training, knowledge base)
- Tenant Self-Service Portal (Subscription management, billing portal, usage dashboard)
- Tenant Health & Success Metrics (Health scoring, churn prediction, success indicators)
- Tenant Performance Monitoring (Performance metrics, SLA tracking, capacity planning)

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **SRS** | Software Requirements Specification |
| **ERP** | Enterprise Resource Planning |
| **CRM** | Customer Relationship Management |
| **AI** | Artificial Intelligence |
| **SLA** | Service Level Agreement |
| **KPI** | Key Performance Indicator |
| **RBAC** | Role-Based Access Control |
| **API** | Application Programming Interface |
| **PWA** | Progressive Web Application |
| **SaaS** | Software as a Service |
| **REST** | Representational State Transfer |
| **GraphQL** | Graph Query Language |
| **WebSocket** | Web Socket Protocol |
| **JWT** | JSON Web Token |
| **OAuth 2.0** | OAuth 2.0 Authorization Framework |
| **RLS** | Row-Level Security |
| **CLS** | Continuation Local Storage |
| **JSON** | JavaScript Object Notation |
| **PDF** | Portable Document Format |
| **CSV** | Comma-Separated Values |
| **HTML** | HyperText Markup Language |
| **CSS** | Cascading Style Sheets |
| **HTTP/HTTPS** | Hypertext Transfer Protocol (Secure) |
| **TCP/IP** | Transmission Control Protocol/Internet Protocol |
| **SQL** | Structured Query Language |
| **NoSQL** | Not Only SQL |
| **ORM** | Object-Relational Mapping |
| **CRUD** | Create, Read, Update, Delete |
| **CQRS** | Command Query Responsibility Segregation |
| **CDC** | Change Data Capture |
| **DLQ** | Dead Letter Queue |
| **SLA** | Service Level Agreement |
| **RTO** | Recovery Time Objective |
| **RPO** | Recovery Point Objective |
| **GDPR** | General Data Protection Regulation |
| **CCPA** | California Consumer Privacy Act |
| **SOC 2** | System and Organization Controls 2 |
| **ISO 27001** | International Organization for Standardization 27001 |
| **WCAG** | Web Content Accessibility Guidelines |
| **UI** | User Interface |
| **UX** | User Experience |
| **BRD** | Business Requirements Document |
| **ERD** | Entity Relationship Diagram |
| **ADR** | Architecture Decision Record |
| **MVP** | Minimum Viable Product |

### 1.4 References

**Bassan.os Documentation**:
- Bassan.os Business Requirements Document v2.2 (Generated/1_Business_Requirements_Document.md)
- Bassan.os Personas & User Stories v2.2 (Generated/2_Personas_and_User_Stories.md)
- Bassan.os User Stories Catalog v2.2 (Generated/3_User_Stories_Catalog.md)
- Bassan.os Database ERD v2.2 (Generated/4_Database_ERD.md)
- Bassan.os Technical Architecture v2.2 (Generated/5_Technical_Architecture.md)
- Bassan.os Deep Design Hardening v2.2 (Generated/6_Deep_Design_Hardening.md)
- Bassan.os API Specifications v2.2 (Generated/7_API_Specifications.md)
- Bassan.os Deployment Architecture v2.2 (Generated/8_Deployment_Architecture.md)

**External References**:
- Bassan ERP Product Documentation
- OpenAI API Documentation (https://platform.openai.com/docs)
- WhatsApp Business API Documentation (https://developers.facebook.com/docs/whatsapp)
- PostgreSQL Documentation (https://www.postgresql.org/docs/)
- Prisma Documentation (https://www.prisma.io/docs/)
- NestJS Documentation (https://docs.nestjs.com/)
- Next.js Documentation (https://nextjs.org/docs)
- IEEE 830-1998 Standard for Software Requirements Specifications
- ISO/IEC/IEEE 29148:2018 Systems and software engineering — Life cycle processes — Requirements engineering

### 1.5 Overview

This document is organized into seven major sections:

1. **Introduction**: Purpose, scope, definitions, references, overview
2. **Overall Description**: Product perspective, functions, user characteristics, constraints, assumptions
3. **System Features**: High-level feature overview organized by functional area
4. **External Interface Requirements**: User interfaces, hardware, software, communication interfaces
5. **System Features (Detailed)**: Detailed functional requirements with inputs, outputs, processing, error handling
6. **Non-Functional Requirements**: Performance, security, reliability, usability, maintainability, portability
7. **Appendices**: Glossary, data models, API examples, user stories reference, architecture diagrams

---

## 2. Overall Description

### 2.1 Product Perspective

Bassan.os Enterprise Edition v3.0 is a **cloud-native, multi-tenant SaaS platform** that combines:

- **Traditional ERP capabilities** (Sales, Operations, Finance, HR, Projects, Purchase)
- **Modern CRM features** (Lead management, Pipeline tracking, Opportunity management, Quote generation)
- **AI-powered automation** (Conversational bots, Lead capture, Context-aware responses)
- **Omnichannel communication** (Email, WhatsApp, Instagram, Web Chat)

**System Context**:
┌─────────────────────────────────────────────────────────────┐
│ External Systems │
│ OpenAI API | WhatsApp API | Email SMTP | Payment Gateways │
└────────────────────┬────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Bassan.os Enterprise Edition v3.0 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Client │ │ API │ │ Integration│ │
│ │ Layer │ │ Gateway │ │ Hub │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Business │ │ AI │ │ Omnichannel│ │
│ │ Services │ │ Services │ │ Services │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Data │ │ Event │ │ Cache │ │
│ │ Layer │ │ Bus │ │ Layer │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ Infrastructure & External Services │
│ PostgreSQL | Redis | Object Storage | Vector DB (future) │
└─────────────────────────────────────────────────────────────┘

**System Boundaries**:
- **In Scope**: All modules listed in Section 1.2
- **Out of Scope**: Payment processing (payment gateway integration only), Payroll execution (calculation only), Social media hosting (integration only)

### 2.2 Product Functions

The system provides the following major functional areas:

#### 2.2.1 Identity & Access Management
- Multi-tenant organization management
- User registration, authentication, and authorization
- Role-based access control (RBAC) with granular permissions
- Session management (JWT tokens, refresh tokens)
- Password management (reset, complexity rules)
- Multi-factor authentication (optional, planned)

#### 2.2.2 Sales & CRM
- Lead management (CRUD, assignment, qualification, conversion)
- Opportunity management (pipeline stages, probability, value tracking)
- Quote generation (templates, PDF, e-signature integration)
- Activity logging (calls, emails, meetings, tasks)
- Commission calculation (automated, rule-based)
- Sales forecasting (weighted pipeline, revenue predictions)
- Pipeline visualization (kanban, drag-and-drop)

#### 2.2.3 AI Agents & Automation (Bassan ERP Integration)
- **Bassan Bot**: AI-powered lead capture from website visitors
  - Natural language understanding
  - Lead information extraction
  - Contextual follow-up questions
  - Automatic lead creation in CRM
  - Multi-language support (Arabic, English)
  - 24/7 availability
- **WhatsApp Bot**: Conversational AI for WhatsApp Business
  - Natural language conversation
  - Context awareness (conversation history)
  - Lead qualification
  - Appointment scheduling
  - Information retrieval
  - Human handoff capability

#### 2.2.4 Omnichannel Communication (Bassan ERP Integration)
- Email integration (send/receive, threading, templates)
- WhatsApp Business API integration
- Instagram messaging (planned)
- Web chat widget (embedded website chat)
- Unified conversation view (all channels in one interface)
- Channel normalization (standardized message format)
- Message routing (automated assignment)

#### 2.2.5 Marketing Management
- Campaign management (multi-channel, budget tracking, ROI measurement)
- Content management (calendar, approval workflows, version control)
- Asset library (searchable, taggable, version-controlled)
- Attribution tracking (multi-touch attribution models)
- Budget management (real-time tracking, alerts, forecasting)
- A/B testing (variant testing, statistical significance)

#### 2.2.6 Operations Management
- Workflow engine (drag-and-drop designer, no-code configuration)
- Task management (assignment, tracking, completion, evidence)
- SLA management (definition, monitoring, escalation)
- Resource allocation (capacity planning, skills matching, load balancing)
- Quality control (inspections, defect tracking, corrective actions)
- Exception handling (structured escalation paths)

#### 2.2.7 Projects Management
- Project planning (creation, scheduling, resource allocation)
- Task assignment to projects
- Milestone tracking
- Progress reporting
- Resource allocation across projects

#### 2.2.8 Customer Support
- Ticket management (creation, assignment, tracking, resolution)
- SLA monitoring (response time, resolution time, breach alerts)
- Knowledge base (articles, search, self-service portal)
- Customer health scoring (usage, tickets, payments, engagement)
- Multi-channel support integration (email, WhatsApp, chat)

#### 2.2.9 Finance Management
- Invoice management (generation, PDF, sending, tracking)
- Payment tracking (receipt, reconciliation, aging reports)
- Budget planning (allocation, variance tracking, forecasting)
- Commission calculation (automated, rule-based, audit trail)
- Financial reporting (P&L, Balance Sheet, custom reports)

#### 2.2.10 HR & People
- Employee management (profiles, roles, departments)
- Performance tracking (reviews, goals, KPIs)
- Training programs (scheduling, attendance, completion)
- Skills management (inventory, assessment, gap analysis)
- Compensation tracking (salaries, commissions, bonuses)

#### 2.2.11 Purchase & Procurement (Optional)
- Purchase order management
- Vendor management
- Price tracking and comparison
- Purchase requisition workflow

#### 2.2.12 Analytics & Reporting
- Real-time dashboards (customizable, role-based)
- KPI tracking (goals, targets, progress)
- Custom reports (ad-hoc, scheduled, export)
- Data visualization (charts, graphs, tables)
- Export capabilities (PDF, CSV, Excel)

#### 2.2.13 Integration Hub
- Webhook management (configuration, monitoring, retry)
- API gateway (authentication, rate limiting, routing)
- Third-party integrations (e-commerce, accounting, messaging)
- Data synchronization (bidirectional, conflict resolution)

### 2.3 User Characteristics

#### 2.3.1 Sales Users

**Sales Manager (S-01)**:
- **Role**: Team leadership, pipeline oversight, forecasting
- **Technical Expertise**: Intermediate (comfortable with dashboards and reports)
- **Goals**: Team Revenue >$1M/qtr, Pipeline Accuracy >90%, Win Rate >25%
- **Pain Points**: Lack of pipeline visibility, Manual forecasting, Inconsistent follow-up
- **System Usage**: Daily dashboard review, Pipeline analysis, Team performance monitoring, Forecast generation

**Sales Representative (S-02)**:
- **Role**: Lead management, opportunity pursuit, quote generation
- **Technical Expertise**: Basic to Intermediate
- **Goals**: Quota Achievement >100%, Lead Response <1hr, Deal Velocity <30 days
- **Pain Points**: Admin overload, Disconnected tools, Manual entry
- **System Usage**: Daily lead management, Activity logging, Quote generation, Mobile access

**Sales Operations Specialist (S-03)**:
- **Role**: Data quality, lead routing, commission calculation, reporting
- **Technical Expertise**: Advanced (comfortable with configuration and admin tools)
- **Goals**: Data quality >98%, Process adherence >95%, Tool adoption 100%
- **Pain Points**: Dirty data, Manual reporting, Territory disputes
- **System Usage**: Admin console, Territory management, Commission engine, Report builder

#### 2.3.2 Marketing Users

**Marketing Manager (M-01)**:
- **Role**: Campaign strategy, budget management, ROI measurement
- **Technical Expertise**: Intermediate
- **Goals**: Campaign ROI >300%, Cost per Lead <$50, Conversion Rate >15%, Budget Adherence ±5%
- **Pain Points**: Poor attribution, Slow execution, Unclear sales impact
- **System Usage**: Campaign dashboard, Budget manager, ROI calculator, Analytics

**Marketing Specialist (M-02)**:
- **Role**: Campaign execution, content creation, evidence submission
- **Technical Expertise**: Basic
- **Goals**: Task Delivery 95%+, Content Quality >8/10, Evidence Submission 100%
- **Pain Points**: No visibility after handoff, Manual reporting
- **System Usage**: Task dashboard, Content creator, Evidence upload

**Content Manager (M-03)**:
- **Role**: Content strategy, approval workflows, asset library management
- **Technical Expertise**: Intermediate
- **Goals**: Engagement Rate >5%, Production Adherence 90%+, Reuse Rate >30%
- **Pain Points**: Content silos, Version chaos, Approval delays
- **System Usage**: Content calendar, Asset library, Approval workflow

**Digital Analyst (M-04)**:
- **Role**: Data analysis, reporting, A/B testing
- **Technical Expertise**: Advanced
- **Goals**: Report Accuracy 99%+, Dashboard Adoption >80%
- **Pain Points**: Data fragmentation, Manual compilation
- **System Usage**: Analytics dashboard, Reporting tool, A/B test manager

#### 2.3.3 Operations Users

**Operations Manager (O-01)**:
- **Role**: Workflow design, SLA monitoring, resource allocation
- **Technical Expertise**: Intermediate to Advanced
- **Goals**: SLA Adherence 95%+, Resource Utilization 85%+, Exception Resolution <24hrs
- **Pain Points**: Manual assignment, Bottlenecks, Exception chaos
- **System Usage**: Workflow designer, SLA tracker, Resource dashboard, Exception manager

**Operations Staff (O-02)**:
- **Role**: Task execution, evidence submission, status updates
- **Technical Expertise**: Basic
- **Goals**: Task Completion 95%+, On-time Delivery 90%+, Quality >8/10
- **Pain Points**: Unclear priorities, Manual status updates
- **System Usage**: Task dashboard, Mobile app, Evidence upload

**QA Specialist (O-03)**:
- **Role**: Quality inspections, defect tracking, corrective actions
- **Technical Expertise**: Intermediate
- **Goals**: Defect Rate <2%, Audit Compliance 100%
- **Pain Points**: Inconsistent standards, Manual inspections
- **System Usage**: Quality dashboard, Audit tool, Defect tracker

**Resource Planner (O-04)**:
- **Role**: Capacity planning, skills matching, workload balancing
- **Technical Expertise**: Advanced
- **Goals**: Resource Utilization 85%+, Reduced Overtime
- **Pain Points**: Manual planning, Skills mismatch
- **System Usage**: Capacity dashboard, Skills inventory, Allocation tool

#### 2.3.4 Support Users

**Support Agent (CS-01)**:
- **Role**: Ticket handling, customer communication, resolution
- **Technical Expertise**: Basic to Intermediate
- **Goals**: First Response <2hr, Resolution <24hr, CSAT >8/10
- **Pain Points**: No context, Manual triage
- **System Usage**: Ticketing system, Customer profile, Knowledge base

**Support Team Lead (CS-02)**:
- **Role**: Team oversight, SLA monitoring, performance coaching
- **Technical Expertise**: Intermediate
- **Goals**: SLA Compliance 95%+, Agent Productivity
- **Pain Points**: Unclear ownership, Load balancing
- **System Usage**: Team dashboard, QA monitor, Reporting

**Customer Success Manager (CS-03)**:
- **Role**: Account health monitoring, proactive outreach, retention
- **Technical Expertise**: Intermediate
- **Goals**: Retention 95%+, Expansion 20%
- **Pain Points**: Poor health visibility, Reactive management
- **System Usage**: Health scorecard, Success dashboard

#### 2.3.5 Finance Users

**Finance Manager (F-01)**:
- **Role**: Financial oversight, invoicing, reporting
- **Technical Expertise**: Intermediate
- **Goals**: Revenue Accuracy 99%+, Billing Accuracy 99%+, DSO <30 days
- **Pain Points**: Disconnected data, Billing errors, Revenue leakage
- **System Usage**: Finance dashboard, Billing system, Reporting engine

**AR Specialist (F-02)**:
- **Role**: Invoice generation, payment tracking, collections
- **Technical Expertise**: Basic to Intermediate
- **Goals**: Collection Rate 95%+, Dispute Resolution <7 days
- **Pain Points**: Manual invoices, Poor tracking
- **System Usage**: AR dashboard, Invoice generator, Collections tool

**Financial Analyst (F-04)**:
- **Role**: Financial analysis, forecasting, budget monitoring
- **Technical Expertise**: Advanced
- **Goals**: Forecast Accuracy 95%+, Budget Variance <5%
- **Pain Points**: Data fragmentation, Manual compilation
- **System Usage**: Analytics dashboard, Forecasting tool

#### 2.3.6 HR Users

**HR Manager (HR-01)**:
- **Role**: Employee management, performance reviews, compliance
- **Technical Expertise**: Intermediate
- **Goals**: Review Completion 100%+, Employee Satisfaction >8/10, Audit Readiness 100%
- **Pain Points**: Subjective reviews, Manual tracking
- **System Usage**: HR dashboard, Performance tracker, Compliance manager

**Recruiter (HR-02)**:
- **Role**: Talent acquisition, applicant tracking, offer generation
- **Technical Expertise**: Basic to Intermediate
- **Goals**: Time-to-fill <30 days, Quality of Hire >8/10
- **Pain Points**: Manual tracking, Poor candidate experience
- **System Usage**: Recruitment dashboard, Applicant tracker

**Training Coordinator (HR-03)**:
- **Role**: Training scheduling, attendance tracking, skill assessment
- **Technical Expertise**: Basic to Intermediate
- **Goals**: Training Completion 95%+, Skill Improvement
- **Pain Points**: Manual attendance, No skill gap analysis
- **System Usage**: Training dashboard, Content library, LMS

**Compensation Analyst (HR-04)**:
- **Role**: Compensation analysis, commission calculation, equity reviews
- **Technical Expertise**: Advanced
- **Goals**: Pay Equity 100%+, Commission Accuracy 99%
- **Pain Points**: Manual calculations, Pay equity gaps
- **System Usage**: Compensation dashboard, Commission calculator

#### 2.3.7 Executive Users

**CEO (E-01)**:
- **Role**: Strategic leadership, business oversight
- **Technical Expertise**: Basic to Intermediate
- **Goals**: Growth 30%+, Efficiency 25%+
- **Pain Points**: Fragmented data, Reactive decisions
- **System Usage**: Executive dashboard, Strategy tool

**COO (E-02)**:
- **Role**: Operations oversight, process optimization
- **Technical Expertise**: Intermediate
- **Goals**: Efficiency 30%+, SLA 95%+
- **Pain Points**: Silos, Bottlenecks
- **System Usage**: Operations dashboard, Process optimizer

**CFO (E-03)**:
- **Role**: Financial oversight, risk management
- **Technical Expertise**: Intermediate to Advanced
- **Goals**: Margin 20%+, Risk Reduction
- **Pain Points**: Forecasting errors, Leakage
- **System Usage**: Finance dashboard, Risk monitor

**CRO (E-04)**:
- **Role**: Revenue growth, retention strategies
- **Technical Expertise**: Intermediate
- **Goals**: Growth 35%+, Retention 95%+
- **Pain Points**: Misalignment, Churn
- **System Usage**: Revenue dashboard, Growth planner

#### 2.3.8 IT/Admin Users

**System Administrator (IT-01)**:
- **Role**: User management, system configuration, monitoring
- **Technical Expertise**: Advanced
- **Goals**: Uptime 99.9%+, Security Incidents <1/mo
- **Pain Points**: Configuration chaos, Security risks
- **System Usage**: Admin console, User manager, Monitoring tools

**Security Administrator (IT-02)**:
- **Role**: Security oversight, access control, compliance
- **Technical Expertise**: Advanced
- **Goals**: Compliance 100%+, Response <1hr
- **Pain Points**: Gaps, Poor access control
- **System Usage**: Security dashboard, Audit log

**Integration Specialist (IT-03)**:
- **Role**: API management, integration configuration, data sync
- **Technical Expertise**: Advanced
- **Goals**: Success Rate 95%+, Data Sync 99%
- **Pain Points**: API failures, Bad data
- **System Usage**: Integration hub, API manager

### 2.4 Constraints

#### 2.4.1 Regulatory Constraints
- **GDPR Compliance**: Must support right to access, right to deletion, data portability (EU users)
- **CCPA Compliance**: Must support similar privacy rights (California users)
- **Data Residency**: Must support data storage in specific regions (planned)
- **Audit Requirements**: Complete audit trail for all critical actions (7-year retention)

#### 2.4.2 Technical Constraints
- **Cloud-Native**: Must be deployable on cloud infrastructure (AWS, Azure, GCP)
- **Multi-Tenant**: Must support complete tenant isolation (RLS, CLS)
- **API-First**: Must provide comprehensive REST and GraphQL APIs
- **Browser Support**: Latest 2 versions of Chrome, Firefox, Safari, Edge
- **Mobile Support**: PWA with native app support (iOS 14+, Android 10+)

#### 2.4.3 Business Constraints
- **Scalability**: Must handle 1000+ organizations, 10,000+ users per organization
- **Availability**: Target 99.9% uptime (8.76 hours downtime/year)
- **Performance**: API response time <200ms (95th percentile)
- **Cost**: Operational costs must be sustainable at scale

#### 2.4.4 Integration Constraints
- **OpenAI API**: Dependency on OpenAI API availability and rate limits
- **WhatsApp Business API**: Dependency on WhatsApp Business API access
- **Email Service**: Dependency on SMTP or email service provider (SendGrid, AWS SES)
- **Payment Gateways**: Integration with payment processors (no payment processing)

### 2.5 Assumptions and Dependencies

#### 2.5.1 Assumptions

**Business Assumptions**:
- Organizations have internet connectivity (minimum 1 Mbps)
- Users have modern web browsers (Chrome, Firefox, Safari, Edge)
- Organizations have email infrastructure (SMTP server or email service)
- WhatsApp Business API access is available for organizations using WhatsApp Bot
- OpenAI API access is available for AI features
- Users have basic computer literacy (can use web applications)

**Technical Assumptions**:
- PostgreSQL 14+ is available (managed service recommended)
- Redis 7+ is available (managed service recommended)
- Object storage (S3, Azure Blob, GCS) is available for file storage
- CDN is available for static asset delivery (optional)
- SSL/TLS certificates are available (managed by cloud provider)

**User Assumptions**:
- Users can read and write in Arabic or English
- Users understand basic business processes (sales, operations, finance)
- Organizations have defined workflows and processes
- Organizations have established roles and permissions

#### 2.5.2 Dependencies

**External Service Dependencies**:
- **OpenAI API**: Required for AI features (Bassan Bot, WhatsApp Bot)
  - Models: GPT-4, GPT-4o-mini
  - Rate Limits: Based on OpenAI subscription tier
  - Fallback: Template-based responses if API unavailable
- **WhatsApp Business API**: Required for WhatsApp Bot
  - Access: Requires WhatsApp Business Account approval
  - Rate Limits: Based on Meta's limits
  - Fallback: Email notification if WhatsApp unavailable
- **Email Service Provider**: Required for email features
  - Options: SendGrid, AWS SES, SMTP server
  - Rate Limits: Based on provider
  - Fallback: Queue email for later delivery
- **Payment Gateway**: Optional for payment tracking (not processing)
  - Options: Stripe, PayPal, local payment processors
  - Integration: Webhook-based

**Infrastructure Dependencies**:
- **Database**: PostgreSQL 14+ (managed service recommended)
  - Minimum: 10 GB storage, 2 GB RAM
  - Recommended: Auto-scaling, Read replicas
- **Cache**: Redis 7+ (managed service recommended)
  - Minimum: 1 GB memory
  - Recommended: Cluster mode for high availability
- **Object Storage**: S3, Azure Blob, or GCS (for file storage)
  - Minimum: 100 GB storage
  - Recommended: CDN integration
- **Cloud Provider**: AWS, Azure, or GCP
  - Compute: EC2/VM instances or Container service
  - Network: Load balancer, VPC
  - Monitoring: CloudWatch/Application Insights

**Software Dependencies**:
- **Backend**: Node.js 18+, TypeScript 5+, NestJS 10+
- **Frontend**: Next.js 14+, React 18+, TypeScript 5+
- **Database ORM**: Prisma 5+
- **Authentication**: JWT, OAuth 2.0
- **Message Queue**: BullMQ (Redis-based) or RabbitMQ
- **Container Runtime**: Docker, Kubernetes (optional)

---

## 3. System Features

### 3.1 Identity & Access Management (FR-001)

**Priority**: Must Have  
**Functional Area**: Security & Governance  
**Description**: Multi-tenant identity management with role-based access control

**Sub-Features**:
- FR-001-01: Organization Management (create, update, deactivate)
- FR-001-02: User Registration & Authentication (email/password, JWT tokens)
- FR-001-03: Role & Permission Management (RBAC, granular permissions)
- FR-001-04: Session Management (JWT access tokens, refresh tokens)
- FR-001-05: Password Management (reset, complexity rules, expiration)
- FR-001-06: Multi-Factor Authentication (optional, planned)

**Business Requirements Supported**:
- BR-01: Multi-Organization Governance Support
- BR-02: Role-Based Authority Definition
- BR-03: Delegated Decision-Making Control

**User Stories Supported**:
- IT-01: User and Role Management
- IT-04: Audit Logs

---

### 3.2 Sales & CRM (FR-002)

**Priority**: Must Have  
**Functional Area**: Revenue Generation  
**Description**: Complete sales and customer relationship management

**Sub-Features**:
- FR-002-01: Lead Management (CRUD, assignment, qualification, conversion)
- FR-002-02: Opportunity Management (pipeline stages, probability, value tracking)
- FR-002-03: Quote Generation (templates, PDF, e-signature)
- FR-002-04: Activity Logging (calls, emails, meetings, tasks)
- FR-002-05: Commission Calculation (automated, rule-based)
- FR-002-06: Sales Forecasting (weighted pipeline, revenue predictions)
- FR-002-07: Pipeline Visualization (kanban, drag-and-drop)

**Business Requirements Supported**:
- BR-07: Explicit Task Ownership
- BR-10: Customer State Classification
- BR-12: Customer-to-Workflow Binding
- BR-17: Commission & Contribution Tracking
- BR-18: Department-Level Performance Metrics

**User Stories Supported**:
- SALES-01 to SALES-10 (10 stories)

---

### 3.3 AI Agents - Bassan Bot (FR-003)

**Priority**: Must Have  
**Functional Area**: Lead Generation & Automation (Bassan ERP Integration)  
**Description**: AI-powered lead capture from website visitors

**Sub-Features**:
- FR-003-01: AI Lead Capture (natural language understanding, information extraction)
- FR-003-02: Lead Qualification (automated qualification based on extracted data)
- FR-003-03: Contextual Follow-up Questions (AI-generated questions for missing info)
- FR-003-04: Automatic Lead Creation (integration with CRM)
- FR-003-05: Multi-Language Support (Arabic, English, language detection)
- FR-003-06: 24/7 Availability (no human intervention required)

**Business Requirements Supported**:
- BR-10: Customer State Classification
- BR-12: Customer-to-Workflow Binding

**User Stories Supported** (New):
- Bassan-01: As a website visitor, I want to inquire about services via Bassan Bot, so I can get information 24/7
- Bassan-02: As a sales manager, I want leads captured by Bassan Bot, so I can qualify them in CRM

---

### 3.4 AI Agents - WhatsApp Bot (FR-004)

**Priority**: Must Have  
**Functional Area**: Customer Engagement & Automation (Bassan ERP Integration)  
**Description**: Conversational AI bot for WhatsApp Business

**Sub-Features**:
- FR-004-01: Natural Language Conversation (context-aware responses)
- FR-004-02: Conversation Memory (history tracking, context awareness)
- FR-004-03: Lead Qualification (automated qualification from conversations)
- FR-004-04: Appointment Scheduling (calendar integration)
- FR-004-05: Information Retrieval (knowledge base integration)
- FR-004-06: Human Handoff (transfer to human agent when needed)
- FR-004-07: Multi-Language Support (Arabic, English)

**Business Requirements Supported**:
- BR-10: Customer State Classification
- BR-12: Customer-to-Workflow Binding
- BR-22: External Communication Integration

**User Stories Supported** (New):
- Bassan-03: As a customer, I want to chat with WhatsApp Bot, so I can get instant responses
- Bassan-05: As a sales rep, I want WhatsApp conversations converted to leads, so I can follow up

---

### 3.5 Omnichannel Communication (FR-005)

**Priority**: Must Have  
**Functional Area**: Customer Engagement (Bassan ERP Integration)  
**Description**: Unified communication across multiple channels including Instagram and Facebook Messenger

**Sub-Features**:
- FR-005-01: Email Integration (send/receive, threading, templates)
- FR-005-02: WhatsApp Business API Integration (send/receive messages)
- FR-005-03: Instagram Messaging (automation, lead capture, engagement, conversation handling)
- FR-005-04: Web Chat Widget (embedded website chat)
- FR-005-05: Unified Conversation View (all channels in one interface)
- FR-005-06: Channel Normalization (standardized message format)
- FR-005-07: Message Routing (automated assignment to agents)
- FR-005-08: Facebook Messenger Automation (automated responses, lead qualification, personalized messaging)

**Business Requirements Supported**:
- BR-12: Customer-to-Workflow Binding
- BR-21: Event-Driven Notifications
- BR-22: External Communication Integration

**User Stories Supported** (Updated):
- Bassan-04: As a support agent, I want to see all customer conversations in one place, so I can provide consistent service
- Bassan-10: As a business owner, I want to automate Instagram interactions, so I can capture leads and boost engagement
- Bassan-11: As a marketing manager, I want to automate Facebook Messenger responses, so I can qualify leads and engage with my audience

---

### 3.6 Marketing Management (FR-006)

**Priority**: Must Have  
**Functional Area**: Lead Generation & Brand Management  
**Description**: Marketing campaign and content management

**Sub-Features**:
- FR-006-01: Campaign Management (multi-channel, budget tracking, ROI)
- FR-006-02: Content Calendar (scheduling, approval workflows)
- FR-006-03: Asset Library (searchable, taggable, version-controlled)
- FR-006-04: Attribution Tracking (multi-touch attribution models)
- FR-006-05: Budget Management (real-time tracking, alerts, forecasting)
- FR-006-06: A/B Testing (variant testing, statistical significance)

**Business Requirements Supported**:
- BR-04: Configurable Workflow Creation
- BR-05: Conditional Routing Logic
- BR-08: Evidence-Based Task Completion
- BR-19: Cross-Department Conversion Visibility

**User Stories Supported**:
- MKTG-01 to MKTG-10 (10 stories)

---

### 3.7 Operations Management (FR-007)

**Priority**: Must Have  
**Functional Area**: Service Delivery  
**Description**: Operations workflow and task management

**Sub-Features**:
- FR-007-01: Workflow Designer (drag-and-drop, no-code configuration)
- FR-007-02: Task Management (assignment, tracking, completion, evidence)
- FR-007-03: SLA Management (definition, monitoring, escalation)
- FR-007-04: Resource Allocation (capacity planning, skills matching)
- FR-007-05: Quality Control (inspections, defect tracking)
- FR-007-06: Exception Handling (structured escalation paths)

**Business Requirements Supported**:
- BR-04: Configurable Workflow Creation
- BR-05: Conditional Routing Logic
- BR-06: Exception & Escalation Handling
- BR-07: Explicit Task Ownership
- BR-08: Evidence-Based Task Completion
- BR-09: Performance Attribution

**User Stories Supported**:
- OPS-01 to OPS-10 (10 stories)

---

### 3.8 Projects Management (FR-008)

**Priority**: Should Have  
**Functional Area**: Project Delivery  
**Description**: Project planning and execution

**Sub-Features**:
- FR-008-01: Project Creation & Planning (scheduling, resource allocation)
- FR-008-02: Task Assignment to Projects (linking tasks to projects)
- FR-008-03: Milestone Tracking (milestone definition, progress tracking)
- FR-008-04: Progress Reporting (project status, completion percentage)
- FR-008-05: Resource Allocation (project-level resource planning)

**Business Requirements Supported**:
- BR-07: Explicit Task Ownership
- BR-08: Evidence-Based Task Completion
- BR-09: Performance Attribution

**User Stories Supported**:
- Partially supported by OPS-01 to OPS-10

---

### 3.9 Customer Support (FR-009)

**Priority**: Must Have  
**Functional Area**: Customer Success  
**Description**: Customer support ticket management

**Sub-Features**:
- FR-009-01: Ticket Management (creation, assignment, tracking, resolution)
- FR-009-02: SLA Monitoring (response time, resolution time, breach alerts)
- FR-009-03: Knowledge Base (articles, search, self-service portal)
- FR-009-04: Customer Health Scoring (usage, tickets, payments, engagement)
- FR-009-05: Multi-Channel Support Integration (email, WhatsApp, chat)

**Business Requirements Supported**:
- BR-06: Exception & Escalation Handling
- BR-07: Explicit Task Ownership
- BR-10: Customer State Classification
- BR-21: Event-Driven Notifications

**User Stories Supported**:
- SUPP-01 to SUPP-06 (6 stories)

---

### 3.10 Finance Management (FR-010)

**Priority**: Must Have  
**Functional Area**: Financial Operations  
**Description**: Financial tracking and invoicing

**Sub-Features**:
- FR-010-01: Invoice Management (generation, PDF, sending, tracking)
- FR-010-02: Payment Tracking (receipt, reconciliation, aging reports)
- FR-010-03: Budget Planning (allocation, variance tracking, forecasting)
- FR-010-04: Commission Calculation (automated, rule-based, audit trail)
- FR-010-05: Financial Reporting (P&L, Balance Sheet, custom reports)

**Business Requirements Supported**:
- BR-11: Payment Status Awareness
- BR-17: Commission & Contribution Tracking
- BR-18: Department-Level Performance Metrics

**User Stories Supported**:
- FIN-01 to FIN-05 (5 stories)

---

### 3.11 HR & People (FR-011)

**Priority**: Should Have  
**Functional Area**: Workforce Management  
**Description**: Human resources and people management

**Sub-Features**:
- FR-011-01: Employee Management (profiles, roles, departments)
- FR-011-02: Performance Tracking (reviews, goals, KPIs)
- FR-011-03: Training Programs (scheduling, attendance, completion)
- FR-011-04: Skills Management (inventory, assessment, gap analysis)
- FR-011-05: Compensation Tracking (salaries, commissions, bonuses)

**Business Requirements Supported**:
- BR-09: Performance Attribution
- BR-16: Multi-Employment Models
- BR-17: Commission & Contribution Tracking

**User Stories Supported**:
- HR-01 to HR-06 (6 stories)

---

### 3.12 Analytics & Reporting (FR-012)

**Priority**: Must Have  
**Functional Area**: Business Intelligence  
**Description**: Business intelligence and reporting

**Sub-Features**:
- FR-012-01: Real-Time Dashboards (customizable, role-based)
- FR-012-02: KPI Tracking (goals, targets, progress)
- FR-012-03: Custom Reports (ad-hoc, scheduled, export)
- FR-012-04: Data Visualization (charts, graphs, tables)
- FR-012-05: Export Capabilities (PDF, CSV, Excel)

**Business Requirements Supported**:
- BR-18: Department-Level Performance Metrics
- BR-19: Cross-Department Conversion Visibility
- BR-20: Executive-Level Business Dashboards

**User Stories Supported**:
- EXEC-01 to EXEC-04 (4 stories)

---

### 3.13 Integration Hub (FR-013)

**Priority**: Should Have  
**Functional Area**: System Integration  
**Description**: External system integrations

**Sub-Features**:
- FR-013-01: Webhook Management (configuration, monitoring, retry)
- FR-013-02: API Gateway (authentication, rate limiting, routing)
- FR-013-03: Third-Party Integrations (e-commerce, accounting, messaging)
- FR-013-04: Data Synchronization (bidirectional, conflict resolution)
- FR-013-05: Integration Monitoring (health checks, error tracking)

**Business Requirements Supported**:
- BR-22: External Communication Integration

**User Stories Supported**:
- IT-03: Integration Management

---

### 3.14 AI Studio (FR-014)

**Priority**: Must Have  
**Functional Area**: AI Configuration & Management  
**Description**: Visual interface for building, configuring, and managing AI bots across all channels

**Sub-Features**:
- FR-014-01: Visual Conversation Flow Builder (drag-and-drop interface, node-based editor)
- FR-014-02: System Prompt Editor (rich text editor, template library, version control)
- FR-014-03: Response Templates Library (create, edit, organize, reuse templates)
- FR-014-04: Knowledge Base Integration (upload documents, FAQs, automatic indexing)
- FR-014-05: Bot Configuration (personality, tone, language settings, model selection)
- FR-014-06: Bot Testing Interface (test chat, conversation preview, validation)
- FR-014-07: Bot Analytics Dashboard (conversation metrics, performance analytics, lead conversion)
- FR-014-08: Multiple Bots Management (create, manage, activate/deactivate multiple bot instances)
- FR-014-09: Bot Templates (pre-built templates for different use cases)
- FR-014-10: Bot Versioning (version control, rollback, A/B testing)

**Business Requirements Supported**:
- BR-04: Configurable Workflow Creation
- BR-12: Customer-to-Workflow Binding
- BR-22: External Communication Integration

**User Stories Supported** (New):
- Bassan-12: As a marketing manager, I want to visually design conversation flows for my bot, so I can customize customer interactions without coding
- Bassan-13: As a sales manager, I want to configure bot prompts and responses, so the bot represents my brand accurately
- Bassan-14: As an admin, I want to test my bot before deploying it, so I can ensure it works correctly
- Bassan-15: As a business owner, I want to create multiple bots for different websites or departments, so I can customize each experience
- Bassan-16: As a marketing manager, I want to see bot analytics and performance metrics, so I can optimize conversations

---

### 3.15 Theme System (FR-015)

**Priority**: Must Have  
**Functional Area**: User Experience & Interface  
**Description**: Theme system supporting Light Mode (Day) and Dark Mode (Night) with Purple primary theme

**Sub-Features**:
- FR-015-01: Theme Toggle (switch between light and dark mode)
- FR-015-02: User Theme Preference (store and apply per-user preference)
- FR-015-03: System Preference Detection (detect and respect OS theme preference)
- FR-015-04: Theme Persistence (remember theme choice across sessions)
- FR-015-05: Smooth Theme Transitions (animated theme switching)
- FR-015-06: Theme-Aware Components (all components support both themes)
- FR-015-07: Purple Theme Colors (primary purple color scheme implementation)

**Business Requirements Supported**:
- User Experience Enhancement
- Accessibility Compliance

**User Stories Supported** (New):
- UX-01: As a user, I want to switch between light and dark mode, so I can work comfortably in different lighting conditions
- UX-02: As a user, I want my theme preference to be remembered, so I don't have to change it every time
- UX-03: As a user, I want the system to automatically detect my OS theme preference, so the initial experience matches my system settings

---

### 3.16 Subscription & Billing Management (FR-016)

**Priority**: Must Have  
**Functional Area**: Revenue & Operations  
**Description**: Comprehensive subscription lifecycle management, billing, and payment processing

**Sub-Features**:
- FR-016-01: Subscription Plans Management (create, update, tier definitions)
- FR-016-02: Tenant Subscription Management (assign, upgrade, downgrade, cancel)
- FR-016-03: Billing Cycle Management (monthly, annual, custom cycles)
- FR-016-04: Usage-Based Billing (track usage, calculate overages)
- FR-016-05: Invoice Generation (automated, PDF, email delivery)
- FR-016-06: Payment Processing (payment gateway integration, receipt generation)
- FR-016-07: Grace Period & Dunning Management (overdue handling, suspension workflows)
- FR-016-08: Trial Period Management (free trials, trial expiration, conversion tracking)
- FR-016-09: Proration Handling (upgrades/downgrades mid-cycle)
- FR-016-10: Subscription Analytics (MRR, churn, LTV, cohort analysis)

**Business Requirements Supported**:
- Revenue Management
- Customer Lifecycle Management
- Financial Reporting

**User Stories Supported** (New):
- FIN-10: As a finance manager, I want to manage subscription plans and pricing, so I can offer flexible options to customers
- FIN-11: As a system admin, I want to track subscription usage and billing, so I can ensure accurate revenue recognition
- FIN-12: As a customer, I want to upgrade or downgrade my subscription, so I can adjust to my needs
- FIN-13: As a finance manager, I want automated invoice generation and payment processing, so billing is efficient

---

### 3.17 Usage Quotas & Rate Limiting (FR-017)

**Priority**: Must Have  
**Functional Area**: Operations & Performance  
**Description**: Per-tenant usage quotas, rate limiting, and resource management

**Sub-Features**:
- FR-017-01: Quota Definition (per feature, per tenant tier)
- FR-017-02: Usage Tracking (real-time usage monitoring)
- FR-017-03: Quota Enforcement (soft limits, hard limits, overage handling)
- FR-017-04: API Rate Limiting (per-tenant, per-endpoint, burst limits)
- FR-017-05: Storage Quotas (database, file storage limits)
- FR-017-06: User Limit Enforcement (max users per tenant)
- FR-017-07: Feature Usage Limits (workflows, campaigns, AI requests)
- FR-017-08: Quota Alerts (warnings at 80%, 90%, 100%)
- FR-017-09: Overage Billing (usage-based charges for over-quota usage)
- FR-017-10: Quota Analytics (usage trends, peak usage, quota utilization)

**Business Requirements Supported**:
- Resource Management
- Cost Control
- Performance Optimization

**User Stories Supported** (New):
- OPS-11: As a system admin, I want to set usage quotas per tenant, so I can manage resources effectively
- OPS-12: As a tenant admin, I want to monitor my usage against quotas, so I can plan for upgrades
- OPS-13: As a system admin, I want to enforce rate limits, so I can prevent abuse and ensure fair usage

---

### 3.18 Data Export & Import System (FR-018)

**Priority**: Should Have  
**Functional Area**: Data Management & Compliance  
**Description**: Comprehensive data export/import for migration, backup, and compliance

**Sub-Features**:
- FR-018-01: Full Data Export (all tenant data in structured format)
- FR-018-02: Selective Data Export (module-specific, date-range filters)
- FR-018-03: Export Formats (JSON, CSV, Excel, SQL dump)
- FR-018-04: Data Import (bulk import, validation, error handling)
- FR-018-05: Import Templates (pre-defined templates for common scenarios)
- FR-018-06: Migration Assistant (guided migration from common systems)
- FR-018-07: Data Validation (pre-import validation, error reporting)
- FR-018-08: Incremental Export (export only changed data since last export)
- FR-018-09: Scheduled Exports (automated exports, retention policies)
- FR-018-10: Export History (audit trail of all exports)

**Business Requirements Supported**:
- GDPR Compliance (Data Portability)
- Data Migration
- Backup & Recovery

**User Stories Supported** (New):
- IT-06: As a tenant admin, I want to export all my data, so I can migrate to another system or create backups
- IT-07: As a system admin, I want to import data from legacy systems, so I can help customers migrate
- IT-08: As a tenant admin, I want to export my data in GDPR-compliant format, so I can comply with regulations

---

### 3.19 Customer Onboarding & Training (FR-019)

**Priority**: Should Have  
**Functional Area**: Customer Success  
**Description**: Guided onboarding, in-app training, and knowledge base

**Sub-Features**:
- FR-019-01: Onboarding Wizard (step-by-step setup guide)
- FR-019-02: Interactive Tutorials (in-app guided tours)
- FR-019-03: Contextual Help (help tooltips, inline documentation)
- FR-019-04: Video Library (training videos, feature walkthroughs)
- FR-019-05: Knowledge Base (searchable documentation, FAQs)
- FR-019-06: Sample Data (pre-populated demo data for testing)
- FR-019-07: Checklist System (onboarding tasks, completion tracking)
- FR-019-08: Progress Tracking (onboarding completion percentage)
- FR-019-09: Role-Based Onboarding (customized onboarding per role)
- FR-019-10: Onboarding Analytics (completion rates, time to value)

**Business Requirements Supported**:
- User Experience Enhancement
- Customer Success

**User Stories Supported** (New):
- CS-01: As a new tenant admin, I want a guided onboarding process, so I can set up my organization quickly
- CS-02: As a new user, I want interactive tutorials, so I can learn how to use the system
- CS-03: As a user, I want access to a knowledge base, so I can find answers to my questions

---

### 3.20 Tenant Self-Service Portal (FR-020)

**Priority**: Should Have  
**Functional Area**: Tenant Management  
**Description**: Self-service portal for tenants to manage their subscription and settings

**Sub-Features**:
- FR-020-01: Subscription Management (view plan, upgrade/downgrade, cancel)
- FR-020-02: Usage Dashboard (real-time usage metrics, quota status)
- FR-020-03: Billing Portal (view invoices, payment methods, billing history)
- FR-020-04: Invoice Download (download PDF invoices)
- FR-020-05: Payment Method Management (add, update, remove payment methods)
- FR-020-06: Billing Address Management
- FR-020-07: Data Export Requests (request data export)
- FR-020-08: Account Settings (organization details, preferences)
- FR-020-09: User Management (invite users, manage roles - if allowed)
- FR-020-10: Support Tickets (submit and track support requests)

**Business Requirements Supported**:
- Customer Self-Service
- Reduced Support Burden

**User Stories Supported** (New):
- CS-04: As a tenant admin, I want to manage my subscription online, so I can upgrade or downgrade without contacting support
- CS-05: As a tenant admin, I want to view my usage and billing, so I can monitor my costs
- CS-06: As a tenant admin, I want to download my invoices, so I can manage my accounting

---

### 3.21 Tenant Health & Success Metrics (FR-021)

**Priority**: Should Have  
**Functional Area**: Customer Success  
**Description**: Tenant health scoring, success metrics, and churn prediction

**Sub-Features**:
- FR-021-01: Tenant Health Score (composite score based on multiple factors)
- FR-021-02: Usage Metrics (active users, feature adoption, API usage)
- FR-021-03: Engagement Metrics (login frequency, feature usage, data volume)
- FR-021-04: Support Metrics (ticket volume, resolution time, satisfaction)
- FR-021-05: Financial Health (payment status, subscription status, MRR)
- FR-021-06: Churn Risk Prediction (ML-based churn prediction)
- FR-021-07: Success Indicators (key metrics indicating success)
- FR-021-08: Health Dashboard (visual dashboard for customer success team)
- FR-021-09: Automated Alerts (alerts for at-risk tenants)
- FR-021-10: Intervention Workflows (automated actions for at-risk tenants)

**Business Requirements Supported**:
- Customer Success
- Churn Prevention
- Revenue Retention

**User Stories Supported** (New):
- CS-07: As a customer success manager, I want to see tenant health scores, so I can identify at-risk customers
- CS-08: As a customer success manager, I want churn risk predictions, so I can proactively engage with at-risk tenants
- CS-09: As an executive, I want to see tenant success metrics, so I can understand customer health across the portfolio

---

### 3.22 White-Labeling & Branding (FR-022)

**Priority**: Nice to Have  
**Functional Area**: Partner & Reseller Management  
**Description**: White-label capabilities for partners and resellers

**Sub-Features**:
- FR-022-01: Custom Branding (logo, colors, favicon)
- FR-022-02: Custom Domain (tenant-specific domains)
- FR-022-03: Email Branding (custom email templates, sender names)
- FR-022-04: Login Page Customization (custom login page design)
- FR-022-05: Email Domain (custom email domain for notifications)
- FR-022-06: Terms & Privacy (custom terms of service, privacy policy)
- FR-022-07: Support Contact (custom support email/phone)
- FR-022-08: Documentation Branding (custom documentation site)

**Business Requirements Supported**:
- Partner/Reseller Programs
- Enterprise Customization

**User Stories Supported** (New):
- PARTNER-01: As a partner, I want to white-label the system, so I can sell it under my brand
- PARTNER-02: As an enterprise customer, I want custom branding, so the system matches my company identity

---

### 3.23 Integration Marketplace (FR-023)

**Priority**: Nice to Have  
**Functional Area**: Integration & Extensibility  
**Description**: Marketplace for third-party integrations and plugins

**Sub-Features**:
- FR-023-01: Integration Catalog (browse available integrations)
- FR-023-02: Integration Installation (one-click installation)
- FR-023-03: Integration Configuration (setup wizard for integrations)
- FR-023-04: Integration Management (enable/disable, update, remove)
- FR-023-05: Custom Integrations (build custom integrations via API)
- FR-023-06: Integration Ratings & Reviews (user feedback)
- FR-023-07: Integration Documentation (setup guides, API docs)
- FR-023-08: Integration Analytics (usage metrics per integration)

**Business Requirements Supported**:
- Ecosystem Growth
- Extensibility

**User Stories Supported** (New):
- INT-01: As a tenant admin, I want to browse available integrations, so I can extend system functionality
- INT-02: As a tenant admin, I want one-click integration installation, so I can quickly connect third-party services
- INT-03: As a developer, I want to build custom integrations, so I can connect with my internal systems

---

### 3.24 Tenant Performance Monitoring (FR-024)

**Priority**: Should Have  
**Functional Area**: Operations & Performance  
**Description**: Per-tenant performance monitoring and SLA tracking

**Sub-Features**:
- FR-024-01: Performance Metrics (API response time, query performance)
- FR-024-02: Error Tracking (error rate, error types per tenant)
- FR-024-03: Resource Usage (CPU, memory, storage per tenant)
- FR-024-04: SLA Tracking (uptime, response time SLA per tenant tier)
- FR-024-05: Performance Alerts (alerts for performance degradation)
- FR-024-06: Performance Dashboard (tenant-specific performance dashboard)
- FR-024-07: Hot Tenant Detection (identify tenants requiring dedicated resources)
- FR-024-08: Capacity Planning (predict resource needs)

**Business Requirements Supported**:
- Performance Optimization
- SLA Compliance
- Resource Management

**User Stories Supported** (New):
- OPS-14: As a system admin, I want to monitor performance per tenant, so I can ensure SLA compliance
- OPS-15: As a system admin, I want to identify hot tenants, so I can allocate dedicated resources
- OPS-16: As a tenant admin, I want to see my performance metrics, so I can understand system performance

---

### 3.25 Payment Management & Dunning (FR-025)

**Priority**: Must Have  
**Functional Area**: Revenue Management  
**Description**: Payment failure handling, grace periods, and dunning workflows

**Sub-Features**:
- FR-025-01: Payment Failure Detection (automatic detection of failed payments)
- FR-025-02: Grace Period Management (configurable grace period before suspension)
- FR-025-03: Dunning Workflows (automated email sequences for overdue payments)
- FR-025-04: Payment Retry Logic (automatic retry with exponential backoff)
- FR-025-05: Account Suspension (automatic suspension after grace period)
- FR-025-06: Account Reactivation (automatic reactivation on successful payment)
- FR-025-07: Data Retention (retain data during suspension period)
- FR-025-08: Final Notice & Cancellation (final warnings, cancellation process)

**Business Requirements Supported**:
- Revenue Recovery
- Customer Retention
- Payment Processing

**User Stories Supported** (New):
- FIN-14: As a finance manager, I want automated payment retry logic, so I can recover failed payments
- FIN-15: As a finance manager, I want dunning workflows, so I can communicate with customers about overdue payments
- FIN-16: As a system admin, I want grace periods before suspension, so I can give customers time to fix payment issues

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Web Application

**Technology Stack**:
- Framework: Next.js 14 (React 18, App Router)
- Language: TypeScript 5+
- UI Library: Tailwind CSS 3.4, shadcn/ui (planned)
- State Management: TanStack Query (React Query)
- Forms: React Hook Form, Zod validation
- Icons: Lucide React

**Design Requirements**:
- Responsive Design: Mobile-first, responsive layout (mobile, tablet, desktop)
- Browser Support: Latest 2 versions of Chrome, Firefox, Safari, Edge
- Accessibility: WCAG 2.1 Level AA compliance
- Internationalization: Arabic (RTL) and English (LTR) support
- Theme System: 
  - Light Mode (Day Mode) - Default
  - Dark Mode (Night Mode) - Fully implemented
  - Theme toggle in user settings
  - System preference detection (respects OS theme preference)
  - Per-user theme preference (stored in user profile)
- Primary Theme Color: Purple/Violet (#9333EA, #7C3AED, #6D28D9)
  - Primary Purple: #9333EA (main brand color)
  - Dark Purple: #7C3AED (darker variant)
  - Light Purple: #A78BFA (lighter variant)
  - Purple Accent: #6D28D9 (accent elements)

**Key Screens**:
- Dashboard (role-based, customizable)
- Lead Management (list, detail, kanban)
- Pipeline View (kanban, drag-and-drop)
- Task Management (list, kanban, detail)
- Campaign Management (list, detail, calendar)
- Invoice Management (list, detail, PDF preview)
- Ticket Management (list, detail, comments)
- Analytics Dashboard (charts, KPIs, reports)
- Admin Console (user management, configuration)

#### 4.1.2 Mobile Application

**Type**: Progressive Web App (PWA) with native app support

**Platforms**:
- iOS 14+ (Safari, Chrome)
- Android 10+ (Chrome, Firefox)

**Features**:
- Offline Support (Service Worker, IndexedDB)
- Push Notifications (Web Push API)
- Camera Access (for evidence upload)
- Location Services (optional, for field tasks)
- Add to Home Screen (PWA install prompt)

**Key Screens**:
- Dashboard (simplified, mobile-optimized)
- My Tasks (list, detail, status update)
- My Leads (list, detail, quick actions)
- Evidence Upload (camera, file picker)
- Notifications (push notifications, in-app)

#### 4.1.3 Admin Console

**Purpose**: System administration and configuration

**Access**: Restricted to system administrators and organization owners

**Features**:
- User Management (create, update, deactivate users)
- Role Management (create, update, assign roles)
- Permission Management (configure permissions)
- Organization Settings (configuration, features)
- System Monitoring (health, performance, errors)
- Audit Logs (view, search, export)

#### 4.1.4 Bassan Bot Widget (Website Embed)

**Purpose**: AI-powered lead capture for website visitors

**Technology**: JavaScript widget (vanilla JS, embeddable)

**Features**:
- Floating Chat Widget (bottom-right corner)
- AI Conversation Interface (chat-like UI)
- Lead Capture Form (email, phone, name)
- Multi-Language Support (Arabic, English)
- Customizable Branding (colors, logo)

**Integration**: 
- Embed via script tag: `<script src="https://cdn.bassan.os/Bassan-bot.js"></script>`
- Configuration: `data-organization-slug="your-org-slug"`

### 4.2 Hardware Interfaces

**Server Infrastructure**:
- **Compute**: Cloud-based (AWS EC2, Azure VM, GCP Compute Engine)
  - Minimum: 2 vCPU, 4 GB RAM
  - Recommended: 4 vCPU, 8 GB RAM (per instance)
  - Scaling: Horizontal scaling (load balancer, auto-scaling)
- **Database**: PostgreSQL 14+ (managed service recommended)
  - Minimum: 2 vCPU, 4 GB RAM, 10 GB storage
  - Recommended: Auto-scaling, Read replicas, 100 GB+ storage
- **Cache**: Redis 7+ (managed service recommended)
  - Minimum: 1 GB memory
  - Recommended: Cluster mode, 4 GB+ memory
- **Storage**: Object storage (S3, Azure Blob, GCS)
  - Minimum: 100 GB storage
  - Recommended: CDN integration, 1 TB+ storage
- **CDN**: Content delivery network (CloudFront, Azure CDN, Cloud CDN)
  - Purpose: Static asset delivery, global distribution

**Client Hardware**:
- **Desktop/Laptop**: Modern computer with web browser
  - Minimum: 2 GB RAM, 100 Mbps internet
  - Recommended: 4 GB+ RAM, 1 Mbps+ internet
- **Mobile Device**: Smartphone or tablet
  - Minimum: iOS 14+ or Android 10+
  - Recommended: iOS 15+ or Android 11+

### 4.3 Software Interfaces

#### 4.3.1 Database

**Technology**: PostgreSQL 14+

**ORM**: Prisma 5+

**Connection**:
- Connection Pooling: Required (Prisma connection pool)
- Max Connections: 100 (configurable)
- Connection String: `DATABASE_URL` environment variable

**Schema Management**:
- Migrations: Prisma Migrate
- Version Control: Schema versioning in Prisma
- Rollback: Supported via Prisma Migrate

**Backup**:
- Strategy: Daily full backups, hourly incremental
- Retention: 30 days
- Encryption: Encrypted backups (AES-256)

#### 4.3.2 Cache & Queue

**Technology**: Redis 7+

**Use Cases**:
- Session Storage (user sessions, JWT tokens)
- Cache (dashboard data, reports, API responses)
- Message Queue (BullMQ for background jobs)

**Configuration**:
- Connection: `REDIS_URL` environment variable
- TTL: Configurable per key type
- Eviction Policy: LRU (Least Recently Used)

#### 4.3.3 AI Services

**OpenAI API**:
- Endpoint: `https://api.openai.com/v1`
- Authentication: Bearer token (`OPENAI_API_KEY`)
- Models: GPT-4, GPT-4o-mini
- Rate Limits: Based on subscription tier
- Fallback: Template-based responses if API unavailable

**Usage**:
- Bassan Bot: Lead extraction, follow-up question generation
- WhatsApp Bot: Conversation handling, context-aware responses

#### 4.3.4 Communication Services

**WhatsApp Business API**:
- Endpoint: `https://graph.facebook.com/v18.0`
- Authentication: Bearer token (`WHATSAPP_ACCESS_TOKEN`)
- Phone Number ID: `WHATSAPP_PHONE_NUMBER_ID`
- Webhook: HTTPS POST to `/api/v1/Bassan/whatsapp/webhook`
- Rate Limits: Based on Meta's limits
- Fallback: Email notification if WhatsApp unavailable

**Email Service**:
- Provider: SendGrid, AWS SES, or SMTP
- Protocol: SMTP or REST API
- Configuration: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Rate Limits: Based on provider
- Fallback: Queue email for later delivery

**Instagram API** (Planned):
- Endpoint: Instagram Graph API
- Authentication: OAuth 2.0
- Purpose: Instagram messaging integration

### 4.4 Communication Interfaces

#### 4.4.1 REST API

**Base URL**: `https://api.bassan.os/v1`  
**Protocol**: HTTPS (TLS 1.3)  
**Format**: JSON (Content-Type: `application/json`)  
**Authentication**: OAuth 2.0 (Bearer token)

**Standards**:
- RESTful principles (resource-oriented, HTTP verbs)
- Stateless (no server-side session state)
- Idempotent (safe retry for GET, PUT, DELETE, PATCH)
- Versioned (URL-based versioning: `/v1/`, `/v2/`)
- Paginated (all list endpoints support pagination)
- Filterable (all list endpoints support filtering and sorting)

**Rate Limiting**:
- Default: 1000 requests/hour per organization
- Burst: 100 requests/minute
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Examples**:
- `GET /api/v1/leads` - List leads
- `POST /api/v1/leads` - Create lead
- `GET /api/v1/leads/:id` - Get lead
- `PATCH /api/v1/leads/:id` - Update lead
- `DELETE /api/v1/leads/:id` - Delete lead

#### 4.4.2 GraphQL API

**Endpoint**: `https://api.bassan.os/graphql`  
**Protocol**: HTTPS (TLS 1.3)  
**Format**: JSON  
**Authentication**: OAuth 2.0 (Bearer token)

**Features**:
- Query language for complex data fetching
- Type system (strongly typed)
- Introspection (schema exploration)
- Subscriptions (real-time updates, WebSocket)

**Example Query**:l
query {
  leads(limit: 10, filter: { status: "QUALIFIED" }) {
    id
    firstName
    lastName
    email
    status
    createdAt
  }
  pipeline {
    stages {
      name
      count
      value
    }
  }
}
#### 4.4.3 WebSocket

**Endpoint**: `wss://api.bassan.os/ws`  
**Protocol**: WebSocket Secure (WSS)  
**Authentication**: OAuth 2.0 (Bearer token in query string or header)

**Use Cases**:
- Real-time notifications (task assignments, SLA alerts)
- Live dashboard updates (KPI changes, pipeline updates)
- Collaboration features (real-time updates, presence)

**Message Format**: JSON

**Example**:
{
  "type": "notification",
  "event": "task.assigned",
  "payload": {
    "taskId": "uuid",
    "title": "Follow up with lead",
    "assignedTo": "user-id"
  }
}#### 4.4.4 Webhooks

**Protocol**: HTTPS POST  
**Format**: JSON  
**Authentication**: HMAC signature

**Configuration**:
- Webhook URL: Provided by integrating system
- Secret: Shared secret for HMAC signature
- Events: Subscribable event types
- Retry: Exponential backoff (3 attempts)

**Signature Verification**:
4.4.3 WebSocket
Endpoint: wss://api.bassan.os/ws
Protocol: WebSocket Secure (WSS)
Authentication: OAuth 2.0 (Bearer token in query string or header)
Use Cases:
Real-time notifications (task assignments, SLA alerts)
Live dashboard updates (KPI changes, pipeline updates)
Collaboration features (real-time updates, presence)
Message Format: JSON
Example:
{
  "type": "notification",
  "event": "task.assigned",
  "payload": {
    "taskId": "uuid",
    "title": "Follow up with lead",
    "assignedTo": "user-id"
  }
}ad**:
{
  "event": "lead.created",
  "timestamp": "2026-01-08T10:00:00Z",
  "data": {
    "id": "uuid",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed@example.com",
    "source": "Bassan_bot"
  }
}---

## 5. System Features (Detailed)

### 5.1 Identity & Access Management (FR-001)

#### 5.1.1 Organization Management

**FR-001-01**: Create Organization  
**Priority**: Must Have  
**Description**: System administrators can create new organizations (tenants)

**Inputs**:
- Organization name (required, string, 1-255 characters)
- Organization slug (required, string, unique, URL-safe, 3-50 characters)
- Organization settings (optional, JSON object)
- Subscription tier (optional, string: "basic", "professional", "enterprise")

**Outputs**:
- Organization ID (UUID)
- Organization details (name, slug, tier, created_at)
- Default roles created (Admin, User, Viewer)
- Default permissions assigned

**Processing**:
1. Validate organization name (required, non-empty)
2. Validate organization slug (required, unique, URL-safe, no spaces)
3. Check slug uniqueness in database
4. Create organization record in `organizations` table
5. Initialize default roles (Admin, User, Viewer) for organization
6. Initialize default permissions for each role
7. Create default admin user (optional, can be created separately)
8. Publish `organization.created` event

**Error Handling**:
- Duplicate slug → 409 Conflict (`ORGANIZATION_SLUG_EXISTS`)
- Invalid slug format → 400 Bad Request (`INVALID_SLUG_FORMAT`)
- Missing required fields → 400 Bad Request (`VALIDATION_ERROR`)
- Database error → 500 Internal Server Error (`INTERNAL_ERROR`)

**Business Rules**:
- Organization slug must be globally unique
- Organization slug cannot be changed after creation
- Organization name can be updated
- Organization can be deactivated but not deleted (soft delete)

---

#### 5.1.2 User Authentication

**FR-001-02**: User Login  
**Priority**: Must Have  
**Description**: Users can authenticate and receive access tokens

**Inputs**:
- Email (required, string, valid email format)
- Password (required, string, minimum 8 characters)

**Outputs**:
- Access token (JWT, 1 hour expiry)
- Refresh token (JWT, 30 days expiry)
- User profile (id, email, firstName, lastName, organizationId, roles)
- Token type ("Bearer")

**Processing**:
1. Validate email format
2. Validate password (required, non-empty)
3. Find user by email and organization (if organization context available)
4. Verify password against stored hash (bcrypt)
5. Check user is active (`isActive = true`)
6. Check user's organization is active
7. Generate JWT access token (payload: userId, organizationId, email, roles)
8. Generate JWT refresh token (payload: userId, organizationId, tokenId)
9. Store refresh token in database (`refresh_tokens` table)
10. Update user's `lastLogin` timestamp
11. Publish `user.logged_in` event
12. Return tokens and user profile

**Error Handling**:
- Invalid email format → 400 Bad Request (`INVALID_EMAIL_FORMAT`)
- Invalid credentials → 401 Unauthorized (`INVALID_CREDENTIALS`)
- User inactive → 403 Forbidden (`USER_INACTIVE`)
- Organization inactive → 403 Forbidden (`ORGANIZATION_INACTIVE`)
- Account locked (after N failed attempts) → 403 Forbidden (`ACCOUNT_LOCKED`)

**Security Requirements**:
- Password must be hashed using bcrypt (cost factor 10)
- Failed login attempts tracked (max 5 attempts, 15-minute lockout)
- Tokens signed with secure secret (256-bit)
- Refresh tokens stored in database (can be revoked)
- Access tokens short-lived (1 hour)
- Refresh tokens longer-lived (30 days) but revocable

**Business Rules**:
- User must be active to login
- User's organization must be active
- Multiple concurrent sessions allowed (no session limit)
- Refresh token can be used once (rotation on use)

---

#### 5.1.3 Role-Based Access Control

**FR-001-03**: Permission Check  
**Priority**: Must Have  
**Description**: System enforces permissions based on user roles

**Inputs**:
- User ID (from JWT token)
- Organization ID (from JWT token)
- Resource type (string: "leads", "opportunities", "tasks", etc.)
- Action (string: "read", "write", "delete", "assign")

**Outputs**:
- Permission granted/denied (boolean)
- Reason (string, if denied)

**Processing**:
1. Extract user ID and organization ID from JWT token (via middleware)
2. Retrieve user's roles from database (`user_roles` table)
3. Retrieve permissions for user's roles (`role_permissions` table)
4. Check if any role has permission for resource+action
5. Return authorization decision

**Permission Format**:
- Resource: `{module}:{entity}` (e.g., "sales:leads", "operations:tasks")
- Action: `{action}` (e.g., "read", "write", "delete", "assign")
- Permission: `{resource}:{action}` (e.g., "sales:leads:read", "sales:leads:write")

**Error Handling**:
- Invalid token → 401 Unauthorized (`INVALID_TOKEN`)
- Missing permission → 403 Forbidden (`PERMISSION_DENIED`)
- User not found → 404 Not Found (`USER_NOT_FOUND`)

**Business Rules**:
- Permissions are additive (user has union of all role permissions)
- System roles (Super Admin) have all permissions
- Organization roles are scoped to organization
- Permission checks happen at API endpoint level (guards/middleware)

---

### 5.2 Sales & CRM (FR-002)

#### 5.2.1 Lead Management

**FR-002-01**: Create Lead  
**Priority**: Must Have  
**Description**: Sales representatives can create new leads

**Inputs**:
- First name (required, string, 1-100 characters)
- Last name (required, string, 1-100 characters)
- Email (optional, string, valid email format if provided)
- Phone (optional, string, valid phone format if provided)
- Company (optional, string, 1-255 characters)
- Source (optional, string: "website", "referral", "Bassan_bot", "whatsapp_bot", etc.)
- Notes (optional, string, max 5000 characters)
- Status (optional, enum: "NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED", default: "NEW")

**Outputs**:
- Lead ID (UUID)
- Lead details (all fields, timestamps)
- Created timestamp
- Organization ID (from context)

**Processing**:
1. Validate required fields (firstName, lastName)
2. Validate email format (if provided)
3. Validate phone format (if provided)
4. Set organization ID from CLS context (multi-tenant isolation)
5. Create lead record in `leads` table
6. If source is "Bassan_bot" or "whatsapp_bot", mark as AI-generated
7. Auto-assign lead based on routing rules (if configured)
8. Publish `lead.created` event (for workflows, notifications)
9. Return lead details

**Error Handling**:
- Validation errors → 400 Bad Request (`VALIDATION_ERROR`)
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)
- Organization context missing → 500 Internal Server Error (`INTERNAL_ERROR`)

**Business Rules**:
- Lead must have at least firstName and lastName
- Lead must have at least email OR phone
- Organization ID is automatically set from context (cannot be overridden)
- Lead status defaults to "NEW"
- Lead source helps track lead origin (attribution)

**Integration Points**:
- Event: `lead.created` → Workflow engine, Notification service
- Auto-assignment: Based on territory, capacity, round-robin rules

---

**FR-002-02**: List Leads  
**Priority**: Must Have  
**Description**: Sales representatives can list their assigned leads

**Inputs**:
- Organization ID (from context)
- User ID (from context, for filtering "My Leads")
- Status filter (optional, enum: "NEW", "CONTACTED", "QUALIFIED", etc.)
- Source filter (optional, string)
- Search query (optional, string, searches name, email, company)
- Pagination (limit, offset or cursor)
- Sorting (field, direction: "createdAt", "desc")

**Outputs**:
- List of leads (array)
- Pagination metadata (total, limit, offset, hasMore)
- Lead fields: id, firstName, lastName, email, phone, company, status, source, createdAt, updatedAt, ownerId

**Processing**:
1. Extract organization ID from CLS context
2. Build query with organization filter (automatic via CLS)
3. Apply status filter (if provided)
4. Apply source filter (if provided)
5. Apply search query (if provided, searches firstName, lastName, email, company)
6. Apply user filter for "My Leads" (if requested)
7. Apply sorting (default: createdAt desc)
8. Apply pagination
9. Execute query
10. Return results and pagination metadata

**Error Handling**:
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)
- Invalid pagination parameters → 400 Bad Request (`VALIDATION_ERROR`)

**Business Rules**:
- Users can only see leads in their organization (enforced by CLS)
- Users can filter by "My Leads" (leads where ownerId = current user)
- Search is case-insensitive, partial match
- Default pagination: limit 20, offset 0

---

**FR-002-03**: Update Lead  
**Priority**: Must Have  
**Description**: Sales representatives can update lead information

**Inputs**:
- Lead ID (required, UUID, path parameter)
- Update fields (optional, partial update supported)
  - firstName (optional, string)
  - lastName (optional, string)
  - email (optional, string, valid email format)
  - phone (optional, string, valid phone format)
  - company (optional, string)
  - status (optional, enum)
  - notes (optional, string)
  - ownerId (optional, UUID, requires "leads:assign" permission)

**Outputs**:
- Updated lead details
- Updated timestamp

**Processing**:
1. Validate lead ID format
2. Retrieve lead by ID (with organization filter via CLS)
3. Check lead exists (404 if not found or belongs to different org)
4. Check permissions ("leads:write" for update, "leads:assign" for ownerId change)
5. Validate update fields (email format, phone format, status enum)
6. Update lead record (partial update, only provided fields)
7. Publish `lead.updated` event (if status changed, publish `lead.status_changed`)
8. Return updated lead

**Error Handling**:
- Lead not found → 404 Not Found (`LEAD_NOT_FOUND`)
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)
- Validation errors → 400 Bad Request (`VALIDATION_ERROR`)

**Business Rules**:
- Partial update supported (only provided fields are updated)
- Status transitions are logged (audit trail)
- Owner assignment requires "leads:assign" permission
- Organization ID cannot be changed

---

#### 5.2.2 Opportunity Management

**FR-002-04**: Create Opportunity  
**Priority**: Must Have  
**Description**: Sales representatives can create opportunities from qualified leads

**Inputs**:
- Name (required, string, 1-255 characters)
- Lead ID (optional, UUID, link to source lead)
- Stage (optional, enum: "QUALIFICATION", "NEEDS_ANALYSIS", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST", default: "QUALIFICATION")
- Probability (optional, integer, 0-100, default: 0)
- Estimated value (required, decimal, >0)
- Expected close date (optional, date, future date)
- Owner ID (optional, UUID, defaults to current user)
- Notes (optional, string)

**Outputs**:
- Opportunity ID (UUID)
- Opportunity details (all fields, timestamps)

**Processing**:
1. Validate required fields (name, estimatedValue)
2. Validate estimatedValue > 0
3. Validate expectedCloseDate is future date (if provided)
4. Validate probability is 0-100 (if provided)
5. Validate lead exists (if leadId provided)
6. Set organization ID from CLS context
7. Create opportunity record in `opportunities` table
8. If leadId provided, update lead status to "CONVERTED" and link opportunity
9. Publish `opportunity.created` event
10. Return opportunity details

**Error Handling**:
- Validation errors → 400 Bad Request (`VALIDATION_ERROR`)
- Lead not found → 404 Not Found (`LEAD_NOT_FOUND`)
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)

**Business Rules**:
- Opportunity must have name and estimatedValue
- Probability should match stage (e.g., QUALIFICATION = 10%, NEGOTIATION = 75%)
- Expected close date should be future date
- Converting lead to opportunity updates lead status to "CONVERTED"

---

**FR-002-05**: View Pipeline  
**Priority**: Must Have  
**Description**: Sales managers can view sales pipeline by stage

**Inputs**:
- Organization ID (from context)
- Stage filter (optional, enum)
- Date range (optional, startDate, endDate)
- Owner filter (optional, UUID, filter by opportunity owner)

**Outputs**:
- Pipeline view (stages with opportunity counts and values)
- Forecast data (weighted pipeline value)
- Stage breakdown:
  - Stage name
  - Opportunity count
  - Total value
  - Weighted value (value × probability / 100)
  - Average deal size
  - Average days in stage

**Processing**:
1. Extract organization ID from CLS context
2. Retrieve opportunities by organization (with filters)
3. Group opportunities by stage
4. Calculate metrics per stage:
   - Count: Number of opportunities
   - Total value: Sum of estimatedValue
   - Weighted value: Sum of (estimatedValue × probability / 100)
   - Average deal size: Average of estimatedValue
   - Average days: Average of (current date - createdAt)
5. Calculate overall forecast (sum of weighted values)
6. Return pipeline view

**Error Handling**:
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)

**Business Rules**:
- Pipeline shows all stages (even if no opportunities)
- Weighted forecast = Σ(estimatedValue × probability / 100)
- Stages are ordered: QUALIFICATION → NEEDS_ANALYSIS → PROPOSAL → NEGOTIATION → CLOSED_WON/CLOSED_LOST
- Closed stages (CLOSED_WON, CLOSED_LOST) shown separately

---

#### 5.2.3 Quote Generation

**FR-002-06**: Generate Quote  
**Priority**: Should Have  
**Description**: Sales representatives can generate quotes from templates

**Inputs**:
- Opportunity ID (required, UUID)
- Template ID (optional, UUID, quote template)
- Line items (required, array):
  - Description (required, string)
  - Quantity (required, decimal, >0)
  - Unit price (required, decimal, >0)
  - Discount (optional, decimal, 0-100, percentage)
- Validity period (required, integer, days, default: 30)
- Terms and conditions (optional, string)
- Notes (optional, string)

**Outputs**:
- Quote ID (UUID)
- Quote number (string, auto-generated, format: "Q-{year}-{sequence}")
- PDF document (binary, base64-encoded)
- Quote details (all fields, line items, totals)

**Processing**:
1. Validate opportunity ID
2. Retrieve opportunity (verify exists, belongs to organization)
3. Load template (if templateId provided, otherwise use default template)
4. Merge opportunity data into template (customer name, company, date)
5. Calculate line item totals (quantity × unitPrice × (1 - discount/100))
6. Calculate subtotal (sum of line item totals)
7. Calculate tax (if applicable, based on organization settings)
8. Calculate total (subtotal + tax)
9. Generate quote record in `quotes` table
10. Generate PDF document (using template engine, e.g., PDFKit, Puppeteer)
11. Store PDF in object storage (S3, Azure Blob)
12. Create quote line items in `quote_items` table
13. Publish `quote.created` event
14. Return quote details and PDF

**Error Handling**:
- Opportunity not found → 404 Not Found (`OPPORTUNITY_NOT_FOUND`)
- Template not found → 404 Not Found (`TEMPLATE_NOT_FOUND`)
- PDF generation error → 500 Internal Server Error (`PDF_GENERATION_ERROR`)
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)

**Business Rules**:
- Quote number is auto-generated, unique per organization
- Quote validity period defaults to 30 days
- Quote status starts as "DRAFT"
- Quote can be sent to customer (status → "SENT")
- Quote expires after validity period (status → "EXPIRED")

---

### 5.3 AI Agents - Bassan Bot (FR-003)

#### 5.3.1 AI Lead Capture

**FR-003-01**: Process Visitor Inquiry  
**Priority**: Must Have  
**Description**: Bassan Bot processes website visitor inquiries and captures leads automatically using AI

**Inputs**:
- Organization slug (required, string, path parameter)
- Visitor message (required, string, 1-1000 characters)
- Visitor info (optional, object):
  - name (optional, string)
  - email (optional, string, valid email format)
  - phone (optional, string, valid phone format)
- Context (optional, object):
  - page (optional, string, current page URL)
  - referrer (optional, string, referrer URL)
  - userAgent (optional, string, browser user agent)

**Outputs**:
- Response message (string, AI-generated or template)
- Lead ID (UUID, if lead was created)
- Capture status (enum: "captured", "pending", "insufficient_info")
- Missing fields (array of strings, if insufficient info)

**Processing**:
1. Retrieve organization by slug
2. Validate organization is active
3. Extract lead information using AI (OpenAI GPT-4o-mini):
   - Build prompt with visitor message and existing info
   - Call OpenAI API with extraction prompt
   - Parse JSON response (name, email, phone, company, interest, notes)
4. Validate extracted information:
   - Check if name exists (extracted or provided)
   - Check if email OR phone exists (at least one required)
5. If sufficient information:
   a. Create lead in CRM:
      - firstName, lastName (from extracted name)
      - email, phone (from extracted or provided)
      - company (from extracted)
      - status: "NEW"
      - source: "Bassan_bot:{page}" or "Bassan_bot:website"
      - notes: "{interest}. {notes}"
   b. Generate thank you message (template-based or AI-generated)
   c. Return: { response: thankYouMessage, leadId: uuid, captured: true }
6. If insufficient information:
   a. Identify missing fields (name, email/phone)
   b. Generate follow-up question using AI:
      - Build prompt with missing fields and conversation context
      - Call OpenAI API with follow-up prompt
      - Generate natural, friendly question in Arabic or English
   c. Return: { response: followUpQuestion, captured: false, missingFields: [...] }

**AI Processing Details**:
- **Extraction Model**: GPT-4o-mini
- **Extraction Temperature**: 0.2 (low, for accurate extraction)
- **Extraction Response Format**: JSON object
- **Follow-up Model**: GPT-4o-mini
- **Follow-up Temperature**: 0.7 (higher, for natural conversation)
- **Language Detection**: Based on visitor message (Arabic/English)
- **Response Language**: Match visitor's language

**Error Handling**:
- Organization not found → 404 Not Found (`ORGANIZATION_NOT_FOUND`)
- Organization inactive → 403 Forbidden (`ORGANIZATION_INACTIVE`)
- OpenAI API error → 500 Internal Server Error (`AI_SERVICE_ERROR`)
  - Fallback: Use template-based follow-up question
- Invalid message format → 400 Bad Request (`VALIDATION_ERROR`)

**Business Rules**:
- Lead creation requires: name AND (email OR phone)
- Lead source is "Bassan_bot:{page}" or "Bassan_bot:website"
- Multiple inquiries from same visitor can update existing lead (match by email/phone)
- Response time target: <2 seconds (AI call + processing)
- Fallback: If AI unavailable, use template-based questions

**Integration Points**:
- Event: `lead.created` → Workflow engine, Notification service
- Auto-assignment: Based on organization's lead routing rules

---

#### 5.3.2 Multi-Language Support

**FR-003-02**: Language Detection and Response  
**Priority**: Should Have  
**Description**: Bassan Bot detects and responds in visitor's language

**Inputs**:
- Visitor message (required, string)

**Outputs**:
- Detected language (enum: "ar", "en")
- Response in detected language (string)

**Processing**:
1. Analyze visitor message:
   - Check for Arabic characters (Arabic Unicode range)
   - Check for English characters (Latin alphabet)
   - Count characters in each script
2. Determine primary language (script with more characters)
3. Generate response in detected language:
   - Use Arabic templates/prompts if Arabic detected
   - Use English templates/prompts if English detected
4. Return response in matching language

**Error Handling**:
- Language detection failure → Default to English
- Mixed language → Use primary script (>50% threshold)

**Business Rules**:
- Arabic detection: Presence of Arabic Unicode characters
- English detection: Latin alphabet characters
- Default language: English (if undetectable)
- Response always matches detected language

---

### 5.4 AI Agents - WhatsApp Bot (FR-004)

#### 5.4.1 Conversation Handling

**FR-004-01**: Handle WhatsApp Message  
**Priority**: Must Have  
**Description**: WhatsApp Bot handles incoming messages with context awareness and memory

**Inputs**:
- WhatsApp number (required, string, phone number format)
- Message text (required, string, 1-4096 characters)
- Message ID (required, string, WhatsApp message ID)
- Timestamp (required, datetime, WhatsApp message timestamp)

**Outputs**:
- AI-generated response (string)
- Updated conversation record
- Lead ID (UUID, if lead was created/updated)

**Processing**:
1. Get or create conversation:
   - Find customer by WhatsApp number (match by phone)
   - If customer not found, create customer record
   - Find or create conversation for customer+channel
2. Save incoming message:
   - Create message record in `messages` table
   - Sender: "CUSTOMER"
   - Link to conversation
3. Retrieve conversation history:
   - Get last 10 messages from conversation (for context)
   - Order by timestamp (ascending, for context building)
4. Generate AI response:
   - Build system prompt with organization context
   - Build conversation history (last 10 messages)
   - Call OpenAI API (GPT-4o-mini) with:
     - System prompt: Organization name, role (customer service assistant)
     - Conversation history: Previous messages (user/assistant roles)
     - Current message: Visitor's message
     - Temperature: 0.7 (for natural conversation)
   - Parse AI response
5. Save AI response:
   - Create message record in `messages` table
   - Sender: "AI"
   - Link to conversation
6. Send response via WhatsApp:
   - Call WhatsApp Business API
   - Send message to customer's WhatsApp number
7. Lead qualification check:
   - Analyze conversation for lead qualification signals
   - If qualified (interest expressed, contact info shared):
     - Create or update lead in CRM
     - Source: "whatsapp_bot"
     - Link to conversation
8. Return response and conversation details

**AI Processing Details**:
- **Model**: GPT-4o-mini
- **Temperature**: 0.7 (for natural conversation)
- **Context Window**: Last 10 messages (~2000 tokens)
- **System Prompt**: Includes organization name, role, conversation guidelines
- **Response Language**: Match customer's language (Arabic/English)

**Error Handling**:
- WhatsApp API error → Log error, retry with exponential backoff
- OpenAI API error → Return default message ("عذراً، حدث خطأ. الرجاء المحاولة لاحقاً.")
- Conversation not found → Create new conversation
- Customer not found → Create new customer

**Business Rules**:
- Conversation history limited to last 10 messages (for context)
- Response time target: <3 seconds (AI call + WhatsApp send)
- Conversation stays active until manually closed or 7 days of inactivity
- Multiple conversations per customer allowed (new conversation if >7 days inactive)

**Integration Points**:
- Event: `conversation.message.received` → Notification service
- Event: `lead.created` (if qualified) → Workflow engine, Sales module

---

#### 5.4.2 Human Handoff

**FR-004-02**: Transfer to Human Agent  
**Priority**: Must Have  
**Description**: WhatsApp Bot transfers conversation to human agent when confidence is low or customer requests

**Inputs**:
- Conversation ID (required, UUID)
- Handoff reason (required, enum: "low_confidence", "customer_request", "complex_query", "escalation")
- Confidence level (optional, decimal, 0-1, if low_confidence)

**Outputs**:
- Handoff confirmation
- Assigned agent ID (UUID)
- Notification sent to agent

**Processing**:
1. Retrieve conversation
2. Update conversation status:
   - Status: "TRANSFERRED"
   - AssignedType: "human"
   - AssignedToId: [assigned agent ID]
3. Assign to human agent:
   - Find available agent (round-robin, skills-based, or load-based)
   - If no available agent, queue conversation, notify manager
4. Send message to customer:
   - "Connecting you with a human agent. One moment please..."
   - Via WhatsApp API
5. Send notification to agent:
   - Push notification (if mobile app)
   - In-app notification
   - Email notification (optional)
6. Publish `conversation.handoff` event
7. Return handoff confirmation

**Error Handling**:
- Conversation not found → 404 Not Found (`CONVERSATION_NOT_FOUND`)
- No available agent → Queue conversation, return 202 Accepted (`CONVERSATION_QUEUED`)

**Business Rules**:
- Handoff can be triggered by:
  - Low confidence (<0.7) in AI response
  - Customer explicitly requests human ("أريد التحدث مع شخص")
  - Complex query (detected by AI)
  - Escalation keyword detected
- Agent assignment: Round-robin within support team
- Conversation remains linked to original customer
- Agent can see full conversation history

---

### 5.5 Omnichannel Communication (FR-005)

#### 5.5.1 Unified Conversation View

**FR-005-01**: View All Conversations  
**Priority**: Must Have  
**Description**: Users can view all customer conversations across channels in unified interface

**Inputs**:
- Organization ID (from context)
- Channel filter (optional, enum: "whatsapp", "email", "web", "instagram")
- Status filter (optional, enum: "ACTIVE", "RESOLVED", "TRANSFERRED")
- Customer filter (optional, UUID, filter by customer)
- Search query (optional, string, searches message text)
- Pagination (limit, offset)

**Outputs**:
- List of conversations (array)
- Pagination metadata
- Conversation fields:
  - id, customerId, channel, channelId, status
  - assignedToId, assignedType
  - lastMessage (text, timestamp, sender)
  - messageCount, unreadCount
  - createdAt, updatedAt

**Processing**:
1. Extract organization ID from CLS context
2. Build query with organization filter
3. Apply channel filter (if provided)
4. Apply status filter (if provided)
5. Apply customer filter (if provided)
6. Apply search query (searches message text in conversation)
7. Join with last message (for preview)
8. Join with message counts
9. Apply sorting (default: updatedAt desc, most recent first)
10. Apply pagination
11. Execute query
12. Return results

**Error Handling**:
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)
- Invalid filters → 400 Bad Request (`VALIDATION_ERROR`)

**Business Rules**:
- Users can only see conversations in their organization
- Conversations sorted by last activity (most recent first)
- Last message preview shows first 100 characters
- Unread count based on messages after user's last read timestamp

---

#### 5.5.2 Channel Normalization

**FR-005-02**: Normalize Channel Message  
**Priority**: Must Have  
**Description**: System normalizes messages from different channels to unified format

**Inputs**:
- Channel type (required, enum: "whatsapp", "email", "web", "instagram")
- Raw message payload (required, object, channel-specific format)

**Outputs**:
- Normalized message object (standard format)

**Standard Format**:pt
{
  channel: "whatsapp" | "email" | "web" | "instagram",
  from: string,        // Customer identifier (phone, email, session ID)
  to: string,          // Organization identifier
  message: string,     // Message text
  timestamp: Date,     // Message timestamp
  messageId: string,   // Channel-specific message ID
  metadata: {          // Channel-specific metadata
    subject?: string,  // Email subject
    attachments?: Array<{ url: string, type: string }>,
    // ... other channel-specific fields
  }
}**Processing**:
1. Load channel adapter based on channel type
2. Extract message data from raw payload (channel-specific parsing)
3. Normalize to standard format:
   - Extract "from" (phone for WhatsApp, email for email, session ID for web)
   - Extract "to" (organization identifier)
   - Extract "message" (text content)
   - Extract "timestamp" (convert to UTC)
   - Extract "messageId" (channel-specific ID)
   - Extract metadata (channel-specific fields)
4. Return normalized message

**Channel-Specific Parsing**:

**WhatsApp**:
{
  from: payload.from,                    // Phone number
  to: organization.whatsappPhoneNumberId,
  message: payload.text?.body || "",
  timestamp: new Date(payload.timestamp * 1000),
  messageId: payload.id,
  metadata: {
    messageType: payload.type,
    // ... other WhatsApp fields
  }
}
**Email**:
{
  from: payload.from.address,
  to: payload.to[0].address,
  message: payload.text || payload.html,
  timestamp: new Date(payload.date),
  messageId: payload.messageId,
  metadata: {
    subject: payload.subject,
    attachments: payload.attachments,
    // ... other email fields
  }
}**Web Chat**:
{
  from: payload.sessionId,
  to: organization.id,
  message: payload.text,
  timestamp: new Date(payload.timestamp),
  messageId: payload.messageId,
  metadata: {
    userAgent: payload.userAgent,
    page: payload.page,
    // ... other web fields
  }
}**Error Handling**:
- Unsupported channel → 400 Bad Request (`UNSUPPORTED_CHANNEL`)
- Invalid payload format → 400 Bad Request (`INVALID_PAYLOAD`)
- Parsing error → 500 Internal Server Error (`PARSING_ERROR`)

**Business Rules**:
- All channels normalized to same format
- Timestamps converted to UTC
- Message text extracted (HTML stripped for email)
- Metadata preserved for channel-specific features

---

### 5.6 Operations Management (FR-007)

#### 5.6.1 Workflow Designer

**FR-007-01**: Create Workflow  
**Priority**: Must Have  
**Description**: Operations managers can create workflows using drag-and-drop interface (no-code)

**Inputs**:
- Workflow name (required, string, 1-255 characters)
- Workflow description (optional, string)
- Workflow category (optional, string: "sales", "operations", "support", etc.)
- Workflow steps (required, array):
  - Step ID (required, string, unique within workflow)
  - Step name (required, string)
  - Step type (required, enum: "START", "TASK", "APPROVAL", "CONDITION", "END")
  - Sequence (required, integer, order of steps)
  - Config (optional, object, step-specific configuration):
    - Task type, assignment rules, SLA hours
    - Approval roles, conditions
    - Condition logic (IF/THEN/ELSE)
- Transitions (required, array):
  - From step ID (required, string)
  - To step ID (required, string)
  - Condition (optional, object, transition condition)
- Trigger (optional, object):
  - Type (enum: "manual

  4.4.4 Webhooks
Protocol: HTTPS POST
Format: JSON
Authentication: HMAC signature
Configuration:
Webhook URL: Provided by integrating system
Secret: Shared secret for HMAC signature
Events: Subscribable event types
Retry: Exponential backoff (3 attempts)
Signature Verification:
HMAC-SHA256(payload, secret) == signature
Event Types:
lead.created
lead.qualified
opportunity.won
task.completed
invoice.paid
ticket.created
sla.breached
Example Payload:

{
  "event": "lead.created",
  "timestamp": "2026-01-08T10:00:00Z",
  "data": {
    "id": "uuid",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed@example.com",
    "source": "Bassan_bot"
  }
}

5. System Features (Detailed)
5.1 Identity & Access Management (FR-001)
5.1.1 Organization Management
FR-001-01: Create Organization
Priority: Must Have
Description: System administrators can create new organizations (tenants)
Inputs:
Organization name (required, string, 1-255 characters)
Organization slug (required, string, unique, URL-safe, 3-50 characters)
Organization settings (optional, JSON object)
Subscription tier (optional, string: "basic", "professional", "enterprise")
Outputs:
Organization ID (UUID)
Organization details (name, slug, tier, created_at)
Default roles created (Admin, User, Viewer)
Default permissions assigned
Processing:
Validate organization name (required, non-empty)
Validate organization slug (required, unique, URL-safe, no spaces)
Check slug uniqueness in database
Create organization record in organizations table
Initialize default roles (Admin, User, Viewer) for organization
Initialize default permissions for each role
Create default admin user (optional, can be created separately)
Publish organization.created event
Error Handling:
Duplicate slug → 409 Conflict (ORGANIZATION_SLUG_EXISTS)
Invalid slug format → 400 Bad Request (INVALID_SLUG_FORMAT)
Missing required fields → 400 Bad Request (VALIDATION_ERROR)
Database error → 500 Internal Server Error (INTERNAL_ERROR)
Business Rules:
Organization slug must be globally unique
Organization slug cannot be changed after creation
Organization name can be updated
Organization can be deactivated but not deleted (soft delete)
5.1.2 User Authentication
FR-001-02: User Login
Priority: Must Have
Description: Users can authenticate and receive access tokens
Inputs:
Email (required, string, valid email format)
Password (required, string, minimum 8 characters)
Outputs:
Access token (JWT, 1 hour expiry)
Refresh token (JWT, 30 days expiry)
User profile (id, email, firstName, lastName, organizationId, roles)
Token type ("Bearer")
Processing:
Validate email format
Validate password (required, non-empty)
Find user by email and organization (if organization context available)
Verify password against stored hash (bcrypt)
Check user is active (isActive = true)
Check user's organization is active
Generate JWT access token (payload: userId, organizationId, email, roles)
Generate JWT refresh token (payload: userId, organizationId, tokenId)
Store refresh token in database (refresh_tokens table)
Update user's lastLogin timestamp
Publish user.logged_in event
Return tokens and user profile
Error Handling:
Invalid email format → 400 Bad Request (INVALID_EMAIL_FORMAT)
Invalid credentials → 401 Unauthorized (INVALID_CREDENTIALS)
User inactive → 403 Forbidden (USER_INACTIVE)
Organization inactive → 403 Forbidden (ORGANIZATION_INACTIVE)
Account locked (after N failed attempts) → 403 Forbidden (ACCOUNT_LOCKED)
Security Requirements:
Password must be hashed using bcrypt (cost factor 10)
Failed login attempts tracked (max 5 attempts, 15-minute lockout)
Tokens signed with secure secret (256-bit)
Refresh tokens stored in database (can be revoked)
Access tokens short-lived (1 hour)
Refresh tokens longer-lived (30 days) but revocable
Business Rules:
User must be active to login
User's organization must be active
Multiple concurrent sessions allowed (no session limit)
Refresh token can be used once (rotation on use)
5.1.3 Role-Based Access Control
FR-001-03: Permission Check
Priority: Must Have
Description: System enforces permissions based on user roles
Inputs:
User ID (from JWT token)
Organization ID (from JWT token)
Resource type (string: "leads", "opportunities", "tasks", etc.)
Action (string: "read", "write", "delete", "assign")
Outputs:
Permission granted/denied (boolean)
Reason (string, if denied)
Processing:
Extract user ID and organization ID from JWT token (via middleware)
Retrieve user's roles from database (user_roles table)
Retrieve permissions for user's roles (role_permissions table)
Check if any role has permission for resource+action
Return authorization decision
Permission Format:
Resource: {module}:{entity} (e.g., "sales:leads", "operations:tasks")
Action: {action} (e.g., "read", "write", "delete", "assign")
Permission: {resource}:{action} (e.g., "sales:leads:read", "sales:leads:write")
Error Handling:
Invalid token → 401 Unauthorized (INVALID_TOKEN)
Missing permission → 403 Forbidden (PERMISSION_DENIED)
User not found → 404 Not Found (USER_NOT_FOUND)
Business Rules:
Permissions are additive (user has union of all role permissions)
System roles (Super Admin) have all permissions
Organization roles are scoped to organization
Permission checks happen at API endpoint level (guards/middleware)
5.2 Sales & CRM (FR-002)
5.2.1 Lead Management
FR-002-01: Create Lead
Priority: Must Have
Description: Sales representatives can create new leads
Inputs:
First name (required, string, 1-100 characters)
Last name (required, string, 1-100 characters)
Email (optional, string, valid email format if provided)
Phone (optional, string, valid phone format if provided)
Company (optional, string, 1-255 characters)
Source (optional, string: "website", "referral", "Bassan_bot", "whatsapp_bot", etc.)
Notes (optional, string, max 5000 characters)
Status (optional, enum: "NEW", "CONTACTED", "QUALIFIED", "UNQUALIFIED", "CONVERTED", default: "NEW")
Outputs:
Lead ID (UUID)
Lead details (all fields, timestamps)
Created timestamp
Organization ID (from context)
Processing:
Validate required fields (firstName, lastName)
Validate email format (if provided)
Validate phone format (if provided)
Set organization ID from CLS context (multi-tenant isolation)
Create lead record in leads table
If source is "Bassan_bot" or "whatsapp_bot", mark as AI-generated
Auto-assign lead based on routing rules (if configured)
Publish lead.created event (for workflows, notifications)
Return lead details
Error Handling:
Validation errors → 400 Bad Request (VALIDATION_ERROR)
Permission denied → 403 Forbidden (PERMISSION_DENIED)
Organization context missing → 500 Internal Server Error (INTERNAL_ERROR)
Business Rules:
Lead must have at least firstName and lastName
Lead must have at least email OR phone
Organization ID is automatically set from context (cannot be overridden)
Lead status defaults to "NEW"
Lead source helps track lead origin (attribution)
Integration Points:
Event: lead.created → Workflow engine, Notification service
Auto-assignment: Based on territory, capacity, round-robin rules
FR-002-02: List Leads
Priority: Must Have
Description: Sales representatives can list their assigned leads
Inputs:
Organization ID (from context)
User ID (from context, for filtering "My Leads")
Status filter (optional, enum: "NEW", "CONTACTED", "QUALIFIED", etc.)
Source filter (optional, string)
Search query (optional, string, searches name, email, company)
Pagination (limit, offset or cursor)
Sorting (field, direction: "createdAt", "desc")
Outputs:
List of leads (array)
Pagination metadata (total, limit, offset, hasMore)
Lead fields: id, firstName, lastName, email, phone, company, status, source, createdAt, updatedAt, ownerId
Processing:
Extract organization ID from CLS context
Build query with organization filter (automatic via CLS)
Apply status filter (if provided)
Apply source filter (if provided)
Apply search query (if provided, searches firstName, lastName, email, company)
Apply user filter for "My Leads" (if requested)
Apply sorting (default: createdAt desc)
Apply pagination
Execute query
Return results and pagination metadata
Error Handling:
Permission denied → 403 Forbidden (PERMISSION_DENIED)
Invalid pagination parameters → 400 Bad Request (VALIDATION_ERROR)
Business Rules:
Users can only see leads in their organization (enforced by CLS)
Users can filter by "My Leads" (leads where ownerId = current user)
Search is case-insensitive, partial match
Default pagination: limit 20, offset 0
FR-002-03: Update Lead
Priority: Must Have
Description: Sales representatives can update lead information
Inputs:
Lead ID (required, UUID, path parameter)
Update fields (optional, partial update supported)
firstName (optional, string)
lastName (optional, string)
email (optional, string, valid email format)
phone (optional, string, valid phone format)
company (optional, string)
status (optional, enum)
notes (optional, string)
ownerId (optional, UUID, requires "leads:assign" permission)
Outputs:
Updated lead details
Updated timestamp
Processing:
Validate lead ID format
Retrieve lead by ID (with organization filter via CLS)
Check lead exists (404 if not found or belongs to different org)
Check permissions ("leads:write" for update, "leads:assign" for ownerId change)
Validate update fields (email format, phone format, status enum)
Update lead record (partial update, only provided fields)
Publish lead.updated event (if status changed, publish lead.status_changed)
Return updated lead
Error Handling:
Lead not found → 404 Not Found (LEAD_NOT_FOUND)
Permission denied → 403 Forbidden (PERMISSION_DENIED)
Validation errors → 400 Bad Request (VALIDATION_ERROR)
Business Rules:
Partial update supported (only provided fields are updated)
Status transitions are logged (audit trail)
Owner assignment requires "leads:assign" permission
Organization ID cannot be changed
5.2.2 Opportunity Management
FR-002-04: Create Opportunity
Priority: Must Have
Description: Sales representatives can create opportunities from qualified leads
Inputs:
Name (required, string, 1-255 characters)
Lead ID (optional, UUID, link to source lead)
Stage (optional, enum: "QUALIFICATION", "NEEDS_ANALYSIS", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST", default: "QUALIFICATION")
Probability (optional, integer, 0-100, default: 0)
Estimated value (required, decimal, >0)
Expected close date (optional, date, future date)
Owner ID (optional, UUID, defaults to current user)
Notes (optional, string)
Outputs:
Opportunity ID (UUID)
Opportunity details (all fields, timestamps)
Processing:
Validate required fields (name, estimatedValue)
Validate estimatedValue > 0
Validate expectedCloseDate is future date (if provided)
Validate probability is 0-100 (if provided)
Validate lead exists (if leadId provided)
Set organization ID from CLS context
Create opportunity record in opportunities table
If leadId provided, update lead status to "CONVERTED" and link opportunity
Publish opportunity.created event
Return opportunity details
Error Handling:
Validation errors → 400 Bad Request (VALIDATION_ERROR)
Lead not found → 404 Not Found (LEAD_NOT_FOUND)
Permission denied → 403 Forbidden (PERMISSION_DENIED)
Business Rules:
Opportunity must have name and estimatedValue
Probability should match stage (e.g., QUALIFICATION = 10%, NEGOTIATION = 75%)
Expected close date should be future date
Converting lead to opportunity updates lead status to "CONVERTED"
FR-002-05: View Pipeline
Priority: Must Have
Description: Sales managers can view sales pipeline by stage
Inputs:
Organization ID (from context)
Stage filter (optional, enum)
Date range (optional, startDate, endDate)
Owner filter (optional, UUID, filter by opportunity owner)
Outputs:
Pipeline view (stages with opportunity counts and values)
Forecast data (weighted pipeline value)
Stage breakdown:
Stage name
Opportunity count
Total value
Weighted value (value × probability / 100)
Average deal size
Average days in stage
Processing:
Extract organization ID from CLS context
Retrieve opportunities by organization (with filters)
Group opportunities by stage
Calculate metrics per stage:
Count: Number of opportunities
Total value: Sum of estimatedValue
Weighted value: Sum of (estimatedValue × probability / 100)
Average deal size: Average of estimatedValue
Average days: Average of (current date - createdAt)
Calculate overall forecast (sum of weighted values)
Return pipeline view
Error Handling:
Permission denied → 403 Forbidden (PERMISSION_DENIED)
Business Rules:
Pipeline shows all stages (even if no opportunities)
Weighted forecast = Σ(estimatedValue × probability / 100)
Stages are ordered: QUALIFICATION → NEEDS_ANALYSIS → PROPOSAL → NEGOTIATION → CLOSED_WON/CLOSED_LOST
Closed stages (CLOSED_WON, CLOSED_LOST) shown separately
5.2.3 Quote Generation
FR-002-06: Generate Quote
Priority: Should Have
Description: Sales representatives can generate quotes from templates
Inputs:
Opportunity ID (required, UUID)
Template ID (optional, UUID, quote template)
Line items (required, array):
Description (required, string)
Quantity (required, decimal, >0)
Unit price (required, decimal, >0)
Discount (optional, decimal, 0-100, percentage)
Validity period (required, integer, days, default: 30)
Terms and conditions (optional, string)
Notes (optional, string)
Outputs:
Quote ID (UUID)
Quote number (string, auto-generated, format: "Q-{year}-{sequence}")
PDF document (binary, base64-encoded)
Quote details (all fields, line items, totals)
Processing:
Validate opportunity ID
Retrieve opportunity (verify exists, belongs to organization)
Load template (if templateId provided, otherwise use default template)
Merge opportunity data into template (customer name, company, date)
Calculate line item totals (quantity × unitPrice × (1 - discount/100))
Calculate subtotal (sum of line item totals)
Calculate tax (if applicable, based on organization settings)
Calculate total (subtotal + tax)
Generate quote record in quotes table
Generate PDF document (using template engine, e.g., PDFKit, Puppeteer)
Store PDF in object storage (S3, Azure Blob)
Create quote line items in quote_items table
Publish quote.created event
Return quote details and PDF
Error Handling:
Opportunity not found → 404 Not Found (OPPORTUNITY_NOT_FOUND)
Template not found → 404 Not Found (TEMPLATE_NOT_FOUND)
PDF generation error → 500 Internal Server Error (PDF_GENERATION_ERROR)
Permission denied → 403 Forbidden (PERMISSION_DENIED)
Business Rules:
Quote number is auto-generated, unique per organization
Quote validity period defaults to 30 days
Quote status starts as "DRAFT"
Quote can be sent to customer (status → "SENT")
Quote expires after validity period (status → "EXPIRED")
5.3 AI Agents - Bassan Bot (FR-003)
5.3.1 AI Lead Capture
FR-003-01: Process Visitor Inquiry
Priority: Must Have
Description: Bassan Bot processes website visitor inquiries and captures leads automatically using AI
Inputs:
Organization slug (required, string, path parameter)
Visitor message (required, string, 1-1000 characters)
Visitor info (optional, object):
name (optional, string)
email (optional, string, valid email format)
phone (optional, string, valid phone format)
Context (optional, object):
page (optional, string, current page URL)
referrer (optional, string, referrer URL)
userAgent (optional, string, browser user agent)
Outputs:
Response message (string, AI-generated or template)
Lead ID (UUID, if lead was created)
Capture status (enum: "captured", "pending", "insufficient_info")
Missing fields (array of strings, if insufficient info)
Processing:
Retrieve organization by slug
Validate organization is active
Extract lead information using AI (OpenAI GPT-4o-mini):
Build prompt with visitor message and existing info
Call OpenAI API with extraction prompt
Parse JSON response (name, email, phone, company, interest, notes)
Validate extracted information:
Check if name exists (extracted or provided)
Check if email OR phone exists (at least one required)
If sufficient information:
Create lead in CRM:
firstName, lastName (from extracted name)
email, phone (from extracted or provided)
company (from extracted)
status: "NEW"
source: "Bassan_bot:{page}" or "Bassan_bot:website"
notes: "{interest}. {notes}"
Generate thank you message (template-based or AI-generated)
Return: { response: thankYouMessage, leadId: uuid, captured: true }
If insufficient information:
Identify missing fields (name, email/phone)
Generate follow-up question using AI:
Build prompt with missing fields and conversation context
Call OpenAI API with follow-up prompt
Generate natural, friendly question in Arabic or English
Return: { response: followUpQuestion, captured: false, missingFields: [...] }
AI Processing Details:
Extraction Model: GPT-4o-mini
Extraction Temperature: 0.2 (low, for accurate extraction)
Extraction Response Format: JSON object
Follow-up Model: GPT-4o-mini
Follow-up Temperature: 0.7 (higher, for natural conversation)
Language Detection: Based on visitor message (Arabic/English)
Response Language: Match visitor's language
Error Handling:
Organization not found → 404 Not Found (ORGANIZATION_NOT_FOUND)
Organization inactive → 403 Forbidden (ORGANIZATION_INACTIVE)
OpenAI API error → 500 Internal Server Error (AI_SERVICE_ERROR)
Fallback: Use template-based follow-up question
Invalid message format → 400 Bad Request (VALIDATION_ERROR)
Business Rules:
Lead creation requires: name AND (email OR phone)
Lead source is "Bassan_bot:{page}" or "Bassan_bot:website"
Multiple inquiries from same visitor can update existing lead (match by email/phone)
Response time target: <2 seconds (AI call + processing)
Fallback: If AI unavailable, use template-based questions
Integration Points:
Event: lead.created → Workflow engine, Notification service
Auto-assignment: Based on organization's lead routing rules
5.3.2 Multi-Language Support
FR-003-02: Language Detection and Response
Priority: Should Have
Description: Bassan Bot detects and responds in visitor's language
Inputs:
Visitor message (required, string)
Outputs:
Detected language (enum: "ar", "en")
Response in detected language (string)
Processing:
Analyze visitor message:
Check for Arabic characters (Arabic Unicode range)
Check for English characters (Latin alphabet)
Count characters in each script
Determine primary language (script with more characters)
Generate response in detected language:
Use Arabic templates/prompts if Arabic detected
Use English templates/prompts if English detected
Return response in matching language
Error Handling:
Language detection failure → Default to English
Mixed language → Use primary script (>50% threshold)
Business Rules:
Arabic detection: Presence of Arabic Unicode characters
English detection: Latin alphabet characters
Default language: English (if undetectable)
Response always matches detected language
5.4 AI Agents - WhatsApp Bot (FR-004)
5.4.1 Conversation Handling
FR-004-01: Handle WhatsApp Message
Priority: Must Have
Description: WhatsApp Bot handles incoming messages with context awareness and memory
Inputs:
WhatsApp number (required, string, phone number format)
Message text (required, string, 1-4096 characters)
Message ID (required, string, WhatsApp message ID)
Timestamp (required, datetime, WhatsApp message timestamp)
Outputs:
AI-generated response (string)
Updated conversation record
Lead ID (UUID, if lead was created/updated)
Processing:
Get or create conversation:
Find customer by WhatsApp number (match by phone)
If customer not found, create customer record
Find or create conversation for customer+channel
Save incoming message:
Create message record in messages table
Sender: "CUSTOMER"
Link to conversation
Retrieve conversation history:
Get last 10 messages from conversation (for context)
Order by timestamp (ascending, for context building)
Generate AI response:
Build system prompt with organization context
Build conversation history (last 10 messages)
Call OpenAI API (GPT-4o-mini) with:
System prompt: Organization name, role (customer service assistant)
Conversation history: Previous messages (user/assistant roles)
Current message: Visitor's message
Temperature: 0.7 (for natural conversation)
Parse AI response
Save AI response:
Create message record in messages table
Sender: "AI"
Link to conversation
Send response via WhatsApp:
Call WhatsApp Business API
Send message to customer's WhatsApp number
Lead qualification check:
Analyze conversation for lead qualification signals
If qualified (interest expressed, contact info shared):
Create or update lead in CRM
Source: "whatsapp_bot"
Link to conversation
Return response and conversation details
AI Processing Details:
Model: GPT-4o-mini
Temperature: 0.7 (for natural conversation)
Context Window: Last 10 messages (~2000 tokens)
System Prompt: Includes organization name, role, conversation guidelines
Response Language: Match customer's language (Arabic/English)
Error Handling:
WhatsApp API error → Log error, retry with exponential backoff
OpenAI API error → Return default message ("عذراً، حدث خطأ. الرجاء المحاولة لاحقاً.")
Conversation not found → Create new conversation
Customer not found → Create new customer
Business Rules:
Conversation history limited to last 10 messages (for context)
Response time target: <3 seconds (AI call + WhatsApp send)
Conversation stays active until manually closed or 7 days of inactivity
Multiple conversations per customer allowed (new conversation if >7 days inactive)
Integration Points:
Event: conversation.message.received → Notification service
Event: lead.created (if qualified) → Workflow engine, Sales module
5.4.2 Human Handoff
FR-004-02: Transfer to Human Agent
Priority: Must Have
Description: WhatsApp Bot transfers conversation to human agent when confidence is low or customer requests
Inputs:
Conversation ID (required, UUID)
Handoff reason (required, enum: "low_confidence", "customer_request", "complex_query", "escalation")
Confidence level (optional, decimal, 0-1, if low_confidence)
Outputs:
Handoff confirmation
Assigned agent ID (UUID)
Notification sent to agent
Processing:
Retrieve conversation
Update conversation status:
Status: "TRANSFERRED"
AssignedType: "human"
AssignedToId: [assigned agent ID]
Assign to human agent:
Find available agent (round-robin, skills-based, or load-based)
If no available agent, queue conversation, notify manager
Send message to customer:
"Connecting you with a human agent. One moment please..."
Via WhatsApp API
Send notification to agent:
Push notification (if mobile app)
In-app notification
Email notification (optional)
Publish conversation.handoff event
Return handoff confirmation
Error Handling:
Conversation not found → 404 Not Found (CONVERSATION_NOT_FOUND)
No available agent → Queue conversation, return 202 Accepted (CONVERSATION_QUEUED)
Business Rules:
Handoff can be triggered by:
Low confidence (<0.7) in AI response
Customer explicitly requests human ("أريد التحدث مع شخص")
Complex query (detected by AI)
Escalation keyword detected
Agent assignment: Round-robin within support team
Conversation remains linked to original customer
Agent can see full conversation history
5.5 Omnichannel Communication (FR-005)
5.5.1 Unified Conversation View
FR-005-01: View All Conversations
Priority: Must Have
Description: Users can view all customer conversations across channels in unified interface
Inputs:
Organization ID (from context)
Channel filter (optional, enum: "whatsapp", "email", "web", "instagram")
Status filter (optional, enum: "ACTIVE", "RESOLVED", "TRANSFERRED")
Customer filter (optional, UUID, filter by customer)
Search query (optional, string, searches message text)
Pagination (limit, offset)
Outputs:
List of conversations (array)
Pagination metadata
Conversation fields:
id, customerId, channel, channelId, status
assignedToId, assignedType
lastMessage (text, timestamp, sender)
messageCount, unreadCount
createdAt, updatedAt
Processing:
Extract organization ID from CLS context
Build query with organization filter
Apply channel filter (if provided)
Apply status filter (if provided)
Apply customer filter (if provided)
Apply search query (searches message text in conversation)
Join with last message (for preview)
Join with message counts
Apply sorting (default: updatedAt desc, most recent first)
Apply pagination
Execute query
Return results
Error Handling:
Permission denied → 403 Forbidden (PERMISSION_DENIED)
Invalid filters → 400 Bad Request (VALIDATION_ERROR)
Business Rules:
Users can only see conversations in their organization
Conversations sorted by last activity (most recent first)
Last message preview shows first 100 characters
Unread count based on messages after user's last read timestamp
5.5.2 Channel Normalization
FR-005-02: Normalize Channel Message
Priority: Must Have
Description: System normalizes messages from different channels to unified format
Inputs:
Channel type (required, enum: "whatsapp", "email", "web", "instagram")
Raw message payload (required, object, channel-specific format)
Outputs:
Normalized message object (standard format)

Standard Format:
{
  channel: "whatsapp" | "email" | "web" | "instagram",
  from: string,        // Customer identifier (phone, email, session ID)
  to: string,          // Organization identifier
  message: string,     // Message text
  timestamp: Date,     // Message timestamp
  messageId: string,   // Channel-specific message ID
  metadata: {          // Channel-specific metadata
    subject?: string,  // Email subject
    attachments?: Array<{ url: string, type: string }>,
    // ... other channel-specific fields
  }
}

Processing:

Load channel adapter based on channel type
Extract message data from raw payload (channel-specific parsing)
Normalize to standard format:
Extract "from" (phone for WhatsApp, email for email, session ID for web)
Extract "to" (organization identifier)
Extract "message" (text content)
Extract "timestamp" (convert to UTC)
Extract "messageId" (channel-specific ID)
Extract metadata (channel-specific fields)
Return normalized message
Channel-Specific Parsing:
WhatsApp:

{
  from: payload.from,                    // Phone number
  to: organization.whatsappPhoneNumberId,
  message: payload.text?.body || "",
  timestamp: new Date(payload.timestamp * 1000),
  messageId: payload.id,
  metadata: {
    messageType: payload.type,
    // ... other WhatsApp fields
  }
}

Email:

{
  from: payload.from.address,
  to: payload.to[0].address,
  message: payload.text || payload.html,
  timestamp: new Date(payload.date),
  messageId: payload.messageId,
  metadata: {
    subject: payload.subject,
    attachments: payload.attachments,
    // ... other email fields
  }
}

Web Chat:

{
  from: payload.sessionId,
  to: organization.id,
  message: payload.text,
  timestamp: new Date(payload.timestamp),
  messageId: payload.messageId,
  metadata: {
    userAgent: payload.userAgent,
    page: payload.page,
    // ... other web fields
  }
}

Error Handling:
Unsupported channel → 400 Bad Request (UNSUPPORTED_CHANNEL)
Invalid payload format → 400 Bad Request (INVALID_PAYLOAD)
Parsing error → 500 Internal Server Error (PARSING_ERROR)
Business Rules:
All channels normalized to same format
Timestamps converted to UTC
Message text extracted (HTML stripped for email)
Metadata preserved for channel-specific features
5.6 Operations Management (FR-007)
5.6.1 Workflow Designer
FR-007-01: Create Workflow
Priority: Must Have
Description: Operations managers can create workflows using drag-and-drop interface (no-code)
Inputs:
Workflow name (required, string, 1-255 characters)
Workflow description (optional, string)
Workflow category (optional, string: "sales", "operations", "support", etc.)
Workflow steps (required, array):
Step ID (required, string, unique within workflow)
Step name (required, string)
Step type (required, enum: "START", "TASK", "APPROVAL", "CONDITION", "END")
Sequence (required, integer, order of steps)
Config (optional, object, step-specific configuration):
Task type, assignment rules, SLA hours
Approval roles, conditions
Condition logic (IF/THEN/ELSE)
Transitions (required, array):
From step ID (required, string)
To step ID (required, string)
Condition (optional, object, transition condition)
Trigger (optional, object):
Type (enum: "manual

    - Condition logic (IF/THEN/ELSE)
- Trigger (optional, object):
  - Type (enum: "manual", "event", "scheduled")
  - Event type (if event trigger: "lead.created", "opportunity.won", etc.)
  - Schedule (if scheduled trigger: cron expression)

**Outputs**:
- Workflow ID (UUID)
- Workflow definition (JSON)
- Validation results (warnings, errors)

**Processing**:
1. Validate workflow structure:
   - Must have START step
   - Must have END step
   - All steps must be reachable from START
   - No circular dependencies
   - All transitions must reference valid steps
2. Validate step definitions:
   - Task steps must have assignment rules
   - Approval steps must have approver roles
   - Condition steps must have condition logic
3. Validate transition logic:
   - Conditions must be valid (field, operator, value)
   - No dead-end steps (except END)
   - All paths lead to END
4. Validate workflow (test mode, if enabled):
   - Simulate workflow execution
   - Check for logical errors
5. Create workflow record in `workflows` table
6. Store workflow definition as JSON in `workflow.definition` field
7. Create workflow steps in `workflow_steps` table
8. Create workflow transitions in `workflow_transitions` table
9. Publish `workflow.created` event
10. Return workflow ID and definition

**Error Handling**:
- Invalid workflow structure → 400 Bad Request (`INVALID_WORKFLOW_STRUCTURE`)
- Circular dependency → 400 Bad Request (`CIRCULAR_DEPENDENCY`)
- Dead-end step → 400 Bad Request (`DEAD_END_STEP`)
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)

**Business Rules**:
- Workflow definition stored as JSON (flexible structure)
- Workflow versioning supported (version field)
- Workflow can be active or inactive
- Inactive workflows cannot be used in new instances
- Workflow changes require validation
- Workflow can be tested before activation

---

#### 5.6.2 Task Assignment

**FR-007-02**: Assign Task  
**Priority**: Must Have  
**Description**: System assigns tasks based on workflow rules

**Inputs**:
- Workflow instance ID (required, UUID)
- Current step ID (required, UUID)
- Entity data (required, object, context data for assignment)

**Outputs**:
- Task ID (UUID)
- Assigned user ID (UUID)
- Task details (title, description, dueDate, SLA)

**Processing**:
1. Retrieve workflow instance
2. Retrieve workflow definition
3. Retrieve current step definition
4. Evaluate transition conditions:
   - Get next step based on transition conditions
   - Evaluate conditions against entity data
   - Select transition path (IF/THEN/ELSE)
5. Determine next step
6. Evaluate assignment rules:
   - Load assignment rules from step config
   - Assignment methods: round-robin, skills-based, load-based, manual
   - Filter eligible users (skills, capacity, availability)
   - Select user (round-robin or load-based)
7. Create task:
   - Title: From step config or template
   - Description: From step config or template
   - AssignedToId: Selected user
   - Status: "PENDING"
   - Priority: From step config or workflow
   - DueDate: Current date + SLA hours (from step config)
   - SLAStart: Current timestamp
   - SLAEnd: Current timestamp + SLA hours
8. Start SLA clock
9. Send notification to assignee:
   - In-app notification
   - Email notification
   - Push notification (if mobile app)
10. Publish `task.created` event
11. Return task details

**Error Handling**:
- Workflow instance not found → 404 Not Found (`WORKFLOW_INSTANCE_NOT_FOUND`)
- No eligible assignee → 500 Internal Server Error (`NO_ELIGIBLE_ASSIGNEE`)
  - Escalate to manager
  - Create exception record
- Assignment error → 500 Internal Server Error (`ASSIGNMENT_ERROR`)

**Business Rules**:
- Assignment rules evaluated in order (first match wins)
- Round-robin assignment cycles through eligible users
- Load-based assignment selects user with lowest current load
- Skills-based assignment matches task requirements to user skills
- Capacity limits respected (user max tasks)
- SLA clock starts immediately on assignment

---

### 5.7 Analytics & Reporting (FR-012)

#### 5.7.1 Dashboard Data

**FR-012-01**: Get Dashboard Metrics  
**Priority**: Must Have  
**Description**: System provides real-time dashboard data for role-based dashboards

**Inputs**:
- Dashboard ID (required, UUID)
- Organization ID (from context)
- Date range (optional, startDate, endDate, default: current month)
- Filters (optional, object, widget-specific filters)

**Outputs**:
- Dashboard metrics (object):
  - Dashboard ID, name, description
  - Widgets (array):
    - Widget ID, type, title
    - Data (widget-specific format)
    - Last updated timestamp

**Widget Types**:
- **KPI Card**: Single metric (value, trend, target)
- **Chart**: Line, bar, pie chart (time series, categories)
- **Table**: Tabular data (rows, columns, pagination)
- **Pipeline**: Sales pipeline (stages, counts, values)
- **List**: Recent items (leads, tasks, tickets)

**Processing**:
1. Retrieve dashboard definition (from `dashboards` table)
2. Retrieve widgets for dashboard (from `widgets` table)
3. For each widget:
   a. Determine widget type and data source
   b. Build query based on widget configuration
   c. Apply filters (date range, organization, widget-specific)
   d. Execute query
   e. Format data for widget type:
      - KPI Card: { value, trend, target, unit }
      - Chart: { labels, datasets: [{ label, data }] }
      - Table: { columns, rows, pagination }
      - Pipeline: { stages: [{ name, count, value }] }
      - List: { items: [{ id, title, timestamp }] }
   f. Cache widget data (5 minutes TTL)
4. Return dashboard with all widget data

**Caching Strategy**:
- Widget data cached for 5 minutes (Redis)
- Cache key: `dashboard:${dashboardId}:widget:${widgetId}`
- Cache invalidation: On data change events (lead.created, task.completed, etc.)
- Real-time updates: WebSocket notifications for cached data

**Error Handling**:
- Dashboard not found → 404 Not Found (`DASHBOARD_NOT_FOUND`)
- Permission denied → 403 Forbidden (`PERMISSION_DENIED`)
- Widget query error → 500 Internal Server Error (`WIDGET_QUERY_ERROR`)
  - Return error widget with message

**Business Rules**:
- Dashboards are role-based (users see dashboards for their roles)
- Widget data is cached for performance (5 minutes)
- Cache is invalidated on relevant data changes
- Real-time updates available via WebSocket (optional)
- Widget queries are scoped to user's organization (enforced by CLS)

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

#### 6.1.1 Response Time

| Operation | Target (95th percentile) | Maximum | Measurement |
|-----------|--------------------------|---------|-------------|
| API Response | < 200ms | < 500ms | 95th percentile latency |
| Dashboard Load | < 1s | < 3s | Full dashboard render time |
| Report Generation | < 5s | < 30s | Report completion time |
| AI Response (Bassan Bot) | < 2s | < 5s | AI call + processing |
| AI Response (WhatsApp Bot) | < 3s | < 8s | AI call + WhatsApp send |
| Page Load (Web) | < 1s | < 3s | First contentful paint |
| Mobile App Launch | < 2s | < 5s | App startup time |

#### 6.1.2 Throughput

| Operation | Target | Maximum | Notes |
|-----------|--------|---------|-------|
| API Requests | 1000 req/sec per org | 5000 req/sec | Per organization |
| Concurrent Users | 1000 per org | 5000 per org | Active users |
| Database Queries | 5000 qps | 10000 qps | Total queries per second |
| Message Processing | 100 msg/sec | 500 msg/sec | WhatsApp/Email messages |
| Event Processing | 1000 events/sec | 5000 events/sec | Event bus throughput |

#### 6.1.3 Scalability

**Horizontal Scaling**:
- Application servers: Stateless, horizontally scalable
- Load balancing: Round-robin, health checks
- Auto-scaling: Based on CPU, memory, request rate
- Target: Scale from 1 to 10+ instances

**Database Scaling**:
- Read replicas: Support read replicas for read-heavy workloads
- Connection pooling: Prisma connection pool (100 connections)
- Partitioning: Table partitioning for large tables (future)
- Target: Support 1000+ organizations, 10M+ records

**Cache Scaling**:
- Redis cluster: Support Redis cluster mode
- Cache distribution: Consistent hashing
- Target: Handle 1M+ cache keys

**Organization Capacity**:
- Target: 1000+ organizations
- Users per organization: 10,000+ users
- Total users: 10M+ users (future)

---

### 6.2 Security Requirements

#### 6.2.1 Authentication

**Password Policy**:
- Minimum length: 8 characters
- Complexity: At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Expiration: Optional (90 days recommended)
- History: Last 5 passwords cannot be reused
- Storage: Bcrypt hashing (cost factor 10)

**Session Management**:
- Token type: JWT (JSON Web Token)
- Access token expiry: 1 hour
- Refresh token expiry: 30 days
- Token rotation: Refresh token rotated on use
- Session revocation: Supported (refresh token deletion)

**Multi-Factor Authentication** (Optional, Planned):
- Methods: SMS (TOTP), Authenticator app (TOTP)
- Enrollment: Optional per user
- Backup codes: 10 backup codes on enrollment

#### 6.2.2 Authorization

**Role-Based Access Control (RBAC)**:
- Roles: Organization-level roles with granular permissions
- Permissions: Resource:Action format (e.g., "sales:leads:read")
- Inheritance: Permissions are additive (user has union of all role permissions)
- Enforcement: API-level guards/middleware

**Tenant Isolation**:
- Strategy: Row-Level Security (RLS) + CLS (Continuation Local Storage)
- Enforcement: Database-level (RLS policies) + Application-level (CLS context)
- Data leakage prevention: Cross-tenant queries impossible

**API Security**:
- Authentication: OAuth 2.0 (Bearer token)
- Rate limiting: 1000 requests/hour per organization
- IP whitelisting: Optional per organization
- CORS: Configured per environment

#### 6.2.3 Data Protection

**Encryption at Rest**:
- Database: PostgreSQL encryption (AES-256)
- Files: Object storage encryption (S3, Azure Blob, GCS)
- Backups: Encrypted backups (AES-256)
- Keys: Managed by cloud provider (AWS KMS, Azure Key Vault)

**Encryption in Transit**:
- Protocol: TLS 1.3 for all communications
- Certificates: Managed by cloud provider (Let's Encrypt, AWS Certificate Manager)
- Certificate rotation: Automatic

**PII Protection**:
- Data masking: PII masked in logs
- Audit trails: PII in audit logs (encrypted)
- Data retention: Configurable retention policies
- Right to deletion: GDPR-compliant deletion

#### 6.2.4 Compliance

**GDPR Compliance**:
- Right to access: Users can export their data (JSON, CSV)
- Right to deletion: Users can request data deletion
- Data portability: Data export in machine-readable format
- Consent management: Cookie consent, data processing consent
- Data processing records: Maintained per organization

**CCPA Compliance**:
- Similar privacy rights: Access, deletion, portability
- Opt-out: Users can opt out of data sale (not applicable, no data sale)

**SOC 2** (Target):
- Security controls: Access controls, encryption, monitoring
- Availability controls: Backup, disaster recovery
- Processing integrity: Data validation, error handling
- Confidentiality: Data encryption, access controls
- Privacy: PII protection, consent management

**ISO 27001** (Target):
- Information security management system (ISMS)
- Risk management
- Security controls
- Continuous improvement

---

### 6.3 Reliability Requirements

#### 6.3.1 Availability

**Target Uptime**: 99.9% (8.76 hours downtime/year)

**Scheduled Maintenance**:
- Maximum: 4 hours/month
- Window: Low-traffic hours (weekend nights, 2-6 AM local time)
- Notification: 48 hours advance notice
- Impact: Read-only mode during maintenance (optional)

**Recovery Time Objective (RTO)**: 1 hour  
**Recovery Point Objective (RPO)**: 15 minutes

**Availability Monitoring**:
- Health checks: Every 1 minute
- Alerting: PagerDuty, email, SMS
- Escalation: On-call rotation

#### 6.3.2 Fault Tolerance

**Database Failover**:
- Primary-standby: Automatic failover to standby database
- Failover time: < 5 minutes
- Data loss: Zero (synchronous replication)

**Application Failover**:
- Load balancer: Health checks every 30 seconds
- Unhealthy instance: Removed from pool
- New instance: Auto-scaling launches new instance
- Failover time: < 2 minutes

**Error Handling**:
- Graceful degradation: Non-critical features disabled on error
- Retry logic: Exponential backoff (3 attempts)
- Circuit breaker: Open after 5 consecutive failures
- Fallback: Default responses for AI features

**Data Integrity**:
- Transaction support: ACID compliance (PostgreSQL)
- Audit trail: Complete change history
- Backup strategy: Daily full, hourly incremental
- Data validation: Input validation, business rule validation

---

### 6.4 Usability Requirements

#### 6.4.1 User Interface

**Responsive Design**:
- Mobile: 320px - 768px (smartphones, tablets)
- Tablet: 768px - 1024px
- Desktop: 1024px+ (laptops, desktops)
- Breakpoints: Mobile-first approach

**Accessibility**:
- Standard: WCAG 2.1 Level AA
- Keyboard navigation: Full keyboard support
- Screen readers: ARIA labels, semantic HTML
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: Visible focus indicators

**Internationalization**:
- Languages: Arabic (RTL), English (LTR)
- Date formats: Locale-specific (DD/MM/YYYY for Arabic, MM/DD/YYYY for English)
- Number formats: Locale-specific (Arabic numerals, thousands separators)
- Currency: Locale-specific (SAR, USD, etc.)

**User Experience**:
- Navigation: Intuitive navigation, breadcrumbs
- Loading states: Skeleton screens, progress indicators
- Error messages: Clear, actionable error messages
- Help: Contextual help, tooltips, user guide

**Theme Support**:
- Light Mode (Day Mode): Default theme with light backgrounds
- Dark Mode (Night Mode): Dark theme for low-light environments
- Theme Toggle: User-controlled theme switching
- Theme Persistence: User theme preference stored and applied across sessions
- System Preference Detection: Automatic detection of OS theme preference (optional)
- Smooth Transitions: Animated theme switching (300ms transition)
- Primary Theme Color: Purple (#9333EA) - maintained in both modes
- Theme-Aware Components: All UI components render correctly in both themes
- Color Contrast: WCAG 2.1 Level AA compliance maintained in both themes

#### 6.4.2 Documentation

**User Guide**:
- Complete user documentation (online, PDF)
- Video tutorials (key features)
- FAQ section
- Contextual help (inline help, tooltips)

**API Documentation**:
- OpenAPI 3.0 specification
- Interactive API explorer (Swagger UI)
- Code examples (cURL, JavaScript, Python)
- Authentication guide

**Admin Guide**:
- System administration guide
- Configuration guide
- Troubleshooting guide
- Best practices

**Training Materials**:
- Video tutorials
- Step-by-step guides
- Webinar recordings
- Certification program (planned)

---

### 6.5 Maintainability Requirements

#### 6.5.1 Code Quality

**Code Standards**:
- Language: TypeScript (strict mode)
- Linting: ESLint with recommended rules
- Formatting: Prettier (consistent formatting)
- Naming: Descriptive names, camelCase for variables, PascalCase for classes

**Test Coverage**:
- Unit tests: Minimum 80% coverage
- Integration tests: Critical paths covered
- E2E tests: Key user journeys covered
- Test framework: Jest (backend), Vitest (frontend, planned)

**Documentation**:
- Inline comments: JSDoc for functions, classes
- README: Project setup, development guide
- Architecture docs: ADR (Architecture Decision Records)
- API docs: OpenAPI specification

**Version Control**:
- Git: Version control (GitHub, GitLab)
- Branching: Git Flow (main, develop, feature branches)
- Commits: Conventional commits (feat:, fix:, docs:, etc.)
- Tags: Semantic versioning (v3.0.0)

#### 6.5.2 Monitoring

**Application Monitoring**:
- Error tracking: Sentry or similar (error logs, stack traces)
- Performance monitoring: APM (Application Performance Monitoring)
- Logging: Structured logging (JSON format)
- Metrics: Prometheus metrics (request rate, latency, errors)

**Logging**:
- Format: Structured JSON logs
- Levels: ERROR, WARN, INFO, DEBUG
- Aggregation: ELK Stack (Elasticsearch, Logstash, Kibana) or cloud logging
- Retention: 30 days (production), 7 days (development)

**Alerting**:
- Critical errors: Immediate alert (PagerDuty, SMS)
- Performance degradation: Alert if latency >500ms for 5 minutes
- Availability: Alert if uptime <99.9%
- Resource usage: Alert if CPU >80% or memory >80%

**Metrics**:
- Business metrics: Leads created, Opportunities won, Tasks completed
- Technical metrics: Request rate, latency, error rate, queue depth
- Infrastructure metrics: CPU, memory, disk, network

---

### 6.6 Portability Requirements

#### 6.6.1 Cloud Support

**Primary Cloud**: AWS
- Compute: EC2, ECS, Lambda
- Database: RDS PostgreSQL
- Cache: ElastiCache Redis
- Storage: S3
- CDN: CloudFront
- Monitoring: CloudWatch

**Secondary Clouds**:
- Azure: App Service, Azure Database for PostgreSQL, Azure Cache for Redis, Azure Blob Storage, Azure CDN
- GCP: Compute Engine, Cloud SQL, Memorystore, Cloud Storage, Cloud CDN

**Container Support**:
- Docker: Container images
- Kubernetes: Container orchestration (optional)
- Docker Compose: Local development

#### 6.6.2 Database Portability

**Database**: PostgreSQL (standard SQL)
- Migration: Prisma Migrate (SQL migrations)
- Data Export: JSON, CSV export
- Backup: pg_dump, cloud provider backups
- Restore: pg_restore, cloud provider restore

---

## 7. Appendices

### 7.1 Glossary

| Term | Definition |
|------|------------|
| **Lead** | Potential customer contact information |
| **Opportunity** | Qualified sales opportunity with estimated value |
| **Pipeline** | Sales stages from lead to closed deal |
| **Workflow** | Automated business process definition |
| **SLA** | Service Level Agreement (time-based commitment) |
| **Tenant** | Organization using the system (multi-tenant architecture) |
| **Context** | Conversation history and customer information |
| **Handoff** | Transfer from AI to human agent |
| **Bassan Bot** | AI-powered lead capture bot for websites |
| **WhatsApp Bot** | Conversational AI bot for WhatsApp Business |
| **Omnichannel** | Unified communication across multiple channels |
| **Channel Normalization** | Converting messages from different channels to unified format |
| **Event-Driven** | Architecture pattern using events for communication |
| **Multi-Tenancy** | Architecture supporting multiple isolated organizations |
| **RBAC** | Role-Based Access Control (permissions based on roles) |
| **CLS** | Continuation Local Storage (request-scoped context) |
| **RLS** | Row-Level Security (database-level tenant isolation) |

### 7.2 Data Models

#### 7.2.1 Lead Model
t
interface Lead {
  id: string;                    // UUID
  organizationId: string;        // UUID, foreign key
  firstName: string;             // Required
  lastName: string;              // Required
  email?: string;                // Optional, validated if provided
  phone?: string;                // Optional, validated if provided
  company?: string;              // Optional
  status: LeadStatus;            // NEW | CONTACTED | QUALIFIED | UNQUALIFIED | CONVERTED
  source?: string;               // "Bassan_bot", "whatsapp_bot", "website", etc.
  notes?: string;                // Optional
  ownerId?: string;              // UUID, foreign key to User
  createdAt: Date;               // Timestamp
  updatedAt: Date;               // Timestamp
}

enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUALIFIED = "QUALIFIED",
  UNQUALIFIED = "UNQUALIFIED",
  CONVERTED = "CONVERTED"
}#### 

7.2.2 Conversation Model

interface Conversation {
  id: string;                    // UUID
  organizationId: string;        // UUID, foreign key
  customerId: string;            // UUID, foreign key to Customer
  channel: ChannelType;          // whatsapp | email | web | instagram
  channelId: string;             // ID in the channel system (phone, email, session ID)
  status: ConversationStatus;    // ACTIVE | RESOLVED | TRANSFERRED
  assignedToId?: string;         // UUID, foreign key to User
  assignedType?: string;         // "ai" | "human"
  createdAt: Date;               // Timestamp
  updatedAt: Date;               // Timestamp
}

enum ChannelType {
  WHATSAPP = "whatsapp",
  EMAIL = "email",
  WEB = "web",
  INSTAGRAM = "instagram"
}

enum ConversationStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  TRANSFERRED = "TRANSFERRED"
}
#### 7.2.3 Message Model

interface Message {
  id: string;                    // UUID
  conversationId: string;        // UUID, foreign key
  text: string;                  // Message text
  sender: MessageSender;         // CUSTOMER | AI | HUMAN
  metadata?: Record<string, any>; // Channel-specific metadata
  timestamp: Date;               // Timestamp
}

enum MessageSender {
  CUSTOMER = "CUSTOMER",
  AI = "AI",
  HUMAN = "HUMAN"
}#### 7.2.4 Opportunity Model

interface Opportunity {
  id: string;                    // UUID
  organizationId: string;        // UUID, foreign key
  name: string;                  // Required
  leadId?: string;               // UUID, foreign key to Lead (optional)
  stage: OpportunityStage;       // QUALIFICATION | NEEDS_ANALYSIS | PROPOSAL | NEGOTIATION | CLOSED_WON | CLOSED_LOST
  probability: number;           // 0-100
  estimatedValue: number;        // Decimal, required
  expectedCloseDate?: Date;      // Optional, future date
  actualCloseDate?: Date;        // Optional, set when closed
  ownerId?: string;              // UUID, foreign key to User
  createdAt: Date;               // Timestamp
  updatedAt: Date;               // Timestamp
}

enum OpportunityStage {
  QUALIFICATION = "QUALIFICATION",
  NEEDS_ANALYSIS = "NEEDS_ANALYSIS",
  PROPOSAL = "PROPOSAL",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST"
}### 7.3 API Examples

#### 7.3.1 Create Lead

**Request**:
POST /api/v1/leads
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "phone": "+966501234567",
  "company": "Example Corp",
  "source": "Bassan_bot"
}**Response** (201 Created):
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "email": "ahmed@example.com",
  "phone": "+966501234567",
  "company": "Example Corp",
  "status": "NEW",
  "source": "Bassan_bot",
  "organizationId": "org-uuid",
  "createdAt": "2026-01-08T10:00:00Z",
  "updatedAt": "2026-01-08T10:00:00Z"
}#### 7.3.2 Bassan Bot Inquiry

**Request**:
POST /api/v1/Bassan/bot/:organizationSlug/inquire
Content-Type: application/json

{
  "message": "أريد معرفة المزيد عن خدماتكم",
  "name": "محمد",
  "email": "mohammed@example.com"
}**Response** (200 OK):son
{
  "response": "شكراً محمد! تم تسجيل معلوماتك بنجاح. سيقوم فريقنا بالتواصل معك قريباً.",
  "leadId": "123e4567-e89b-12d3-a456-426614174000",
  "captured": true
}**Response** (200 OK, Insufficient Info):son
{
  "response": "يمكنك إعطائي بريدك الإلكتروني أو رقم هاتفك للتواصل معك؟",
  "captured": false,
  "missingFields": ["contact"]
}#### 7.3.3 WhatsApp Webhook

**Request** (from WhatsApp):
POST /api/v1/Bassan/whatsapp/webhook
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "966501234567",
          "text": {
            "body": "مرحبا"
          },
          "id": "wamid.xxx",
          "timestamp": "1609459200"
        }],
        "metadata": {
          "phone_number_id": "phone_id_xxx"
        }
      }
    }]
  }]
}**Response** (200 OK):
{
  "status": "ok"
}#### 7.3.4 View Pipeline

**Request**:
GET /api/v1/pipeline?dateRange=2026-01-01,2026-01-31
Authorization: Bearer <ACCESS_TOKEN>**Response** (200 OK):
{
  "stages": [
    {
      "name": "QUALIFICATION",
      "count": 15,
      "totalValue": 150000,
      "weightedValue": 15000,
      "averageDealSize": 10000,
      "averageDays": 5
    },
    {
      "name": "PROPOSAL",
      "count": 8,
      "totalValue": 120000,
      "weightedValue": 84000,
      "averageDealSize": 15000,
      "averageDays": 12
    }
  ],
  "forecast": {
    "weightedValue": 99000,
    "totalValue": 270000,
    "totalCount": 23
  }
}### 7.4 User Stories Reference

This SRS integrates with the following user stories:

**Bassan.os Original Stories (56 stories)**:
- Sales: SALES-01 to SALES-10 (10 stories)
- Marketing: MKTG-01 to MKTG-10 (10 stories)
- Operations: OPS-01 to OPS-10 (10 stories)
- HR: HR-01 to HR-06 (6 stories)
- Finance: FIN-01 to FIN-05 (5 stories)
- Support: SUPP-01 to SUPP-06 (6 stories)
- Executive: EXEC-01 to EXEC-04 (4 stories)
- IT/Admin: IT-01 to IT-05 (5 stories)

**New User Stories (Bassan ERP Integration - 5 stories)**:
- Bassan-01: As a website visitor, I want to inquire about services via Bassan Bot, so I can get information 24/7
- Bassan-02: As a sales manager, I want leads captured by Bassan Bot, so I can qualify them in CRM
- Bassan-03: As a customer, I want to chat with WhatsApp Bot, so I can get instant responses
- Bassan-04: As a support agent, I want to see all customer conversations in one place, so I can provide consistent service
- Bassan-05: As a sales rep, I want WhatsApp conversations converted to leads, so I can follow up

**Total User Stories**: 61 stories (56 original + 5 new)

### 7.5 Business Requirements Reference

This SRS supports all 22 Business Requirements from Bassan.os BRD v2.2:

- BR-01: Multi-Organization Governance Support
- BR-02: Role-Based Authority Definition
- BR-03: Delegated Decision-Making Control
- BR-04: Configurable Workflow Creation
- BR-05: Conditional Routing Logic
- BR-06: Exception & Escalation Handling
- BR-07: Explicit Task Ownership
- BR-08: Evidence-Based Task Completion
- BR-09: Performance Attribution
- BR-10: Customer State Classification
- BR-11: Payment Status Awareness
- BR-12: Customer-to-Workflow Binding
- BR-13: Controlled External Collaboration
- BR-14: Cross-Company Deliverable Validation
- BR-15: External Performance Visibility
- BR-16: Multi-Employment Models
- BR-17: Commission & Contribution Tracking
- BR-18: Department-Level Performance Metrics
- BR-19: Cross-Department Conversion Visibility
- BR-20: Executive-Level Business Dashboards
- BR-21: Event-Driven Notifications
- BR-22: External Communication Integration

**Coverage**: 22/22 Requirements (100%)

### 7.6 Architecture Diagrams

#### 7.6.1 System Architecture
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Web    │  │  Mobile  │  │  Bassan   │  │  Admin   │  │
│  │   App    │  │  App     │  │  Widget  │  │ Console  │  │
│  │(Next.js) │  │  (PWA)   │  │  (JS)    │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   REST   │  │ GraphQL  │  │WebSocket │  │ Webhooks │  │
│  │   API    │  │   API    │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Application Layer                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │   Sales  │  │   AI     │  │  Ops     │  │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Marketing │  │ Support  │  │ Finance  │  │   HR     │  │
│  │ Module   │  │  Module  │  │ Module   │  │ Module   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │Analytics │  │Omnichannel│ │Integration│              │
│  │ Module   │  │  Module   │ │  Module   │              │
│  └──────────┘  └──────────┘  └──────────┘               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Integration Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Event   │  │ Channel  │  │ External │  │  Queue   │  │
│  │   Bus    │  │Adapters  │  │   APIs   │  │ (BullMQ) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Redis   │  │  Object  │  │  Vector  │  │
│  │          │  │  (Cache) │  │ Storage  │  │    DB    │  │
│  │          │  │          │  │   (S3)   │  │(Future)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
7.6.2 AI Agents Flow
Bassan Bot Flow:
Website Visitor
    │
    ▼
Bassan Bot Widget (JavaScript)
    │
    ▼
POST /api/v1/Bassan/bot/:slug/inquire
    │
    ▼
AI Service (OpenAI GPT-4o-mini)
    │
    ├─► Extract Lead Info (JSON)
    │
    ├─► Validate Info
    │   │
    │   ├─► Sufficient → Create Lead in CRM
    │   │              → Return Thank You Message
    │   │
    │   └─► Insufficient → Generate Follow-up Question (AI)
    │                    → Return Question
    │
    ▼
Response to Visitor

WhatsApp Bot Flow:
Customer (WhatsApp)
    │
    ▼
WhatsApp Business API
    │
    ▼
POST /api/v1/Bassan/whatsapp/webhook
    │
    ▼
Conversation Service
    │
    ├─► Get/Create Conversation
    │
    ├─► Save Customer Message
    │
    ├─► Get Conversation History (Last 10 messages)
    │
    ├─► AI Service (OpenAI GPT-4o-mini)
    │   │
    │   ├─► System Prompt (Organization context)
    │   ├─► Conversation History (Context)
    │   └─► Generate Response
    │
    ├─► Save AI Response
    │
    ├─► Send via WhatsApp API
    │
    └─► Lead Qualification Check
        │
        └─► If Qualified → Create/Update Lead
    │
    ▼
Response to Customer (WhatsApp)


7.6.3 Omnichannel Architecture

┌─────────────────────────────────────────────────────────────┐
│                    Channel Sources                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │WhatsApp  │  │  Email   │  │   Web    │  │Instagram │  │
│  │ Business │  │   SMTP   │  │   Chat   │  │   API    │  │
│  │   API    │  │          │  │  Widget  │  │          │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │             │             │             │         │
│       └─────────────┴─────────────┴─────────────┘         │
│                       │                                    │
│                       ▼                                    │
│          ┌─────────────────────────┐                      │
│          │  Channel Normalizer     │                      │
│          │  (Unified Format)       │                      │
│          └───────────┬─────────────┘                      │
│                      │                                    │
│                      ▼                                    │
│          ┌─────────────────────────┐                      │
│          │  Conversation Service   │                      │
│          │  (Unified View)         │                      │
│          └───────────┬─────────────┘                      │
│                      │                                    │
│          ┌───────────┴───────────┐                        │
│          │                       │                        │
│          ▼                       ▼                        │
│  ┌───────────────┐     ┌───────────────┐                │
│  │   Database    │     │   AI Service  │                │
│  │ (Conversation)│     │  (Response)   │                │
│  └───────────────┘     └───────────────┘                │
└─────────────────────────────────────────────────────────────┘

---

### 7.7 Theme System Specifications

#### 7.7.1 Color Palette (Purple Theme)

**Primary Colors**:
```css
--primary-purple-50: #faf5ff;
--primary-purple-100: #f3e8ff;
--primary-purple-200: #e9d5ff;
--primary-purple-300: #d8b4fe;
--primary-purple-400: #c084fc;
--primary-purple-500: #a855f7;  /* Main Purple */
--primary-purple-600: #9333ea;  /* Primary Brand */
--primary-purple-700: #7c3aed;  /* Dark Purple */
--primary-purple-800: #6d28d9;
--primary-purple-900: #581c87;
--primary-purple-950: #3b0764;
```

**Light Mode (Day Mode) Colors**:
```css
/* Backgrounds */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-sidebar: #6d28d9;  /* Dark Purple Sidebar */
--bg-surface: #ffffff;
--bg-hover: #f3f4f6;

/* Text */
--text-primary: #111827;
--text-secondary: #6b7280;
--text-on-purple: #ffffff;

/* Borders */
--border-color: #e5e7eb;
--border-focus: #9333ea;
```

**Dark Mode (Night Mode) Colors**:
```css
/* Backgrounds */
--bg-primary: #0f172a;  /* Slate 900 */
--bg-secondary: #1e293b;  /* Slate 800 */
--bg-sidebar: #4c1d95;  /* Very Dark Purple */
--bg-surface: #1e293b;
--bg-hover: #334155;

/* Text */
--text-primary: #f9fafb;  /* Slate 50 */
--text-secondary: #cbd5e1;  /* Slate 300 */
--text-on-purple: #ffffff;

/* Borders */
--border-color: #334155;
--border-focus: #a78bfa;
```

#### 7.7.2 Theme Switching Implementation

**User Preference Storage**:
- User theme preference stored in user profile/settings
- Database field: `users.theme_preference` (enum: "light", "dark", "system")
- Default: "system" (respects OS preference)

**Theme Toggle UI**:
- Toggle button in header/navigation bar
- Icon: Sun (light mode) / Moon (dark mode)
- Smooth transition animation (300ms)
- Visual feedback on toggle

**System Preference Detection**:
- Uses `prefers-color-scheme` CSS media query
- JavaScript: `window.matchMedia('(prefers-color-scheme: dark)')`
- Automatic detection on first visit (if no user preference)
- User can override system preference

**Component Theme Support**:
- All UI components support both themes
- CSS variables for dynamic theming
- Tailwind CSS dark mode classes (`.dark:` prefix)
- Theme-aware icons and images
- Contrast ratios maintained in both themes (WCAG AA compliance)

#### 7.7.3 Theme Application

**CSS Variables Approach**:
- CSS custom properties (CSS variables) for theme colors
- Theme switching updates CSS variables
- No need to reload page
- Smooth transitions

**Implementation Pattern**:
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #111827;
  /* Light mode defaults */
}

:root[data-theme="dark"],
.dark {
  --bg-primary: #0f172a;
  --text-primary: #f9fafb;
  /* Dark mode overrides */
}
```

**Tailwind CSS Configuration**:
- Dark mode: `class` strategy (`.dark` class on root element)
- All color utilities support dark mode variants
- Example: `bg-white dark:bg-slate-900`

#### 7.7.4 Theme Consistency

**Brand Identity**:
- Primary Purple (#9333EA) maintained in both themes
- Darker/lighter variants for contrast in each theme
- Sidebar always uses dark purple (darker shade in dark mode)
- Accent colors adjusted for visibility in each theme

**Accessibility**:
- Contrast ratios: Minimum 4.5:1 for text (WCAG AA)
- Dark mode: Text on dark backgrounds maintains readability
- Light mode: Text on light backgrounds maintains readability
- Focus indicators visible in both themes

**Component States**:
- Hover states adjusted for each theme
- Active/focused states clearly visible
- Disabled states maintain visibility
- Error/success/warning colors adjusted for each theme

---

### 7.8 Pricing Strategy Alternatives

**Current Pricing Model** (User-based):
- Basic: $149/month (up to 25 employees)
- Professional: $299/month (up to 50 employees)
- Enterprise: $599/month (unlimited employees)

**Alternative Pricing Models**:

**Option 1: Customer Volume-Based Pricing** (Similar to Genie ERP):
- Starter: $29/month
  - Up to 1,000 customers/month
  - Basic features
  - Single bot instance
- Professional: $79/month
  - Up to 5,000 customers/month
  - Advanced features
  - Multiple bot instances (up to 3)
  - Audio message support
  - AI Studio access
- Enterprise: $199/month
  - Up to 20,000 customers/month
  - All features
  - Unlimited bot instances
  - Priority support
  - Custom integrations

**Option 2: Hybrid Pricing Model**:
- Base subscription (user-based) + Usage-based add-ons
- Base: $99/month (up to 10 users)
- Add-ons:
  - Additional users: $10/user/month
  - Customer volume overage: $0.01/customer/month
  - Advanced AI features: $49/month
  - Multiple bots: $29/bot/month

**Option 3: Feature-Based Tiers**:
- Essentials: $49/month
  - Core CRM features
  - Single bot (Website)
  - Email integration
- Growth: $149/month
  - All Essentials features
  - Multiple bots (Website, WhatsApp)
  - Instagram & Facebook automation
  - AI Studio
- Scale: $399/month
  - All Growth features
  - Unlimited bots
  - Advanced analytics
  - Custom workflows
  - Priority support

**Recommendation**: Consider implementing Option 2 (Hybrid Model) for maximum flexibility, or Option 1 for competitive positioning similar to Genie ERP.

---

Document Approval
Role	Name	Signature	Date
Product Owner			
Technical Lead			
Architecture Board			
CTO			
Business Analyst			
End of Document
Document Version: 3.1
Last Updated: 2026-01-08
Next Review: 2026-02-08
Document Status: Draft - For Review
Total Pages: ~150 (estimated when printed)

ملف SRS شامل يغطي:

1. **النظام الحالي (Bassan.os v2.2)**:
   - 56 User Stories
   - 76 Database Entities
   - 22 Business Requirements
   - جميع الوحدات (Sales, Marketing, Operations, HR, Finance, Support, Analytics, IT)

2. **الميزات الجديدة (Bassan ERP v3.1)**:
   - AI Agents (Bassan Bot, WhatsApp Bot)
   - AI Studio (Visual Bot Builder)
   - Omnichannel Communication (Instagram, Facebook Messenger)
   - Theme System (Light/Dark Mode, Purple Theme)
   - Subscription & Billing Management
   - Usage Quotas & Rate Limiting
   - Data Export & Import System
   - Customer Onboarding & Training
   - Tenant Self-Service Portal
   - Tenant Health & Success Metrics
   - Tenant Performance Monitoring
   - Payment Management & Dunning
   - CRM Enhancements

3. **التفاصيل الفنية**:
   - Requirements تفصيلية
   - API Examples
   - Data Models
   - Architecture Diagrams

4. **Non-Functional Requirements**:
   - Performance
   - Security
   - Reliability
   - Usability
