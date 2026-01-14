export interface StandardQuestion {
    id: string;
    section: string;
    question: string;
    rationale: string;
    example: string;
}

export const DEFAULT_CRA_QUESTIONS: StandardQuestion[] = [
    // Access Control
    {
        id: "1",
        section: "Access Control",
        question: "Is it integrated with PayNet's Okta or PayNet's SSO for user authentication? If yes, provide the authentication used (i.e. Okta or SSO) in the remarks column and proceed to item (3), else proceed to item (2a–2f).",
        rationale: "Centralized authentication (SSO) reduces the risk of weak passwords and ensures consistent access control policies across the organization.",
        example: "Yes, integrated with Okta via SAML 2.0."
    },
    {
        id: "2a",
        section: "Access Control",
        question: "Is the account locked out after 5 invalid logon attempts or less? (as per Security Access Control Standard, clause 9.2, No. 2)",
        rationale: "Account lockout policies prevent brute-force attacks where an attacker tries to guess passwords repeatedly.",
        example: "Yes, configured to lock after 3 failed attempts for 30 minutes."
    },
    {
        id: "2b",
        section: "Access Control",
        question: "Is the maximum password age of 90 days or less enforced? (as per Security Access Control Standard, clause 9.1, No. 2)",
        rationale: "Regular password rotation limits the window of opportunity if a password is compromised.",
        example: "Yes, enforced via Active Directory policy (90 days)."
    },
    {
        id: "2c",
        section: "Access Control",
        question: "Would PayNet's password complexity requirement be enforced? (as per Security Access Control Standard, clause 9.1, No. 5)",
        rationale: "Complex passwords (length, special characters) are harder to crack via dictionary or brute-force attacks.",
        example: "Yes, requires 12+ chars, uppercase, lowercase, number, and symbol."
    },
    {
        id: "2d",
        section: "Access Control",
        question: "Is application audit trail in place? (as per Information Security Policy Clause ISP-080102)",
        rationale: "Audit trails are essential for forensic investigation and accountability. We need to know who did what and when.",
        example: "Yes, all user activities (login, data modification) are logged to a centralized syslog server."
    },
    {
        id: "2e",
        section: "Access Control",
        question: "Is the audit trail retained for at least 3 years? (as per Information Security Policy Clause ISP-060801)",
        rationale: "Long-term retention is required for compliance and to investigate incidents that may be discovered long after they occurred.",
        example: "Yes, logs are archived to AWS S3 Glacier with a 3-year retention policy."
    },
    {
        id: "3",
        section: "Access Control",
        question: "Is access request compliant with relevant PayNet's Access Control Management Procedures?",
        rationale: "Ensures that access is granted based on business need and proper approval, preventing unauthorized access.",
        example: "Yes, all access requests go through the IDM portal and require manager approval."
    },
    {
        id: "4",
        section: "Access Control",
        question: "Is the Superuser ID of the application managed (Custodian, Request, Retrieval, Lodgement, Backup) in accordance with section 9.0 Super User ID of the Access Control Management Procedures and SAFE Management Guidelines?",
        rationale: "Superuser accounts have full control. Their use must be strictly controlled and monitored to prevent abuse.",
        example: "Yes, the 'admin' password is split and stored in a physical safe (dual custody)."
    },
    {
        id: "5",
        section: "Access Control",
        question: "If answer to any question from (2a)–(4) is “No”, has an exception request been raised and approved by all approving parties?",
        rationale: "Deviations from standard policy introduce risk. These risks must be formally accepted by management.",
        example: "N/A (All answers were Yes) OR Yes, Exception #EXP-2024-001 approved by RMD."
    },

    // Cyber Security
    {
        id: "6",
        section: "Cyber Security",
        question: "Is the application protected by the following controls?",
        rationale: "Layered defenses are necessary to protect against various types of network and application attacks.",
        example: "Please answer 6a, 6b, and 6c below."
    },
    {
        id: "6a",
        section: "Cyber Security",
        question: "DDoS protection implemented? (If No, state compensating control in Remarks)",
        rationale: "Distributed Denial of Service (DDoS) attacks can make the service unavailable. Protection ensures business continuity.",
        example: "Yes, AWS Shield Standard is enabled."
    },
    {
        id: "6b",
        section: "Cyber Security",
        question: "Web Application Firewall (WAF) implemented? (If No, state compensating control in Remarks)",
        rationale: "WAF protects against common web exploits like SQL injection and XSS.",
        example: "Yes, AWS WAF is configured with the OWASP Top 10 rule set."
    },
    {
        id: "6c",
        section: "Cyber Security",
        question: "Malware protection implemented? (If No, state compensating control in Remarks)",
        rationale: "Prevents the installation and spread of malicious software on servers.",
        example: "Yes, Trend Micro Deep Security agent installed on all EC2 instances."
    },
    {
        id: "7",
        section: "Cyber Security",
        question: "Is a security assessment required to be performed by ITS/external prior to production implementation?",
        rationale: "Independent assessment validates that security controls are working effectively before going live.",
        example: "Yes, a VAPT is scheduled for next week."
    },
    {
        id: "8",
        section: "Cyber Security",
        question: "Have all the security assessments performed by ITS/external been completed?",
        rationale: "Ensures that the assessment phase is finished and we have the results.",
        example: "Yes, VAPT completed on [Date]."
    },
    {
        id: "9",
        section: "Cyber Security",
        question: "Have findings categorised as “Medium” and above been rectified?",
        rationale: "Medium and High risks pose significant threats and must be remediated before production.",
        example: "Yes, all High and Medium findings have been closed."
    },
    {
        id: "10",
        section: "Cyber Security",
        question: "Would the findings be remediated before the system goes live?",
        rationale: "Commitment to fix remaining issues before the go-live date.",
        example: "Yes, remaining Low findings will be fixed by [Date]."
    },

    // Vendor Access
    {
        id: "11",
        section: "Vendor Access",
        question: "Would the vendor be granted access to PayNet's infrastructure, applications, or data?",
        rationale: "Vendor access introduces third-party risk. We need to know if external parties can touch our systems.",
        example: "Yes, for support and maintenance."
    },
    {
        id: "12",
        section: "Vendor Access",
        question: "Is the access granted for troubleshooting or support purposes?",
        rationale: "Access should be limited to specific business needs.",
        example: "Yes, Level 3 support only."
    },
    {
        id: "13",
        section: "Vendor Access",
        question: "Is the access granted to the vendor including the following?",
        rationale: "Clarifies the level of privilege granted to the vendor.",
        example: "Please answer 13a and 13b."
    },
    {
        id: "13a",
        section: "Vendor Access",
        question: "Privileged / administrator / root access?",
        rationale: "Root access gives full control. This is high risk and requires strict monitoring.",
        example: "No, only restricted application-level access."
    },
    {
        id: "13b",
        section: "Vendor Access",
        question: "Permission to amend PayNet's data?",
        rationale: "Ability to change data affects integrity. Vendors should ideally only have read access unless necessary.",
        example: "No, read-only access."
    },
    {
        id: "14",
        section: "Vendor Access",
        question: "Is PayNet approval required before the access is granted?",
        rationale: "PayNet must retain control over who accesses its data, even if managed by a vendor.",
        example: "Yes, vendor must request access via ticket for each session."
    },
    {
        id: "15",
        section: "Vendor Access",
        question: "Is the access monitored and logged? (as per Information Security Policy ISP-060801)",
        rationale: "Monitoring ensures vendors are only doing what they are authorized to do.",
        example: "Yes, all vendor sessions are recorded via CyberArk."
    },
    {
        id: "16",
        section: "Vendor Access",
        question: "Will the access be revoked after the vendor completes the tasks?",
        rationale: "Just-in-Time (JIT) access reduces the attack surface. Permanent standing access is discouraged.",
        example: "Yes, access expires automatically after 4 hours."
    },
    {
        id: "17",
        section: "Vendor Access",
        question: "Is the vendor a managed service provider requiring permanent access to PayNet’s infrastructure, applications, or data?",
        rationale: "Managed Service Providers (MSPs) have continuous access, requiring stricter contractual and technical controls.",
        example: "No, ad-hoc support only."
    },

    // Data Protection
    {
        id: "18",
        section: "Data Protection",
        question: "Will PayNet sensitive data be stored in the cloud? If yes, what kind of sensitive data?",
        rationale: "Identifying data sensitivity is the first step in applying appropriate protection controls.",
        example: "Yes, PII (Customer Names, IDs) and Transaction Data."
    },
    {
        id: "19",
        section: "Data Protection",
        question: "Is PayNet sensitive data segregated from other tenants of the cloud?",
        rationale: "Multi-tenancy risks include data leakage. Logical or physical segregation is required.",
        example: "Yes, using a dedicated VPC and separate database instance."
    },
    {
        id: "20",
        section: "Data Protection",
        question: "Is a data flow diagram in place?",
        rationale: "Visualizing how data moves helps identify weak points and exposure risks.",
        example: "Yes, attached in the 'Attachments' section."
    },
    {
        id: "21",
        section: "Data Protection",
        question: "Is PayNet's sensitive data encrypted?",
        rationale: "Encryption is the last line of defense if access controls fail.",
        example: "Please answer 21a and 21b."
    },
    {
        id: "21a",
        section: "Data Protection",
        question: "Data in transit protected using TLS 1.2 or above?",
        rationale: "Protects data from interception (man-in-the-middle) while moving over the network.",
        example: "Yes, TLS 1.3 is enforced on the load balancer."
    },
    {
        id: "21b",
        section: "Data Protection",
        question: "Data at rest encrypted using AES-256 or equivalent?",
        rationale: "Protects data stored on disk from physical theft or unauthorized snapshots.",
        example: "Yes, EBS volumes and S3 buckets encrypted with AES-256."
    },
    {
        id: "22",
        section: "Data Protection",
        question: "Is the encryption key managed by the Cloud Service Provider (e.g. AWS or Azure)?",
        rationale: "Understanding key management (Customer Managed vs. Provider Managed) impacts data sovereignty.",
        example: "Yes, using AWS KMS (Provider Managed)."
    },
    {
        id: "23",
        section: "Data Protection",
        question: "Does the encryption key comply with PayNet's Cryptography and Key Management Standard?",
        rationale: "Keys must be strong enough and rotated frequently to be effective.",
        example: "Yes, keys are rotated annually."
    },
    {
        id: "24",
        section: "Data Protection",
        question: "Is access to sensitive data granted according to the user access matrix?",
        rationale: "Least privilege principle: users should only access data they need for their role.",
        example: "Yes, RBAC is implemented based on the approved matrix."
    },
    {
        id: "25",
        section: "Data Protection",
        question: "Is access to sensitive data logged and monitored?",
        rationale: "Detecting unauthorized access attempts to sensitive data is critical.",
        example: "Yes, CloudTrail logs all S3 object access."
    },
    {
        id: "26",
        section: "Data Protection",
        question: "Is sensitive data backed up?",
        rationale: "Backups ensure data availability in case of corruption or ransomware.",
        example: "Yes, daily snapshots retained for 30 days."
    },
    {
        id: "27",
        section: "Data Protection",
        question: "Is backed-up sensitive data protected according to defined security controls?",
        rationale: "Backups are a goldmine for attackers and must be protected just as strictly as live data.",
        example: "Yes, backups are encrypted and access is restricted."
    },
    {
        id: "28",
        section: "Data Protection",
        question: "Are data protection controls attested (e.g. SOC2 report, compliance to security standards)?",
        rationale: "Third-party attestation provides assurance that the cloud provider's controls are actually working.",
        example: "Yes, AWS SOC2 Type II report is available."
    }
];
