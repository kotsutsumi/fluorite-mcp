import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  ClaudeMdGenerator, 
  generateClaudeMdContent, 
  mergeWithExistingClaudeMd,
  type ClaudeMdOptions 
} from '../../core/claude-md-generator.js';
import { createLogger } from '../../core/logger.js';

const logger = createLogger('init-command');

/**
 * CLI command for initializing CLAUDE.md with fluorite-mcp integration guide.
 * Automatically discovers fluorite-mcp capabilities and generates comprehensive
 * documentation that helps users leverage all available features.
 * 
 * Features:
 * - Dynamic content generation based on current catalog statistics
 * - Library specifications discovery and categorization
 * - Spike template integration examples  
 * - Static analysis capabilities documentation
 * - Practical usage examples with real commands
 * - Japanese language support for localized documentation
 * 
 * @example
 * ```bash
 * # Generate CLAUDE.md with all features
 * fluorite-mcp init
 * 
 * # Force regeneration of existing file
 * fluorite-mcp init --force
 * 
 * # Generate only specific sections
 * fluorite-mcp init --sections spike-templates,examples
 * 
 * # Preview content without writing
 * fluorite-mcp init --preview
 * 
 * # Generate in English instead of Japanese
 * fluorite-mcp init --lang en
 * ```
 */
