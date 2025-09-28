import { useEffect, useRef } from 'react'
import type { CSSProperties, FC, FormEventHandler, KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import type { ChatMessage } from '../types'

type ChatPanelProps = {
  messages: ChatMessage[]
  inputValue: string
  onInputChange: (value: string) => void
  onSendMessage: (value: string) => void
  isTyping: boolean
  onClearHistory: () => void
  style?: CSSProperties
}

export const ChatPanel: FC<ChatPanelProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isTyping,
  onClearHistory,
  style,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const MAX_INPUT_HEIGHT = 180
  const MIN_INPUT_HEIGHT = 48

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = `${MIN_INPUT_HEIGHT}px`
    textarea.style.height = 'auto'

    const nextHeight = Math.min(Math.max(textarea.scrollHeight, MIN_INPUT_HEIGHT), MAX_INPUT_HEIGHT)
    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY = textarea.scrollHeight > MAX_INPUT_HEIGHT ? 'auto' : 'hidden'
  }, [inputValue])

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (!inputValue.trim()) return
    onSendMessage(inputValue)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!inputValue.trim()) return
      onSendMessage(inputValue)
    }
  }

  const markdownComponents: Components = {
    a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
  }

  return (
  <section className="chat-panel" aria-label="Assistant chat" style={style}>
      <div className="chat-panel__top">
        <h2 className="chat-panel__title">Chat</h2>
        <button type="button" className="chat-panel__clear" onClick={onClearHistory}>
          Clear Chat
        </button>
      </div>

      <div className="chat-panel__history" role="log" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={`chat-message chat-message--${message.role}`}>
            <header className="chat-message__meta">
              <span className="chat-message__author">{message.role === 'user' ? 'You' : 'Assistant'}</span>
              <time className="chat-message__timestamp" dateTime={message.timestamp}>
                {formatTimestamp(message.timestamp)}
              </time>
            </header>
            <div className="chat-message__content">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          </article>
        ))}

        {isTyping && (
          <article className="chat-message chat-message--assistant chat-message--typing">
            <header className="chat-message__meta">
              <span className="chat-message__author">Assistant</span>
              <span className="chat-message__timestamp">typing…</span>
            </header>
            <div className="typing-indicator" aria-label="Assistant is typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </article>
        )}
        <div ref={endRef} aria-hidden="true" />
      </div>

      <form className="chat-panel__composer" onSubmit={handleSubmit}>
        <label htmlFor="chat-input" className="sr-only">
          Send a message to the assistant
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          className="chat-panel__input"
          placeholder="Share a goal or ask for specific feedback…"
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          spellCheck
          aria-label="Chat input"
        />
        <button type="submit" className="chat-panel__send" disabled={!inputValue.trim()}>
          Send
        </button>
      </form>
    </section>
  )
}
