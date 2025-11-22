/**
 * GIAI ĐOẠN 4: SENSOR DATA MODEL
 * Chương 8: Mongoose Schema và Model definition
 */

const mongoose = require('mongoose');

/**
 * Schema cho dữ liệu HWT905 và SHM
 * Thiết kế để lưu trữ dữ liệu giám sát công trình xây dựng với format mới
 */
const sensorDataSchema = new mongoose.Schema({
  // Dữ liệu gia tốc HWT905 (thô và đã lọc)
  ax: {
    type: Number,
    required: false,
    min: [-16, 'Acceleration X ngoài phạm vi'],
    max: [16, 'Acceleration X ngoài phạm vi']
  },
  
  ay: {
    type: Number,
    required: false,
    min: [-16, 'Acceleration Y ngoài phạm vi'],
    max: [16, 'Acceleration Y ngoài phạm vi']
  },
  
  az: {
    type: Number,
    required: false,
    min: [-16, 'Acceleration Z ngoài phạm vi'],
    max: [16, 'Acceleration Z ngoài phạm vi']
  },
  
  acc_x_filtered: {
    type: Number,
    required: false
  },
  
  acc_y_filtered: {
    type: Number,
    required: false
  },
  
  acc_z_filtered: {
    type: Number,
    required: false
  },
  
  // Dữ liệu vận tốc
  vel_x: {
    type: Number,
    required: false
  },
  
  vel_y: {
    type: Number,
    required: false
  },
  
  vel_z: {
    type: Number,
    required: false
  },
  
  velocity_magnitude: {
    type: Number,
    required: false,
    min: [0, 'Velocity magnitude không thể âm']
  },
  
  velocity_magnitude_mm_s: {
    type: Number,
    required: false,
    min: [0, 'Velocity magnitude mm/s không thể âm']
  },
  
  // Dữ liệu chuyển vị
  disp_x: {
    type: Number,
    required: false
  },
  
  disp_y: {
    type: Number,
    required: false
  },
  
  disp_z: {
    type: Number,
    required: false
  },
  
  displacement_magnitude: {
    type: Number,
    required: false,
    min: [0, 'Displacement magnitude không thể âm']
  },
  
  // Dữ liệu tần số
  dominant_freq_x: {
    type: Number,
    required: false,
    min: [0, 'Dominant frequency X không thể âm']
  },
  
  dominant_freq_y: {
    type: Number,
    required: false,
    min: [0, 'Dominant frequency Y không thể âm']
  },
  
  dominant_freq_z: {
    type: Number,
    required: false,
    min: [0, 'Dominant frequency Z không thể âm']
  },
  
  overall_dominant_frequency: {
    type: Number,
    required: false,
    min: [0, 'Overall dominant frequency không thể âm']
  },
  
  // Các thông số SHM đã tính toán
  totalAcceleration: {
    type: Number,
    required: false,
    min: [0, 'Total acceleration không thể âm'],
    max: [20, 'Total acceleration quá cao']
  },
  
  tiltAngle: {
    type: Number,
    required: false,
    min: [0, 'Tilt angle không thể âm'],
    max: [45, 'Tilt angle quá cao']
  },
  
  vibrationIntensity: {
    type: Number,
    required: false,
    min: [0, 'Vibration intensity không thể âm'],
    max: [100, 'Vibration intensity quá cao']
  },
  
  structuralDisplacement: {
    type: Number,
    required: false,
    min: [0, 'Structural displacement không thể âm'],
    max: [50, 'Structural displacement quá cao']
  },
  
  dominantFrequency: {
    type: Number,
    required: false,
    min: [0, 'Dominant frequency không thể âm'],
    max: [50, 'Dominant frequency quá cao']
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
    default: 'Unknown Location',
    trim: true
  },
  
  // HWT905 metadata
  sample_count: {
    type: Number,
    required: false
  },
  
  strategy: {
    type: String,
    required: false,
    trim: true
  },
  
  rls_warmed_up: {
    type: Boolean,
    required: false,
    default: false
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
        avgTotalAcceleration: { $avg: '$totalAcceleration' },
        avgTiltAngle: { $avg: '$tiltAngle' },
        avgVibrationIntensity: { $avg: '$vibrationIntensity' },
        avgStructuralDisplacement: { $avg: '$structuralDisplacement' },
        maxTotalAcceleration: { $max: '$totalAcceleration' },
        minTotalAcceleration: { $min: '$totalAcceleration' },
        maxTiltAngle: { $max: '$tiltAngle' },
        maxVibrationIntensity: { $max: '$vibrationIntensity' },
        maxStructuralDisplacement: { $max: '$structuralDisplacement' },
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
  // Làm tròn số để tối ưu storage cho dữ liệu HWT905
  const fieldsToRound = [
    'ax', 'ay', 'az', 'acc_x_filtered', 'acc_y_filtered', 'acc_z_filtered',
    'vel_x', 'vel_y', 'vel_z', 'velocity_magnitude', 'velocity_magnitude_mm_s',
    'disp_x', 'disp_y', 'disp_z', 'displacement_magnitude',
    'dominant_freq_x', 'dominant_freq_y', 'dominant_freq_z', 'overall_dominant_frequency',
    'totalAcceleration', 'tiltAngle', 'vibrationIntensity', 'structuralDisplacement', 'dominantFrequency'
  ];
  
  fieldsToRound.forEach(field => {
    if (this[field] !== undefined && this[field] !== null) {
      // Sử dụng độ chính xác cao hơn cho các giá trị nhỏ
      if (Math.abs(this[field]) < 0.001) {
        this[field] = Math.round(this[field] * 1000000) / 1000000; // 6 decimal places
      } else if (Math.abs(this[field]) < 1) {
        this[field] = Math.round(this[field] * 10000) / 10000; // 4 decimal places
      } else {
        this[field] = Math.round(this[field] * 100) / 100; // 2 decimal places
      }
    }
  });
  
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
  // Log only occasionally to reduce spam (every 100th record)
  if (!sensorDataSchema.statics._saveCount) {
    sensorDataSchema.statics._saveCount = 0;
  }
  sensorDataSchema.statics._saveCount++;
  if (sensorDataSchema.statics._saveCount % 100 === 0) {
    console.log(`📊 Đã lưu ${sensorDataSchema.statics._saveCount} IMU records - Latest: ${doc.deviceId} - Total Acc: ${doc.totalAcceleration?.toFixed(3)}m/s², Tilt: ${doc.tiltAngle?.toFixed(1)}°`);
  }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
