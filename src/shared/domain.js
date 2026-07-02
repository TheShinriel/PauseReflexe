const COMMON_MULTI_PART_SUFFIXES = new Set([
  'co.uk',
  'org.uk',
  'gov.uk',
  'ac.uk',
  'com.au',
  'net.au',
  'org.au',
  'co.nz',
  'com.br',
  'com.cn',
  'co.jp',
]);

export function normalizeSiteDomain(input) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Unsupported URL');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Unsupported URL');
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const parts = hostname.split('.').filter(Boolean);

  if (parts.length <= 2) return hostname;

  const suffix = parts.slice(-2).join('.');
  if (COMMON_MULTI_PART_SUFFIXES.has(suffix) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }

  return parts.slice(-2).join('.');
}

export function isHttpUrl(input) {
  try {
    const url = new URL(input);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
