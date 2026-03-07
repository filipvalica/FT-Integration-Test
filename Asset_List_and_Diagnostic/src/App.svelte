<script>
  import { version } from '../package.json';
  import 'bootstrap/dist/css/bootstrap.min.css';
  import { InfoCircle } from 'svelte-bootstrap-icons';
  import IntegrationService from './actions/IntegrationService';
  import AssetsBySubtype from './components/AssetsBySubtype.svelte';

  // Track if integration is loaded
  let token = $state('');
  let loaded = $derived(!!token);
  
  // Tab state
  let activeTab = $state('assets');

  /**
   * Handles the 'loaded' event from FieldTwin
   * This is the main initialization event that provides authentication and project data
   */
  function handleLoadedEvent(data) {
    console.log('Received loaded event from FieldTwin:', data);

    // Load FieldTwin theme CSS if provided
    if (data.cssUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = data.cssUrl;
      link.id = 'fieldtwin-theme';
      const existing = document.getElementById('fieldtwin-theme');
      if (existing) existing.remove();
      document.head.appendChild(link);
    }

    // Load additional theme CSS if provided
    if (data.cssThemeUrl && data.cssThemeUrl !== data.cssUrl) {
      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = data.cssThemeUrl;
      themeLink.id = 'fieldtwin-theme-url';
      const existing = document.getElementById('fieldtwin-theme-url');
      if (existing) existing.remove();
      document.head.appendChild(themeLink);
    }

    // Initialize IntegrationService with credentials
    IntegrationService.setBackendUrl(data.backendUrl || 'https://api.fieldtwin.com');
    IntegrationService.setJWT(data.token);
    IntegrationService.setProject(data.project, data.subProject);

    // Mark integration as loaded
    token = data.token;
  }

  /**
   * Handles window messages from FieldTwin
   * FieldTwin communicates with integrations via postMessage
   */
  function onWindowMessage(event) {
    const messageData = event.data;

    // Handle 'loaded' event - sent when project/subproject opens
    if (messageData?.event === 'loaded') {
      handleLoadedEvent(messageData);
    }

    // Handle 'select' event - sent when user selects items in 3D view
    if (messageData?.event === 'select') {
      console.log('Selection changed:', messageData.data);
    }

    // Handle 'operationSearch' event - sent when user searches in FieldTwin
    if (messageData?.event === 'operationSearch') {
      console.log('Operation search:', messageData.query);
    }
  }

  // Check if already loaded via window.loadedEvent (set by index.html)
  $effect(() => {
    if (!loaded && window.loadedEvent?.event === 'loaded') {
      handleLoadedEvent(window.loadedEvent);
    }
  });
</script>

<svelte:window onmessage={onWindowMessage} />

<main class="app" style="padding: 10px 20px; padding-bottom: 180px;">
  {#if loaded}
    <!-- Tabs Navigation -->
    <ul class="nav nav-tabs mb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link {activeTab === 'assets' ? 'active' : ''}"
          onclick={() => activeTab = 'assets'}
          type="button"
          role="tab"
        >
          Assets
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link {activeTab === 'diagnostics' ? 'active' : ''}"
          onclick={() => activeTab = 'diagnostics'}
          type="button"
          role="tab"
        >
          Diagnostics
        </button>
      </li>
    </ul>

    <!-- Tab Content -->
    <div class="tab-content">
      {#if activeTab === 'assets'}
        <div class="tab-pane active" role="tabpanel">
          <AssetsBySubtype />
        </div>
      {/if}

      {#if activeTab === 'diagnostics'}
        <div class="tab-pane active" role="tabpanel" style="background-color: transparent !important;">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Integration Status</h6>
            </div>
            <div class="card-body small">
              <div class="row">
                <div class="col-md-6">
                  <p><strong>Integration loaded:</strong> 
                    <span class={loaded ? 'text-success' : 'text-danger'}>
                      {loaded ? '✓ Yes' : '✗ No'}
                    </span>
                  </p>
                  <p><strong>Backend URL:</strong> 
                    <code class="small">{IntegrationService.fieldapURL || 'Not set'}</code>
                  </p>
                  <p><strong>Project ID:</strong> 
                    <code class="small">{IntegrationService.projectId || 'Not set'}</code>
                  </p>
                  <p><strong>SubProject ID:</strong> 
                    <code class="small">{IntegrationService.subProjectId || 'Not set'}</code>
                  </p>
                </div>
                <div class="col-md-6">
                  <p><strong>JWT Token:</strong> 
                    <span class={IntegrationService.jwt ? 'text-success' : 'text-danger'}>
                      {IntegrationService.jwt ? '✓ Set' : '✗ Not set'}
                    </span>
                  </p>
                  <p><strong>In iframe:</strong> 
                    <span class={window.self !== window.top ? 'text-success' : 'text-danger'}>
                      {window.self !== window.top ? '✓ Yes' : '✗ No'}
                    </span>
                  </p>
                  <p><strong>Version:</strong> v{version}</p>
                </div>
              </div>
            </div>
          </div>

          {#if window.loadedEvent}
            <div class="card mt-3">
              <div class="card-header">
                <h6 class="mb-0">Loaded Event Data</h6>
              </div>
              <div class="card-body small">
                <pre class="p-3 small" style="max-height: 400px; overflow-y: auto; background-color: var(--ftw-background-accent-one, #1a1a1a); color: var(--ftw-text-accent-one, #e0e0e0); border-radius: 0.375rem;">{JSON.stringify(window.loadedEvent, null, 2)}</pre>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Loading State -->
    <div class="container mt-4">
      <div class="alert alert-info" role="alert">
        <h5>Waiting for FieldTwin to load...</h5>
        <p class="mb-0">
          Make sure you have a <strong>project/subproject open</strong> in FieldTwin Design.
          <br>
          The integration will automatically load when FieldTwin sends the 'loaded' event.
        </p>
      </div>
    </div>
  {/if}

  <!-- Footer -->
  <div class="footer-container bg-dark text-secondary mt-3">
    <div class="container mt-3">
      <div class="mt-3">
        <div class="text-end small">
          <InfoCircle />v{version}, Powered by{' '}
          <a href="https://api.fieldtwin.com/" target="_blank">
            <img
              src="https://avatars.githubusercontent.com/u/12692713?s=48&v=4"
              alt=""
              class="img-thumbnail"
              style="height:25px"
              title="FieldTwin API"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  .nav-tabs {
    border-bottom: 1px solid var(--ftw-border-color-accent-one, #444);
  }

  .nav-tabs .nav-link {
    color: var(--ftw-text-accent-one, #e0e0e0) !important;
    background-color: transparent !important;
    border: 1px solid transparent !important;
    border-bottom: none !important;
  }

  .nav-tabs .nav-link:hover {
    background-color: var(--ftw-background-accent-three, #3d3d3d) !important;
    border-color: var(--ftw-border-color-accent-one, #444) !important;
    border-bottom-color: transparent !important;
    color: var(--ftw-text-accent-one, #e0e0e0) !important;
  }

  .nav-tabs .nav-link.active {
    color: #459685 !important;
    background-color: var(--ftw-card-background-color, #2b2b2b) !important;
    border-color: var(--ftw-border-color-accent-one, #444) !important;
    border-bottom-color: var(--ftw-card-background-color, #2b2b2b) !important;
  }

  .nav-tabs .nav-link.active:hover {
    background-color: var(--ftw-card-background-color, #2b2b2b) !important;
    color: #459685 !important;
  }

  code {
    background-color: var(--ftw-background-accent-one, #1a1a1a);
    color: var(--ftw-text-accent-one, #e0e0e0);
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
</style>
