---
name: campshell-budget-tracker
description: Budget Tracker — manage personal finances with accounts, transactions, budgets, and spending categories
version: 1.0.0
---

# Campshell Budget Tracker

A file-based personal finance tracker. Each account, transaction, and budget is a JSON file. Write a file to create, edit to update, delete to remove. A dashboard UI reflects changes in real time.

## Dashboard UI

A real-time dashboard visualizes your finances. Changes appear instantly via WebSocket.

- **URL pattern:** `http://localhost:{port}/budget-tracker` (default port is 4000 — check `campshell-install` or `campshell-start` tool responses for the exact URL)
- **Start the dashboard:** Run `campshell dashboard` or use the Campshell desktop app
- **When to suggest:** After installing the template, after recording transactions, or when the user wants to see their finances

## Data location

Data is managed through MCP tools (`campshell-create-entity`, `campshell-get-entity`, `campshell-update-entity`, `campshell-delete-entity`, `campshell-list-entities`). The data directory is resolved automatically at runtime.

Entity types:
- Accounts: one file per account
- Transactions: one file per transaction
- Budgets: one file per budget
- Categories: collection
- Tags: collection

## Account fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string | yes | ISO 8601 datetime |
| updatedAt | string | no | ISO 8601 datetime |
| name | string | yes | 1–200 characters |
| type | string | yes | `asset`, `expense`, `revenue`, `liability` |
| subType | string | no | `checking`, `savings`, `cash`, `credit-card`, `loan`, `investment`, `mortgage`, `other` |
| currency | string | yes | ISO 4217 code (e.g. `USD`) — must be 3 uppercase letters |
| balance | number | no | Current balance |
| notes | string | no | Max 2000 characters |
| active | boolean | no | Whether account is actively used |

No extra fields allowed.

## Transaction fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string | yes | ISO 8601 datetime |
| updatedAt | string | no | ISO 8601 datetime |
| type | string | yes | `withdrawal`, `deposit`, `transfer` |
| description | string | yes | 1–500 characters |
| amount | number | yes | Must be > 0 (always positive) |
| date | string | yes | Date format `YYYY-MM-DD` |
| sourceAccountId | string | yes | ID of source account |
| destinationAccountId | string | no | Required for transfers |
| categoryId | string | no | Category ID from `categories.json` |
| tagIds | string[] | no | Array of tag IDs, max 10 |
| notes | string | no | Max 2000 characters |

No extra fields allowed.

## Budget fields

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| id | string | yes | `^[a-z0-9-]{2,36}$` |
| createdAt | string | yes | ISO 8601 datetime |
| updatedAt | string | no | ISO 8601 datetime |
| name | string | yes | 1–200 characters |
| categoryId | string | no | Category ID this budget tracks |
| amount | number | yes | Must be > 0 |
| period | string | no | `monthly`, `weekly`, `yearly` |
| startDate | string | no | Date format `YYYY-MM-DD` |
| notes | string | no | Max 2000 characters |

## Complete transaction example

```json
{
  "id": "coffee-mar-10",
  "createdAt": "2026-03-10T08:15:00.000Z",
  "type": "withdrawal",
  "description": "Morning coffee",
  "amount": 5.75,
  "date": "2026-03-10",
  "sourceAccountId": "checking-account",
  "categoryId": "dining"
}
```

## How to record an expense (withdrawal)

Use `campshell-create-entity` with template `"budget-tracker"` and entity `"transactions"`. Provide at least `id`, `type: "withdrawal"`, `description`, `amount`, `date`, `sourceAccountId`, and `createdAt`. The tool validates and returns the created entity or validation errors.

## How to record income (deposit)

Same as withdrawal but set `type: "deposit"`. Use a revenue account as `sourceAccountId` and an asset account as `destinationAccountId`.

## How to record a transfer between accounts

Set `type: "transfer"`, provide both `sourceAccountId` (money leaves) and `destinationAccountId` (money arrives).

## How to update a transaction

Use `campshell-update-entity` with template `"budget-tracker"`, entity `"transactions"`, and the transaction ID. Provide only the fields to change. `updatedAt` is set automatically.

## How to delete a transaction

Use `campshell-delete-entity` with template `"budget-tracker"`, entity `"transactions"`, and the transaction ID.

## Accounts

Read the `accounts/` directory for all accounts. The default set includes:

| ID | Name | Type |
|----|------|------|
| checking-account | Main Checking | asset (checking) |
| savings-account | Emergency Fund | asset (savings) |
| cash-wallet | Cash Wallet | asset (cash) |
| groceries-expense | Groceries | expense |
| salary-revenue | Salary | revenue |
| credit-card-liability | Visa Credit Card | liability |

## Query commands

All output is JSON. Every subcommand accepts `--data-dir <dir>` to override the default.

**List accounts:**
```
npx @campshell/budget-tracker query list accounts [--type <asset|expense|revenue|liability>]
```

**Get a single account:**
```
npx @campshell/budget-tracker query get account <id>
```

**List transactions:**
```
npx @campshell/budget-tracker query list transactions [--type <withdrawal|deposit|transfer>] [--category <id>] [--account <id>] [--from <YYYY-MM-DD>] [--to <YYYY-MM-DD>]
```

**Get a single transaction:**
```
npx @campshell/budget-tracker query get transaction <id>
```

**List budgets with current spending progress:**
```
npx @campshell/budget-tracker query list budgets
```
Returns each budget with `spent`, `remaining`, and `percentUsed` fields for the current month.

**Get a single budget:**
```
npx @campshell/budget-tracker query get budget <id>
```

**List categories:**
```
npx @campshell/budget-tracker query categories
```

**List tags:**
```
npx @campshell/budget-tracker query tags
```

**Monthly summary:**
```
npx @campshell/budget-tracker query summary [--month <YYYY-MM>]
```
Returns `totalIncome`, `totalExpenses`, `netFlow`, and `byCategory` breakdown for the month.

**Search transactions:**
```
npx @campshell/budget-tracker query search <term>
```
Returns matching transactions with `matchedIn` indicating which fields matched.

## Checking for errors

MCP tools validate data automatically. If validation fails, the tool response contains the exact errors. Fix the issue and retry the operation.
