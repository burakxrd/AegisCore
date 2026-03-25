// ─── CTF Service Checklists ──────────────────────────────────────
// Comprehensive, CTF-oriented attack checklists for common services.
// Commands use $RHOST and $LHOST as placeholders (replaced at render time).

export interface ChecklistEntry {
  label: string;
  description: string;
  commands?: string[];
}

export interface ServiceProfile {
  summary: string;
  checklist: ChecklistEntry[];
}

// ─── Knowledge Base ──────────────────────────────────────────────
import { SERVICE_DB } from './ctf-service-db';

// ─── Service name normalization ──────────────────────────────────
const SERVICE_ALIASES: Record<string, string> = {
  'ssh':            'ssh',
  'openssh':        'ssh',
  'http':           'http',
  'http-proxy':     'http',
  'http-alt':       'http',
  'nginx':          'http',
  'apache':         'http',
  'httpd':          'http',
  'lighttpd':       'http',
  'https':          'https',
  'ssl/http':       'https',
  'ssl/https':      'https',
  'ftp':            'ftp',
  'vsftpd':         'ftp',
  'proftpd':        'ftp',
  'microsoft-ds':   'smb',
  'netbios-ssn':    'smb',
  'smb':            'smb',
  'samba':          'smb',
  'mysql':          'mysql',
  'mariadb':        'mysql',
  'postgresql':     'postgresql',
  'postgres':       'postgresql',
  'redis':          'redis',
  'domain':         'dns',
  'dns':            'dns',
  'smtp':           'smtp',
  'smtps':          'smtp',
  'ms-wbt-server':  'rdp',
  'rdp':            'rdp',
  'telnet':         'telnet',
  'vnc':            'vnc',
  'vnc-http':       'vnc',
  'ldap':           'ldap',
  'ldaps':          'ldap',
  'nfs':            'nfs',
  'nfs_acl':        'nfs',
  'kerberos':       'kerberos',
  'kerberos-sec':   'kerberos',
};

/**
 * Resolve a raw Nmap service string to a ServiceProfile.
 * Falls back to a generic profile if the service is unknown.
 */
export function getServiceProfile(rawService: string): ServiceProfile {
  const key = rawService.trim().toLowerCase().split(/\s/)[0];
  const canonical = SERVICE_ALIASES[key];
  if (canonical && SERVICE_DB[canonical]) return SERVICE_DB[canonical];

  // Try direct key
  if (SERVICE_DB[key]) return SERVICE_DB[key];

  // Generic fallback
  return {
    summary: `Service "${rawService}" detected. Manual investigation is recommended.`,
    checklist: [
      {
        label: 'Version & Exploit Search',
        description: 'Determine the service version and search for known vulnerabilities.',
        commands: [`searchsploit ${rawService}`, `nmap -sV -sC -p <port> $RHOST`],
      },
      {
        label: 'Banner Grabbing',
        description: 'Connect to the service to grab banner information.',
        commands: [`nc -vn $RHOST <port>`],
      },
      {
        label: 'Default Credentials',
        description: 'Try logging in with default credentials.',
      },
    ],
  };
}

// Port-based lookup (when service name is not enough)
export const PORT_HINTS: Record<number, string> = {
  21: 'ftp',
  22: 'ssh',
  23: 'telnet',
  25: 'smtp',
  53: 'dns',
  80: 'http',
  88: 'kerberos',
  110: 'pop3',
  111: 'nfs',
  135: 'smb',
  139: 'smb',
  143: 'imap',
  389: 'ldap',
  443: 'https',
  445: 'smb',
  636: 'ldap',
  993: 'imap',
  995: 'pop3',
  2049: 'nfs',
  3306: 'mysql',
  3389: 'rdp',
  5432: 'postgresql',
  5900: 'vnc',
  6379: 'redis',
  8080: 'http',
  8443: 'https',
  8888: 'http',
  9090: 'http',
  27017: 'mongodb',
};
