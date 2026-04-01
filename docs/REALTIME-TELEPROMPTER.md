# Real-Time Teleprompter Subtitles - Technical Design

**Version:** 1.0
**Created:** 2025-02-28
**Feature Priority:** HIGH (Viral differentiator)
**Estimated Effort:** 2 weeks (Sprint 2)

## Executive Summary

**Vision:** Display live, synchronized subtitles (teleprompter-style) during flow recording, showing what action is being performed in real-time. This creates a professional, TikTok-style recording experience that makes videos immediately shareable.

**Feasibility:** ✅ **YES - Highly Feasible**
- Web Speech API (browser-native, 95% browser support)
- WebSocket for real-time sync (Cloudflare Durable Objects)
- Overlay injection (already implemented in `packages/overlay`)
- Video capture with captions (MediaRecorder API)

**Impact:**
- **Viral Potential:** 🚀🚀🚀 (TikTok/YouTube Shorts-ready videos)
- **User Delight:** Eliminates post-production subtitle editing
- **Differentiation:** No competitors have this feature
- **Conversion:** Increases free-to-paid (professional video output)

**Timeline:**
- MVP: 1 week (basic real-time captions)
- Full: 2 weeks (voice recognition + teleprompter + export)

---

## Use Cases

### 1. **Tutorial Creator** (Primary Use Case)
**Scenario:** Product manager creates onboarding tutorial

**Current Workflow:**
1. Record screen → 2. Execute flow → 3. Download video → 4. Import to video editor → 5. Add subtitles manually → 6. Export → 7. Upload

**With Real-Time Teleprompter:**
1. Click "Record with Teleprompter" → 2. Execute flow (subtitles auto-generated) → 3. Download video with baked-in captions → 4. Upload directly

**Time Saved:** ~30 minutes per video (90% reduction)

### 2. **QA Engineer Documenting Bug**
**Scenario:** QA finds bug, needs to share with developers

**With Teleprompter:**
- Speak while recording: "Notice the submit button is disabled even though the form is valid"
- Subtitle appears in real-time: "Submit button disabled despite valid form"
- Video exports with captions + highlights
- Share URL with team (no editing needed)

### 3. **SaaS Founder Creating Demo**
**Scenario:** Founder creates product demo for investors/customers

**With Teleprompter:**
- Pre-write script in teleprompter
- Speak while recording (subtitles auto-sync)
- Professional-looking demo video in 1 take
- Export to Twitter/LinkedIn (viral potential)

---

## Technical Architecture

### High-Level Data Flow

```
User Speaks
    ↓
Web Speech API (browser)
    ↓ (real-time transcript)
WebSocket → Cloudflare Durable Object
    ↓ (broadcast to overlay)
Browser Overlay Injection
    ↓ (render subtitle)
MediaRecorder API
    ↓ (capture video + audio + overlay)
R2 Upload (final video with baked-in captions)
```

### Component Breakdown

#### 1. **Speech Recognition** (Browser-Side)

**Technology:** Web Speech API (`SpeechRecognition`)

**Browser Support:**
- ✅ Chrome/Edge: 100% (Chromium)
- ✅ Safari: 90% (iOS 14.5+)
- ❌ Firefox: Partial (via polyfill)

**Implementation:**

```typescript
// apps/web/src/services/SpeechRecognition.ts (~150 lines)
export class LiveSpeechRecognition {
  private recognition: SpeechRecognition
  private onTranscript: (text: string, isFinal: boolean) => void

  constructor(options: {
    language?: string
    continuous?: boolean
    interimResults?: boolean
    onTranscript: (text: string, isFinal: boolean) => void
  }) {
    this.onTranscript = options.onTranscript

    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.recognition.lang = options.language || 'en-US'
    this.recognition.continuous = options.continuous ?? true
    this.recognition.interimResults = options.interimResults ?? true
    this.recognition.maxAlternatives = 1

    this.setupListeners()
  }

  private setupListeners(): void {
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1]
      const transcript = lastResult[0].transcript
      const isFinal = lastResult.isFinal

      this.onTranscript(transcript, isFinal)
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        // Auto-restart after silence
        this.restart()
      }
    }

    this.recognition.onend = () => {
      // Auto-restart if continuous mode
      if (this.recognition.continuous) {
        this.restart()
      }
    }
  }

  start(): void {
    this.recognition.start()
  }

  stop(): void {
    this.recognition.stop()
  }

  private restart(): void {
    setTimeout(() => this.recognition.start(), 100)
  }
}
```

