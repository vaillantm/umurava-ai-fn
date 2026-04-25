export default function Loading() {
  return (
    <div className="app-route-loading">
      <div className="app-loader-shell app-loader-shell-static">
        <div className="app-loader-badge app-loader-badge-connected">
          <span className="app-loader-badge-dot" />
          Connected
        </div>

        <div className="app-loader-stage">
          <div className="app-loader-ring" />
          <div className="app-loader-bubble-orbit">
            {Array.from({ length: 16 }, (_, bubble) => (
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
          <p>Loading the next page and preparing your recruiter workspace.</p>
        </div>
      </div>
    </div>
  );
}
