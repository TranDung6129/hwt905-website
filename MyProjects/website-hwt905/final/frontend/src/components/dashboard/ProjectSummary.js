/**
 * PROJECT SUMMARY COMPONENT
 * Bảng tổng hợp các dự án với thông tin trạng thái
 */

import React, { useState } from 'react';

const ProjectSummary = () => {
  // Real project data - only one actual project with HWT905 sensor
  const [projects] = useState([
    {
      id: 1,
      name: 'Monitoring HWT905 Sensor',
      sensors: 1,
      status: 'active',
      lastUpdate: new Date(), // Current real-time
      alerts: 0,
      sensorId: 'HWT905-001'
    }
  ]);

  const [selectedProject, setSelectedProject] = useState(projects[0]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'warning': return '#ffc107';
      case 'offline': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'warning': return 'Cảnh báo';
      case 'offline': return 'Mất kết nối';
      default: return 'Không rõ';
    }
  };

  const formatTimeAgo = (date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h trước`;
    return `${minutes}m trước`;
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    // Có thể emit event để Dashboard load data của project này
    console.log('Selected project:', project.name);
  };

  return (
    <div className="project-summary">
      <div className="project-summary-header">
        <h3>Dự án</h3>
        <div className="project-count">1 dự án (thực)</div>
      </div>

      <div className="project-list">
        {projects.map(project => (
          <div 
            key={project.id}
            className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
            onClick={() => handleProjectSelect(project)}
          >
            <div className="project-header">
              <h4 className="project-name">{project.name}</h4>
              <div 
                className="project-status"
                style={{ color: getStatusColor(project.status) }}
              >
                ●
              </div>
            </div>

            <div className="project-stats">
              <div className="stat">
                <span className="stat-label">Cảm biến:</span>
                <span className="stat-value">{project.sensors}</span>
              </div>
              
              <div className="stat">
                <span className="stat-label">Trạng thái:</span>
                <span className="stat-value">{getStatusText(project.status)}</span>
              </div>
              
              <div className="stat">
                <span className="stat-label">Cập nhật:</span>
                <span className="stat-value">{formatTimeAgo(project.lastUpdate)}</span>
              </div>
              
              {project.alerts > 0 && (
                <div className="stat alerts">
                  <span className="stat-label">Cảnh báo:</span>
                  <span className="stat-value alert-count">{project.alerts}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="project-actions">
        <button className="btn btn-primary btn-sm">
          Tạo dự án mới
        </button>
      </div>
    </div>
  );
};

export default ProjectSummary;
