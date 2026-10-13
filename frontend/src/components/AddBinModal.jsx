import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { submitBinRequest } from '../services/api';

const BIN_TYPE_KEYS = [
  { key: 'plastic', icon: 'water_bottle' },
  { key: 'organic', icon: 'compost' },
  { key: 'eWaste', icon: 'devices' },
  { key: 'metal', icon: 'construction' },
  { key: 'paper', icon: 'newspaper' },
  { key: 'general', icon: 'delete' },
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
  const { t } = useTranslation();
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
      setError(t('addbin.errNoGeo'));
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
        if (err.code === 1) setError(t('addbin.errDenied'));
        else if (err.code === 2) setError(t('addbin.errUnavailable'));
        else setError(t('addbin.errTimeout'));
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
      setError(t('addbin.errPhotoType'));
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
    if (!name.trim())       { setError(t('addbin.errName')); return; }
    if (!address.trim())    { setError(t('addbin.errAddress')); return; }
    if (types.length === 0) { setError(t('addbin.errTypes')); return; }
    if (!photo)             { setError(t('addbin.errPhoto')); return; }
    if (!location)          { setError(t('addbin.errLocation')); return; }

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
      setError(err.message || t('addbin.errSubmit'));
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
            {t('addbin.title')}
          </h2>
          <button type="button" className="addbin-close" onClick={onClose} aria-label={t('addbin.close')}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Light warning */}
        <div className="addbin-warning">
          <span className="material-symbols-outlined">warning</span>
          <p>{t('addbin.warning')}</p>
        </div>

        {success ? (
          <div className="addbin-success">
            <span className="material-symbols-outlined">check_circle</span>
            <h3>{t('addbin.successTitle')}</h3>
            <p>{t('addbin.successBody')}</p>
            <button type="button" className="submit-btn" onClick={onClose}>{t('addbin.done')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="error-banner">{error}</div>}

            <div className="field-group">
              <label htmlFor="addbin-name">{t('addbin.nameLabel')}</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">label</span>
                <input
                  id="addbin-name" type="text" placeholder={t('addbin.namePh')}
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="addbin-address">{t('addbin.addressLabel')}</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">location_on</span>
                <input
                  id="addbin-address" type="text" placeholder={t('addbin.addressPh')}
                  value={address} onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>{t('addbin.typesLabel')}</label>
              <div className="addbin-types">
                {BIN_TYPE_KEYS.map((bt) => (
                  <button
                    key={bt.key}
                    type="button"
                    className={`addbin-type${types.includes(bt.key) ? ' active' : ''}`}
                    onClick={() => toggleType(bt.key)}
                  >
                    <span className="material-symbols-outlined">{bt.icon}</span>
                    {t(`addbin.type_${bt.key}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label>{t('addbin.photoLabel')}</label>
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
                  <img src={photoPreview} alt={t('addbin.photoAlt')} />
                  <button type="button" className="addbin-retake" onClick={() => fileRef.current?.click()}>
                    <span className="material-symbols-outlined">photo_camera</span> {t('addbin.retake')}
                  </button>
                </div>
              ) : (
                <button type="button" className="addbin-camera-btn" onClick={() => fileRef.current?.click()}>
                  <span className="material-symbols-outlined">photo_camera</span>
                  {t('addbin.takePhoto')}
                </button>
              )}
            </div>

            <div className="field-group">
              <label>{t('addbin.locLabel')}</label>
              <div className="addbin-loc-row">
                {locating ? (
                  <span className="addbin-loc-status"><span className="spinner" /> {t('addbin.fetching')}</span>
                ) : location ? (
                  <span className="addbin-loc-status ok">
                    <span className="material-symbols-outlined">check_circle</span>
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    {location.accuracy > 0 && ` (±${location.accuracy}m)`}
                  </span>
                ) : (
                  <span className="addbin-loc-status missing">
                    <span className="material-symbols-outlined">location_off</span>
                    {t('addbin.noLoc')}
                  </span>
                )}
                <button type="button" className="addbin-refresh" onClick={fetchLiveLocation} disabled={locating} aria-label={t('addbin.refreshLoc')}>
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting || locating}>
              {submitting
                ? <span className="spinner" />
                : <> {t('addbin.submit')} <span className="material-symbols-outlined">arrow_forward</span> </>
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
