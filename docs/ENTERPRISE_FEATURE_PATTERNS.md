# Enterprise-Grade Feature Patterns — Optimal Solutions

> A breadth-first catalog of **product-agnostic feature types** → **optimal enterprise solution**.
> No explanations — just the pattern name. Research each as needed.

---

## 1. Workflow & Process Orchestration

| Feature Type                                 | HLD (Architecture)                                             | LLD (Implementation)                                    |
| -------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------- |
| Order lifecycle / multi-step process         | **State Machine** (XState, AWS Step Functions)                 | **State transition table + guard conditions**           |
| Long-running business process (days/weeks)   | **Saga Pattern** (Orchestration-based)                         |                                                         |
| Approval chains / human-in-the-loop          | **Workflow Engine** (Temporal, Camunda)                        |                                                         |
| Scheduled/recurring jobs                     | **Distributed Scheduler** (Quartz, Temporal Schedules)         |                                                         |
| Retry with backoff on transient failures     | **Persistent Job Queue** (BullMQ, Sidekiq, Celery)             | **Exponential Backoff with Jitter + Dead Letter Queue** |
| Background job processing                    | **Persistent Job Queue** (BullMQ, Sidekiq, Celery)             |                                                         |
| Data pipeline / ETL                          | **DAG-based Orchestration** (Airflow, Dagster, Prefect)        |                                                         |
| Feature flags / progressive rollout          | **Feature Flag Service** (LaunchDarkly, Unleash, Flagsmith)    |                                                         |
| A/B testing / experimentation                | **Experimentation Platform** (Statsig, Optimizely, GrowthBook) |                                                         |
| Multi-step form / wizard                     | **State Machine + Draft Persistence**                          | **Draft state serialization to storage**                |
| Constraint-based scheduling (Agendas/Shifts) |                                                                | **Constraint Satisfaction Problem (CSP) Solver Engine** |

---

## 2. Data Management & Storage

| Feature Type                               | HLD (Architecture)                                                | LLD (Implementation)                                           |
| ------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| Audit trail / who changed what             | **Event Sourcing**                                                |                                                                |
| Undo / version history                     | **Event Sourcing + Snapshot**                                     |                                                                |
| Soft delete with recovery                  |                                                                   | **Tombstone Pattern + TTL-based Purge**                        |
| Optimistic concurrency (multi-user edits)  |                                                                   | **Vector Clocks / OT / CRDT**                                  |
| Real-time collaborative editing            | **CRDT** (Yjs, Automerge)                                         |                                                                |
| Full-text search                           | **Inverted Index Engine** (Elasticsearch, Meilisearch, Typesense) |                                                                |
| Faceted / filtered search                  | **Elasticsearch with Aggregations**                               |                                                                |
| Time-series data (metrics, IoT)            | **Time-Series Database** (TimescaleDB, InfluxDB, QuestDB)         |                                                                |
| Data archival / tiered storage             | **Hot-Warm-Cold Architecture**                                    |                                                                |
| Cross-service data consistency             | **Saga Pattern**                                                  | **Outbox Pattern**                                             |
| Database schema evolution                  |                                                                   | **Expand-Contract Migration Pattern**                          |
| Caching with consistency                   |                                                                   | **Cache-Aside + Write-Through with TTL + Invalidation**        |
| Multi-tenant data isolation                |                                                                   | **Row-Level Security (RLS) + Tenant-Scoped Queries**           |
| Large file / blob storage                  | **Object Storage** (S3) + **Signed URLs**                         |                                                                |
| Data export (CSV, PDF, etc.)               | **Async Export Worker + Presigned Download URL**                  |                                                                |
| Data import / bulk ingestion               |                                                                   | **Staged Import + Validation Pipeline + Idempotency Keys**     |
| Read-heavy analytics                       | **CQRS**                                                          | **Materialized Views / CQRS Read Models**                      |
| Write-heavy ingestion                      |                                                                   | **Write-Ahead Log + Batch Flush**                              |
| Graph-structured data (social, org charts) | **Graph Database** (Neo4j, Amazon Neptune)                        |                                                                |
| Geospatial queries                         |                                                                   | **Spatial Index** (PostGIS, H3, S2)                            |
| Config / settings management               |                                                                   | **Hierarchical Config with Override Chain** (env → org → user) |
| Gapless sequential numbering (Invoices)    |                                                                   | **Database Sequence + Serialized Transaction Isolation**       |
| Deep object cloning (Complex templating)   |                                                                   | **Recursive Graph Traversal + ID-Mapping Table**               |
| User-managed external backup (BYO Storage) | **Virtual File System (VFS) Adapter + OAuth Delegation**          |                                                                |
| Point-in-time period closing (Rollovers)   |                                                                   | **Immutable Ledger Snapshotting + Balance-Forwarding**         |

