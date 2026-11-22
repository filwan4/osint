import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import packageInfo from "../package.json";

type Page =
  | "overview" | "investigations" | "infrastructure" | "geoint"
  | "media" | "documents" | "entities" | "graph" | "reports" | "settings";

type Evidence = {
  id: string; category: string; summary: string; sourceName: string;
  sourceUrl: string; confidence: "low" | "medium" | "high" | "verified";
  createdAt: string;
};
type Investigation = {
  id: string; title: string; summary: string; createdAt: string;
  updatedAt: string; evidence: Evidence[];
};
type EntityRecord = {
  id: string; name: string; kind: string; description: string;
  sourceUrl: string; createdAt: string;
};
type Relation = { id: string; from: string; to: string; label: string };
type Feed = { id: string; name: string; url: string; addedAt: string };
type DocumentRecord = {
  id: string; name: string; type: string; size: number;
  words: number; characters: number; preview: string; addedAt: string;
};
type Workspace = {
  investigations: Investigation[];
  entities: EntityRecord[];
  relations: Relation[];
  feeds: Feed[];
  documents: DocumentRecord[];
};
const STORAGE_KEY = "fieldwork.workspace.v1";
const APP_VERSION = packageInfo.version;
const emptyWorkspace: Workspace = {
  investigations: [], entities: [], relations: [], feeds: [], documents: [],
};
const navigation: { id: Page; label: string; icon: string; group: string }[] = [
  { id: "overview", label: "Overview", icon: "▦", group: "WORKSPACE" },
  { id: "investigations", label: "Investigations", icon: "⌕", group: "WORKSPACE" },
  { id: "graph", label: "Relationship graph", icon: "◎", group: "WORKSPACE" },
  { id: "infrastructure", label: "Infrastructure", icon: "⌘", group: "INTELLIGENCE" },
  { id: "geoint", label: "GEOINT", icon: "⌖", group: "INTELLIGENCE" },
  { id: "media", label: "Media intelligence", icon: "▤", group: "INTELLIGENCE" },
  { id: "documents", label: "Document analysis", icon: "▧", group: "INTELLIGENCE" },
  { id: "entities", label: "Entity analysis", icon: "◇", group: "INTELLIGENCE" },
  { id: "reports", label: "Reports & export", icon: "▣", group: "OUTPUT" },
  { id: "settings", label: "Settings", icon: "⚙", group: "SYSTEM" },
];
const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();
function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyWorkspace;
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    return {
      investigations: Array.isArray(parsed.investigations) ? parsed.investigations : [],
      entities: Array.isArray(parsed.entities) ? parsed.entities : [],
      relations: Array.isArray(parsed.relations) ? parsed.relations : [],
      feeds: Array.isArray(parsed.feeds) ? parsed.feeds : [],
      documents: Array.isArray(parsed.documents) ? parsed.documents : [],
    };
  } catch {
    return emptyWorkspace;
  }
}
function saveFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
function safeDate(value: string) {
  return new Date(value).toLocaleString();
}
function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="lead">{description}</p></div><div className="build-tag"><span /> LOCAL WORKSPACE</div></section>;
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><div className="empty-mark">◇</div><h3>{title}</h3><p>{description}</p></div>;
}
function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className="panel"><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><div className="panel-body">{children}</div></section>;
}