**Usage:**

```typescript
// During recording
const speech = new LiveSpeechRecognition({
  language: 'en-US',
  continuous: true,
  interimResults: true,
  onTranscript: (text, isFinal) => {
    if (isFinal) {
      // Send final transcript to teleprompter
      ws.send(JSON.stringify({ type: 'CAPTION', text, timestamp: Date.now() }))
    } else {
      // Show interim results (optional, for real-time preview)
      updateLivePreview(text)
    }
  }
})

speech.start()
```

#### 2. **Real-Time Sync** (WebSocket via Cloudflare Durable Objects)

**Technology:** Cloudflare Durable Objects (WebSocket support)

**Why Durable Objects?**
- Stateful (maintains recording session)
- WebSocket support (real-time bidirectional)
- Low latency (<50ms)
- Automatic cleanup (session expires after recording)

**Implementation:**

```typescript
// apps/api/src/durable-objects/RecordingSession.ts (~180 lines)
export class RecordingSession {
  private state: DurableObjectState
  private sessions: Map<string, WebSocket> = new Map()
  private captions: Array<{ text: string; timestamp: number }> = []

  constructor(state: DurableObjectState) {
    this.state = state
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/ws') {
      // WebSocket upgrade
      const pair = new WebSocketPair()
      const client = pair[0]
      const server = pair[1]

      server.accept()
      this.handleWebSocket(server)

      return new Response(null, {
        status: 101,
        webSocket: client
      })
    }

    if (url.pathname === '/captions') {
      // Export captions (for SRT generation)
      return new Response(JSON.stringify(this.captions), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Not found', { status: 404 })
  }

  private handleWebSocket(ws: WebSocket): void {
    const sessionId = crypto.randomUUID()
    this.sessions.set(sessionId, ws)

    ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'CAPTION':
          // Store caption
          this.captions.push({
            text: data.text,
            timestamp: data.timestamp
          })

          // Broadcast to all connected clients (for multi-viewer support)
          this.broadcast({
            type: 'CAPTION',
            text: data.text,
            timestamp: data.timestamp
          })
          break

        case 'STEP_START':
          // Notify clients that a new step started
          this.broadcast({
            type: 'STEP_START',
            stepIndex: data.stepIndex,
            stepType: data.stepType
          })
          break

        case 'STEP_END':
          this.broadcast({
            type: 'STEP_END',
            stepIndex: data.stepIndex,
            success: data.success
          })
          break
      }
    })

    ws.addEventListener('close', () => {
      this.sessions.delete(sessionId)
    })
  }

  private broadcast(message: any): void {
    const payload = JSON.stringify(message)
    for (const ws of this.sessions.values()) {
      ws.send(payload)
    }
  }
}

// Durable Object binding
export default {
  fetch(request: Request, env: Env): Response {
    const id = env.RECORDING_SESSION.idFromName('default')
    const stub = env.RECORDING_SESSION.get(id)
    return stub.fetch(request)
  }
}
```

#### 3. **Teleprompter Overlay** (Browser Injection)

**Technology:** Extend existing `packages/overlay/index.ts`

**Design:**
```
┌─────────────────────────────────────┐
│ Browser Window (Recording)          │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Live Caption (Top Center)    │   │  ← Teleprompter subtitle
│  │ "Clicking the submit button" │   │
│  └─────────────────────────────┘   │
│                                     │
│         [Submit Button]             │  ← Highlighted element
│           ↑                         │
│      (Click action)                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Step Indicator (Bottom)      │   │  ← Optional step counter
│  │ "Step 3 of 10"              │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Implementation:**

```typescript
// packages/overlay/src/teleprompter.ts (~150 lines)
export class TeleprompterOverlay {
  private container: HTMLDivElement
  private captionElement: HTMLDivElement
  private currentCaption: string = ''
  private fadeOutTimer: number | null = null

  constructor(options: {
    position?: 'top' | 'bottom'
    fontSize?: number
    maxWidth?: number
    fadeOutDelay?: number
  }) {
    this.createOverlay(options)
  }

