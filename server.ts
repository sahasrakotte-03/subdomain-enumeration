import express from 'express';
import path from 'path';
import dns from 'dns';
import { createServer as createViteServer } from 'vite';

const dnsPromises = dns.promises;

// Set custom DNS servers if needed, or use system default
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const PORT = 3000;

app.use(express.json());

// List of common wordlist entries for active enumeration
const WORDLIST = [
  'www', 'mail', 'remote', 'blog', 'webmail', 'server',
  'ns1', 'ns2', 'smtp', 'secure', 'vpn', 'api', 'dev',
  'staging', 'test', 'portal', 'admin', 'auth', 'login',
  'app', 'docs', 'status', 'cdn', 'beta', 'git', 'gitlab',
  'jenkins', 'k8s', 'grafana', 's3', 'db', 'internal',
  'corp', 'support', 'shop', 'dashboard', 'monitor', 'metrics'
];

const TAKEOVER_TARGETS = [
  { service: 'Amazon AWS S3 Bucket', pattern: /\.s3\.amazonaws\.com$/i, risk: 'CRITICAL' },
  { service: 'GitHub Pages', pattern: /\.github\.io$/i, risk: 'CRITICAL' },
  { service: 'Heroku Application', pattern: /\.herokuapp\.com$/i, risk: 'CRITICAL' },
  { service: 'Microsoft Azure WebApp', pattern: /\.azurewebsites\.net$/i, risk: 'CRITICAL' },
  { service: 'Azure Traffic Manager', pattern: /\.trafficmanager\.net$/i, risk: 'HIGH' },
  { service: 'Ghost CMS Platform', pattern: /\.ghost\.io$/i, risk: 'HIGH' },
  { service: 'Pantheon Hosting', pattern: /\.pantheonsite\.io$/i, risk: 'HIGH' },
  { service: 'Readme Documentation', pattern: /\.readme\.io$/i, risk: 'HIGH' },
  { service: 'Surge Static Web', pattern: /\.surge\.sh$/i, risk: 'HIGH' },
  { service: 'Shopify Storefront', pattern: /\.myshopify\.com$/i, risk: 'MEDIUM' },
  { service: 'Fastly CDN', pattern: /\.fastly\.net$/i, risk: 'LOW' },
  { service: 'Cloudflare', pattern: /\.cloudflare\.net$/i, risk: 'LOW' },
];

function sanitizeDomain(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.split('/')[0];
  cleaned = cleaned.split(':')[0];
  cleaned = cleaned.replace(/^\.+|\.+$/g, '');
  return cleaned;
}