---

## 3. Communication & Messaging

| Feature Type                            | HLD (Architecture)                                                    | LLD (Implementation)                     |
| --------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| Async service-to-service communication  | **Event-Driven Architecture** (Kafka, NATS, RabbitMQ)                 |                                          |
| Request-reply between services          | **gRPC with Service Mesh**                                            |                                          |
| Real-time push to client                | **WebSocket with Pub/Sub Fanout**                                     |                                          |
| Server-sent updates (one-way)           | **Server-Sent Events (SSE)**                                          |                                          |
| Email notifications                     | **Transactional Email Service** (SES, Postmark) + **Template Engine** |                                          |
| Push notifications (mobile)             | **Unified Push Service** (FCM/APNs) + **Notification Preferences**    |                                          |
| In-app notifications                    | **Notification Center Pattern**                                       | **Inbox model + read/unread state**      |
| SMS / WhatsApp alerts                   | **Communication Platform** (Twilio, MessageBird) + **Channel Router** |                                          |
| Webhook delivery to external systems    | **Outbound Webhook**                                                  | **Retry + Signing + DLQ**                |
| Webhook ingestion from external systems | **Ingestion Gateway**                                                 | **Idempotency Check + Async Processing** |
| Chat / messaging                        | **Message Broker + Fan-Out**                                          | **Read Receipts Pattern**                |
| Activity feed / timeline                | **Fan-Out on Write** (or hybrid fan-out)                              |                                          |
| Live polling / high-scale Q&A fan-in    | **WebSocket Fan-Out**                                                 | **Debounced State Aggregator**           |

---

## 4. Authentication & Authorization

| Feature Type                                | HLD (Architecture)                                                        | LLD (Implementation)                                        |
| ------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| User authentication                         | **OAuth 2.0 / OIDC** (with PKCE for SPAs/mobile)                          |                                                             |
| Session management                          |                                                                           | **Short-Lived JWT + Rotating Refresh Token + Token Family** |
| Role-based access control                   |                                                                           | **RBAC with Permission Bitmask**                            |
| Fine-grained authorization (resource-level) | **Attribute-Based Access Control (ABAC)** or **ReBAC** (Zanzibar/SpiceDB) |                                                             |
| Multi-factor authentication                 |                                                                           | **TOTP + WebAuthn/Passkeys** (FIDO2)                        |
| SSO / enterprise login                      | **SAML 2.0 + OIDC Federation**                                            |                                                             |
| API key management                          |                                                                           | **Hashed API Keys + Scoped Permissions + Rate Limits**      |
| Impersonation / act-as-user                 |                                                                           | **Delegated Token with Audit Trail**                        |
| Passwordless login                          |                                                                           | **Magic Link + WebAuthn**                                   |
| Device trust / remember device              |                                                                           | **Device Fingerprint + Trusted Device Registry**            |
| Invitation / onboarding flow                |                                                                           | **Token-Based Invite with Expiry + Idempotent Claim**       |
| Consent / privacy (GDPR)                    | **Consent Ledger + Data Subject Request Pipeline**                        |                                                             |

