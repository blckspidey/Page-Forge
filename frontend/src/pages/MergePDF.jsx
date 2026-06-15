import React, { useState } from 'react';
import { mergePDFs, downloadBlob } from '../services/api';
import DropZone from '../components/DropZone';
import { File, ArrowUp, ArrowDown, Trash2, Layers, Loader2, CheckCircle2 } from 'lucide-react';

export default function MergePDF() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (incoming) => {
    const pdfs = incoming.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfs.length === 0) {
      setError('Only PDF files are accepted.');
      return;
    }
    setError(null);
    setSuccess(false);
    setFiles((prev) => [...prev, ...pdfs]);
  };

  const moveFile = (index, dir) => {
    const next = [...files];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target >= 0 && target < files.length) {
      [next[index], next[target]] = [next[target], next[index]];
      setFiles(next);
    }
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const clearAll = () => { setFiles([]); setError(null); setSuccess(false); };

  const handleMerge = async () => {
    if (files.length < 2) { setError('Add at least 2 PDF files to merge.'); return; }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await mergePDFs(files);
      downloadBlob(response, 'merged_document.pdf');
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to merge PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-left">
      {/* Page header */}
      <div className="mb-8 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <Layers className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Merge PDF</h1>
          <p className="text-slate-400 text-sm">Combine multiple PDF files into one in your preferred order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Upload panel */}
        <div className="md:col-span-2 space-y-4">
          <DropZone
            accept=".pdf"
            multiple
            onFiles={handleFiles}
            label="Add PDF Files"
            subLabel="PDF files only — drag multiple at once"
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start space-x-2">
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Merged PDF downloaded successfully!</span>
            </div>
          )}
        </div>

        {/* Queue + action */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {/* File queue */}
          <div className="flex-1 rounded-xl border border-white/5 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                Files to Merge
                <span className="ml-2 text-xs text-slate-500 font-normal">{files.length} file{files.length !== 1 ? 's' : ''}</span>
              </h2>
              {files.length > 0 && (
                <button onClick={clearAll} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                  Clear all
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-44 text-slate-600">
                <File className="w-9 h-9 mb-3 opacity-40" />
                <p className="text-xs">No files added yet</p>
                <p className="text-xs mt-1 opacity-60">Upload from the panel on the left</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-white/5 bg-slate-950/60 group"
                  >
                    {/* Order badge + name */}
                    <div className="flex items-center space-x-3 overflow-hidden min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 rounded-md bg-brand-500/20 text-brand-300 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <File className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                      <span className="text-xs text-white truncate" title={file.name}>{file.name}</span>
                      <span className="text-[10px] text-slate-600 flex-shrink-0">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveFile(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveFile(idx, 'down')}
                        disabled={idx === files.length - 1}
                        className="p-1 rounded text-slate-500 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 ml-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Merge button */}
          <button
            id="btn-merge"
            onClick={handleMerge}
            disabled={files.length < 2 || loading}
            className="w-full inline-flex items-center justify-center py-3.5 text-sm font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-brand-600 to-brand-500 rounded-xl hover:from-brand-500 hover:to-brand-600 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none transition-all duration-300 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Merging…
              </>
            ) : (
              `Merge ${files.length > 1 ? `${files.length} PDFs` : 'PDFs'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
