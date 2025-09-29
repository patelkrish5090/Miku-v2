import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  ChangeEventHandler,
  FormEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { AppHeader } from './components/AppHeader'
import { ChatPanel } from './components/ChatPanel'
import { WebsitePreview } from './components/WebsitePreview'
import type { ChatMessage } from './types'
import './App.css'

const THEME_STORAGE_KEY = 'cursor-web-tester-theme'
const MESSAGE_DELAY_RANGE = { min: 700, max: 1500 }
const CHAT_WIDTH_STORAGE_KEY = 'cursor-web-tester-chat-width'
const CHAT_WIDTH_RANGE = { min: 0.28, max: 0.58 }
const DEFAULT_CHAT_WIDTH = 0.42
const KEYBOARD_RESIZE_STEP = 0.02

const SAMPLE_MARKDOWN_MESSAGE = [
  '👋 Welcome! Paste your URL on the left and use this markdown sample to verify rich rendering:',
  '',
  '### Performance snapshot',
  '',
  '- **LCP**: `2.3s` on 4G',
  '- **CLS**: 0.04',
  '',
  '```python',
  'def audit_core_web_vitals(lcp: float, cls: float) -> str:',
  '    if lcp < 2.5 and cls < 0.1:',
  '        return "Vitals look great! 🚀"',
  '    return "Revisit hero media delivery and layout shifts."',
  '',
  'print(audit_core_web_vitals(2.3, 0.04))',
  '```',
  '',
  '> Reminder: rerun Lighthouse after each optimization pass.',
].join('\n')

const resolveDefaultUrl = () => {
  if (typeof window === 'undefined') return ''
    return ''
}

const clampChatWidth = (value: number) =>
  Math.min(CHAT_WIDTH_RANGE.max, Math.max(CHAT_WIDTH_RANGE.min, value))

const makeMessage = (role: ChatMessage['role'], content: string): ChatMessage => {
  const createdAt = new Date()
  return {
    id: `${role}-${createdAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: createdAt.toISOString(),
  }
}

const normaliseUrl = (raw: string) => {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  if (trimmed.startsWith('/')) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${trimmed}`
    }
    return trimmed
  }
  return `https://${trimmed}`
}

