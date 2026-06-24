import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Search,
  Filter,
  Database,
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Layers,
  GraduationCap
} from 'lucide-react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  // State variables
  const [registrations, setRegistrations] = useState([]);
  const [dbStatus, setDbStatus] = useState('connecting'); // connecting, connected, offline_fallback, error
  const [backendOnline, setBackendOnline] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    technology: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [alert, setAlert] = useState(null);

  // Tech options
  const techOptions = [
    "Full Stack Development",
    "Frontend React Developer",
    "Backend Node.js Engineer",
    "AI & Data Science",
    "Mobile App Development",
    "UI/UX Design"
  ];

  // Fetch all registrations and status on mount
  useEffect(() => {
    fetchStatus();
    fetchRegistrations();
  }, []);

  // Fetch status of the backend
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/status`);
      if (response.ok) {
        const data = await response.json();
        setBackendOnline(true);
        setDbStatus(data.dbStatus);
      } else {
        setBackendOnline(false);
        setDbStatus('error');
      }
    } catch (error) {
      console.error("Backend status check failed:", error);
      setBackendOnline(false);
      setDbStatus('error');
    }
  };

  // Fetch registrations from database
  const fetchRegistrations = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${API_BASE}/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data || []);
        if (data.dbStatus) {
          setDbStatus(data.dbStatus);
          setBackendOnline(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch registrations:", error);
      // We don't crash, we just let status show it's offline
    } finally {
      setIsFetching(false);
    }
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Proactive validation clearing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email Address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.technology) {
      errors.technology = 'Please select a technology path';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      triggerNotification('warning', 'Please correct the validation errors first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Add record to top of UI state
        setRegistrations(prev => [data.data, ...prev]);

        // Reset form
        setFormData({
          name: '',
          email: '',
          technology: ''
        });

        triggerNotification(
          'success',
          data.dbStatus === 'connected'
            ? 'Registration successful! Candidate saved to MongoDB database.'
            : 'Registration recorded! Running in offline-sandbox mode.'
        );

        // Keep DB status updated
        setDbStatus(data.dbStatus);
        setBackendOnline(true);
      } else {
        triggerNotification('danger', data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error("Submission error:", error);
      triggerNotification(
        'danger',
        'Could not reach server. Please check if the Node.js backend is running on Port 5000.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger auto-dismiss alert
  const triggerNotification = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  // Tech Badge class resolver
  const getTechBadgeClass = (tech) => {
    if (!tech) return 'tech-badge';
    const t = tech.toLowerCase();
    if (t.includes('full')) return 'tech-badge fullstack';
    if (t.includes('front')) return 'tech-badge frontend';
    if (t.includes('back') || t.includes('node')) return 'tech-badge backend';
    if (t.includes('ai') || t.includes('data')) return 'tech-badge ai';
    if (t.includes('mobile')) return 'tech-badge mobile';
    if (t.includes('ui') || t.includes('ux') || t.includes('design')) return 'tech-badge design';
    return 'tech-badge';
  };

  // Avatar styles resolver (hash code of name to choose solid color)
  const getAvatarStyle = (name) => {
    const char = name ? name.trim().charAt(0).toUpperCase() : 'A';
    const charCode = char.charCodeAt(0);
    const colors = [
      '#1e3a8a', // Navy Blue
      '#0d9488', // Sea Green
      '#0ea5e9', // Sky Blue
      '#1e40af', // Navy variant
      '#0f766e', // Sea Green variant
      '#0284c7'  // Sky Blue variant
    ];
    return { backgroundColor: colors[charCode % colors.length] };
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter & Search Logic
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterTech === '' || reg.technology === filterTech;

    return matchesSearch && matchesFilter;
  });

  // Calculate Tech Counts
  const techCounts = registrations.reduce((acc, curr) => {
    acc[curr.technology] = (acc[curr.technology] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="app-container">
      {/* Header Panel */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">TahaDev Hub</div>
        </div>

        <div className="status-badge" title={
          dbStatus === 'connected'
            ? 'Connected to live MongoDB database.'
            : dbStatus === 'offline_fallback'
              ? 'MongoDB connection could not be established. Operating with server-side JSON fallback.'
              : 'Checking server connection...'
        }>
          <div className={`status-dot ${!backendOnline ? 'offline' : dbStatus === 'connected' ? 'connected' : 'offline'
            }`}></div>
          <span>
            {!backendOnline ? 'Backend Offline' : dbStatus === 'connected' ? 'MongoDB Connected' : 'Local Fallback Storage Active'}
          </span>
        </div>
      </header>

      {/* Main Alert Notification Container */}
      {alert && (
        <div className={`alert-banner ${alert.type === 'success' ? 'success' : alert.type === 'warning' ? 'warning' : 'info'}`}>
          {alert.type === 'success' && <CheckCircle size={20} />}
          {alert.type === 'warning' && <AlertTriangle size={20} />}
          {alert.type === 'danger' && <AlertTriangle size={20} style={{ color: 'var(--danger-color)' }} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Connection Failure instructions */}
      {!backendOnline && (
        <div className="alert-banner warning" style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}>
          <Server size={20} />
          <span>
            <strong>Server connection error:</strong> The Node.js Express server is offline. Please make sure the backend server is running on port 5000 to enable registrations.
          </span>
        </div>
      )}

      {/* Main Layout Grid */}
      <main className="main-content">

        {/* Left Column: Form Card */}
        <section className="glass-card">
          <div className="card-title-sec">
            <h2 className="card-title">
              <GraduationCap size={28} className="primary-color" style={{ color: 'var(--primary-color)' }} />
              Internship Registration
            </h2>
            <p className="card-subtitle">
              Secure your spot! Join our premium technical training program by filling out your details below.
            </p>
          </div>

          <form className="registration-form" onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                <User size={16} /> Full Name
              </label>
              <div className="form-input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. Muhammad Taha Nawab"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !backendOnline}
                />
                <User className="form-icon" size={18} />
              </div>
              {formErrors.name && (
                <span className="error-text">
                  <AlertTriangle size={12} /> {formErrors.name}
                </span>
              )}
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                <Mail size={16} /> Email Address
              </label>
              <div className="form-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="e.g. taha@tahadev.com"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !backendOnline}
                />
                <Mail className="form-icon" size={18} />
              </div>
              {formErrors.email && (
                <span className="error-text">
                  <AlertTriangle size={12} /> {formErrors.email}
                </span>
              )}
            </div>

            {/* Technology Dropdown */}
            <div className="form-group">
              <label className="form-label" htmlFor="technology">
                <Briefcase size={16} /> Tech Specialization
              </label>
              <div className="form-input-wrapper">
                <select
                  id="technology"
                  name="technology"
                  className="form-input form-select"
                  value={formData.technology}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !backendOnline}
                >
                  <option value="" disabled hidden>Select your technology stack</option>
                  {techOptions.map((option, idx) => (
                    <option key={idx} value={option} style={{ background: 'var(--input-bg-focus)', color: 'var(--text-primary)' }}>
                      {option}
                    </option>
                  ))}
                </select>
                <Layers className="form-icon" size={18} />
                <span className="select-arrow">▼</span>
              </div>
              {formErrors.technology && (
                <span className="error-text">
                  <AlertTriangle size={12} /> {formErrors.technology}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting || !backendOnline}
            >
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Processing Registration...</span>
                </>
              ) : (
                <>
                  <span>Submit Registration</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column: Registrants & Analytics */}
        <section className="glass-card">
          <div className="card-title-sec">
            <h2 className="card-title">
              <Database size={28} className="secondary-color" style={{ color: 'var(--secondary-color)' }} />
              Registered Candidates
            </h2>
            <p className="card-subtitle">
              Monitor, filter, and review applications in real time as they arrive.
            </p>
          </div>

          {/* Quick Analytics Counters */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon-box purple">
                <GraduationCap size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{registrations.length}</span>
                <span className="stat-label">Total Applicants</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-box cyan">
                <Briefcase size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{Object.keys(techCounts).length}</span>
                <span className="stat-label">Stacks Chosen</span>
              </div>
            </div>
          </div>

          {/* Toolbar Search & Filters */}
          <div className="toolbar">
            <div className="search-box-wrapper">
              <input
                type="text"
                placeholder="Search candidates by name or email..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="search-icon" size={18} />
            </div>

            <select
              className="filter-select"
              value={filterTech}
              onChange={(e) => setFilterTech(e.target.value)}
            >
              <option value="">All Technologies</option>
              {techOptions.map((option, idx) => (
                <option key={idx} value={option} style={{ background: 'var(--input-bg-focus)', color: 'var(--text-primary)' }}>
                  {option}
                </option>
              ))}
            </select>

            <button
              className="status-badge"
              onClick={fetchRegistrations}
              disabled={isFetching}
              title="Refresh database"
              style={{ cursor: 'pointer', padding: '0.75rem' }}
            >
              <RefreshCw size={16} className={isFetching ? "btn-spinner" : ""} />
            </button>
          </div>

          {/* Registrants List container */}
          <div className="registrations-container">
            {isFetching && registrations.length === 0 ? (
              <div className="no-records-card">
                <RefreshCw className="btn-spinner" size={32} />
                <p>Loading candidate list...</p>
              </div>
            ) : filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((candidate) => (
                <div key={candidate._id} className="record-card">
                  <div className="record-main">
                    <div className="avatar-box" style={getAvatarStyle(candidate.name)}>
                      {candidate.name ? candidate.name.trim().charAt(0) : 'U'}
                    </div>
                    <div className="record-details">
                      <span className="record-name">{candidate.name}</span>
                      <span className="record-email">{candidate.email}</span>
                    </div>
                  </div>

                  <div className="record-meta">
                    <span className={getTechBadgeClass(candidate.technology)}>
                      {candidate.technology}
                    </span>
                    <span className="record-date">
                      {formatDate(candidate.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-records-card">
                <Info size={32} className="no-records-icon" />
                <p>
                  {searchTerm || filterTech
                    ? "No registered candidates match your search filters."
                    : "No candidates registered yet. Be the first to register!"}
                </p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* App Footer */}
      <footer className="app-footer">
        <p>© 2026 TahaDev Hub. Powered by React, Node.js, Express & MongoDB.</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          Designed with premium clean aesthetics. View the local registry backup file inside the <a href="file:///d:/Internships/Codiora/TASK1/backend/registrations_backup.json" className="footer-link">backend folder</a>.
        </p>
      </footer>
    </div>
  );
}

export default App;
