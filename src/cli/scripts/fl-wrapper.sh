#!/bin/bash
# Fluorite /fl: command wrapper script
# This script is placed in ~/.claude/fluorite/ by setup command

# Extract command and arguments
COMMAND="$1"
shift
ARGS="$@"

# Map /fl: commands to /sc: commands
case "$COMMAND" in
  "help")
    echo "Fluorite Commands (SuperClaude Wrapper)"
    echo ""
    echo "Development Commands:"
    echo "  /fl:build       - Project builder with framework detection"
    echo "  /fl:implement   - Feature and code implementation"
    echo "  /fl:design      - Design orchestration and system architecture"
    echo ""
    echo "Analysis Commands:"
    echo "  /fl:analyze     - Multi-dimensional code and system analysis"
    echo "  /fl:troubleshoot - Problem investigation and debugging"
    echo "  /fl:explain     - Educational explanations and documentation"
    echo ""
    echo "Quality Commands:"
    echo "  /fl:improve     - Evidence-based code enhancement"
    echo "  /fl:cleanup     - Project cleanup and technical debt reduction"
    echo "  /fl:test        - Testing workflows and validation"
    echo ""
    echo "Documentation Commands:"
    echo "  /fl:document    - Documentation generation and updates"
    echo ""
    echo "Workflow Commands:"
    echo "  /fl:git         - Git workflow assistant"
    echo "  /fl:estimate    - Evidence-based project estimation"
    echo "  /fl:task        - Long-term project and task management"
    echo ""
    echo "Meta Commands:"
    echo "  /fl:index       - Command catalog browsing"
    echo "  /fl:load        - Project context loading"
    echo "  /fl:spawn       - Task orchestration"
    echo ""
    echo "Spike Commands:"
    echo "  /fl:spike       - Spike template operations"
    echo ""
    echo "Usage: /fl:[command] [arguments] [flags]"
    echo "Example: /fl:implement \"create REST API\" --framework fastapi"
    ;;
  "spike")
    # Handle spike commands specially through fluorite-mcp
    fluorite-mcp-server spike "$ARGS"
    ;;
  *)
    # Map to SuperClaude commands
    echo "🔮 Fluorite: Mapping /fl:$COMMAND to /sc:$COMMAND with enhancements..."
    
    # Execute the corresponding SuperClaude command
    # This will be intercepted by Claude CLI and processed as a SuperClaude command
    exec claude "/sc:$COMMAND" $ARGS
    ;;
esac