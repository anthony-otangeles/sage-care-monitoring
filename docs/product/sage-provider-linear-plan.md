# Linear Plan: SAGE Care Monitoring — Provider Workspace

## Project

- Name: SAGE Care Monitoring — Provider Workspace
- Team: Otangeles (`OTA`)
- Priority: High
- State: Backlog
- Purpose: Preserve the shipped provider prototype as the product reference and track only the remaining work required for a secure, integrated, testable provider pilot.
- GitHub: https://github.com/anthony-otangeles/sage-care-monitoring
- PRD: `docs/product/sage-provider-workspace-prd.md`
- Linear project: https://linear.app/otangeles/project/sage-care-monitoring-provider-workspace-b2efd76d432b
- Linear PRD: https://linear.app/otangeles/document/prd-sage-care-monitoring-provider-workspace-9f7ac9629a82

## Created Linear Structure

### Foundation & Safety

- [OTA-91 — Implement provider identity, authorization, and secure state](https://linear.app/otangeles/issue/OTA-91/implement-provider-identity-authorization-and-secure-state)
- [OTA-93 — Add ePHI audit, integrity, and privacy safeguards](https://linear.app/otangeles/issue/OTA-93/add-ephi-audit-integrity-and-privacy-safeguards)
- [OTA-96 — Modularize the provider frontend and automate tests](https://linear.app/otangeles/issue/OTA-96/modularize-the-provider-frontend-and-automate-tests)

### Otangeles Notes+ Integration

- [OTA-92 — Integrate the Otangeles Notes+ encounter lifecycle](https://linear.app/otangeles/issue/OTA-92/integrate-the-otangeles-notes-encounter-lifecycle) — blocked by OTA-91

### Sage & Collaboration

- [OTA-94 — Productionize Sage clinical attention and evaluation gates](https://linear.app/otangeles/issue/OTA-94/productionize-sage-clinical-attention-and-evaluation-gates)
- [OTA-95 — Implement secure provider messaging and voice policy](https://linear.app/otangeles/issue/OTA-95/implement-secure-provider-messaging-and-voice-policy) — blocked by OTA-91
- [OTA-98 — Instrument provider workflow and safety metrics](https://linear.app/otangeles/issue/OTA-98/instrument-provider-workflow-and-safety-metrics) — blocked by OTA-93

### Controlled Provider Pilot

- [OTA-97 — Validate provider pilot readiness and accessibility](https://linear.app/otangeles/issue/OTA-97/validate-provider-pilot-readiness-and-accessibility) — blocked by OTA-91 through OTA-96 and OTA-98

## Issue 1 — Implement provider identity, authorization, and secure application state

- Priority: High
- Labels: `type:implementation`, `risk:security`, `risk:phi`, `Feature`
- Description: Replace mock login and browser-local clinical state with approved identity, server-side role/facility/resident authorization, secure sessions, and backend persistence.
- Acceptance criteria:
  - Provider authentication uses the approved identity service.
  - Every provider API enforces organization, role, facility, resident, and function scope server-side.
  - Credentials, tokens, ePHI, signatures, and clinical drafts are not stored in browser `localStorage`.
  - Session expiry, revocation, access-denied, and audit behavior are covered by automated tests.
- Dependencies: Approved identity source and provider/facility assignment source.

## Issue 2 — Integrate the complete Otangeles Notes+ encounter lifecycle

- Priority: High
- Labels: `type:implementation`, `risk:phi`, `Feature`
- Description: Replace Notes+ placeholder methods with idempotent APIs/events for the daily list, encounter capture, orders, scribe status, document versions, revisions, verification, signature/revocation, billing submission state, and cancellation.
- Acceptance criteria:
  - Each operation uses stable source identifiers, idempotency keys, correlation IDs, and visible sync state.
  - Network retries do not duplicate encounters, orders, revisions, signatures, or cancellation.
  - Stale document versions cannot be signed.
  - Canceled encounters hide only after source acknowledgement; failures remain visible and retryable.
  - Synthetic end-to-end contract tests cover the entire encounter lifecycle.
- Dependencies: Notes+ API/webhook contracts and source-of-truth ownership decisions.

## Issue 3 — Productionize Sage clinical attention with provenance and evaluation gates

- Priority: High
- Labels: `type:implementation`, `type:test`, `gate:approval-required`, `risk:phi`, `Feature`
- Description: Define and implement the approved provider-facing clinical-attention contract, including source provenance, freshness, confidence semantics, model/rule versioning, safe degradation, clinician feedback, and release evaluation.
- Acceptance criteria:
  - Intended use, prohibited use, inputs, outputs, and clinical owner are approved.
  - Every generated item exposes evidence references, capture times, freshness, and model/rule version.
  - Sage cannot autonomously place orders, diagnose, sign, revoke, or cancel.
  - A versioned synthetic/clinician-reviewed evaluation suite gates releases.
  - Provider view, dismissal, acceptance, override, and downstream action events are instrumented.
- Dependencies: Clinical safety owner, evaluation dataset, approved data sources.

## Issue 4 — Add ePHI audit, integrity, privacy, and operational safeguards

- Priority: High
- Labels: `type:implementation`, `risk:security`, `risk:phi`, `area:security`
- Description: Establish the production safeguards required around provider access and consequential clinical actions.
- Acceptance criteria:
  - Data-flow and threat models cover identity, Notes+, Sage, messages, signatures, audio, analytics, and audit data.
  - Consequential actions record actor, entity/version, time, outcome, and request correlation.
  - ePHI is encrypted in transit and at rest under approved standards.
  - Retention/deletion, incident response, backup/recovery, telemetry redaction, and business-associate/vendor responsibilities are documented and tested.
  - Security/privacy/clinical stakeholders approve the PHI pilot gate.
- Dependencies: Architecture and vendor decisions; organizational policies.

## Issue 5 — Implement secure provider messaging, resident references, and voice policy

- Priority: High
- Labels: `type:implementation`, `risk:security`, `risk:phi`, `Feature`
- Description: Replace frontend-only threads and simulated voice messages with authenticated transport, durable resident references, delivery state, retention controls, and an approved audio/transcription implementation or an explicit disabled state.
- Acceptance criteria:
  - Thread membership and message access are authorized server-side.
  - Resident tags store stable resident IDs and render only when the viewer remains authorized.
  - Send failure, retry, deduplication, read state, and membership removal are tested.
  - Voice capture has approved notice, recording state, upload security, interruption behavior, retention, and transcription/vendor review—or remains disabled for pilot.
  - Message and audio audit/telemetry avoid unnecessary ePHI disclosure.
- Dependencies: Identity foundation, messaging backend, audio/transcription decision.

## Issue 6 — Modularize the provider frontend and establish automated test coverage

- Priority: Medium
- Labels: `type:implementation`, `type:test`, `Improvement`
- Description: Refactor the monolithic provider prototype into maintainable domains and add the automated quality gates needed for multi-developer delivery.
- Acceptance criteria:
  - Provider Home, Residents, Sage, Messages, Encounter Capture, Encounter Review, and Settings have typed components/services/state boundaries.
  - Mock adapters and production adapters implement explicit interfaces.
  - Unit tests cover lifecycle and authorization-sensitive state logic.
  - Component tests cover signature, revision, cancellation, resident mention, and voice states.
  - End-to-end tests cover the six provider journeys in the PRD.
  - CI runs typecheck, production build, tests, browser console checks, and responsive overflow checks.
- Dependencies: Target frontend architecture and integration contracts.

## Issue 7 — Instrument provider workflow, Sage safety, and sync metrics

- Priority: Medium
- Labels: `type:implementation`, `Improvement`, `risk:phi`
- Description: Implement privacy-reviewed product analytics and operational observability for the PRD metrics without leaking unnecessary clinical content.
- Acceptance criteria:
  - Event taxonomy covers provider workflow timing, encounter lifecycle, revisions, cancellations, Sage feedback, sync outcomes, and messaging delivery.
  - Metrics distinguish source/API latency from frontend rendering.
  - Dashboards show sync failure, duplicate-write, stale-signing, authorization anomaly, message failure, and Sage safety-review signals.
  - Event payloads and retention receive privacy/security approval.
- Dependencies: Backend foundation, audit schema, analytics platform decision.

## Issue 8 — Run provider pilot readiness, accessibility, and clinical workflow validation

- Priority: High
- Labels: `type:test`, `gate:approval-required`, `risk:phi`
- Description: Validate the integrated provider workspace with synthetic data before PHI, then run a controlled provider pilot only after product, clinical, security, and operational gates pass.
- Acceptance criteria:
  - WCAG 2.2 AA review covers provider-critical paths and keyboard-only operation.
  - Supported desktop/mobile browsers and 390px responsive layouts pass without critical overflow or blocked actions.
  - Clinical reviewers validate source clarity, generated-content labeling, review/signature gates, cancellation, and failure states.
  - Synthetic end-to-end scenarios include stale data, duplicate requests, network failure, authorization denial, source conflict, and rollback.
  - Pilot support, escalation, kill switch, rollback, training, and issue triage ownership are documented.
  - Go-live approval is recorded before live PHI access.
- Dependencies: Issues 1–7 and approved pilot scope.
