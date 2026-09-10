export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type DiscoverySource = 'Certificate Transparency' | 'DNS Wordlist' | 'Reverse DNS' | 'Simulated Assessment';

export type SubdomainStatus = 'RESOLVED' | 'NXDOMAIN' | 'DANGLING_CNAME' | 'TIMEOUT';

export interface SubdomainRecord {
  id: string;
  subdomain: string;
  domain: string;
  ips: string[];
  cnames: string[];
  txtRecords?: string[];
  status: SubdomainStatus;
  riskLevel: RiskLevel;
  source: DiscoverySource;
  responseTimeMs?: number;
  identifiedService?: string;
  riskReasons: string[];
  remediation?: string;
  firstSeen?: string;
  checkedAt: string;
}

export interface EnumerationSummary {
  targetDomain: string;
  scanTime: string;
  durationMs: number;
  totalFound: number;
  resolvedCount: number;
  unresolvedCount: number;
  danglingCnameCount: number;
  highRiskCount: number;
  wildcardDnsDetected: boolean;
  wildcardIp?: string;
  methodUsed: 'Hybrid (CT + Wordlist)' | 'Passive CT Logs' | 'Wordlist Permutation' | 'Demonstration Suite';
}

export interface ScanOptions {
  includeWordlist: boolean;
  includeCertTransparency: boolean;
  checkDanglingCname: boolean;
  checkWildcard: boolean;
  concurrencyLimit: number;
}
