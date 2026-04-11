# AUCXION — Advanced Local Threat Detection & Monitoring System

> Next-generation intelligent cyber defense for local systems. Aucxion continuously monitors your machine for modern cyberattacks including DDoS, Ransomware, Zero-Day exploits, and Phishing — and displays everything in a real-time cyberpunk-themed dashboard.

---

## What is Aucxion?

Aucxion is a full-stack cybersecurity monitoring application that runs locally on your machine. It uses Java system-level APIs to inspect running processes, network connections, file system activity, and open ports — then classifies detected anomalies into known attack categories and presents them in a React dashboard with real-time updates, detailed threat breakdowns, and actionable remediation steps.

It is not a signature-based antivirus. Aucxion uses **behavior-based anomaly detection** — meaning it looks for suspicious patterns rather than known malware signatures, making it effective against zero-day threats.

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React 18, Tailwind CSS, Recharts |
| Backend    | Java 17, Spring Boot 3.2 |
| Database   | MySQL 8.0               |
| API Style  | REST (JSON)             |
| Build Tool | Maven 3.8+              |

---

## Core Features

### Threat Detection Engine
The backend actively scans your system and detects four categories of attacks:

**DDoS (Distributed Denial of Service)**
- Monitors active TCP connection count via `netstat`
- Flags abnormal spikes (100+ connections = HIGH, 200+ = CRITICAL)
- Detects unusual bandwidth usage patterns

**Ransomware**
- Scans critical directories for suspicious file extensions (`.locked`, `.encrypted`, `.crypto`, `.crypt`, `.enc`, etc.)
- Detects shadow copy deletion attempts (`vssadmin`, `wbadmin`, `bcdedit`)
- Monitors for rapid file modification processes

**Zero-Day Exploits (Behavior-Based)**
- Scans running processes for known exploit tools (`mimikatz`, `meterpreter`, `netcat`, `psexec`, `cobaltstrike`, etc.)
- Detects privilege escalation via `whoami /priv` analysis
- Flags unknown or anomalous process behavior

**Phishing**
- Inspects the system hosts file for suspicious domain redirects
- Detects phishing patterns (`paypal-secure`, `bank-login`, `account-verify`, etc.)
- Monitors for browser process floods (tab hijacking)

### Port Scanner
- Scans 24 well-known ports concurrently using Java socket programming
- Identifies open ports with service name, protocol, exposure level, and risk description
- Highlights high-risk open ports (SMB/445, RDP/3389, MySQL/3306, Metasploit/4444, etc.)

### Real-Time Dashboard
- Live threat count, attack type breakdown, system risk level
- Pie chart: attack type distribution
- Area chart: threat activity timeline
- Full threat table with click-to-expand detail modal
- Auto-refreshes every 5 seconds

### Threat Detail Modal
Clicking any threat row shows:
- Full attack type description
- Exact source/origin of the threat
- Detection timestamp and current status
- Numbered remediation steps specific to the attack type

### Security Suggestions
Per-attack-type fix guides with priority levels (CRITICAL / HIGH / MEDIUM) covering immediate containment, system recovery, and long-term hardening steps.

---

## Prerequisites

Make sure the following are installed before running Aucxion:

| Requirement  | Version  | Download |
|--------------|----------|----------|
| Java JDK     | 17+      | https://adoptium.net |
| Maven        | 3.8+     | https://maven.apache.org/download.cgi |
| Node.js      | 18+      | https://nodejs.org |
| MySQL Server | 8.0+     | https://dev.mysql.com/downloads/mysql |

Verify your installations:
```bash
java -version
mvn -version
node -version
mysql --version
```

---

## Project Structure

