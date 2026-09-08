import React, { useEffect, useMemo, useState } from "react";

const STATUSSES = ["Actief", "On hold", "Afgerond"];
const seedProjects = [
  { id: "p1", code: "PRJ-001", name: "ERP implementatie", client: "Demo klant", status: "Actief", budgetHours: 240, hourlyRate: 120, startDate: "2026-09-01", endDate: "2026-12-18", description: "Implementatie en procesbegeleiding" },
  { id: "p2", code: "PRJ-002", name: "Procesoptimalisatie", client: "Interne organisatie", status: "Actief", budgetHours: 80, hourlyRate: 110, startDate: "2026-09-05", endDate: "2026-10-31", description: "Analyse en verbeterplan" }
];
const seedEmployees = [
  { id: "e1", name: "Alex Pullens", email: "alex@apuconsultancy.nl", active: true },
  { id: "e2", name: "Demo Medewerker", email: "medewerker@example.nl", active: true }
];
const seedEntries = [
  { id: "t1", projectId: "p1", employeeId: "e1", date: "2026-09-07", startTime: "08:30", endTime: "16:30", hours: 8, activity: "Projectmanagement", description: "Planning en statusoverleg", billable: true, invoiced: false, invoiceDate: "", invoiceReference: "" },
  { id: "t2", projectId: "p2", employeeId: "e1", date: "2026-09-08", startTime: "09:00", endTime: "12:00", hours: 3, activity: "Analyse", description: "Procesanalyse", billable: true, invoiced: false, invoiceDate: "", invoiceReference: "" }
];

const today = () => new Date().toISOString().slice(0, 10);
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const money = value => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(Number(value || 0));
const fmtHours = value => `${Number(value || 0).toLocaleString("nl-NL", { maximumFractionDigits: 2 })} uur`;
const fmtDate = value => value ? new Intl.DateTimeFormat("nl-NL").format(new Date(`${value}T12:00:00`)) : "-";
const duration = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  return minutes > 0 ? Math.round(minutes / 60 * 100) / 100 : 0;
};
const monday = value => {
  const d = new Date(`${value}T12:00:00`);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
};
const inWeek = (value, offset = 0) => {
  if (!value) return false;
  const target = monday(value);
  const current = monday(today());
  current.setDate(current.getDate() + offset * 7);
  return target.getTime() === current.getTime();
};
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

