# Aucxion — Setup Guide

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8.0+

---

## Step 1 — Database Setup

```sql
-- Run in MySQL client
CREATE DATABASE aucxion_db;
-- Then run the full schema:
source database/schema.sql
```

---

## Step 2 — Backend (Spring Boot)

1. Open `backend/src/main/resources/application.properties`
2. Update your MySQL credentials:
   ```
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
3. Build and run:
   ```bash
   cd backend
   mvn clean install
   mvn org.springframework.boot:spring-boot-maven-plugin:run
   ```
   Or alternatively just run the jar:
   ```bash
   mvn clean package -DskipTests
   java -jar target/aucxion-backend-1.0.0.jar
   ```
   Backend starts on **http://localhost:8080**

---

## Step 3 — Frontend (React)

```bash
cd frontend
npm install
npm start
```
Frontend starts on **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/scan/start                 | Start full system scan   |
| POST   | /api/scan/stop                  | Stop active scan         |
| GET    | /api/scan/results               | Get all scan results     |
| GET    | /api/scan/status                | Check if scan is running |
| GET    | /api/threats                    | List all threats         |
| GET    | /api/threats/{id}               | Get threat by ID         |
| GET    | /api/threats/type/{type}        | Filter by attack type    |
| GET    | /api/threats/suggestions/{type} | Get fix suggestions      |
| PUT    | /api/threats/{id}/resolve       | Mark threat resolved     |
| GET    | /api/ports                      | Get port scan results    |
| POST   | /api/ports/scan                 | Run port scan            |

---

## Attack Types
- `DDOS` — DDoS detection
- `RANSOMWARE` — Ransomware detection
- `ZERO_DAY` — Zero-day / anomaly detection
- `PHISHING` — Phishing detection

## Severity Levels
- `CRITICAL` → Red
- `HIGH` → Orange
- `MEDIUM` → Yellow
- `LOW` → Green
