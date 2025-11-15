import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
// import stylistic from '@stylistic/eslint-plugin';
// import importPlugin from 'eslint-plugin-import';

export default [
    js.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    {
        ignores: [
            "vite.config.js",
            "**/*.spec.ts", // TODO: Remove me
        ],
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },

        plugins: {
            // '@stylistic': stylistic,
            // 'import': importPlugin,
        },

        files: [
            '**/*.ts',
        ],

        rules: {
            "no-unused-vars": 0,
            // "@stylistic/array-bracket-spacing": ["error", "always"],
            // "@stylistic/brace-style": ["error", "stroustrup"],
            // "@stylistic/comma-dangle": ["error", "always-multiline"],
            // "@stylistic/no-multi-spaces": "error",
            // "@stylistic/no-tabs": "error",
            // "@stylistic/no-trailing-spaces": "error",
            "@typescript-eslint/adjacent-overload-signatures": 0,
            "@typescript-eslint/explicit-module-boundary-types": 0, // We don't want to specify ": void" everywhere
            "@typescript-eslint/naming-convention": [
                "error",
                { selector: ["class", "enum", "interface", "typeAlias"], format: ["PascalCase"] },
                { selector: "classicAccessor", format: ["camelCase", "UPPER_CASE"], leadingUnderscore: "forbid" },
                { selector: "classProperty", modifiers: ["readonly"], format: ["camelCase", "UPPER_CASE"], leadingUnderscore: "forbid" },
                { selector: "default", format: ["camelCase", "snake_case"] },
                { selector: "enumMember", format: ["UPPER_CASE"] },
                { selector: "import", format: ["camelCase", "PascalCase"] },
                { selector: "objectLiteralProperty", format: ["camelCase", "UPPER_CASE"], leadingUnderscore: "forbid" },
                { selector: "typeParameter", format: ["PascalCase"] },
                { selector: "variable", modifiers: ["const"], format: ["camelCase", "UPPER_CASE"] },
            ],
            "@typescript-eslint/no-empty-function": 0,
            "@typescript-eslint/no-explicit-any": 0, // TODO: Remove me
            "@typescript-eslint/no-non-null-assertion": 0, // TODO: Remove me
            // TODO: Re-enable when "any" situation is addressed
            "@typescript-eslint/no-unnecessary-condition": 0,
            //"@typescript-eslint/no-unnecessary-condition": ["error", { "allowConstantLoopConditions": true }],
            "@typescript-eslint/no-unused-vars": 0,
            "@typescript-eslint/no-unsafe-assignment": 0, // TODO: Remove me
            "@typescript-eslint/no-unsafe-member-access": 0, // TODO: Remove me
            "@typescript-eslint/prefer-readonly": "error",
            "@typescript-eslint/restrict-template-expressions": ["error", { "allowNumber": true }],
            // "import/no-default-export": "error",
            // "import/no-duplicates": "error",
            // "import/no-relative-packages": "error",
            // "import/order": "error",
            //indent: ["error", 4, {"SwitchCase": 1}],
            "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
            "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
            semi: "off",
            "space-before-function-paren": ["error", "never"],
        },
    },
];
