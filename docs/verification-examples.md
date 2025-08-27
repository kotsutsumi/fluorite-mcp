# Verification Examples (CLI/Dashboard)

Concrete commands and steps to validate integrations after applying spikes.

## Stripe (Payments)
- Install Stripe CLI and login
- Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Trigger test event: `stripe trigger checkout.session.completed`
- Verify: server logs contain handled event; retry/idempotency behavior is correct

## AWS S3 (Storage)
- Check bucket exists: `aws s3 ls | grep <bucket>`
- Upload test object: `aws s3 cp ./README.md s3://<bucket>/health/README.md`
- Read back: `aws s3 cp s3://<bucket>/health/README.md -`
- Verify: ACL/public access settings and Content-Type/Cache-Control headers

## Kafka (Queue/Broker)
- Start console consumer: `kafka-console-consumer --topic <topic> --bootstrap-server <broker>`
- Produce test message: `kafka-console-producer --topic <topic> --bootstrap-server <broker>`
- Verify: service consumes, commits offsets, and reprocesses on retry

## Meilisearch (Search)
- Create index: `curl -X POST 'http://localhost:7700/indexes' -H 'Content-Type: application/json' -d '{"uid":"docs"}'`
- Add docs: `curl -X POST 'http://localhost:7700/indexes/docs/documents' -H 'Content-Type: application/json' -d '[{"id":1,"title":"hello"}]'`
- Search: `curl 'http://localhost:7700/indexes/docs/search' -H 'Content-Type: application/json' -d '{"q":"hello"}'`
- Verify: auth keys configured and index settings (stop-words, synonyms) as needed

## General
- Run static analysis: `/fl:analyze --focus quality` or `--focus security`
- Run tests: `/fl:test unit --coverage`
- Review changes and run local app flows in development

