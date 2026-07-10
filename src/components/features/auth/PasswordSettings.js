import React, { useState } from 'react';
import { FaKey, FaSave, FaTimes, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import './PasswordSettings.css';
import authService from '../../../api/services/authService';

const PasswordSettings = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    // Validaciones
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-settings-overlay">
      <aside className="password-settings-modal">
        <header className="password-settings-header">
          <h3>
            <FaShieldAlt style={{ marginRight: '8px', color: '#0033a0' }} />
            Cambiar Contraseña
          </h3>
          <button className="close-btn" onClick={onClose} title="Cerrar">
            <FaTimes />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="password-settings-content">
            {message.text && (
              <div className={`message-alert ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
                {message.text}
              </div>
            )}

            <div className="form-group">
              <label>Contraseña Actual</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Nueva Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar Nueva Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPasswords(!showPasswords)}
                  title={showPasswords ? "Ocultar contraseñas" : "Mostrar contraseñas"}
                >
                  {showPasswords ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <footer className="password-settings-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Contraseña'} <FaSave />
            </button>
          </footer>
        </form>
      </aside>
    </div>
  );
};

export default PasswordSettings;
