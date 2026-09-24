# BookGrid — Modern Library Management Web Application

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Router-6.26-red?style=for-the-badge&logo=reactrouter" alt="React Router" />
  <img src="https://img.shields.io/badge/Cloudinary-Image--Storage-blueviolet?style=for-the-badge&logo=cloudinary" alt="Cloudinary" />
</p>

## 📌 Overview

**BookGrid** is a state-of-the-art, feature-rich web application for modern university libraries. Built with **React 18**, **TypeScript**, **Vite**, and custom **Vanilla CSS Design Tokens**, BookGrid offers dynamic, role-tailored portals for **Students**, **Moderators**, and **System Administrators**.

It includes integrated **in-browser PDF e-Reading**, **Cloudinary cover image upload**, **physical inventory barcode tracking**, **circulation desk issue/return processing**, **fine assessment receipts**, and **real-time student eligibility tracking**.

---

## ✨ Key Features & Portals

### 🎓 1. Student Portal (`/student/*`)
- 📖 **Catalog & Search**: Browse library catalog with multi-keyword search, category filtering, and format tags (`Physical Only` vs `Digital + Physical`).
- 📄 **Integrated In-Browser PDF e-Reader**: Read attached PDF e-Books directly inside the browser with page controls, zoom, fullscreen mode, and local cache.
- 🔖 **Book Reservations & Wishlist**: Reserve physical books for desk pickup or save favorites to wishlist.
- 💳 **Fine Management & Digital Receipts**: View unpaid fine balances, simulate online payments (Credit Card, Mobile Banking), and inspect printable payment receipts.
- 👤 **Student Profile**: View registered Student ID (preserves exact values like `2024001` or `STU-2024-0440`), university department, active loans count, and transaction history.

### 🛡️ 2. Moderator Panel (`/moderator/*`)
- 📊 **Moderator Dashboard**: Real-time stats on issued loans, overdue books, pending reservations, and pending book requests.
- 📚 **Book Catalog Management**: Full CRUD operations for library books, step-by-step image uploading to Cloudinary, PDF attachment caching, and edition tracking.
- 📦 **Physical Inventory & Barcode Tracking**: Register physical copy counts, scan custom barcodes, assign shelf/stacks locations (`Stack 3C`, `Rack R2`), manage copy conditions (`New`, `Excellent`, `Fair`, `Damaged`), and preview/print barcode label tags.
- 🔄 **Borrowing & Returns Desk**: Issue books to students by email/Student ID, extend loan due dates, process returns, and assess dynamic fines.
- 👥 **Student Management**: Filter student accounts by department or borrowing eligibility, inspect active loan counts, and edit account profiles.
- 🧾 **Fines Desk & Requests Pipeline**: Collect fine payments, approve student new book requests, and update reservation pick-up deadlines.

### 👑 3. Administrator Suite (`/admin/*`)
- ⚙️ **User & Role Administration**: Manage system users across `STUDENT`, `MODERATOR`, and `ADMINISTRATOR` roles with account status toggles (`Active`, `Suspended`, `Blocked`).
- 📈 **Comprehensive Analytics**: Generate library usage reports, export CSV reports for borrowings and fines, and review system-wide audit activity logs.
- 🔧 **System Settings**: Configurable library rules (Max books per student, borrowing duration days, daily fine rates, automated email notifications).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **UI Framework** | [React 18.3](https://react.dev/) |
| **Language** | [TypeScript 5.5](https://www.typescriptlang.org/) |
| **Build Tool & Dev Server** | [Vite 5.4](https://vitejs.dev/) |
| **Routing** | [React Router DOM 6.26](https://reactrouter.com/) |
| **HTTP Client** | [Axios 1.7](https://axios-http.com/) |
| **Iconography & Fonts** | FontAwesome 6.6, Google Fonts (Inter, Outfit) |
| **Data Visualization** | Recharts 3.10 |
| **Cloud Media Storage** | Cloudinary Unsigned Upload API |
| **Styling** | Vanilla CSS3 (Custom Design Tokens, Warm Aesthetics, Responsive Layouts) |

---

## 📁 Repository Structure

```
LMS Frontend/
├── public/                  # Static assets & favicons
├── src/
│   ├── assets/              # Web fonts & global media
│   ├── components/
│   │   ├── layout/          # Navigation Header, Sidebar, Footer, Layout Containers
│   │   └── ui/              # Reusable UI Library (Button, Input, Select, Badge, Modal, EReaderModal, ConfirmationDialog)
│   ├── data/                # Mock catalog & seed fallback data
│   ├── pages/
│   │   ├── Admin/           # Admin Dashboard, Users, Books, Inventory, Fines, Reports
│   │   ├── Auth/            # Login, Register, Verify Email, Reset Password
│   │   ├── Moderator/       # Mod Dashboard, Catalog, Inventory Barcodes, Borrowing, Returns, Students, Fines
│   │   └── Student/         # Student Dashboard, Catalog, e-Reader, Wishlist, Fines, Profile
│   ├── services/            # API Services (apiClient, authService, bookService, studentService, moderatorService, adminService)
│   ├── utils/               # Local Storage LEDGERS (borrowingStorageService, fineStorageService, inventoryStorageService, pdfStorageService, cloudinaryService, departments)
│   ├── App.tsx              # Main Application Router & Route Guards
│   └── main.tsx             # Application Entrypoint
├── package.json             # NPM dependencies & build scripts
├── tsconfig.json            # TypeScript compiler configuration
├── vite.config.ts           # Vite build & proxy settings
└── README.md
```

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Backend Spring Boot API URL
VITE_API_BASE_URL=http://localhost:9292/api/v1

# Cloudinary Unsigned Image Upload Settings
VITE_CLOUDINARY_CLOUD_NAME=lms-bookvault
VITE_CLOUDINARY_UPLOAD_PRESET=book_covers_preset
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
```

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sakib-011/LMS-Frontend.git
cd LMS-Frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Build for Production
To test TypeScript compilation and generate the minified production bundle:
```bash
npm run build
```
The optimized production output will be generated in the `/dist` folder.

### 4. Preview Production Build Locally
```bash
npm run preview
```

---

## 🔐 Default Demo Accounts

If running with backend initial seed data or offline mock mode:

| Role | Email | Password | Student ID |
| :--- | :--- | :--- | :--- |
| **Student** | `student@university.edu` | `password123` | `STU-2024-0440` |
| **Moderator** | `moderator@university.edu` | `password123` | `MOD-101` |
| **Administrator** | `admin@university.edu` | `password123` | `ADM-001` |

---

## 🌐 Deployment

BookGrid Frontend is fully optimized for static hosting providers:

- **Vercel**: Includes pre-configured [`vercel.json`](file:///home/sakib-shourov/University/Web%20&%20Internet/BookGrid/LMS%20Frontend/vercel.json) rewrite rules for Single Page Application (SPA) routing.
- **Netlify / GitHub Pages**: Deploy the output of `/dist` after running `npm run build`.

---

## 📜 License & Copyright
Developed for University Web & Internet Application Project.  
© 2026 Sakib Shourov & BookGrid Team. All rights reserved.
