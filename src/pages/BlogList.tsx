import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight, Calendar, Tag, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';

interface BlogEntry {
    slug: string;
    title: string;
    summary: string;
    date: string;
    category: string;
    threatLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
}

const threatLevelConfig: Record<string, { color: string; border: string; bg: string }> = {
    Critical: { color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
    High: { color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10' },
    Medium: { color: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10' },
    Low: { color: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10' },
    Info: { color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
};

export default function BlogList() {
    const [posts, setPosts] = useState<BlogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/blog/blog-index.json')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load blog index');
                return res.json();
            })
            .then((data: BlogEntry[]) => {
                const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setPosts(sorted);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Intelligence Index Fetch Error:", err);
                setError(true);
                setLoading(false);
      });
    }, []);

    return (
        <div className="space-y-8 w-full max-w-6xl mx-auto animate-in fade-in">

            {/* --- Header --- */}
            <div className="mb-10 w-full text-left">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                    Intelligence <span className="text-cyan-500">Reports</span>
                </h2>
                <p className="text-slate-400 font-mono text-sm">
                    Classified field reports, adversary simulations, and security research documentation.
                </p>
            </div>

            {/* --- Loading State --- */}
            {loading && (
                <div className="flex items-center justify-center gap-3 py-20 text-cyan-500 font-mono">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Decrypting intelligence archive...
                </div>
            )}

            {/* --- Error State --- */}
            {error && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 text-center">
                    <AlertTriangle className="w-8 h-8 text-red-500/60 mx-auto mb-3" />
                    <p className="text-red-400 font-mono text-sm">SIGNAL LOST — Failed to retrieve intelligence index.</p>
                </div>
            )}

            {/* --- Empty State --- */}
            {!loading && !error && posts.length === 0 && (
                <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-12 text-center">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 font-mono text-sm">No intelligence reports available at this clearance level.</p>
                </div>
            )}

            {/* --- Blog Cards Grid --- */}
            {!loading && !error && posts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post) => {
                        const threat = threatLevelConfig[post.threatLevel] || threatLevelConfig.Info;
                        return (
                            <Link
                                key={post.slug}
                                to={`/blog/${post.slug}`}
                                className="group bg-slate-900/40 border border-slate-800/50 p-8 rounded-3xl hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer block relative overflow-hidden"
                            >
                                {/* Background icon effect */}
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                                    <FileText className="w-32 h-32" />
                                </div>

                                <div className="relative z-10">
                                    {/* Top bar: category + threat level */}
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-500">
                                            <Tag className="w-3.5 h-3.5" />
                                            {post.category}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border ${threat.color} ${threat.border} ${threat.bg}`}>
                                            {post.threatLevel}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2 leading-snug">
                                        {post.title}
                                        <ChevronRight className="w-5 h-5 text-cyan-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                                    </h3>

                                    {/* Summary */}
                                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                                        {post.summary}
                                    </p>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {post.date}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* --- Footer Disclaimer --- */}
            <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-center gap-3">
                <ShieldAlert className="w-5 h-5 text-blue-500/50" />
                <p className="text-[10px] text-blue-400/60 font-mono uppercase tracking-widest text-center">
                    All reports are for educational and defensive research purposes only.
                </p>
            </div>
        </div>
    );
}
