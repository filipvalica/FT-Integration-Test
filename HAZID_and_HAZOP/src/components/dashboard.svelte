<script>
  import { PlusCircle, Search, Calendar, Person, Tag } from 'svelte-bootstrap-icons';
  import HazidService from '../actions/hazid-service';

  /**
   * @typedef {Object} DashboardProps
   * @property {string} projectId - Active FieldTwin Project ID
   * @property {function(string): void} openReview - Callback to navigate to a review workspace
   */

  /** @type {DashboardProps} Component props */
  const { projectId, openReview } = $props();

  /** @type {Array<Object>} List of HAZID reviews */
  let reviews = $state([]);
  /** @type {string} Current search filter query */
  let searchQuery = $state('');
  /** @type {boolean} Modal visibility state */
  let showCreateModal = $state(false);

  /** @type {Object} State for the new review form */
  let newReview = $state({
    name: '',
    phase: 'Concept',
    facilitator: '',
    participants: '',
    description: '',
    status: 'Draft',
  });

  $effect(() => {
    reviews = HazidService.getReviews(projectId);
  });

  /** @type {Array<Object>} Filtered list based on search query */
  const filteredReviews = $derived(
    reviews.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facilitator.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  /**
   * Creates a new review and navigates to its workspace.
   *
   * @returns {void}
   */
  function handleCreateReview() {
    if (!newReview.name) return;
    
    const review = HazidService.createReview({
      ...newReview,
      projectId,
    });
    console.log('Created new review:', review);
    reviews = HazidService.getReviews(projectId);
    showCreateModal = false;
    newReview = { 
      name: '', 
      phase: 'Concept', 
      facilitator: '', 
      participants: '', 
      description: '', 
      status: 'Draft', 
    };
    openReview(review.id);
  }

  /**
   * Opens an existing review workspace.
   *
   * @param {string} id - The review UUID
   * @returns {void}
   */
  function handleOpenReview(id) {
    console.log('Dashboard: Opening review with ID:', id);
    openReview(id);
  }

  /**
   * Triggers a JSON backup of all HAZID data.
   *
   * @returns {void}
   */
  function handleBackup() {
    HazidService.exportToJson();
  }

  /** @type {HTMLInputElement} Reference to the hidden file input */
  let fileInput;

  /**
   * Handles the restoration of data from a JSON file.
   *
   * @param {Event} e - Input change event
   * @returns {Promise<void>}
   */
  async function handleRestore(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await HazidService.importFromJson(file);
      reviews = HazidService.getReviews(projectId);
      alert('Data restored successfully');
    } catch (err) {
      alert('Failed to restore data: ' + err.message);
    }
  }
</script>

