/**
 * Adapter to convert Lit component metadata to Stencil ComponentCompilerMeta format
 * This allows the Stencil Angular output target to consume Lit components
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// Stencil internal types (minimal subset needed for angular-generator)
export interface ComponentCompilerMeta {
  tagName: string;
  componentClassName: string;
  properties: ComponentCompilerProperty[];
  events: ComponentCompilerEvent[];
  methods: ComponentCompilerMethod[];
  encapsulation?: 'shadow' | 'scoped' | 'none';
  internal?: boolean;
}

export interface ComponentCompilerProperty {
  name: string;
  type: string;
  mutable: boolean;
  optional: boolean;
  required: boolean;
  attribute?: string;
  reflect: boolean;
  docs: {
    text: string;
    tags: { name: string; text: string }[];
  };
  defaultValue?: string;
  complexType?: {
    original: string;
    resolved: string;
    references: any;
  };
}

export interface ComponentCompilerEvent {
  name: string;
  method: string;
  bubbles: boolean;
  cancelable: boolean;
  composed: boolean;
  docs: {
    text: string;
    tags: { name: string; text: string }[];
  };
  complexType?: {
    original: string;
    resolved: string;
    references: any;
  };
  internal?: boolean;
}

export interface ComponentCompilerMethod {
  name: string;
  returns: {
    type: string;
    docs: string;
  };
  complexType?: {
    signature: string;
    parameters: any[];
    references: any;
    return: string;
  };
  docs: {
    text: string;
    tags: { name: string; text: string }[];
  };
  internal?: boolean;
}

interface LitComponentMetadata {
  tagName: string;
  className: string;
  properties: LitPropertyMetadata[];
  events: LitEventMetadata[];
  methods: LitMethodMetadata[];
}

interface LitPropertyMetadata {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
  isState?: boolean;
}

interface LitEventMetadata {
  name: string;
  detail: string;
  description?: string;
}

interface LitMethodMetadata {
  name: string;
  signature: string;
}

/**
 * Parse components.d.ts to extract component metadata
 */
export class ComponentsDtsParser {
  private program: ts.Program;
  private sourceFile: ts.SourceFile;

  constructor(private componentsFilePath: string) {
    if (!fs.existsSync(componentsFilePath)) {
      throw new Error(`components.d.ts not found at: ${componentsFilePath}`);
    }

    // Create a simple TypeScript program to parse the .d.ts file
    this.program = ts.createProgram([componentsFilePath], {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
    });

    const sourceFile = this.program.getSourceFile(componentsFilePath);
    if (!sourceFile) {
      throw new Error(`Failed to load source file: ${componentsFilePath}`);
    }
    this.sourceFile = sourceFile;
  }

  /**
   * Parse all components from components.d.ts
   */
  parseComponents(): LitComponentMetadata[] {
    const components: LitComponentMetadata[] = [];
    const componentsNamespace = this.findComponentsNamespace();

    if (!componentsNamespace) {
      console.warn('Components namespace not found in components.d.ts');
      return [];
    }

    const eventMap = this.extractEventMap();
    const tagNameMap = this.extractTagNameMap();

    if (process.env.DEBUG) {
      console.log('Tag name map:', tagNameMap);
      console.log('Event map:', eventMap);
    }

    for (const statement of componentsNamespace.body.statements) {
      if (ts.isInterfaceDeclaration(statement) && statement.name) {
        const className = statement.name.text;
        const tagName = tagNameMap.get(className);

        if (process.env.DEBUG) {
          console.log(`Checking class: ${className}, found tagName: ${tagName}`);
        }

        if (tagName) {
          const properties = this.extractPropertiesFromInterface(statement);
          const events = eventMap.get(className) || [];

          components.push({
            tagName,
            className,
            properties,
            events,
            methods: [], // Methods are not critical for Angular wrappers
          });
        }
      }
    }

    return components;
  }

  /**
   * Find the Components namespace
   */
  private findComponentsNamespace(): ts.ModuleDeclaration | null {
    for (const statement of this.sourceFile.statements) {
      if (ts.isModuleDeclaration(statement) &&
          statement.name.text === 'Components' &&
          statement.body &&
          ts.isModuleBlock(statement.body)) {
        return statement;
      }
    }
    return null;
  }

