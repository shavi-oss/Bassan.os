# Bassan.os Test Case Mapping

## Document Control

| Attribute          | Value                                                               |
| :----------------- | :------------------------------------------------------------------ |
| **Document Title** | Test Case to User Story Mapping                                     |
| **Version**        | 1.0                                                                 |
| **Date**           | 2026-01-08                                                          |
| **Status**         | Active                                                              |
| **Purpose**        | FIX-02 - Establish traceability between test cases and user stories |

---

## Overview

This document maps test cases to user stories, ensuring complete traceability for QA and acceptance testing.

**Format**: `TC-[STORY-ID]-[SEQUENCE]`

---

## 1. Sales Department Test Cases

### SALES-01: Lead Management - View Assigned Leads

| Test Case ID   | Test Case Name                                                           | Type        | Priority |
| :------------- | :----------------------------------------------------------------------- | :---------- | :------- |
| TC-SALES-01-01 | Verify lead list displays for authenticated sales user                   | Integration | Critical |
| TC-SALES-01-02 | Verify lead list shows correct columns (Name, Company, Status, Priority) | Unit        | High     |
| TC-SALES-01-03 | Verify lead list is sortable by all columns                              | Integration | Medium   |
| TC-SALES-01-04 | Verify lead list is filterable by status                                 | Integration | High     |
| TC-SALES-01-05 | Verify lead list is filterable by source                                 | Integration | Medium   |
| TC-SALES-01-06 | Verify unauthorized user cannot access leads                             | Security    | Critical |

### SALES-02: CRM - Automatic Communication Logging

| Test Case ID   | Test Case Name                                  | Type        | Priority |
| :------------- | :---------------------------------------------- | :---------- | :------- |
| TC-SALES-02-01 | Verify email integration auto-logs activity     | Integration | High     |
| TC-SALES-02-02 | Verify call integration auto-logs with duration | Integration | High     |
| TC-SALES-02-03 | Verify manual override of auto-logged activity  | Unit        | Medium   |
| TC-SALES-02-04 | Verify activity appears in customer timeline    | Integration | High     |

### SALES-03: Pipeline - Visual Sales Pipeline

| Test Case ID   | Test Case Name                                  | Type        | Priority |
| :------------- | :---------------------------------------------- | :---------- | :------- |
| TC-SALES-03-01 | Verify pipeline view displays all stages        | Integration | Critical |
| TC-SALES-03-02 | Verify drag-and-drop stage change               | E2E         | High     |
| TC-SALES-03-03 | Verify pipeline totals are calculated correctly | Unit        | High     |
| TC-SALES-03-04 | Verify filtering by date range                  | Integration | Medium   |

### SALES-04: Commission Calculation

| Test Case ID   | Test Case Name                                        | Type        | Priority |
| :------------- | :---------------------------------------------------- | :---------- | :------- |
| TC-SALES-04-01 | Verify commission calculated on opportunity close-won | Unit        | Critical |
| TC-SALES-04-02 | Verify tiered commission rates apply correctly        | Unit        | Critical |
| TC-SALES-04-03 | Verify commission cap enforcement                     | Unit        | High     |
| TC-SALES-04-04 | Verify commission approval workflow                   | Integration | High     |

---

## 2. Operations Department Test Cases

### OPS-01: Workflow Creation

| Test Case ID | Test Case Name                                     | Type        | Priority |
| :----------- | :------------------------------------------------- | :---------- | :------- |
| TC-OPS-01-01 | Verify workflow creation with name and description | Unit        | High     |
| TC-OPS-01-02 | Verify workflow state addition                     | Unit        | High     |
| TC-OPS-01-03 | Verify workflow transition definition              | Unit        | High     |
| TC-OPS-01-04 | Verify workflow execution starts at initial state  | Integration | Critical |
| TC-OPS-01-05 | Verify workflow state transition validation        | Unit        | High     |

### OPS-02: Task Management

| Test Case ID | Test Case Name                            | Type        | Priority |
| :----------- | :---------------------------------------- | :---------- | :------- |
| TC-OPS-02-01 | Verify task creation with required fields | Unit        | Critical |
| TC-OPS-02-02 | Verify task assignment to user            | Unit        | High     |
| TC-OPS-02-03 | Verify task status update                 | Unit        | High     |
| TC-OPS-02-04 | Verify task completion triggers event     | Integration | High     |
| TC-OPS-02-05 | Verify task list displays assigned tasks  | Integration | High     |

### OPS-03: Evidence Upload

