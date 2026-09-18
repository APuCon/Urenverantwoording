import React, { useEffect, useMemo, useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);
const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const fmtHours = value => `${Number(value || 0).toLocaleString('nl-NL', { maximumFractionDigits: 2 })} uur`;
const fmtMoney = value => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
const fmtDate = value => value ? new Intl.DateTimeFormat('nl-NL').format(new Date(`${value}T12:00:00`)) : '-';
const calcHours = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  return minutes > 0 ? Math.round(minutes / 60 * 100) / 100 : 0;
};
const weekStart = value => {
  const d = new Date(`${value}T12:00:00`);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
};
const inWeek = (value, offset) => {
  const actual = weekStart(value);
  const expected = weekStart(today());
  expected.setDate(expected.getDate() + offset * 7);
  return actual.getTime() === expected.getTime();
};
const initialData = {
  projects: [{ id:'p1', code:'PRJ-001', name:'ERP implementatie', client:'Demo klant', status:'Actief', budgetHours:240, hourlyRate:120, startDate:today(), endDate:'', description:'Implementatie en procesbegeleiding' }],
  employees: [{ id:'e1', name:'Alex Pullens', email:'alex@apuconsultancy.nl', active:true }],
  entries: []
};
const loadData = () => { try { return JSON.parse(localStorage.getItem('apu-secure-v3')) || initialData; } catch { return initialData; } };

function Button({ children, variant = 'primary', ...props }) { return <button className={`button ${variant}`} {...props}>{children}</button>; }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label>; }
function Modal({ title, onClose, children }) { return <div className="overlay"><div className="modal"><header><h2>{title}</h2><Button variant="secondary" onClick={onClose}>Sluiten</Button></header>{children}</div></div>; }
function Confirm({ text, onConfirm, onCancel }) { return <Modal title="Verwijderen bevestigen" onClose={onCancel}><p>{text}</p><div className="actions"><Button variant="secondary" onClick={onCancel}>Annuleren</Button><Button variant="danger" onClick={onConfirm}>Definitief verwijderen</Button></div></Modal>; }

function ProjectForm({ value, onSave, onCancel }) {
  const [form, setForm] = useState(value || { code:'', name:'', client:'', status:'Actief', budgetHours:0, hourlyRate:0, startDate:today(), endDate:'', description:'' });
  const set = (key, val) => setForm(old => ({ ...old, [key]: val }));
  return <form onSubmit={e => { e.preventDefault(); onSave({ ...form, budgetHours:Number(form.budgetHours), hourlyRate:Number(form.hourlyRate) }); }}>
    <div className="formGrid"><Field label="Projectcode *"><input required value={form.code} onChange={e=>set('code',e.target.value)} /></Field><Field label="Status"><select value={form.status} onChange={e=>set('status',e.target.value)}>{['Actief','On hold','Afgerond'].map(x=><option key={x}>{x}</option>)}</select></Field></div>
    <Field label="Projectnaam *"><input required value={form.name} onChange={e=>set('name',e.target.value)} /></Field>
    <Field label="Klant *"><input required value={form.client} onChange={e=>set('client',e.target.value)} /></Field>
    <div className="formGrid"><Field label="Budgeturen"><input type="number" min="0" step="0.25" value={form.budgetHours} onChange={e=>set('budgetHours',e.target.value)} /></Field><Field label="Uurtarief"><input type="number" min="0" step="0.01" value={form.hourlyRate} onChange={e=>set('hourlyRate',e.target.value)} /></Field><Field label="Startdatum"><input type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} /></Field><Field label="Einddatum"><input type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} /></Field></div>
    <Field label="Omschrijving"><textarea value={form.description} onChange={e=>set('description',e.target.value)} /></Field>
    <div className="actions"><Button type="button" variant="secondary" onClick={onCancel}>Annuleren</Button><Button type="submit">Opslaan</Button></div>
  </form>;
}

function EmployeeForm({ value, onSave, onCancel }) {
  const [form, setForm] = useState(value || { name:'', email:'', active:true });
  return <form onSubmit={e=>{e.preventDefault();onSave(form)}}>
    <Field label="Naam *"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></Field>
    <Field label="E-mailadres"><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></Field>
    <label className="checkbox"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Actieve medewerker</label>
    <div className="actions"><Button type="button" variant="secondary" onClick={onCancel}>Annuleren</Button><Button type="submit">Opslaan</Button></div>
  </form>;
}

