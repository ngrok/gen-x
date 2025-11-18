# Test Fixtures

Real-world example projects used for e2e testing.

Each fixture directory represents a complete project with:

- `src/` directory with source files
- `package.json` (input state before running gen-x)
- `package.json.expected` (expected state after running gen-x)

## Fixtures

### basic-typescript

Simple TypeScript library with flat structure.

### nested-structure

Project with nested directories and index files.

### react-components

Component library using directory-based organization (Button/index.tsx style).

### monorepo-live-types

Monorepo setup using custom conditions for live TypeScript types.

### protobuf-codegen

Generated code scenario requiring replace patterns (e.g., removing `_pb` suffix).

### multiple-extensions

Project with various file extensions (.ts, .tsx, .js, .jsx, .mjs, .cjs).

## Usage

Run gen-x against a fixture:

```bash
cd fixtures/basic-typescript
npx tsx ../../src/cli.ts
```

Compare output:

```bash
diff package.json package.json.expected
```
