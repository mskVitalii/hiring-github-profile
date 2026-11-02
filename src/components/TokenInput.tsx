import { useEffect, useState } from 'react';
import { trackAnalyticsEvent } from '../lib/analytics';
import { clearToken, getToken, saveToken, validateToken } from '../lib/token';

interface TokenInputProps {
  onTokenChange?: (token: string | null) => void;
}

export function TokenInput({ onTokenChange }: TokenInputProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = getToken();
    setToken(saved);
  }, []);

  const handleAdd = async () => {
    if (!inputValue.trim()) {
      setError('Token cannot be empty');
      return;
    }

    setIsValidating(true);
    setError(null);

    const isValid = await validateToken(inputValue);
    if (!isValid) {
      setError('Invalid token. Make sure it has read:public_repo access.');
      setIsValidating(false);
      return;
    }

    saveToken(inputValue);
    setToken(inputValue);
    setInputValue('');
    setIsOpen(false);
    setIsValidating(false);
    trackAnalyticsEvent('token_saved', {
      has_token: true,
      source: 'token_modal',
      token_source: 'pat',
    });
    onTokenChange?.(inputValue);
  };

  const handleRemove = () => {
    clearToken();
    setToken(null);
    setInputValue('');
    trackAnalyticsEvent('token_removed', {
      has_token: false,
      source: 'token_modal',
      token_source: 'pat',
    });
    onTokenChange?.(null);
  };

  return (
    <div className='token-input'>
      {!token ? (
        <button
          type='button'
          className='btn-secondary'
          onClick={() => {
            const nextIsOpen = !isOpen;
            if (nextIsOpen) {
              trackAnalyticsEvent('token_modal_opened', {
                has_token: false,
              });
            }
            setIsOpen(nextIsOpen);
          }}
          title='Add GitHub token to unlock fast scanning (5000 req/hr instead of 60)'
        >
          🔓 Add Token
        </button>
      ) : (
        <button
          type='button'
          className='btn-secondary btn-active'
          onClick={() => {
            const nextIsOpen = !isOpen;
            if (nextIsOpen) {
              trackAnalyticsEvent('token_modal_opened', {
                has_token: true,
              });
            }
            setIsOpen(nextIsOpen);
          }}
          title='Authenticated with GitHub token (5000 req/hr)'
        >
          ✅ Token Active
        </button>
      )}

      {isOpen && (
        <div className='token-modal'>
          <div className='token-modal-content'>
            <h3>GitHub Personal Access Token</h3>

            {!token ? (
              <>
                <p className='token-info'>
                  <strong>Without token:</strong> 60 requests/hour, fast basic
                  analysis
                  <br />
                  <strong>With token:</strong> 5,000 requests/hour, detailed
                  analysis
                </p>

                <div className='token-input-field'>
                  <input
                    type='password'
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      setError(null);
                    }}
                    placeholder='ghp_xxxxxxxx...'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAdd();
                      }
                    }}
                  />
                  {error && <span className='token-error'>{error}</span>}
                </div>

                <div className='token-actions'>
                  <button
                    type='button'
                    onClick={handleAdd}
                    disabled={isValidating}
                  >
                    {isValidating ? '⏳ Validating...' : '✓ Add'}
                  </button>
                  <button type='button' onClick={() => setIsOpen(false)}>
                    ✕ Cancel
                  </button>
                </div>

                <p className='token-hint'>
                  <a
                    href='https://github.com/settings/tokens/new?description=GitHub%20Skills%20Scanner'
                    target='_blank'
                    rel='noreferrer'
                  >
                    Create a Personal Access Token →
                  </a>
                  <br />
                  <small>
                    No scopes needed — public data only. Kept in this browser
                    and never sent to our server.
                  </small>
                </p>
              </>
            ) : (
              <>
                <p className='token-info token-active'>
                  ✅ Token is active and valid
                  <br />
                  <strong>5,000 requests/hour</strong> available
                </p>
                <div className='token-actions'>
                  <button
                    type='button'
                    onClick={handleRemove}
                    className='btn-danger'
                  >
                    🔒 Remove Token
                  </button>
                  <button type='button' onClick={() => setIsOpen(false)}>
                    ✕ Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .token-input {
          position: relative;
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s;
          color: #e6edf3;
          white-space: nowrap;
        }

        .btn-secondary:hover {
          background: #1c2128;
          border-color: #58a6ff;
        }

        .btn-secondary.btn-active {
          border-color: #3fb950;
          color: white;
        }

        .btn-danger {
          background: #da3633;
          color: white;
          border: none;
        }

        .btn-danger:hover {
          background: #f85149;
        }

        .token-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .token-modal-content {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 1.5rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          color: #e6edf3;
        }

        .token-modal-content h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #e6edf3;
        }

        .token-info {
          background: #0d1117;
          padding: 1rem;
          border-radius: 6px;
          margin: 1rem 0;
          font-size: 0.85rem;
          line-height: 1.4;
          border-left: 3px solid #58a6ff;
          color: #8b949e;
        }

        .token-info.token-active {
          background: #0d2d1a;
          border-left-color: #3fb950;
          color: #a4d65e;
        }

        .token-input-field {
          margin: 1rem 0;
        }

        .token-input-field input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #30363d;
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: 'Courier New', monospace;
          box-sizing: border-box;
          background: #0d1117;
          color: #e6edf3;
        }

        .token-input-field input:focus {
          outline: none;
          border-color: #58a6ff;
          box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
        }

        .token-input-field input::placeholder {
          color: #8b949e;
        }

        .token-error {
          display: block;
          color: #f85149;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }

        .token-actions {
          display: flex;
          gap: 0.75rem;
          margin: 1.5rem 0;
        }

        .token-actions button {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #30363d;
          border-radius: 6px;
          background: #0d1117;
          color: #e6edf3;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .token-actions button:hover {
          background: #161b22;
          border-color: #58a6ff;
          color: #79c0ff;
        }

        .token-actions button:first-child {
          background: #238636;
          color: white;
          border-color: #238636;
        }

        .token-actions button:first-child:hover {
          background: #2ea043;
        }

        .token-actions button:first-child:disabled {
          background: #363b42;
          color: #8b949e;
          cursor: not-allowed;
        }

        .token-hint {
          font-size: 0.8rem;
          color: #8b949e;
          margin: 1rem 0 0 0;
          line-height: 1.4;
        }

        .token-hint a {
          color: #58a6ff;
          text-decoration: none;
        }

        .token-hint a:hover {
          text-decoration: underline;
          color: #79c0ff;
        }
      `}</style>
    </div>
  );
}
