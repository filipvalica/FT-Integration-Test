import { v4 as uuidv4 } from 'uuid';

/**
 * HazidService handles all HAZID/HAZOP specific data operations.
 * Uses a stable localStorage key to prevent data loss across updates.
 */
class HazidService {
  /**
   * Initializes the HazidService and loads existing data from localStorage.
   */
  constructor() {
    // STABLE STORAGE KEY - DO NOT CHANGE
    this.storageKey = 'fieldtwin_hazid_master_data';
    this.data = this._loadData();
  }

  /**
   * Loads HAZID data from local storage.
   *
   * @private
   * @returns {Object} The loaded or default data object
   */
  _loadData() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration/Sanitization: ensure all collections exist
        return {
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
          findings: Array.isArray(parsed.findings) ? parsed.findings : [],
          actions: Array.isArray(parsed.actions) ? parsed.actions : [],
        };
      } catch (e) {
        console.error('HazidService: Failed to parse localStorage', e);
      }
    }
    return { reviews: [], findings: [], actions: [] };
  }

  /**
   * Persists the current HAZID data to local storage.
   *
   * @private
   * @returns {void}
   */
  _saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  // --- Backup & Restore (JSON) ---

  /**
   * Exports the current HAZID data to a JSON file for backup.
   *
   * @returns {void}
   */
  exportToJson() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `hazid_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  /**
   * Imports HAZID data from a JSON file.
   *
   * @param {File} file - The JSON file to import
   * @returns {Promise<boolean>} A promise that resolves when the import is complete
   * @throws {Error} If the JSON format is invalid
   */
  async importFromJson(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData.reviews && importedData.findings) {
            this.data = {
              reviews: Array.isArray(importedData.reviews) ? importedData.reviews : [],
              findings: Array.isArray(importedData.findings) ? importedData.findings : [],
              actions: Array.isArray(importedData.actions) ? importedData.actions : [],
            };
            this._saveData();
            resolve(true);
          } else {
            reject(new Error('Invalid HAZID JSON format'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  // --- Reviews ---

  /**
   * Gets all reviews associated with a specific project.
   *
   * @param {string} projectId - The FieldTwin project ID
   * @returns {Array<Object>} An array of matching reviews
   */
  getReviews(projectId) {
    if (!projectId) return [];
    return this.data.reviews.filter(r => r.projectId === projectId);
  }

  /**
   * Retrieves a specific review by its ID.
   *
   * @param {string} id - The review UUID
   * @returns {Object|null} The review object or null if not found
   */
  getReview(id) {
    if (!id) return null;
    return this.data.reviews.find(r => r.id === id);
  }

  /**
   * Creates a new HAZID review.
   *
   * @param {Object} reviewData - The review data properties
   * @returns {Object} The newly created review object
   */
  createReview(reviewData) {
    const newReview = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Draft',
      ...reviewData,
    };
    this.data.reviews.push(newReview);
    this._saveData();
    return newReview;
  }

  /**
   * Updates an existing review.
   *
   * @param {string} id - The review UUID
   * @param {Object} reviewData - The updated properties
   * @returns {Object|null} The updated review or null if not found
   */
  updateReview(id, reviewData) {
    const index = this.data.reviews.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.reviews[index] = {
        ...this.data.reviews[index],
        ...reviewData,
        updatedAt: new Date().toISOString(),
      };
      this._saveData();
      return this.data.reviews[index];
    }
    return null;
  }

  /**
   * Deletes a review and all its associated findings and actions.
   *
   * @param {string} id - The review UUID
   * @returns {void}
   */
  deleteReview(id) {
    if (!id) return;
    
    // Remove the review
    this.data.reviews = this.data.reviews.filter(r => r.id !== id);
    
    // Also remove all associated findings and actions
    const findings = this.getFindings(id);
    const findingIds = findings.map(f => f.id);
    
    this.data.findings = this.data.findings.filter(f => f.reviewId !== id);
    this.data.actions = this.data.actions.filter(a => !findingIds.includes(a.findingId));
    
    this._saveData();
  }

  // --- Findings ---

  /**
   * Gets all findings for a specific review.
   *
   * @param {string} reviewId - The review UUID
   * @returns {Array<Object>} An array of findings
   */
  getFindings(reviewId) {
    if (!reviewId) return [];
    return this.data.findings.filter(f => f.reviewId === reviewId);
  }

  /**
   * Retrieves a specific finding by its ID.
   *
   * @param {string} id - The finding UUID
   * @returns {Object|null} The finding object or null if not found
   */
  getFinding(id) {
    if (!id) return null;
    return this.data.findings.find(f => f.id === id);
  }

  /**
   * Creates a new HAZID finding.
   *
   * @param {Object} findingData - The finding properties
   * @returns {Object} The newly created finding
   */
  createFinding(findingData) {
    const newFinding = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Open',
      ...findingData,
    };
    this.data.findings.push(newFinding);
    this._saveData();
    return newFinding;
  }

  /**
   * Updates an existing HAZID finding.
   *
   * @param {string} id - The finding UUID
   * @param {Object} findingData - The updated properties
   * @returns {Object|null} The updated finding or null if not found
   */
  updateFinding(id, findingData) {
    const index = this.data.findings.findIndex(f => f.id === id);
    if (index !== -1) {
      this.data.findings[index] = {
        ...this.data.findings[index],
        ...findingData,
        updatedAt: new Date().toISOString(),
      };
      this._saveData();
      return this.data.findings[index];
    }
    return null;
  }

  /**
   * Deletes multiple findings and their associated actions.
   *
   * @param {Array<string>} ids - Array of finding UUIDs
   * @returns {void}
   */
  deleteFindings(ids) {
    if (!Array.isArray(ids) || ids.length === 0) return;
    this.data.findings = this.data.findings.filter(f => !ids.includes(f.id));
    this.data.actions = this.data.actions.filter(a => !ids.includes(a.findingId));
    this._saveData();
  }

  // --- Actions ---

  /**
   * Gets all actions for a specific finding.
   *
   * @param {string} findingId - The finding UUID
   * @returns {Array<Object>} An array of actions
   */
  getActions(findingId) {
    if (!findingId) return [];
    return this.data.actions.filter(a => a.findingId === findingId);
  }

  /**
   * Gets all actions for an entire review.
   *
   * @param {string} reviewId - The review UUID
   * @returns {Array<Object>} An array of actions
   */
  getAllActions(reviewId) {
    if (!reviewId) return [];
    const findings = this.getFindings(reviewId);
    const findingIds = findings.map(f => f.id);
    return this.data.actions.filter(a => findingIds.includes(a.findingId));
  }

  /**
   * Creates a new mitigation action.
   *
   * @param {Object} actionData - The action properties
   * @returns {Object} The newly created action
   */
  createAction(actionData) {
    const newAction = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Open',
      ...actionData,
    };
    this.data.actions.push(newAction);
    this._saveData();
    return newAction;
  }

  /**
   * Updates an existing action.
   *
   * @param {string} id - The action UUID
   * @param {Object} actionData - The updated properties
   * @returns {Object|null} The updated action or null if not found
   */
  updateAction(id, actionData) {
    const index = this.data.actions.findIndex(a => a.id === id);
    if (index !== -1) {
      this.data.actions[index] = {
        ...this.data.actions[index],
        ...actionData,
        updatedAt: new Date().toISOString(),
      };
      this._saveData();
      return this.data.actions[index];
    }
    return null;
  }

  // --- Export (CSV) ---

  /**
   * Exports the findings of a review to a CSV file.
   *
   * @param {string} reviewId - The review UUID
   * @returns {void}
   */
  exportToCsv(reviewId) {
    const review = this.getReview(reviewId);
    const findings = this.getFindings(reviewId);
    if (!review || findings.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Finding ID,Title,Hazard,Cause,Consequence,Safeguard,Recommendation,Severity,Likelihood,Status,Owner,Due Date,Linked Objects\n';
    
    findings.forEach(f => {
      const row = [
        f.id,
        `"${f.title || ''}"`,
        `"${f.hazard || ''}"`,
        `"${f.cause || ''}"`,
        `"${f.consequence || ''}"`,
        `"${f.safeguard || ''}"`,
        `"${f.recommendation || ''}"`,
        f.severity || '',
        f.likelihood || '',
        f.status || '',
        f.owner || '',
        f.dueDate || '',
        `"${(f.linkedObjects || []).map(o => o.name).join(', ')}"`,
      ].join(',');
      csvContent += row + '\n';
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HAZID_Export_${review.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default new HazidService();
