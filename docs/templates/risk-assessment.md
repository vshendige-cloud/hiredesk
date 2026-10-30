# Risk Assessment (F4) → Autonomy (F3) and Verification (F5)

Rate each factor Low / Medium / High. The **highest** rating sets the minimums below.

| Factor               | Question                                                                | Rating | Reason |
| -------------------- | ----------------------------------------------------------------------- | ------ | ------ |
| Reversibility        | How hard is it to undo if wrong? (data loss, migrations, sent messages) |        |        |
| Blast radius         | How many users, services or teams are affected if wrong?                |        |        |
| Data sensitivity     | Does it touch personal, financial or confidential data?                 |        |        |
| Security criticality | Does it touch auth, permissions, secrets, input handling or crypto?     |        |        |

**Highest rating:** ____

| Highest rating | Maximum autonomy (F3)                | Minimum verification (F5)   | Human approval points                     |
| -------------- | ------------------------------------ | --------------------------- | ----------------------------------------- |
| Low            | A3 (A4 in CI with an allowlist)      | V1 + V2                     | Pull request review                       |
| Medium         | A2–A3 with plan approval             | V1 + V2 + V3                | Plan and pull request                     |
| High           | A1–A2; humans run irreversible steps | V1–V4, plus V5 for releases | Plan, each irreversible step, PR, release |

This mapping is the book's default. Teams may tighten it; loosening it should be a recorded decision.