---

## 5. Payments & Financial

| Feature Type                     | HLD (Architecture)                                    | LLD (Implementation)                                                  |
| -------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| One-time payment                 | **Payment Intent Pattern** (Stripe-style)             | **Create → Confirm → Capture state flow**                             |
| Subscription / recurring billing | **Subscription State Machine + Billing Cycle Engine** |                                                                       |
| Wallet / balance management      |                                                       | **Double-Entry Ledger**                                               |
| Promo codes / discounts          | **Promotion Rules Engine**                            |                                                                       |
| Invoice generation               |                                                       | **Idempotent Invoice Generation + PDF Worker**                        |
| Refunds / chargebacks            | **State Machine**                                     | **Compensation Transaction**                                          |
| Multi-currency                   |                                                       | **Money Pattern** (amount + currency as a value object, never floats) |
| Tax calculation                  | **Tax Rules Engine** (Avalara, TaxJar)                | **Rate Table Lookup**                                                 |
| Payout / disbursement            | **Batch Settlement + Reconciliation Pipeline**        |                                                                       |
| Revenue recognition              | **Event-Sourced Ledger**                              | **Deferred Revenue Schedule**                                         |
| Cart / checkout                  |                                                       | **Persistent Cart + Reservation Pattern + Idempotency Key**           |

---

## 6. Rate Limiting, Throttling & Abuse Prevention

| Feature Type                  | HLD (Architecture)                                             | LLD (Implementation)                                     |
| ----------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| API rate limiting             |                                                                | **Token Bucket / Sliding Window Counter** (Redis-backed) |
| DDoS protection               | **Edge WAF + Anycast + Adaptive Rate Limiting**                |                                                          |
| Spam / abuse detection        | **Scoring Pipeline** (heuristics + ML-based anomaly detection) |                                                          |
| Bot detection                 | **CAPTCHA + Behavioral Analysis + Device Fingerprinting**      |                                                          |
| Brute-force login prevention  |                                                                | **Exponential Lockout + Account Lockout State Machine**  |
| Quota management (per-tenant) |                                                                | **Distributed Counter + Tiered Quota Config**            |
| Content moderation            | **AI/ML Moderation Pipeline + Human Review Queue**             |                                                          |

---

## 7. File & Media

| Feature Type                        | HLD (Architecture)                                                               | LLD (Implementation)                             |
| ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ |
| File upload (large)                 | **Multipart / Resumable Upload** (tus protocol) + Object Storage                 |                                                  |
| Image processing / thumbnails       | **On-the-fly Transform** (Imgproxy, Cloudinary) or **Upload-triggered Pipeline** |                                                  |
| Video transcoding                   | **Async Transcoding Pipeline** (MediaConvert, FFmpeg workers)                    |                                                  |
| Document generation (PDF, etc.)     | **Template Engine + Async Worker + Object Storage**                              |                                                  |
| Large-scale rendering (Print/Cards) | **Serverless Lambda-based Chrome-Headless Pool + Template Engine**               |                                                  |
| Live streaming / Video conferencing | **Selective Forwarding Unit (SFU) WebRTC Architecture**                          |                                                  |
| CDN / asset delivery                | **Edge CDN + Cache Invalidation** (CloudFront, Fastly)                           |                                                  |
| Virus / malware scanning            |                                                                                  | **Upload → Quarantine → Scan → Promote Pattern** |

---

## 8. Search, Filtering & Discovery

| Feature Type                  | HLD (Architecture)                                 | LLD (Implementation)                           |
| ----------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| Autocomplete / typeahead      |                                                    | **Trie / Prefix Index + Debounced Client**     |
| Fuzzy search / typo tolerance | **Meilisearch / Typesense**                        | **n-gram Index + Edit Distance**               |
| Recommendation engine         | **Collaborative Filtering + Content-Based Hybrid** |                                                |
| Personalization               |                                                    | **User Feature Vector + Real-Time Scoring**    |
| Ranking / sorting             |                                                    | **Weighted Multi-Factor Scoring Function**     |
| Tag / label system            |                                                    | **Polymorphic Tagging Table + Inverted Index** |
| User matchmaking / Networking |                                                    | **Vector Embedding Similarity Search (k-NN)**  |
| Gamification / Leaderboards   | **Stream Processing**                              | **Sorted Sets (e.g., Redis ZSET)**             |

