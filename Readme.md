<div align="center">
  <h1>🚀 ProjectFlow</h1>
  <p><strong>A Modern Project Management & Collaboration Platform</strong></p>
  <p>
    <a href="https://cse-299-project-flow-a-project-mana.vercel.app" target="_blank">🌐 Live Demo</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#usage">Usage</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## 📋 About

**ProjectFlow** is a full-stack project management application designed to streamline team collaboration and task management. Built with modern web technologies, it offers an intuitive kanban-style interface, real-time notifications, and comprehensive workspace management features.

Whether you're managing a small team or coordinating multiple projects, ProjectFlow provides the tools you need to stay organized and productive.

### ✨ Key Highlights

- **Intuitive Kanban Boards**: Drag-and-drop task management with customizable columns
- **Multi-Workspace Support**: Organize projects across different workspaces with role-based access
- **Real-Time Collaboration**: Live notifications and activity tracking
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark Mode**: Eye-friendly interface with automatic theme switching
- **Secure Authentication**: Google OAuth integration with JWT-based sessions

---

## 🎯 Features

### Project Management
- ✅ Create and manage multiple projects within workspaces
- ✅ Kanban board with drag-and-drop functionality (To Do, In Progress, Done)
- ✅ Progress tracking with visual indicators
- ✅ Project archiving and restoration

### Task Management
- ✅ Create, edit, and delete tasks with rich details
- ✅ Task priorities (Low, Medium, High)
- ✅ Due date management
- ✅ File attachments support
- ✅ Task comments and activity logs
- ✅ Multiple assignees per task
- ✅ Task watchers for notifications
- ✅ Sub-task support

### Workspace & Collaboration
- ✅ Create unlimited workspaces with custom colors
- ✅ Invite team members via email
- ✅ Role-based access control (Admin, Member)
- ✅ Real-time notification system
- ✅ Activity feed for all workspace actions

### User Experience
- ✅ Responsive mobile-first design
- ✅ Dark/Light theme support
- ✅ Profile customization with avatar upload
- ✅ Dashboard with statistics and recent projects
- ✅ "My Tasks" view for personal task management

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Drag & Drop**: @dnd-kit
- **Form Handling**: React Hook Form + Zod validation
- **Notifications**: Sonner

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Local + Google OAuth)
- **Security**: Arcjet (rate limiting, bot detection)
- **File Upload**: Multer
- **Validation**: Joi schemas
- **Email**: Nodemailer

### DevOps & Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint, TypeScript
- **Development**: Hot module replacement (HMR)

---

## 🚀 Getting Started

### Prerequisites

Before running this project, ensure you have:

