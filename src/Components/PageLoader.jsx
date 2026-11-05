import React from 'react';

/**
 * Lightweight brand-colored spinner used as the Suspense fallback while a
 * lazily-loaded route chunk is being fetched.
 */
const PageLoader = () => (
  <div className="flex min-h-[60vh] w-full items-center justify-center bg-white">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#DB4444]" />
  </div>
);

export default PageLoader;
