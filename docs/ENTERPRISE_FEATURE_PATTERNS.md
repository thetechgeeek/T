# Enterprise Feature Patterns — A Staff Engineer's Catalog

> Target reader: Senior/Staff+ engineer designing systems that will serve **tens of millions of users**, survive **5–10 years** of schema evolution, and pass **enterprise security/compliance review**.
>
> This is a **lookup catalog**, not a tutorial. Each row gives (a) the pattern you should research, (b) how the answer changes at scale, (c) the trade-off or anti-pattern that trips teams up.
>
> If you are a team of 5 building a v1: most of the "At scale / Notes" column is premature and you should pick the cheaper default. The catalog is honest about this.

---

## Legend

**Scale tiers** (used in the "At scale / Notes" column):

| Tier   | Meaning                                    | Typical trigger                   |
| ------ | ------------------------------------------ | --------------------------------- |
| **S**  | Single-region, single-DB, < 1M MAU         | v1 / internal tool                |
| **M**  | Multi-service, read-replicas, < 10M MAU    | Series B–C SaaS                   |
| **L**  | Multi-region, sharded, 10–100M MAU         | Public product, compliance-scoped |
| **XL** | Global, multi-master, 100M+ MAU, regulated | FAANG / Stripe / Cloudflare class |

**Column convention** throughout:

| Feature Type | Pattern (what to research) | Notes / Trade-offs / At-scale variant |

A pattern that is "good enough" at S/M but **breaks** at L/XL is flagged `⚠ breaks at L`. A pattern that is overkill below L is flagged `overkill < L`. When two patterns compose (most FAANG answers do), they are chained with `+`.

**When this doc is wrong for you:**

- You are pre-PMF. Build the 3-line version and delete it later.
- Your constraint is regulatory (HIPAA/PCI/FedRAMP), not scale — the pattern may be right but the **control** attached to it (key management, audit, residency) is what actually matters; this doc names the pattern, not the control.
- Your domain is safety-critical (medical devices, avionics, trading). Different literature; don't generalize from here.

---

## 0. Cross-Cutting Primitives (Compose With Everything Below)

These are the pieces every serious distributed system reuses. Most rows in sections 1–20 are **compositions** of these.

### 0.1 Correctness & concurrency

| Primitive                                                           | What it gives you                            | Notes / Trade-offs                                                                                                            |
| ------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Idempotency key** (client-supplied UUID)                          | Safe retries, exactly-once _effect_          | Must be stored + deduped server-side with TTL; choose TTL ≥ max client retry window                                           |
| **Optimistic concurrency (CAS / version column)**                   | Lost-update protection without locks         | Contention → tail-latency spikes; pair with bounded retry                                                                     |
| **Pessimistic lock** (row lock, `SELECT … FOR UPDATE`)              | Serialized access                            | Deadlocks at L; avoid across service boundaries                                                                               |
| **Distributed lock with fencing token** (Redlock + monotonic token) | Mutual exclusion across nodes                | ⚠ Plain Redlock without fencing is unsafe — see Kleppmann 2016. Always include a fencing token the downstream store validates |
| **Lease** (time-bounded lock)                                       | Self-healing if holder dies                  | Clock skew bounds lease safety; use hybrid logical clocks at L                                                                |
| **Vector clocks / version vectors**                                 | Concurrent-write detection                   | Size grows with writer count; truncate with actor pruning                                                                     |
| **CRDT** (Yjs, Automerge)                                           | Conflict-free multi-writer merge             | Memory grows with history; snapshot + GC                                                                                      |
| **Two-phase commit (2PC)**                                          | Cross-resource atomicity                     | Blocking on coordinator failure; almost never the right answer at L — use Saga                                                |
| **Saga + compensating transaction**                                 | Long-running cross-service workflows         | Compensations must themselves be idempotent; design "forward-only" where possible                                             |
| **Outbox pattern**                                                  | Atomic DB write + event emit                 | Requires a relay process with at-least-once guarantees; pair with idempotent consumers                                        |
| **Inbox / dedupe table**                                            | Idempotent consumers                         | Dedup window sized to max broker retention                                                                                    |
| **Read-your-writes / monotonic read sessions**                      | User doesn't see their own write disappear   | Achieve via sticky routing to primary, or session tokens carrying LSN                                                         |
| **Linearizable register** (Raft/Paxos single-group)                 | Strict order for small state (config, locks) | ~5× latency of eventual; don't put user data here                                                                             |

### 0.2 Reliability primitives

| Primitive                                            | What it gives you                 | Notes / Trade-offs                                                              |
| ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| **Retry with exponential backoff + full jitter**     | Transient-failure recovery        | Without jitter you get thundering herds; cap total retry budget                 |
| **Dead-letter queue (DLQ)**                          | Poison-message isolation          | DLQ must be monitored, drained, and replayable — otherwise it's a bug graveyard |
| **Circuit breaker**                                  | Fail fast when downstream is sick | Half-open probe must itself be rate-limited                                     |
| **Bulkhead** (thread/connection pool per dependency) | Blast-radius containment          | Sizing is hard; start from Little's Law, measure                                |
| **Load shedding** (priority-aware reject)            | Availability under overload       | Requires a _priority_ signal in the request; admission > queuing                |
| **Backpressure** (bounded queues, flow control)      | Prevents unbounded memory growth  | Unbounded queues are the #1 cause of "latency went to infinity" incidents       |
| **Hedged requests** (Dean, Tail at Scale)            | p99 tail cutting                  | Adds capacity cost; cap with "send-second-after-p95"                            |
| **Request coalescing / singleflight**                | Cache stampede prevention         | Correctness gotcha: coalesce only reads, never writes                           |
| **Graceful degradation / fallback chain**            | Partial availability              | Must be exercised in drills; untested fallback = no fallback                    |
| **Chaos / fault injection** (Gremlin, Litmus)        | Proves the above actually works   | In prod, ramped, with kill-switch                                               |

### 0.3 Data-plane primitives

| Primitive                                     | Use for                                                   | Notes                                                                                 |
| --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Consistent hashing**                        | Partitioning with minimal rebalance                       | Use virtual nodes; jump-consistent-hash is simpler if node count rarely changes       |
| **Write-ahead log (WAL)**                     | Durability + replication source                           | Everything at L has one (Kafka, Postgres WAL, RocksDB); build around it, don't invent |
| **Log-structured merge (LSM) tree**           | Write-heavy OLTP                                          | Read amplification; tune compaction                                                   |
| **Merkle tree**                               | Anti-entropy / sync                                       | Dynamo/Cassandra use this; also content-addressable stores                            |
| **Bloom filter**                              | "Definitely not in set" cheap check                       | Sized for expected n and target FP rate                                               |
| **HyperLogLog / Count-Min Sketch / t-digest** | Approx cardinality / freq / quantiles under memory budget | Approximate answers are almost always fine at L                                       |
| **Tombstone + compaction**                    | Deletes in LSM/append-only                                | Tombstones must eventually GC or you'll re-resurrect data                             |
| **Snapshot + delta / incremental checkpoint** | Bounded-time recovery                                     | Trade snapshot frequency vs log-replay time                                           |

