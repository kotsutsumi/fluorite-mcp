# Vue エコシステム

`spec://vue-ecosystem`
`spec://vue-opinionated-starter`

## 概要

Composition API、状態管理、UIライブラリ、スケーラブルなアプリケーションのベストプラクティスを網羅した、モダンなVue 3開発のための包括的エコシステム仕様です。

## コアフレームワーク

### Vue 3 機能
- **Composition API** - モダンなリアクティブコンポジション
- **Script Setup** - 簡素化されたコンポーネント構文
- **Suspense** - 非同期コンポーネント処理
- **Teleport** - ポータルライクなコンポーネントレンダリング
- **複数ルートノード** - フラグメントサポート

## 状態管理

### Pinia（推奨）
```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  
  async function login(credentials) {
    const response = await api.login(credentials)
    user.value = response.data
  }
  
  function logout() {
    user.value = null
  }
  
  return { user, isAuthenticated, login, logout }
})
```

### Vuex（レガシー）
- グローバル状態管理
- タイムトラベルデバッグ
- プラグインエコシステム

## データフェッチ・キャッシング

### @tanstack/vue-query
```typescript
// composables/useUserQuery.ts
import { useQuery } from '@tanstack/vue-query'

export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5分
  })
}
```

### Composablesを使ったネイティブFetch
```typescript
// composables/useFetch.ts
import { ref, watchEffect } from 'vue'

export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const loading = ref(true)
  const error = ref<Error | null>(null)
  
  watchEffect(async () => {
    try {
      loading.value = true
      const response = await fetch(url)
      data.value = await response.json()
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  })
  
  return { data, loading, error }
}
```

## UIコンポーネントライブラリ

### Naive UI
```vue
<template>
  <n-config-provider :theme="theme">
    <n-space vertical>
      <n-button type="primary" @click="handleClick">
        プライマリボタン
      </n-button>
      <n-data-table
        :columns="columns"
        :data="data"
        :pagination="pagination"
      />
    </n-space>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NButton, NDataTable, NSpace } from 'naive-ui'
import { darkTheme } from 'naive-ui'
</script>
```

### Vuetify
```vue
<template>
  <v-app>
    <v-app-bar>
      <v-toolbar-title>マイアプリ</v-toolbar-title>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>カードタイトル</v-card-title>
              <v-card-text>カード内容</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
```

### Element Plus
```vue
<template>
  <el-config-provider :locale="locale">
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="名前" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">送信</el-button>
      </el-form-item>
    </el-form>
  </el-config-provider>
</template>
```

## フォーム処理・バリデーション

### VeeValidate + Zod
```vue
<template>
  <form @submit="onSubmit">
    <Field name="email" v-slot="{ field, errorMessage }">
      <input
        v-bind="field"
        type="email"
        placeholder="メールアドレス"
        :class="{ error: errorMessage }"
      />
      <span v-if="errorMessage">{{ errorMessage }}</span>
    </Field>
    
    <Field name="password" v-slot="{ field, errorMessage }">
      <input
        v-bind="field"
        type="password"
        placeholder="パスワード"
        :class="{ error: errorMessage }"
      />
      <span v-if="errorMessage">{{ errorMessage }}</span>
    </Field>
    
    <button type="submit">送信</button>
  </form>
</template>

<script setup lang="ts">
import { Field, useForm } from 'vee-validate'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const { handleSubmit } = useForm({
  validationSchema: schema
})

const onSubmit = handleSubmit(async (values) => {
  console.log('フォーム送信:', values)
})
</script>
```

## ルーティング

### Vue Router 4
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

## ビルドツール・開発環境

### Vite設定
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['naive-ui']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})
```

## テスト

### Vitest + Vue Test Utils
```typescript
// tests/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button', () => {
  it('正しくレンダリングされる', () => {
    const wrapper = mount(Button, {
      props: { label: 'Hello World' }
    })
    
    expect(wrapper.text()).toContain('Hello World')
  })
  
  it('クリックイベントを発行する', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

### Cypressコンポーネントテスト
```typescript
// cypress/component/Button.cy.ts
import Button from '@/components/Button.vue'

describe('Buttonコンポーネント', () => {
  it('レンダリングとクリック処理', () => {
    cy.mount(Button, {
      props: { label: 'クリックしてね' }
    })
    
    cy.get('button').should('contain.text', 'クリックしてね')
    cy.get('button').click()
  })
})
```

## 開発ツール

### ESLint設定
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@vue/eslint-config-typescript',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error'
  }
}
```

### Prettier設定
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "vueIndentScriptAndStyle": true
}
```

## パフォーマンス最適化

### コード分割
```typescript
// 遅延コンポーネント読み込み
const AsyncComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)

// ルートベース分割
const routes = [
  {
    path: '/heavy',
    component: () => import('@/views/HeavyView.vue')
  }
]
```

### 仮想スクロール
```vue
<template>
  <div class="virtual-list" ref="container">
    <div
      v-for="item in visibleItems"
      :key="item.id"
      class="list-item"
    >
      {{ item.content }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  items: Array<{ id: string; content: string }>
  itemHeight: number
}>()

const container = ref<HTMLElement>()
const scrollTop = ref(0)
const containerHeight = ref(0)

const visibleItems = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const end = start + Math.ceil(containerHeight.value / props.itemHeight)
  return props.items.slice(start, end + 1)
})
</script>
```

## ベストプラクティス

### Composition APIパターン
```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  const isEven = computed(() => count.value % 2 === 0)
  
  return {
    count: readonly(count),
    increment,
    decrement,
    reset,
    isEven
  }
}
```

### エラーハンドリング
```typescript
// plugins/errorHandler.ts
import type { App } from 'vue'

export default {
  install(app: App) {
    app.config.errorHandler = (error, instance, info) => {
      console.error('Vue Error:', error)
      console.error('Component:', instance)
      console.error('Info:', info)
      
      // エラートラッキングサービスに送信
      errorTracker.captureException(error)
    }
  }
}
```

### SSRによるSEO
```typescript
// nuxt.config.ts (Nuxt.js用)
export default defineNuxtConfig({
  app: {
    head: {
      title: 'My Vue App',
      meta: [
        { name: 'description', content: 'Vue.jsアプリケーション' }
      ]
    }
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  }
})
```

---

::: tip はじめに
Vite + Vue 3 + TypeScript + Piniaでモダン開発をスタートしましょう。コンポーネントにはNaive UI、フォームにはVeeValidateを追加してください。
:::

::: warning パフォーマンス
大きなリストには仮想スクロール、ルートには遅延読み込み、computed プロパティで適切なメモ化を使用してください。
:::