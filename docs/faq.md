# Frequently Asked Questions (FAQ)

Common questions and answers about Fluorite MCP.

## 📦 Installation

### Q: What are the minimum Node.js requirements?

**A:** Node.js 18.0 or higher is required. We recommend Node.js 20.0+ for optimal performance.

```bash
# Check Node.js version
node --version
```

### Q: What's the difference between global and local installation?

**A:** Global installation (recommended) makes Fluorite MCP available system-wide. Local installation is suitable when using it only for specific projects.

```bash
# Global installation (recommended)
npm install -g fluorite-mcp

# Local installation
npm install fluorite-mcp
```

### Q: What should I do if Claude Code CLI integration fails?

**A:** Try the following steps:

1. Ensure Claude Code CLI is up to date
2. Reinstall Fluorite MCP
3. Verify MCP server list

```bash
# Reinstall
npm uninstall -g fluorite-mcp
npm install -g fluorite-mcp

# Verify MCP servers
claude mcp list
```

## 🛠️ Usage

### Q: What's the difference between `/fl:` commands and regular commands?

**A:** The `/fl:` prefix indicates Fluorite MCP enhanced commands. These commands feature:
- Automatic spike template selection
- Token optimization
- Enhanced natural language processing
- Continuous learning capabilities

### Q: What are spike templates?

**A:** Spike templates are pre-defined code patterns for rapidly implementing specific tasks or features. With over 6,200 templates included, they cover authentication, APIs, testing, deployment, and more.

### Q: How does the UI generation command (`/fl:ui`) work?

**A:** The UI generation command works through this process:
1. Analyzes component requirements in natural language
2. Searches matching patterns from the 21st.dev database
3. Generates framework-specific code
4. Includes TypeScript definitions, accessibility features, and error handling

```bash
# Example usage
/fl:ui "Create a responsive navigation menu with dark mode support"
```

## 🔍 Static Analysis

### Q: Which frameworks are supported for static analysis?

**A:** Currently supported frameworks:
- Next.js
- React
- Vue
- TypeScript (common across all frameworks)

### Q: Can I add custom validation rules?

**A:** Yes, you can add custom rules. Create new rule files in the `src/analysis/rules/` directory.

## 🧠 Memory Engine

### Q: What data does the memory engine learn from?

**A:** The memory engine learns from:
- Technical documentation
- Successful code generation patterns
- Error patterns and their solutions
- Project-specific conventions

### Q: Where is learning data stored?

**A:** Learning data is stored in chunk format in the `.fluorite/memory/` directory. It is encrypted for privacy and security.

## 🤝 Contributing

### Q: How can I contribute a new spike template?

**A:** You can contribute by:
1. Fork the repository
2. Create a new template file in `src/spikes/`
3. Add tests and documentation
4. Submit a pull request

See the [Template Creation Guide](./template-creation.md) for details.

### Q: How do I add a library specification?

**A:** Add a YAML file to the `src/catalog/` directory and submit a pull request. See the [Contributing Guide](/CONTRIBUTING.md) for detailed instructions.

## ⚡ Performance

### Q: How can I optimize token usage?

**A:** You can optimize by:
- Using the `--uc` flag to enable ultra-compressed mode
- Providing specific context to avoid unnecessary generation
- Leveraging spike templates to reduce boilerplate code

### Q: How can I improve performance for large projects?

**A:** Recommended optimizations:
1. Utilize caching (automatic)
2. Use parallel processing (`--delegate` flag)
3. Enable Wave mode for complex operations

## 🔧 Troubleshooting

### Q: What if I get an `ENOENT` error?

**A:** This is a file or directory not found error. Check:
- Whether Fluorite MCP is correctly installed
- If necessary directory permissions are appropriate

```bash
# Reinstall
npm install -g fluorite-mcp
```

### Q: What if the MCP server won't start?

**A:** Check the following:
1. Whether the port is being used by another process
2. If Node.js version meets requirements
3. Review log files for error details

```bash
# Check processes
ps aux | grep fluorite
# Check logs
tail -f ~/.fluorite/logs/server.log
```

## 🌐 Language Support

### Q: Are languages other than Japanese supported?

**A:** Documentation is provided in Japanese and English. Code generation and spike templates support multiple languages and can generate comments and documentation in specified languages.

### Q: Which languages are supported for speech processing?

**A:** X-SAMPA/IPA conversion enables multilingual speech analysis. Currently supported languages include:
- Japanese
- English
- Chinese
- Spanish
- French

## 📚 Miscellaneous

### Q: What's the origin of the name "Fluorite MCP"?

**A:** Fluorite is a beautiful mineral with various colors. The project was named with the hope that it would help developers' creativity shine in diverse ways.

### Q: Is enterprise support available?

**A:** Currently, only community support is provided. For commercial support inquiries, please visit [GitHub Discussions](https://github.com/kotsutsumi/fluorite-mcp/discussions).

### Q: What's the license?

**A:** Fluorite MCP is provided under the MIT License. Commercial use is permitted.

---

## 📧 Further Support

If your question isn't resolved, please use these channels:

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Documentation**: See the [complete documentation](./index.md)

---

*Last updated: 2024*