### 0.4 Contract primitives

| Primitive                                          | Use for                               | Notes                                                               |
| -------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------- |
| **Schema registry** (Confluent, Buf)               | Centralized IDL evolution             | Enforce compat rules in CI, not just at runtime                     |
| **Fencing on consumer upgrade**                    | Don't read new schema with old reader | Publish reader-version min with each schema                         |
| **Feature flag** (LaunchDarkly, Unleash, internal) | Decouple deploy from release          | Flags have a half-life — enforce expiry or they become config debt  |
| **Kill switch** (global off for a feature)         | 2am incident lever                    | Must be testable in prod without actually triggering                |
| **Shadow / dark launch**                           | Prod-realistic validation             | Response diffing must ignore benign noise (timestamps, request IDs) |

---

## 1. Workflow & Process Orchestration

| Feature Type                                 | Pattern                                                                        | Notes / Trade-offs                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Order lifecycle / multi-step state           | **State machine** (XState, Temporal)                                           | Define as a typed transition table; reject unknown transitions — never "if-else the states" |
| Long-running business process (days/weeks)   | **Workflow engine** (Temporal, Cadence, Step Functions)                        | Durable execution > hand-rolled queues at L; don't build your own                           |
| Approval chains / human-in-the-loop          | **Workflow engine + human-task queue**                                         | Model the _expired approval_ path explicitly; it's 30% of prod incidents                    |
| Scheduled / recurring jobs                   | **Distributed scheduler** (Temporal Schedules, Airflow, Quartz with Zookeeper) | Plain cron on a single box = split-brain at the first HA deploy                             |
| Retry with backoff on transient failure      | **Durable job queue + exp backoff + jitter + DLQ**                             | See §0.2. Never retry at the HTTP layer only                                                |
| Background job processing                    | **Persistent queue** (BullMQ S/M, SQS/Pub-Sub M, Kafka+workers L)              | Queue depth + oldest-message-age are your two must-alert metrics                            |
| Data pipeline / ETL (batch)                  | **DAG orchestrator** (Airflow, Dagster, Prefect)                               | Keep DAGs idempotent per logical date (Airflow `ds`); enables replay                        |
| Streaming ETL                                | **Stream processor** (Flink, Beam/Dataflow, ksqlDB)                            | Event time + watermarks + exactly-once sinks; see Dataflow paper                            |
| Feature flags / rollout                      | **Flag service + SDK + eval at edge**                                          | Per-tenant sticky hashing to avoid flip-flop; expiry policy is non-optional                 |
| A/B / experimentation                        | **Experimentation platform** (Statsig, Eppo, internal)                         | CUPED/stratification for variance reduction; protect against peeking                        |
| Multi-step form / wizard                     | **State machine + draft persistence (client + server)**                        | Server-side draft TTL; conflict policy on reopen (last-writer-wins vs merge)                |
| Constraint-based scheduling (shifts/agendas) | **CSP / ILP solver** (OR-Tools, Gurobi)                                        | Greedy heuristic works for M; at L you'll need warm-start + incremental re-solve            |

---

## 2. Data Management & Storage

| Feature Type                                       | Pattern                                                                                               | Notes / Trade-offs                                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Audit trail / who-changed-what                     | **Append-only event log** (often in a dedicated table)                                                | Don't reuse your main write log; separate retention + access policy                            |
| Undo / version history                             | **Event sourcing + periodic snapshot**                                                                | Pure event sourcing without snapshots becomes un-rehydratable at L                             |
| Soft delete with recovery                          | **Tombstone column + scheduled purge job**                                                            | ⚠ Every read path must filter tombstones, or they leak into analytics                          |
| Multi-user edits, single winner                    | **Optimistic concurrency (row version)**                                                              | Resurface conflicts to user; don't silently last-write-wins identity fields                    |
| Real-time collaborative editing                    | **CRDT** (Yjs, Automerge) or **OT** (legacy docs)                                                     | CRDT for greenfield; OT only if you're stuck with a Google-Docs-era codebase                   |
| Full-text search                                   | **Inverted index** (Elasticsearch, OpenSearch, Meilisearch)                                           | Never the primary store; it _will_ lose writes — always rebuildable from source of truth       |
| Hybrid search (text + vector)                      | **Dual-index + RRF / learned reranker** (OpenSearch + pgvector / Vespa)                               | See §17 for vector depth                                                                       |
| Faceted search / filters                           | **Inverted index + aggregations** (ES/OpenSearch)                                                     | Cardinality explosion on facets — precompute top-K per facet                                   |
| Time-series (metrics, IoT)                         | **TSDB** (Prometheus/Thanos, InfluxDB, TimescaleDB, QuestDB, M3)                                      | Downsample + tier; never query raw at dashboard time                                           |
| Data archival / tiering                            | **Hot / warm / cold with lifecycle policy**                                                           | Glacier-class restore SLA must match your legal hold SLA                                       |
| Cross-service consistency                          | **Saga + outbox**                                                                                     | 2PC across services is a red flag at review time                                               |
| Schema evolution (relational)                      | **Expand-contract migration** (add nullable → dual-write → backfill → cutover → drop)                 | Never a single destructive ALTER at L; use pt-online-schema-change / gh-ost / Atlas            |
| Schema evolution (IDL)                             | **Schema registry + compat rules in CI**                                                              | See §19 for full IDL governance                                                                |
| Caching                                            | See **§18 Caching** (deserves its own section)                                                        |                                                                                                |
| Multi-tenant isolation                             | See **§15** (silo / bridge / pool)                                                                    |                                                                                                |
| Large file / blob storage                          | **Object store + signed URLs** (S3/GCS + presigned PUT/GET)                                           | Never proxy blobs through app servers                                                          |
| Data export                                        | **Async export worker + presigned download URL + expiry**                                             | Surface progress; GDPR-style exports must include manifest + checksum                          |
| Bulk ingestion                                     | **Staged area + validation pipeline + idempotency key + dead-letter for rejects**                     | Bulk APIs need a _per-row_ status, not a single 200/500                                        |
| Read-heavy analytics on operational data           | **CQRS + materialized read model** (often in a columnar store)                                        | Propagation lag is user-visible — budget it                                                    |
| Write-heavy ingestion                              | **Batched WAL + async flush + backpressure**                                                          | Don't fsync per event at L; group commit                                                       |
| Graph-structured (social, auth graphs, org charts) | **Graph DB** (Neo4j S/M, TAO-style / JanusGraph / Nebula L)                                           | Authz graphs → see **Zanzibar (§4)**, not a generic graph DB                                   |
| Geospatial                                         | **Spatial index** (PostGIS, H3, S2)                                                                   | H3 for hex-uniform, S2 for spherical; pick before you have 1B rows                             |
| Config / settings                                  | **Hierarchical config with override chain** (env → org → team → user) + **version + rollout + audit** | Config is code — PR, review, canary, rollback                                                  |
| Gapless sequential numbering (invoices)            | **DB sequence + serializable tx**                                                                     | Gapless _and_ high-throughput is a contradiction — pick one or accept brief hot-row contention |
| Deep clone of rich templates                       | **Recursive traversal + ID-remap table**                                                              | Cycle detection is mandatory                                                                   |
| User-managed external storage (BYO S3/Drive)       | **VFS adapter + OAuth delegation + per-tenant KMS**                                                   | Your encryption boundary changes; legal will care                                              |
| Point-in-time close (fiscal rollover)              | **Immutable snapshot + balance carry-forward**                                                        | Don't re-aggregate; materialize and freeze                                                     |

