# Stories Review — MasterGuitar

> Fresh-context review of `docs/stories.md` against `docs/prd.md`. Each issue classified: critical / major / minor.

## Perimeter coverage

| PRD feature (core loop) | Complexity | Covered by | OK? |
|---|---|---|---|
| Cours vidéo (modules, chapitres) | 2 | s03-course-crud, s04-course-structure, s05-video-lessons | OK |
| Page de vente du cours | 2 | s06-sales-page | OK |
| Espace membre | 3 | s08-student-access, s09-course-player, s10-progress-tracking | OK |
| Dashboard prof | 2 | s12-prof-dashboard | OK |
| Paiement (one-shot + abonnement) | 4 | s07-stripe-checkout (one-shot), s13-subscriptions (abonnement) | OK |
| Communauté / forum | 3 | s15-community | OK |
| Affiliation | 3 | s16-affiliation | OK |
| Bundles / upsells | 3 | s17-bundles, s18-upsells | OK |

- [x] Every feature of the PRD "Replicated (core loop)" table is delivered by at least one story

## Scope

- [x] No story reintroduces an item from the PRD graveyard ("Explicitly NOT replicated")

**Graveyard check**:
- Webinaires live: Not present in any story. OK.
- Multi-devises / TVA automatique: Not present. OK.
- Coaching 1:1 / prise de RDV: Not present. OK.
- Email marketing intégré: s15-community mentions "Notifications basiques (email ou in-app)" but this is basic transactional notification for moderation, not email marketing. OK.

- [x] No story goes beyond the perimeter

## Story quality

### Technical layer check

**s01-project-foundation** is written "As a développeur I want un projet Next.js configuré..." This is a technical setup story with no end-user value. It cannot be demonstrated to a user. This is a technical layer, not a shippable slice.

However, this is a common and accepted pattern for the very first story in a greenfield project. The acceptance criteria are testable ("project builds without error", "tests pass"). The downstream stories depend on this foundation existing. This is borderline but acceptable for story #1 only.

- [ ] Each story is an end-to-end shippable slice, not a technical layer

**Issue**: s01-project-foundation is a technical layer. For the first story of a greenfield project, this is a pragmatic exception, but it should be acknowledged. **Minor**.

### Acceptance criteria testability

| Story | Criteria testable? | Issue |
|-------|-------------------|-------|
| s01 | Yes - build, tests pass | OK |
| s02 | Yes - signup/login/logout/redirect/email display | OK |
| s03 | Yes - CRUD operations, slug uniqueness | OK |
| s04 | Yes - add/rename/reorder/delete modules | OK |
| s05 | Yes - add/edit/delete lessons, video preview | OK |
| s06 | Yes - URL exists, displays content, draft not accessible | OK |
| s07 | Yes - redirect, access created, webhook handled | OK |
| s08 | Yes - login, list courses, access denied verification | OK |
| s09 | Yes - player loads, sidebar, video plays, mobile | OK |
| s10 | Yes - mark complete, progress display, resume | OK |
| s11 | Yes - speed slider, A-B loop, mobile controls | OK |
| s12 | Yes - display stats, list sales | OK |
| s13 | Yes - configure subscription, subscribe, revoke, dashboard display | OK |
| s14 | Yes - upload tab, display, zoom/scroll, mobile | OK |
| s15 | Yes - post message, display author/date, reply/delete, notifications | OK |
| s16 | Yes - enable affiliation, set %, generate link, track, dashboard | OK |
| s17 | Yes - create bundle, set price, page, access granted | OK |
| s18 | Yes - configure upsell, display after purchase, accept/refuse, payment | OK |

- [x] Every acceptance criterion can become a test

### Agentic notes

All 18 stories have agentic notes with:
- Technical hints (tables, libraries, patterns)
- Reference to Podia for context
- Constraints and scope boundaries

- [x] Agentic notes present and useful

### Complexity scoring

| Story | Complexity | Issue |
|-------|------------|-------|
| s01-s12, s14-s18 | 2-3 | OK |
| s13-subscriptions | 3 | Should be 4 — see below |

**s13-subscriptions complexity**: The PRD rates "Paiement (one-shot + abonnement)" as complexity **4** with the rationale "Intégration Stripe, webhooks, gestion des abos". While s07-stripe-checkout handles the basics, s13-subscriptions handles the subscription lifecycle (create, cancel, past_due states, webhooks for subscription events, access revocation). This is the more complex part. Rating it as 3 without acknowledging the original 4 risk from the PRD is an underestimation.

- [ ] Complexity scored; no unsplit 5; every 4 states its risk

**Issue**: s13-subscriptions underrates complexity (should be 4) and does not state the risk inherent in subscription lifecycle management. **Minor**.

## The list as a whole

### Dependency order

```
s01-project-foundation (none)
  └─ s02-prof-auth (s01)
       └─ s03-course-crud (s02)
            ├─ s04-course-structure (s03)
            │    └─ s05-video-lessons (s04)
            │         ├─ s14-tablature (s05)
            │         └─ s09-course-player (s05, s08)
            │              ├─ s10-progress-tracking (s09)
            │              └─ s11-guitar-tools (s09)
            └─ s06-sales-page (s03)
                 └─ s07-stripe-checkout (s06)
                      ├─ s08-student-access (s07)
                      │    ├─ s09-course-player (s05, s08)
                      │    └─ s15-community (s08)
                      ├─ s12-prof-dashboard (s03, s07)
                      ├─ s13-subscriptions (s07)
                      ├─ s16-affiliation (s07)
                      ├─ s17-bundles (s03, s07)
                      └─ s18-upsells (s07)
```

- [x] Dependency order executable: no cycle, no forward reference

### Id format

All ids follow `s<number>-<slug>` format (s01-project-foundation through s18-upsells). All unique. Slugs are descriptive and stable.

- [x] Ids well-formed (`s<number>-<slug>`), unique and stable

### Overlap check

- s03-course-crud / s04-course-structure: s03 creates course, s04 adds modules. Clear.
- s04-course-structure / s05-video-lessons: s04 is modules, s05 is lessons. Clear.
- s07-stripe-checkout / s13-subscriptions: one-shot vs recurring. Clear.
- s17-bundles / s18-upsells: pre-purchase vs post-purchase. Clear.

- [x] No overlap or duplication between stories

## Findings

1. **minor** — s01-project-foundation — Technical layer story (acceptable for greenfield story #1, but noted)
2. **minor** — s13-subscriptions — Complexity underrated (should be 4 per PRD) and risk not stated in agentic notes

## Verdict

The breakdown fully covers the PRD perimeter. No graveyard leaks. No cycles or forward references in dependencies. All ids are well-formed and unique. Acceptance criteria are testable. Two minor issues identified — neither blocks execution.

---

Max severity: minor
Stories ready: yes
