# 🛡️ PolicyForge: AI-Powered Student Mental Health Monitoring

An enterprise-grade web application for assessing and monitoring student mental well-being using the **PHQ-9** standard. 

Originally built as a standard application, the system has been completely overhauled under the **PolicyForge** architecture to feature robust DevOps practices, including multi-environment CI/CD pipelines, Dockerized microservices, PostgreSQL migration, and Stable/Canary deployment strategies.

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

## 📋 Table of Contents
- [System Architecture & DevOps](#-system-architecture--devops)
- [Core Application Features](#-core-application-features)
- [Tech Stack](#-tech-stack)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Local Docker Setup](#-local-docker-setup)
- [Production Deployment](#-production-deployment)

---

## 🏗️ System Architecture & DevOps (New)

The **PolicyForge** update transitioned the application from a basic monolithic structure into a highly scalable, containerized architecture with a focus on deployment safety and environment isolation.

* **Database Migration**: Fully migrated from MongoDB to **PostgreSQL** using **Prisma ORM** for type-safe database queries and automated schema migrations.
* **Containerization**: Both backend and frontends are fully Dockerized and published to the **GitHub Container Registry (GHCR)**.
* **Canary Deployments**: Implemented a dual-frontend architecture:
    * **Stable Version**: Tracks the `main` branch, served via `/`.
    * **Canary Version**: Tracks the `v2` branch, served via `/v2/` for A/B testing and safe feature rollouts.
* **Reverse Proxying**: Uses **Nginx** locally to seamlessly route traffic between Stable UI, Canary UI, and the Backend API.

---

## ✨ Core Application Features

While the infrastructure has been modernized, the core mission of the application remains intact: providing a secure, real-time platform for mental health monitoring.

* **PHQ-9 Assessments**: Standardized clinical questionnaire with automatic risk scoring (0-3 scale).
* **Role-Based Access Control**: Strict isolation between Admin (Counselors) and Student permissions.
* **Real-Time Dashboard**: Analytics, trends, and risk-distribution charts for administrators.
* **Critical Alerts**: Immediate identification and highlighting of high-risk student cases.

---

## 🛠️ Tech Stack

### Infrastructure & DevOps
- **Docker & Docker Compose** - Containerization & orchestration
- **GitHub Actions** - CI/CD automated build and push workflows
- **GHCR** - Container image registry
- **Nginx** - Reverse proxy and traffic routing
- **Vercel** - Production frontend hosting (Stable & Canary)
- **Render** - Production API backend hosting

### Backend
- **PostgreSQL** - Primary relational database
- **Prisma** - Next-generation ORM and migration management
- **Node.js & Express.js** - API Framework
- **JWT & Bcrypt** - Authentication and security

### Frontend
- **React 18 & Vite** - UI library and build tool
- **React Router v6** - SPA Routing with `basename` support for Canary paths
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Dashboard data visualization

---

## 🔄 CI/CD Pipeline

The project utilizes automated GitHub Actions workflows to ensure zero-downtime deployments.

1.  **Push to `main`**: 
    * Builds the `frontend:stable` and `backend:stable` Docker images.
    * Pushes to GHCR.
    * Triggers a production deployment on Vercel (`policyforge-stable`) and Render.
2.  **Push to `v2`**: 
    * Builds the `frontend:canary` image.
    * Pushes to GHCR.
    * Triggers an isolated Vercel deployment (`policyforge-canary`) pointing to the stable backend API.

---

## 🚀 Local Docker Setup

To run the entire architecture (Database, API, Stable UI, Canary UI, and Nginx Proxy) locally:

### Prerequisites
- Docker & Docker Compose installed
- Git

### Installation

```bash
# 1. Clone repository
git clone [https://github.com/Amritray01/PolicyForge.git](https://github.com/Amritray01/PolicyForge.git)
cd PolicyForge

# 2. Configure Environment Variables
# Create a .env file in the root directory
cp .env.example .env

# 3. Spin up the containers
docker-compose up -d --build

# 4. Run Database Migrations & Seed
# Execute this inside the running backend container
docker-compose exec backend-stable npx prisma migrate dev
docker-compose exec backend-stable npx prisma db seed
