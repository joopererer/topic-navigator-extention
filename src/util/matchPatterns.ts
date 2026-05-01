/** Derive hostnames from storage lines (URL or match pattern) for Onyx adapter. */
export function hostsFromMatchPatterns(lines: string[]): Set<string> {
  const hosts = new Set<string>();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const h = patternLineToHostname(line);
    if (h) hosts.add(h);
  }
  return hosts;
}

function patternLineToHostname(line: string): string | null {
  try {
    const withProto = line.includes('://') ? line : `https://${line}`;
    const stripped = withProto.replace(/\*+\/?$/, '').replace(/\*+/g, '');
    const u = new URL(stripped.endsWith('/') ? stripped : `${stripped}/`);
    return u.hostname || null;
  } catch {
    return null;
  }
}

/** Broad origin permission requests (one per host, any path). */
export function patternsToOriginPermissions(patterns: string[]): string[] {
  const origins = new Set<string>();
  for (const line of patterns) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    try {
      const withProto = t.includes('://') ? t : `https://${t}`;
      const base = withProto.replace(/\*.*$/, '');
      const u = new URL(base.endsWith('/') ? base : `${base}/`);
      const scheme = u.protocol === 'http:' ? 'http' : 'https';
      origins.add(`${scheme}://${u.hostname}/*`);
    } catch {
      continue;
    }
  }
  return [...origins];
}
