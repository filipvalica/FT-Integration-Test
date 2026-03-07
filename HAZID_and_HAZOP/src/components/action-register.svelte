<script>
  import { Calendar } from 'svelte-bootstrap-icons';
  import HazidService from '../actions/hazid-service';

  /**
   * @typedef {Object} ActionRegisterProps
   * @property {string} reviewId - UUID of the parent review
   */

  /** @type {ActionRegisterProps} Component props */
  const { reviewId } = $props();

  /** @type {Array<Object>} List of all actions for the review */
  let actions = $state([]);
  /** @type {'All' | 'Open' | 'In Progress' | 'Closed'} Current status filter */
  let statusFilter = $state('All');
  /** @type {string} Filter by owner name */
  let ownerFilter = $state('');

  /** @type {Array<Object>} Filtered list based on current filters */
  let filteredActions = $derived(actions.filter(a => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (ownerFilter && !(a.owner || '').toLowerCase().includes(ownerFilter.toLowerCase())) return false;
    return true;
  }));

  $effect(() => {
    actions = HazidService.getAllActions(reviewId);
  });

  /**
   * Returns the appropriate Bootstrap badge class for an action status.
   *
   * @param {'Open' | 'In Progress' | 'Closed'} status - Action status
   * @returns {string} CSS class
   */
  function getStatusBadge(status) {
    switch (status) {
      case 'Closed': return 'bg-success';
      case 'Open': return 'bg-primary';
      case 'In Progress': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  /**
   * Updates the status of an action.
   *
   * @param {Object} action - The action object
   * @param {string} newStatus - The new status to set
   * @returns {void}
   */
  function handleStatusUpdate(action, newStatus) {
    HazidService.updateAction(action.id, { status: newStatus });
    actions = HazidService.getAllActions(reviewId);
  }
</script>

<div class="action-register animate-fade-in">
  <div class="d-flex justify-content-between align-items-center mb-3 p-2 rounded bg-filter-bar shadow-sm" style="background-color: var(--ftw-background-accent-three, #3d3d3d); border: 1px solid var(--ftw-border-color-accent-one, #444);">
    <div class="d-flex align-items-center gap-3">
      <div class="d-flex align-items-center">
        <label for="a-status-filter" class="text-secondary-ft small me-2 mb-0 fw-bold">Status:</label>
        <select id="a-status-filter" class="form-select form-select-sm ft-input" bind:value={statusFilter} style="width: 130px;">
          <option value="All">All</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <div class="d-flex align-items-center">
        <label for="a-owner-filter" class="text-secondary-ft small me-2 mb-0 fw-bold">Owner:</label>
        <input id="a-owner-filter" type="text" class="form-control form-control-sm ft-input" bind:value={ownerFilter} placeholder="Filter by owner" style="width: 150px;">
      </div>
    </div>
    <div class="text-secondary-ft small">Showing {filteredActions.length} / {actions.length}</div>
  </div>

  <div class="table-responsive ft-table-container rounded border shadow-sm">
    <table class="table table-striped table-hover align-middle mb-0 ft-table">
      <thead>
        <tr>
          <th>Action Description</th>
          <th style="width: 150px;">Status</th>
          <th style="width: 150px;">Owner</th>
          <th style="width: 150px;">Due Date</th>
          <th style="width: 180px;" class="text-end">Update</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredActions as action (action.id)}
        <tr>
          <td>
            <div class="fw-bold text-accent-one">{action.description}</div>
            <div class="text-secondary-ft" style="font-size: 0.75rem;">Finding ID: {action.findingId.substring(0, 8)}...</div>
          </td>
          <td>
            <span class="badge {getStatusBadge(action.status)} shadow-sm">{action.status}</span>
          </td>
          <td>
            <span class="small text-secondary-ft">{action.owner || '-'}</span>
          </td>
          <td>
            {#if action.dueDate}
              <span class="small text-accent-one"><Calendar size={12} class="me-1" /> {new Date(action.dueDate).toLocaleDateString()}</span>
            {:else}
              <span class="text-muted small">-</span>
            {/if}
          </td>
          <td class="text-end">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-ft-success" onclick={() => handleStatusUpdate(action, 'Closed')} disabled={action.status === 'Closed'}>Close</button>
              <button class="btn btn-outline-ft-primary" onclick={() => handleStatusUpdate(action, 'In Progress')} disabled={action.status === 'In Progress'}>Start</button>
            </div>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="5" class="text-center py-5">
            <div class="text-secondary-ft mb-2">No follow-up actions recorded for this review.</div>
            <div class="small text-muted">Actions are created within individual finding details.</div>
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
    border-color: var(--ftw-border-color-accent-one, #444);
  }
  .ft-table {
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .ft-table thead th {
    background-color: var(--ftw-background-accent-four, #444);
    color: var(--ftw-text-title, #fff);
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .ft-table tbody td {
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .text-accent-one {
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .text-secondary-ft {
    color: var(--ftw-text-secondary, #aaa);
  }
  .btn-outline-ft-success {
    color: var(--ftw-success-color, #198754);
    border: 1px solid var(--ftw-success-color, #198754);
  }
  .btn-outline-ft-success:hover:not(:disabled) {
    background-color: var(--ftw-success-color, #198754);
    color: #fff;
  }
  .btn-outline-ft-primary {
    color: var(--ftw-selected-color, #459685);
    border: 1px solid var(--ftw-selected-color, #459685);
  }
  .btn-outline-ft-primary:hover:not(:disabled) {
    background-color: var(--ftw-selected-color, #459685);
    color: #fff;
  }
</style>
