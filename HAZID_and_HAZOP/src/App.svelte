<script>
  import { version } from '../package.json';
  import { untrack } from 'svelte';

  import 'bootstrap/dist/css/bootstrap.min.css';
  import { InfoCircle, House, PlusCircle, Bug } from 'svelte-bootstrap-icons';

  import IntegrationService from './actions/integration-service';
  
  import Dashboard from './components/dashboard.svelte';
  import ReviewWorkspace from './components/review-workspace.svelte';
  import TestHarness from './components/test-harness.svelte';

  /** @type {string} FieldTwin JWT token */
  let token = $state('');
  /** @type {boolean} Derived state for whether the app is loaded */
  let loaded = $derived(!!token);
  /** @type {string} Active FieldTwin Project ID */
  let projectId = $state('');
  /** @type {string} Active FieldTwin SubProject ID */
  let subProjectId = $state('');
  /** @type {Array<Object>} Currently selected objects from FieldTwin 3D View */
  let currentSelection = $state([]);

  /** @type {'dashboard' | 'workspace'} Current application view */
  let currentView = $state('dashboard');
  /** @type {string|null} ID of the review currently being edited */
  let activeReviewId = $state(null);
  /** @type {boolean} Whether the app is running in standalone mode (no host) */
  let isStandalone = $state(false);
  /** @type {boolean} Whether to show the debug footer */
  let showDebug = $state(false);

  /** 
   * @typedef {Object} WorkspaceState
   * @property {'findings' | 'actions' | 'matrix'} activeTab
   * @property {string|null} selectedFindingId
   * @property {boolean} showCreateFinding
   */

  /** @type {WorkspaceState} Centralized state for the workspace view */
  let workspaceState = $state({
    activeTab: 'findings',
    selectedFindingId: null,
    showCreateFinding: false,
  });

  /**
   * Initializes the application with data received from the FieldTwin host.
   *
   * @param {Object} data - The initialization data from FieldTwin
   * @param {string} data.token - JWT authentication token
   * @param {string} data.project - Project UUID
   * @param {string} data.subProject - SubProject UUID
   * @param {string} [data.cssUrl] - Optional FieldTwin theme URL
   * @param {Array} [data.selection] - Initial selection
   * @returns {void}
   */
  function handleLoaded(data) {
    console.log('App: handleLoaded', data);
    
    if (data.cssUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = data.cssUrl;
      link.id = 'fieldtwin-theme';
      document.head.appendChild(link);
    }

    IntegrationService.setJWT(data.token);
    IntegrationService.setProject(data.project, data.subProject);
    projectId = data.project;
    subProjectId = data.subProject;
    
    if (data.selection) {
      currentSelection = data.selection;
    }
    
    token = data.token;
  }

  $effect(() => {
    if (!loaded && window.loadedEvent) {
      handleLoaded(window.loadedEvent);
    }
  });

  /**
   * Event handler for window.postMessage events from the FieldTwin host.
   *
   * @param {MessageEvent} msg - The message event
   * @returns {void}
   */
  function onWindowMessage(msg) {
    if (!msg.data) return;

    if (msg.data.event === 'loaded') {
      handleLoaded(msg.data);
    }
    
    if (msg.data.event === 'select') {
      const newSelection = msg.data.data || msg.data.selection || msg.data.payload || [];
      console.log('App: Selection Event', newSelection);
      currentSelection = Array.isArray(newSelection) ? newSelection : [newSelection];
    }
  }

  /**
   * Switches to the Review Workspace for a specific review.
   *
   * @param {string} id - The ID of the review to open
   * @returns {void}
   */
  function navigateToReview(id) {
    console.log('App: Navigating to Workspace', id);
    activeReviewId = id;
    workspaceState.activeTab = 'findings';
    workspaceState.selectedFindingId = null;
    workspaceState.showCreateFinding = false;
    currentView = 'workspace';
  }

  /**
   * Navigates back to the Dashboard.
   *
   * @returns {void}
   */
  function navigateToDashboard() {
    console.log('App: Returning to Dashboard');
    currentView = 'dashboard';
    activeReviewId = null;
  }

  /**
   * Updates the active tab in the workspace view.
   *
   * @param {'findings' | 'actions' | 'matrix'} tab - The tab to switch to
   * @returns {void}
   */
  function handleTabChange(tab) {
    console.log('App: Tab Change ->', tab);
    workspaceState.activeTab = tab;
  }

  /**
   * Opens the detail view for a specific finding.
   *
   * @param {string} id - The ID of the finding
   * @returns {void}
   */
  function handleOpenFinding(id) {
    console.log('App: Opening Finding', id);
    workspaceState.selectedFindingId = id;
    workspaceState.showCreateFinding = false;
  }

  /**
   * Triggers the creation of a new finding.
   *
   * @returns {void}
   */
  function handleNewFinding() {
    console.log('App: New Finding Triggered');
    workspaceState.selectedFindingId = null;
    workspaceState.showCreateFinding = true;
  }

  /**
   * Closes any open finding detail or creation modals.
   *
   * @returns {void}
   */
  function handleCloseDetail() {
    console.log('App: Modal Closed');
    workspaceState.selectedFindingId = null;
    workspaceState.showCreateFinding = false;
  }

  /**
   * Enables standalone test mode with mock data.
   *
   * @returns {void}
   */
  function enableStandalone() {
    isStandalone = true;
    handleLoaded({
      token: 'mock-token',
      project: 'mock-project',
      subProject: 'mock-subproject',
    });
  }
