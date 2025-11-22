/**
 * GIAI ĐOẠN 5: LOADING SPINNER COMPONENT
 * Component để hiển thị loading states khi fetch APIs
 */

import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Đang tải...', 
  overlay = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12'
  };

  const spinnerComponent = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {message && (
        <span className="ml-3 text-gray-600">{message}</span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
        {spinnerComponent}
      </div>
    );
  }

  return spinnerComponent;
};

// CSS inline styles for animation (since we might not have Tailwind)
const styles = `
  .loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-spinner.small {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }

  .loading-spinner.large {
    width: 48px;
    height: 48px;
    border-width: 4px;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// CSS component version (không cần Tailwind)
export const LoadingSpinnerCSS = ({ 
  size = 'medium', 
  message = 'Đang tải...', 
  overlay = false 
}) => {
  React.useEffect(() => {
    // Inject CSS if not already present
    if (!document.getElementById('loading-spinner-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'loading-spinner-styles';
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const spinnerComponent = (
    <div className="flex items-center justify-center">
      <div className={`loading-spinner ${size}`}></div>
      {message && (
        <span style={{ marginLeft: '12px', color: '#666' }}>
          {message}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerComponent}
      </div>
    );
  }

  return spinnerComponent;
};

export default LoadingSpinner;
