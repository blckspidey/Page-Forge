import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Scissors, 
  Grid, 
  Edit3, 
  Repeat, 
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const tools = [
    {
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into a single, cohesive document in any order you choose.',
      path: '/merge',
      icon: Layers,
      color: 'from-blue-500/20 to-indigo-500/20 hover:border-blue-500/50',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Split PDF',
      description: 'Extract specific pages or page ranges from a PDF and download them as individual files.',
      path: '/split',
      icon: Scissors,
      color: 'from-pink-500/20 to-rose-500/20 hover:border-pink-500/50',
      iconColor: 'text-pink-400'
    },
    {
      title: 'Organize PDF',
      description: 'Rearrange, rotate, delete pages, or insert blank pages dynamically using page thumbnails.',
      path: '/organize',
      icon: Grid,
      color: 'from-emerald-500/20 to-teal-500/20 hover:border-emerald-500/50',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Edit PDF',
      description: 'Overlay text, custom images, hand-drawn signatures, and vector shapes onto your document.',
      path: '/edit',
      icon: Edit3,
      color: 'from-violet-500/20 to-purple-500/20 hover:border-violet-500/50',
      iconColor: 'text-violet-400'
    },
    {
      title: 'Convert PDF',
      description: 'Convert Microsoft Word DOCX to PDF or extract text from PDF directly into editable Word documents.',
      path: '/convert',
      icon: Repeat,
      color: 'from-amber-500/20 to-orange-500/20 hover:border-amber-500/50',
      iconColor: 'text-amber-400'
    },
    {
      title: 'Secure PDF',
      description: 'Lock your documents with password protection (AES-256) or unlock protected PDF archives.',
      path: '/secure',
      icon: ShieldAlert,
      color: 'from-red-500/20 to-orange-600/20 hover:border-red-500/50',
      iconColor: 'text-red-400'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left relative">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-brand-500/20 bg-brand-500/5 text-brand-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Server-Side PDF Processing</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-none">
          Forge Your Documents into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-300 to-indigo-300 glow-text-brand">
            Perfect Form
          </span>
        </h1>
        <p className="text-lg md:text-xl text-dark-300 leading-relaxed">
          Page Forge provides a lightning-fast, secure, and beautiful interface to manage, edit, convert, and protect your PDF files.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link 
              key={index} 
              to={tool.path}
              className={`glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between border border-white/5 bg-gradient-to-br ${tool.color} transition-all duration-300 group`}
            >
              <div>
                <div className={`w-12 h-12 rounded-xl bg-dark-900/60 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                  <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{tool.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed mb-6">{tool.description}</p>
              </div>
              <div className="flex items-center text-xs font-semibold text-brand-300 tracking-wider uppercase group-hover:translate-x-1 transition-transform duration-200">
                <span>Open Tool</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer credit */}
      <div className="relative z-10 mt-20 flex flex-col items-center gap-3">
        <div className="w-48 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="text-[11px] tracking-widest uppercase text-dark-500/60 font-medium select-none">
          Made with{' '}
          <span className="text-brand-500/50 mx-0.5">♥</span>
          {' '}by{' '}
          <span className="text-brand-400/50 font-semibold">blckspidey</span>
        </p>
      </div>
    </div>
  );
}
