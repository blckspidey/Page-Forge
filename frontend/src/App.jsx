import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar';

// Lazy-load all page routes to enable automatic code splitting
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const MergePDF   = lazy(() => import('./pages/MergePDF'));
const SplitPDF   = lazy(() => import('./pages/SplitPDF'));
const OrganizePDF= lazy(() => import('./pages/OrganizePDF'));
const EditPDF    = lazy(() => import('./pages/EditPDF'));
const ConvertPDF = lazy(() => import('./pages/ConvertPDF'));
const SecurePDF  = lazy(() => import('./pages/SecurePDF'));
const NotFound   = lazy(() => import('./pages/NotFound'));

/** Full-screen loading skeleton shown during lazy chunk download */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-4 text-slate-500">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <span className="text-xs tracking-widest uppercase">Loading…</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
        {/* Glowing rainbow top bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-brand-600 via-indigo-500 to-pink-500" />

        <Navbar />

        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"        element={<Dashboard />} />
              <Route path="/merge"   element={<MergePDF />} />
              <Route path="/split"   element={<SplitPDF />} />
              <Route path="/organize"element={<OrganizePDF />} />
              <Route path="/edit"    element={<EditPDF />} />
              <Route path="/convert" element={<ConvertPDF />} />
              <Route path="/secure"  element={<SecurePDF />} />
              <Route path="*"        element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <footer className="py-8 border-t border-white/5 bg-slate-950 text-center text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4">
            <p className="mb-1">
              <span className="text-slate-400 font-semibold">PAGE FORGE</span>
              {' '}&copy; {new Date().getFullYear()} — Secure, database-less document toolkit
            </p>
            <p className="opacity-50">React · Tailwind CSS v4 · Node.js · pdf-lib · Microsoft Word COM</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
