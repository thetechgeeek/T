# Screen Integration Tests

These tests verify screen-level integration behaviour — store interactions,
navigation, and user flows — using `@testing-library/react-native`.

## Setup

```bash
npx expo install @testing-library/react-native
```

Add to `jest.config.js`:

```js
testEnvironment: 'jsdom',  // for UI tests
setupFiles: ['@testing-library/react-native/extend-expect'],
```

## Test inventory

| File                         | Screen                           | Coverage goals                                    |
| ---------------------------- | -------------------------------- | ------------------------------------------------- |
| `InvoicesScreen.test.tsx`    | `app/(app)/(tabs)/invoices.tsx`  | Renders list, pull-to-refresh, navigate to detail |
| `InventoryScreen.test.tsx`   | `app/(app)/(tabs)/inventory.tsx` | Category filter, search, empty state              |
| `InvoiceCreateFlow.test.tsx` | Invoice create wizard            | Step navigation, validation, submit               |
| `OrdersScreen.test.tsx`      | `app/(app)/orders/index.tsx`     | List render, pull-to-refresh                      |
| `ExpensesScreen.test.tsx`    | `app/(app)/finance/expenses.tsx` | Add expense modal, form validation                |
| `CustomerAddScreen.test.tsx` | `app/(app)/customers/add.tsx`    | Form submit, error handling                       |