---

## 3. Communication & Messaging

| Feature Type                   | Pattern                                                                                          | Notes / Trade-offs                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Async service-to-service       | **Event-driven via log broker** (Kafka, Pulsar, NATS JetStream)                                  | Pick **log-based** (Kafka) if you need replay; **queue-based** (SQS/Rabbit) if you don't |
| Sync service-to-service        | **gRPC over mTLS (ideally via service mesh)**                                                    | REST between internal services at L is a performance tax                                 |
| Real-time push to client       | **WebSocket with pub/sub fanout** (SocketCluster, Phoenix, custom on Redis/Kafka)                | Connection count ≠ request count; capacity plan on concurrent sockets                    |
| One-way server→client          | **SSE**                                                                                          | Simpler than WS; use for notifications / tickers                                         |
| Email (transactional)          | **Provider** (SES, Postmark, SparkPost) + **template engine** + **unsubscribe + DMARC/SPF/DKIM** | Deliverability is an ops discipline, not a feature                                       |
| Push (mobile)                  | **FCM/APNs** + **device registry** + **preference center** + **per-channel rate cap**            | Token lifecycle (rotate, revoke on logout) is the #1 bug                                 |
| In-app notifications           | **Inbox model + read/unread + per-user cursor**                                                  | Fan-out on write for M, hybrid for L (see activity feed)                                 |
| SMS / WhatsApp                 | **CPaaS** (Twilio, MessageBird) + **channel router** + **opt-in ledger**                         | TCPA/GDPR opt-in is a legal, not UX, concern                                             |
| Outbound webhooks              | **Durable queue + HMAC signing + exp backoff + DLQ + replay UI**                                 | Customers will ask for replay on day 30; design for it on day 1                          |
| Inbound webhooks               | **Ingestion gateway + HMAC verify + idempotency key + async processing**                         | Never process inline — 202 + queue                                                       |
| Chat / messaging               | **Log-based storage + per-conversation sharding + read-receipt pattern**                         | See LinkedIn Instant Messaging / Slack architecture                                      |
| Activity feed                  | **Fan-out on write (M), hybrid fan-out (L)**                                                     | Celebrity / fan-out-to-millions problem → pull for high-degree users                     |
| Live polling / high-fan-in Q&A | **WS fan-in + debounced aggregator + periodic snapshot broadcast**                               | Broadcast rate ≪ event rate; don't push every increment                                  |

---

## 4. Authentication & Authorization

| Feature Type                        | Pattern                                                                                               | Notes / Trade-offs                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| User authentication                 | **OAuth 2.1 / OIDC + PKCE** (SPA & mobile)                                                            | Roll your own auth in 2026? No.                                                |
| Session management                  | **Short-lived JWT (~15m) + rotating refresh token with token family + reuse detection**               | Token reuse = family revoke (Auth0 "refresh token reuse detection")            |
| Role-based access control           | **RBAC with hierarchical roles + permission bitmask**                                                 | Fine for M; hits its ceiling around org-chart-shaped permissions               |
| Fine-grained / resource-level authz | **ReBAC via Zanzibar-style** (SpiceDB, OpenFGA, Oso Cloud, Warrant)                                   | See Google Zanzibar paper. RBAC cannot express "editors-of-doc-X"; stop trying |
| Attribute-based (ABAC)              | **Policy engine** (OPA/Rego, Cedar)                                                                   | Use when rules depend on request context (IP, time, device trust)              |
| MFA                                 | **TOTP + WebAuthn/Passkeys (FIDO2)**                                                                  | Passkeys ≥ TOTP ≥ SMS; plan sunset of SMS now                                  |
| SSO / enterprise login              | **SAML 2.0 + OIDC federation** + **SCIM for provisioning**                                            | Enterprise buyers will ask about SCIM on day 1                                 |
| API keys                            | **Hashed key (argon2) + prefix for lookup + scoped permissions + per-key rate limits + rotation API** | Never store the key plaintext; always show once                                |
| Impersonation                       | **Delegated token + audit trail + banner in UI + time-limited + re-auth of admin**                    | Impersonation incidents end careers — over-instrument this                     |
| Passwordless                        | **Magic link + WebAuthn**                                                                             | Email link reuse window ≤ 10m, single-use                                      |
| Device trust / remember device      | **Device fingerprint + signed device cookie + trusted-device registry with user revocation UI**       |                                                                                |
| Invitation / onboarding             | **Signed invite token + expiry + idempotent claim + one-time use**                                    |                                                                                |
| Consent / privacy (GDPR/CCPA)       | **Consent ledger + DSAR pipeline + purpose-of-processing registry**                                   | See §20                                                                        |
| Secrets for workloads               | **Workload identity** (SPIFFE/SPIRE, AWS IAM Roles for Pods, GCP Workload Identity)                   | Static secrets in env = 2018                                                   |

---

## 5. Payments & Financial

