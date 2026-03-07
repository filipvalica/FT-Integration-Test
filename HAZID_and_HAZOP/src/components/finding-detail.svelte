<script>
  import { untrack } from 'svelte';
  import { PlusCircle, Link45deg, Trash, Book, InfoCircle } from 'svelte-bootstrap-icons';
  import HazidService from '../actions/hazid-service';
  import LibraryService from '../actions/library-service';

  /**
   * @typedef {Object} FindingDetailProps
   * @property {string|null} findingId - UUID of the finding to edit, or null for new
   * @property {string} reviewId - UUID of the parent review
   * @property {Array} [currentSelection] - List of currently selected FieldTwin objects
   * @property {function(): void} [onClose] - Callback when the modal is closed
   * @property {function(): void} [onCreated] - Callback when a new finding is created
   * @property {function(): void} [onUpdated] - Callback when an existing finding is updated
   */

  /** @type {FindingDetailProps} Component props */
  const { 
    findingId = null, 
    reviewId, 
    currentSelection = [], 
    onClose = () => {}, 
    onCreated = () => {}, 
    onUpdated = () => {}, 
  } = $props();

  /** @type {boolean} Derived state for whether we are creating or editing */
  let isNew = $derived(!findingId);

  /** @type {Array<string>} List of available hazard categories */
  let categories = $state([]);
  /** @type {Array<Object>} List of hazards in the selected category */
  let hazardsInSelectedCategory = $state([]);
  /** @type {string} Selected category in the library seeder */
  let selectedCategory = $state('');
  /** @type {string} Selected hazard ID in the library seeder */
  let selectedLibraryHazardId = $state('');

  /** @type {Object} The finding data state */
  let finding = $state({
    title: '',
    hazard: '',
    cause: '',
    consequence: '',
    safeguard: '',
    recommendation: '',
    severity: 'Medium',
    likelihood: 'Occasional',
    status: 'Open',
    owner: '',
    dueDate: '',
    linkedObjects: [],
  });

  /** @type {Array<Object>} List of actions for this finding */
  let actions = $state([]);
  /** @type {string} Description for a new action being added */
  let newActionDescription = $state('');

  // Use a controlled effect to initialize data
  $effect(() => {
    // We only want this to run when findingId or currentSelection changes
    const id = findingId;
    const selection = currentSelection;
    
    untrack(async () => {
      console.log('FindingDetail: Loading library...');
      // Load Library
      await LibraryService.loadLibrary();
      categories = LibraryService.getCategories();
      console.log('FindingDetail: Library categories loaded:', categories.length);

      console.log('FindingDetail: Initializing data. findingId:', id);
      if (id) {
        const data = HazidService.getFinding(id);
        if (data) {
          // Update finding state without triggering further effects
          Object.assign(finding, data);
          actions = HazidService.getActions(id);
        }
      } else if (Array.isArray(selection) && selection.length > 0) {
        finding.linkedObjects = selection.map(obj => ({
          id: obj?.id || 'unknown',
          name: obj?.name || obj?.id || 'Unknown Object',
          type: obj?.type || 'unknown',
        }));
        finding.title = `Hazard linked to ${finding.linkedObjects.length} object(s)`;
      }
    });
  });

  // Handle category change
  $effect(() => {
    if (selectedCategory) {
      hazardsInSelectedCategory = LibraryService.getHazardsByCategory(selectedCategory);
      selectedLibraryHazardId = '';
    } else {
      hazardsInSelectedCategory = [];
    }
  });

  /**
   * Applies the selected library seed to the finding form.
   *
   * @returns {void}
   */
  function applyLibrarySeed() {
    if (!selectedLibraryHazardId) return;
    
    const seed = hazardsInSelectedCategory.find(h => h.id === selectedLibraryHazardId);
    if (!seed) return;

    if (confirm('Overwrite current finding data with values from the library?')) {
      finding.title = seed.hazard;
      finding.hazard = seed.hazard;
      finding.cause = seed.causes;
      finding.consequence = seed.consequences;
      finding.safeguard = seed.safeguards;
      finding.recommendation = seed.actions;
      finding.severity = seed.severity || 'Medium';
      finding.likelihood = seed.likelihood || 'Occasional';
      
      // Clear selection after applying
      selectedLibraryHazardId = '';
      selectedCategory = '';
    }
  }

  /**
   * Saves the current finding (create or update).
   *
   * @returns {void}
   */
  function handleSave() {
    console.log('FindingDetail: Save button clicked');
    if (!finding.title) {
      alert('Please provide a title for the finding.');
      return;
    }

    try {
      if (isNew) {
        HazidService.createFinding({
          ...finding,
          reviewId,
        });
        console.log('FindingDetail: Finding created successfully');
        onCreated();
      } else {
        HazidService.updateFinding(findingId, finding);
        console.log('FindingDetail: Finding updated successfully');
        onUpdated();
      }
    } catch (err) {
      console.error('FindingDetail: Error saving finding:', err);
    }
  }

  /**
   * Adds a new individual action to the finding.
   *
   * @returns {void}
   */
  function handleAddAction() {
    if (!newActionDescription || isNew) return;
    
    try {
      HazidService.createAction({
        findingId,
        description: newActionDescription,
        status: 'Open',
      });
      actions = HazidService.getActions(findingId);
      newActionDescription = '';
    } catch (err) {
      console.error('FindingDetail: Error adding action:', err);
    }
  }

  /**
   * Deletes the current finding after confirmation.
   *
   * @returns {void}
   */
  function handleDelete() {
    if (!findingId) return;
    
    if (confirm('Are you sure you want to delete this finding? This action cannot be undone.')) {
      try {
        console.log('FindingDetail: Deleting finding:', findingId);
        HazidService.deleteFindings([findingId]);
        onUpdated(); // Triggers refresh in parent
      } catch (err) {
        console.error('FindingDetail: Error deleting finding:', err);
      }
    }
  }

  /**
   * Cancels the edit and closes the modal.
   *
   * @param {Event} [e] - Optional click event
   * @returns {void}
   */
  function handleCancel(e) {
    if (e) e.preventDefault();
    console.log('FindingDetail: Close/Cancel triggered');
    onClose();
  }

  /**
   * Returns the appropriate Bootstrap badge class for a risk level.
   *
   * @param {string} level - Risk level string
   * @returns {string} CSS class
   */
  function getRiskLevelBadge(level) {
    if (!level) return 'bg-secondary';
    if (level.startsWith('5')) return 'bg-danger';
    if (level.startsWith('4')) return 'bg-danger';
    if (level.startsWith('3')) return 'bg-warning text-dark';
    if (level.startsWith('2')) return 'bg-success';
    if (level.startsWith('1')) return 'bg-success';
    return 'bg-secondary';
  }
