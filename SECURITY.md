# Security Policy

## Supported Versions

Currently supported versions of Fluorite MCP with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.20.x  | :white_check_mark: |
| 0.19.x  | :white_check_mark: |
| < 0.19  | :x:                |

## Reporting a Vulnerability

We take security seriously at Fluorite MCP. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Create a Public Issue

Security vulnerabilities should **never** be reported through public GitHub issues.

### 2. Report Privately

Please report vulnerabilities by:

1. **Email**: Send details to the maintainer through GitHub profile contact
2. **GitHub Security Advisory**: Use GitHub's private security advisory feature
3. **Direct Message**: Contact maintainers directly through GitHub

### 3. Information to Include

When reporting, please provide:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if available)
- Your contact information for follow-up

### 4. Response Time

- **Initial Response**: Within 48 hours
- **Status Update**: Within 5 business days
- **Resolution Target**: Within 30 days for critical issues

## Security Best Practices

When using Fluorite MCP, follow these security practices:

### Installation Security

```bash
# Verify package integrity
npm audit

# Use lockfiles to ensure consistent dependencies
npm ci  # instead of npm install
```

### Configuration Security

1. **Never commit sensitive data**: API keys, credentials, or tokens
2. **Use environment variables**: Store sensitive configuration separately
3. **Review generated code**: Always review AI-generated code before deployment
4. **Validate inputs**: Ensure all user inputs are properly validated

### Code Generation Security

- Review all generated code for security implications
- Never execute untrusted generated code without review
- Be cautious with system commands and file operations
- Validate all external data sources

### MCP Server Security

1. **Access Control**: Restrict MCP server access to authorized users only
2. **Network Security**: Run MCP servers on secure networks
3. **Logging**: Monitor server logs for suspicious activity
4. **Updates**: Keep Fluorite MCP updated to the latest version

## Security Features

Fluorite MCP includes several security features:

### 1. Static Analysis Security Rules

- SQL injection detection
- XSS vulnerability scanning
- Authentication bypass detection
- Insecure dependency detection

### 2. Memory Engine Security

- Encrypted storage of learning data
- Isolated processing environments
- No storage of sensitive user data
- Automatic data expiration policies

### 3. Template Security

- Sanitized code generation
- Security best practices in templates
- Regular security audits of templates
- Community review process

## Known Security Considerations

### Third-Party Dependencies

Fluorite MCP relies on several third-party packages. We:
- Regularly update dependencies
- Monitor security advisories
- Run automated security scans
- Apply patches promptly

### AI-Generated Code

AI-generated code may contain security vulnerabilities. Always:
- Review generated code thoroughly
- Run security tests on generated code
- Never blindly trust AI output
- Apply security best practices

## Security Audit History

| Date | Version | Auditor | Result |
|------|---------|---------|--------|
| 2024-12 | 0.20.0 | Internal | Passed |
| 2024-11 | 0.19.0 | Internal | Passed |

## Contact

For security concerns, contact:
- **GitHub**: Create a private security advisory
- **Email**: Via maintainer GitHub profile
- **Response Time**: 48 hours

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who:
- Report vulnerabilities privately
- Allow reasonable time for fixes
- Don't exploit vulnerabilities

## Security Update Process

1. **Vulnerability Reported**: Through secure channels
2. **Assessment**: Severity and impact evaluation
3. **Development**: Fix development and testing
4. **Release**: Security patch released
5. **Disclosure**: Public disclosure after fix deployment
6. **Credit**: Recognition for responsible reporters

---

*This security policy is subject to change. Last updated: December 2024*