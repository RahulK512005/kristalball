# Kristallball - Enterprise Military Asset Management System

**Kristallball** is an enterprise-grade Military Asset Management System that tracks military assets (weapons, vehicles, ammunition, tactical equipment) across multiple bases with real-time dynamic inventory calculation, atomic cross-base transfers, role-based access control (RBAC), and immutable audit logs.

---

## 🎯 Core Features & Capabilities

### 1. Dynamic Inventory Mathematical Model
Calculates inventory metrics dynamically in real-time according to the exact military formula:
$$\text{Closing Balance} = \text{Opening Balance} + \text{Net Movement} - \text{Assigned} - \text{Expended}$$
$$\text{Net Movement} = \text{Purchases} + \text{Transfers In} - \text{Transfers Out}$$

### 2. Granular Role-Based Access Control (RBAC)
- **ADMIN**: Unrestricted global access across all military bases and audit logs.
- **BASE_COMMANDER**: Automatically scoped to their assigned military base (`base_id`). Cannot view or modify data outside their base.
- **LOGISTICS_OFFICER**: Manages purchases, transfers, and inventory movements.

### 3. Atomic Cross-Base Transfers
Full ACID transactional safety for base-to-base transfers (`BEGIN TRANSACTION ... COMMIT`). Checks unassigned/unexpended stock availability before permitting transfers out of a base.

### 4. Immutable Audit Logs
Automatically captures every stock purchase, transfer, allocation, and expenditure mutation into an audit log table with user IDs, timestamps, and details.

---

## 🔑 Pre-Configured Test Credentials

| Role | Username | Password | Assigned Scope |
| :--- | :--- | :--- | :--- |
| **Global Admin** | `admin_user` | `AdminPass123!` | All Bases (Global Ops) |
| **Base Commander** | `commander_alpha` | `CommandPass123!` | Fort Alpha (Base #1) |
| **Base Commander** | `commander_bravo` | `CommandPass123!` | Camp Bravo (Base #2) |
| **Logistics Officer** | `logistics_officer` | `LogisticsPass123!` | Fort Alpha / Global Ops |

---

## 🚀 Running the System

### 1. Start the Backend API Server
```bash
cd backend
npm start
```
*Backend API runs at: `http://localhost:5000`*

### 2. Start the Frontend React Application
```bash
cd frontend
npm run dev
```
*Frontend App runs at: `http://localhost:3000`*

---

## 📁 System Architecture & Directory Structure

```
kristalball/
├── backend/
│   ├── config/db.js                 # JSON file-backed ACID Database module
│   ├── controllers/
│   │   ├── authController.js        # Authentication & JWT token issuance
│   │   ├── assetController.js       # Dynamic inventory calculation & breakdown
│   │   ├── purchaseController.js    # Stock purchases
│   │   ├── transferController.js    # Atomic cross-base transfers
│   │   ├── assignmentController.js  # Allocations & operational expenditures
│   │   └── auditController.js       # System audit trail logs
│   ├── middlewares/
│   │   ├── authMiddleware.js        # JWT token verification
│   │   ├── rbacMiddleware.js        # Role & base scope enforcement
│   │   └── loggerMiddleware.js      # Automated audit logger
│   ├── routes/                      # Express API route declarations
│   ├── seed.js                      # Realistic military dataset seeder
│   └── server.js                    # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── components/              # Navbar, Sidebar, StatCard, NetMoveModal, Breakdown Table, Charts
│   │   ├── context/                 # AuthContext
│   │   ├── pages/                   # Login, Dashboard, Purchases, Transfers, Assignments, AuditLogs
│   │   ├── services/                # Axios API client
│   │   ├── App.jsx                  # Protected React Router
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
└── package.json
```
