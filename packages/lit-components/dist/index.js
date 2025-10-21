import { css as h, LitElement as m, html as u } from "lit";
import { property as c, customElement as v, state as g } from "lit/decorators.js";
var y = Object.defineProperty, w = Object.getOwnPropertyDescriptor, f = (i, e, r, o) => {
  for (var t = o > 1 ? void 0 : o ? w(e, r) : e, n = i.length - 1, s; n >= 0; n--)
    (s = i[n]) && (t = (o ? s(e, r, t) : s(t)) || t);
  return o && t && y(e, r, t), t;
};
let l = class extends m {
  constructor() {
    super(...arguments), this.header = "", this.footer = "";
  }
  render() {
    return u`
      <div class="card">
        ${this.header ? u`<div class="card-header">${this.header}</div>` : ""}
        <div class="card-content">
          <slot></slot>
        </div>
        ${this.footer ? u`<div class="card-footer">${this.footer}</div>` : ""}
      </div>
    `;
  }
};
l.styles = h`
    :host {
      display: block;
    }

    .card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background: white;
    }

    .card-header {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .card-content {
      color: #666;
      line-height: 1.6;
    }

    .card-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
      font-size: 0.875rem;
      color: #999;
    }
  `;
f([
  c({ type: String })
], l.prototype, "header", 2);
f([
  c({ type: String })
], l.prototype, "footer", 2);
l = f([
  v("lit-card")
], l);
var _ = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, b = (i, e, r, o) => {
  for (var t = o > 1 ? void 0 : o ? $(e, r) : e, n = i.length - 1, s; n >= 0; n--)
    (s = i[n]) && (t = (o ? s(e, r, t) : s(t)) || t);
  return o && t && _(e, r, t), t;
};
let d = class extends m {
  constructor() {
    super(...arguments), this.initial = 0, this.step = 1, this.count = 0;
  }
  connectedCallback() {
    super.connectedCallback(), this.count = this.initial;
  }
  increment() {
    this.count += this.step, this.dispatchEvent(new CustomEvent("count-changed", {
      detail: { count: this.count },
      bubbles: !0,
      composed: !0
    }));
  }
  decrement() {
    this.count -= this.step, this.dispatchEvent(new CustomEvent("count-changed", {
      detail: { count: this.count },
      bubbles: !0,
      composed: !0
    }));
  }
  reset() {
    this.count = this.initial, this.dispatchEvent(new CustomEvent("count-changed", {
      detail: { count: this.count },
      bubbles: !0,
      composed: !0
    }));
  }
  render() {
    return u`
      <div class="counter">
        <button class="counter-button" @click=${this.decrement}>-</button>
        <div class="counter-value">${this.count}</div>
        <button class="counter-button" @click=${this.increment}>+</button>
        <button class="counter-button reset-button" @click=${this.reset}>Reset</button>
      </div>
    `;
  }
};
d.styles = h`
    :host {
      display: block;
    }

    .counter {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .counter-value {
      font-size: 2rem;
      font-weight: bold;
      color: #007bff;
      min-width: 3rem;
      text-align: center;
    }

    .counter-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .counter-button:hover {
      background: #0056b3;
    }

    .counter-button:active {
      transform: scale(0.95);
    }

    .reset-button {
      background: #6c757d;
    }

    .reset-button:hover {
      background: #545b62;
    }
  `;
b([
  c({ type: Number })
], d.prototype, "initial", 2);
b([
  c({ type: Number })
], d.prototype, "step", 2);
b([
  g()
], d.prototype, "count", 2);
d = b([
  v("lit-counter")
], d);
var x = Object.defineProperty, C = Object.getOwnPropertyDescriptor, p = (i, e, r, o) => {
  for (var t = o > 1 ? void 0 : o ? C(e, r) : e, n = i.length - 1, s; n >= 0; n--)
    (s = i[n]) && (t = (o ? s(e, r, t) : s(t)) || t);
  return o && t && x(e, r, t), t;
};
let a = class extends m {
  constructor() {
    super(...arguments), this.label = "Click me", this.variant = "primary", this.disabled = !1, this.handleClick = () => {
      this.disabled || this.dispatchEvent(new CustomEvent("button-click", {
        bubbles: !0,
        composed: !0
      }));
    };
  }
  render() {
    return u`
      <button
        class="button button--${this.variant}"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        ${this.label}
      </button>
    `;
  }
};
a.styles = h`
    :host {
      display: inline-block;
    }

    .button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .button--primary {
      background-color: #007bff;
      color: white;
    }

    .button--primary:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .button--secondary {
      background-color: #6c757d;
      color: white;
    }

    .button--secondary:hover:not(:disabled) {
      background-color: #545b62;
    }

    .button--danger {
      background-color: #dc3545;
      color: white;
    }

    .button--danger:hover:not(:disabled) {
      background-color: #c82333;
    }
  `;
p([
  c({ type: String })
], a.prototype, "label", 2);
p([
  c({ type: String })
], a.prototype, "variant", 2);
p([
  c({ type: Boolean })
], a.prototype, "disabled", 2);
a = p([
  v("lit-button")
], a);
export {
  a as LitButton,
  l as LitCard,
  d as LitCounter
};
//# sourceMappingURL=index.js.map
