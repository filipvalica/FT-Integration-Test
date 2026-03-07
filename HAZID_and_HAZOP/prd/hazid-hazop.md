# **Project Requirements Document: FieldTwin HAZID / HAZOP Module**

The module allows users to perform **HAZID reviews inside the FieldTwin Design environment**, with **HAZOP support planned as phase 2**. Users can identify hazards, attach findings to field objects, collaborate on mitigations, and track actions without leaving FieldTwin. The first release is a **native FieldTwin module** optimized for **Concept / FEED** and **Detailed Design / EPC review** workflows, with an MVP that can also be **run and tested as a standalone Svelte app** during development.

## Product Overview

### Problem Statement

Operators, EPCs, and specialists often run HAZID and HAZOP reviews across disconnected tools: slide decks, spreadsheets, PDFs, email threads, and workshop notes. That creates friction in preparation, weakens context during reviews, slows action closure, and makes it harder to maintain a clear link between identified hazards and the underlying field design.

FieldTwin already provides a shared visual model, metadata-rich objects, collaboration, access control, and workflow foundations. This module will turn that foundation into a structured review experience for hazard identification and follow-up.

### Goal

Enable teams to run **visual, asset-linked HAZID reviews natively in FieldTwin** and reduce the time, friction, and rework associated with traditional risk review workflows.

### Product Objective

Deliver a fast MVP that:

* Lets users create and manage HAZID reviews inside FieldTwin.
* Links hazards, causes, consequences, safeguards, and actions to selected assets, connections, areas, and documents.
* Supports collaborative review workflows across operator and EPC teams.
* Produces a usable audit trail and exportable review outputs.
* Establishes the functional and data foundation for a future HAZOP phase.

### Success Criteria

* Users can complete a full HAZID review without leaving FieldTwin.
* Users can create findings directly from selected field objects.
* Review participants can assign, track, and close actions in a structured way.
* Teams reduce review preparation effort and post-workshop reconciliation effort.
* Internal teams can validate the MVP both embedded in FieldTwin and as a local Svelte test app.

## Scope

### In Scope for MVP

* Native FieldTwin module for **HAZID**.
* Support for review setup, participant list, scope, status, and linked project context.
* Object-linked hazard records for:

  * staged assets
  * connections
  * geographic or logical areas
  * documents or evidence links
* Structured fields for:

  * hazard
  * cause
  * consequence
  * existing safeguard
  * recommendation / mitigation
  * severity
  * likelihood
  * owner
  * due date
  * status
* Selection-driven workflow from FieldTwin Design.
* Review list, review detail page, finding register, action register.
* Filtering, search, and export.
* Read/write permissions aligned with FieldTwin roles.
* Svelte app support for local development and testing.

### Out of Scope for MVP

* Full worksheet-driven HAZOP with nodes, guidewords, deviation engine, and revalidation workflows.
* SIL assessment workflows.
* Quantitative risk analysis.
* Regulatory submission automation.
* Offline mode.
* Cross-project portfolio reporting.

### Phase 2

* Formal **HAZOP** support.
* Node-based review structure.
* Guideword and deviation libraries.
* HAZOP-specific templates and report generation.
* Revalidation and management-of-change expansion.

## Users and Audience

### Primary Users

* Subsea engineers
* Process / safety engineers
* Project engineers
* EPC review participants
* Risk specialists / external assessors

### Secondary Users

* Engineering managers
* Project managers
* HSE leads
* Digital / platform administrators

### Tone and UX Intent

The module should feel practical, structured, and fast. It should support workshop usage without excessive training. The interface should prioritize clarity over feature density.

## Assumptions

* FieldTwin provides the current project, subproject, stream, selection context, and JWT for the signed-in user.
* The first release will rely on existing FieldTwin project structure, metadata, permissions, and UI embedding patterns.
* HAZID users value visual context and traceability more than a fully standards-heavy process engine in the MVP.
* Review teams may include users from multiple organizations when Collaborate is enabled.
* The product team is optimizing for speed to MVP, not full process safety suite parity.

## Constraints

### Time

