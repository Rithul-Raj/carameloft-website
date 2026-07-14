import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import defaultRajapuramCakes from '../data/cakesData.json';
import defaultMangaloreCakes from '../data/mangaloreCakesData.json';
import {
    LogOut, Plus, Pencil, Trash2, Save, X, Upload, Eye,
    ChevronDown, ShieldCheck, Key, LayoutDashboard, CheckCircle, AlertCircle,
    Cake, IndianRupee, Tag, FileText, Image as ImageIcon, Star
} from 'lucide-react';

// ─── Helpers ───────────────────────────────────────────────────────────────
const STORES = {
    rajapuram: { key: 'carameloft_rajapuram_cakes', label: 'Rajapuram', default: defaultRajapuramCakes, categories: ['premium', 'budget', 'crown'] },
    mangalore: { key: 'carameloft_mangalore_cakes', label: 'Mangalore', default: defaultMangaloreCakes, categories: ['classic', 'premium'] }
};

const loadStoreData = (storeId) => {
    try {
        const stored = localStorage.getItem(STORES[storeId].key);
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [...STORES[storeId].default];
};

const saveStoreData = (storeId, data) => {
    localStorage.setItem(STORES[storeId].key, JSON.stringify(data));
};

const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const emptyForm = (storeId) => ({
    id: '',
    name: '',
    price: '',
    originalPrice: '',
    rating: 5,
    category: STORES[storeId].categories[0],
    description: '',
    image: '',
    highlights: ['', '', '']
});

// ─── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
    if (!toast) return null;
    return (
        <div className={`admin-toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {toast.message}
        </div>
    );
};

// ─── Confirm Dialog ─────────────────────────────────────────────────────────
const ConfirmDialog = ({ open, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="admin-overlay" onClick={onCancel}>
            <div className="admin-confirm-dialog" onClick={e => e.stopPropagation()}>
                <p>{message}</p>
                <div className="admin-confirm-actions">
                    <button className="admin-btn admin-btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className="admin-btn admin-btn-danger" onClick={onConfirm}>Delete</button>
                </div>
            </div>
        </div>
    );
};

// ─── Image Uploader ─────────────────────────────────────────────────────────
const ImageUploader = ({ value, onChange }) => {
    const fileRef = useRef();
    const [dragOver, setDragOver] = useState(false);
    const [preview, setPreview] = useState(value || '');

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setPreview(dataUrl);
            onChange(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    return (
        <div className="admin-form-group">
            <label className="admin-form-label"><ImageIcon size={16} /> Cake Image</label>
            <div
                className={`admin-image-drop ${dragOver ? 'drop-active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
            >
                {preview ? (
                    <img src={preview} alt="preview" className="admin-img-preview" />
                ) : (
                    <div className="admin-drop-placeholder">
                        <Upload size={32} />
                        <span>Drag & drop or click to upload</span>
                        <small>PNG, JPG, WEBP supported</small>
                    </div>
                )}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFile(e.target.files[0])}
                />
            </div>
            {/* Also allow manual path entry */}
            <input
                type="text"
                className="admin-form-input"
                placeholder="Or enter image path (e.g. /assets/cakes/mango.jpg)"
                value={preview.startsWith('data:') ? '' : preview}
                onChange={(e) => { setPreview(e.target.value); onChange(e.target.value); }}
                style={{ marginTop: '8px' }}
            />
        </div>
    );
};

// ─── Cake Form (Add / Edit) ─────────────────────────────────────────────────
const CakeForm = ({ storeId, cake, onSave, onCancel }) => {
    const isEdit = !!cake?.id;
    const [form, setForm] = useState(() => {
        if (isEdit) {
            return { ...cake, highlights: [...(cake.highlights || ['', '', ''])] };
        }
        return emptyForm(storeId);
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price required';
        if (!form.description.trim()) e.description = 'Description is required';
        return e;
    };

    const handleHighlight = (i, val) => {
        const h = [...form.highlights];
        h[i] = val;
        setForm(f => ({ ...f, highlights: h }));
    };

    const addHighlight = () => setForm(f => ({ ...f, highlights: [...f.highlights, ''] }));
    const removeHighlight = (i) => setForm(f => ({ ...f, highlights: f.highlights.filter((_, idx) => idx !== i) }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        const saved = {
            ...form,
            id: isEdit ? form.id : generateId(storeId === 'rajapuram' ? 'r' : 'm'),
            price: Number(form.price),
            originalPrice: Number(form.originalPrice) || Number(form.price),
            rating: Number(form.rating),
            highlights: form.highlights.filter(h => h.trim())
        };
        onSave(saved);
    };

    const cats = STORES[storeId].categories;

    return (
        <div className="admin-overlay" onClick={onCancel}>
            <div className="admin-form-modal" onClick={e => e.stopPropagation()}>
                <div className="admin-form-modal-header">
                    <h2>{isEdit ? '✏️ Edit Cake' : '➕ Add New Cake'}</h2>
                    <button className="admin-icon-btn" onClick={onCancel}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="admin-cake-form">
                    <div className="admin-form-grid">
                        {/* Name */}
                        <div className="admin-form-group admin-full-width">
                            <label className="admin-form-label"><Cake size={16} /> Cake Name *</label>
                            <input
                                className={`admin-form-input ${errors.name ? 'input-error' : ''}`}
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Blueberry Cake"
                            />
                            {errors.name && <span className="admin-field-error">{errors.name}</span>}
                        </div>

                        {/* Price */}
                        <div className="admin-form-group">
                            <label className="admin-form-label"><IndianRupee size={16} /> Price (₹) *</label>
                            <input
                                className={`admin-form-input ${errors.price ? 'input-error' : ''}`}
                                type="number"
                                value={form.price}
                                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                placeholder="1100"
                            />
                            {errors.price && <span className="admin-field-error">{errors.price}</span>}
                        </div>

                        {/* Original Price */}
                        <div className="admin-form-group">
                            <label className="admin-form-label"><IndianRupee size={16} /> Original Price (₹)</label>
                            <input
                                className="admin-form-input"
                                type="number"
                                value={form.originalPrice}
                                onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                                placeholder="1200"
                            />
                        </div>

                        {/* Category */}
                        <div className="admin-form-group">
                            <label className="admin-form-label"><Tag size={16} /> Category *</label>
                            <select
                                className="admin-form-input"
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            >
                                {cats.map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating */}
                        <div className="admin-form-group">
                            <label className="admin-form-label"><Star size={16} /> Rating (1-5)</label>
                            <select
                                className="admin-form-input"
                                value={form.rating}
                                onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                            >
                                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} ⭐</option>)}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="admin-form-group admin-full-width">
                            <label className="admin-form-label"><FileText size={16} /> Description *</label>
                            <textarea
                                className={`admin-form-input admin-textarea ${errors.description ? 'input-error' : ''}`}
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Short description of the cake..."
                                rows={3}
                            />
                            {errors.description && <span className="admin-field-error">{errors.description}</span>}
                        </div>

                        {/* Image */}
                        <div className="admin-form-group admin-full-width">
                            <ImageUploader
                                value={form.image}
                                onChange={(val) => setForm(f => ({ ...f, image: val }))}
                            />
                        </div>

                        {/* Highlights */}
                        <div className="admin-form-group admin-full-width">
                            <label className="admin-form-label">✨ Highlights</label>
                            {form.highlights.map((h, i) => (
                                <div key={i} className="admin-highlight-row">
                                    <input
                                        className="admin-form-input"
                                        value={h}
                                        onChange={e => handleHighlight(i, e.target.value)}
                                        placeholder={`e.g. 🍫 Dark Chocolate Ganache`}
                                    />
                                    <button type="button" className="admin-icon-btn admin-icon-btn-danger" onClick={() => removeHighlight(i)}>
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="admin-btn admin-btn-ghost admin-add-highlight-btn" onClick={addHighlight}>
                                <Plus size={16} /> Add Highlight
                            </button>
                        </div>
                    </div>

                    <div className="admin-form-actions">
                        <button type="button" className="admin-btn admin-btn-ghost" onClick={onCancel}>
                            <X size={16} /> Cancel
                        </button>
                        <button type="submit" className="admin-btn admin-btn-gold">
                            <Save size={16} /> {isEdit ? 'Save Changes' : 'Add Cake'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Cake Table ─────────────────────────────────────────────────────────────
const CakeTable = ({ cakes, onEdit, onDelete }) => (
    <div className="admin-table-wrapper">
        {cakes.length === 0 ? (
            <div className="admin-empty-state">
                <Cake size={48} />
                <p>No cakes yet. Add your first cake!</p>
            </div>
        ) : (
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Original</th>
                        <th>Rating</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cakes.map(cake => (
                        <tr key={cake.id}>
                            <td>
                                <img
                                    src={cake.image || '/assets/cakes/placeholder.jpg'}
                                    alt={cake.name}
                                    className="admin-table-img"
                                    onError={e => { e.target.src = 'https://placehold.co/60x60/1a1a1a/d4af37?text=🎂'; }}
                                />
                            </td>
                            <td>
                                <strong className="admin-cake-name">{cake.name}</strong>
                                <small className="admin-cake-desc">{cake.description}</small>
                            </td>
                            <td>
                                <span className={`admin-badge badge-${cake.category}`}>
                                    {cake.category}
                                </span>
                            </td>
                            <td className="admin-price">₹{cake.price}</td>
                            <td className="admin-original-price">₹{cake.originalPrice}</td>
                            <td>{'⭐'.repeat(cake.rating)}</td>
                            <td>
                                <div className="admin-action-btns">
                                    <button className="admin-icon-btn admin-edit-btn" onClick={() => onEdit(cake)} title="Edit">
                                        <Pencil size={16} />
                                    </button>
                                    <button className="admin-icon-btn admin-icon-btn-danger" onClick={() => onDelete(cake)} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

// ─── Change Password Panel ──────────────────────────────────────────────────
const ChangePasswordPanel = ({ changePassword }) => {
    const [current, setCurrent] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [msg, setMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    // Live password strength rules
    const rules = [
        { label: 'At least 10 characters', pass: newPass.length >= 10 },
        { label: 'One uppercase letter (A-Z)', pass: /[A-Z]/.test(newPass) },
        { label: 'One number or special character (!@#$%^&*)', pass: /[0-9!@#$%^&*]/.test(newPass) },
        { label: 'Passwords match', pass: newPass === confirm && confirm.length > 0 },
    ];
    const allRulesPass = rules.every(r => r.pass);

    const handleChange = async (e) => {
        e.preventDefault();
        if (!allRulesPass) return;
        setLoading(true);
        setMsg(null);
        const result = await changePassword(current, newPass);
        setMsg({ type: result.success ? 'success' : 'error', text: result.message });
        if (result.success) { setCurrent(''); setNewPass(''); setConfirm(''); }
        setLoading(false);
    };

    return (
        <div className="admin-panel admin-settings-panel">
            <h2 className="admin-panel-title"><Key size={20} /> Change Admin Password</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px', marginTop: '-12px' }}>
                🔒 Passwords are hashed with SHA-256 — never stored in plain text.
            </p>
            <form onSubmit={handleChange} className="admin-settings-form">
                <div className="admin-form-group">
                    <label className="admin-form-label">Current Password</label>
                    <input type="password" className="admin-form-input" value={current}
                        onChange={e => setCurrent(e.target.value)} required autoComplete="current-password" />
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">New Password</label>
                    <input type="password" className="admin-form-input" value={newPass}
                        onChange={e => setNewPass(e.target.value)} required autoComplete="new-password"
                        placeholder="Min 10 characters" />
                    {/* Live strength checker */}
                    {newPass && (
                        <ul className="admin-pwd-rules">
                            {rules.slice(0, 3).map((r, i) => (
                                <li key={i} className={r.pass ? 'rule-pass' : ''}>{r.label}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="admin-form-group">
                    <label className="admin-form-label">Confirm New Password</label>
                    <input type="password" className="admin-form-input" value={confirm}
                        onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
                    {confirm && (
                        <ul className="admin-pwd-rules" style={{ marginTop: '6px' }}>
                            <li className={rules[3].pass ? 'rule-pass' : ''}>Passwords match</li>
                        </ul>
                    )}
                </div>
                {msg && (
                    <div className={`admin-msg ${msg.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                        {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {msg.text}
                    </div>
                )}
                <button type="submit" className="admin-btn admin-btn-gold"
                    disabled={loading || !allRulesPass || !current}>
                    {loading ? <span className="admin-spinner" style={{ borderTopColor: '#000' }}></span> : <><Save size={16} /> Update Password</>}
                </button>
            </form>
        </div>
    );
};

// ─── Main Dashboard ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { isAuthenticated, logout, changePassword } = useAdmin();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('rajapuram');
    const [activeSection, setActiveSection] = useState('cakes'); // 'cakes' | 'settings'

    const [rajCakes, setRajCakes] = useState(() => loadStoreData('rajapuram'));
    const [manCakes, setManCakes] = useState(() => loadStoreData('mangalore'));

    const [showForm, setShowForm] = useState(false);
    const [editingCake, setEditingCake] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [saved, setSaved] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) navigate('/admin');
    }, [isAuthenticated]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const getCakes = () => activeTab === 'rajapuram' ? rajCakes : manCakes;
    const setCakes = (data) => {
        if (activeTab === 'rajapuram') setRajCakes(data);
        else setManCakes(data);
    };

    // Save to localStorage (instant live preview)
    const handleSaveLive = () => {
        saveStoreData('rajapuram', rajCakes);
        saveStoreData('mangalore', manCakes);
        setSaved(true);
        showToast('✅ Changes saved! Live on your site now. (Visitors will see updates after page refresh)', 'success');
        setTimeout(() => setSaved(false), 3000);
    };

    // CRUD handlers
    const handleAddCake = () => {
        setEditingCake(null);
        setShowForm(true);
    };

    const handleEditCake = (cake) => {
        setEditingCake(cake);
        setShowForm(true);
    };

    const handleDeleteCake = (cake) => {
        setDeleteTarget(cake);
    };

    const confirmDelete = () => {
        const updated = getCakes().filter(c => c.id !== deleteTarget.id);
        setCakes(updated);
        saveStoreData(activeTab, updated);
        setDeleteTarget(null);
        showToast(`🗑️ "${deleteTarget.name}" deleted successfully.`);
    };

    const handleSaveCake = (savedCake) => {
        const current = getCakes();
        let updated;
        if (current.find(c => c.id === savedCake.id)) {
            updated = current.map(c => c.id === savedCake.id ? savedCake : c);
            showToast(`✅ "${savedCake.name}" updated successfully!`);
        } else {
            updated = [...current, savedCake];
            showToast(`✅ "${savedCake.name}" added successfully!`);
        }
        setCakes(updated);
        saveStoreData(activeTab, updated);
        setShowForm(false);
        setEditingCake(null);
    };

    const totalCakes = rajCakes.length + manCakes.length;

    return (
        <div className="admin-dashboard">
            <Toast toast={toast} />

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <ShieldCheck size={24} />
                    <span>Carameloft Admin</span>
                </div>

                <nav className="admin-sidebar-nav">
                    <button
                        className={`admin-nav-item ${activeSection === 'cakes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('cakes')}
                    >
                        <LayoutDashboard size={18} /> Cake Manager
                    </button>
                    <button
                        className={`admin-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveSection('settings')}
                    >
                        <Key size={18} /> Settings
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="admin-nav-item admin-logout-btn" onClick={() => { logout(); navigate('/admin'); }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {activeSection === 'cakes' && (
                    <>
                        {/* Stats Bar */}
                        <div className="admin-stats-bar">
                            <div className="admin-stat-card">
                                <span className="stat-number">{totalCakes}</span>
                                <span className="stat-label">Total Cakes</span>
                            </div>
                            <div className="admin-stat-card">
                                <span className="stat-number">{rajCakes.length}</span>
                                <span className="stat-label">Rajapuram</span>
                            </div>
                            <div className="admin-stat-card">
                                <span className="stat-number">{manCakes.length}</span>
                                <span className="stat-label">Mangalore</span>
                            </div>
                            <div className="admin-stat-card stat-live">
                                <Eye size={20} />
                                <a href="https://carameloft.com" target="_blank" rel="noreferrer" className="stat-live-link">
                                    View Live Site
                                </a>
                            </div>
                        </div>

                        {/* Store Tabs */}
                        <div className="admin-tabs">
                            {Object.entries(STORES).map(([id, store]) => (
                                <button
                                    key={id}
                                    className={`admin-tab ${activeTab === id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(id)}
                                >
                                    🎂 {store.label}
                                    <span className="tab-count">
                                        {id === 'rajapuram' ? rajCakes.length : manCakes.length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Toolbar */}
                        <div className="admin-toolbar">
                            <h2 className="admin-section-title">
                                {STORES[activeTab].label} Cakes
                            </h2>
                            <div className="admin-toolbar-actions">
                                <button className="admin-btn admin-btn-ghost" onClick={() => window.open(`/`, '_blank')}>
                                    <Eye size={16} /> Preview
                                </button>
                                <button className="admin-btn admin-btn-gold" onClick={handleAddCake}>
                                    <Plus size={16} /> Add Cake
                                </button>
                                <button
                                    className={`admin-btn ${saved ? 'admin-btn-success' : 'admin-btn-save'}`}
                                    onClick={handleSaveLive}
                                >
                                    <Save size={16} /> {saved ? 'Saved!' : 'Save & Go Live'}
                                </button>
                            </div>
                        </div>

                        {/* Important Note */}
                        <div className="admin-live-note">
                            💡 <strong>How it works:</strong> Changes save instantly to this browser. Click <strong>"Save & Go Live"</strong> to make changes visible to all visitors. For permanent deployment, push to GitHub (auto-deploys via Netlify).
                        </div>

                        <CakeTable
                            cakes={getCakes()}
                            onEdit={handleEditCake}
                            onDelete={handleDeleteCake}
                        />
                    </>
                )}

                {activeSection === 'settings' && (
                    <ChangePasswordPanel changePassword={changePassword} />
                )}
            </main>

            {/* Modals */}
            {showForm && (
                <CakeForm
                    storeId={activeTab}
                    cake={editingCake}
                    onSave={handleSaveCake}
                    onCancel={() => { setShowForm(false); setEditingCake(null); }}
                />
            )}

            <ConfirmDialog
                open={!!deleteTarget}
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default AdminDashboard;
