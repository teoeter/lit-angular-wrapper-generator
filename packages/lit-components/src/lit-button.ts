import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('lit-button')
export class LitButton extends LitElement {
  static styles = css`
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

  /**
   * The button label
   */
  @property({ type: String })
  label: string = 'Click me';

  /**
   * The button variant (primary, secondary, danger)
   */
  @property({ type: String })
  variant: 'primary' | 'secondary' | 'danger' = 'primary';

  /**
   * Whether the button is disabled
   */
  @property({ type: Boolean })
  disabled: boolean = false;

  private handleClick = () => {
    if (!this.disabled) {
      this.dispatchEvent(new CustomEvent('button-click', {
        bubbles: true,
        composed: true
      }));
    }
  };

  render() {
    return html`
      <button
        class="button button--${this.variant}"
        ?disabled=${this.disabled}
        @click=${this.handleClick}
      >
        ${this.label}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-button': LitButton;
  }
}
