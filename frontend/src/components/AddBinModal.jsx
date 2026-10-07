import { useState, useEffect, useRef } from 'react';
import { submitBinRequest } from '../services/api';

const BIN_TYPES = [
  { key: 'plastic', icon: 'water_bottle', label: 'Plastic' },
  { key: 'organic', icon: 'compost', label: 'Organic' },
  { key: 'eWaste', icon: 'devices', label: 'E-Waste' },
  { key: 'metal', icon: 'construction', label: 'Metal' },
  { key: 'paper', icon: 'newspaper', label: 'Paper' },
  { key: 'general', icon: 'delete', label: 'General' },
];

/**
 * AddBinModal — report a new bin from the map.
 *
 * Requirements enforced:
 *  - Live photo only: file input uses capture="environment" so mobile
 *    devices open the camera directly (no gallery picks).
 *  - Live location mandatory: fresh getCurrentPosition (no cache) is
 *    acquired on open and must succeed before submit is enabled.
 */
export default function AddBinModal({ onClose, onSubmitted }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [types, setTypes] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [location, setLocation] = useState(null); // { lat, lng, accuracy }
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef(null);

  const fetchLiveLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: Math.round(coords.accuracy || 0),
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) setError('Location access denied. Enable it to report a bin.');
        else if (err.code === 2) setError('Location unavailable. Try again.');
        else setError('Location request timed out. Try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // fresh fix only
    );
  };

  // Fetch a fresh live location as soon as the modal opens.
  useEffect(() => {
    fetchLiveLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please capture a photo using your camera.');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleType = (key) => {
    setTypes((prev) => prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim())       { setError('Please give the bin a name.'); return; }
    if (!address.trim())    { setError('Please add a nearby landmark/address.'); return; }
    if (types.length === 0) { setError('Select at least one bin type.'); return; }
    if (!photo)             { setError('A live camera photo is required.'); return; }
    if (!location)          { setError('Live location is required. Tap "Refresh location".'); return; }

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', photo);
      formData.append('name', name.trim());
      formData.append('address', address.trim());
      formData.append('lat', String(location.lat));
      formData.append('lng', String(location.lng));
      formData.append('types', JSON.stringify(types));

      await submitBinRequest(formData);
      setSuccess(true);
      onSubmitted?.();
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="addbin-overlay" onClick={onClose}>
      <div className="addbin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="addbin-header">
          <h2>
            <span className="material-symbols-outlined">add_location</span>
            Report a Bin
          </h2>
          <button type="button" className="addbin-close" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Light warning */}
        <div className="addbin-warning">
          <span className="material-symbols-outlined">warning</span>
          <p>Only report bins that really exist. False or duplicate reports can cost you points.</p>
        </div>

        {success ? (
          <div className="addbin-success">
            <span className="material-symbols-outlined">check_circle</span>
            <h3>Report submitted!</h3>
            <p>An admin will review your photo and location. You earn <strong>+50 pts</strong> once approved.</p>
            <button type="button" className="submit-btn" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="error-banner">{error}</div>}

            <div className="field-group">
              <label htmlFor="addbin-name">Bin name</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">label</span>
                <input
                  id="addbin-name" type="text" placeholder="e.g. Market Road Bin"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="addbin-address">Nearby landmark / address</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">location_on</span>
                <input
                  id="addbin-address" type="text" placeholder="e.g. Near Gate 2, MG Road"
                  value={address} onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Bin types</label>
              <div className="addbin-types">
                {BIN_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`addbin-type${types.includes(t.key) ? ' active' : ''}`}
                    onClick={() => toggleType(t.key)}
                  >
                    <span className="material-symbols-outlined">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>Live photo (camera only)</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              {photoPreview ? (
                <div className="addbin-photo-preview">
                  <img src={photoPreview} alt="Bin preview" />
                  <button type="button" className="addbin-retake" onClick={() => fileRef.current?.click()}>
                    <span className="material-symbols-outlined">photo_camera</span> Retake
                  </button>
                </div>
              ) : (
                <button type="button" className="addbin-camera-btn" onClick={() => fileRef.current?.click()}>
                  <span className="material-symbols-outlined">photo_camera</span>
                  Take a live photo
                </button>
              )}
            </div>

            <div className="field-group">
              <label>Live location (required)</label>
              <div className="addbin-loc-row">
                {locating ? (
                  <span className="addbin-loc-status"><span className="spinner" /> Fetching live location…</span>
                ) : location ? (
                  <span className="addbin-loc-status ok">
                    <span className="material-symbols-outlined">check_circle</span>
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    {location.accuracy > 0 && ` (±${location.accuracy}m)`}
                  </span>
                ) : (
                  <span className="addbin-loc-status missing">
                    <span className="material-symbols-outlined">location_off</span>
                    No location yet
                  </span>
                )}
                <button type="button" className="addbin-refresh" onClick={fetchLiveLocation} disabled={locating}>
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || locating}>
              {submitting
                ? <span className="spinner" />
                : <> Submit for review <span className="material-symbols-outlined">arrow_forward</span> </>
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
