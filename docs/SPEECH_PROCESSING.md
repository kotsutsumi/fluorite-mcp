# Speech Processing & Linguistic Features - Fluorite MCP

A comprehensive guide to the speech processing and linguistic analysis systems included in Fluorite MCP.

## 🎯 Overview

The speech processing features provide a comprehensive phonological and prosodic analysis system based on the latest standards in modern linguistic research and speech technology. It features production-ready implementations including X-SAMPA/IPA phonological notation, ToBI prosodic annotation, and end-to-end speech processing pipelines.

## 🧬 Key Components

### 1. X-SAMPA/IPA Conversion System (`strike-x-sampa-ipa-converter`)

A bidirectional conversion system between ASCII-compatible X-SAMPA notation and Unicode IPA notation.

#### Features
- **Comprehensive Phonemic Inventory**: Complete mapping of consonants, vowels, and suprasegmentals
- **Feature Extraction**: Automatic analysis of phonological features (voicing, place of articulation, manner of articulation)
- **Validation Functions**: Phonological notation accuracy verification and phonemic similarity calculation
- **Full TypeScript Support**: Type-safe phonological operations with IntelliSense support

#### Usage Examples
```typescript
import { xsampaConverter } from './phonetics/xsampa-converter';

// X-SAMPA to IPA conversion
const ipa = xsampaConverter.xsampaToIpa('hE"loU'); // → [hɛˈloʊ]
const fricative = xsampaConverter.xsampaToIpa('S'); // → [ʃ]

// IPA to X-SAMPA conversion
const xsampa = xsampaConverter.ipaToXsampa('ʃ'); // → 'S'
const schwa = xsampaConverter.ipaToXsampa('ə'); // → '@'

// Phoneme feature extraction
const features = xsampaConverter.getPhonemeFeatures('ʃ', 'ipa');
// Result: { voicing: 'voiceless', place: 'postalveolar', manner: 'fricative', type: 'consonant' }
```

#### Supported Phonemes
- **Consonants**: p, b, t, d, k, g, f, v, θ, ð, s, z, ʃ, ʒ, h, m, n, ŋ, l, r, j, w
- **Vowels**: i, ɪ, e, ɛ, æ, a, ə, ɜ, ɑ, ɔ, o, ʊ, u
- **Suprasegmentals**: ˈ (primary stress), ˌ (secondary stress), ː (length)

### 2. ToBI Prosodic Annotation System (`strike-tobi-prosody-annotator`)

A prosodic pattern annotation system based on the Tones and Break Indices (ToBI) standard.

#### Features
- **Automatic Tone Detection**: Automatic identification of tonal targets from fundamental frequency (F0) contours
- **Break Index Analysis**: Classification of prosodic boundary strength (0-4 levels)
- **Prosodic Analysis**: Comprehensive analysis of rhythm, intonation, and phrasing structure
- **Emotion & Speaking Style Detection**: Automatic classification of emotions and speaking styles based on acoustic features

#### ToBI Symbol System
```typescript
// Tone types
interface ToBITone {
  type: 'H*' | 'L*' | 'H+L*' | 'L+H*' | 'H*+L' | 'L*+H' | 'H-' | 'L-' | 'H%' | 'L%' | '!H*' | '!L*';
  position: number;    // Time position (milliseconds)
  strength: number;    // Tonal strength (0-1)
}

// Break indices
interface BreakIndex {
  level: 0 | 1 | 2 | 3 | 4;  // Boundary strength
  position: number;           // Time position
  type: 'word' | 'phrase' | 'clause' | 'utterance';
}
```

#### Usage Examples
```typescript
import { tobiAnnotator } from './prosody/tobi-annotator';

const prosodyFeatures = {
  pitch: [150, 180, 200, 170, 140],        // F0 contour (Hz)
  intensity: [0.8, 0.9, 0.7, 0.6, 0.5],   // Amplitude envelope
  duration: [100, 120, 110, 130, 140],     // Segment duration (ms)
  timestamps: [0, 100, 220, 330, 460]     // Time alignment
};

const annotation = tobiAnnotator.annotate('Hello world', prosodyFeatures, {
  language: 'en-US',
  auto_detect_tones: true,
  auto_detect_breaks: true
});

console.log(annotation.tones);   // Detected pitch accents and boundary tones
console.log(annotation.breaks);  // Break indices (0-4)
```

### 3. Integrated Speech Processing Pipeline (`strike-speech-processing-pipeline`)

An end-to-end speech analysis and synthesis workflow.

#### Features
- **Speech Recognition Integration**: STT with time-aligned phonemic alignment
- **Phonological Analysis**: Automatic phonemic segmentation and X-SAMPA/IPA conversion
- **Prosodic Annotation**: Automatic prosodic analysis based on ToBI standards
- **Speech Synthesis**: TTS engine integration with prosodic control
- **Export Capabilities**: Support for Praat TextGrid, ELAN, and linguistic analysis formats

#### Architecture
```typescript
interface SpeechPipeline {
  // Input: Audio data
  input: AudioBuffer | string;
  
  // Processing steps
  steps: {
    speechToText: boolean;       // Speech recognition
    phoneticAnalysis: boolean;   // Phonological analysis
    prosodyAnnotation: boolean;  // Prosodic annotation
    textToSpeech: boolean;       // Speech synthesis
  };
  
  // Output configuration
  output: {
    format: 'textgrid' | 'elan' | 'json' | 'tobi';
    includeAudio: boolean;
    compression: 'none' | 'lossless' | 'lossy';
  };
}
```

