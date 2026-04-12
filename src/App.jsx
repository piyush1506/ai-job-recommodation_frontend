import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Briefcase, Search, MapPin, Clock, DollarSign, Building2,
  FileText, CheckCircle, Loader2, ChevronRight, Zap, Target, Brain,
  ArrowLeft, Star, Users, TrendingUp, Filter as FilterIcon
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

// ===== NAVBAR =====
function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">⚡</div>
          JobMatch AI
        </Link>
        <div className="navbar-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/jobs" className={isActive('/jobs')}>Browse Jobs</Link>
          <Link to="/match" className={isActive('/match')}>AI Match</Link>
        </div>
      </div>
    </nav>
  );
}

// ===== FOOTER =====
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-copy">© 2026 JobMatch AI — Find your dream career with artificial intelligence.</div>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </footer>
  );
}

// ===== SKILL TAG =====
function SkillTag({ skill, variant = 'default' }) {
  return <span className={`skill-tag skill-tag-${variant}`}>{skill}</span>;
}

// ===== JOB CARD =====
function JobCard({ job, showMatch = false }) {
  const navigate = useNavigate();
  const matchClass = job.match_score >= 60 ? 'match-high' : job.match_score >= 30 ? 'match-mid' : 'match-low';

  return (
    <motion.div {...fadeIn} className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className="job-card-header">
        <div>
          <div className="job-card-title">{job.title}</div>
          <div className="job-card-company">{job.company}</div>
        </div>
        {showMatch && job.match_score != null && (
          <div className={`match-badge ${matchClass}`}>{job.match_score}% Match</div>
        )}
        {!showMatch && job.type && (
          <div className="match-badge match-low">{job.type}</div>
        )}
      </div>
      <div className="job-card-meta">
        <span><MapPin size={14} /> {job.location}</span>
        {job.salary && <span><DollarSign size={14} /> {job.salary}</span>}
        {job.experience && <span><Clock size={14} /> {job.experience}</span>}
        {job.posted && <span><Clock size={14} /> {job.posted}</span>}
      </div>
      <div className="job-card-desc">{job.description}</div>
      <div className="job-card-skills">
        {job.skills.map(s => (
          <SkillTag key={s} skill={s}
            variant={showMatch && job.matched_skills?.includes(s.toLowerCase()) ? 'match' : 'default'} />
        ))}
      </div>
    </motion.div>
  );
}

// ===== HOME PAGE =====
function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <section className="hero">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="hero-badge"><Zap size={14} /> AI-Powered Job Discovery Platform</div>
          <h1>
            Find your <span className="gradient">dream career</span><br />
            powered by AI.
          </h1>
          <p>
            Upload your resume and our machine learning engine instantly extracts your skills
            to match you with the most relevant job opportunities — just like Internshala & Indeed, but smarter.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/match')}>
              <Upload size={18} /> Upload Resume
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/jobs')}>
              <Briefcase size={18} /> Browse Jobs
            </button>
          </div>
        </motion.div>
        <div className="hero-stats">
          <div className="hero-stat"><div className="num">40+</div><div className="label">Active Jobs</div></div>
          <div className="hero-stat"><div className="num">10+</div><div className="label">Categories</div></div>
          <div className="hero-stat"><div className="num">100+</div><div className="label">Top Companies</div></div>
          <div className="hero-stat"><div className="num">AI</div><div className="label">Smart Matching</div></div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '3rem' }}>
        <div className="section-header" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <h2>How It Works</h2>
        </div>
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon"><Upload size={24} /></div>
            <h3>Upload Resume</h3>
            <p>Simply upload your PDF resume — our system accepts resumes from all industries and career levels.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Brain size={24} /></div>
            <h3>AI Skill Extraction</h3>
            <p>Our ML engine parses your resume and extracts key skills, technologies, certifications, and expertise areas.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Target size={24} /></div>
            <h3>Smart Job Matching</h3>
            <p>Skills are matched against our job database using intelligent scoring to find the best-fitting opportunities.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// ===== BROWSE JOBS PAGE =====
function BrowseJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/jobs`),
      axios.get(`${API}/categories`)
    ]).then(([jobsRes, catsRes]) => {
      setJobs(jobsRes.data);
      setFiltered(jobsRes.data);
      setCategories(['All', ...catsRes.data]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = jobs;
    if (activeCategory !== 'All') {
      result = result.filter(j => j.category === activeCategory);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q)) ||
        j.description.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [searchTerm, activeCategory, jobs]);

  return (
    <div className="page container">
      <motion.div {...fadeIn}>
        <div className="section-header">
          <h2>Browse All Jobs</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{filtered.length} jobs found</span>
        </div>

        <div className="search-section">
          <div className="search-bar">
            <div className="search-input-wrap">
              <Search size={18} />
              <input
                className="search-input"
                placeholder="Search by job title, company, skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-row">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="jobs-grid">
          {loading ? (
            <div className="empty-state"><Loader2 size={40} className="spinner" /><p>Loading jobs...</p></div>
          ) : filtered.length > 0 ? (
            filtered.map(job => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="empty-state"><Search size={48} /><p>No jobs match your search. Try different keywords.</p></div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ===== JOB DETAIL PAGE =====
function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    axios.get(`${API}/jobs/${id}`).then(res => setJob(res.data)).catch(() => navigate('/jobs'));
  }, [id]);

  if (!job) return <div className="page container"><div className="empty-state"><Loader2 size={40} className="spinner" /></div></div>;

  return (
    <div className="page container">
      <motion.div {...fadeIn} className="job-detail">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="job-detail-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1>{job.title}</h1>
              <div className="company">{job.company}</div>
            </div>
            {job.type && <div className="match-badge match-low" style={{ fontSize: '0.85rem' }}>{job.type}</div>}
          </div>
          <div className="job-meta-grid">
            <div className="job-meta-item"><MapPin size={16} /> {job.location}</div>
            {job.salary && <div className="job-meta-item"><DollarSign size={16} /> {job.salary}</div>}
            {job.experience && <div className="job-meta-item"><Clock size={16} /> {job.experience}</div>}
            {job.category && <div className="job-meta-item"><Building2 size={16} /> {job.category}</div>}
          </div>
        </div>

        <div className="job-section">
          <h2>Description</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{job.description}</p>
        </div>

        {job.requirements && (
          <div className="job-section">
            <h2>Requirements</h2>
            <ul>{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        )}

        <div className="job-section">
          <h2>Required Skills</h2>
          <div className="job-card-skills" style={{ marginTop: '0.5rem' }}>
            {job.skills.map(s => <SkillTag key={s} skill={s} variant="accent" />)}
          </div>
        </div>

        <button className="btn btn-primary btn-lg btn-block" style={{ marginTop: '1rem' }}>
          Apply Now <ChevronRight size={18} />
        </button>
      </motion.div>
    </div>
  );
}

// ===== AI MATCH PAGE =====
function MatchPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (f && (f.type === 'application/pdf' || f.type.startsWith('image/'))) {
      setFile(f);
      setError(null);
      setLoading(true);
      const formData = new FormData();
      formData.append('file', f);
      try {
        const res = await axios.post(`${API}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Something went wrong.');
        setFile(null);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please upload a valid PDF or Image file (.png, .jpg).');
      setFile(null);
    }
  };

  const reset = () => { setData(null); setFile(null); setError(null); };

  return (
    <div className="page container">
      <AnimatePresence mode="wait">
        {!data ? (
          <motion.div key="upload" {...fadeIn} style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                AI Resume Matcher
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Upload your resume and discover jobs tailored to your skills
              </p>
            </div>

            <label className={`upload-zone ${loading ? 'loading' : ''}`} style={loading ? { pointerEvents: 'none', opacity: 0.7 } : {}}>
              <input type="file" onChange={handleFileChange} accept=".pdf,image/png,image/jpeg" disabled={loading} />
              <div className="upload-zone-icon">
                {loading ? <Loader2 size={36} className="spinner" style={{ color: 'var(--primary)' }} /> : <Upload size={28} />}
              </div>
              <h3>{loading ? 'Analyzing your resume...' : 'Click to upload your resume'}</h3>
              <p>PDF, PNG, JPG • Max 10MB</p>
            </label>

            {error && <div className="warning-box" style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.15)', color: 'var(--red)' }}>⚠️ {error}</div>}
          </motion.div>
        ) : (
          <motion.div key="results" {...fadeIn}>
            <div className="results-header">
              <div className="results-header-left">
                <div className="results-icon"><CheckCircle size={20} /></div>
                <div>
                  <div className="subtitle">Analysis Complete</div>
                  <div className="filename">{data.filename}</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={reset}>Upload New</button>
            </div>

            {data.warning && <div className="warning-box">⚠️ {data.warning}</div>}

            <div style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                <h2 style={{ fontSize: '1.15rem' }}>🔍 Detected Skills ({data.keywords.length})</h2>
              </div>
              <div className="job-card-skills">
                {data.keywords.length > 0
                  ? data.keywords.map(kw => <SkillTag key={kw} skill={kw} variant="accent" />)
                  : <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills detected. Please try a different resume.</p>
                }
              </div>
            </div>

            <div>
              <div className="section-header">
                <h2 style={{ fontSize: '1.15rem' }}>💼 Recommended Jobs ({data.recommendations.length})</h2>
              </div>
              <div className="jobs-grid">
                {data.recommendations.length > 0 ? (
                  data.recommendations.map(job => <JobCard key={job.id} job={job} showMatch />)
                ) : (
                  <div className="empty-state"><Briefcase size={48} /><p>No matching jobs found for your skill set.</p></div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ===== APP =====
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<BrowseJobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/match" element={<MatchPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
