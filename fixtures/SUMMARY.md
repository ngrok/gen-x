# Fixture Summary

## Directory Structure

```
fixtures/
├── basic-typescript/          # Simple flat TypeScript library
├── nested-structure/          # Nested dirs with index files
├── react-components/          # React component library (directory-based)
├── monorepo-live-types/       # Custom conditions for live types
├── protobuf-codegen/          # Replace patterns (_pb removal)
└── multiple-extensions/       # Various file extensions (.ts, .tsx, .js, .jsx, .mjs, .cjs)
```

## Fixture Details

### 1. basic-typescript

**Purpose:** Basic TypeScript library with flat structure  
**Features:**

- Root index.ts file
- Multiple top-level modules (logger, utils)
- Test files that should be excluded
- Simple use case for most projects

**Command:**

```bash
cd fixtures/basic-typescript
npx tsx ../../src/cli.ts
```

### 2. nested-structure

**Purpose:** Library with nested directories and index files  
**Features:**

- Multiple levels of nesting (lib/helpers/)
- Index files at each level that re-export
- Tests index flattening behavior
- Realistic for larger libraries

**Command:**

```bash
cd fixtures/nested-structure
npx tsx ../../src/cli.ts
```

### 3. react-components

**Purpose:** React component library with directory-based organization  
**Features:**

- Component-per-directory pattern (Button/index.tsx)
- TSX files
- Common React library structure
- Index flattening: `components/Button/index.tsx` → `./components/Button`

**Command:**

```bash
cd fixtures/react-components
npx tsx ../../src/cli.ts
```

### 4. monorepo-live-types

**Purpose:** Monorepo package using custom conditions for live types  
**Features:**

- Custom condition: `@acme/monorepo-pkg/source`
- Allows consuming packages in the same monorepo to use source .ts files
- See: https://colinhacks.com/essays/live-types-typescript-monorepo

**Command:**

```bash
cd fixtures/monorepo-live-types
npx tsx ../../src/cli.ts --customCondition "@acme/monorepo-pkg/source"
```

### 5. protobuf-codegen

**Purpose:** gRPC client with generated protobuf code  
**Features:**

- Replace patterns to remove `_pb` suffix
- `user_pb.ts` → export key `./proto/user`
- Common in protobuf/gRPC codegen scenarios

**Command:**

```bash
cd fixtures/protobuf-codegen
npx tsx ../../src/cli.ts --replace "/_pb/:=>"
```

### 6. multiple-extensions

**Purpose:** Package with various JavaScript/TypeScript file extensions  
**Features:**

- .ts, .tsx (TypeScript)
- .js, .jsx (JavaScript)
- .mjs (ES Module)
- .cjs (CommonJS)
- Tests that all extensions are properly handled

**Command:**

```bash
cd fixtures/multiple-extensions
npx tsx ../../src/cli.ts
```

## Testing Strategy

Each fixture has:

1. `package.json` - Original state before gen-x
2. `package.json.expected` - Expected state after gen-x
3. `src/` - Source files to generate exports from

To test a fixture:

```bash
cd fixtures/<fixture-name>
npx tsx ../../src/cli.ts [options]
diff package.json.expected package.json
```

To reset a fixture (restore original package.json):

```bash
git restore fixtures/<fixture-name>/package.json
```

## Adding New Fixtures

1. Create a new directory: `fixtures/my-fixture/`
2. Add `src/` with source files
3. Add `package.json` (original state)
4. Run gen-x to generate exports
5. Copy result to `package.json.expected`
6. Update this summary
