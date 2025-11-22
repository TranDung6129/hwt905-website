/**
 * GIAI ĐOẠN 8: REAL-TIME CONNECTION INDICATOR
 * Component hiển thị trạng thái kết nối WebSocket
 */

import React from 'react';
import { useSocket } from '../../hooks/useSocket';

const RealTimeIndicator = ({ showDetails = false }) => {
  const { isConnected, connectionStatus, error } = useSocket();

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          color: '#27ae60',
          icon: '🟢',
          text: 'Real-time Connected',
          description: 'Receiving live sensor data'
        };
      case 'connecting':
        return {
          color: '#f39c12',
          icon: '🟡',
          text: 'Connecting...',
          description: 'Establishing WebSocket connection'
        };
      case 'error':
        return {
          color: '#e74c3c',
          icon: '🔴',
          text: 'Connection Error',
          description: error?.message || 'WebSocket connection failed'
        };
      default:
        return {
          color: '#95a5a6',
          icon: '⚫',
          text: 'Disconnected',
          description: 'No real-time connection'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="realtime-indicator">
      <style>{`
        .realtime-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: ${statusInfo.color};
          transition: all 0.3s ease;
        }

        .realtime-indicator.detailed {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 8px 12px;
          background: ${statusInfo.color}10;
          border: 1px solid ${statusInfo.color}30;
          border-radius: 6px;
        }

        .status-main {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }

        .status-icon {
          font-size: 12px;
          animation: ${connectionStatus === 'connecting' ? 'pulse 1.5s infinite' : 'none'};
        }

        .status-description {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 2px;
        }

        .connection-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${statusInfo.color};
          animation: ${isConnected ? 'pulse-dot 2s infinite' : 'none'};
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes pulse-dot {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .realtime-indicator:hover .status-description {
          opacity: 1;
        }
      `}</style>

      <div className={`realtime-indicator ${showDetails ? 'detailed' : ''}`}>
        <div className="status-main">
          <span className="status-icon">{statusInfo.icon}</span>
          <span className="status-text">{statusInfo.text}</span>
          {!showDetails && <div className="connection-pulse"></div>}
        </div>
        
        {showDetails && (
          <div className="status-description">
            {statusInfo.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeIndicator;
