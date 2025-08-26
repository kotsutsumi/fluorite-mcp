/**
 * UI Spike Handler for Natural Language UI Component Generation
 * 
 * This handler processes natural language descriptions of UI components
 * and automatically selects the most appropriate spike template, configures
 * parameters, and generates modern UI components using TailwindCSS v4.1+
 * and shadcn/ui v2+.
 */

import { createLogger } from './logger.js';
import {
  DEFAULT_SPIKE_CONFIG,
  SpikeSpec,
  SpikeMetadata,
  loadSpike,
  listSpikeIds,
  loadSpikeMetadataBatch,
  renderFiles,
  scoreSpikeMatch
} from './spike-catalog.js';

const log = createLogger('ui-spike-handler', 'fluorite-mcp');

interface UIComponentAnalysis {
  type: 'form' | 'table' | 'modal' | 'dashboard' | 'card' | 'navigation' | 'chart' | 'layout' | 'widget';
  features: string[];
  style: 'modern' | 'minimal' | 'glass' | 'gradient' | 'flat';
  framework: 'react' | 'nextjs' | 'vue';
  darkMode: boolean;
  responsive: boolean;
  accessibility: boolean;
}

interface UIGenerationInput {
  description: string;
  framework?: string;
  style?: string;
  darkMode?: boolean;
  responsive?: boolean;
  a11y?: boolean;
  preview?: boolean;
}

interface UIGenerationResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
  metadata?: {
    analysis: UIComponentAnalysis;
    selectedSpike: string;
    files: any[];
    params: Record<string, string>;
    nextActions?: any[];
  };
}

/**
 * Analyzes natural language description to determine UI component requirements
 */
export function analyzeUIDescription(description: string): UIComponentAnalysis {
  const lowerDesc = description.toLowerCase();
  
  // Determine component type
  let type: UIComponentAnalysis['type'] = 'widget';
  if (lowerDesc.match(/\b(form|input|field|submit|validation)\b/)) {
    type = 'form';
  } else if (lowerDesc.match(/\b(table|grid|list|data|rows|columns)\b/)) {
    type = 'table';
  } else if (lowerDesc.match(/\b(modal|dialog|popup|overlay)\b/)) {
    type = 'modal';
  } else if (lowerDesc.match(/\b(dashboard|admin|panel|overview)\b/)) {
    type = 'dashboard';
  } else if (lowerDesc.match(/\b(card|tile|box|container)\b/)) {
    type = 'card';
  } else if (lowerDesc.match(/\b(nav|menu|sidebar|header|footer)\b/)) {
    type = 'navigation';
  } else if (lowerDesc.match(/\b(chart|graph|visualization|analytics)\b/)) {
    type = 'chart';
  } else if (lowerDesc.match(/\b(layout|page|template|structure)\b/)) {
    type = 'layout';
  }
  
  // Extract features
  const features: string[] = [];
  if (lowerDesc.includes('login') || lowerDesc.includes('signin')) features.push('login');
  if (lowerDesc.includes('register') || lowerDesc.includes('signup')) features.push('register');
  if (lowerDesc.includes('social')) features.push('social-auth');
  if (lowerDesc.includes('filter')) features.push('filtering');
  if (lowerDesc.includes('sort')) features.push('sorting');
  if (lowerDesc.includes('search')) features.push('search');
  if (lowerDesc.includes('pagina')) features.push('pagination');
  if (lowerDesc.includes('export')) features.push('export');
  if (lowerDesc.includes('upload')) features.push('file-upload');
  if (lowerDesc.includes('drag')) features.push('drag-drop');
  if (lowerDesc.includes('real-time') || lowerDesc.includes('realtime')) features.push('realtime');
  if (lowerDesc.includes('notification')) features.push('notifications');
  if (lowerDesc.includes('animation')) features.push('animations');
  if (lowerDesc.includes('chart') || lowerDesc.includes('graph')) features.push('charts');
  if (lowerDesc.includes('map')) features.push('maps');
  if (lowerDesc.includes('calendar')) features.push('calendar');
  if (lowerDesc.includes('timeline')) features.push('timeline');
  if (lowerDesc.includes('stepper') || lowerDesc.includes('wizard')) features.push('stepper');
  if (lowerDesc.includes('tabs')) features.push('tabs');
  if (lowerDesc.includes('accordion')) features.push('accordion');
  
  // Determine style
  let style: UIComponentAnalysis['style'] = 'modern';
  if (lowerDesc.includes('minimal') || lowerDesc.includes('simple')) style = 'minimal';
  else if (lowerDesc.includes('glass') || lowerDesc.includes('blur')) style = 'glass';
  else if (lowerDesc.includes('gradient') || lowerDesc.includes('colorful')) style = 'gradient';
  else if (lowerDesc.includes('flat') || lowerDesc.includes('material')) style = 'flat';
  
  // Determine framework preference
  let framework: UIComponentAnalysis['framework'] = 'react';
  if (lowerDesc.includes('next') || lowerDesc.includes('nextjs')) framework = 'nextjs';
  else if (lowerDesc.includes('vue')) framework = 'vue';
  
  // Check for dark mode, responsive, and accessibility
  const darkMode = lowerDesc.includes('dark') || lowerDesc.includes('theme');
  const responsive = !lowerDesc.includes('desktop-only') && !lowerDesc.includes('mobile-only');
  const accessibility = lowerDesc.includes('accessible') || lowerDesc.includes('a11y') || lowerDesc.includes('wcag');
  
  return {
    type,
    features,
    style,
    framework,
    darkMode,
    responsive,
    accessibility
  };
}

