/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, EventEmitter, NgZone } from '@angular/core';

import { ProxyCmp } from './angular-component-lib/utils.js';

import type { Components } from 'lit-components';


@ProxyCmp({
  inputs: ['disabled', 'label', 'variant']
})
@Component({
  selector: 'lit-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['disabled', 'label', 'variant'],
  outputs: ['button-click'],
  standalone: true
})
export class LitButton {
  protected el: HTMLLitButtonElement;
    /**
   * The button label @default 'Click me'
   */
  set label(_: Components.LitButton['label']) {};
    /**
   * The button variant (primary, secondary, danger) @default 'primary'
   */
  set variant(_: Components.LitButton['variant']) {};
    /**
   * Whether the button is disabled @default false
   */
  set disabled(_: Components.LitButton['disabled']) {};
  buttonClick = new EventEmitter<CustomEvent<any>>();
  constructor(@Inject(ChangeDetectorRef) c: ChangeDetectorRef, @Inject(ElementRef) r: ElementRef, @Inject(NgZone) protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface LitButton extends Components.LitButton {
  /**
   * Emitted when button-click event occurs
   */
  'button-click': EventEmitter<CustomEvent<any>>;
}


@ProxyCmp({
  inputs: ['footer', 'header']
})
@Component({
  selector: 'lit-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['footer', 'header'],
  standalone: true
})
export class LitCard {
  protected el: HTMLLitCardElement;
    /**
   *  @default ''
   */
  set header(_: Components.LitCard['header']) {};
    /**
   *  @default ''
   */
  set footer(_: Components.LitCard['footer']) {};
  constructor(@Inject(ChangeDetectorRef) c: ChangeDetectorRef, @Inject(ElementRef) r: ElementRef, @Inject(NgZone) protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface LitCard extends Components.LitCard {}


@ProxyCmp({
  inputs: ['initial', 'step']
})
@Component({
  selector: 'lit-counter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['initial', 'step'],
  outputs: ['count-changed'],
  standalone: true
})
export class LitCounter {
  protected el: HTMLLitCounterElement;
    /**
   *  @default 0
   */
  set initial(_: Components.LitCounter['initial']) {};
    /**
   *  @default 1
   */
  set step(_: Components.LitCounter['step']) {};
  countChanged = new EventEmitter<CustomEvent<any>>();
  constructor(@Inject(ChangeDetectorRef) c: ChangeDetectorRef, @Inject(ElementRef) r: ElementRef, @Inject(NgZone) protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


export declare interface LitCounter extends Components.LitCounter {
  /**
   * Emitted when count-changed event occurs
   */
  'count-changed': EventEmitter<CustomEvent<any>>;
}


