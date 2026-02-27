const dns = require('dns').promises;
const net = require('net');

/**
 * Checks if an IP address is internal/private
 * @param {string} ip 
 * @returns {boolean}
 */
const isInternalIP = (ip) => {
  if (!ip) return false;

  // IPv4 Private Ranges
  // 10.0.0.0/8
  // 172.16.0.0/12
  // 192.168.0.0/16
  // 127.0.0.0/8 (Loopback)
  // 169.254.0.0/16 (Link-local)
  
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    
    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    
    return false;
  }

  if (net.isIPv6(ip)) {
    // IPv6 Private/Local Ranges
    // ::1/128 (Loopback)
    // fc00::/7 (Unique Local Address)
    // fe80::/10 (Link-local)
    
    if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return true;
    if (ip.toLowerCase().startsWith('fe8') || 
        ip.toLowerCase().startsWith('fe9') || 
        ip.toLowerCase().startsWith('fea') || 
        ip.toLowerCase().startsWith('feb')) return true;
    if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) return true;
    
    return false;
  }

  return false;
};

/**
 * Validates a URL to prevent SSRF
 * @param {string} urlString 
 * @returns {Promise<boolean>}
 */
const isSafeUrl = async (urlString) => {
  try {
    const url = new URL(urlString);
    
    // Only allow http and https
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    // Block if hostname is missing
    if (!url.hostname) return false;

    // Check if hostname is an IP
    if (net.isIP(url.hostname)) {
      return !isInternalIP(url.hostname);
    }

    // Resolve hostname to IP to check for DNS rebinding/internal IPs
    try {
      const addresses = await dns.resolve(url.hostname);
      for (const addr of addresses) {
        if (isInternalIP(addr)) return false;
      }
    } catch (err) {
      // If we can't resolve it, it's either invalid or we shouldn't trust it
      // but some internal hosts might not resolve on public DNS.
      // However, for SSRF protection, if we can't verify it's safe, we fail closed.
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  isInternalIP,
  isSafeUrl
};
