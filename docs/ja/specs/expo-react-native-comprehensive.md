# Expo/React Native 包括エコシステム

`spec://expo-react-native-comprehensive-ecosystem`

## 概要

Expo と React Native の包括的なモバイル開発エコシステム仕様です。モダンなクロスプラットフォームモバイルアプリケーション開発に必要なすべての技術スタックを網羅しています。

## 主要コンポーネント

### コアフレームワーク
- **Expo SDK** - 包括的なモバイル開発プラットフォーム
- **React Native** - クロスプラットフォームモバイルフレームワーク
- **Expo Router** - ファイルベースルーティング
- **Expo Updates** - OTAアップデート機能

### ナビゲーション
- **React Navigation** - 標準ナビゲーションライブラリ
- **Expo Router** - Next.js風のファイルベースルーティング

### 状態管理
- **Zustand** - 軽量状態管理
- **Tanstack Query** - サーバー状態管理
- **Jotai** - アトミック状態管理
- **Redux Toolkit** - エンタープライズ向け状態管理

### UIコンポーネント
- **React Native Elements** - UIコンポーネントキット
- **NativeBase** - カスタマイズ可能なUIライブラリ
- **React Native Paper** - Material Design実装
- **Tamagui** - 高性能UIシステム

### アニメーション
- **React Native Reanimated** - 高性能アニメーション
- **React Native Gesture Handler** - ジェスチャー処理
- **Lottie React Native** - JSONベースアニメーション
- **Moti** - ユニバーサルアニメーション

### パフォーマンス最適化
- **FlashList** - 高性能リスト
- **React Native MMKV** - 高速ストレージ
- **React Native Fast Image** - 画像最適化

## 使用例

```typescript
// Expo Router を使用したファイルベースルーティング
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => 
            <Ionicons name="home" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => 
            <Ionicons name="person" size={24} color={color} />
        }}
      />
    </Tabs>
  );
}
```

## ベストプラクティス

- パフォーマンス最適化を最初から考慮
- プラットフォーム固有のコードは最小限に
- Expo SDK の機能を最大限活用
- 適切な状態管理ソリューションの選択
- セキュアなストレージの実装

## リソース

- [Expo 公式ドキュメント](https://docs.expo.dev)
- [React Native 公式ドキュメント](https://reactnative.dev)
- [仕様ファイル](https://github.com/kotsutsumi/fluorite-mcp/blob/main/src/catalog/expo-react-native-comprehensive-ecosystem.yaml)