| Feature Type             | Pattern                                                                                        | Notes / Trade-offs                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| One-time payment         | **Payment Intent** (Stripe-style: create → confirm → capture)                                  | Always idempotent at the intent level                             |
| Subscription / recurring | **Subscription state machine + billing cycle engine + dunning state machine**                  | Dunning (failed-payment recovery) is a product feature, not a bug |
| Wallet / balance         | **Double-entry ledger** (debit/credit, no mutations)                                           | Never store a single "balance" column as source of truth          |
| Promo / discounts        | **Rules engine + stacking policy + audit**                                                     | Stacking edge cases = revenue bugs; model explicitly              |
| Invoice generation       | **Idempotent generator + gapless sequence per jurisdiction + async PDF worker + object store** | See §2 for gapless caveats                                        |
| Refunds / chargebacks    | **State machine + compensating transaction against ledger**                                    | Refund > original is a code smell; block in the state machine     |
| Multi-currency           | **Money value object (integer minor units + currency) + FX rate snapshot on tx**               | Floats for money = a career-limiting move                         |
| Tax                      | **Tax rules engine** (Avalara/TaxJar) + **rate table + nexus model**                           | Own the rules; don't inline jurisdictions in code                 |
| Payouts / disbursement   | **Batch settlement + reconciliation pipeline + exception workflow**                            | Reconciliation must have a human review lane                      |
| Revenue recognition      | **Event-sourced ledger + deferred revenue schedule + period close**                            | ASC 606 / IFRS 15 — talk to finance early                         |
| Cart / checkout          | **Persistent cart + reservation (TTL) + idempotency key + inventory guard**                    | Cart-expiry UX is product work                                    |
| PCI scope                | **Tokenization via provider + network isolation of card-touching services**                    | Keep PAN out of your systems entirely if you can                  |
| Fraud                    | **Rules engine (fast) + ML scoring (slow) + manual review queue**                              | See §6                                                            |

---

## 6. Rate Limiting, Throttling & Abuse Prevention

| Feature Type                 | Pattern                                                                                | Notes / Trade-offs                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Per-key API rate limit       | **Token bucket** (Redis Lua for atomicity)                                             | Sliding window log is most accurate but expensive; token bucket is the default |
| Tenant / account quota       | **Distributed counter + tiered quota + soft/hard limits**                              | Soft (warn) + hard (block) + burst allowance                                   |
| Global capacity protection   | **Adaptive concurrency limiting** (Netflix concurrency-limits / Vegas)                 | Better than static RPS caps when downstream latency changes                    |
| DDoS protection              | **Edge WAF + anycast + L3/L4 scrubbing** (Cloudflare, Akamai, AWS Shield)              | Don't attempt in-app at L                                                      |
| Spam / abuse detection       | **Heuristics + ML scoring pipeline + reputation ledger**                               | Cold-start on new accounts: use velocity + device fingerprint                  |
| Bot detection                | **CAPTCHA (v3/invisible) + behavioral + device fingerprint + proof-of-work fallback**  | Accessibility + privacy review mandatory                                       |
| Brute-force login prevention | **Exponential lockout + account state machine + IP + email throttle (both!)**          | IP-only locks are bypassed with rotating residential proxies                   |
| Content moderation           | **ML classifier + policy engine + human review queue + appeals**                       | Appeals pipeline is a legal-liability reducer                                  |
| Credential stuffing          | **Password-breach check (HIBP k-anonymity) + MFA nudge + impossible-travel detection** |                                                                                |

---

## 7. File & Media

| Feature Type                                | Pattern                                                                                       | Notes / Trade-offs                                             |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Large file upload                           | **Resumable / multipart** (tus, S3 multipart) + **direct-to-object-store with signed policy** | Never proxy bytes through API servers                          |
| Image transforms / thumbnails               | **On-the-fly CDN transform** (Imgproxy, Cloudinary, Cloudflare Images)                        | Precompute only a small canonical set; let CDN derive the rest |
| Video transcoding                           | **Async pipeline** (MediaConvert, Mux, FFmpeg workers + HLS/DASH output)                      | ABR ladders, not fixed resolutions                             |
| Document generation (PDF, DOCX)             | **Template engine + headless renderer worker + object store + signed URL**                    | Headless Chrome is memory-hungry; pool & recycle               |
| Large-scale rendering (labels, cards, maps) | **Serverless Chrome-Headless pool + template engine + job queue + idempotent output key**     |                                                                |
| Live streaming / video conferencing         | **SFU** (LiveKit, Mediasoup, Agora, Twilio)                                                   | MCU = CPU-bound; P2P = scales to ~4 peers; SFU is the answer   |
| CDN / asset delivery                        | **Edge CDN + cache-tag invalidation + stale-while-revalidate**                                | Purge by tag, never by URL at L                                |
| Virus / malware scanning                    | **Upload → quarantine bucket → scan (ClamAV/commercial) → promote**                           | Never let unscanned blobs be served                            |
| EXIF / PII scrubbing                        | **Pre-upload strip in client + server-side re-strip**                                         | Leaked location via EXIF = incident                            |

---

## 8. Search, Ranking & Discovery

| Feature Type             | Pattern                                                              | Notes / Trade-offs                                                        |
| ------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Autocomplete / typeahead | **Trie / FST in index + debounced client + personalization re-rank** | Cache top prefixes aggressively                                           |
| Fuzzy / typo tolerance   | **n-gram + edit distance (BK-tree)** or **Meilisearch/Typesense**    | Levenshtein > 2 is rarely useful; cap                                     |
| Recommendations          | **Two-tower retrieval + learned reranker + candidate generators**    | Collaborative filtering alone is 2015; embeddings are the floor           |
| Personalization          | **Feature store** (Feast, Tecton) + **online model serving**         | Offline/online skew is the top cause of prod regressions                  |
| Ranking                  | **Learning-to-rank** (LambdaMART, neural rerankers)                  | Baseline with a hand-weighted linear model; LTR only when you can measure |
| Tag / label system       | **Polymorphic tag table + inverted index**                           | Namespacing tags early saves a painful migration                          |
| Matching / networking    | **Vector embedding + ANN index** (FAISS, ScaNN, HNSW, pgvector)      | Hybrid with filters (structured + vector)                                 |
| Leaderboards             | **Redis ZSET** (M) → **sharded ZSETs + periodic rollup** (L)         | Global top-10 is fine; global rank-of-user at L is hard                   |

---

## 9. Inventory, Reservations & Capacity

| Feature Type                            | Pattern                                                                        | Notes / Trade-offs                                  |
| --------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| Stock tracking                          | **Double-entry inventory ledger**                                              | Same invariant logic as financial ledger            |
| Reservation / hold                      | **TTL-based reservation + explicit release + compensation on timeout**         | Never rely on client to release                     |
| Waitlist                                | **Priority queue + TTL-based claim window + auto-promote**                     |                                                     |
| Seat / capacity with overbooking policy | **Distributed counter + optimistic lock** or **single-writer shard per event** | Airline overbook = business rule, encode explicitly |
| Booking / appointment                   | **Slot availability index + optimistic reservation + idempotent confirm**      |                                                     |
| Distributed lock                        | **Redlock + fencing token** or **Zookeeper/etcd lease**                        | See §0.1 — plain Redlock is unsafe without fencing  |
| Multi-location stock                    | **Location-aware ledger + allocation strategy (FEFO/FIFO/closest)**            | Allocation strategy is pluggable, not hard-coded    |

---

## 10. UI/UX Patterns (Frontend)

