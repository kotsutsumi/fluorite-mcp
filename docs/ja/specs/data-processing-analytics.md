# データ処理・分析エコシステム

`spec://data-processing-analytics-ecosystem`

## 概要

モダンなデータ処理と分析のための包括的エコシステム仕様です。DuckDB、Polars、Apache Arrow、リアルタイムストリーミング、可視化ツールを網羅しています。

## 主要コンポーネント

### データ処理エンジン
- **DuckDB** - 組み込み型分析データベース
- **Polars** - 高速DataFrameライブラリ
- **Apache Arrow** - カラム型メモリフォーマット
- **DataFusion** - SQLクエリエンジン

### ストリーミング処理
- **Apache Kafka** - 分散ストリーミングプラットフォーム
- **Apache Pulsar** - クラウドネイティブメッセージング
- **RisingWave** - ストリーミングデータベース

### データ可視化
- **D3.js** - データドリブン可視化
- **Observable Plot** - 宣言的データ可視化
- **Apache ECharts** - インタラクティブチャート
- **Plotly** - 科学技術グラフ

## 実装例

### DuckDB 高速分析
```python
import duckdb
import pandas as pd

# DuckDB接続
conn = duckdb.connect(':memory:')

# Parquetファイル直接クエリ
result = conn.execute("""
    SELECT 
        customer_id,
        SUM(amount) as total_spent,
        COUNT(*) as order_count,
        AVG(amount) as avg_order_value
    FROM 'data/*.parquet'
    WHERE order_date >= '2024-01-01'
    GROUP BY customer_id
    HAVING total_spent > 1000
    ORDER BY total_spent DESC
""").df()

# Pandas DataFrameとの統合
df = pd.read_csv('large_dataset.csv')
conn.register('df_view', df)

# Window関数とCTE
analysis = conn.execute("""
    WITH monthly_sales AS (
        SELECT 
            DATE_TRUNC('month', order_date) as month,
            SUM(amount) as revenue,
            COUNT(DISTINCT customer_id) as unique_customers
        FROM df_view
        GROUP BY 1
    ),
    growth_metrics AS (
        SELECT 
            month,
            revenue,
            unique_customers,
            LAG(revenue, 1) OVER (ORDER BY month) as prev_revenue,
            LEAD(revenue, 1) OVER (ORDER BY month) as next_revenue
        FROM monthly_sales
    )
    SELECT 
        month,
        revenue,
        unique_customers,
        (revenue - prev_revenue) / prev_revenue * 100 as growth_rate
    FROM growth_metrics
    WHERE prev_revenue IS NOT NULL
""").df()
```

### Polars 高性能データ処理
```python
import polars as pl
import polars.selectors as cs

# Lazy評価で大規模データ処理
df = pl.scan_csv("huge_dataset.csv")

result = (
    df
    .filter(pl.col("date") >= "2024-01-01")
    .group_by(["category", "region"])
    .agg([
        pl.col("sales").sum().alias("total_sales"),
        pl.col("quantity").mean().alias("avg_quantity"),
        pl.col("customer_id").n_unique().alias("unique_customers"),
        pl.col("profit").quantile(0.75).alias("profit_q75")
    ])
    .sort("total_sales", descending=True)
    .head(100)
    .collect()  # ここで実際に実行
)

# 複雑な変換とWindow関数
transformed = (
    pl.scan_parquet("data/*.parquet")
    .with_columns([
        pl.col("timestamp").cast(pl.Datetime),
        (pl.col("price") * pl.col("quantity")).alias("total")
    ])
    .with_columns([
        pl.col("total")
        .rolling_mean(window_size="7d", by="timestamp")
        .over("product_id")
        .alias("moving_avg_7d")
    ])
    .filter(pl.col("total") > pl.col("moving_avg_7d") * 1.2)
    .collect(streaming=True)  # ストリーミング処理
)
```

