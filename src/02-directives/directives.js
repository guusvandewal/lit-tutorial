/**
 * Chapter 02: Directives
 * Key built-in directives with usage examples
 */
import { html, render, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { cache } from 'lit/directives/cache.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { live } from 'lit/directives/live.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ref, createRef } from 'lit/directives/ref.js';

// ─── repeat() — keyed list diffing ────────────────────────────────────────────
// Use when list order changes or items are added/removed in the middle
const listTemplate = (items) => html`
  <ul>
    ${repeat(
      items,
      (item) => item.id,           // key function — must be unique & stable
      (item, index) => html`
        <li>${index + 1}. ${item.name}</li>
      `
    )}
  </ul>
`;

// ─── cache() — keep DOM alive across conditional switches ─────────────────────
// Equivalent to v-show behavior; avoids destroying/recreating complex subtrees
const tabTemplate = (tab) => html`
  ${cache(
    tab === 'a'
      ? html`<div>Tab A content — not destroyed on switch</div>`
      : html`<div>Tab B content — not destroyed on switch</div>`
  )}
`;

// ─── classMap() — dynamic class binding ───────────────────────────────────────
const buttonTemplate = (state) => html`
  <button class=${classMap({
    btn: true,
    'btn--active': state.active,
    'btn--loading': state.loading,
    'btn--disabled': state.disabled,
  })}>
    ${state.label}
  </button>
`;

// ─── styleMap() — dynamic inline styles ───────────────────────────────────────
const styledTemplate = (color, size) => html`
  <div style=${styleMap({
    color,
    fontSize: `${size}px`,
    padding: '8px',
    fontWeight: size > 16 ? 'bold' : 'normal',
  })}>
    Dynamic styles
  </div>
`;

// ─── live() — for controlled inputs ───────────────────────────────────────────
// Without live(), Lit won't re-set .value if the user has typed since last render
// With live(), it always reflects the current JS value into the DOM
let externalValue = 'initial';
const inputTemplate = () => html`
  <input
    .value=${live(externalValue)}
    @input=${(e) => console.log('input:', e.target.value)}
  />
`;

// ─── ifDefined() — only set attribute if value is not undefined ───────────────
const maybeTitle = undefined;
const imgTemplate = (src, alt, title) => html`
  <img src=${src} alt=${alt} title=${ifDefined(title)} />
`;
// title attribute won't be added at all if title is undefined

// ─── ref() — get reference to a rendered DOM element ─────────────────────────
const inputRef = createRef();
const refTemplate = () => html`
  <div>
    <input ${ref(inputRef)} type="text" placeholder="Focused via ref" />
    <button @click=${() => inputRef.value?.focus()}>Focus input</button>
  </div>
`;

// ─── Custom Directive — debounce event handler ────────────────────────────────
import { Directive, directive, PartType } from 'lit/directive.js';

class DebounceDirective extends Directive {
  constructor(partInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.EVENT) {
      throw new Error('debounce() must be used on an event binding (@event)');
    }
    this._timer = null;
  }

  render(handler, delay = 300) {
    // Return a new handler that wraps the original with debounce
    return (e) => {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => handler(e), delay);
    };
  }
}

export const debounce = directive(DebounceDirective);

// Usage:
const searchTemplate = (onSearch) => html`
  <input
    type="search"
    placeholder="Search (debounced 400ms)"
    @input=${debounce(onSearch, 400)}
  />
`;

export {
  listTemplate,
  tabTemplate,
  buttonTemplate,
  styledTemplate,
  inputTemplate,
  refTemplate,
  searchTemplate,
};
