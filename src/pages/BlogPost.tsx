import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Terminal, ChevronRight, Network } from 'lucide-react';
import { SystemAlert } from '../components/SystemAlert';
import { getBlogIndex } from '../data/blogService';
import { Helmet } from 'react-helmet-async';
import { LangLink } from '../components/layout/LangLink';

export default function BlogPost() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('Cybersecurity intelligence report — AEGIS CORE.');

  useEffect(() => {
    getBlogIndex()
      .then((data) => {
        const post = data.find((p: any) => p.slug === slug);
        if (post?.summary) setSummary(post.summary);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();

    // Defense-in-depth: slug doğrulama — path traversal önlemi
    const SAFE_SLUG = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
    if (!slug || !SAFE_SLUG.test(slug)) {
      setContent('# 400 - INVALID REQUEST\n> Invalid document identifier.');
      setLoading(false);
      return;
    }

    fetch(`/blog/${slug}.md`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Document not found');
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
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

      <Helmet>
        <title>{slug?.replace(/-/g, ' ').toUpperCase()} | AEGIS CORE</title>
        <meta name="description" content={summary} />
        <link rel="canonical" href={`https://aegis.net.tr/blog/${slug}`} />
      </Helmet>

      <div className="flex items-center gap-2 text-sm font-mono tracking-wider text-slate-400 mb-6 uppercase">
        <LangLink to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-2">
          <Network className="w-4 h-4" /> AEGIS CORE
        </LangLink>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <LangLink to="/blog" className="text-slate-400 hover:text-cyan-400 transition-colors">Intelligence Docs</LangLink>
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

      <SystemAlert type="info" message="Information provided for educational and defensive purposes only." />
    </div>
  );
}