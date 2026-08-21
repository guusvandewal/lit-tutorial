/**
 * Chapter 07: Events & Refs
 */
import { LitElement, html, css } from 'lit';
import { createRef, ref } from 'lit/directives/ref.js';

// ─── Dispatching typed custom events ─────────────────────────────────────────
// Best practice: define event detail types and event names as constants
export const EVENTS = {
  SUBMIT: 'form-submit',
  CANCEL: 'form-cancel',
  FIELD_CHANGE: 'field-change',
};

class CustomForm extends LitElement {
  static properties = {
    _values: { state: true },
    _errors: { state: true },
  };

  static styles = css`
    :host { display: block; font-family: system-ui; }
    form { display: flex; flex-direction: column; gap: 12px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
    label { font-size: 13px; font-weight: 600; margin-bottom: 4px; display: block; }
    input { width: 100%; padding: 8px 12px; border: 1.5px solid #ccc; border-radius: 6px; font-size: 14px; outline: none; }
    input:focus { border-color: #0070f3; }
    input.error { border-color: #e00; }
    .error-msg { color: #e00; font-size: 12px; }
    .controls { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
    button { padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; border: 1.5px solid; }
    .btn-primary { background: #0070f3; color: #fff; border-color: #0070f3; }
    .btn-secondary { background: #fff; color: #333; border-color: #ccc; }
  `;

  // ─── Refs: two approaches ──────────────────────────────────────────────────

  // 1. createRef() — mutable ref object (like React.createRef)
  _nameInputRef = createRef();

  // 2. Getter accessing shadowRoot directly
  get _emailInput() {
    return this.shadowRoot?.querySelector('#email');
  }

  constructor() {
    super();
    this._values = { name: '', email: '' };
    this._errors = {};
  }

  firstUpdated() {
    // Focus first field on mount
    this._nameInputRef.value?.focus();
  }

  // ─── Event handlers ────────────────────────────────────────────────────────

  // Pattern 1: Method reference (no new function each render — best for lists)
  _onNameInput = (e) => {
    this._values = { ...this._values, name: e.target.value };
    this._dispatchFieldChange('name', e.target.value);
  };

  _onEmailInput(e) {
    this._values = { ...this._values, email: e.target.value };
    this._dispatchFieldChange('email', e.target.value);
  }

  _dispatchFieldChange(field, value) {
    // bubbles + composed = crosses shadow boundary
    this.dispatchEvent(new CustomEvent(EVENTS.FIELD_CHANGE, {
      detail: { field, value },
      bubbles: true,
      composed: true,
    }));
  }

  _validate() {
    const errors = {};
    if (!this._values.name.trim()) errors.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this._values.email)) {
      errors.email = 'Valid email required';
    }
    this._errors = errors;
    return Object.keys(errors).length === 0;
  }

  _onSubmit(e) {
    // Prevent native form submission (we're handling it)
    e.preventDefault();

    if (!this._validate()) return;

    // Dispatch up to parent — parent doesn't need to know about the shadow DOM
    this.dispatchEvent(new CustomEvent(EVENTS.SUBMIT, {
      detail: { values: { ...this._values } },
      bubbles: true,
      composed: true,
    }));
  }

  _onCancel() {
    this.dispatchEvent(new CustomEvent(EVENTS.CANCEL, {
      bubbles: true,
      composed: true,
    }));
  }

  // Pattern 3: handleEvent object pattern — one listener, multiple events
  // Use `this` as the listener: @click=${this} @keydown=${this}
  handleEvent(e) {
    switch (e.type) {
      case 'keydown':
        if (e.key === 'Escape') this._onCancel();
        break;
    }
  }

  render() {
    return html`
      <form @submit=${this._onSubmit} @keydown=${this}>
        <div>
          <label>Name</label>
          <!-- ref() directive wires the createRef -->
          <input
            ${ref(this._nameInputRef)}
            type="text"
            .value=${this._values.name}
            @input=${this._onNameInput}
            class=${this._errors.name ? 'error' : ''}
          />
          ${this._errors.name
            ? html`<span class="error-msg">${this._errors.name}</span>`
            : null
          }
        </div>

        <div>
          <label>Email</label>
          <!-- shadowRoot.querySelector approach via getter -->
          <input
            id="email"
            type="email"
            .value=${this._values.email}
            @input=${(e) => this._onEmailInput(e)}
            class=${this._errors.email ? 'error' : ''}
          />
          ${this._errors.email
            ? html`<span class="error-msg">${this._errors.email}</span>`
            : null
          }
        </div>

        <div class="controls">
          <button type="button" class="btn-secondary" @click=${this._onCancel}>
            Cancel
          </button>
          <button type="submit" class="btn-primary">Submit</button>
        </div>
      </form>
    `;
  }
}

customElements.define('custom-form', CustomForm);

// ─── Parent listening for events ──────────────────────────────────────────────
/*
<custom-form
  @form-submit=${(e) => console.log('Submitted:', e.detail.values)}
  @form-cancel=${() => console.log('Cancelled')}
  @field-change=${(e) => console.log('Field changed:', e.detail)}
></custom-form>
*/

export { CustomForm };
