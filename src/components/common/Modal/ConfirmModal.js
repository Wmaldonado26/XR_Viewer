import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimes, FaTrash } from 'react-icons/fa';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm', // 'confirm', 'alert', 'danger'
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  requiresConfirmation = false,
  confirmationText = '',
  showCancelButton = true
}) => {
  const [confirmInput, setConfirmInput] = React.useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresConfirmation && confirmInput !== confirmationText) {
      return;
    }
    onConfirm();
    setConfirmInput('');
  };

  const handleClose = () => {
    setConfirmInput('');
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FaExclamationTriangle className="modal-icon danger" />;
      case 'alert':
        return <FaCheckCircle className="modal-icon success" />;
      case 'info':
        return <FaInfoCircle className="modal-icon info" />;
      case 'delete':
        return <FaTrash className="modal-icon danger" />;
      default:
        return <FaInfoCircle className="modal-icon info" />;
    }
  };

  const isConfirmDisabled = requiresConfirmation && confirmInput !== confirmationText;

  return (
    <div className="confirm-modal-overlay" onClick={handleClose}>
      <div className={`confirm-modal ${type}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose}>
          <FaTimes />
        </button>
        
        <div className="modal-header">
          {getIcon()}
          <h2>{title}</h2>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
          
          {requiresConfirmation && (
            <div className="confirmation-input-group">
              <label>
                Para confirmar, escribe: <strong>{confirmationText}</strong>
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Escribe "${confirmationText}"`}
                className="confirmation-input"
                autoFocus
              />
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {showCancelButton && (
            <button className="modal-btn cancel" onClick={handleClose}>
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-btn confirm ${type}`} 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
