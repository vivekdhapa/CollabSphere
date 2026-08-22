# Completed Tasks

## Task 1: Project Scaffold + Landing Page
- Restructured Next.js project to use `src/app/` layout.
- Removed TypeScript dependencies and migrated `.tsx` files to plain JavaScript (`.jsx`).
- Configured Tailwind CSS v4 with custom tokens from `design.md`.
- Set up root layout (`layout.jsx`) with the Inter font and Material Symbols.
- Built the unauthenticated Landing Page (`app/page.jsx`) per `design.md` section 7a, including the header, hero section (with Kanban mockup), feature grid, and footer.
- Wired placeholder links for `/login` and `/register`.

## Task 2: Login Page
- Created `src/lib/api.js` shared axios instance with base URL and Bearer token request interceptor.
- Built the Login page Client Component at `src/app/login/page.jsx` using `design.md` token specifications (elevated shadow card, proper inputs with icons).
- Wired form to submit POST `/api/v1/auth/login` through `api.js`.
- Implemented robust error handling that plucks the backend's `message` field on failure.
- Implemented success handling to store `accessToken` in `localStorage` and redirect to `/dashboard`.
- Added disabled/loading states to inputs and the submit button.

## Task 2b: Fix API base URL
- Checked `backend/.env` and verified backend is running on `PORT=8000` with `CORS_ORIGIN=*`.
- Created `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`.
- Restarted the Next.js development server to load the new environment variables.
- Verified user registration and login functionality against the active backend.

## Task 3: Register Page
- Built the Register page Client Component at `src/app/register/page.jsx` per `design.md` token specifications.
- Implemented form fields for `fullName` (optional), `username` (required, auto-lowercases on change, min 3 chars), `email`, and `password` (with show/hide toggle icon).
- Skipped OAuth "continue with Google/GitHub" per instructions since backend lacks support.
- Wired form to submit POST `/auth/register` using the existing `lib/api.js` Axios instance.
- Handled success by displaying the backend's confirmation message inline and redirecting to `/login` after a 3-second delay.
- Handled errors by surfacing the backend's explicit error message.
- Implemented robust loading states (disabling inputs/button and changing button text).

## Task 4: Auth context, protected routes, and Dashboard
- Created `src/context/AuthContext.jsx` to load and hold the user session on mount via `GET /auth/current-user`. It exposes `user`, `isLoading`, and `logout()`.
- Added the `<AuthProvider>` to the root `layout.jsx` to make the context available everywhere.
- Created `src/components/ProtectedRoute.jsx` as a wrapper that redirects unauthenticated users to `/login`.
- Built the main layout shell (`src/components/layout/PageShell.jsx`, `Sidebar.jsx`, `Topbar.jsx`) perfectly matching `design.md` section 5 specifications (260px sidebar, topbar with mock notification/avatar).
- Wired up a functional "Sign Out" button in the Sidebar hitting `logout()`.
- Created the Dashboard (`src/app/dashboard/page.jsx`) using the protected shell. It fetches `GET /projects`.
- Built the Empty State UI (the dashed "Create new project" card) because the newly registered test user currently has no projects.
- "Create Project" buttons exist but currently just log to the console, awaiting their own dedicated task.

## Task 5: Create Project Modal
- Built `src/components/projects/CreateProjectModal.jsx` overlay using design system styles (centered, backdrop blur, matching form fields).
- State is controlled via `DashboardPage` which holds `isModalOpen` and passes `onOpenCreateProject` down through `PageShell` to `Sidebar`.
- Wired all three "Create Project" triggers (sidebar, topbar, empty state card) to cleanly open the modal.
- Submitting calls `POST /api/v1/projects` via Axios, handles inline errors, and on success closes the modal and re-fetches projects.

## Task 6: Project Kanban Board (View Only)
- Created `src/app/projects/[projectId]/page.jsx` as a protected route.
- Fetches `GET /projects/:projectId/members` (to identify the current user's role and populate the project name) and `GET /tasks/:projectId` in parallel.
- Modified `Topbar.jsx` and `PageShell.jsx` to flexibly accept a ReactNode `title` (allowing us to cleanly inject the Overview/Board/Timeline tabs) and conditional "Add Task" button props.
- Implemented Kanban layout with three rigid columns (`Todo`, `In Progress`, `Done`) matching the design system (colored status dots, count pills).
- Implemented Task cards mapping `title`, `priority` flags, and `assignedTo` avatars, with completed tasks visually fading to `opacity-80` and `line-through`.
- Implemented RBAC checks: the "Add Task" button is disabled and greyed out if the user's role is not `admin` or `project_admin`. Clicking a task logs to the console.

## Task 6b: Task Creation & Detail Drawer
- Built `CreateTaskModal.jsx` using `FormData` instead of JSON to natively handle `multipart/form-data` for the `upload.array("attachments", 5)` endpoint.
- Populated the Assignee dropdown using the existing `members` list passed down from the project board.
- Built `TaskDetailDrawer.jsx` as an off-canvas slider. 
- Wired it to fetch `GET /api/v1/tasks/:projectId/t/:taskId`.
- Implemented strict frontend RBAC: Title and description render as clickable edit fields for `admin`/`project_admin`, but as static text for `member`.
- Built the 2-column meta grid (Assignee/Project) and the Attachments grid with download links.
- Connected the modals to the Kanban board state (`isCreateTaskModalOpen` and `selectedTaskId`), triggering optimistic refetches upon save.

## Task 6c: Subtasks Checklist
- Added the Subtasks section to `TaskDetailDrawer.jsx` with a dynamic `X/Y` completion counter.
- Mapped `task.subTasks` to individual rows with custom styled checkboxes, strikethrough text on completion, and hover-reveal delete (×) buttons.
- Implemented strict RBAC per requirements: toggle is available to all roles (including `member`), but the inline "Add subtask..." row and the "delete" buttons are completely omitted from the DOM for non-admins.
## Task 7: Members and Notes Tabs
- Extracted the topbar tabs logic into a shared `ProjectTabs.jsx` component using `next/link` for routing.
- Built the **Members Tab** (`/projects/[projectId]/members`):
  - Fetches the member list and current user role on load.
  - Renders a clean list of members (avatar, email, role badge).
  - RBAC: Admins see an "Add Member" button (which opens `AddMemberModal.jsx`), a role-change dropdown for other users, and a "Remove" button with a native `window.confirm`. Members see a read-only list.
- Built the **Notes Tab** (`/projects/[projectId]/notes`):
  - Fetches notes on load and formats `createdAt` into a relative "time ago" string.
  - Renders note cards mirroring the feed layout.
  - RBAC: Admins see an "Add Note" empty-state dashed button and a top-right action button (opening `AddNoteModal.jsx`). They can also edit notes inline (swaps content for a textarea) and delete them. Members see a read-only feed.
- Wired all mutations across both pages to aggressively refetch their respective lists to keep local state perfectly synced with the backend without stale data issues.