```
aucxion/
├── backend/                          # Spring Boot application
│   ├── pom.xml
│   └── src/main/java/com/aucxion/
│       ├── AucxionApplication.java   # Entry point
│       ├── config/
│       │   └── CorsConfig.java       # CORS configuration
│       ├── controller/
│       │   ├── ScanController.java   # /api/scan/*
│       │   ├── ThreatController.java # /api/threats/*
│       │   └── PortController.java   # /api/ports/*
│       ├── service/
│       │   ├── ScanService.java           # Orchestrates full scan
│       │   ├── ThreatDetectionService.java # DDoS/Ransomware/ZeroDay/Phishing
│       │   ├── PortScannerService.java     # TCP socket port scanning
│       │   └── SecuritySuggestionService.java # Fix suggestions
│       ├── model/
│       │   ├── ThreatLog.java        # Threat entity
│       │   ├── PortScanResult.java   # Port scan entity
│       │   └── ScanSession.java      # Scan session entity
│       └── repository/
│           ├── ThreatLogRepository.java
│           ├── PortScanResultRepository.java
│           └── ScanSessionRepository.java
│
├── frontend/                         # React application
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.js                    # Router + sidebar layout
│       ├── index.css                 # Global styles + animations
│       ├── api/
│       │   └── aucxionApi.js         # Axios API client
│       ├── pages/
│       │   ├── Dashboard.jsx         # Main overview page
│       │   ├── ThreatDetails.jsx     # Full threat log + suggestions
│       │   └── PortScanner.jsx       # Port scan results
│       └── components/
│           ├── AttackCard.jsx        # Per-attack-type stat card
│           ├── ThreatTable.jsx       # Threat log table
│           ├── ThreatDetailModal.jsx # Click-to-expand threat detail
│           ├── PortScannerTable.jsx  # Port results table
│           ├── ScanControls.jsx      # Start/Stop/Rescan buttons
│           └── RiskBadge.jsx         # System risk level badge
│
└── database/
    └── schema.sql                    # MySQL schema + seed data
```

---

## Setup & Run

### Step 1 — Database

Open MySQL and run the schema:

```bash
mysql -u root -p
```

```sql
source aucxion/database/schema.sql
```

Or create the database manually (Hibernate will auto-create tables on first run):

```sql
CREATE DATABASE IF NOT EXISTS aucxion_db;
```

### Step 2 — Configure Database Password

Open `aucxion/backend/src/main/resources/application.properties` and update:

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3 — Build the Backend

```bash
cd aucxion/backend
mvn clean package -DskipTests
```

This produces `target/aucxion-backend-1.0.0.jar`.

### Step 4 — Run the Backend

```bash
java -jar target/aucxion-backend-1.0.0.jar
```

Backend starts on **http://localhost:8080**

Verify it's running:
```
http://localhost:8080/api/scan/status
```
Expected response: `{"running":false}`

### Step 5 — Run the Frontend

Open a new terminal:

```bash
cd aucxion/frontend
npm install
npm start
```

Frontend starts on **http://localhost:3000**

---

## Chatbot Setup (Security Assistant)

The chatbot uses a fine-tuned `facebook/blenderbot-400M-distill` model from HuggingFace, trained on cybersecurity Q&A data.

### Prerequisites

- Python 3.9 or higher
- pip

### Install dependencies

```bash
cd aucxion/chatbot
pip install -r requirements.txt
```

### Fine-tune the model (run once)

```bash
python train.py
```

This downloads the base model from HuggingFace, fine-tunes it on the cybersecurity dataset, and saves the trained model to `aucxion/chatbot/model/`. Takes 5–15 minutes depending on your hardware.

### Start the chatbot server

```bash
python server.py
```

Chatbot API runs on **http://localhost:5000**

The chatbot icon appears in the bottom-right corner of the dashboard. Click it to open the chat window.

### What the chatbot can answer

- How to fix and prevent DDoS, Ransomware, Zero-Day, and Phishing attacks
- How to secure ports, SSH, RDP, databases, and Windows systems
- What to do immediately after a cyberattack
- How to detect malware and system compromise
- Backup strategies, MFA setup, firewall configuration
- Any general cybersecurity question

---

## API Reference

### Scan Endpoints

| Method | Endpoint          | Description                        |
|--------|-------------------|------------------------------------|
| POST   | /api/scan/start   | Start a full system scan           |
| POST   | /api/scan/stop    | Stop the active scan               |
| GET    | /api/scan/results | Get all results (threats + ports)  |
| GET    | /api/scan/status  | Check if scan is currently running |

