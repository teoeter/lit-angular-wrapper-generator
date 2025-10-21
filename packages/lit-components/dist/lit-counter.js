var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
let LitCounter = class LitCounter extends LitElement {
    constructor() {
        super(...arguments);
        this.initial = 0;
        this.step = 1;
        this.count = 0;
    }
    connectedCallback() {
        super.connectedCallback();
        this.count = this.initial;
    }
    increment() {
        this.count += this.step;
        this.dispatchEvent(new CustomEvent('count-changed', {
            detail: { count: this.count },
            bubbles: true,
            composed: true
        }));
    }
    decrement() {
        this.count -= this.step;
        this.dispatchEvent(new CustomEvent('count-changed', {
            detail: { count: this.count },
            bubbles: true,
            composed: true
        }));
    }
    reset() {
        this.count = this.initial;
        this.dispatchEvent(new CustomEvent('count-changed', {
            detail: { count: this.count },
            bubbles: true,
            composed: true
        }));
    }
    render() {
        return html `
      <div class="counter">
        <button class="counter-button" @click=${this.decrement}>-</button>
        <div class="counter-value">${this.count}</div>
        <button class="counter-button" @click=${this.increment}>+</button>
        <button class="counter-button reset-button" @click=${this.reset}>Reset</button>
      </div>
    `;
    }
};
LitCounter.styles = css `
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
__decorate([
    property({ type: Number })
], LitCounter.prototype, "initial", void 0);
__decorate([
    property({ type: Number })
], LitCounter.prototype, "step", void 0);
__decorate([
    state()
], LitCounter.prototype, "count", void 0);
LitCounter = __decorate([
    customElement('lit-counter')
], LitCounter);
export { LitCounter };