  /**
   * Extract event map from components.d.ts
   */
  private extractEventMap(): Map<string, LitEventMetadata[]> {
    const eventMap = new Map<string, LitEventMetadata[]>();

    // Look for global declarations
    for (const statement of this.sourceFile.statements) {
      if (ts.isModuleDeclaration(statement) && statement.flags & ts.NodeFlags.GlobalAugmentation) {
        const globalBody = statement.body;
        if (globalBody && ts.isModuleBlock(globalBody)) {
          for (const globalStatement of globalBody.statements) {
            // Find event map interfaces (e.g., HTMLLitCounterElementEventMap)
            if (ts.isInterfaceDeclaration(globalStatement) &&
                globalStatement.name &&
                globalStatement.name.text &&
                globalStatement.name.text.endsWith('ElementEventMap')) {

              const className = globalStatement.name.text
                .replace('HTML', '')
                .replace('ElementEventMap', '');

              const events: LitEventMetadata[] = [];
              for (const member of globalStatement.members) {
                if (ts.isPropertySignature(member) && member.name && ts.isStringLiteral(member.name)) {
                  const eventName = member.name.text;
                  // For now, use 'any' for event details
                  // TODO: Parse event detail types from the .d.ts file
                  const detail = 'any';
                  events.push({ name: eventName, detail });
                }
              }

              eventMap.set(className, events);
            }
          }
        }
      }
    }

    return eventMap;
  }

  /**
   * Extract tag name to class name mapping from HTMLElementTagNameMap
   */
  private extractTagNameMap(): Map<string, string> {
    const tagNameMap = new Map<string, string>();

    for (const statement of this.sourceFile.statements) {
      if (ts.isModuleDeclaration(statement) && statement.flags & ts.NodeFlags.GlobalAugmentation) {
        const globalBody = statement.body;
        if (globalBody && ts.isModuleBlock(globalBody)) {
          for (const globalStatement of globalBody.statements) {
            if (process.env.DEBUG && ts.isInterfaceDeclaration(globalStatement) && globalStatement.name) {
              console.log('Found interface:', globalStatement.name.text);
            }

            if (ts.isInterfaceDeclaration(globalStatement) &&
                globalStatement.name &&
                globalStatement.name.text === 'HTMLElementTagNameMap') {

              if (process.env.DEBUG) {
                console.log('Processing HTMLElementTagNameMap with', globalStatement.members.length, 'members');
              }

              for (const member of globalStatement.members) {
                if (process.env.DEBUG) {
                  console.log('Member:', {
                    isPropertySignature: ts.isPropertySignature(member),
                    hasName: !!member.name,
                    isStringLiteral: member.name && ts.isStringLiteral(member.name),
                    hasType: !!member.type,
                    isTypeRef: member.type && ts.isTypeReferenceNode(member.type),
                    hasTypeName: member.type && ts.isTypeReferenceNode(member.type) && !!(member.type as ts.TypeReferenceNode).typeName,
                    isIdentifier: member.type && ts.isTypeReferenceNode(member.type) && ts.isIdentifier((member.type as ts.TypeReferenceNode).typeName),
                  });
                }

                if (ts.isPropertySignature(member) &&
                    member.name &&
                    ts.isStringLiteral(member.name) &&
                    member.type &&
                    ts.isTypeReferenceNode(member.type) &&
                    ts.isIdentifier(member.type.typeName)) {

                  const tagName = member.name.text;
                  // Use .text property directly instead of getText() which needs source file context
                  const elementType = (member.type.typeName as ts.Identifier).text;
                  const className = elementType.replace('HTML', '').replace('Element', '');
                  tagNameMap.set(className, tagName);
                  if (process.env.DEBUG) {
                    console.log(`Mapped: ${tagName} -> ${className}`);
                  }
                }
              }
            }
          }
        }
      }
    }

    return tagNameMap;
  }

