/**
 * Chapter 04: Lifecycle
 * Annotated element showing every lifecycle hook in order
 */
import { LitElement, html, css } from 'lit';

class LifecycleElement extends LitElement {
  static properties = {
    items: { type: Array },
    open: { type: Boolean, reflect: true },
    _log: { state: true },
    _sorted: { state: true },
  };

  static styles = css`
    :host { display: block; font-family: monospace; padding: 16px; }
    .log { background: #111; color: #7fff7f; padding: 12px; border-radius: 8px; font-size: 12px; line-height: 1.8; }
    .log-entry { display: flex; gap: 8px; }
    .log-entry .hook { color: #47b4ff; min-width: 200px; }
    .log-entry .info { color: #aaa; }
  `;

  // ─── Native Custom Elements lifecycle ────────────────────────────────────────

  constructor() {
    super();
    // At this point: no shadow DOM, no attributes parsed yet
    this.items = [];
    this.open = false;
    this._log = [];
    this._sorted = [];
    this._log.push({ hook: 'constructor()', info: 'Element created, no DOM yet' });
  }

  // Fires when element is inserted into a document
  connectedCallback() {
    super.connectedCallback(); // ← always call super, or Lit breaks
    this._addLog('connectedCallback()', 'Added to DOM — subscribe to stores, start intervals');

    // Good place to: subscribe to external state, add window listeners
    this._resizeHandler = () => this._addLog('resize', window.innerWidth + 'px');
    window.addEventListener('resize', this._resizeHandler);
  }

  // Fires when element is removed from the document
  disconnectedCallback() {
    super.disconnectedCallback();
    this._addLog('disconnectedCallback()', 'Removed from DOM — clean up subscriptions');

    // ALWAYS clean up what you did in connectedCallback
    window.removeEventListener('resize', this._resizeHandler);
  }

  // Fires when an *observed* attribute changes
  attributeChangedCallback(name, old, next) {
    super.attributeChangedCallback(name, old, next);
    this._addLog(
      `attributeChangedCallback(${name})`,
      `"${old}" → "${next}"`
    );
  }

  // ─── Lit reactive update lifecycle ──────────────────────────────────────────

  // Runs sync before render(). Best place to compute derived state.
  // Do NOT trigger side effects here.
  willUpdate(changedProps) {
    const changed = [...changedProps.keys()].join(', ');
    this._addLog('willUpdate()', `changedProps: [${changed}]`);

    // Compute derived state based on changed props
    if (changedProps.has('items')) {
      this._sorted = [...this.items].sort();
    }
  }

  // The template — called whenever a reactive property changes
  render() {
    this._addLog('render()', `items: ${this.items.length}, open: ${this.open}`);
    return html`
      <div class="log">
        ${this._log.slice(-12).map(entry => html`
          <div class="log-entry">
            <span class="hook">${entry.hook}</span>
            <span class="info">${entry.info}</span>
          </div>
        `)}
      </div>
    `;
  }

  // Runs ONCE after the first render — use for one-time DOM setup
  firstUpdated(changedProps) {
    this._addLog('firstUpdated()', 'First render done — safe to access shadowRoot');

    // Accessing the shadow DOM is now safe
    const logEl = this.shadowRoot.querySelector('.log');
    console.log('Log element:', logEl);

    // Request re-render to show the log entry we just added
    this.requestUpdate();
  }

  // Runs after EVERY render — use for imperative DOM integration
  // WARNING: Setting reactive properties here causes infinite loops unless guarded
  updated(changedProps) {
    this._addLog('updated()', `render complete, changed: [${[...changedProps.keys()].join(', ')}]`);

    // Auto-scroll log to bottom (imperative DOM op, safe here)
    const logEl = this.shadowRoot.querySelector('.log');
    if (logEl) logEl.scrollTop = logEl.scrollHeight;
  }

  // ─── Utilities ───────────────────────────────────────────────────────────────

  _addLog(hook, info) {
    // Using array spread to trigger reactivity (not .push())
    this._log = [...this._log, { hook, info }];
  }

  // Wait for the current render cycle to complete
  async doSomethingAfterRender() {
    this.open = true;
    await this.updateComplete; // Promise<boolean>
    // Now the DOM reflects the new state
    const computed = getComputedStyle(this);
    console.log('Height after open:', computed.height);
  }
}

customElements.define('lifecycle-element', LifecycleElement);

export { LifecycleElement };
