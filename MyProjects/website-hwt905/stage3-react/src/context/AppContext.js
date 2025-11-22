/**
 * GIAI ĐOẠN 3: APP CONTEXT - Chuyển từ global state object sang React Context
 * Chương 6: React Context API
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial State - Chuyển từ stage2 state object
const initialState = {
  // UI State
  sidebarOpen: false,
  loading: false,
  
  // Connection State  
  connectionStatus: 'online', // 'online' | 'offline' | 'connecting'
  lastUpdateTime: new Date(),
  
  // Data State
  sensorData: {
    temperature: { min: 20, max: 35, current: 25.8, trend: 'positive' },
    humidity: { min: 40, max: 80, current: 62.3, trend: 'negative' },
    pressure: { min: 1000, max: 1020, current: 1013.2, trend: 'neutral' },
    light: { min: 100, max: 1000, current: 845, trend: 'positive' }
  },
  
  // Chart State
  currentTimeRange: '24h',
  chartData: [],
  
  // Table State
  currentPage: 1,
  totalPages: 250,
  pageLimit: 20,
  tableData: [],
  
  // Notifications
  notifications: []
};

// Action Types
const ActionTypes = {
  // UI Actions
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_LOADING: 'SET_LOADING',
  
  // Connection Actions
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  UPDATE_LAST_UPDATE_TIME: 'UPDATE_LAST_UPDATE_TIME',
  
  // Data Actions
  UPDATE_SENSOR_DATA: 'UPDATE_SENSOR_DATA',
  SET_CHART_DATA: 'SET_CHART_DATA',
  SET_TIME_RANGE: 'SET_TIME_RANGE',
  
  // Table Actions
  SET_TABLE_DATA: 'SET_TABLE_DATA',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_PAGE_LIMIT: 'SET_PAGE_LIMIT',
  
  // Notification Actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer Function - Thay thế cho state mutations trong stage2
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
      
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    case ActionTypes.SET_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload
      };
      
    case ActionTypes.UPDATE_LAST_UPDATE_TIME:
      return {
        ...state,
        lastUpdateTime: new Date()
      };
      
    case ActionTypes.UPDATE_SENSOR_DATA:
      return {
        ...state,
        sensorData: {
          ...state.sensorData,
          ...action.payload
        }
      };
      
    case ActionTypes.SET_CHART_DATA:
      return {
        ...state,
        chartData: action.payload
      };
      
    case ActionTypes.SET_TIME_RANGE:
      return {
        ...state,
        currentTimeRange: action.payload
      };
      
    case ActionTypes.SET_TABLE_DATA:
      return {
        ...state,
        tableData: action.payload
      };
      
    case ActionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload
      };
      
    case ActionTypes.SET_PAGE_LIMIT:
      return {
        ...state,
        pageLimit: action.payload,
        currentPage: 1 // Reset to first page
      };
      
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
      
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    default:
      return state;
  }
}

// Create Context
const AppContext = createContext();

// Context Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Auto-update simulation (chuyển từ stage2 setInterval)
  useEffect(() => {
    const updateInterval = setInterval(() => {
      updateSensorData();
    }, 30000); // 30 seconds
    
    const connectionInterval = setInterval(() => {
      updateConnectionStatus();
    }, 5000); // 5 seconds
    
    return () => {
      clearInterval(updateInterval);
      clearInterval(connectionInterval);
    };
  }, []);
  
  // Action Creators - Chuyển từ stage2 functions thành React actions
  
  // UI Actions
  const toggleSidebar = () => {
    dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
  };
  
  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };
  
  // Data Actions
  const updateSensorData = () => {
    const newData = {};
    
    Object.keys(state.sensorData).forEach(key => {
      const { min, max } = state.sensorData[key];
      const newValue = parseFloat((Math.random() * (max - min) + min).toFixed(1));
      const trends = ['positive', 'negative', 'neutral'];
      const newTrend = trends[Math.floor(Math.random() * trends.length)];
      
      newData[key] = {
        ...state.sensorData[key],
        current: newValue,
        trend: newTrend
      };
    });
    
    dispatch({ type: ActionTypes.UPDATE_SENSOR_DATA, payload: newData });
    dispatch({ type: ActionTypes.UPDATE_LAST_UPDATE_TIME });
    
    // Show notification
    showNotification('Dữ liệu đã được cập nhật', 'success');
  };
  
  const setTimeRange = (range) => {
    dispatch({ type: ActionTypes.SET_TIME_RANGE, payload: range });
    
    // Simulate loading chart data
    generateChartData(range);
    showNotification(`Chuyển sang biểu đồ ${range}`, 'info');
  };
  
  const generateChartData = (range) => {
    const dataPoints = range === '24h' ? 24 : range === '7d' ? 7 : 30;
    const chartData = [];
    
    for (let i = dataPoints; i > 0; i--) {
      const timestamp = new Date();
      if (range === '24h') {
        timestamp.setHours(timestamp.getHours() - i);
      } else if (range === '7d') {
        timestamp.setDate(timestamp.getDate() - i);
      } else {
        timestamp.setDate(timestamp.getDate() - i);
      }
      
      chartData.push({
        time: timestamp,
        temperature: parseFloat((Math.random() * 15 + 20).toFixed(1)),
        humidity: parseFloat((Math.random() * 40 + 40).toFixed(1)),
        pressure: parseFloat((Math.random() * 20 + 1000).toFixed(1)),
        light: Math.floor(Math.random() * 900 + 100)
      });
    }
    
    dispatch({ type: ActionTypes.SET_CHART_DATA, payload: chartData });
  };
  
  // Table Actions
  const setCurrentPage = (page) => {
    if (page >= 1 && page <= state.totalPages) {
      dispatch({ type: ActionTypes.SET_CURRENT_PAGE, payload: page });
      showNotification(`Chuyển đến trang ${page}`, 'info');
    }
  };
  
  const setPageLimit = (limit) => {
    dispatch({ type: ActionTypes.SET_PAGE_LIMIT, payload: parseInt(limit) });
    showNotification(`Hiển thị ${limit} dòng mỗi trang`, 'info');
  };
  
  // Connection Actions
  const updateConnectionStatus = () => {
    // Simulate occasional connection issues (90% uptime)
    const isOnline = Math.random() > 0.1;
    const status = isOnline ? 'online' : 'offline';
    
    if (status !== state.connectionStatus) {
      dispatch({ type: ActionTypes.SET_CONNECTION_STATUS, payload: status });
    }
  };
  
  // Notification Actions
  const showNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date()
    };
    
    dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
    
    // Auto remove
    setTimeout(() => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
    }, duration);
  };
  
  const removeNotification = (id) => {
    dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: id });
  };
  
  // Refresh Action - Chuyển từ stage2 handleRefresh
  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update all data
      updateSensorData();
      generateChartData(state.currentTimeRange);
      
      showNotification('Dữ liệu đã được làm mới', 'success');
    } catch (error) {
      showNotification('Lỗi khi làm mới dữ liệu', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    // State
    ...state,
    
    // UI Actions
    toggleSidebar,
    setLoading,
    
    // Data Actions  
    updateSensorData,
    setTimeRange,
    generateChartData,
    refreshData,
    
    // Table Actions
    setCurrentPage,
    setPageLimit,
    
    // Connection Actions
    updateConnectionStatus,
    
    // Notification Actions
    showNotification,
    removeNotification
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
