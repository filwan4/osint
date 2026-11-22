import { useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import packageInfo from "../package.json";

type ModuleStatus = "available" | "planned";

type ModuleDefinition = {
  index: string;
  title: string;
  description: string;
  status: ModuleStatus;
};

const APP_VERSION = packageInfo.version;

const modules: ModuleDefinition[] = [
  {
    index: "01",
    title: "Infrastructure",
    description:
      "Public domain and network metadata. Local DNS-name validation is available.",
    status: "available",
  },
  {
    index: "02",
    title: "GEOINT",
    description: "Public geographic datasets, maps, and place-based context.",
    status: "planned",
  },
  {
    index: "03",
    title: "Media intelligence",
    description: "Public reporting, RSS sources, and event timelines.",
    status: "planned",
  },
  {
    index: "04",
    title: "Document analysis",
    description:
      "Metadata and text analysis for documents you are authorized to inspect.",
    status: "planned",
  },
  {
    index: "05",
    title: "Entity analysis",
    description: "Organization, infrastructure, place, and event records.",
    status: "planned",
  },
  {
    index: "06",
    title: "Correlation & reporting",
    description: "Evidence graph, provenance, and reproducible reports.",
    status: "planned",
  },
];

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "An unexpected error occurred while validating the domain.";
}

function ModuleCard({ module }: { module: ModuleDefinition }) {
  const available = module.status === "available";

  return (
    <article className="module-card">
      <div className="module-index" aria-hidden="true">
        {module.index}
      </div>
      <div className="module-copy">
        <h3>{module.title}</h3>
        <p>{module.description}</p>
      </div>
      <span className={`status-pill ${module.status}`}>
        <span className="status-indicator" aria-hidden="true" />
        {available ? "AVAILABLE" : "PLANNED"}
      </span>
    </article>
  );
}

