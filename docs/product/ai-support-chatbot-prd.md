# PRD: AI Customer Support Chatbot With Human Handoff

Status: Draft v0.1  
Date: 2026-07-09  
Product owner: Michael Ibekie  
Working partner: Codex

## 1. Summary

Build a website support experience that answers routine customer questions through an L1 AI support agent, then escalates to a human support clerk when the AI cannot confidently resolve the issue or when the customer asks for a person. The company-side experience must let staff see support conversations, accept handoffs, reply as a human, receive notifications when help is needed, and improve the knowledge base over time.

This is a hybrid support system, not a deflection wall. The product should make simple questions instant, preserve trust through transparent limits, and make the human transition feel continuous.

## 2. Problem

SAGE needs a scalable support entry point on the website. Today, users may need basic company information, product guidance, or help from a person. Without an AI-first support workflow, the team risks slow replies, scattered context, and no structured way to learn from support demand.

The key product challenge is balancing automation with trust:

- Customers want fast answers, but do not want to feel trapped by a bot.
- Staff need a queue that makes required human support visible and actionable.
- The system must scale from a tiny team to future multi-agent routing.
- AI answers must be grounded in approved company/product knowledge.

## 3. Research-Informed Principles

- Be transparent about what the AI can and cannot do. Research on chatbot adoption shows users avoid gatekeeper-style bots when failure and transfer feel uncertain; transparency, wait-time cues, and faster human access improve adoption. Source: https://arxiv.org/abs/2504.06145
- Carry context into human handoff. Salesforce describes chatbot value as 24/7 fast response, with the bot collecting and analyzing case information so transfers can route to the right agent. Source: https://www.salesforce.com/agentforce/chatbot/
- Ground answers in maintained knowledge. OpenAI retrieval guidance supports semantic search over owned data, and Zendesk emphasizes connecting AI agents to help centers, external docs, policies, and QA controls. Sources: https://developers.openai.com/api/docs/guides/retrieval and https://www.zendesk.com/service/ai/ai-agents/
- Treat support AI as an evaluated product, not a one-time prompt. OpenAI eval guidance frames evaluations as tests for style/content criteria, and recent customer-support-agent research emphasizes structured context engineering, human-in-the-loop prompt iteration, offline simulation, and online measurement. Sources: https://developers.openai.com/api/docs/guides/evals and https://arxiv.org/abs/2606.08867
- Escalate early when the failure is emotional or trust-sensitive. A 2026 field experiment found human intervention quality depends on failure type and timing; early intervention is especially important after AI failure. Source: https://arxiv.org/abs/2605.14830
- Optimize the hybrid system. Research on combining human operators and virtual agents suggests well-tuned hybrid systems can reduce wait time and increase satisfaction. Source: https://arxiv.org/abs/2209.05226

## 4. Goals

- Answer common company, product, hours, location, contact, pricing, and onboarding questions instantly.
- Let customers request a human from the chat at any point.
- Automatically escalate conversations when the AI is uncertain, stuck, out of scope, or the customer appears frustrated.
- Provide a back-office support inbox where staff can review, accept, and respond to handoffs.
- Notify the responsible staff member when a human response is needed.
- Capture analytics and knowledge gaps so support quality improves over time.

## 5. Non-Goals For MVP

- Full omnichannel support across email, SMS, WhatsApp, voice, and social.
- Native iOS staff app. MVP should design for future push notifications, but start with web/in-app and email notification paths.
- Complex skill-based routing across a large support team.
- Automated refunds, billing changes, account modifications, or high-risk operational actions.
- Replacing human support for sensitive or complex scenarios.

## 6. Users And Personas

- Customer or website visitor: needs quick help, product info, contact details, or access to a human.
- L1 AI support agent: answers approved questions, asks clarifying questions, and identifies escalation triggers.
- Support clerk or back-office user: monitors open support requests, accepts handoffs, and replies to customers.
- Admin or future support lead: manages knowledge, routing rules, availability, and support quality metrics.

## 7. User Journeys

### 7.1 Customer Gets An AI Answer

1. Customer opens chat on website.
2. AI greets them and sets expectation that it can answer common questions and connect them to a person.
3. Customer asks a company or product question.
4. AI retrieves approved knowledge, answers succinctly, and offers a follow-up.
5. Conversation is logged with answer outcome.

### 7.2 Customer Requests A Human

1. Customer says "I want to talk to someone" or clicks a human handoff control.
2. AI acknowledges the request and asks for missing contact/context if needed.
3. Conversation enters `handoff_requested`.
4. Support staff receive notification.
5. A staff member accepts the conversation.
6. Customer sees that a human joined.
7. Staff reply in the same conversation with full prior context visible.

### 7.3 AI Escalates Proactively

1. AI detects low confidence, repeated failed attempts, unsupported request, urgency, frustration, or sensitive content.
2. AI stops trying to over-answer.
3. AI explains that a human is better suited to help.
4. Handoff flow begins.

### 7.4 Staff Handles Support Queue

1. Staff opens support inbox in the back office.
2. Inbox shows conversations grouped by status: waiting, assigned, active, resolved.
3. Staff opens a conversation and sees transcript, customer info, AI summary, intent, and suggested priority.
4. Staff accepts the handoff.
5. Staff replies and resolves or leaves it open.