## 🛠️ Technical Implementation

### Library Ecosystem Integration

Comprehensive library integration managed by **phonetics-linguistic-ecosystem.yaml**:

#### JavaScript/TypeScript
- **x-sampa**: X-SAMPA/IPA conversion
- **ipa-features**: IPA phonemic feature extraction
- **tobi-prosody**: ToBI prosodic annotation
- **meyda**: Acoustic feature extraction
- **node-wav**: WAV file processing

#### Python
- **phonemizer**: Multilingual phonemic conversion
- **panphon**: IPA feature analysis
- **praat-parselmouth**: Praat acoustic analysis
- **librosa**: Acoustic signal processing
- **TTS**: State-of-the-art speech synthesis

#### Acoustic Processing
- **MFCC**: Mel-frequency cepstral coefficients
- **F0 Extraction**: Fundamental frequency analysis
- **Formants**: Acoustic resonance analysis
- **Prosodic Features**: Rhythm, stress, intonation

### Supported File Formats

#### Audio Files
- **WAV**: Uncompressed, 16kHz+ recommended
- **FLAC**: Lossless compression
- **MP3**: For storage (not recommended for analysis)

#### Annotation Formats
- **ToBI**: Standard prosodic annotation
- **TextGrid**: Praat compatible
- **ELAN**: Multi-tier linguistic annotation
- **JSON**: Structured data exchange

## 🎯 Practical Use Cases

### 1. Multilingual Phonemic Analysis
```typescript
// English phonemic analysis
const englishAnalysis = analyzePhonetics('hɛˈloʊ wɜrld');

// Japanese phonemic processing
const japaneseAnalysis = analyzePhonetics('こんにちは', { language: 'ja' });
```

### 2. Emotional Speech Analysis
```typescript
const emotionalAnalysis = prosodyAnalyzer.analyze(annotation);
console.log(emotionalAnalysis.speaking_style.emotion); // 'excited', 'sad', 'neutral'
```

### 3. Rhythm & Tempo Analysis
```typescript
const rhythmAnalysis = prosodyAnalyzer.analyze(annotation);
console.log(rhythmAnalysis.rhythm.tempo);      // BPM
console.log(rhythmAnalysis.rhythm.regularity); // 0-1 scale
```

## 🔬 Linguistic Applications

### Research Fields
- **Phonology**: Phonemic system and phonological process analysis
- **Prosody**: Stress, rhythm, and intonation research
- **Language Education**: Pronunciation instruction and assessment
- **Speech Pathology**: Speech disorder diagnosis and treatment
- **Speech Technology**: Speech recognition and synthesis system development

### Educational Applications
- **Pronunciation Practice**: Comparison of learner pronunciation with standard phonemes
- **Prosodic Instruction**: Visualization of intonation and rhythm patterns
- **Language Acquisition Research**: Analysis of second language phonemic acquisition processes

## 🔧 Development & Integration Guide

### Basic Setup
```bash
# Enable Fluorite MCP speech processing features
npm install fluorite-mcp
claude mcp add fluorite -- fluorite-mcp-server-server

# Speech processing dependencies (optional)
npm install audio-buffer fft-js
```

### Customization
```typescript
// Add custom phonemic inventory
const customConverter = new XSampaConverter();
customConverter.addPhoneme('custom_symbol', {
  ipa: 'ɸ', xsampa: 'p\\', 
  features: { voicing: 'voiceless', place: 'bilabial', manner: 'fricative', type: 'consonant' }
});

// Define custom ToBI annotation rules
const customAnnotator = new ToBIAnnotator();
customAnnotator.addToneRule('custom_pattern', (pitch, context) => ({
  type: 'H*', strength: 0.8, description: 'Custom high tone'
}));
```

## 📚 References & Standards

### International Standards
- **IPA**: International Phonetic Alphabet
- **X-SAMPA**: Extended Speech Assessment Methods Phonetic Alphabet
- **ToBI**: Tones and Break Indices prosodic annotation system

### Academic References
- Beckman, M. E., & Ayers, G. M. (1997). Guidelines for ToBI labelling
- Silverman, K. et al. (1992). ToBI: A standard for labeling English prosody
- Jun, S. A. (Ed.). (2005). Prosodic Typology: The Phonology of Intonation and Phrasing

## 🚀 Future Development Plans

### Planned Features
- **Real-time Speech Analysis**: Immediate prosodic analysis of streaming audio
- **Multilingual ToBI**: Japanese and Chinese ToBI annotation systems
- **Machine Learning Integration**: Deep learning-based automatic phonemic and prosodic feature extraction
- **Visualization Tools**: Interactive phonemic and prosodic visualization
- **Acoustic Models**: Speaker-adaptive acoustic feature extraction

### Community Contributions
- Addition of new language phonemic systems
- Development of custom ToBI annotation rules
- Implementation of specialized acoustic analysis algorithms

Utilize Fluorite MCP's speech features according to your speech processing and linguistic analysis needs. For technical questions or feature requests, please visit our GitHub repository.