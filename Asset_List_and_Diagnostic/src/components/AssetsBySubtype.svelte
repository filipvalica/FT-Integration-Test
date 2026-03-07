<script>
  import IntegrationService from '../actions/IntegrationService';
  import { Inbox } from 'svelte-bootstrap-icons';

  /**
   * AssetsBySubtype component displays all staged assets in a table
   * showing Resource ID, Name, Asset Type, Asset SubType, and Tags
   *
   * @component
   */

  let assets = $state([]);
  let loading = $state(true);
  let error = $state(null);
  let customTabId = $state(null);
  
  // Sorting state
  let sortColumn = $state(null);
  let sortDirection = $state('asc'); // 'asc' or 'desc'
  
  // Computed sorted assets
  let sortedAssets = $derived(
    !sortColumn 
      ? assets 
      : [...assets].sort((a, b) => {
          let aVal, bVal;
          
          switch (sortColumn) {
            case 'id':
              aVal = a.id || '';
              bVal = b.id || '';
              break;
            case 'name':
              aVal = getAssetName(a).toLowerCase();
              bVal = getAssetName(b).toLowerCase();
              break;
            case 'type':
              aVal = getAssetType(a.asset).toLowerCase();
              bVal = getAssetType(b.asset).toLowerCase();
              break;
            case 'subType':
              aVal = getAssetSubType(a).toLowerCase();
              bVal = getAssetSubType(b).toLowerCase();
              break;
            case 'tags':
              aVal = formatTags(a.tags).toLowerCase();
              bVal = formatTags(b.tags).toLowerCase();
              break;
            default:
              return 0;
          }
          
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        })
  );
  
  /**
   * Handles column header click for sorting
   *
   * @param {string} column - Column name to sort by
   */
  function handleSort(column) {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, start with ascending
      sortColumn = column;
      sortDirection = 'asc';
    }
  }
  
  /**
   * Gets sort indicator for column header
   *
   * @param {string} column - Column name
   * @returns {string} Sort indicator HTML
   */
  function getSortIndicator(column) {
    if (sortColumn !== column) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  /**
   * Loads staged assets from the FieldTwin API
   */
  async function loadAssets() {
    try {
      loading = true;
      error = null;
      
      // Ensure IntegrationService is initialized if loaded via window.loadedEvent
      if (window.loadedEvent && !IntegrationService.jwt) {
        const data = window.loadedEvent;
        IntegrationService.setJWT(data.token);
        IntegrationService.setProject(data.project, data.subProject);
      }
      
      const data = await IntegrationService.getStagedAssets();
      
      // API may return an object with asset IDs as keys or an array
      // Normalize to array format
      if (Array.isArray(data)) {
        assets = data;
      } else if (data && typeof data === 'object') {
        // Convert object to array
        assets = Object.values(data);
      } else {
        assets = [];
      }
    } catch (e) {
      error = e.message || String(e);
      console.error('Error loading staged assets:', e);
      assets = [];
    } finally {
      loading = false;
    }
  }

  /**
   * Formats tags array into comma-separated string or returns '-'
   *
   * @param {Array<string>} tags - Array of tag strings
   * @returns {string} Formatted tags string or '-'
   */
  function formatTags(tags) {
    if (tags && Array.isArray(tags) && tags.length > 0) {
      return tags.join(', ');
    }
    return '-';
  }

  /**
   * Gets the asset subtype from the staged asset
   * Checks both asset.asset.subType (asset definition) and asset.subType (staged asset)
   *
   * @param {Object} stagedAsset - Staged asset object
   * @returns {string} Subtype or '-'
   */
  function getAssetSubType(stagedAsset) {
    if (!stagedAsset) return '-';
    // Check asset definition first, then staged asset itself, then subCategory as fallback
    return stagedAsset.asset?.subType || stagedAsset.subType || stagedAsset.asset?.subCategory || stagedAsset.subCategory || '-';
  }

  /**
   * Gets the asset type from the asset definition
   *
   * @param {Object} asset - Asset definition object
   * @returns {string} Type or 'stagedAsset'
   */
  function getAssetType(asset) {
    if (!asset) return 'stagedAsset';
    return asset.type || 'stagedAsset';
  }

  /**
   * Gets the asset name, with fallbacks
   *
   * @param {Object} stagedAsset - Staged asset object
   * @returns {string} Asset name or '-'
   */
  function getAssetName(stagedAsset) {
    return stagedAsset.name || stagedAsset.asset?.name || '-';
  }

  /**
   * Searches assets based on query string
   *
   * @param {string} query - Search query string
   * @returns {Array} Filtered assets matching the query
   */
  function searchAssets(query) {
    if (!query || query.trim() === '') {
      return assets;
    }

    const lowerQuery = query.toLowerCase();
    return assets.filter((asset) => {
      const name = getAssetName(asset).toLowerCase();
      const subType = getAssetSubType(asset).toLowerCase();
      const type = getAssetType(asset.asset).toLowerCase();
      const tags = formatTags(asset.tags).toLowerCase();
      const id = asset.id.toLowerCase();

      return (
        name.includes(lowerQuery) ||
        subType.includes(lowerQuery) ||
        type.includes(lowerQuery) ||
        tags.includes(lowerQuery) ||
        id.includes(lowerQuery)
      );
    });
  }

  /**
   * Sends operationSearchResults to the host
   *
   * @param {string} query - Search query string
   */
  function sendSearchResults(query) {
    if (!window.parent) return;

    const filteredAssets = searchAssets(query);
    const results = filteredAssets.map((asset) => ({
      id: asset.id,
      html: `<b>${getAssetName(asset)}</b> - ${getAssetSubType(asset)}`,
      icon: 'cube',
      action: 'selectAsset',
      args: { id: asset.id, type: 'stagedAsset' },
    }));

    // Send progress update before results
    window.parent.postMessage(
      {
        event: 'operationSearchProgress',
        data: {
          status: 'Search complete',
          progress: 100,
          isComplete: true,
        },
      },
      '*',
    );

    window.parent.postMessage(
      {
        event: 'operationSearchResults',
        data: {
          results: [
            {
              category: 'Staged Assets',
              id: 'assets-category',
              html: `<b>Staged Assets</b> (${results.length} found)`,
              subItems: results,
            },
          ],
        },
      },
      '*',
    );
  }

  /**
   * Handles window messages from FieldTwin
   */
  function onWindowMessage(msg) {
    if (msg.data?.event === 'loaded') {
      customTabId = msg.data.customTabId;
      IntegrationService.setJWT(msg.data.token);
      IntegrationService.setProject(msg.data.project, msg.data.subProject);
      loadAssets();
    } else if (msg.data?.event === 'operationSearch') {
      sendSearchResults(msg.data.query || '');
    }
  }

  // Load assets when component mounts if integration is already loaded
  $effect(() => {
    if (window.loadedEvent?.event === 'loaded') {
      loadAssets();
    }
  });
</script>

<svelte:window onmessage={onWindowMessage} />

<div class="card">
  <div class="card-header">
    <h5 class="card-title mb-0">Assets → Asset SubType List</h5>
  </div>
  <div class="card-body">

    {#if loading}
      <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading assets...</span>
        </div>
      </div>
    {:else if error}
      <div class="alert alert-danger" role="alert">
        <h6 class="alert-heading">Error</h6>
        <p class="mb-0">Failed to load assets: {error}</p>
        <button class="btn btn-sm btn-outline-danger mt-2" onclick={loadAssets}>Retry</button>
      </div>
    {:else if assets.length === 0}
      <div class="text-center py-5">
        <div class="text-muted mb-3">
          <Inbox style="width: 3rem; height: 3rem; opacity: 0.5;" />
        </div>
        <h5 class="text-muted">No assets found</h5>
        <p class="text-muted">No staged assets are available in this subproject.</p>
      </div>
    {:else}
      <div class="table-responsive" style="max-height: calc(100vh - 250px); overflow-y: auto; border: 0; border-radius: 0.375rem;">
        <table class="table table-striped table-hover mb-0" aria-label="Staged Assets List">
          <thead class="table-dark sticky-top">
            <tr>
              <th 
                onclick={() => handleSort('id')} 
                onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleSort('id') : null}
                tabindex="0"
                role="button"
                aria-label="Sort by Resource ID"
                style="cursor: pointer; user-select: none;"
                class="sortable"
              >
                Resource ID{@html getSortIndicator('id')}
              </th>
              <th 
                onclick={() => handleSort('name')} 
                onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleSort('name') : null}
                tabindex="0"
                role="button"
                aria-label="Sort by Name"
                style="cursor: pointer; user-select: none;"
                class="sortable"
              >
                Name{@html getSortIndicator('name')}
              </th>
              <th 
                onclick={() => handleSort('type')} 
                onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleSort('type') : null}
                tabindex="0"
                role="button"
                aria-label="Sort by Asset Type"
                style="cursor: pointer; user-select: none;"
                class="sortable"
              >
                Asset Type{@html getSortIndicator('type')}
              </th>
              <th 
                onclick={() => handleSort('subType')} 
                onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleSort('subType') : null}
                tabindex="0"
                role="button"
                aria-label="Sort by Asset SubType"
                style="cursor: pointer; user-select: none;"
                class="sortable"
              >
                Asset SubType{@html getSortIndicator('subType')}
              </th>
              <th 
                onclick={() => handleSort('tags')} 
                onkeydown={(e) => e.key === 'Enter' || e.key === ' ' ? handleSort('tags') : null}
                tabindex="0"
                role="button"
                aria-label="Sort by Tags"
                style="cursor: pointer; user-select: none;"
                class="sortable"
              >
                Tags{@html getSortIndicator('tags')}
              </th>
            </tr>
          </thead>
          <tbody>
            {#each sortedAssets as asset (asset.id)}
              <tr>
                <td>{asset.id}</td>
                <td>{getAssetName(asset)}</td>
                <td>{getAssetType(asset.asset)}</td>
                <td>{getAssetSubType(asset)}</td>
                <td>{formatTags(asset.tags)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
  {#if !loading && !error && assets.length > 0}
    <div class="card-footer">
      <div class="text-muted small">
        <strong>Total assets:</strong> {assets.length}
        {#if sortColumn}
          <span class="ms-2">(Sorted by: <strong>{sortColumn}</strong> {sortDirection === 'asc' ? '↑' : '↓'})</span>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .card-title {
    margin-bottom: 1rem;
  }

  .table-responsive {
    border: 0;
    border-radius: 0.375rem;
  }

  .sortable {
    transition: background-color 0.15s ease-in-out;
  }
  
  .sortable:hover,
  .sortable:focus {
    background-color: rgba(255, 255, 255, 0.2) !important;
    color: #fff !important;
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: -2px;
  }
  
  .table-dark .sortable {
    color: #fff;
  }
  
  .table-dark .sortable:hover,
  .table-dark .sortable:focus {
    background-color: rgba(255, 255, 255, 0.15) !important;
    color: #fff !important;
  }
  
  .sortable:focus-visible {
    outline: 2px solid #0d6efd;
    outline-offset: 2px;
  }
</style>
