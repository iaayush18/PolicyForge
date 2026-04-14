# 🧠 AI-Powered Student Mental Health Monitoring System

A complete **MERN stack** web application for assessing and monitoring student mental well-being using the **PHQ-9 (Patient Health Questionnaire-9)** standard. Features role-based access control, real-time risk scoring, and comprehensive analytics dashboard.

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [PHQ-9 Scoring](#-phq-9-scoring-system)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### Core Functionality
- ✅ **PHQ-9 Assessment**: Standard clinical questionnaire with 9 questions
- ✅ **Automatic Risk Scoring**: 0-3 scale (Minimal → Critical)
- ✅ **Role-Based Access Control**: Admin vs Student permissions
- ✅ **Real-Time Dashboard**: Statistics, charts, and analytics
- ✅ **Student Management**: CRUD operations with validation
- ✅ **Assessment History**: Track mental health over time
- ✅ **Critical Case Alerts**: Identify high-risk students immediately

### Admin Capabilities
- View global statistics (total students, critical cases)
- Add new students with complete profiles
- Update student demographics (age, course, CGPA)
- **Cannot** modify PHQ-9 responses (students only)
- Filter students by risk level
- Search by name or student ID
- View course-wise and gender-wise statistics
- Export-ready data tables

### Student Capabilities
- Take/retake PHQ-9 assessment anytime
- View current mental health score (0-3)
- Get personalized recommendations
- Track assessment history
- See motivational messages based on score
- Access crisis hotline information

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

### Tools & Libraries
- **date-fns** - Date formatting
- **lucide-react** - Icons
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **CORS** - Cross-origin requests

## 🚀 Quick Start

### Prerequisites
```bash
# Required
- Node.js 16+ and npm
- MongoDB 5.0+ (local or Atlas)

# Optional
- Git
- MongoDB Compass (GUI)
```

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd mental-health-system

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# Start MongoDB (if local)
mongod

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
# ✅ Backend running on http://localhost:5000

# 3. Setup Frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env
# Verify VITE_API_URL points to backend

# Start frontend
npm run dev
# ✅ Frontend running on http://localhost:3000
```

### Quick Test

1. Open browser: `http://localhost:3000`
2. **Login as Admin**: `admin@university.edu / admin123`
3. **Login as Student**: `student1@university.edu / Welcome123`

## 📁 Project Structure

```
mental-health-system/
│
├── backend/                    # Express.js API
│   ├── models/
│   │   ├── User.model.js      # Authentication
│   │   ├── Student.model.js   # Student profiles
│   │   └── Assessment.model.js # PHQ-9 assessments
│   ├── routes/
│   │   ├── auth.routes.js     # Login, register
│   │   ├── student.routes.js  # Student CRUD
│   │   ├── assessment.routes.js # PHQ-9 handling
│   │   └── dashboard.routes.js  # Analytics
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   └── errorHandler.js     # Global errors
│   ├── scripts/
│   │   └── seed.js            # Sample data
│   ├── server.js              # Main entry point
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AddStudent.jsx
│   │   │   ├── EditStudent.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── PHQ9Assessment.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md                   # This file
```

## 👥 User Roles

### Admin (Counselor/Faculty)
| Permission | Allowed |
|-----------|---------|
| View all students | ✅ |
| Add new students | ✅ |
| Edit demographics | ✅ |
| Edit PHQ-9 responses | ❌ |
| Delete students | ✅ |
| View dashboard | ✅ |
| Take PHQ-9 assessment | ❌ |

### Student
| Permission | Allowed |
|-----------|---------|
| View own profile | ✅ |
| Edit own demographics | ❌ |
| Take PHQ-9 assessment | ✅ |
| View own history | ✅ |
| View other students | ❌ |
| Access admin dashboard | ❌ |

## 📊 PHQ-9 Scoring System

### Question Format
Each of the 9 questions has 4 frequency options:
- **Not at all** = 0 points
- **Several days** = 1 point
- **More than half the days** = 2 points
- **Nearly every day** = 3 points

### Risk Score Calculation

| Raw Score (0-27) | Risk Score | Label | Color | Action |
|------------------|------------|-------|-------|--------|
| 0-4 | 0 | Minimal Depression | 🟢 Green | Maintain healthy habits |
| 5-9 | 1 | Mild Depression | 🟡 Yellow | Stress management recommended |
| 10-14 | 2 | Moderate Depression | 🟠 Orange | Counseling suggested |
| 15-27 | 3 | Moderately Severe/Severe | 🔴 Red | Immediate support required |

### Example Calculation
```
Q1: Several days = 1
Q2: More than half = 2
Q3: Nearly every day = 3
Q4: Several days = 1
Q5: Not at all = 0
Q6: Several days = 1
Q7: More than half = 2
Q8: Not at all = 0
Q9: Not at all = 0

Raw Score = 1+2+3+1+0+1+2+0+0 = 10
Risk Score = 2 (Moderate Depression)
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
```http
POST   /api/auth/login           # Login user
POST   /api/auth/register        # Register new user (admin creates)
GET    /api/auth/verify          # Verify JWT token
```

#### Students (Admin Only)
```http
POST   /api/students             # Create student
GET    /api/students             # Get all students (with filters)
GET    /api/students/:id         # Get student by ID
PATCH  /api/students/:id         # Update demographics
DELETE /api/students/:id         # Delete student
GET    /api/students/profile/me  # Get own profile (student)
```

#### Assessments
```http
POST   /api/assessments                  # Submit PHQ-9 (student)
GET    /api/assessments/student/:id     # Get student history
GET    /api/assessments/my-history      # Get own history
GET    /api/assessments/critical        # Get critical cases (admin)
```

#### Dashboard (Admin Only)
```http
GET    /api/dashboard/stats             # Global statistics
GET    /api/dashboard/high-risk         # High-risk students
GET    /api/dashboard/by-course         # Course-wise stats
GET    /api/dashboard/trends            # Trends over time
```

Full API documentation: See `backend/README.md`

## 🖼️ Screenshots

### Login Page
Clean, professional login with demo credential buttons

### Admin Dashboard
- Statistics cards (Total, Critical, Moderate, Healthy)
- Risk distribution pie chart
- Course statistics bar chart
- Searchable, filterable student directory

### Add/Edit Student
Form validation with clear success/error messages

### Student Dashboard
- Large risk score display with color coding
- Motivational messages
- Personal statistics
- Assessment history timeline

### PHQ-9 Assessment
- Progress bar
- Radio button selection
- Real-time score calculation
- Optional notes field

## 🌐 Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create mental-health-api

# Set environment variables
heroku config:set MONGODB_URI=<your-atlas-uri>
heroku config:set JWT_SECRET=<your-secret>
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Seed database
heroku run npm run seed
```

### Frontend Deployment (Vercel Example)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-api.herokuapp.com/api
```

### MongoDB Atlas Setup

1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (or specific IPs)
5. Get connection string
6. Update `.env` with connection string

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Bcrypt password hashing (10 salt rounds)
- Role-based access control middleware
- Input validation (Mongoose schemas)
- CORS protection
- Helmet.js security headers
- XSS protection (React default)
- MongoDB injection prevention

## 🧪 Testing

### Sample Accounts (After Seeding)

**Admin:**
- Email: `admin@university.edu`
- Password: `admin123`

**Students:**
- Email: `student1@university.edu` to `student25@university.edu`
- Password: `Welcome123` (all)

### Test Scenarios

1. **Admin Workflow**
   - Login as admin
   - View dashboard statistics
   - Add new student
   - Edit student demographics
   - Verify cannot edit PHQ-9 responses

2. **Student Workflow**
   - Login as student
   - View initial risk score (0)
   - Take PHQ-9 assessment
   - Submit and see updated score
   - View assessment history

## 📈 Future Enhancements

- [ ] Email notifications for critical cases
- [ ] SMS alerts via Twilio
- [ ] Export PDF reports
- [ ] Real-time WebSocket updates
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics (ML predictions)
- [ ] Appointment scheduling
- [ ] Chatbot support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **PHQ-9 Dataset**: [Mendeley Data](https://data.mendeley.com/datasets/kkzjk253cy/6)
- **PHQ-9 Standard**: Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: Tailwind CSS


## 🎯 Project Status

✅ **Phase 1 Complete**: Core CRUD operations, authentication, PHQ-9 assessment
🚧 **Phase 2 In Progress**: Email alerts, advanced analytics
📋 **Phase 3 Planned**: Mobile app, ML predictions, chatbot

---

**Built with ❤️ for student mental health and wellbeing**#***REMOVED*** ***REMOVED***P***REMOVED***o***REMOVED***l***REMOVED***i***REMOVED***c***REMOVED***y***REMOVED***F***REMOVED***o***REMOVED***r***REMOVED***g***REMOVED***e***REMOVED***
***REMOVED***
***REMOVED***
=======
# 🧠 AI-Powered Student Mental Health Monitoring System

A complete **MERN stack** web application for assessing and monitoring student mental well-being using the **PHQ-9 (Patient Health Questionnaire-9)** standard. Features role-based access control, real-time risk scoring, and comprehensive analytics dashboard.

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [PHQ-9 Scoring](#-phq-9-scoring-system)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## ✨ Features

### Core Functionality
- ✅ **PHQ-9 Assessment**: Standard clinical questionnaire with 9 questions
- ✅ **Automatic Risk Scoring**: 0-3 scale (Minimal → Critical)
- ✅ **Role-Based Access Control**: Admin vs Student permissions
- ✅ **Real-Time Dashboard**: Statistics, charts, and analytics
- ✅ **Student Management**: CRUD operations with validation
- ✅ **Assessment History**: Track mental health over time
- ✅ **Critical Case Alerts**: Identify high-risk students immediately

### Admin Capabilities
- View global statistics (total students, critical cases)
- Add new students with complete profiles
- Update student demographics (age, course, CGPA)
- **Cannot** modify PHQ-9 responses (students only)
- Filter students by risk level
- Search by name or student ID
- View course-wise and gender-wise statistics
- Export-ready data tables

### Student Capabilities
- Take/retake PHQ-9 assessment anytime
- View current mental health score (0-3)
- Get personalized recommendations
- Track assessment history
- See motivational messages based on score
- Access crisis hotline information

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

### Tools & Libraries
- **date-fns** - Date formatting
- **lucide-react** - Icons
- **Helmet** - Security headers
- **Morgan** - HTTP logging
- **CORS** - Cross-origin requests

## 🚀 Quick Start

### Prerequisites
```bash
# Required
- Node.js 16+ and npm
- MongoDB 5.0+ (local or Atlas)

# Optional
- Git
- MongoDB Compass (GUI)
```

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd mental-health-system

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# Start MongoDB (if local)
mongod

# Seed database with sample data
npm run seed

# Start backend server
npm run dev
# ✅ Backend running on http://localhost:5000

# 3. Setup Frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env
# Verify VITE_API_URL points to backend

# Start frontend
npm run dev
# ✅ Frontend running on http://localhost:3000
```

### Quick Test

1. Open browser: `http://localhost:3000`
2. **Login as Admin**: `admin@university.edu / admin123`
3. **Login as Student**: `student1@university.edu / Welcome123`

## 📁 Project Structure

```
mental-health-system/
│
├── backend/                    # Express.js API
│   ├── models/
│   │   ├── User.model.js      # Authentication
│   │   ├── Student.model.js   # Student profiles
│   │   └── Assessment.model.js # PHQ-9 assessments
│   ├── routes/
│   │   ├── auth.routes.js     # Login, register
│   │   ├── student.routes.js  # Student CRUD
│   │   ├── assessment.routes.js # PHQ-9 handling
│   │   └── dashboard.routes.js  # Analytics
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT verification
│   │   └── errorHandler.js     # Global errors
│   ├── scripts/
│   │   └── seed.js            # Sample data
│   ├── server.js              # Main entry point
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AddStudent.jsx
│   │   │   ├── EditStudent.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── PHQ9Assessment.jsx
│   │   ├── services/
│   │   │   └── api.js         # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md                   # This file
```

## 👥 User Roles

### Admin (Counselor/Faculty)
| Permission | Allowed |
|-----------|---------|
| View all students | ✅ |
| Add new students | ✅ |
| Edit demographics | ✅ |
| Edit PHQ-9 responses | ❌ |
| Delete students | ✅ |
| View dashboard | ✅ |
| Take PHQ-9 assessment | ❌ |

### Student
| Permission | Allowed |
|-----------|---------|
| View own profile | ✅ |
| Edit own demographics | ❌ |
| Take PHQ-9 assessment | ✅ |
| View own history | ✅ |
| View other students | ❌ |
| Access admin dashboard | ❌ |

## 📊 PHQ-9 Scoring System

### Question Format
Each of the 9 questions has 4 frequency options:
- **Not at all** = 0 points
- **Several days** = 1 point
- **More than half the days** = 2 points
- **Nearly every day** = 3 points

### Risk Score Calculation

| Raw Score (0-27) | Risk Score | Label | Color | Action |
|------------------|------------|-------|-------|--------|
| 0-4 | 0 | Minimal Depression | 🟢 Green | Maintain healthy habits |
| 5-9 | 1 | Mild Depression | 🟡 Yellow | Stress management recommended |
| 10-14 | 2 | Moderate Depression | 🟠 Orange | Counseling suggested |
| 15-27 | 3 | Moderately Severe/Severe | 🔴 Red | Immediate support required |

### Example Calculation
```
Q1: Several days = 1
Q2: More than half = 2
Q3: Nearly every day = 3
Q4: Several days = 1
Q5: Not at all = 0
Q6: Several days = 1
Q7: More than half = 2
Q8: Not at all = 0
Q9: Not at all = 0

Raw Score = 1+2+3+1+0+1+2+0+0 = 10
Risk Score = 2 (Moderate Depression)
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token:
```
Authorization: Bearer <token>
```

### Key Endpoints

#### Authentication
```http
POST   /api/auth/login           # Login user
POST   /api/auth/register        # Register new user (admin creates)
GET    /api/auth/verify          # Verify JWT token
```

#### Students (Admin Only)
```http
POST   /api/students             # Create student
GET    /api/students             # Get all students (with filters)
GET    /api/students/:id         # Get student by ID
PATCH  /api/students/:id         # Update demographics
DELETE /api/students/:id         # Delete student
GET    /api/students/profile/me  # Get own profile (student)
```

#### Assessments
```http
POST   /api/assessments                  # Submit PHQ-9 (student)
GET    /api/assessments/student/:id     # Get student history
GET    /api/assessments/my-history      # Get own history
GET    /api/assessments/critical        # Get critical cases (admin)
```

#### Dashboard (Admin Only)
```http
GET    /api/dashboard/stats             # Global statistics
GET    /api/dashboard/high-risk         # High-risk students
GET    /api/dashboard/by-course         # Course-wise stats
GET    /api/dashboard/trends            # Trends over time
```

Full API documentation: See `backend/README.md`

## 🖼️ Screenshots

### Login Page
Clean, professional login with demo credential buttons

### Admin Dashboard
- Statistics cards (Total, Critical, Moderate, Healthy)
- Risk distribution pie chart
- Course statistics bar chart
- Searchable, filterable student directory

### Add/Edit Student
Form validation with clear success/error messages

### Student Dashboard
- Large risk score display with color coding
- Motivational messages
- Personal statistics
- Assessment history timeline

### PHQ-9 Assessment
- Progress bar
- Radio button selection
- Real-time score calculation
- Optional notes field

## 🌐 Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend

# Login to Heroku
heroku login

# Create app
heroku create mental-health-api

# Set environment variables
heroku config:set MONGODB_URI=<your-atlas-uri>
heroku config:set JWT_SECRET=<your-secret>
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Seed database
heroku run npm run seed
```

### Frontend Deployment (Vercel Example)

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://your-api.herokuapp.com/api
```

### MongoDB Atlas Setup

1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (or specific IPs)
5. Get connection string
6. Update `.env` with connection string

## 🔒 Security Features

- JWT authentication with 7-day expiry
- Bcrypt password hashing (10 salt rounds)
- Role-based access control middleware
- Input validation (Mongoose schemas)
- CORS protection
- Helmet.js security headers
- XSS protection (React default)
- MongoDB injection prevention

## 🧪 Testing

### Sample Accounts (After Seeding)

**Admin:**
- Email: `admin@university.edu`
- Password: `admin123`

**Students:**
- Email: `student1@university.edu` to `student25@university.edu`
- Password: `Welcome123` (all)

### Test Scenarios

1. **Admin Workflow**
   - Login as admin
   - View dashboard statistics
   - Add new student
   - Edit student demographics
   - Verify cannot edit PHQ-9 responses

2. **Student Workflow**
   - Login as student
   - View initial risk score (0)
   - Take PHQ-9 assessment
   - Submit and see updated score
   - View assessment history

## 📈 Future Enhancements

- [ ] Email notifications for critical cases
- [ ] SMS alerts via Twilio
- [ ] Export PDF reports
- [ ] Real-time WebSocket updates
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics (ML predictions)
- [ ] Appointment scheduling
- [ ] Chatbot support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **PHQ-9 Dataset**: [Mendeley Data](https://data.mendeley.com/datasets/kkzjk253cy/6)
- **PHQ-9 Standard**: Developed by Drs. Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke
- **Icons**: Lucide React
- **Charts**: Recharts
- **Styling**: Tailwind CSS


## 🎯 Project Status

✅ **Phase 1 Complete**: Core CRUD operations, authentication, PHQ-9 assessment

---

**Built with ❤️ for student mental health and wellbeing**
>>>>>>> 86154d3fb0004bdcf6c6ea24844577e65d94ef96
