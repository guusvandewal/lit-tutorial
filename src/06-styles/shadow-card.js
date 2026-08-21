/**
 * Chapter 06: Styles & Shadow DOM
 */
import { LitElement, html, css, unsafeCSS } from 'lit';

// ─── Shared CSS tokens ────────────────────────────────────────────────────────
// Define once, import into multiple elements
export const tokens = css`
  :host {
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
  }
`;

export const typography = css`
  h1, h2, h3 { font-family: system-ui; font-weight: 700; }
  p { line-height: 1.6; }
  code { font-family: monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
`;

// ─── Main styled element demonstrating all Shadow DOM CSS features ─────────────
class ShadowCard extends LitElement {
  static properties = {
    title: { type: String },
    selected: { type: Boolean, reflect: true },
    variant: { type: String, reflect: true },
  };

  static styles = [
    tokens,
    typography,
    css`
      /* :host — the element itself */
      :host {
        display: block;
        border-radius: var(--radius-lg);
        overflow: hidden;
        border: 2px solid #e0e0e0;
        transition: border-color 0.15s, box-shadow 0.15s;

        /* CSS custom props for external theming */
        --card-bg: #fff;
        --card-header-bg: #f9f9f9;
      }

      /* :host([attr]) — style host based on its own reflected attributes */
      :host([selected]) {
        border-color: #0070f3;
        box-shadow: 0 0 0 3px rgba(0,112,243,0.15);
      }

      :host([variant="danger"])  { border-color: #e00; }
      :host([variant="success"]) { border-color: #0a0; }

      /* :host(:hover) — host pseudo-classes */
      :host(:hover) { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

      /* :host-context(.parent-class) — style based on ancestor */
      :host-context(.dark-mode) {
        --card-bg: #1a1a1a;
        --card-header-bg: #2a2a2a;
      }

      .card-header {
        padding: var(--space-md);
        background: var(--card-header-bg);
        border-bottom: 1px solid #e0e0e0;
        font-weight: 600;
        font-family: system-ui;
      }

      .card-body {
        padding: var(--space-md);
        background: var(--card-bg);
      }

      /* ::slotted() — style elements projected into slots */
      /* Note: only direct children of the slot, not grandchildren */
      ::slotted(p) {
        margin: 0 0 8px;
        font-size: 14px;
        color: #555;
      }

      ::slotted(*:last-child) { margin-bottom: 0; }

      .card-footer {
        padding: var(--space-sm) var(--space-md);
        background: var(--card-header-bg);
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: var(--space-sm);
      }

      /* ::slotted with named slot */
      ::slotted([slot="action"]) {
        padding: 6px 14px;
        border: 1px solid #ddd;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 13px;
        background: white;
      }
    `,
  ];

  constructor() {
    super();
    this.title = 'Card';
    this.selected = false;
    this.variant = null;
  }

  render() {
    return html`
      <div class="card-header">${this.title}</div>
      <div class="card-body">
        <!-- Default slot: unnamed, accepts all non-slotted children -->
        <slot></slot>
      </div>
      <div class="card-footer">
        <!-- Named slot: <button slot="action"> from the consumer -->
        <slot name="action"></slot>
      </div>
    `;
  }
}

customElements.define('shadow-card', ShadowCard);

// ─── Using the card ───────────────────────────────────────────────────────────
/*
<shadow-card title="My Card" selected>
  <p>This paragraph is slotted into the default slot</p>
  <p>Styled via ::slotted(p)</p>
  <button slot="action">OK</button>
  <button slot="action">Cancel</button>
</shadow-card>

// Theme from outside via CSS custom properties:
shadow-card {
  --card-bg: #f0f0ff;
  --card-header-bg: #e0e0ff;
}
*/

export { ShadowCard };
