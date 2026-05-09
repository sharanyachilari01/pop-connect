# POP-CONNECT

POP-CONNECT is a full-stack academic and administrative management system designed to manage Professors of Practice (PoP), lecture workflows, activity reports, attendance, and honorarium processing through a centralized web platform.

## Features

- JWT Authentication & Role-Based Access Control (RBAC)
- Lecture Scheduling & Approval Workflow
- Activity Report Submission & Verification
- Attendance Tracking
- Automated Honorarium Calculation
- PDF Report Generation
- Role-Specific Dashboards
- Workflow State Management

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- pdfkit

---

## Workflow

### Lecture Workflow
```text
PENDING → POP_APPROVED → HOD_APPROVED → CONDUCTED
```

### Activity Report Workflow
```text
SUBMITTED → FACULTY_VERIFIED → HOD_APPROVED
```

### Honorarium Workflow
```text
GENERATED → FACULTY_VERIFIED → HOD_APPROVED → PAID
```

---

# Installation

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

## Default Admin Credentials

```text
Email: admin@vnr.edu
Password: admin123
```

---

## Main Modules

- Authentication
- User Management
- Lecture Management
- Activity Reports
- Attendance
- Honorariums
- PDF Export

---

## Security Features

- JWT Authentication
- Protected Routes
- RBAC Middleware
- Password Hashing
- Backend Workflow Validation

---

## License

For educational and development purposes.
