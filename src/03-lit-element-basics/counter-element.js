/**
 * Chapter 03: First LitElement
 * A feature-complete counter that demonstrates all core concepts
 */
import { LitElement, html, css } from 'lit';

class CounterElement extends LitElement {

  // ─── 1. Reactive Properties ─────────────────────────────────────────────────
  static properties = {
    // Public property — settable from HTML attribute: <counter-el count="10">
    count: { type: Number },

    // Public with custom attribute name: <counter-el step-size="5">
    stepSize: { type: Number, attribute: 'step-size' },

    // Internal state — no attribute reflection, no outside access
    _history: { state: true },
  };

  // ─── 2. Scoped CSS ──────────────────────────────────────────────────────────
  static styles = css`
    /* :host = the custom element itself */
    :host {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px;
      font-family: system-ui, sans-serif;
      border: 1px solid #e0e0e0;
      border-radius: 12px;

      /* CSS custom props let consumers theme the element */
      background: var(--counter-bg, #fff);
      color: var(--counter-color, #111);
    }

    .count {
      font-size: 64px;
      font-weight: 900;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .controls {
      display: flex;
      gap: 8px;
    }

    button {
      padding: 8px 20px;
      font-size: 20px;
      cursor: pointer;
      border: 2px solid currentColor;
      border-radius: 8px;
      background: transparent;
      color: inherit;
      transition: background 0.15s;
    }

    button:hover { background: rgba(0,0,0,0.06); }

    .history {
      font-size: 12px;
      color: #888;
      font-family: monospace;
    }
  `;

  // ─── 3. Constructor / Default State ─────────────────────────────────────────
  constructor() {
    super(); // ALWAYS call super() first in LitElement
    this.count = 0;
    this.stepSize = 1;
    this._history = [];
  }

  // ─── 4. Methods ─────────────────────────────────────────────────────────────
  _increment() {
    const prev = this.count;
    this.count += this.stepSize;
    this._history = [...this._history.slice(-4), `${prev} → ${this.count}`];

    // Dispatch a custom event for parent components to listen to
    this.dispatchEvent(new CustomEvent('count-change', {
      detail: { count: this.count, prev },
      bubbles: true,
      composed: true, // crosses shadow DOM boundary
    }));
  }

  _decrement() {
    const prev = this.count;
    this.count -= this.stepSize;
    this._history = [...this._history.slice(-4), `${prev} → ${this.count}`];

    this.dispatchEvent(new CustomEvent('count-change', {
      detail: { count: this.count, prev },
      bubbles: true,
      composed: true,
    }));
  }

  _reset() {
    this.count = 0;
    this._history = [];
  }

  // ─── 5. Render ──────────────────────────────────────────────────────────────
  render() {
    return html`
      <div class="count">${this.count}</div>

      <div class="controls">
        <button @click=${this._decrement}>−</button>
        <button @click=${this._reset} title="Reset">↺</button>
        <button @click=${this._increment}>+</button>
      </div>

      ${this._history.length > 0
        ? html`<div class="history">${this._history.join(' · ')}</div>`
        : null
      }
    `;
  }
}

customElements.define('counter-element', CounterElement);

// ─── Usage from HTML ─────────────────────────────────────────────────────────
// <counter-element count="5" step-size="2"></counter-element>
// <counter-element style="--counter-bg: #1a1a1a; --counter-color: #fff;"></counter-element>

export { CounterElement };