function Button({ children, secondary = false, danger = false, icon = false, ...props }) {
  return <button className={`button ${secondary ? "secondary" : ""} ${danger ? "danger" : ""} ${icon ? "icon" : ""}`} {...props}>{children}</button>;
}
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Modal({ title, onClose, children }) {
  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal"><header><h2>{title}</h2><Button secondary icon onClick={onClose} aria-label="Sluiten">×</Button></header><div className="modalBody">{children}</div></div></div>;
}
function ProjectForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || { code: "", name: "", client: "", status: "Actief", budgetHours: 0, hourlyRate: 0, startDate: today(), endDate: "", description: "" });
  const set = (key, value) => setData(old => ({ ...old, [key]: value }));
  return <form onSubmit={e => { e.preventDefault(); onSave({ ...data, budgetHours: Number(data.budgetHours), hourlyRate: Number(data.hourlyRate) }); }}>
    <div className="formGrid"><Field label="Projectcode *"><input required value={data.code} onChange={e => set("code", e.target.value)} /></Field><Field label="Status"><select value={data.status} onChange={e => set("status", e.target.value)}>{STATUSSES.map(s => <option key={s}>{s}</option>)}</select></Field></div>
    <Field label="Projectnaam *"><input required value={data.name} onChange={e => set("name", e.target.value)} /></Field>
    <Field label="Klant *"><input required value={data.client} onChange={e => set("client", e.target.value)} /></Field>
    <div className="formGrid"><Field label="Budgeturen"><input type="number" min="0" step="0.25" value={data.budgetHours} onChange={e => set("budgetHours", e.target.value)} /></Field><Field label="Uurtarief"><input type="number" min="0" step="0.01" value={data.hourlyRate} onChange={e => set("hourlyRate", e.target.value)} /></Field><Field label="Startdatum"><input type="date" value={data.startDate} onChange={e => set("startDate", e.target.value)} /></Field><Field label="Einddatum"><input type="date" value={data.endDate} onChange={e => set("endDate", e.target.value)} /></Field></div>
    <Field label="Omschrijving"><textarea value={data.description} onChange={e => set("description", e.target.value)} /></Field>
    <div className="actions"><Button type="button" secondary onClick={onCancel}>Annuleren</Button><Button type="submit">Project opslaan</Button></div>
  </form>;
}
function EmployeeForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || { name: "", email: "", active: true });
  return <form onSubmit={e => { e.preventDefault(); onSave({ ...data, name: data.name.trim(), email: data.email.trim() }); }}>
    <Field label="Naam *"><input required value={data.name} onChange={e => setData({ ...data, name: e.target.value })} /></Field>
    <Field label="E-mailadres"><input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} /></Field>
    <label className="checkbox"><input type="checkbox" checked={data.active} onChange={e => setData({ ...data, active: e.target.checked })} /> Actieve medewerker</label>
    <div className="actions"><Button type="button" secondary onClick={onCancel}>Annuleren</Button><Button type="submit">Medewerker opslaan</Button></div>
  </form>;
}
function TimeForm({ projects, employees, initial, onSave, onCancel }) {
  const [data, setData] = useState(initial || { projectId: projects[0]?.id || "", employeeId: employees.find(e => e.active)?.id || "", date: today(), startTime: "08:30", endTime: "17:00", hours: 8.5, activity: "Werkzaamheden", description: "", billable: true, invoiced: false, invoiceDate: "", invoiceReference: "" });
  const [error, setError] = useState("");
  const set = (key, value) => setData(old => { const next = { ...old, [key]: value }; if (key === "startTime" || key === "endTime") next.hours = duration(next.startTime, next.endTime); return next; });
  return <form onSubmit={e => { e.preventDefault(); const calculated = duration(data.startTime, data.endTime); if (calculated <= 0) { setError("De tot-tijd moet later zijn dan de van-tijd."); return; } onSave({ ...data, hours: calculated }); }}>
    <Field label="Project *"><select required value={data.projectId} onChange={e => set("projectId", e.target.value)}>{projects.filter(p => p.status !== "Afgerond" || p.id === data.projectId).map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}</select></Field>
    <Field label="Medewerker *"><select required value={data.employeeId} onChange={e => set("employeeId", e.target.value)}>{employees.filter(emp => emp.active || emp.id === data.employeeId).map(emp => <option key={emp.id} value={emp.id}>{emp.name}{!emp.active ? " (inactief)" : ""}</option>)}</select></Field>
    <Field label="Datum *"><input required type="date" value={data.date} onChange={e => set("date", e.target.value)} /></Field>
    <div className="formGrid three"><Field label="Van *"><input required type="time" value={data.startTime} onChange={e => set("startTime", e.target.value)} /></Field><Field label="Tot *"><input required type="time" value={data.endTime} onChange={e => set("endTime", e.target.value)} /></Field><Field label="Berekende uren"><div className="calculated">{fmtHours(data.hours)}</div></Field></div>
    <Field label="Activiteit"><input value={data.activity} onChange={e => set("activity", e.target.value)} /></Field>
    <Field label="Omschrijving"><textarea value={data.description} onChange={e => set("description", e.target.value)} /></Field>
    <label className="checkbox"><input type="checkbox" checked={data.billable} disabled={data.invoiced} onChange={e => set("billable", e.target.checked)} /> Factureerbare uren</label>
    {data.invoiced && <p className="notice">Deze urenregel is gefactureerd. De facturatiestatus blijft behouden.</p>}
    {error && <p className="error">{error}</p>}
    <div className="actions"><Button type="button" secondary onClick={onCancel}>Annuleren</Button><Button type="submit">Uren opslaan</Button></div>
  </form>;
}
function Metric({ label, value, sub }) { return <article className="card metric"><small>{label}</small><strong>{value}</strong>{sub && <span>{sub}</span>}</article>; }
function Toolbar({ search, setSearch, children }) { return <div className="toolbar"><input placeholder="Zoeken..." value={search} onChange={e => setSearch(e.target.value)} /><div>{children}</div></div>; }