  private createOverlay(options: any): void {
    // Create container
    this.container = document.createElement('div')
    this.container.id = 'coderail-teleprompter'
    this.container.style.cssText = `
      position: fixed;
      ${options.position === 'bottom' ? 'bottom: 20px' : 'top: 20px'};
      left: 50%;
      transform: translateX(-50%);
      z-index: 999999;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `

    // Create caption bubble
    this.captionElement = document.createElement('div')
    this.captionElement.style.cssText = `
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      font-size: ${options.fontSize || 18}px;
      font-weight: 600;
      max-width: ${options.maxWidth || 600}px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      opacity: 0;
      transform: translateY(-10px);
    `

    this.container.appendChild(this.captionElement)
    document.body.appendChild(this.container)
  }

  showCaption(text: string, duration: number = 3000): void {
    // Clear previous fade-out timer
    if (this.fadeOutTimer) {
      clearTimeout(this.fadeOutTimer)
    }

    // Update text
    this.currentCaption = text
    this.captionElement.textContent = text

    // Fade in
    requestAnimationFrame(() => {
      this.captionElement.style.opacity = '1'
      this.captionElement.style.transform = 'translateY(0)'
    })

    // Auto fade out after duration
    this.fadeOutTimer = window.setTimeout(() => {
      this.hideCaption()
    }, duration)
  }

  updateCaption(text: string): void {
    // Update without animation (for interim results)
    this.currentCaption = text
    this.captionElement.textContent = text
  }

  hideCaption(): void {
    this.captionElement.style.opacity = '0'
    this.captionElement.style.transform = 'translateY(-10px)'
  }

  destroy(): void {
    this.container.remove()
  }
}
```

#### 4. **Video Capture with Captions** (MediaRecorder API)

**Technology:** MediaRecorder API (captures screen + audio + overlays)

**Implementation:**

```typescript
// apps/web/src/services/VideoRecorder.ts (~180 lines)
export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private stream: MediaStream | null = null

  async startRecording(options: {
    captureAudio?: boolean
    videoBitsPerSecond?: number
  }): Promise<void> {
    // Capture screen (includes overlays)
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser', // Capture browser tab
        frameRate: 30,
        width: 1920,
        height: 1080
      },
      audio: false // Screen audio (not needed)
    })

    // Capture microphone (for voice-over)
    let audioStream: MediaStream | null = null
    if (options.captureAudio) {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
    }

    // Combine streams
    const tracks = [
      ...displayStream.getVideoTracks(),
      ...(audioStream ? audioStream.getAudioTracks() : [])
    ]
    this.stream = new MediaStream(tracks)

    // Create MediaRecorder
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
      videoBitsPerSecond: options.videoBitsPerSecond || 2_500_000 // 2.5 Mbps
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data)
      }
    }

    this.mediaRecorder.start(1000) // Collect data every 1s
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        throw new Error('Recording not started')
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' })
        this.cleanup()
        resolve(blob)
      }

      this.mediaRecorder.stop()
      this.stream?.getTracks().forEach(track => track.stop())
    })
  }

  private cleanup(): void {
    this.chunks = []
    this.stream = null
    this.mediaRecorder = null
  }
}
```

#### 5. **SRT Export** (Subtitle File Generation)

**Technology:** Generate SRT from caption timestamps

**Implementation:**

```typescript
// packages/runner/src/subtitle-generator.ts (already exists, enhance)
export class SubtitleGenerator {
  generateSRT(captions: Array<{ text: string; timestamp: number }>): string {
    let srt = ''

    captions.forEach((caption, index) => {
      const startTime = this.formatSRTTime(caption.timestamp)
      const endTime = this.formatSRTTime(
        captions[index + 1]?.timestamp || caption.timestamp + 3000
      )

      srt += `${index + 1}\n`
      srt += `${startTime} --> ${endTime}\n`
      srt += `${caption.text}\n\n`
    })

    return srt
  }

