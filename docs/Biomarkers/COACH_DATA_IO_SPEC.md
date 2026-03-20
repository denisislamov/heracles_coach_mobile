# Heracles Digital Coach — Data Input/Output Specification

## Isolated Service Model

Heracles Digital Coach is designed as an **isolated service** that communicates with the Heracles platform via well-defined APIs. It does not directly access the platform database or frontend. All data exchange happens through:

- **Inbound:** REST API calls from the platform (or internal service-to-service calls)
- **Outbound:** REST API calls to the platform, structured JSON responses, and internal storage

---

## 1. Input Data (What the Coach Receives)

### 1.1 From Heracles Platform (Gabriel's API)

| Endpoint | Data Received | Format | When |
|----------|---------------|--------|------|
| `GET /api/users/{id}/profile` | User profile | JSON | On conversation start; refresh if >5 min stale |
| | `name`, `age`, `goals`, `dietary_requirements`, `allergies`, `training_level`, `lifestyle`, `weight`, `height` | | |
| `GET /api/users/{id}/biomarkers/latest` | Latest biomarker results | JSON array | On conversation start |
| | `marker_name`, `value`, `unit`, `reference_range`, `category`, `test_date` | | |
| | 46–72 markers: lipids, hormones, metabolic, inflammatory, etc. | | |
| `GET /api/users/{id}/biomarkers/history` | Biomarker history | JSON array | On conversation start |
| | Historical test dates with all marker values (for trend analysis) | | |
| `GET /api/users/{id}/wearable/summary` | Wearable data | JSON | On conversation start; refresh if >5 min stale |
| | Last 7 days: `RHR`, `HRV`, `sleep_duration`, `sleep_quality`, `strain`, `recovery`, `steps` | | |
| | 30-day averages: `RHR_avg`, `HRV_avg`, `sleep_avg` | | |
| | Trend direction: `RHR_trend`, `HRV_trend` | | |
| `GET /api/users/{id}/health-score` | Heracles Composite Health Score | JSON | On conversation start |
| | `total_score` (0–100), `domain_breakdown` (cardiovascular, metabolic, hormonal, fertility, recovery) | | |

### 1.2 From Coach's Own Storage (Denis's Service)

| Data | Source | When |
|------|--------|------|
| LLM-maintained user profile | Coach internal DB | Every turn |
| Recent meal logs (last 7 days) | Coach internal DB | Every turn |
| Active meal plan summary | Coach internal DB | On conversation start |
| Active training programme summary | Coach internal DB | On conversation start |
| Conversation history (last 20–30 messages) | Coach internal DB | Every turn |

### 1.3 From User (Real-time via Chat)

| Input | Format | Purpose |
|-------|--------|---------|
| Free-text message | String | Main conversation |
| Meal log (conversational) | "I just had X for lunch" | Parsed by Coach → creates meal entry |
| Meal log (form) | `meal_type`, `description`, `photo_url?`, `timestamp` | Direct meal logging |
| Feedback | `thumbs_up` / `thumbs_down`, optional `text` | Per-message feedback |
| Onboarding responses | Free text | Saved to profile |

### 1.4 For Weekly Snapshot (Batch from Gabriel)

| Data | Source | When |
|------|--------|------|
| Aggregated weekly data | Gabriel's background job → Coach API | Every Sunday |
| | `meal_log_count`, `nutritional_averages`, `training_sessions_completed`, `wearable_averages` | |

### 1.5 For Notification Triggers (Event-based from Gabriel)

| Event | Data Passed | When |
|-------|-------------|------|
| Workout synced | `user_id`, `workout_type`, `strain`, `duration`, `zone2_minutes` | Within 30 min of sync |
| Poor sleep detected | `user_id`, `sleep_hours`, `baseline` | Morning after |
| HRV low 3+ days | `user_id`, `hrv_days` | Morning of day 4 |
| No meals logged 3+ days | `user_id`, `days_since_last_log` | Early afternoon |
| Biomarker results ready | `user_id` | Within 1 hr of processing |

---

## 2. Output Data (What the Coach Produces)

### 2.1 To Heracles Platform (API Calls)

| Endpoint | Data Sent | When |
|----------|-----------|------|
| `PATCH /api/users/{id}/profile` | Updated profile fields from onboarding | After onboarding completion |
| | `goals`, `dietary_requirements`, `allergies`, `training_level`, `lifestyle`, `weight`, `height`, etc. | |
| `POST /api/users/{id}/biological-age` | PhenoAge calculation result | On new biomarker results |
| | `biological_age`, `chronological_age`, `gap`, `marker_contributions[]` | |
| `POST /api/notifications` | Notification payload | When Coach triggers notification |
| | `type`, `user_id`, `title`, `message`, `action_url` | |

### 2.2 Structured Outputs (JSON to Frontend)

| Artefact | Schema | Delivered Via |
|----------|--------|---------------|
| **Meal Plan** | `plan_name`, `date_generated`, `days_count`, `target_macros`, `days[]` → `meals[]` → `meal_id`, `meal_type`, `name`, `description`, `macros`, `prep_time_minutes`, `recipe` | Chat response + stored in Coach DB |
| **Recipe** (ad-hoc) | Same as meal in plan | Chat response |
| **Shopping List** | `linked_meal_plan_id`, `date_generated`, `total_items`, `categories[]` → `items[]` (`name`, `quantity`, `unit`, `checked`) | Chat response + stored |
| **Training Programme** | `programme_name`, `phase_name`, `phase_duration_weeks`, `sessions_per_week`, `target_zone2_minutes`, `sessions[]` → `exercises[]` | Chat response + stored |

