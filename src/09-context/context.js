/**
 * Chapter 09: Context API
 * Provide/inject equivalent — no prop drilling
 * Requires: npm install @lit/context
 */
import { LitElement, html, css } from 'lit';
import { createContext, ContextProvider, ContextConsumer } from '@lit/context';

// ─── 1. Define context keys ────────────────────────────────────────────────────
// A context key is just a unique identifier — a string or Symbol
// It acts as the "channel" that connects providers to consumers

export const themeContext = createContext('app-theme');
export const userContext  = createContext(Symbol('user'));
export const i18nContext  = createContext('i18n');

// ─── 2. Define the shape of your context values (for documentation/TS) ────────
/*
ThemeContext = {
  mode: 'light' | 'dark'
  primary: string
  toggle: () => void
}

UserContext = {
  id: string
  name: string
  role: 'admin' | 'viewer'
}
*/

// ─── 3. Provider: high up in the tree ─────────────────────────────────────────
class AppThemeProvider extends LitElement {
  // Option A: Use ContextProvider class directly
  #themeController;

  constructor() {
    super();
    this.#themeController = new ContextProvider(this, {
      context: themeContext,
      initialValue: {
        mode: 'light',
        primary: '#0070f3',
        toggle: () => {
          const current = this.#themeController.value;
          this.#themeController.setValue({
            ...current,
            mode: current.mode === 'light' ? 'dark' : 'light',
          });
        },
      },
    });
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define('app-theme-provider', AppThemeProvider);

// ─── Alternative Provider: using static properties (simpler) ──────────────────
// With @provide decorator syntax (TypeScript):
// @provide({ context: themeContext })
// theme = { mode: 'light', primary: '#0070f3' };
//
// Without decorators — declare the property with context option:
class SimpleProvider extends LitElement {
  static properties = {
    theme: { context: themeContext },
  };

  constructor() {
    super();
    this.theme = { mode: 'light', primary: '#0070f3' };
  }

  render() { return html`<slot></slot>`; }
}

customElements.define('simple-provider', SimpleProvider);

// ─── 4. Consumer: anywhere in the tree ────────────────────────────────────────
class ThemedButton extends LitElement {
  static properties = {
    label: { type: String },
  };

  // Option A: ContextConsumer class — more control
  #theme;

  constructor() {
    super();
    this.label = 'Click me';
    this.#theme = new ContextConsumer(this, {
      context: themeContext,
      subscribe: true, // re-render when context changes
    });
  }

  static styles = css`
    :host { display: inline-block; }
    button {
      padding: 8px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    button:hover { opacity: 0.85; }
  `;

  render() {
    const theme = this.#theme.value ?? { primary: '#888', mode: 'light' };
    return html`
      <button
        style="
          background: ${theme.primary};
          color: ${theme.mode === 'dark' ? '#fff' : '#fff'};
        "
        @click=${theme.toggle}
      >
        ${this.label}
      </button>
    `;
  }
}

customElements.define('themed-button', ThemedButton);

// ─── 5. Full usage example ─────────────────────────────────────────────────────
/*
<app-theme-provider>
  <div>
    <!-- deep nesting — no props passed down -->
    <div>
      <section>
        <themed-button label="Toggle Theme"></themed-button>
      </section>
    </div>
  </div>
</app-theme-provider>
*/

// ─── How context works under the hood ─────────────────────────────────────────
/*
When a consumer connects to the DOM:
  1. It dispatches a ContextRequestEvent up the DOM tree
  2. The nearest provider intercepts the event
  3. The provider calls the callback with the current value
  4. If subscribe:true, the provider calls the callback on every future update

This is pure DOM event bubbling — no global state, works across frameworks.
The event crosses shadow DOM boundaries because it uses bubbles + composed.
*/

export { AppThemeProvider, ThemedButton };
