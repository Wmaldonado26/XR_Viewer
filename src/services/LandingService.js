import { API_BASE_URL, API_HOST } from "./apiConfig";
import authService from "./AuthService";

class LandingService {
  async getCards() {
    try {
      const response = await fetch(`${API_BASE_URL}/landing`);
      if (!response.ok) throw new Error("Failed to fetch landing cards");
      const cards = await response.json();
      
      return cards.map(c => {
        let finalImage = null;
        if (c.imagePath) {
          const cleanPath = c.imagePath.replace(/\\/g, "/");
          // Extract filename if it was accidentally saved as absolute path
          const filename = cleanPath.split("/").pop();
          finalImage = `${API_HOST}/uploads/${filename}`;
        }
        return {
          ...c,
          image: finalImage
        };
      });
    } catch (error) {
      console.error("Error fetching landing cards:", error);
      return [];
    }
  }

  async createCard(formData) {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/landing`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error("Failed to create landing card");
    return response.json();
  }

  async updateCard(id, formData) {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/landing/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!response.ok) throw new Error("Failed to update landing card");
    return response.json();
  }

  async deleteCard(id) {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/landing/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error("Failed to delete landing card");
    return response.json();
  }
}

const landingService = new LandingService();
export default landingService;
