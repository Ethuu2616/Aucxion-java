# 🛡️ AUCXION - Threat Detection & Monitoring System

A lightweight, real-time cybersecurity monitoring application that scans your local system for threats including DDoS, Ransomware, Zero-Day exploits, and Phishing attacks.

---

## 🚀 Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Java 17, Spring Boot 3.2.0 |
| **Frontend** | React 18, Tailwind CSS, Recharts |
| **Build Tools** | Maven 3.8+, npm |
| **Storage** | In-Memory (No Database) |
| **Ports** | Backend: 8080, Frontend: 3000 |

---

## ✨ Features

- **Real-Time Threat Detection** - DDoS, Ransomware, Zero-Day, Phishing
- **Port Scanner** - Scans 24 well-known ports with risk assessment
- **Live Dashboard** - Real-time updates with charts and metrics
- **Scan Progress Dialog** - 30-second visual progress tracking
- **Accuracy Metrics** - Files, processes, connections, logs analyzed
- **In-Memory Storage** - No database required, zero configuration

---

## 📦 Prerequisites

- **Java JDK 17+** - [Download](https://adoptium.net)
- **Maven 3.8+** - [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** - [Download](https://nodejs.org)

Verify installations:
```bash
java -version
mvn -version
node -version
```

---

## 🚀 Quick Start

### Clone the Repository
```bash
git clone https://github.com/Ethuu2616/Aucxion-java.git
cd Aucxion-java
```

### Option 1: Using Start Scripts (Recommended)

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

The script will:
1. Start backend on port 8080
2. Start frontend on port 3000
3. Open browser automatically

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

Then open: **http://localhost:3000**

---

## 🌐 Access Points

- **Frontend Dashboard:** http://localhost:3000
- **Backend API:** http://localhost:8080/api

---

## 📁 Project Structure

```
aucxion/
├── backend/              # Spring Boot REST API
│   ├── src/
│   │   └── main/java/com/aucxion/
│   │       ├── controller/    # REST endpoints
│   │       ├── service/       # Business logic
│   │       └── model/         # Data models
│   └── pom.xml
│
├── frontend/             # React application
│   ├── src/
│   │   ├── pages/        # Dashboard, Threats, Ports
│   │   └── components/   # UI components
│   └── package.json
│
├── start.bat            # Windows launcher
├── start.sh             # Linux/Mac launcher
└── README.md
```

---

## 🔌 API Endpoints

### Scan
- `POST /api/scan/start` - Start system scan
- `POST /api/scan/stop` - Stop scan
- `GET /api/scan/results` - Get results
- `GET /api/scan/status` - Check status

### Threats
- `GET /api/threats` - List all threats
- `GET /api/threats/suggestions` - Get fix suggestions
- `DELETE /api/threats/clear` - Clear threats

### Ports
- `GET /api/ports` - Get port scan results
- `GET /api/ports/open` - Get open ports only
- `POST /api/ports/scan` - Run port scan

---

## 🎯 How to Use

1. **Start the application** using start scripts or manual commands
2. **Open browser** to http://localhost:3000
3. **Click "Start Scan"** button
4. **Confirm** in the dialog
5. **Watch progress** for 30 seconds
6. **View results** in the dashboard

---

## 🛠️ Troubleshooting

### Port Already in Use

**Backend (8080):**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

**Frontend (3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Build Fails
```bash
cd backend
mvn clean package -DskipTests
```

---

## � Security

- Runs entirely locally - no external data transmission
- In-memory storage - data cleared on restart
- No database required
- Uses OS-level commands for system scanning

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Ethan**  
GitHub: [@Ethuu2616](https://github.com/Ethuu2616)

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready
