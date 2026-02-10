# Admin Dashboard - Aczen Connect

## Overview

The Admin Dashboard provides comprehensive task and assignment management for administrators. It appears at `/cofaczen` and allows admins to view, filter, create, and manage all user tasks.

## Access

### Admin Login
- **URL**: `/admin-login`
- **Username**: `core@acze.tech`
- **Password**: `Aczen@0402`

## Features

### 1. Dashboard Overview
After logging in, admins land on the Admin Dashboard (`/cofaczen`) which displays:

#### User Overview Cards
- **Total Users**: Count of all active team members
- **Completed Tasks**: Total tasks marked as completed
- **In Progress**: Total tasks in progress
- **User Cards**: Individual cards for each user showing:
  - User name/email
  - Total assigned tasks
  - Pending tasks count
  - In-progress tasks count
  - Completed tasks count

### 2. Task Management

#### View All Tasks
- Displays a comprehensive table of all assignments across all users
- Shows:
  - Task title
  - Assigned user
  - Due date
  - Priority level
  - Current status
  - Last activity timestamp

#### Filters & Controls
Filter tasks by:
- **User**: Show tasks for a specific user
- **Status**: Filter by (Assigned / In Progress / Completed / On Hold)
- **Priority**: Filter by (Low / Medium / High / Critical)
- **Search**: Search by task title or user name

#### Drill-Down View
- Click on any user card to view their specific tasks
- Shows all tasks assigned to that user with details
- Includes task remarks and last activity information
- "Back to Overview" button to return to full dashboard

### 3. Create Assignment

#### Access
- **URL**: `/cofaczen/create-assignment`
- **Button**: "Create Assignment" button in the dashboard header

#### Fields
- **Task Title** (required): Name of the task
- **Description**: Detailed task description
- **Assign To** (required): Select team member from dropdown
- **Due Date** (required): Select deadline date
- **Priority**: Low / Medium / High / Critical (default: Medium)
- **Initial Status**: Assigned / In Progress / Completed / On Hold (default: Assigned)
- **Remarks**: Optional additional notes

## Flow

1. **Admin Login** → Navigate to `/admin-login`
2. **Enter Credentials**:
   - Email: `core@acze.tech`
   - Password: `Aczen@0402`
3. **Admin Dashboard** → View all users and tasks
4. **Options**:
   - Filter/search tasks
   - View user-specific tasks by clicking user cards
   - Create new assignments via "Create Assignment" button
5. **Create Assignment** → Fill form and submit to assign new tasks
6. **Logout** → Return to login page

## Database Schema

### Tasks Table
```
- id (UUID)
- title (TEXT)
- description (TEXT)
- assigned_to (TEXT) - clerk_user_id
- assigned_by (TEXT) - clerk_user_id of admin
- due_date (DATE)
- priority (TEXT): Low, Medium, High, Critical
- status (TEXT): Assigned, In Progress, Completed, On Hold
- remarks (TEXT)
- last_activity (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## Session Management

Admin sessions are stored in `localStorage` with key `adminSession`:
```json
{
  "email": "core@acze.tech",
  "loggedIn": true,
  "loginTime": "2024-02-10T..."
}
```

## Security Notes

- Admin credentials are hardcoded (for development)
- Session stored in localStorage
- All database operations go through Clerk-authenticated user context
- Production deployment should use proper authentication service

## Components

- **AdminDashboard**: Main dashboard page
- **UserOverviewCards**: User statistics and drill-down cards
- **TasksTable**: Task list display with sorting
- **TaskFilters**: Filter UI for tasks
- **AdminLogin**: Login page with credential validation
- **CreateAssignment**: Form for creating new task assignments

## Routes

```
/admin-login                    → Admin login page
/cofaczen                       → Admin dashboard
/cofaczen/create-assignment     → Create new assignment
```
