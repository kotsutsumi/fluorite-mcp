# Storage: Filename/Content-Disposition ポリシー指針（最小）

S3等でダウンロード時のファイル名を制御する場合、`Content-Disposition` の `filename` パラメータを使います。本リポの storage-full は安全な既定値とサニタイズを備えています。

## 推奨ポリシー

- 既定は `attachment` を推奨（ブラウザでの誤表示を回避）
- `filename` は英数・ドット・アンダースコア・ハイフンのみを許可
- 最大長を 64～128 程度に制限
- アップロード鍵（key）の basename をベースにしつつ、アプリ側で別名を指定可能
- `Content-Type`/`Cache-Control` と組み合わせてダウンロード挙動を明示

### inline で表示する場合の注意

- `Content-Type` はブラウザが安全にレンダリングできるものに限定（image/*, text/plain, text/csv など）
- `Cache-Control` は `public, max-age=...` 等を用途に応じて設定
- X-Content-Type-Options: nosniff（CDN/エッジでの適用も検討）
- HTML/JS/PDF などは XSS や埋め込みに注意。inline より attachment を推奨（必要時のみ allowlist）

## storage-full の環境変数

- `DEFAULT_ATTACHMENT=true`: 署名時に `attachment; filename="<basename>"` を自動付与
- `SANITIZE_FILENAME=true`（既定）: `filename="..."` を安全文字へ置換
- `FILENAME_MAXLEN=128`: ファイル名の最大長
- `ALLOW_CONTENT_TYPES`: 許可する Content-Type（カンマ区切り）
- `MAX_SIZE_BYTES`: 署名要求で想定する最大バイト数（越えると 413）

## 署名例（curl）

```bash
# 署名（Content-Type と Content-Disposition）
curl -s -X POST localhost:3004/sign-put -H 'content-type: application/json' \
  -d '{
    "provider":"s3",
    "bucket":"my-bucket",
    "key":"uploads/report Q1.csv",
    "contentType":"text/csv",
    "contentDisposition":"attachment; filename=\"report_Q1.csv\""
  }' | jq
```

storage-full 側でサニタイズが有効なら、`filename="..."` の部分のみ安全な名前へ置換されます。

## 注意点

- RFC5987 の拡張 `filename*`（UTF-8/percent-encoding）等、国際化要件がある場合は運用要件に応じて拡張してください
- 署名時ヘッダはアップロード時に同値が必須（Content-Type/Content-MD5/Cache-Control/Disposition）
- XSS/CRLF等の文脈挿入を避けるため、`filename` のサニタイズは必須
