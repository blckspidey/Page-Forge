import React from 'react';
import { MessageSquare } from 'lucide-react';

// Placeholder — full implementation coming in Phase 4
export default function ChatPDF() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 text-brand-400 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
        <h1 className="text-2xl font-bold text-white mb-2">Chat with PDF</h1>
        <p className="text-slate-400">Coming soon — Phase 4</p>
      </div>
    </div>
  );
}