---

## 9. Inventory & Resource Management

| Feature Type                     | HLD (Architecture)                                      | LLD (Implementation)                             |
| -------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| Stock / inventory tracking       |                                                         | **Double-Entry Inventory Ledger**                |
| Reservation / hold system        |                                                         | **Reservation Pattern with TTL-based Release**   |
| Waitlist with claim windows      |                                                         | **Priority Queue + TTL-based Claim Reservation** |
| Seat / capacity management       |                                                         | **Distributed Counter + Optimistic Locking**     |
| Booking / appointment scheduling | **Slot-Based Availability + Optimistic Reservation**    |                                                  |
| Resource locking (distributed)   | **Distributed Lock** (Redlock, Zookeeper)               |                                                  |
| Warehouse / multi-location stock | **Location-Aware Ledger + Allocation Strategy Pattern** |                                                  |

---

## 10. UI / UX Patterns (Frontend)

| Feature Type                      | HLD (Architecture)                                           | LLD (Implementation)                                                      |
| --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Infinite scroll / pagination      | **Cursor-Based Pagination** (Relay-style)                    |                                                                           |
| Optimistic UI updates             |                                                              | **Optimistic Mutation + Rollback on Failure**                             |
| Offline-first / sync              | **CRDT or Operational Transform + Sync Queue**               |                                                                           |
| Drag-and-drop reordering          |                                                              | **Fractional Indexing** (LexoRank)                                        |
| Undo/redo in UI                   |                                                              | **Command Pattern + Undo Stack**                                          |
| Multi-step wizard persistence     |                                                              | **Draft State Machine + Local Storage + Server Sync**                     |
| Theme / dark mode                 |                                                              | **CSS Custom Properties + System Preference Detection**                   |
| Internationalization (i18n)       |                                                              | **ICU MessageFormat + Namespace-Scoped Keys**                             |
| Accessibility (a11y)              | **ARIA Pattern Library**                                     | **Focus Management**                                                      |
| Skeleton / loading states         | **Suspense Boundaries + Skeleton Components**                |                                                                           |
| Error boundaries                  | **Component-Level Error Boundary + Retry + Fallback UI**     |                                                                           |
| Toast / notification system       |                                                              | **Centralized Toast Queue with Priority + Auto-Dismiss**                  |
| Complex form validation           |                                                              | **Schema-Based Validation** (Zod, Yup) + **Field-Level Async Validation** |
| Data tables (sort, filter, group) | **Server-Side Cursor Pagination**                            | **Virtual Scrolling**                                                     |
| Dashboard / widget layout         | **Grid Layout Engine** (react-grid-layout) + **Persistence** |                                                                           |
| Website/App builder (No-code UI)  | **Server-Driven UI (SDUI) + Headless Component Registry**    |                                                                           |
| Dynamic, user-defined forms       | **Schema-Driven Form Engine (JSON Schema)**                  |                                                                           |
| Keyboard productivity / Hotkeys   |                                                              | **Centralized Command Registry + Event Delegation Manager**               |
| Hardware integration (Scanners)   | **Hardware Abstraction Layer (HAL)**                         | **WebUSB/WebSocket Local Agent**                                          |

---

## 11. Observability & Reliability

