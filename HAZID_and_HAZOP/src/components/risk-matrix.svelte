<script>
  /**
   * @typedef {Object} RiskMatrixProps
   * @property {Array<Object>} findings - List of findings to plot on the matrix
   * @property {function(string): void} onOpenFinding - Callback to open a finding detail
   */

  /** @type {RiskMatrixProps} Component props */
  const { findings = [], onOpenFinding } = $props();

  const severities = ['5 - Critical', '4 - High', '3 - Medium', '2 - Low', '1 - Negligible'];
  const likelihoods = ['1 - Improbable', '2 - Remote', '3 - Occasional', '4 - Probable', '5 - Frequent'];

  /**
   * Returns findings that match a specific severity and likelihood coordinate.
   *
   * @param {string} sev - Severity level
   * @param {string} lik - Likelihood level
   * @returns {Array<Object>} List of matching findings
   */
  function getFindingsAt(sev, lik) {
    return findings.filter(f => f.severity === sev && f.likelihood === lik);
  }

  /**
   * Determines the risk color class for a matrix cell.
   *
   * @param {number} s - Severity index (1-5)
   * @param {number} l - Likelihood index (1-5)
   * @returns {string} CSS class for the cell color
   */
  function getCellColor(s, l) {
    const score = s * l;
    if (score >= 15) return 'risk-high';
    if (score >= 8) return 'risk-medium';
    return 'risk-low';
  }
</script>

<div class="risk-matrix-container p-4 animate-fade-in">
  <div class="matrix-grid shadow-lg">
    <div class="y-axis-label">Severity</div>
    <div class="x-axis-label">Likelihood</div>
    
    <!-- Header Row (Likelihoods) -->
    <div class="cell header"></div>
    {#each likelihoods as lik}
      <div class="cell header small">{lik}</div>
    {/each}

    <!-- Matrix Rows -->
    {#each severities as sev, sIdx}
      <div class="cell header small text-start">{sev}</div>
      {#each likelihoods as lik, lIdx}
        {@const cellFindings = getFindingsAt(sev, lik)}
        {@const sVal = 5 - sIdx}
        {@const lVal = lIdx + 1}
        <div class="cell matrix-cell {getCellColor(sVal, lVal)}">
          <div class="dot-container">
            {#each cellFindings as finding (finding.id)}
              <button 
                type="button"
                class="finding-dot shadow-sm" 
                title={finding.title} 
                onclick={() => onOpenFinding(finding.id)}
                aria-label="View finding: {finding.title}"
              ></button>
            {/each}
          </div>
        </div>
      {/each}
    {/each}
  </div>

  <div class="mt-4 d-flex flex-column align-items-center">
    <div class="d-flex justify-content-center gap-4 mb-2">
      <div class="d-flex align-items-center small">
        <div class="legend-box risk-high me-2"></div> High Risk
      </div>
      <div class="d-flex align-items-center small">
        <div class="legend-box risk-medium me-2"></div> Medium Risk
      </div>
      <div class="d-flex align-items-center small">
        <div class="legend-box risk-low me-2"></div> Low Risk
      </div>
    </div>
    <div class="text-secondary-ft smaller italic">
      Hover over dots to see finding titles. Click dots to open details.
    </div>
  </div>
</div>

<style>
  .risk-matrix-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .matrix-grid {
    display: grid;
    grid-template-columns: 120px repeat(5, 1fr);
    grid-template-rows: repeat(6, 1fr);
    width: 100%;
    max-width: 800px;
    aspect-ratio: 1.5 / 1;
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    border: 2px solid var(--ftw-border-color-accent-one, #444);
    position: relative;
  }
  .cell {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 10px;
    text-align: center;
  }
  .cell.header {
    background-color: var(--ftw-background-accent-four, #444);
    color: var(--ftw-text-secondary, #aaa);
    font-weight: bold;
  }
  .matrix-cell {
    transition: transform 0.2s;
    position: relative;
  }
  .matrix-cell:hover {
    transform: scale(1.02);
    z-index: 2;
    box-shadow: 0 0 15px rgba(0,0,0,0.5);
  }
  .risk-high { background-color: #dc3545 !important; }
  .risk-medium { background-color: #ffc107 !important; }
  .risk-low { background-color: var(--ftw-teal-accent, #459685) !important; }
  
  .dot-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    align-items: center;
    max-width: 100%;
    max-height: 100%;
    overflow: hidden;
  }

  .finding-dot {
    background-color: #fff;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(0,0,0,0.2);
    padding: 0;
    cursor: pointer;
    transition: transform 0.1s, background-color 0.1s;
  }
  
  .finding-dot:hover {
    transform: scale(1.3);
    background-color: var(--ftw-teal-accent, #459685);
    border-color: #fff;
  }
  
  .y-axis-label {
    position: absolute;
    left: -60px;
    top: 50%;
    transform: rotate(-90deg) translateY(-50%);
    font-weight: bold;
    text-transform: uppercase;
    color: var(--ftw-text-secondary, #aaa);
    letter-spacing: 2px;
  }
  .x-axis-label {
    position: absolute;
    bottom: -40px;
    left: 50%;
    transform: translateX(-50%);
    font-weight: bold;
    text-transform: uppercase;
    color: var(--ftw-text-secondary, #aaa);
    letter-spacing: 2px;
  }
  .legend-box {
    width: 16px;
    height: 16px;
    border-radius: 3px;
  }
  .text-secondary-ft { color: var(--ftw-text-secondary, #aaa); }
  .italic { font-style: italic; }
  .smaller { font-size: 0.75rem; }
</style>