/**
 * Selects the best matching UI spike template based on analysis
 */
export async function selectUISpike(
  analysis: UIComponentAnalysis
): Promise<{ spikeId: string; params: Record<string, string> }> {
  try {
    // Get all UI spike IDs
    const allIds = await listSpikeIds(undefined, DEFAULT_SPIKE_CONFIG);
    const uiIds = allIds.filter(id => id.startsWith('ui-'));
    
    // Load metadata for UI spikes
    const metadata = await loadSpikeMetadataBatch(uiIds, 100, 0, DEFAULT_SPIKE_CONFIG);
    
    // Score each spike based on analysis
    let bestMatch = {
      id: 'ui-login-form-modern',
      score: 0,
      params: {} as Record<string, string>
    };
    
    for (const meta of metadata) {
      let score = 0;
      
      // Type matching
      if (meta.id.includes(analysis.type)) score += 10;
      
      // Feature matching
      for (const feature of analysis.features) {
        if (meta.tags?.includes(feature) || meta.description?.includes(feature)) {
          score += 5;
        }
      }
      
      // Style matching
      if (meta.id.includes(analysis.style) || meta.tags?.includes(analysis.style)) {
        score += 3;
      }
      
      // Framework matching
      if (meta.stack?.includes(analysis.framework)) {
        score += 2;
      }
      
      if (score > bestMatch.score) {
        bestMatch = { id: meta.id, score, params: {} };
      }
    }
    
    // Configure parameters based on analysis
    bestMatch.params = {
      framework: analysis.framework,
      componentName: generateComponentName(analysis),
      darkMode: String(analysis.darkMode),
      responsive: String(analysis.responsive),
      a11y: String(analysis.accessibility)
    };
    
    // Add specific params based on features
    if (analysis.features.includes('social-auth')) {
      bestMatch.params.includeSocial = 'true';
    }
    if (analysis.features.includes('search')) {
      bestMatch.params.includeSearch = 'true';
    }
    if (analysis.features.includes('export')) {
      bestMatch.params.includeExport = 'true';
    }
    
    return {
      spikeId: bestMatch.id,
      params: bestMatch.params
    };
  } catch (error) {
    log.error('Failed to select UI spike', error as Error);
    // Return a sensible default
    return {
      spikeId: 'ui-login-form-modern',
      params: {
        framework: analysis.framework,
        componentName: 'UIComponent',
        darkMode: 'true',
        responsive: 'true'
      }
    };
  }
}

