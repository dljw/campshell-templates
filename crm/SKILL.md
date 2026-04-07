# Campshell CRM

Minimalist CRM for tracking contacts, deals, and activities.

## Entities

### Contacts (one-per-file)
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | yes | max 200 |
| email | email | no | |
| phone | string | no | max 50 |
| company | string | no | max 200 |
| notes | string | no | max 5000 |

### Deals (one-per-file)
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | yes | max 300 |
| contactId | ref | no | references contacts |
| value | number | no | min 0 |
| stage | enum | yes | lead, proposal, won, lost |
| closeDate | date | no | ISO date |
| notes | string | no | max 5000 |

### Activities (one-per-file)
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| title | string | yes | max 500 |
| type | enum | no | call, email, meeting, note |
| contactId | ref | no | references contacts |
| dealId | ref | no | references deals |
| date | datetime | yes | ISO datetime |
| notes | string | no | max 5000 |

## Query Commands

```bash
# Contacts
campshell-crm query list-contacts
campshell-crm query get-contact <id>

# Deals
campshell-crm query list-deals
campshell-crm query list-deals --stage proposal
campshell-crm query list-deals --contact alice-johnson
campshell-crm query get-deal <id>

# Activities
campshell-crm query list-activities
campshell-crm query list-activities --type call
campshell-crm query list-activities --contact alice-johnson
campshell-crm query list-activities --deal acme-platform

# Pipeline summary
campshell-crm query pipeline

# Search
campshell-crm query search "acme"
```

## Data Location

Data is managed through MCP tools (`campshell-create-entity`, `campshell-get-entity`, `campshell-update-entity`, `campshell-delete-entity`, `campshell-list-entities`). The data directory is resolved automatically at runtime.

Entity types:
- Contacts: one file per contact
- Deals: one file per deal
- Activities: one file per activity

## Writing Data

To create or update an entity, use the `campshell-create-entity` or `campshell-update-entity` MCP tools. Each entity requires all required fields plus `id` and `createdAt`. The `id` must match the pattern `^[a-z0-9-]{8,36}$`.

Example — create a contact:
```json
{
  "id": "jane-smith-01",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "company": "Acme Corp",
  "createdAt": "2026-04-04T10:00:00.000Z"
}
```

Example — create a deal:
```json
{
  "id": "website-deal",
  "title": "Website Redesign",
  "contactId": "jane-smith-01",
  "value": 15000,
  "stage": "lead",
  "createdAt": "2026-04-04T10:00:00.000Z"
}
```

Example — log an activity:
```json
{
  "id": "call-jane-001",
  "title": "Discovery call with Jane",
  "type": "call",
  "contactId": "jane-smith-01",
  "dealId": "website-deal",
  "date": "2026-04-04T14:00:00.000Z",
  "createdAt": "2026-04-04T14:30:00.000Z"
}
```

## Lifecycle

```bash
campshell-crm start        # Install and start
campshell-crm stop         # Stop (data preserved)
campshell-crm reset --yes  # Reset to defaults
```
