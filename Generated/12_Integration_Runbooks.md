# Bassan.os Integration Runbooks – Enterprise Edition v2.2

## Document Control

- **Document Title**: Bassan.os Hub Service (Integration Hub)
- **Version**: 2.2
- **Status**: Approved for Development
- **Date**: 2024-1-20
- **Context**: Integration procedures for third-party systems
- **Linked Documents**: 
  - 5_Technical_Architecture.md (v2.1)
  - 7_API_Specifications.md (v2.1)
  - 8_Deployment_Architecture.md (v2.1)
  - 10_Runbooks_Security.md (v2.1)

## Table of Contents

1. [Introduction](#1-introduction)
2. [Integration Overview](#2-integration-overview)
3. [Shopify Integration](#3-shopify-integration)
4. [Payment Gateway Integration](#4-payment-gateway-integration)
5. [Email Provider Integration](#5-email-provider-integration)
6. [SMS Provider Integration](#6-sms-provider-integration)
7. [Webhook Management](#7-webhook-management)
8. [API Integration](#8-api-integration)
9. [Error Handling & Retry Logic](#9-error-handling--retry-logic)
10. [Integration Testing](#10-integration-testing)
11. [Integration Monitoring](#11-integration-monitoring)
12. [Troubleshooting Guide](#12-troubleshooting-guide)

---

## 1. Introduction

### 1.1 Purpose

This document provides detailed procedures for integrating Bassan.os with third-party systems, including e-commerce platforms, payment gateways, communication providers, and other external services.

### 1.2 Integration Scope

Bassan.os integrates with:
- **E-commerce Platforms**: Shopify, WooCommerce, Magento
- **Payment Gateways**: Stripe, PayPal, local payment processors
- **Communication Providers**: SendGrid, Twilio, AWS SES/SNS
- **Authentication Providers**: Auth0, Okta, SAML providers
- **Analytics Tools**: Google Analytics, Mixpanel, Amplitude

### 1.3 Integration Principles

- **Security-First**: All integrations use secure authentication and encryption
- **Resilient**: Robust error handling and retry mechanisms
- **Observable**: Complete logging and monitoring of all integrations
- **Testable**: Comprehensive testing before production deployment
- **Maintainable**: Clear documentation and versioning of integrations

---

## 2. Integration Overview

### 2.1 Supported Integrations

| Category | Services | Status |
|----------|----------|--------|
| **E-commerce** | Shopify, WooCommerce, Magento | Active |
| **Payment** | Stripe, PayPal, Mada, STC Pay | Active |
| **Email** | SendGrid, AWS SES, Mailgun | Active |
| **SMS** | Twilio, AWS SNS, local providers | Active |
| **Analytics** | Google Analytics, Mixpanel, Amplitude | In Progress |
| **Storage** | AWS S3, Azure Blob, Google Cloud Storage | Active |
| **Auth** | Auth0, Okta, SAML | In Progress |

### 2.2 Integration Architecture

The Integration Hub Service acts as the central point for all third-party integrations, providing:

- Unified interface for external systems
- Standardized request/response handling
- Centralized error handling and retry logic
- Monitoring and logging for all integrations
- Security layer for authentication and authorization

### 2.3 Integration Patterns

**1. Webhook Pattern**
- External systems send webhooks to Bassan.os
- HMAC signature verification for security
- Idempotent processing to handle duplicates
- Async processing via message queue

**2. API Call Pattern**
- Bassan.os calls external APIs
- Rate limiting and throttling
- Retry with exponential backoff
- Circuit breaker for failing services

**3. Polling Pattern**
- For systems without webhooks
- Configurable polling intervals
- Incremental sync with last sync timestamp
- Error handling with retry logic

---

## 3. Shopify Integration

### 3.1 Integration Overview

**Purpose**: Sync orders, products, and customer data between Bassan.os and Shopify stores.

**Data Flow**:
```
Shopify → Webhook → Integration Hub → Core API → Database
Bassan.os → API → Shopify
```

### 3.2 Setup Procedure

**Step 1: Install Shopify App**
- Navigate to Shopify Admin
- Go to Apps → Manage private apps
- Create new app with required scopes:
  - read_products, write_products
  - read_orders, write_orders
  - read_customers, write_customers
  - read_inventory, write_inventory

**Step 2: Configure Integration**
Store configuration in environment variables:
- SHOPIFY_SHOP_NAME
- SHOPIFY_API_KEY
- SHOPIFY_PASSWORD
- SHOPIFY_WEBHOOK_SECRET
- SHOPIFY_API_VERSION

**Step 3: Register Webhooks**
Register webhooks for the following events:
- orders/create
- orders/updated
- orders/cancelled
- products/create
- products/update
- customers/create
- customers/update

### 3.3 Webhook Processing

**Webhook Verification**
All incoming webhooks must be verified using HMAC signature:
- Extract signature from X-Shopify-Hmac-Sha256 header
- Compute HMAC of payload using webhook secret
- Compare signatures using timing-safe comparison
- Reject webhooks with invalid signatures

**Order Processing Flow**
1. Verify webhook signature
2. Check for duplicate orders using Shopify order ID
3. Transform Shopify order to Bassan.os format
4. Create order in Bassan.os database
5. Trigger downstream processes via event bus
6. Log successful processing

### 3.4 Sync Strategies

**Initial Full Sync**
- Fetch all orders from Shopify (paginated, 250 per page)
- Process each order through standard flow
- Track sync progress in database
- Handle rate limits (40 requests per minute)

**Incremental Sync**
- Fetch orders created/updated since last sync
- Process only changed orders
- Update last sync timestamp
- Run every 15 minutes

**Conflict Resolution**
- Server timestamp takes precedence
- Shopify data is source of truth for orders
- Bassan.os data is source of truth for custom fields

---

## 4. Payment Gateway Integration

### 4.1 Supported Payment Gateways

| Gateway | Status | Features |
|---------|--------|----------|
| **Stripe** | Active | Cards, Apple Pay, Google Pay |
| **PayPal** | Active | PayPal accounts, cards |
| **Mada** | In Progress | Saudi debit cards |
| **STC Pay** | In Progress | Saudi mobile payments |

### 4.2 Stripe Integration

**Setup Configuration**
Required environment variables:
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

**Payment Flow**
1. Create Payment Intent on server
2. Return client secret to frontend
3. Frontend confirms payment using Stripe.js
4. Stripe sends webhook on completion
5. Bassan.os updates order status

**Webhook Events**
Handle the following events:
- payment_intent.succeeded
- payment_intent.payment_failed
- invoice.payment_succeeded
- invoice.payment_failed

### 4.3 PayPal Integration

**Setup Configuration**
Required environment variables:
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- PAYPAL_MODE (sandbox/live)

**Payment Flow**
1. Create PayPal Order on server
2. Return order ID to frontend
3. Frontend approves payment using PayPal SDK
4. Server captures payment
5. PayPal sends webhook on completion

---

## 5. Email Provider Integration

### 5.1 Supported Providers

| Provider | Status | Use Cases |
|----------|--------|-----------|
| **SendGrid** | Active | Transactional emails, marketing |
| **AWS SES** | Active | High-volume emails, cost-effective |
| **Mailgun** | Backup | Backup provider, spam filtering |

### 5.2 SendGrid Integration

**Setup Configuration**
Required environment variables:
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- SENDGRID_FROM_NAME

**Email Templates**
Store templates in SendGrid with IDs:
- welcome-email
- password-reset
- task-assignment
- invoice-generated
- payment-received

**Sending Emails**
1. Load email template from SendGrid
2. Populate template with dynamic data
3. Send via SendGrid API
4. Log email status in database
5. Handle delivery events via webhooks

### 5.3 AWS SES Integration

**Setup Configuration**
Required environment variables:
- AWS_SES_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

**Email Sending**
1. Verify sender email/domain in AWS SES
2. Create SES client with credentials
3. Send email via SES API
4. Track delivery via SES notifications
5. Handle bounces and complaints

---

## 6. SMS Provider Integration

### 6.1 Supported Providers

| Provider | Status | Use Cases |
|----------|--------|-----------|
| **Twilio** | Active | International SMS, MMS |
| **AWS SNS** | Active | High-volume SMS, cost-effective |
| **Local Providers** | In Progress | Regional SMS providers |

### 6.2 Twilio Integration

**Setup Configuration**
Required environment variables:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

**SMS Templates**
Define templates for common messages:
- verification-code
- task-assignment
- payment-reminder
- appointment-reminder

**Sending SMS**
1. Load SMS template
2. Populate template with dynamic data
3. Send via Twilio API
4. Log SMS status in database
5. Handle delivery status via webhooks

### 6.3 AWS SNS Integration

**Setup Configuration**
Required environment variables:
- AWS_SNS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

**SMS Sending**
1. Create SNS client with credentials
2. Send SMS via SNS API
3. Track delivery via SNS notifications
4. Handle delivery failures and retries

---

## 7. Webhook Management

### 7.1 Webhook Registration

**Registration Process**
1. Define webhook endpoint in Integration Hub
2. Configure external system to send webhooks
3. Store webhook configuration in database
4. Implement signature verification
5. Add webhook processing logic

**Webhook Configuration**
Store the following for each webhook:
- External system identifier
- Webhook URL
- Secret key for signature verification
- Events to subscribe to
- Processing status
- Last received timestamp

### 7.2 Webhook Processing

**Processing Flow**
1. Receive webhook from external system
2. Verify signature (if applicable)
3. Check for duplicate events
4. Parse webhook payload
5. Transform to internal format
6. Process business logic
7. Acknowledge receipt
8. Log processing result

**Idempotency**
- Use event ID for deduplication
- Store processed event IDs in database
- Check for existing events before processing
- Return 200 OK for duplicate events

---

## 8. API Integration

### 8.1 API Client Configuration

**Base Configuration**
- Set base URL for each API
- Configure timeout (default: 30 seconds)
- Set retry policy (exponential backoff)
- Add authentication headers
- Configure rate limiting

**Example Configuration**
```typescript
const apiClient = axios.create({
  baseURL: process.env.EXTERNAL_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.EXTERNAL_API_KEY}`
  }
});
```

### 8.2 API Request Handling

**Request Flow**
1. Validate request parameters
2. Add authentication headers
3. Apply rate limiting
4. Send request to external API
5. Handle response
6. Transform response data
7. Cache response (if applicable)
8. Return result

**Error Handling**
- Handle network errors
- Handle timeout errors
- Handle rate limit errors
- Handle authentication errors
- Handle validation errors
- Log all errors with context

---

## 9. Error Handling & Retry Logic

### 9.1 Error Classification

**Transient Errors** (retryable):
- Network timeouts
- Rate limit exceeded
- Service unavailable (5xx)
- Connection errors

**Permanent Errors** (non-retryable):
- Authentication failures
- Authorization failures
- Validation errors
- Not found errors
- Bad request errors

### 9.2 Retry Strategy

**Exponential Backoff**
- Initial delay: 1 second
- Maximum delay: 60 seconds
- Maximum retries: 5
- Backoff factor: 2

**Retry Logic**
1. Check if error is retryable
2. Calculate delay using exponential backoff
3. Wait for delay period
4. Retry request
5. If max retries exceeded, log error and notify

### 9.3 Circuit Breaker

**Circuit Breaker States**
- Closed: Normal operation
- Open: Requests fail immediately
- Half-Open: Test if service has recovered

**Circuit Breaker Configuration**
- Failure threshold: 5 failures
- Timeout: 60 seconds
- Half-open attempts: 3

---

## 10. Integration Testing

### 10.1 Unit Testing

**Test Coverage**
- Test webhook signature verification
- Test data transformation logic
- Test error handling
- Test retry logic
- Test circuit breaker

### 10.2 Integration Testing

**Test Scenarios**
- Test with sandbox/test environments
- Test webhook delivery
- Test API calls
- Test error scenarios
- Test retry mechanisms

### 10.3 End-to-End Testing

**Test Flows**
- Test complete integration flows
- Test with real external systems (sandbox)
- Test data synchronization
- Test error recovery
- Test monitoring and alerting

---

## 11. Integration Monitoring

### 11.1 Metrics to Track

**Performance Metrics**
- Request/response times
- Error rates
- Retry rates
- Circuit breaker state
- Queue depth

**Business Metrics**
- Number of successful integrations
- Number of failed integrations
- Data synchronization lag
- Webhook delivery rate

### 11.2 Alerting

**Critical Alerts**
- Integration error rate > 5%
- Circuit breaker open
- Webhook not received for > 1 hour
- API response time > 10 seconds

**Warning Alerts**
- Integration error rate > 1%
- Retry rate > 10%
- Data sync lag > 30 minutes

---

## 12. Troubleshooting Guide

### 12.1 Common Issues

**Webhook Not Received**
- Check webhook URL is correct
- Verify webhook is registered in external system
- Check firewall/network settings
- Verify signature verification logic

**API Calls Failing**
- Check API credentials are valid
- Verify rate limits not exceeded
- Check request format
- Review error messages

**Data Sync Issues**
- Check last sync timestamp
- Verify data transformation logic
- Check for conflicts
- Review error logs

### 12.2 Debugging Steps

1. Check integration logs
2. Verify configuration
3. Test with sandbox environment
4. Check external system status
5. Review error messages
6. Test individual components
7. Check network connectivity
8. Verify authentication

### 12.3 Escalation Path

1. Level 1: Check documentation and logs
2. Level 2: Contact integration support team
3. Level 3: Contact external system support
4. Level 4: Escalate to engineering management

---

## Appendix A: Integration Configuration

### A.1 Environment Variables

**Shopify**
- SHOPIFY_SHOP_NAME
- SHOPIFY_API_KEY
- SHOPIFY_PASSWORD
- SHOPIFY_WEBHOOK_SECRET
- SHOPIFY_API_VERSION

**Stripe**
- STRIPE_PUBLISHABLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

**PayPal**
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- PAYPAL_MODE

**SendGrid**
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- SENDGRID_FROM_NAME

**Twilio**
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER

### A.2 API Endpoints

**Integration Hub**
- POST /integrations/shopify/webhooks/{event}
- POST /integrations/stripe/webhooks/{event}
- POST /integrations/paypal/webhooks/{event}
- GET /integrations/status
- POST /integrations/sync/{system}

---

## Appendix B: Integration Checklists

### B.1 Shopify Integration Checklist

- [ ] Create Shopify private app
- [ ] Configure required scopes
- [ ] Store credentials in environment variables
- [ ] Register webhooks
- [ ] Implement webhook verification
- [ ] Implement order processing
- [ ] Test webhook delivery
- [ ] Test data sync
- [ ] Monitor integration health

### B.2 Payment Gateway Checklist

- [ ] Create payment gateway account
- [ ] Configure API credentials
- [ ] Implement payment flow
- [ ] Register webhooks
- [ ] Implement webhook processing
- [ ] Test payment flow
- [ ] Test error handling
- [ ] Monitor payment success rate

### B.3 Email Provider Checklist

- [ ] Create email provider account
- [ ] Verify sender email/domain
- [ ] Configure API credentials
- [ ] Create email templates
- [ ] Implement email sending
- [ ] Test email delivery
- [ ] Configure webhook events
- [ ] Monitor delivery rates

### B.4 SMS Provider Checklist

- [ ] Create SMS provider account
- [ ] Purchase phone number (if required)
- [ ] Configure API credentials
- [ ] Create SMS templates
- [ ] Implement SMS sending
- [ ] Test SMS delivery
- [ ] Configure webhook events
- [ ] Monitor delivery rates
