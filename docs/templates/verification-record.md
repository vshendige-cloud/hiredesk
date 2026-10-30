# Verification Record (F5)

Change: <branch / PR>
Required rung (from risk assessment): V__

| Rung | Check                                         | Command or method                                  | Evidence (output, link, reviewer) | Result |
| ---- | --------------------------------------------- | -------------------------------------------------- | --------------------------------- | ------ |
| V0   | Model self-review                             | Claude listed issues affecting correctness only    |                                   |        |
| V1   | Build, type check, lint                       | `pnpm typecheck && pnpm lint`                      |                                   |        |
| V2   | Tests from human-approved acceptance criteria | `pnpm test && pnpm test:integration`               |                                   |        |
| V3   | Independent review                            | Fresh-context reviewer subagent and human reviewer |                                   |        |
| V4   | Security analysis                             | SAST, dependency and secret scans; threat review   |                                   |        |
| V5   | Staged rollout and monitoring                 | Release plan, dashboards, rollback trigger         |                                   |        |

Rule: a lower rung never substitutes for a higher rung that the risk assessment requires.
V0 is never counted as independent verification.