## 8. Functional Requirements

### 8.1 Website Chat Widget

- Must be available from the website.
- Must support typed customer messages.
- Must show whether the customer is speaking with AI or a human.
- Must include an obvious "talk to a person" path.
- Must preserve the conversation if the customer navigates within the site during a session.

### 8.2 L1 AI Support Agent

- Must answer from approved company/product knowledge.
- Must refuse or escalate when it lacks reliable information.
- Must ask clarifying questions before answering ambiguous requests.
- Must identify common intents: contact info, hours, location, product questions, pricing, onboarding, troubleshooting, account help, complaint, sales interest, and human request.
- Should include lightweight source or confidence metadata internally for QA.
- Should generate a short handoff summary when escalating.

### 8.3 Knowledge Base

- Must support an initial curated knowledge set: company overview, contact info, hours, location, product descriptions, FAQs, support policies, escalation rules.
- Must track source title, owner, last reviewed date, and status.
- Must support knowledge gap capture from unanswered or escalated chats.
- Should support future ingestion from docs, website pages, and internal product material.

### 8.4 Human Handoff

- Must let the customer request a human at any point.
- Must escalate automatically for low confidence, repeated unresolved turns, sensitive topics, or customer frustration.
- Must preserve transcript, customer details, detected intent, and AI summary for staff.
- Must show customer-facing status: waiting for human, human joined, staff offline, or follow-up requested.
- Must support asynchronous handoff when no staff member is online.

### 8.5 Back-Office Support Inbox

- Must show all support conversations requiring attention.
- Must support statuses: AI active, handoff requested, waiting for staff, assigned, human active, resolved, closed.
- Must let staff accept ownership before replying.
- Must prevent two staff members from unknowingly replying at the same time.
- Must include transcript, AI summary, customer info, intent, priority, timestamps, and internal notes.
- Should support search and filters by status, priority, assigned staff, and date.

### 8.6 Notifications

- Must notify staff when a human handoff is requested.
- MVP notification channels: in-app notification and email.
- Should support notification preferences and business-hours behavior.
- Future: iOS push notification for on-call staff.

### 8.7 Routing And Availability

- Must support a basic "on-call support clerk" configuration.
- Must support business-hours and offline behavior.
- Should route all MVP handoffs to a shared queue if no specific clerk is available.
- Future: skill-based, team-based, and workload-aware routing.

### 8.8 Analytics And QA

- Must track total conversations, AI-resolved conversations, handoff rate, unresolved rate, time to first AI answer, time to human response, and resolution status.
- Must track knowledge gaps and common intents.
- Must support manual review of sampled AI conversations.
- Should support eval cases for top intents, refusal behavior, handoff triggers, and prompt-injection attempts.

## 9. Data And State Model

Core entities:

- Conversation: id, channel, customer id/contact, status, created time, updated time, assigned staff, resolved time.
- Message: id, conversation id, sender type, body, timestamp, metadata.
- Handoff: id, conversation id, trigger type, requested time, accepted time, accepted by, status.
- Knowledge source: id, title, owner, content, source URL/file, last reviewed, status.
- Notification: id, recipient, channel, conversation id, status, sent time.
- QA review: id, conversation id, reviewer, rating, notes, action items.

## 10. Safety, Privacy, And Compliance

- Do not expose private internal context to customers.
- Do not claim certainty when the knowledge source is missing or stale.
- Log AI answers, handoff triggers, and staff actions for auditability.
- Add rate limits and abuse protection for public chat.
- Add prompt-injection tests before launch.
- Define retention rules for chat transcripts.
- Avoid collecting unnecessary personal information.

## 11. Success Metrics

- At least 60% of common-information conversations resolved by AI in pilot.
- Human handoff available within one click or one natural-language request.
- Median first AI response under 3 seconds after request receipt.
- Median first human response target defined by business hours; MVP baseline measured before committing SLA.
- 90%+ of handoffs include AI-generated summary and transcript.
- 100% of low-confidence and explicit-human-request cases trigger handoff.
- Weekly knowledge-gap report produced from unresolved/escalated conversations.

## 12. MVP Release Plan

### Phase 0: Product And Knowledge Setup

- Approve PRD and scope.
- Seed initial support knowledge.
- Define escalation and offline rules.
- Define QA/eval cases.

### Phase 1: Website AI Support MVP

- Launch chat widget.
- Implement L1 AI answering from knowledge.
- Capture transcripts and conversation state.
- Support explicit human request.

### Phase 2: Human Handoff And Back Office

- Build support inbox.
- Add accept/reply/resolve workflow.
- Add in-app and email notifications.
- Add analytics and knowledge-gap capture.

### Phase 3: Scaling

- Add advanced routing, richer analytics, on-call scheduling, and future mobile push support.

## 13. Open Questions

- What website stack and authentication model will host the chat widget?
- What internal system should serve as the source of truth for support knowledge?
- What customer identity is available before login?
- Who is the first on-call support clerk?
- What email address should notifications come from?
- Should the MVP store anonymous visitor conversations, and for how long?
- Should Linear receive customer support bugs/features generated from escalations later, or should those stay in a helpdesk?

