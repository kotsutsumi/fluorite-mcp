# WebRTC / ストリーミング配信エコシステム

`spec://webrtc-streaming-ecosystem`

## 📋 概要

WebRTC と各種ストリーミング技術の包括的なエコシステム仕様です。リアルタイム通信、ライブ配信、メディア処理の最新技術を網羅しています。

## 🏗️ 主要カテゴリ

### WebRTC ライブラリ
- **PeerJS**: シンプルなP2P接続管理
- **simple-peer**: 最小限のWebRTCラッパー
- **SkyWay**: NTTコミュニケーションズのWebRTC PaaS

### SFUサーバー
- **mediasoup**: 高性能SFU実装（C++/Node.js）
- **Janus Gateway**: C実装のWebRTCゲートウェイ
- **Jitsi Meet**: オープンソース会議プラットフォーム

### ストリーミングプレイヤー
- **hls.js**: JavaScript HLSプレイヤー
- **Video.js**: 多機能HTML5プレイヤー
- **Shaka Player**: Google製DASH/HLSプレイヤー
- **ExoPlayer**: Android向けプレイヤー

### メディアサーバー
- **Kurento**: メディア処理機能付きサーバー
- **Ant Media Server**: 低遅延配信サーバー
- **OvenMediaEngine**: 超低遅延WebRTC/HLS配信

### 配信プラットフォーム
- **Agora.io**: リアルタイム通信API
- **Twilio Video**: プログラマブル映像通信
- **AWS IVS**: 超低遅延ストリーミング
- **Mux**: 動画インフラAPI

### 処理ツール
- **FFmpeg**: 包括的メディア処理フレームワーク
- **GStreamer**: マルチメディアパイプライン構築
- **OBS Studio**: 配信・録画ソフトウェア

## 🚀 主な用途

- **ビデオ会議**: WebRTC + SFUで大規模会議
- **ライブ配信**: RTMP → HLS/DASH変換配信
- **リアルタイム通信**: 低遅延P2P通信
- **メディア処理**: エンコード・トランスコード
- **教育プラットフォーム**: インタラクティブ学習環境

## 💡 技術パターン

### WebRTC + HLS ハイブリッド
```
参加者（インタラクティブ）: WebRTC
視聴者（スケール）: HLS配信
```

### アダプティブストリーミング
```
品質自動調整: 帯域幅検出 → 品質切り替え
複数画質提供: HLS/DASHマニフェスト
```

### 録画ワークフロー
```
ライブ配信 → リアルタイム録画 → 後処理 → アーカイブ
```

## ⚡ 低遅延技術

- **LL-HLS**: HLS遅延を2-6秒に短縮
- **WebTransport**: QUIC ベースの次世代通信API
- **WebCodecs**: 低レベルコーデックアクセス
- **QUIC/HTTP3**: 接続確立時間短縮

## 🔧 統合パターン

### 基本的なWebRTC接続
```javascript
import Peer from 'peerjs';

const peer = new Peer();
const conn = peer.connect('other-peer-id');

conn.on('open', () => {
  conn.send('Hello WebRTC!');
});
```

### HLS.js プレイヤー
```javascript
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const video = document.querySelector('video');
  const hls = new Hls();
  hls.loadSource('stream.m3u8');
  hls.attachMedia(video);
}
```

## 📊 性能指標

- **WebRTC遅延**: 100-500ms
- **LL-HLS遅延**: 2-6秒
- **従来HLS遅延**: 15-30秒
- **DASH遅延**: 10-30秒

## 🌐 対応環境

- **ブラウザ**: Chrome, Firefox, Safari, Edge
- **モバイル**: iOS (Safari/WKWebView), Android (Chrome)
- **ネイティブ**: iOS/Android SDK
- **サーバー**: Node.js, C++, Go, Java

## 📚 ベストプラクティス

### パフォーマンス
- アダプティブビットレート配信の実装
- 適切なエラーハンドリング
- モバイルネットワーク最適化
- CDN活用によるグローバル配信

### セキュリティ
- トークンベース認証の実装
- DRMによるコンテンツ保護
- シグナリングチャネルの暗号化
- 入力値検証とモニタリング

### スケーラビリティ
- SFUによるグループ通信
- カスケード配信による大規模対応
- クラウド自動スケーリング
- 帯域幅使用量最適化

## 🔗 関連仕様

このエコシステムは以下の仕様で利用できます：

```
spec://webrtc-streaming-ecosystem
```

Claude Code CLI で WebRTC・ストリーミング開発の包括的な支援を受けられます。

