import { SubdomainRecord, EnumerationSummary } from '../types';

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToCsv(records: SubdomainRecord[], summary: EnumerationSummary | null) {
  const headers = [
    'Subdomain',
    'Domain',
    'Status',
    'Risk Level',
    'IP Addresses',
    'CNAMEs',
    'Identified Service',
    'Discovery Source',
    'Response Time (ms)',
    'Risk Reasons',
    'Remediation Guidance',
    'Assessment Date',
  ];

  const escapeCsv = (val: string | number | undefined) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = records.map((rec) => [
    escapeCsv(rec.subdomain),
    escapeCsv(rec.domain),
    escapeCsv(rec.status),
    escapeCsv(rec.riskLevel),
    escapeCsv(rec.ips.join('; ')),
    escapeCsv(rec.cnames.join('; ')),
    escapeCsv(rec.identifiedService),
    escapeCsv(rec.source),
    escapeCsv(rec.responseTimeMs ?? 'N/A'),
    escapeCsv(rec.riskReasons.join(' | ')),
    escapeCsv(rec.remediation ?? 'N/A'),
    escapeCsv(rec.checkedAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const domainName = summary?.targetDomain || 'subdomain_assessment';
  downloadBlob(csvContent, `${domainName}_subdomain_inventory_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}

export function exportToJson(records: SubdomainRecord[], summary: EnumerationSummary | null) {
  const data = {
    metadata: {
      tool: 'Subdomain Enumeration Security Prototype',
      exportTimestamp: new Date().toISOString(),
      ethicalNotice: 'Generated for authorized security assessment and vulnerability remediation purposes.',
    },
    summary,
    records,
  };

  const domainName = summary?.targetDomain || 'subdomain_assessment';
  downloadBlob(JSON.stringify(data, null, 2), `${domainName}_enumeration_report_${Date.now()}.json`, 'application/json');
}

export function generateMarkdownReport(records: SubdomainRecord[], summary: EnumerationSummary | null): string {
  const target = summary?.targetDomain || 'Target Domain';
  const total = records.length;
  const criticals = records.filter((r) => r.riskLevel === 'CRITICAL');
  const highs = records.filter((r) => r.riskLevel === 'HIGH');
  const mediums = records.filter((r) => r.riskLevel === 'MEDIUM');
  const danglings = records.filter((r) => r.status === 'DANGLING_CNAME');

  return `# Security Assessment Report: Subdomain Enumeration
**Target Scope:** \`${target}\`  
**Assessment Date:** ${summary?.scanTime || new Date().toISOString()}  
**Methodology:** ${summary?.methodUsed || 'Passive CT Logs & DNS Wordlist Permutations'}  
**Assessment Type:** Authorized External Attack Surface Reconnaissance  

---

## 1. Executive Summary

During this authorized security assessment, reconnaissance was conducted against \`${target}\` to discover internet-facing subdomains, evaluate DNS configurations, and identify potential exposure vectors (such as dangling CNAME records and unprotected pre-production environments).

### Key Metrics
- **Total Subdomains Discovered:** ${total}
- **Active / Resolved Hosts:** ${summary?.resolvedCount ?? records.filter((r) => r.status === 'RESOLVED').length}
- **Critical Risk Items (Subdomain Takeover Candidates):** ${criticals.length}
- **High Risk Items (Exposed Staging / Admin Panels):** ${highs.length}
- **Medium Risk Items:** ${mediums.length}
- **Wildcard DNS:** ${summary?.wildcardDnsDetected ? `Enabled (Points to ${summary.wildcardIp})` : 'Disabled (NXDOMAIN enforced)'}

---

## 2. High-Severity & Takeover Findings

${
  danglings.length > 0
    ? danglings
        .map(
          (d, idx) => `### Finding ${idx + 1}: Dangling CNAME Takeover on \`${d.subdomain}\`
- **Risk Severity:** CRITICAL
- **CNAME Pointer:** \`${d.cnames.join(', ')}\`
- **Identified Service:** ${d.identifiedService || 'External SaaS / Cloud Bucket'}
- **Vulnerability Description:** The domain points to an external cloud resource via a CNAME record, but the destination service is unallocated or returning NXDOMAIN. An adversary could register the unclaimed cloud resource to seize control over this subdomain.
- **Recommended Remediation:** ${d.remediation || 'Remove the stale DNS record immediately from your DNS zone file.'}
`
        )
        .join('\n')
    : 'No dangling CNAME records or immediate subdomain takeover candidates were detected in the evaluated set.'
}

${
  highs.length > 0
    ? `### Exposed Administrative / Pre-Production Endpoints
The following hosts were resolved and match sensitive operational patterns:
${highs
  .map(
    (h) =>
      `- **\`${h.subdomain}\`** (${h.ips.join(', ') || 'CNAME: ' + h.cnames.join(', ')})
  - *Risk:* ${h.riskReasons.join('; ')}
  - *Remediation:* ${h.remediation || 'Restrict access via corporate VPN or Identity-Aware Proxy.'}`
  )
  .join('\n')}
`
    : ''
}

---

## 3. Inventory of Discovered Subdomains

| Subdomain | Status | Risk Level | IP Address(es) | CNAME Target | Source |
| :--- | :--- | :--- | :--- | :--- | :--- |
${records
  .map(
    (r) =>
      `| \`${r.subdomain}\` | ${r.status} | ${r.riskLevel} | ${r.ips.slice(0, 2).join(', ') || '-'} | ${r.cnames[0] || '-'} | ${r.source} |`
  )
  .join('\n')}

---

## 4. General Security Recommendations

1. **Continuous DNS Zone Auditing:** Regularly audit DNS records across all primary and secondary nameservers. Ensure retired cloud services (AWS S3, Azure, GitHub Pages, Heroku) have their CNAME pointers deleted promptly.
2. **Certificate Transparency (CT) Log Monitoring:** Set up automated alerts on Certificate Transparency log additions for your apex domains to detect rogue or shadow IT certificates immediately.
3. **Environment Isolation:** Move staging, QA, and internal administrative portals behind zero-trust network access (ZTNA) or corporate VPNs to eliminate exposure from passive OSINT.
4. **Wildcard DNS Prudence:** Limit wildcard (\`*\`) A/CNAME configurations to avoid inadvertently masking orphaned subdomains or routing malicious host header requests.

---
*Report generated strictly for authorized security assessment purposes.*
`;
}