  private formatSRTTime(ms: number): string {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = ms % 1000

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`
  }

  // NEW: Burn subtitles into video (using FFmpeg.wasm)
  async burnSubtitlesIntoVideo(
    videoBlob: Blob,
    srtText: string
  ): Promise<Blob> {
    // Use FFmpeg.wasm to overlay SRT onto video
    // (Alternative: Subtitles already baked-in via overlay injection)
    // This is a fallback for browsers without overlay capture support
  }
}
```

---

## User Experience Flow

### Recording with Teleprompter (Step-by-Step)

**Step 1: Enable Teleprompter**
```
┌─────────────────────────────────┐
│ Flow Builder                    │
│                                 │
│ [▶ Execute Flow]                │
│ [🎙️ Record with Teleprompter] ← NEW
│                                 │
│ ☑ Enable voice captions         │
│ ☑ Show step descriptions        │
│ Language: [English ▼]           │
└─────────────────────────────────┘
```

**Step 2: Microphone Permission**
```
Browser prompt:
"CodeRail Flow wants to use your microphone"
[Block] [Allow]
```

**Step 3: Screen Capture**
```
Browser prompt:
"Choose what to share"
○ Your Entire Screen
● Browser Tab (recommended) ← Auto-select current tab
○ Window

[Share]
```

**Step 4: Recording Starts**
```
┌─────────────────────────────────────┐
│ 🔴 RECORDING (00:42)                │  ← Recording indicator
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ "Navigating to login page"  │   │  ← Live caption (from voice)
│  └─────────────────────────────┘   │
│                                     │
│        https://app.example.com      │  ← Browser shows target page
│                                     │
│  Step 1 of 5 ● ○ ○ ○ ○            │  ← Progress indicator
└─────────────────────────────────────┘
```

**Step 5: User Speaks + Executes Steps**
```
User: "First, I'll click the sign-in button"
    ↓ (Speech Recognition)
Caption appears: "First, I'll click the sign-in button"
    ↓ (User clicks element)
Flow executes: click(#sign-in-button)
    ↓ (Highlight overlay + caption)
Screenshot captured with overlay + caption
```

**Step 6: Recording Complete**
```
┌─────────────────────────────────────┐
│ ✅ Recording Complete!              │
│                                     │
│ Duration: 2:34                      │
│ Captions: 12 segments               │
│                                     │
│ [⬇ Download Video (.webm)]         │
│ [⬇ Download Subtitles (.srt)]      │
│ [🔗 Share Public Link]              │
│ [📤 Post to Twitter]                │
└─────────────────────────────────────┘
```

---

## Advanced Features (Post-MVP)

### 1. **Pre-Scripted Teleprompter Mode**

**Use Case:** User writes script beforehand, teleprompter scrolls during recording

**Implementation:**

```typescript
// apps/web/src/components/Teleprompter.tsx
export function TeleprompterScript() {
  const [script, setScript] = useState('')
  const [scrollSpeed, setScrollSpeed] = useState(50) // pixels per second

  return (
    <div className="teleprompter-script">
      <textarea
        placeholder="Write your script here..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      <div className="controls">
        <label>Scroll Speed:</label>
        <input
          type="range"
          min={10}
          max={100}
          value={scrollSpeed}
          onChange={(e) => setScrollSpeed(Number(e.target.value))}
        />
      </div>

      <button onClick={startRecordingWithScript}>
        🎬 Start Recording with Script
      </button>
    </div>
  )
}
```

**UX:**
```
┌─────────────────────────────────────┐
│ Teleprompter View (During Recording)│
├─────────────────────────────────────┤
│                                     │
│   First, navigate to the login page.│  ← Auto-scrolling script
│   Then, enter your credentials...   │
│   ▼ YOU ARE HERE                    │  ← Current position
│   Click the submit button to login. │
│   Notice the dashboard loading...   │
│                                     │
└─────────────────────────────────────┘
```

### 2. **Multi-Language Support**

**Supported Languages (Web Speech API):**
- English (US, UK, AU, IN)
- Spanish (ES, MX, AR)
- French (FR, CA)
- German (DE)
- Italian (IT)
- Japanese (JP)
- Korean (KR)
- Chinese (CN, TW)
- Portuguese (BR, PT)
- Russian (RU)

**Implementation:**

```typescript
const languageOptions = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'ja-JP', label: 'Japanese' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' }
]

const speech = new LiveSpeechRecognition({
  language: selectedLanguage, // User choice
  onTranscript: (text) => showCaption(text)
})
```

### 3. **AI-Enhanced Captions (GPT-4 Turbo)**

**Use Case:** Clean up voice recognition errors, rephrase for clarity

**Flow:**
```
Speech Recognition: "um... so like, basically you click this button"
    ↓ (Send to GPT-4 Turbo)
GPT-4 Turbo: "Click the submit button"
    ↓ (Display cleaned caption)
Teleprompter shows: "Click the submit button"
```

**Implementation:**

```typescript
async function enhanceCaption(rawText: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [{
        role: 'system',
        content: 'You are a subtitle editor. Clean up voice transcripts: remove filler words (um, uh, like), fix grammar, keep meaning intact. Be concise (max 60 chars).'
      }, {
        role: 'user',
        content: rawText
      }],
      max_tokens: 30,
      temperature: 0.3
    })
  })

  const data = await response.json()
  return data.choices[0].message.content
}
```

**Cost:** ~$0.001 per caption (GPT-4 Turbo input: $0.01/1K tokens)
**Latency:** ~200ms (acceptable for real-time)

### 4. **Auto-Generated Step Descriptions**

**Use Case:** No voice? Auto-generate captions from step type + selector

**Example:**
```typescript
function generateStepCaption(step: FlowStep): string {
  const templates = {
    click: (s) => `Clicking "${s.selector}"`,
    fill: (s) => `Entering text into "${s.selector}"`,
    goto: (s) => `Navigating to ${new URL(s.url).hostname}`,
    waitFor: (s) => `Waiting for "${s.selector}" to appear`,
    screenshot: () => `Capturing screenshot`,
    scroll: () => `Scrolling down`,
    hover: (s) => `Hovering over "${s.selector}"`
  }

  const generator = templates[step.type]
  return generator ? generator(step) : `Executing ${step.type}`
}
```

**UI:**
```
User speaks: (nothing)
System auto-generates: "Clicking the sign-in button"
Teleprompter shows: "Clicking the sign-in button"
```

---

## Implementation Plan

### Sprint 2 (Week 5-6) - MVP

**Day 1-2: Speech Recognition + WebSocket**
- [ ] Implement `LiveSpeechRecognition` service
- [ ] Create `RecordingSession` Durable Object
- [ ] WebSocket connection + caption broadcast
- [ ] Test real-time latency (<100ms)

**Day 3-4: Teleprompter Overlay**
- [ ] Extend `packages/overlay` with `TeleprompterOverlay`
- [ ] Design caption bubble (Apple HIG compliant)
- [ ] Fade in/out animations
- [ ] Test overlay rendering on different screen sizes

**Day 5-6: Video Recording**
- [ ] Implement `VideoRecorder` service
- [ ] MediaRecorder API integration
- [ ] Combine screen capture + microphone
- [ ] Test video quality (2.5 Mbps, 1080p)

**Day 7-8: SRT Export + UI**
- [ ] Generate SRT from caption timestamps
- [ ] Add "Record with Teleprompter" button to Flow Builder
- [ ] Download video + SRT
- [ ] Test end-to-end flow

**Day 9-10: Testing + Polish**
- [ ] Unit tests (95% coverage on new code)
- [ ] Cross-browser testing (Chrome, Safari, Edge)
- [ ] Performance optimization (<50ms latency)
- [ ] User testing (5 beta users)

### Sprint 3 (Week 7-8) - Advanced Features

**Day 1-3: Pre-Scripted Teleprompter**
- [ ] Script editor UI
- [ ] Auto-scrolling logic
- [ ] Position indicator ("YOU ARE HERE")
- [ ] Pause/resume scrolling

**Day 4-6: AI-Enhanced Captions (GPT-4)**
- [ ] Integrate GPT-4 Turbo API
- [ ] Clean up filler words
- [ ] Error handling (fallback to raw text)
- [ ] Cost monitoring (<$0.01 per recording)

**Day 7-10: Multi-Language + Auto-Captions**
- [ ] Language selector (15 languages)
- [ ] Auto-generated step descriptions
- [ ] Subtitle styling options (font size, position)
- [ ] A/B test caption styles

---

## Technical Challenges & Solutions

### Challenge 1: Speech Recognition Accuracy

**Problem:** Web Speech API accuracy varies (70-90% depending on accent, noise)

**Solutions:**
1. **Noise Cancellation:** Use `echoCancellation`, `noiseSuppression` in MediaRecorder
2. **AI Cleanup:** GPT-4 Turbo to fix errors (~200ms latency, acceptable)
3. **Manual Override:** Allow user to edit captions post-recording
4. **Confidence Threshold:** Only show captions with >80% confidence

**Code:**
```typescript
this.recognition.onresult = (event) => {
  const result = event.results[event.results.length - 1]
  const confidence = result[0].confidence

  if (confidence > 0.8) {
    // High confidence - show immediately
    showCaption(result[0].transcript)
  } else {
    // Low confidence - send to GPT-4 for cleanup
    const cleaned = await enhanceCaption(result[0].transcript)
    showCaption(cleaned)
  }
}
```

### Challenge 2: Real-Time Latency

**Problem:** Speech → WebSocket → Overlay → Render must be <100ms

**Solutions:**
1. **Direct Browser Injection:** No server round-trip (latency ~10ms)
2. **WebSocket Optimization:** Cloudflare Durable Objects (<50ms)
3. **Batching:** Batch interim results, only send final transcripts
4. **Local-First:** Render locally, sync to server for persistence

**Latency Budget:**
- Speech Recognition: 20ms (browser-native)
- WebSocket Send: 10ms (Durable Object)
- Overlay Render: 16ms (60 FPS)
- **Total:** ~50ms (well under 100ms target)

### Challenge 3: Video File Size

**Problem:** 1080p video with captions can be 100MB+ for 5-minute recording

**Solutions:**
1. **WebM VP9 Codec:** ~50% smaller than H.264
2. **Variable Bitrate:** 2.5 Mbps average (reduces file size)
3. **R2 Storage:** Unlimited, cheap ($0.015/GB/month)
4. **Cloudflare Stream:** Transcode to multiple resolutions (480p, 720p, 1080p)

**Expected File Sizes:**
- 1-minute: 20MB
- 5-minute: 100MB
- 10-minute: 200MB

**Storage Cost (R2):**
- 100 videos/day × 100MB × 30 days = 300GB/month
- Cost: 300GB × $0.015 = **$4.50/month** (negligible)

### Challenge 4: Browser Compatibility

**Problem:** Firefox lacks Web Speech API, Safari has quirks

**Solutions:**
1. **Chrome/Edge:** Full support (95% of users)
2. **Safari:** Partial support (requires user gesture to start)
3. **Firefox:** Polyfill via Deepgram/AssemblyAI API (fallback)

**Detection:**
```typescript
function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

if (!isSpeechRecognitionSupported()) {
  // Fallback to cloud API (Deepgram, AssemblyAI)
  console.warn('Using cloud speech recognition (Firefox fallback)')
}
```

---

## Viral Growth Impact

### Why This Feature Will Go Viral

1. **TikTok/YouTube Shorts-Ready:**
   - Videos export with professional captions (no editing needed)
   - Instant social sharing
   - Target: 1,000+ videos shared on Twitter/LinkedIn in Month 1

2. **Time Savings:**
   - Eliminates 30 minutes of post-production per video
   - Users can create 10x more content
   - Testimonials: "I used to spend 2 hours editing, now it's instant"

3. **Accessibility:**
   - Auto-captions make videos accessible (WCAG AA compliant)
   - Reach deaf/hard-of-hearing audience
   - Corporate compliance (many companies require captions)

4. **Competitive Moat:**
   - No competitor has real-time teleprompter for browser automation
   - Loom: Captions post-recording only
   - Scribe: No voice, text-only
   - CodeRail: Real-time voice + captions + highlights

### Projected Impact on Metrics

**Before Teleprompter:**
- Video completion rate: 30% (users abandon due to editing complexity)
- Share rate: 5% (videos need post-production)
- K-factor: 0.8 (not viral)

**After Teleprompter:**
- Video completion rate: 80% (instant professional output)
- Share rate: 40% (one-click social sharing)
- K-factor: 1.5 (viral growth!)

**Revenue Impact:**
- Free users upgrade to Pro for teleprompter features: +15% conversion
- Avg video length increases from 1 min to 5 min (higher engagement)
- Monthly Active Users: 10,000 → 50,000 (5x growth in 3 months)

---

## Pricing Strategy

### Free Plan
- ✅ Basic teleprompter (voice captions)
- ✅ 10 recordings/month
- ✅ 720p resolution
- ❌ No AI caption cleanup
- ❌ Watermark: "Made with CodeRail"

### Pro Plan ($15/month)
- ✅ Advanced teleprompter (pre-scripted mode)
- ✅ Unlimited recordings
- ✅ 1080p resolution
- ✅ AI caption cleanup (GPT-4)
- ✅ Multi-language support
- ✅ No watermark
- ✅ SRT export

### Enterprise Plan ($99/month)
- ✅ All Pro features
- ✅ 4K resolution
- ✅ Custom branding
- ✅ Bulk video export
- ✅ Priority support
- ✅ SSO integration

---

## Success Metrics

### Technical KPIs
- [ ] Speech recognition latency: <50ms (p95)
- [ ] WebSocket latency: <30ms (p95)
- [ ] Overlay render time: <16ms (60 FPS)
- [ ] Video file size: <20MB per minute
- [ ] Browser support: >90% (Chrome, Safari, Edge)

### Product KPIs
- [ ] Teleprompter adoption: >40% of recordings
- [ ] Video share rate: >40% (vs 5% baseline)
- [ ] Free → Pro conversion: >15% (teleprompter as hook)
- [ ] NPS score: >50 (from users who try teleprompter)
- [ ] Viral coefficient (K-factor): >1.2

### Business KPIs
- [ ] MRR increase: +$2,000 in first month
- [ ] User growth: 10,000 → 50,000 MAU (3 months)
- [ ] Videos created: 50,000/month (vs 5,000 baseline)
- [ ] Social shares: 1,000+ videos shared on Twitter/LinkedIn

---

## Appendix A: Alternative Approaches Considered

### Approach 1: Server-Side Speech Recognition (Deepgram/AssemblyAI)
**Pros:** More accurate, works in all browsers
**Cons:** Latency (300-500ms), cost ($0.02 per minute)
**Verdict:** ❌ Rejected (too slow for real-time)

### Approach 2: Client-Side ML Model (Whisper.cpp)
**Pros:** Offline, privacy-preserving
**Cons:** Large model (500MB), slow on older devices
**Verdict:** ❌ Rejected (file size too large)

### Approach 3: Hybrid (Web Speech API + Cloud Fallback)
**Pros:** Fast on Chrome/Safari, works on Firefox
**Cons:** Complexity, cost
**Verdict:** ✅ **Selected** (best of both worlds)

---

## Appendix B: File Size Compliance

All new files comply with 200-line limit:

| File | Lines | Status |
|------|-------|--------|
| `SpeechRecognition.ts` | 150 | ✅ |
| `RecordingSession.ts` | 180 | ✅ |
| `TeleprompterOverlay.ts` | 150 | ✅ |
| `VideoRecorder.ts` | 180 | ✅ |
| `SubtitleGenerator.ts` | 120 | ✅ (existing, will enhance) |

**Total:** 5 new files, 780 lines (avg 156 lines/file)

---

## Appendix C: Test Coverage Plan

**Target:** 95% line coverage, 90% branch coverage

### Unit Tests (60 tests)
- `SpeechRecognition`: 15 tests (start, stop, error handling)
- `RecordingSession`: 20 tests (WebSocket, broadcast, cleanup)
- `TeleprompterOverlay`: 15 tests (show, hide, fade animations)
- `VideoRecorder`: 10 tests (start, stop, combine streams)

### Integration Tests (20 tests)
- End-to-end: Speech → WebSocket → Overlay → Video capture
- Multi-language support
- AI caption enhancement (GPT-4 mock)

### E2E Tests (5 tests)
- Record with teleprompter → Download video → Verify SRT
- Pre-scripted mode → Auto-scroll → Verify sync
- Error scenarios (microphone denied, network failure)

**Total:** 85 tests

---

**Document Owner:** Product + Engineering
**Review Cadence:** After Sprint 2 (post-MVP)
**Next Review:** 2025-03-21 (after beta testing)
