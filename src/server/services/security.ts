/**
 * SSRF Security & Network Isolation Guard
 * Protects crawler and verification requests from reaching local or private IP networks,
 * metadata endpoints, and non-HTTP protocols.
 */

import dns from 'dns/promises';
import { isIP } from 'net';

export interface IpValidationResult {
  isSafe: boolean;
  resolvedIp?: string;
  reason?: string;
}

// Blocked hostnames
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  'metadata.google.internal',
  'metadata',
  'instance-data',
  'kubernetes.default',
]);

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.home',
  '.corp',
  '.onion',
];

/**
 * Check if an IPv4 address is in a reserved/private/link-local/loopback range
 */
export function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true; // Malformed = reject
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-local & Cloud Metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0 && parts[2] === 0) return true;

  // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (Documentation/Test-Net)
  if (a === 192 && b === 0 && parts[2] === 2) return true;
  if (a === 198 && b === 51 && parts[2] === 100) return true;
  if (a === 203 && b === 0 && parts[2] === 113) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  // 255.255.255.255 (Broadcast)
  if (parts.every((p) => p === 255)) return true;

  return false;
}

/**
 * Check if an IPv6 address is in a loopback, unique local, or link-local range
 */
export function isPrivateOrReservedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 loopback
  if (normalized === '::1' || normalized === '::') return true;

  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.startsWith('::ffff:')) {
    const v4 = normalized.replace('::ffff:', '');
    if (isIP(v4) === 4) {
      return isPrivateOrReservedIpv4(v4);
    }
  }

  // fc00::/7 (Unique Local Address)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // fe80::/10 (Link-Local)
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true;
  }

  return false;
}

/**
 * Validates a hostname and resolves DNS safely
 * Prevents DNS rebinding and internal network scanning
 */
export async function validateSafeHost(hostname: string): Promise<IpValidationResult> {
  const host = hostname.toLowerCase().trim();

  // 1. Direct host blacklist
  if (BLOCKED_HOSTNAMES.has(host)) {
    return { isSafe: false, reason: `BLOCKED_HOSTNAME_${host}` };
  }

  // 2. Block internal suffixes
  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (host.endsWith(suffix)) {
      return { isSafe: false, reason: `BLOCKED_INTERNAL_DOMAIN_SUFFIX_${suffix}` };
    }
  }

  // 3. If hostname is directly an IP address
  const ipType = isIP(host);
  if (ipType === 4) {
    if (isPrivateOrReservedIpv4(host)) {
      return { isSafe: false, resolvedIp: host, reason: 'RESERVED_OR_PRIVATE_IPV4' };
    }
    return { isSafe: true, resolvedIp: host };
  } else if (ipType === 6) {
    if (isPrivateOrReservedIpv6(host)) {
      return { isSafe: false, resolvedIp: host, reason: 'RESERVED_OR_PRIVATE_IPV6' };
    }
    return { isSafe: true, resolvedIp: host };
  }

  // 4. DNS resolution check
  try {
    const addresses = await dns.lookup(host, { all: true });
    if (!addresses || addresses.length === 0) {
      return { isSafe: false, reason: 'DNS_RESOLUTION_EMPTY' };
    }

    // Check all resolved addresses
    for (const record of addresses) {
      if (record.family === 4) {
        if (isPrivateOrReservedIpv4(record.address)) {
          return {
            isSafe: false,
            resolvedIp: record.address,
            reason: `DNS_RESOLVED_TO_PRIVATE_IPV4_${record.address}`,
          };
        }
      } else if (record.family === 6) {
        if (isPrivateOrReservedIpv6(record.address)) {
          return {
            isSafe: false,
            resolvedIp: record.address,
            reason: `DNS_RESOLVED_TO_PRIVATE_IPV6_${record.address}`,
          };
        }
      }
    }

    return { isSafe: true, resolvedIp: addresses[0].address };
  } catch (err: unknown) {
    return {
      isSafe: false,
      reason: err instanceof Error ? `DNS_ERROR_${err.message}` : 'DNS_LOOKUP_FAILED',
    };
  }
}