| Feature Type                                                                | Pattern                                                                                                                       | Notes / Trade-offs                                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Pagination                                                                  | **Cursor / keyset pagination** (opaque cursor, Relay spec)                                                                    | Offset pagination `⚠ breaks at L` — inconsistent under concurrent writes |
| Optimistic UI                                                               | **Optimistic mutation + rollback + reconcile with server state**                                                              | Reconciliation is where bugs hide                                        |
| Offline-first / sync                                                        | **CRDT or op-log sync queue + conflict UI**                                                                                   | See Linear / Figma engineering blogs                                     |
| Drag-and-drop reorder                                                       | **Fractional indexing** (LexoRank, fractional-indexing lib)                                                                   | Full re-index is an anti-pattern; fractional avoids it                   |
| Undo/redo                                                                   | **Command pattern + bounded undo stack + server-side reconcile**                                                              |                                                                          |
| Wizard persistence                                                          | **State-machine draft + localStorage + server sync on step commit**                                                           |                                                                          |
| Theming / dark mode                                                         | **CSS custom properties + system preference + per-tenant override** (§15)                                                     |                                                                          |
| i18n                                                                        | **ICU MessageFormat + namespace + CI lint for missing keys + pseudo-locale in CI**                                            | Don't hand-concatenate strings; plural/gender will bite you              |
| a11y                                                                        | **ARIA + focus management + keyboard-only audit + automated axe in CI + manual SR audit**                                     | Automated catches ~30%; manual is non-negotiable                         |
| Skeleton / suspense                                                         | **Suspense boundaries + skeleton components + error boundary per route**                                                      |                                                                          |
| Error boundaries                                                            | **Route-level + component-level + report to crash service + retry UI**                                                        |                                                                          |
| Toast / notifications                                                       | **Centralized queue + priority + dedup + auto-dismiss + a11y live region**                                                    |                                                                          |
| Complex form validation                                                     | **Schema-based** (Zod / Yup / Valibot) + **async field validation** + **server re-validate**                                  | Client validation is UX; server is security                              |
| Data tables                                                                 | **Server-side cursor + column-config persistence + virtual scrolling**                                                        | Don't render 10k rows to DOM                                             |
| Dashboard / widget layout                                                   | **Grid layout engine + per-user persistence + template library**                                                              |                                                                          |
| No-code UI builder                                                          | **Server-driven UI (SDUI) + headless component registry + sandbox evaluator**                                                 | Airbnb / Lyft ghost platform talks                                       |
| **Canonical domain data captured via form** (registration, KYC, onboarding) | **IDL-first (protobuf/Thrift) + closed semantic `FieldReference` enum + codegen across services + external JSON-Schema view** | See §19. This is **not** the same as below                               |
| **User-authored form builder** (Typeform/Jotform-class)                     | **JSON-Schema-driven engine + headless renderer + versioned form definitions**                                                | Schema is open-ended; submissions are schemaless-ish payloads            |
| Keyboard / hotkeys                                                          | **Central command registry + event delegation + discoverable command palette**                                                |                                                                          |
| Hardware integration (scanners, printers, scales)                           | **Hardware abstraction layer + WebUSB/WebSerial or local agent (WebSocket)**                                                  | Browser API fragmentation is the real problem                            |

---

## 11. Observability & Reliability

| Feature Type                | Pattern                                                                                      | Notes / Trade-offs                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Logging                     | **Structured (JSON) + central aggregation + sampling at volume + PII redaction filter**      | Log sampling _must_ keep all error logs                                    |
| Distributed tracing         | **OpenTelemetry + W3C trace context + tail-based sampling at collector**                     | Head-based sampling misses rare errors                                     |
| Metrics                     | **TSDB + RED (rate/error/duration) + USE (util/sat/errors)**                                 | Cardinality budget — labels are the silent killer                          |
| Health checks               | **Liveness + readiness + startup probes (distinct!)**                                        | Liveness must not depend on downstreams; readiness must                    |
| Circuit breaker             | See §0.2                                                                                     |                                                                            |
| Graceful degradation        | **Fallback chain + degradation matrix per dependency + chaos drill**                         |                                                                            |
| Incident management         | **On-call rotation + runbooks + paging policy + postmortem template + action-item tracking** | Blameless; action items with owners or they don't happen                   |
| SLI / SLO / error budget    | **SLO policy + error-budget burn alerts (multi-window multi-burn-rate)**                     | Google SRE workbook ch. 4–5; implement burn-rate alerts, not raw-threshold |
| Profiling in prod           | **Continuous profiling** (Pyroscope, Google-Wide-Profiling, Parca)                           | CPU flame graphs on by default at L                                        |
| Chaos engineering           | **Game days + prod fault injection with kill switch**                                        |                                                                            |
| Data integrity verification | **Continuous reconciliation (control-loop) + divergence alerting**                           | Silent corruption is the worst class of bug; reconcile                     |
| Real-user monitoring (RUM)  | **Web-vitals + session sampling + geo/ISP dimensionality**                                   |                                                                            |

---

## 12. DevOps, Release & Infra

| Feature Type            | Pattern                                                                                                | Notes / Trade-offs                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| CI/CD                   | **Trunk-based + merge queue + required checks + canary + auto-rollback**                               | Long-lived branches `⚠ breaks at L` org velocity |
| IaC                     | **Declarative** (Terraform, Pulumi, CDK) + **policy-as-code** (OPA, Sentinel)                          |                                                  |
| Secrets                 | **Vault/KMS + auto-rotation + injected at runtime + no secrets in git (gitleaks in CI)**               |                                                  |
| Environment management  | **GitOps + promotion pipeline + prod-equivalent staging (often ephemeral per-PR)**                     |                                                  |
| DB migration            | **Expand-contract + online tooling (gh-ost, pt-osc, Atlas) + forward-only where possible**             |                                                  |
| Container orchestration | **Kubernetes + Helm/Kustomize** (S/M/L) or **Nomad / ECS** (simpler ops)                               |                                                  |
| Auto-scaling            | **HPA on RED metrics + custom metrics + predictive scaling + scale-in protection during deploys**      |                                                  |
| Multi-region            | **Active-active with global LB + replicated data + per-region failure domain + traffic-shift runbook** | Data residency (§15) couples to this             |
| Zero-downtime deploy    | **Blue/green + canary + feature flag separation of deploy from release**                               |                                                  |
| Disaster recovery       | **RTO/RPO-driven + cross-region backup + restore drill (quarterly, measured)**                         | Backups you haven't restored = no backups        |
| Progressive delivery    | **Argo Rollouts / Flagger + SLO-driven auto-rollback**                                                 |                                                  |
| Preview environments    | **Per-PR ephemeral env + seeded data + auto-teardown**                                                 |                                                  |
| Build caching           | **Remote cache (Bazel / Nx / Turborepo) + content-addressed**                                          |                                                  |

---

## 13. API Design & Integration

