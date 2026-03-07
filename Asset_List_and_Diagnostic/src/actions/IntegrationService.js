import axios from 'axios';

/**
 * IntegrationService handles all FieldTwin API interactions
 * 
 * @class IntegrationService
 */
class IntegrationService {
  /**
   * Creates an instance of IntegrationService
   * Uses backendUrl from FieldTwin if available, otherwise falls back to env var
   */
  constructor() {
    // Use backendUrl from FieldTwin if available, otherwise fall back to env var
    this.fieldapURL = import.meta.env.VITE_FIELDAP_API_BASE_URL || '';
  }

  /**
   * Sets the FieldTwin backend URL for API requests
   *
   * @param {string} backendUrl - The FieldTwin backend URL
   */
  setBackendUrl(backendUrl) {
    if (backendUrl) {
      this.fieldapURL = backendUrl;
    }
  }

  /**
   * Sets the current project and subproject IDs
   *
   * @param {string} projectId - The project ID
   * @param {string} subProjectId - The subproject ID (may include stream ID after colon)
   * Note: FieldTwin API accepts subProjectId in format `<subProject_id>:<stream_id>`
   * If only subProject_id is provided, API treats it as `<subProject_id>:<subProject_id>`
   */
  setProject(projectId, subProjectId) {
    this.projectId = projectId;
    // Preserve the full subProjectId including stream ID if present
    // The API accepts both formats: `subProjectId` or `subProjectId:streamId`
    this.subProjectId = subProjectId;
  }

  /**
   * Sets the JWT token for API authentication
   *
   * @param {string} jwt - The JWT token from FieldTwin
   */
  setJWT(jwt) {
    this.jwt = jwt;
  }

  /**
   * Retrieves all connections for the current subProject
   *
   * @returns {Promise<Array|Object>} Array or object of connections
   * @throws {Error} If API request fails
   */
  async getConnections() {
    if (!this.fieldapURL) {
      throw new Error('Backend URL not set. Make sure FieldTwin sends backendUrl in loaded event.');
    }
    if (!this.projectId || !this.subProjectId) {
      throw new Error('Project or SubProject ID not set. Make sure FieldTwin sends project and subProject in loaded event.');
    }
    if (!this.jwt) {
      throw new Error('JWT token not set. Make sure FieldTwin sends token in loaded event.');
    }

    const url = `${this.fieldapURL}/API/v1.10/${this.projectId}/subProject/${this.subProjectId}/connections`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching connections:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Retrieves all staged assets for the current subProject
   *
   * @returns {Promise<Array|Object>} Array or object of staged assets
   * @throws {Error} If API request fails
   */
  async getStagedAssets() {
    if (!this.fieldapURL) {
      throw new Error('Backend URL not set. Make sure FieldTwin sends backendUrl in loaded event.');
    }
    if (!this.projectId || !this.subProjectId) {
      throw new Error('Project or SubProject ID not set. Make sure FieldTwin sends project and subProject in loaded event.');
    }
    if (!this.jwt) {
      throw new Error('JWT token not set. Make sure FieldTwin sends token in loaded event.');
    }

    // Construct URL - subProjectId can be in format `subProjectId` or `subProjectId:streamId`
    const url = `${this.fieldapURL}/API/v1.10/${this.projectId}/subProject/${this.subProjectId}/stagedAssets`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching staged assets:', error.response?.data || error.message);
      throw error;
    }
  }
}

// This is the exported instance of the data service
export default new IntegrationService()