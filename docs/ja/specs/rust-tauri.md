---
title: Rust / Tauri エコシステム
---

# Rust / Tauri エコシステム

- リソース URI: `spec://rust-tauri-ecosystem`

主な構成:
- サーバー/BFF: Axum, Actix-web, async-graphql, tonic, jsonwebtoken, Tower
- DB/ORM: SeaORM, Diesel, refinery/barrel
- 非同期/並列: tokio, rayon, lapin
- セキュリティ: ring, argon2/bcrypt
- 観測/運用: tracing, metrics, anyhow/thiserror
- Tauri: tauri、@tauri-apps/api、公式プラグイン（OAuth/FS/通知/ウィンドウ/Stronghold/Updater）
- フロント: Vite + Vue/React/Svelte、UnoCSS/Tailwind、Element Plus/Radix UI
- 運用Tips: allowlist 最小化、IPC スコープ、更新/署名、tracing + Sentry

実体は `src/catalog/rust-tauri-ecosystem.yaml` を参照。

