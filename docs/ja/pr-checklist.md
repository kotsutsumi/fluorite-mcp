# PR前チェックリスト（テンプレート）

次の観点を確認してからPRを作成してください。

- [ ] ビルド/型チェック: `npm run build`（必要に応じて `npm run lint`）
- [ ] 例の健全性: `npm run examples:dryrun`（ネット不要）
- [ ] HTTP起動の確認（CI側）: examples-dryrun.yml の `/health` プローブが成功
- [ ] 変更したサンプル/テンプレの最小動作（search-full, monitoring-full など）
- [ ] Docs更新（必要に応じて）: strike-packs / strike-recipes / pack-samples / pack-checklists / tutorials
- [ ] セキュリティ/権限（キー/シークレット/権限最小化）

メモ（任意）:
- 影響範囲:
- リスク/ロールバック:
- フォローアップ:
