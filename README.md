# CollabSphere

A full-stack project management platform with three-tier role-based access
control, JWT authentication with refresh-token rotation, and real-time task
collaboration — built as a monorepo with independently deployable backend and
frontend workspaces.

**Live app:** https://frontend-rho-nine-10.vercel.app
**API:** https://collabsphere-gdqs.onrender.com/api/v1

> Note: the backend runs on a free-tier host and may take 30–60 seconds to
> respond on the very first request after a period of inactivity. Subsequent
> requests are fast.

---

## Features

- **Authentication & security** — JWT access/refresh token rotation, email
  verification, forgot/reset-password flow, bcrypt password hashing
- **Three-tier RBAC** — Admin, Project Admin, and Member roles, scoped
  per-project (not globally), enforced at the API layer and reflected in the
  UI
- **Projects** — create, update, delete, member management with per-project
  role assignment
- **Tasks & subtasks** — full CRUD, Kanban board (Todo / In Progress / Done),
  due dates, file attachments, assignee tracking
- **Notes** — per-project note threads, Admin-managed
- **File uploads** — task attachments and user avatars stored on Cloudinary
  (not local disk, so uploads persist across deploys/restarts)
- **Transactional email** — verification and password-reset emails sent via
  Brevo's HTTPS API (chosen specifically because most free-tier hosts block
  outbound SMTP ports)

## Tech stack

**Backend**
- Node.js / Express
- MongoDB + Mongoose (hosted on MongoDB Atlas)
- JWT (jsonwebtoken) for auth
- Multer + Cloudinary for file storage
- Brevo (transactional email API)
- express-validator for request validation

**Frontend**
- Next.js (App Router), JavaScript
- Tailwind CSS
- axios

**Infrastructure**
- Backend hosted on Render
- Frontend hosted on Vercel
- Database on MongoDB Atlas
- File storage on Cloudinary

## Architecture

```
CollabSphere/
├── backend/          Independently deployable Express API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middlewares/
│       └── validators/
├── frontend/         Independently deployable Next.js app
│   └── src/
│       ├── app/          # route pages (App Router)
│       ├── components/
│       ├── context/       # auth context
│       └── lib/           # API client
└── PRD.md            Original product requirements
```

## Permission matrix

| Action | Admin | Project Admin | Member |
|---|---|---|---|
| Create project | ✓ | ✓ | ✓ *(any authenticated user; creator becomes that project's Admin)* |
| Update / delete project | ✓ | ✗ | ✗ |
| Manage members | ✓ | ✗ | ✗ |
| Create / update / delete tasks | ✓ | ✓ | ✗ |
| View tasks | ✓ | ✓ | ✓ |
| Toggle subtask completion | ✓ | ✓ | ✓ |
| Create / delete subtasks | ✓ | ✓ | ✗ |
| Create / update / delete notes | ✓ | ✗ | ✗ |
| View notes | ✓ | ✓ | ✓ |

## API overview

| Resource | Base path |
|---|---|
| Auth | `/api/v1/auth` |
| Projects | `/api/v1/projects` |
| Tasks & subtasks | `/api/v1/tasks` |
| Notes | `/api/v1/notes` |
| Health check | `/api/v1/healthcheck` |

Full endpoint list and request/response shapes are in [`backend/PRD.md`](./backend/PRD.md).

## Running locally

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- Cloudinary account (free tier)
- Brevo account (free tier) for email

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
MONGO_URI=
PORT=8000
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

BREVO_API_KEY=

FORGOT_PASSWORD_REDIRECT_URL=http://localhost:3000/reset-password
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

```bash
npm run dev
```

## Deployment

- **Backend** deploys to Render from the `backend/` root directory
  (`npm install` / `npm start`)
- **Frontend** deploys to Vercel from the `frontend/` root directory
  (auto-detected Next.js build)
- **Database** is a MongoDB Atlas M0 free cluster
- File uploads go directly to Cloudinary — no local disk writes, so nothing
  is lost on redeploy
- Email sends over Brevo's HTTPS API rather than SMTP, since most free-tier
  hosts (including Render) block outbound SMTP ports

## Known limitations

- The backend's free-tier hosting sleeps after periods of inactivity,
  causing a delay on the first request after idle time
- Task priority and due-date-based Gantt-style views are not implemented —
  the Timeline tab is a chronological list, not a calendar grid

## Author

**Vivek Dhapa**
GitHub: [@vivekdhapa](https://github.com/vivekdhapa)
