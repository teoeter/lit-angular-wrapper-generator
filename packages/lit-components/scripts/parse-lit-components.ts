import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface ComponentMetadata {
  tagName: string;
  className: string;
  properties: PropertyMetadata[];
  events: EventMetadata[];
  methods: MethodMetadata[];
}

interface PropertyMetadata {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
  isState?: boolean;
}

interface EventMetadata {
  name: string;
  detail: string;
  description?: string;
}

interface MethodMetadata {
  name: string;
  signature: string;
}

/**
 * Parse Lit component files and extract metadata
 */
export class LitComponentParser {
  private program: ts.Program;
  private checker: ts.TypeChecker;

  constructor(private srcDir: string) {
    // Create a TypeScript program
    const configPath = ts.findConfigFile(srcDir, ts.sys.fileExists, 'tsconfig.json');
    if (!configPath) {
      throw new Error('Could not find tsconfig.json');
    }

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    this.checker = this.program.getTypeChecker();
  }

  /**
   * Parse all component files in the source directory
   */
  parseComponents(): ComponentMetadata[] {
    const components: ComponentMetadata[] = [];
    const sourceFiles = this.program.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      if (sourceFile.fileName.includes('node_modules') || sourceFile.fileName.includes('.test.')) {
        continue;
      }

      const component = this.parseComponentFile(sourceFile);
      if (component) {
        components.push(component);
      }
    }

