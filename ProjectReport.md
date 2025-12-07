# Project Management App (ProjectFlow) - Final Project Report


**Project Name:** Project Management App  **(Project Flow)**  
**Team:** CSE299-Group-3  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technical Architecture](#2-technical-architecture)
3. [System Features](#3-system-features)
4. [Implementation Details](#4-implementation-details)
5. [Database Schema](#5-database-schema)
6. [API Documentation](#6-api-documentation)
7. [User Interface](#7-user-interface)
8. [Security & Authentication](#8-security--authentication)
9. [Conclusion](#9-conclusion)

---

## 1. Project Overview

### 1.1 Purpose

The Project Management System is designed to facilitate team collaboration, streamline project workflows, and provide real-time visibility into task progress. It enables teams to organize work into workspaces, manage projects with kanban boards, and track individual task details with comprehensive collaboration features.

### 1.2 Target Users

- **Team Leaders:** Manage workspaces, oversee projects, assign tasks
- **Project Managers:** Create projects, track progress, manage team members
- **Team Members:** Complete assigned tasks, collaborate via comments, upload files
- **Stakeholders:** View project progress, monitor team activity

### 1.3 Core Objectives

1. **Organization:** Structure work hierarchically (Workspace → Project → Task)
2. **Collaboration:** Enable team communication through comments, mentions, attachments
3. **Visibility:** Real-time activity tracking and notifications
4. **Efficiency:** Streamline workflows with drag-and-drop, inline editing, quick actions
5. **Access Control:** Role-based permissions and task-level access restrictions

---

## 2. Technical Architecture

### 2.1 Technology Stack

#### Backend
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js 4.21.2
- **Database:** MongoDB (Mongoose ODM 8.19.1)
- **Authentication:** JWT + Passport.js (Google OAuth 2.0)
- **Security:** Arcjet, bcrypt (10 rounds)
- **Email:** SendGrid
- **File Upload:** Multer
- **Validation:** Zod

#### Frontend
- **Framework:** React 19.1.1
- **Router:** React Router 7.9.2
- **State:** TanStack Query (React Query) 5.90.2
- **Forms:** React Hook Form 7.64.0 + Zod
- **UI Library:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS 4.1.13
- **Drag & Drop:** DnD Kit 6.3.1
- **Charts:** Recharts 2.15.4
- **Build Tool:** Vite

### 2.2 Architecture Pattern

**Three-Tier Architecture:**

```
┌─────────────────────────────────────┐
│      Presentation Layer (React)     │
│  - Components, Routes, Hooks        │
│  - TanStack Query (Client State)    │
│  - Real-time Polling                │
└─────────────┬───────────────────────┘
              │ HTTP/REST API
┌─────────────▼───────────────────────┐
│   Application Layer (Express.js)    │
│  - Controllers (Business Logic)     │
│  - Routes (API Endpoints)           │
│  - Middleware (Auth, Validation)    │
└─────────────┬───────────────────────┘
              │ Mongoose ODM
┌─────────────▼───────────────────────┐
│      Data Layer (MongoDB)           │
│  - Collections (Documents)          │
│  - Indexes, Relationships           │
└─────────────────────────────────────┘
```

### 2.3 System Components

**Backend Components (6 Controllers):**
1. **Auth Controller:** User authentication, OAuth, email verification
2. **User Controller:** Profile management, search, settings
3. **Workspace Controller:** Workspace CRUD, member management, invitations
4. **Project Controller:** Project CRUD, member assignment, archiving
5. **Task Controller:** Task operations, subtasks, comments, attachments
6. **Notification Controller:** Notification management, read status

**Frontend Components (50+ Components):**
- **Pages (15+):** Route-based pages for different views
- **UI Components (20+):** Reusable ui components
- **Feature Components (15+):** Task, project, workspace specific
- **Layout Components:** Header, sidebar, layouts
- **Hooks (6):** Custom hooks for API operations

---

## 3. System Features

### 3.1 Authentication & Authorization

**Features:**
- Email/password registration and login
- Google OAuth 2.0 integration
- Email verification system
- Password reset via email
- JWT token-based authentication (24h expiration)
- Session management
- Role-based access control (Owner, Admin, Member)

**Security Measures:**
- bcrypt password hashing (10 rounds)
- JWT secret key protection
- Arcjet rate limiting
- CORS configuration
- Token expiration handling
- Secure password reset tokens

### 3.2 Workspace Management

**Features:**
- Create unlimited workspaces
- Edit workspace name and description
- Delete workspaces (owner only)
- Add/remove members
- Email invitations with expiration
- Role management (Owner, Admin, Member)
- Leave workspace functionality
- Activity tracking per workspace

**Permissions:**
- **Owner:** Full control, cannot be removed
- **Admin:** Manage members, projects, tasks
- **Member:** View and contribute to projects

### 3.3 Project Management

**Features:**
- Create projects within workspaces
- Set project status (Not Started, In Progress, Completed, On Hold)
- Track project progress (0-100%)
- Set start and end dates
- Add/remove project members
- Archive/restore projects
- Kanban board view
- Project statistics

**Kanban Board:**
- Three columns: To Do, In Progress, Done
- Drag-and-drop task status changes
- Task cards with priority badges
- Quick task creation
- Real-time task updates
- Filter and search capabilities

### 3.4 Task Management (Comprehensive)

**Core Task Features:**
- Create tasks within projects
- Editable title (inline editing)
- Rich text description
- Assign multiple users
- Set priority (Low, Medium, High, Critical)
- Set due dates with calendar picker
- Task status (To Do, In Progress, Done)
- Archive/restore tasks
- Delete tasks (with confirmation)
- Watch/unwatch tasks for notifications

**Access Control:**
- Only assigned members can view task details
- Non-assigned members see toast notification
- Prevents unauthorized access
- Navigation blocked at project level

**Subtasks:**
- Add unlimited subtasks
- Mark subtasks complete/incomplete
- Edit subtask titles
- Delete subtasks
- Progress indicator (X/Y completed)

**Comments:**
- Add comments to tasks
- Edit own comments
- Delete own comments
- User mentions (@username)
- Timestamp display
- User avatar display
- Real-time comment updates (1 second)

**Attachments:**
- Upload files (any type)
- Add links with custom names
- Download files
- Delete attachments
- File type icons (image, video, document, etc.)
- File size display
- Upload progress indicator
- Tabs: All, Files, Links

**Activity Tracking:**
- Comprehensive activity log
- Track all task changes:
  - Title updates
  - Description changes
  - Status changes
  - Priority changes
  - Assignee changes
  - Due date changes
  - Subtask additions
  - Comments added
  - Files uploaded
  - Links added
- Real-time activity updates (0.5 seconds)
- User attribution
- Timestamp display
- Icon-based visual indicators

**Watchers:**
- Watchers receive notifications
- Watcher list display
- Toggle watch status

### 3.5 Notification System

**Features:**
- Real-time notifications
- Email notifications (SendGrid)
- Notification types:
  - Task assigned
  - Task updated
  - Comment added
  - File uploaded
  - Subtask added
  - Mention in comments
  - Project updates
- Mark as read/unread
- Mark all as read
- Delete notifications
- Notification count badge
- Workspace context

**Smart Notifications:**
- Excludes user making the change
- Only notifies assigned users
- Notifies watchers on updates
- Grouped by workspace

### 3.6 Real-time Updates

**Polling Strategy:**
- Task details: Every 1 second
- Task activity: Every 0.5 seconds
- Comments: Every 1 second
- Notifications: Every 0.5 seconds
- Automatic cache invalidation
- Background refetching
- Optimistic UI updates

### 3.7 User Profile

**Features:**
- Update profile information
- Change profile picture
- Password change
- Account deletion
- View user statistics
- Activity history

### 3.8 Search & Filter

**Features:**
- Search users by name
- Filter tasks by status
- Filter tasks by priority
- Sort by due date
- Filter by assignee
- Workspace-specific searches

---

## 4. Implementation Details

### 4.1 Backend Architecture

**Directory Structure:**
```
backend/
├── controllers/      # Business logic (6 files)
├── models/           # Database schemas (9 models)
├── routes/           # API endpoints (7 routers)
├── middleware/       # Custom middleware/Request Checkers (2 files)
├── libs/             # Utilities/Helper Tools (5 files)
└── uploads/          # File storage (2 folders)
```

**Request Flow:**
```
Client Request
    ↓
Express Router
    ↓
Middleware (CORS, JSON, Compression, Morgan)
    ↓
Auth Middleware (JWT Verification)
    ↓
Validation (Zod Schema)
    ↓
Controller (Business Logic)
    ↓
Model (Mongoose Query)
    ↓
Database (MongoDB)
    ↓
Response (JSON)
```

### 4.2 Frontend Architecture

**Directory Structure:**
```
frontend/app/
├── routes/           # Pages (file-based routing)
├── components/       # Reusable components
│   ├── ui/          # Base UI (shadcn)
│   ├── task/        # Task-specific
│   ├── project/     # Project-specific
│   └── workspace/   # Workspace-specific
├── hooks/           # Custom React hooks 
├── lib/             # Utilities
├── provider/        # Context providers
└── types/           # TypeScript definitions
```

**Component Hierarchy:**
```
Root
├── AuthProvider
│   └── QueryClientProvider
│       ├── Dashboard Layout
│       │   ├── Header
│       │   ├── Sidebar
│       │   └── Content
│       │       ├── Project Details (Kanban)
│       │       │   ├── Kanban Column
│       │       │   └── Task Card (Draggable)
│       │       └── Task Details
│       │           ├── Task Title
│       │           ├── Task Description
│       │           ├── Task Assignees
│       │           ├── Task Attachments
│       │           ├── Comment Section
│       │           ├── Subtasks
│       │           └── Task Activity
│       └── Toaster (Notifications)
```



## 5. Database Schema

### 5.1 Collections

**9 MongoDB Collections:**
1. users
2. workspaces
3. workspace_invites
4. projects
5. tasks
6. comments
7. activities
8. notifications
9. verifications

### 5.2 Key Schemas

#### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  googleId: String,
  authProvider: "local" | "google",
  profilePicture: String,
  isVerified: Boolean,
  timestamps: true
}
```

#### Workspace Schema
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  owner: ObjectId → User,
  members: [{
    user: ObjectId → User,
    role: "owner" | "admin" | "member",
    joinedAt: Date
  }],
  timestamps: true
}
```

#### Project Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  workspace: ObjectId → Workspace,
  members: [ObjectId → User],
  status: "Not Started" | "In Progress" | "Completed" | "On Hold",
  progress: Number (0-100),
  startDate: Date,
  endDate: Date,
  isArchived: Boolean,
  createdBy: ObjectId → User,
  timestamps: true
}
```

#### Task Schema (Most Complex)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  project: ObjectId → Project,
  assignees: [ObjectId → User],
  watchers: [ObjectId → User],
  status: "To Do" | "In Progress" | "Done",
  priority: "Low" | "Medium" | "High" | "Critical",
  dueDate: Date,
  isArchived: Boolean,
  subtasks: [{
    _id: ObjectId,
    title: String,
    isCompleted: Boolean,
    createdAt: Date
  }],
  attachments: [{
    _id: ObjectId,
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: ObjectId → User,
    uploadedAt: Date
  }],
  createdBy: ObjectId → User,
  timestamps: true
}
```

#### Activity Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId → User,
  action: ActionType (enum),
  resourceType: "Task" | "Project" | "Workspace",
  resourceId: ObjectId,
  details: { description: String },
  workspace: ObjectId → Workspace,
  createdAt: Date
}

// ActionType enum:
"created_task", "updated_task", "completed_task",
"created_subtask", "updated_subtask",
"created_project", "updated_project", "completed_project",
"created_workspace", "updated_workspace",
"added_comment", "added_attachment",
"added_member", "removed_member", "joined_workspace"
```

#### Notification Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId → User,
  type: String,
  message: String,
  resourceType: "Task" | "Project" | "Workspace",
  resourceId: ObjectId,
  workspace: ObjectId → Workspace,
  actionBy: ObjectId → User,
  isRead: Boolean,
  createdAt: Date
}
```

### 5.3 Relationships

**Workspace → Projects (1:N)**
- One workspace has many projects
- Cascade delete on workspace deletion

**Project → Tasks (1:N)**
- One project has many tasks
- Cascade delete on project deletion

**Task → Comments (1:N)**
- One task has many comments
- Cascade delete on task deletion

**User → Tasks (N:M)**
- Users can be assigned to multiple tasks
- Tasks can have multiple assignees

**User → Workspaces (N:M through members array)**
- Users can be members of multiple workspaces
- Workspaces have multiple members

---

## 6. API Documentation

### 6.1 API Endpoints Summary

**Total Endpoints:** 70+

#### Authentication (7 endpoints)
```
POST   /auth/signup
POST   /auth/login
GET    /auth/google
GET    /auth/google/callback
GET    /auth/verify/:token
POST   /auth/request-password-reset
POST   /auth/reset-password/:token
```

#### Users (6 endpoints)
```
GET    /users/me
GET    /users/:userId
PUT    /users/:userId
POST   /users/:userId/profile-picture
GET    /users/search?query=
DELETE /users/:userId
```

#### Workspaces (11 endpoints)
```
POST   /workspaces
GET    /workspaces
GET    /workspaces/:workspaceId
PUT    /workspaces/:workspaceId
DELETE /workspaces/:workspaceId
POST   /workspaces/:workspaceId/members
DELETE /workspaces/:workspaceId/members/:userId
POST   /workspaces/:workspaceId/invite
POST   /workspaces/invites/:token/accept
GET    /workspaces/:workspaceId/members
PUT    /workspaces/:workspaceId/members/:userId/role
POST   /workspaces/:workspaceId/leave
```

#### Projects (9 endpoints)
```
POST   /projects
GET    /projects?workspaceId=
GET    /projects/:projectId
PUT    /projects/:projectId
DELETE /projects/:projectId
POST   /projects/:projectId/members
DELETE /projects/:projectId/members/:userId
PUT    /projects/:projectId/archive
GET    /projects/archived?workspaceId=
```

#### Tasks (25+ endpoints)
```
# Core Task Operations
POST   /tasks
GET    /tasks/:taskId
PUT    /tasks/:taskId/title
PUT    /tasks/:taskId/description
PUT    /tasks/:taskId/status
PUT    /tasks/:taskId/priority
PUT    /tasks/:taskId/due-date
PUT    /tasks/:taskId/assignees
DELETE /tasks/:taskId
GET    /tasks/my-tasks
POST   /tasks/:taskId/watch
POST   /tasks/:taskId/archive

# Subtasks
POST   /tasks/:taskId/subtasks
PUT    /tasks/:taskId/subtasks/:subtaskId
DELETE /tasks/:taskId/subtasks/:subtaskId
PUT    /tasks/:taskId/subtasks/:subtaskId/toggle

# Comments
POST   /tasks/:taskId/comments
GET    /tasks/:taskId/comments
PUT    /tasks/:taskId/comments/:commentId
DELETE /tasks/:taskId/comments/:commentId

# Attachments
POST   /tasks/:taskId/attachments
POST   /tasks/:taskId/attachments/link
DELETE /tasks/:taskId/attachments/:attachmentId

# Activity
GET    /tasks/:taskId/activity
```

#### Notifications (4 endpoints)
```
GET    /notifications
PUT    /notifications/:notificationId/read
PUT    /notifications/read-all
DELETE /notifications/:notificationId
```

### 6.2 Authentication

**All protected endpoints require JWT token:**
```
Authorization: Bearer <token>
```

**Token obtained from:**
- POST /auth/login
- POST /auth/signup
- GET /auth/google/callback

---

## 7. User Interface

### 7.1 Design System

**Color Palette:**
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Neutral: Gray (#6B7280)

**Typography:**
- Font Family: Inter, system-ui
- Heading: 24px, 20px, 18px
- Body: 16px
- Small: 14px, 12px

**Spacing Scale:**
- 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem

### 7.2 Key UI Components

**Task Card:**
- Title with priority badge
- Assignee avatars
- Due date indicator
- Status column
- Drag handle

**Kanban Board:**
- Three columns (To Do, In Progress, Done)
- Draggable task cards
- Add task button per column
- Task count per column

**Task Details:**
- Large title (editable)
- Description editor
- Status selector
- Priority selector
- Assignee multi-select
- Due date calendar
- Attachment uploader
- Comment input
- Subtask checklist
- Activity timeline

**Navigation:**
- Top header with logo, workspace selector, notifications
- Left sidebar with workspace navigation
- Breadcrumbs for current location

### 7.3 Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Optimizations:**
- Collapsible sidebar
- Touch-friendly buttons
- Simplified navigation
- Stack columns vertically

### 7.4 User Flows

**Creating a Task:**
1. Navigate to project
2. Click "Add Task" in column
3. Enter task title
4. Click task to open details
5. Fill in description, assignees, priority, due date
6. Task auto-saves

**Completing a Task:**
1. Drag task card to "Done" column
   OR
2. Open task details → Change status to "Done"
3. Real-time update across all users

**Collaborating on Task:**
1. Open task details
2. Add comment with @mention
3. Upload file attachment
4. Mentioned user receives notification
5. Activity log updates instantly

---

## 8. Security & Authentication

### 8.1 Authentication Flow

**Local Authentication:**
```
User → Signup Form → Backend
         ↓
    Hash Password (bcrypt)
         ↓
    Create User in DB
         ↓
    Send Verification Email
         ↓
    User Clicks Link → Verify Email → Login
         ↓
    Generate JWT Token
         ↓
    Return Token to Client
         ↓
    Store in localStorage
         ↓
    Include in All Requests (Authorization Header)
```

**Google OAuth Flow:**
```
User → Click "Sign in with Google"
         ↓
    Redirect to Google
         ↓
    User Authorizes
         ↓
    Google Callback → Backend
         ↓
    Create/Find User
         ↓
    Generate JWT Token
         ↓
    Redirect to Dashboard with Token
```

### 8.2 Security Measures

**Password Security:**
- bcrypt hashing (10 rounds)
- Minimum 8 characters
- No plain text storage
- Secure password reset flow

**Token Security:**
- JWT with secret key
- 24-hour expiration
- Secure HTTP-only cookies (optional)
- Token refresh mechanism

**API Security:**
- Arcjet rate limiting
- CORS whitelist
- Input validation (Zod)
- SQL injection prevention (Mongoose)
- XSS protection

**Access Control:**
- Role-based permissions (Workspace level)
- Task-level access control (only assignees)
- Owner/Admin/Member hierarchy
- Action authorization checks

### 8.3 Data Protection

**Sensitive Data:**
- Passwords hashed before storage
- Environment variables for secrets
- .env file excluded from git
- No API keys in frontend

**File Upload Security:**
- File type validation
- File size limits
- Secure filename generation
- Access control on file serving

---

## 9. Conclusion

### 9.1 Project Achievements

The Project Management System successfully delivers:

✅ **Comprehensive Feature Set:**
- Complete task management lifecycle
- Team collaboration tools
- Real-time updates
- Robust access control

✅ **Modern Technology Stack:**
- React 19 with latest features
- Express.js with best practices
- MongoDB for flexible data storage
- TanStack Query for efficient state management

✅ **User-Centric Design:**
- Intuitive drag-and-drop interface
- Inline editing for efficiency
- Real-time feedback
- Responsive design

✅ **Security & Reliability:**
- JWT authentication
- Google OAuth integration
- Role-based permissions
- Comprehensive error handling

✅ **Scalable Architecture:**
- Modular component structure
- RESTful API design
- Efficient database schema
- Optimized performance

### 9.2 Lessons Learned

**Technical Insights:**
1. Real-time polling can be effective for moderate scale
2. TanStack Query simplifies complex state management
3. Mongoose .populate() behavior requires careful handling
4. Activity tracking provides valuable user insights
5. Access control at multiple levels enhances security

**Development Best Practices:**
1. Consistent error handling improves UX
2. Optimistic updates enhance perceived performance
3. Comprehensive type definitions catch bugs early
4. Modular code structure aids maintenance
5. Real-time features require thoughtful UX design

### 9.3 Final Thoughts

This Project Management System represents a fully-functional, production-ready application built with modern web technologies. It demonstrates proficiency in full-stack development, including:

- **Backend Development:** RESTful API design, database modeling, authentication
- **Frontend Development:** React component architecture, state management, UI/UX design
- **System Design:** Real-time features, access control, scalability considerations
- **DevOps:** Deployment strategy, environment management, security best practices

The application is ready for real-world use and can scale to support growing teams and increasing workloads.

---
