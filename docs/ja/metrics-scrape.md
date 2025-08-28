# メトリクスのスクレイプ設定（最小）

## Prometheus（ローカル）

prometheus.yml の `scrape_configs` に次を追加:

```yaml
scrape_configs:
  - job_name: 'monitoring-full'
    static_configs:
      - targets: ['localhost:3001']
  - job_name: 'search-full'
    static_configs:
      - targets: ['localhost:3002']
```

- ブラウザで Prometheus UI を開き、メトリクス名（例: `http_request_duration_seconds_count`）を探索
- 注意: 高カーディナリティを避けるため、例では path 正規化やラベルの最小化を実施

## Grafana（最小）

- Data source に Prometheus を追加（http://localhost:9090）
- New dashboard → Panel を追加 → Query にメトリクス名を入力
  - 例: `sum by (path) (rate(http_requests_by_path_total[5m]))`
  - 例: `histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket{path="/metrics"}[5m])))`

ヒント:
- 本リポの examples はデモ用の最小構成です。実運用では relabeling/recording rules を追加してコスト最適化を行ってください。
 - Alertmanager の Slack 連携は `docs/ja/metrics-alertmanager.md` を参照してください。

## Recording Rules（最小例）

`prometheus.yml` の `rule_files` に `rules.yml` を指定し、次のような recording rules を作成します。

```yaml
groups:
  - name: app-recording-rules
    interval: 30s
    rules:
      # エラーレート（5m）
      - record: job:http_error_rate_5m
        expr: |
          sum by (job) (rate(http_responses_by_code_total{code=~"5.."}[5m]))
          /
          sum by (job) (rate(http_requests_total[5m]))

      # p99 レイテンシ（/metrics パスに限定する例）
      - record: job:path:http_request_duration_seconds:p99_5m
        expr: |
          histogram_quantile(0.99, sum by (job, le) (rate(http_request_duration_seconds_bucket{path="/metrics"}[5m])))
```

ダッシュボードでは、`job:http_error_rate_5m` や `job:path:http_request_duration_seconds:p99_5m` を直接参照できます。

## Alerting Rules（最小例）

`alerts.yml` などに以下を定義し、Prometheusの `rule_files` に指定します。

```yaml
groups:
  - name: app-alerts
    rules:
      - alert: HighErrorRate
        expr: job:http_error_rate_5m > 0.05
        for: 10m
        labels: { severity: warning }
        annotations:
          summary: "High error rate (>5% for 10m)"
          description: "Error rate for job {{ $labels.job }} is {{ $value | printf "%.2f" }}"

      - alert: HighLatencyP99
        expr: job:path:http_request_duration_seconds:p99_5m > 1
        for: 10m
        labels: { severity: warning }
        annotations:
          summary: "High p99 latency (>1s for 10m)"
          description: "p99 latency for job {{ $labels.job }} is {{ $value | printf "%.2f" }}s"
```

Alertmanager側は Slack/Webhook 等へルーティングを設定してください（最小構成で十分です）。
