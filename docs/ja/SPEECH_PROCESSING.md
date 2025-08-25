# 音声処理・言語学機能 - Fluorite MCP

Fluorite MCPに含まれる包括的な音声処理・言語学分析システムの詳細ガイドです。

## 🎯 概要

音声処理機能は、現代の言語学研究と音声技術の最新標準に基づいた、包括的な音韻・韻律分析システムを提供します。X-SAMPA/IPA音韻表記、ToBI韻律注釈、エンドツーエンド音声処理パイプラインを含む、プロダクション対応の実装を特徴としています。

## 🧬 主要コンポーネント

### 1. X-SAMPA/IPA変換システム (`strike-x-sampa-ipa-converter`)

ASCII互換のX-SAMPA表記とUnicode IPA表記間の双方向変換システム。

#### 特徴
- **包括的音韻インベントリ**: 子音、母音、超音韻素の完全な対応表
- **特徴抽出**: 音韻特徴（有声性、調音点、調音方法）の自動解析
- **検証機能**: 音韻表記の正確性確認と音韻類似度計算
- **TypeScript完全対応**: 型安全な音韻操作とIntelliSense支援

#### 使用例
```typescript
import { xsampaConverter } from './phonetics/xsampa-converter';

// X-SAMPA から IPA への変換
const ipa = xsampaConverter.xsampaToIpa('hE"loU'); // → [hɛˈloʊ]
const fricative = xsampaConverter.xsampaToIpa('S'); // → [ʃ]

// IPA から X-SAMPA への変換
const xsampa = xsampaConverter.ipaToXsampa('ʃ'); // → 'S'
const schwa = xsampaConverter.ipaToXsampa('ə'); // → '@'

// 音韻特徴の抽出
const features = xsampaConverter.getPhonemeFeatures('ʃ', 'ipa');
// 結果: { voicing: 'voiceless', place: 'postalveolar', manner: 'fricative', type: 'consonant' }
```

#### 対応音韻
- **子音**: p, b, t, d, k, g, f, v, θ, ð, s, z, ʃ, ʒ, h, m, n, ŋ, l, r, j, w
- **母音**: i, ɪ, e, ɛ, æ, a, ə, ɜ, ɑ, ɔ, o, ʊ, u
- **超音韻素**: ˈ（第一強勢）, ˌ（第二強勢）, ː（長音）

### 2. ToBI韻律注釈システム (`strike-tobi-prosody-annotator`)

Tones and Break Indices（ToBI）標準に基づく韻律パターン注釈システム。

#### 特徴
- **自動音調検出**: 基本周波数（F0）輪郭からの音調ターゲット自動識別
- **ブレーク指標分析**: 韻律境界の強度分類（0-4レベル）
- **韻律解析**: リズム、イントネーション、フレージング構造の包括的分析
- **感情・話し方検出**: 音響特徴に基づく感情・話し方スタイルの自動分類

#### ToBI記号体系
```typescript
// 音調タイプ
interface ToBITone {
  type: 'H*' | 'L*' | 'H+L*' | 'L+H*' | 'H*+L' | 'L*+H' | 'H-' | 'L-' | 'H%' | 'L%' | '!H*' | '!L*';
  position: number;    // 時間位置（ミリ秒）
  strength: number;    // 音調強度（0-1）
}

// ブレーク指標
interface BreakIndex {
  level: 0 | 1 | 2 | 3 | 4;  // 境界強度
  position: number;           // 時間位置
  type: 'word' | 'phrase' | 'clause' | 'utterance';
}
```

#### 使用例
```typescript
import { tobiAnnotator } from './prosody/tobi-annotator';

const prosodyFeatures = {
  pitch: [150, 180, 200, 170, 140],        // F0輪郭（Hz）
  intensity: [0.8, 0.9, 0.7, 0.6, 0.5],   // 振幅エンベロープ
  duration: [100, 120, 110, 130, 140],     // セグメント長（ms）
  timestamps: [0, 100, 220, 330, 460]     // 時間アライメント
};

const annotation = tobiAnnotator.annotate('Hello world', prosodyFeatures, {
  language: 'en-US',
  auto_detect_tones: true,
  auto_detect_breaks: true
});

console.log(annotation.tones);   // 検出されたピッチアクセントと境界音調
console.log(annotation.breaks);  // ブレーク指標（0-4）
```

### 3. 統合音声処理パイプライン (`strike-speech-processing-pipeline`)

エンドツーエンドの音声解析・合成ワークフロー。

#### 特徴
- **音声認識統合**: 時間対応音韻アライメント付きSTT
- **音韻解析**: 自動音韻分解とX-SAMPA/IPA変換
- **韻律注釈**: ToBI標準に基づく自動韻律分析
- **音声合成**: 韻律制御付きTTSエンジン統合
- **エクスポート機能**: Praat TextGrid、ELAN、言語学分析フォーマット対応

#### アーキテクチャ
```typescript
interface SpeechPipeline {
  // 入力: 音声データ
  input: AudioBuffer | string;
  
  // 処理ステップ
  steps: {
    speechToText: boolean;       // 音声認識
    phoneticAnalysis: boolean;   // 音韻解析
    prosodyAnnotation: boolean;  // 韻律注釈
    textToSpeech: boolean;       // 音声合成
  };
  
  // 出力設定
  output: {
    format: 'textgrid' | 'elan' | 'json' | 'tobi';
    includeAudio: boolean;
    compression: 'none' | 'lossless' | 'lossy';
  };
}
```

