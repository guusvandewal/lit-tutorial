/**
 * Chapter 08: Composition Patterns
 * Reactive Controllers + Mixins
 */
import { LitElement, html, css } from 'lit';

// ═══════════════════════════════════════════════════════════════════════════════
// REACTIVE CONTROLLERS
// Like Vue composables / React hooks — encapsulate lifecycle + logic
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Controller: tracks mouse position
 * Any element that adds this gets mouse tracking for free
 */
export class MouseController {
  host;
  pos = { x: 0, y: 0 };

  constructor(host) {
    this.host = host;
    host.addController(this); // register — host will call our lifecycle hooks
  }

  hostConnected()    { window.addEventListener('mousemove', this); }
  hostDisconnected() { window.removeEventListener('mousemove', this); }

  handleEvent(e) {
    this.pos = { x: e.clientX, y: e.clientY };
    this.host.requestUpdate(); // trigger host re-render
  }
}

/**
 * Controller: async data fetching
 * Encapsulates loading/error/data state + fetch logic
 */
export class FetchController {
  host;
  url;
  data = null;
  loading = false;
  error = null;

  constructor(host, url) {
    this.host = host;
    this.url = url;
    host.addController(this);
  }

  hostConnected() {
    this.load();
  }

  async load(url = this.url) {
    this.url = url;
    this.loading = true;
    this.error = null;
    this.host.requestUpdate();

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json();
    } catch (e) {
      this.error = e.message;
    } finally {
      this.loading = false;
      this.host.requestUpdate();
    }
  }
}

/**
 * Controller: local storage sync
 * Persists a value to localStorage and keeps it in sync
 */
export class StorageController {
  host;
  key;
  #value;

  constructor(host, key, defaultValue) {
    this.host = host;
    this.key = key;
    this.#value = this._load() ?? defaultValue;
    host.addController(this);
  }

  get value() { return this.#value; }

  set value(v) {
    this.#value = v;
    localStorage.setItem(this.key, JSON.stringify(v));
    this.host.requestUpdate();
  }

  _load() {
    try {
      const stored = localStorage.getItem(this.key);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }

  hostConnected() {}
  hostDisconnected() {}
}

// ─── Example: element using multiple controllers ───────────────────────────────
class ControllerDemo extends LitElement {
  static styles = css`
    :host { display: block; font-family: system-ui; padding: 20px; }
    .coords { font-family: monospace; color: #0070f3; }
    .data-box { background: #f4f4f4; padding: 12px; border-radius: 8px; margin-top: 12px; font-size: 13px; }
    .error { color: #e00; }
  `;

  // Multiple controllers on one element — compose freely
  mouse = new MouseController(this);
  users = new FetchController(this, 'https://jsonplaceholder.typicode.com/users/1');
  theme = new StorageController(this, 'theme', 'light');

  render() {
    const { pos } = this.mouse;
    const { data, loading, error } = this.users;

    return html`
      <p>Mouse: <span class="coords">x=${pos.x} y=${pos.y}</span></p>

      <div class="data-box">
        ${loading ? html`<p>Loading user...</p>` : null}
        ${error   ? html`<p class="error">${error}</p>` : null}
        ${data    ? html`<p>User: ${data.name} &lt;${data.email}&gt;</p>` : null}
      </div>

      <p>
        Theme: ${this.theme.value}
        <button @click=${() => this.theme.value = this.theme.value === 'light' ? 'dark' : 'light'}>
          Toggle
        </button>
      </p>
    `;
  }
}

customElements.define('controller-demo', ControllerDemo);

// ═══════════════════════════════════════════════════════════════════════════════
// MIXINS
// Add shared behavior to elements without altering the class hierarchy
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mixin: DisabledMixin
 * Adds disabled property + aria management to any LitElement
 */
export const DisabledMixin = (Base) => class extends Base {
  static properties = {
    ...Base.properties,
    disabled: { type: Boolean, reflect: true },
  };

  constructor() {
    super();
    this.disabled = false;
  }

  updated(changedProps) {
    super.updated?.(changedProps);
    if (changedProps.has('disabled')) {
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
      this.tabIndex = this.disabled ? -1 : 0;
    }
  }
};

/**
 * Mixin: FocusableMixin
 * Forwards focus/blur to inner focusable element in shadow DOM
 */
export const FocusableMixin = (Base) => class extends Base {
  focus() {
    super.focus?.();
    this.shadowRoot?.querySelector('[tabindex], input, button, a')?.focus();
  }

  blur() {
    super.blur?.();
    this.shadowRoot?.querySelector(':focus')?.blur();
  }
};

/**
 * Mixin: ValidatableMixin
 * Adds validation state + constraint validation API
 */
export const ValidatableMixin = (Base) => class extends Base {
  static properties = {
    ...Base.properties,
    _valid: { state: true },
    _message: { state: true },
  };

  constructor() {
    super();
    this._valid = true;
    this._message = '';
  }

  validate() {
    throw new Error('validate() must be implemented by the element');
  }

  checkValidity() {
    const result = this.validate();
    this._valid = result.valid;
    this._message = result.message || '';
    return result.valid;
  }

  get validationMessage() { return this._message; }
};

// ─── Using mixins together ─────────────────────────────────────────────────────
class IconButton extends FocusableMixin(DisabledMixin(LitElement)) {
  static properties = {
    ...DisabledMixin(LitElement).properties,
    icon: { type: String },
    label: { type: String },
  };

  static styles = css`
    :host {
      display: inline-flex;
      cursor: pointer;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1.5px solid #333;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    button:hover { background: #f5f5f5; }
  `;

  constructor() {
    super();
    this.icon = '★';
    this.label = 'Button';
  }

  render() {
    return html`
      <button ?disabled=${this.disabled}>
        <span>${this.icon}</span>
        <span>${this.label}</span>
      </button>
    `;
  }
}

customElements.define('icon-button', IconButton);

export { ControllerDemo, IconButton };
