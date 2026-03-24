import React from 'react';

const Skeleton = ({ className = "" }) => (
  <div className={`bg-slate-200 animate-pulse rounded-md ${className}`}></div>
);

export default Skeleton;
