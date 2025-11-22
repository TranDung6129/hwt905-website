/**
 * GIAI ĐOẠN 2: DASHBOARD JAVASCRIPT
 * Chương 4: JavaScript cơ bản, DOM manipulation
 * Chương 5: Events, Form validation
 */

// DOM Elements
const elements = {
    menuToggle: document.querySelector('.menu-toggle'),
    sidebar: document.querySelector('.sidebar'),
    mainContent: document.querySelector('.main-content'),
    refreshButton: document.querySelector('.status-bar .btn-primary'),
    timeRangeSelect: document.querySelector('.time-range'),
    chartContainer: document.querySelector('.chart-placeholder'),
    dataCards: document.querySelectorAll('.data-card'),
    tableControls: {
        dateFilter: document.querySelector('.date-filter'),
        limitSelect: document.querySelector('.limit-select'),
        prevButton: document.querySelector('.pagination-controls .btn:first-child'),
        nextButton: document.querySelector('.pagination-controls .btn:last-child')
    }
};

// State Management
const state = {
    sidebarOpen: false,
    currentTimeRange: '24h',
    currentPage: 1,
    totalPages: 250,
    isLoading: false,
    connectionStatus: 'online',
    lastUpdateTime: new Date()
};

// Simulated sensor data for demo
const mockSensorData = {
    temperature: { min: 20, max: 35, current: 25.8 },
    humidity: { min: 40, max: 80, current: 62.3 },
    pressure: { min: 1000, max: 1020, current: 1013.2 },
    light: { min: 100, max: 1000, current: 845 }
};

/**
 * CHƯƠNG 4: DOM MANIPULATION & EVENTS
 */

// Initialize Dashboard
function initDashboard() {
    console.log('Khởi tạo Dashboard JavaScript...');
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize components
    initSidebar();
    initDataCards();
    initChart();
    initTable();
    
    // Start auto-update simulation
    startAutoUpdate();
    
    console.log('Dashboard JavaScript sẵn sàng!');
}

// Setup All Event Listeners
function setupEventListeners() {
    // Mobile sidebar toggle
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener('click', toggleSidebar);
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            state.sidebarOpen && 
            !elements.sidebar.contains(e.target) && 
            !elements.menuToggle.contains(e.target)) {
            closeSidebar();
        }
    });
    
    // Refresh button
    if (elements.refreshButton) {
        elements.refreshButton.addEventListener('click', handleRefresh);
    }
    
    // Time range selector
    if (elements.timeRangeSelect) {
        elements.timeRangeSelect.addEventListener('change', handleTimeRangeChange);
    }
    
    // Table controls
    setupTableEventListeners();
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * SIDEBAR FUNCTIONALITY
 */
function initSidebar() {
    // Set initial sidebar state based on screen size
    if (window.innerWidth <= 768) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function toggleSidebar() {
    if (state.sidebarOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

function openSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.add('open');
        state.sidebarOpen = true;
        
        // Add animation class
        elements.sidebar.style.transform = 'translateX(0)';
        
        console.log('Sidebar đã mở');
    }
}

function closeSidebar() {
    if (elements.sidebar) {
        elements.sidebar.classList.remove('open');
        state.sidebarOpen = false;
        
        // Mobile transform
        if (window.innerWidth <= 768) {
            elements.sidebar.style.transform = 'translateX(-100%)';
        }
        
        console.log('Sidebar đã đóng');
    }
}

/**
 * DATA CARDS FUNCTIONALITY
 */
function initDataCards() {
    // Add hover effects and click handlers
    elements.dataCards.forEach(card => {
        card.addEventListener('mouseenter', handleCardHover);
        card.addEventListener('mouseleave', handleCardLeave);
        card.addEventListener('click', handleCardClick);
    });
}

function handleCardHover(e) {
    const card = e.currentTarget;
    card.style.transform = 'translateY(-5px)';
    card.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
}

function handleCardLeave(e) {
    const card = e.currentTarget;
    card.style.transform = 'translateY(-2px)';
    card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
}

function handleCardClick(e) {
    const card = e.currentTarget;
    const cardType = card.classList[1]; // temperature, humidity, etc.
    
    showNotification(`Đã click vào thẻ ${getCardDisplayName(cardType)}`, 'info');
    
    // Animate click
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = 'translateY(-2px)';
    }, 150);
}

