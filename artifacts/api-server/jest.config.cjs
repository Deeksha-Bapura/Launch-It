/**
 * Jest + TypeScript for an ESM package ("type": "module").
 * Run with:  NODE_OPTIONS=--experimental-vm-modules npx jest
 * (the "test" script in package.json below already does this)
 */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    // lets "../lib/foo.js"-style imports resolve to the .ts file
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: { isolatedModules: true } }],
  },
  testTimeout: 20000,
};
