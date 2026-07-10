# Workflow: PRD To Linear

Purpose: turn either a rough product idea or an already-built project into validated product documentation and Linear work.

## Operating Rules

- Lead with understanding before writing requirements.
- Support two modes: idea-to-Linear and built-product-to-Linear.
- Convert messy context or finished implementation evidence into explicit assumptions, open questions, and scope boundaries.
- In built-product mode, describe what exists now before recommending what should come next.
- Do current best-practice research when the feature touches a market, workflow, regulation, vendor ecosystem, AI behavior, or user expectation that may have changed.
- Produce the PRD before producing Linear issues.
- Do not post issues until the issue structure is internally consistent and the target Linear team is known.
- Read back created Linear work after posting.

## Mode A: Idea To Linear

1. Capture raw input.
   - Accept voice notes, pasted text, screenshots, existing docs, or a short idea.
   - Restate the ask in plain language.
   - Identify product goal, primary users, and intended business outcome.

2. Create a product brief.
   - Problem statement.
   - Personas.
   - Jobs to be done.
   - Current assumptions.
   - Open questions.
   - In scope and out of scope.

3. Research and validate.
   - Search current best practices when needed.
   - Prefer primary sources, official docs, credible vendor docs, research papers, and recent industry examples.
   - Extract implications, not generic summaries.
   - Convert research into product principles.

4. Draft the PRD.
   - Summary.
   - Problem.
   - Goals and non-goals.
   - Personas.
   - User journeys.
   - Functional requirements.
   - Data/state requirements.
   - Nonfunctional requirements.
   - Safety/privacy/security.
   - Metrics.
   - Rollout plan.
   - Open questions.

5. Convert PRD to Linear-ready work.
   - Create one parent tracking issue when the feature is broad.
   - Break work into child issues that can be independently built and reviewed.
   - Each issue must include title, priority, labels, description, and acceptance criteria.
   - Prefer issue names that start with verbs.
   - Keep dependencies visible in the issue plan.

6. Validate Linear context.
   - Confirm target team.
   - Confirm project if one exists or is requested.
   - Confirm labels, priorities, assignee, cycle, and due dates if needed.
   - If team/project cannot be discovered, ask the user before posting.

7. Post to Linear.
   - Create the parent issue first.
   - Create child issues with `parentId`.
   - Use consistent labels and priorities.
   - Link or mention the PRD artifact when possible.

8. Read back and confirm.
   - Search/list created issues.
   - Confirm issue count, parent/child grouping, URLs, and any failures.
   - State whether the original definition of done is met.

## Mode B: Built Product To Linear

Use this when the product was already built/refined in Replit, Claude, Lovable, Cursor, another builder, GitHub, or a local project folder.

1. Confirm source of truth.
   - Identify the local folder, GitHub repo/branch, exported files, live URL, README, screenshots, or other project source.
   - Confirm the user considers the product implementation done enough to document.

2. Inspect the product.
   - Review README, package files, routes/pages, components, data models, API handlers, config, tests, and deployment files.
   - Run the app or tests only when needed and feasible.
   - Capture what is actually implemented, not what should have been implemented.

3. Reconstruct the PRD.
   - Write the PRD from the finished product.
   - Separate shipped behavior, inferred assumptions, known gaps, future roadmap, and recommended follow-up.

4. Post Linear product documentation.
   - Create a Linear document for the PRD when the target team/project is known.
   - Treat this document as the product truth for the shipped project.

5. Create follow-up Linear work.
   - Create issues for bugs, missing tests, documentation gaps, launch/pilot tasks, security/privacy/accessibility risks, technical debt, polish, and roadmap work.
   - Do not create fake implementation tasks for work that is already complete.

6. Read back and confirm.
   - Confirm the Linear document, parent issue if used, follow-up issue count, URLs, and any failures.
   - State whether the built-product documentation flow is done.

## Done Criteria

- PRD exists and is coherent.
- For idea mode, Linear issue plan exists with acceptance criteria.
- For built-product mode, Linear documentation exists and follow-up issues reflect remaining work only.
- Linear integration is verified.
- Documents/issues are posted to Linear or an explicit blocker is documented.
- Created issues are read back and summarized.
- A reusable workflow or Codex skill exists for future PRD-to-Linear work.
