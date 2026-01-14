# Bassan.os Domain Glossary

## Document Control

- **Document Title**: Domain Glossary
- **Version**: 1.0
- **Date**: 2026-01-08
- **Status**: Approved
- **Context**: Definitions of business and technical terms used across the Bassan.os platform.

---

## A

### Activity

A distinct action performed by a user or system within Bassan.os (e.g., "Log Call", "Update Status"). Activities are logged in the **Audit Trail** and often linked to **Tasks** or **Leads**.

### API Layer

The interface allowing different software components to communicate. Bassan.os uses a mix of **REST**, **GraphQL**, and **WebSockets**.

### Assignment Rule

A logic set used to automatically distribute **Leads** or **Tasks** to **Users** based on criteria like geography, workload, or skill set.

## B

### Blueprint (Workflow)

A template definition for a process (e.g., "Sales Process", "Support Ticket Flow"). It defines the **States**, **Transitions**, and **Triggers** that a workflow instance will follow.

## C

### Campaign

A marketing initiative designed to generate **Leads**. Tracks budget, duration, and performance metrics (ROI, conversion rate).

### Commission

Monetary compensation calculated for a **Sales Representative** based on **Commission Rules** (e.g., % of deal value, flat fee) upon successful closure of an **Opportunity**.

### Commission Rule

A configurable formula defining how commissions are calculated. Can include tiers, accelerators, and caps.

## D

### Dashboard

A customizable visual interface displaying **Widgets** (charts, metrics, lists) relevant to a user's role.

### Dead Lead

A **Lead** that has been disqualified or has shown no activity for a specified period and is moved to a "Dead" state.

## E

### Escalation

The process of raising the priority of a **Task** or **Ticket** and notifying higher-level management when an **SLA** is breached or a specific trigger condition is met.

### Evidence

Proof of work attached to a **Task** or **Commission** claim. Can be a file (image, PDF), location data, or a system link.

## F

### Forecast

A prediction of future revenue based on the value and probability of open **Opportunities** in the **Pipeline**.

## L

### Lead

A potential customer or sales prospect. Contains contact info, source, and score. Can be converted into an **Opportunity**.

### Lead Scoring

An automated system assigning a numerical value to a **Lead** based on profile data and engagement behaviors, indicating their likelihood to convert.

## M

### Multi-Tenancy

Architecture where a single instance of the software serves multiple **Organizations** (tenants), keeping their data logically isolated.

## O

### Opportunity

A qualified **Lead** with a potential deal value and probability of closure. Tracks stages in the sales pipeline (e.g., "Qualification", "Proposal", "Closed Won").

### Organization (Tenant)

A distinct customer entity using the Bassan.os platform. Data for one organization is isolated from others via **Row-Level Security**.

## P

### Permission

A granular access right (e.g., `user:create`, `report:view`) assigned to a **Role**.

### Pipeline

The series of stages an **Opportunity** passes through from creation to closure.

## Q

### Quote

A formal statement of price and terms for specific products/services, sent to a customer. Can be converted to an **Invoice** or **Order**.

## R

### Role

A collection of **Permissions** assigned to a **User** (e.g., "Admin", "Sales Rep", "Manager").

### RPO (Recovery Point Objective)

The maximum acceptable amount of data loss measured in time (e.g., 5 minutes).

### RTO (Recovery Time Objective)

The maximum acceptable amount of time to restore the system after a disaster (e.g., 1 hour).

## S

### SLA (Service Level Agreement)

A commitment to complete a **Task** or resolve a **Ticket** within a specific timeframe. Breaches trigger **Escalations**.

### Stage

A distinct step in a **Workflow** or **Pipeline** (e.g., "New", "In Progress", "Completed").

## T

### Task

A unit of work assigned to a **User**. Has a due date, priority, status, and optional **SLA**.

### Tenant

See **Organization**.

### Ticket

A support request or issue reported by a user or customer.

## U

### User

An individual with access credentials to the Bassan.os system. Belongs to an **Organization** and has one or more **Roles**.

## W

### Webhook

A mechanism for the system to send real-time data to external systems when specific events occur.

### Widget

A component on a **Dashboard** displaying specific data (e.g., "Sales Funnel Chart", "Recent Tasks List").

### Workflow

An automated process managing the lifecycle of an entity (e.g., Lead, Task). Defined by a **Blueprint**.

---
