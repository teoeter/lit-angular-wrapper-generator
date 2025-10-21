var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
let LitCard = class LitCard extends LitElement {
    constructor() {
        super(...arguments);
        this.header = '';
        this.footer = '';
    }
    render() {
        return html `
      <div class="card">
        ${this.header ? html `<div class="card-header">${this.header}</div>` : ''}
        <div class="card-content">
          <slot></slot>
        </div>
        ${this.footer ? html `<div class="card-footer">${this.footer}</div>` : ''}
      </div>
    `;
    }
};
LitCard.styles = css `
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
__decorate([
    property({ type: String })
], LitCard.prototype, "header", void 0);
__decorate([
    property({ type: String })
], LitCard.prototype, "footer", void 0);
LitCard = __decorate([
    customElement('lit-card')
], LitCard);
export { LitCard };