    return components;
  }

  /**
   * Parse a single TypeScript source file
   */
  private parseComponentFile(sourceFile: ts.SourceFile): ComponentMetadata | null {
    let componentMeta: ComponentMetadata | null = null;

    const visit = (node: ts.Node) => {
      // Look for class declarations with @customElement decorator
      if (ts.isClassDeclaration(node) && node.name) {
        const customElementDecorator = this.getCustomElementDecorator(node);
        if (customElementDecorator) {
          const tagName = this.extractTagName(customElementDecorator);
          if (tagName) {
            componentMeta = {
              tagName,
              className: node.name.text,
              properties: this.extractProperties(node),
              events: this.extractEvents(node),
              methods: this.extractMethods(node),
            };
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return componentMeta;
  }

  /**
   * Get the @customElement decorator from a class
   */
  private getCustomElementDecorator(node: ts.ClassDeclaration): ts.Decorator | undefined {
    if (!node.modifiers) return undefined;

    for (const modifier of node.modifiers) {
      if (ts.isDecorator(modifier)) {
        const expression = modifier.expression;
        if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
          if (expression.expression.text === 'customElement') {
            return modifier;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Extract tag name from @customElement decorator
   */
  private extractTagName(decorator: ts.Decorator): string | null {
    const expression = decorator.expression;
    if (ts.isCallExpression(expression) && expression.arguments.length > 0) {
      const arg = expression.arguments[0];
      if (ts.isStringLiteral(arg)) {
        return arg.text;
      }
    }
    return null;
  }

  /**
   * Extract properties from class (decorated with @property or @state)
   */
  private extractProperties(node: ts.ClassDeclaration): PropertyMetadata[] {
    const properties: PropertyMetadata[] = [];

    for (const member of node.members) {
      if (ts.isPropertyDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        const propertyDecorator = this.getPropertyDecorator(member);
        const stateDecorator = this.getStateDecorator(member);

        if (propertyDecorator || stateDecorator) {
          const propName = member.name.text;
          const propType = this.getPropertyType(member);
          const defaultValue = this.getDefaultValue(member);
          const description = this.getJsDocDescription(member);

          properties.push({
            name: propName,
            type: propType,
            defaultValue,
            description,
            isState: !!stateDecorator,
          });
        }
      }
    }

    return properties;
  }

  /**
   * Get @property decorator
   */
  private getPropertyDecorator(node: ts.PropertyDeclaration): ts.Decorator | undefined {
    if (!node.modifiers) return undefined;

    for (const modifier of node.modifiers) {
      if (ts.isDecorator(modifier)) {
        const expression = modifier.expression;
        if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
          if (expression.expression.text === 'property') {
            return modifier;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Get @state decorator
   */
  private getStateDecorator(node: ts.PropertyDeclaration): ts.Decorator | undefined {
    if (!node.modifiers) return undefined;

    for (const modifier of node.modifiers) {
      if (ts.isDecorator(modifier)) {
        const expression = modifier.expression;
        if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
          if (expression.expression.text === 'state') {
            return modifier;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Get property type
   */
  private getPropertyType(node: ts.PropertyDeclaration): string {
    // First check if there's an explicit type annotation
    if (node.type) {
      return node.type.getText();
    }

    // Try to get the type from the decorator
    const propertyDecorator = this.getPropertyDecorator(node);
    if (propertyDecorator && ts.isCallExpression(propertyDecorator.expression)) {
      const args = propertyDecorator.expression.arguments;
      if (args.length > 0 && ts.isObjectLiteralExpression(args[0])) {
        for (const prop of args[0].properties) {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'type') {
            // Extract constructor type (e.g., String, Number, Boolean)
            if (ts.isIdentifier(prop.initializer)) {
              const constructorName = prop.initializer.text;
              return this.constructorToType(constructorName);
            }
          }
        }
      }
    }

    // Fall back to inferring from initializer
    if (node.initializer) {
      const type = this.checker.getTypeAtLocation(node.initializer);
      const typeString = this.checker.typeToString(type);

      // Don't return literal types, widen to their base types
      if (typeString.match(/^".*"$/)) {
        return 'string';
      }
      if (typeString.match(/^\d+$/)) {
        return 'number';
      }
      if (typeString === 'true' || typeString === 'false') {
        return 'boolean';
      }

      return typeString;
    }

    return 'any';
  }

  /**
   * Convert constructor name to TypeScript type
   */
  private constructorToType(constructor: string): string {
    const typeMap: Record<string, string> = {
      'String': 'string',
      'Number': 'number',
      'Boolean': 'boolean',
      'Array': 'any[]',
      'Object': 'object',
    };
    return typeMap[constructor] || 'any';
  }

  /**
   * Get default value of a property
   */
  private getDefaultValue(node: ts.PropertyDeclaration): string | undefined {
    if (node.initializer) {
      return node.initializer.getText();
    }
    return undefined;
  }

  /**
   * Extract events dispatched in the component
   */
  private extractEvents(node: ts.ClassDeclaration): EventMetadata[] {
    const events: EventMetadata[] = [];
    const eventMap = new Map<string, string>();

    const visit = (node: ts.Node) => {
      // Look for: this.dispatchEvent(new CustomEvent('event-name', { detail: { ... } }))
      if (ts.isNewExpression(node)) {
        const expression = node.expression;
        if (ts.isIdentifier(expression) && expression.text === 'CustomEvent') {
          if (node.arguments && node.arguments.length > 0) {
            const eventName = node.arguments[0];
            if (ts.isStringLiteral(eventName)) {
              const name = eventName.text;

              // Try to extract detail type
              let detailType = 'any';
              if (node.arguments.length > 1) {
                const config = node.arguments[1];
                if (ts.isObjectLiteralExpression(config)) {
                  for (const prop of config.properties) {
                    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                      if (prop.name.text === 'detail') {
                        detailType = this.inferDetailType(prop.initializer);
                      }
                    }
                  }
                }
              }

              eventMap.set(name, detailType);
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(node);

    eventMap.forEach((detail, name) => {
      events.push({ name, detail });
    });

    return events;
  }

  /**
   * Infer the type of event detail
   */
  private inferDetailType(node: ts.Expression): string {
    if (ts.isObjectLiteralExpression(node)) {
      const properties = node.properties
        .map((prop) => {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            const type = this.checker.getTypeAtLocation(prop.initializer);
            return `${prop.name.text}: ${this.checker.typeToString(type)}`;
          }
          return null;
        })
        .filter(Boolean);

      return `{ ${properties.join(', ')} }`;
    }

    const type = this.checker.getTypeAtLocation(node);
    return this.checker.typeToString(type);
  }

  /**
   * Extract public methods from the class
   */
  private extractMethods(node: ts.ClassDeclaration): MethodMetadata[] {
    const methods: MethodMetadata[] = [];

    for (const member of node.members) {
      if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
        // Skip private methods
        const isPrivate = member.modifiers?.some(
          (mod) => mod.kind === ts.SyntaxKind.PrivateKeyword
        );

        // Skip lifecycle methods
        const lifecycleMethods = ['connectedCallback', 'disconnectedCallback', 'attributeChangedCallback', 'render'];
        const methodName = member.name.text;

        if (!isPrivate && !lifecycleMethods.includes(methodName) && !methodName.startsWith('_')) {
          const signature = this.getMethodSignature(member);
          methods.push({
            name: methodName,
            signature,
          });
        }
      }
    }

    return methods;
  }

  /**
   * Get method signature as string
   */
  private getMethodSignature(node: ts.MethodDeclaration): string {
    const params = node.parameters.map((param) => {
      const paramName = param.name.getText();
      const paramType = param.type ? param.type.getText() : 'any';
      const optional = param.questionToken ? '?' : '';
      return `${paramName}${optional}: ${paramType}`;
    }).join(', ');

    const returnType = node.type ? node.type.getText() : 'void';
    return `(${params}) => ${returnType}`;
  }

  /**
   * Extract JSDoc description
   */
  private getJsDocDescription(node: ts.Node): string | undefined {
    const jsDoc = (node as any).jsDoc;
    if (jsDoc && jsDoc.length > 0) {
      const comment = jsDoc[0].comment;
      if (typeof comment === 'string') {
        return comment;
      }
    }
    return undefined;
  }
}
