/**
 * GIAI ĐOẠN 4: SENSOR DATA MODEL
 * Chương 8: Mongoose Schema và Model definition
 */

const mongoose = require('mongoose');

/**
 * Schema cho dữ liệu cảm biến từ Raspberry Pi
 * Thiết kế để lưu trữ tất cả loại sensor data
 */
const sensorDataSchema = new mongoose.Schema({
  // Dữ liệu cảm biến chính
  temperature: {
    type: Number,
    required: [true, 'Temperature là bắt buộc'],
    min: [-50, 'Temperature không thể nhỏ hơn -50°C'],
    max: [100, 'Temperature không thể lớn hơn 100°C']
  },
  
  humidity: {
    type: Number,
    required: [true, 'Humidity là bắt buộc'], 
    min: [0, 'Humidity không thể âm'],
    max: [100, 'Humidity không thể vượt quá 100%']
  },
  
  pressure: {
    type: Number,
    required: false,
    min: [800, 'Pressure quá thấp'],
    max: [1200, 'Pressure quá cao']
  },
  
  light: {
    type: Number,
    required: false,
    min: [0, 'Light không thể âm']
  },
  
  // Metadata
  deviceId: {
    type: String,
    required: [true, 'Device ID là bắt buộc'],
    default: 'raspberry-pi-001',
    trim: true
  },
  
  location: {
    type: String,
    required: false,
    default: 'Lab Room A',
    trim: true
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Index cho queries theo thời gian
  },
  
  receivedAt: {
    type: Date,
    default: Date.now
  },
  
  // Data quality indicators
  batteryLevel: {
    type: Number,
    required: false,
    min: [0, 'Battery level không thể âm'],
    max: [100, 'Battery level không thể vượt quá 100%']
  },
  
  signalStrength: {
    type: Number,
    required: false,
    min: [-120, 'Signal strength quá yếu'],
    max: [0, 'Signal strength không thể dương']
  },
  
  // Error handling
  isValid: {
    type: Boolean,
    default: true
  },
  
  errorMessage: {
    type: String,
    required: false
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'sensorData' // Tên collection trong MongoDB
});

/**
 * Indexes để tối ưu hóa queries
 */
// Compound index cho device và timestamp (queries phổ biến nhất)
sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

// Index cho timestamp descending (lấy data mới nhất)
sensorDataSchema.index({ timestamp: -1 });

// Index cho location (nếu có nhiều locations)
sensorDataSchema.index({ location: 1 });

/**
 * Virtual fields - computed properties
 */
sensorDataSchema.virtual('age').get(function() {
  return Date.now() - this.timestamp.getTime();
});

sensorDataSchema.virtual('isRecent').get(function() {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  return this.timestamp.getTime() > fiveMinutesAgo;
});

/**
 * Instance methods
 */
sensorDataSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

sensorDataSchema.methods.isOutdated = function(minutes = 10) {
  const cutoff = Date.now() - (minutes * 60 * 1000);
  return this.timestamp.getTime() < cutoff;
};

/**
 * Static methods cho queries thường dùng
 */
sensorDataSchema.statics.getLatestByDevice = function(deviceId) {
  return this.findOne({ deviceId })
    .sort({ timestamp: -1 })
    .exec();
};

sensorDataSchema.statics.getRecentData = function(deviceId, minutes = 60) {
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  return this.find({
    deviceId,
    timestamp: { $gte: cutoff }
  })
  .sort({ timestamp: -1 })
  .exec();
};

sensorDataSchema.statics.getDataInRange = function(deviceId, startDate, endDate) {
  return this.find({
    deviceId,
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
  .sort({ timestamp: -1 })
  .exec();
};

sensorDataSchema.statics.getAggregatedData = function(deviceId, groupBy = 'hour') {
  const groupStage = {
    hour: { 
      $dateToString: { 
        format: "%Y-%m-%d %H:00:00", 
        date: "$timestamp" 
      }
    },
    day: { 
      $dateToString: { 
        format: "%Y-%m-%d", 
        date: "$timestamp" 
      }
    }
  };

  return this.aggregate([
    { $match: { deviceId } },
    {
      $group: {
        _id: groupStage[groupBy],
        avgTemperature: { $avg: '$temperature' },
        avgHumidity: { $avg: '$humidity' },
        avgPressure: { $avg: '$pressure' },
        avgLight: { $avg: '$light' },
        maxTemperature: { $max: '$temperature' },
        minTemperature: { $min: '$temperature' },
        count: { $sum: 1 },
        firstReading: { $first: '$timestamp' },
        lastReading: { $last: '$timestamp' }
      }
    },
    { $sort: { _id: -1 } }
  ]);
};

/**
 * Pre-save middleware để validation và data cleaning
 */
sensorDataSchema.pre('save', function(next) {
  // Làm tròn số để tối ưu storage
  if (this.temperature) {
    this.temperature = Math.round(this.temperature * 10) / 10;
  }
  if (this.humidity) {
    this.humidity = Math.round(this.humidity * 10) / 10;
  }
  if (this.pressure) {
    this.pressure = Math.round(this.pressure * 10) / 10;
  }
  
  // Validate timestamp không được trong tương lai
  if (this.timestamp > Date.now()) {
    this.timestamp = new Date();
  }
  
  next();
});

/**
 * Post-save middleware cho logging
 */
sensorDataSchema.post('save', function(doc) {
  console.log(`📊 Đã lưu sensor data: ${doc.deviceId} - Temp: ${doc.temperature}°C`);
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
