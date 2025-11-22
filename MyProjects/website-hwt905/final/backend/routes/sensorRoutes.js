/**
 * GIAI ĐOẠN 4: SENSOR ROUTES
 * Chương 7: RESTful API Routes với Express Router
 */

const express = require('express');
const router = express.Router();
const {
  getLatestSensorData,
  getSensorHistory,
  getSensorStats,
  createSensorData,
  getDevices,
  getMQTTStatus,
  publishTestMessage
} = require('../controllers/sensorController');

const { 
  authenticateToken, 
  optionalAuth, 
  requirePermission 
} = require('../middleware/authMiddleware');

/**
 * @route   GET /api/sensors/latest
 * @desc    Lấy dữ liệu sensor mới nhất
 * @access  Private - Requires authentication
 * @query   deviceId (optional) - Lọc theo device cụ thể
 */
router.get('/latest', authenticateToken, requirePermission('canViewDashboard'), getLatestSensorData);

/**
 * @route   GET /api/sensors/history
 * @desc    Lấy lịch sử dữ liệu sensor với pagination
 * @access  Private - Requires canViewHistory permission
 * @query   deviceId, page, limit, startDate, endDate, sortBy, sortOrder
 */
router.get('/history', authenticateToken, requirePermission('canViewHistory'), getSensorHistory);

/**
 * @route   GET /api/sensors/stats
 * @desc    Lấy thống kê dữ liệu sensor
 * @access  Private - Requires canViewDashboard permission
 * @query   deviceId, period (1h|24h|7d|30d)
 */
router.get('/stats', authenticateToken, requirePermission('canViewDashboard'), getSensorStats);

/**
 * @route   GET /api/sensors/devices
 * @desc    Lấy danh sách tất cả devices
 * @access  Private - Requires canViewDashboard permission
 */
router.get('/devices', authenticateToken, requirePermission('canViewDashboard'), getDevices);

/**
 * @route   GET /api/sensors/mqtt-status
 * @desc    Lấy trạng thái MQTT service và server
 * @access  Private - Requires canManageDevices permission
 */
router.get('/mqtt-status', authenticateToken, requirePermission('canManageDevices'), getMQTTStatus);

/**
 * @route   POST /api/sensors/data
 * @desc    Tạo dữ liệu sensor mới (manual entry hoặc test)
 * @access  Private - Requires canManageDevices permission
 * @body    temperature, humidity, pressure?, light?, deviceId?, location?
 */
router.post('/data', authenticateToken, requirePermission('canManageDevices'), createSensorData);

/**
 * @route   POST /api/sensors/test-mqtt
 * @desc    Gửi test message qua MQTT
 * @access  Private - Requires canManageDevices permission
 */
router.post('/test-mqtt', authenticateToken, requirePermission('canManageDevices'), publishTestMessage);

module.exports = router;
