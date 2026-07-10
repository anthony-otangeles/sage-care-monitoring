# PRD: SAGE Care Monitoring — Provider Workspace

- Status: Retrospective PRD / Engineering handoff
- Date: 2026-07-11
- Product owner: Otangeles Product (owner to confirm)
- Working partners: Provider Engineering, Otangeles Notes+ Integration, Clinical Operations, Security/Privacy
- Linear project: [SAGE Care Monitoring — Provider Workspace](https://linear.app/otangeles/project/sage-care-monitoring-provider-workspace-b2efd76d432b)

## Developer Reference

- GitHub repository: [anthony-otangeles/sage-care-monitoring](https://github.com/anthony-otangeles/sage-care-monitoring)
- Reviewed branch: [`main`](https://github.com/anthony-otangeles/sage-care-monitoring/tree/main)
- Reviewed commit: `4fcc670` (`Data and Process correction`)
- Local source reviewed: `/home/tony-desktop/Development/SAGE/sage-care-monitoring`
- Runnable provider prototype: [`artifacts/mobile`](https://github.com/anthony-otangeles/sage-care-monitoring/tree/main/artifacts/mobile)
- Primary application entrypoint: [`artifacts/mobile/src/App.vue`](https://github.com/anthony-otangeles/sage-care-monitoring/blob/main/artifacts/mobile/src/App.vue)
- Mock resident/intelligence/message data: [`artifacts/mobile/data`](https://github.com/anthony-otangeles/sage-care-monitoring/tree/main/artifacts/mobile/data)
- Local setup: `npm install`, then `npm run dev`; typecheck with `npm run typecheck`; build with `npm run build`

The repository is the visual and workflow reference for implementation. It is currently a frontend-only Vue/Vite prototype and must not be treated as a production clinical system or production data source.

## 1. Summary

SAGE Care Monitoring gives skilled-nursing providers one workspace to review scheduled encounters, understand resident change from baseline, capture encounter notes and orders, collaborate with the care team, review scribe-prepared documentation, request revisions, verify sections, sign or revoke an encounter, and cancel a visit when appropriate.

The built prototype demonstrates the intended provider experience across responsive desktop and mobile layouts. It uses mock residents, generated clinical-attention opportunities, local encounter state, simulated voice behavior, and placeholder Otangeles Notes+ synchronization. This PRD preserves that shipped prototype behavior as product truth while defining the production requirements developers must implement before a provider pilot.

SAGE supports provider judgment; it does not diagnose, prescribe, or autonomously finalize documentation. Otangeles Notes+ is intended to remain the system of record for encounters and clinical documents.

## 2. Problem

SNF providers work across resident lists, facility context, staff observations, encounter documentation, scribe revisions, orders, and team communications. Relevant changes are often distributed across systems and messages, making it difficult to answer four questions quickly:

1. Which residents require attention today?
2. What changed from the resident's baseline, and what evidence supports that conclusion?
3. What must the provider document, order, review, revise, sign, or cancel?
4. Which follow-up actions and care-team communications remain unresolved?

The provider needs a focused workspace that brings those tasks together without obscuring source evidence or replacing clinical judgment. The product must also preserve the integrity of the encounter lifecycle between SAGE and Otangeles Notes+.

## 3. Research-Informed Principles

1. **Provider judgment remains authoritative.** Sage may summarize evidence and present options, but it must not provide an opaque directive or replace the provider's decision. The basis for a recommendation must be independently reviewable.
2. **Show provenance, uncertainty, and freshness.** Generated attention items must expose contributing observations, source systems, confidence, and capture times. Stale or incomplete context must be visible.
3. **Use role-appropriate access and minimum-necessary design.** Provider access must be scoped to authorized facilities and residents, and non-treatment uses/disclosures must be limited appropriately.
4. **Protect confidentiality, integrity, and availability of ePHI.** Production use requires authenticated access, authorization, audit controls, integrity safeguards, secure transmission, and operational recovery.
5. **Keep Otangeles Notes+ authoritative.** SAGE can orchestrate provider work, but encounter identity, document state, signatures, revisions, orders, and cancellation outcomes require explicit, idempotent synchronization with the source of record.
6. **Make destructive or consequential actions deliberate.** Signing, revoking a signature, returning to a scribe, canceling a visit, and placing an order require confirmation, clear resulting state, and audit history.

Sources reviewed:

- [HHS — Summary of the HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html)
- [HHS — Minimum Necessary Requirement](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary-requirement/index.html)
- [FDA — Clinical Decision Support Software Guidance, January 2026](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software)

Regulatory applicability and intended-use classification require counsel and clinical-safety review; these sources inform product principles and do not establish that SAGE is compliant or outside FDA oversight.

## 4. Goals

- Give providers a prioritized, facility-aware daily encounter list with resident context and change-from-baseline evidence.
- Let providers move from resident review to encounter capture, order creation, scribe review, revision, verification, signature, revocation, and cancellation without losing context.
- Make Sage-generated clinical attention explainable and clearly advisory.
- Preserve a reliable, auditable encounter lifecycle between SAGE and Otangeles Notes+.
- Support secure provider-to-team communication with resident tagging and linked clinical context.
- Deliver a responsive provider experience usable at desktop and 390px mobile widths.
- Instrument pilot outcomes so workflow value, safety, and failure modes can be evaluated.

## 5. Non-Goals

- Replacing the EHR or Otangeles Notes+ as the legal clinical record.
- Autonomous diagnosis, treatment selection, order placement, encounter signature, or visit cancellation.
- Patient- or family-facing clinical decision support.
- Production use of mock residents, mock credentials, browser `localStorage`, or simulated synchronization.
- Building DON- or CNA-specific workflows in this project, except where their data or messages are inputs to the provider experience.
- Billing adjudication, claims submission, pharmacy fulfillment, lab execution, or transport dispatch.
- Real-time emergency monitoring or time-critical alarm replacement.

## 6. Users and Personas

### Primary persona: SNF Provider

A physician, nurse practitioner, or physician assistant responsible for residents across one or more skilled-nursing facilities. The provider needs a daily visit queue, resident-specific evidence, clinical documentation, order and follow-up coordination, and a reliable review/signature workflow.

Primary jobs to be done:

- See which encounters are scheduled and why each resident needs review.
- Understand changes from baseline without reconstructing context from multiple tools.
- Document an encounter by text or voice and associate relevant orders.
- Review a scribe-prepared document section by section.
- Request and resolve revisions before signing.
- Correct a signed encounter by revoking the signature and re-entering review.
- Cancel an encounter with a documented reason while preserving linked clinical context.
- Communicate with staff and tag the correct resident.

### Supporting actors

- **Scribe:** prepares and revises encounter documents in Otangeles Notes+.
- **Nursing/CNA staff:** contribute resident observations, action updates, and messages.
- **Practice administrator:** manages provider/facility assignment and operational access.
- **Clinical operations and compliance:** review safety, audit, privacy, and pilot outcomes.

## 7. Provider User Journeys

### Journey A — Start the day and select an encounter

1. Provider authenticates and enters the Provider workspace.
2. SAGE displays the provider's authorized facilities and today's encounter count.
3. The Daily Encounter List shows scheduled/in-progress visits with resident, room, facility, priority, time, visit type, reason, baseline change, unresolved concerns, vital trends, and source.
4. Provider starts or continues the encounter.
5. If the source list is unavailable or stale, the UI shows a recoverable error and does not silently present old data as current.

### Journey B — Review a resident before acting

1. Provider searches or selects a resident.
2. The resident profile shows demographics, code status, current status chips, Patient Focus, summary, memory, predicted deviation, evidence, concerns, vitals, and timeline.
3. Provider can inspect evidence behind a generated attention item.
4. Provider can start an encounter, place/request an order, schedule a huddle, or communicate with the team.
5. Generated content remains visually distinct from source clinical data.

### Journey C — Capture and complete an encounter

1. Provider opens a scheduled encounter.
2. Encounter timer begins and the provider captures a text narrative or records voice.
3. Provider can add an order linked to the encounter.
4. Provider ends the encounter after confirmation.
5. SAGE records the end state and sends the note/order payload to Otangeles Notes+ using an idempotent request.
6. The visit transitions to scribe work and later to Needs Review based on source-of-record updates.
7. Failures remain visible and retryable; the UI never reports sync success before acknowledgement.

### Journey D — Review, revise, verify, and sign

1. Provider opens an encounter in Needs Review.
2. The header shows assigned scribe and review state.
3. Provider reviews the formatted clinical document and each section's status.
4. Provider may add a section-specific revision request and return the encounter to the scribe.
5. When the scribe resubmits, addressed requests and revised sections are visible.
6. Provider marks eligible sections verified individually or verifies all eligible sections.
7. Signing remains disabled while open revisions exist or sections are unverified.
8. Provider previews the saved signature and confirms signing.
9. Otangeles Notes+ acknowledges the signed state before SAGE reports completion.

### Journey E — Correct or cancel an encounter

1. A provider may revoke their attached signature on a signed encounter.
2. Revocation clears section verification, records an audit event, and returns the source encounter to Needs Review.
3. Any non-canceled encounter can be canceled with one of the approved reasons; Other requires an explanation.
4. Canceling a signed encounter requires confirmation and clears the attached signature and section verification.
5. Cancellation preserves linked orders, messages, provider notes, and resident data.
6. Production SAGE must synchronize cancellation with Otangeles Notes+ before hiding the encounter from normal views; the existing prototype is local-only and does not satisfy this requirement.

### Journey F — Use Sage and team messaging

1. Provider asks Sage for resident or workflow context using text or supported voice input.
2. Sage answers from authorized, attributable sources and identifies uncertainty or missing data.
3. Provider opens a direct, team, or resident-linked thread.
4. Typing `@` displays authorized resident suggestions; selecting one inserts a resident tag into the message.
5. Voice messages show recording, preview, playback, delete/re-record, and send behavior.
6. The current prototype simulates voice; production must capture, upload, retain, and transcribe audio only under approved policies.

## 8. Functional Requirements

### FR-1 — Provider identity, role, and facility scope

Current prototype behavior:

- Mock role selection supports Provider login and facility filtering.
- Provider navigation includes Home, Residents, Sage, Messages, and Settings.

Production requirements:

- Authenticate through the approved identity provider.
- Enforce provider role, organization, facility, and resident authorization server-side.
- Expire/revoke sessions and prevent cross-facility data leakage.
- Do not store credentials, access tokens, ePHI, or signatures in browser `localStorage`.

Acceptance criteria:

- An unauthorized provider cannot retrieve or infer resident data outside assigned scope through UI or API calls.
- Facility changes update all provider lists, counts, notifications, searches, and message context consistently.
- Authentication and authorization failures produce a safe sign-in or access-denied state.

### FR-2 — Daily Encounter List

Current prototype behavior:

- Displays mock scheduled/in-progress encounters for the active provider and facility.
- Shows visit priority, schedule, reason, baseline change, concerns, vitals, source, and start/continue action.

Production requirements:

- Read the provider's current encounter list from Otangeles Notes+.
- Surface source timestamp, sync state, and recoverable load/error states.
- Exclude canceled encounters and prevent duplicate active visits for the same source encounter.

Acceptance criteria:

- Counts equal the visible authorized encounter set.
- Refresh and status updates do not create duplicate cards.
- A canceled encounter cannot be started from any normal list or deep link.

### FR-3 — Resident profile and clinical context

Current prototype behavior:

- Provides Situation, Talk, Timeline, and Encounter tabs.
- Shows Patient Focus, summaries, memory, generated deviations, concerns, vital trends, orders/actions, and encounter history.

Production requirements:

- Resolve each displayed value to a source, captured time, and freshness policy.
- Distinguish raw source data, calculated trends, staff observations, and generated Sage content.
- Preserve the responsive Patient Focus and status-chip layout demonstrated in the repository.

Acceptance criteria:

- Provider can inspect the source evidence for every generated attention item.
- Stale or unavailable data is labeled and never presented as current.
- Resident identity remains consistent across profile, message, order, timeline, and encounter views.

### FR-4 — Explainable Sage clinical attention

Current prototype behavior:

- Builds generated attention opportunities from mock Notes+ events and daily inputs.
- Shows category, urgency, confidence, reason, changes, evidence, and recommended action.

Production requirements:

- Define an approved intended use, input contract, output contract, confidence semantics, and model/rule version.
- Make the recommendation basis independently reviewable by the provider.
- Never auto-place an order, sign, cancel, diagnose, or hide clinically significant source data.
- Log provider view, acceptance, dismissal, override, and downstream action for evaluation.

Acceptance criteria:

- Every generated item includes input provenance, timestamps, model/rule version, and an explanation suitable for provider review.
- Low-confidence, incomplete, stale, or out-of-scope cases degrade safely.
- Release is blocked unless the approved clinical evaluation suite and safety review pass.

### FR-5 — Encounter capture and linked orders

Current prototype behavior:

- Starts/continues scheduled visits, tracks elapsed time, supports text or simulated voice notes, links orders, and ends the encounter into a scribe workflow.

Production requirements:

- Create or resume the correct Otangeles Notes+ encounter using a stable source identifier.
- Persist drafts safely, prevent duplicate submission, and expose sync/retry state.
- Support real voice capture only after approved consent, retention, upload, and transcription designs.
- Link order identifiers and show their source status without treating UI state as execution confirmation.

Acceptance criteria:

- Network retry cannot create duplicate encounters or orders.
- A provider can recover an unsent draft after an interruption according to the approved retention policy.
- The UI displays success only after the source system acknowledges the operation.

### FR-6 — Scribe review and section verification

Current prototype behavior:

- Renders a structured encounter document with resident/facility metadata and clinical sections.
- Supports section revision requests, threaded replies, addressed/open status, individual/all verification, return to scribe, and signing gates.

Production requirements:

- Load the exact source document, revision threads, scribe identity, and version from Otangeles Notes+.
- Prevent signing stale document versions.
- Maintain immutable audit history for review, revision, verification, return, and signature events.

Acceptance criteria:

- Any source version change invalidates stale verification and requires explicit re-review.
- Sign remains disabled with open revisions or unverified required sections.
- Revision comments are associated with the correct section and document version.

### FR-7 — Provider signature and revocation

Current prototype behavior:

- Supports drawn, typed, or uploaded saved signatures; attaches a signature snapshot at signing; allows the signing provider to revoke.

Production requirements:

- Store signature artifacts using approved encrypted server-side storage and access controls.
- Bind signature to provider identity, encounter ID, document version/hash, time, and intent confirmation.
- Make revocation explicit, auditable, and synchronized with Otangeles Notes+ and downstream billing state.

Acceptance criteria:

- A provider cannot attach another user's signature.
- Document modification after signing is detectable and cannot silently retain the prior signature.
- Revocation records who, when, why/context if required, and the resulting source-system state.

### FR-8 — Soft cancellation

Current prototype behavior:

- Supports Duplicate encounter / encounter exists, Entered in error, Testing / training encounter, Patient not seen, Administrative cancellation, and Other.
- Other requires details; signed cancellation clears local signature/verification; canceled visits remain stored but are filtered from normal views.
- No Notes+ cancellation API is called.

Production requirements:

- Treat Otangeles Notes+ as authoritative for cancellation state.
- Send exact reason, Other details, previous status, canceling provider, timestamp, signature disposition, and source encounter ID.
- Hide the encounter only after acknowledgement, or show a visible pending/failed cancellation state.

Acceptance criteria:

- Failed cancellation remains visible with retry/support guidance.
- Canceled encounters disappear from normal lists, counts, timelines, notifications, and review entry points after source acknowledgement.
- Linked orders, messages, notes, and resident records are not deleted by cancellation.

### FR-9 — Provider orders, follow-ups, huddles, and actions

Current prototype behavior:

- Supports mock clinical orders, scheduled huddles, follow-ups, hospital escalations, and assigned action workflows.

Production requirements:

- Define source-of-truth ownership and permissions for each workflow.
- Distinguish a request from an executed clinical order or completed operational action.
- Synchronize status changes and notify relevant staff without duplicate events.

Acceptance criteria:

- Every item shows owner, resident, source identifier, status, and last update.
- Users cannot mistake an unsent/failed request for a completed order or escalation.

### FR-10 — Secure provider messaging and resident tags

Current prototype behavior:

- Supports resident-room, direct, and group threads; calls; resident tags; simulated voice messages; summaries/insights/transcription placeholders.

Production requirements:

- Use authenticated, encrypted transport with server-side authorization and retention controls.
- Resolve resident mentions to stable resident IDs, not display text alone.
- Audit message access and ensure thread membership/facility scope prevents unauthorized disclosure.

Acceptance criteria:

- A tagged resident stores a resident identifier and renders the current authorized display name.
- Removed thread members cannot continue reading or posting.
- Failed sends are visible and retryable without duplication.

### FR-11 — Provider notifications

Current prototype behavior:

- Displays provider attention, encounter review, action, escalation, and schedule notifications with read state.

Production requirements:

- Derive notifications from authoritative events and deduplicate them.
- Deep links must re-check authorization and current source status.
- Stale notifications must resolve safely rather than opening an invalid workflow.

Acceptance criteria:

- Notification counts match unread authorized notifications.
- Opening an outdated encounter notification refreshes status before allowing action.

### FR-12 — Provider settings

Current prototype behavior:

- Shows profile, assigned facilities, password/2FA/session mocks, workspace defaults, preferences, signature setup, and Notes+ account information.

Production requirements:

- Connect settings to approved identity, organization, and signature services.
- Separate editable provider preferences from administrator-controlled access and credentials.

Acceptance criteria:

- Providers cannot grant themselves facility access or elevate role privileges.
- Security-sensitive settings require appropriate re-authentication and audit events.

## 9. Data and State Model

### Core entities

- **Provider:** stable user ID, credentials/identity reference, role, organization, assigned facilities, preferences.
- **Facility:** stable facility ID, display details, provider assignments.
- **Resident:** stable resident ID, demographics, room/facility, code status, authorized clinical context.
- **Clinical evidence:** source event ID, source system, captured time, author/device where applicable, value/detail, freshness.
- **Sage attention item:** item ID, resident ID, category, urgency, confidence semantics, reason, evidence references, generated time, model/rule version, recommended option, provider response.
- **Encounter:** SAGE ID, Otangeles Notes+ ID, provider/resident/facility IDs, visit type, schedule, priority, reason, note, orders, status, version, sync state.
- **Encounter section:** section ID, document version, type/content, verification state, revision threads.
- **Revision thread:** section/document version, status, comments, authors, timestamps.
- **Signature:** provider ID, secure artifact reference, encounter/document version hash, signed time, revoked time/state.
- **Cancellation:** exact reason, optional Other details, timestamp, canceling provider, prior status, source acknowledgement, signature disposition.
- **Order/action/follow-up/huddle:** stable source ID, resident, owner/participants, status, timestamps, source system.
- **Message thread/message:** stable IDs, membership, resident references, content type, delivery state, retention metadata.
- **Audit event:** actor, action, entity/version, timestamp, outcome, source/request correlation, appropriate before/after metadata.

### Encounter lifecycle

`scheduled` → `provider-in-progress` → `scribe-in-progress` → `needs-review` ↔ `revision` → `submitted-to-billing`

- Any non-canceled state may enter `cancelled` through the approved cancellation workflow.
- Signature revocation returns a signed encounter to `needs-review` and invalidates section verification.
- Source-system conflicts, pending sync, and failed sync must be represented explicitly rather than collapsed into a clinical status.

### State ownership

- Otangeles Notes+ owns encounter identity, source document/version, scribe status, signature state, and cancellation state.
- The identity/access service owns provider authentication and authorization.
- SAGE owns provider workspace presentation, orchestration state, generated attention outputs, and product analytics, subject to approved retention and integration contracts.
- Production ePHI must not rely on browser `localStorage` as a source of truth.

## 10. Nonfunctional Requirements

### Security and privacy

- Encrypt ePHI in transit and at rest using approved organizational standards.
- Enforce server-side least-privilege access by provider, organization, facility, resident, and function.
- Provide audit controls for access and consequential actions.
- Complete threat modeling, privacy review, data-flow mapping, retention/deletion policy, and incident-response integration before PHI use.

### Reliability and data integrity

- Use idempotency keys and correlation IDs for encounter, order, signature, revocation, revision, and cancellation writes.
- Make source synchronization state visible and retryable.
- Detect and prevent stale-document signing and conflicting updates.
- Define backup/recovery and service-degradation behavior before pilot.

### Performance

- Target first usable provider workspace within 2 seconds on the supported network/device profile.
- Target local interaction feedback within 200 ms for navigation, filtering, and modal actions.
- Measure source/API latency separately from render latency and expose slow/failing dependencies operationally.

### Accessibility and responsive design

- Target WCAG 2.2 AA for provider-critical workflows.
- Support keyboard-only operation, visible focus, accessible names/states, logical reading order, and non-color status cues.
- Preserve usable layouts at 390px mobile width and supported desktop widths without horizontal overflow.

### Maintainability and testability

- Break the current monolithic `App.vue` into provider domains, shared components, typed services, and state modules.
- Add unit tests for lifecycle/state logic, integration contract tests, component tests for consequential actions, and end-to-end provider journeys.
- Require typecheck, production build, automated browser checks, and clinical workflow QA in CI.

### Observability

- Capture structured logs, traces, dependency health, sync failures, authorization denials, and audit events without placing unnecessary ePHI in telemetry.
- Alert on elevated sync failure, duplicate write, stale signing, authorization anomaly, and message delivery failure rates.

## 11. Safety, Privacy, and Security

- SAGE must clearly identify generated content and preserve access to source evidence.
- The provider must be able to independently review the basis for generated recommendations.
- No Sage output may automatically place an order, sign/cancel an encounter, or represent itself as a confirmed diagnosis or treatment decision.
- Time-critical or emergency use is out of scope until separately validated and approved.
- Role and facility scope must be enforced on every API request, not only in the UI.
- Real resident data, signatures, audio, tokens, and clinical drafts must not be stored in unprotected browser storage.
- Voice recording requires an approved user notice, capture indicator, interruption behavior, upload security, retention policy, and transcription/vendor review.
- Consequential actions require authenticated actor identity, confirmation, idempotency, source acknowledgement, and audit history.
- Clinical operations, privacy/security, and legal/regulatory stakeholders must approve intended use, pilot data, retention, and escalation procedures before live PHI use.

## 12. Success Metrics

Baselines must be measured during a controlled pilot; targets should not be committed before instrumentation and workflow validation.

### Provider efficiency

- Median time from opening Provider Home to starting the intended encounter.
- Median encounter documentation time by text vs voice workflow.
- Median Needs Review to signed time.
- Number of systems/screens used per completed encounter compared with baseline.

### Workflow quality

- Percentage of scheduled encounters completed without sync retry.
- Revision requests per encounter and scribe turnaround time.
- Percentage of signatures completed only after all required sections are verified.
- Cancellation, signature-revocation, duplicate-encounter, and failed-sync rates.

### Sage usefulness and safety

- Provider view, acceptance, dismissal, and override rates for attention items.
- Evidence/provenance expansion rate.
- Clinician-reviewed false-positive, false-negative, stale-context, and unsupported-output rates.
- Percentage of generated items with complete provenance, freshness, and model/rule version.

### Reliability and security

- API/sync success rate and duplicate-write rate.
- Message delivery success rate.
- Authorization denial/anomaly rate.
- Audit-event completeness for consequential actions.
- Accessibility defect count in provider-critical paths.

## 13. Release Plan

### Phase 0 — Product, safety, and contract alignment

- Approve this PRD, provider intended use, system-of-record boundaries, and pilot scope.
- Define Notes+ APIs/events, identity/authorization model, data-flow diagram, retention, audit schema, and clinical evaluation plan.
- Confirm repository ownership and ensure the reviewed reference commit is available to developers.

Exit criteria: signed product/integration/safety decisions; no live PHI.

### Phase 1 — Secure application foundation

- Implement provider authentication, server-side role/facility scope, backend data services, secure persistence, audit foundation, and environment configuration.
- Modularize the frontend and establish CI, automated tests, and observability.

Exit criteria: synthetic-data environment passes security and integration contract tests.

### Phase 2 — Otangeles Notes+ encounter integration

- Implement daily list, encounter create/resume/end, orders, scribe status, revision/versioning, signature/revocation, and cancellation synchronization.
- Add idempotency, retries, conflict handling, and visible sync states.

Exit criteria: end-to-end synthetic encounter lifecycle passes without duplicate or stale writes.

### Phase 3 — Sage, messaging, and voice productionization

- Implement approved clinical-attention pipeline with provenance/evaluation.
- Implement secure messaging/resident references and approved audio/transcription behavior.
- Add product metrics and operational dashboards.

Exit criteria: clinical evaluation, privacy/security review, and workflow QA pass in staging.

### Phase 4 — Controlled provider pilot

- Pilot with limited providers/facilities and explicit support/escalation ownership.
- Monitor safety, sync, usability, accessibility, and workflow metrics.
- Use a rollback/kill-switch plan and prohibit expansion until exit criteria are met.

Exit criteria: agreed pilot thresholds met and risks accepted by product, clinical, security, and operations owners.

## 14. Known Gaps and Recommended Follow-Up

1. Mock authentication and browser-local state are not suitable for PHI.
2. Notes+ read/write/status methods are placeholders; the UI can currently claim mock sync without a real API acknowledgement.
3. Sage opportunities are generated from mock data and lack an approved intended-use/evaluation contract.
4. Voice message and encounter recording behavior is simulated.
5. Most messages, actions, schedules, orders, and analytics are frontend-only.
6. Signature artifacts are browser-local and are not cryptographically bound to a source document version.
7. Cancellation is local-only and intentionally does not update Notes+.
8. The provider app is concentrated in a very large `App.vue` with no automated test suite in the repository.
9. Production audit, observability, retention, backup/recovery, and incident-response integrations are not implemented.
10. A formal provider usability, accessibility, clinical-safety, and responsive-device pilot has not been documented.

These gaps are the basis of the Linear follow-up issues. Completed prototype UI work should not be recreated as future implementation work.

## 15. Future Roadmap (Not Current Scope)

- Advanced cross-facility provider workload balancing.
- Validated longitudinal risk models and configurable evidence thresholds.
- Production mobile push and on-call routing.
- Multi-party audio/video visits with approved recording/transcription policy.
- Deeper Notes+ billing/RCM visibility after documentation completion.
- Provider-configurable worklists and saved views.
- Formal interoperability expansion beyond the first Notes+ integration contract.

## 16. Open Questions

1. Who is the accountable product owner and clinical safety owner for the provider workspace?
2. Which provider types and facilities are included in the first pilot?
3. What is the approved intended use of Sage clinical attention, and which uses are explicitly prohibited?
4. Which Otangeles Notes+ APIs/webhooks exist for encounters, document versions, revisions, signatures, orders, billing status, and cancellation?
5. Which system owns provider/facility assignment and resident authorization?
6. What are the required retention periods for drafts, messages, audio, transcripts, generated outputs, and audit events?
7. Is real voice capture in the first pilot, or should it remain disabled until a later phase?
8. Which document sections are required for signing, and which source changes invalidate verification?
9. What cancellation effects are required for orders, billing, scribe work, and downstream notifications?
10. What provider response-time, availability, and support SLAs are required during pilot?
11. Which clinical evaluation dataset and review process will gate Sage releases?
12. What browsers, devices, and accessibility conformance evidence are required for release?
