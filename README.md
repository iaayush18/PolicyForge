# 🛡️ PolicyForge: AI-Powered Student Mental Health Monitoring

A complete **MERN-to-PERN stack** web application for assessing and monitoring student mental well-being using the **PHQ-9 (Patient Health Questionnaire-9)** clinical standard. 

Originally built as a standard application, **PolicyForge** has been completely overhauled to feature robust DevOps practices. It now utilizes a highly scalable, containerized architecture with multi-environment CI/CD pipelines, PostgreSQL database migrations, and Stable/Canary deployment strategies.

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## 📋 Table of Contents
- [System Architecture & DevOps](#-system-architecture--devops)
- [🖥️ User Interface (UI) Overview](#️-user-interface-ui-overview)
- [✨ Core Application Features](#-core-application-features)
- [👥 User Roles & Permissions](#-user-roles--permissions)
- [📊 PHQ-9 Scoring System](#-phq-9-scoring-system)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [📡 API Documentation](#-api-documentation)
- [🚀 Local Docker Setup](#-local-docker-setup)
- [🌐 Production Deployment Guide](#-production-deployment-guide)

---

## 🏗️ System Architecture & DevOps

The PolicyForge update transitioned the application into a robust, cloud-native microservices architecture:

* **Database Migration**: Transitioned from MongoDB to **PostgreSQL** using **Prisma ORM** for type-safe database queries and automated schema migrations.
* **Containerization**: Both the backend API and frontend UIs are fully Dockerized and automatically published to the **GitHub Container Registry (GHCR)**.
* **Canary Deployments (A/B Testing)**: Implemented a dual-frontend architecture:
    * **Stable Version**: Tracks the `main` branch, served at the root domain.
    * **Canary Version**: Tracks the `v2` branch, served under the `/v2/` path for safe feature rollouts.
* **Reverse Proxying**: Uses **Nginx** locally to seamlessly route traffic between the Stable UI, Canary UI, and the Backend API.

---

## 🖥️ User Interface (UI) Overview

The frontend is built with React 18 and Tailwind CSS, focusing on a clean, professional, and accessible user experience.

### 1. Authentication Portal
* **Login Page**: Clean interface with immediate role-based redirection. Includes demo credential buttons for quick evaluator access.
* **Responsive Design**: Fully mobile-optimized for students accessing assessments via smartphones.

### 2. Admin Dashboard (Counselors/Faculty)
* **Statistics Overview**: Top-level metric cards showing Total Students, Critical Cases, Moderate Cases, and Healthy Students.
* **Data Visualization**: 
  * Risk distribution pie charts (built with Recharts).
  * Course-wise and gender-wise statistics bar charts.
* **Student Directory**: A searchable, filterable data table displaying all students.
* **Student Management UI**: Slide-out panels or modals for adding new students and editing demographics with real-time form validation.

### 3. Student Dashboard
* **Status Display**: A large, color-coded risk score indicator showing current mental health status.
* **Assessment History**: A chronological timeline of past PHQ-9 scores.
* **Motivational Hub**: Dynamic motivational messaging and recommendations based on the student's latest score.
* **Crisis Resources**: Persistent, easy-to-access emergency hotline information.

### 4. PHQ-9 Assessment Flow
* **Interactive Questionnaire**: A multi-step form with a progress bar.
* **Real-time Processing**: Radio button selections for the 9 clinical questions with instant score calculation upon submission.
* **Optional Notes**: A secure text field for students to add context to their assessment.

---

## ✨ Core Application Features

* **Standardized Assessment**: Utilizes the clinically validated PHQ-9 questionnaire.
* **Automatic Risk Scoring**: Maps raw scores (0-27) to clinical risk tiers (0-3).
* **Real-Time Alerts**: Flags critical cases instantly for administrator review.
* **Historical Tracking**: Maintains longitudinal data for identifying trends in student mental health over semesters.

---

## 👥 User Roles & Permissions

Strict isolation is maintained via JWT middleware to ensure HIPAA/FERPA compliance standards.

| Capability | Admin (Counselor) | Student |
| :--- | :---: | :---: |
| **View All Students** | ✅ | ❌ |
| **View Own Profile/History** | ✅ | ✅ |
| **Add/Delete Students** | ✅ | ❌ |
| **Edit Demographics** | ✅ | ❌ |
| **Edit PHQ-9 Responses** | ❌ | ❌ (Immutable) |
| **Take PHQ-9 Assessment** | ❌ | ✅ |
| **View Global Analytics** | ✅ | ❌ |

---

## 📊 PHQ-9 Scoring System

### Question Format
Each of the 9 questions has 4 frequency options:
* **Not at all** = 0 points
* **Several days** = 1 point
* **More than half the days** = 2 points
* **Nearly every day** = 3 points

### Clinical Risk Calculation

| Raw Score (0-27) | Risk Score | Clinical Label | UI Color | Recommended Action |
| :--- | :---: | :--- | :--- | :--- |
| **0-4** | 0 | Minimal Depression | 🟢 Green | Maintain healthy habits |
| **5-9** | 1 | Mild Depression | 🟡 Yellow | Stress management |
| **10-14** | 2 | Moderate Depression | 🟠 Orange | Counseling suggested |
| **15-27** | 3 | Severe Depression | 🔴 Red | Immediate support required |

---

## 🛠️ Tech Stack

### Infrastructure & DevOps
- **Docker & Docker Compose** - Containerization
- **GitHub Actions & GHCR** - CI/CD Pipelines
- **Nginx** - Reverse proxy
- **Vercel** - Frontend Production Hosting
- **Render** - Backend API Production Hosting

### Backend (PERN)
- **Node.js & Express.js** - API Framework
- **PostgreSQL** - Relational Database
- **Prisma** - ORM & Migrations
- **JWT & Bcrypt** - Authentication

### Frontend
- **React 18 & Vite** - UI library and build tool
- **React Router v6** - SPA Routing
- **Tailwind CSS** - Utility styling
- **Recharts** - Data visualization

---

## 📁 Project Structure

```text
PolicyForge/
├── .github/workflows/        # CI/CD GitHub Actions (main.yml, v2.yml)
├── backend/                  # Express.js API
│   ├── prisma/               # Schema, Migrations, and Seed scripts
│   ├── controllers/          # Business logic
│   ├── routes/               # API endpoints
│   ├── middleware/           # Auth & Error handling
│   ├── Dockerfile            # Backend container instructions
│   └── server.js             # Entry point
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/       # Reusable UI parts
│   │   ├── pages/            # Admin/Student Dashboards
│   │   └── services/         # Axios API clients
│   ├── Dockerfile            # Frontend container instructions
│   └── vite.config.js        
├── infra/nginx/              # Local Reverse Proxy config
│   └── nginx.conf            
├── docker-compose.yml        # Local orchestration
└── README.md

```

---

## 📡 API Documentation

**Authentication Required:** `Authorization: Bearer <token>`

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticate user | Public |
| `GET` | `/api/dashboard/stats` | Global metrics | Admin |
| `GET` | `/api/students` | List all students | Admin |
| `POST` | `/api/assessments` | Submit PHQ-9 | Student |
| `GET` | `/api/assessments/my-history` | View own records | Student |

---

## 🚀 Local Docker Setup

Run the entire architecture (DB, API, Stable UI, Canary UI, Nginx) locally.

```bash
# 1. Clone repository
git clone [https://github.com/Amritray01/PolicyForge.git](https://github.com/Amritray01/PolicyForge.git)
cd PolicyForge

# 2. Configure Environment
cp .env.example .env
# Set DB_PASSWORD and JWT_SECRET in .env

# 3. Spin up the cluster
docker-compose up -d --build

# 4. Migrate & Seed Database
docker-compose exec backend-stable npx prisma migrate dev
docker-compose exec backend-stable npx prisma db seed

```

**Access Points:**

* **Stable UI**: `http://localhost/`
* **Canary UI**: `http://localhost/v2/`
* **Backend API**: `http://localhost/api/`

---

## 🌐 Production Deployment Guide

The application utilizes a split-hosting strategy for maximum free-tier efficiency.

### 1. Database (Aiven or Supabase)

* Provision a managed PostgreSQL instance.
* Retrieve the standard connection string.

### 2. Backend API (Render)

* Connect your GitHub repo to a Render Web Service.
* **Environment Variables**: Set `DATABASE_URL`.
* **Start Command**: `npx prisma migrate deploy && npx prisma db seed && node server.js`

### 3. Frontend UIs (Vercel)

* **PolicyForge Stable**: Create a Vercel project linked to the `main` branch.
* **PolicyForge Canary**: Create a second Vercel project linked to the `v2` branch.
* **Environment Variables**: In both projects, set `VITE_API_URL` to your Render backend URL.
* *Note: Canary uses a `vercel.json` rewrite configuration for SPA routing.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://www.google.com/search?q=https://github.com/Amritray01/PolicyForge/issues).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

```

```
