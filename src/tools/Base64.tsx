import React, { useState, useEffect, useRef } from 'react';
import { Terminal, ArrowRightLeft, AlertCircle, FileUp, Download } from 'lucide-react';
import { CopyButton } from '../components/CopyButtons';
import { ToolBreadcrumb, ToolPageHeader } from '../components/ToolHeader';
import { DragOverlay, SecurityNotice } from '../components/ToolWidgets';
import { Helmet } from 'react-helmet-async';
import { LangLink } from '../components/layout/LangLink';
import { useTranslation } from '../i18n';

export default function Base64Encoder() {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'ENCODE' | 'DECODE'>('ENCODE');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileAccepted = (newFile: File) => {
    setFile(newFile);
    setInput('');
    setError(null);
  };

  useEffect(() => {
    if (file) return;

    setError(null);
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'ENCODE') {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
      }
    } catch (err) {
      setError(mode === 'DECODE' ? t('base64.errors.invalidBase64') : t('base64.errors.encodingError'));
      setOutput('');
    }
  }, [input, mode, file]);

  useEffect(() => {
    if (!file || mode !== 'ENCODE') return;
    let cancelled = false;

    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled) return;
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      setOutput(base64);
      setError(null);
    };
    reader.onerror = () => {
      if (cancelled) return;
      setError(t('base64.errors.fileReadError'));
      setOutput('');
    };
    reader.readAsDataURL(file);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [file, mode]);

  useEffect(() => {
    if (!file || mode !== 'DECODE') return;
    let cancelled = false;

    const reader = new FileReader();
    reader.onload = () => {
      if (cancelled) return;
      const text = reader.result as string;
      setInput(text.trim());
      setFile(null);
    };
    reader.onerror = () => {
      if (cancelled) return;
      setError(t('base64.errors.fileReadError'));
    };
    reader.readAsText(file);

    return () => {
      cancelled = true;
      reader.abort();
    };
  }, [file, mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'ENCODE' ? 'DECODE' : 'ENCODE');
    if (!file) {
      setInput(output);
    } else {
      setFile(null);
      setInput('');
      setOutput('');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileAccepted(selectedFile);
    }
    // Kullanıcı vazgeçerse (cancel) hiçbir şey olmaz — mevcut dosya kalır
  };

  const handleClearFile = () => {
    setFile(null);
    setOutput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Sadece gerçek leave'de (child element'e geçişte değil)
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileAccepted(droppedFile);
    }
  };

  // Base64'ü dosya olarak indir
  const handleDownloadDecoded = () => {
    if (!input.trim() || mode !== 'DECODE') return;

    try {
      const binaryString = atob(input.trim());
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded_file';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError(t('base64.errors.cannotDecode'));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      <Helmet>
        <title>{t('base64.pageTitle')}</title>
        <meta name="description" content={t('base64.metaDescription')} />
        <link rel="canonical" href="https://aegis.net.tr/tools/base64-codec" />
      </Helmet>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <ToolBreadcrumb toolName={t('base64.breadcrumb')} />
          <ToolPageHeader icon={Terminal} title={t('base64.title')} highlight={t('base64.highlight')} description={t('base64.description')} />
          <LangLink to="/blog/base64-encoding-explained" className="text-[11px] font-mono text-cyan-500/60 hover:text-cyan-400 transition-colors mt-1 inline-block">{t('base64.learnLink')}</LangLink>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-700/50 p-1 rounded-xl w-fit">
            <button
              onClick={() => { setMode('ENCODE'); setFile(null); setInput(''); setOutput(''); setError(null); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === 'ENCODE' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-white'
                }`}
            >
              Encode
            </button>
            <button
              onClick={() => { setMode('DECODE'); setFile(null); setInput(''); setOutput(''); setError(null); }}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${mode === 'DECODE' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-white'
                }`}
            >
              Decode
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch relative">

        {/* INPUT */}
        <div
          className={`bg-slate-900/40 border rounded-3xl flex flex-col overflow-hidden backdrop-blur-md relative transition-colors ${isDragging ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-800/50'
            }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <DragOverlay visible={isDragging} />

          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {mode === 'ENCODE' ? t('base64.inputLabels.encodePlain') : t('base64.inputLabels.decodeBase64')}
            </span>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-[10px] font-bold bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg hover:bg-cyan-900 hover:text-cyan-400 transition-colors border border-slate-700 hover:border-cyan-700"
            >
              <FileUp className="w-3 h-3" /> {t('common.selectFile')}
            </button>
          </div>

          {/* Dosya yüklüyse dosya bilgisini göster */}
          {file ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/30 m-6 rounded-2xl bg-cyan-950/20 min-h-50">
              <FileUp className="w-12 h-12 text-cyan-500 mb-4 opacity-80" />
              <p className="text-white font-mono font-bold text-center break-all">{file.name}</p>
              <p className="text-slate-400 font-mono text-xs mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button
                onClick={handleClearFile}
                className="mt-4 text-xs text-red-400 hover:text-red-300 font-mono"
              >
                Remove File
              </button>
            </div>
          ) : (
            <div className="flex-1 relative min-h-50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'ENCODE'
                  ? t('base64.placeholders.encode')
                  : t('base64.placeholders.decode')
                }
                className="w-full h-full bg-transparent border-none p-6 text-sm font-mono text-slate-300 focus:outline-none focus:ring-0 resize-none min-h-75"
              />
            </div>
          )}
        </div>

        {/* SWAP BUTONU */}
        <button
          onClick={toggleMode}
          className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 border-4 border-slate-950 rounded-full items-center justify-center text-slate-400 hover:text-cyan-400 hover:scale-110 transition-all z-10"
          title={t('base64.swap')}
        >
          <ArrowRightLeft className="w-5 h-5" />
        </button>

        {/* OUTPUT */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl flex flex-col overflow-hidden backdrop-blur-md relative">
          <div className="px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
              {mode === 'ENCODE' ? t('base64.outputLabels.encodeResult') : t('base64.outputLabels.decodeResult')}
            </span>
            <div className="flex items-center gap-3">
              {/* Decode modunda dosya olarak indir */}
              {mode === 'DECODE' && input.trim() && (
                <button
                  onClick={handleDownloadDecoded}
                  className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> {t('common.saveAsFile')}
                </button>
              )}
              <CopyButton text={output} />
            </div>
          </div>

          <div className="flex-1 p-6 relative min-h-50">
            {error ? (
              <div className="flex items-center gap-2 text-red-400 font-mono text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            ) : (
              <textarea
                readOnly
                value={output}
                placeholder={t('base64.resultPlaceholder')}
                className="w-full h-full bg-transparent border-none text-sm font-mono text-cyan-400 focus:outline-none focus:ring-0 resize-none"
              />
            )}
          </div>
        </div>

      </div>

      {/* GÜVENLİK BİLDİRİMİ */}
      <SecurityNotice message={t('base64.securityNotice')} />

    </div>
  );
}