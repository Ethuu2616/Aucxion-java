package com.aucxion.service;

import com.aucxion.model.ThreatLog;
import com.aucxion.model.ScanMetrics;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ThreatDetectionService {

    private final List<ThreatLog> threatLogs = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong idCounter = new AtomicLong(1);
    private ScanMetrics currentMetrics;

    public ThreatDetectionService() {
        this.currentMetrics = new ScanMetrics();
    }
    
    public void resetMetrics() {
        this.currentMetrics = new ScanMetrics();
    }
    
    public ScanMetrics getCurrentMetrics() {
        currentMetrics.calculateAccuracy();
        return currentMetrics;
    }
    
    public List<ThreatLog> getAllThreats() {
        return new ArrayList<>(threatLogs);
    }
    
    public void clearAllThreats() {
        threatLogs.clear();
    }

    // ─── DDoS Detection ───────────────────────────────────────────────────────
    public List<ThreatLog> detectDDoS() {
        List<ThreatLog> threats = new ArrayList<>();
        try {
            ProcessBuilder pb = isWindows()
                    ? new ProcessBuilder("cmd", "/c", "netstat -n")
                    : new ProcessBuilder("bash", "-c", "ss -t state established");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            int establishedCount = 0;
            Map<String, Integer> ipCount = new HashMap<>();
            String line;

            while ((line = reader.readLine()) != null) {
                if (line.toUpperCase().contains("ESTABLISHED")) {
                    establishedCount++;
                    String[] parts = line.trim().split("\\s+");
                    if (parts.length >= 3) {
                        String remoteAddr = parts[2];
                        String ip = remoteAddr.contains(":") ? remoteAddr.substring(0, remoteAddr.lastIndexOf(":")) : remoteAddr;
                        ipCount.merge(ip, 1, Integer::sum);
                    }
                }
            }
            process.waitFor();
            
            currentMetrics.setNetworkConnectionsChecked(establishedCount);

            if (establishedCount > 200) {
                threats.add(saveThreat(buildThreat("DDOS", "CRITICAL",
                        "Abnormal spike detected: " + establishedCount + " active ESTABLISHED connections. High probability of DDoS attack in progress.",
                        "Network Layer — " + establishedCount + " connections")));
            } else if (establishedCount > 100) {
                threats.add(saveThreat(buildThreat("DDOS", "HIGH",
                        "Elevated connection count: " + establishedCount + " active ESTABLISHED connections. Monitoring for DDoS pattern.",
                        "Network Layer — " + establishedCount + " connections")));
            }

            ipCount.forEach((ip, count) -> {
                if (count > 20) {
                    threats.add(saveThreat(buildThreat("DDOS", "HIGH",
                            "Repeated connections from single source: " + count + " connections from " + ip + ". Possible targeted flood.",
                            ip)));
                }
            });

        } catch (Exception e) {
            // Silent fail
        }
        return threats;
    }

    // ─── Ransomware Detection ─────────────────────────────────────────────────
    public List<ThreatLog> detectRansomware() {
        List<ThreatLog> threats = new ArrayList<>();
        int totalFilesScanned = 0;

        String[] suspiciousExtensions = {
            ".locked", ".encrypted", ".crypto", ".crypt", ".enc",
            ".rnsmwr", ".zepto", ".cerber", ".locky", ".wannacry",
            ".wncry", ".wncryt", ".petya", ".crypted", ".crypz"
        };

        String[] criticalDirs = isWindows()
                ? new String[]{"C:\\Users\\" + System.getProperty("user.name") + "\\Documents",
                               "C:\\Users\\" + System.getProperty("user.name") + "\\Desktop",
                               "C:\\Users\\" + System.getProperty("user.name") + "\\Pictures"}
                : new String[]{System.getProperty("user.home"), "/var/www", "/etc"};

        for (String dir : criticalDirs) {
            try {
                ProcessBuilder pb = isWindows()
                        ? new ProcessBuilder("cmd", "/c", "dir /s /b \"" + dir + "\" 2>nul")
                        : new ProcessBuilder("bash", "-c", "find \"" + dir + "\" -maxdepth 4 -type f 2>/dev/null");
                pb.redirectErrorStream(true);
                Process process = pb.start();
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String line;
                List<String> foundFiles = new ArrayList<>();
                int dirFileCount = 0;

                while ((line = reader.readLine()) != null) {
                    dirFileCount++;
                    String lower = line.toLowerCase();
                    for (String ext : suspiciousExtensions) {
                        if (lower.endsWith(ext)) {
                            foundFiles.add(line.trim());
                            break;
                        }
                    }
                }
                process.waitFor();
                totalFilesScanned += dirFileCount;

                if (!foundFiles.isEmpty()) {
                    String sample = foundFiles.size() > 3
                            ? String.join(", ", foundFiles.subList(0, 3)) + " (+" + (foundFiles.size() - 3) + " more)"
                            : String.join(", ", foundFiles);
                    threats.add(saveThreat(buildThreat("RANSOMWARE", "CRITICAL",
                            "Found " + foundFiles.size() + " file(s) with ransomware encryption extensions in " + dir + ". Files: " + sample,
                            dir)));
                }
            } catch (Exception ignored) {}
        }
        
        currentMetrics.setFilesScanned(totalFilesScanned);
        threats.addAll(detectShadowCopyDeletion());
        threats.addAll(scanLogFilesForThreats());

        return threats;
    }
    
    private List<ThreatLog> scanLogFilesForThreats() {
        List<ThreatLog> threats = new ArrayList<>();
        int totalLogEntries = 0;
        int totalSystemFiles = 0;
        
        String[] logPaths = isWindows()
                ? new String[]{
                    "C:\\Windows\\System32\\winevt\\Logs\\System.evtx",
                    "C:\\Windows\\System32\\winevt\\Logs\\Security.evtx",
                    "C:\\Windows\\System32\\winevt\\Logs\\Application.evtx"
                }
                : new String[]{
                    "/var/log/syslog",
                    "/var/log/auth.log",
                    "/var/log/kern.log"
                };
        
        String[] suspiciousPatterns = {
            "failed login", "authentication failure", "unauthorized access",
            "permission denied", "access denied", "intrusion", "malware",
            "virus", "trojan", "backdoor", "exploit", "attack detected"
        };
        
        for (String logPath : logPaths) {
            try {
                java.io.File logFile = new java.io.File(logPath);
                if (!logFile.exists()) continue;
                
                totalSystemFiles++;
                
                ProcessBuilder pb = isWindows()
                        ? new ProcessBuilder("cmd", "/c", "type \"" + logPath + "\" 2>nul | findstr /i \"failed login unauthorized malware virus\"")
                        : new ProcessBuilder("bash", "-c", "grep -iE 'failed|unauthorized|malware|virus' \"" + logPath + "\" 2>/dev/null | tail -20");
                pb.redirectErrorStream(true);
                Process process = pb.start();
                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String line;
                int suspiciousCount = 0;
                
                while ((line = reader.readLine()) != null && suspiciousCount < 5) {
                    totalLogEntries++;
                    String lower = line.toLowerCase();
                    for (String pattern : suspiciousPatterns) {
                        if (lower.contains(pattern)) {
                            suspiciousCount++;
                            break;
                        }
                    }
                }
                process.waitFor();
                
                if (suspiciousCount > 0) {
                    threats.add(saveThreat(buildThreat("ZERO_DAY", "MEDIUM",
                            "Found " + suspiciousCount + " suspicious entries in system log file: " + logPath + ". Possible security incidents detected.",
                            logPath)));
                }
            } catch (Exception ignored) {}
        }
        
        currentMetrics.setLogEntriesReviewed(totalLogEntries);
        currentMetrics.setSystemFilesChecked(totalSystemFiles);
        
        return threats;
    }

    // ─── Zero-Day / Anomaly Detection ─────────────────────────────────────────
    public List<ThreatLog> detectZeroDay() {
        List<ThreatLog> threats = new ArrayList<>();

        try {
            List<String> processes = getRunningProcesses();
            
            currentMetrics.setProcessesAnalyzed(processes.size());

            String[] exploitTools = {
                "mimikatz", "meterpreter", "netcat", "nc.exe", "ncat",
                "psexec", "wce.exe", "fgdump", "pwdump", "procdump",
                "cobaltstrike", "beacon", "empire", "metasploit",
                "lazagne", "sharphound", "bloodhound", "rubeus"
            };

            for (String proc : processes) {
                String lower = proc.toLowerCase();
                for (String tool : exploitTools) {
                    if (lower.contains(tool)) {
                        threats.add(saveThreat(buildThreat("ZERO_DAY", "CRITICAL",
                                "Known exploit tool detected in running processes: '" + tool + "'. This is a strong indicator of active compromise.",
                                proc.trim())));
                    }
                }
            }

            if (isWindows()) {
                threats.addAll(detectWindowsPrivilegeEscalation());
            }

            threats.addAll(detectAnomalousProcesses(processes));

        } catch (Exception ignored) {}

        return threats;
    }

    // ─── Phishing Detection ───────────────────────────────────────────────────
    public List<ThreatLog> detectPhishing() {
        List<ThreatLog> threats = new ArrayList<>();

        try {
            String hostsPath = isWindows()
                    ? "C:\\Windows\\System32\\drivers\\etc\\hosts"
                    : "/etc/hosts";
            ProcessBuilder pb = isWindows()
                    ? new ProcessBuilder("cmd", "/c", "type \"" + hostsPath + "\"")
                    : new ProcessBuilder("cat", hostsPath);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;

            String[] phishingPatterns = {
                "paypal-secure", "bank-login", "account-verify", "secure-update",
                "login-confirm", "verify-account", "signin-secure", "update-billing",
                "account-suspended", "confirm-identity", "secure-paypal", "apple-id-verify"
            };

            while ((line = reader.readLine()) != null) {
                if (line.trim().startsWith("#") || line.trim().isEmpty()) continue;
                String lower = line.toLowerCase();
                for (String pattern : phishingPatterns) {
                    if (lower.contains(pattern)) {
                        threats.add(saveThreat(buildThreat("PHISHING", "HIGH",
                                "Suspicious hosts file entry detected — possible DNS hijack or phishing redirect: " + line.trim(),
                                hostsPath)));
                        break;
                    }
                }
            }
            process.waitFor();
        } catch (Exception ignored) {}

        try {
            List<String> processes = getRunningProcesses();
            long chromeCount  = processes.stream().filter(p -> p.toLowerCase().contains("chrome")).count();
            long firefoxCount = processes.stream().filter(p -> p.toLowerCase().contains("firefox")).count();
            long edgeCount    = processes.stream().filter(p -> p.toLowerCase().contains("msedge")).count();

            if (chromeCount > 30) {
                threats.add(saveThreat(buildThreat("PHISHING", "MEDIUM",
                        "Unusually high Chrome process count (" + chromeCount + " instances). Possible phishing tab flood or browser hijack.",
                        "chrome.exe — " + chromeCount + " processes")));
            }
            if (firefoxCount > 20) {
                threats.add(saveThreat(buildThreat("PHISHING", "MEDIUM",
                        "Unusually high Firefox process count (" + firefoxCount + " instances). Possible phishing tab flood.",
                        "firefox.exe — " + firefoxCount + " processes")));
            }
            if (edgeCount > 30) {
                threats.add(saveThreat(buildThreat("PHISHING", "MEDIUM",
                        "Unusually high Edge process count (" + edgeCount + " instances). Possible phishing tab flood.",
                        "msedge.exe — " + edgeCount + " processes")));
            }
        } catch (Exception ignored) {}

        return threats;
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private List<String> getRunningProcesses() throws Exception {
        List<String> processes = new ArrayList<>();
        ProcessBuilder pb = isWindows()
                ? new ProcessBuilder("tasklist", "/fo", "csv", "/nh")
                : new ProcessBuilder("ps", "aux");
        pb.redirectErrorStream(true);
        Process process = pb.start();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            processes.add(line);
        }
        process.waitFor();
        return processes;
    }

    private List<ThreatLog> detectShadowCopyDeletion() {
        List<ThreatLog> threats = new ArrayList<>();
        if (!isWindows()) return threats;
        try {
            List<String> procs = getRunningProcesses();
            String[] shadowDeleteCmds = {"vssadmin delete", "wbadmin delete", "bcdedit /set", "wmic shadowcopy delete"};
            for (String proc : procs) {
                String lower = proc.toLowerCase();
                for (String cmd : shadowDeleteCmds) {
                    if (lower.contains(cmd.toLowerCase())) {
                        threats.add(saveThreat(buildThreat("RANSOMWARE", "CRITICAL",
                                "Shadow copy deletion command detected: '" + cmd + "'. This is a primary ransomware indicator — backups are being destroyed.",
                                proc.trim())));
                    }
                }
            }
        } catch (Exception ignored) {}
        return threats;
    }

    private List<ThreatLog> detectWindowsPrivilegeEscalation() {
        List<ThreatLog> threats = new ArrayList<>();
        try {
            ProcessBuilder pb = new ProcessBuilder("cmd", "/c", "whoami /priv");
            pb.redirectErrorStream(true);
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            int enabledCount = 0;
            List<String> dangerousPrivs = new ArrayList<>();
            String[] highRiskPrivs = {
                "SeDebugPrivilege", "SeImpersonatePrivilege", "SeAssignPrimaryTokenPrivilege",
                "SeTcbPrivilege", "SeLoadDriverPrivilege", "SeRestorePrivilege", "SeTakeOwnershipPrivilege"
            };

            while ((line = reader.readLine()) != null) {
                if (line.contains("Enabled")) {
                    enabledCount++;
                    for (String priv : highRiskPrivs) {
                        if (line.contains(priv)) {
                            dangerousPrivs.add(priv);
                        }
                    }
                }
            }
            process.waitFor();

            if (!dangerousPrivs.isEmpty()) {
                threats.add(saveThreat(buildThreat("ZERO_DAY", "HIGH",
                        "High-risk Windows privileges are enabled: " + String.join(", ", dangerousPrivs) + ". These can be abused for privilege escalation.",
                        "System Privileges — " + dangerousPrivs.get(0))));
            } else if (enabledCount > 15) {
                threats.add(saveThreat(buildThreat("ZERO_DAY", "MEDIUM",
                        "Unusually high number of enabled privileges (" + enabledCount + "). Review for potential privilege escalation.",
                        "System Privileges — " + enabledCount + " enabled")));
            }
        } catch (Exception ignored) {}
        return threats;
    }

    private List<ThreatLog> detectAnomalousProcesses(List<String> processes) {
        List<ThreatLog> threats = new ArrayList<>();
        String[] suspiciousPaths = {
            "\\temp\\", "\\tmp\\", "\\appdata\\local\\temp\\",
            "\\downloads\\", "\\recycle", "%temp%"
        };
        for (String proc : processes) {
            String lower = proc.toLowerCase();
            for (String path : suspiciousPaths) {
                if (lower.contains(path) && (lower.contains(".exe") || lower.contains(".bat") || lower.contains(".ps1"))) {
                    threats.add(saveThreat(buildThreat("ZERO_DAY", "MEDIUM",
                            "Executable running from suspicious temporary directory — possible malware dropper or in-memory execution: " + proc.trim(),
                            proc.trim())));
                    break;
                }
            }
        }
        return threats;
    }

    private ThreatLog buildThreat(String type, String severity, String description, String source) {
        ThreatLog log = new ThreatLog();
        log.setAttackType(type);
        log.setSeverity(severity);
        log.setDescription(description);
        log.setSource(source);
        log.setDetectedAt(LocalDateTime.now());
        log.setStatus("ACTIVE");
        return log;
    }
    
    private ThreatLog saveThreat(ThreatLog threat) {
        threat.setId(idCounter.getAndIncrement());
        threatLogs.add(threat);
        return threat;
    }

    private boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }
}
