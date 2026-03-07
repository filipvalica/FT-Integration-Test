# **Project Requirements Document: Assets → Asset SubType List Integration**

## Purpose

Provide a minimal integration PRD to test that the integration can list all assets in the current project and present each asset's asset sub type in a single table.

## Scope

- The integration will query the project's staged assets and produce a tabular report containing one row per asset and the asset's subtype.
- This PRD is for a basic verification build used during integration testing.

## Requirements

- The integration shall retrieve all staged assets for the active subProject.
- For each staged asset, the integration shall extract: resource `id`, `name`, asset `type` (asset.definition.type or similar), and asset `subType` (asset.definition.subType or equivalent). If `subType` is missing, show `-`.
- The integration shall display results in a markdown/HTML table inside the integration UI and allow the host to receive the `operationSearchResults` message with the same rows (optional).

## Acceptance Criteria

- When the integration runs, a table is shown containing all staged assets in the current subProject.
- Each row contains these columns: `Resource ID`, `Name`, `Asset Type`, `Asset SubType`, `Tags`.
- The table contains at least one row if the project has assets; otherwise the UI shows "No assets found".

## Test Steps

1. Open FieldTwin and load the project/subProject that contains staged assets.
2. Start the integration (open the integration iFrame or run the integration page).
3. Integration should call the FieldTwin API (or request `getResources`/`getResourcesByTags`) to fetch staged assets.
4. Verify the table is populated with one row per asset and the `Asset SubType` column is filled.
5. Verify that rows lacking subtype show `-` in the `Asset SubType` column.
6. (Optional) Export or copy the table and verify the values match the API response.

## Expected Table (template)

| Resource ID | Name | Asset Type | Asset SubType | Tags |
|-------------|------|------------|---------------|------|
| <uuid> | Example Asset 1 | stagedAsset | Pump | status::installed, vendor::X |
| <uuid> | Example Asset 2 | stagedAsset | Valve | - |

> Note: The example rows above are illustrative. The integration should programmatically populate the table from API results.

## Data Mapping / Implementation Notes

- For each staged asset record returned by FieldTwin API, map fields as follows:
  - `Resource ID` ← `id`
  - `Name` ← `name` (fallback to `asset.name` if missing)
  - `Asset Type` ← typically the resource type (e.g., `stagedAsset`)
  - `Asset SubType` ← `asset.subType` or `asset.subCategory` depending on response shape
  - `Tags` ← join of `tags` array (or `-` if empty)

## Edge Cases

- Assets without `asset` metadata should still appear with `Asset Type` set to the resource type and `Asset SubType` set to `-`.
- Very large projects: UI may implement pagination or streaming; for this basic PRD a single fetch is acceptable.

## Acceptance Test Checklist

| ID | Check |
|----|-------|
| AT-1 | Table displays when assets exist |
| AT-2 | Asset SubType populated or `-` if missing |
| AT-3 | Resource ID and Name match API response |
| AT-4 | Tags column shows comma-separated tags or `-` |

## Next steps for developers

- Implement an API call using `IntegrationService` to fetch `/stagedAssets` and generate the table.
- Optionally wire the results to `operationSearchResults` so they can be surfaced by the host search panel.
