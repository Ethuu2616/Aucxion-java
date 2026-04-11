package com.aucxion.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SecuritySuggestionService {

    public Map<String, List<Map<String, String>>> getAllSuggestions() {
        Map<String, List<Map<String, String>>> suggestions = new LinkedHashMap<>();
        suggestions.put("DDOS", getDDoSSuggestions());
        suggestions.put("RANSOMWARE", getRansomwareSuggestions());
        suggestions.put("ZERO_DAY", getZeroDaySuggestions());
        suggestions.put("PHISHING", getPhishingSuggestions());
        return suggestions;
    }

    public List<Map<String, String>> getSuggestionsForType(String attackType) {
        return switch (attackType.toUpperCase()) {
            case "DDOS"       -> getDDoSSuggestions();
            case "RANSOMWARE" -> getRansomwareSuggestions();
            case "ZERO_DAY"   -> getZeroDaySuggestions();
            case "PHISHING"   -> getPhishingSuggestions();
            default           -> List.of();
        };
    }

    private List<Map<String, String>> getDDoSSuggestions() {
        return List.of(
            suggestion("Limit Connections", "Configure firewall to limit max connections per IP to 50.", "HIGH"),
            suggestion("Enable Rate Limiting", "Use iptables or Windows Firewall to throttle incoming traffic.", "HIGH"),
            suggestion("Close Unused Ports", "Disable all non-essential open ports immediately.", "CRITICAL"),
            suggestion("Contact ISP", "Report the attack to your ISP for upstream filtering.", "MEDIUM"),
            suggestion("Enable DDoS Protection", "Use Cloudflare or similar DDoS mitigation service.", "HIGH")
        );
    }

    private List<Map<String, String>> getRansomwareSuggestions() {
        return List.of(
            suggestion("Disconnect System", "Immediately disconnect from network to prevent spread.", "CRITICAL"),
            suggestion("Backup Critical Data", "Copy unaffected files to an offline/external drive.", "CRITICAL"),
            suggestion("Kill Malicious Processes", "Use Task Manager or kill command to stop suspicious processes.", "HIGH"),
            suggestion("Run Antivirus Scan", "Perform a full system scan with updated antivirus software.", "HIGH"),
            suggestion("Restore from Backup", "If available, restore system from a clean backup snapshot.", "HIGH"),
            suggestion("Report to Authorities", "Report ransomware attack to cybersecurity authorities (CISA, etc.).", "MEDIUM")
        );
    }

    private List<Map<String, String>> getZeroDaySuggestions() {
        return List.of(
            suggestion("Isolate Suspicious Process", "Terminate and quarantine the unknown process immediately.", "CRITICAL"),
            suggestion("Restrict Permissions", "Revoke elevated privileges from suspicious accounts.", "HIGH"),
            suggestion("Monitor System Logs", "Enable verbose logging and review event logs for anomalies.", "HIGH"),
            suggestion("Apply Security Patches", "Update OS and all software to latest security patches.", "HIGH"),
            suggestion("Enable Application Whitelisting", "Only allow known, signed applications to execute.", "MEDIUM")
        );
    }

    private List<Map<String, String>> getPhishingSuggestions() {
        return List.of(
            suggestion("Avoid Suspicious Links", "Do not click on unverified URLs or email attachments.", "HIGH"),
            suggestion("Block Malicious Domains", "Add suspicious domains to your hosts file or DNS blocklist.", "HIGH"),
            suggestion("Alert Users", "Notify all users about the phishing attempt immediately.", "CRITICAL"),
            suggestion("Enable MFA", "Enable multi-factor authentication on all critical accounts.", "HIGH"),
            suggestion("Check Browser Extensions", "Remove unknown or suspicious browser extensions.", "MEDIUM"),
            suggestion("Report Phishing URL", "Report the URL to Google Safe Browsing or PhishTank.", "MEDIUM")
        );
    }

    private Map<String, String> suggestion(String title, String action, String priority) {
        Map<String, String> s = new LinkedHashMap<>();
        s.put("title", title);
        s.put("action", action);
        s.put("priority", priority);
        return s;
    }
}