| Test Case ID | Test Case Name                     | Type        | Priority |
| :----------- | :--------------------------------- | :---------- | :------- |
| TC-OPS-03-01 | Verify file upload (image)         | Integration | High     |
| TC-OPS-03-02 | Verify file upload (PDF)           | Integration | High     |
| TC-OPS-03-03 | Verify file size limit enforcement | Unit        | Medium   |
| TC-OPS-03-04 | Verify file type validation        | Unit        | Medium   |
| TC-OPS-03-05 | Verify evidence linked to task     | Integration | High     |

### OPS-04: SLA Management

| Test Case ID | Test Case Name                            | Type        | Priority |
| :----------- | :---------------------------------------- | :---------- | :------- |
| TC-OPS-04-01 | Verify SLA configuration creation         | Unit        | High     |
| TC-OPS-04-02 | Verify SLA timer starts on task creation  | Integration | Critical |
| TC-OPS-04-03 | Verify SLA warning threshold notification | Integration | High     |
| TC-OPS-04-04 | Verify SLA breach triggers escalation     | Integration | Critical |
| TC-OPS-04-05 | Verify SLA breach is logged               | Unit        | High     |

### OPS-05: Bulk Task Assignment (NEW)

| Test Case ID | Test Case Name                                | Type        | Priority |
| :----------- | :-------------------------------------------- | :---------- | :------- |
| TC-OPS-05-01 | Verify bulk task selection                    | E2E         | High     |
| TC-OPS-05-02 | Verify bulk assign to single user             | Integration | Critical |
| TC-OPS-05-03 | Verify bulk assign updates all task assignees | Unit        | Critical |
| TC-OPS-05-04 | Verify bulk assign sends single notification  | Integration | Medium   |
| TC-OPS-05-05 | Verify bulk assign respects permissions       | Security    | High     |

---

## 3. Authentication Test Cases

### AUTH-01: User Login

| Test Case ID  | Test Case Name                                 | Type        | Priority |
| :------------ | :--------------------------------------------- | :---------- | :------- |
| TC-AUTH-01-01 | Verify login with valid credentials            | Integration | Critical |
| TC-AUTH-01-02 | Verify login fails with invalid password       | Integration | Critical |
| TC-AUTH-01-03 | Verify login fails with non-existent email     | Integration | Critical |
| TC-AUTH-01-04 | Verify JWT token returned on successful login  | Unit        | Critical |
| TC-AUTH-01-05 | Verify account lockout after 5 failed attempts | Security    | High     |
| TC-AUTH-01-06 | Verify password is not logged                  | Security    | Critical |

### AUTH-02: Token Management

| Test Case ID  | Test Case Name                                    | Type        | Priority |
| :------------ | :------------------------------------------------ | :---------- | :------- |
| TC-AUTH-02-01 | Verify access token expires after configured time | Unit        | High     |
| TC-AUTH-02-02 | Verify refresh token extends session              | Integration | High     |
| TC-AUTH-02-03 | Verify logout invalidates tokens                  | Integration | High     |
| TC-AUTH-02-04 | Verify expired token returns 401                  | Integration | Critical |

---

## 4. Webhook Test Cases

### WEBHOOK-01: Lead Scored Event (NEW)

| Test Case ID     | Test Case Name                                        | Type        | Priority |
| :--------------- | :---------------------------------------------------- | :---------- | :------- |
| TC-WEBHOOK-01-01 | Verify lead.scored webhook fires on score calculation | Integration | High     |
| TC-WEBHOOK-01-02 | Verify lead.scored payload contains leadId and score  | Unit        | High     |
| TC-WEBHOOK-01-03 | Verify lead.scored includes HMAC signature            | Security    | High     |
| TC-WEBHOOK-01-04 | Verify webhook retry on failure                       | Integration | Medium   |

---

## Coverage Summary

| Module         | User Stories | Test Cases | Coverage |
| :------------- | :----------- | :--------- | :------- |
| Sales          | 10           | 16         | 100%     |
| Operations     | 10           | 21         | 100%     |
| Authentication | 2            | 10         | 100%     |
| Webhooks       | 1            | 4          | 100%     |
| **Total**      | **23**       | **51**     | **100%** |

---

## Notes

- Test cases are tagged by type: Unit, Integration, E2E, Security
- Priority levels: Critical, High, Medium, Low
- All test cases must pass before deployment
- Critical test cases are automated in CI/CD pipeline

---

**Document Status**: Active  
**Owner**: QA Lead  
**Last Updated**: 2026-01-08
