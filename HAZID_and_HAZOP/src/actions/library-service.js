import axios from 'axios';

/**
 * LibraryService handles the loading and querying of the HAZID hazard seed library.
 */
class LibraryService {
  /**
   * Initializes the LibraryService with default values.
   */
  constructor() {
    this.library = [];
    this.isLoaded = false;
  }

  /**
   * Loads the hazard library from a local CSV file.
   *
   * @returns {Promise<boolean>} A promise that resolves when the library is loaded
   */
  async loadLibrary() {
    if (this.isLoaded) return true;
    
    try {
      // In a real integration, this might be an API call, but for MVP it's a local CSV
      const response = await axios.get('/hazid_library.csv');
      this.library = this._parseCsv(response.data);
      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('LibraryService: Failed to load hazard library', error);
      return false;
    }
  }

  /**
   * Parses a CSV string into an array of hazard objects.
   *
   * @private
   * @param {string} csvText - The raw CSV content
   * @returns {Array<Object>} An array of parsed hazard objects
   */
  _parseCsv(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = this._splitCsvLine(line);
        const entry = { id: `lib-${index}` };
        headers.forEach((header, i) => {
          entry[header.toLowerCase()] = values[i] ? values[i].trim() : '';
        });
        return entry;
      });
  }

  /**
   * Splits a CSV line correctly handling quoted values.
   *
   * @private
   * @param {string} line - A single CSV line
   * @returns {Array<string>} An array of values
   */
  _splitCsvLine(line) {
    const result = [];
    let startValueIndex = 0;
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQuotes = !inQuotes;
      } else if (line[i] === ',' && !inQuotes) {
        result.push(this._cleanValue(line.substring(startValueIndex, i)));
        startValueIndex = i + 1;
      }
    }
    result.push(this._cleanValue(line.substring(startValueIndex)));
    return result;
  }

  /**
   * Cleans a CSV value by removing surrounding quotes.
   *
   * @private
   * @param {string} val - The raw CSV value
   * @returns {string} The cleaned value
   */
  _cleanValue(val) {
    let clean = val.trim();
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.substring(1, clean.length - 1).replace(/""/g, '"');
    }
    return clean;
  }

  /**
   * Returns a unique list of hazard categories.
   *
   * @returns {Array<string>} An array of category names
   */
  getCategories() {
    const categories = this.library.map(h => h.category).filter(Boolean);
    return [...new Set(categories)].sort();
  }

  /**
   * Retrieves all hazards belonging to a specific category.
   *
   * @param {string} category - The category name
   * @returns {Array<Object>} An array of hazard objects
   */
  getHazardsByCategory(category) {
    return this.library.filter(h => h.category === category);
  }
}

export default new LibraryService();
