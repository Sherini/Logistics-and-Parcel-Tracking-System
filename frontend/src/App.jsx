import { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:8080/api/packages';
const emptyForm = { senderName: '', receiverName: '', destination: '', weightKg: '', dimensions: '' };

export default function App() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadPackages() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error('Could not load packages');
      setPackages(await response.json());
    } catch {
      setMessage('Backend connect avvaledu. Spring Boot and PostgreSQL running unnayo check cheyyi.');
    }
  }

  useEffect(() => { loadPackages(); }, []);

  const summary = useMemo(() => ({
    total: packages.length,
    registered: packages.filter(p => p.status === 'REGISTERED').length,
    stored: packages.filter(p => p.status === 'STORED').length,
    dispatched: packages.filter(p => p.status === 'DISPATCHED').length
  }), [packages]);

  const visiblePackages = packages.filter(p =>
    [p.trackingId, p.senderName, p.receiverName, p.destination, p.status]
      .some(value => String(value ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function registerPackage(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, weightKg: Number(form.weightKg) })
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || 'Registration failed. Check all fields.');
      }
      const created = await response.json();
      setForm(emptyForm);
      setMessage(`Package registered. Tracking ID: ${created.trackingId}`);
      await loadPackages();
    } catch (error) {
      setMessage(error.message || 'Package registration failed.');
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(item, action) {
    setMessage('');
    try {
      const response = await fetch(`${API}/${item.id}/${action}`, { method: 'PATCH' });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || 'Status update failed');
      }
      setMessage(action === 'dispatch' ? `${item.trackingId} dispatched.` : `${item.trackingId} marked as stored.`);
      await loadPackages();
    } catch (error) {
      setMessage(error.message || 'Status update failed.');
    }
  }

  return <main className="container">
    <header className="header">
      <div><p className="eyebrow">LOGISTICS OPERATIONS</p><h1>Warehouse & Package Management</h1><p className="muted">Register, store, search and dispatch parcels.</p></div>
      <span className="role">Member 3</span>
    </header>

    {message && <div className="message" role="status">{message}</div>}

    <section className="stats">
      <Stat title="Total Packages" value={summary.total} />
      <Stat title="Registered" value={summary.registered} />
      <Stat title="Stored" value={summary.stored} />
      <Stat title="Dispatched" value={summary.dispatched} />
    </section>

    <section className="panel">
      <h2>Register Package</h2>
      <form onSubmit={registerPackage} className="form-grid">
        <label>Sender name<input name="senderName" value={form.senderName} onChange={updateForm} required /></label>
        <label>Receiver name<input name="receiverName" value={form.receiverName} onChange={updateForm} required /></label>
        <label>Destination<input name="destination" value={form.destination} onChange={updateForm} required /></label>
        <label>Weight (kg)<input name="weightKg" type="number" min="0.01" step="0.01" value={form.weightKg} onChange={updateForm} required /></label>
        <label>Dimensions (L × W × H)<input name="dimensions" placeholder="e.g. 20 x 15 x 10 cm" value={form.dimensions} onChange={updateForm} required /></label>
        <div className="form-action"><button disabled={busy}>{busy ? 'Saving...' : 'Register package'}</button></div>
      </form>
    </section>

    <section className="panel">
      <div className="list-heading"><div><h2>Warehouse Packages</h2><p className="muted">Search by tracking ID, name, destination or status.</p></div><input className="search" placeholder="Search packages..." value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className="table-wrap"><table>
        <thead><tr><th>Tracking ID</th><th>Sender / Receiver</th><th>Destination</th><th>Weight</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{visiblePackages.map(item => <tr key={item.id}>
          <td><strong>{item.trackingId}</strong><small>Created: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</small></td>
          <td>{item.senderName}<small>To: {item.receiverName}</small></td>
          <td>{item.destination}</td><td>{item.weightKg} kg<small>{item.dimensions}</small></td>
          <td><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span></td>
          <td className="actions">
            {item.status === 'REGISTERED' && <button className="secondary" onClick={() => updateStatus(item, 'store')}>Mark stored</button>}
            {item.status !== 'DISPATCHED' && <button onClick={() => updateStatus(item, 'dispatch')}>Dispatch</button>}
          </td>
        </tr>)}
        {visiblePackages.length === 0 && <tr><td colSpan="6" className="empty">No packages found.</td></tr>}</tbody>
      </table></div>
    </section>
    <footer>Warehouse module starter · React + Spring Boot + PostgreSQL</footer>
  </main>;
}

function Stat({ title, value }) {
  return <article className="stat"><p>{title}</p><strong>{value}</strong></article>;
}