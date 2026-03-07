<script>
  import HazidService from '../actions/hazid-service';

  /**
   * @typedef {Object} ReviewDetailsProps
   * @property {string} reviewId - UUID of the active review
   * @property {function(): void} onUpdate - Callback when the review is updated
   */

  /** @type {ReviewDetailsProps} Component props */
  const { reviewId, onUpdate } = $props();

  /** @type {Object|null} The review data state */
  let review = $state({
    name: '',
    phase: 'Concept',
    facilitator: '',
    participants: '',
    description: '',
    status: 'Draft',
  });

  $effect(() => {
    const data = HazidService.getReview(reviewId);
    if (data) {
      Object.assign(review, data);
    }
  });

  /**
   * Saves the updated review data.
   *
   * @returns {void}
   */
  function handleSave() {
    if (!review.name) return;
    
    HazidService.updateReview(reviewId, review);
    onUpdate();
    alert('Review details updated successfully.');
  }
</script>

<div class="review-details p-4 h-100 overflow-auto animate-fade-in">
  <div class="card ft-card shadow-sm border-0 max-width-800 mx-auto">
    <div class="card-header border-bottom-ft py-3">
      <h5 class="card-title mb-0 text-accent">Edit Review Information</h5>
    </div>
    <div class="card-body p-4">
      <form onsubmit={(e) => e.preventDefault()}>
        <div class="row g-3">
          <div class="col-md-8">
            <label for="reviewName" class="form-label small fw-bold uppercase opacity-75">Review Name *</label>
            <input type="text" class="form-control ft-input" id="reviewName" bind:value={review.name} placeholder="e.g. Subsea Layout HAZID 2026">
          </div>
          <div class="col-md-4">
            <label for="reviewStatus" class="form-label small fw-bold uppercase opacity-75">Status</label>
            <select class="form-select ft-input" id="reviewStatus" bind:value={review.status}>
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Approved">Approved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          
          <div class="col-md-6">
            <label for="reviewPhase" class="form-label small fw-bold uppercase opacity-75">Lifecycle Phase</label>
            <select class="form-select ft-input" id="reviewPhase" bind:value={review.phase}>
              <option value="Concept">Concept</option>
              <option value="FEED">FEED</option>
              <option value="Detailed Design">Detailed Design</option>
              <option value="EPC">EPC</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div class="col-md-6">
            <label for="facilitator" class="form-label small fw-bold uppercase opacity-75">Facilitator</label>
            <input type="text" class="form-control ft-input" id="facilitator" bind:value={review.facilitator} placeholder="Name of the facilitator">
          </div>

          <div class="col-12">
            <label for="participants" class="form-label small fw-bold uppercase opacity-75">Participants</label>
            <textarea class="form-control ft-input" id="participants" rows="2" bind:value={review.participants} placeholder="List of participants (comma separated)"></textarea>
          </div>

          <div class="col-12">
            <label for="description" class="form-label small fw-bold uppercase opacity-75">Description / Objectives</label>
            <textarea class="form-control ft-input" id="description" rows="4" bind:value={review.description} placeholder="General context and scope of the review"></textarea>
          </div>
        </div>

        <div class="mt-4 pt-3 border-top-ft d-flex justify-content-end">
          <button type="button" class="btn btn-ft-primary px-5" onclick={handleSave} disabled={!review.name}>
            Save Review Details
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  .max-width-800 { max-width: 800px; }
  .ft-card {
    background-color: var(--ftw-card-background-color, #2b2b2b);
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .border-bottom-ft {
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444)!important;
  }
  .border-top-ft {
    border-top: 1px solid var(--ftw-border-color-accent-one, #444)!important;
  }
  .text-accent {
    color: var(--ftw-selected-color, #459685);
  }
  .ft-input {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .btn-ft-primary {
    background-color: var(--ftw-selected-color, #459685);
    color: #fff;
    border: none;
  }
  .uppercase { text-transform: uppercase; letter-spacing: 0.05em; }
</style>