function isValidDomain(domain: string): boolean {
  if (!domain || domain.length > 253) return false;
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
  return domainRegex.test(domain);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Real-time enumeration endpoint
app.post('/api/enumerate', async (req, res) => {
  const startTime = Date.now();
  const rawDomain = req.body?.domain;
  const options = req.body?.options || {
    includeWordlist: true,
    includeCertTransparency: true,
    checkDanglingCname: true,
    checkWildcard: true,
  };

  const domain = sanitizeDomain(rawDomain);

  if (!domain || !isValidDomain(domain)) {
    return res.status(400).json({
      error: 'Invalid domain format. Please provide a valid fully qualified domain name (e.g., example.com, owasp.org).',
      code: 'INVALID_DOMAIN',
    });
  }

  // Handle special educational demo domain locally if requested
  if (domain === 'demo-corp.internal' || domain === 'vuln-demo.corp') {
    const { DEMO_DATASETS } = await import('./src/data/mockData.ts');
    const demoItems = DEMO_DATASETS['demo-corp.internal'] || [];
    return res.json({
      summary: {
        targetDomain: domain,
        scanTime: new Date().toISOString(),
        durationMs: 480,
        totalFound: demoItems.length,
        resolvedCount: demoItems.filter(i => i.status === 'RESOLVED').length,
        unresolvedCount: demoItems.filter(i => i.status === 'NXDOMAIN').length,
        danglingCnameCount: demoItems.filter(i => i.status === 'DANGLING_CNAME').length,
        highRiskCount: demoItems.filter(i => i.riskLevel === 'CRITICAL' || i.riskLevel === 'HIGH').length,
        wildcardDnsDetected: false,
        methodUsed: 'Demonstration Suite',
      },
      records: demoItems,
      warnings: ['Loaded simulated authorized security assessment scenario with pre-configured vulnerability indicators.'],
    });
  }

  try {
    const warnings: string[] = [];
    const discoveredCandidates = new Map<string, { source: string; firstSeen?: string }>();
    
    // Always include apex domain
    discoveredCandidates.set(domain, { source: 'Apex Target' });

    // Step 1: Wildcard DNS Detection
    let wildcardDnsDetected = false;
    let wildcardIp: string | undefined;

    if (options.checkWildcard) {
      try {
        const testRandomSub = `probe-wc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}.${domain}`;
        const wildcardResolutions = await dnsPromises.resolve4(testRandomSub);
        if (wildcardResolutions && wildcardResolutions.length > 0) {
          wildcardDnsDetected = true;
          wildcardIp = wildcardResolutions[0];
          warnings.push(`Wildcard DNS detected for *.${domain} resolving to ${wildcardIp}. Security assessments must account for synthetic responses.`);
        }
      } catch {
        // Expected if wildcard is not configured (NXDOMAIN)
        wildcardDnsDetected = false;
      }
    }

    // Step 2: Query Certificate Transparency logs via crt.sh
    if (options.includeCertTransparency) {
      try {
        const ctUrl = `https://crt.sh/?q=%.${encodeURIComponent(domain)}&output=json`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000);

        const response = await fetch(ctUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'SecurityAssessment-OSINT-Prototype/1.0',
            'Accept': 'application/json',
          },
        });
        clearTimeout(timeout);

        if (response.ok) {
          const rawCerts: any = await response.json();
          if (Array.isArray(rawCerts)) {
            for (const item of rawCerts) {
              const nameValue = item.name_value;
              if (typeof nameValue === 'string') {
                const names = nameValue.split('\n');
                for (let n of names) {
                  n = n.trim().toLowerCase();
                  if (n.startsWith('*.')) {
                    n = n.slice(2);
                  }
                  if (n.endsWith(`.${domain}`) || n === domain) {
                    if (isValidDomain(n) && !discoveredCandidates.has(n)) {
                      discoveredCandidates.set(n, {
                        source: 'Certificate Transparency',
                        firstSeen: item.entry_timestamp || undefined,
                      });
                    }
                  }
                }
              }
            }
          }
        } else {
          warnings.push(`Certificate Transparency log provider returned status HTTP ${response.status}. Active DNS enumeration continued.`);
        }
      } catch (err: any) {
        warnings.push(`Certificate Transparency query timed out or had network limits (${err.message || 'offline'}). Active DNS enumeration continued.`);
      }
    }

    // Step 3: DNS Wordlist Permutations
    if (options.includeWordlist) {
      for (const word of WORDLIST) {
        const sub = `${word}.${domain}`;
        if (!discoveredCandidates.has(sub)) {
          discoveredCandidates.set(sub, { source: 'DNS Wordlist' });
        }
      }
    }

    // Step 4: Resolve DNS records for all candidates in batches
    const candidateList = Array.from(discoveredCandidates.entries());
    const records: any[] = [];
    const BATCH_SIZE = 15;

    for (let i = 0; i < candidateList.length; i += BATCH_SIZE) {
      const batch = candidateList.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async ([subdomain, meta], index) => {
        const checkStart = Date.now();
        let ips: string[] = [];
        let cnames: string[] = [];
        let status: 'RESOLVED' | 'NXDOMAIN' | 'DANGLING_CNAME' | 'TIMEOUT' = 'NXDOMAIN';
        let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO' = 'INFO';
        const riskReasons: string[] = [];
        let remediation: string | undefined;
        let identifiedService: string | undefined;

        // Try CNAME resolution first
        try {
          const cnameRecords = await dnsPromises.resolveCname(subdomain);
          if (cnameRecords && cnameRecords.length > 0) {
            cnames = cnameRecords;
          }
        } catch {
          // No CNAME or resolution failed
        }

        // Try A record resolution
        try {
          const aRecords = await dnsPromises.resolve4(subdomain);
          if (aRecords && aRecords.length > 0) {
            ips = aRecords;
            status = 'RESOLVED';
          }
        } catch (dnsErr: any) {
          if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'NODATA') {
            status = 'NXDOMAIN';
          } else if (dnsErr.code === 'ETIMEOUT') {
            status = 'TIMEOUT';
          }
        }

        const responseTimeMs = Date.now() - checkStart;

        // Analyze CNAME Takeover risk
        if (cnames.length > 0) {
          const primaryCname = cnames[0].toLowerCase();
          for (const target of TAKEOVER_TARGETS) {
            if (target.pattern.test(primaryCname)) {
              identifiedService = target.service;
              // If CNAME exists but subdomain or CNAME target doesn't resolve to IP or is NXDOMAIN
              if (status === 'NXDOMAIN' || ips.length === 0) {
                // Check if CNAME target itself resolves
                try {
                  const targetIps = await dnsPromises.resolve4(primaryCname);
                  if (!targetIps || targetIps.length === 0) {
                    status = 'DANGLING_CNAME';
                    riskLevel = 'CRITICAL';
                    riskReasons.push(`Dangling CNAME: Points to ${primaryCname} (${target.service}) which fails to resolve.`);
                    riskReasons.push('Subdomain Takeover Vulnerability: An adversary could register the unclaimed cloud resource to seize control.');
                    remediation = `Remove the orphaned CNAME record from your DNS zone, or verify and register the target ${target.service} resource.`;
                  }
                } catch (cnameResolveErr: any) {
                  status = 'DANGLING_CNAME';
                  riskLevel = 'CRITICAL';
                  riskReasons.push(`Dangling CNAME: Target ${primaryCname} returned ${cnameResolveErr.code || 'NXDOMAIN'}.`);
                  riskReasons.push(`Subdomain Takeover Vulnerability: The pointer to ${target.service} is orphaned.`);
                  remediation = `Remove the stale DNS record pointing to ${primaryCname}.`;
                }
              } else {
                riskLevel = 'LOW';
                riskReasons.push(`Utilizes third-party service: ${target.service} (${primaryCname}).`);
              }
              break;
            }
          }
        }

        // Analyze sensitive keywords in subdomain name
        const lowerSub = subdomain.toLowerCase();
        if (status === 'RESOLVED') {
          if (/admin|portal|login|auth|sso|keycloak|vpn|corp|internal/.test(lowerSub)) {
            if (riskLevel !== 'CRITICAL') {
              riskLevel = 'HIGH';
              riskReasons.push('Administrative/Internal Authentication portal discovered on a publicly resolved subdomain.');
              remediation = 'Enforce Multi-Factor Authentication (MFA), IP allowlisting, or route through a Zero-Trust Network Access (ZTNA) gateway.';
            }
          } else if (/dev|staging|test|qa|uat|sandbox|beta|experiment/.test(lowerSub)) {
            if (riskLevel !== 'CRITICAL') {
              riskLevel = 'HIGH';
              riskReasons.push('Pre-production/development environment exposed to public DNS queries.');
              remediation = 'Segregate non-production assets; protect with VPN or IP whitelisting.';
            }
          } else if (/jenkins|k8s|kubernetes|grafana|git|gitlab|prometheus|docker/.test(lowerSub)) {
            if (riskLevel !== 'CRITICAL') {
              riskLevel = 'HIGH';
              riskReasons.push('Infrastructure automation or monitoring dashboard exposed.');
              remediation = 'Ensure dashboard endpoints are not publicly accessible and require corporate SSO.';
            }
          } else if (/api|gateway|v1|v2|graphql|rest/.test(lowerSub)) {
            if (riskLevel === 'INFO') {
              riskLevel = 'LOW';
              riskReasons.push('Public API endpoint discovered. Confirm rate limiting and OpenAPI specification visibility.');
            }
          }
        }

        // If no specific risk detected and resolved
        if (status === 'RESOLVED' && riskReasons.length === 0) {
          riskLevel = 'LOW';
          riskReasons.push('Standard active service resolution.');
        } else if (status === 'NXDOMAIN' && riskReasons.length === 0) {
          riskLevel = 'INFO';
          riskReasons.push('Inactive / historical record found in Certificate Transparency logs.');
        }

        // Ignore wildcard false positives if candidate was only from wordlist and resolves to the wildcard IP
        if (wildcardDnsDetected && wildcardIp && ips.includes(wildcardIp) && meta.source === 'DNS Wordlist') {
          return null;
        }

        // If candidate was from wordlist and didn't resolve, omit to avoid cluttering results
        if (meta.source === 'DNS Wordlist' && status === 'NXDOMAIN') {
          return null;
        }

        return {
          id: `rec-${i + index}-${subdomain}`,
          subdomain,
          domain,
          ips,
          cnames,
          status,
          riskLevel,
          source: meta.source,
          responseTimeMs,
          identifiedService: identifiedService || (cnames.length > 0 ? cnames[0] : (ips.length > 0 ? 'Direct IPv4 Host' : 'Unresolved')),
          riskReasons,
          remediation,
          firstSeen: meta.firstSeen,
          checkedAt: new Date().toISOString(),
        };
      });

      const batchResults = await Promise.all(batchPromises);
      for (const resItem of batchResults) {
        if (resItem) {
          records.push(resItem);
        }
      }
    }

    // Sort records: CRITICAL first, then HIGH, then MEDIUM, then LOW, then INFO
    const priorityWeight: Record<string, number> = {
      CRITICAL: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
      INFO: 1,
    };
    records.sort((a, b) => (priorityWeight[b.riskLevel] || 0) - (priorityWeight[a.riskLevel] || 0));

    const totalFound = records.length;
    const resolvedCount = records.filter(r => r.status === 'RESOLVED').length;
    const unresolvedCount = records.filter(r => r.status === 'NXDOMAIN').length;
    const danglingCnameCount = records.filter(r => r.status === 'DANGLING_CNAME').length;
    const highRiskCount = records.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH').length;

    const summary = {
      targetDomain: domain,
      scanTime: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      totalFound,
      resolvedCount,
      unresolvedCount,
      danglingCnameCount,
      highRiskCount,
      wildcardDnsDetected,
      wildcardIp,
      methodUsed: options.includeCertTransparency && options.includeWordlist ? 'Hybrid (CT + Wordlist)' : (options.includeCertTransparency ? 'Passive CT Logs' : 'Wordlist Permutation'),
    };

    return res.json({
      summary,
      records,
      warnings,
    });
  } catch (error: any) {
    console.error('Enumeration server error:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred during subdomain enumeration.',
      code: 'ENUMERATION_ERROR',
    });
  }
});

// Vite middleware / production serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Subdomain Enumeration server running on http://0.0.0.0:${PORT}`);
  });
}

start();
