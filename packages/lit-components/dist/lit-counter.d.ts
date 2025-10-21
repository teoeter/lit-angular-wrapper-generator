import { LitElement } from 'lit';
export declare class LitCounter extends LitElement {
    static styles: import("lit").CSSResult;
    initial: number;
    step: number;
    private count;
    connectedCallback(): void;
    private increment;
    private decrement;
    private reset;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'lit-counter': LitCounter;
    }
}
//# sourceMappingURL=lit-counter.d.ts.map