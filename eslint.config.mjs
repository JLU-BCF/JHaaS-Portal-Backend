// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    {
        name: 'jhaas-rules',
        files: ["src/**/*.ts"],
        ignores: ["src/database-migrations/**/*"],
        rules: {
            "eol-last": ["error", "always"],
            quotes: ["error", "single"],
            semi: ["error", "always"],

            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "(next|res|req)",
                varsIgnorePattern: "(next|res|req)",
            }],

            "@typescript-eslint/no-unused-expressions": ["error", {
                allowShortCircuit: true,
                allowTernary: true
            }],

            indent: ["error", 2, {
                ignoredNodes: [
                    "FunctionExpression > .params[decorators.length > 0]",
                    "FunctionExpression > .params > :matches(Decorator, :not(:first-child))",
                    "ClassBody.body > PropertyDefinition[decorators.length > 0] > .key",
                ],

                SwitchCase: 1,
                flatTernaryExpressions: true,
            }]
        }
    }
);

