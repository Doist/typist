# Testing

## Strategy

- **Unit tests** - Pure logic: utilities, helpers, transformations. No rendering.
- **Component tests** - See [react-guidelines/testing.md](../react-guidelines/testing.md) for React Testing Library patterns.
- **Hook tests** - `renderHook` with wrappers for Router/Redux context.
- **Integration tests** - MSW to mock network requests at the service worker level.
- **Keep suites lean** - Test observable behavior, not implementation details.

## File Naming

Test files are colocated with their source files:

```
task-list.tsx
task-list.test.tsx
use-task-filters.ts
use-task-filters.test.ts
```

## API Mocking with MSW

Mock at the network level using MSW. The server is set up globally in test framework setup — don't call `mswServer.listen()` or `mswServer.close()` in individual tests.

```typescript
import { http, HttpResponse } from 'msw'
import { mswServer } from 'src/mocks/msw-server'

test('displays projects from API', async () => {
    mswServer.use(
        http.get('/api/projects', () => {
            return HttpResponse.json([
                { id: '1', name: 'Work' },
                { id: '2', name: 'Personal' },
            ])
        }),
    )

    render(<ProjectList />)

    expect(await screen.findByText('Work')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
})
```

## Rules

- **Mock at network level** - Use MSW, not function mocks on API modules
- **No `mswServer.listen()` / `mswServer.close()`** - MSW is set up globally; use `mswServer.use()` for per-test overrides
- **One assertion focus per test** - Each test should verify one behavior, though multiple `expect` calls for that behavior are fine

## CI

```bash
npm run check        # TypeScript + ESLint + Biome
npm run test -- --ci # Jest with CI reporter
```
