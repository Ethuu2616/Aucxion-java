package com.aucxion.service;

import com.aucxion.model.PortScanResult;
import org.springframework.stereotype.Service;

import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PortScannerService {

    private final List<PortScanResult> portResults = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong idCounter = new AtomicLong(1);

    // Well-known ports with metadata
    private static final Map<Integer, String[]> KNOWN_PORTS = new LinkedHashMap<>();

    static {
        // port -> [serviceName, exposureLevel, riskDescription]
        KNOWN_PORTS.put(21,   new String[]{"FTP",          "HIGH",   "File Transfer - often exploited for unauthorized access"});
        KNOWN_PORTS.put(22,   new String[]{"SSH",          "MEDIUM", "Secure Shell - brute force target if exposed publicly"});
        KNOWN_PORTS.put(23,   new String[]{"Telnet",       "HIGH",   "Unencrypted remote access - critical vulnerability"});
        KNOWN_PORTS.put(25,   new String[]{"SMTP",         "MEDIUM", "Mail server - can be used for spam relay"});
        KNOWN_PORTS.put(53,   new String[]{"DNS",          "MEDIUM", "DNS service - DNS amplification DDoS risk"});
        KNOWN_PORTS.put(80,   new String[]{"HTTP",         "MEDIUM", "Web server - unencrypted traffic"});
        KNOWN_PORTS.put(110,  new String[]{"POP3",         "MEDIUM", "Email retrieval - unencrypted"});
        KNOWN_PORTS.put(135,  new String[]{"RPC",          "HIGH",   "Windows RPC - common attack vector"});
        KNOWN_PORTS.put(139,  new String[]{"NetBIOS",      "HIGH",   "Windows file sharing - SMB vulnerability risk"});
        KNOWN_PORTS.put(143,  new String[]{"IMAP",         "MEDIUM", "Email access - credential exposure risk"});
        KNOWN_PORTS.put(443,  new String[]{"HTTPS",        "LOW",    "Secure web traffic"});
        KNOWN_PORTS.put(445,  new String[]{"SMB",          "HIGH",   "Windows SMB - WannaCry/EternalBlue exploit vector"});
        KNOWN_PORTS.put(1433, new String[]{"MSSQL",        "HIGH",   "SQL Server - database exposure risk"});
        KNOWN_PORTS.put(1521, new String[]{"Oracle DB",    "HIGH",   "Oracle database - unauthorized access risk"});
        KNOWN_PORTS.put(3306, new String[]{"MySQL",        "HIGH",   "MySQL database - should not be publicly exposed"});
        KNOWN_PORTS.put(3389, new String[]{"RDP",          "HIGH",   "Remote Desktop - ransomware delivery vector"});
        KNOWN_PORTS.put(4444, new String[]{"Metasploit",   "HIGH",   "Default Metasploit listener - active exploit indicator"});
        KNOWN_PORTS.put(5432, new String[]{"PostgreSQL",   "HIGH",   "PostgreSQL - database exposure risk"});
        KNOWN_PORTS.put(5900, new String[]{"VNC",          "HIGH",   "Virtual Network Computing - remote access risk"});
        KNOWN_PORTS.put(6379, new String[]{"Redis",        "HIGH",   "Redis cache - often misconfigured, no auth by default"});
        KNOWN_PORTS.put(8080, new String[]{"HTTP-Alt",     "MEDIUM", "Alternative HTTP - dev server exposure"});
        KNOWN_PORTS.put(8443, new String[]{"HTTPS-Alt",    "LOW",    "Alternative HTTPS"});
        KNOWN_PORTS.put(9200, new String[]{"Elasticsearch","HIGH",   "Elasticsearch - data exposure if unauthenticated"});
        KNOWN_PORTS.put(27017,new String[]{"MongoDB",      "HIGH",   "MongoDB - frequently exposed without authentication"});
    }

    public List<PortScanResult> scanPorts() {
        // Clear old results
        portResults.clear();

        List<PortScanResult> results = new ArrayList<>();
        ExecutorService executor = Executors.newFixedThreadPool(20);
        List<Future<PortScanResult>> futures = new ArrayList<>();

        for (Map.Entry<Integer, String[]> entry : KNOWN_PORTS.entrySet()) {
            int port = entry.getKey();
            String[] meta = entry.getValue();
            futures.add(executor.submit(() -> scanPort(port, meta[0], meta[1], meta[2])));
        }

        for (Future<PortScanResult> future : futures) {
            try {
                PortScanResult result = future.get(3, TimeUnit.SECONDS);
                if (result != null) {
                    result.setId(idCounter.getAndIncrement());
                    portResults.add(result);
                    results.add(result);
                }
            } catch (Exception ignored) {}
        }

        executor.shutdown();
        return results;
    }

    private PortScanResult scanPort(int port, String service, String exposure, String risk) {
        PortScanResult result = new PortScanResult();
        result.setPortNumber(port);
        result.setServiceName(service);
        result.setProtocol("TCP");
        result.setExposureLevel(exposure);
        result.setRiskDescription(risk);
        result.setScannedAt(LocalDateTime.now());

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress("localhost", port), 500);
            result.setOpen(true);
        } catch (Exception e) {
            result.setOpen(false);
        }
        return result;
    }

    public List<PortScanResult> getAllResults() {
        return new ArrayList<>(portResults);
    }

    public List<PortScanResult> getOpenPorts() {
        return portResults.stream()
                .filter(PortScanResult::isOpen)
                .toList();
    }
}
