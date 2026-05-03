/**
 * owner-app — HomePage (Server Component) tests
 *
 * Strategy: render the page in jsdom, assert the brand header and the
 * embedded ClickCounter are present. We do NOT test ClickCounter's
 * internal logic here — that lives in shared-ui-components.
 */
import { render, screen } from '@testing-library/react'

import HomePage from './page'

// 'use client' directives are string expressions; ts-jest compiles them fine.
// globals.css is mapped to styleMock.js via moduleNameMapper.

describe('Owner App — HomePage', () => {
  beforeEach(() => {
    render(<HomePage />)
  })

  it('renders the My Society heading', () => {
    expect(screen.getByRole('heading', { name: /my society/i })).toBeInTheDocument()
  })

  it('renders the Owner Portal subtitle', () => {
    expect(screen.getByText(/owner portal/i)).toBeInTheDocument()
  })

  it('renders the brand logo letter "S"', () => {
    expect(screen.getByText('S')).toBeInTheDocument()
  })

  it('renders the ClickCounter component heading', () => {
    // ClickCounter renders an <h2>Click Counter</h2>
    expect(screen.getByRole('heading', { name: /click counter/i })).toBeInTheDocument()
  })

  it('renders the footer copyright text', () => {
    expect(screen.getByText(/society management and logging system/i)).toBeInTheDocument()
  })

  it('renders the Oat UI info <details> element', () => {
    expect(screen.getByText(/how oat ui works here/i)).toBeInTheDocument()
  })
})
