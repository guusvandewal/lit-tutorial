# Lit Deep Dive — Tutorial & Playground

An advanced, annotated tutorial covering `lit-html` and `LitElement` from first principles to advanced patterns. Built for developers already comfortable with React or Vue.

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

---

## Project Structure

```
lit-tutorial/
├── index.html                  ← Tutorial UI (all chapters + playground)
├── src/
│   ├── 01-lit-html-basics/     ← Template bindings, composition, conditionals
│   ├── 02-directives/          ← repeat, cache, classMap, custom directives
│   ├── 03-lit-element-basics/  ← First component, properties, state
│   ├── 04-lifecycle/           ← Full annotated lifecycle
│   ├── 05-reactive-props/      ← All property options
│   ├── 06-styles/              ← Shadow DOM, :host, ::slotted, shared CSS
│   ├── 07-events/              ← Events, refs, CustomEvent
│   ├── 08-composition/         ← Controllers + Mixins
│   └── 09-context/             ← Context API (provide/inject)
```

---

## Chapter Reference

### `lit-html`

| Chapter | Concepts |
|---------|----------|
| 01 — Template Basics | Text, attribute, boolean attr, property, event bindings; composition; conditionals |
| 02 — Directives | `repeat`, `cache`, `classMap`, `styleMap`, `live`, `ref`, custom `Directive` class |

### `LitElement`

| Chapter | Concepts |
|---------|----------|
| 03 — First Component | `static properties`, `static styles`, `render()`, `customElements.define` |
| 04 — Lifecycle | `connectedCallback`, `disconnectedCallback`, `willUpdate`, `firstUpdated`, `updated`, `updateComplete` |
| 05 — Reactive Properties | All property options: `type`, `attribute`, `reflect`, `state`, `hasChanged`, custom converters |
| 06 — Styles & Shadow DOM | `:host`, `:host([attr])`, `::slotted`, `:host-context`, named slots, shared `css` |
| 07 — Events & Refs | `@click`, `createRef`, `ref()`, `CustomEvent`, `bubbles`, `composed`, `handleEvent` |

### Advanced

| Chapter | Concepts |
|---------|----------|
| 08 — Composition | Reactive Controllers (`addController`), Mixins (class factory pattern) |
| 09 — Context API | `createContext`, `ContextProvider`, `ContextConsumer`, provide/inject |

---

## Key Mental Models

### Binding Syntax Quick Reference

```js
html`
  <!-- Text -->
  <p>${value}</p>

  <!-- Attribute (string) -->
  <input placeholder=${value} />

  <!-- Boolean attribute (?attr) -->
  <button ?disabled=${condition}></button>

  <!-- Property (.prop) — for objects, arrays, booleans -->
  <my-el .items=${array}></my-el>

  <!-- Event (@event) -->
  <button @click=${handler}></button>
`
```

### Property Options

```js
static properties = {
  label:     { type: String },                    // reflects to/from attribute
  firstName: { type: String, attribute: 'first-name' }, // custom attr name
  selected:  { type: Boolean, reflect: true },    // mirrors prop → attr
  _loading:  { state: true },                     // internal, no attribute
  data:      { type: Object, hasChanged(n, o) { return n?.id !== o?.id; } },
};
```

### Lifecycle Order

```
constructor()           → defaults, no DOM
connectedCallback()     → in DOM, subscribe
  willUpdate()          → before render, derive state
  render()              → return template
  firstUpdated()        → once, DOM ready
  updated()             → after every render, imperative ops
disconnectedCallback()  → removed, unsubscribe
```

### Controllers vs Mixins

| | Controllers | Mixins |
|--|--|--|
| **Pattern** | Instance composition | Class composition |
| **Equivalent** | React hooks / Vue composables | Vue mixins / TS decorators |
| **Use when** | Encapsulating lifecycle logic + state | Sharing property declarations + methods |
| **Multiple** | Yes, unlimited | Yes, stacked |

---

## Playground Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Run code |
| `Tab` | Indent (2 spaces) |

---

## Useful Links

- [Lit docs](https://lit.dev/docs/)
- [Lit playground](https://lit.dev/playground/)
- [MDN: Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [MDN: Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [@lit/context](https://lit.dev/docs/data/context/)
- [Lit directives](https://lit.dev/docs/templates/directives/)