| Feature Type                | HLD (Architecture)                                           | LLD (Implementation)                        |
| --------------------------- | ------------------------------------------------------------ | ------------------------------------------- |
| Logging                     | **Centralized Aggregation** (ELK, Datadog)                   | **Structured Logging** (JSON)               |
| Distributed tracing         | **OpenTelemetry + Trace Propagation**                        |                                             |
| Metrics / monitoring        | **Time-Series DB + Alerting** (Prometheus, Grafana)          | **RED/USE Metrics**                         |
| Health checks               | **Liveness + Readiness + Startup Probes**                    |                                             |
| Circuit breaker             | **Circuit Breaker Pattern** (Hystrix-inspired, Resilience4j) |                                             |
| Graceful degradation        | **Fallback Chain + Feature Degradation Matrix**              |                                             |
| Incident management         | **On-Call Rotation + Runbook Automation + PagerDuty**        |                                             |
| SLA monitoring              |                                                              | **SLI/SLO Framework + Error Budget Policy** |
| Chaos engineering           | **Controlled Fault Injection** (Chaos Monkey, Litmus)        |                                             |
| Data integrity verification | **Continuous Reconciliation Service (Control Loop Pattern)** |                                             |

---

## 12. DevOps & Infrastructure

| Feature Type            | HLD (Architecture)                                                 | LLD (Implementation) |
| ----------------------- | ------------------------------------------------------------------ | -------------------- |
| CI/CD pipeline          | **Trunk-Based Development + Multi-Stage Pipeline + Canary Deploy** |                      |
| Infrastructure as Code  | **Declarative IaC** (Terraform, Pulumi, CDK)                       |                      |
| Secret management       | **Vault + Auto-Rotation + Injected at Runtime**                    |                      |
| Environment management  | **GitOps + Environment Promotion Pipeline**                        |                      |
| Database migration      | **Versioned Migrations + Blue-Green Deploy** (Flyway, Atlas)       |                      |
| Container orchestration | **Kubernetes + Helm/Kustomize**                                    |                      |
| Auto-scaling            | **HPA + Custom Metrics + Predictive Scaling**                      |                      |
| Multi-region deployment | **Active-Active with Global Load Balancer + Data Replication**     |                      |
| Zero-downtime deploy    | **Blue-Green / Canary + Rolling Update + Feature Flags**           |                      |
| Disaster recovery       | **RTO/RPO-Driven Backup Strategy + Cross-Region Failover**         |                      |

---

## 13. API Design & Integration

| Feature Type                | HLD (Architecture)                                            | LLD (Implementation)                               |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| REST API design             | **Resource-Oriented Design + HATEOAS + JSON:API**             |                                                    |
| API versioning              | **URL Path Versioning + Sunset Headers**                      |                                                    |
| API gateway                 | **API Gateway + Rate Limit + Auth + Transform** (Kong, Envoy) |                                                    |
| GraphQL API                 | **Schema-First Design**                                       | **DataLoader + Persisted Queries**                 |
| BFF (Backend for Frontend)  | **Dedicated BFF per Client Type**                             |                                                    |
| Third-party integration     | **Anti-Corruption Layer + Adapter Pattern**                   |                                                    |
| Idempotent API calls        |                                                               | **Idempotency Key Header + Request Deduplication** |
| Long-running API operation  | **Async Request-Reply** (202 + polling / callback)            |                                                    |
| Bulk / batch API            | **Batch Endpoint + Async Processing + Progress Callback**     |                                                    |
| API documentation           | **OpenAPI Spec + Auto-Generated SDK + Contract Testing**      |                                                    |
| Event-driven API (external) | **AsyncAPI Spec + Webhook Registry + Event Catalog**          |                                                    |

---

## 14. Analytics & Reporting

