# PlateOps

PlateOps is a comprehensive, full-stack restaurant management system designed to streamline operations from table service to the kitchen and cashier. It features a real-time, role-based interface for waiters, kitchen staff, and cashiers, all powered by WebSockets.

## Core Features

- **Role-Based Access**: Separate, tailored interfaces for Waiters, Kitchen staff, and Cashiers.
- **Real-time Order Tracking**: Orders and table statuses update instantly across all relevant interfaces using Socket.IO.
- **Waiter Workflow**: Waiters can view a real-time status map of all tables, select a table, and create new orders from a categorized menu.
- **Kitchen Display System (KDS)**: The kitchen staff has a dedicated view to see incoming orders, move them from "Pending" to "In Progress," and finally mark them as "Ready" for pickup.
- **Cashier & Payment**: Cashiers have an overview of all tables, their current status, item count, and total bill. They can select a table to view a detailed breakdown of all its orders and process the final payment.
- **Secure Authentication**: User authentication is handled via JWT, with passwords securely hashed using bcrypt.

## Tech Stack

The project is a monorepo containing a separate client and server..

- **Backend (`/server`)**:
  - **Framework**: Node.js with Express.js
  - **Language**: TypeScript
  - **ORM**: Prisma with a PostgreSQL database
  - **Real-time**: Socket.IO
  - **Authentication**: JSON Web Tokens (JWT)
  - **Validation**: Zod

- **Frontend (`/client`)**:
  - **Framework**: React (built with Vite)
  - **Language**: TypeScript
  - **UI**: Material-UI (MUI) for components and styling
  - **State & Caching**: TanStack Query for server state management
  - **Real-time**: Socket.IO Client
  - **Routing**: React Router

- **Database**:
  - PostgreSQL

## Getting Started

Follow these instructions to get a local copy of PlateOps up and running.

### Prerequisites

- Node.js (v18 or higher)
- npm (or a compatible package manager like yarn/pnpm)
- A running PostgreSQL instance

### 1. Server Setup

First, set up and run the backend server.

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create a .env file from the example
cp .env.example .env

# 4. Update your .env file with your PostgreSQL connection string
# e.g., DATABASE_URL="postgresql://user:password@localhost:5432/plateops"

# 5. Run Prisma migrations to set up the database schema
npx prisma migrate dev

# 6. Seed the database with initial users, tables, and menu items
npx prisma db seed

# 7. Start the development server (will run on http://localhost:3000)
npm run dev
```

### 2. Client Setup

With the server running, you can now start the frontend application.

```bash
# 1. Open a new terminal and navigate to the client directory
cd client

# 2. Install dependencies
npm install

# 3. Create a .env file from the example
cp .env.example .env

# 4. Ensure the VITE_SOCKET_URL in your .env file
#    points to your running server. The default is correct if your
#    server is running on port 3000.
#    VITE_SOCKET_URL=http://localhost:3000

# 5. Start the client development server (will run on http://localhost:5173)
npm run dev
```

You can now access the application at `http://localhost:5173`.

### Default Login Credentials

The database seed script creates the following users:

- **Role**: Waiter
  - **Username**: `waiter1`
  - **Password**: `waiter`
- **Role**: Kitchen
  - **Username**: `kitchen1`
  - **Password**: `kitchen`
- **Role**: Cashier
  - **Username**: `cashier1`
  - **Password**: `cashier`

## API Endpoints

The server exposes a RESTful API for handling operations. A Bruno collection file (`brunoCollection.yaml`) is included in the `/server` directory for easy testing of the API endpoints.

Key endpoints include:

- `POST /api/auth/login`: Authenticate a user and receive a JWT.
- `GET /api/itens`: Fetch all menu items, grouped by category.
- `GET /api/orders`: Get a list of all tables and their current order status (for Waiter).
- `POST /api/orders/create`: Create a new order for a specific table.
- `GET /api/orders/all`: Get all non-paid orders, grouped by status (for Kitchen).
- `POST /api/orders/update-status`: Advance an order's status (PENDING -> IN_PROGRESS -> READY).
- `GET /api/orders/cashier`: Get a summary of all tables with active orders (for Cashier).
- `POST /api/orders/table`: Get detailed order and item data for a specific table to generate a bill.
- `POST /api/orders/pay`: Mark all active orders for a table as PAID.
