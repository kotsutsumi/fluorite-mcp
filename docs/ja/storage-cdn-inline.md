# Storage: CDN/inline 運用Tips（最小）

ブラウザ表示（inline）やCDN配信時の安全/性能の観点をまとめます。

## ヘッダの基本
- `Content-Type`: 表示可能な安全な型のみ（image/*, text/plain, text/csv, application/pdf 等）
- `Cache-Control`: コンテンツの性質に合わせて `public, max-age=...` / `no-store` を使い分け
- `X-Content-Type-Options: nosniff`: タイプスニッフィングを無効化
- `Content-Disposition`: 基本は `attachment`。inlineが必要なときはallowlistと併用

## CDNでの推奨設定
- 圧縮: text系（text/plain, text/csv, application/json 等）は gzip/brotli を有効化
- 画像最適化: WebP/AVIFへの変換やリサイズ（必要に応じてVariations）
- キャッシュキー: `Content-Type`/`Content-Disposition` をキーに含めて誤配信を防止
- キャッシュTTL: アップロードポリシーに応じてmax-ageとstale-while-revalidateを設定

## 署名付きURLとヘッダの整合性
- 署名時に指定した `Content-Type`/`Content-MD5`/`Cache-Control`/`Content-Disposition` はアップロード時に同値必須
- CDN経由での上書きが必要な場合は、アップロード後にヘッダ再設定のバッチやメタデータAPIを検討

## 例（storage-full と併用）
- inlineでCSVを返す: `Content-Type: text/csv`, `Content-Disposition: inline; filename="..."`
- ダウンロードを強制する: `attachment; filename="..."`
- 長期キャッシュ: `public, max-age=31536000`（immutableなキー付与と併用）

参考: filenameポリシーは `docs/ja/storage-filename-policy.md` を参照。
