import { useEffect, useState } from 'react'

import { approveBuyer, createBuyer, deleteBuyer, getBuyer, getBuyers, loginBuyer, updateBuyer } from './api/buyers'
import BuyerEditForm from './components/BuyerEditForm'
import BuyerForm from './components/BuyerForm'
import BuyerModal from './components/BuyerModal'
import BuyerTable from './components/BuyerTable'

const storageKeys = {
    role: 'buyer-onboarding-role',
    buyer: 'buyer-onboarding-buyer',
}

const adminDefaults = {
    email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@aximly.com',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'Admin@1234!',
}

const initialToast = {
    kind: 'info',
    message: 'Choose Buyer or Admin to continue.',
}

const buyerLoginDefaults = {
    email: '',
    password: '',
}

export default function App() {
    const [screen, setScreen] = useState('home')
    const [buyers, setBuyers] = useState([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [authWorking, setAuthWorking] = useState(false)
    const [toast, setToast] = useState(initialToast)
    const [activeBuyer, setActiveBuyer] = useState(null)
    const [buyerProfile, setBuyerProfile] = useState(null)
    const [modalMode, setModalMode] = useState('view')
    const [modalOpen, setModalOpen] = useState(false)
    const [buyerLogin, setBuyerLogin] = useState(buyerLoginDefaults)
    const [adminLogin, setAdminLogin] = useState({ email: adminDefaults.email, password: '' })

    useEffect(() => {
        restoreSession()
    }, [])

    useEffect(() => {
        if (screen === 'admin-dashboard') {
            loadBuyers()
        }
    }, [screen])

    useEffect(() => {
        if (screen !== 'buyer-dashboard' || !buyerProfile?.id) {
            return undefined
        }

        let active = true
        const currentBuyerId = buyerProfile.id
        const currentNotification = buyerProfile.notification

        async function refreshBuyerProfile() {
            try {
                const latestBuyer = await getBuyer(currentBuyerId)
                if (!active) {
                    return
                }

                setBuyerProfile(latestBuyer)
                persistBuyerSession(latestBuyer)

                if (latestBuyer.notification && latestBuyer.notification !== currentNotification) {
                    setToast({ kind: 'info', message: latestBuyer.notification })
                }
            } catch {
                // Keep the current dashboard if a single poll fails.
            }
        }

        refreshBuyerProfile()
        const intervalId = window.setInterval(refreshBuyerProfile, 8000)

        return () => {
            active = false
            window.clearInterval(intervalId)
        }
    }, [screen, buyerProfile?.id])

    function restoreSession() {
        clearSession()
        setScreen('home')
    }

    async function loadBuyers() {
        setLoading(true)
        try {
            const response = await getBuyers()
            setBuyers(response)
            setToast({ kind: 'success', message: 'Admin dashboard refreshed.' })
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to fetch buyers.') })
        } finally {
            setLoading(false)
        }
    }

    function goToBuyerLogin() {
        setToast({ kind: 'info', message: 'Open the buyer login page to sign in or create a new buyer account.' })
        setScreen('buyer-login')
    }

    function goToAdminLogin() {
        setToast({ kind: 'info', message: 'Open the admin login page to continue.' })
        setScreen('admin-login')
    }

    async function handleBuyerSignup(payload) {
        setSaving(true)
        try {
            const response = await createBuyer(payload)
            setBuyerProfile(response)
            setBuyerLogin({ email: response.email, password: payload.password })
            persistBuyerSession(response)
            setScreen('buyer-dashboard')
            setToast({ kind: 'success', message: 'Buyer account created. The buyer dashboard is now open.' })
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to create buyer account.') })
        } finally {
            setSaving(false)
        }
    }

    async function handleBuyerLogin(event) {
        event.preventDefault()
        if (!buyerLogin.email.trim() || !buyerLogin.password.trim()) {
            setToast({ kind: 'error', message: 'Buyer email and password are required.' })
            return
        }

        setAuthWorking(true)
        try {
            const response = await loginBuyer({
                email: buyerLogin.email.trim().toLowerCase(),
                password: buyerLogin.password,
            })
            setBuyerProfile(response)
            persistBuyerSession(response)
            setScreen('buyer-dashboard')
            setToast({ kind: 'success', message: 'Buyer dashboard opened successfully.' })
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to open buyer dashboard.') })
        } finally {
            setAuthWorking(false)
        }
    }

    async function handleAdminLogin(event) {
        event.preventDefault()
        setAuthWorking(true)

        try {
            const email = adminLogin.email.trim().toLowerCase()
            const password = adminLogin.password

            if (email !== adminDefaults.email.toLowerCase() || password !== adminDefaults.password) {
                throw new Error('Invalid admin credentials.')
            }

            window.localStorage.setItem(storageKeys.role, 'admin')
            setScreen('admin-dashboard')
            setToast({ kind: 'success', message: 'Admin dashboard opened successfully.' })
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to open admin dashboard.') })
        } finally {
            setAuthWorking(false)
        }
    }

    async function handleViewBuyer(buyer) {
        try {
            const response = await getBuyer(buyer.id)
            setActiveBuyer(response)
            setModalMode('view')
            setModalOpen(true)
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to load buyer profile.') })
        }
    }

    function handleEditBuyer(buyer) {
        setActiveBuyer(buyer)
        setModalMode('edit')
        setModalOpen(true)
    }

    async function handleApproveBuyer(buyer) {
        setSaving(true)
        try {
            const response = await approveBuyer(buyer.id)
            setBuyers((currentBuyers) => currentBuyers.map((item) => (item.id === response.id ? response : item)))
            setToast({ kind: 'success', message: `Buyer ${response.name} approved.` })
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to approve buyer.') })
        } finally {
            setSaving(false)
        }
    }

    async function handleUpdateBuyer(payload) {
        if (!activeBuyer) {
            return
        }

        setSaving(true)
        try {
            const response = await updateBuyer(activeBuyer.id, payload)
            setBuyers((currentBuyers) => currentBuyers.map((buyer) => (buyer.id === response.id ? response : buyer)))
            if (buyerProfile?.id === response.id) {
                setBuyerProfile(response)
                persistBuyerSession(response)
            }
            setActiveBuyer(response)
            setModalOpen(false)
            setToast({ kind: 'success', message: 'Buyer details updated.' })
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to update buyer.') })
        } finally {
            setSaving(false)
        }
    }

    async function handleDeleteBuyer(buyer) {
        const confirmed = window.confirm(`Delete ${buyer.name}? This action cannot be undone.`)
        if (!confirmed) {
            return
        }

        try {
            await deleteBuyer(buyer.id)
            setBuyers((currentBuyers) => currentBuyers.filter((currentBuyer) => currentBuyer.id !== buyer.id))

            if (buyerProfile?.id === buyer.id) {
                clearSession()
                setScreen('buyer-login')
                setToast({ kind: 'success', message: 'Your buyer account was deleted. Please create a new one or log in again.' })
                return
            }

            setToast({ kind: 'success', message: 'Buyer deleted.' })
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to delete buyer.') })
        }
    }

    async function handleBuyerProfileView() {
        if (!buyerProfile) {
            setToast({ kind: 'info', message: 'No buyer session is active.' })
            return
        }

        try {
            const response = await getBuyer(buyerProfile.id)
            setActiveBuyer(response)
            setModalMode('view')
            setModalOpen(true)
        } catch (error) {
            setToast({ kind: 'error', message: extractMessage(error, 'Unable to load buyer profile.') })
        }
    }

    function handleBuyerProfileEdit() {
        if (!buyerProfile) {
            setToast({ kind: 'info', message: 'No buyer session is active.' })
            return
        }

        setActiveBuyer(buyerProfile)
        setModalMode('edit')
        setModalOpen(true)
    }

    function handleLogout() {
        clearSession()
        setScreen('home')
        setBuyers([])
        setBuyerLogin(buyerLoginDefaults)
        setAdminLogin({ email: adminDefaults.email, password: '' })
        setToast({ kind: 'info', message: 'Signed out. Choose Buyer or Admin to continue.' })
    }

    function handleCloseModal() {
        setModalOpen(false)
        setActiveBuyer(null)
    }

    const totalBuyers = buyers.length
    const pendingBuyers = buyers.filter((buyer) => buyer.status === 'pending').length
    const approvedBuyers = buyers.filter((buyer) => buyer.status === 'approved').length
    const latestBuyer = buyers[0] ?? null

    if (screen === 'buyer-dashboard') {
        return renderBuyerDashboard()
    }

    if (screen === 'admin-dashboard') {
        return renderAdminDashboard()
    }

    if (screen === 'buyer-login') {
        return renderBuyerLoginPage()
    }

    if (screen === 'admin-login') {
        return renderAdminLoginPage()
    }

    return renderHomePage()

    function renderHomePage() {
        return (
            <div className="app-shell">
                <div className="ambient ambient-one" />
                <div className="ambient ambient-two" />

                <main className="layout home-layout">
                    <section className="hero panel">
                        <div className="hero-copy">
                            <p className="eyebrow">Buyer onboarding System</p>
                            <h1>Welcome to AccessHub!</h1>
                            <p className="hero-text">The buyer portal and admin portal are fully separated. Pick one option below to open the matching login page.</p>
                        </div>

                       


                    </section>

                    <section className={`toast toast-${toast.kind}`} aria-live="polite">
                        {toast.message}
                    </section>

                    <section className="portal-chooser">
                        <button type="button" className="chooser-card chooser-buyer" onClick={goToBuyerLogin}>
                            <span className="chooser-label">Buyer system</span>
                            <h2>Buyer login</h2>
                            <p>Open the buyer login page to sign in or create a new buyer account.</p>
                        </button>

                        <button type="button" className="chooser-card chooser-admin" onClick={goToAdminLogin}>
                            <span className="chooser-label">Admin system</span>
                            <h2>Admin login</h2>
                            <p>Open the admin login page to access the admin dashboard.</p>
                        </button>
                    </section>
                </main>
            </div>
        )
    }

    function renderBuyerLoginPage() {
        return (
            <div className="app-shell">
                <div className="ambient ambient-one" />
                <div className="ambient ambient-two" />

                <main className="layout auth-layout">
                    <section className="screen-topbar panel">
                        <div className="topbar-left">
                            <div className="profile-circle profile-circle-buyer">B</div>
                            <div>
                                <p className="eyebrow">Buyer system</p>
                                <h1>Buyer login page</h1>
                            </div>
                        </div>
                        <button type="button" className="button button-secondary" onClick={() => setScreen('home')}>
                            Back to Home
                        </button>
                    </section>

                    <section className={`toast toast-${toast.kind}`} aria-live="polite">
                        {toast.message}
                    </section>

                    <div className="auth-grid single-auth-grid">
                        <form className="panel auth-panel" onSubmit={handleBuyerLogin}>
                            <div className="panel-header">
                                <div>
                                    <p className="eyebrow">Buyer login</p>
                                    <h2>Open your buyer dashboard</h2>
                                </div>
                                <span className="badge">Login</span>
                            </div>

                            <div className="auth-form-fields">
                                <label className="field">
                                    <span>Email</span>
                                    <input
                                        name="email"
                                        type="email"
                                        value={buyerLogin.email}
                                        onChange={(event) => setBuyerLogin((current) => ({ ...current, email: event.target.value }))}
                                        placeholder="buyer@company.com"
                                    />
                                </label>

                                <label className="field">
                                    <span>Password</span>
                                    <input
                                        name="password"
                                        type="password"
                                        value={buyerLogin.password}
                                        onChange={(event) => setBuyerLogin((current) => ({ ...current, password: event.target.value }))}
                                        placeholder="Your password"
                                    />
                                </label>
                            </div>

                            <button type="submit" className="button button-primary" disabled={authWorking}>
                                {authWorking ? 'Opening...' : 'Login to Buyer Dashboard'}
                            </button>
                        </form>

                        <div className="panel auth-panel">
                            <div className="panel-header">
                                <div>
                                    <p className="eyebrow">Create account</p>
                                    <h2>New buyer registration</h2>
                                </div>
                                <span className="badge">Sign up</span>
                            </div>

                            <BuyerForm
                                initialValues={{
                                    name: '',
                                    email: '',
                                    phone: '',
                                    address: '',
                                    password: '',
                                    retype_password: '',
                                }}
                                submitLabel={saving ? 'Creating...' : 'Create Buyer Account'}
                                onSubmit={handleBuyerSignup}
                                saving={saving}
                            />
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    function renderAdminLoginPage() {
        return (
            <div className="app-shell">
                <div className="ambient ambient-one" />
                <div className="ambient ambient-two" />

                <main className="layout auth-layout">
                    <section className="screen-topbar panel">
                        <div className="topbar-left">
                            <div className="profile-circle profile-circle-admin">A</div>
                            <div>
                                <p className="eyebrow">Admin system</p>
                                <h1>Admin login page</h1>
                            </div>
                        </div>
                        <button type="button" className="button button-secondary" onClick={() => setScreen('home')}>
                            Back to Home
                        </button>
                    </section>

                    <section className={`toast toast-${toast.kind}`} aria-live="polite">
                        {toast.message}
                    </section>

                    <form className="panel auth-panel admin-auth-panel" onSubmit={handleAdminLogin}>
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">Admin login</p>
                                <h2>Sign in to the admin dashboard</h2>
                            </div>
                            <span className="badge">Admin only</span>
                        </div>

                        <div className="auth-form-fields">
                            <label className="field">
                                <span>Admin email</span>
                                <input
                                    name="email"
                                    type="email"
                                    value={adminLogin.email}
                                    onChange={(event) => setAdminLogin((current) => ({ ...current, email: event.target.value }))}
                                    placeholder={adminDefaults.email}
                                />
                            </label>

                            <label className="field">
                                <span>Password</span>
                                <input
                                    name="password"
                                    type="password"
                                    value={adminLogin.password}
                                    onChange={(event) => setAdminLogin((current) => ({ ...current, password: event.target.value }))}
                                    placeholder="Admin password"
                                />
                            </label>
                        </div>

                        <div className="auth-note">
                            <strong>Demo credentials</strong>
                            <span>{adminDefaults.email} / {adminDefaults.password}</span>
                        </div>

                        <button type="submit" className="button button-primary" disabled={authWorking}>
                            {authWorking ? 'Signing in...' : 'Login to Admin Dashboard'}
                        </button>
                    </form>
                </main>
            </div>
        )
    }

    function renderBuyerDashboard() {
        return (
            <div className="app-shell">
                <div className="ambient ambient-one" />
                <div className="ambient ambient-two" />

                <main className="layout">
                    <section className="dashboard-topbar panel">
                        <div className="topbar-left">
                            <div className="profile-circle profile-circle-buyer">{getInitials(buyerProfile?.name)}</div>
                            <div>
                                <p className="eyebrow">Buyer dashboard</p>
                                <h1>Private buyer portal</h1>
                            </div>
                        </div>
                        <div className="topbar-actions">
                            <span className={`badge status-pill status-${buyerProfile?.status ?? 'pending'}`}>{buyerProfile?.status ?? 'pending'}</span>
                            <button type="button" className="button button-secondary" onClick={handleBuyerProfileView}>
                                Profile
                            </button>
                            <button type="button" className="button button-primary" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </section>

                    <section className={`toast toast-${toast.kind}`} aria-live="polite">
                        {toast.message}
                    </section>

                    <section className="notification-panel panel">
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">Buyer notification</p>
                                <h2>Latest update from admin</h2>
                            </div>
                            <span className="badge">Live</span>
                        </div>
                        <p className="notification-message">{buyerProfile?.notification || 'No notifications yet. Your messages will appear here when the admin reviews or updates your account.'}</p>
                    </section>

                    <section className="panel dashboard-panel buyer-dashboard-shell">
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">Buyer dashboard</p>
                                <h2>Your onboarding record</h2>
                            </div>
                        </div>

                        <article className="profile-card">
                            <div className="profile-card-header">
                                <div>
                                    <p className="eyebrow">Buyer profile</p>
                                    <h3>{buyerProfile?.name}</h3>
                                </div>
                                <span className={`status-pill status-${buyerProfile?.status ?? 'pending'}`}>{buyerProfile?.status ?? 'pending'}</span>
                            </div>

                            <div className="details-grid profile-details">
                                <div>
                                    <span>Email</span>
                                    <strong>{buyerProfile?.email}</strong>
                                </div>
                                <div>
                                    <span>Phone</span>
                                    <strong>{buyerProfile?.phone || '—'}</strong>
                                </div>
                                <div>
                                    <span>Company</span>
                                    <strong>{buyerProfile?.company_name || '—'}</strong>
                                </div>
                                <div>
                                    <span>Business Type</span>
                                    <strong>{buyerProfile?.business_type || '—'}</strong>
                                </div>
                                <div className="details-full">
                                    <span>Address</span>
                                    <strong>{buyerProfile?.address || '—'}</strong>
                                </div>
                                <div className="details-full">
                                    <span>Onboarding Goal</span>
                                    <strong>{buyerProfile?.onboarding_goal || '—'}</strong>
                                </div>
                            </div>

                            <div className="form-actions profile-actions">
                                <button type="button" className="button button-tertiary" onClick={handleBuyerProfileView}>
                                    View Profile
                                </button>
                                <button type="button" className="button button-primary" onClick={handleBuyerProfileEdit}>
                                    Update Info
                                </button>
                            </div>
                        </article>
                    </section>
                </main>

                <BuyerModal
                    open={modalOpen}
                    buyer={activeBuyer}
                    mode={modalMode}
                    saving={saving}
                    onClose={handleCloseModal}
                    onSave={handleUpdateBuyer}
                />
            </div>
        )
    }

    function renderAdminDashboard() {
        return (
            <div className="app-shell">
                <div className="ambient ambient-one" />
                <div className="ambient ambient-two" />

                <main className="layout">
                    <section className="dashboard-topbar panel">
                        <div className="topbar-left">
                            <div className="profile-circle profile-circle-admin">A</div>
                            <div>
                                <p className="eyebrow">Admin dashboard</p>
                                <h1>Private admin portal</h1>
                            </div>
                        </div>
                        <div className="topbar-actions">
                            <span className="badge">{totalBuyers} buyers</span>
                            <button type="button" className="button button-secondary" onClick={loadBuyers} disabled={loading}>
                                Refresh
                            </button>
                            <button type="button" className="button button-primary" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </section>

                    <section className={`toast toast-${toast.kind}`} aria-live="polite">
                        {toast.message}
                    </section>

                    <section className="stats-grid">
                        <article className="stat-card">
                            <span>Total buyers</span>
                            <strong>{totalBuyers}</strong>
                            <small>All buyer records currently stored in the system.</small>
                        </article>
                        <article className="stat-card">
                            <span>Pending</span>
                            <strong>{pendingBuyers}</strong>
                            <small>Records still waiting for review or approval.</small>
                        </article>
                        <article className="stat-card">
                            <span>Approved</span>
                            <strong>{approvedBuyers}</strong>
                            <small>Accounts that have passed the admin review.</small>
                        </article>
                    </section>

                    <section className="panel dashboard-panel admin-dashboard-shell">
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">Admin dashboard</p>
                                <h2>Buyer registry</h2>
                            </div>
                        </div>

                        <BuyerTable
                            buyers={buyers}
                            loading={loading}
                            onView={handleViewBuyer}
                            onEdit={handleEditBuyer}
                            onDelete={handleDeleteBuyer}
                            onApprove={handleApproveBuyer}
                        />
                    </section>
                </main>

                <BuyerModal
                    open={modalOpen}
                    buyer={activeBuyer}
                    mode={modalMode}
                    saving={saving}
                    onClose={handleCloseModal}
                    onSave={handleUpdateBuyer}
                    onApprove={handleApproveBuyer}
                />
            </div>
        )
    }

    function persistBuyerSession(profile) {
        window.localStorage.setItem(storageKeys.role, 'buyer')
        window.localStorage.setItem(storageKeys.buyer, JSON.stringify(profile))
    }

    function clearSession() {
        window.localStorage.removeItem(storageKeys.role)
        window.localStorage.removeItem(storageKeys.buyer)
        setBuyerProfile(null)
    }
}

function extractMessage(error, fallbackMessage) {
    return error?.response?.data?.detail || error?.message || fallbackMessage
}

function getInitials(name) {
    if (!name) {
        return '?'
    }

    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
}