* MVP should be scoped for a fast first release.
* Requirements should favor shipping a narrow but complete workflow over broad coverage.

### Budget / Resourcing

* Assume a lean product and engineering team.
* Reuse existing FieldTwin patterns, permissions, APIs, and metadata models wherever possible.
* Avoid large bespoke workflow engines in v1.

### Technical Constraints

* Must work inside the FieldTwin Design environment.
* Must also be runnable as a standalone Svelte app for developer testing.
* Must respect FieldTwin authentication, permissions, and project scoping.
* Must handle current selection and project context from FieldTwin.

## User Requirements

| Requirement ID | Description                           | User Story                                                                                                                                 | Expected Behavior/Outcome                                                                                                                                 |
| -------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UR001          | Create and manage reviews             | As a user, I want to create a HAZID review for a project or subproject so I can organize findings in one place.                            | The system should let users create a review with title, scope, phase, status, participants, and description.                                              |
| UR002          | View all reviews                      | As a user, I want to see all reviews in the current project so I can find the right review quickly.                                        | The system should display a list of reviews with status, phase, owner, and last updated information.                                                      |
| UR003          | Create findings from selected objects | As a user, I want to create a finding from a selected asset or connection so the hazard is linked to the real design context.              | When users select supported objects in FieldTwin, the system should allow them to create a finding linked to those objects.                               |
| UR004          | Attach structured risk information    | As a user, I want to record hazard details in a consistent structure so findings are easier to review and compare.                         | The system should support structured fields for hazard, cause, consequence, safeguard, severity, likelihood, recommendation, owner, due date, and status. |
| UR005          | View findings in a register           | As a user, I want to review all findings in one place so I can sort, filter, and manage them efficiently.                                  | The system should display a findings table with filters for review, object type, status, owner, and severity.                                             |
| UR006          | View findings on selected objects     | As a user, I want to see what findings are linked to a selected object so I can understand the design risks in context.                    | The system should show linked findings for the current selection and allow navigation from object to finding detail.                                      |
| UR007          | Assign and track actions              | As a user, I want to assign mitigation actions so teams can follow up after the review.                                                    | The system should allow findings to generate one or more actions with owner, due date, status, and notes.                                                 |
| UR008          | Collaborate on findings               | As a user, I want multiple participants to review and refine findings so the assessment is more complete.                                  | The system should allow authorized users to comment, edit, and update findings based on role permissions.                                                 |
| UR009          | Export review output                  | As a user, I want to export the review so I can share results outside FieldTwin.                                                           | The system should provide export options for findings and actions in a clear tabular format.                                                              |
| UR010          | Preserve traceability                 | As a user, I want review changes to be traceable so I can understand who changed what and when.                                            | The system should retain timestamps, authorship, and change history for reviews, findings, and actions.                                                   |
| UR011          | Run the module in test mode           | As a developer or tester, I want to run the module as a standalone Svelte app so I can validate behavior outside the embedded environment. | The module should support a local test harness with mocked FieldTwin context and sample data.                                                             |

## User Interface Requirements

| Requirement ID | Description                 | User Story                                                                                            | Expected Behavior/Outcome                                                                                            |
| -------------- | --------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| UI001          | Review dashboard            | As a user, I want a simple entry page for reviews so I can start quickly.                             | The system should display a review list with search, filters, and a clear action to create a new review.             |
| UI002          | Review workspace            | As a user, I want one workspace for findings and actions so I do not need to switch views constantly. | The system should provide tabs or sections for Overview, Findings, Actions, and Export.                              |
| UI003          | Selection-aware create flow | As a user, I want the module to react to my current selection in FieldTwin.                           | The system should detect supported selected objects and prefill linked object references in the finding form.        |
| UI004          | Findings register           | As a user, I want a clear table for findings so I can scan and manage them quickly.                   | The system should display findings in a sortable table with status, linked objects, severity, owner, and due date.   |
| UI005          | Finding detail panel        | As a user, I want to inspect and edit one finding in detail.                                          | The system should open a detailed view or side panel with all finding fields, linked objects, evidence, and actions. |
| UI006          | Action tracking view        | As a user, I want a clear action list so I can monitor closure progress.                              | The system should display open and closed actions with owner, due date, status, and parent finding.                  |
| UI007          | Empty and loading states    | As a user, I want to understand system state clearly.                                                 | The system should show meaningful empty states, loading indicators, and error messages.                              |
| UI008          | Responsive layout           | As a user, I want the module to remain usable on common laptop screen sizes used in workshops.        | The system should adapt to smaller widths, with collapsible panels or horizontal scrolling where needed.             |
| UI009          | Svelte test harness UI      | As a developer, I want a local shell to simulate FieldTwin input.                                     | The standalone app should provide mock project context, mock selections, and sample review data for testing.         |

