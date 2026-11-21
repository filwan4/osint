import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

type ModuleCardProps = {
  index: string;
  title: string;
  description: string;
  status: "available" | "planned";
};

function ModuleCard({ index, title, description, status }: ModuleCardProps) {
  return (
    <article className="module-card">
      <div className="module-index">{index}</div>
      <div className="module-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className={"status-pill " + status}>
        {status === "available" ? "CORE READY" : "PLANNED"}
      </span>
    </article>
  );
}

export default function App() {
  const [domain, setDomain] = useState("");
  const [normalizedDomain, setNormalizedDomain] = useState("");
  const [domainError, setDomainError] = useState("");
  const [updateStatus, setUpdateStatus] = useState("Updates are checked on demand.");

  async function validateDomain() {
    setDomainError("");
    setNormalizedDomain("");
    try {
      const result = await invoke<string>("validate_domain", { domain });
      setNormalizedDomain(result);
    } catch (error) {
      setDomainError(String(error));
    }
  }

  async function checkForUpdates() {
    setUpdateStatus("Checking GitHub Releases…");
    try {
      const update = await check();
      if (!update) {
        setUpdateStatus("Fieldwork is up to date.");
        return;
      }

      setUpdateStatus("Downloading Fieldwork " + update.version + "…");
      await update.downloadAndInstall((event) => {
        if (event.event === "Finished") {
          setUpdateStatus("Update downloaded. Restarting…");
        } else if (event.event === "Progress") {
          setUpdateStatus("Downloading update…");
        }
      });
      await relaunch();
    } catch (error) {
      setUpdateStatus("Update check failed: " + String(error));
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">F</div>
          <div>
            <div className="brand-name">FIELDWORK</div>
            <div className="brand-subtitle">RESEARCH WORKSPACE</div>
          </div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <button className="nav-item active"><span>▦</span> Overview</button>
        <button className="nav-item" disabled><span>⌕</span> Investigations</button>
        <button className="nav-item" disabled><span>◎</span> Relationship graph</button>
        <div className="nav-label section-label">INTELLIGENCE</div>
        <button className="nav-item" disabled><span>⌘</span> Infrastructure</button>
        <button className="nav-item" disabled><span>⌖</span> GEOINT</button>
        <button className="nav-item" disabled><span>▤</span> Media</button>
        <button className="nav-item" disabled><span>▧</span> Documents</button>
        <div className="sidebar-bottom">
          <div className="connection"><span className="connection-dot" /> LOCAL CORE</div>
          <div className="version">FIELDWORK v0.1.0 · FOUNDATION</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> Overview</div>
          <button className="update-button" onClick={checkForUpdates}>↻ Check for updates</button>
        </header>

        <section className="page-heading">
          <div>
            <div className="eyebrow">FIELDWORK / DESKTOP</div>
            <h1>Research workspace</h1>
            <p className="lead">A source-aware environment for open-source research and analysis.</p>
          </div>
          <div className="build-tag"><span /> DEVELOPMENT BUILD</div>
        </section>

        <section className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">CORE VERSION</div>
            <div className="metric-value">0.1.0</div>
            <div className="metric-note">Foundation milestone</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MODULES READY</div>
            <div className="metric-value">01 <small>/ 06</small></div>
            <div className="metric-note">Input validation foundation</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">DATA COLLECTION</div>
            <div className="metric-value">OFF</div>
            <div className="metric-note">No collectors enabled yet</div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SYSTEM COMPONENTS</div>
              <h2>Intelligence modules</h2>
            </div>
            <span className="section-count">01 ACTIVE · 05 PLANNED</span>
          </div>
          <div className="module-list">
            <ModuleCard index="01" title="Infrastructure" description="Public domain and network metadata. Initial domain validation is available." status="available" />
            <ModuleCard index="02" title="GEOINT" description="Public geographic datasets, maps, and place-based context." status="planned" />
            <ModuleCard index="03" title="Media intelligence" description="Public reporting, RSS sources, and event timelines." status="planned" />
            <ModuleCard index="04" title="Document analysis" description="Metadata and text analysis for documents you are authorized to inspect." status="planned" />
            <ModuleCard index="05" title="Entity analysis" description="Organization, infrastructure, place, and event records." status="planned" />
            <ModuleCard index="06" title="Correlation & reporting" description="Evidence graph, provenance, and reproducible reports." status="planned" />
          </div>
        </section>

        <section className="content-section two-column">
          <div className="panel">
            <div className="eyebrow">INFRASTRUCTURE / INPUT CHECK</div>
            <h2>Validate a domain</h2>
            <p className="panel-description">Check and normalize a DNS domain locally. This step does not send a network request.</p>
            <div className="input-row">
              <input
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && validateDomain()}
                placeholder="example.org"
                aria-label="Domain to validate"
              />
              <button onClick={validateDomain} disabled={!domain.trim()}>Validate</button>
            </div>
            {normalizedDomain && <div className="result success">✓ Valid domain: <strong>{normalizedDomain}</strong></div>}
            {domainError && <div className="result error">{domainError}</div>}
          </div>
          <div className="panel update-panel">
            <div className="eyebrow">DISTRIBUTION</div>
            <h2>Application updates</h2>
            <p className="panel-description">Signed updates will be distributed through the public GitHub Releases page.</p>
            <div className="update-status">{updateStatus}</div>
            <a href="https://github.com/filwan4/osint/releases" target="_blank" rel="noreferrer">View project releases ↗</a>
          </div>
        </section>

        <footer className="footer">
          <span>FIELDWORK · OPEN-SOURCE RESEARCH TOOLING</span>
          <span>PUBLIC SOURCES · SOURCE PROVENANCE · PRIVACY-AWARE</span>
        </footer>
      </main>
    </div>
  );
}