### 2.3 To User (Chat Interface)

| Output | Format | When |
|--------|--------|------|
| Coach response | Markdown string | Every user message |
| Streaming text | Token stream | During generation |
| Suggested questions | Array of 3–4 strings | Below input field |
| Meal plan card | JSON → rendered by frontend | On plan generation |
| Shopping list card | JSON → rendered by frontend | On list generation |
| Training programme card | JSON → rendered by frontend | On programme generation |

### 2.4 Weekly Snapshot Output

| Output | Format | When |
|--------|--------|------|
| Snapshot summary | Text (LLM-generated) | Sunday 9am |
| | Logging consistency, nutritional highlights, training summary, wearable trends, 1 actionable insight, 1 biomarker impact line | |
| | Stored via Gabriel; push notification sent by Gabriel | |

### 2.5 Internal Storage (Coach Service)

| Data | Purpose |
|------|---------|
| LLM-maintained user profile (with version history) | Injected into every conversation |
| Conversation messages | Persistence, context injection |
| Meal logs | Daily/weekly views, context injection |
| Active meal plan (full JSON) | Context, dashboard pinning |
| Active training programme (full JSON) | Context, dashboard pinning |
| Shopping list | Dashboard pinning |
| Snapshot archive | User browsable history |
| Feedback (thumbs + text) | Per-message, linked to conversation |
| Flagged responses | Admin review |

### 2.6 Dashboard Integration (Data Provided to Gabriel)

| Data | Purpose |
|------|---------|
| Meal plan JSON | Gabriel renders as dashboard card |
| Shopping list JSON | Gabriel renders as dashboard card |
| Training programme JSON | Gabriel renders as dashboard card |
| Biomarker trend data + annotations | Gabriel renders chart |
| Wearable card commentary | One-line LLM insight per metric (RHR, HRV, sleep) |

---

## 3. Data Flow Diagram (Isolated Service)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HERACLES PLATFORM (Gabriel)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ User Profile│  │  Biomarkers   │  │  Wearables   │  │ Health Score  │  │
│  │   (DB)      │  │    (DB)      │  │    (DB)      │  │    (DB)       │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └───────┬───────┘  │
│         │                │                 │                 │          │
│         └────────────────┴─────────────────┴─────────────────┘          │
│                                  │                                      │
│                                  ▼                                      │
│                    ┌─────────────────────────────┐                      │
│                    │    API Gateway / Endpoints   │                      │
│                    └──────────────┬──────────────┘                      │
└───────────────────────────────────┼──────────────────────────────────────┘
                                    │
                                    │  GET profile, biomarkers, wearable, health-score
                                    │  PATCH profile
                                    │  POST biological-age, notifications
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              HERACLES DIGITAL COACH (Isolated Service)                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Context Injection Layer                        │   │
│  │  Fetches: profile, biomarkers, wearable, meal logs, plans,        │   │
│  │           conversation history, coach profile                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    LLM Service Layer                              │   │
│  │  Chat │ Profile Update │ Snapshot │ Structured Outputs            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Coach Internal Storage                         │   │
│  │  Profile │ Conversations │ Meal Logs │ Plans │ Programmes          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    PhenoAge Calculator                            │   │
│  │  Input: 9 biomarkers + age → Output: biological_age + breakdown   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Guardrail Layer                                │   │
│  │  Validates every response before delivery                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │  JSON responses (meal plan, shopping list, programme)
                                    │  Snapshot text
                                    │  Notification payloads
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Gabriel)                               │
│  Chat UI │ Dashboard Cards │ Settings │ Onboarding                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. API Contract Summary

### 4.1 Coach Service Exposes (for Platform to Call)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/coach/chat` | Send user message, receive coach response (streaming or full) |
| POST | `/coach/meal-log` | Create meal log (from form or parsed from chat) |
| GET | `/coach/conversations` | List user's conversations |
| GET | `/coach/conversations/{id}` | Get conversation with messages |
| POST | `/coach/snapshot` | Generate weekly snapshot (called by Gabriel's cron) |
| POST | `/coach/notification-content` | Generate notification content for event triggers |

### 4.2 Coach Service Consumes (Platform Provides)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/users/{id}/profile` | Fetch user profile |
| PATCH | `/api/users/{id}/profile` | Update profile from onboarding |
| GET | `/api/users/{id}/biomarkers/latest` | Fetch latest biomarkers |
| GET | `/api/users/{id}/biomarkers/history` | Fetch biomarker history |
| GET | `/api/users/{id}/wearable/summary` | Fetch wearable summary |
| GET | `/api/users/{id}/health-score` | Fetch health score |
| POST | `/api/users/{id}/biological-age` | Store PhenoAge result |
| POST | `/api/notifications` | Trigger notification |

---

## 5. Data Retention & Privacy

- **Health data:** All inputs and outputs are special category data under GDPR Article 9.
- **Consent:** Coach requires explicit consent before first use.
- **Deletion:** User can request full deletion of all Coach data (conversations, meal logs, profile, plans).
- **LLM providers:** DPA with Anthropic/OpenAI, zero-data-retention for user health data.
- **Coach storage:** Encrypted at rest, access controlled, audit logged.
