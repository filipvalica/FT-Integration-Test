<script>
  /**
   * TestHarness component provides a mock interface for simulating FieldTwin host events
   * during standalone development.
   */

  /**
   * Dispatches a mock 'select' event to the window.
   *
   * @returns {void}
   */
  function simulateSelection() {
    window.postMessage({
      event: 'select',
      data: [{ id: 'mock-asset-1', name: 'Mock Subsea Tree', type: 'stagedAsset' }],
    }, '*');
  }

  /**
   * Dispatches a mock 'select' event with multiple items to the window.
   *
   * @returns {void}
   */
  function simulateMultiSelection() {
    window.postMessage({
      event: 'select',
      data: [
        { id: 'mock-asset-1', name: 'Mock Subsea Tree', type: 'stagedAsset' },
        { id: 'mock-conn-1', name: 'Mock Pipeline', type: 'connection' },
      ],
    }, '*');
  }
</script>

<div class="test-harness p-2 border-top bg-dark fixed-bottom d-flex align-items-center gap-3" style="z-index: 2000; height: 50px;">
  <span class="badge bg-warning text-dark small">TEST HARNESS</span>
  <button class="btn btn-xs btn-outline-light py-0" onclick={simulateSelection}>Simulate Single Selection</button>
  <button class="btn btn-xs btn-outline-light py-0" onclick={simulateMultiSelection}>Simulate Multi Selection</button>
  <div class="ms-auto text-muted smaller">Standalone Mode Active</div>
</div>

<style>
  .test-harness {
    font-size: 0.75rem;
    opacity: 0.9;
  }
  .btn-xs {
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
  }
  .smaller { font-size: 0.65rem; }
</style>
