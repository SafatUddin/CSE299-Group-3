# CSE299-Group-3 

# ProjectFlow -> A project management app

### Clone this repository

You can clone via HTTPS or SSH:

```bash
# HTTPS
git clone https://github.com/SafatUddin/CSE299-Group-3.git

# or SSH
git clone git@github.com:SafatUddin/CSE299-Group-3.git
```

Then:

```bash
cd CSE299-Group-3
```

## How to Run

Follow these steps to run the backend API and the frontend app locally. This repository already includes environment files; review and update them if needed.

### env.example

(implement this in the backend)
```
OPENSSL_CONF=/home/safat/.mongodb-tls-fix/openssl_no_rh.conf
PORT=5000
MONGODB_URI=mongodb+srv://SafatUddin:voodoovader@cluster0.eshlohp.mongodb.net/CSE299?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=anakinthechosenonedarthvader
FRONTEND_URL=http://localhost:5173
SEND_GRID_API=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
FROM_EMAIL=mekakashi17@gmail.com
ARCJET_ENV=development
ARCJET_KEY=ajkey_01k7b2wbsnfvsrhgs9dbqxg5e2
```


### Prerequisites
- Node.js 18+ and npm
- Internet access to install dependencies
- A MongoDB connection string (already provided in this instance)

### Environment variables
This repo contains `.env` files. Make sure the values are correct for your machine:
- Backend (`Main/backend/.env`):
	- `PORT` (default 5000)
	- `MONGODB_URI` (I have given my MongoDB connection string change if you need it)
	- `FRONTEND_URL` (e.g., `http://localhost:3000` or the dev URL printed by the frontend)
	- Email or auth keys your features require (e.g., `SENDGRID_API_KEY`, `JWT_SECRET`)
- Frontend: configure API base URLs in code or via environment as your app expects.

If you change the frontend dev port, update `FRONTEND_URL` in the backend `.env` so CORS allows requests.

### Run in development
Use two terminals—one for the backend and one for the frontend.

Backend (Terminal 1):
1) `cd Main/backend`
2) `npm install`
3) `npm run dev`  (starts an Express server; default port comes from `PORT` in `.env`)

Frontend (Terminal 2):
1) `cd Main/frontend`
2) `npm install`
3) `npm run dev`  (starts the React Router dev server; open the URL shown in the terminal)

Once both are running, navigate to the frontend URL printed in the terminal. The backend base URL should be `http://localhost:<PORT>` unless you changed it in `.env`.

### Build and run for production

Frontend:
1) `cd Main/frontend`
2) `npm install`
3) `npm run build`
4) `npm start`  (serves the built app using React Router’s server)

Backend:
1) `cd Main/backend`
2) `npm install`
3) `npm start`  (runs `node index.js`)

Ensure your production environment variables are set appropriately before starting.



## Proposal/Review
### Project Proposal

[Project Proposal Report](./Others/CSE299_Project_Proposal_Group-3.pdf)

### Project Proposal Presentation