</script>

<div class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.75); z-index: 1050;">
  <div class="modal-dialog modal-xl modal-dialog-scrollable" role="document">
    <div class="modal-content ft-modal shadow-lg border-0">
      <div class="modal-header border-bottom-ft">
        <h5 class="modal-title text-accent">{isNew ? 'New HAZID Finding' : 'Finding Details'}</h5>
        <button type="button" class="btn-close btn-close-white" onclick={handleCancel} aria-label="Close"></button>
      </div>
      <div class="modal-body p-4">
        <!-- Seeding from Hazard Library -->
        <div class="card mb-4 ft-side-card border-0 shadow-sm animate-fade-in">
          <div class="card-header border-0 py-2 d-flex align-items-center">
            <Book class="me-2" /> <span class="small fw-bold uppercase">Seed from Hazard Library</span>
          </div>
          <div class="card-body p-3">
            <div class="row g-2 align-items-end">
              <div class="col-md-5">
                <label for="lib-category" class="form-label small opacity-75">1. Hazard Category</label>
                <select id="lib-category" class="form-select form-select-sm ft-input" bind:value={selectedCategory}>
                  <option value="">Select a Category...</option>
                  {#each categories as cat}
                    <option value={cat}>{cat}</option>
                  {/each}
                </select>
              </div>
              <div class="col-md-5">
                <label for="lib-hazard" class="form-label small opacity-75">2. Standard Hazard</label>
                <select id="lib-hazard" class="form-select form-select-sm ft-input" bind:value={selectedLibraryHazardId} disabled={!selectedCategory}>
                  <option value="">Select a Hazard...</option>
                  {#each hazardsInSelectedCategory as haz}
                    <option value={haz.id}>{haz.hazard}</option>
                  {/each}
                </select>
              </div>
              <div class="col-md-2">
                <button type="button" class="btn btn-ft-primary btn-sm w-100" onclick={applyLibrarySeed} disabled={!selectedLibraryHazardId}>
                  Apply Seed
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onsubmit={(e) => e.preventDefault()}>
          <div class="row g-4">
            <!-- Left Column: Details -->
            <div class="col-md-8 border-end-ft">
              <div class="mb-4">
                <label for="f-title" class="form-label fw-bold text-accent small uppercase">Title *</label>
                <input id="f-title" type="text" class="form-control ft-input form-control-lg" bind:value={finding.title} placeholder="e.g., Potential Leak at Wellhead Connection">
              </div>

              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label for="f-hazard" class="form-label fw-bold small text-accent-one">Hazard</label>
                  <textarea id="f-hazard" class="form-control ft-input" rows="2" bind:value={finding.hazard} placeholder="What is the risk?"></textarea>
                </div>
                <div class="col-md-6">
                  <label for="f-cause" class="form-label fw-bold small text-accent-one">Cause</label>
                  <textarea id="f-cause" class="form-control ft-input" rows="2" bind:value={finding.cause} placeholder="Root cause?"></textarea>
                </div>
              </div>

              <div class="row g-3 mb-4">
                <div class="col-md-6">
                  <label for="f-consequence" class="form-label fw-bold small text-accent-one">Consequence</label>
                  <textarea id="f-consequence" class="form-control ft-input" rows="2" bind:value={finding.consequence} placeholder="Impact?"></textarea>
                </div>
                <div class="col-md-6">
                  <label for="f-safeguard" class="form-label fw-bold small text-accent-one">Existing Safeguards</label>
                  <textarea id="f-safeguard" class="form-control ft-input" rows="2" bind:value={finding.safeguard} placeholder="Current mitigations?"></textarea>
                </div>
              </div>

              <div class="mb-4">
                <label for="f-recommendation" class="form-label fw-bold small text-accent">Recommended Action / Mitigation</label>
                <textarea id="f-recommendation" class="form-control ft-input highlight-input" rows="3" bind:value={finding.recommendation} placeholder="What should be done?"></textarea>
              </div>

              <hr class="border-secondary-ft my-4">
              
              <h6 class="fw-bold mb-3 text-accent"><Link45deg class="me-1" /> Linked Field Objects</h6>
              <div class="d-flex flex-wrap gap-2">
                {#each finding.linkedObjects as obj}
                  <div class="badge rounded-pill bg-link-pill p-2 d-flex align-items-center">
                    <span class="me-2">{obj.name}</span>
                    <span class="small opacity-75">({obj.type})</span>
                  </div>
                {:else}
                  <div class="text-secondary-ft small italic">No FieldTwin objects linked to this finding.</div>
                {/each}
              </div>

              {#if !isNew}
                <hr class="border-secondary-ft my-4">
                <h6 class="fw-bold mb-3 text-accent"><PlusCircle class="me-1" /> Assigned Actions</h6>
                <div class="list-group mb-3 ft-list-group shadow-sm">
                  {#each actions as action}
                    <div class="list-group-item ft-list-item d-flex justify-content-between align-items-center border-secondary-ft">
                      <span class="small">{action.description}</span>
                      <span class="badge {action.status === 'Closed' ? 'bg-success' : 'bg-ft-primary'}">{action.status}</span>
                    </div>
                  {:else}
                    <div class="list-group-item ft-list-item text-secondary-ft small py-3 border-secondary-ft">No individual actions created yet.</div>
                  {/each}
                </div>
                <div class="input-group">
                  <input type="text" class="form-control ft-input" placeholder="Add a follow-up action..." bind:value={newActionDescription}>
                  <button class="btn btn-ft-primary" type="button" onclick={handleAddAction} disabled={!newActionDescription}>
                    Add
                  </button>
                </div>
              {/if}
            </div>
            
            <!-- Right Column: Meta -->
            <div class="col-md-4">
              <div class="card ft-side-card border-0">
                <div class="card-body p-3">
                  <h6 class="fw-bold mb-3 text-accent">Risk Assessment</h6>
                <div class="mb-3">
                  <label for="f-severity" class="form-label small fw-bold d-flex justify-content-between align-items-center">
                    Severity
                    <span class="badge {getRiskLevelBadge(finding.severity)}">{finding.severity || '3 - Medium'}</span>
                  </label>
                  <select id="f-severity" class="form-select ft-input form-select-sm" bind:value={finding.severity}>
                    <option value="5 - Critical">5 - Critical</option>
                    <option value="4 - High">4 - High</option>
                    <option value="3 - Medium">3 - Medium</option>
                    <option value="2 - Low">2 - Low</option>
                    <option value="1 - Negligible">1 - Negligible</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="f-likelihood" class="form-label small fw-bold d-flex justify-content-between align-items-center">
                    Likelihood
                    <span class="badge {getRiskLevelBadge(finding.likelihood)}">{finding.likelihood || '3 - Occasional'}</span>
                  </label>
                  <select id="f-likelihood" class="form-select ft-input form-select-sm" bind:value={finding.likelihood}>
                    <option value="5 - Frequent">5 - Frequent</option>
                    <option value="4 - Probable">4 - Probable</option>
                    <option value="3 - Occasional">3 - Occasional</option>
                    <option value="2 - Remote">2 - Remote</option>
                    <option value="1 - Improbable">1 - Improbable</option>
                  </select>
                </div>                  <hr class="border-secondary-ft">
                  <div class="mb-3">
                    <label for="f-status" class="form-label small fw-bold">Finding Status</label>
                    <select id="f-status" class="form-select ft-input form-select-sm" bind:value={finding.status}>
                      <option>Open</option>
                      <option>Under Review</option>
                      <option>Mitigated</option>
                      <option>Closed</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="f-owner" class="form-label small fw-bold">Owner</label>
                    <input id="f-owner" type="text" class="form-control ft-input form-control-sm" bind:value={finding.owner} placeholder="Assignee">
                  </div>
                  <div class="mb-0">
                    <label for="f-dueDate" class="form-label small fw-bold">Due Date</label>
                    <input id="f-dueDate" type="date" class="form-control ft-input form-control-sm" bind:value={finding.dueDate}>
                  </div>
                </div>
              </div>
              
              <div class="alert alert-ft-info mt-4 small">
                <InfoCircle class="me-2" /> All changes are saved to the current project context.
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer border-top-ft px-4 py-3">
        {#if !isNew}
          <button type="button" class="btn btn-outline-danger me-auto" onclick={handleDelete}>
            <Trash class="me-1" /> Delete Finding
          </button>
        {:else}
          <button type="button" class="btn btn-link text-secondary-ft text-decoration-none me-auto" onclick={handleCancel}>Discard Changes</button>
        {/if}
        <button type="button" class="btn btn-outline-ft px-4" onclick={handleCancel}>Cancel</button>
        <button type="button" class="btn btn-ft-primary px-5 shadow-sm" onclick={handleSave} disabled={!finding.title}>
          {isNew ? 'Create Finding' : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .ft-modal {
    background-color: var(--ftw-card-background-color, #2b2b2b);
    color: var(--ftw-text-accent-one, #e0e0e0);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .border-bottom-ft {
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .border-top-ft {
    border-top: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .border-end-ft {
    border-right: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .border-secondary-ft {
    border-color: var(--ftw-border-color-accent-one, #444)!important;
  }
  .text-accent {
    color: var(--ftw-selected-color, #459685);
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
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .ft-input:focus {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    border-color: var(--ftw-selected-color, #459685);
    color: #fff;
    box-shadow: 0 0 0 0.25rem rgba(69, 150, 133, 0.25);
  }
  .highlight-input {
    background-color: var(--ftw-background-accent-two, #222);
  }
  .ft-side-card {
    background-color: var(--ftw-background-accent-two, #222);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .bg-link-pill {
    background-color: rgba(69, 150, 133, 0.2);
    color: var(--ftw-selected-color, #459685);
    border: 1px solid rgba(69, 150, 133, 0.3);
  }
  .btn-ft-primary {
    background-color: var(--ftw-selected-color, #459685);
    color: #fff;
    border: none;
  }
  .btn-ft-primary:hover {
    background-color: #3a8274;
    color: #fff;
  }
  .bg-ft-primary {
    background-color: var(--ftw-selected-color, #459685);
    color: #fff;
  }
  .btn-outline-ft {
    color: var(--ftw-text-accent-one, #e0e0e0);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .btn-outline-ft:hover {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    color: #fff;
  }
  .ft-list-item {
    background-color: transparent;
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .alert-ft-info {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
  .italic { font-style: italic; }
</style>
