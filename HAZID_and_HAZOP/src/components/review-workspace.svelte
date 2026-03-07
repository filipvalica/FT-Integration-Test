<script>
  import { 
    ChevronLeft, 
    CardList, 
    Check2Square, 
    Grid3x3Gap, 
    PlusCircle, 
    Download,
    InfoCircle,
  } from 'svelte-bootstrap-icons';
  import HazidService from '../actions/hazid-service';
  import FindingsRegister from './findings-register.svelte';
  import ActionRegister from './action-register.svelte';
  import RiskMatrix from './risk-matrix.svelte';
  import FindingDetail from './finding-detail.svelte';
  import ReviewDetails from './review-details.svelte';

  /**
   * @typedef {Object} ReviewWorkspaceProps
   * @property {string} reviewId - UUID of the active review
   * @property {string} projectId - FieldTwin project UUID
   * @property {Array} currentSelection - List of currently selected objects from host
   * @property {string} activeTab - Currently active tab (findings|actions|matrix|details)
   * @property {string|null} selectedFindingId - ID of finding currently being viewed
   * @property {boolean} showCreateFinding - Whether the create finding modal is visible
   * @property {function(string): void} onTabChange - Callback for tab switching
   * @property {function(string): void} onOpenFinding - Callback to open a finding
   * @property {function(): void} onNewFinding - Callback to trigger new finding
   * @property {function(): void} onCloseDetail - Callback to close finding detail
   * @property {function(): void} onGoBack - Callback to return to dashboard
   */

  /** @type {ReviewWorkspaceProps} Component props */
  const { 
    reviewId, 
    projectId, 
    currentSelection,
    activeTab,
    selectedFindingId,
    showCreateFinding,
    onTabChange,
    onOpenFinding,
    onNewFinding,
    onCloseDetail,
    onGoBack,
  } = $props();

  /** @type {Object|null} The current review object */
  let review = $state(null);
  /** @type {Array<Object>} List of findings for the current review */
  let findings = $state([]);

  $effect(() => {
    review = HazidService.getReview(reviewId);
    findings = HazidService.getFindings(reviewId);
  });

  /**
   * Triggers a refresh of the findings list.
   *
   * @returns {void}
   */
  function refreshFindings() {
    console.log('Workspace: Refreshing findings');
    findings = HazidService.getFindings(reviewId);
    onCloseDetail();
  }

  /**
   * Triggers a refresh of the review data.
   *
   * @returns {void}
   */
  function refreshReview() {
    console.log('Workspace: Refreshing review');
    review = HazidService.getReview(reviewId);
  }

  /**
   * Exports the review findings to a CSV file.
   *
   * @returns {void}
   */
  function handleExport() {
    HazidService.exportToCsv(reviewId);
  }
</script>

<div class="workspace d-flex flex-column h-100 animate-fade-in">
  <!-- Workspace Header -->
  <div class="workspace-header pb-3 mb-3 border-bottom-ft d-flex justify-content-between align-items-center">
    <div class="d-flex align-items-center">
      <button class="btn btn-sm btn-outline-ft me-3" onclick={onGoBack} title="Back to Dashboard">
        <ChevronLeft />
      </button>
      <div>
        <h4 class="mb-0 text-accent fw-bold">{review?.name || 'Loading Review...'}</h4>
        <div class="small text-secondary-ft">
          {review?.phase} &bull; {findings.length} Findings &bull; {review?.status}
        </div>
      </div>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-sm btn-outline-ft d-flex align-items-center" onclick={handleExport}>
        <Download class="me-2" /> Export CSV
      </button>
      <button class="btn btn-sm btn-ft-primary d-flex align-items-center" onclick={onNewFinding}>
        <PlusCircle class="me-2" /> Log Finding
      </button>
    </div>
  </div>

  <!-- Workspace Tabs -->
  <ul class="nav nav-tabs ft-tabs mb-3 border-0">
    <li class="nav-item">
      <button 
        class="nav-link {activeTab === 'findings' ? 'active' : ''}" 
        onclick={() => onTabChange('findings')}
      >
        <CardList class="me-2" /> Findings Register
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="nav-link {activeTab === 'actions' ? 'active' : ''}" 
        onclick={() => onTabChange('actions')}
      >
        <Check2Square class="me-2" /> Action Tracking
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="nav-link {activeTab === 'matrix' ? 'active' : ''}" 
        onclick={() => onTabChange('matrix')}
      >
        <Grid3x3Gap class="me-2" /> Risk Matrix
      </button>
    </li>
    <li class="nav-item">
      <button 
        class="nav-link {activeTab === 'details' ? 'active' : ''}" 
        onclick={() => onTabChange('details')}
      >
        <InfoCircle class="me-2" /> Review Details
      </button>
    </li>
  </ul>

  <!-- Workspace Content -->
  <div class="workspace-content flex-grow-1 overflow-hidden">
    {#if activeTab === 'findings'}
      <FindingsRegister {reviewId} {findings} onOpenFinding={onOpenFinding} onRefresh={refreshFindings} />
    {:else if activeTab === 'actions'}
      <ActionRegister {reviewId} />
    {:else if activeTab === 'matrix'}
      <RiskMatrix {findings} onOpenFinding={onOpenFinding} />
    {:else if activeTab === 'details'}
      <ReviewDetails {reviewId} onUpdate={refreshReview} />
    {/if}
  </div>
</div>

<!-- Finding Detail Modal -->
{#if showCreateFinding || selectedFindingId}
  <FindingDetail 
    findingId={selectedFindingId} 
    {reviewId} 
    {currentSelection}
    onClose={onCloseDetail}
    onCreated={refreshFindings}
    onUpdated={refreshFindings}
  />
{/if}

<style>
  .workspace {
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .border-bottom-ft {
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .text-accent {
    color: var(--ftw-selected-color, #459685);
  }
  .text-secondary-ft {
    color: var(--ftw-text-secondary, #aaa);
  }
  .btn-outline-ft {
    color: var(--ftw-text-accent-one, #e0e0e0);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .btn-outline-ft:hover {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    color: #fff;
  }
  .btn-ft-primary {
    background-color: var(--ftw-selected-color, #459685);
    color: #fff;
    border: none;
  }
  .ft-tabs .nav-link {
    background: transparent;
    color: var(--ftw-text-secondary, #aaa);
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0.75rem 1.25rem;
    font-weight: 500;
  }
  .ft-tabs .nav-link:hover {
    color: var(--ftw-text-accent-one, #e0e0e0);
  }
  .ft-tabs .nav-link.active {
    background: transparent;
    color: var(--ftw-selected-color, #459685);
    border-bottom-color: var(--ftw-selected-color, #459685);
  }
  .workspace-content {
    background-color: var(--ftw-background-accent-two, #222);
    border-radius: 8px;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
