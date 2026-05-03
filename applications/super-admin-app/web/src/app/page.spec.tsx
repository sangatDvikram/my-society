/**
 * super-admin-app — HomePage tests
 *
 * The super-admin home page is a self-contained Server Component with no
 * external imports. We verify the brand identity, headings, description
 * copy, and CTA.
 */
import { render, screen } from '@testing-library/react'

import HomePage from './page'

describe('Super Admin App — HomePage', () => {
  beforeEach(() => {
    render(<HomePage />)
  })

  it('renders the Society brand heading', () => {
    expect(screen.getByRole('heading', { name: /^society$/i })).toBeInTheDocument()
  })

  it('renders the Super Admin label', () => {
    // Exact match to avoid collision with the footer "Super Admin App" text
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
  })

  it('renders the Platform Console heading', () => {
    expect(screen.getByRole('heading', { name: /platform console/i })).toBeInTheDocument()
  })

  it('renders the description copy', () => {
    expect(
      screen.getByText(/full platform management/i)
    ).toBeInTheDocument()
  })

  it('renders the Sign In button', () => {
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the footer app identifier', () => {
    expect(screen.getByText(/society management and logging system · super admin app/i)).toBeInTheDocument()
  })

  it('renders the brand logo letters "SA"', () => {
    expect(screen.getByText('SA')).toBeInTheDocument()
  })
})
