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
      <div className="form-group">
        <form onSubmit={onSubmit} noValidate>
          <div className="form-controls">
            <input
              id="site-url"
              className="form-input"
              type="url"
              placeholder="Website URL"
              value={urlInput}
              onChange={onUrlInputChange}
              inputMode="url"
              aria-invalid={Boolean(urlError)}
              aria-describedby={urlError ? 'site-url-error' : 'site-url-hint'}
              required
            />
            <button className="btn btn-primary" type="submit">
              Load Site
            </button>
          </div>
          {urlError && (
            <p id="site-url-error" className="form-hint" role="alert" style={{color: 'var(--color-danger)'}}>
              {urlError}
            </p>
          )}
        </form>
      </div>

      <div className="preview-frame-container">
        {isLoading && (
          <div className="preview-loading" aria-live="polite">
            <div className="loading-spinner" aria-hidden="true"></div>
            <p>Loading website content...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="preview-error" role="alert">
            <h3>Unable to Load Site</h3>
            <p>{error}</p>
            <p className="text-tertiary">
              This typically occurs when websites implement security policies that prevent iframe embedding. 
              Try testing with a different URL or a development environment.
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          title="website-preview"
          src={currentUrl}
          className="preview-frame"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          allow="accelerometer; clipboard-write; encrypted-media"
          referrerPolicy="no-referrer"
          onLoad={onIframeLoaded}
          onError={onIframeError}
          style={{display: error ? 'none' : 'block'}}
        />
      </div>
    </section>
  )
}