| Feature Type                       | HLD (Architecture)                                                  | LLD (Implementation) |
| ---------------------------------- | ------------------------------------------------------------------- | -------------------- |
| Product analytics / event tracking | **Event Schema Registry + Streaming Ingestion + OLAP**              |                      |
| Custom reporting / dashboards      | **OLAP Cube + Semantic Layer** (Cube.js, Looker, dbt)               |                      |
| Real-time metrics dashboard        | **Streaming Aggregation** (Flink, ksqlDB) + WebSocket Push          |                      |
| Funnel / conversion analysis       | **Event Sequence Analysis + Materialized Funnel Views**             |                      |
| Cohort analysis                    | **Snapshot-Based Cohort Tagging + Pre-Aggregation**                 |                      |
| Data warehouse                     | **ELT Pipeline + Columnar Store** (BigQuery, Snowflake, ClickHouse) |                      |
| User session replay                | **DOM Mutation Recording + Replay Engine** (rrweb)                  |                      |

---

## 15. Multi-Tenancy & SaaS

| Feature Type                     | HLD (Architecture)                                              | LLD (Implementation)        |
| -------------------------------- | --------------------------------------------------------------- | --------------------------- |
| Tenant isolation                 | **Schema-per-Tenant or RLS** (based on scale/compliance)        |                             |
| Tenant onboarding / provisioning | **Tenant Provisioning Pipeline + Template-Based Setup**         |                             |
| Per-tenant customization         | **Configuration-Driven Customization + Override Chain**         |                             |
| Usage-based billing / metering   | **Event-Sourced Meter + Periodic Aggregation + Billing Engine** |                             |
| Tenant-scoped rate limiting      |                                                                 | **Per-Tenant Token Bucket** |
| White-labeling                   | **Theme Config + Asset Override + Custom Domain Mapping**       |                             |
| Data residency / compliance      | **Region-Aware Routing + Geo-Fenced Storage**                   |                             |

---

## 16. AI / ML Integration

| Feature Type                         | HLD (Architecture)                                                 | LLD (Implementation)                |
| ------------------------------------ | ------------------------------------------------------------------ | ----------------------------------- |
| LLM integration                      | **Prompt Template Registry + Guardrails + Streaming Response**     |                                     |
| AI-powered search                    | **Vector Database + Hybrid Search** (pgvector, Pinecone, Weaviate) |                                     |
| RAG (retrieval-augmented generation) | **Vector Store + Context Window Management**                       | **Chunking Pipeline**               |
| ML model serving                     | **Model Registry + A/B Model Routing + Shadow Mode**               |                                     |
| AI content generation                | **Generation Pipeline + Human Review Queue + Feedback Loop**       |                                     |
| AI-based classification / tagging    | **Batch Inference Pipeline**                                       | **Confidence Threshold + Fallback** |

---

## 17. Compliance & Governance

| Feature Type                   | HLD (Architecture)                                               | LLD (Implementation)                                   |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------ |
| Data retention / purging       | **TTL-Based Lifecycle Policy + Compliance Audit Log**            |                                                        |
| Right to deletion (GDPR)       | **PII Registry + Cascade Delete Pipeline + Confirmation Ledger** |                                                        |
| Data masking / anonymization   | **Dynamic Data Masking + Tokenization**                          |                                                        |
| Regulatory audit trail         |                                                                  | **Immutable Append-Only Log + Cryptographic Chaining** |
| Access request logging         | **Centralized Log**                                              | **Request-Level Audit Middleware**                     |
| Data classification / labeling |                                                                  | **Schema Annotation + Policy-Based Access Control**    |

---

## 18. Networking & Edge

| Feature Type        | HLD (Architecture)                                                | LLD (Implementation) |
| ------------------- | ----------------------------------------------------------------- | -------------------- |
| Service discovery   | **Service Registry** (Consul, Kubernetes DNS)                     |                      |
| Load balancing      | **L7 Load Balancer + Consistent Hashing**                         |                      |
| Service mesh        | **Sidecar Proxy** (Istio, Linkerd)                                |                      |
| Edge computing      | **Edge Functions** (Cloudflare Workers, Deno Deploy, Lambda@Edge) |                      |
| API caching at edge | **Edge Cache + Stale-While-Revalidate + Cache Tags**              |                      |

---

> **How to use this**: Pick a feature type you're building → research the optimal solution listed → adapt to your scale and constraints.
