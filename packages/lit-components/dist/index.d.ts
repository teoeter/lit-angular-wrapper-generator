import { CSSResult } from 'lit';
import { LitElement } from 'lit';
import { TemplateResult } from 'lit';

export declare class LitButton extends LitElement {
    static styles: CSSResult;
    /**
     * The button label
     */
    label: string;
    /**
     * The button variant (primary, secondary, danger)
     */
    variant: 'primary' | 'secondary' | 'danger';
    /**
     * Whether the button is disabled
     */
    disabled: boolean;
    private handleClick;
    render(): TemplateResult<1>;
}

export declare class LitCard extends LitElement {
    static styles: CSSResult;
    header: string;
    footer: string;
    render(): TemplateResult<1>;
}

export declare class LitCounter extends LitElement {
    static styles: CSSResult;
    initial: number;
    step: number;
    private count;
    connectedCallback(): void;
    private increment;
    private decrement;
    private reset;
    render(): TemplateResult<1>;
}

export { }
export type * from './components.d.ts';