  /**
   * Extract properties from interface
   */
  private extractPropertiesFromInterface(interfaceDecl: ts.InterfaceDeclaration): LitPropertyMetadata[] {
    const properties: LitPropertyMetadata[] = [];

    for (const member of interfaceDecl.members) {
      if (ts.isPropertySignature(member) && member.name && ts.isStringLiteral(member.name)) {
        const name = member.name.text;
        // Use type checker or fallback to 'any'
        let type = 'any';
        if (member.type) {
          try {
            type = this.checker.typeToString(this.checker.getTypeAtLocation(member.type));
          } catch (e) {
            // If checker doesn't work, try to get a simple type string
            if (ts.isTypeReferenceNode(member.type) && ts.isIdentifier(member.type.typeName)) {
              type = (member.type.typeName as ts.Identifier).text;
            } else {
              // Map TypeScript syntax kinds to type names
              switch (member.type.kind) {
                case ts.SyntaxKind.StringKeyword:
                  type = 'string';
                  break;
                case ts.SyntaxKind.NumberKeyword:
                  type = 'number';
                  break;
                case ts.SyntaxKind.BooleanKeyword:
                  type = 'boolean';
                  break;
                default:
                  type = 'any';
              }
            }
          }
        }

        // Extract JSDoc
        let description: string | undefined;
        let defaultValue: string | undefined;

        const jsDoc = (member as any).jsDoc;
        if (jsDoc && jsDoc.length > 0) {
          const comment = jsDoc[0].comment;
          if (typeof comment === 'string') {
            description = comment;
          }

          // Extract @default tag
          const tags = jsDoc[0].tags;
          if (tags) {
            for (const tag of tags) {
              if (tag.tagName.text === 'default') {
                defaultValue = tag.comment;
              }
            }
          }
        }

        properties.push({
          name,
          type,
          description,
          defaultValue,
          isState: false,
        });
      }
    }

    return properties;
  }
}

/**
 * Convert Lit component metadata to Stencil ComponentCompilerMeta format
 */
export class LitToStencilAdapter {
  static convertComponents(litComponents: LitComponentMetadata[]): ComponentCompilerMeta[] {
    return litComponents.map(comp => this.convertComponent(comp));
  }

  static convertComponent(litComp: LitComponentMetadata): ComponentCompilerMeta {
    return {
      tagName: litComp.tagName,
      componentClassName: litComp.className,
      properties: litComp.properties.map(prop => this.convertProperty(prop)),
      events: litComp.events.map(event => this.convertEvent(event, litComp.tagName)),
      methods: litComp.methods.map(method => this.convertMethod(method)),
      encapsulation: 'shadow', // Lit uses shadow DOM by default
      internal: false,
    };
  }

  static convertProperty(litProp: LitPropertyMetadata): ComponentCompilerProperty {
    return {
      name: litProp.name,
      type: litProp.type,
      mutable: true,
      optional: true,
      required: false,
      attribute: this.toAttribute(litProp.name),
      reflect: false,
      docs: {
        text: litProp.description || '',
        tags: litProp.defaultValue
          ? [{ name: 'default', text: litProp.defaultValue }]
          : [],
      },
      defaultValue: litProp.defaultValue,
      complexType: {
        original: litProp.type,
        resolved: litProp.type,
        references: {},
      },
    };
  }

  static convertEvent(litEvent: LitEventMetadata, tagName: string): ComponentCompilerEvent {
    return {
      name: litEvent.name,
      method: this.eventNameToMethod(litEvent.name),
      bubbles: true,
      cancelable: true,
      composed: true,
      docs: {
        text: litEvent.description || `Emitted when ${litEvent.name} event occurs`,
        tags: [],
      },
      complexType: {
        original: litEvent.detail,
        resolved: litEvent.detail,
        references: {},
      },
      internal: false,
    };
  }

  static convertMethod(litMethod: LitMethodMetadata): ComponentCompilerMethod {
    return {
      name: litMethod.name,
      returns: {
        type: 'void',
        docs: '',
      },
      complexType: {
        signature: litMethod.signature,
        parameters: [],
        references: {},
        return: 'void',
      },
      docs: {
        text: '',
        tags: [],
      },
      internal: false,
    };
  }

  /**
   * Convert camelCase to kebab-case attribute name
   */
  private static toAttribute(propName: string): string {
    return propName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  /**
   * Convert event name to method name (e.g., 'count-changed' -> 'countChanged')
   */
  private static eventNameToMethod(eventName: string): string {
    return eventName
      .split('-')
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
      )
      .join('');
  }
}

/**
 * Load and convert components from components.d.ts
 */
export async function loadComponentsFromDts(componentsFilePath: string): Promise<ComponentCompilerMeta[]> {
  const parser = new ComponentsDtsParser(componentsFilePath);
  const litComponents = parser.parseComponents();
  return LitToStencilAdapter.convertComponents(litComponents);
}
