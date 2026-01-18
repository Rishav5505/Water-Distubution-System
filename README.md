# JalConnect – Smart Water Delivery System

JalConnect is a modern MERN stack application designed for large apartment societies to streamline drinking water delivery. It allows residents to place orders digitally, vendors to manage their deliveries, and admins to monitor platform analytics.

## Features

- **Residents:** Quick order placement, order history, tower/flat management.
- **Vendors:** Real-time delivery dashboard, tower-wise order grouping, earnings tracking, active/inactive status toggle.
- **Admin:** Comprehensive analytics, revenue monitoring, vendor price management, user/vendor management, tower-wise usage reports.
- **UI/UX:** Premium glassmorphism design, responsive layouts, interactive charts, and smooth animations.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Lucide Icons, Framer Motion, Recharts.
- **Backend:** Node.js, Express.js, JWT Authentication.
- **Database:** MongoDB (Mongoose).

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB installed and running (default: `mongodb://localhost:27017/jalconnect`)

### Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (one is provided by default):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/jalconnect
   JWT_SECRET=jalconnect_secret_key_123
   NODE_ENV=development
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the `my-react-website` folder (the frontend):
   ```bash
   cd my-react-website
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Creating an Admin (Method)
You can register an account through the UI and manually update the `role` field to `admin` in the MongoDB `users` collection using MongoDB Compass or Mongo Shell.

## Society Details
- 24 Towers
- ~100 Flats per Tower
- Standard Water Price: ₹30 per bottle

## License
MIT
