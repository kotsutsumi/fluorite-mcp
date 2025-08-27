# Post-Apply Checklists

Concrete items to verify after applying spikes. Use these to validate changes before committing.

## Auth (next-auth / auth0 / clerk / lucia)
- Environment variables set and loaded (client/server separation where required)
- Callback URLs registered in the provider dashboard and match the app config
- Protected routes/middleware enforce roles/permissions as intended
- Login/logout/refresh flows manually verified; error path tested
- Session persistence and CSRF/PKCE settings validated where applicable

## Storage (S3 / GCS / Azure-Blob / MinIO)
- Credentials source confirmed (env/secret manager) and least-privilege IAM
- Bucket/container exists; naming/region align with conventions
- Read/Write sample succeeds; ACL/public access policy matches requirements
- Content-type and cache-control set correctly for typical uploads

## Payments (Stripe)
- API keys and webhook secret configured in env and dashboard
- Test webhook events sent and received; retry behavior and idempotency verified
- Error paths return actionable messages and structured logs
- Price/product IDs and currency/locale handled as expected

## Monitoring/APM (Sentry / PostHog / Datadog / NewRelic)
- DSN/API keys configured; environment tag (env) and release name set
- Sample error/trace captured and visible in dashboard
- Sampling rate and PII filtering policies aligned with organization standards
- Performance metrics panel reflects expected endpoints and user flows

## General
- Static analysis passes for security and quality
- Unit/e2e tests updated or added for critical flows
- Docs/README updated for environment variables and ops runbooks

## Queue/Brokers (BullMQ / Kafka / RabbitMQ / NATS / SQS)
- Connection/bootstrap validated (credentials, endpoints, TLS where applicable)
- Backoff/retry policy and DLQ configured; reprocessing steps documented
- Concurrency/prefetch tuned; graceful shutdown and draining tested
- Idempotency keys or deduplication strategy defined

