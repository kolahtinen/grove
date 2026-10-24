# Middle-steps document: __APP__

**Frozen:** (date)

The record of why things were decided before the spec. Frozen at the end of phase 2: reopened only when tools or budget change, to revisit reductions. Risky new needs get addenda in `docs/addenda/`.

---

# Part 1: Why

Only this document holds this part.

## Prototypes
Each prototype: what it tried, how many rounds, and, for rejected ones, why. Rejected prototypes' needs are still in [needs](needs.md).

## Risks
Summary of [risks](middle/risks.md): top risks, with IDs and techniques.

## Feasibility
Summary of [feasibility](middle/feasibility.md): each full check's rating, with sources.

## Reductions log
Every X-ID: original requirement, reduced version, reason, revisit later.

## Threat model
Summary of [threats](middle/threats.md): trust boundaries, threats and where each mitigation went.

## Dropped quality attributes
From [quality](middle/quality.md), with reasons.

## Open
Implicit requirements still undecided, from [requirements](requirements.md). Left out of the spec.

---

# Part 2: Feed for Spec Kit

Goes into `/speckit.specify`, one user goal at a time. The combined requirements are where the spec starts; specify follows them unless they're changed in clarify. The needs are context for building the system. Every item keeps its IDs.

## User goals

| ID | Goal | Combined requirements | Needs | Order | Shared? |
|---|---|---|---|---|---|
| G-01 | | | | 1 | |

## G-01: (name)

**Needs (context)**
- N-…: [Who] needs […].

**User stories**
- As a [who], I want [what], so that [why]. (RQ-…; N-…)

**Acceptance scenarios**
- **Given** …, **When** …, **Then** …. (RQ-…)

**Requirements**
- The system MUST … (RQ-…, X-…; N-…, Q-…, T-…)

**Quality attributes:** Q-…

**Constraints for specify:** C-…

**Edge cases:**

---

## Traceability

Filled in during phase 3.

| Combined requirement | Needs | Spec requirements (spec folder, FR-…) | Tests |
|---|---|---|---|
| RQ-01 | | | |