function getCardDisplayName(type) {
    const names = {
        'temperature': 'Nhiệt độ',
        'humidity': 'Độ ẩm', 
        'pressure': 'Áp suất',
        'light': 'Ánh sáng'
    };
    return names[type] || type;
}

/**
 * CHART FUNCTIONALITY
 */
function initChart() {
    updateChartPlaceholder();
}

function handleTimeRangeChange(e) {
    const newRange = e.target.value;
    state.currentTimeRange = newRange;
    
    showNotification(`Chuyển sang biểu đồ ${newRange}`, 'info');
    updateChartPlaceholder();
    
    console.log(`📊 Chuyển time range: ${newRange}`);
}

function updateChartPlaceholder() {
    const chartArea = document.querySelector('.chart-area');
    if (chartArea) {
        // Simulate loading
        showLoading(chartArea);
        
        setTimeout(() => {
            const rangeText = {
                '24h': '24 giờ qua',
                '7d': '7 ngày qua', 
                '30d': '30 ngày qua'
            };
            
            chartArea.innerHTML = `
                <p>Biểu đồ ${rangeText[state.currentTimeRange]}</p>
                <small>Giai đoạn 3 sẽ tích hợp Chart.js hoặc Recharts</small>
                <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Dữ liệu mô phỏng cho ${rangeText[state.currentTimeRange]}:</strong><br>
                    ${Math.floor(Math.random() * 100 + 50)} điểm dữ liệu<br>
                    Xu hướng: ${Math.random() > 0.5 ? 'Tăng' : 'Giảm'}<br>
                    Cập nhật: ${new Date().toLocaleTimeString('vi-VN')}
                </div>
            `;
            hideLoading(chartArea);
        }, 1000);
    }
}

/**
 * TABLE FUNCTIONALITY
 */
function setupTableEventListeners() {
    const { dateFilter, limitSelect, prevButton, nextButton } = elements.tableControls;
    
    if (dateFilter) {
        dateFilter.addEventListener('change', handleDateFilterChange);
    }
    
    if (limitSelect) {
        limitSelect.addEventListener('change', handleLimitChange);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', () => goToPage(state.currentPage - 1));
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => goToPage(state.currentPage + 1));
    }
}

function initTable() {
    updatePaginationControls();
}

function handleDateFilterChange(e) {
    const selectedDate = e.target.value;
    showNotification(`Lọc dữ liệu theo ngày: ${selectedDate}`, 'info');
    
    // Simulate table reload
    reloadTableData();
}

function handleLimitChange(e) {
    const newLimit = e.target.value;
    showNotification(`Hiển thị ${newLimit} dòng mỗi trang`, 'info');
    
    // Reset to first page and reload
    state.currentPage = 1;
    reloadTableData();
}

function goToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > state.totalPages) return;
    
    state.currentPage = pageNumber;
    updatePaginationControls();
    reloadTableData();
    
    showNotification(`Chuyển đến trang ${pageNumber}`, 'info');
}

