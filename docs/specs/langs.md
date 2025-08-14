---
title: 言語エコシステム（Zig / Elixir / Go / Dart / Flutter / C# / Unity）
---

# 言語エコシステム

Fluorite MCPは7つの主要プログラミング言語エコシステムの包括的なサポートを提供します。各エコシステムは、その言語の特性とベストプラクティスを活かした実装パターンを提供しています。

## 🔧 システムプログラミング

### Zig: `spec://zig-ecosystem`
メモリ安全性と低レベル制御を両立したシステムプログラミング言語
- **特徴**: コンパイル時実行、手動メモリ管理、Cとの完全互換性
- **用途**: 組み込み開発、WebAssembly、高性能システム
- **ライブラリ**: 標準ライブラリ、network、HTTP、SQLite、テスト

## 🌀 関数型・並行プログラミング

### Elixir: `spec://elixir-ecosystem`  
Actor モデルとフォルトトレラント設計を活かした関数型言語
- **特徴**: 軽量プロセス、分散システム対応、高可用性
- **用途**: リアルタイム通信、IoT、分散システム
- **ライブラリ**: Phoenix、Ecto、Absinthe、Plug、Guardian

## ⚡ 高性能バックエンド

### Go: `spec://go-ecosystem`
軽量ゴルーチンによる高性能バックエンド開発
- **特徴**: 並行処理、高速コンパイル、クロスプラットフォーム
- **用途**: マイクロサービス、API、クラウドネイティブ
- **ライブラリ**: Gin、Gorilla Mux、Chi、GORM、gRPC、Prometheus

## 🎯 クロスプラットフォーム開発

### Dart: `spec://dart-ecosystem`
型安全性とマルチプラットフォーム対応を実現する現代的言語
- **特徴**: null安全性、AOT/JITコンパイル、ホットリロード
- **用途**: Web、モバイル、サーバーサイド
- **ライブラリ**: HTTP、Dio、json_serializable、Freezed、get_it

### Flutter: `spec://flutter-ecosystem`
単一コードベースでマルチプラットフォーム対応のモバイル開発
- **特徴**: 60fps UI、ホットリロード、リアクティブ設計
- **用途**: iOS/Android/Web/デスクトップアプリ
- **ライブラリ**: flutter_bloc、Riverpod、go_router、Firebase統合

## 🏢 エンタープライズ・ゲーム開発

### C#: `spec://csharp-ecosystem`
静的型システムとエンタープライズグレードの機能を提供
- **特徴**: 静的型システム、高性能JIT/AOT、ガベージコレクション
- **用途**: Web API、エンタープライズアプリ、データベース連携
- **ライブラリ**: ASP.NET Core、Entity Framework、Dapper、MediatR

### Unity: `spec://unity-ecosystem`
プロフェッショナルゲーム開発とインタラクティブコンテンツ制作
- **特徴**: クロスプラットフォーム、ビジュアルスクリプティング、リアルタイム3D
- **用途**: ゲーム開発、VR/AR、シミュレーション
- **ライブラリ**: Zenject、UniRx、DOTween、Cinemachine、Mirror

## 📈 パフォーマンス特性

| 言語 | メモリ管理 | 並行処理 | コンパイル | 主な用途 |
|------|------------|----------|------------|----------|
| **Zig** | 手動 | スレッド | ネイティブ | システム、組み込み |
| **Elixir** | GC | Actor | BEAM VM | 分散、リアルタイム |
| **Go** | GC | ゴルーチン | ネイティブ | バックエンド、インフラ |
| **Dart** | GC | Isolate | JIT/AOT | Web、モバイル |
| **Flutter** | GC | Isolate | JIT/AOT | モバイル、デスクトップ |
| **C#** | GC | Task/Thread | JIT/AOT | エンタープライズ |
| **Unity** | GC | Job System | JIT/IL2CPP | ゲーム、インタラクティブ |

各 YAML 仕様は `src/catalog/` ディレクトリに格納されています。

