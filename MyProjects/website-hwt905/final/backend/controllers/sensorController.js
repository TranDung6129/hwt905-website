/**
 * GIAI ĐOẠN 4: SENSOR CONTROLLER - API endpoints
 * Chương 7: RESTful API Controllers
 */

const SensorData = require('../models/SensorData');
const mqttService = require('../services/mqttService');

/**
 * @desc    Lấy dữ liệu sensor mới nhất  
 * @route   GET /api/sensors/latest
 * @access  Public (Giai đoạn 6 sẽ thêm auth)
 */
const getLatestSensorData = async (req, res) => {
  try {
    const { deviceId } = req.query;
    
    let query = {};
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    const latestData = await SensorData.findOne(query)
      .sort({ timestamp: -1 })
      .select('-__v');
    
    if (!latestData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu sensor nào'
      });
    }
    
    res.json({
      success: true,
      data: latestData,
      deviceId: latestData.deviceId,
      timestamp: latestData.timestamp
    });
    
  } catch (error) {
    console.error('Lỗi lấy latest sensor data:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy dữ liệu sensor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * @desc    Lấy lịch sử dữ liệu sensor với pagination
 * @route   GET /api/sensors/history  
 * @access  Public
 */
const getSensorHistory = async (req, res) => {
  try {
    const {
      deviceId,
      page = 1,
      limit = 50,
      startDate,
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    let query = {};
    
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute queries
    const [data, totalCount] = await Promise.all([
      SensorData.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      SensorData.countDocuments(query)
    ]);
    
    // Pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    
    res.json({
      success: true,
      data: {
        records: data,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalRecords: totalCount,
          recordsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        filter: {
          deviceId: deviceId || 'all',
          startDate,
          endDate
        }
      }
    });
    
  } catch (error) {
    console.error('Lỗi lấy sensor history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy lịch sử dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * @desc    Lấy thống kê dữ liệu sensor
 * @route   GET /api/sensors/stats
 * @access  Public  
 */
const getSensorStats = async (req, res) => {
  try {
    const { deviceId, period = '24h' } = req.query;
    
    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch (period) {
      case '1h':
        startTime = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
    }
    
    let query = { timestamp: { $gte: startTime } };
    if (deviceId) {
      query.deviceId = deviceId;
    }
    
    // Aggregation pipeline
    const stats = await SensorData.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgTemperature: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          avgPressure: { $avg: '$pressure' },
          avgLight: { $avg: '$light' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          firstReading: { $min: '$timestamp' },
          lastReading: { $max: '$timestamp' }
        }
      }
    ]);
    
    const result = stats.length > 0 ? stats[0] : {
      count: 0,
      avgTemperature: 0,
      avgHumidity: 0,
      avgPressure: 0,
      avgLight: 0,
      minTemperature: 0,
      maxTemperature: 0,
      minHumidity: 0,
      maxHumidity: 0
    };
    
    res.json({
      success: true,
      data: {
        period,
        deviceId: deviceId || 'all',
        timeRange: {
          start: startTime,
          end: now
        },
        statistics: {
          totalReadings: result.count,
          temperature: {
            avg: Math.round(result.avgTemperature * 10) / 10,
            min: result.minTemperature,
            max: result.maxTemperature
          },
          humidity: {
            avg: Math.round(result.avgHumidity * 10) / 10,
            min: result.minHumidity,
            max: result.maxHumidity
          },
          pressure: {
            avg: Math.round(result.avgPressure * 10) / 10
          },
          light: {
            avg: Math.round(result.avgLight * 10) / 10
          }
        },
        dataQuality: {
          firstReading: result.firstReading,
          lastReading: result.lastReading,
          dataGaps: result.count === 0 ? 'No data' : 'Good'
        }
      }
    });
    
  } catch (error) {
    console.error('Lỗi lấy sensor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tính thống kê',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * @desc    Tạo dữ liệu sensor mới (Manual entry hoặc test)
 * @route   POST /api/sensors/data
 * @access  Public (Giai đoạn 6 sẽ require admin)
 */
const createSensorData = async (req, res) => {
  try {
    const {
      temperature,
      humidity,
      pressure,
      light,
      deviceId = 'manual-entry',
      location
    } = req.body;
    
    // Validation
    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Temperature và humidity là bắt buộc'
      });
    }
    
    if (typeof temperature !== 'number' || typeof humidity !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Temperature và humidity phải là số'
      });
    }
    
    // Create new sensor data
    const sensorData = new SensorData({
      temperature,
      humidity,
      pressure: pressure || null,
      light: light || null,
      deviceId,
      location: location || 'Manual Entry'
    });
    
    await sensorData.save();
    
    res.status(201).json({
      success: true,
      message: 'Đã tạo dữ liệu sensor thành công',
      data: sensorData.toSafeObject()
    });
    
  } catch (error) {
    console.error('Lỗi tạo sensor data:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo dữ liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * @desc    Lấy danh sách devices
 * @route   GET /api/sensors/devices
 * @access  Public
 */
const getDevices = async (req, res) => {
  try {
    const devices = await SensorData.distinct('deviceId');
    
    // Get last reading time for each device
    const deviceInfo = await Promise.all(
      devices.map(async (deviceId) => {
        const lastReading = await SensorData.findOne({ deviceId })
          .sort({ timestamp: -1 })
          .select('timestamp batteryLevel signalStrength location');
          
        return {
          deviceId,
          lastReading: lastReading ? {
            timestamp: lastReading.timestamp,
            batteryLevel: lastReading.batteryLevel,
            signalStrength: lastReading.signalStrength,
            location: lastReading.location
          } : null
        };
      })
    );
    
    res.json({
      success: true,
      data: {
        totalDevices: devices.length,
        devices: deviceInfo
      }
    });
    
  } catch (error) {
    console.error('Lỗi lấy danh sách devices:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách devices',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * @desc    Lấy trạng thái MQTT service
 * @route   GET /api/sensors/mqtt-status
 * @access  Public
 */
const getMQTTStatus = async (req, res) => {
  try {
    const mqttStats = mqttService.getStats();
    
    res.json({
      success: true,
      data: {
        mqtt: mqttStats,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.version,
          platform: process.platform
        }
      }
    });
    
  } catch (error) {
    console.error('Lỗi lấy MQTT status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy trạng thái MQTT'
    });
  }
};

/**
 * @desc    Publish test MQTT message
 * @route   POST /api/sensors/test-mqtt
 * @access  Public (Giai đoạn 6 sẽ require admin)
 */
const publishTestMessage = async (req, res) => {
  try {
    mqttService.publishTestMessage();
    
    res.json({
      success: true,
      message: 'Đã gửi test MQTT message'
    });
    
  } catch (error) {
    console.error('Lỗi gửi test message:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi test message'
    });
  }
};

module.exports = {
  getLatestSensorData,
  getSensorHistory,
  getSensorStats,
  createSensorData,
  getDevices,
  getMQTTStatus,
  publishTestMessage
};