## Business Rules

| Requirement ID | Description              | User Story                                                                                      | Expected Behavior/Outcome                                                                                                                            |
| -------------- | ------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR001          | HAZID first release only | As a product owner, I want the MVP to stay focused so it can ship fast.                         | The first release should support HAZID workflows only; HAZOP-specific logic is deferred to phase 2.                                                  |
| BR002          | Supported object linking | As a user, I want findings to link only to valid FieldTwin entities so data remains consistent. | The system should allow linking to supported FieldTwin object types only.                                                                            |
| BR003          | Project-scoped access    | As an administrator, I want review data to respect FieldTwin access controls.                   | Users should only see and edit reviews and findings allowed by their project and role permissions.                                                   |
| BR004          | Role-aware editability   | As a user, I want editing rights to match my role.                                              | Users without edit rights should have read-only access to findings and actions.                                                                      |
| BR005          | Mandatory minimum fields | As a facilitator, I want findings to meet a minimum standard of completeness.                   | A finding cannot be saved without required fields such as title or hazard, linked review, status, and at least one linked object or scope reference. |
| BR006          | Action traceability      | As a manager, I want recommendations to be followed through.                                    | Each action must remain linked to its source finding and retain status history.                                                                      |
| BR007          | Export consistency       | As a user, I want exported data to be understandable outside the app.                           | Exports should use consistent column names and include review, finding, linked objects, and action fields.                                           |
| BR008          | Local testability        | As an engineering lead, I want the app to be easy to validate before embedding.                 | The same core UI and state logic should run in embedded mode and standalone Svelte test mode.                                                        |

## Functional Requirements

### 1. Review Management

* Create, edit, archive, and list HAZID reviews.
* Capture review metadata:

  * review name
  * project / subproject / stream
  * lifecycle phase
  * description
  * facilitator
  * participants
  * status
  * created by / updated by
* Filter reviews by phase, status, and owner.

### 2. Selection-Driven Finding Creation

* Listen for FieldTwin selection events.
* Support one or more selected objects where appropriate.
* Prefill finding context from selection.
* Allow manual linking when no current selection exists.
* Enable navigation from finding to linked object reference.

### 3. Finding Data Model

Each finding should support at minimum:

* finding ID
* review ID
* title
* hazard
* cause
* consequence
* safeguard
* recommendation
* severity
* likelihood
* status
* owner
* due date
* comments / notes
* linked object references
* linked documents / evidence
* created by / created at
* updated by / updated at

### 4. Action Management

* Create one or more actions from a finding.
* Assign owner and due date.
* Update status.
* Filter actions by review, owner, and status.
* Retain parent-child traceability between finding and action.

### 5. Collaboration

* Support concurrent multi-user viewing.
* Respect FieldTwin role and collaboration access.
* Allow comments or structured notes on findings.
* Show latest update metadata.

### 6. Export

* Export findings register.
* Export action register.
* Export review summary.
* Preferred MVP export format: CSV.
* Future option: formatted report export.

## Non-Functional Requirements