function TimeForm({ value, projects, employees, onSave, onCancel }) {
  const [form, setForm] = useState(value || { projectId:projects[0]?.id||'', employeeId:employees.find(x=>x.active)?.id||'', date:today(), startTime:'08:30', endTime:'17:00', hours:8.5, activity:'Werkzaamheden', description:'', billable:true, invoiced:false, invoiceDate:'', invoiceReference:'' });
  const [error, setError] = useState('');
  const set = (key, val) => setForm(old => { const next={...old,[key]:val}; if(key==='startTime'||key==='endTime') next.hours=calcHours(next.startTime,next.endTime); return next; });
  return <form onSubmit={e=>{e.preventDefault();const hours=calcHours(form.startTime,form.endTime);if(hours<=0){setError('De tot-tijd moet later zijn dan de van-tijd.');return;}onSave({...form,hours});}}>
    <Field label="Project *"><select required value={form.projectId} onChange={e=>set('projectId',e.target.value)}>{projects.filter(x=>x.status!=='Afgerond'||x.id===form.projectId).map(x=><option key={x.id} value={x.id}>{x.code} - {x.name}</option>)}</select></Field>
    <Field label="Medewerker *"><select required value={form.employeeId} onChange={e=>set('employeeId',e.target.value)}>{employees.filter(x=>x.active||x.id===form.employeeId).map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
    <div className="formGrid"><Field label="Datum"><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></Field><Field label="Van"><input type="time" value={form.startTime} onChange={e=>set('startTime',e.target.value)} /></Field><Field label="Tot"><input type="time" value={form.endTime} onChange={e=>set('endTime',e.target.value)} /></Field><Field label="Berekende uren"><div className="calculated">{fmtHours(form.hours)}</div></Field></div>
    <Field label="Activiteit"><input value={form.activity} onChange={e=>set('activity',e.target.value)} /></Field>
    <Field label="Omschrijving"><textarea value={form.description} onChange={e=>set('description',e.target.value)} /></Field>
    <label className="checkbox"><input type="checkbox" disabled={form.invoiced} checked={form.billable} onChange={e=>set('billable',e.target.checked)} /> Factureerbaar</label>
    {form.invoiced && <p className="notice">Deze urenregel is gefactureerd. De facturatiestatus blijft behouden.</p>}
    {error && <p className="error">{error}</p>}
    <div className="actions"><Button type="button" variant="secondary" onClick={onCancel}>Annuleren</Button><Button type="submit">Opslaan</Button></div>
  </form>;
}

export default function App() {
  const [auth, setAuth] = useState({ loading:true, user:null });
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('Dashboard');
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [invoiceReference, setInvoiceReference] = useState('');
  const [toast, setToast] = useState('');
  const powerBiUrl = import.meta.env.VITE_POWER_BI_REPORT_URL || '';

  useEffect(()=>{fetch('/.auth/me').then(r=>r.json()).then(x=>setAuth({loading:false,user:x.clientPrincipal||null})).catch(()=>setAuth({loading:false,user:null}));},[]);
  useEffect(()=>{localStorage.setItem('apu-secure-v3',JSON.stringify(data));},[data]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),2500);return()=>clearTimeout(timer);},[toast]);

  const projectById = useMemo(()=>Object.fromEntries(data.projects.map(x=>[x.id,x])),[data.projects]);
  const employeeById = useMemo(()=>Object.fromEntries(data.employees.map(x=>[x.id,x])),[data.employees]);
  const openEntries = data.entries.filter(x=>x.billable&&!x.invoiced);
  const selectedEntries = openEntries.filter(x=>selected.includes(x.id));
  const selectedGroups = Object.values(selectedEntries.reduce((acc,x)=>{const p=projectById[x.projectId];if(!acc[x.projectId])acc[x.projectId]={id:x.projectId,code:p?.code,name:p?.name,hours:0,value:0};acc[x.projectId].hours+=Number(x.hours);acc[x.projectId].value+=Number(x.hours)*Number(p?.hourlyRate||0);return acc;},{}));
  const metrics = (invoiced, offset) => { const rows=data.entries.filter(x=>x.billable&&Boolean(x.invoiced)===invoiced&&inWeek(x.date,offset)); return {hours:rows.reduce((s,x)=>s+Number(x.hours),0),value:rows.reduce((s,x)=>s+Number(x.hours)*Number(projectById[x.projectId]?.hourlyRate||0),0)}; };

  if (auth.loading) {
  return ...
}

if (!auth.user) {
  return ...
}

const allowedUsers = [
  "a.pullens@apuconsultancy.nl"
];

const currentUser =
  auth?.user?.userDetails?.toLowerCase() || "";

