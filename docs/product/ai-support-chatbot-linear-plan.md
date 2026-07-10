# Linear Plan: AI Customer Support Chatbot With Human Handoff

Status: Draft v0.1  
Target Linear team: Otangeles  
Suggested label: Feature  
Suggested structure: one parent tracking issue with child implementation issues

## Parent Issue

Title: AI customer support chatbot with human handoff

Priority: High

Description:

Build a website support experience where an L1 AI support agent answers routine company/product questions from approved knowledge, escalates to a human when needed, and gives back-office staff a queue for accepting and responding to handoffs.

Definition of done:

- Website chat can answer common support questions from approved knowledge.
- Customers can request a human at any point.
- AI automatically escalates low-confidence, unsupported, repeated-failure, sensitive, or frustrated conversations.
- Back-office staff can view, accept, reply to, and resolve handoff conversations.
- Staff receive MVP notifications for waiting handoffs.
- Analytics, transcript logging, knowledge-gap capture, and QA/eval coverage exist for pilot launch.

References:

- docs/product/ai-support-chatbot-prd.md

## Child Issues

### 1. Approve MVP support chatbot scope and pilot success metrics

Priority: High  
Labels: Feature

Acceptance criteria:

- MVP scope, non-goals, and rollout phases are approved.
- Pilot success metrics are documented.
- Explicit handoff and automatic escalation triggers are agreed.
- Initial staff operating model is documented.

### 2. Seed approved support knowledge base for L1 AI answers

Priority: High  
Labels: Feature

Acceptance criteria:

- Initial knowledge includes company overview, product overview, contact info, hours, location, FAQs, support policies, and escalation rules.
- Each knowledge source has owner, source, status, and last-reviewed metadata.
- Stale or missing knowledge paths are identified.
- Knowledge gap capture format is defined.

### 3. Design website chat widget and conversation UX

Priority: High  
Labels: Feature

Acceptance criteria:

- Customer-facing widget states are designed: closed, AI active, waiting for human, human joined, offline/follow-up, resolved.
- "Talk to a person" path is obvious.
- AI vs human speaker identity is visually clear.
- UX handles customer contact capture for asynchronous handoff.

### 4. Implement conversation data model and transcript persistence

Priority: High  
Labels: Feature

Acceptance criteria:

- Conversation, message, handoff, notification, knowledge gap, and QA review entities are defined.
- Status transitions are documented and implemented.
- Transcript preserves customer, AI, and human messages.
- Audit metadata captures sender, timestamp, and handoff trigger.

### 5. Implement L1 AI support answering from approved knowledge

Priority: High  
Labels: Feature

Acceptance criteria:

- AI retrieves from approved support knowledge before answering.
- AI answers common company/product questions succinctly.
- AI asks clarifying questions for ambiguous requests.
- AI refuses or escalates when answer is unsupported.
- Internal metadata captures intent, confidence, and cited knowledge source.

### 6. Implement human handoff trigger and escalation state machine

Priority: High  
Labels: Feature

Acceptance criteria:

- Customer can explicitly request a human.
- Automatic triggers cover low confidence, unsupported topic, repeated unresolved turns, sensitive request, and customer frustration.
- AI generates handoff summary.
- Customer sees clear handoff status.
- Handoff state changes are persisted.

### 7. Build back-office support inbox

Priority: High  
Labels: Feature

Acceptance criteria:

- Staff can view conversations by status: waiting, assigned, active, resolved, closed.
- Staff can filter or search by status, priority, assigned staff, and date.
- Conversation detail shows transcript, customer info, AI summary, intent, priority, and timestamps.
- Inbox highlights conversations waiting for human action.

### 8. Implement staff accept, reply, internal note, and resolve workflow

Priority: High  
Labels: Feature

Acceptance criteria:

- Staff must accept ownership before replying.
- Conversation shows which staff member is assigned.
- Staff can send customer-visible replies.
- Staff can add internal notes.
- Staff can mark conversation resolved or closed.
- System prevents accidental duplicate ownership.

### 9. Add MVP staff notifications for human handoff

Priority: Medium  
Labels: Feature

Acceptance criteria:

- In-app notification is created when handoff is requested.
- Email notification is sent when staff are offline or no one accepts within configured threshold.
- Notification links to the support conversation.
- Notification status is tracked.

### 10. Configure basic availability, routing, and offline behavior

Priority: Medium  
Labels: Feature

Acceptance criteria:

- Admin can define business hours and on-call clerk.
- Handoffs route to on-call clerk or shared queue.
- Offline state asks customer for contact information and sets expectation.
- Routing rules are documented for future scaling.

### 11. Add chatbot QA, evals, and safety guardrails

Priority: High  
Labels: Feature

Acceptance criteria:

- Eval cases cover top FAQs, unsupported requests, explicit human request, low-confidence answer, prompt injection, and frustrated customer language.
- Manual QA review flow exists for sampled conversations.
- AI cannot expose internal-only knowledge.
- AI does not invent unsupported company/product claims.
- Escalation trigger tests pass before pilot launch.

### 12. Add support analytics and knowledge-gap reporting

Priority: Medium  
Labels: Feature

Acceptance criteria:

- Metrics track total conversations, AI resolution rate, handoff rate, unresolved rate, time to first AI response, time to first human response, and resolution status.
- Knowledge gaps are grouped by intent/topic.
- Staff can review unanswered or escalated questions.
- Weekly pilot report can be generated from stored data.

### 13. Define privacy, retention, and public-chat abuse controls

Priority: High  
Labels: Feature

Acceptance criteria:

- Transcript retention rule is documented.
- Public chat rate limits are defined.
- PII collection is minimized and documented.
- Staff access permissions are defined.
- Audit trail covers human handoff and staff replies.

### 14. Prepare pilot launch checklist

Priority: Medium  
Labels: Feature

Acceptance criteria:

- Pilot owner and support clerk are named.
- Initial knowledge base is reviewed.
- Test conversations are completed for top intents.
- Handoff notifications are verified.
- Rollback/disable path is documented.
- First-week monitoring cadence is defined.

## Suggested Sequencing

1. Product scope, knowledge base, and UX design.
2. Data model, AI answer service, and handoff state machine.
3. Back-office inbox and staff workflow.
4. Notifications, routing, analytics, and safety/evals.
5. Pilot checklist and launch.

