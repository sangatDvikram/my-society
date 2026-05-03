/**
 * admin-app — HomePage tests
 *
 * The admin home page is a self-contained Server Component with no external
 * imports. We verify the brand identity, headings, description copy, and CTA.
 */
import { render, screen } from '@testing-library/react'

import HomePage from './page'

describe('Admin App — HomePage', () => {
  beforeEach(() => {
    render(<HomePage />)
  })

  it('renders the Society brand heading', () => {
    expect(screen.getByRole('heading', { name: /^society$/i })).toBeInTheDocument()
  })

  it('renders the Admin Portal label', () => {
    expect(screen.getByText(/admin portal/i)).toBeInTheDocument()
  })

  it('renders the Admin Console heading', () => {
    expect(screen.getByRole('heading', { name: /admin console/i })).toBeInTheDocument()
  })

  it('renders the description copy', () => {
    expect(
      screen.getByText(/manage society members/i)
    ).toBeInTheDocument()
  })

  it('renders the Sign In button', () => {
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the footer app identifier', () => {
    expect(screen.getByText(/society management and logging system · admin app/i)).toBeInTheDocument()
  })

  it('renders the brand logo letter "A"', () => {
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