<div class="dashboard">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="section-title">HAZID Reviews</h2>
    <div class="d-flex gap-2">
      <input type="file" bind:this={fileInput} onchange={handleRestore} style="display: none;" accept=".json" />
      <button class="btn btn-sm btn-outline-secondary d-flex align-items-center" onclick={() => fileInput.click()}>
        Restore JSON
      </button>
      <button class="btn btn-sm btn-outline-secondary d-flex align-items-center" onclick={handleBackup}>
        Backup JSON
      </button>
      <button class="btn btn-ft-primary d-flex align-items-center" onclick={() => showCreateModal = true}>
        <PlusCircle class="me-2" /> New Review
      </button>
    </div>
  </div>

  <div class="card shadow-sm mb-4 ft-card">
    <div class="card-body">
      <div class="input-group">
        <span class="input-group-text search-icon-bg"><Search /></span>
        <input 
          type="text" 
          class="form-control ft-input border-start-0" 
          placeholder="Search reviews by name or facilitator..." 
          bind:value={searchQuery}
        />
      </div>
    </div>
  </div>

  <div class="row g-3">
    {#each filteredReviews as review (review.id)}
      <div class="col-md-6 col-lg-4">
        <button 
          type="button"
          class="card h-100 review-card shadow-sm border-0 w-100 text-start p-0 ft-card" 
          onclick={() => handleOpenReview(review.id)}
          aria-label="Open review {review.name}"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title text-accent mb-0">{review.name}</h5>
              <span class="badge bg-status">{review.status}</span>
            </div>
            <p class="card-text text-secondary-ft small mb-3 text-truncate-2">
              {review.description || 'No description provided.'}
            </p>
            <div class="d-flex flex-wrap gap-2 small text-secondary-ft">
              <div class="d-flex align-items-center">
                <Tag class="me-1" /> {review.phase}
              </div>
              <div class="d-flex align-items-center">
                <Person class="me-1" /> {review.facilitator || 'Unassigned'}
              </div>
              <div class="d-flex align-items-center">
                <Calendar class="me-1" /> {new Date(review.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent border-top-0 text-end pb-3">
            <span class="btn btn-sm btn-outline-ft">Open Workspace</span>
          </div>
        </button>
      </div>
    {:else}
      <div class="col-12 text-center py-5">
        <div class="text-secondary-ft">
          <p>No reviews found. Create your first HAZID review to get started.</p>
        </div>
      </div>
    {/each}
  </div>
</div>

{#if showCreateModal}
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.7)">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content ft-modal">
        <div class="modal-header border-secondary-ft">
          <h5 class="modal-title text-accent">Create New HAZID Review</h5>
          <button type="button" class="btn-close btn-close-white" onclick={() => showCreateModal = false} aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="reviewName" class="form-label small fw-bold">Review Name *</label>
            <input type="text" class="form-control ft-input" id="reviewName" bind:value={newReview.name} placeholder="e.g. Subsea Layout HAZID 2026">
          </div>
          <div class="mb-3">
            <label for="reviewPhase" class="form-label small fw-bold">Lifecycle Phase</label>
            <select class="form-select ft-input" id="reviewPhase" bind:value={newReview.phase}>
              <option value="Concept">Concept</option>
              <option value="FEED">FEED</option>
              <option value="Detailed Design">Detailed Design</option>
              <option value="EPC">EPC</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div class="mb-3">
            <label for="facilitator" class="form-label small fw-bold">Facilitator</label>
            <input type="text" class="form-control ft-input" id="facilitator" bind:value={newReview.facilitator} placeholder="Name of the facilitator">
          </div>
          <div class="mb-3">
            <label for="participants" class="form-label small fw-bold">Participants</label>
            <textarea class="form-control ft-input" id="participants" rows="2" bind:value={newReview.participants} placeholder="List of participants"></textarea>
          </div>
          <div class="mb-3">
            <label for="description" class="form-label small fw-bold">Description</label>
            <textarea class="form-control ft-input" id="description" rows="3" bind:value={newReview.description}></textarea>
          </div>
        </div>
        <div class="modal-footer border-secondary-ft">
          <button type="button" class="btn btn-outline-secondary btn-sm" onclick={() => showCreateModal = false}>Cancel</button>
          <button type="button" class="btn btn-ft-primary btn-sm" onclick={handleCreateReview} disabled={!newReview.name}>Create Review</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .section-title {
    color: var(--ftw-text-title, #fff);
    font-weight: 600;
  }
  .text-accent {
    color: var(--ftw-selected-color, #459685);
  }
  .text-secondary-ft {
    color: var(--ftw-text-secondary, #aaa);
  }
  .ft-card {
    background-color: var(--ftw-card-background-color, #2b2b2b);
    color: var(--ftw-text-accent-one, #e0e0e0);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .review-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s, background-color 0.2s;
  }
  .review-card:hover {
    transform: translateY(-5px);
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.3)!important;
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
  .btn-ft-primary:disabled {
    background-color: var(--ftw-locked-color, #555);
    opacity: 0.6;
  }
  .btn-outline-ft {
    color: var(--ftw-selected-color, #459685);
    border: 1px solid var(--ftw-selected-color, #459685);
  }
  .btn-outline-ft:hover {
    background-color: var(--ftw-selected-color, #459685);
    color: #fff;
  }
  .bg-status {
    background-color: var(--ftw-background-accent-four, #444);
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .search-icon-bg {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
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
  .ft-modal {
    background-color: var(--ftw-card-background-color, #2b2b2b);
    color: var(--ftw-text-accent-one, #e0e0e0);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .border-secondary-ft {
    border-color: var(--ftw-border-color-accent-one, #444)!important;
  }
  .text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;  
    overflow: hidden;
  }
</style>