### Threat Endpoints

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| GET    | /api/threats                    | List all threats                |
| GET    | /api/threats/{id}               | Get single threat by ID         |
| GET    | /api/threats/type/{type}        | Filter by attack type           |
| GET    | /api/threats/suggestions        | All fix suggestions             |
| GET    | /api/threats/suggestions/{type} | Fix suggestions for attack type |
| PUT    | /api/threats/{id}/resolve       | Mark threat as resolved         |
| DELETE | /api/threats/clear              | Clear all threat logs           |

### Port Endpoints

| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | /api/ports      | Get all port scan results |
| GET    | /api/ports/open | Get only open ports       |
| POST   | /api/ports/scan | Run a fresh port scan     |

---

## Attack Types & Severity Levels

| Attack Type | Color  | Description |
|-------------|--------|-------------|
| DDOS        | Red    | Connection flood / bandwidth exhaustion |
| RANSOMWARE  | Purple | File encryption / shadow copy deletion  |
| ZERO_DAY    | Yellow | Unknown process behavior / privilege escalation |
| PHISHING    | Blue   | Hosts file tampering / browser process flood |

| Severity | Meaning |
|----------|---------|
| CRITICAL | Immediate action required — active attack in progress |
| HIGH     | Strong indicators of compromise |
| MEDIUM   | Suspicious behavior, monitoring recommended |
| LOW      | Minor anomaly, low risk |

---

## Database Schema

Three tables are used:

- `scan_sessions` — tracks each scan run with start time, status, threat count, and overall risk level
- `threat_logs` — stores every detected threat with type, severity, description, source, and timestamp
- `port_scan_results` — stores port scan results with service name, exposure level, and risk description

Hibernate auto-creates and updates tables on startup via `spring.jpa.hibernate.ddl-auto=update`.

---

## Running on a New Machine (After Git Clone)

The `target/` folder is gitignored, so the compiled jar is never committed to the repository. Anyone cloning the project must build it locally before running.

### Why "No jar file found" happens

When you clone the repo, only source code is present. The `target/` folder and the jar inside it do not exist until you build. This is intentional — compiled binaries are never committed to git.

### Prerequisites checklist

Verify these are installed on the new machine before doing anything:

| Requirement | Check command    | Required version |
|-------------|------------------|------------------|
| Java JDK    | `java -version`  | 17 or higher     |
| Maven       | `mvn -version`   | 3.8 or higher    |
| Node.js     | `node -version`  | 18 or higher     |
| MySQL       | `mysql --version`| 8.0 or higher    |

If Java is version 8 or 11, the build will fail — the project targets Java 17.

### Steps after cloning

**1. Update the database password**

Open `aucxion/backend/src/main/resources/application.properties` and set the MySQL password for the new machine:

```properties
spring.datasource.password=YOUR_PASSWORD_HERE
```

**2. Create the database**

```bash
mysql -u root -p
```
```sql
CREATE DATABASE IF NOT EXISTS aucxion_db;
exit;
```

**3. Build the jar**

```bash
cd aucxion/backend
mvn clean package -DskipTests
```

This compiles all Java source files and produces `target/aucxion-backend-1.0.0.jar`. This step is required every time you clone or pull changes.

**4. Run the backend**

```bash
java -jar target/aucxion-backend-1.0.0.jar
```

**5. Run the frontend**

```bash
cd aucxion/frontend
npm install
npm start
```

`npm install` is also required on every new machine to download `node_modules` which is also gitignored.

---

## Troubleshooting

**Backend won't start — Access denied for MySQL**
- Check your password in `application.properties`
- Verify MySQL is running: open MySQL Workbench or run `mysql -u root -p`

**"Failed to start scan" in dashboard**
- Confirm backend is running at `http://localhost:8080/api/scan/status`
- Check that MySQL is up and `aucxion_db` database exists

**`mvn spring-boot:run` fails with "No plugin found"**
- Use the jar approach instead: `java -jar target/aucxion-backend-1.0.0.jar`
- Make sure you're running the command from inside the `aucxion/backend` folder

**Frontend shows blank / no data**
- Make sure backend is running first
- Check browser console for CORS errors
- Confirm frontend is on port 3000 and backend on port 8080

---

## Notes

- Aucxion runs entirely locally — no data is sent to any external server
- The detection engine uses OS-level commands (`netstat`, `tasklist`, `whoami`) and falls back to simulated demo data if commands are unavailable
- On first run with no scan history, the dashboard will show zeros until you click Start Scan
