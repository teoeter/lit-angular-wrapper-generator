# Lit Components AST Parser and Type Generator

This directory contains build-time scripts that parse Lit components and generate a Stencil-compatible `components.d.ts` file.

## Purpose

The Angular output target generator for Stencil (`packages/angular-generator`) requires a `components.d.ts` file to generate Angular wrapper components. This AST parser enables Lit components to be consumed by the same Angular generator infrastructure used for Stencil components.

## Architecture

### Files

- **`parse-lit-components.ts`** - TypeScript AST parser that extracts metadata from Lit component files
- **`generate-components-dts.ts`** - Generator that creates Stencil-format `components.d.ts` from parsed metadata
- **`build.ts`** - Main build script that orchestrates parsing and generation
- **`tsconfig.json`** - TypeScript configuration for the build scripts

### How It Works

1. **Parsing Phase** (`LitComponentParser`)
   - Creates a TypeScript program from source files
   - Traverses the AST to find classes decorated with `@customElement`
   - Extracts:
     - Tag names from `@customElement('tag-name')`
     - Properties decorated with `@property` (public props)
     - Properties decorated with `@state` (internal state - excluded from types)
     - Custom events from `dispatchEvent(new CustomEvent(...))`
     - Public methods (excluding lifecycle methods and private methods)
     - JSDoc comments and default values

2. **Type Inference**
   - Explicit type annotations: `@property({ type: String })` → `string`
   - Inferred from initializers: `initial = 0` → `number`
   - Widens literal types to base types (e.g., `"hello"` → `string`)

3. **Generation Phase** (`ComponentsDtsGenerator`)
   - Creates Stencil-compatible TypeScript definitions:
     - `Components` namespace - Component property interfaces
     - `CustomEvent` interfaces for components with events
     - Global HTML element interfaces with proper event listener overloads
     - `LocalJSX` namespace - JSX property interfaces (all optional)
     - `HTMLElementTagNameMap` - Tag name to element type mapping
     - Lit module augmentation for JSX support

## Output Format

The generated `components.d.ts` follows the same structure as Stencil's auto-generated types:

```typescript
export namespace Components {
    interface ComponentName {
        "propName": propType;
    }
}

export interface ComponentNameCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLComponentNameElement;
}

declare global {
    interface HTMLComponentNameElement extends Components.ComponentName, HTMLElement {
        addEventListener<K extends keyof HTMLComponentNameElementEventMap>(...): void;
        // ... event listener overloads
    }

    interface HTMLElementTagNameMap {
        "tag-name": HTMLComponentNameElement;
    }
}

declare namespace LocalJSX {
    interface ComponentName {
        "propName"?: propType;
        "onEventName"?: (event: ComponentNameCustomEvent<EventDetail>) => void;
    }
}
```

## Usage

The parser runs automatically during build:

```bash
# Run full build (TypeScript compilation + components.d.ts generation)
pnpm build

# Run only TypeScript compilation
pnpm build:types

# Run only components.d.ts generation
pnpm build:components-dts
```

## Integration with Angular Generator

The generated `components.d.ts` can be consumed by the Stencil Angular output target:

1. Configure the output target in a config file (e.g., `lit.config.ts`):

```typescript
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config = {
  outputTargets: [
    angularOutputTarget({
      componentCorePackage: 'lit-components',
      directivesProxyFile: '../angular-wrappers/src/directives/proxies.ts',
      outputType: 'standalone',
    }),
  ],
};
```

2. The Angular generator will read `dist/components.d.ts` and generate Angular wrapper components with:
   - Property bindings
   - Event emitters
   - Type safety
   - Angular Language Service support

## Supported Features

### ✅ Supported

- `@customElement` decorator for tag names
- `@property` decorator for public properties
- `@state` decorator (excluded from public API)
- Type inference from decorators and initializers
- Custom events via `dispatchEvent(new CustomEvent(...))`
- Event detail type inference
- Public methods
- JSDoc comments
- Default values

### ⚠️ Limitations

- Complex event detail types may be inferred as `any` if structure cannot be determined
- Method signatures without explicit types will default to `any`
- Slots are not explicitly typed (handled by HTML standards)
- Inherited properties from base classes (other than LitElement) are not extracted

## Extending the Parser

To add support for additional metadata:

1. Add new metadata fields to interfaces in `parse-lit-components.ts`
2. Implement extraction logic in `LitComponentParser` class
3. Update `ComponentsDtsGenerator` to emit the new metadata in the output

## Example

Given this Lit component:

```typescript
@customElement('lit-counter')
export class LitCounter extends LitElement {
  @property({ type: Number })
  initial = 0;

  @state()
  private count = 0;

  increment() {
    this.count++;
    this.dispatchEvent(new CustomEvent('count-changed', {
      detail: { count: this.count }
    }));
  }
}
```

The parser generates:

```typescript
export namespace Components {
    interface LitCounter {
        "initial": number;
    }
}

export interface LitCounterCustomEvent<T> extends CustomEvent<T> {
    detail: T;
    target: HTMLLitCounterElement;
}

declare global {
    interface HTMLLitCounterElement extends Components.LitCounter, HTMLElement {
        addEventListener<K extends keyof HTMLLitCounterElementEventMap>(...): void;
    }

    interface HTMLLitCounterElementEventMap {
        "count-changed": { count: number };
    }
}

declare namespace LocalJSX {
    interface LitCounter {
        "initial"?: number;
        "onCountChanged"?: (event: LitCounterCustomEvent<{ count: number }>) => void;
    }
}
```