| Feature Type            | Pattern                                                                                                           | Notes / Trade-offs                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| REST API design         | **Resource-oriented + consistent error envelope + pagination + filtering grammar**                                | JSON:API is a great starting spec; don't reinvent         |
| API versioning          | **URL path for breaking + additive-only for non-breaking + Sunset/Deprecation headers + version-N+1-in-parallel** | Never delete a version without 12m notice at L            |
| API gateway             | **Gateway at edge: auth + rate limit + transform + observability** (Kong, Envoy-based, cloud-native)              | Don't do business logic in the gateway                    |
| GraphQL                 | **Schema-first + persisted queries + DataLoader + depth/complexity limits + query allowlist at edge**             | Unbounded queries `⚠ breaks at L`; persisted-only in prod |
| BFF                     | **Dedicated BFF per client surface (web/ios/android/partner)**                                                    | Shared BFF becomes a mini-monolith                        |
| Third-party integration | **Anti-corruption layer + adapter per vendor + contract test + replay log of inbound**                            | Never leak vendor types into your domain                  |
| Idempotent writes       | **Idempotency-Key header + server dedupe store (TTL > max retry window)**                                         | Return the _original_ response on replay, not a fresh one |
| Long-running API ops    | **Async request-reply: 202 + operation resource + polling or webhook**                                            |                                                           |
| Bulk / batch API        | **Batch endpoint + per-item status + async with progress endpoint + partial success semantics**                   |                                                           |
| API documentation       | **OpenAPI / AsyncAPI generated from code + contract tests + SDK codegen per language**                            | Handwritten docs drift; generated docs don't              |
| Webhook / event API     | **AsyncAPI spec + event catalog + HMAC signing + replay endpoint**                                                |                                                           |
| gRPC for internal       | **Protobuf + service mesh + deadline propagation**                                                                | Deadlines propagated end-to-end or you'll DoS yourself    |

---

## 14. Analytics, Reporting & Data Platform

| Feature Type                       | Pattern                                                                                           | Notes / Trade-offs                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Product analytics / event tracking | **Event schema registry + streaming ingestion + warehouse sink**                                  | One schema for tracking events; no ad-hoc event names in code        |
| Custom reporting / BI              | **Warehouse + semantic layer** (dbt + Cube/Looker/LookML)                                         | Semantic layer prevents "3 different MRR definitions"                |
| Real-time metrics dashboard        | **Streaming aggregation (Flink/ksqlDB/Materialize) + WS push**                                    |                                                                      |
| Funnel / conversion                | **Event sequence analysis + materialized funnel views**                                           |                                                                      |
| Cohort analysis                    | **Snapshot-based cohort tagging + pre-aggregation**                                               |                                                                      |
| Data warehouse                     | **Columnar MPP** (BigQuery, Snowflake, Redshift, ClickHouse) + **lakehouse** (Iceberg/Delta/Hudi) |                                                                      |
| Data lake                          | **Object store + open table format (Iceberg/Delta) + catalog (Glue/Unity/Nessie)**                | Iceberg is the default at L in 2026                                  |
| ETL vs ELT                         | **ELT: load raw → transform in warehouse (dbt)**                                                  | ETL-before-load is legacy unless privacy dictates pre-load redaction |
| Reverse ETL                        | **Warehouse → operational systems** (Census, Hightouch)                                           |                                                                      |
| Session replay                     | **DOM-mutation recording (rrweb) + consent gating + retention policy**                            | Privacy review required                                              |
| Experimentation analytics          | **CUPED + sequential testing + Bayesian decision**                                                | See Microsoft Experimentation Platform papers                        |

---

## 15. Multi-Tenancy & SaaS

| Feature Type              | Pattern                                                                                                                                       | Notes / Trade-offs                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Tenant isolation (data)   | **Silo (DB/schema per tenant)** (highest isolation, costliest) / **Bridge (schema-per-tenant in shared DB)** / **Pool (shared tables + RLS)** | Drive the choice from _compliance + noisy-neighbor_, not cost alone. Document which you picked and why |
| Tenant provisioning       | **Idempotent provisioning pipeline + template setup + resumable**                                                                             | Creating a tenant must be replayable                                                                   |
| Per-tenant customization  | **Config-driven + override chain + plugin points (not forks)**                                                                                | One customer fork = the end of your velocity                                                           |
| Usage metering / billing  | **Event-sourced meter + dedupe + periodic aggregation + billing engine + reconciliation**                                                     | Billing bugs = trust-shattering; reconcile against source                                              |
| Per-tenant rate limit     | **Token bucket keyed by tenant + burst config in tenant plan**                                                                                |                                                                                                        |
| White-labeling            | **Theme config + asset override + custom domain with cert automation (ACM / cert-manager + ACME-DNS)**                                        |                                                                                                        |
| Data residency            | **Region-aware routing + geo-fenced storage + cross-region access prohibited at data-plane level**                                            | Marketing claim → engineering control; enforce, don't hope                                             |
| Tenant export / takeout   | **Async export + signed download + scheduled + documented schema**                                                                            | GDPR + enterprise-exit clauses both require this                                                       |
| Noisy-neighbor protection | **Per-tenant quota + shard-per-VIP + blast-radius limiting**                                                                                  |                                                                                                        |
| Tenant offboarding        | **Soft-delete → cool-off period → cryptographic shred (delete KMS key) → audit confirm**                                                      | Crypto-shredding beats data deletion at L                                                              |

---

## 16. AI / ML Integration

| Feature Type             | Pattern                                                                                                             | Notes / Trade-offs                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| LLM integration          | **Prompt template registry + guardrails (jailbreak + PII) + streaming + tool-calling schema + eval harness**        | Prompts are versioned artifacts; treat as code                        |
| RAG                      | **Document pipeline → chunker → embedder → vector store + BM25 hybrid → reranker → LLM with context-window budget** | Chunking strategy + reranker drive quality far more than model choice |
| AI-powered search        | **Vector DB + hybrid BM25 + learned reranker** (pgvector / Vespa / Pinecone / Weaviate)                             | See §8                                                                |
| ML model serving         | **Model registry + canary / shadow + feature store + A/B routing + monitoring (drift, skew, latency)**              |                                                                       |
| AI content generation    | **Generation pipeline + moderation + human review queue + feedback loop into fine-tune set**                        |                                                                       |
| Classification / tagging | **Batch + online inference with confidence threshold + human-in-the-loop fallback**                                 |                                                                       |
| Agents / tool-using LLMs | **Planner + tool registry + sandbox + budget guard + trace + eval**                                                 | Agents without budgets are $-incidents                                |
| Eval                     | **Golden set + LLM-as-judge (calibrated) + regression gates in CI**                                                 |                                                                       |
| Guardrails / safety      | **Input/output classifiers + prompt-injection defense + allowlist of tools + redaction**                            |                                                                       |
| Cost control             | **Per-tenant token budget + model routing (cheap-first → escalate) + prompt-compression + caching**                 |                                                                       |

