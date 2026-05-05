# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# API calls go to same origin — no hardcoded localhost
ENV REACT_APP_API_URL=/api
RUN npm run build

# ── Stage 2: Build Spring Boot backend + embed frontend ──────────────────────
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY backend/pom.xml ./
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline -q -Pskip-frontend 2>/dev/null || mvn dependency:go-offline -q
COPY backend/src ./src
# Copy the built React app into Spring Boot's static folder
COPY --from=frontend-builder /frontend/build ./src/main/resources/static
# Build the jar (skip the npm steps since we already built frontend above)
RUN mvn clean package -DskipTests -Dskip.npm=true -q

# ── Stage 3: Minimal runtime image ───────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/target/aucxion-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