- **Node.js** 18+ and npm installed ([Download](https://nodejs.org/))
- **MongoDB** connection string (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Google OAuth credentials** (optional, for social login) from [Google Cloud Console](https://console.cloud.google.com/)
- **Arcjet API key** (optional, for security features) from [Arcjet](https://app.arcjet.com)

### Installation

#### 1. Clone the Repository

```bash
# HTTPS
git clone https://github.com/SafatUddin/CSE299_ProjectFlow_A_Project_Management_App.git

# OR SSH
git clone git@github.com:SafatUddin/CSE299_ProjectFlow_A_Project_Management_App.git

# Navigate to project directory
cd CSE299_ProjectFlow_A_Project_Management_App
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd Main/backend

# Install dependencies
npm install

# Create environment file (if .env doesn't exist)
cp .env.example .env
```

**Configure `Main/backend/.env`**:

```env
# Server Configuration
PORT=5000
OPENSSL_CONF=

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_secure_jwt_secret_key

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security (Optional)
ARCJET_ENV=development
ARCJET_KEY=your_arcjet_api_key
```

> **Note**: The repository may already include `.env` files. Review and update them with your own credentials.

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd Main/frontend

# Install dependencies
npm install
```

The frontend is configured to use `http://localhost:5000/api-v1` as the API URL by default. If you change the backend port, update the API URL in your configuration files.

---

## 💻 Usage

### Development Mode

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd Main/backend
npm run dev
```
✅ Server will start on `http://localhost:5000` (or your configured PORT)

**Terminal 2 - Frontend:**
```bash
cd Main/frontend
npm run dev
```
✅ Application will open at `http://localhost:5173`

Once both servers are running, open your browser and navigate to the frontend URL. You're ready to start using ProjectFlow!

### Production Build

**Backend:**
```bash
cd Main/backend
npm install --production
npm start
```

**Frontend:**
```bash
cd Main/frontend
npm install
npm run build
npm start
```

> **Important**: Ensure all production environment variables are properly configured before deployment.

---

## 📂 Project Structure

```
CSE299_ProjectFlow/
├── Main/
│   ├── backend/
│   │   ├── controllers/      # Request handlers (auth, task, project, etc.)
│   │   ├── models/           # MongoDB schemas (User, Task, Project, etc.)
│   │   ├── routes/           # API endpoint definitions
│   │   ├── middleware/       # Auth, file upload, validation middleware
│   │   ├── libs/             # Utility functions (email, passport config, arcjet)
│   │   ├── uploads/          # File storage (attachments, profile pictures)
│   │   ├── index.js          # Express server entry point
│   │   └── package.json      # Backend dependencies
│   │
│   └── frontend/
│       ├── app/
│       │   ├── routes/       # Page components (dashboard, auth, projects)
│       │   ├── components/   # Reusable UI components (header, cards, forms)
│       │   ├── hooks/        # Custom React hooks (useAuth, useTask, etc.)
│       │   ├── lib/          # Utilities, schemas, API fetch helpers
│       │   ├── provider/     # Context providers (auth, theme, React Query)
│       │   └── types/        # TypeScript type definitions
│       ├── public/           # Static assets (images, icons)
│       ├── vite.config.ts    # Vite build configuration
│       ├── tsconfig.json     # TypeScript configuration
│       └── package.json      # Frontend dependencies
│
├── Readme.md                 # This file
└── ProjectReport.md          # Detailed project documentation
```

---

## 🎨 Features Walkthrough

### 1. **Dashboard**
Get a bird's-eye view of your work:
- Statistics: Total projects, tasks, and completion rates
- Recent projects with quick access
- Upcoming tasks and deadlines

### 2. **Workspace Management**
Organize work by teams or departments:
- Create unlimited color-coded workspaces
- Invite team members with role assignments (Admin/Member)
- Switch between workspaces seamlessly
- Manage workspace settings and permissions

### 3. **Project Kanban Board**
Visual task management at its best:
- Drag-and-drop tasks between columns (To Do → In Progress → Done)
- Filter tasks by status or assignee
- Real-time progress tracking with percentage indicators
- Mobile-optimized with horizontal scrolling

### 4. **Task Details**
Everything you need for comprehensive task management:
- Rich text descriptions with formatting
- Priority levels (Low, Medium, High) with color indicators
- Due date selection with calendar picker
- Multiple file attachments (images, documents, etc.)
- Threaded comment discussions
- Complete activity history
- Watcher system for notifications

### 5. **Responsive Design**
Works perfectly on all devices:
- Mobile-first approach with touch-friendly interactions
- Adaptive layouts that adjust to screen size
- Optimized typography and spacing
- Dark mode for comfortable viewing in any environment

---

## 🤝 Contributing

We welcome contributions from developers who are skilled and willing to contribute. Here's how you can help improve ProjectFlow:

### Development Workflow

1. **Fork the repository** on GitHub
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-amazing-feature
   ```
3. **Make your changes** with clear, focused commits
   ```bash
   git commit -m "feat: Add amazing new feature"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/your-amazing-feature
   ```
5. **Open a Pull Request** with a detailed description

### Coding Standards

- **Code Style**: Follow existing patterns and conventions
- **Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)
- **Comments**: Add clear comments for complex logic
- **Testing**: Test your changes across different screen sizes
- **Documentation**: Update README or docs for new features

### Reporting Issues

Found a bug or have a feature idea?

1. **Search existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Detailed description and steps to reproduce
   - Screenshots or GIFs if applicable
   - Environment details (browser, OS, etc.)
3. **Label appropriately**: bug, enhancement, documentation, etc.

---

## 📝 API Documentation

### Base URL
```
http://localhost:5000/api-v1
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login with email/password |
| GET | `/auth/google` | Initiate Google OAuth login |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/me` | Get current authenticated user |
| POST | `/auth/logout` | Logout current session |

### Workspace Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/workspaces` | Get all user workspaces |
| POST | `/workspaces` | Create new workspace |
| GET | `/workspaces/:id` | Get workspace details |
| PATCH | `/workspaces/:id` | Update workspace |
| DELETE | `/workspaces/:id` | Delete workspace |
| POST | `/workspaces/:id/invite` | Invite member to workspace |

### Project Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:workspaceId` | Get all projects in workspace |
| POST | `/projects` | Create new project |
| GET | `/projects/:id` | Get project details |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

### Task Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/:projectId` | Get all tasks in project |
| POST | `/tasks` | Create new task |
| GET | `/tasks/:id` | Get task details |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/status` | Update task status |
| POST | `/tasks/:id/comments` | Add comment to task |

*For complete API documentation with request/response examples, see the backend route files.*

---

## 🔒 Security Features

ProjectFlow implements multiple layers of security:

- **JWT Authentication**: Secure, stateless token-based sessions
- **Rate Limiting**: Arcjet integration prevents API abuse and DDoS attacks
- **Input Validation**: Joi schemas validate all incoming data
- **Password Security**: Bcrypt hashing with salt rounds
- **CORS Protection**: Configured origin whitelisting
- **File Upload Security**: Type validation and size restrictions
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Input sanitization and Content Security Policy

---

## 🐛 Known Issues & Limitations

Current limitations we're working to address:

- **File Uploads**: Maximum size limited to 10MB per file
- **Email Notifications**: Requires SMTP server configuration
- **Real-Time Updates**: Some updates require page refresh (WebSocket implementation in progress)
- **Mobile Browser**: Best experience on modern browsers (Chrome, Safari, Firefox)
- **Offline Support**: No offline functionality yet

---

## 🗺️ Roadmap

Exciting features coming soon:

### Phase 1 (Current)
- [x] Core kanban board functionality
- [x] Workspace and project management
- [x] Dark mode support
- [x] Mobile responsive design

### Phase 2 (Future)
- [ ] Real-time collaboration with WebSockets
- [ ] Advanced notification system
- [ ] File preview for attachments
- [ ] Improved search and filtering

### Phase 3 (Future)
- [ ] Calendar view for tasks and deadlines
- [ ] Time tracking and reporting
- [ ] Gantt chart visualization
- [ ] Export data to PDF/Excel
- [ ] Advanced analytics dashboard

### Phase 4 (Future)
- [ ] Mobile native apps (iOS & Android)
- [ ] Third-party integrations (Slack, GitHub, Jira)
- [ ] AI-powered task suggestions
- [ ] Video call integration
- [ ] Custom workflow automation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Modify
- ✅ Private use

---

## 👥 Authors & Contributors

### Project Team
**Safat Uddin** - [GitHub](https://github.com/SafatUddin) 

---

## 🙏 Acknowledgments

This project wouldn't be possible without these amazing open-source projects:

- [**React**](https://react.dev/) - The foundation of our UI
- [**Tailwind CSS**](https://tailwindcss.com/) - Utility-first styling
- [**Radix UI**](https://www.radix-ui.com/) - Accessible component primitives
- [**Shadcn/ui**](https://ui.shadcn.com/) - Beautiful component examples
- [**React Query**](https://tanstack.com/query) - Powerful data synchronization
- [**DND Kit**](https://dndkit.com/) - Modern drag-and-drop
- [**Express.js**](https://expressjs.com/) - Fast, minimalist web framework
- [**MongoDB**](https://www.mongodb.com/) - Flexible document database

---

## 📧 Contact & Support

### Get Help
- 📚 **Documentation**: Check this README and [ProjectReport.md](ProjectReport.md)
- 🐛 **Bug Reports**: [Open an issue](https://github.com/SafatUddin/CSE299_ProjectFlow_A_Project_Management_App/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/SafatUddin/CSE299_ProjectFlow_A_Project_Management_App/discussions)

### Connect
- **GitHub**: [SafatUddin](https://github.com/SafatUddin)
- **Email**: akmsafat@gmail.com
- **LinkedIn**: [SafatUddin](https://linkedin.com/in/SafatUddin)

---

<div align="center">
  
  ### ⭐ Star this!
  
  If you find ProjectFlow useful, please consider giving it a star on GitHub. It helps others discover the project!
  
  ---
  
  **Built by [Safat Uddin](https://github.com/SafatUddin) **
  
  *Empowering teams to collaborate better, one task at a time.*
  
</div>
