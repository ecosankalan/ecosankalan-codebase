import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import BottomNav from '../components/common/BottomNav';
import { getAdminStats, createBin, createEvent, bulkImportVouchers } from '../services/api';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Forms state
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'bins', 'events', 'vouchers'
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBin = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await createBin({
        name: fd.get('name'),
        address: fd.get('address'),
        location: {
          type: 'Point',
          coordinates: [parseFloat(fd.get('lng')), parseFloat(fd.get('lat'))]
        },
        types: fd.get('types').split(',').map(s => s.trim()),
        capacityStatus: 'low'
      });
      setSuccessMsg('Bin created successfully!');
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await createEvent({
        title: fd.get('title'),
        description: fd.get('description'),
        address: fd.get('address'),
        location: {
          type: 'Point',
          coordinates: [parseFloat(fd.get('lng')), parseFloat(fd.get('lat'))]
        },
        eventDate: fd.get('date'),
        organiser: fd.get('organiser'),
        bonusPoints: parseInt(fd.get('points'))
      });
      setSuccessMsg('Event created successfully!');
      e.target.reset();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImportVouchers = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const jsonStr = fd.get('jsonPayload');
      const vouchers = JSON.parse(jsonStr);
      const { data } = await bulkImportVouchers(vouchers);
      setSuccessMsg(`Imported ${data.insertedCount} vouchers. Skipped ${data.duplicateCount} duplicates.`);
      e.target.reset();
    } catch (err) {
      setError(err.message || 'Invalid JSON or upload failed');
    }
  };

  const cardStyle = {
    background: 'var(--surface-container)',
    padding: '1.5rem',
    borderRadius: '16px',
    marginBottom: '1rem',
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', marginBottom: '1rem',
    borderRadius: '8px', border: '1px solid var(--outline-variant)',
    background: 'var(--surface)', color: 'var(--on-surface)'
  };

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', paddingBottom: '80px' }}>
      <Navbar />
      <main style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--on-surface)' }}>Admin Dashboard</h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {['stats', 'bins', 'events', 'vouchers'].map(tab => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab); setError(''); setSuccessMsg(''); }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '99px',
                border: 'none',
                background: activeTab === tab ? 'var(--primary)' : 'var(--surface-variant)',
                color: activeTab === tab ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                textTransform: 'capitalize',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {error && <div className="log-error-banner"><span className="material-symbols-outlined">error</span>{error}</div>}
        {successMsg && <div className="vr-alert success"><span className="material-symbols-outlined">check_circle</span>{successMsg}</div>}

        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...cardStyle, background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)', color: 'var(--on-primary)' }}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">monitoring</span> Platform Overview
              </h2>
              <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1.5rem' }}>Live analysis of EcoSankalan's impact and engagement.</p>
              
              {loading ? <p><span className="material-symbols-outlined log-spin">progress_activity</span> Fetching live data...</p> : stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Users</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalUsers}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Waste Logged</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalWasteKg} <span style={{fontSize: '1rem', fontWeight: 'normal'}}>kg</span></p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Events Held</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalEventsConducted}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Challenges</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalChallengeCompletions}</p>
                  </div>
                </div>
              ) : <p>No data available</p>}
            </div>

            {/* Analysis card */}
            {stats && (
              <div style={cardStyle}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{color: 'var(--primary)'}}>insights</span> Engagement Analysis
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      <span>User Participation Rate</span>
                      <span style={{fontWeight: 'bold'}}>{Math.min(100, Math.round((stats.totalChallengeCompletions / (stats.totalUsers || 1)) * 100))}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (stats.totalChallengeCompletions / (stats.totalUsers || 1)) * 100)}%`, height: '100%', background: 'var(--primary)' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      <span>Waste Logs per User</span>
                      <span style={{fontWeight: 'bold'}}>{(stats.totalWasteKg / (stats.totalUsers || 1)).toFixed(1)} kg</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-variant)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (stats.totalWasteKg / (stats.totalUsers || 1)) * 10)}%`, height: '100%', background: 'var(--secondary)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={loadStats}
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', background: 'var(--surface-variant)', color: 'var(--on-surface-variant)', border: 'none', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              <span className={`material-symbols-outlined ${loading ? 'log-spin' : ''}`}>sync</span> Refresh Live Data
            </button>
          </div>
        )}

        {activeTab === 'bins' && (
          <div style={cardStyle}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Add New Bin</h2>
            <form onSubmit={handleCreateBin}>
              <input name="name" placeholder="Bin Name (e.g. Dry Waste Hub)" required style={inputStyle} />
              <input name="address" placeholder="Address" required style={inputStyle} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input name="lat" type="number" step="any" placeholder="Latitude" required style={inputStyle} />
                <input name="lng" type="number" step="any" placeholder="Longitude" required style={inputStyle} />
              </div>
              <input name="types" placeholder="Types (comma separated: plastic, paper)" required style={inputStyle} />
              <button type="submit" style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '8px' }}>
                Create Bin
              </button>
            </form>
          </div>
        )}

        {activeTab === 'events' && (
          <div style={cardStyle}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Add New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <input name="title" placeholder="Event Title" required style={inputStyle} />
              <textarea name="description" placeholder="Description" required style={{...inputStyle, height: '80px'}} />
              <input name="address" placeholder="Address" required style={inputStyle} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input name="lat" type="number" step="any" placeholder="Latitude" required style={inputStyle} />
                <input name="lng" type="number" step="any" placeholder="Longitude" required style={inputStyle} />
              </div>
              <input name="date" type="datetime-local" required style={inputStyle} />
              <input name="organiser" placeholder="Organiser Name" required style={inputStyle} />
              <input name="points" type="number" placeholder="Bonus Points (e.g. 100)" required style={inputStyle} />
              <button type="submit" style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '8px' }}>
                Create Event
              </button>
            </form>
          </div>
        )}

        {activeTab === 'vouchers' && (
          <div style={cardStyle}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Bulk Import Vouchers</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--outline)', marginBottom: '1rem' }}>
              Paste a JSON array of vouchers. e.g. <br/>
              <code>{`[{"code": "XYZ123", "partnerName": "Amazon", "discountLabel": "10% OFF"}]`}</code>
            </p>
            <form onSubmit={handleImportVouchers}>
              <textarea name="jsonPayload" placeholder="JSON Array..." required style={{...inputStyle, height: '150px', fontFamily: 'monospace'}} />
              <button type="submit" style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: 'var(--on-primary)', border: 'none', borderRadius: '8px' }}>
                Import Vouchers
              </button>
            </form>
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
