/**
 * PROJECT MANAGEMENT PAGE
 * Manage projects, sensors, and construction blueprints
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const ProjectManagementPage = () => {
  const { showNotification, sidebarOpen } = useApp();
  
  const [activeTab, setActiveTab] = useState('projects');
  // Only one real project with actual HWT905 sensor
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'HWT905 Sensor Monitoring',
      description: 'Real-time structural health monitoring using HWT905 IMU sensor',
      status: 'active',
      created: new Date('2024-11-19'), // Today's date
      sensors: 1,
      blueprint: null
    }
  ]);

  // Only one real HWT905 sensor
  const [sensors, setSensors] = useState([
    {
      id: 'HWT905-001',
      projectId: 1,
      name: 'Primary HWT905 IMU Sensor',
      position: { x: 0, y: 0, z: 0 }, // Reference position
      status: 'online',
      batteryLevel: 100, // Assuming connected via USB/power
      lastMaintenance: new Date('2024-11-19')
    }
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingSensor, setEditingSensor] = useState(null);

  const tabs = [
    { id: 'projects', label: 'Dự án' },
    { id: 'sensors', label: 'Cảm biến' },
    { id: 'blueprints', label: 'Bản vẽ' }
  ];

  const handleCreateProject = () => {
    setEditingProject({
      id: null,
      name: '',
      description: '',
      status: 'active',
      sensors: 0,
      blueprint: null
    });
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleSaveProject = (projectData) => {
    if (projectData.id) {
      // Update existing project
      setProjects(prev => prev.map(p => p.id === projectData.id ? projectData : p));
      showNotification('Dự án đã được cập nhật', 'success');
    } else {
      // Create new project
      const newProject = {
        ...projectData,
        id: Math.max(...projects.map(p => p.id)) + 1,
        created: new Date(),
        sensors: 0
      };
      setProjects(prev => [...prev, newProject]);
      showNotification('Dự án đã được tạo', 'success');
    }
    setShowProjectModal(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Bạn có chắc muốn xóa dự án này?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setSensors(prev => prev.filter(s => s.projectId !== projectId));
      showNotification('Dự án đã được xóa', 'success');
    }
  };

  const handleCreateSensor = () => {
    setEditingSensor({
      id: '',
      projectId: selectedProject || projects[0]?.id,
      name: '',
      position: { x: 0, y: 0, z: 0 },
      status: 'online',
      batteryLevel: 100,
      lastMaintenance: new Date()
    });
    setShowSensorModal(true);
  };

  const handleEditSensor = (sensor) => {
    setEditingSensor(sensor);
    setShowSensorModal(true);
  };

  const handleSaveSensor = (sensorData) => {
    if (sensors.find(s => s.id === sensorData.id && s.id !== editingSensor?.id)) {
      showNotification('ID cảm biến đã tồn tại', 'error');
      return;
    }

    if (editingSensor && sensors.find(s => s.id === editingSensor.id)) {
      // Update existing sensor
      setSensors(prev => prev.map(s => s.id === editingSensor.id ? sensorData : s));
      showNotification('Cảm biến đã được cập nhật', 'success');
    } else {
      // Create new sensor
      setSensors(prev => [...prev, sensorData]);
      showNotification('Cảm biến đã được thêm', 'success');
      
      // Update project sensor count
      setProjects(prev => prev.map(p => 
        p.id === sensorData.projectId 
          ? { ...p, sensors: sensors.filter(s => s.projectId === p.id).length + 1 }
          : p
      ));
    }
    setShowSensorModal(false);
    setEditingSensor(null);
  };

  const handleDeleteSensor = (sensorId) => {
    if (window.confirm('Bạn có chắc muốn xóa cảm biến này?')) {
      const sensor = sensors.find(s => s.id === sensorId);
      setSensors(prev => prev.filter(s => s.id !== sensorId));
      
      // Update project sensor count
      if (sensor) {
        setProjects(prev => prev.map(p => 
          p.id === sensor.projectId 
            ? { ...p, sensors: Math.max(0, p.sensors - 1) }
            : p
        ));
      }
      
      showNotification('Cảm biến đã được xóa', 'success');
    }
  };

  const handleBlueprintUpload = (projectId, file) => {
    // Simulate file upload
    console.log(`Uploading blueprint for project ${projectId}:`, file.name);
    
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, blueprint: file.name } : p
    ));
    showNotification('Bản vẽ đã được tải lên', 'success');
  };

  const renderProjectsTab = () => (
    <div className="projects-section">
      <div className="section-header">
        <h3>Quản lý dự án</h3>
        <button className="btn btn-primary" onClick={handleCreateProject}>
          Tạo dự án mới
        </button>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <div key={project.id} className="project-card">
            <div className="project-header">
              <h4>{project.name}</h4>
              <div className={`project-status ${project.status}`}>
                {project.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
              </div>
            </div>
            
            <p className="project-description">{project.description}</p>
            
            <div className="project-stats">
              <div className="stat">
                <span>Cảm biến:</span>
                <strong>{project.sensors}</strong>
              </div>
              <div className="stat">
                <span>Tạo lúc:</span>
                <strong>{project.created.toLocaleDateString('vi-VN')}</strong>
              </div>
            </div>

            <div className="project-blueprint">
              {project.blueprint ? (
                <span className="blueprint-file">{project.blueprint}</span>
              ) : (
                <span className="no-blueprint">Chưa có bản vẽ</span>
              )}
            </div>

            <div className="project-actions">
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setSelectedProject(project.id)}
              >
                Xem cảm biến
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => handleEditProject(project)}
              >
                Chỉnh sửa
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteProject(project.id)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSensorsTab = () => {
    const projectSensors = selectedProject 
      ? sensors.filter(s => s.projectId === selectedProject)
      : sensors;

    return (
      <div className="sensors-section">
        <div className="section-header">
          <h3>Quản lý cảm biến</h3>
          <div className="header-controls">
            <select 
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : null)}
              className="form-select"
            >
              <option value="">Tất cả dự án</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleCreateSensor}>
              Thêm cảm biến
            </button>
          </div>
        </div>

        <div className="sensors-table">
          <table>
            <thead>
              <tr>
                <th>ID cảm biến</th>
                <th>Tên</th>
                <th>Dự án</th>
                <th>Vị trí (x,y,z)</th>
                <th>Trạng thái</th>
                <th>Pin (%)</th>
                <th>Bảo trì cuối</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {projectSensors.map(sensor => {
                const project = projects.find(p => p.id === sensor.projectId);
                return (
                  <tr key={sensor.id}>
                    <td>{sensor.id}</td>
                    <td>{sensor.name}</td>
                    <td>{project?.name}</td>
                    <td>{sensor.position.x}, {sensor.position.y}, {sensor.position.z}</td>
                    <td>
                      <span className={`status-badge ${sensor.status}`}>
                        {sensor.status === 'online' ? 'Trực tuyến' : 
                         sensor.status === 'warning' ? 'Cảnh báo' : 'Mất kết nối'}
                      </span>
                    </td>
                    <td>
                      <span className={sensor.batteryLevel < 30 ? 'low-battery' : ''}>
                        {sensor.batteryLevel}%
                      </span>
                    </td>
                    <td>{sensor.lastMaintenance.toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEditSensor(sensor)}
                      >
                        Sửa
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteSensor(sensor.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBlueprintsTab = () => (
    <div className="blueprints-section">
      <div className="section-header">
        <h3>Quản lý bản vẽ</h3>
      </div>

      <div className="blueprints-grid">
        {projects.map(project => (
          <div key={project.id} className="blueprint-card">
            <h4>{project.name}</h4>
            
            <div className="blueprint-content">
              {project.blueprint ? (
                <div className="blueprint-file">
                  <div className="file-info">
                    <span className="file-name">{project.blueprint}</span>
                    <span className="file-type">
                      {project.blueprint.split('.').pop()?.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="no-blueprint">
                  <div className="upload-placeholder">
                    <span>Chưa có bản vẽ</span>
                    <p>Tải lên bản vẽ xây dựng (.dwg, .pdf, .jpg)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="blueprint-actions">
              <label className="btn btn-primary file-upload-btn">
                {project.blueprint ? 'Thay thế' : 'Tải lên'}
                <input
                  type="file"
                  accept=".dwg,.pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleBlueprintUpload(project.id, file);
                  }}
                  style={{ display: 'none' }}
                />
              </label>
              
              {project.blueprint && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => console.log(`Viewing ${project.blueprint}`)}
                >
                  Xem
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Navbar />
      <div className="layout-container">
        <Sidebar />
        
        <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
          <div className="project-management-page">
            {/* Page Header */}
            <div className="page-header">
              <h1>Quản lý dự án</h1>
              <p>Quản lý các dự án giám sát, cảm biến và bản vẽ xây dựng</p>
            </div>

            {/* Management Tabs */}
            <div className="management-tabs">
              <div className="tab-list">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === 'projects' && renderProjectsTab()}
                {activeTab === 'sensors' && renderSensorsTab()}
                {activeTab === 'blueprints' && renderBlueprintsTab()}
              </div>
            </div>

            {/* Project Modal */}
            {showProjectModal && (
              <ProjectModal
                project={editingProject}
                onSave={handleSaveProject}
                onClose={() => {
                  setShowProjectModal(false);
                  setEditingProject(null);
                }}
              />
            )}

            {/* Sensor Modal */}
            {showSensorModal && (
              <SensorModal
                sensor={editingSensor}
                projects={projects}
                onSave={handleSaveSensor}
                onClose={() => {
                  setShowSensorModal(false);
                  setEditingSensor(null);
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Project Modal Component
const ProjectModal = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState(project);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên dự án');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{project.id ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên dự án:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mô tả:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="form-textarea"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <label>Trạng thái:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="form-select"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {project.id ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sensor Modal Component
const SensorModal = ({ sensor, projects, onSave, onClose }) => {
  const [formData, setFormData] = useState(sensor);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id.trim()) {
      alert('Vui lòng nhập ID cảm biến');
      return;
    }
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên cảm biến');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{sensor.id && sensor.id !== '' ? 'Chỉnh sửa cảm biến' : 'Thêm cảm biến mới'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>ID cảm biến:</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                className="form-input"
                placeholder="HWT905-001"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Tên cảm biến:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Dự án:</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData(prev => ({ ...prev, projectId: parseInt(e.target.value) }))}
              className="form-select"
              required
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Vị trí X (m):</label>
              <input
                type="number"
                value={formData.position.x}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: { ...prev.position, x: parseFloat(e.target.value) || 0 }
                }))}
                className="form-input"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Vị trí Y (m):</label>
              <input
                type="number"
                value={formData.position.y}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: { ...prev.position, y: parseFloat(e.target.value) || 0 }
                }))}
                className="form-input"
                step="0.1"
              />
            </div>
            
            <div className="form-group">
              <label>Vị trí Z (m):</label>
              <input
                type="number"
                value={formData.position.z}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: { ...prev.position, z: parseFloat(e.target.value) || 0 }
                }))}
                className="form-input"
                step="0.1"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {sensor.id && sensor.id !== '' ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectManagementPage;
