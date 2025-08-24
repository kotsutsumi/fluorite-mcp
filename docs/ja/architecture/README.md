# Fluorite-MCP アーキテクチャドキュメント

## 概要

このディレクトリには、Fluorite-MCP SuperClaudeラッパーシステムの包括的なアーキテクチャドキュメントが含まれています。

## ドキュメント一覧

### コアアーキテクチャ
1. **[アーキテクチャサマリー](../ARCHITECTURE_SUMMARY.ja.md)** - エグゼクティブ概要と主要コンポーネント
2. **[Fluoriteラッパー設計](./fluorite-wrapper-design.md)** - コアシステムアーキテクチャと設計原則
3. **[実装ロードマップ](./implementation-roadmap.md)** - 詳細な6週間実装計画

### 技術仕様
4. **[コマンドマッピング仕様](./command-mapping-spec.md)** - `/fl:`コマンドの`/sc:`コマンドへのマッピング方法
5. **[Claude CLI統合](./claude-cli-integration.md)** - Claude Code CLIとの統合
6. **[スパイクテンプレート拡張計画](./spike-template-expansion-plan.md)** - 1000以上のテンプレート計画

### 品質とデプロイメント
7. **[テスト戦略](./testing-strategy.md)** - 包括的なテストアプローチ
8. **[デプロイメント計画](./deployment-plan.md)** - NPM公開と配布戦略

## クイックリンク

### 開発者向け
- [実装ロードマップ](./implementation-roadmap.md)から開始
- 実装詳細は[コマンドマッピング](./command-mapping-spec.md)を確認
- 品質ガイドラインは[テスト戦略](./testing-strategy.md)を参照

### アーキテクト向け
- [アーキテクチャサマリー](../ARCHITECTURE_SUMMARY.ja.md)を読む
- [ラッパー設計](./fluorite-wrapper-design.md)を探索
- [Claude CLI統合](./claude-cli-integration.md)を理解

### コントリビューター向け
- [実装ロードマップ](./implementation-roadmap.md)に従う
- [スパイクテンプレート](./spike-template-expansion-plan.md)に貢献
- [テスト戦略](./testing-strategy.md)に準拠を確認

## 主要メトリクス

- **開発タイムライン**: 6週間
- **目標パフォーマンス**: 30-50%のトークン削減
- **テンプレートカバレッジ**: 1000以上のテンプレート、80%のパターンカバレッジ
- **品質目標**: 90%以上のテストカバレッジ
- **採用目標**: 6ヶ月で100,000以上のユーザー

## アーキテクチャ原則

1. **互換性第一**: 完全なSuperClaudeコマンド互換性
2. **置換ではなく拡張**: 既存のワークフローを壊さずに価値を追加
3. **トークン効率**: 最小限のトークン使用のために全インタラクションを最適化
4. **開発者体験**: ゼロフリクションのセットアップと直感的なコマンド
5. **拡張性**: 新しいコマンドとテンプレートの追加が容易

## テクノロジースタック

- **言語**: TypeScript
- **CLIフレームワーク**: Commander.js
- **MCP統合**: @modelcontextprotocol/sdk
- **テスト**: Vitest
- **ドキュメント**: VitePress
- **CI/CD**: GitHub Actions
- **配布**: NPM、Docker

## 連絡先

- **リポジトリ**: [github.com/kotsutsumi/fluorite-mcp](https://github.com/kotsutsumi/fluorite-mcp)
- **イシュー**: [GitHub Issues](https://github.com/kotsutsumi/fluorite-mcp/issues)
- **ドキュメント**: README.mdおよびdocs/フォルダを参照