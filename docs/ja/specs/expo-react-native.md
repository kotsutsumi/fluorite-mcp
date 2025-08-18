---
title: Expo / React Native エコシステム
---

# Expo / React Native エコシステム

- リソース URI: `spec://expo-react-native-ecosystem`

主な構成:
- Expo 公式/基盤: expo, expo-router, expo-updates, auth-session, secure-store, 各種センサー/通知/AV/FS ほか
- React Native 基盤: navigation/gesture/reanimated/screens/safe-area、permissions、device-info 等
- 状態管理: Redux Toolkit/React Query/軽量ストア
- フォーム/バリデーション: RHF + Yup/Zod
- UI: paper/native-base/elements、SVG、FastImage
- ネットワーク/データ: axios/apollo、AsyncStorage/Realm/WatermelonDB
- 認証/セキュリティ: RN Firebase Auth、Keychain、生体認証
- テスト/品質: Jest、RNTL、Detox、ESLint/Prettier
- 監視/性能: Sentry、RN Performance、MMKV、Config

実体は `src/catalog/expo-react-native-ecosystem.yaml` を参照。

