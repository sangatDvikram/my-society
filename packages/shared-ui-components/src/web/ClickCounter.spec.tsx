/**
 * ClickCounter component tests
 *
 * Tests the shared ClickCounter React component using React Testing Library.
 * Covers: initial render, increment, decrement, reset, max boundary, and
 * the full-capacity alert message.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClickCounter } from './ClickCounter'

// ── Render helpers ────────────────────────────────────────────────────────────

function setup() {
  const user = userEvent.setup()
  render(<ClickCounter />)
  const increment = () => screen.getByRole('button', { name: /increment counter/i })
  const decrement = () => screen.getByRole('button', { name: /decrement counter/i })
  const reset     = () => screen.queryByRole('button', { name: /reset counter/i })
  const badge     = () => screen.getByText(/\/ 10/)
  return { user, increment, decrement, reset, badge }
}

// ── Initial render ─────────────────────────────────────────────────────────────

describe('ClickCounter', () => {
  it('renders the heading', () => {
    render(<ClickCounter />)
    expect(screen.getByRole('heading', { name: /click counter/i })).toBeInTheDocument()
  })

  it('shows 0 / 10 on first render', () => {
    render(<ClickCounter />)
    expect(screen.getByText(/0 \/ 10/)).toBeInTheDocument()
  })

  it('shows the increment and decrement buttons on first render', () => {
    const { increment, decrement } = setup()
    expect(increment()).toBeInTheDocument()
    expect(decrement()).toBeInTheDocument()
  })

  it('decrement button is disabled at count = 0', () => {
    const { decrement } = setup()
    expect(decrement()).toBeDisabled()
  })

  it('does NOT render the Reset button when count is 0', () => {
    const { reset } = setup()
    expect(reset()).toBeNull()
  })

  // ── Increment ────────────────────────────────────────────────────────────────

  it('increments the counter when + More is clicked', async () => {
    const { user, increment } = setup()
    await user.click(increment())
    expect(screen.getByText(/1 \/ 10/)).toBeInTheDocument()
  })

  it('enables the decrement button after first increment', async () => {
    const { user, increment, decrement } = setup()
    await user.click(increment())
    expect(decrement()).not.toBeDisabled()
  })

  it('shows the Reset button after first increment', async () => {
    const { user, increment, reset } = setup()
    await user.click(increment())
    expect(reset()).toBeInTheDocument()
  })

  // ── Decrement ────────────────────────────────────────────────────────────────

  it('decrements the counter when − Less is clicked', async () => {
    const { user, increment, decrement } = setup()
    await user.click(increment())
    await user.click(increment())
    await user.click(decrement())
    expect(screen.getByText(/1 \/ 10/)).toBeInTheDocument()
  })

  it('does not decrement below 0', async () => {
    const { user, increment, decrement } = setup()
    await user.click(increment())
    await user.click(decrement())
    // decrement at 0 is disabled — clicking it should have no effect
    expect(screen.getByText(/0 \/ 10/)).toBeInTheDocument()
  })

  // ── Reset ─────────────────────────────────────────────────────────────────────

  it('resets counter to 0 when Reset is clicked', async () => {
    const { user, increment, reset } = setup()
    await user.click(increment())
    await user.click(increment())
    await user.click(reset()!)
    expect(screen.getByText(/0 \/ 10/)).toBeInTheDocument()
  })

  it('hides the Reset button after resetting', async () => {
    const { user, increment, reset } = setup()
    await user.click(increment())
    await user.click(reset()!)
    expect(reset()).toBeNull()
  })

  // ── Max boundary ──────────────────────────────────────────────────────────────

  it('does not exceed 10 clicks', async () => {
    const { user } = setup()
    for (let i = 0; i < 12; i++) {
      // button becomes disabled at 10; userEvent handles disabled gracefully
      const btn = screen.getByRole('button', { name: /increment counter/i })
      if (!btn.hasAttribute('disabled')) await user.click(btn)
    }
    expect(screen.getByText(/10 \/ 10/)).toBeInTheDocument()
  })

  it('disables + More at count = 10', async () => {
    const { user, increment } = setup()
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByRole('button', { name: /increment counter/i }))
    }
    expect(increment()).toBeDisabled()
  })

  it('shows the alert message when count reaches 10', async () => {
    const { user } = setup()
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByRole('button', { name: /increment counter/i }))
    }
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(/maximum clicks reached/i)
  })

  it('hides the alert after resetting from max', async () => {
    const { user, reset } = setup()
    for (let i = 0; i < 10; i++) {
      await user.click(screen.getByRole('button', { name: /increment counter/i }))
    }
    await user.click(reset()!)
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