function updatePaginationControls() {
    const { prevButton, nextButton } = elements.tableControls;
    const pageInfo = document.querySelector('.page-info');
    
    if (prevButton) {
        prevButton.disabled = state.currentPage <= 1;
    }
    
    if (nextButton) {
        nextButton.disabled = state.currentPage >= state.totalPages;
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Trang ${state.currentPage} / ${state.totalPages}`;
    }
}

function reloadTableData() {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (tableWrapper) {
        showLoading(tableWrapper);
        
        setTimeout(() => {
            // Simulate new data loading
            console.log(`Đã tải dữ liệu trang ${state.currentPage}`);
            hideLoading(tableWrapper);
            updatePaginationControls();
        }, 800);
    }
}

/**
 * AUTO-UPDATE & REFRESH FUNCTIONALITY  
 */
function startAutoUpdate() {
    // Simulate real-time data updates every 30 seconds
    setInterval(updateSensorData, 30000);
    
    // Update connection status
    setInterval(updateConnectionStatus, 5000);
    
    console.log('Auto-update đã bắt đầu');
}

function updateSensorData() {
    if (state.isLoading) return;
    
    console.log('Cập nhật dữ liệu sensor...');
    
    // Update data cards with simulated values
    updateDataCardValues();
    
    // Update last update time
    state.lastUpdateTime = new Date();
    updateLastUpdateDisplay();
    
    showNotification('Dữ liệu đã được cập nhật', 'success');
}

function updateDataCardValues() {
    elements.dataCards.forEach(card => {
        const cardType = card.classList[1];
        const valueElement = card.querySelector('.value');
        const trendElement = card.querySelector('.trend');
        
        if (valueElement && mockSensorData[cardType]) {
            // Generate new random value within realistic range
            const { min, max } = mockSensorData[cardType];
            const newValue = (Math.random() * (max - min) + min).toFixed(1);
            
            // Animate value change
            animateValueChange(valueElement, newValue);
            
            // Update trend
            if (trendElement) {
                updateTrendDisplay(trendElement, cardType);
            }
            
            mockSensorData[cardType].current = parseFloat(newValue);
        }
    });
}

function animateValueChange(element, newValue) {
    element.style.transform = 'scale(1.1)';
    element.style.color = '#3498db';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'scale(1)';
        element.style.color = '';
    }, 200);
}

function updateTrendDisplay(element, cardType) {
    const trends = ['positive', 'negative', 'neutral'];
    const currentTrend = trends[Math.floor(Math.random() * trends.length)];
    
    // Remove existing trend classes
    element.classList.remove('positive', 'negative', 'neutral');
    element.classList.add(currentTrend);
    
    const trendTexts = {
        'positive': '+0.5 so với trước',
        'negative': '-0.3 so với trước', 
        'neutral': 'Ổn định'
    };
    
    element.textContent = trendTexts[currentTrend];
}

function updateLastUpdateDisplay() {
    const lastUpdateElement = document.querySelector('.last-update span');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Cập nhật cuối: ${state.lastUpdateTime.toLocaleString('vi-VN')}`;
    }
}

function updateConnectionStatus() {
    const statusDot = document.querySelector('.status-dot');
    const connectionInfo = document.querySelector('.connection-info span');
    
    // Simulate occasional connection issues
    const isOnline = Math.random() > 0.1; // 90% uptime
    
    if (statusDot && connectionInfo) {
        if (isOnline) {
            statusDot.className = 'status-dot online';
            connectionInfo.textContent = 'Real-time: Đang hoạt động';
            state.connectionStatus = 'online';
        } else {
            statusDot.className = 'status-dot';
            statusDot.style.background = '#e74c3c';
            connectionInfo.textContent = 'Real-time: Mất kết nối';
            state.connectionStatus = 'offline';
        }
    }
}

/**
 * USER INTERACTIONS
 */
function handleRefresh() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    const button = elements.refreshButton;
    
    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Đang tải...';
    button.disabled = true;
    button.classList.add('loading');
    
    // Simulate refresh
    setTimeout(() => {
        updateSensorData();
        reloadTableData();
        updateChartPlaceholder();
        
        // Reset button
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('loading');
        state.isLoading = false;
        
        showNotification('Dữ liệu đã được làm mới', 'success');
    }, 2000);
    
    console.log('Người dùng bấm refresh');
}

function handleResize() {
    // Auto-close sidebar on mobile when resizing to desktop
    if (window.innerWidth > 768 && state.sidebarOpen) {
        elements.sidebar.style.transform = '';
    } else if (window.innerWidth <= 768 && !state.sidebarOpen) {
        elements.sidebar.style.transform = 'translateX(-100%)';
    }
}

function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + R = Refresh (prevent default and use custom)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleRefresh();
    }
    
    // ESC = Close sidebar on mobile
    if (e.key === 'Escape' && window.innerWidth <= 768 && state.sidebarOpen) {
        closeSidebar();
    }
}

/**
 * UTILITY FUNCTIONS
 */
function showLoading(container) {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="spinner"></div>
        <span>Đang tải...</span>
    `;
    loader.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        gap: 10px;
        color: #666;
        font-size: 14px;
    `;
    
    container.style.position = 'relative';
    container.style.opacity = '0.7';
    container.appendChild(loader);
}

function hideLoading(container) {
    const loader = container.querySelector('.loading-overlay');
    if (loader) {
        loader.remove();
        container.style.opacity = '';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const colors = {
        'success': '#27ae60',
        'info': '#3498db',
        'warning': '#f39c12',
        'danger': '#e74c3c'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * INITIALIZATION
 * Chờ DOM ready trước khi khởi tạo
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
