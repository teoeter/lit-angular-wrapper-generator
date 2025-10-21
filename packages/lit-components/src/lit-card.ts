import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('lit-card')
export class LitCard extends LitElement {
  static styles = css`
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

  @property({ type: String })
  header = '';

  @property({ type: String })
  footer = '';

  render() {
    return html`
      <div class="card">
        ${this.header ? html`<div class="card-header">${this.header}</div>` : ''}
        <div class="card-content">
          <slot></slot>
        </div>
        ${this.footer ? html`<div class="card-footer">${this.footer}</div>` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-card': LitCard;
  }
}