const getHostname = (url: string) => {
  try {
    const base = typeof window !== 'undefined' ? window.location.origin : undefined
    return new URL(url, base).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

const generateMockResponse = (prompt: string, url: string) => {
  const normalizedPrompt = prompt.toLowerCase()
  const site = getHostname(url)

  if (/sample|markdown|code block|readme/i.test(normalizedPrompt)) {
    const sample = [
      `Here’s a Markdown-formatted audit you can paste into a README:`,
      '',
      `## QA Snapshot for **${site}**`,
      '',
      '**Highlights**',
      '- ✅ Hero loads under 2.4s on LTE.',
      '- ⚠️ Checkout form is missing Accessible Name annotations.',
      '',
      '**Next Steps**',
      '1. Add srcset variants for marketing imagery.',
      '2. Run axe DevTools across the onboarding flow.',
      '3. Capture Percy diffs before rollout.',
      '',
      '```python',
      'audit = {',
      '    "performance": {',
      '        "lcp": "2.3s",',
      '        "blocking_scripts": ["/static/vendor.js"],',
      '    },',
      '    "accessibility": [',
      '        "Add aria-labels to icon-only buttons",',
      '        "Ensure focus outlines remain visible",',
      '    ],',
      '}',
      '',
      'for category, details in audit.items():',
      '    print(category.upper(), "=>", details)',
      '```',
      '',
      '> Tip: Re-run Lighthouse in CI to keep this report current.',
    ]
    return sample.join('\n')
  }

  if (/performance|speed|load/i.test(normalizedPrompt)) {
    return `Here’s the performance summary for ${site}:
- LCP may be slowed by the hero image; try serving an AVIF/WEBP fallback under 150KB.
- Consider lazy-loading below-the-fold sections with intersection observers.
- Bundle analysis suggests splitting vendor scripts and deferring non-critical analytics.`
  }

  if (/accessibility|a11y|contrast|screen reader/i.test(normalizedPrompt)) {
    return `Accessibility check for ${site}:
- Verify each landmark region has clear labels for assistive tech.
- Contrast on CTAs should exceed WCAG AA (>4.5:1); consider darkening the primary brand tint.
- Audit keyboard focus order on the navigation—ensure skip links are visible on focus.`
  }

  if (/conversion|cta|copy|messaging/i.test(normalizedPrompt)) {
    return `Conversion feedback:
- Lead with a benefit-driven headline that mirrors user intent.
- Reinforce the primary CTA near fold breaks; add microcopy that reduces friction.
- Add social proof near pricing or signup to increase trust signals.`
  }

  if (/responsive|mobile|tablet/i.test(normalizedPrompt)) {
    return `Responsive review:
- Test tablet breakpoints around 1024px and 768px—current layout may need tighter padding.
- Ensure tap targets are at least 44px high; hero buttons appear slightly cramped.
- Audit viewport meta tags and typography scale for small screens.`
  }

  const rotatingInsights = [
    `Here’s a quick QA loop for ${site}: run Lighthouse, validate semantics with axe DevTools, and capture a Percy diff for visual regressions.`,
    `Start by checking Core Web Vitals via PageSpeed Insights, then combine the report with manual UX heuristics tailored to ${site}.`,
    `Focus on above-the-fold clarity: align the value proposition, declutter secondary CTAs, and verify loading order prioritizes hero assets on ${site}.`,
    `Run an accessibility sweep: color contrast, headings outline, form labels, and live-region announcements for async UI on ${site}.`,
    `Pair synthetic monitoring (e.g., WebPageTest) with real-user metrics (CrUX) to capture how ${site} performs across geographies.`,
  ]

  const index = Math.floor(Math.random() * rotatingInsights.length)
  return rotatingInsights[index]
}

function App() {
  const defaultUrl = useMemo(() => resolveDefaultUrl(), [])

  const layoutRef = useRef<HTMLDivElement | null>(null)
  const resizeCleanupRef = useRef<(() => void) | null>(null)
  const loadingTimeoutRef = useRef<number | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)

  const [chatWidth, setChatWidth] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_CHAT_WIDTH
    const stored = window.localStorage.getItem(CHAT_WIDTH_STORAGE_KEY)
    if (!stored) return DEFAULT_CHAT_WIDTH
    const parsed = Number.parseFloat(stored)
    if (!Number.isFinite(parsed)) return DEFAULT_CHAT_WIDTH
    return clampChatWidth(parsed)
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as 'light' | 'dark' | null
    if (stored === 'light' || stored === 'dark') return stored
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    return prefersDark ? 'dark' : 'light'
  })

  const [currentUrl, setCurrentUrl] = useState(defaultUrl)
  const [urlInput, setUrlInput] = useState(defaultUrl)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [iframeError, setIframeError] = useState<string | null>(null)
  const [isIframeLoading, setIsIframeLoading] = useState(true)
  const [previewToken, setPreviewToken] = useState(0)

  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeMessage('assistant', SAMPLE_MARKDOWN_MESSAGE)])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const siteLabel = useMemo(() => getHostname(currentUrl), [currentUrl])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(CHAT_WIDTH_STORAGE_KEY, chatWidth.toString())
  }, [chatWidth])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    setIsIframeLoading(true)
    setIframeError(null)
    if (loadingTimeoutRef.current) window.clearTimeout(loadingTimeoutRef.current)
    const timeout = window.setTimeout(() => {
      setIframeError('Loading timed out. The site may block embedding or is responding slowly.')
      setIsIframeLoading(false)
    }, 10000)
    loadingTimeoutRef.current = timeout

    return () => window.clearTimeout(timeout)
  }, [currentUrl, previewToken])

  useEffect(() => () => {
    if (loadingTimeoutRef.current) window.clearTimeout(loadingTimeoutRef.current)
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
    if (resizeCleanupRef.current) {
      resizeCleanupRef.current()
      resizeCleanupRef.current = null
    }
  }, [])

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const updateChatWidthFromClientX = (clientX: number) => {
    const layout = layoutRef.current
    if (!layout) return
    const rect = layout.getBoundingClientRect()
    if (rect.width <= 0) return
    const clampedX = Math.min(Math.max(clientX - rect.left, 0), rect.width)
    const previewRatio = clampedX / rect.width
    const nextChatWidth = clampChatWidth(1 - previewRatio)
    setChatWidth(nextChatWidth)
  }

  const handleResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!layoutRef.current) return
    event.preventDefault()
    if (resizeCleanupRef.current) {
      resizeCleanupRef.current()
      resizeCleanupRef.current = null
    }
    const divider = event.currentTarget
    const pointerId = event.pointerId
    divider.setPointerCapture(pointerId)
    updateChatWidthFromClientX(event.clientX)

    const cleanupPointerListeners = () => {
      divider.releasePointerCapture(pointerId)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
      resizeCleanupRef.current = null
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.buttons === 0) {
        cleanupPointerListeners()
        return
      }
      updateChatWidthFromClientX(moveEvent.clientX)
    }

    const handlePointerEnd = () => {
      cleanupPointerListeners()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)
    resizeCleanupRef.current = cleanupPointerListeners
  }

  const handleResizeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setChatWidth((prev) => clampChatWidth(prev - KEYBOARD_RESIZE_STEP))
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      setChatWidth((prev) => clampChatWidth(prev + KEYBOARD_RESIZE_STEP))
    } else if (event.key === 'Home') {
      event.preventDefault()
      setChatWidth(CHAT_WIDTH_RANGE.min)
    } else if (event.key === 'End') {
      event.preventDefault()
      setChatWidth(CHAT_WIDTH_RANGE.max)
    }
  }

  const completeTyping = (callback: () => void) => {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    callback()
  }

  const scheduleAssistantResponse = (userPrompt: string) => {
    const delay =
      MESSAGE_DELAY_RANGE.min + Math.random() * (MESSAGE_DELAY_RANGE.max - MESSAGE_DELAY_RANGE.min)

    typingTimeoutRef.current = window.setTimeout(() => {
      const reply = makeMessage('assistant', generateMockResponse(userPrompt, currentUrl))
      setMessages((prev) => [...prev, reply])
      setIsTyping(false)
      typingTimeoutRef.current = null
    }, delay)
  }

  const sendMessage = (rawInput: string) => {
    const trimmed = rawInput.trim()
    if (!trimmed) return

    completeTyping(() => setIsTyping(false))

    const userMessage = makeMessage('user', trimmed)
    setMessages((prev) => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)
    scheduleAssistantResponse(trimmed)
  }

  const handleSendMessage = (value: string) => {
    sendMessage(value)
  }

  const handleClearHistory = () => {
    completeTyping(() => setIsTyping(false))
    const label = siteLabel || 'the current preview'
    const resetMessage = `${SAMPLE_MARKDOWN_MESSAGE}\n\n_History cleared. Preview ${label} or load another URL, then ask for targeted QA insights._`
    setMessages([makeMessage('assistant', resetMessage)])
  }

  const handleUrlSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const normalised = normaliseUrl(urlInput)
    if (!normalised) {
      setUrlError('Enter a valid URL to inspect.')
      return
    }

    try {
      const parsed = new URL(normalised)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol')
      }
      setUrlError(null)
      setIframeError(null)
      const nextUrl = parsed.toString()
      setCurrentUrl(nextUrl)
      setPreviewToken((value) => value + 1)
      setUrlInput(nextUrl)
    } catch {
      setUrlError('Please provide a valid URL starting with http://, https://, or a /path for local pages.')
    }
  }

  const handleUrlInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (urlError) setUrlError(null)
    setUrlInput(event.target.value)
  }

  const handleIframeLoaded = () => {
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
    setIsIframeLoading(false)
    setIframeError(null)
  }

  const handleIframeError = () => {
    if (loadingTimeoutRef.current) {
      window.clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
    setIsIframeLoading(false)
    setIframeError('We were unable to load this page. It may restrict embedding in iframes.')
  }

  const chatWidthPercent = Math.round(chatWidth * 1000) / 10
  const previewWidthPercent = Math.max(0, 100 - chatWidthPercent)

  return (
    <div className="app-shell">
      <AppHeader theme={theme} onToggleTheme={handleToggleTheme} />
      <main className="app-layout" ref={layoutRef}>
        <WebsitePreview
          urlInput={urlInput}
          onUrlInputChange={handleUrlInputChange}
          onSubmit={handleUrlSubmit}
          currentUrl={currentUrl}
          isLoading={isIframeLoading}
          error={iframeError}
          urlError={urlError}
          onIframeLoaded={handleIframeLoaded}
          onIframeError={handleIframeError}
          iframeKey={`${currentUrl}-${previewToken}`}
          style={{ flexBasis: `${previewWidthPercent}%`, maxWidth: `${previewWidthPercent}%`, flexGrow: 0 }}
        />
        <div
          className="panel-divider"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          aria-valuemin={Math.round(CHAT_WIDTH_RANGE.min * 100)}
          aria-valuemax={Math.round(CHAT_WIDTH_RANGE.max * 100)}
          aria-valuenow={Math.round(chatWidthPercent)}
          tabIndex={0}
          onPointerDown={handleResizeStart}
          onKeyDown={handleResizeKeyDown}
        />
        <ChatPanel
          messages={messages}
          inputValue={chatInput}
          onInputChange={setChatInput}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          onClearHistory={handleClearHistory}
          style={{ flexBasis: `${chatWidthPercent}%`, maxWidth: `${chatWidthPercent}%`, flexGrow: 0 }}
        />
      </main>
    </div>
  )
}

export default App