| Requirement ID | Category        | Requirement                                                                                                   |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| NFR001         | Performance     | The module should load the review list and finding list fast enough for workshop use on normal project sizes. |
| NFR002         | Security        | The module must use FieldTwin authentication and respect current user permissions.                            |
| NFR003         | Reliability     | The system should prevent silent data loss and give clear feedback on failed saves or loads.                  |
| NFR004         | Auditability    | The module should retain core timestamps and authorship for reviews, findings, and actions.                   |
| NFR005         | Usability       | A trained engineer should be able to create and manage findings with minimal onboarding.                      |
| NFR006         | Maintainability | Shared business logic should be reusable between embedded mode and standalone Svelte test mode.               |
| NFR007         | Compatibility   | The module should work with current FieldTwin project, subproject, and stream context.                        |
| NFR008         | Data Integrity  | Object links, review IDs, and action relationships should remain consistent across edits and exports.         |

## Data Sources

### Primary Data Sources

* FieldTwin project context
* FieldTwin subproject and stream context
* FieldTwin object selection events
* FieldTwin metadata and object APIs
* FieldTwin permissions and JWT context
* FieldTwin workflow or task-related data where available

### Secondary Data Sources

* User-entered review fields
* Linked documents and attachments
* Optional imported templates or risk category lists in future phases

### Data Policy

* Use uploaded and project-local FieldTwin data as the main source of truth.
* Web research may inform product framing, but the application runtime should rely on FieldTwin and user-entered review data.
* No inline citations are required in the PRD.

## Technical Approach

### Delivery Model

* Product form: **native FieldTwin module**
* Development mode: **Svelte app with embedded and standalone modes**

### MVP Architecture Intent

* Shared Svelte front-end codebase.
* Embedded mode receives context from FieldTwin.
* Standalone mode uses mocked project context, mocked selection messages, and sample records.
* Service layer wraps FieldTwin APIs and local mocks behind a common interface.

### Embedded Mode Requirements

* Accept project context from FieldTwin.
* Use JWT for authenticated API calls.
* Detect current selection.
* Adapt to read-only or editable role states.

### Standalone Test Mode Requirements

* Provide mock data for:

  * project
  * subproject
  * stream
  * selected objects
  * reviews
  * findings
  * actions
* Allow developers to test full flows without FieldTwin runtime embedding.

## Workflow

### Core MVP Flow

1. User opens the HAZID module in FieldTwin.
2. User selects an existing review or creates a new one.
3. User selects one or more relevant objects in FieldTwin Design.
4. User creates a finding linked to that selection.
5. User fills in structured risk fields.
6. User assigns one or more actions.
7. Team reviews, updates, and closes actions.
8. User exports the findings or action register.

### Alternate Flow

* User starts from the review register rather than from selection.
* User manually links finding scope to objects later.
* Developer runs the same UI in standalone Svelte mode with mocked context.

## Edge Cases

* No project is loaded.
* No supported object is selected.
* Selected object is from a linked or foreign project.
* User has read-only rights.
* Review has no findings yet.
* Findings exist with missing linked objects due to deleted or inaccessible objects.
* Two users edit the same finding close together.
* Export is requested when filters are active.
* A review spans multiple selected objects rather than a single object.

## Metrics

### Product Metrics

* Number of reviews created per project.
* Number of findings created per review.
* Number of actions created and closed.
* Export frequency.
* Percentage of findings linked to field objects.

### Outcome Metrics

* Reduced prep time for HAZID workshops.
* Reduced time from finding creation to action closure.
* Reduced reconciliation effort after reviews.
* Increased specialist and EPC participation in shared review workflows.

## Risks

* Scope creep toward a full process safety suite too early.
* Overcomplicated data model for MVP users.
* Misalignment between native module expectations and current API or workflow support.
* User confusion if embedded and standalone test behavior diverge.
* Resistance from teams already invested in spreadsheet-based review workflows.

## Open Questions for Later Phases

* Should action management reuse FieldTwin Workflow directly or remain module-local in v1?
* Should findings support area-based markup or only object linking in the MVP?
* Should future HAZOP support reuse the HAZID finding model or introduce a separate node/deviation model?
* What report format is needed most by customers after CSV export?

## Release Recommendation

Build the MVP as a **HAZID-focused native FieldTwin module** with a **shared Svelte codebase** that also runs in standalone mode for testing. Keep the first release narrow: visual review setup, structured findings, action tracking, export, and traceability. Use that release to validate adoption before adding formal HAZOP workflows.