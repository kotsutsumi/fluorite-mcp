# /fl:ui Command - Natural Language UI Generation

The `/fl:ui` command enables v0.io-style natural language UI component generation with TailwindCSS v4.1+ and shadcn/ui v2+ integration.

## Overview

Generate modern UI components using natural language descriptions. The command analyzes your description, determines the appropriate component type, and generates production-ready React/Next.js components with TypeScript, TailwindCSS, and shadcn/ui.

## Usage

```bash
fluorite-mcp ui "<natural language description>" [options]
```

### Examples

```bash
# Generate a login form
fluorite-mcp ui "Create a modern login form with email, password, and social auth buttons"

# Generate a data table
fluorite-mcp ui "Build an advanced data table with sorting, filtering, and pagination"

# Generate with specific framework
fluorite-mcp ui "Create a responsive modal dialog" --framework next --style glass

# Preview mode (no files written)
fluorite-mcp ui "Make a dashboard with cards and charts" --preview

# Custom component name
fluorite-mcp ui "Create a button" --component-name ActionButton

# Different styling
fluorite-mcp ui "Build a card component" --style minimal --dark
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-f, --framework <framework>` | Target framework: `react`, `next`, `vue` | `react` |
| `-s, --style <style>` | Design style: `modern`, `minimal`, `glass`, `card` | `modern` |
| `-o, --output <path>` | Output directory for components | `./components` |
| `--dark` | Include dark mode support | `false` |
| `--responsive` | Ensure responsive design | `true` |
| `--a11y` | Include accessibility features | `true` |
| `--preview` | Preview code without writing files | `false` |
| `--component-name <name>` | Custom component name | Auto-detected |
| `--tailwind-version <version>` | TailwindCSS version | `latest` |
| `--shadcn-version <version>` | shadcn/ui version | `latest` |

## Natural Language Processing

The command intelligently analyzes your description to determine:

### Component Types
- **Forms**: login, signup, contact forms
- **Tables**: data tables with sorting/filtering
- **Modals**: dialogs, popups
- **Navigation**: menus, navbars
- **Cards**: content cards, metric cards
- **Buttons**: various button types
- **Dashboards**: analytics dashboards
- **Custom**: any other component type

### Complexity Detection
- **Simple**: Basic components (< 3 features)
- **Moderate**: Standard components (3-5 features)
- **Complex**: Advanced components (> 5 features, animations, etc.)

### Feature Detection
Automatically detects and includes:
- Responsive design
- Dark mode support
- Animations and transitions
- Form validation
- Accessibility features
- Social authentication
- Sorting and filtering
- Pagination

## Generated Components

### What's Included

✅ **Modern TypeScript Components**
- Full TypeScript type definitions
- Proper React component patterns
- Export/import ready

✅ **TailwindCSS v4.1+ Styling**
- Modern CSS custom properties
- Responsive design classes
- Dark mode support
- Utility-first approach

✅ **shadcn/ui v2+ Integration**
- Latest component primitives
- Consistent design system
- Accessibility built-in
- Theme support

✅ **Best Practices**
- WCAG 2.1 AA accessibility
- Semantic HTML structure
- Performance optimized
- Mobile-first responsive

### File Structure

```
components/
├── ComponentName.tsx     # Main component file
├── index.ts             # Export file (if needed)
└── types.ts            # Type definitions (if complex)
```

## Component Statistics

Each generated component includes:
- **Lines of code**: Total component size
- **Dependencies**: Required imports and packages
- **Accessibility score**: WCAG compliance percentage
- **Framework compatibility**: React/Next.js/Vue support
- **Performance metrics**: Bundle size estimation

## Integration Guide

### Prerequisites

```bash
# Install required dependencies
npm install @shadcn/ui @tailwindcss/forms
npm install clsx tailwind-merge
npm install lucide-react  # For icons
```

### TailwindCSS Configuration

Ensure your `tailwind.config.js` includes:

```js
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom theme extensions
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    // Add other plugins as needed
  ],
}
```

### Utility Functions

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Advanced Usage

### Custom Styling

```bash
# Glass morphism design
fluorite-mcp ui "Create a pricing card" --style glass

# Minimal design
fluorite-mcp ui "Build a simple button" --style minimal

# Card-based layout
fluorite-mcp ui "Make a user profile" --style card
```

### Framework-Specific Features

```bash
# Next.js with App Router
fluorite-mcp ui "Create a server component table" --framework next

# Vue 3 with Composition API
fluorite-mcp ui "Build a reactive form" --framework vue
```

### Dark Mode Support

```bash
# Include dark mode variants
fluorite-mcp ui "Create a navigation menu" --dark
```

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   ```bash
   npm install @shadcn/ui @tailwindcss/forms clsx tailwind-merge
   ```

2. **TailwindCSS Not Working**
   - Verify `tailwind.config.js` content paths
   - Check if TailwindCSS is imported in your CSS

3. **TypeScript Errors**
   - Ensure `@/lib/utils` path is configured in `tsconfig.json`
   - Install missing type definitions

4. **Component Not Rendering**
   - Check console for runtime errors
   - Verify all imports are available
   - Ensure component is properly exported

### Debug Mode

```bash
# Use preview mode to test without file creation
fluorite-mcp ui "Your description" --preview
```

## Performance Considerations

- Generated components are optimized for tree-shaking
- Only necessary dependencies are imported
- CSS classes are minimal and efficient
- TypeScript provides compile-time optimization
- Components follow React best practices for re-rendering

## Future Enhancements

The `/fl:ui` command will be enhanced with:
- [ ] Spike template integration (currently disabled for performance)
- [ ] MCP Magic integration for advanced generation
- [ ] Animation and micro-interaction support
- [ ] Advanced component composition
- [ ] Real-time preview server
- [ ] Custom design system integration
- [ ] Multi-file component generation
- [ ] Storybook integration

## See Also

- [Spike Templates](./spike-templates.md)
- [MCP Integration](./mcp-integration.md)
- [TailwindCSS v4.1+ Features](./tailwindcss.md)
- [shadcn/ui v2+ Components](./shadcn-ui.md)