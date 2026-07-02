export default function BuyerTable({ buyers, loading, onView, onEdit, onDelete, onApprove }) {
  return (
    <section className="panel table-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h2>Registered buyers</h2>
        </div>
        <span className="badge">{buyers.length} total</span>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="empty-state">Loading buyers...</td>
              </tr>
            ) : buyers.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">No buyers have been registered yet.</td>
              </tr>
            ) : (
              buyers.map((buyer) => (
                <tr key={buyer.id}>
                  <td>{buyer.id}</td>
                  <td>{buyer.name}</td>
                  <td>{buyer.email}</td>
                  <td>{buyer.phone || '—'}</td>
                  <td>{buyer.company_name || '—'}</td>
                  <td>
                    <span className={`status-pill status-${buyer.status}`}>{buyer.status}</span>
                  </td>
                  <td>{new Date(buyer.created_at).toLocaleString()}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="button button-tertiary" onClick={() => onView(buyer)}>
                        View Profile
                      </button>
                      <button type="button" className="button button-secondary" onClick={() => onEdit(buyer)}>
                        Update Info
                      </button>
                      {buyer.status !== 'approved' ? (
                        <button type="button" className="button button-primary" onClick={() => onApprove(buyer)}>
                          Approve Account
                        </button>
                      ) : null}
                      <button type="button" className="button button-danger" onClick={() => onDelete(buyer)}>
                        Delete Account
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