---

## 17. Search, Vector & Retrieval Depth

(Split from §8 for emphasis — these are distinct systems.)

| Feature Type                       | Pattern                                                                                                  | Notes / Trade-offs                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Small-scale vector (< 10M vectors) | **pgvector or SQLite + sqlite-vec**                                                                      | Don't over-engineer; rebuild nightly is fine |
| Medium (10M–1B)                    | **HNSW in a dedicated store** (Qdrant, Weaviate, Milvus)                                                 |                                              |
| XL (1B+)                           | **Disk-based ANN** (DiskANN, ScaNN, FAISS-IVF-PQ) + **sharding + replication**                           |                                              |
| Hybrid                             | **BM25 + dense + RRF or learned reranker**                                                               | RRF before you invest in a learned reranker  |
| Freshness                          | **Incremental index + background merge + read-your-writes on the write shard**                           |                                              |
| Multi-tenant vector                | **Per-tenant namespace + quota + isolation** (prevent cross-tenant leakage via filter-not-enforced bugs) |                                              |

---

## 18. Caching (Its Own Topic)

| Feature Type                      | Pattern                                                                                 | Notes / Trade-offs                                         |
| --------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Read cache (DB offload)           | **Cache-aside with TTL + stale-while-revalidate + negative-cache**                      | Always cache "not found" or you'll thundering-herd on 404s |
| Write-through                     | **Synchronous write to cache + store**                                                  | Only when cache == store consistency is required           |
| Write-back                        | **Async flush**                                                                         | Dangerous; requires durable cache                          |
| CDN / edge cache                  | **Cache-tag invalidation + SWR + per-route TTL + cache key normalization**              | URL normalization bugs = cache poisoning                   |
| Cache stampede                    | **Singleflight / request coalescing + early refresh + probabilistic TTL jitter**        | See §0.2                                                   |
| Cache invalidation                | **Event-driven (via outbox) + key versioning (never DELETE + recompute)**               | Key-version bump is safer than delete                      |
| Hot key                           | **Client-side local cache + probabilistic "hot-key" detection + replica fanout**        |                                                            |
| Cache consistency across regions  | **Regional caches with versioned keys + TTL short enough that staleness is within SLO** |                                                            |
| Object cache (LRU/LFU in-process) | **Caffeine / Guava / ARC-based**                                                        | Measure hit ratio; cache without metrics = decoration      |

---

## 19. IDL & Schema Governance (Cross-Cutting)

The row that was missing in v1. This discipline sits _under_ §2 and §13.

| Concern                                 | Pattern                                                                                                        | Notes / Trade-offs                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Canonical schema language               | **Protobuf / Thrift / Avro / Cap'n Proto / FlatBuffers**                                                       | Pick one per org. Mixing is a tax you pay forever                                  |
| Schema registry                         | **Central registry + compat rules enforced in CI + per-topic compat mode** (Confluent, Buf, Apicurio)          |                                                                                    |
| Forward / backward compat rules         | **Additive-only + `reserved` tags + never reuse field numbers + numeric field identity (not name)**            |                                                                                    |
| External schema publication             | **Auto-generated JSON Schema + OpenAPI / AsyncAPI from the IDL**                                               | Internal uses proto; external uses JSON Schema — never hand-maintain both          |
| Closed-semantic enums with escape hatch | **Enum (strongly typed) + namespaced string field for long-tail custom values**                                | Avoids the "every new preset is a deploy" problem                                  |
| Response storage                        | **Store in the same IDL as the definition** (avoid proto-def + JSONB-answer split-brain)                       |                                                                                    |
| Queryability of IDL-stored data         | **Denormalized projection table** (`entity_id, field_id, field_kind, is_pii, …`) maintained via the write path | Without this, you can't answer "how many forms use field X?"                       |
| Code generation                         | **Per-language typed SDKs + contract tests across languages**                                                  |                                                                                    |
| Consumer upgrade fencing                | **Min-reader-version attribute on each schema + producer refuses to upgrade past oldest active reader**        |                                                                                    |
| Semantic versioning of schemas          | **Version bump on every incompat change + deprecation window + telemetry on old-version readers**              |                                                                                    |
| Wire format efficiency                  | **Binary for hot paths, JSON for human-facing / external**                                                     |                                                                                    |
| Internal-vs-external contract split     | **Canonical schema (internal, binary IDL)** + **exposed schema (external, JSON Schema / OpenAPI, generated)**  | The answer to "proto or JSON Schema?" is almost always _both_, at different layers |

---

## 20. Privacy, Compliance & Data Governance

| Feature Type                           | Pattern                                                                                          | Notes / Trade-offs                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| PII registry                           | **Schema-annotated PII tags + automated scan + central registry**                                | A flag that doesn't _drive behavior_ is a compliance bug     |
| PII-driven behavior                    | **Annotation → logging redaction + export filter + encryption key selection + access audit**     | Enforce at framework level, not per-handler                  |
| Right to deletion (GDPR Art.17 / CCPA) | **DSAR pipeline + cascade delete + crypto-shredding + confirmation ledger + SLA timer**          | Backup scope is the hard part; crypto-shredding sidesteps it |
| Right to access / portability          | **DSAR export pipeline + manifest + checksum + signed download**                                 |                                                              |
| Data retention / purging               | **TTL policy per data class + lifecycle job + audit log of purges**                              |                                                              |
| Data classification                    | **Schema annotation + policy engine + row/column-level access controls**                         |                                                              |
| Data masking / anonymization           | **Dynamic masking + tokenization + k-anonymity or differential privacy for analytics**           | True anonymization is a legal standard, not a tech one       |
| Regulatory audit trail                 | **Immutable append-only log + cryptographic chaining (Merkle / hash-linked)** + **WORM storage** |                                                              |
| Access audit                           | **Request-level middleware logging actor + resource + purpose + outcome**                        |                                                              |
| Cross-border transfer                  | **Residency routing + SCCs + per-region KMS + DPA templates**                                    |                                                              |
| Consent                                | **Consent ledger + purpose-of-processing registry + revocation cascade**                         |                                                              |
| Lawful basis per processing purpose    | **Purpose registry referenced by data access paths**                                             |                                                              |
| Third-party sub-processors             | **Registry + DPA + breach notification SLA**                                                     |                                                              |
| Secrets handling at rest               | **Envelope encryption + per-tenant DEK + centrally managed KEK (KMS/HSM)**                       |                                                              |

---

## 21. Capacity Planning & Cost Engineering

