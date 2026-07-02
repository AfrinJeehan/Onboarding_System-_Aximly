import { useEffect, useState } from 'react'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company_name: '',
  business_type: '',
  address: '',
  onboarding_goal: '',
  status: 'pending',
}

function validateBuyer(values) {
  const nextErrors = {}

  if (!values.name.trim()) {
    nextErrors.name = 'Name is required.'
  }

  if (!values.email.trim()) {
    nextErrors.email = 'Email is required.'
  }

  if (values.phone && values.phone.trim().length > 20) {
    nextErrors.phone = 'Phone must be 20 characters or fewer.'
  }

 
  if (!values.address.trim()) {
    nextErrors.address = 'Business address is required.'
  }

 

  if (!values.status.trim()) {
    nextErrors.status = 'Status is required.'
  }

  return nextErrors
}

export default function BuyerEditForm({ initialValues, submitLabel, onSubmit, onCancel, saving = false }) {
  const [formValues, setFormValues] = useState(initialValues ?? emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setFormValues(initialValues ?? emptyForm)
    setErrors({})
  }, [initialValues])

  function handleChange(event) {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))

    if (errors[name]) {
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors }
        delete nextErrors[name]
        return nextErrors
      })
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateBuyer(formValues)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onSubmit({
      name: formValues.name.trim(),
      email: formValues.email.trim().toLowerCase(),
      phone: formValues.phone.trim(),
      
      address: formValues.address.trim(),
      
      status: formValues.status.trim(),
    })
  }

  return (
    <form className="buyer-form buyer-edit-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input name="name" value={formValues.name} onChange={handleChange} maxLength={100} />
          {errors.name ? <strong className="field-error">{errors.name}</strong> : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input name="email" type="email" value={formValues.email} onChange={handleChange} maxLength={100} />
          {errors.email ? <strong className="field-error">{errors.email}</strong> : null}
        </label>

        <label className="field field-full">
          <span>Phone</span>
          <input name="phone" value={formValues.phone} onChange={handleChange} maxLength={20} />
          {errors.phone ? <strong className="field-error">{errors.phone}</strong> : null}
        </label>

      

        

        <label className="field field-full">
          <span>Business Address</span>
          <input name="address" value={formValues.address} onChange={handleChange} maxLength={255} />
          {errors.address ? <strong className="field-error">{errors.address}</strong> : null}
        </label>

        

        <label className="field field-full">
          <span>Status</span>
          <select name="status" value={formValues.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {errors.status ? <strong className="field-error">{errors.status}</strong> : null}
        </label>
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="button button-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        ) : null}
        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
