import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) {
    return null; // Don't show on home page
  }

  const formatSegment = (segment: string) => {
    return segment
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <div>
                <Link to="/" className="text-slate-400 hover:text-red-600 transition-colors">
                  <Home size={14} />
                  <span className="sr-only">Home</span>
                </Link>
              </div>
            </li>
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;

              return (
                <li key={to}>
                  <div className="flex items-center space-x-2">
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                    {last ? (
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest" aria-current="page">
                        {formatSegment(value)}
                      </span>
                    ) : (
                      <Link
                        to={to}
                        className="text-[10px] font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        {formatSegment(value)}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
