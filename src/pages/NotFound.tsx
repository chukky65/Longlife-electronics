import { ArrowLeft, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/ui/SEO';

export const NotFound = () => (
  <div className="min-h-[65vh] bg-slate-950 text-white flex items-center justify-center px-4">
    <SEO title="Page Not Found - Longlife Electronics" description="The requested page could not be found." />
    <div className="max-w-xl text-center">
      <p className="text-red-500 text-[11px] font-black uppercase tracking-[0.35em] mb-5">Error 404</p>
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-5">This page is off the grid.</h1>
      <p className="text-slate-400 mb-8">The address may have changed, or the page is no longer available.</p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link to="/" className="bg-red-600 hover:bg-red-700 px-6 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Home size={15} /> Go Home
        </Link>
        <Link to="/products" className="border border-slate-700 hover:border-slate-500 px-6 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <ArrowLeft size={15} /> Browse Products
        </Link>
      </div>
    </div>
  </div>
);
