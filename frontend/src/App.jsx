
import { useEffect, useMemo, useState } from 'react';
import { db, auth } from './firebase';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';

const emptyForm = {
  senderName: '',
  receiverName: '',
  destination: '',
  weightKg: '',
  dimensions: ''
};

function formatCreatedAt(value) {
  if (!value) return 'Date not recorded';

  let date;

  // Firestore Timestamp
  if (typeof value.toDate === 'function') {
    date = value.toDate();
  }
  // Java LocalDateTime stored as an object
  else if (
    typeof value.year === 'number' &&
    typeof value.monthValue === 'number' &&
    typeof value.dayOfMonth === 'number'
  ) {
    date = new Date(
      value.year,
      value.monthValue - 1,
      value.dayOfMonth,
      value.hour || 0,
      value.minute || 0,
      value.second || 0,
      Math.floor((value.nano || 0) / 1000000)
    );
  }
  // Timestamp-like object
  else if (typeof value.seconds === 'number') {
    date = new Date(value.seconds * 1000);
  }
  // ISO date string or number
  else if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    date = new Date(value);
  } else {
    return 'Date not recorded';
  }

  if (Number.isNaN(date.getTime())) {
    return 'Date not recorded';
  }

  return date.toLocaleString('en-IN');
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword('');
      setMessage('Login successful.');
    } catch (error) {
      setMessage(`Login failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setPackages([]);
      setMessage('Logged out successfully.');
    } catch (error) {
      setMessage(`Logout failed: ${error.message}`);
    }
  }

  async function loadPackages() {
    try {
      const snapshot = await getDocs(collection(db, 'packages'));

      const data = snapshot.docs.map(packageDoc => ({
        ...packageDoc.data(),
        id: packageDoc.id
      }));

      data.sort((a, b) => {
        const first = a.createdAt?.seconds
          ?? a.createdAt?.year
          ?? 0;
        const second = b.createdAt?.seconds
          ?? b.createdAt?.year
          ?? 0;

        return second - first;
      });

      setPackages(data);
    } catch (error) {
      setMessage(`Could not load packages: ${error.message}`);
    }
  }

  useEffect(() => {
    if (user) {
      loadPackages();
    } else {
      setPackages([]);
    }
  }, [user]);

  const summary = useMemo(() => ({
    total: packages.length,
    registered: packages.filter(
      item => item.status === 'REGISTERED'
    ).length,
    stored: packages.filter(
      item => item.status === 'STORED'
    ).length,
    dispatched: packages.filter(
      item => item.status === 'DISPATCHED'
    ).length
  }), [packages]);

  const visiblePackages = packages.filter(item =>
    [
      item.trackingId,
      item.senderName,
      item.receiverName,
      item.destination,
      item.status
    ].some(value =>
      String(value ?? '')
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  function updateForm(event) {
    setForm(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  }

  async function registerPackage(event) {
    event.preventDefault();

    if (!user) {
      setMessage('Please login first.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const trackingId =
        `PKG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      await addDoc(collection(db, 'packages'), {
        trackingId,
        senderName: form.senderName.trim(),
        receiverName: form.receiverName.trim(),
        destination: form.destination.trim(),
        weightKg: Number(form.weightKg),
        dimensions: form.dimensions.trim(),
        status: 'REGISTERED',
        createdAt: serverTimestamp(),
        registeredBy: user.uid
      });

      setForm(emptyForm);
      setMessage(`Package registered. Tracking ID: ${trackingId}`);

      await loadPackages();
    } catch (error) {
      setMessage(`Registration failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(item, action) {
    if (!user) {
      setMessage('Please login first.');
      return;
    }

    const newStatus =
      action === 'dispatch' ? 'DISPATCHED' : 'STORED';

    setMessage('');

    try {
      const updates = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      if (action === 'dispatch') {
        updates.dispatchedAt = serverTimestamp();
      }

      await updateDoc(doc(db, 'packages', item.id), updates);

      setMessage(
        `${item.trackingId} status updated to ${newStatus}.`
      );

      await loadPackages();
    } catch (error) {
      setMessage(`Status update failed: ${error.message}`);
    }
  }

  if (authLoading) {
    return (
      <main className="container">
        <p>Checking login...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container">
        <section className="panel">
          <h1>Warehouse Login</h1>

          <p className="muted">
            Login using your Firebase Email/Password account.
          </p>

          {message && (
            <div className="message" role="status">
              {message}
            </div>
          )}

          <form onSubmit={login} className="form-grid">
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
              />
            </label>

            <div className="form-action">
              <button type="submit" disabled={busy}>
                {busy ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="eyebrow">LOGISTICS OPERATIONS</p>
          <h1>Warehouse &amp; Package Management</h1>
          <p className="muted">
            Register, store, search and dispatch parcels.
          </p>
          <p className="muted">Logged in: {user.email}</p>
        </div>

        <div>
          <span className="role">Member 3</span>{' '}
          <button type="button" onClick={logout}>Logout</button>
        </div>
      </header>

      {message && (
        <div className="message" role="status">{message}</div>
      )}

      <section className="stats">
        <Stat title="Total Packages" value={summary.total} />
        <Stat title="Registered" value={summary.registered} />
        <Stat title="Stored" value={summary.stored} />
        <Stat title="Dispatched" value={summary.dispatched} />
      </section>

      <section className="panel">
        <h2>Register Package</h2>

        <form onSubmit={registerPackage} className="form-grid">
          <label>
            Sender name
            <input
              name="senderName"
              value={form.senderName}
              onChange={updateForm}
              required
            />
          </label>

          <label>
            Receiver name
            <input
              name="receiverName"
              value={form.receiverName}
              onChange={updateForm}
              required
            />
          </label>

          <label>
            Destination
            <input
              name="destination"
              value={form.destination}
              onChange={updateForm}
              required
            />
          </label>

          <label>
            Weight (kg)
            <input
              name="weightKg"
              type="number"
              min="0.01"
              step="0.01"
              value={form.weightKg}
              onChange={updateForm}
              required
            />
          </label>

          <label>
            Dimensions (L × W × H)
            <input
              name="dimensions"
              placeholder="e.g. 20 x 15 x 10 cm"
              value={form.dimensions}
              onChange={updateForm}
              required
            />
          </label>

          <div className="form-action">
            <button type="submit" disabled={busy}>
              {busy ? 'Saving...' : 'Register package'}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="list-heading">
          <div>
            <h2>Warehouse Packages</h2>
            <p className="muted">
              Search by tracking ID, name, destination or status.
            </p>
          </div>

          <input
            className="search"
            placeholder="Search packages..."
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Sender / Receiver</th>
                <th>Destination</th>
                <th>Weight</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visiblePackages.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.trackingId || item.id}</strong>
                    <small>
                      Created: {formatCreatedAt(item.createdAt)}
                    </small>
                  </td>

                  <td>
                    {item.senderName || '—'}
                    <small>To: {item.receiverName || '—'}</small>
                  </td>

                  <td>{item.destination || '—'}</td>

                  <td>
                    {item.weightKg ?? '—'} kg
                    <small>{item.dimensions || '—'}</small>
                  </td>

                  <td>
                    <span
                      className={`status ${String(
                        item.status || ''
                      ).toLowerCase()}`}
                    >
                      {item.status || 'UNKNOWN'}
                    </span>
                  </td>

                  <td className="actions">
                    {item.status === 'REGISTERED' && (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => updateStatus(item, 'store')}
                      >
                        Mark stored
                      </button>
                    )}

                    {item.status !== 'DISPATCHED' && (
                      <button
                        type="button"
                        onClick={() => updateStatus(item, 'dispatch')}
                      >
                        Dispatch
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {visiblePackages.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty">
                    No packages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer>
        Warehouse &amp; Package Management · React + Firebase Firestore
      </footer>
    </main>
  );
}

function Stat({ title, value }) {
  return (
    <article className="stat">
      <p>{title}</p>
      <strong>{value}</strong>
    </article>
  );
}
