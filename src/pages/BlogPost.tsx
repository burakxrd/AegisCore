import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Terminal, ChevronRight, ShieldAlert, Network } from 'lucide-react';

export default function BlogPost() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/blog/${slug}.md`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Document not found');
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
        document.title = `${slug?.replace(/-/g, ' ').toUpperCase()} | Aegis Core`;
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          return; 
        }
        setContent('# 404 - CLASSIFIED\n> The requested intelligence report does not exist or requires higher clearance.');
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [slug]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">

      <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-slate-400 mb-6 uppercase">
        <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
          <Network className="w-4 h-4" /> AEGIS CORE
        </Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <Link to="/blog" className="text-slate-400 hover:text-cyan-400 transition-colors">Intelligence Docs</Link>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-cyan-500">{slug}</span>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 md:p-12 backdrop-blur-md">
        {loading ? (
          <div className="flex items-center gap-3 text-cyan-500 font-mono animate-pulse">
            <Terminal className="w-5 h-5" /> Decrypting file...
          </div>
        ) : (
          <div className="prose prose-invert prose-cyan max-w-none font-mono text-slate-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-center gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-500/50" />
        <p className="text-[10px] text-blue-400/60 font-mono uppercase tracking-widest text-center">
          Information provided for educational and defensive purposes only.
        </p>
      </div>
    </div>
  );
}