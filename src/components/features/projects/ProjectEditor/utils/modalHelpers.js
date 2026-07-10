export const getErrorModalState = (title, message, onClose) => ({
  isOpen: true,
  type: "danger",
  title,
  message,
  onConfirm: onClose,
  showCancelButton: false,
  confirmText: "Aceptar",
});

export const getInfoModalState = (title, message, onClose) => ({
  isOpen: true,
  type: "alert",
  title,
  message,
  onConfirm: onClose,
  showCancelButton: false,
  confirmText: "Listo",
});
