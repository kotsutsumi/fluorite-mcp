# Spike Templates Guide

Learn how to use Fluorite MCP's spike development system for rapid prototyping and experimentation.

## 📖 Table of Contents

- [What are Spike Templates?](#what-are-spike-templates)
- [Available Template Catalog](#available-template-catalog)
- [Using Spike Templates](#using-spike-templates)
- [Spike Development Workflow](#spike-development-workflow)
- [Template Categories](#template-categories)
- [Advanced Spike Techniques](#advanced-spike-techniques)

## What are Spike Templates?

Spike templates are pre-built, minimal code scaffolds designed for rapid prototyping and technical experimentation. They help you quickly validate ideas, test libraries, and prototype features without the overhead of full project setup.

### Key Principles

- **🚀 Speed**: Get from idea to working code in minutes
- **🎯 Focus**: Minimal setup to test specific functionality
- **📝 Documentation**: Learn through working examples
- **🔄 Iteration**: Quick experiment → learn → iterate cycle

### When to Use Spikes

**Technical Uncertainty**: 
- Testing new libraries or frameworks
- Validating complex algorithms
- Checking performance requirements

**Proof of Concept**:
- UI interaction patterns
- API integration approaches
- Database schema designs

**Learning and Exploration**:
- Understanding new technologies
- Comparing different approaches
- Training and education

## Available Template Catalog

### Next.js Templates (15+)

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `nextjs-minimal` | Basic Next.js SSR setup | Testing server-side rendering |
| `nextjs-api-hello` | Simple API route | API development patterns |
| `nextjs-api-zod-router` | API with Zod validation | Type-safe API design |
| `nextjs-auth-nextauth-credentials` | Credentials authentication | Auth system testing |
| `nextjs-prisma-sqlite-crud` | Database CRUD operations | Data layer experimentation |
| `nextjs-edge-middleware` | Edge middleware patterns | Request/response handling |
| `nextjs-file-upload-route` | File upload handling | Upload functionality testing |
| `nextjs-form-server-action` | Server actions with forms | Form processing patterns |
| `nextjs-i18n-minimal` | Internationalization | Localization testing |
| `nextjs-image-optimization` | Image handling | Performance optimization |
| `nextjs-isr-page` | Incremental Static Regeneration | Caching strategies |
| `nextjs-middleware-basic-auth` | Basic authentication | Security patterns |
| `nextjs-ratelimit-middleware` | Rate limiting | API protection |
| `nextjs-route-params` | Dynamic routing | URL parameter handling |
| `nextjs-upstash-ratelimit` | Advanced rate limiting | Scalable protection |

### FastAPI Templates (15+)

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `fastapi-minimal` | Basic FastAPI setup | API prototyping |
| `fastapi-alembic-minimal` | Database migrations | Schema management |
| `fastapi-background-tasks` | Async task processing | Background job testing |
| `fastapi-celery-skeleton` | Celery integration | Distributed tasks |
| `fastapi-cors` | CORS configuration | Cross-origin requests |
| `fastapi-dependency-injection` | DI patterns | Service architecture |
| `fastapi-jwt-auth` | JWT authentication | Secure API design |
| `fastapi-logging-uvicorn` | Logging setup | Observability patterns |
| `fastapi-oauth2-password` | OAuth2 implementation | Advanced authentication |
| `fastapi-openapi-tags` | API documentation | Developer experience |
| `fastapi-pydantic-v2-models` | Data validation | Type safety |
| `fastapi-pytest-minimal` | Testing setup | Quality assurance |
| `fastapi-settings-pydantic` | Configuration management | Environment handling |
| `fastapi-sqlmodel-sqlite` | Database integration | Data persistence |
| `fastapi-websockets` | Real-time communication | WebSocket patterns |

### GitHub Actions Templates (10+)

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `gha-node-ci` | Node.js CI pipeline | Continuous integration |
| `gha-docker-build-push` | Docker workflows | Container deployment |
| `gha-playwright` | E2E testing pipeline | Automated testing |
| `gha-codeql-analysis` | Security scanning | Code security |
| `gha-lint-typecheck-split` | Code quality checks | Quality gates |
| `gha-monorepo-matrix` | Monorepo workflows | Multi-package projects |
| `gha-env-deploy-gates` | Deployment gates | Safe deployments |
| `gha-pr-label-conditional` | Conditional workflows | Smart automation |
| `gha-release-drafter` | Release automation | Change management |
| `gha-secrets-scan` | Security scanning | Vulnerability detection |

### Playwright Templates (8+)

| Template ID | Description | Use Case |
|-------------|-------------|----------|
| `playwright-minimal` | Basic test setup | E2E testing start |
| `playwright-axe-accessibility` | Accessibility testing | WCAG compliance |
| `playwright-ct-react` | Component testing | Unit + integration |
| `playwright-docker-ci` | CI/CD integration | Automated testing |
| `playwright-network-intercept` | API mocking | Backend simulation |
| `playwright-parallel-shards` | Parallel execution | Performance testing |
| `playwright-report-allure` | Advanced reporting | Test documentation |
| `playwright-trace-on-failure` | Debug tracing | Failure investigation |

## Using Spike Templates

### Discovery Phase

Find relevant templates for your experiment:

```
I need to test JWT authentication in a FastAPI application
```

**Claude Response**: 
"I recommend the `fastapi-jwt-auth` spike template. This template includes JWT token generation, validation, and protected route examples."

### Preview Phase

Examine template contents before applying:

```
Show me what's included in the nextjs-prisma-sqlite-crud template
```

**Response**: Details about files, dependencies, and configuration included in the template.

### Application Phase

Apply the template to start experimenting:

```
Apply the fastapi-jwt-auth template with custom parameters
```

**Parameters**: You can customize templates with variables like app names, ports, or specific configurations.

## Spike Development Workflow

### 1. Define the Experiment

**Clear Objectives**:
```
Goal: Test if React DnD can handle nested drag-and-drop with 100+ items
Time: 2 hours maximum
Success Criteria: Smooth dragging without performance issues
```

### 2. Select Template

**Choose Appropriate Spike**:
```
Use nextjs-minimal as base + add react-dnd dependencies
```

### 3. Rapid Implementation

**Focus on Core Functionality**:
```typescript
// Spike code - not production quality
function DragDropSpike() {
  // Hardcoded test data - OK for spikes
  const testData = generateTestNodes(100);
  
  // Minimal error handling - focus on functionality
  const handleDrop = (source, target) => {
    console.log('Drop successful:', source.id, '→', target.id);
    // TODO: Implement proper state update
  };
  
  return <TreeView data={testData} onDrop={handleDrop} />;
}
```

### 4. Validation

**Quick Testing**:
```typescript
// Simple validation tests
test('can drag 100 items without lag', async () => {
  const startTime = performance.now();
  await dragItemToTarget(item1, target);
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(100); // 100ms max
});
```

### 5. Documentation

**Record Findings**:
```markdown
## Spike Results: React DnD Performance Test

### What Worked
- ✅ Smooth dragging up to 100 items
- ✅ Good browser compatibility
- ✅ Easy to implement

### Issues Found
- ❌ Memory usage increases with nested depth
- ⚠️ Performance degrades after 500+ items

### Recommendation
- 👍 Proceed with React DnD
- 🔄 Implement virtualization for large lists
- ⏱️ Estimated implementation: 3-5 days
```

### 6. Integration or Iteration

**Success**: Move to production implementation
**Failure**: Try alternative approach
**Partial**: Refine spike or test different parameters

## Template Categories

### Web Framework Spikes

**Purpose**: Test web frameworks and patterns
**Examples**: Next.js SSR, API routes, middleware
**Use Cases**: Performance testing, feature validation

### API Development Spikes

**Purpose**: Backend service experimentation
**Examples**: FastAPI endpoints, authentication, database integration
**Use Cases**: Architecture decisions, third-party integrations

### Testing Strategy Spikes

**Purpose**: Validate testing approaches
**Examples**: E2E scenarios, accessibility testing, performance testing
**Use Cases**: Quality strategy, tool evaluation

### DevOps and CI/CD Spikes

**Purpose**: Infrastructure and deployment testing
**Examples**: GitHub Actions, Docker workflows, deployment pipelines
**Use Cases**: Process automation, deployment strategies

## Advanced Spike Techniques

### Parallel Spike Strategy

Test multiple approaches simultaneously:

```bash
# Create multiple spike branches
git checkout -b spike/approach-a
# Apply nextjs-auth-nextauth-credentials template

git checkout -b spike/approach-b  
# Apply custom JWT implementation

# Compare results after experimentation
```

### Spike Composition

Combine multiple templates:

```
Start with nextjs-minimal, then add:
- prisma integration (database layer)
- nextauth authentication (auth layer)
- playwright testing (validation layer)
```

### Performance Spike Patterns

**Load Testing Spikes**:
```typescript
// Performance-focused spike
const STRESS_TEST_SIZE = 10000;
const testData = generateLargeDataSet(STRESS_TEST_SIZE);

function PerformanceSpike() {
  const [metrics, setMetrics] = useState({});
  
  const measurePerformance = (operation) => {
    const start = performance.now();
    operation();
    const duration = performance.now() - start;
    setMetrics(prev => ({ ...prev, [operation.name]: duration }));
  };
  
  return (
    <div>
      <MetricsDisplay metrics={metrics} />
      <StressTestComponent data={testData} onOperation={measurePerformance} />
    </div>
  );
}
```

### Integration Spike Patterns

**API Integration Testing**:
```python
# FastAPI integration spike
@app.get("/test-integration")
async def test_third_party_api():
    """Spike to test external API integration"""
    # Quick and dirty implementation
    try:
        response = requests.get("https://api.example.com/data")
        return {"status": "success", "data": response.json()}
    except Exception as e:
        # Minimal error handling for spike
        return {"status": "error", "message": str(e)}
```

### Security Spike Patterns

**Authentication Testing**:
```typescript
// Security spike - test auth patterns
function AuthSpike() {
  const testCredentials = {
    // Hardcoded for spike only
    username: "test@example.com",
    password: "spike-testing-123"
  };
  
  const testAuthFlow = async () => {
    // Test multiple auth scenarios
    const scenarios = [
      () => loginWithCredentials(testCredentials),
      () => loginWithGoogle(),
      () => testJWTExpiration(),
      () => testRefreshToken()
    ];
    
    for (const scenario of scenarios) {
      try {
        await scenario();
        console.log(`✅ ${scenario.name} passed`);
      } catch (error) {
        console.log(`❌ ${scenario.name} failed:`, error);
      }
    }
  };
  
  return <AuthTestInterface onTest={testAuthFlow} />;
}
```

## Best Practices

### Time Management

**✅ Do**:
- Set strict time limits (1-3 days max)
- Focus on core functionality
- Document learnings immediately
- Stop when objectives are met

**❌ Don't**:
- Perfect the spike code
- Add comprehensive error handling
- Write full test suites
- Over-engineer solutions

### Code Quality in Spikes

**✅ Acceptable in Spikes**:
```typescript
// Hardcoding is OK
const API_KEY = "test-key-123";

// TODO comments are expected
// TODO: Implement proper error handling
// TODO: Add input validation
// FIXME: This is a spike-only implementation

// Console logging for debugging
console.log("Spike: Testing drag operation");
```

**❌ Still Avoid**:
- Security vulnerabilities
- Infinite loops or memory leaks
- Blocking operations without timeouts

### Documentation Standards

**Minimum Documentation**:
```markdown
# Spike: [Feature Name]

## Objective
Test [specific functionality] with [specific technology]

## Results
- ✅ What worked
- ❌ What didn't work  
- ⚠️ What needs investigation

## Recommendation
- [ ] Proceed with implementation
- [ ] Try alternative approach
- [ ] Need more investigation

## Time Spent: [X hours]
```

## Template Customization

### Parameter Usage

Templates support variable substitution:

```json
{
  "id": "custom-nextjs-app",
  "params": [
    { "name": "app_name", "required": false, "default": "my-app" },
    { "name": "port", "required": false, "default": "3000" }
  ],
  "files": [
    {
      "path": "{{app_name}}/package.json",
      "template": "{ \"name\": \"{{app_name}}\", ... }"
    }
  ]
}
```

### Environment Configuration

```bash
# Spike-specific environment variables
SPIKE_MODE=true
SKIP_AUTH=true
USE_MOCK_DATA=true
DEBUG_LEVEL=verbose
```

## Common Spike Patterns

### UI Component Spikes

```typescript
// Component experimentation pattern
function ComponentSpike() {
  const [variants, setVariants] = useState([
    'default', 'outlined', 'filled', 'text'
  ]);
  
  return (
    <div>
      {variants.map(variant => (
        <TestComponent 
          key={variant}
          variant={variant}
          onClick={() => console.log(`${variant} clicked`)}
        />
      ))}
    </div>
  );
}
```

### Data Flow Spikes

```typescript
// State management testing
function StateSpike() {
  // Test different state management approaches
  const [zustandData, setZustandData] = useZustandStore();
  const [jotaiData, setJotaiData] = useAtom(jotaiAtom);
  const { queryData, mutateData } = useQuery('test-data');
  
  const compareStateManagement = () => {
    // Compare performance, developer experience, etc.
  };
  
  return <StateComparison onTest={compareStateManagement} />;
}
```

## Next Steps

- **[Template Creation Guide](./template-creation.md)** - Create your own templates
- **[Developer Guide](./developer.md)** - Advanced customization
- **[API Documentation](../API.md)** - Programmatic access
- **[Getting Started](./getting-started.md)** - Basic usage

## Resources

### Learning Materials

- **Agile Spike Development**: Understanding spike methodology
- **Rapid Prototyping**: Best practices for quick experimentation
- **Technical Validation**: How to validate technical assumptions

### Community Templates

- Share your spike templates with the community
- Contribute to the official template collection
- Request new template categories

---

*Last updated: 2025-08-15*