import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'w-8 h-8' }) => {
  return (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-gray-900 ${size}`} style={{ borderWidth: '4px', borderRadius: '50%' }} />
  );
};

export default LoadingSpinner;