if (
  auth.user &&
  !allowedUsers.includes(currentUser)
) {
  return (
    <div className="login">
      <div>
        <h1>Toegang geweigerd</h1>
        <p>
          Uw account heeft geen toegang tot deze applicatie.
        </p>
        <a
          href="/.auth/logout?post_logout_redirect_uri=/"
          className/div>
    </div>
  );
}

return (
  <div className="app">


  const saveItem = item => {
    const { type, value } = editor;
    setData(old=>({...old,[type]:value?old[type].map(x=>x.id===value.id?{...item,id:value.id}:x):[...old[type],{...item,id:uid(type[0])}]}));
    setEditor(null);setToast('Wijzigingen opgeslagen');
  };
  const requestDelete = (type,item) => {
    if(type==='projects'&&data.entries.some(x=>x.projectId===item.id)) return setToast('Project heeft uren en kan niet worden verwijderd.');
    if(type==='employees'&&data.entries.some(x=>x.employeeId===item.id)) return setToast('Medewerker heeft uren en kan niet worden verwijderd.');
    if(type==='entries'&&item.invoiced) return setToast('Gefactureerde uren kunnen niet worden verwijderd.');
    setDeleting({type,item});
  };
  const confirmDelete = () => { setData(old=>({...old,[deleting.type]:old[deleting.type].filter(x=>x.id!==deleting.item.id)}));setDeleting(null);setToast('Item verwijderd'); };
  const runInvoice = () => { setData(old=>({...old,entries:old.entries.map(x=>selected.includes(x.id)?{...x,invoiced:true,invoiceDate,invoiceReference}:x)}));setSelected([]);setInvoiceReference('');setToast('Uren gemarkeerd als gefactureerd'); };
  const nav=['Dashboard','Projecten','Medewerkers','Urenregistratie','Facturatie','Rapportage','Power BI'];
  const openThis=metrics(false,0),openLast=metrics(false,-1),billedThis=metrics(true,0),billedLast=metrics(true,-1);
  const cards=[['Niet gefactureerd totaal',openEntries.reduce((s,x)=>s+Number(x.hours),0),openEntries.reduce((s,x)=>s+Number(x.hours)*Number(projectById[x.projectId]?.hourlyRate||0),0)],['Niet gefactureerd deze week',openThis.hours,openThis.value],['Niet gefactureerd vorige week',openLast.hours,openLast.value],['Gefactureerd deze week',billedThis.hours,billedThis.value],['Gefactureerd vorige week',billedLast.hours,billedLast.value]];

  return <div className="app"><aside><img src="/apu-logo.jpg" alt="APu Consultancy"/><nav>{nav.map(x=><button key={x} className={view===x?'active':''} onClick={()=>setView(x)}>{x}</button>)}</nav><a className="logout" href="/.auth/logout?post_logout_redirect_uri=/">Uitloggen</a></aside><main><header><div><h1>{view}</h1><small>Ingelogd als {auth.user.userDetails}</small></div><Button onClick={()=>setEditor({type:'entries',value:null})}>+ Uren schrijven</Button></header><section>
    {view==='Dashboard'&&<><div className="metrics">{cards.map(x=><article key={x[0]}><small>{x[0]}</small><strong>{fmtHours(x[1])}</strong><span>{fmtMoney(x[2])}</span></article>)}</div><Panel title="Nog te factureren uren">{openEntries.map(x=><p key={x.id}>{fmtDate(x.date)} · {employeeById[x.employeeId]?.name} · {projectById[x.projectId]?.name}<b>{fmtHours(x.hours)}</b></p>)}</Panel></>}
    {view==='Projecten'&&<CrudList title="Projecten" onAdd={()=>setEditor({type:'projects',value:null})}>{data.projects.map(x=><CrudCard key={x.id} title={x.name} text={`${x.code} · ${x.client} · ${x.status}`} onEdit={()=>setEditor({type:'projects',value:x})} onDelete={()=>requestDelete('projects',x)}/>)}</CrudList>}
    {view==='Medewerkers'&&<CrudList title="Medewerkers" onAdd={()=>setEditor({type:'employees',value:null})}>{data.employees.map(x=><CrudCard key={x.id} title={x.name} text={`${x.email||'Geen e-mail'} · ${x.active?'Actief':'Inactief'}`} onEdit={()=>setEditor({type:'employees',value:x})} onDelete={()=>requestDelete('employees',x)}/>)}</CrudList>}
    {view==='Urenregistratie'&&<div className="tableWrap"><table><thead><tr><th>Datum</th><th>Medewerker</th><th>Project</th><th>Tijd</th><th>Uren</th><th>Status</th><th>Acties</th></tr></thead><tbody>{data.entries.map(x=><tr key={x.id}><td>{fmtDate(x.date)}</td><td>{employeeById[x.employeeId]?.name}</td><td>{projectById[x.projectId]?.name}</td><td>{x.startTime}-{x.endTime}</td><td>{fmtHours(x.hours)}</td><td>{x.invoiced?'Gefactureerd':x.billable?'Open':'Niet factureerbaar'}</td><td><Button variant="secondary" onClick={()=>setEditor({type:'entries',value:x})}>Bewerken</Button> <Button variant="danger" disabled={x.invoiced} onClick={()=>requestDelete('entries',x)}>Verwijderen</Button></td></tr>)}</tbody></table></div>}
    {view==='Facturatie'&&<><Panel title="Facturatieproces"><div className="formGrid"><Field label="Factuurdatum"><input type="date" value={invoiceDate} onChange={e=>setInvoiceDate(e.target.value)}/></Field><Field label="Factuurreferentie"><input value={invoiceReference} onChange={e=>setInvoiceReference(e.target.value)}/></Field></div><label className="checkbox"><input type="checkbox" checked={openEntries.length>0&&selected.length===openEntries.length} onChange={e=>setSelected(e.target.checked?openEntries.map(x=>x.id):[])}/> Alles selecteren</label><h3>Geselecteerd per project</h3>{selectedGroups.map(x=><p key={x.id}>{x.code} · {x.name}<b>{fmtHours(x.hours)} · {fmtMoney(x.value)}</b></p>)}<h3>Totaal: {fmtHours(selectedEntries.reduce((s,x)=>s+Number(x.hours),0))} · {fmtMoney(selectedEntries.reduce((s,x)=>s+Number(x.hours)*Number(projectById[x.projectId]?.hourlyRate||0),0))}</h3><Button disabled={!selected.length} onClick={runInvoice}>Markeer als gefactureerd</Button></Panel><Panel title="Open urenregels">{openEntries.map(x=><p key={x.id}><label><input type="checkbox" checked={selected.includes(x.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,x.id]:old.filter(id=>id!==x.id))}/>{fmtDate(x.date)} · {employeeById[x.employeeId]?.name} · {projectById[x.projectId]?.name}</label><b>{fmtHours(x.hours)}</b></p>)}</Panel></>}
    {view==='Rapportage'&&<Panel title="Uren per medewerker">{data.employees.map(m=><p key={m.id}>{m.name}<b>{fmtHours(data.entries.filter(x=>x.employeeId===m.id).reduce((s,x)=>s+Number(x.hours),0))}</b></p>)}</Panel>}
    {view==='Power BI'&&<Panel title="Power BI-rapportage">{powerBiUrl?<iframe title="Power BI" src={powerBiUrl} allowFullScreen/>:<p>Configureer VITE_POWER_BI_REPORT_URL in Azure om het rapport te tonen.</p>}</Panel>}
  </section></main>
  {editor&&<Modal title={editor.value?'Bewerken':'Nieuw'} onClose={()=>setEditor(null)}>{editor.type==='projects'&&<ProjectForm value={editor.value} onSave={saveItem} onCancel={()=>setEditor(null)}/>} {editor.type==='employees'&&<EmployeeForm value={editor.value} onSave={saveItem} onCancel={()=>setEditor(null)}/>} {editor.type==='entries'&&<TimeForm value={editor.value} projects={data.projects} employees={data.employees} onSave={saveItem} onCancel={()=>setEditor(null)}/>}</Modal>}
  {deleting&&<Confirm text={`Weet u zeker dat u '${deleting.item.name||deleting.item.activity||'deze urenregel'}' wilt verwijderen?`} onConfirm={confirmDelete} onCancel={()=>setDeleting(null)}/>} {toast&&<div className="toast">{toast}</div>}</div>;
}
function Panel({title,children}){return <div className="panel"><h2>{title}</h2>{children}</div>}
function CrudList({title,onAdd,children}){return <><div className="listHead"><h2>{title}</h2><Button onClick={onAdd}>+ Nieuw</Button></div><div className="grid">{children}</div></>}
function CrudCard({title,text,onEdit,onDelete}){return <article><h2>{title}</h2><p>{text}</p><div className="cardActions"><Button variant="secondary" onClick={onEdit}>Bewerken</Button><Button variant="danger" onClick={onDelete}>Verwijderen</Button></div></article>}
