'use client';

import { useEffect, useMemo, useState } from 'react';
import { APP_CONNECTION_EVENT, APP_REQUEST_END_EVENT, APP_REQUEST_START_EVENT, type AppConnectionState } from '@/lib/app-status-events';

const bubbles = Array.from({ length: 16 }, (_, index) => index);

export function AppStatusOverlay() {
  const [pendingCount, setPendingCount] = useState(0);
  const [connectionState, setConnectionState] = useState<AppConnectionState>('connected');
  const [dismissedOffline, setDismissedOffline] = useState(false);

  useEffect(() => {
    const handleStart = () => setPendingCount((count) => count + 1);
    const handleEnd = () => setPendingCount((count) => Math.max(0, count - 1));
    const handleConnection = (event: Event) => {
      const detail = (event as CustomEvent<{ state?: AppConnectionState }>).detail;
      if (!detail?.state) return;
      setConnectionState(detail.state);
      if (detail.state === 'connected') {
        setDismissedOffline(false);
      }
    };

    window.addEventListener(APP_REQUEST_START_EVENT, handleStart);
    window.addEventListener(APP_REQUEST_END_EVENT, handleEnd);
    window.addEventListener(APP_CONNECTION_EVENT, handleConnection as EventListener);
    return () => {
      window.removeEventListener(APP_REQUEST_START_EVENT, handleStart);
      window.removeEventListener(APP_REQUEST_END_EVENT, handleEnd);
      window.removeEventListener(APP_CONNECTION_EVENT, handleConnection as EventListener);
    };
  }, []);

  const mode = useMemo(() => {
    if (pendingCount > 0) return connectionState === 'disconnected' ? 'offline' : 'loading';
    if (connectionState === 'disconnected' && !dismissedOffline) return 'offline';
    return null;
  }, [connectionState, dismissedOffline, pendingCount]);

  if (!mode) return null;

  return (
    <div className="app-status-overlay" role="status" aria-live="polite" aria-busy={mode === 'loading'}>
      <div className="app-status-overlay-backdrop" />

      {mode === 'loading' ? (
        <div className="app-loader-shell">
          <div className="app-loader-badge app-loader-badge-connected">
            <span className="app-loader-badge-dot" />
            Connected
          </div>

          <div className="app-loader-stage">
            <div className="app-loader-ring" />
            <div className="app-loader-bubble-orbit">
              {bubbles.map((bubble) => (
                <span
                  key={bubble}
                  className="app-loader-bubble"
                  style={{ ['--bubble-index' as string]: bubble }}
                />
              ))}
            </div>
            <div className="app-loader-core">
              <span className="material-symbols-outlined">bolt</span>
            </div>
          </div>

          <div className="app-loader-copy">
            <h2>Please wait</h2>
            <p>Preparing your workspace, syncing fresh data, and getting the next screen ready.</p>
          </div>
        </div>
      ) : (
        <div className="app-offline-shell">
          <div className="app-loader-badge app-loader-badge-offline">Not connected</div>

          <div className="app-offline-copy">
            <h2>Connection lost for now</h2>
            <p>The live service is not responding. We can keep using local data while we reconnect in the background.</p>
          </div>

          <div className="app-offline-plug-scene" aria-hidden="true">
            <div className="app-offline-wire app-offline-wire-left" />
            <div className="app-offline-wire app-offline-wire-right" />
            <div className="app-offline-plug app-offline-plug-left">
              <span />
              <span />
            </div>
            <div className="app-offline-spark app-offline-spark-left" />
            <div className="app-offline-spark app-offline-spark-right" />
            <div className="app-offline-plug app-offline-plug-right">
              <span />
              <span />
            </div>
          </div>

          <div className="app-offline-actions">
            <button className="btn btn-primary" type="button" onClick={() => setDismissedOffline(true)}>
              Continue Offline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
