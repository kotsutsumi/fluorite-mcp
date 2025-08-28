# Alertmanager Slack ルーティング（最小例）

Alertmanager を使って Prometheus のアラートを Slack にルーティングする最小構成例です。

alertmanager.yml（warningのみ）:
```yaml
route:
  receiver: 'slack'
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h

receivers:
  - name: 'slack'
    slack_configs:
      - send_resolved: true
        api_url: 'https://hooks.slack.com/services/XXX/YYY/ZZZ' # 環境/Secretで管理推奨
        channel: '#alerts'
        title: '{{ .CommonAnnotations.summary }}'
        text: '{{ range .Alerts }}\n• {{ .Annotations.description }}{{ end }}'
```

alertmanager.yml（severityごとにチャンネル分離＋inhibit例）:
```yaml
route:
  receiver: 'slack-warning'
  routes:
    - receiver: 'slack-critical'
      matchers: ['severity="critical"']
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h

receivers:
  - name: 'slack-warning'
    slack_configs:
      - send_resolved: true
        api_url: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
        channel: '#alerts-warn'
        title: '{{ .CommonAnnotations.summary }}'
        text: '{{ range .Alerts }}\n• {{ .Annotations.description }}{{ end }}'
  - name: 'slack-critical'
    slack_configs:
      - send_resolved: true
        api_url: 'https://hooks.slack.com/services/XXX/YYY/ZZZ'
        channel: '#alerts'
        title: '{{ .CommonAnnotations.summary }}'
        text: '{{ range .Alerts }}\n• {{ .Annotations.description }}{{ end }}'

inhibit_rules:
  - target_matchers: ['severity="critical"']
    source_matchers: ['severity="warning"']
    equal: ['alertname']
```

運用Tips:
- api_url は環境/Secret に置き、リポジトリに直書きしない
- `group_by` や `repeat_interval` はチームの運用ポリシーに合わせて調整
- まずは warning レベルのみから開始し、のちに critical を追加
- severityでチャンネルを分けると、重要度ごとのノイズを抑えられる

関連ドキュメント:
- Recording/Alerting Rules（最小例）: `docs/ja/metrics-scrape.md`
- examples の `/metrics`: monitoring-full, search-full, payments-full, storage-full

## Silence API（メンテナンス時の一括停止・最小例）

Alertmanager の API を使って一時的にアラートを停止できます。

例: 2時間メンテのため、すべてのアラートをサイレンス（実運用では matchers で対象を絞る）

```bash
curl -s -X POST http://localhost:9093/api/v2/silences -H 'content-type: application/json' -d @- <<'EOF' | jq
{
  "matchers": [
    { "name": "alertname", "value": ".*", "isRegex": true }
  ],
  "startsAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "endsAt": "$(date -u -v+2H +%Y-%m-%dT%H:%M:%SZ)",
  "createdBy": "maintenance",
  "comment": "scheduled maintenance"
}
EOF
```

注意:
- 実運用では対象を正規表現やlabelsで絞り、過剰なサイレンスを避ける
- メンテ時間外のサイレンス残存を防ぐため、必ず `endsAt` を設定