export default function App() {
  const [projects, setProjects] = useState(() => load("pm-projects-v1", seedProjects));
  const [employees, setEmployees] = useState(() => load("pm-employees-v1", seedEmployees));
  const [entries, setEntries] = useState(() => load("pm-entries-v1", seedEntries));
  const [view, setView] = useState("dashboard");
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Alle");
  const [projectModal, setProjectModal] = useState(false);
  const [employeeModal, setEmployeeModal] = useState(false);
  const [timeModal, setTimeModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selected, setSelected] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [invoiceReference, setInvoiceReference] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => localStorage.setItem("pm-projects-v1", JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem("pm-employees-v1", JSON.stringify(employees)), [employees]);
  useEffect(() => localStorage.setItem("pm-entries-v1", JSON.stringify(entries)), [entries]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(""), 2500); return () => clearTimeout(timer); }, [toast]);

  const projectById = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p])), [projects]);
  const employeeById = useMemo(() => Object.fromEntries(employees.map(e => [e.id, e])), [employees]);
  const projectHours = useMemo(() => entries.reduce((acc, e) => ({ ...acc, [e.projectId]: (acc[e.projectId] || 0) + Number(e.hours) }), {}), [entries]);
  const openEntries = entries.filter(e => e.billable && !e.invoiced);
  const metric = (invoiced, offset) => {
    const list = entries.filter(e => e.billable && Boolean(e.invoiced) === invoiced && inWeek(e.date, offset));
    return { hours: list.reduce((sum, e) => sum + Number(e.hours), 0), value: list.reduce((sum, e) => sum + Number(e.hours) * Number(projectById[e.projectId]?.hourlyRate || 0), 0) };
  };
  const selectedEntries = openEntries.filter(e => selected.includes(e.id));
  const selectedPerProject = Object.values(selectedEntries.reduce((acc, e) => {
    const project = projectById[e.projectId] || { code: "", name: "Onbekend project", hourlyRate: 0 };
    if (!acc[e.projectId]) acc[e.projectId] = { id: e.projectId, code: project.code, name: project.name, hours: 0, value: 0 };
    acc[e.projectId].hours += Number(e.hours);
    acc[e.projectId].value += Number(e.hours) * Number(project.hourlyRate || 0);
    return acc;
  }, {}));
  const selectedHours = selectedEntries.reduce((sum, e) => sum + Number(e.hours), 0);
  const selectedValue = selectedEntries.reduce((sum, e) => sum + Number(e.hours) * Number(projectById[e.projectId]?.hourlyRate || 0), 0);
  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
  const budgetHours = projects.reduce((sum, p) => sum + Number(p.budgetHours), 0);
  const openValue = openEntries.reduce((sum, e) => sum + Number(e.hours) * Number(projectById[e.projectId]?.hourlyRate || 0), 0);
  const rows = [...entries].filter(e => `${projectById[e.projectId]?.name || ""} ${employeeById[e.employeeId]?.name || ""} ${e.activity} ${e.description}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));

  const saveProject = data => { setProjects(list => editingProject ? list.map(p => p.id === editingProject.id ? { ...data, id: p.id } : p) : [...list, { ...data, id: uid("p") }]); setProjectModal(false); setEditingProject(null); setToast("Project opgeslagen"); };
  const saveEmployee = data => { setEmployees(list => editingEmployee ? list.map(e => e.id === editingEmployee.id ? { ...data, id: e.id } : e) : [...list, { ...data, id: uid("e") }]); setEmployeeModal(false); setEditingEmployee(null); setToast("Medewerker opgeslagen"); };
  const saveEntry = data => { setEntries(list => editingEntry ? list.map(e => e.id === editingEntry.id ? { ...data, id: e.id } : e) : [...list, { ...data, id: uid("t") }]); setTimeModal(false); setEditingEntry(null); setToast("Uren opgeslagen"); };
  const runInvoice = () => {
    if (!selected.length) return;
    setEntries(list => list.map(e => selected.includes(e.id) ? { ...e, invoiced: true, invoiceDate, invoiceReference: invoiceReference.trim() } : e));
    setSelected([]); setInvoiceReference(""); setToast("Geselecteerde uren zijn als gefactureerd gemarkeerd");
  };
  const download = (name, text, type) => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
  const exportCsv = () => {
    const data = [["Datum", "Van", "Tot", "Medewerker", "Projectcode", "Project", "Klant", "Activiteit", "Omschrijving", "Uren", "Factureerbaar", "Gefactureerd", "Factuurdatum", "Factuurreferentie", "Uurtarief", "Waarde"], ...entries.map(e => { const p = projectById[e.projectId] || {}; return [e.date, e.startTime, e.endTime, employeeById[e.employeeId]?.name || "", p.code, p.name, p.client, e.activity, e.description, e.hours, e.billable ? "Ja" : "Nee", e.invoiced ? "Ja" : "Nee", e.invoiceDate, e.invoiceReference, p.hourlyRate, e.billable ? Number(e.hours) * Number(p.hourlyRate || 0) : 0]; })];
    const csv = "\ufeff" + data.map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(";")).join("\n");
    download("urenregistratie.csv", csv, "text/csv;charset=utf-8");
  };

  const nav = [["dashboard", "Dashboard"], ["projects", "Projecten"], ["employees", "Medewerkers"], ["hours", "Urenregistratie"], ["invoicing", "Facturatie"], ["reports", "Rapportage"]];
  const chooseView = id => { setView(id); setSearch(""); setMobile(false); };
  const thisOpen = metric(false, 0), lastOpen = metric(false, -1), thisBilled = metric(true, 0), lastBilled = metric(true, -1);

  return <div className="app">
    <aside className={mobile ? "open" : ""}><div className="brand"><div className="apuLogo"><span>AP</span><i>u</i></div><div><b>APu Consultancy</b><small>Projecturen & facturatie</small></div><Button secondary icon onClick={() => setMobile(false)}>×</Button></div><nav>{nav.map(([id, label]) => <button key={id} className={view === id ? "active" : ""} onClick={() => chooseView(id)}>{label}</button>)}</nav></aside>
    <main><header className="top"><Button secondary icon onClick={() => setMobile(true)}>☰</Button><div><h1>{nav.find(n => n[0] === view)?.[1]}</h1><p>Projecten, medewerkers, uren en facturatie in één overzicht</p></div><Button onClick={() => { setEditingEntry(null); setTimeModal(true); }} disabled={!projects.length || !employees.length}>+ Uren schrijven</Button></header>
      <section className="content"><div className="apuIntro"><span>APu Consultancy</span><strong>Professioneel inzicht in projecten, uren en facturatie</strong></div>
        {view === "dashboard" && <><div className="metrics five"><Metric label="Niet gefactureerd totaal" value={fmtHours(openEntries.reduce((s, e) => s + Number(e.hours), 0))} sub={money(openValue)} /><Metric label="Niet gefactureerd deze week" value={fmtHours(thisOpen.hours)} sub={money(thisOpen.value)} /><Metric label="Niet gefactureerd vorige week" value={fmtHours(lastOpen.hours)} sub={money(lastOpen.value)} /><Metric label="Gefactureerd deze week" value={fmtHours(thisBilled.hours)} sub={money(thisBilled.value)} /><Metric label="Gefactureerd vorige week" value={fmtHours(lastBilled.hours)} sub={money(lastBilled.value)} /></div><div className="card"><div className="sectionHead"><div><h2>Nog te factureren uren</h2><p>Factureerbare uren die nog niet zijn verwerkt</p></div><Button onClick={() => setView("invoicing")}>Facturatieproces openen</Button></div>{openEntries.slice(0, 8).map(e => <div className="recent" key={e.id}><div><b>{projectById[e.projectId]?.name}</b><small>{employeeById[e.employeeId]?.name} · {e.activity}</small></div><span>{fmtDate(e.date)} · {e.startTime}-{e.endTime}</span><strong>{fmtHours(e.hours)}</strong></div>)}{!openEntries.length && <div className="empty">Geen niet-gefactureerde uren.</div>}</div></>}
        {view === "projects" && <><Toolbar search={search} setSearch={setSearch}><select value={status} onChange={e => setStatus(e.target.value)}><option>Alle</option>{STATUSSES.map(s => <option key={s}>{s}</option>)}</select><Button onClick={() => { setEditingProject(null); setProjectModal(true); }}>+ Nieuw project</Button></Toolbar><div className="grid">{projects.filter(p => (status === "Alle" || p.status === status) && `${p.code} ${p.name} ${p.client}`.toLowerCase().includes(search.toLowerCase())).map(p => { const used = projectHours[p.id] || 0; const pct = p.budgetHours ? Math.min(100, used / p.budgetHours * 100) : 0; return <article className="card" key={p.id}><div className="sectionHead"><div><small>{p.code}</small><h2>{p.name}</h2><p>{p.client}</p></div><span className="badge">{p.status}</span></div><p>{p.description}</p><div className="progressText"><span>{fmtHours(used)} besteed</span><span>{Math.round(pct)}%</span></div><div className="progress"><i style={{ width: `${pct}%` }} /></div><div className="actions"><Button secondary icon onClick={() => { setEditingProject(p); setProjectModal(true); }}>✎</Button><Button danger icon onClick={() => { if (entries.some(e => e.projectId === p.id)) return setToast("Project heeft uren en kan niet worden verwijderd"); setProjects(list => list.filter(x => x.id !== p.id)); }}>×</Button></div></article>; })}</div></>}
        {view === "employees" && <><Toolbar search={search} setSearch={setSearch}><Button onClick={() => { setEditingEmployee(null); setEmployeeModal(true); }}>+ Nieuwe medewerker</Button></Toolbar><div className="grid">{employees.filter(emp => `${emp.name} ${emp.email}`.toLowerCase().includes(search.toLowerCase())).map(emp => <article className="card" key={emp.id}><div className="sectionHead"><div><h2>{emp.name}</h2><p>{emp.email || "Geen e-mailadres"}</p></div><span className="badge">{emp.active ? "Actief" : "Inactief"}</span></div><p>{fmtHours(entries.filter(e => e.employeeId === emp.id).reduce((s, e) => s + Number(e.hours), 0))} geregistreerd</p><div className="actions"><Button secondary icon onClick={() => { setEditingEmployee(emp); setEmployeeModal(true); }}>✎</Button><Button danger icon onClick={() => { if (entries.some(e => e.employeeId === emp.id)) return setToast("Medewerker heeft uren en kan niet worden verwijderd"); setEmployees(list => list.filter(x => x.id !== emp.id)); }}>×</Button></div></article>)}</div></>}
        {view === "hours" && <><Toolbar search={search} setSearch={setSearch}><Button onClick={() => { setEditingEntry(null); setTimeModal(true); }}>+ Nieuwe boeking</Button></Toolbar><div className="tableWrap"><table><thead><tr>{["Datum", "Van-tot", "Medewerker", "Project", "Activiteit", "Uren", "Factuurstatus", "Waarde", ""].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(e => { const p = projectById[e.projectId]; return <tr key={e.id}><td>{fmtDate(e.date)}</td><td>{e.startTime}-{e.endTime}</td><td>{employeeById[e.employeeId]?.name}</td><td>{p?.name}</td><td>{e.activity}</td><td><b>{fmtHours(e.hours)}</b></td><td><span className="badge">{e.invoiced ? "Gefactureerd" : e.billable ? "Open" : "Niet factureerbaar"}</span></td><td>{e.billable ? money(Number(e.hours) * Number(p?.hourlyRate || 0)) : "-"}</td><td><div className="rowActions"><Button secondary icon onClick={() => { setEditingEntry(e); setTimeModal(true); }}>✎</Button><Button danger icon disabled={e.invoiced} onClick={() => setEntries(list => list.filter(x => x.id !== e.id))}>×</Button></div></td></tr>; })}</tbody></table></div></>}
        {view === "invoicing" && <><div className="card invoicePanel"><div className="sectionHead"><div><h2>Facturatieproces</h2><p>Selecteer open uren en markeer ze gezamenlijk als gefactureerd.</p></div></div><div className="formGrid"><Field label="Factuurdatum *"><input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></Field><Field label="Factuurreferentie"><input value={invoiceReference} onChange={e => setInvoiceReference(e.target.value)} placeholder="Bijvoorbeeld INV-2026-001" /></Field></div><div className="invoiceBar"><label><input type="checkbox" checked={openEntries.length > 0 && selected.length === openEntries.length} onChange={e => setSelected(e.target.checked ? openEntries.map(x => x.id) : [])} /> Alles selecteren</label><strong>{selected.length} regel(s) geselecteerd</strong><Button onClick={runInvoice} disabled={!selected.length}>Markeer als gefactureerd</Button></div><div className="selectionSummary"><div className="sectionHead"><div><h3>Geselecteerd voor facturatie per project</h3><p>Controleoverzicht van de huidige selectie</p></div><div className="grandTotal"><small>Totaal selectie</small><strong>{fmtHours(selectedHours)}</strong><b>{money(selectedValue)}</b></div></div>{selectedPerProject.length ? selectedPerProject.map(p => <div className="projectTotal" key={p.id}><div><b>{p.name}</b><small>{p.code}</small></div><strong>{fmtHours(p.hours)}</strong><span>{money(p.value)}</span></div>) : <div className="empty compact">Selecteer urenregels om de totalen per project te zien.</div>}</div></div><div className="tableWrap"><table><thead><tr>{["Selectie", "Datum", "Medewerker", "Project", "Van-tot", "Uren", "Waarde"].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{openEntries.map(e => { const p = projectById[e.projectId]; return <tr key={e.id}><td><input type="checkbox" checked={selected.includes(e.id)} onChange={event => setSelected(old => event.target.checked ? [...old, e.id] : old.filter(id => id !== e.id))} /></td><td>{fmtDate(e.date)}</td><td>{employeeById[e.employeeId]?.name}</td><td>{p?.name}</td><td>{e.startTime}-{e.endTime}</td><td><b>{fmtHours(e.hours)}</b></td><td>{money(Number(e.hours) * Number(p?.hourlyRate || 0))}</td></tr>; })}</tbody></table>{!openEntries.length && <div className="empty">Geen open factureerbare uren.</div>}</div></>}
        {view === "reports" && <><div className="metrics"><Metric label="Budgeturen" value={fmtHours(budgetHours)} /><Metric label="Geboekte uren" value={fmtHours(totalHours)} /><Metric label="Resterende uren" value={fmtHours(budgetHours - totalHours)} /><Metric label="Open factuurwaarde" value={money(openValue)} /></div><div className="card"><div className="sectionHead"><div><h2>Rapportage per medewerker</h2><p>Geregistreerde uren en factureerbare waarde</p></div><div><Button secondary onClick={exportCsv}>CSV-export</Button> <Button secondary onClick={() => download("projecturen-backup.json", JSON.stringify({ projects, employees, entries }, null, 2), "application/json")}>JSON-back-up</Button></div></div>{employees.map(emp => { const own = entries.filter(e => e.employeeId === emp.id); const h = own.reduce((s, e) => s + Number(e.hours), 0); const v = own.reduce((s, e) => s + (e.billable ? Number(e.hours) * Number(projectById[e.projectId]?.hourlyRate || 0) : 0), 0); return <div className="employeeTotal" key={emp.id}><b>{emp.name}</b><span>{fmtHours(h)}</span><strong>{money(v)}</strong></div>; })}</div></>}
      </section>
    </main>
    {projectModal && <Modal title={editingProject ? "Project bewerken" : "Nieuw project"} onClose={() => setProjectModal(false)}><ProjectForm initial={editingProject} onSave={saveProject} onCancel={() => setProjectModal(false)} /></Modal>}
    {employeeModal && <Modal title={editingEmployee ? "Medewerker bewerken" : "Nieuwe medewerker"} onClose={() => setEmployeeModal(false)}><EmployeeForm initial={editingEmployee} onSave={saveEmployee} onCancel={() => setEmployeeModal(false)} /></Modal>}
    {timeModal && <Modal title={editingEntry ? "Urenboeking bewerken" : "Uren schrijven"} onClose={() => setTimeModal(false)}><TimeForm projects={projects} employees={employees} initial={editingEntry} onSave={saveEntry} onCancel={() => setTimeModal(false)} /></Modal>}
    {toast && <div className="toast">✓ {toast}</div>}
  </div>;
}
