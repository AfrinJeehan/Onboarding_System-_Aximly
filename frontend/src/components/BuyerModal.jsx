import BuyerEditForm from './BuyerEditForm'

export default function BuyerModal({ buyer, mode, open, saving = false, onClose, onSave, onApprove }) {
  if (!open || !buyer) {
    return null
  }

  const isViewMode = mode === 'view'

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={isViewMode ? 'Buyer profile' : 'Update buyer'} onClick={(event) => event.stopPropagation()}>
        {isViewMode ? (
          <>
            <div className="panel-header modal-header">
              <div>
                <p className="eyebrow">Buyer profile</p>
                <h2>{buyer.name}</h2>
              </div>
              <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
                ×
              </button>
            </div>

            <div className="details-grid">
              <div>
                <span>ID</span>
                <strong>{buyer.id}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{buyer.email}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{buyer.phone || '—'}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{buyer.status}</strong>
              </div>
              <div>
                <span>Company</span>
                <strong>{buyer.company_name || '—'}</strong>
              </div>
              <div>
                <span>Business Type</span>
                <strong>{buyer.business_type || '—'}</strong>
              </div>
              <div className="details-full">
                <span>Address</span>
                <strong>{buyer.address || '—'}</strong>
              </div>
              <div className="details-full">
                <span>Onboarding Goal</span>
                <strong>{buyer.onboarding_goal || '—'}</strong>
              </div>
              <div className="details-full">
                <span>Notification</span>
                <strong>{buyer.notification || 'No notification available yet.'}</strong>
              </div>
              <div className="details-full">
                <span>Created</span>
                <strong>{new Date(buyer.created_at).toLocaleString()}</strong>
              </div>
            </div>

            <div className="modal-actions">
              {buyer.status !== 'approved' && onApprove ? (
                <button type="button" className="button button-secondary" onClick={() => onApprove(buyer)}>
                  Approve Account
                </button>
              ) : null}
              <button type="button" className="button button-primary" onClick={onClose}>
                Close profile
              </button>
            </div>
          </>
        ) : (
          <BuyerEditForm
            initialValues={{
              name: buyer.name,
              email: buyer.email,
              phone: buyer.phone || '',
              company_name: buyer.company_name || '',
              business_type: buyer.business_type || '',
              address: buyer.address || '',
              onboarding_goal: buyer.onboarding_goal || '',
              status: buyer.status || 'pending',
            }}
            submitLabel={saving ? 'Updating...' : 'Save changes'}
            onSubmit={onSave}
            onCancel={onClose}
            saving={saving}
          />
        )}
      </div>
    </div>
  )
}