| Concern                 | Pattern                                                                                                   | Notes / Trade-offs                                                    |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Back-of-envelope sizing | **Little's Law + p99 latency budget + request-size model**                                                | If you can't derive instance count on a napkin, you don't have a plan |
| Load testing            | **Prod-like shape + ramp + soak + spike + realistic cache warmth**                                        | Uniform RPS is lying to you                                           |
| Capacity headroom       | **Headroom policy per SLO tier (e.g., 2× peak for Tier-1, 1.3× for Tier-3)**                              |                                                                       |
| Cost attribution        | **Tag-driven cost allocation + per-team/tenant dashboards + unit economics (cost per request / per MAU)** | If you don't know cost per request, you can't optimize it             |
| Cost SLOs               | **Unit-cost targets reviewed quarterly + variance alerts**                                                |                                                                       |
| Right-sizing            | **Continuous profiling + VPA/HPA + spot/preemptible for batch + ARM where available**                     |                                                                       |
| Storage tiering         | **Hot/warm/cold lifecycle + compression + TTL + compaction**                                              |                                                                       |
| Egress minimization     | **Same-region pin + CDN + compression + deltas**                                                          | Cross-region egress is frequently the top-3 cloud line item           |
| FinOps                  | **Showback → chargeback progression + reserved / savings plan governance**                                |                                                                       |

---

## 22. Networking & Edge

| Feature Type              | Pattern                                                                           | Notes / Trade-offs                         |
| ------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------ |
| Service discovery         | **Service registry** (Consul, etcd, Kubernetes DNS)                               |                                            |
| Load balancing            | **L7 + consistent hashing for session affinity + outlier ejection**               |                                            |
| Service mesh              | **Sidecar or ambient mesh** (Istio, Linkerd, Cilium Service Mesh)                 | Mandatory mTLS + identity-based authz at L |
| Edge compute              | **Edge functions** (Cloudflare Workers, Deno Deploy, Lambda@Edge, Fastly Compute) |                                            |
| Edge API caching          | **Cache-tag invalidation + SWR + per-path TTL policy**                            |                                            |
| Global traffic management | **GeoDNS + anycast + latency-based routing + failover policy**                    |                                            |
| Zero-trust network        | **Identity-aware proxy + per-request authz (BeyondCorp)**                         | VPNs are the perimeter-era answer          |
| Private connectivity      | **VPC peering / PrivateLink / private service connect**                           |                                            |

---

## 23. How to Choose: A Staff-Level Decision Procedure

1. **Write the non-functionals first**: availability SLO, p99 latency budget, consistency model, data retention, residency, recovery objectives (RTO/RPO), compliance scope.
2. **Identify the hardest NFR** — that one drives the pattern, not the feature name.
3. **Look up the feature** in this catalog. Pick the pattern for your scale tier.
4. **Compose cross-cutting primitives** (§0) — idempotency, retry, backpressure, circuit breaker — onto the pattern. FAANG answers are compositions.
5. **Split the _canonical schema_ from the _exposed schema_** (§19). This one decision prevents a huge class of 18-month-later migrations.
6. **Name the failure modes explicitly** in the design doc. If you can't name them, you don't understand the pattern yet.
7. **Write the rollback plan before the rollout plan.**
8. **Decide the kill switch** (§0.4) before the first user sees the feature.
9. **Add an SLO + error budget** (§11) before the feature ships.
10. **Postmortem early**: assume incidents and pre-write the runbook.

---

## 24. Canonical References

Foundational papers, books, and engineering writeups that the patterns above derive from. This is the "go deeper" list.

**Books**

- Kleppmann — _Designing Data-Intensive Applications_
- Newman — _Building Microservices_ (2nd ed.)
- Nygard — _Release It!_ (2nd ed.)
- Fowler — _Patterns of Enterprise Application Architecture_
- Betsy Beyer et al. — _Site Reliability Engineering_ + _SRE Workbook_
- Richards & Ford — _Fundamentals of Software Architecture_

**Foundational distributed-systems papers**

- Lamport — _Paxos Made Simple_; _Time, Clocks, and the Ordering of Events_
- Ongaro & Ousterhout — _Raft: In Search of an Understandable Consensus Algorithm_
- Dean & Ghemawat — _MapReduce_; Dean — _The Tail at Scale_
- DeCandia et al. — _Dynamo: Amazon's Highly Available Key-Value Store_
- Corbett et al. — _Spanner: Google's Globally-Distributed Database_
- Chang et al. — _Bigtable_
- Burrows — _The Chubby Lock Service_
- Bravo/Kingsbury — _Jepsen_ test reports (for what actually breaks)
- Kleppmann — _How to do distributed locking_ (Redlock critique)
- Akidau et al. — _The Dataflow Model_ (event time, watermarks)
- Pat Helland — _Life Beyond Distributed Transactions_
- Pat Helland — _Immutability Changes Everything_

**Authz / data**

- Pang et al. — _Zanzibar: Google's Consistent, Global Authorization System_
- Shute et al. — _F1: A Distributed SQL Database That Scales_
- Peng & Dabek — _Large-scale Incremental Processing Using Distributed Transactions and Notifications (Percolator)_

**Engineering writeups worth keeping bookmarked**

- Stripe Engineering — idempotency, API versioning, machine learning for fraud
- Netflix Tech Blog — concurrency limits, chaos, Hystrix/Resilience4j
- Uber Engineering — Cadence/Temporal origins, schemaless, Ringpop
- LinkedIn Engineering — Kafka origins, Espresso, Brooklin
- Shopify Engineering — Pods (cellular architecture), resiliency matrix
- DoorDash Engineering — workflow orchestration, ML platform
- Airbnb — data modeling, feature store
- Meta Engineering — TAO, F14, Folly, Velox, Shuffle service
- Google — Site Reliability Engineering series, Borg/Omega/K8s papers
- Cloudflare — edge patterns, Workers, Cache
- Discord — trillions of messages on Cassandra / ScyllaDB

---

## 25. Known Limitations of This Catalog

In the spirit of a staff-level design review, here are the gaps _this doc still has_:

- **Domain-specific verticals** (ads, trading, healthcare, robotics, gaming netcode) have patterns that diverge from these generics. Consult domain literature.
- **Embedded / IoT constraints** (power, intermittent connectivity, OTA) aren't covered.
- **Pattern choice vs. organizational readiness** isn't scored. A pattern is only "right" if your org can operate it — Kubernetes, Kafka, Temporal all pay ops taxes most teams underestimate.
- **Buy-vs-build** is implied but not called out per row. Default at L is _buy the platform, own the business logic_.
- **Maturity / standardization scores per pattern** aren't here. Some rows (Zanzibar-style ReBAC) are newer in mainstream adoption than others (token bucket) and carry different hiring-pool / ecosystem risk.
- **Cost numbers** are absent by design — they move yearly. See §21 for methodology.

> Use this catalog as a _starting_ search index. The actual engineering is: (a) pick the pattern, (b) compose it with §0 primitives, (c) write the failure modes, (d) write the rollback, (e) measure against an SLO. Anything that skips (c)–(e) isn't enterprise-grade regardless of which pattern row it points at.
