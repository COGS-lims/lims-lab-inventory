/** @type {import('jest').Config} */
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>"],

    testMatch: [
        "**/__tests__/**/*.test.ts",
        "**/__tests__/**/*.spec.ts",
        "**/.test.ts",
        "**/.spec.ts",
    ],

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },

    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

    collectCoverageFrom: [
        "app/*/.ts",
        "app/*/.tsx",
        "services/*/.ts",
        "models/*/.ts",
        "lib/*/.ts",
        "!*/.d.ts",
        "!*/node_modules/*",
        "!*/.next/*",
        "!*/coverage/*",
    ],

    coveragePathIgnorePatterns: ["/node_modules/", "/.next/", "/coverage/"],

    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: {
                    jsx: "react",
                    esModuleInterop: true,
                },
            },
        ],
    },

    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testTimeout: 10000,
    verbose: true,
};

module.exports = config;
