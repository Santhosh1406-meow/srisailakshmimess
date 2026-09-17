# Sri Sai Lakshmi Mess - Full-Stack Restaurant Website

> **"Authentic Taste • Homely Food • Happy Moments"**

A modern, responsive full-stack restaurant website for **Sri Sai Lakshmi Mess**, designed with an authentic South Indian culinary aesthetic, React.js frontend, and Node.js + Express.js REST API backend. Ready for deployment on **Netlify** (Frontend) and **Render** (Backend).

---

## 🌟 Features

- 🍛 **Authentic South Indian Aesthetic**: Warm cream/terracotta palette, crisp typography (`Plus Jakarta Sans` & `Playfair Display`), glassmorphism, and responsive banana leaf dining visual identity.
- 📱 **Mobile-First Responsive Design**: Sticky dynamic navbar, mobile slide drawer, responsive dish grids, and optimized mobile action buttons.
- 📋 **Centralized Menu & Category Filtering**: Filter by `All`, `Breakfast`, `Meals`, `Beverages`, search query, or `Pure Veg Only` with price in ₹ and dietary badges.
- 📝 **Online Order & Table Enquiry**: Interactive booking form with input validation, reference ID generation, instant client celebration, and friendly confirmation copy.
- 📞 **Instant Contact Actions**:
  - Floating WhatsApp chat button with pre-filled enquiry text.
  - Floating and header Call Now buttons with dynamic `tel:` links.
- 🖼️ **Interactive Gallery & Lightbox**: High-resolution dish and ambience photos with category filters and keyboard-accessible Lightbox viewer (Next/Prev/Esc).
- 🗺️ **Configurable Location & Hours**: Embedded Google Maps location and customizable daily operating hours.
- 🔒 **Backend Security**: Helmet headers, configurable CORS, input validation, and IP rate limiting on public inquiry endpoints.
- 🗄️ **Database-Ready Architecture**: Decoupled service/repository layer allowing seamless plug-in of MongoDB / PostgreSQL / MySQL.
- 🚀 **Deployment Ready**:
  - Frontend configured for Netlify SPA routing with `netlify.toml` and `_redirects`.
  - Backend configured for Render with dynamic `process.env.PORT` and graceful SIGTERM handling.
- 🔍 **SEO & Accessibility**: OpenGraph meta tags, semantic HTML5, descriptive alt tags, and JSON-LD structured data for Restaurant schema.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Styling**: Custom CSS Design Tokens & CSS Variables
- **Celebration Effects**: Canvas Confetti
- **Hosting**: Netlify

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Security & Utilities**: Helmet, CORS, Express Rate Limit, Morgan, Dotenv
- **Architecture**: Controller-Service-Model Pattern (Database-Agnostic)
- **Hosting**: Render

---

## 📁 Folder Structure

```text
sri-sai-lakshmi-mess/
├── client/                     # Frontend Application
│   ├── public/
│   │   ├── _redirects          # Netlify SPA redirect rule
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/         # Navbar, Footer, DishCard, FloatingActions, LightboxModal, SkeletonLoader
│   │   ├── data/               # restaurantData.js (Centralized constants, highlights, gallery)
│   │   ├── layouts/            # MainLayout.jsx
│   │   ├── pages/              # Home, Menu, About, Gallery, OrderEnquiry, Contact, NotFound
│   │   ├── services/           # api.js (REST API client)
│   │   ├── index.css           # Design tokens & responsive styles
│   │   ├── App.jsx             # React Router routing table
│   │   └── main.jsx
│   ├── index.html              # Head meta, Google Fonts, JSON-LD Schema
│   ├── netlify.toml            # Netlify configuration & security headers
│   ├── vite.config.js          # Vite config with /api proxy
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── server/                     # Backend REST API
│   ├── src/
│   │   ├── config/             # Environment configuration & defaults
│   │   ├── controllers/        # menuController, orderController, healthController
│   │   ├── middleware/         # rateLimiter, validator, errorHandler
│   │   ├── models/             # MenuItem.js, Order.js
│   │   ├── routes/             # menuRoutes, orderRoutes, healthRoutes
│   │   ├── services/           # menuService.js, orderService.js
│   │   └── app.js              # Express application setup
│   ├── server.js               # Server entry point
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### 1. Run Backend Server
```bash
cd server
npm install
npm run dev
```
The API server will start on: **`http://localhost:5000`**
- Health Check: `http://localhost:5000/api/health`
- Menu Endpoint: `http://localhost:5000/api/menu`

### 2. Run Frontend Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
The frontend dev server will launch at: **`http://localhost:5173`**
(Vite automatically proxies `/api` calls to `http://localhost:5000`).

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Optional | Server port (Render sets this dynamically) | `5000` |
| `NODE_ENV` | Optional | Environment mode (`development` or `production`) | `development` |
| `CLIENT_URL` | Optional | Allowed frontend origins for CORS (comma separated) | `http://localhost:5173,https://your-app.netlify.app` |
| `DATABASE_URL` | Optional | Connection string for MongoDB / PostgreSQL | `mongodb+srv://...` |

