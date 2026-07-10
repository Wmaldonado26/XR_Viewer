import { API_BASE_URL } from "../../../../api/endpoints";
import authService from "../../../../api/services/authService";

export const useUpload = (projectId) => {
  const UPLOAD_URL = `${API_BASE_URL}/upload`;

  const uploadImageToBackend = async ({ file, type }) => {
    console.log("📤 Iniciando carga de imagen:", { file: file.name, type, UPLOAD_URL });
    
    const formData = new FormData();
    formData.append("image", file);
    formData.append("projectId", projectId);
    formData.append("type", type);

    try {
      const res = await fetch(UPLOAD_URL, {
        method: "POST",
        headers: authService.getAuthHeaders(),
        body: formData,
      });
      console.log("📡 Respuesta del servidor:", { status: res.status, ok: res.ok });
      
      if (!res.ok) {
        let msg = "No se pudo subir el archivo.";
        try {
          const data = await res.json();
          console.error("Error del servidor:", data);
          msg = data?.error || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      console.log("Imagen cargada exitosamente:", data);
      return data;
    } catch (error) {
      console.error("Error en uploadImageToBackend:", error);
      throw error;
    }
  };

  return { uploadImageToBackend, UPLOAD_URL };
};
