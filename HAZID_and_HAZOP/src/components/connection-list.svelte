<script>
  import IntegrationService from '../actions/integration-service';

  /**
   * @typedef {Object} ConnectionListProps
   * @property {Array} [connections] - Optional pre-loaded connections
   */

  /** @type {ConnectionListProps} Component props */
  const { connections = [] } = $props();

  /** @type {Array<Object>} Internal state for connections */
  let internalConnections = $state(connections);

  $effect(() => {
    if (connections.length === 0) {
      IntegrationService.getConnections().then(data => {
        internalConnections = data;
      });
    } else {
      internalConnections = connections;
    }
  });
</script>

<div class="connection-list">
  <h6>Project Connections ({internalConnections.length})</h6>
  <ul class="list-group list-group-flush ft-list-group">
    {#each internalConnections as conn}
      <li class="list-group-item ft-list-item d-flex justify-content-between align-items-center">
        <span>{conn.params?.label || conn.id}</span>
        <span class="badge bg-secondary rounded-pill">{conn.params?.type || 'Standard'}</span>
      </li>
    {:else}
      <li class="list-group-item ft-list-item text-muted small">No connections found in subProject.</li>
    {/each}
  </ul>
</div>

<style>
  .ft-list-group {
    background-color: transparent;
  }
  .ft-list-item {
    background-color: transparent;
    color: var(--ftw-text-accent-one, #e0e0e0);
    border-color: var(--ftw-border-color-accent-one, #444);
    padding: 0.5rem 0;
  }
</style>
