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

    textarea.style.height = 'auto'
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 48), 120)
    textarea.style.height = `${nextHeight}px`
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
      <div className="chat-header">
        <h2 className="chat-title">Chat Assistant</h2>
        <button type="button" className="btn btn-danger-outline" onClick={onClearHistory}>
          Clear History
        </button>
      </div>

      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className="chat-message">
            <div className="chat-message-meta">
              <span className="chat-message-author">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </span>
              <time className="chat-message-time" dateTime={message.timestamp}>
                {formatTimestamp(message.timestamp)}
              </time>
            </div>
            <div className="chat-message-content">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
          </article>
        ))}

        {isTyping && (
          <article className="chat-message">
            <div className="chat-message-meta">
              <span className="chat-message-author">Assistant</span>
              <span className="chat-message-time">typing…</span>
            </div>
            <div className="chat-message-content">
              <div className="loading-spinner" style={{width: '20px', height: '20px'}}></div>
            </div>
          </article>
        )}
        <div ref={endRef} aria-hidden="true" />
      </div>

      <form className="chat-composer" onSubmit={handleSubmit}>
        <label htmlFor="chat-input" className="sr-only">
          Send a message to the assistant
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          className="chat-input"
          placeholder="Type here..."
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          spellCheck
          aria-label="Chat input"
        />
        <button type="submit" className="btn btn-primary" disabled={!inputValue.trim()}>
          Send
        </button>
      </form>
    </section>
  )
}