/**
 * Chapter 05: Reactive Properties — all options & patterns
 */
import { LitElement, html, css } from 'lit';

// ─── Custom type converter ────────────────────────────────────────────────────
// For types that can't be JSON.parse'd automatically (e.g. Date from attribute)
const DateConverter = {
  fromAttribute(value) {
    return value ? new Date(value) : null;
  },
  toAttribute(value) {
    return value ? value.toISOString().split('T')[0] : null;
  },
};

class ReactivePropsDemo extends LitElement {
  static properties = {

    // ── type: auto-converts attribute strings to/from JS types ──────────────
    count:   { type: Number },   // "5"   → 5
    active:  { type: Boolean },  // ""    → true, null → false
    label:   { type: String },   // always a string
    options: { type: Array },    // JSON.parse('[...]') from attribute
    config:  { type: Object },   // JSON.parse('{...}') from attribute

    // ── attribute: customizes the observed HTML attribute name ───────────────
    // Without this, Lit lowercases the property name for the attribute
    firstName:  { type: String, attribute: 'first-name' },
    // <my-el first-name="Alice"> sets this.firstName
    // attribute: false = not observable from HTML at all
    _computed: { attribute: false, type: String },

    // ── reflect: mirrors the property value back to the HTML attribute ───────
    // Essential when you need CSS [attr] selectors or outside JS to read attrs
    selected: { type: Boolean, reflect: true },
    // this.selected = true → <my-el selected></my-el>
    variant:  { type: String,  reflect: true },
    // this.variant = 'danger' → <my-el variant="danger"></my-el>

    // ── state: internal reactive state — like useState or Vue's data() ───────
    // Not reflected, not observable from outside
    _loading: { state: true },
    _error:   { state: true },
    _cache:   { state: true },

    // ── hasChanged: custom equality — skip render if "equal enough" ──────────
    // Default: strict equality (===), which misses object/array mutations
    data: {
      type: Object,
      // Only re-render if the ID changed — ignore other field changes
      hasChanged(newVal, oldVal) {
        return newVal?.id !== oldVal?.id;
      },
    },

    // ── converter: fully custom attribute serialization ──────────────────────
    startDate: { converter: DateConverter, reflect: true },

  };

  constructor() {
    super();
    // Initialize all declared properties
    this.count    = 0;
    this.active   = false;
    this.label    = '';
    this.options  = [];
    this.config   = {};
    this.firstName = '';
    this.selected = false;
    this.variant  = 'default';
    this._loading = false;
    this._error   = null;
    this._cache   = new Map();
    this.data     = null;
    this.startDate = null;
  }

  // ─── Computed / derived values ─────────────────────────────────────────────
  // NOT reactive properties — just getters that compute from reactive ones
  get isValid() {
    return this.count > 0 && !!this.label;
  }

  get displayLabel() {
    return this.label || `Item ${this.count}`;
  }

  // ─── Watching specific property changes ───────────────────────────────────
  willUpdate(changedProps) {
    // Guard pattern: only react when specific props change
    if (changedProps.has('count') || changedProps.has('label')) {
      // Compute derived state synchronously before render
      this._computed = `${this.displayLabel} (${this.count})`;
    }

    if (changedProps.has('config')) {
      // Fetch data when config changes
      const old = changedProps.get('config');
      if (this.config?.endpoint !== old?.endpoint) {
        this._loadData();
      }
    }
  }

  async _loadData() {
    this._loading = true;
    try {
      const res = await fetch(this.config.endpoint);
      this.data = await res.json();
    } catch (e) {
      this._error = e.message;
    } finally {
      this._loading = false;
    }
  }

  // ─── Triggering updates on mutable objects/arrays ─────────────────────────
  addOption(item) {
    // ❌ Wrong: same reference, won't trigger render
    // this.options.push(item);

    // ✅ Correct: new reference
    this.options = [...this.options, item];
  }

  updateConfig(key, val) {
    // ❌ Wrong: same object reference
    // this.config[key] = val;

    // ✅ Correct: spread to new object
    this.config = { ...this.config, [key]: val };
  }

  updateMap(key, val) {
    // Maps are always the same reference — must call requestUpdate manually
    this._cache.set(key, val);
    this.requestUpdate('_cache', new Map(this._cache)); // pass old value
  }

  render() {
    return html`
      <div>
        <p>computed: ${this._computed}</p>
        <p>valid: ${this.isValid}</p>
        <p>loading: ${this._loading}</p>
        ${this._error ? html`<p style="color:red">${this._error}</p>` : null}
      </div>
    `;
  }
}

customElements.define('reactive-props-demo', ReactivePropsDemo);

export { ReactivePropsDemo };
