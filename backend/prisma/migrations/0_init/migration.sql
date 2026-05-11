-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('MENTAL_WELLNESS', 'ACADEMIC', 'HOSTEL', 'PLACEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "cgpa" DOUBLE PRECISION NOT NULL,
    "currentWellnessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastAssessmentDate" TIMESTAMP(3),
    "totalAssessments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "q1_interest" INTEGER NOT NULL,
    "q2_depressed" INTEGER NOT NULL,
    "q3_sleep" INTEGER NOT NULL,
    "q4_energy" INTEGER NOT NULL,
    "q5_appetite" INTEGER NOT NULL,
    "q6_failure" INTEGER NOT NULL,
    "q7_concentration" INTEGER NOT NULL,
    "q8_movement" INTEGER NOT NULL,
    "q9_suicidal" INTEGER NOT NULL,
    "rawScore" INTEGER NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "notes" TEXT,
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WellnessAssessment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "mentalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "academicScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hostelScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "placementScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifestyleScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalWellnessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wellnessStatus" TEXT NOT NULL DEFAULT 'Unknown',
    "m1_exhaustion" INTEGER NOT NULL,
    "m2_sleep" INTEGER NOT NULL,
    "m3_motivation" INTEGER NOT NULL,
    "m4_concentration" INTEGER NOT NULL,
    "m5_isolation" INTEGER NOT NULL,
    "a1_assignment" INTEGER NOT NULL,
    "a2_exam" INTEGER NOT NULL,
    "a3_backlog" INTEGER NOT NULL,
    "a4_time_mgmt" INTEGER NOT NULL,
    "a5_attendance" INTEGER NOT NULL,
    "h1_food" INTEGER NOT NULL,
    "h2_cleanliness" INTEGER NOT NULL,
    "h3_internet" INTEGER NOT NULL,
    "h4_noise" INTEGER NOT NULL,
    "h5_safety" INTEGER NOT NULL,
    "p1_anxiety" INTEGER NOT NULL,
    "p2_technical" INTEGER NOT NULL,
    "p3_resume" INTEGER NOT NULL,
    "p4_interview" INTEGER NOT NULL,
    "p5_unemployment" INTEGER NOT NULL,
    "l1_physical" INTEGER NOT NULL,
    "l2_social" INTEGER NOT NULL,
    "l3_screen_time" INTEGER NOT NULL,
    "l4_sleep_routine" INTEGER NOT NULL,
    "l5_campus_activity" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WellnessAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "message" TEXT NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- CreateIndex
CREATE INDEX "Assessment_studentId_createdAt_idx" ON "Assessment"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "Assessment_riskScore_idx" ON "Assessment"("riskScore");

-- CreateIndex
CREATE INDEX "Assessment_isCritical_idx" ON "Assessment"("isCritical");

-- CreateIndex
CREATE INDEX "WellnessAssessment_studentId_createdAt_idx" ON "WellnessAssessment"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "WellnessAssessment_finalWellnessScore_idx" ON "WellnessAssessment"("finalWellnessScore");

-- CreateIndex
CREATE INDEX "SupportTicket_studentId_idx" ON "SupportTicket"("studentId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WellnessAssessment" ADD CONSTRAINT "WellnessAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

