import { useEffect, useState } from 'react'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company_name: '',
  business_type: '',
  address: '',
  onboarding_goal: '',
  password: '',
  retype_password: '',
}

function validateBuyer(values) {
  const nextErrors = {}

  if (!values.name.trim()) {
    nextErrors.name = 'Name is required.'
  }

  if (!values.email.trim()) {
    nextErrors.email = 'Email is required.'
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
  }

  if (values.phone && values.phone.trim().length > 20) {
    nextErrors.phone = 'Phone must be 20 characters or fewer.'
  }

  if (!values.company_name.trim()) {
    nextErrors.company_name = 'Company name is required.'
  }

  if (!values.business_type.trim()) {
    nextErrors.business_type = 'Business type is required.'
  }

  if (!values.onboarding_goal.trim()) {
    nextErrors.onboarding_goal = 'Tell us your onboarding goal.'
  } else if (values.onboarding_goal.trim().length < 10) {
    nextErrors.onboarding_goal = 'Please share a little more detail.'
  }

  if (!values.address.trim()) {
    nextErrors.address = 'Business address is required.'
  }

  if (!values.password) {
    nextErrors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    nextErrors.password = 'Password must be at least 8 characters.'
  }

  if (!values.retype_password) {
    nextErrors.retype_password = 'Retype your password.'
  } else if (values.password !== values.retype_password) {
    nextErrors.retype_password = 'Passwords do not match.'
  }

  return nextErrors
}

export default function BuyerForm({ initialValues, submitLabel, onSubmit, onCancel, saving = false }) {
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
      company_name: formValues.company_name.trim(),
      business_type: formValues.business_type.trim(),
      address: formValues.address.trim(),
      onboarding_goal: formValues.onboarding_goal.trim(),
      password: formValues.password,
      retype_password: formValues.retype_password,
    })
  }

  return (
    <form className="panel form-panel buyer-form" onSubmit={handleSubmit} noValidate>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Buyer registration</p>
          <h2>Register a new buyer</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input name="name" value={formValues.name} onChange={handleChange} placeholder="Ada Lovelace" maxLength={100} />
          {errors.name ? <strong className="field-error">{errors.name}</strong> : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input name="email" type="email" value={formValues.email} onChange={handleChange} placeholder="buyer@company.com" maxLength={100} />
          {errors.email ? <strong className="field-error">{errors.email}</strong> : null}
        </label>

        <label className="field field-full">
          <span>Phone</span>
          <input name="phone" value={formValues.phone} onChange={handleChange} placeholder="+1 555 0100" maxLength={20} />
          {errors.phone ? <strong className="field-error">{errors.phone}</strong> : null}
        </label>

        <label className="field">
          <span>Company Name</span>
          <input name="company_name" value={formValues.company_name} onChange={handleChange} placeholder="Acme Trading LLC" maxLength={150} />
          {errors.company_name ? <strong className="field-error">{errors.company_name}</strong> : null}
        </label>

        <label className="field">
          <span>Business Type</span>
          <input name="business_type" value={formValues.business_type} onChange={handleChange} placeholder="Retail, SaaS, Manufacturing" maxLength={100} />
          {errors.business_type ? <strong className="field-error">{errors.business_type}</strong> : null}
        </label>

        <label className="field field-full">
          <span>Business Address</span>
          <input name="address" value={formValues.address} onChange={handleChange} placeholder="123 Market Street, New York" maxLength={255} />
          {errors.address ? <strong className="field-error">{errors.address}</strong> : null}
        </label>

        <label className="field field-full">
          <span>Onboarding Goal</span>
          <textarea name="onboarding_goal" value={formValues.onboarding_goal} onChange={handleChange} placeholder="Tell us why you are onboarding with us and what you need help with." rows="4" />
          {errors.onboarding_goal ? <strong className="field-error">{errors.onboarding_goal}</strong> : null}
        </label>

        <label className="field">
          <span>Password</span>
          <input name="password" type="password" value={formValues.password} onChange={handleChange} placeholder="Create a password" />
          {errors.password ? <strong className="field-error">{errors.password}</strong> : null}
        </label>

        <label className="field">
          <span>Retype Password</span>
          <input name="retype_password" type="password" value={formValues.retype_password} onChange={handleChange} placeholder="Retype your password" />
          {errors.retype_password ? <strong className="field-error">{errors.retype_password}</strong> : null}
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
