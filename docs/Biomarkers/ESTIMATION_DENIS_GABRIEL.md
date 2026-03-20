Heracles AI Coach — Task Estimation

Denis Islamov (AI Coach Developer) & Gabriel (CTO)

  All UI → Gabriel
  Backend, LLM, APIs, logic, storage, guardrails → Denis

  1 day = 8 hours


================================================================================
Part 1: Denis Islamov
================================================================================

  E1. Chat API
    Chat endpoint, streaming response, suggested questions (logic by journey stage),
    feedback storage (thumbs up/down)
    32 - 64 hours

  E2. Onboarding
    8-step conversational flow in system prompt, data-aware logic,
    save to profile (Gabriel + coach)
    32 - 56 hours

  E3. LLM Integration
    Model-agnostic layer (Claude + OpenAI), system prompt config, streaming,
    context injection, caching, error handling, cost logging
    56 - 96 hours

  E4. Profile & Memory
    LLM-maintained profile, update after conversation, version history,
    injection into every turn
    48 - 80 hours

  E5. Meal Logging Backend
    Meal log API, conversational parsing, LLM macro estimation, portion clarification,
    data for daily/weekly views
    40 - 64 hours

  E6. Structured Outputs
    Meal plans (7-day JSON), recipes, shopping lists, training programmes —
    schemas, generation, swap logic. Data for dashboard
    96 - 160 hours

  E7. PhenoAge
    Calculation from 9 biomarkers (Levine formula), store via API,
    inject into context, coach behaviour
    24 - 48 hours

  E8. Guardrails & Safety
    Output validation layer, clinical language detection, mental health crisis,
    eating disorders, symptom escalation, medication flagging, persona drift
    64 - 112 hours

  E9. Notifications
    Specification for 15 types, weekly snapshot flow (LLM call),
    notification content generation API
    32 - 64 hours

  Integration & Testing
    Gabriel API integration, E2E testing, adversarial run, bug fixes
    48 - 96 hours

  ----------------------------------------
  Denis TOTAL:  472 - 840 hours  (59 - 105 days)


================================================================================
Part 2: Gabriel
================================================================================

  G1. API Endpoints
    8 endpoints for Coach: profile (GET/PATCH), biomarkers (latest/history),
    wearable summary, health-score, biological-age (POST), notifications (POST)
    64 - 120 hours

  G2. Biomarker Storage
    Already exists — ensure schema supports Coach needs, reference ranges
    8 - 24 hours

  G3. Wearable Integrations
    Whoop, Apple Health, Garmin, Oura, Fitbit, Samsung Health —
    sync, normalise, summary endpoint
    200 - 360 hours

  G4. Dashboard
    Layout, cards for meal plan, shopping list, training programme,
    biomarker trends, wearable trends
    96 - 160 hours

  G5. Push Notifications
    Notification engine, delivery infrastructure, quiet hours, user preferences,
    15 notification types
    80 - 144 hours

  G6. Chat UI
    Floating widget, full-screen tab, shared state, Markdown rendering,
    message layout, input, thumbs up/down UI, disclaimer modal,
    suggested questions UI, AI label
    80 - 144 hours

  G7. Meal Logging UI
    Log Meal button, form, daily view, weekly consistency view
    32 - 64 hours

  G8. Settings & Coach Integration
    Settings page (profile, notifications, conversations), Coach API client,
    streaming, real-time plan updates
    40 - 80 hours

  Integration & Testing
    E2E with Coach service, bug fixes
    32 - 64 hours

  ----------------------------------------
  Gabriel TOTAL:  632 - 1160 hours  (79 - 145 days)


================================================================================
Summary
================================================================================

  Denis    472 - 840 hours   (59 - 105 days)
  Gabriel  632 - 1160 hours  (79 - 145 days)

  Critical path: Wearable integrations (G3) and Structured Outputs (E6).
  Denis can progress with mock wearable data; Gabriel's endpoints affect Denis from Week 2-3.

  Parallel work: Denis needs Gabriel's profile and biomarkers by Week 1-2;
  wearable and notifications by Week 4-5. Gabriel needs Coach's chat API from Denis.


================================================================================
Denis MVP — 6-8 days (48-64 hours)
================================================================================

  Goal: working chat with personalised coach. Minimum for demo and testing.

  In MVP: chat, LLM, basic context, conversation persistence, minimal guardrails.
  Out of MVP: meal logging, meal plans, PhenoAge, notifications, full onboarding.


  Day 1 (8h)  LLM + Chat foundation
    - Claude API integration (single provider for MVP)
    - System prompt in config file (base version from Tom)
    - Chat endpoint: POST /coach/chat (user_id, message) → response
    - No streaming (full response) — faster for MVP

  Day 2 (8h)  Context injection
    - Call GET /api/users/{id}/profile (Gabriel)
    - Inject profile into system prompt
    - Store messages in DB (conversation_id, role, content, timestamp)
    - Last 10-15 messages in context

  Day 3 (8h)  Conversation persistence
    - List conversations: GET /coach/conversations
    - Continue conversation: load history by conversation_id
    - New conversation: POST /coach/conversations
    - LLM error handling, fallback message

  Day 4 (8h)  Onboarding (simplified)
    - 4-5 key steps in prompt: goals, nutrition, training, lifestyle
    - Detect "first time" by empty profile or flag
    - PATCH /api/users/{id}/profile on onboarding completion
    - Data-aware: don't ask for info already in profile

  Day 5 (8h)  Guardrails (minimum)
    - Output validation: pattern matching for clinical language
      (diagnoses, dosages, "you have", "you are suffering from")
    - Mental health: on keywords — response with Samaritans 116 123, SHOUT 85258
    - Flag without block (log, don't show on serious)

  Day 6 (8h)  Integration + suggested questions
    - 3-4 suggested questions (static for MVP) in API response
    - Integration with Gabriel: verify all profile calls
    - Basic API cost logging
    - E2E testing

  Day 7-8 (16h)  Polish + tests
    - Bug fixes
    - Adversarial tests (5-10 prompts from Tom)
    - API documentation for Gabriel
    - Ready for UI integration


  MVP scope summary

    In scope:
      - Chat API (send message, get response)
      - LLM (Claude), system prompt from config
      - Context: Gabriel profile + last messages
      - Persistence: conversation list, continue
      - Simplified onboarding (4-5 steps), save to profile
      - Basic guardrails (clinical, mental health)
      - Suggested questions (static)

    Out of scope (post-MVP):
      - Streaming
      - Meal logging
      - Meal plans, shopping lists, training programmes
      - PhenoAge
      - LLM-maintained profile (versioning)
      - Notifications
      - Thumbs up/down feedback
