# Repository Analysis Workflow (F6) – Inventory

Change being planned:
Inventory command(s) (deterministic, re-runnable):

```bash
# example
rg -n "console\.(log|warn|error)" apps packages scripts > docs/state/inventory-console.txt
```

| #   | Location (file:line) | Pattern found | Planned change | Batch | Done |
| --- | -------------------- | ------------- | -------------- | ----- | ---- |

Completion check (must return the stated result before review):

```bash
# example: expect no output
rg -n "console\.(log|warn|error)" apps/api/src
```
