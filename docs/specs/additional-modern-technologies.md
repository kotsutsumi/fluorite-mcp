# テスティング・データベース・可視化エコシステム

`spec://additional-modern-technologies-ecosystem`

## 概要

テスティング、データベース、ネイティブモバイル開発、データ可視化・コラボレーションツールの包括的エコシステム仕様です。品質保証から可視化まで幅広い技術を網羅しています。

## 主要コンポーネント

### テスティング・品質保証
- **Playwright** - クロスブラウザE2Eテスト
- **Jest** - JavaScript/TypeScriptテスティング
- **Vitest** - Vite ネイティブテストランナー
- **Testing Library** - ユーザー中心のテスト

### データベース技術
- **Prisma** - 次世代TypeScript ORM
- **Supabase** - オープンソースFirebase代替
- **Drizzle ORM** - TypeScript SQLビルダー
- **PostgreSQL** - 高機能リレーショナルDB

### ネイティブモバイル開発
- **Swift** - iOS/macOS開発言語
- **SwiftUI** - 宣言的UIフレームワーク
- **Kotlin** - Android開発言語
- **Jetpack Compose** - モダンAndroid UI

### データ可視化・コラボレーション
- **React Flow** - ノードベースエディター
- **TipTap** - ヘッドレスリッチテキストエディター
- **Lexical** - Meta製エディターフレームワーク
- **Monaco Editor** - VSCode エディター

## 実装例

### Playwright E2Eテスト
```typescript
import { test, expect } from '@playwright/test'

test.describe('E-commerce checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://shop.example.com')
  })

  test('complete purchase flow', async ({ page }) => {
    // 商品検索
    await page.fill('[data-testid="search-input"]', 'laptop')
    await page.press('[data-testid="search-input"]', 'Enter')
    
    // 商品選択
    await page.click('[data-testid="product-card"]:first-child')
    await expect(page).toHaveURL(/.*products\/\d+/)
    
    // カートに追加
    await page.click('[data-testid="add-to-cart"]')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
    
    // チェックアウト
    await page.click('[data-testid="checkout-button"]')
    
    // フォーム入力
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="expiry"]', '12/25')
    await page.fill('[data-testid="cvc"]', '123')
    
    // 注文確定
    await page.click('[data-testid="place-order"]')
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible()
  })

  test('handles errors gracefully', async ({ page }) => {
    // エラーハンドリングテスト
    await page.route('**/api/checkout', route => {
      route.fulfill({ status: 500, body: 'Server Error' })
    })
    
    await page.click('[data-testid="checkout-button"]')
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
  })
})

// マルチブラウザテスト設定
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

### Prisma データベース操作
```typescript
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  tags      Tag[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

// TypeScript使用例
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 複雑なクエリ
async function getPopularPosts() {
  return await prisma.post.findMany({
    where: {
      published: true,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 過去7日間
      }
    },
    include: {
      author: {
        select: {
          name: true,
          email: true
        }
      },
      tags: true,
      _count: {
        select: {
          comments: true,
          likes: true
        }
      }
    },
    orderBy: {
      likes: {
        _count: 'desc'
      }
    },
    take: 10
  })
}

// トランザクション
async function transferPost(postId: number, newAuthorId: number) {
  return await prisma.$transaction(async (tx) => {
    const post = await tx.post.findUnique({
      where: { id: postId }
    })
    
    if (!post) throw new Error('Post not found')
    
    const newAuthor = await tx.user.findUnique({
      where: { id: newAuthorId }
    })
    
    if (!newAuthor) throw new Error('New author not found')
    
    return await tx.post.update({
      where: { id: postId },
      data: { authorId: newAuthorId }
    })
  })
}
```

### Swift iOS開発
```swift
import SwiftUI
import Combine

// SwiftUI View
struct ContentView: View {
    @StateObject private var viewModel = UserViewModel()
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            List {
                SearchBar(text: $searchText)
                
                ForEach(viewModel.filteredUsers(searchText)) { user in
                    NavigationLink(destination: UserDetailView(user: user)) {
                        UserRow(user: user)
                    }
                }
            }
            .navigationTitle("Users")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: viewModel.refresh) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
        }
        .onAppear {
            viewModel.loadUsers()
        }
    }
}

// ViewModel
class UserViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private var cancellables = Set<AnyCancellable>()
    
    func loadUsers() {
        isLoading = true
        
        APIService.shared.fetchUsers()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.error = error
                    }
                },
                receiveValue: { [weak self] users in
                    self?.users = users
                }
            )
            .store(in: &cancellables)
    }
    
    func filteredUsers(_ searchText: String) -> [User] {
        if searchText.isEmpty {
            return users
        }
        return users.filter { 
            $0.name.localizedCaseInsensitiveContains(searchText) 
        }
    }
}
```

### Kotlin Android開発
```kotlin
// Jetpack Compose UI
@Composable
fun UserListScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    val users by viewModel.users.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Users") },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // 検索バー
            OutlinedTextField(
                value = searchQuery,
                onValueChange = viewModel::updateSearchQuery,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Search users...") },
                leadingIcon = { Icon(Icons.Default.Search, null) }
            )
            
            // ユーザーリスト
            when {
                isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                users.isEmpty() -> {
                    EmptyState()
                }
                else -> {
                    LazyColumn {
                        items(users) { user ->
                            UserCard(
                                user = user,
                                onClick = { viewModel.selectUser(user) }
                            )
                        }
                    }
                }
            }
        }
    }
}

// ViewModel with Hilt
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {
    
    private val _users = MutableStateFlow<List<User>>(emptyList())
    val users: StateFlow<List<User>> = _users.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    init {
        loadUsers()
        observeSearchQuery()
    }
    
    private fun observeSearchQuery() {
        searchQuery
            .debounce(300)
            .distinctUntilChanged()
            .onEach { query ->
                filterUsers(query)
            }
            .launchIn(viewModelScope)
    }
    
    fun loadUsers() {
        viewModelScope.launch {
            userRepository.getUsers()
                .flowOn(Dispatchers.IO)
                .collect { result ->
                    _users.value = result
                }
        }
    }
}
```

### React Flow ノードエディター
```typescript
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
} from 'reactflow'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Process' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'End' },
    position: { x: 250, y: 250 },
  },
]

export function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}
```

## ベストプラクティス

- テスト駆動開発（TDD）の実践
- 型安全性の確保
- パフォーマンステストの実装
- モバイルファーストの設計
- アクセシビリティの考慮

## リソース

- [Playwright ドキュメント](https://playwright.dev)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Swift ドキュメント](https://swift.org/documentation/)
- [Kotlin ドキュメント](https://kotlinlang.org/docs/)
- [仕様ファイル](https://github.com/kotsutsumi/fluorite-mcp/blob/main/src/catalog/additional-modern-technologies-ecosystem.yaml)