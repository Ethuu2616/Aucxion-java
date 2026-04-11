-- Aucxion Database Schema
CREATE DATABASE IF NOT EXISTS aucxion_db;
USE aucxion_db;

CREATE TABLE IF NOT EXISTS scan_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    started_at DATETIME NOT NULL,
    completed_at DATETIME,
    status VARCHAR(20) NOT NULL DEFAULT 'RUNNING',
    threats_found INT DEFAULT 0,
    ports_scanned INT DEFAULT 0,
    system_risk_level VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS threat_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attack_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    source VARCHAR(500),
    detected_at DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS port_scan_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    port_number INT NOT NULL,
    service_name VARCHAR(100),
    protocol VARCHAR(10),
    exposure_level VARCHAR(20),
    is_open BOOLEAN DEFAULT FALSE,
    risk_description TEXT,
    scanned_at DATETIME NOT NULL
);