export default function App() {
  const [page, setPage] = useState<Page>("overview");
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);
  const [activeInvestigation, setActiveInvestigation] = useState("");
  const [notice, setNotice] = useState("");
  const [domain, setDomain] = useState("");
  const [domainResult, setDomainResult] = useState("");
  const [domainError, setDomainError] = useState("");
  const [domainBusy, setDomainBusy] = useState(false);
  const [investigationTitle, setInvestigationTitle] = useState("");
  const [investigationSummary, setInvestigationSummary] = useState("");
  const [evidenceCategory, setEvidenceCategory] = useState("Observation");
  const [evidenceSummary, setEvidenceSummary] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [confidence, setConfidence] = useState<Evidence["confidence"]>("medium");
  const [entityName, setEntityName] = useState("");
  const [entityKind, setEntityKind] = useState("Organization");
  const [entityDescription, setEntityDescription] = useState("");
  const [entitySource, setEntitySource] = useState("");
  const [relationFrom, setRelationFrom] = useState("");
  const [relationTo, setRelationTo] = useState("");
  const [relationLabel, setRelationLabel] = useState("related to");
  const [feedName, setFeedName] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [geoName, setGeoName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [documentBusy, setDocumentBusy] = useState(false);
  const [reportTarget, setReportTarget] = useState("");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); }
    catch { setNotice("Storage is full or unavailable. Export your workspace before continuing."); }
  }, [workspace]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const selectedInvestigation = workspace.investigations.find((item) => item.id === activeInvestigation) ?? workspace.investigations[0];
  const evidenceCount = workspace.investigations.reduce((total, item) => total + item.evidence.length, 0);
  const pageInfo = navigation.find((item) => item.id === page) ?? navigation[0];
  const recentInvestigations = useMemo(() => [...workspace.investigations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5), [workspace.investigations]);

  function updateInvestigation(id: string, update: (item: Investigation) => Investigation) {
    setWorkspace((current) => ({
      ...current,
      investigations: current.investigations.map((item) => item.id === id ? update(item) : item),
    }));
  }

  function createInvestigation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = investigationTitle.trim();
    if (!title) return;
    const item: Investigation = {
      id: newId(), title, summary: investigationSummary.trim(),
      createdAt: now(), updatedAt: now(), evidence: [],
    };
    setWorkspace((current) => ({ ...current, investigations: [item, ...current.investigations] }));
    setActiveInvestigation(item.id);
    setInvestigationTitle("");
    setInvestigationSummary("");
    setNotice("Investigation created.");
  }

  function addEvidence(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvestigation || !evidenceSummary.trim() || !sourceName.trim()) return;
    const record: Evidence = {
      id: newId(), category: evidenceCategory, summary: evidenceSummary.trim(),
      sourceName: sourceName.trim(), sourceUrl: sourceUrl.trim(),
      confidence, createdAt: now(),
    };
    updateInvestigation(selectedInvestigation.id, (item) => ({
      ...item, updatedAt: now(), evidence: [record, ...item.evidence],
    }));
    setEvidenceSummary(""); setSourceName(""); setSourceUrl("");
    setNotice("Evidence record added.");
  }

  async function validateDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!domain.trim() || domainBusy) return;
    setDomainBusy(true); setDomainError(""); setDomainResult("");
    try {
      const result = await invoke<string>("validate_domain", { domain: domain.trim() });
      setDomainResult(result);
    } catch (error) {
      setDomainError(typeof error === "string" ? error : error instanceof Error ? error.message : "Validation failed.");
    } finally { setDomainBusy(false); }
  }

  function addEntity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!entityName.trim()) return;
    const entity: EntityRecord = {
      id: newId(), name: entityName.trim(), kind: entityKind,
      description: entityDescription.trim(), sourceUrl: entitySource.trim(), createdAt: now(),
    };
    setWorkspace((current) => ({ ...current, entities: [entity, ...current.entities] }));
    setEntityName(""); setEntityDescription(""); setEntitySource("");
    setNotice("Entity added.");
  }

  function addRelation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!relationFrom || !relationTo || relationFrom === relationTo || !relationLabel.trim()) return;
    setWorkspace((current) => ({
      ...current,
      relations: [...current.relations, { id: newId(), from: relationFrom, to: relationTo, label: relationLabel.trim() }],
    }));
    setNotice("Relationship saved.");
  }

  function addFeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = feedUrl.trim();
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Use an HTTP or HTTPS feed URL.");
    } catch {
      setNotice("Enter a valid RSS/Atom feed URL.");
      return;
    }
    setWorkspace((current) => ({ ...current, feeds: [...current.feeds, { id: newId(), name: feedName.trim() || url, url, addedAt: now() }] }));
    setFeedName(""); setFeedUrl("");
    setNotice("Feed source saved. Feed fetching is not enabled in this build.");
  }

  function addCoordinates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lat = Number(latitude); const lon = Number(longitude);
    if (!geoName.trim() || !latitude.trim() || !longitude.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      setNotice("Enter a place name and valid latitude/longitude.");
      return;
    }
    const entity: EntityRecord = {
      id: newId(), name: geoName.trim(), kind: "Place",
      description: `Coordinates: ${lat}, ${lon}`, sourceUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=12/${lat}/${lon}`, createdAt: now(),
    };
    setWorkspace((current) => ({ ...current, entities: [entity, ...current.entities] }));
    setGeoName(""); setLatitude(""); setLongitude("");
    setNotice("Place saved to Entity analysis.");
  }

  async function inspectDocument(file?: File) {
    if (!file) return;
    if (file.size > 2_000_000) { setNotice("For this first version, text files are limited to 2 MB."); return; }
    if (!/\.(txt|md|csv|log)$/i.test(file.name) && !file.type.startsWith("text/")) {
      setNotice("Supported formats in this build: TXT, Markdown, CSV and LOG.");
      return;
    }
    setDocumentBusy(true);
    try {
      const text = await file.text();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const record: DocumentRecord = {
        id: newId(), name: file.name, type: file.type || "text/plain",
        size: file.size, words, characters: text.length,
        preview: text.slice(0, 1800), addedAt: now(),
      };
      setWorkspace((current) => ({ ...current, documents: [record, ...current.documents] }));
      setNotice("Text extracted locally. The original file is not uploaded.");
    } catch { setNotice("Could not read this file."); }
    finally { setDocumentBusy(false); }
  }

  function exportInvestigation(item: Investigation, format: "json" | "md") {
    const safe = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "investigation";
    if (format === "json") saveFile(`${safe}.json`, JSON.stringify(item, null, 2), "application/json");
    else {
      const lines = [
        `# ${item.title}`, "", item.summary || "No summary provided.", "",
        `Created: ${safeDate(item.createdAt)}`, `Updated: ${safeDate(item.updatedAt)}`, "",
        "## Evidence", "",
        ...item.evidence.flatMap((entry) => [
          `### ${entry.category}: ${entry.summary}`,
          `- Source: ${entry.sourceName}`,
          entry.sourceUrl ? `- URL: ${entry.sourceUrl}` : "- URL: not supplied",
          `- Confidence: ${entry.confidence}`,
          `- Recorded: ${safeDate(entry.createdAt)}`, "",
        ]),
      ];
      saveFile(`${safe}.md`, lines.join("\n"), "text/markdown");
    }
  }

  function exportWorkspace() {
    saveFile("fieldwork-workspace.json", JSON.stringify(workspace, null, 2), "application/json");
  }

  function importWorkspace(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Workspace;
        if (!parsed || !Array.isArray(parsed.investigations) || !Array.isArray(parsed.entities)) throw new Error("Invalid workspace");
        setWorkspace({
          investigations: parsed.investigations,
          entities: parsed.entities,
          relations: Array.isArray(parsed.relations) ? parsed.relations : [],
          feeds: Array.isArray(parsed.feeds) ? parsed.feeds : [],
          documents: Array.isArray(parsed.documents) ? parsed.documents : [],
        });
        setNotice("Workspace imported.");
      } catch { setNotice("This file is not a valid Fieldwork workspace export."); }
    };
    reader.readAsText(file);
  }

  function deleteInvestigation(id: string) {
    if (!window.confirm("Delete this investigation and its evidence?")) return;
    setWorkspace((current) => ({ ...current, investigations: current.investigations.filter((item) => item.id !== id) }));
    if (activeInvestigation === id) setActiveInvestigation("");
    setNotice("Investigation deleted.");
  }

  function renderPage() {
    if (page === "overview") return <>
      <PageHeading eyebrow="FIELDWORK / DESKTOP" title="Research workspace" description="A source-aware environment for open-source research and analysis." />
      <div className="metrics-grid">
        <div className="metric-card"><div className="metric-label">INVESTIGATIONS</div><div className="metric-value">{workspace.investigations.length.toString().padStart(2, "0")}</div><div className="metric-note">Locally stored workspaces</div></div>
        <div className="metric-card"><div className="metric-label">EVIDENCE RECORDS</div><div className="metric-value">{evidenceCount.toString().padStart(2, "0")}</div><div className="metric-note">With source and confidence metadata</div></div>
        <div className="metric-card"><div className="metric-label">ENTITIES & RELATIONS</div><div className="metric-value">{workspace.entities.length} <small>/ {workspace.relations.length}</small></div><div className="metric-note">Places, organizations and public infrastructure</div></div>
      </div>
      <section className="content-section"><div className="section-heading"><div><div className="eyebrow">WORKSPACE</div><h2>Research modules</h2></div><span className="section-count">10 WORKSPACES</span></div><div className="module-grid">{navigation.filter((item) => item.id !== "overview").map((item) => <button className="module-tile" key={item.id} onClick={() => setPage(item.id)}><span className="tile-icon">{item.icon}</span><span><strong>{item.label}</strong><small>{item.group}</small></span><span className="tile-arrow">↗</span></button>)}</div></section>
      <section className="content-section"><div className="section-heading"><div><div className="eyebrow">RECENT ACTIVITY</div><h2>Recent investigations</h2></div><button className="text-button" onClick={() => setPage("investigations")}>View all ↗</button></div>{recentInvestigations.length ? <div className="record-list">{recentInvestigations.map((item) => <button className="record-row" key={item.id} onClick={() => { setActiveInvestigation(item.id); setPage("investigations"); }}><span><strong>{item.title}</strong><small>{item.evidence.length} evidence records · Updated {safeDate(item.updatedAt)}</small></span><span>↗</span></button>)}</div> : <EmptyState title="No investigations yet" description="Create a research workspace to start collecting source-backed notes and evidence." />}</section>
    </>;

    if (page === "investigations") return <>
      <PageHeading eyebrow="WORKSPACE / CASE MANAGEMENT" title="Investigations" description="Create research workspaces and keep evidence, sources and confidence assessments together." />
      <div className="two-column workspace-columns">
        <Panel eyebrow="NEW WORKSPACE" title="Create investigation"><form className="stack-form" onSubmit={createInvestigation}><label>Title<input value={investigationTitle} onChange={(e) => setInvestigationTitle(e.target.value)} placeholder="e.g. Public transport infrastructure review" required /></label><label>Purpose / summary<textarea value={investigationSummary} onChange={(e) => setInvestigationSummary(e.target.value)} placeholder="What are you researching? Define scope and questions." rows={4} /></label><button className="primary-button" type="submit">＋ Create investigation</button></form></Panel>
        <Panel eyebrow="YOUR WORKSPACE" title="Saved investigations">{workspace.investigations.length ? <div className="record-list">{workspace.investigations.map((item) => <div className={`record-row selectable ${selectedInvestigation?.id === item.id ? "selected" : ""}`} key={item.id}><button className="record-main" onClick={() => setActiveInvestigation(item.id)}><strong>{item.title}</strong><small>{item.evidence.length} evidence · {safeDate(item.updatedAt)}</small></button><button className="icon-button danger" title="Delete investigation" onClick={() => deleteInvestigation(item.id)}>×</button></div>)}</div> : <EmptyState title="Nothing here yet" description="Your investigations will appear here." />}</Panel>
      </div>
      {selectedInvestigation && <section className="content-section"><div className="section-heading"><div><div className="eyebrow">ACTIVE INVESTIGATION</div><h2>{selectedInvestigation.title}</h2></div><div className="inline-actions"><button className="secondary-button" onClick={() => exportInvestigation(selectedInvestigation, "md")}>Export Markdown</button><button className="secondary-button" onClick={() => exportInvestigation(selectedInvestigation, "json")}>Export JSON</button></div></div><p className="lead">{selectedInvestigation.summary || "No description added."}</p><div className="two-column workspace-columns"><Panel eyebrow="EVIDENCE MANAGEMENT" title="Add evidence"><form className="stack-form" onSubmit={addEvidence}><label>Category<select value={evidenceCategory} onChange={(e) => setEvidenceCategory(e.target.value)}><option>Observation</option><option>Document</option><option>Public record</option><option>Infrastructure</option><option>Geographic</option><option>Media report</option><option>Other</option></select></label><label>Finding / summary<textarea rows={3} value={evidenceSummary} onChange={(e) => setEvidenceSummary(e.target.value)} placeholder="Describe what the source actually establishes." required /></label><label>Source name<input value={sourceName} onChange={(e) => setSourceName(e.target.value)} placeholder="Publisher, dataset or document" required /></label><label>Source URL<input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://…" /></label><label>Confidence<select value={confidence} onChange={(e) => setConfidence(e.target.value as Evidence["confidence"])}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="verified">Verified</option></select></label><button className="primary-button" type="submit">＋ Add evidence record</button></form></Panel><Panel eyebrow="SOURCE REGISTER" title={`Evidence (${selectedInvestigation.evidence.length})`}>{selectedInvestigation.evidence.length ? <div className="evidence-list">{selectedInvestigation.evidence.map((entry) => <article className="evidence-item" key={entry.id}><div className="evidence-top"><span className="eyebrow">{entry.category}</span><span className={`confidence ${entry.confidence}`}>{entry.confidence}</span></div><h3>{entry.summary}</h3><p>{entry.sourceName}</p>{entry.sourceUrl && <a href={entry.sourceUrl} target="_blank" rel="noreferrer">{entry.sourceUrl} ↗</a>}<small>{safeDate(entry.createdAt)}</small></article>)}</div> : <EmptyState title="No evidence recorded" description="Add findings with source references and a confidence rating." />}</Panel></div></section>}
    </>;

    if (page === "infrastructure") return <>
      <PageHeading eyebrow="INTELLIGENCE / PUBLIC INFRASTRUCTURE" title="Infrastructure" description="Validate DNS hostnames and organize public domain or network observations." />
      <div className="two-column workspace-columns"><Panel eyebrow="LOCAL VALIDATION" title="DNS hostname checker"><p className="panel-description">Checks hostname syntax and normalizes casing. It does not perform a DNS lookup or send a network request.</p><form className="stack-form" onSubmit={validateDomain}><label>Domain name<input value={domain} onChange={(e) => { setDomain(e.target.value); setDomainResult(""); setDomainError(""); }} placeholder="example.org" autoCapitalize="none" autoCorrect="off" spellCheck={false} required /></label><button className="primary-button" disabled={domainBusy} type="submit">{domainBusy ? "Checking…" : "Validate hostname"}</button></form>{domainResult && <div className="inline-result success">✓ Valid hostname: <strong>{domainResult}</strong></div>}{domainError && <div className="inline-result error">{domainError}</div>}</Panel><Panel eyebrow="RESEARCH NOTES" title="Infrastructure workflow"><ul className="feature-list"><li>Record domains and public infrastructure observations as evidence.</li><li>Keep the original source URL and retrieval date.</li><li>Separate syntax validation from actual DNS/network observations.</li><li>Do not treat an IP address or shared hosting endpoint as proof of ownership.</li></ul><p className="notice-text">Live DNS, RDAP and certificate-transparency collectors are not connected yet. This build does not invent lookup results.</p></Panel></div>
    </>;

    if (page === "geoint") return <>
      <PageHeading eyebrow="INTELLIGENCE / GEOSPATIAL" title="GEOINT" description="Record public places and coordinates, then inspect them on OpenStreetMap." />
      <div className="two-column workspace-columns"><Panel eyebrow="COORDINATE TOOL" title="Save a location"><form className="stack-form" onSubmit={addCoordinates}><label>Place / location name<input value={geoName} onChange={(e) => setGeoName(e.target.value)} placeholder="Public landmark or facility" required /></label><div className="form-pair"><label>Latitude<input inputMode="decimal" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="51.5072" required /></label><label>Longitude<input inputMode="decimal" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-0.1276" required /></label></div><button className="primary-button" type="submit">＋ Save place</button></form><p className="field-hint">Latitude: −90 to 90. Longitude: −180 to 180. Coordinates are stored in your local Entity register.</p></Panel><Panel eyebrow="MAP VIEWER" title="OpenStreetMap"><p className="panel-description">Use the public OpenStreetMap viewer to inspect map context. This opens an external website; Fieldwork does not track your location.</p>{workspace.entities.filter((entity) => entity.kind === "Place").length ? <div className="record-list">{workspace.entities.filter((entity) => entity.kind === "Place").map((entity) => <div className="record-row" key={entity.id}><span><strong>{entity.name}</strong><small>{entity.description}</small></span><a className="text-button" href={entity.sourceUrl} target="_blank" rel="noreferrer">Map ↗</a></div>)}</div> : <EmptyState title="No saved places" description="Add coordinates to create your first place record." />}</Panel></div>
    </>;

    if (page === "media") return <>
      <PageHeading eyebrow="INTELLIGENCE / OPEN MEDIA" title="Media intelligence" description="Maintain a source list for public reporting and event monitoring." />
      <div className="two-column workspace-columns"><Panel eyebrow="SOURCE MANAGEMENT" title="Add RSS / Atom feed"><form className="stack-form" onSubmit={addFeed}><label>Source name<input value={feedName} onChange={(e) => setFeedName(e.target.value)} placeholder="Publisher or feed name" /></label><label>Feed URL<input type="url" value={feedUrl} onChange={(e) => setFeedUrl(e.target.value)} placeholder="https://example.org/feed.xml" required /></label><button className="primary-button" type="submit">＋ Save source</button></form><p className="notice-text">Feed retrieval and timeline aggregation are planned for the next collector milestone. This version saves source URLs only.</p></Panel><Panel eyebrow="REGISTERED SOURCES" title={`Feeds (${workspace.feeds.length})`}>{workspace.feeds.length ? <div className="record-list">{workspace.feeds.map((feed) => <div className="record-row" key={feed.id}><span><strong>{feed.name}</strong><small>{feed.url}</small></span><a className="text-button" href={feed.url} target="_blank" rel="noreferrer">Open ↗</a></div>)}</div> : <EmptyState title="No feeds saved" description="Add trusted public RSS or Atom sources." />}</Panel></div>
    </>;

    if (page === "documents") return <>
      <PageHeading eyebrow="INTELLIGENCE / LOCAL FILES" title="Document analysis" description="Inspect text-based files locally and extract basic metadata without uploading them." />
      <Panel eyebrow="LOCAL TEXT EXTRACTION" title="Import a document"><label className="file-drop"><input type="file" accept=".txt,.md,.csv,.log,text/*" disabled={documentBusy} onChange={(e) => { void inspectDocument(e.target.files?.[0]); e.currentTarget.value = ""; }} /><span className="file-icon">⇧</span><strong>{documentBusy ? "Reading file…" : "Choose a text file"}</strong><small>TXT · Markdown · CSV · LOG · Maximum 2 MB</small></label><p className="notice-text">Processing happens inside the app. This initial parser does not support PDF, DOCX, OCR or embedded images.</p></Panel>
      <section className="content-section"><div className="section-heading"><div><div className="eyebrow">LOCAL REGISTER</div><h2>Analyzed documents ({workspace.documents.length})</h2></div></div>{workspace.documents.length ? <div className="document-grid">{workspace.documents.map((doc) => <article className="document-card" key={doc.id}><div className="document-top"><span className="tile-icon">▤</span><span className="confidence medium">TEXT</span></div><h3>{doc.name}</h3><div className="document-stats"><span>{doc.words.toLocaleString()} words</span><span>{doc.characters.toLocaleString()} chars</span><span>{(doc.size / 1024).toFixed(1)} KB</span></div><details><summary>Preview extracted text</summary><pre>{doc.preview || "No text content."}</pre></details><small>{safeDate(doc.addedAt)}</small></article>)}</div> : <EmptyState title="No documents analyzed" description="Import a supported text file to see its local text statistics and preview." />}</section>
    </>;

    if (page === "entities") return <>
      <PageHeading eyebrow="ANALYSIS / ENTITY REGISTER" title="Entity analysis" description="Organize organizations, public places, events and infrastructure records." />
      <div className="two-column workspace-columns"><Panel eyebrow="ENTITY REGISTER" title={`Entities (${workspace.entities.length})`} >{workspace.entities.length ? <div className="record-list">{workspace.entities.map((entity) => <article className="entity-row" key={entity.id}><div className="evidence-top"><span className="confidence medium">{entity.kind}</span><small>{safeDate(entity.createdAt)}</small></div><h3>{entity.name}</h3><p>{entity.description || "No description."}</p>{entity.sourceUrl && <a href={entity.sourceUrl} target="_blank" rel="noreferrer">{entity.sourceUrl} ↗</a>}</article>)}</div> : <EmptyState title="No entities yet" description="Create records or save places from GEOINT." />}</Panel><Panel eyebrow="MANUAL ENTRY" title="Add entity"><form className="stack-form" onSubmit={addEntity}><label>Name<input value={entityName} onChange={(e) => setEntityName(e.target.value)} placeholder="Public organization, place or event" required /></label><label>Type<select value={entityKind} onChange={(e) => setEntityKind(e.target.value)}><option>Organization</option><option>Place</option><option>Event</option><option>Infrastructure</option><option>Public dataset</option></select></label><label>Description<textarea rows={3} value={entityDescription} onChange={(e) => setEntityDescription(e.target.value)} /></label><label>Source URL<input value={entitySource} onChange={(e) => setEntitySource(e.target.value)} placeholder="https://…" /></label><button className="primary-button" type="submit">＋ Add entity</button></form></Panel></div>
    </>;

    if (page === "graph") return <>
      <PageHeading eyebrow="ANALYSIS / RELATIONSHIPS" title="Relationship graph" description="Create explicit, source-conscious links between registered public entities." />
      <Panel eyebrow="RELATIONSHIP BUILDER" title="Connect two entities">{workspace.entities.length < 2 ? <EmptyState title="More entities required" description="Add at least two entities before creating a relationship." /> : <form className="stack-form" onSubmit={addRelation}><div className="form-pair"><label>From<select value={relationFrom} onChange={(e) => setRelationFrom(e.target.value)} required><option value="">Select entity</option>{workspace.entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}</select></label><label>To<select value={relationTo} onChange={(e) => setRelationTo(e.target.value)} required><option value="">Select entity</option>{workspace.entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}</select></label></div><label>Relationship label<input value={relationLabel} onChange={(e) => setRelationLabel(e.target.value)} placeholder="operates / located in / publishes" required /></label><button className="primary-button" type="submit">＋ Add relationship</button></form>}</Panel><section className="content-section"><div className="section-heading"><div><div className="eyebrow">LINK REGISTER</div><h2>Recorded relationships ({workspace.relations.length})</h2></div></div>{workspace.relations.length ? <div className="relation-list">{workspace.relations.map((relation) => { const from = workspace.entities.find((item) => item.id === relation.from); const to = workspace.entities.find((item) => item.id === relation.to); return <div className="relation-row" key={relation.id}><strong>{from?.name ?? "Unknown entity"}</strong><span>{relation.label}</span><strong>{to?.name ?? "Unknown entity"}</strong></div>; })}</div> : <EmptyState title="No relationships" description="Links you add will appear here. This is a transparent relationship register, not an automatic inference engine." />}</section>
    </>;

    if (page === "reports") return <>
      <PageHeading eyebrow="OUTPUT / EXPORT" title="Reports & export" description="Export investigations with source references, confidence ratings and timestamps." />
      <Panel eyebrow="INVESTIGATION REPORTS" title="Choose a report">{workspace.investigations.length ? <div className="record-list">{workspace.investigations.map((item) => <div className="record-row" key={item.id}><span><strong>{item.title}</strong><small>{item.evidence.length} evidence records · {safeDate(item.updatedAt)}</small></span><div className="inline-actions"><button className="text-button" onClick={() => exportInvestigation(item, "md")}>Markdown</button><button className="text-button" onClick={() => exportInvestigation(item, "json")}>JSON</button></div></div>)}</div> : <EmptyState title="No reports available" description="Create an investigation and add evidence first." />}</Panel><div className="content-section two-column"><Panel eyebrow="FULL BACKUP" title="Export workspace"><p className="panel-description">Save all investigations, entities, relationships, feed sources and document summaries in one JSON file.</p><button className="primary-button" onClick={exportWorkspace}>↓ Export workspace JSON</button></Panel><Panel eyebrow="RESTORE" title="Import workspace"><label className="file-drop compact"><input type="file" accept="application/json,.json" onChange={(e) => { importWorkspace(e.target.files?.[0]); e.currentTarget.value = ""; }} /><strong>Choose Fieldwork JSON backup</strong><small>Import replaces the current local workspace.</small></label></Panel></div>
    </>;

    return <>
      <PageHeading eyebrow="SYSTEM / PREFERENCES" title="Settings" description="Review storage, privacy and workspace configuration." />
      <div className="two-column workspace-columns"><Panel eyebrow="DATA & PRIVACY" title="Local workspace"><div className="settings-list"><div><strong>Storage</strong><span>Browser storage inside this desktop app</span></div><div><strong>Network collection</strong><span>Off unless a module explicitly opens an external source</span></div><div><strong>Automatic sync</strong><span>Disabled</span></div><div><strong>Encryption</strong><span>Workspace data is not encrypted in this version</span></div></div><p className="notice-text">Export a backup before clearing data. Do not store passwords, access tokens or sensitive personal information in Fieldwork.</p><button className="danger-button" onClick={() => { if (window.confirm("Permanently clear all Fieldwork data stored on this device? Export a backup first if needed.")) { setWorkspace(emptyWorkspace); setActiveInvestigation(""); setNotice("Local workspace cleared."); } }}>Clear local workspace</button></Panel><Panel eyebrow="APPLICATION" title="Build information"><div className="settings-list"><div><strong>Version</strong><span>{APP_VERSION}</span></div><div><strong>Platform</strong><span>Linux desktop / Tauri</span></div><div><strong>Project</strong><a href="https://github.com/filwan4/osint" target="_blank" rel="noreferrer">GitHub repository ↗</a></div><div><strong>Updates</strong><a href="https://github.com/filwan4/osint/releases/latest" target="_blank" rel="noreferrer">Check releases ↗</a></div></div></Panel></div>
    </>;
  }

  return <div className="app-shell">
    <aside className="sidebar" aria-label="Application navigation">
      <div className="brand"><div className="brand-mark">F</div><div className="brand-copy"><div className="brand-name">FIELDWORK</div><div className="brand-subtitle">RESEARCH WORKSPACE</div></div></div>
      <nav className="sidebar-nav">{["WORKSPACE", "INTELLIGENCE", "OUTPUT", "SYSTEM"].map((group) => <div className="nav-group" key={group}><div className="nav-label">{group}</div>{navigation.filter((item) => item.group === group).map((item) => <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)} aria-current={page === item.id ? "page" : undefined}><span className="nav-icon">{item.icon}</span><span className="nav-text">{item.label}</span></button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="connection"><span className="connection-dot" /><span className="connection-label">LOCAL STORAGE</span></div><div className="version">FIELDWORK v{APP_VERSION} · DESKTOP</div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> {pageInfo.label}</div><a className="update-button" href="https://github.com/filwan4/osint/releases/latest" target="_blank" rel="noreferrer">Latest release ↗</a></header>
      {notice && <div className="toast" role="status">{notice}</div>}
      {renderPage()}
      <footer className="footer"><span>FIELDWORK · OPEN-SOURCE RESEARCH TOOLING</span><span>PUBLIC SOURCES · SOURCE PROVENANCE · PRIVACY-AWARE</span></footer>
    </main>
  </div>;
}
