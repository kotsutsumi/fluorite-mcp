# DevOps オペレーション・インフラエコシステム

`spec://devops-operations-ecosystem`

## 📋 概要

DevOps、Infrastructure as Code (IaC)、Kubernetes、CI/CD、クラウドオペレーションの包括的なエコシステム仕様です。現代のクラウドネイティブ開発における自動化、監視、セキュリティ、スケーラビリティを支援します。

## 🏗️ 主要カテゴリ

### Infrastructure as Code (IaC)
- **Terraform**: HashiCorp製マルチクラウドIaCツール (HCL)
- **Pulumi**: モダンIaCプラットフォーム (TypeScript/Python/Go/C#)
- **CloudFormation**: AWS専用インフラ定義 (JSON/YAML)
- **ARM Templates & Bicep**: Azure Resource Manager テンプレート
- **Google Cloud Deployment Manager**: GCP向けインフラ自動化

### 設定管理・自動化
- **Ansible**: エージェントレス設定管理 (YAML Playbooks)
- **Chef**: インフラオートメーション (Ruby DSL)
- **Puppet**: 宣言的設定管理システム
- **SaltStack**: 高速設定管理・リモート実行

### Kubernetes エコシステム
- **Kubernetes**: コンテナオーケストレーションプラットフォーム
- **Helm**: Kubernetesパッケージマネージャー
- **Kustomize**: YAML設定管理ツール
- **Argo CD**: GitOps継続的デリバリー
- **Flux CD**: Kubernetes向けGitOpsオペレーター
- **Istio & Linkerd**: サービスメッシュ

### CI/CD プラットフォーム
- **GitHub Actions**: ワークフロー自動化 (YAML)
- **GitLab CI**: 統合CI/CDプラットフォーム
- **Jenkins**: 拡張可能自動化サーバー
- **CircleCI**: クラウドCI/CDサービス
- **Argo Workflows**: Kubernetes向けワークフローエンジン
- **Tekton**: Kubernetes-nativeCI/CDビルディングブロック

### コンテナプラットフォーム
- **Docker**: コンテナ化プラットフォーム
- **Podman**: デーモンレスコンテナエンジン
- **BuildKit**: 高度なDockerイメージビルドツールキット

### 監視・可観測性
- **Prometheus**: メトリクス監視・アラート
- **Grafana**: 可視化・ダッシュボードプラットフォーム
- **Loki**: Grafana製ログ集約システム
- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **OpenTelemetry**: 統一可観測性フレームワーク
- **Jaeger**: 分散トレーシングシステム

### セキュリティスキャン
- **Trivy**: 脆弱性・設定不備スキャナー
- **Snyk**: 開発者ファーストセキュリティプラットフォーム
- **tfsec**: Terraform静的解析ツール
- **Checkov**: IaC/コンテナセキュリティスキャナー
- **kube-bench & kube-hunter**: Kubernetesセキュリティ検証

### 負荷テスト
- **Apache JMeter**: 包括的負荷テストプラットフォーム
- **k6**: 開発者中心パフォーマンステスト
- **Locust**: Pythonベース負荷テストツール
- **Vegeta**: Go製HTTP負荷テストツール

### シークレット管理
- **HashiCorp Vault**: エンタープライズシークレット管理
- **AWS Secrets Manager**: AWSマネージドシークレット
- **Azure Key Vault**: Azureセキュリティサービス
- **GCP Secret Manager**: GCPシークレット管理

## 🚀 主な用途

- **インフラ自動化**: 宣言的インフラ定義とプロビジョニング
- **継続的統合・デプロイ**: 自動化されたソフトウェアデリバリーパイプライン
- **コンテナオーケストレーション**: スケーラブルなマイクロサービス運用
- **監視・アラート**: システム健全性とパフォーマンス追跡
- **セキュリティ統合**: DevSecOpsによるセキュリティ自動化
- **設定管理**: 一貫した環境構成とドリフト防止

## 💡 基本パターン

### Terraform インフラ定義
```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "terraform-state-bucket"
    key    = "infrastructure/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC with subnets
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count = length(var.availability_zones)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
    Type = "public"
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "web" {
  name                = "${var.project_name}-asg"
  vpc_zone_identifier = aws_subnet.public[*].id
  target_group_arns   = [aws_lb_target_group.web.arn]
  health_check_type   = "ELB"
  min_size            = var.min_size
  max_size            = var.max_size
  desired_capacity    = var.desired_capacity

  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-instance"
    propagate_at_launch = true
  }
}
```

### Kubernetes Deployment と Service
```yaml
# app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web-app
    version: v1.0.0
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: myregistry/web-app:v1.0.0
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  namespace: production
spec:
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - web-app.example.com
    secretName: web-app-tls
  rules:
  - host: web-app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-app-service
            port:
              number: 80
```

### GitHub Actions CI/CD パイプライン
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'sarif'
        output: 'trivy-results.sarif'
    
    - name: Upload Trivy scan results to GitHub Security tab
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: 'trivy-results.sarif'

  build-and-push:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Configure kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'latest'
    
    - name: Set up Kubeconfig
      run: |
        mkdir -p $HOME/.kube
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config
    
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/web-app \
          web-app=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:main-${{ github.sha }} \
          -n production
        kubectl rollout status deployment/web-app -n production
```

### Ansible プレイブック
```yaml
# deploy-webapp.yml
---
- name: Deploy Web Application
  hosts: webservers
  become: yes
  vars:
    app_name: web-app
    app_version: "{{ version | default('latest') }}"
    app_port: 8080
    
  tasks:
  - name: Update system packages
    apt:
      update_cache: yes
      upgrade: dist
    
  - name: Install Docker
    apt:
      name: docker.io
      state: present
    
  - name: Start and enable Docker service
    systemd:
      name: docker
      state: started
      enabled: yes
    
  - name: Add user to docker group
    user:
      name: "{{ ansible_user }}"
      groups: docker
      append: yes
    
  - name: Pull application image
    docker_image:
      name: "myregistry/{{ app_name }}"
      tag: "{{ app_version }}"
      source: pull
    
  - name: Stop existing container
    docker_container:
      name: "{{ app_name }}"
      state: absent
    ignore_errors: yes
    
  - name: Start application container
    docker_container:
      name: "{{ app_name }}"
      image: "myregistry/{{ app_name }}:{{ app_version }}"
      state: started
      restart_policy: unless-stopped
      ports:
        - "{{ app_port }}:8080"
      env:
        NODE_ENV: production
        PORT: "8080"
      healthcheck:
        test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
        interval: 30s
        timeout: 10s
        retries: 3
    
  - name: Configure nginx reverse proxy
    template:
      src: nginx-app.conf.j2
      dest: "/etc/nginx/sites-available/{{ app_name }}"
    notify: restart nginx
    
  - name: Enable nginx site
    file:
      src: "/etc/nginx/sites-available/{{ app_name }}"
      dest: "/etc/nginx/sites-enabled/{{ app_name }}"
      state: link
    notify: restart nginx

  handlers:
  - name: restart nginx
    systemd:
      name: nginx
      state: restarted
```

### Prometheus 監視設定
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'web-app'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
```

### Docker Compose 開発環境
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: 
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/appdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

## 🛠️ ベストプラクティス

### Infrastructure as Code
- バージョン管理されたインフラ定義
- 環境ごとの設定分離（dev/staging/prod）
- リモート状態管理とロック機能
- プランレビューによる変更検証

### CI/CD パイプライン
- 自動テスト・セキュリティスキャン統合
- ブランチ戦略に基づく自動デプロイ
- ロールバック機能とBlue-Greenデプロイ
- 承認ゲートによる本番環境保護

### Kubernetes 運用
- リソース制限とオートスケーリング
- ヘルスチェックと可観測性
- シークレット管理とセキュリティポリシー
- GitOpsによる宣言的デプロイ

### 監視・アラート
- SLI/SLOベースの監視戦略
- 段階的エスカレーション
- 自動復旧とサーキットブレーカー
- インシデント対応の自動化

## 🎯 学習リソース

- **Terraform**: [公式ドキュメント](https://terraform.io/docs)
- **Kubernetes**: [CNCF認定コース](https://kubernetes.io/training/)
- **Docker**: [Docker公式チュートリアル](https://docs.docker.com/get-started/)
- **GitHub Actions**: [学習パス](https://docs.github.com/actions/learn-github-actions)
- **Prometheus**: [監視ガイド](https://prometheus.io/docs/guides/)
- **CNCF Landscape**: [クラウドネイティブ技術マップ](https://landscape.cncf.io/)

---

このエコシステムにより、モダンなDevOps実践とクラウドネイティブ開発のあらゆる側面を自動化・最適化できます。

