# GEMINI.md - FutureOn FieldTwin Integration Project

This project is a Svelte 5 frontend integration template for FutureOn FieldTwin. It consists of multiple integration modules (`Asset_List_and_Diagnostic`, `HAZID_and_HAZOP`) designed to be embedded as iframes within the FieldTwin application.

## Core Mandates & Standards

### 1. Technology Stack
- **Framework:** Svelte 5 (using **Runes API**: `$state`, `$derived`, `$effect`, `$props`).
- **Styling:** Bootstrap 5 (Vanilla CSS/Svelte components).
- **HTTP Client:** Axios for API requests.
- **API:** FutureOn FieldTwin API (v1.10).
- **Icons:** `svelte-bootstrap-icons`.

### 2. Svelte 5 Coding Standards
- **Reactivity:** Always use Runes. Avoid the legacy `$: ` syntax.
- **Props:** Use `const { ... } = $props();`.
- **Event Handling:** Use direct attribute handlers (e.g., `onclick={...}`) instead of `on:click`.
- **State:** Use `$state(...)` for reactive variables.
- **Derived Values:** Use `$derived(...)` for computed reactive state.

### 3. FieldTwin Integration Architecture
- **Communication:** Host <-> Integration via `window.postMessage`.
- **Identification:** Use `customTabId` from the `loaded` event for all outgoing messages.
- **Authentication:** JWT token is received in the `loaded` event. Use it in the `Authorization: Bearer <token>` header for all API calls.
- **API Base URL:** `https://api.fieldtwin.com`.
- **API Docs:** [https://api.fieldtwin.com](https://api.fieldtwin.com)
- **OpenAPI Spec:** [https://api-qa.fieldtwin.com/oas3.json](https://api-qa.fieldtwin.com/oas3.json)

## FieldTwin Message Protocol

### Host -> Integration Events
- `loaded`: Initial data (token, project, subProject, customTabId, selection).
- `select`: Triggered when items are selected in the 3D view. Returns `[{ type, id, name }]`.
- `operationSearch`: Triggered when searching from the FieldTwin global search bar.

### Integration -> Host Requests
Sent via `window.parent.postMessage({ event, data, customTabId }, '*')`.
- `operationSearchResults`: Return hierarchical search results.
- `toast`: Show notifications (`success`, `info`, `warning`, `error`).
- `selectByTag`: Select items by their tags.
- `getResourcesByTags`: Query resources from the FieldTwin graph.
- `updateResources` / `createResources`: CRUD operations on project assets.
- `displayDocument`: Open a document in the host's file viewer.

## Project Structure
- `src/components/`: Svelte components.
- `src/actions/`: API services (e.g., `IntegrationService.js`, `HazidService.js`).
- `src/app.css`: Global styles.
- `prd/`: Project Requirement Documents for specific modules.

## Technical Standards & Conventions
- **CamelCase** for variables/functions, **PascalCase** for components/classes.
- **Service Layer:** All API interactions MUST go through service classes in `src/actions/`.
- **State Management:** Prefer Svelte 5 runes over external stores.
- **Error Handling:** Use try-catch blocks in services; display user-friendly errors via `toast` or UI.
- **Persistence:** For MVP features like HAZID findings not yet in FieldTwin API, use `localStorage` for cross-session data within the same browser.

## Specific Module Goals

### Asset List & Diagnostic
- Query `stagedAssets` for the active subProject.
- Display a table with: `Resource ID`, `Name`, `Asset Type`, `Asset SubType`, and `Tags`.
- Handle missing subTypes with `-`.

### HAZID & HAZOP Module (Phase 1: HAZID)
- **Goal:** Native FieldTwin module for visual, asset-linked hazard identification reviews.
- **Key Features:**
  - Create/manage HAZID reviews with structured findings (hazard, cause, consequence, safeguards).
  - **Object Linking:** Findings MUST be linked to FieldTwin assets, connections, areas, or documents.
  - **Action Tracking:** Support for creating and tracking mitigation actions (owner, due date, status).
  - **Export:** Provide CSV/tabular export for findings and action registers.
- **Development Modes:**
  - **Embedded:** Runs as an iframe in FieldTwin, receiving real context/selection events.
  - **Standalone/Test:** Local Svelte app with a test harness (mocked context, selection, and data) for rapid development.
- **Reactivity:** Use Svelte 5 runes to handle selection-aware prefilling of finding forms.

---
*Note: This file takes precedence over general workflows. Adhere strictly to Svelte 5 runes and FieldTwin postMessage protocols.*