export default function App() {
  const [domain, setDomain] = useState("");
  const [normalizedDomain, setNormalizedDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const availableModules = modules.filter(
    (module) => module.status === "available",
  ).length;

  async function handleValidate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const candidate = domain.trim();
    if (!candidate || isValidating) {
      return;
    }

    setIsValidating(true);
    setNormalizedDomain("");
    setDomainError("");

    try {
      const result = await invoke<string>("validate_domain", {
        domain: candidate,
      });
      setNormalizedDomain(result);
    } catch (error) {
      setDomainError(getErrorMessage(error));
    } finally {
      setIsValidating(false);
    }
  }

  function handleDomainChange(value: string) {
    setDomain(value);
    setNormalizedDomain("");
    setDomainError("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Application navigation">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            F
          </div>
          <div className="brand-copy">
            <div className="brand-name">FIELDWORK</div>
            <div className="brand-subtitle">RESEARCH WORKSPACE</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <div className="nav-label">WORKSPACE</div>
          <button
            className="nav-item active"
            type="button"
            aria-current="page"
            title="Overview"
          >
            <span className="nav-icon" aria-hidden="true">▦</span>
            <span className="nav-text">Overview</span>
          </button>
          <button
            className="nav-item"
            type="button"
            disabled
            title="Investigations — planned for a future release"
          >
            <span className="nav-icon" aria-hidden="true">⌕</span>
            <span className="nav-text">Investigations</span>
          </button>
          <button
            className="nav-item"
            type="button"
            disabled
            title="Relationship graph — planned for a future release"
          >
            <span className="nav-icon" aria-hidden="true">◎</span>
            <span className="nav-text">Relationship graph</span>
          </button>

          <div className="nav-label section-label">INTELLIGENCE</div>
          <button
            className="nav-item"
            type="button"
            disabled
            title="Infrastructure workspace — planned for a future release"
          >
            <span className="nav-icon" aria-hidden="true">⌘</span>
            <span className="nav-text">Infrastructure</span>
          </button>
          <button
            className="nav-item"
            type="button"
            disabled
            title="GEOINT — planned for a future release"
          >
            <span className="nav-icon" aria-hidden="true">⌖</span>
            <span className="nav-text">GEOINT</span>
          </button>
          <button
            className="nav-item"
            type="button"
            disabled
            title="Media — planned for a future release"
          >
            <span className="nav-icon" aria-hidden="true">▤</span>
            <span className="nav-text">Media</span>
          </button>
          <button
            className="nav-item"
            type="button"
            disabled
            title="Documents — planned for a future release"
          >
            <span className="nav-icon" aria-hidden="true">▧</span>
            <span className="nav-text">Documents</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="connection">
            <span className="connection-dot" aria-hidden="true" />
            <span className="connection-label">LOCAL CORE</span>
          </div>
          <div className="version">FIELDWORK v{APP_VERSION} · FOUNDATION</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span aria-hidden="true">/</span> Overview
          </div>
          <a
            className="update-button"
            href="https://github.com/filwan4/osint/releases/latest"
            target="_blank"
            rel="noreferrer"
          >
            <span>Latest release</span>
            <span aria-hidden="true">↗</span>
          </a>
        </header>

        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <div className="eyebrow">FIELDWORK / DESKTOP</div>
            <h1 id="page-title">Research workspace</h1>
            <p className="lead">
              A source-aware environment for open-source research and analysis.
            </p>
          </div>
          <div className="build-tag">
            <span aria-hidden="true" />
            DESKTOP BUILD
          </div>
        </section>

        <section className="metrics-grid" aria-label="Workspace status">
          <div className="metric-card">
            <div className="metric-label">APPLICATION VERSION</div>
            <div className="metric-value">{APP_VERSION}</div>
            <div className="metric-note">Installed desktop release</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MODULES AVAILABLE</div>
            <div className="metric-value">
              {String(availableModules).padStart(2, "0")}
              <small> / {String(modules.length).padStart(2, "0")}</small>
            </div>
            <div className="metric-note">One local utility is ready</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">NETWORK COLLECTION</div>
            <div className="metric-value">OFF</div>
            <div className="metric-note">No background collection</div>
          </div>
        </section>

        <section className="content-section" aria-labelledby="modules-title">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SYSTEM COMPONENTS</div>
              <h2 id="modules-title">Intelligence modules</h2>
            </div>
            <span className="section-count">
              {String(availableModules).padStart(2, "0")} AVAILABLE
              <span aria-hidden="true"> · </span>
              {String(modules.length - availableModules).padStart(2, "0")} PLANNED
            </span>
          </div>
          <div className="module-list">
            {modules.map((module) => (
              <ModuleCard key={module.index} module={module} />
            ))}
          </div>
        </section>

        <section className="content-section two-column">
          <section className="panel" aria-labelledby="domain-title">
            <div className="eyebrow">INFRASTRUCTURE / INPUT CHECK</div>
            <h2 id="domain-title">Validate a domain</h2>
            <p className="panel-description">
              Check and normalize a DNS hostname locally. This does not perform
              a DNS lookup or send a network request.
            </p>

            <form className="domain-form" onSubmit={handleValidate}>
              <div className="input-row">
                <input
                  type="text"
                  value={domain}
                  onChange={(event) => handleDomainChange(event.currentTarget.value)}
                  placeholder="example.org"
                  aria-label="DNS domain to validate"
                  aria-describedby="domain-help"
                  aria-invalid={Boolean(domainError)}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={255}
                  required
                />
                <button
                  type="submit"
                  disabled={!domain.trim() || isValidating}
                >
                  {isValidating ? "Checking…" : "Validate"}
                </button>
              </div>
              <p className="field-hint" id="domain-help">
                ASCII domain names only. Use Punycode for internationalized
                domains.
              </p>
            </form>

            <div className="feedback" aria-live="polite" aria-atomic="true">
              {isValidating && (
                <p className="result pending">Checking locally…</p>
              )}
              {normalizedDomain && (
                <p className="result success">
                  <span aria-hidden="true">✓</span>
                  <span>
                    Valid DNS name: <strong>{normalizedDomain}</strong>
                  </span>
                </p>
              )}
              {domainError && (
                <p className="result error" role="alert">
                  <span aria-hidden="true">!</span>
                  <span>{domainError}</span>
                </p>
              )}
            </div>
          </section>

          <section className="panel update-panel" aria-labelledby="updates-title">
            <div className="eyebrow">DISTRIBUTION</div>
            <h2 id="updates-title">Application updates</h2>
            <p className="panel-description">
              Fieldwork currently uses manual updates. Run the CachyOS installer
              again to download the latest release and refresh the launcher.
            </p>
            <div className="update-status">
              <span className="manual-update-dot" aria-hidden="true" />
              Automatic in-app updates are not enabled.
            </div>
            <a
              className="release-link"
              href="https://github.com/filwan4/osint/releases/latest"
              target="_blank"
              rel="noreferrer"
            >
              View release notes <span aria-hidden="true">↗</span>
            </a>
          </section>
        </section>

        <footer className="footer">
          <span>FIELDWORK · OPEN-SOURCE RESEARCH TOOLING</span>
          <span>PUBLIC SOURCES · SOURCE PROVENANCE · PRIVACY-AWARE</span>
        </footer>
      </main>
    </div>
  );
}
