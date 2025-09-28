import type { ChangeEventHandler, CSSProperties, FC, FormEventHandler } from 'react'

type WebsitePreviewProps = {
  urlInput: string
  onUrlInputChange: ChangeEventHandler<HTMLInputElement>
  onSubmit: FormEventHandler<HTMLFormElement>
  currentUrl: string
  isLoading: boolean
  error: string | null
  urlError: string | null
  onIframeLoaded: () => void
  onIframeError: () => void
  iframeKey: string
  style?: CSSProperties
}

export const WebsitePreview: FC<WebsitePreviewProps> = ({
  urlInput,
  onUrlInputChange,
  onSubmit,
  currentUrl,
  isLoading,
  error,
  urlError,
  onIframeLoaded,
  onIframeError,
  iframeKey,
  style,
}) => {
  return (
    <section className="preview-panel" aria-label="Website preview workspace" style={style}>
      <form className="preview-form" onSubmit={onSubmit} noValidate>
        <label className="preview-form__label" htmlFor="site-url">
          Website URL
        </label>
        <div className="preview-form__controls">
          <input
            id="site-url"
            className="preview-form__input"
            type="url"
            placeholder="https://example.com"
            value={urlInput}
            onChange={onUrlInputChange}
            inputMode="url"
            aria-invalid={Boolean(urlError)}
            aria-describedby={urlError ? 'site-url-error' : undefined}
            required
          />
          <button className="preview-form__submit" type="submit">
            Load
          </button>
        </div>
        {urlError && (
          <p id="site-url-error" className="preview-form__error" role="alert">
            {urlError}
          </p>
        )}
      </form>
      <p className="preview-form__hint">
        Heads-up: many production sites send X-Frame-Options or CSP headers that prevent embedding. Try a
        staging URL or our built-in demo page if a site refuses to load.
      </p>

      <div className="preview-frame__wrapper">
        {isLoading && (
          <div className="preview-frame__loading" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            <span>Loading website…</span>
          </div>
        )}
        {error && !isLoading && (
          <div className="preview-frame__error" role="alert">
            <h2>We couldn’t display this site.</h2>
            <p>{error}</p>
            <p className="preview-frame__error-hint">
              Tip: Some production sites block embedding. Try another URL or use an internal staging link.
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          title="website-preview"
          src={currentUrl}
          className={`preview-frame${error ? ' preview-frame--hidden' : ''}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="accelerometer; clipboard-write; encrypted-media"
          referrerPolicy="no-referrer"
          onLoad={onIframeLoaded}
          onError={onIframeError}
        />
      </div>
    </section>
  )
}
