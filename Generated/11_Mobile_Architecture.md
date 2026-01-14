# Bassan.os Mobile Architecture – Enterprise Edition v2.2

## Document Control

- **Document Title**: Bassan.os Mobile Architecture
- **Version**: 2.2
- **Status**: Approved for Development
- **Date**: 2024-01-20
- **Context**: Aligned with Technical Architecture v2.1, API Specifications v2.1, and UI/UX Specs
- **Coverage**: Complete mobile application architecture for iOS and Android
- **Linked Documents**: 
  - 5_Technical_Architecture.md (v2.1)
  - 7_API_Specifications.md (v2.1)
  - 2_Personas_and_User_Stories.md (v2.1)
  - BDR/New folder/🎨 مواصفات الواجهات الأمامية (UIUX VODA.txt)

## Table of Contents

1. [Introduction](#1-introduction)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Component Architecture](#4-component-architecture)
5. [State Management](#5-state-management)
6. [Offline-First Strategy](#6-offline-first-strategy)
7. [Authentication & Security](#7-authentication--security)
8. [API Integration](#8-api-integration)
9. [Push Notifications](#9-push-notifications)
10. [Performance Optimization](#10-performance-optimization)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment & Release](#12-deployment--release)
13. [Mobile-Specific Workflows](#13-mobile-specific-workflows)

---

## 1. Introduction

### 1.1 Purpose

This document defines the complete architecture for the Bassan.os mobile application (iOS and Android), designed to provide full functionality for field agents, remote workers, and executives who need access to the platform on mobile devices.

### 1.2 Mobile App Scope

The mobile application provides functionality for:
- **Sales Representatives**: Lead management, opportunity tracking, commission viewing
- **Field Operations**: Task execution, evidence upload, status updates
- **Executives**: Dashboard viewing, report access, approval workflows
- **Remote Workers**: Task acceptance, time tracking, performance monitoring

### 1.3 Design Principles

- **Offline-First**: Core functionality available without internet
- **Responsive**: Optimized for various screen sizes and orientations
- **Secure**: Enterprise-grade security with biometric authentication
- **Performant**: Fast load times, smooth animations, efficient data usage
- **Consistent**: UI/UX aligned with web application (Vodafone-inspired design)

---

## 2. Technology Stack

### 2.1 Framework & Language

| Component | Technology | Version | Justification |
|-----------|-------------|-----------|---------------|
| **Framework** | React Native | 0.73+ | Cross-platform, native performance, large ecosystem |
| **Language** | TypeScript | 5.x | Type safety, better tooling, maintainability |
| **State Management** | Zustand | Latest | Lightweight, simple API, TypeScript support |
| **Navigation** | React Navigation | 6.x | Standard navigation, deep linking support |
| **Networking** | Axios | Latest | Promise-based, interceptors, cancellation |

### 2.2 UI Components

| Component | Technology | Version | Justification |
|-----------|-------------|-----------|---------------|
| **UI Library** | React Native Paper | Latest | Material Design, customizable, accessible |
| **Icons** | Vector Icons | Latest | Consistent icon set, customizable |
| **Charts** | Victory Native | Latest | Native performance, responsive |
| **Forms** | React Hook Form | Latest | Performance, validation, TypeScript support |
| **Image Handling** | Fast Image | Latest | Caching, progressive loading, memory efficiency |

### 2.3 Storage & Data

| Component | Technology | Version | Justification |
|-----------|-------------|-----------|---------------|
| **Local Database** | WatermelonDB | Latest | Fast, offline-first, reactive queries |
| **Async Storage** | AsyncStorage | Latest | Simple key-value storage, persistence |
| **Secure Storage** | React Native Keychain/Keystore | Latest | Secure credential storage, biometric support |
| **File Storage** | React Native FS | Latest | File system access, evidence uploads |

### 2.4 Native Features

| Feature | Technology | Purpose |
|---------|-------------|---------|
| **Biometrics** | React Native Biometrics | Secure authentication |
| **Camera** | React Native Camera | Evidence capture |
| **Location** | React Native Geolocation | Task location tracking |
| **Push Notifications** | React Native Firebase | Real-time alerts |
| **Background Tasks** | React Native Background Tasks | Sync when app in background |

---

## 3. Architecture Overview

### 3.1 Architectural Pattern

The mobile application follows a **Clean Architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Presentation Layer           │
│  (Screens, Components, Navigation)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Domain Layer               │
│   (Use Cases, Business Logic)      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Data Layer                 │
│ (Repositories, API, Local DB)      │
└─────────────────────────────────────┘
```

### 3.2 Key Architectural Decisions

**1. Offline-First Design**
- Local database as primary data source
- API as secondary, syncs when available
- Optimistic UI updates for immediate feedback
- Conflict resolution strategy for offline changes

**2. Component-Based Architecture**
- Reusable UI components library
- Screen composition from components
- Consistent styling and behavior
- Easy testing and maintenance

**3. Dependency Injection**
- Service layer injected into screens
- Testable architecture
- Easy mocking for unit tests
- Clear dependency graph

---

## 4. Component Architecture

### 4.1 Core Components

| Component | Description | Props | State |
|-----------|-------------|---------|--------|
| **AuthWrapper** | Authentication state management | children, onAuthChange | isAuthenticated, user |
| **ScreenContainer** | Standard screen layout | title, actions, children | isLoading, error |
| **DataTable** | Reusable data table | columns, data, onRowPress | selectedRows, sortConfig |
| **FormInput** | Standard form input | label, value, onChange, error | value, isValid, isTouched |
| **ActionButton** | Standard action button | title, onPress, variant | isLoading, disabled |
| **StatusBadge** | Status indicator | status, type | - |
| **LoadingSpinner** | Loading indicator | size, color | - |
| **ErrorBoundary** | Error handling | children, fallback | hasError |

### 4.2 Screen Components

| Screen | Purpose | Key Components |
|--------|---------|-----------------|
| **LoginScreen** | User authentication | LoginForm, BiometricButton, ForgotPasswordLink |
| **DashboardScreen** | Main dashboard view | DashboardCards, Charts, QuickActions |
| **LeadsListScreen** | Lead management | SearchBar, FilterBar, LeadsTable, LeadDetailModal |
| **TaskListScreen** | Task management | TaskCard, FilterBar, TaskDetailModal, EvidenceUpload |
| **CommissionScreen** | Commission viewing | CommissionChart, CommissionList, FilterBar |
| **ProfileScreen** | User profile | ProfileCard, SettingsList, LogoutButton |

### 4.3 Navigation Structure

```
Tab Navigation (Bottom):
├── Dashboard
├── Tasks
├── Leads
├── Commissions
└── Profile

Stack Navigation (within each tab):
├── List Screen
│   ├── Detail Screen
│   │   ├── Edit Screen
│   │   └── Related Items Screen
│   └── Create Screen
└── Settings Screen
```

---

## 5. State Management

### 5.1 Global State (Zustand)

```typescript
// Global Store Structure
interface AppState {
  // Auth State
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  };

  // UI State
  ui: {
    isLoading: boolean;
    error: Error | null;
    theme: 'light' | 'dark';
    language: 'en' | 'ar';
  };

  // Data State
  data: {
    leads: Lead[];
    tasks: Task[];
    commissions: Commission[];
    lastSync: string | null;
  };
}
```

### 5.2 Local State (React Hooks)

- **useState**: Component-specific state
- **useReducer**: Complex state logic
- **useForm**: Form state management (React Hook Form)
- **useQuery**: Server state (React Query)
- **useMutation**: Server mutations (React Query)

### 5.3 State Synchronization

**Sync Strategy**:
1. **Immediate Sync**: User-initiated actions (create, update, delete)
2. **Periodic Sync**: Background sync every 15 minutes
3. **On-Resume Sync**: Sync when app returns to foreground
4. **Manual Sync**: User-triggered refresh

**Conflict Resolution**:
- Server timestamp takes precedence
- Last-write-wins for non-critical data
- Manual resolution for critical conflicts (with user prompt)

---

## 6. Offline-First Strategy

### 6.1 Data Storage Architecture

```
┌─────────────────────────────────────┐
│      Application State            │
│    (Zustand Store)              │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐    ┌───▼──────────┐
│  API    │    │  Local DB    │
│ (Online) │    │ (WatermelonDB) │
└──────────┘    └───────────────┘
                      │
              ┌─────────▼──────────┐
              │  AsyncStorage     │
              │ (Preferences, Auth)│
              └───────────────────┘
```

### 6.2 Offline Functionality

**Available Offline**:
- View dashboard (cached data)
- List and view leads
- View and update tasks
- View commissions
- User profile

**Requires Online**:
- Create new leads (queued for sync)
- Upload evidence (queued for sync)
- Submit tasks (queued for sync)
- Refresh data
- Sync offline changes

### 6.3 Sync Mechanism

**Sync Queue**:
```typescript
interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: 'lead' | 'task' | 'evidence';
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
}
```

**Sync Process**:
1. Check network connectivity
2. Process sync queue (FIFO)
3. For each item:
   - Send to API
   - On success: Update local DB, mark as completed
   - On failure: Increment retry count, requeue
4. Update last sync timestamp
5. Notify user of sync status

### 6.4 Data Freshness

**Cache Strategy**:
- Dashboard data: 5 minutes
- Leads list: 15 minutes
- Task details: 30 minutes
- User profile: 1 hour
- Reference data: 24 hours

**Stale Data Handling**:
- Show cached data with indicator
- Auto-refresh when online
- Manual refresh option
- Progressive loading for large datasets

---

## 7. Authentication & Security

### 7.1 Authentication Flow

```
┌─────────────┐
│  App Start  │
└──────┬──────┘
       │
┌──────▼──────┐
│ Check Token  │
│  in Storage  │
└──────┬──────┘
       │
  ┌────┴────┐
  │         │
Valid    Invalid
  │         │
┌──▼────┐  ┌──▼──────────┐
│Dashboard│  │Login Screen │
└────────┘  └──┬─────────┘
                 │
        ┌────────┴────────┐
        │                 │
   Password       Biometric
        │                 │
   ┌───▼────┐      ┌───▼────┐
   │API Auth │      │Local Auth│
   └───┬────┘      └───┬────┘
       │                │
   ┌───▼────────────────▼────┐
   │   Store Token & User     │
   └───────────────────────────┘
```

### 7.2 Security Measures

**Authentication**:
- JWT token storage in secure storage (Keychain/Keystore)
- Biometric authentication (Face ID, Touch ID, fingerprint)
- Session timeout (configurable, default 8 hours)
- Multi-device support with device management

**Data Protection**:
- Encryption at rest (local database)
- HTTPS for all API calls
- Certificate pinning for API calls
- Sensitive data never logged

**Authorization**:
- Role-based access control
- Permission checks on all actions
- Server-side validation for all requests
- Automatic token refresh

### 7.3 Session Management

**Session Lifecycle**:
1. **Login**: Token stored, user data cached
2. **Active**: Periodic token refresh (every 45 minutes)
3. **Idle**: Auto-logout after configurable timeout (default 8 hours)
4. **Logout**: Token cleared, local data secured
5. **Token Expiry**: Automatic re-authentication prompt

**Multi-Device Support**:
- Device registration on login
- Device list in user profile
- Remote logout capability
- Session management per device

---

## 8. API Integration

### 8.1 API Client Configuration

```typescript
// API Client Setup
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const apiClient = axios.create({
  baseURL: 'https://api.bassan.os/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, refresh or logout
      await handleTokenRefresh();
    }
    return Promise.reject(error);
  }
);
```

### 8.2 API Service Layer

```typescript
// Repository Pattern
class LeadRepository {
  private apiClient: ApiClient;
  private localDB: LocalDatabase;

  async getLeads(): Promise<Lead[]> {
    // Try local first
    const localLeads = await this.localDB.get('leads');
    if (localLeads) return localLeads;

    // Fallback to API
    const response = await this.apiClient.get('/leads');
    await this.localDB.set('leads', response.data);
    return response.data;
  }

  async createLead(lead: Partial<Lead>): Promise<Lead> {
    // Optimistic update
    const tempId = generateTempId();
    const newLead = { ...lead, id: tempId };
    await this.localDB.add('leads', newLead);

    try {
      // API call
      const response = await this.apiClient.post('/leads', lead);
      // Update local DB with server response
      await this.localDB.update('leads', tempId, response.data);
      return response.data;
    } catch (error) {
      // Queue for sync
      await this.syncQueue.add({
        action: 'create',
        entity: 'lead',
        payload: lead,
      });
      throw error;
    }
  }
}
```

### 8.3 Offline Request Handling

```typescript
// Offline Request Manager
class OfflineRequestManager {
  private syncQueue: SyncQueue;

  async executeRequest<T>(
    request: () => Promise<T>,
    fallback: () => T,
    queueOffline?: boolean
  ): Promise<T> {
    if (await this.isOnline()) {
      try {
        return await request();
      } catch (error) {
        if (queueOffline) {
          await this.queueForLater(request);
        }
        return fallback();
      }
    } else {
      if (queueOffline) {
        await this.queueForLater(request);
      }
      return fallback();
    }
  }

  async processQueue(): Promise<void> {
    const items = await this.syncQueue.getAll();
    for (const item of items) {
      try {
        await item.request();
        await this.syncQueue.markCompleted(item.id);
      } catch (error) {
        await this.syncQueue.incrementRetry(item.id);
      }
    }
  }
}
```

---

## 9. Push Notifications

### 9.1 Notification Architecture

```
┌─────────────────────────────────────┐
│        Firebase Cloud Messaging    │
│         (Push Provider)           │
└────────────┬────────────────────┘
             │
             │ Push
             │
┌────────────▼────────────────────┐
│     Mobile App Device          │
│   (Firebase SDK)              │
└────────────┬────────────────────┘
             │
             │ Process
             │
┌────────────▼────────────────────┐
│     Notification Handler        │
│   (In-App Display)            │
└─────────────────────────────────┘
```

### 9.2 Notification Types

| Type | Trigger | Payload | Action |
|------|---------|---------|--------|
| **Task Assignment** | New task assigned | taskId, priority | Open task detail |
| **Task Reminder** | SLA approaching | taskId, dueDate | Show reminder |
| **Commission Update** | Commission calculated | commissionId, amount | Open commission |
| **Lead Assignment** | New lead assigned | leadId, priority | Open lead detail |
| **Approval Required** | Approval workflow | approvalId, type | Open approval screen |
| **System Alert** | System announcement | title, message | Show alert |

### 9.3 Notification Handling

```typescript
// Notification Handler
import messaging from '@react-native-firebase/messaging';

class NotificationHandler {
  async initialize(): Promise<void> {
    // Request permission
    const authStatus = await messaging().requestPermission();

    // Get token
    const token = await messaging().getToken();
    await this.registerDeviceToken(token);

    // Foreground messages
    messaging().onMessage(async (remoteMessage) => {
      this.displayInAppNotification(remoteMessage);
    });

    // Background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      this.handleBackgroundNotification(remoteMessage);
    });

    // Notification open
    messaging().onNotificationOpenApp((remoteMessage) => {
      this.navigateToScreen(remoteMessage.data);
    });
  }

  private async registerDeviceToken(token: string): Promise<void> {
    await apiClient.post('/notifications/register', {
      deviceToken: token,
      platform: Platform.OS,
    });
  }

  private displayInAppNotification(message: any): void {
    // Show in-app notification
    // Update relevant screen
    // Play sound if enabled
  }

  private handleBackgroundNotification(message: any): Promise<void> {
    // Process data update
    // Sync with local database
    // Schedule local notification if needed
  }

  private navigateToScreen(data: any): void {
    // Navigate to appropriate screen
    // Pass parameters
    // Handle deep linking
  }
}
```

---

## 10. Performance Optimization

### 10.1 Rendering Performance

**Optimization Techniques**:
- **Memoization**: React.memo for expensive components
- **Virtualization**: FlatList for large lists
- **Lazy Loading**: Code splitting for screens
- **Image Optimization**: Fast Image with caching
- **Animation Optimization**: Reanimated for smooth animations

**Performance Targets**:
- First contentful paint: < 1.5s
- Time to interactive: < 3s
- Frame rate: 60 FPS for smooth animations
- List scrolling: No dropped frames

### 10.2 Data Performance

**Optimization Techniques**:
- **Pagination**: Cursor-based pagination for large datasets
- **Caching**: Local database caching with TTL
- **Debouncing**: Input debouncing for search
- **Throttling**: API request throttling
- **Compression**: Gzip compression for API responses

**Performance Targets**:
- API response time: < 500ms (p95)
- Local query time: < 100ms
- Sync time: < 30s for 100 items
- Database size: < 100MB for typical usage

### 10.3 Network Performance

**Optimization Techniques**:
- **Request Batching**: Batch multiple operations
- **Delta Sync**: Only sync changed data
- **Compression**: Compress large payloads
- **CDN**: Use CDN for static assets
- **Prefetching**: Prefetch likely data

**Performance Targets**:
- Data usage: < 50MB/day for typical user
- Offline sync time: < 30s
- Image load time: < 2s for 1MB image
- API latency: < 300ms (p95)

---

## 11. Testing Strategy

### 11.1 Unit Testing

**Framework**: Jest + React Native Testing Library

**Coverage Requirements**:
- Components: 80%+
- Utilities: 90%+
- Services: 85%+
- Repositories: 85%+

**Test Categories**:
- Component rendering
- User interactions
- State changes
- Error handling
- Edge cases

### 11.2 Integration Testing

**Framework**: Detox (gray-box E2E testing)

**Test Scenarios**:
- Authentication flows
- Data synchronization
- Offline/online transitions
- API integration
- Push notifications
- Navigation flows

### 11.3 Performance Testing

**Tools**:
- Flipper for performance profiling
- React Profiler for component performance
- Lighthouse for web-based testing

**Metrics**:
- App startup time
- Screen transition time
- List scrolling performance
- Memory usage
- Battery consumption

---

## 12. Deployment & Release

### 12.1 Build Configuration

**iOS**:
- Xcode 15+
- iOS 14+ target
- Bitcode enabled
- App Thinning (device-specific builds)
- TestFlight for beta testing

**Android**:
- Android Studio Hedgehog
- Android 8+ target
- APK and App Bundle
- Play Store Internal Testing for beta

### 12.2 Release Process

**Versioning**: Semantic versioning (MAJOR.MINOR.PATCH)

**Release Types**:
1. **Alpha**: Internal testing only
2. **Beta**: TestFlight/Play Store Internal
3. **RC**: Release Candidate for stakeholders
4. **Production**: Public release

**Release Checklist**:
- [ ] All tests passing
- [ ] Code review completed
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Documentation updated
- [ ] Release notes prepared
- [ ] Staged rollout configured

### 12.3 App Store Requirements

**iOS App Store**:
- App Store Connect setup
- Screenshots for all device sizes
- App preview videos
- Privacy policy URL
- Age rating questionnaire
- In-app purchase configuration (if applicable)

**Google Play Store**:
- Play Console setup
- High-res icon (512x512)
- Feature graphic (1024x500)
- Screenshots for all sizes
- Content rating questionnaire
- Privacy policy URL
- Target audience and content

---

## 13. Mobile-Specific Workflows

### 13.1 Sales Representative Workflow

**Lead Management**:
1. Receive push notification for new lead
2. Open lead from notification
3. View lead details (cached or fetch)
4. Update lead status (queued if offline)
5. Add notes or activities
6. Convert to opportunity
7. Track commission progress

**Commission Tracking**:
1. View commission dashboard
2. Filter by date, customer, status
3. View commission details
4. See evidence linked to commission
5. Track payment status

### 13.2 Field Operations Workflow

**Task Execution**:
1. Receive task assignment notification
2. View task details and requirements
3. Navigate to location (if applicable)
4. Execute task
5. Capture evidence (photos, documents)
6. Mark task complete (queued if offline)
7. Get customer signature (if required)

**Evidence Upload**:
1. Capture photo or select document
2. Compress image
3. Upload to server (queued if offline)
4. Link to task
5. Verify upload status

### 13.3 Executive Workflow

**Dashboard Monitoring**:
1. View executive dashboard
2. Check KPIs and metrics
3. Drill down into departments
4. View performance trends
5. Export reports

**Approval Workflows**:
1. Receive approval request notification
2. Review request details
3. Approve or reject
4. Add comments
5. Submit decision (queued if offline)

---

## Appendix A: References

### A.1 Related Documents

- 5_Technical_Architecture.md (v2.1)
- 7_API_Specifications.md (v2.1)
- 2_Personas_and_User_Stories.md (v2.1)
- BDR/New folder/🎨 مواصفات الواجهات الأمامية (UIUX VODA.txt
- 10_Runbooks_Security.md (v2.1)

### A.2 External Resources

- React Native Documentation: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/
- WatermelonDB: https://watermelondb.dev/
- Firebase: https://firebase.google.com/docs

---

## Document History

| Version | Date | Author | Changes |
|---------|-------|---------|---------|
| 2.2 | 2024-01-20 | Documentation Team | Initial v2.2 release, complete mobile architecture |
| 2.1 | 2024-01-08 | Architecture Board | Enhanced from v2.0, added offline-first strategy |
| 2.0 | 2024-01-20 | Principal Software Architect | Initial mobile architecture |
