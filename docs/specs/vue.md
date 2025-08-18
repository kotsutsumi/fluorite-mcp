# Vue Ecosystem

`spec://vue-ecosystem`
`spec://vue-opinionated-starter`

## Overview

A comprehensive Vue.js ecosystem specification covering modern Vue 3 development with the Composition API, state management, UI libraries, and best practices for scalable applications.

## Core Framework

### Vue 3 Features
- **Composition API** - Modern reactive composition
- **Script Setup** - Simplified component syntax
- **Suspense** - Async component handling
- **Teleport** - Portal-like component rendering
- **Multiple Root Nodes** - Fragment support

## State Management

### Pinia (Recommended)
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

### Vuex (Legacy)
- Global state management
- Time-travel debugging
- Plugin ecosystem

## Data Fetching & Caching

### @tanstack/vue-query
```typescript
// composables/useUserQuery.ts
import { useQuery } from '@tanstack/vue-query'

export function useUserQuery(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

### Native Fetch with Composables
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

## UI Component Libraries

### Naive UI
```vue
<template>
  <n-config-provider :theme="theme">
    <n-space vertical>
      <n-button type="primary" @click="handleClick">
        Primary Button
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
      <v-toolbar-title>My App</v-toolbar-title>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Card Title</v-card-title>
              <v-card-text>Card content</v-card-text>
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
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">Submit</el-button>
      </el-form-item>
    </el-form>
  </el-config-provider>
</template>
```

## Form Handling & Validation

### VeeValidate + Zod
```vue
<template>
  <form @submit="onSubmit">
    <Field name="email" v-slot="{ field, errorMessage }">
      <input
        v-bind="field"
        type="email"
        placeholder="Email"
        :class="{ error: errorMessage }"
      />
      <span v-if="errorMessage">{{ errorMessage }}</span>
    </Field>
    
    <Field name="password" v-slot="{ field, errorMessage }">
      <input
        v-bind="field"
        type="password"
        placeholder="Password"
        :class="{ error: errorMessage }"
      />
      <span v-if="errorMessage">{{ errorMessage }}</span>
    </Field>
    
    <button type="submit">Submit</button>
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
  console.log('Form submitted:', values)
})
</script>
```

## Routing

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

// Navigation guard
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

## Build Tools & Development

### Vite Configuration
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

## Testing

### Vitest + Vue Test Utils
```typescript
// tests/components/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button', () => {
  it('renders properly', () => {
    const wrapper = mount(Button, {
      props: { label: 'Hello World' }
    })
    
    expect(wrapper.text()).toContain('Hello World')
  })
  
  it('emits click event', async () => {
    const wrapper = mount(Button)
    
    await wrapper.trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

### Component Testing with Cypress
```typescript
// cypress/component/Button.cy.ts
import Button from '@/components/Button.vue'

describe('Button Component', () => {
  it('renders and handles click', () => {
    cy.mount(Button, {
      props: { label: 'Click me' }
    })
    
    cy.get('button').should('contain.text', 'Click me')
    cy.get('button').click()
  })
})
```

## Development Tools

### ESLint Configuration
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

### Prettier Configuration
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "vueIndentScriptAndStyle": true
}
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load components
const AsyncComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)

// Route-based splitting
const routes = [
  {
    path: '/heavy',
    component: () => import('@/views/HeavyView.vue')
  }
]
```

### Virtual Scrolling
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

## Best Practices

### Composition API Patterns
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

### Error Handling
```typescript
// plugins/errorHandler.ts
import type { App } from 'vue'

export default {
  install(app: App) {
    app.config.errorHandler = (error, instance, info) => {
      console.error('Vue Error:', error)
      console.error('Component:', instance)
      console.error('Info:', info)
      
      // Send to error tracking service
      errorTracker.captureException(error)
    }
  }
}
```

### SEO with SSR
```typescript
// nuxt.config.ts (for Nuxt.js)
export default defineNuxtConfig({
  app: {
    head: {
      title: 'My Vue App',
      meta: [
        { name: 'description', content: 'Vue.js application' }
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

::: tip Getting Started
Start with Vite + Vue 3 + TypeScript + Pinia for modern development. Add Naive UI for components and VeeValidate for forms.
:::

::: warning Performance
Use virtual scrolling for large lists, lazy loading for routes, and proper memoization with computed properties.
:::