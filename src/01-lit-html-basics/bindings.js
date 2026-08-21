/**
 * Chapter 01: lit-html bindings
 * Run: import this file and call render() into a container
 */
import { html, render, nothing } from 'lit';

// ─── All 5 binding types ──────────────────────────────────────────────────────

const makeTemplate = (state) => {
  const { label, active, count, items } = state;

  return html`
    <div class="demo" style="font-family: sans-serif; padding: 16px;">

      <!-- 1. TEXT: plain string interpolation -->
      <p>Label: ${label}</p>

      <!-- 2. ATTRIBUTE: reflects as HTML attribute string -->
      <input type="text" placeholder=${label} />

      <!-- 3. BOOLEAN ATTRIBUTE: ?attr sets/removes the attribute entirely -->
      <button ?disabled=${!active}>
        ${active ? 'Active button' : 'Disabled button'}
      </button>

      <!-- 4. PROPERTY: .prop= sets the JS DOM property (works with arrays, objects) -->
      <ul-element .items=${items}></ul-element>

      <!-- 5. EVENT: @event= adds event listener, cleaned up automatically -->
      <button @click=${() => alert(`count is ${count}`)}>
        Click me (count: ${count})
      </button>

      <!-- Conditional: ternary or && operator -->
      ${active
        ? html`<p style="color:green">✓ Active</p>`
        : html`<p style="color:red">✗ Inactive</p>`
      }

      <!-- nothing: renders no DOM node at all -->
      ${items.length > 3 ? html`<p>Many items!</p>` : nothing}

      <!-- Nested templates from an array -->
      <ul>
        ${items.map((item) => html`<li>${item}</li>`)}
      </ul>

    </div>
  `;
};

// Render initial state
let state = {
  label: 'Hello Lit',
  active: true,
  count: 0,
  items: ['alpha', 'beta', 'gamma'],
};

render(makeTemplate(state), document.getElementById('app'));

// Update — Lit will only patch the bindings that changed
setTimeout(() => {
  state = { ...state, count: 1, active: false };
  render(makeTemplate(state), document.getElementById('app'));
}, 2000);