/**
 * Generates a component name based on the analysis
 */
function generateComponentName(analysis: UIComponentAnalysis): string {
  const baseNames: Record<string, string> = {
    form: 'Form',
    table: 'DataTable',
    modal: 'Modal',
    dashboard: 'Dashboard',
    card: 'Card',
    navigation: 'Navigation',
    chart: 'Chart',
    layout: 'Layout',
    widget: 'Widget'
  };
  
  let name = baseNames[analysis.type] || 'Component';
  
  // Add feature-based prefix
  if (analysis.features.includes('login')) {
    name = 'Login' + name;
  } else if (analysis.features.includes('register')) {
    name = 'Register' + name;
  } else if (analysis.features.includes('search')) {
    name = 'Search' + name;
  }
  
  // Add style suffix if not modern
  if (analysis.style !== 'modern') {
    name = name + analysis.style.charAt(0).toUpperCase() + analysis.style.slice(1);
  }
  
  return name;
}

/**
 * Main handler for UI component generation from natural language
 */
export async function handleUIGenerationTool(input: UIGenerationInput): Promise<UIGenerationResult> {
  try {
    log.info('Processing UI generation request', { description: input.description });
    
    // Analyze the natural language description
    const analysis = analyzeUIDescription(input.description);
    
    // Override with explicit parameters if provided
    if (input.framework) {
      analysis.framework = input.framework as UIComponentAnalysis['framework'];
    }
    if (input.style) {
      analysis.style = input.style as UIComponentAnalysis['style'];
    }
    if (input.darkMode !== undefined) {
      analysis.darkMode = input.darkMode;
    }
    if (input.responsive !== undefined) {
      analysis.responsive = input.responsive;
    }
    if (input.a11y !== undefined) {
      analysis.accessibility = input.a11y;
    }
    
    // Select the best matching spike template
    const { spikeId, params } = await selectUISpike(analysis);
    
    // Load the spike specification
    const spec = await loadSpike(spikeId, DEFAULT_SPIKE_CONFIG);
    
    // Render the files with parameters
    const files = renderFiles(spec.files, params);
    
    // Prepare the response
    const lines = [
      `🎨 UI Component Generation Analysis:`,
      ``,
      `📋 **Component Type**: ${analysis.type}`,
      `✨ **Features**: ${analysis.features.length > 0 ? analysis.features.join(', ') : 'standard'}`,
      `🎨 **Style**: ${analysis.style}`,
      `⚛️ **Framework**: ${analysis.framework}`,
      `🌙 **Dark Mode**: ${analysis.darkMode ? 'enabled' : 'disabled'}`,
      `📱 **Responsive**: ${analysis.responsive ? 'yes' : 'no'}`,
      `♿ **Accessibility**: ${analysis.accessibility ? 'WCAG compliant' : 'standard'}`,
      ``,
      `📦 **Selected Template**: ${spec.name || spikeId}`,
      `📄 **Files to Generate**: ${files.length}`,
      ``,
      `Use the following next actions to complete the generation:`
    ];
    
    const nextActions = [
      { tool: 'preview-spike', args: { id: spikeId, params } },
      { tool: 'apply-spike', args: { id: spikeId, params, strategy: 'three_way_merge' } }
    ];
    
    return {
      content: [{ type: 'text', text: lines.join('\n') }],
      metadata: {
        analysis,
        selectedSpike: spikeId,
        files,
        params,
        nextActions
      }
    };
  } catch (error) {
    log.error('UI generation failed', error as Error);
    return {
      content: [{ 
        type: 'text', 
        text: `❌ UI generation failed: ${(error as Error).message}\n\nPlease provide a more detailed description or check the available UI templates.` 
      }],
      isError: true
    };
  }
}

/**
 * Handles auto-spike selection specifically for UI components
 */
export async function handleUIAutoSpike(task: string): Promise<UIGenerationResult> {
  return handleUIGenerationTool({
    description: task,
    preview: true
  });
}