## 🛠️ 技術実装

### ライブラリエコシステム統合

**phonetics-linguistic-ecosystem.yaml**で管理される包括的なライブラリ統合:

#### JavaScript/TypeScript
- **x-sampa**: X-SAMPA/IPA変換
- **ipa-features**: IPA音韻特徴抽出
- **tobi-prosody**: ToBI韻律注釈
- **meyda**: 音響特徴抽出
- **node-wav**: WAVファイル処理

#### Python
- **phonemizer**: 多言語音韻変換
- **panphon**: IPA特徴解析
- **praat-parselmouth**: Praat音響解析
- **librosa**: 音響信号処理
- **TTS**: 最新音声合成

#### 音響処理
- **MFCC**: メル周波数ケプストラム係数
- **F0抽出**: 基本周波数解析
- **フォルマント**: 音響共鳴分析
- **韻律特徴**: リズム、強勢、イントネーション

### 対応ファイル形式

#### 音声ファイル
- **WAV**: 非圧縮、16kHz以上推奨
- **FLAC**: 可逆圧縮
- **MP3**: 保存用（解析非推奨）

#### 注釈形式
- **ToBI**: 標準韻律注釈
- **TextGrid**: Praat互換
- **ELAN**: 多層言語学注釈
- **JSON**: 構造化データ交換

## 🎯 実用的使用例

### 1. 多言語音韻分析
```typescript
// 英語音韻の分析
const englishAnalysis = analyzePhonetics('hɛˈloʊ wɜrld');

// 日本語音韻の処理
const japaneseAnalysis = analyzePhonetics('こんにちは', { language: 'ja' });
```

### 2. 感情音声解析
```typescript
const emotionalAnalysis = prosodyAnalyzer.analyze(annotation);
console.log(emotionalAnalysis.speaking_style.emotion); // 'excited', 'sad', 'neutral'
```

### 3. リズム・テンポ解析
```typescript
const rhythmAnalysis = prosodyAnalyzer.analyze(annotation);
console.log(rhythmAnalysis.rhythm.tempo);      // BPM
console.log(rhythmAnalysis.rhythm.regularity); // 0-1スケール
```

## 🔬 言語学的応用

### 研究分野
- **音韻論**: 音韻システムと音韻プロセス分析
- **韻律学**: 強勢、リズム、イントネーション研究
- **語学教育**: 発音指導と評価
- **言語病理学**: 発話障害の診断・治療
- **音声技術**: 音声認識・合成システム開発

### 教育応用
- **発音練習**: 学習者の発音と標準音韻の比較
- **韻律指導**: イントネーション・リズムパターンの視覚化
- **言語習得研究**: 第二言語音韻習得過程の分析

## 🔧 開発・統合ガイド

### 基本セットアップ
```bash
# Fluorite MCPの音声処理機能を有効化
npm install fluorite-mcp
claude mcp add fluorite-mcp -- fluorite-mcp

# 音声処理依存関係（オプション）
npm install audio-buffer fft-js
```

### カスタマイズ
```typescript
// カスタム音韻インベントリの追加
const customConverter = new XSampaConverter();
customConverter.addPhoneme('custom_symbol', {
  ipa: 'ɸ', xsampa: 'p\\', 
  features: { voicing: 'voiceless', place: 'bilabial', manner: 'fricative', type: 'consonant' }
});

// カスタムToBI注釈ルールの定義
const customAnnotator = new ToBIAnnotator();
customAnnotator.addToneRule('custom_pattern', (pitch, context) => ({
  type: 'H*', strength: 0.8, description: 'カスタム高音調'
}));
```

## 📚 参考文献・標準

### 国際標準
- **IPA**: International Phonetic Alphabet (国際音韻記号)
- **X-SAMPA**: Extended Speech Assessment Methods Phonetic Alphabet
- **ToBI**: Tones and Break Indices prosodic annotation system

### 学術リファレンス
- Beckman, M. E., & Ayers, G. M. (1997). Guidelines for ToBI labelling
- Silverman, K. et al. (1992). ToBI: A standard for labeling English prosody
- Jun, S. A. (Ed.). (2005). Prosodic Typology: The Phonology of Intonation and Phrasing

## 🚀 今後の開発予定

### 予定機能
- **リアルタイム音声解析**: ストリーミング音声の即時韻律分析
- **多言語ToBI**: 日本語、中国語ToBI注釈システム
- **機械学習統合**: 深層学習による音韻・韻律特徴自動抽出
- **視覚化ツール**: インタラクティブな音韻・韻律可視化
- **音響モデル**: 話者適応型音響特徴抽出

### コミュニティ貢献
- 新しい言語の音韻システム追加
- カスタムToBI注釈ルールの開発
- 特殊用途向け音響解析アルゴリズムの実装

音声処理・言語学分析のニーズに応じて、Fluorite MCPの音声機能をご活用ください。技術的な質問や機能リクエストは、GitHubリポジトリまでお寄せください。