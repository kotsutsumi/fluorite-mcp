# Storage Full Example (Presigned PUT URL + CORS)

Minimal HTTP server that issues presigned upload URLs for S3 (optional), with basic CORS, simple rate limit, and metrics.

- Provider: S3（他は501でガード）。将来的にGCS/Azure/MinIOを追加可能。
- Env (S3): `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`（必要に応じて）、`ORIGIN`/`CORS_ORIGIN`
- Port: `PORT` (default 3004)

Run (S3):
```bash
PORT=3004 AWS_REGION=us-east-1 \
  npx tsx examples/pack-examples/storage-full/index.ts

# Request presigned PUT URL
curl -s -X POST localhost:3004/sign-put -H 'content-type: application/json' \
  -d '{"provider":"s3","bucket":"my-bucket","key":"uploads/test.txt","expires":300,"contentType":"text/plain","cacheControl":"public, max-age=31536000","acl":"public-read","contentMD5":"<base64-md5>"}' | jq

# Health / Metrics
curl -s localhost:3004/health | jq
curl -s localhost:3004/metrics
```

Notes:
- If AWS SDK v3 is not installed locally, server responds 501 for S3.
- For production: validate `bucket/key` against allowlist, attach `Content-Type`/`Cache-Control` constraints (and optional `Content-MD5`), and enforce auth.
  - Report completed uploads to `/uploaded` with `{ provider,bucket,key,size?,md5? }` for audit counting.

## Filename Policy (Content-Disposition)

- Env:
  - `DEFAULT_ATTACHMENT=true` にすると `attachment; filename="<basename>"` を自動付与（basename は key の末尾を利用）
  - `SANITIZE_FILENAME=true`（既定）で `filename="..."` の値を英数/._- のみにサニタイズ
  - `FILENAME_MAXLEN=128` などでファイル名の最大長を制限
- 任意で `contentDisposition` を指定した場合も、サニタイズが有効なら `filename="..."` 部分のみ置換されます
- 例（自動添付）:
  ```bash
  DEFAULT_ATTACHMENT=true SANITIZE_FILENAME=true \
    PORT=3004 AWS_REGION=us-east-1 npx tsx examples/pack-examples/storage-full/index.ts
  # key の basename が attachment filename に使われます
  ```

## Tips: Compute Content-MD5 and Upload with curl

Compute base64-encoded MD5 of a file (macOS/Linux):
```bash
base64_md5=$(openssl dgst -md5 -binary path/to/file | base64)
echo "$base64_md5"
```

Request a presigned URL including Content-MD5 and Content-Type:
```bash
url=$(curl -s -X POST localhost:3004/sign-put -H 'content-type: application/json' \
  -d "{\"provider\":\"s3\",\"bucket\":\"my-bucket\",\"key\":\"uploads/file.txt\",\"contentType\":\"text/plain\",\"contentMD5\":\"$base64_md5\"}" | jq -r .url)
```

Upload with the exact same headers:
```bash
curl -s -X PUT "$url" \
  -H "Content-Type: text/plain" \
  -H "Content-MD5: $base64_md5" \
  --data-binary @path/to/file -D -
```

Optionally report success:
```bash
curl -s -X POST localhost:3004/uploaded -H 'content-type: application/json' \
  -d '{"provider":"s3","bucket":"my-bucket","key":"uploads/file.txt","size":1234,"md5":"'"$base64_md5"'"}'
```
