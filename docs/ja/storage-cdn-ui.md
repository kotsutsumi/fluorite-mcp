# Storage: CloudFront/Cloudflare UI 手順（最小）

本ガイドは `docs/ja/storage-cdn-recipes.md` の具体的なUI操作手順を補足します。

## CloudFront（最小手順）

1) CloudFront コンソール → Policies → Response headers policies → Create
   - Add header: `X-Content-Type-Options: nosniff`
   - （必要時）CORS: `Access-Control-Allow-Origin: <origin>`
2) Cache policies → Create
   - Cache key: Include headers → `Content-Type`, `Content-Disposition`
   - TTL: 運用ポリシーに準拠（例: Default 1h）
3) Distributions → 対象Distribution → Behaviors → Edit
   - Allowed methods: GET, HEAD（PUT/POSTは presigned直接アップロード）
   - Origin: S3 バケット
   - Cache policy: Step2のポリシー
   - Response headers policy: Step1のポリシー

## Cloudflare（最小手順）

1) Rules → Transform Rules → HTTP Response Header Modification → Create
   - Add: `X-Content-Type-Options: nosniff`
   - （必要時）CORS: `Access-Control-Allow-Origin: <origin>`
2) Rules → Cache Rules → Create
   - Cache Key: `Content-Type`, `Content-Disposition` を含める
   - TTL: S3 `Cache-Control` と整合
3) R2/Workers（拡張）
   - 署名URL/検証をWorkersで実装する場合は storage-full の署名ヘッダと整合させる

## チェックリスト
- [ ] inlineは allowlist の Content-Type だけに限定
- [ ] `nosniff` を有効化
- [ ] Cache key に `Content-Type`/`Content-Disposition` を含める
- [ ] 署名ヘッダ（Content-Type/MD5/Cache-Control/Disposition）とアップロード時の実ヘッダが一致
