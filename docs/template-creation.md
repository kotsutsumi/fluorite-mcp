# Template Creation Guide

Learn how to create custom spike templates and library specifications for Fluorite MCP.

## 📖 Table of Contents

- [Spike Template Creation](#spike-template-creation)
- [Library Specification Creation](#library-specification-creation)
- [Template Best Practices](#template-best-practices)
- [Testing Templates](#testing-templates)
- [Publishing and Distribution](#publishing-and-distribution)
- [Advanced Techniques](#advanced-techniques)

## Spike Template Creation

Spike templates are JSON files that define rapid prototyping scaffolds with file templates and parameter substitution.

### Basic Template Structure

```json
{
  "id": "my-custom-template",
  "name": "My Custom Template",
  "version": "1.0.0",
  "stack": ["typescript", "react", "nextjs"],
  "tags": ["web", "frontend", "custom"],
  "description": "A custom template for rapid React development",
  "params": [
    {
      "name": "project_name",
      "required": false,
      "default": "my-app",
      "description": "Name of the project"
    },
    {
      "name": "author_name",
      "required": true,
      "description": "Author name for package.json"
    }
  ],
  "files": [
    {
      "path": "{{project_name}}/package.json",
      "template": "{\n  \"name\": \"{{project_name}}\",\n  \"author\": \"{{author_name}}\"\n}"
    }
  ],
  "patches": []
}
```

### Template Fields Reference

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the template |
| `name` | string | Human-readable name |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `description` | string | Brief description of purpose |
| `files` | array | File templates to generate |

#### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `stack` | string[] | Technologies used (for discovery) |
| `tags` | string[] | Categories and keywords |
| `params` | object[] | Template parameters |
| `patches` | object[] | Modifications to existing files |
| `dependencies` | object | NPM dependencies to install |
| `scripts` | object | NPM scripts to add |

### Parameter Configuration

Parameters allow dynamic customization of templates:

```json
{
  "params": [
    {
      "name": "project_name",
      "required": false,
      "default": "my-app",
      "description": "Project name for package.json",
      "type": "string",
      "validation": "^[a-z][a-z0-9-]*$"
    },
    {
      "name": "use_typescript",
      "required": false,
      "default": true,
      "description": "Use TypeScript instead of JavaScript",
      "type": "boolean"
    },
    {
      "name": "port",
      "required": false,
      "default": 3000,
      "description": "Development server port",
      "type": "number",
      "min": 1000,
      "max": 65535
    },
    {
      "name": "framework",
      "required": false,
      "default": "nextjs",
      "description": "Frontend framework to use",
      "type": "enum",
      "options": ["nextjs", "react", "vue"]
    }
  ]
}
```

### File Templates

File templates use Mustache-style syntax for variable substitution:

```json
{
  "files": [
    {
      "path": "{{project_name}}/src/{{#use_typescript}}app.ts{{/use_typescript}}{{^use_typescript}}app.js{{/use_typescript}}",
      "template": "{{#use_typescript}}// TypeScript version\nexport default class App {\n  name = '{{project_name}}';\n}{{/use_typescript}}{{^use_typescript}}// JavaScript version\nmodule.exports = {\n  name: '{{project_name}}'\n};{{/use_typescript}}"
    }
  ]
}
```

#### Conditional Logic

```json
{
  "template": "{{#condition}}Content when true{{/condition}}{{^condition}}Content when false{{/condition}}"
}
```

#### Loops

```json
{
  "params": [
    {
      "name": "dependencies",
      "type": "array",
      "default": ["react", "react-dom"]
    }
  ],
  "files": [
    {
      "path": "package.json",
      "template": "{\n  \"dependencies\": {\n{{#dependencies}}    \"{{.}}\": \"latest\"{{#@last}}{{/@last}}{{^@last}},{{/@last}}\n{{/dependencies}}  }\n}"
    }
  ]
}
```

### Patches for Existing Files

Patches modify existing files instead of creating new ones:

```json
{
  "patches": [
    {
      "path": "package.json",
      "operation": "merge",
      "content": {
        "scripts": {
          "custom-command": "echo 'Custom command'"
        }
      }
    },
    {
      "path": "src/index.js",
      "operation": "prepend",
      "content": "// Auto-generated imports\nimport './styles.css';\n\n"
    },
    {
      "path": "README.md",
      "operation": "append",
      "content": "\n## Custom Section\n\nThis section was added by the spike template."
    },
    {
      "path": "src/config.js",
      "operation": "replace",
      "search": "const API_URL = 'localhost';",
      "content": "const API_URL = process.env.API_URL || 'localhost';"
    }
  ]
}
```

### Complete Example: FastAPI Template

```json
{
  "id": "fastapi-custom-auth",
  "name": "FastAPI Custom Authentication",
  "version": "1.2.0",
  "stack": ["python", "fastapi", "jwt", "sqlalchemy"],
  "tags": ["api", "auth", "backend", "python"],
  "description": "FastAPI application with custom JWT authentication and database integration",
  "params": [
    {
      "name": "app_name",
      "required": false,
      "default": "fastapi-auth-app",
      "description": "Application name"
    },
    {
      "name": "database_url",
      "required": false,
      "default": "sqlite:///./app.db",
      "description": "Database connection URL"
    },
    {
      "name": "jwt_secret",
      "required": false,
      "default": "your-secret-key",
      "description": "JWT secret key"
    }
  ],
  "files": [
    {
      "path": "{{app_name}}/main.py",
      "template": "from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom .auth import router as auth_router\nfrom .database import engine, Base\n\n# Create database tables\nBase.metadata.create_all(bind=engine)\n\napp = FastAPI(title=\"{{app_name}}\", version=\"1.0.0\")\n\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=[\"*\"],\n    allow_credentials=True,\n    allow_methods=[\"*\"],\n    allow_headers=[\"*\"],\n)\n\napp.include_router(auth_router, prefix=\"/auth\", tags=[\"authentication\"])\n\n@app.get(\"/\")\ndef read_root():\n    return {\"message\": \"Welcome to {{app_name}}\"}\n"
    },
    {
      "path": "{{app_name}}/database.py",
      "template": "from sqlalchemy import create_engine\nfrom sqlalchemy.ext.declarative import declarative_base\nfrom sqlalchemy.orm import sessionmaker\n\nDATABASE_URL = \"{{database_url}}\"\n\nengine = create_engine(DATABASE_URL)\nSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)\nBase = declarative_base()\n\ndef get_db():\n    db = SessionLocal()\n    try:\n        yield db\n    finally:\n        db.close()\n"
    },
    {
      "path": "{{app_name}}/auth.py",
      "template": "from datetime import datetime, timedelta\nfrom typing import Optional\nfrom fastapi import APIRouter, Depends, HTTPException, status\nfrom fastapi.security import HTTPBearer, HTTPAuthorizationCredentials\nfrom jose import JWTError, jwt\nfrom passlib.context import CryptContext\nfrom pydantic import BaseModel\n\nSECRET_KEY = \"{{jwt_secret}}\"\nALGORITHM = \"HS256\"\nACCESS_TOKEN_EXPIRE_MINUTES = 30\n\nrouter = APIRouter()\nsecurity = HTTPBearer()\npwd_context = CryptContext(schemes=[\"bcrypt\"], deprecated=\"auto\")\n\nclass Token(BaseModel):\n    access_token: str\n    token_type: str\n\nclass TokenData(BaseModel):\n    username: Optional[str] = None\n\ndef create_access_token(data: dict, expires_delta: Optional[timedelta] = None):\n    to_encode = data.copy()\n    if expires_delta:\n        expire = datetime.utcnow() + expires_delta\n    else:\n        expire = datetime.utcnow() + timedelta(minutes=15)\n    to_encode.update({\"exp\": expire})\n    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)\n    return encoded_jwt\n\ndef verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):\n    try:\n        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])\n        username: str = payload.get(\"sub\")\n        if username is None:\n            raise HTTPException(status_code=401, detail=\"Invalid token\")\n        return username\n    except JWTError:\n        raise HTTPException(status_code=401, detail=\"Invalid token\")\n\n@router.post(\"/login\", response_model=Token)\ndef login(username: str, password: str):\n    # In real app, verify against database\n    if username == \"admin\" and password == \"admin\":\n        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)\n        access_token = create_access_token(\n            data={\"sub\": username}, expires_delta=access_token_expires\n        )\n        return {\"access_token\": access_token, \"token_type\": \"bearer\"}\n    raise HTTPException(status_code=401, detail=\"Invalid credentials\")\n\n@router.get(\"/me\")\ndef read_users_me(current_user: str = Depends(verify_token)):\n    return {\"username\": current_user}\n"
    },
    {
      "path": "{{app_name}}/requirements.txt",
      "template": "fastapi==0.104.1\nuvicorn[standard]==0.24.0\nsqlalchemy==2.0.23\npython-jose[cryptography]==3.3.0\npasslib[bcrypt]==1.7.4\npython-multipart==0.0.6\n"
    }
  ],
  "patches": [],
  "dependencies": {
    "fastapi": "^0.104.1",
    "uvicorn": "^0.24.0",
    "sqlalchemy": "^2.0.23"
  },
  "scripts": {
    "dev": "uvicorn main:app --reload --host 0.0.0.0 --port 8000",
    "start": "uvicorn main:app --host 0.0.0.0 --port 8000"
  }
}
```

## Library Specification Creation

Library specifications provide comprehensive documentation and usage patterns for libraries.

### YAML Specification Format

```yaml
# Basic Information
name: My Custom Library
version: 2.1.0
description: A comprehensive UI component library with TypeScript support
category: ui-components
subcategory: component-libraries
homepage: # ライブラリのホームページURL
repository: # リポジトリURL
language: TypeScript

# Classification
tags:
  - typescript
  - react
  - components
  - accessibility
  - theming

# Simple Library Format
features:
  - 50+ accessible components
  - TypeScript definitions included
  - Customizable theming system
  - Dark mode support
  - Mobile-responsive design
  - Tree-shakeable bundle

installation: |
  # NPM
  npm install my-custom-library
  
  # Yarn
  yarn add my-custom-library
  
  # PNPM
  pnpm add my-custom-library

configuration: |
  // Basic setup
  import { ThemeProvider } from 'my-custom-library';
  import 'my-custom-library/dist/style.css';
  
  function App() {
    return (
      <ThemeProvider theme="light">
        <YourAppComponents />
      </ThemeProvider>
    );
  }

usage_examples:
  basic_button: |
    import { Button } from 'my-custom-library';
    
    function MyComponent() {
      return (
        <Button variant="primary" size="medium" onClick={handleClick}>
          Click me
        </Button>
      );
    }
  
  form_components: |
    import { Form, Input, Select, Checkbox } from 'my-custom-library';
    
    function ContactForm() {
      return (
        <Form onSubmit={handleSubmit}>
          <Input label="Name" required />
          <Input label="Email" type="email" required />
          <Select label="Country" options={countries} />
          <Checkbox label="Subscribe to newsletter" />
          <Button type="submit">Submit</Button>
        </Form>
      );
    }

best_practices:
  - Use semantic HTML elements for accessibility
  - Implement proper keyboard navigation
  - Include ARIA labels and descriptions
  - Test with screen readers
  - Follow design system guidelines
  - Use TypeScript for type safety
  - Implement error boundaries
  - Optimize for performance

common_patterns:
  - Component composition over inheritance
  - Render props for flexible APIs
  - Compound components for related functionality
  - Custom hooks for shared logic
  - Context for theme and configuration

performance_tips:
  - Use React.memo for expensive components
  - Implement virtualization for large lists
  - Lazy load components when possible
  - Optimize bundle size with tree shaking
  - Use CSS-in-JS efficiently

accessibility:
  - All components meet WCAG 2.1 AA standards
  - Keyboard navigation support
  - Screen reader compatibility
  - High contrast mode support
  - Focus management
  - Semantic markup

testing:
  unit_testing: |
    import { render, screen, fireEvent } from '@testing-library/react';
    import { Button } from 'my-custom-library';
    
    test('button calls onClick handler', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  
  accessibility_testing: |
    import { render } from '@testing-library/react';
    import { axe, toHaveNoViolations } from 'jest-axe';
    
    expect.extend(toHaveNoViolations);
    
    test('button has no accessibility violations', async () => {
      const { container } = render(<Button>Accessible button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

migration_guide:
  from_v1_to_v2: |
    # Breaking Changes in v2.0
    
    ## Component API Changes
    - `Button.size` prop renamed to `Button.scale`
    - `Input.variant` prop removed, use `Input.appearance` instead
    - `Modal` component split into `Modal` and `Dialog`
    
    ## Migration Steps
    1. Update component imports
    2. Replace deprecated props
    3. Update theme configuration
    4. Run automated migration tool: `npx my-custom-library-migrate`

troubleshooting:
  - Bundle size too large: Enable tree shaking and import only needed components
  - TypeScript errors: Update to latest version and check type definitions
  - Styling conflicts: Use CSS modules or scoped styling
  - Performance issues: Profile with React DevTools and optimize re-renders
```

### Ecosystem Specification Format

For comprehensive ecosystems with multiple tools:

```yaml
name: My Development Ecosystem
version: 1.0.0
description: Comprehensive development tools and methodologies
category: development-methodology
subcategory: full-stack-development

tools:
  core_framework:
    name: My Framework
    description: Core application framework
    homepage: # フレームワークのホームページURL
    repository: [local repository]
    language: TypeScript
    features:
      - Server-side rendering
      - Client-side routing
      - Built-in state management
      - Hot module reloading
    
    installation: |
      npm create my-framework@latest my-app
      cd my-app
      npm install
    
    configuration: |
      // my-framework.config.js
      export default {
        mode: 'universal',
        target: 'server',
        build: {
          analyze: true
        }
      };
    
    best_practices:
      - Follow the file-based routing convention
      - Use built-in state management for shared state
      - Implement proper error boundaries
      - Optimize images and assets
  
  ui_library:
    name: My UI Components
    description: Component library for My Framework
    features:
      - Framework-optimized components
      - Built-in accessibility
      - Customizable themes
    
    configuration: |
      import { MyUIProvider } from '@myorg/ui-components';
      
      export default function App() {
        return (
          <MyUIProvider theme="default">
            <AppContent />
          </MyUIProvider>
        );
      }
  
  testing_tools:
    name: My Test Suite
    description: Testing utilities and helpers
    features:
      - Framework-specific test utilities
      - Visual regression testing
      - Performance testing
    
    configuration: |
      // test.config.js
      export default {
        testEnvironment: '@myorg/test-environment',
        setupFilesAfterEnv: ['@myorg/test-setup'],
        transform: {
          '^.+\\.(js|jsx|ts|tsx)$': '@myorg/test-transformer'
        }
      };

workflows:
  project_setup:
    description: Set up a new project with best practices
    steps:
      - Create new project with CLI tool
      - Configure development environment
      - Set up testing framework
      - Configure CI/CD pipeline
      - Add code quality tools
    
    example: |
      # Create new project
      npm create my-framework@latest my-app
      cd my-app
      
      # Install additional tools
      npm install -D @myorg/eslint-config @myorg/prettier-config
      
      # Set up testing
      npm install -D @myorg/test-suite
      
      # Initialize CI/CD
      npx @myorg/ci-setup

  development_workflow:
    description: Day-to-day development practices
    steps:
      - Start development server
      - Write code with TypeScript
      - Write tests alongside features
      - Run linting and formatting
      - Commit with conventional commits
    
    tools_used:
      - Development server with HMR
      - TypeScript for type safety
      - Jest and Testing Library for testing
      - ESLint and Prettier for code quality
      - Husky for git hooks

templates:
  basic_page:
    description: Basic page template with layout
    code: |
      import { Layout, SEO } from '@myorg/my-framework';
      import { Button } from '@myorg/ui-components';
      
      export default function HomePage() {
        return (
          <Layout>
            <SEO title="Home Page" />
            <main>
              <h1>Welcome to My App</h1>
              <Button onClick={() => console.log('Clicked!')}>
                Get Started
              </Button>
            </main>
          </Layout>
        );
      }
  
  api_route:
    description: API route with validation
    code: |
      import { z } from 'zod';
      import { createRoute } from '@myorg/my-framework';
      
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email()
      });
      
      export default createRoute({
        method: 'POST',
        schema,
        handler: async (req, res) => {
          const { name, email } = req.body;
          // Handle the request
          return { success: true, data: { name, email } };
        }
      });
```

## Template Best Practices

### Naming Conventions

**Template IDs**:
- Use kebab-case: `nextjs-auth-template`
- Include technology: `fastapi-jwt-auth`, `react-components`
- Be descriptive but concise: `vue-composition-api-starter`

**File Paths**:
- Use template variables: `{{project_name}}/src/components/{{component_name}}.tsx`
- Follow framework conventions: `pages/api/{{route_name}}.ts` for Next.js
- Use appropriate extensions: `.ts` for TypeScript, `.vue` for Vue files

### Parameter Design

**Required vs Optional**:
```json
{
  "params": [
    {
      "name": "project_name",
      "required": true,
      "description": "Project name (required for package.json)"
    },
    {
      "name": "author_name",
      "required": false,
      "default": "Unknown",
      "description": "Author name for package.json"
    }
  ]
}
```

**Type Safety**:
```json
{
  "params": [
    {
      "name": "port",
      "type": "number",
      "default": 3000,
      "min": 1000,
      "max": 65535,
      "validation": "^[0-9]+$"
    },
    {
      "name": "use_typescript",
      "type": "boolean",
      "default": true,
      "description": "Use TypeScript instead of JavaScript"
    }
  ]
}
```

### Template Organization

**File Structure**:
```
templates/
├── web-frameworks/
│   ├── nextjs-minimal.json
│   ├── react-spa.json
│   └── vue-composition.json
├── api-backends/
│   ├── fastapi-rest.json
│   ├── express-typescript.json
│   └── nestjs-graphql.json
└── testing/
    ├── playwright-e2e.json
    ├── jest-unit.json
    └── cypress-integration.json
```

**Template Categories**:
- Group related templates together
- Use consistent naming within categories  
- Include category in template tags

### Error Handling

**Validation**:
```json
{
  "params": [
    {
      "name": "project_name",
      "validation": "^[a-z][a-z0-9-]*$",
      "error_message": "Project name must start with lowercase letter and contain only lowercase letters, numbers, and hyphens"
    }
  ]
}
```

**Graceful Degradation**:
```json
{
  "files": [
    {
      "path": "{{project_name}}/src/{{#use_typescript}}index.ts{{/use_typescript}}{{^use_typescript}}index.js{{/use_typescript}}",
      "template": "{{#use_typescript}}// TypeScript version{{/use_typescript}}{{^use_typescript}}// JavaScript version{{/use_typescript}}\n\nexport default function main() {\n  console.log('{{project_name}} is running!');\n}"
    }
  ]
}
```

## Testing Templates

### Manual Testing

```bash
# Test template discovery
fluorite-mcp --discover-spikes --query="my-template"

# Preview template
fluorite-mcp --preview-spike my-template-id --params='{"project_name":"test"}'

# Apply template to test directory
mkdir /tmp/template-test
cd /tmp/template-test
fluorite-mcp --apply-spike my-template-id --params='{"project_name":"test-app"}'

# Verify generated files
find . -type f -name "*.js" -o -name "*.ts" -o -name "*.json"
```

### Automated Testing

Create test scripts for templates:

```javascript
// test-template.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function testTemplate(templateId, params = {}) {
  const testDir = `/tmp/template-test-${Date.now()}`;
  
  try {
    // Create test directory
    fs.mkdirSync(testDir, { recursive: true });
    process.chdir(testDir);
    
    // Apply template
    const command = `fluorite-mcp --apply-spike ${templateId} --params='${JSON.stringify(params)}'`;
    const result = execSync(command, { encoding: 'utf8' });
    
    // Verify files were created
    const files = fs.readdirSync('.', { recursive: true });
    console.log('Generated files:', files);
    
    // Test if it's a valid project
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json'));
      console.log('Package name:', pkg.name);
      
      // Try to install dependencies
      execSync('npm install', { stdio: 'inherit' });
      
      // Run basic tests
      if (pkg.scripts && pkg.scripts.test) {
        execSync('npm test', { stdio: 'inherit' });
      }
    }
    
    console.log('✅ Template test passed');
    return true;
  } catch (error) {
    console.error('❌ Template test failed:', error.message);
    return false;
  } finally {
    // Clean up
    process.chdir('/');
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}

// Run tests
testTemplate('my-nextjs-template', { 
  project_name: 'test-app',
  use_typescript: true 
});
```

### Validation Testing

```bash
# Test parameter validation
fluorite-mcp --preview-spike my-template --params='{"invalid_param":"value"}'
# Should show parameter validation errors

# Test required parameters
fluorite-mcp --preview-spike my-template --params='{}'
# Should prompt for required parameters

# Test parameter types
fluorite-mcp --preview-spike my-template --params='{"port":"not-a-number"}'
# Should show type validation error
```

## Publishing and Distribution

### Local Development

```bash
# Create custom template directory
mkdir ~/.fluorite/custom-templates
cd ~/.fluorite/custom-templates

# Add template files
cp my-template.json ~/.fluorite/custom-templates/

# Configure Fluorite MCP to use custom templates
export FLUORITE_CUSTOM_TEMPLATES="$HOME/.fluorite/custom-templates"

# Test template availability
fluorite-mcp --discover-spikes --query="my-template"
```

### Team Distribution

**Git Repository**:
```bash
# Create template repository
git init fluorite-templates
cd fluorite-templates

# Add templates
mkdir templates
cp *.json templates/

# Add README and documentation
echo "# Custom Fluorite MCP Templates" > README.md

# Commit and push
git add .
git commit -m "Initial template collection"
git push origin main
```

**Installation Script**:
```bash
#!/bin/bash
# install-templates.sh

TEMPLATE_DIR="$HOME/.fluorite/custom-templates"
REPO_URL="[local repository]"

# Create directory
mkdir -p "$TEMPLATE_DIR"

# Clone or update templates
if [ -d "$TEMPLATE_DIR/.git" ]; then
  cd "$TEMPLATE_DIR" && git pull
else
  git clone "$REPO_URL" "$TEMPLATE_DIR"
fi

# Configure environment
echo "export FLUORITE_CUSTOM_TEMPLATES=\"$TEMPLATE_DIR/templates\"" >> ~/.bashrc

echo "Templates installed successfully!"
echo "Restart your shell or run: source ~/.bashrc"
```

### NPM Package Distribution

**Package Structure**:
```
my-fluorite-templates/
├── package.json
├── README.md
├── templates/
│   ├── nextjs-custom.json
│   ├── react-components.json
│   └── fastapi-auth.json
├── specs/
│   ├── my-library.yaml
│   └── my-framework.yaml
└── scripts/
    ├── install.js
    └── test.js
```

**Package.json**:
```json
{
  "name": "my-fluorite-templates",
  "version": "1.0.0",
  "description": "Custom templates and specs for Fluorite MCP",
  "keywords": ["fluorite-mcp", "templates", "spike"],
  "files": ["templates/", "specs/", "scripts/"],
  "bin": {
    "install-templates": "./scripts/install.js"
  },
  "scripts": {
    "test": "node scripts/test.js",
    "install-global": "node scripts/install.js"
  },
  "peerDependencies": {
    "fluorite-mcp": ">=0.8.0"
  }
}
```

**Installation Script**:
```javascript
#!/usr/bin/env node
// scripts/install.js

const fs = require('fs');
const path = require('path');
const os = require('os');

const sourceDir = path.join(__dirname, '..', 'templates');
const targetDir = path.join(os.homedir(), '.fluorite', 'custom-templates');

// Copy templates
fs.mkdirSync(targetDir, { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });

// Update configuration
const configPath = path.join(os.homedir(), '.fluorite', 'config.json');
let config = {};

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath));
}

config.customTemplates = targetDir;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✅ Templates installed successfully!');
```

## Advanced Techniques

### Dynamic Template Generation

Generate templates based on external data:

```javascript
// generate-api-template.js
const fs = require('fs');

function generateAPITemplate(schema) {
  return {
    id: `api-${schema.name.toLowerCase()}`,
    name: `${schema.name} API`,
    version: "1.0.0",
    stack: ["fastapi", "python", "sqlalchemy"],
    description: `REST API for ${schema.name}`,
    params: [
      { name: "app_name", default: `${schema.name.toLowerCase()}-api` }
    ],
    files: schema.endpoints.map(endpoint => ({
      path: `{{app_name}}/routes/${endpoint.name}.py`,
      template: generateEndpointCode(endpoint)
    }))
  };
}

function generateEndpointCode(endpoint) {
  return `from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ${endpoint.model}(BaseModel):
${endpoint.fields.map(f => `    ${f.name}: ${f.type}`).join('\n')}

@router.${endpoint.method.toLowerCase()}("/${endpoint.path}")
def ${endpoint.function_name}():
    return {"message": "${endpoint.description}"}
`;
}

// Usage
const schema = {
  name: "User",
  endpoints: [
    {
      name: "users",
      method: "GET",
      path: "users",
      model: "User",
      function_name: "get_users",
      description: "Get all users",
      fields: [
        { name: "id", type: "int" },
        { name: "name", type: "str" },
        { name: "email", type: "str" }
      ]
    }
  ]
};

const template = generateAPITemplate(schema);
fs.writeFileSync('generated-api-template.json', JSON.stringify(template, null, 2));
```

### Template Composition

Combine multiple templates:

```json
{
  "id": "fullstack-app",
  "name": "Full Stack Application",
  "description": "Complete application with frontend and backend",
  "composed_of": [
    {
      "template": "nextjs-frontend",
      "params": {
        "project_name": "{{project_name}}-frontend"
      }
    },
    {
      "template": "fastapi-backend", 
      "params": {
        "app_name": "{{project_name}}-backend"
      }
    },
    {
      "template": "docker-compose",
      "params": {
        "services": ["frontend", "backend", "database"]
      }
    }
  ]
}
```

### Conditional File Generation

Generate different files based on parameters:

```json
{
  "files": [
    {
      "path": "{{project_name}}/{{#use_docker}}Dockerfile{{/use_docker}}",
      "template": "{{#use_docker}}FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE {{port}}\nCMD [\"npm\", \"start\"]{{/use_docker}}",
      "condition": "{{use_docker}}"
    },
    {
      "path": "{{project_name}}/docker-compose.yml",
      "template": "{{#use_docker}}version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - \"{{port}}:{{port}}\"\n    environment:\n      - NODE_ENV=development{{/use_docker}}",
      "condition": "{{use_docker}}"
    }
  ]
}
```

### Template Inheritance

Create base templates that can be extended:

```json
{
  "id": "base-web-app",
  "name": "Base Web Application",
  "abstract": true,
  "common_files": [
    {
      "path": "{{project_name}}/package.json",
      "template": "{\n  \"name\": \"{{project_name}}\",\n  \"version\": \"1.0.0\"\n}"
    },
    {
      "path": "{{project_name}}/.gitignore",
      "template": "node_modules/\ndist/\n.env\n"
    }
  ]
}
```

```json
{
  "id": "nextjs-app",
  "name": "Next.js Application", 
  "extends": "base-web-app",
  "additional_files": [
    {
      "path": "{{project_name}}/next.config.js",
      "template": "/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;\n"
    }
  ]
}
```

### Template Validation

Add validation rules to templates:

```json
{
  "validation": {
    "pre_generation": [
      {
        "rule": "project_name_valid",
        "message": "Project name must be valid npm package name",
        "test": "{{project_name}}.match(/^[a-z][a-z0-9-]*$/)"
      },
      {
        "rule": "port_available",
        "message": "Port {{port}} must be available",
        "test": "checkPortAvailable({{port}})"
      }
    ],
    "post_generation": [
      {
        "rule": "package_json_valid",
        "message": "Generated package.json must be valid",
        "test": "JSON.parse(readFile('{{project_name}}/package.json'))"
      }
    ]
  }
}
```

## Community Templates

### Contributing to Official Collection

1. **Fork the Repository**:
   ```bash
   # 本プロジェクトのリポジトリをフォーク
   ```

2. **Add Your Template**:
   ```bash
   # Add template file
   cp my-template.json src/spikes/
   
   # Add specification if needed
   cp my-spec.yaml src/catalog/
   ```

3. **Test Your Template**:
   ```bash
   npm test
   npm run test:templates
   ```

4. **Submit Pull Request**:
   - Include template documentation
   - Add usage examples
   - Update changelog

### Template Quality Guidelines

**Documentation**:
- Clear description and use case
- Parameter documentation
- Usage examples
- Best practices

**Code Quality**:
- Follow language/framework conventions
- Include error handling
- Add comments for complex logic
- Use consistent formatting

**Testing**:
- Test with various parameter combinations
- Verify generated code compiles/runs
- Include integration tests
- Test cross-platform compatibility

---

*Last updated: 2025-08-15*