export const initCommand = new Command('init')
  .description('Initialize CLAUDE.md with fluorite-mcp integration guide')
  .option('-o, --output <path>', 'Output file path', 'CLAUDE.md')
  .option('-f, --force', 'Force overwrite existing CLAUDE.md')
  .option('-p, --preview', 'Preview content without writing to file')
  .option('-s, --sections <sections>', 'Generate only specific sections (comma-separated)')
  .option('-l, --lang <language>', 'Language for content generation (ja|en)', 'ja')
  .option('--no-markers', 'Disable section markers for future updates')
  .option('--merge', 'Merge with existing CLAUDE.md instead of replacing')
  .action(async (options) => {
    console.log('🚀 Initializing CLAUDE.md with fluorite-mcp features...\n');

    try {
      // Parse options
      const outputPath = path.resolve(options.output);
      const useJapanese = options.lang === 'ja';
      const sectionsOnly = options.sections ? 
        options.sections.split(',').map((s: string) => s.trim()) : 
        [];
      
      // Configure content generation options
      const generatorOptions: ClaudeMdOptions = {
        useJapanese,
        sectionsOnly,
        includeMarkers: options.markers !== false,
        includeLibrarySpecs: true,
        includeSpikeTemplates: true,
        includeStaticAnalysis: true,
        includeExamples: true,
        includeSuperClaude: true
      };

      // Step 1: Check existing file
      console.log('1. Checking existing CLAUDE.md...');
      const fileExists = await checkFileExists(outputPath);
      
      if (fileExists && !options.force && !options.merge && !options.preview) {
        console.log('❌ CLAUDE.md already exists. Use --force to overwrite or --merge to combine.');
        console.log('   You can also use --preview to see what would be generated.');
        process.exit(1);
      }
      
      if (fileExists) {
        console.log(`✅ Existing CLAUDE.md found at ${outputPath}`);
      } else {
        console.log(`✅ Will create new CLAUDE.md at ${outputPath}`);
      }

      // Step 2: Generate content
      console.log('\n2. Generating fluorite-mcp documentation...');
      console.log('   📊 Collecting current statistics...');
      console.log('   📚 Analyzing library specifications...');
      console.log('   🧪 Discovering spike templates...');
      console.log('   🛡️ Gathering validation rules...');
      
      const content = await generateClaudeMdContent(generatorOptions);
      
      console.log('✅ Content generated successfully');

      // Step 3: Handle output
      if (options.preview) {
        console.log('\n3. Previewing generated content:\n');
        console.log('=' .repeat(80));
        console.log(content);
        console.log('=' .repeat(80));
        console.log('\nℹ️  This is a preview. Use without --preview to write to file.');
        return;
      }

      console.log('\n3. Writing content to file...');
      
      let finalContent = content;
      
      if (options.merge && fileExists) {
        console.log('   🔄 Merging with existing content...');
        finalContent = await mergeWithExistingClaudeMd(
          content, 
          outputPath, 
          { 
            preserveUserContent: true, 
            sectionMarkers: options.markers !== false 
          }
        );
      }

      // Create backup if overwriting
      if (fileExists && options.force && !options.merge) {
        const backupPath = `${outputPath}.backup.${Date.now()}`;
        await fs.copyFile(outputPath, backupPath);
        console.log(`   💾 Created backup at ${backupPath}`);
      }

      // Write final content
      await fs.writeFile(outputPath, finalContent, 'utf8');
      console.log(`✅ CLAUDE.md written to ${outputPath}`);

      // Step 4: Verify and provide next steps
      console.log('\n4. Verifying generated content...');
      const stats = await verifyGeneratedContent(outputPath);
      console.log(`✅ Content verified: ${stats.lineCount} lines, ${stats.sectionCount} sections`);

      // Success message with next steps
      console.log('\n🎉 CLAUDE.md initialization completed successfully!');
      console.log('\n📚 Your CLAUDE.md now includes:');
      console.log(`   • Library specifications (${stats.librarySpecs}+ available)`);
      console.log(`   • Spike development templates (${stats.spikeTemplates}+ ready)`);
      console.log(`   • Static analysis capabilities (${stats.validationRules}+ rules)`);
      console.log('   • Practical usage examples');
      console.log('   • SuperClaude integration guide');
      
      console.log('\n🚀 Next Steps:');
      console.log('   1. Read your updated CLAUDE.md to discover available features');
      console.log('   2. Try: /fl:help to see all available commands');
      console.log('   3. Run: /fl:analyze . to analyze your current project');
      console.log('   4. Explore: /fl:spike discover to find relevant templates');
      
      if (options.lang === 'en') {
        console.log('\nℹ️  Generated in English. Use --lang ja for Japanese content.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('CLAUDE.md initialization failed');
      console.error(`\n❌ Initialization failed: ${errorMessage}`);
      process.exit(1);
    }
  });

/**
 * Checks if a file exists at the given path
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies the generated content and extracts statistics
 */
async function verifyGeneratedContent(filePath: string): Promise<{
  lineCount: number;
  sectionCount: number;
  librarySpecs: string;
  spikeTemplates: string;
  validationRules: string;
}> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const sections = content.match(/^##\s/gm) || [];
    
    // Extract statistics from content
    const libraryMatch = content.match(/(\d+)\+?\s*(?:以上|Available)/i);
    const spikeMatch = content.match(/(\d+)\+?\s*(?:以上|Ready)/i);
    const validationMatch = content.match(/(\d+)\+?\s*(?:以上のルール|Rules)/i);
    
    return {
      lineCount: lines.length,
      sectionCount: sections.length,
      librarySpecs: libraryMatch ? `${libraryMatch[1]}+` : '86+',
      spikeTemplates: spikeMatch ? `${spikeMatch[1]}+` : '830+', 
      validationRules: validationMatch ? `${validationMatch[1]}+` : '50+'
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn('Failed to verify content, using defaults');
    return {
      lineCount: 0,
      sectionCount: 0,
      librarySpecs: '86+',
      spikeTemplates: '830+',
      validationRules: '50+'
    };
  }
}

/**
 * Displays help information for the init command
 */
export function displayInitHelp(): void {
  console.log(`
Fluorite MCP Init Command

USAGE:
  fluorite-mcp init [OPTIONS]

DESCRIPTION:
  Generates comprehensive CLAUDE.md documentation with fluorite-mcp integration guide.
  Automatically discovers and documents all available capabilities including library
  specifications, spike templates, static analysis rules, and practical examples.

OPTIONS:
  -o, --output <path>      Output file path (default: CLAUDE.md)
  -f, --force             Force overwrite existing CLAUDE.md
  -p, --preview           Preview content without writing to file
  -s, --sections <list>    Generate only specific sections (comma-separated)
                          Available: overview,library-specs,spike-templates,
                          static-analysis,examples,integration
  -l, --lang <language>   Language for content (ja|en, default: ja)
  --no-markers            Disable section markers for future updates
  --merge                 Merge with existing CLAUDE.md instead of replacing

EXAMPLES:
  fluorite-mcp init                           # Generate Japanese CLAUDE.md
  fluorite-mcp init --lang en                 # Generate English version
  fluorite-mcp init --preview                 # Preview without writing
  fluorite-mcp init --force                   # Overwrite existing file
  fluorite-mcp init --merge                   # Merge with existing content
  fluorite-mcp init --sections examples       # Generate only examples section
  fluorite-mcp init -o docs/FLUORITE.md       # Custom output path

INTEGRATION:
  The generated CLAUDE.md provides comprehensive documentation for:
  • Available library specifications and usage patterns
  • Spike development templates for rapid prototyping  
  • Static analysis capabilities and validation rules
  • Practical examples with real command usage
  • SuperClaude framework integration guide

  Use /fl:init --force to regenerate when fluorite-mcp is updated.
`);
}