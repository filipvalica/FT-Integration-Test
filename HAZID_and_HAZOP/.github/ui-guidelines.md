# FieldTwin Integration UI Guidelines

This document provides comprehensive UI/UX guidelines for developing FieldTwin integrations. These guidelines ensure consistency, usability, and seamless integration with the FieldTwin Design environment.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Layout and Structure](#layout-and-structure)
3. [Styling and Theming](#styling-and-theming)
4. [Component Patterns](#component-patterns)
5. [Responsive Design](#responsive-design)
6. [Accessibility](#accessibility)
7. [Loading and Error States](#loading-and-error-states)
8. [Integration-Specific Considerations](#integration-specific-considerations)
9. [Best Practices](#best-practices)

---

## Design Principles

### Core Principles

1. **Consistency**: Integrations should feel native to FieldTwin's interface
2. **Clarity**: Information should be presented clearly and hierarchically
3. **Efficiency**: Support fast workflows, especially during workshops and reviews
4. **Responsiveness**: Adapt gracefully to different screen sizes and iframe constraints
5. **Accessibility**: Follow WCAG 2.1 Level AA standards

### Visual Hierarchy

- **Primary Actions**: Use prominent buttons (Bootstrap `btn-primary`)
- **Secondary Actions**: Use outlined buttons (`btn-outline-secondary`)
- **Information**: Use appropriate text colors and icons
- **Warnings/Errors**: Use Bootstrap's alert components with appropriate variants

---

## Layout and Structure

### Container Structure

```html
<main class="app" style="padding: 10px 20px; padding-bottom: 180px;">
  <!-- Main content -->
</main>
```

### Recommended Layout Patterns

#### Single Column Layout
- Use for focused workflows (e.g., creating a finding, editing details)
- Maximum width: 800px for readability
- Center content when space allows

#### Two-Column Layout
- Use for list + detail views
- Left: List/filter panel (30-40% width)
- Right: Detail panel (60-70% width)
- Collapsible on smaller screens

#### Dashboard Layout
- Use for overview pages with multiple sections
- Grid-based layout with Bootstrap's grid system
- Responsive breakpoints: collapse to single column on mobile

### Spacing Guidelines

- **Container Padding**: 10-20px horizontal, adjust bottom padding for fixed footers
- **Section Spacing**: 20-30px between major sections
- **Component Spacing**: 10-15px between related components
- **Form Field Spacing**: 15-20px between form groups

---

## Styling and Theming

### Bootstrap Integration

All integrations should use **Bootstrap 5** as the base CSS framework:

```javascript
import 'bootstrap/dist/css/bootstrap.min.css';
```

### FieldTwin Theme Integration

FieldTwin provides a `cssUrl` in the `loaded` event that can be used to match the host application's styling:

```javascript
// In your loaded event handler
if (event.data.cssUrl) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = event.data.cssUrl;
  document.head.appendChild(link);
}
```

**Important**: Always check if `cssUrl` exists before loading to avoid breaking standalone test mode.

### FieldTwin CSS Custom Properties (Design Tokens)

When the FieldTwin theme CSS is loaded, it provides a comprehensive set of CSS custom properties (variables) that you can use to match FieldTwin's native styling. These variables automatically adapt to FieldTwin's theme and ensure visual consistency.

**Important Theme Notes**:
- FieldTwin uses a **dark theme** by default with dark grey backgrounds and white/light text
- The **teal/cyan accent color** (`--ftw-selected-color` or `--old-school-fap`) is used for selected items, active states, and primary accents
- Background colors will be dark when the theme is loaded (the fallback values shown are light theme defaults for standalone mode)
- Text colors will be light/white on dark backgrounds when the theme is active

#### Text Colors

```css
--ftw-text-accent-one        /* Primary text color */
--ftw-text-title             /* Title/heading text color */
--ftw-text-secondary         /* Secondary text color */
--ftw-list-view-text-secondary /* List view secondary text */
```

#### Background Colors

```css
--ftw-background-accent-one  /* Primary background (dark grey in theme) */
--ftw-background-accent-two  /* Secondary background (striped rows, slightly different shade) */
--ftw-background-accent-three /* Tertiary background (hover states, input backgrounds) */
--ftw-background-accent-four  /* Hover/selected background (table headers, hover states) */
--ftw-background-accent-five  /* Additional background variant */
--ftw-background-accent-six   /* Additional background variant (dropdown hover) */
--ftw-card-background-color   /* Card background */
```

**Note**: In FieldTwin's dark theme, these background colors are various shades of dark grey. The exact shades differ slightly to create visual hierarchy and contrast.

#### Button Colors

```css
--ftw-button-primary-color      /* Primary button background */
--ftw-button-danger-color       /* Danger/delete button background */
--ftw-button-success-color      /* Success button background */
--ftw-button-warning-color      /* Warning button background */
--ftw-button-info-color         /* Info button background */
--ftw-button-background-color   /* Default button background */
--ftw-button-border-color       /* Button border color */
--ftw-button-hover-border-color /* Button hover border */
--ftw-button-border-width       /* Button border width */
--ftw-button-border-style       /* Button border style */
--ftw-button-border-radius      /* Button border radius */
--ftw-button-height             /* Standard button height */
```

#### Input/Form Colors

```css
--ftw-input-background-color         /* Input background */
--ftw-input-background-hover-color  /* Input hover background */
--ftw-input-background-disabled      /* Disabled input background */
--ftw-input-border-color             /* Input border color */
--ftw-input-border-width             /* Input border width */
--ftw-input-border-radius            /* Input border radius */
--ftw-input-focus-border-color      /* Input focus border color */
--ftw-input-primary-color            /* Input primary accent color */
--ftw-input-error-border-color       /* Input error border */
--ftw-input-box-height               /* Standard input height */
--ftw-input-font-size                /* Input font size */
```

#### Border Colors

```css
--ftw-border-color-accent-one  /* Primary border color */
```

#### Selection/Active States

```css
--ftw-selected-color           /* Selected item color (teal/cyan accent) - used for list selections, active tabs */
--old-school-fap              /* Alternative selected color (teal/cyan) - used in tables and some components */
```

**Note**: Both `--ftw-selected-color` and `--old-school-fap` typically resolve to the same teal/cyan accent color used throughout FieldTwin for selected states. This is the prominent teal color visible in the admin panel for selected items.

**FieldTwin Teal Accent Color**: The color `#459685` is used for:
- Selected options in dropdowns and lists
- Headings and section titles
- Active states in navigation
- Primary accent elements

This color should be used as a fallback when CSS variables are not available:
```css
color: var(--ftw-selected-color, #459685);
background-color: var(--old-school-fap, #459685);
```

#### Status Colors

```css
--ftw-primary-color    /* Primary status color */
--ftw-danger-color     /* Danger/error color */
--ftw-warning-color    /* Warning color */
--ftw-success-color    /* Success color */
--ftw-info-color       /* Info color */
--ftw-locked-color     /* Locked/disabled color */
```

#### Select/Dropdown Colors

```css
--ftw-select-background-color           /* Select background */
--ftw-select-border-radius              /* Select border radius */
--ftw-select-item-is-active-background  /* Active item background */
--ftw-select-item-is-active-color       /* Active item text color */
--ftw-select-item-hover-border-radius    /* Hover item border radius */
--ftw-select-icon                        /* Select icon color */
```

#### Card Colors

```css
--ftw-card-text          /* Card text color */
--ftw-card-box-shadow    /* Card shadow color */
```

#### Disabled States

```css
--disabled-text-color    /* Disabled text color */
--disabled-background    /* Disabled background */
--disabled-border-color  /* Disabled border color */
--disabled-color         /* Disabled color */
```

#### Usage Examples

```css
/* Using FieldTwin colors in your custom styles */
.my-custom-button {
  background-color: var(--ftw-button-primary-color);
  border-color: var(--ftw-button-border-color);
  color: var(--ftw-text-accent-one);
}

.my-custom-input {
  background-color: var(--ftw-input-background-color);
  border: var(--ftw-input-border-width) solid var(--ftw-input-border-color);
  border-radius: var(--ftw-input-border-radius);
}

.my-custom-card {
  background-color: var(--ftw-card-background-color);
  color: var(--ftw-card-text);
  box-shadow: 0 2px 4px var(--ftw-card-box-shadow);
}

.my-selected-item {
  background-color: var(--ftw-selected-color, var(--old-school-fap, #459685));
  color: var(--ftw-text-accent-one);
  /* Selected items use the teal accent color (#459685) for visual emphasis */
}

.my-list-item-selected {
  /* For list items in sidebars (like integration list) */
  background-color: var(--old-school-fap, var(--ftw-selected-color, #459685));
  color: var(--ftw-text-accent-one);
}

.my-heading {
  color: var(--ftw-selected-color, var(--old-school-fap, #459685));
  /* Headings use the teal accent color (#459685) */
}

.my-error-message {
  background-color: var(--ftw-button-danger-color);
  color: var(--ftw-text-accent-one);
  border: 1px solid var(--ftw-input-error-border-color);
}
```

**Note**: These CSS variables are only available after the FieldTwin theme CSS is loaded. Always provide fallback values for standalone mode:

```css
.my-element {
  background-color: var(--ftw-background-accent-one, #f5f5f5);
  color: var(--ftw-text-accent-one, #333);
}
```

### Color Palette

**FieldTwin Theme Colors**:
- **Teal/Cyan Accent (`#459685`)**: Used for selected items, active states, headings, and primary accents (`--ftw-selected-color`, `--old-school-fap`). This is the standard teal color used throughout FieldTwin's admin panel.
- **Dark Backgrounds**: Various shades of dark grey for backgrounds (`--ftw-background-accent-one` through `--ftw-background-accent-six`)
- **Light Text**: White/light text on dark backgrounds (`--ftw-text-accent-one`, `--ftw-text-title`)

For components that don't use FieldTwin CSS variables, use Bootstrap's semantic color classes:

- **Primary**: `btn-primary`, `text-primary`, `bg-primary` - Main actions
- **Secondary**: `btn-secondary`, `text-secondary` - Secondary actions
- **Success**: `btn-success`, `text-success`, `alert-success` - Success states
- **Danger**: `btn-danger`, `text-danger`, `alert-danger` - Errors, deletions
- **Warning**: `btn-warning`, `text-warning`, `alert-warning` - Warnings
- **Info**: `btn-info`, `text-info`, `alert-info` - Informational messages

**Best Practice**: 
- **Always prefer FieldTwin CSS custom properties** when available for better theme consistency
- The FieldTwin theme uses a **dark color scheme** - backgrounds will be dark grey and text will be light when the theme CSS is loaded
- Use Bootstrap classes as fallbacks or for components that don't need FieldTwin-specific styling
- Remember that fallback values in CSS variables are typically light theme defaults for standalone testing mode

### Typography

- **Headings**: Use Bootstrap heading classes (`h1` through `h6`)
- **Body Text**: Default Bootstrap body font
- **Small Text**: Use `small` class or `text-muted` for secondary information
- **Code**: Use `<code>` for inline code, `<pre><code>` for blocks

### Borders and Shadows

- **Cards**: Use Bootstrap `card` component with default shadow
- **Tables**: Use `table` with `table-striped` or `table-bordered` as needed
- **Inputs**: Bootstrap's default input styling
- **Buttons**: Bootstrap's default button styling

---

## Component Patterns

### Tables

Use Bootstrap tables with responsive wrappers:

```html
<div class="table-responsive" style="max-height: 400px; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem;">
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <!-- Table rows -->
    </tbody>
  </table>
</div>
```

**Guidelines**:
- Always wrap tables in `table-responsive` div
- Set `max-height` with `overflow-y: auto` for long lists
- Use `table-striped` for better readability
- Use `table-hover` for interactive rows
- Add borders and border-radius for visual separation

### Forms

```html
<div class="mb-3">
  <label for="field-id" class="form-label">Field Label</label>
  <input type="text" class="form-control" id="field-id" />
  <div class="form-text">Helper text</div>
</div>
```

**Guidelines**:
- Use `form-label` for all labels
- Group related fields with `mb-3` spacing
- Use `form-text` for helper text
- Use `form-select` for dropdowns
- Use `form-check` for checkboxes/radio buttons
- Add `required` attribute and visual indicator for required fields

### Dropdowns and Multi-Select

FieldTwin supports multi-select dropdowns. Each selected item should be displayed as a chip/badge:

```html
<div class="mb-3">
  <label class="form-label">Tags</label>
  <select class="form-select" multiple>
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
  <div class="mt-2">
    <span class="badge bg-primary me-1">Tag 1</span>
    <span class="badge bg-primary me-1">Tag 2</span>
  </div>
</div>
```

### Buttons

```html
<!-- Primary action -->
<button class="btn btn-primary">Save</button>

<!-- Secondary action -->
<button class="btn btn-outline-secondary">Cancel</button>

<!-- Small button -->
<button class="btn btn-sm btn-outline-secondary">Edit</button>

<!-- Icon button -->
<button class="btn btn-sm btn-outline-danger">
  <i class="bi bi-trash"></i>
</button>
```

**Guidelines**:
- Use `btn-primary` for primary actions (Save, Create, Submit)
- Use `btn-outline-secondary` for secondary actions (Cancel, Close)
- Use `btn-sm` for compact spaces
- Use `btn-danger` or `btn-outline-danger` for destructive actions
- Include icons from `svelte-bootstrap-icons` where appropriate

### Cards

```html
<div class="card">
  <div class="card-header">
    <h5 class="card-title mb-0">Card Title</h5>
  </div>
  <div class="card-body">
    <!-- Card content -->
  </div>
  <div class="card-footer">
    <!-- Footer actions -->
  </div>
</div>
```

### Alerts

```html
<!-- Success -->
<div class="alert alert-success" role="alert">
  Operation completed successfully.
</div>

<!-- Error -->
<div class="alert alert-danger" role="alert">
  An error occurred. Please try again.
</div>

<!-- Warning -->
<div class="alert alert-warning" role="alert">
  Please review your input.
</div>

<!-- Info -->
<div class="alert alert-info" role="alert">
  Information message.
</div>
```

### Modals

Use Bootstrap modals for confirmations and detailed views:

```html
<div class="modal fade" id="exampleModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal Title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <!-- Modal content -->
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary">Confirm</button>
      </div>
    </div>
  </div>
</div>
```

### Filters and Search

```html
<div class="mb-3">
  <label for="filter-input" class="form-label">Filter</label>
  <input 
    type="text" 
    class="form-control" 
    id="filter-input" 
    placeholder="Type to filter..."
  />
</div>
```

**Guidelines**:
- Provide clear placeholder text
- Show filter results count when applicable
- Clear filter button when active
- Support filtering across multiple fields

### List Items and Sidebar Navigation

For sidebar lists (like integration lists, navigation menus), use the teal accent color for selected items:

```html
<!-- Sidebar list container -->
<div class="list-group">
  <a href="#" class="list-group-item list-group-item-action active">
    Selected Item (teal background)
  </a>
  <a href="#" class="list-group-item list-group-item-action">
    Normal Item
  </a>
</div>
```

**Using FieldTwin CSS variables**:

```css
.list-item {
  background-color: var(--ftw-background-accent-one);
  color: var(--ftw-text-accent-one);
  padding: 0.75rem 1rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-item:hover {
  background-color: var(--ftw-background-accent-four);
}

.list-item.selected {
  background-color: var(--old-school-fap, var(--ftw-selected-color));
  color: var(--ftw-text-accent-one);
  /* Teal accent for selected state */
}
```

**Guidelines**:
- Selected items should use `--old-school-fap` or `--ftw-selected-color` (teal accent)
- Hover states should use `--ftw-background-accent-four`
- Normal state should use `--ftw-background-accent-one`
- Ensure sufficient contrast for text readability
- Use smooth transitions (0.2s) for state changes

### Empty States

```html
<div class="text-center py-5">
  <div class="text-muted mb-3">
    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
  </div>
  <h5 class="text-muted">No items found</h5>
  <p class="text-muted">Create your first item to get started.</p>
  <button class="btn btn-primary mt-3">Create Item</button>
</div>
```

---

## Responsive Design

### Breakpoints

Follow Bootstrap's breakpoints:

- **xs**: < 576px (mobile)
- **sm**: ≥ 576px (tablet)
- **md**: ≥ 768px (small laptop)
- **lg**: ≥ 992px (desktop)
- **xl**: ≥ 1200px (large desktop)
- **xxl**: ≥ 1400px (extra large)

### Iframe Constraints

Integrations run inside iframes with variable dimensions:

- **Minimum Width**: Design for 300px minimum
- **Flexible Height**: Use `calc(100vh - Xpx)` for dynamic heights
- **Scrollable Content**: Use `overflow-y: auto` for long content
- **Fixed Footers**: Account for footer height in padding

### Responsive Patterns

```html
<!-- Stack on mobile, side-by-side on desktop -->
<div class="row">
  <div class="col-12 col-md-6">
    <!-- Left column -->
  </div>
  <div class="col-12 col-md-6">
    <!-- Right column -->
  </div>
</div>

<!-- Hide on mobile -->
<div class="d-none d-md-block">
  <!-- Desktop-only content -->
</div>

<!-- Show only on mobile -->
<div class="d-block d-md-none">
  <!-- Mobile-only content -->
</div>
```

### Table Responsiveness

Always wrap tables in responsive containers:

```html
<div class="table-responsive">
  <table class="table">
    <!-- Table content -->
  </table>
</div>
```

For very wide tables, consider:
- Horizontal scrolling
- Column prioritization (hide less important columns on mobile)
- Card-based layout on mobile

---

## Accessibility

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use proper tab order
- Provide visible focus indicators
- Support Enter/Space for button activation

### Screen Readers

- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- Provide `aria-label` for icon-only buttons
- Use `role="alert"` for dynamic messages
- Associate labels with form controls using `for` attribute

### Color Contrast

- Ensure text meets WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Don't rely solely on color to convey information
- Use icons or text in addition to color

### Focus Management

```html
<!-- Good: Visible focus -->
<button class="btn btn-primary" style="outline: 2px solid #0d6efd; outline-offset: 2px;">
  Button
</button>

<!-- Or use Bootstrap's focus utilities -->
<button class="btn btn-primary focus-ring">Button</button>
```

---

## Loading and Error States

### Loading States

```html
<!-- Full page loading -->
<div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>

<!-- Inline loading -->
<button class="btn btn-primary" disabled>
  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
  Loading...
</button>

<!-- Skeleton loading -->
<div class="placeholder-glow">
  <span class="placeholder col-7"></span>
  <span class="placeholder col-4"></span>
  <span class="placeholder col-4"></span>
</div>
```

### Error States

```html
<!-- Error message -->
<div class="alert alert-danger" role="alert">
  <h6 class="alert-heading">Error</h6>
  <p>Failed to load data. Please try again.</p>
  <button class="btn btn-sm btn-outline-danger">Retry</button>
</div>

<!-- Form validation error -->
<div class="invalid-feedback">
  This field is required.
</div>
```

### Empty States

Always provide helpful empty states:

```html
<div class="text-center py-5">
  <div class="text-muted mb-3">
    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
  </div>
  <h5 class="text-muted">No reviews found</h5>
  <p class="text-muted">Create your first review to get started.</p>
  <button class="btn btn-primary mt-3">Create Review</button>
</div>
```

---

## Integration-Specific Considerations

### Message Handling UI Feedback

When sending messages to FieldTwin, provide user feedback:

```javascript
// Show loading state
setLoading(true);

// Send message
window.parent.postMessage({
  event: 'operationSearchResults',
  data: { results: [...] }
}, '*');

// Handle success/error
setLoading(false);
```

### Selection-Aware UI

Update UI based on FieldTwin selection:

```javascript
// In select event handler
if (selection.length > 0) {
  // Enable create button
  // Pre-fill form fields
  // Show linked items
} else {
  // Disable create button
  // Show "Select an object" message
}
```

### Permission-Aware UI

Respect `canEdit` from the `loaded` event:

```javascript
// Disable edit controls if read-only
{#if !canEdit}
  <button class="btn btn-primary" disabled>Edit</button>
{:else}
  <button class="btn btn-primary">Edit</button>
{/if}
```

### Toast Notifications

Use FieldTwin's toast system for non-critical notifications. FieldTwin displays toasts in the top-right corner with automatic animations and progress indicators.

**Toast Types**:
- `success` - Green background for successful operations
- `info` - Blue background for informational messages
- `warning` - Yellow/orange background for warnings
- `error` or `danger` - Red background for errors

**Usage**:

```javascript
// Success toast
window.parent.postMessage({
  event: 'toast',
  data: {
    type: 'success',
    message: 'Operation completed successfully'
  }
}, '*');

// Error toast
window.parent.postMessage({
  event: 'toast',
  data: {
    type: 'error',
    message: 'Failed to save changes. Please try again.'
  }
}, '*');

// Info toast
window.parent.postMessage({
  event: 'toast',
  data: {
    type: 'info',
    message: 'Processing your request...'
  }
}, '*');

// Warning toast
window.parent.postMessage({
  event: 'toast',
  data: {
    type: 'warning',
    message: 'This action cannot be undone.'
  }
}, '*');
```

**Best Practices**:
- Use toasts for non-blocking notifications (success confirmations, background operations)
- Keep messages concise (ideally under 50 characters)
- Use appropriate types: success for confirmations, error for failures, warning for cautions
- Don't use toasts for critical errors that require user action (use modals or inline alerts instead)
- FieldTwin automatically handles toast positioning, animations, and auto-dismiss behavior

---

## Best Practices

### Performance

1. **Lazy Loading**: Load data on demand, not all at once
2. **Virtual Scrolling**: For very long lists (>100 items)
3. **Debouncing**: Debounce search/filter inputs (300ms)
4. **Memoization**: Cache expensive computations
5. **Image Optimization**: Optimize images and use appropriate formats

### Code Organization

1. **Component Structure**: Keep components focused and reusable
2. **State Management**: Use Svelte 5 runes (`$state`, `$derived`, `$effect`)
3. **Service Layer**: Separate API calls into service classes
4. **Constants**: Extract magic numbers and strings to constants

### User Experience

1. **Progressive Disclosure**: Show advanced options only when needed
2. **Confirmation Dialogs**: For destructive actions
3. **Undo/Redo**: Where applicable, support undo for user actions
4. **Keyboard Shortcuts**: Provide shortcuts for common actions
5. **Tooltips**: Use Bootstrap tooltips for additional context

### Testing Considerations

1. **Standalone Mode**: Ensure UI works in both embedded and standalone modes
2. **Mock Data**: Provide realistic mock data for testing
3. **Error Scenarios**: Test error states and edge cases
4. **Responsive Testing**: Test at various screen sizes

### Documentation

1. **Component Props**: Document all component props with JSDoc
2. **User Guides**: Provide inline help and tooltips
3. **Error Messages**: Make error messages actionable and clear

---

## Examples

### Complete Form Example

```html
<div class="card">
  <div class="card-header">
    <h5 class="card-title mb-0">Create Finding</h5>
  </div>
  <div class="card-body">
    <form onsubmit={handleSubmit}>
      <div class="mb-3">
        <label for="title" class="form-label">
          Title <span class="text-danger">*</span>
        </label>
        <input 
          type="text" 
          class="form-control" 
          id="title" 
          required
          bind:value={title}
        />
      </div>
      
      <div class="mb-3">
        <label for="severity" class="form-label">Severity</label>
        <select class="form-select" id="severity" bind:value={severity}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea 
          class="form-control" 
          id="description" 
          rows="4"
          bind:value={description}
        ></textarea>
      </div>
      
      {#if error}
        <div class="alert alert-danger" role="alert">
          {error}
        </div>
      {/if}
    </form>
  </div>
  <div class="card-footer">
    <button 
      class="btn btn-secondary me-2" 
      onclick={handleCancel}
    >
      Cancel
    </button>
    <button 
      class="btn btn-primary" 
      onclick={handleSubmit}
      disabled={loading}
    >
      {#if loading}
        <span class="spinner-border spinner-border-sm me-2"></span>
      {/if}
      Save
    </button>
  </div>
</div>
```

### List with Filters Example

```html
<div class="mb-3">
  <div class="row g-2">
    <div class="col-md-6">
      <input 
        type="text" 
        class="form-control" 
        placeholder="Search..."
        bind:value={searchQuery}
      />
    </div>
    <div class="col-md-3">
      <select class="form-select" bind:value={statusFilter}>
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>
    </div>
    <div class="col-md-3">
      <button class="btn btn-outline-primary w-100" onclick={handleCreate}>
        Create New
      </button>
    </div>
  </div>
</div>

<div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
  <table class="table table-striped table-hover">
    <thead class="table-light sticky-top">
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Owner</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredItems as item}
        <tr>
          <td>{item.name}</td>
          <td>
            <span class="badge bg-{getStatusColor(item.status)}">
              {item.status}
            </span>
          </td>
          <td>{item.owner}</td>
          <td>
            <button 
              class="btn btn-sm btn-outline-primary"
              onclick={() => handleEdit(item)}
            >
              Edit
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if filteredItems.length === 0}
  <div class="text-center py-5">
    <p class="text-muted">No items found</p>
  </div>
{/if}
```

---

## Resources

- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.3/)
- [Svelte Bootstrap Icons](https://github.com/shinokada/svelte-bootstrap-icons)
- [FieldTwin API Documentation](https://api.fieldtwin.com/)
- [FieldTwin Integration Guide](https://docs.fieldtwin.com/developer-portal/makeintegration/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Version History

- **v1.0** (2025-01-22): Initial UI guidelines document

---

## Feedback and Updates

This document should be updated as FieldTwin's design system evolves and as best practices are discovered. Please contribute improvements and examples from your integration development experience.
