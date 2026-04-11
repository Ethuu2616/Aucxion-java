package com.aucxion.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ChatbotService {

    // Each entry: topic tags (what it's about) + intent tags (what user wants) + answer
    private static final List<QA> KB = new ArrayList<>();

    static {
        // ── DDoS ──────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("ddos", "denial", "service", "traffic", "flood", "bandwidth", "connection"),
            Set.of("what", "explain", "define", "meaning", "is"),
            "A DDoS (Distributed Denial of Service) attack floods your system with traffic from multiple sources simultaneously, exhausting resources and making services unavailable to legitimate users. Attackers use botnets — networks of compromised machines — to generate massive traffic volumes targeting your network or application layer."
        ));
        KB.add(new QA(
            Set.of("ddos", "denial", "service", "traffic", "flood"),
            Set.of("stop", "fix", "block", "handle", "deal", "mitigate", "respond"),
            "To stop a DDoS attack:\n1. Enable rate limiting on your firewall — restrict max connections per IP to 50.\n2. Block attacking source IPs immediately using firewall rules.\n3. Contact your ISP for upstream traffic filtering.\n4. Use a DDoS mitigation service like Cloudflare or AWS Shield.\n5. Close all non-essential open ports.\n6. Restart affected services after traffic normalizes."
        ));
        KB.add(new QA(
            Set.of("ddos", "denial", "service", "traffic", "flood"),
            Set.of("prevent", "avoid", "protect", "secure", "defense"),
            "Prevent DDoS attacks by:\n1. Deploying a Web Application Firewall (WAF).\n2. Enabling rate limiting and connection throttling.\n3. Using Cloudflare, Akamai, or AWS Shield for traffic scrubbing.\n4. Keeping all software and firmware updated.\n5. Closing unused ports and services.\n6. Setting up traffic anomaly alerts to detect spikes early."
        ));

        // ── Ransomware ────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("ransomware", "ransom", "encrypted", "locked", "encrypt"),
            Set.of("what", "explain", "define", "meaning", "is"),
            "Ransomware is malicious software that encrypts your files and demands payment for the decryption key. It typically spreads via phishing emails, malicious downloads, or unpatched vulnerabilities. Modern ransomware also exfiltrates data before encrypting it, threatening to publish it if the ransom is not paid."
        ));
        KB.add(new QA(
            Set.of("ransomware", "ransom", "encrypted", "locked"),
            Set.of("remove", "fix", "stop", "clean", "get", "rid", "eliminate"),
            "To remove ransomware:\n1. Disconnect the infected system from the network immediately to prevent spread.\n2. Do NOT pay the ransom — payment does not guarantee file recovery.\n3. Boot into Safe Mode and run a full antivirus scan (Malwarebytes, Windows Defender).\n4. Check nomoreransom.org for a free decryption tool for your ransomware variant.\n5. Restore files from your most recent clean offline backup.\n6. Reinstall the OS if the infection is severe.\n7. Report to CISA or local cybersecurity authorities."
        ));
        KB.add(new QA(
            Set.of("ransomware", "ransom", "encrypted", "locked"),
            Set.of("prevent", "avoid", "protect", "secure", "defense", "stop"),
            "Prevent ransomware by:\n1. Maintaining regular offline backups using the 3-2-1 rule: 3 copies, 2 media types, 1 offsite.\n2. Keeping OS and all software fully patched.\n3. Training users to recognize phishing emails.\n4. Disabling macros in Office documents.\n5. Using application whitelisting.\n6. Deploying Endpoint Detection and Response (EDR) software.\n7. Restricting user privileges — no admin rights for regular users."
        ));
        KB.add(new QA(
            Set.of("ransomware", "ransom", "encrypted", "locked", "files"),
            Set.of("recover", "restore", "recovery", "decrypt", "get back"),
            "Recover from ransomware by:\n1. Isolating the infected machine from the network immediately.\n2. Identifying the ransomware variant using ID Ransomware at nomoreransom.org.\n3. Checking nomoreransom.org for a free decryption tool.\n4. Restoring from the most recent clean backup.\n5. Rebuilding the system from scratch if no backup exists.\n6. Patching the vulnerability that allowed the infection.\n7. Implementing EDR tools to prevent reinfection."
        ));

        // ── Zero-Day ──────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("zero", "day", "zeroday", "unknown", "unpatched", "novel"),
            Set.of("what", "explain", "define", "meaning", "is"),
            "A zero-day exploit targets a software vulnerability that is unknown to the vendor with no patch available. The term means developers have had zero days to fix it. These are extremely dangerous because traditional signature-based antivirus cannot detect them. Detection requires behavioral analysis — looking for unusual process behavior, privilege escalation, or anomalous system calls."
        ));
        KB.add(new QA(
            Set.of("zero", "day", "zeroday", "unknown", "unpatched"),
            Set.of("protect", "prevent", "fix", "stop", "defend", "secure", "avoid"),
            "Protect against zero-day attacks by:\n1. Using behavior-based Endpoint Detection (EDR/XDR) instead of signature-only antivirus.\n2. Applying the principle of least privilege — restrict what processes and users can do.\n3. Enabling application sandboxing to isolate untrusted code.\n4. Keeping all software updated to minimize the attack surface.\n5. Using network segmentation to limit lateral movement.\n6. Monitoring system logs for anomalous behavior.\n7. Deploying an Intrusion Detection System (IDS)."
        ));

        // ── Phishing ──────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("phishing", "phish", "fake", "email", "social", "engineering", "credential"),
            Set.of("what", "explain", "define", "meaning", "is"),
            "Phishing is a social engineering attack where attackers impersonate trusted entities (banks, companies, colleagues) to trick users into revealing credentials, clicking malicious links, or downloading malware. Common forms include email phishing, spear phishing (targeted), smishing (SMS), and vishing (voice calls)."
        ));
        KB.add(new QA(
            Set.of("phishing", "phish", "fake", "email"),
            Set.of("stop", "fix", "block", "prevent", "avoid", "protect"),
            "Stop phishing attacks by:\n1. Never clicking links in unsolicited emails — navigate directly to the website.\n2. Verifying sender email addresses carefully for domain spoofing.\n3. Enabling multi-factor authentication (MFA) on all accounts.\n4. Using email filtering with anti-phishing capabilities.\n5. Blocking malicious domains in your DNS or hosts file.\n6. Training users to recognize phishing indicators.\n7. Reporting phishing URLs to Google Safe Browsing and PhishTank."
        ));
        KB.add(new QA(
            Set.of("phishing", "phish", "fake", "email"),
            Set.of("identify", "recognize", "detect", "spot", "signs", "tell"),
            "Identify phishing emails by checking:\n1. Sender address — does the domain exactly match the real company?\n2. Urgency — phishing creates false urgency ('Act now or your account will be closed').\n3. Links — hover over links to see the real URL before clicking.\n4. Attachments — unexpected attachments are a major red flag.\n5. Grammar — poor spelling and grammar are common indicators.\n6. Credential requests — legitimate companies never ask for passwords via email."
        ));

        // ── Malware ───────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("malware", "virus", "trojan", "worm", "spyware", "rootkit", "infected", "infection"),
            Set.of("what", "explain", "define", "meaning", "is", "types"),
            "Malware (malicious software) is any software designed to harm or gain unauthorized access to systems. Types include:\n• Viruses — self-replicating, attach to files.\n• Worms — spread across networks automatically.\n• Trojans — disguised as legitimate software.\n• Ransomware — encrypts files for ransom.\n• Spyware — steals data silently.\n• Rootkits — hides malware from detection.\n• Botnets — remote-controlled compromised machines."
        ));
        KB.add(new QA(
            Set.of("malware", "virus", "trojan", "worm", "spyware", "rootkit", "infected"),
            Set.of("remove", "fix", "clean", "delete", "get", "rid", "eliminate", "stop"),
            "Remove malware by:\n1. Disconnecting from the internet to prevent data exfiltration.\n2. Booting into Safe Mode to prevent malware from loading.\n3. Running a full scan with Malwarebytes, Windows Defender, or Kaspersky.\n4. Manually removing suspicious startup entries via msconfig or Task Scheduler.\n5. Deleting temporary files where malware often hides.\n6. Resetting browser settings if the browser is hijacked.\n7. Reinstalling the OS as a last resort for severe infections."
        ));

        // ── Ports ─────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("port", "ports", "open", "listening"),
            Set.of("dangerous", "risky", "risk", "vulnerable", "which", "bad", "unsafe"),
            "Dangerous open ports include:\n• Port 22 (SSH) — brute force target if exposed publicly.\n• Port 23 (Telnet) — unencrypted, should never be used.\n• Port 445 (SMB) — exploited by WannaCry/EternalBlue ransomware.\n• Port 3389 (RDP) — primary ransomware delivery vector.\n• Port 3306 (MySQL) — database should never be publicly exposed.\n• Port 4444 — default Metasploit listener, indicates active compromise.\n• Port 6379 (Redis) — often unauthenticated by default.\nAlways close ports you don't actively need."
        ));
        KB.add(new QA(
            Set.of("port", "ports"),
            Set.of("close", "block", "disable", "shut", "stop", "secure"),
            "Close open ports by:\n1. Windows Firewall: Control Panel → Windows Defender Firewall → Advanced Settings → Inbound Rules → New Rule → Block the port.\n2. Linux iptables: run 'iptables -A INPUT -p tcp --dport PORT -j DROP'.\n3. Stop the service using the port: run 'netstat -ano' to find the PID, then end the process.\n4. Disable the service permanently: 'sc stop ServiceName' on Windows or 'systemctl disable service' on Linux."
        ));
        KB.add(new QA(
            Set.of("port", "ports", "open"),
            Set.of("check", "find", "scan", "see", "list", "view", "show"),
            "Check open ports on your system:\n• Windows: Open Command Prompt and run 'netstat -ano' to see all active connections and listening ports.\n• Filter only listening ports: 'netstat -ano | findstr LISTENING'\n• To find which process owns a port: note the PID from netstat, then run 'tasklist | findstr PID'\n• Linux: run 'ss -tlnp' or 'netstat -tlnp'\nClose any ports you don't recognize or need."
        ));

        // ── Privilege Escalation ──────────────────────────────────────────────
        KB.add(new QA(
            Set.of("privilege", "escalation", "admin", "root", "elevated", "permissions"),
            Set.of("what", "explain", "define", "meaning", "is"),
            "Privilege escalation is when an attacker gains higher access rights than authorized. Vertical escalation means gaining admin/root from a standard user. Horizontal escalation means accessing another user's account at the same level. Common techniques include exploiting misconfigured sudo rules, vulnerable SUID binaries, token impersonation, and kernel exploits."
        ));
        KB.add(new QA(
            Set.of("privilege", "escalation", "admin", "root", "elevated"),
            Set.of("prevent", "stop", "fix", "protect", "avoid", "secure"),
            "Prevent privilege escalation by:\n1. Applying the principle of least privilege — users only get the access they need.\n2. Regularly auditing user permissions and group memberships.\n3. Disabling unnecessary SUID/SGID binaries on Linux.\n4. Keeping the OS kernel patched.\n5. Using Privileged Access Management (PAM) tools.\n6. Monitoring for unusual privilege use via SIEM.\n7. Disabling dangerous Windows privileges like SeDebugPrivilege for non-admin users."
        ));

        // ── RDP ───────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("rdp", "remote", "desktop", "3389"),
            Set.of("secure", "protect", "fix", "harden", "safe", "prevent"),
            "Secure RDP (port 3389) by:\n1. Never expose RDP directly to the internet.\n2. Use a VPN — only allow RDP through VPN.\n3. Enable Network Level Authentication (NLA).\n4. Change the default RDP port from 3389 to a non-standard port.\n5. Use strong passwords and enable account lockout policies.\n6. Enable MFA for RDP sessions.\n7. Restrict RDP access to specific IP addresses via firewall rules.\n8. Monitor RDP logs for failed login attempts."
        ));

        // ── SSH ───────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("ssh", "secure", "shell", "22"),
            Set.of("secure", "protect", "fix", "harden", "safe", "prevent"),
            "Secure SSH by:\n1. Disable root login — set 'PermitRootLogin no' in sshd_config.\n2. Use SSH key authentication instead of passwords.\n3. Change the default port from 22 to a non-standard port.\n4. Enable fail2ban to block brute force attempts.\n5. Restrict SSH access to specific IP addresses.\n6. Disable password authentication — set 'PasswordAuthentication no'.\n7. Keep OpenSSH updated to the latest version."
        ));

        // ── Firewall ──────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("firewall", "network", "traffic", "filter", "packet"),
            Set.of("what", "explain", "define", "meaning", "is", "does", "help"),
            "A firewall monitors and controls incoming and outgoing network traffic based on security rules. It acts as a barrier between trusted internal networks and untrusted external networks. Firewalls help by blocking unauthorized access, filtering malicious traffic, preventing port scanning, enforcing network segmentation, and logging suspicious connection attempts."
        ));

        // ── MFA / 2FA ─────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("mfa", "2fa", "two", "factor", "multi", "authentication", "authenticator"),
            Set.of("what", "explain", "define", "meaning", "is", "enable", "setup", "how"),
            "Enable MFA by:\n1. Google accounts — Security → 2-Step Verification.\n2. Microsoft accounts — Security → Advanced Security → Two-step verification.\n3. For SSH — install Google Authenticator PAM module.\n4. Use authenticator apps (Google Authenticator, Authy, Microsoft Authenticator) rather than SMS.\n5. For enterprise — deploy Duo Security or Okta.\nMFA blocks over 99% of automated account compromise attacks."
        ));

        // ── Backup ────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("backup", "backups", "data", "recovery", "restore", "321"),
            Set.of("what", "explain", "rule", "strategy", "how", "best", "practice"),
            "The 3-2-1 backup rule is the gold standard for data protection:\n• 3 copies of your data (1 primary + 2 backups).\n• 2 different media types (e.g., local drive + cloud).\n• 1 copy offsite or offline.\nThis ensures ransomware, hardware failure, or disaster cannot destroy all copies. Test your backups regularly — an untested backup is not a backup."
        ));

        // ── Compromised system ────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("compromised", "hacked", "hack", "breached", "breach", "infected"),
            Set.of("check", "know", "tell", "detect", "find", "signs", "how", "am"),
            "Check for system compromise by:\n1. Running 'netstat -ano' to look for unusual outbound connections.\n2. Checking running processes with 'tasklist' for unknown executables.\n3. Reviewing Windows Event Logs for failed logins and privilege use.\n4. Scanning with Malwarebytes or Windows Defender.\n5. Checking startup programs for unknown entries.\n6. Looking for new user accounts you did not create.\n7. Monitoring CPU/memory for unexplained spikes."
        ));

        // ── Incident response ─────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("attack", "incident", "cyberattack", "breach", "hacked", "compromised"),
            Set.of("after", "response", "do", "steps", "what", "now", "happened"),
            "Immediately after a cyberattack:\n1. Isolate the affected system — disconnect from network and internet.\n2. Do not turn off the machine — preserve forensic evidence in memory.\n3. Document everything — screenshots, logs, timestamps.\n4. Notify your IT security team or incident response team.\n5. Preserve logs before they are overwritten.\n6. Identify the attack vector to prevent reinfection.\n7. Report to CISA, FBI IC3, or local cybercrime unit.\n8. Begin recovery from clean backups only after the threat is fully contained."
        ));

        // ── SQL Injection ─────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("sql", "injection", "sqli", "database", "query"),
            Set.of("what", "explain", "define", "is", "prevent", "fix", "stop", "protect"),
            "SQL injection is an attack where malicious SQL code is inserted into input fields to manipulate database queries. For example, entering ' OR 1=1 -- in a login form can bypass authentication. Prevent it by:\n1. Using parameterized queries and prepared statements.\n2. Validating and sanitizing all user input.\n3. Using an ORM framework.\n4. Applying least privilege to database accounts.\n5. Deploying a Web Application Firewall (WAF)."
        ));

        // ── Network security ──────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("network", "wifi", "router", "wireless", "lan", "wan"),
            Set.of("secure", "protect", "harden", "safe", "fix", "how"),
            "Secure your network by:\n1. Changing default router credentials immediately.\n2. Using WPA3 or WPA2 encryption for Wi-Fi.\n3. Segmenting your network — separate IoT, guest, and corporate traffic.\n4. Enabling firewall on the router and all endpoints.\n5. Disabling UPnP on the router.\n6. Keeping router firmware updated.\n7. Using a VPN for remote access.\n8. Disabling remote management unless needed."
        ));

        // ── Windows security ──────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("windows", "system", "pc", "computer", "os"),
            Set.of("secure", "protect", "harden", "safe", "fix", "how"),
            "Secure a Windows system by:\n1. Keeping Windows fully updated via Windows Update.\n2. Enabling Windows Defender with current definitions.\n3. Using a standard user account for daily tasks — not admin.\n4. Enabling Windows Firewall with strict rules.\n5. Disabling unnecessary services (Telnet, Remote Registry).\n6. Enabling BitLocker for disk encryption.\n7. Configuring UAC to maximum.\n8. Disabling AutoRun/AutoPlay.\n9. Enabling audit logging in Group Policy.\n10. Using AppLocker to whitelist allowed applications."
        ));

        // ── SMB ───────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("smb", "445", "wannacry", "eternalblue", "samba", "filesharing"),
            Set.of("what", "explain", "is", "fix", "secure", "protect", "vulnerability"),
            "SMB (Server Message Block) on port 445 has been exploited by some of the most damaging attacks in history, including WannaCry and NotPetya via the EternalBlue exploit. If SMB is open and unpatched, attackers can execute code remotely without authentication. Fix: Apply MS17-010 patch, disable SMBv1, and block port 445 at the firewall if file sharing is not needed."
        ));

        // ── VPN ───────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("vpn", "virtual", "private", "network", "tunnel"),
            Set.of("what", "explain", "is", "use", "need", "should", "why", "how"),
            "A VPN (Virtual Private Network) encrypts your internet traffic and routes it through a secure server, hiding your IP address and protecting data from interception. Use a VPN when connecting to public Wi-Fi, accessing corporate resources remotely, or protecting sensitive communications. Choose VPNs with no-log policies and strong encryption (OpenVPN, WireGuard)."
        ));

        // ── Botnet ────────────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("botnet", "bot", "zombie", "c2", "command", "control"),
            Set.of("what", "explain", "is", "define", "prevent", "protect", "stop"),
            "A botnet is a network of internet-connected devices infected with malware and remotely controlled by an attacker without the owners' knowledge. Botnets are used to launch DDoS attacks, send spam, mine cryptocurrency, steal credentials, and distribute malware. Protect against botnet infection by keeping software updated, using strong passwords, and deploying endpoint security."
        ));

        // ── Password security ─────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("password", "passwords", "credential", "credentials", "passphrase"),
            Set.of("strong", "secure", "best", "practice", "create", "how", "good", "safe"),
            "Create strong passwords by:\n1. Using at least 16 characters — longer is stronger.\n2. Mixing uppercase, lowercase, numbers, and symbols.\n3. Never reusing passwords across different accounts.\n4. Using a password manager (Bitwarden, 1Password, KeePass) to generate and store unique passwords.\n5. Enabling MFA on all accounts as a second layer of protection.\n6. Avoiding personal information (name, birthday) in passwords.\n7. Changing passwords immediately if a breach is suspected."
        ));

        // ── Brute force ───────────────────────────────────────────────────────
        KB.add(new QA(
            Set.of("brute", "force", "bruteforce", "password", "guessing", "cracking"),
            Set.of("what", "explain", "is", "prevent", "stop", "protect", "fix"),
            "A brute force attack systematically tries every possible password combination until the correct one is found. Prevent brute force attacks by:\n1. Using long, complex passwords (16+ characters).\n2. Enabling account lockout after 5 failed attempts.\n3. Deploying fail2ban on Linux servers.\n4. Enabling MFA — even if the password is guessed, MFA blocks access.\n5. Using CAPTCHA on login forms.\n6. Monitoring login logs for repeated failed attempts.\n7. Changing default usernames (never use 'admin' or 'root')."
        ));
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    public String getResponse(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Please type a question about cybersecurity.";
        }

        String query = userMessage.toLowerCase().trim()
                .replaceAll("[^a-z0-9\\s]", " ")  // remove punctuation
                .replaceAll("\\s+", " ");

        if (isGreeting(query)) {
            return "Hi! I'm Aucxion's security assistant. Ask me anything about cybersecurity — how to fix attacks, prevent threats, secure your system, or understand vulnerabilities.\n\nYou can ask about: DDoS, Ransomware, Phishing, Zero-Day, Malware, Ports, SSH, RDP, Firewalls, VPN, MFA, Passwords, and more.";
        }

        Set<String> queryWords = new HashSet<>(Arrays.asList(query.split("\\s+")));

        QA best = findBestMatch(queryWords);
        if (best != null) {
            return best.answer;
        }

        return buildGenericResponse(query);
    }

    // ── Matching ───────────────────────────────────────────────────────────────

    private QA findBestMatch(Set<String> queryWords) {
        QA bestEntry   = null;
        double bestScore = 0;

        for (QA entry : KB) {
            // Topic score: how many topic words appear in the query
            long topicHits  = entry.topicTags.stream().filter(queryWords::contains).count();
            // Intent score: how many intent words appear in the query
            long intentHits = entry.intentTags.stream().filter(queryWords::contains).count();

            if (topicHits == 0) continue; // must match at least one topic word

            // Weight: topic match is primary, intent match refines selection
            double score = (topicHits * 3.0) + (intentHits * 2.0);

            // Bonus for longer topic keyword matches (more specific)
            score += topicHits * 0.5;

            if (score > bestScore) {
                bestScore = score;
                bestEntry = entry;
            }
        }

        return bestScore >= 3.0 ? bestEntry : null;
    }

    private boolean isGreeting(String query) {
        String[] greetings = {"hello", "hi", "hey", "good morning", "good afternoon",
                "good evening", "howdy", "what can you do", "help me", "who are you", "what are you"};
        for (String g : greetings) {
            if (query.contains(g)) return true;
        }
        return false;
    }

    private String buildGenericResponse(String query) {
        if (query.contains("how") || query.contains("fix") || query.contains("stop") || query.contains("prevent") || query.contains("remove")) {
            return "Here are general steps to address a security threat:\n1. Isolate the affected system from the network immediately.\n2. Run a full antivirus scan using Windows Defender or Malwarebytes.\n3. Review system and event logs for suspicious activity.\n4. Apply all pending OS and software security patches.\n5. Change all passwords and enable MFA on critical accounts.\n6. Restore from a clean backup if system integrity is compromised.\n\nFor specific help, ask me about: DDoS, Ransomware, Phishing, Zero-Day, Malware, Ports, SSH, RDP, Firewall, VPN, or Passwords.";
        }
        return "I can help with cybersecurity questions. Try asking:\n• What is ransomware / DDoS / phishing / zero-day?\n• How to fix or prevent a DDoS attack?\n• How to remove ransomware?\n• How to secure RDP or SSH?\n• How to close open ports?\n• How to create strong passwords?\n• What to do after a cyberattack?";
    }

    // ── Inner class ────────────────────────────────────────────────────────────

    private static class QA {
        final Set<String> topicTags;
        final Set<String> intentTags;
        final String answer;

        QA(Set<String> topicTags, Set<String> intentTags, String answer) {
            this.topicTags  = topicTags;
            this.intentTags = intentTags;
            this.answer     = answer;
        }
    }
}
