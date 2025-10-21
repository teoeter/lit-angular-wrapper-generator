import { fixture, html } from '@open-wc/testing-helpers';
import { expect, test, describe } from 'vitest';
import './lit-counter.js';
import type { LitCounter } from './lit-counter.js';

describe('LitCounter', () => {
  test('renders with default values', async () => {
    const el = await fixture<LitCounter>(html`<lit-counter></lit-counter>`);
    expect(el).toBeTruthy();
  });

  test('increments counter', async () => {
    const el = await fixture<LitCounter>(html`<lit-counter></lit-counter>`);
    const button = el.shadowRoot!.querySelectorAll('button')[1];
    button.click();
    await el.updateComplete;
    const value = el.shadowRoot!.querySelector('.counter-value');
    expect(value?.textContent).toBe('1');
  });

  test('uses initial value', async () => {
    const el = await fixture<LitCounter>(html`<lit-counter initial="10"></lit-counter>`);
    const value = el.shadowRoot!.querySelector('.counter-value');
    expect(value?.textContent).toBe('10');
  });
});
