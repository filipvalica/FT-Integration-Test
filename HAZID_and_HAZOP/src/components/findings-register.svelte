<script>
  import { Trash, PencilSquare, InfoCircle } from 'svelte-bootstrap-icons';
  import HazidService from '../actions/hazid-service';

  /**
   * @typedef {Object} FindingsRegisterProps
   * @property {string} reviewId - UUID of the parent review
   * @property {Array<Object>} findings - List of findings to display
   * @property {function(string): void} onOpenFinding - Callback to open a finding detail
   * @property {function(): void} onRefresh - Callback to refresh the findings list
   */

  /** @type {FindingsRegisterProps} Component props */
  const { reviewId, findings, onOpenFinding, onRefresh } = $props();

  /** @type {string} Current search query for findings */
  let searchQuery = $state('');
  /** @type {string} Current status filter */
  let statusFilter = $state('All');

  /** @type {Array<Object>} Filtered list based on search and status */
  const filteredFindings = $derived(
    findings.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.hazard.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    }),
  );

  /**
   * Deletes a finding after confirmation.
   *
   * @param {string} id - Finding UUID
   * @returns {void}
   */
  function handleDelete(id) {
    if (confirm('Are you sure you want to delete this finding?')) {
      HazidService.deleteFindings([id]);
      onRefresh();
    }
  }

  /**
   * Returns the appropriate Bootstrap badge class for a risk level.
   *
   * @param {string} level - Risk level string
   * @returns {string} CSS class
   */
  function getRiskBadge(level) {
    if (!level) return 'bg-secondary';
    if (level.startsWith('5') || level.startsWith('4')) return 'bg-danger';
    if (level.startsWith('3')) return 'bg-warning text-dark';
    return 'bg-success';
  }
</script>

<div class="findings-register h-100 d-flex flex-column">
  <!-- Search and Filter Bar -->
  <div class="filter-bar p-3 mb-3 rounded shadow-sm d-flex gap-3 align-items-center" style="background-color: var(--ftw-background-accent-three, #3d3d3d); border: 1px solid var(--ftw-border-color-accent-one, #444);">
    <div class="flex-grow-1">
      <input 
        type="text" 
        class="form-control form-control-sm ft-input" 
        placeholder="Search findings by title or hazard description..." 
        bind:value={searchQuery}
      />
    </div>
    <div class="d-flex align-items-center">
      <label for="status-filter" class="text-secondary-ft small me-2 mb-0 fw-bold">Status:</label>
      <select id="status-filter" class="form-select form-select-sm ft-input" bind:value={statusFilter} style="width: 140px;">
        <option value="All">All Statuses</option>
        <option value="Open">Open</option>
        <option value="Under Review">Under Review</option>
        <option value="Mitigated">Mitigated</option>
        <option value="Closed">Closed</option>
      </select>
    </div>
    <div class="text-secondary-ft small fw-bold">
      {filteredFindings.length} / {findings.length}
    </div>
  </div>

  <!-- Findings Table -->
  <div class="table-responsive flex-grow-1 ft-table-container rounded shadow-sm">
    <table class="table table-striped table-hover align-middle mb-0 ft-table">
      <thead>
        <tr>
          <th style="width: 60px;">ID</th>
          <th>Finding / Hazard</th>
          <th style="width: 120px;">Severity</th>
          <th style="width: 120px;">Likelihood</th>
          <th style="width: 120px;">Status</th>
          <th style="width: 120px;">Linked</th>
          <th style="width: 100px;" class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredFindings as finding (finding.id)}
          <tr class="animate-row">
            <td class="text-secondary-ft small font-monospace">{finding.id.substring(0, 4)}</td>
            <td>
              <div class="fw-bold text-accent-one">{finding.title}</div>
              <div class="text-secondary-ft small text-truncate" style="max-width: 400px;">{finding.hazard}</div>
            </td>
            <td><span class="badge {getRiskBadge(finding.severity)}">{finding.severity}</span></td>
            <td><span class="badge {getRiskBadge(finding.likelihood)}">{finding.likelihood}</span></td>
            <td><span class="badge bg-ft-secondary">{finding.status}</span></td>
            <td>
              <span class="badge rounded-pill bg-link-pill">{finding.linkedObjects?.length || 0} items</span>
            </td>
            <td class="text-end">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-ft" onclick={() => onOpenFinding(finding.id)} title="Edit Finding">
                  <PencilSquare />
                </button>
                <button class="btn btn-outline-danger" onclick={() => handleDelete(finding.id)} title="Delete Finding">
                  <Trash />
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="7" class="text-center py-5">
              <div class="text-secondary-ft py-4">
                <InfoCircle size={32} class="mb-3 opacity-50" />
                <p>No findings match your current filters.</p>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .ft-table-container {
    background-color: var(--ftw-background-accent-one, #1a1a1a);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
    overflow-y: auto;
  }
  .ft-table {
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .ft-table thead th {
    background-color: var(--ftw-background-accent-four, #444);
    color: var(--ftw-text-title, #fff);
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .ft-table tbody td {
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
    padding: 0.75rem 0.5rem;
  }
  .text-accent-one {
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .text-secondary-ft {
    color: var(--ftw-text-secondary, #aaa);
  }
  .ft-input {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
    color: #fff;
  }
  .ft-input:focus {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    border-color: var(--ftw-selected-color, #459685);
    color: #fff;
  }
  .btn-outline-ft {
    color: var(--ftw-text-accent-one, #e0e0e0);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .btn-outline-ft:hover {
    background-color: var(--ftw-background-accent-four, #444);
    color: var(--ftw-selected-color, #459685);
  }
  .bg-ft-secondary {
    background-color: var(--ftw-background-accent-four, #444);
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .bg-link-pill {
    background-color: rgba(69, 150, 133, 0.15);
    color: var(--ftw-selected-color, #459685);
    border: 1px solid rgba(69, 150, 133, 0.3);
  }
  .animate-row {
    transition: background-color 0.2s;
  }
  .animate-row:hover {
    background-color: var(--ftw-background-accent-three, #3d3d3d) !important;
  }
</style>
