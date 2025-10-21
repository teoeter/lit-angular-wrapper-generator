import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('lit-counter')
export class LitCounter extends LitElement {
  static styles = css`
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

  @property({ type: Number })
  initial = 0;

  @property({ type: Number })
  step = 1;

  @state()
  private count = 0;

  connectedCallback() {
    super.connectedCallback();
    this.count = this.initial;
  }

  private increment() {
    this.count += this.step;
    this.dispatchEvent(new CustomEvent('count-changed', {
      detail: { count: this.count },
      bubbles: true,
      composed: true
    }));
  }

  private decrement() {
    this.count -= this.step;
    this.dispatchEvent(new CustomEvent('count-changed', {
      detail: { count: this.count },
      bubbles: true,
      composed: true
    }));
  }

  private reset() {
    this.count = this.initial;
    this.dispatchEvent(new CustomEvent('count-changed', {
      detail: { count: this.count },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="counter">
        <button class="counter-button" @click=${this.decrement}>-</button>
        <div class="counter-value">${this.count}</div>
        <button class="counter-button" @click=${this.increment}>+</button>
        <button class="counter-button reset-button" @click=${this.reset}>Reset</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-counter': LitCounter;
  }
}
