import React from 'react';

const SkeletonBlock = ({ className = '', rounded = true }) => (
  <div
    aria-hidden
    className={`animate-pulse bg-slate-200/70 dark:bg-slate-700/40 ${rounded ? 'rounded-md' : ''} ${className}`}
  />
);

export default SkeletonBlock;
