# Storage: CDN別レシピ（CloudFront / Cloudflare）

CDN配下で `storage-full` の署名発行と配信を行うときの最小レシピです。

## AWS CloudFront（最小）

- Response Headers Policy（カスタム）
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control`: S3オブジェクトのヘッダを尊重（必要に応じて上書き）
  - CORS（必要時）: `Access-Control-Allow-Origin: <origin>`
- Cache Policy（カスタム）
  - Cache Key に `Content-Type` と `Content-Disposition` を含める
  - TTL: `max-age`/`s-maxage` は運用方針に合わせる
- Behavior
  - GET/HEAD のみを許可（PUT/POSTは直S3 presigned経由）
  - Origin: S3 バケット

## Cloudflare（最小）

- Transform Rules
  - Response Header に `X-Content-Type-Options: nosniff` を付与
  - 必要に応じて `Cache-Control`/CORS を設定
- Cache Rules
  - Cache Key に `Content-Type`/`Content-Disposition` を含める（ミス配信防止）
  - TTL は `max-age` と合致するように設定
- R2/Workers（拡張）
  - 署名URL/検証は Workers でのヘッダ上書き・検証も可能

## 一般Tips

- 署名時に設定したヘッダ（`Content-Type`/`Content-MD5`/`Cache-Control`/`Content-Disposition`）は、アップロード時に同値で送る必要がある
- CDNでの上書きは慎重に（S3とCDNのヘッダ乖離は検証困難の原因）
- inline表示は allowlist 方式＋`nosniff` を推奨
- 画像/静的アセットは immutable なキー（ハッシュ込み）＋長期キャッシュが有効

関連:
- `docs/ja/storage-filename-policy.md`
- `docs/ja/storage-cdn-inline.md`