### Frontend (`client/.env`)
| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Optional | Backend API base URL (`/api` in dev, Render URL in prod) | `https://sri-sai-lakshmi-mess-api.onrender.com/api` |
| `VITE_WHATSAPP_NUMBER` | Optional | WhatsApp number with country code (no + or -) | `919876543210` |
| `VITE_RESTAURANT_PHONE` | Optional | Display telephone number for Call button | `+91 98765 43210` |
| `VITE_RESTAURANT_EMAIL` | Optional | Restaurant contact email address | `contact@srisailakshmimess.com` |
| `VITE_RESTAURANT_ADDRESS`| Optional | Physical restaurant address | `12/4, South Car Street, Madurai...` |
| `VITE_OPENING_HOURS` | Optional | Daily service hours | `Monday – Sunday: 7:00 AM – 10:00 PM` |
| `VITE_GOOGLE_MAP_EMBED_URL` | Optional | Google Maps embed iframe URL | `https://www.google.com/maps/embed?...` |

---

## 🌐 Deployment Guide

### Deploying Frontend to Netlify

1. Push the code repository to **GitHub / GitLab**.
2. Log into [Netlify](https://app.netlify.com/) and click **"Add new site"** -> **"Import an existing project"**.
3. Select your repository and configure the build settings:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`
4. In **Site Configuration > Environment Variables**, add:
   - `VITE_API_URL`: URL of your deployed Render backend (e.g. `https://sri-sai-lakshmi-mess-api.onrender.com/api`)
   - `VITE_WHATSAPP_NUMBER`: Your restaurant WhatsApp number (e.g. `919876543210`)
   - `VITE_RESTAURANT_PHONE`: Your contact phone
5. Deploy Site. The included `netlify.toml` and `_redirects` ensure React Router handles page refreshes correctly.

---

### Deploying Backend to Render

1. Log into [Render](https://render.com/) and click **"New +"** -> **"Web Service"**.
2. Connect your GitHub repository.
3. Configure the Web Service:
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Under **Environment Variables**, set:
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-site-name.netlify.app`
5. Click **Create Web Service**.

---

## 📡 API Documentation

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Response:**
```json
{
  "status": "OK",
  "message": "Sri Sai Lakshmi Mess API is running",
  "timestamp": "2026-09-07T11:00:00.000Z",
  "uptime": 120.4
}
```

### 2. Get Menu Items
- **Endpoint:** `GET /api/menu`
- **Query Parameters:**
  - `category` *(optional)*: `Breakfast`, `Meals`, `Beverages`
  - `search` *(optional)*: Text search matching name, Tamil name, or description
  - `popular` *(optional)*: `true` to return customer favorites
- **Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "dish-01",
      "name": "South Indian Special Meals",
      "tamilName": "தென்னிந்திய சாப்பாடு",
      "description": "Traditional full meals served with steamed ponni rice, aromatic sambar, rasam...",
      "category": "Meals",
      "price": 130,
      "image": "https://images.unsplash.com/...",
      "isVegetarian": true,
      "isAvailable": true,
      "isPopular": true,
      "rating": 4.9,
      "portion": "Unlimited Thali"
    }
  ]
}
```

### 3. Get Dish by ID
- **Endpoint:** `GET /api/menu/:id`
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "dish-01",
    "name": "South Indian Special Meals",
    "price": 130
  }
}
```

### 4. Submit Order / Enquiry
- **Endpoint:** `POST /api/orders`
- **Rate Limit:** 15 requests per 15 mins per IP
- **Request Body:**
```json
{
  "customerName": "Ramesh Kumar",
  "phone": "9876543210",
  "email": "ramesh@example.com",
  "foodItem": "South Indian Special Meals",
  "quantity": 2,
  "preferredDate": "2026-09-08",
  "preferredTime": "12:30 PM",
  "specialInstructions": "Please pack separately for travel."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Your enquiry has been submitted successfully. We will contact you shortly.",
  "data": {
    "enquiryId": "ORD-1757223400000-4821",
    "customerName": "Ramesh Kumar",
    "phone": "9876543210",
    "foodItem": "South Indian Special Meals",
    "quantity": 2,
    "preferredDate": "2026-09-08",
    "preferredTime": "12:30 PM",
    "status": "Enquiry Received",
    "createdAt": "2026-09-07T11:05:00.000Z"
  }
}
```

---

## 🗄️ Database Integration Guide

The backend uses a clean **Controller -> Service -> Model** design pattern. To connect **MongoDB (Mongoose)** or **PostgreSQL (Prisma/Sequelize)**:

1. Install your ORM in `server/` (e.g., `npm i mongoose`).
2. Add connection logic in `server/src/config/database.js`.
3. In `server/src/services/menuService.js` and `server/src/services/orderService.js`, replace the in-memory array methods with model queries (e.g. `await OrderModel.create(orderData)`).
4. No route or controller changes are required!

---

## 📄 License
© 2026 **Sri Sai Lakshmi Mess**. All Rights Reserved.
