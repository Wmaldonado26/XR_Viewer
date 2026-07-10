import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import authService from '../../../api/services/authService';
import './ProfileSettings.css';

const ProfileSettings = ({ onClose, onProfileUpdated }) => {
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');

    const result = await authService.updateMyProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
    });

    if (result.success) {
      setProfileSuccess('Información actualizada.');
      if (onProfileUpdated) onProfileUpdated(result.user);
      setTimeout(() => onClose(), 700);
    } else {
      setProfileError(result.error || 'No se pudo actualizar');
    }

    setProfileSaving(false);
  };

  return (
    <div className="profile-modal-overlay" onClick={() => onClose()}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <div className="profile-modal-title">
            <span className="profile-chip active">Información</span>
          </div>
          <h2>Información Personal</h2>
          <p>Actualiza los datos asociados a tu cuenta.</p>
        </div>
        <form onSubmit={handleSaveProfile} className="profile-form">
          <div className="profile-section">
            <h3>Información básica</h3>
            <div className="profile-grid">
              <label className="profile-field profile-field--full">
                <span>Nombre</span>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </label>
              <label className="profile-field profile-field--wide">
                <span>Correo</span>
                <div className="profile-input-wrap">
                  <FaEnvelope />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </label>
              <label className="profile-field">
                <span>Teléfono</span>
                <div className="profile-input-wrap">
                  <FaPhone />
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </label>
            </div>
          </div>
          {profileError && <div className="profile-error">{profileError}</div>}
          {profileSuccess && <div className="profile-success">{profileSuccess}</div>}
          <div className="profile-actions">
            <button type="button" className="profile-btn secondary" onClick={() => onClose()}>
              Cancelar
            </button>
            <button type="submit" className="profile-btn primary" disabled={profileSaving}>
              {profileSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
