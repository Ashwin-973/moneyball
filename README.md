# Moneyball: Hyperlocal Flash-Sale Engine

[![Project Status: Active](https://img.shields.io/badge/Project%20Status-Active-brightgreen)](https://github.com/Ashwin-973/moneyball)
[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Frontend: Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Database: PostgreSQL/PostGIS](https://img.shields.io/badge/Database-PostgreSQL%2FPostGIS-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Package Manager: uv](https://img.shields.io/badge/Package%20Manager-uv-F7931E?logo=python&logoColor=white)](https://github.com/astral-sh/uv)

**Moneyball** is a high-performance, hyperlocal marketplace engine designed to connect brick-and-mortar retailers with bargain-seeking consumers in real-time. By leveraging spatial indexing and asynchronous orchestration, Moneyball enables "flash-sales" that are geographically targeted to users within a specific radius.

---

### 🎥 Live Demo & Presentation
[ ![Watch the Demo](https://img.shields.io/badge/Watch%20Demo%20on-Google%20Drive-EB4132?style=for-the-badge&logo=googledrive&logoColor=white) ](https://drive.google.com/file/d/1CDa0b9LC_vVxGJMzClRixK5o_ONxZrxF/view?usp=sharing)

---

## 🌟 Key Features

### 🏢 For Retailers (The Business Dashboard)
- **Inventory Synchronization**: Upload and manage product catalogs with bulk CSV support.
- **Dynamic Yield Management**: Create time-bound "Deal Drops" to move inventory during low-footfall hours.
- **Store Policies & Configuration**: Define custom return policies, operating hours, and location headers.
- **Visual Analytics**: Real-time tracking of deal reservations and consumer interest levels.

### 📍 For Consumers (The Discovery App)
- **Spatial Discovery Engine**: A lightning-fast map interface powered by Leaflet and PostGIS to find deals within walking distance.
- **Instant Reservations**: Secure a deal with a single click before the countdown expires.
- **Category Intelligence**: Smart filtering by product category, discount depth, and proximity.
- **Real-time Availability**: Live stock updates preventing "phantom deals."

---

## 🏗️ Technical Architecture

```mermaid
graph TD
    User((User/Client)) --> Frontend[Next.js 16 App Router]
    Frontend --> Auth[JWT Authentication]
    Frontend --> API[FastAPI Gateway]
    
    API --> DB[(PostgreSQL + PostGIS)]
    API --> Cache[Zustand State]
    API --> Emails[Resend API]
    
    subgraph "Data Engine"
        DB --- GeoAlchemy2[Spatial Queries]
        API --- Pydantic[Data Validation]
    end
```

---

## 🛠️ Stack & Innovation

### Backend Sophistication
- **Python 3.13 + `uv`**: Utilizing the latest Python release for optimized performance and the `uv` toolchain for deterministic builds.
- **Asynchronous Geometry**: Leveraging **GeoAlchemy2** and **PostGIS** to perform complex "Within-Distance" queries on millions of coordinates in milliseconds.
- **Scalable Auth**: Stateless JWT-based RBAC (Role Based Access Control) distinguishing between `Store Owners` and `Consumers`.

### Frontend Excellence
- **React 19 & Next.js 16**: Utilizing cutting-edge React features including Server Components and optimized Action handling.
- **Map Interaction**: Advanced Leaflet implementation with custom markers, clustering, and radius-based visualizations.
- **Resilient Polling**: TanStack Query (v5) providing robust synchronization between the seller's inventory and the buyer's view.

---

## 🚀 Deployment Guide

### Environment Configuration

#### Backend (`/backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/moneyball
SECRET_KEY=yoursecret
RESEND_API_KEY=re_xxx
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Ashwin-973/moneyball.git
   ```

2. **Initialize Backend**
   ```bash
   cd backend
   uv sync
   uv run alembic upgrade head
   uv run uvicorn app.main:app --reload
   ```

3. **Initialize Frontend**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

---

## 🌍 Production Platforms
- **API/Database**: Deployed on **Render** (as a Python Native Web Service).
- **Frontend**: Deployed on **Vercel** (with Next.js optimization).
- **Email Service**: Orchestrated via **Resend**.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ for local retailers and bargain hunters.**
