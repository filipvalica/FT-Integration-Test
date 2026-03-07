import axios from 'axios';

/**
 * IntegrationService handles all FieldTwin API interactions.
 */
class IntegrationService {
  /**
   * Initializes the IntegrationService with default values.
   */
  constructor() {
    this.fieldapURL = import.meta.env.VITE_FIELDAP_API_BASE_URL || 'https://api.fieldtwin.com';
    this.projectId = '';
    this.subProjectId = '';
    this.jwt = '';
  }

  /**
   * Sets the base URL for the FieldTwin API.
   *
   * @param {string} url - The backend API URL
   * @returns {void}
   */
  setBackendUrl(url) {
    if (url) this.fieldapURL = url;
  }

  /**
   * Sets the active project and subproject IDs.
   *
   * @param {string} projectId - The FieldTwin Project UUID
   * @param {string} subProjectId - The FieldTwin SubProject UUID
   * @returns {void}
   */
  setProject(projectId, subProjectId) {
    this.projectId = projectId;
    this.subProjectId = subProjectId;
  }

  /**
   * Sets the JWT token for API authentication.
   *
   * @param {string} jwt - The JWT token
   * @returns {void}
   */
  setJWT(jwt) {
    this.jwt = jwt;
  }

  /**
   * Fetches connections for the current project and subproject.
   *
   * @returns {Promise<Array>} A promise that resolves to an array of connections
   * @throws {Error} If the API request fails
   */
  async getConnections() {
    if (!this.projectId || !this.subProjectId || !this.jwt) return [];
    
    const url = `${this.fieldapURL}/API/v1.10/${this.projectId}/subProject/${this.subProjectId}/connections`;
    try {
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${this.jwt}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
  }

  /**
   * Fetches staged assets for the current project and subproject.
   *
   * @returns {Promise<Array>} A promise that resolves to an array of staged assets
   * @throws {Error} If the API request fails
   */
  async getStagedAssets() {
    if (!this.projectId || !this.subProjectId || !this.jwt) return [];

    const url = `${this.fieldapURL}/API/v1.10/${this.projectId}/subProject/${this.subProjectId}/stagedAssets`;
    try {
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${this.jwt}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching staged assets:', error);
      return [];
    }
  }
}

export default new IntegrationService();