### Apache Arrow 高速データ交換
```python
import pyarrow as pa
import pyarrow.parquet as pq
import pyarrow.compute as pc
import pyarrow.flight as flight

# Arrow Table作成
schema = pa.schema([
    ('id', pa.int64()),
    ('name', pa.string()),
    ('value', pa.float64()),
    ('timestamp', pa.timestamp('ms'))
])

data = pa.table({
    'id': [1, 2, 3],
    'name': ['A', 'B', 'C'],
    'value': [10.5, 20.3, 30.1],
    'timestamp': pd.date_range('2024-01-01', periods=3, freq='D')
})

# 高速フィルタリングと変換
filtered = data.filter(pc.greater(data['value'], 15))
sorted_data = filtered.sort_by([('value', 'descending')])

# Parquet書き込み（圧縮付き）
pq.write_table(
    sorted_data,
    'output.parquet',
    compression='snappy',
    use_dictionary=True,
    compression_level=5
)

# Arrow Flight Server（高速データ転送）
class FlightServer(flight.FlightServerBase):
    def do_get(self, context, ticket):
        # データストリーミング
        return flight.RecordBatchStream(data)
```

### リアルタイムストリーミング処理
```python
from kafka import KafkaProducer, KafkaConsumer
import json

# Kafkaプロデューサー
producer = KafkaProducer(
    bootstrap_servers=['localhost:9092'],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# イベント送信
for i in range(1000):
    event = {
        'event_id': i,
        'timestamp': datetime.now().isoformat(),
        'value': random.random() * 100
    }
    producer.send('events', event)

# Kafkaコンシューマー（ストリーム処理）
consumer = KafkaConsumer(
    'events',
    bootstrap_servers=['localhost:9092'],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

# Window集計
from collections import deque
from datetime import datetime, timedelta

window = deque(maxlen=100)  # 最新100イベント
aggregates = {}

for message in consumer:
    event = message.value
    window.append(event)
    
    # リアルタイム集計
    current_sum = sum(e['value'] for e in window)
    current_avg = current_sum / len(window)
    
    # 結果を別のトピックに送信
    producer.send('aggregates', {
        'timestamp': datetime.now().isoformat(),
        'window_size': len(window),
        'sum': current_sum,
        'average': current_avg
    })
```

### D3.js インタラクティブ可視化
```javascript
import * as d3 from 'd3'

// データ準備
const data = await d3.csv('data.csv', d => ({
  date: d3.timeParse('%Y-%m-%d')(d.date),
  value: +d.value,
  category: d.category
}))

// スケール設定
const xScale = d3.scaleTime()
  .domain(d3.extent(data, d => d.date))
  .range([margin.left, width - margin.right])

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)])
  .range([height - margin.bottom, margin.top])

// SVG作成
const svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

// ライン生成
const line = d3.line()
  .x(d => xScale(d.date))
  .y(d => yScale(d.value))
  .curve(d3.curveMonotoneX)

// グループごとにライン描画
const categories = d3.group(data, d => d.category)

categories.forEach((values, key) => {
  svg.append('path')
    .datum(values)
    .attr('fill', 'none')
    .attr('stroke', colorScale(key))
    .attr('stroke-width', 2)
    .attr('d', line)
    .on('mouseover', handleMouseOver)
    .on('mouseout', handleMouseOut)
})

// インタラクティブツールチップ
const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0)

function handleMouseOver(event, d) {
  tooltip.transition().duration(200).style('opacity', .9)
  tooltip.html(`Value: ${d.value}<br>Date: ${d.date}`)
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY - 28) + 'px')
}
```

## ベストプラクティス

- データパイプラインの最適化
- メモリ効率的な処理
- 適切なデータフォーマットの選択
- インデックス戦略の実装
- リアルタイム処理の設計

## リソース

- [DuckDB ドキュメント](https://duckdb.org/docs/)
- [Polars ドキュメント](https://pola.rs)
- [Apache Arrow ドキュメント](https://arrow.apache.org)
- [仕様ファイル](https://github.com/kotsutsumi/fluorite-mcp/blob/main/src/catalog/data-processing-analytics-ecosystem.yaml)