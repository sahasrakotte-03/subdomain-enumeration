import { SubdomainRecord, EnumerationSummary, ScanOptions } from '../types';
import { DEMO_DATASETS } from '../data/mockData';

export interface EnumerateResponse {
  summary: EnumerationSummary;
  records: SubdomainRecord[];
  warnings?: string[];
}

export async function performEnumeration(
  rawDomain: string,
  options: ScanOptions
): Promise<EnumerateResponse> {
  const domain = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .replace(/^\.+|\.+$/g, '');

  // Check if it's the demo domain
  if (domain === 'demo-corp.internal' || domain === 'vuln-demo.corp') {
    const demoItems = DEMO_DATASETS['demo-corp.internal'] || [];
    return {
      summary: {
        targetDomain: domain,
        scanTime: new Date().toISOString(),
        durationMs: 450,
        totalFound: demoItems.length,
        resolvedCount: demoItems.filter((i) => i.status === 'RESOLVED').length,
        unresolvedCount: demoItems.filter((i) => i.status === 'NXDOMAIN').length,
        danglingCnameCount: demoItems.filter((i) => i.status === 'DANGLING_CNAME').length,
        highRiskCount: demoItems.filter((i) => i.riskLevel === 'CRITICAL' || i.riskLevel === 'HIGH').length,
        wildcardDnsDetected: false,
        methodUsed: 'Demonstration Suite',
      },
      records: demoItems,
      warnings: ['Loaded simulated authorized assessment scenario containing realistic vulnerability signatures.'],
    };
  }

  // Attempt to call the local full-stack server endpoint
  try {
    const response = await fetch('/api/enumerate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain,
        options,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    // If local server endpoint failed, report informative error
    console.warn('Backend API request encountered an issue:', err);
    throw new Error(err.message || 'Unable to connect to enumeration service.');
  }
}