</script>

<svelte:window onmessage={onWindowMessage} />

<main class="app d-flex flex-column vh-100">
  <header class="header p-2 d-flex justify-content-between align-items-center shadow-sm">
    <div class="d-flex align-items-center">
      <h5 class="mb-0 me-3 title-text">FieldTwin HAZID / HAZOP</h5>
      {#if loaded || isStandalone}
        <button 
          type="button"
          class="btn btn-sm btn-home d-flex align-items-center justify-content-center me-2" 
          onclick={navigateToDashboard} 
          title="Home"
        >
          <House />
        </button>
        <button 
          type="button"
          class="btn btn-sm btn-home d-flex align-items-center justify-content-center" 
          onclick={() => showDebug = !showDebug} 
          title="Toggle Debug"
        >
          <Bug />
        </button>
      {/if}
    </div>
  </header>

  <div class="flex-grow-1 overflow-auto main-content">
    {#if loaded || isStandalone}
      <div class="content-container p-3 h-100">
        {#if currentView === 'dashboard'}
          <Dashboard {projectId} openReview={navigateToReview} />
        {:else if currentView === 'workspace'}
          <ReviewWorkspace 
            reviewId={activeReviewId} 
            {projectId} 
            {currentSelection}
            activeTab={workspaceState.activeTab}
            selectedFindingId={workspaceState.selectedFindingId}
            showCreateFinding={workspaceState.showCreateFinding}
            onTabChange={handleTabChange}
            onOpenFinding={handleOpenFinding}
            onNewFinding={handleNewFinding}
            onCloseDetail={handleCloseDetail}
            onGoBack={navigateToDashboard}
          />
        {/if}
      </div>
    {:else}
      <div class="container mt-5 text-center">
        <div class="card shadow-sm mx-auto border-0 ft-init-card">
          <div class="card-body p-5">
            <div class="spinner-border mb-4 ft-spinner" role="status"></div>
            <h4 class="card-title mb-3">Initializing Module</h4>
            <div class="d-grid gap-2">
              <button type="button" class="btn btn-outline-secondary" onclick={enableStandalone}>
                Launch Standalone Test Mode
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <footer class="footer border-top p-2 mt-auto">
    <div class="container-fluid d-flex justify-content-between align-items-center">
      <div class="text-muted small">v{version}</div>
      {#if showDebug}
        <div class="badge bg-dark text-info font-monospace small">
          SEL: {currentSelection.length} | VIEW: {currentView} | TAB: {workspaceState.activeTab} | REV: {activeReviewId}
        </div>
      {/if}
      <div><img src="https://avatars.githubusercontent.com/u/12692713?s=48&v=4" alt="FT" style="height:18px; opacity: 0.5;"></div>
    </div>
  </footer>

  {#if isStandalone}
    <TestHarness />
  {/if}
</main>

<style>
  :global(body) {
    background-color: var(--ftw-background-accent-one, #1a1a1a);
    color: var(--ftw-text-accent-one, #e0e0e0);
    margin: 0; padding: 0;
  }
  .app { height: 100vh; max-height: 100vh; }
  .header {
    background-color: var(--ftw-background-accent-one, #1a1a1a);
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
  }
  .title-text { color: var(--ftw-selected-color, #459685); font-weight: 600; }
  .btn-home {
    background-color: transparent;
    color: var(--ftw-text-accent-one, #e0e0e0);
    border: 1px solid var(--ftw-border-color-accent-one, #444);
    width: 32px; height: 32px;
  }
  .btn-home:hover {
    background-color: var(--ftw-background-accent-three, #3d3d3d);
    color: var(--ftw-selected-color, #459685);
  }
  .main-content, .footer { background-color: var(--ftw-background-accent-one, #1a1a1a); }
  .footer { border-top: 1px solid var(--ftw-border-color-accent-one, #444); }
  .ft-init-card { background-color: #2b2b2b; color: #e0e0e0; }
  .ft-spinner { color: #459685; width: 3rem; height: 3rem; }
</style>