[Project Proposal Presentation](./Others/Project_Proposal_Group-3_Presentation.pdf) -> [Alternate link](https://drive.google.com/file/d/1c_V2gUpclm6B3QuC5Vt8E9SqDrkchXZt/view?usp=drive_link)



## Update-1

[Update-1 Video Demo](https://youtu.be/MfleyOah9Zo)

[Update-1 Report](./Others/Update-1.pdf)

****

**Backend** (Done by Safat):
- Set up Express server with CORS and request logging (morgan), environment variables via dotenv, and MongoDB connection using Mongoose.
- Implemented auth features with validation using zod/zod-express-middleware:
	- Register: creates user with hashed password (bcrypt), prevents duplicate emails, and sends a verification email via SendGrid with a JWT token stored in a `Verification` collection.
	- Verify Email: verifies the token, marks user as verified, deletes verification record.
	- Login: validates credentials, enforces email verification, regenerates verification if needed, returns a 7-day JWT and user data (password omitted), updates last login.
	- Forgot/Reset Password: creates and emails a time-limited JWT link; token is checked before allowing password reset.
- Security and safety: JWT-based flows, CORS tied to `FRONTEND_URL`, and Arcjet email inspection to prevent abuse.

**Frontend** (Done by Farhan & Zunayed):
- React Router v7 setup with TypeScript, Tailwind CSS, and component library wiring. App includes forms with react-hook-form + zod validation and toast feedback.
- Auth pages and flows implemented:
	- The Home page provides a welcoming introduction to the app, with clear calls-to-action for users to either sign up or sign in.(Done by Farhan)
    - Sign Up with client-side validation and success redirect to Sign In.(Done by Zunayed)
	- Sign In that stores auth state via a provider and navigates to Dashboard.(Done by Zunayed)
	- Email verification screen that reads `token` from URL and calls the backend.(Done by Farhan)
	- Forgot Password and Reset Password screens that orchestrate the email and token-based reset process.(Done by Farhan)
- Project structure with routes, hooks for API calls, and basic dashboard/home route scaffolding.

Project flow (how it works end-to-end):
- A new user signs up on the frontend; the backend creates the user, generates a verification JWT, stores it, and emails a verification link that points back to the frontend (using `FRONTEND_URL`).
- The user clicks the link; the frontend verifies the token with the backend. After success, the user can log in.
- On login, the backend validates password and verification status. If unverified/expired, a new verification flow is triggered. On success, a login JWT is returned and the frontend stores session state.
- If the user forgets their password, the frontend starts a reset flow; the backend generates a time-limited reset token, emails a link, and on confirmation updates the password

## Update-2

[Update-2 Video Demo](https://www.youtube.com/watch?v=xuENJUFW21o)

[Update-2 Report](./Others/Update-2.pdf)

****

**Backend: (Done by Safat)**

**Workspace and Project Management:**

- **Create Workspace**: Users can create workspaces with name, description, and color. User is added as owner/member.

- **Get Workspaces**: Retrieves all workspaces where the user is a member.

- **Get Workspace Projects**: Returns all projects in a specific workspace.

- **Create Project**: Creates projects within workspaces with title, description, status, priority, due dates, and assigned members.

Database models defined with Mongoose: User, Workspace, Project, Task, Comment, Verification.

**Frontend: (Done by Safat, Farhan, Zunayed)**

**Workspace and Project Features(Done by Farhan):**

- **Workspace List**: Displays all user workspaces as cards with a create workspace button.
- **Create Workspace**: Dialog with name, description, and color picker. Navigates to new workspace on success.
- **Workspace Selector**: Dropdown in the header to switch between workspaces.
- **Workspace Details**: Shows workspace info and all projects as cards.
- **Create Project**: Dialog to add projects with title, description, status, priority, due date, and member assignment.
- **Project Cards**: Display project info with progress bar, status, and due dates.

**Dashboard Layout (Done by Zunayed)**

- Responsive collapsible sidebar with navigation (Dashboard, Workspaces, My Tasks, Members, Settings).
- Header with workspace selector and user profile menu.
- Protected routes with authentication check and loading states.


**State management** with Auth Context and TanStack Query for API calls. Custom hooks (useAuth, useWorkspace, useProject) for data fetching. (Done by Safat)

**Project structure**, routes organized by feature, reusable UI components (Radix UI + Tailwind), TypeScript types, and API utilities with JWT token handling.(Done by Safat)


## Update-3

[Update-3 Video Demo](https://www.youtube.com/watch?v=BlY-rLW3M20)

[Update-3 Report](./Others/Update-3.pdf)

*****

**Backend:** *(Done by Safat)*

- *Task list:* returns the project plus its non‑archived tasks (populates assignees) for the frontend to render the task columns.

- *Create task:*  validates input, creates a Task document (title, description, status, priority, assignees, dueDate, subtasks) and links it to the project.

- *Task details:* the task record with populated assignees/watchers and basic project info so the frontend can render the detail page.

- *Task updates:* apply the specific change on the Task document and record an activity entry for audit/history.

- *Subtasks:*
  - Add subtask: appends a subtask item to the task.
  - Update subtask: mark complete/incomplete or edit subtask.

- *Comments:*
  - Add comment: creates a Comment record linked to the task and author.
  - List comments: returns comments with author metadata.
  - Each comment creation also adds an activity record so comments show up in the activity feed.

- *Activity:* controllers write Activity documents for notable actions (create, update, comment, subtask changes). The endpoint returns the timeline for the resource.

- *Watchers:* adds/removes the current user to the task's `watchers` list so they receive updates; also records activity.

**Frontend:** *(Done by Farhan, Zunayed, Safat)* 

- *Task list:* Shows tasks in three columns: To Do, In Progress, Done. *(Done by Farhan)*

- *Create task:* A modal form with fields: title, description, status, priority, due date, assignees. The form validates input, sends the new task to the server, then closes and refreshes the list. *(Done by Farhan)*

- *Task view:* Dedicated page showing title, description, status, priority, assignees, subtasks, comments, activity, and watchers. *(Done by Farhan)*

- *Subtasks:* You can add subtasks and toggle them complete/incomplete. *(Done by Zunayed)*

- *Comments:* Comments are fetched from the server and shown in a scrollable area with author and time. *(Done by Zunayed)*

- *Activity:* Activity shows a timeline of actions (created, updated, commented, subtasks). *(Done by Farhan)*

- *Watchers:* Users can watch a task to follow updates; toggling watch sends a request to the server. The UI shows who is watching and updates after the server confirms the change. *(Done by Zunayed)*

- State management with Auth Context and TanStack Query for API calls. Custom hooks (use-project, use-task) for data fetching. *(Done by Safat)*

- Routes organized by feature,, TypeScript types, and API utilities with JWT token handling. *(Done by Safat)*


## Update-4

[Update-4 Video Demo]()

[Update-4 Report](./Others/Update-4.pdf)

****

**Backend:**

*Done By Safat*
- Endpoint `GET /workspace/:workspaceId/stats` gathers all the dashboard data such as total projects and tasks, task status counts, priority breakdown, 7-day task trends, upcoming tasks (next 7 days), and recent projects.
- Endpoint `GET /tasks/my-tasks` shows tasks assigned to the logged-in user, including project title and workspace info (used in the My Tasks page).
- The server now handles aggregation logic, it groups and counts tasks, filters upcoming ones by due date, and prepares all data for the dashboard in frontend.
- Updated task-related queries to skip archived items and show only active tasks on the dashboard and task lists and used Zod to check request parameters and queries to ensure only valid data is processed.

**Frontend:**

*Done By Zunayed:*
- UI components added : `StatsCard`, `StatisticsCharts`, `RecentProjects`, and  `UpcomingTasks` (progress bars, charts, and summary widgets).
- Added filters, sorting, and search options that sync with the URL using `useSearchParams`.
- The Dashboard supports workspace scoping through a `workspaceId` query param, and the layout enforces authentication with workspace selection in the header/sidebar. 

*Done By Farhan:*
- The Dashboard now calls API and displays data through components like `StatsCard`, `StatisticsCharts`, `RecentProjects`, and `UpcomingTasks`. 
- The My Tasks page fetches tasks from `/tasks/my-tasks` and shows tasks assigned to the current user. 
- Implemented both `List` view and `Kanban Board` view with task cards showing status, priority, due date, and linked projects in the *`“My Task”`* page.

*Done By Safat:*
- Created React Query hooks (`use-task.ts`, `use-workspace.ts`) to handle fetching and updating data; relevant queries automatically refresh after mutations. 
