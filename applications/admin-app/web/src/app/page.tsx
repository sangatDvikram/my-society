export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-surface-raised p-8 shadow-card">
        {/* Logo / Brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Society</h1>
            <p className="text-xs text-slate-500">Admin Portal</p>
          </div>
        </div>

        {/* Hello World */}
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Admin Console 🛠️
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Manage society members, approve maintenance requests, oversee
          financials, and generate compliance reports.
        </p>

        {/* CTA placeholder */}
        <button
          type="button"
          className="w-full rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Sign In
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          Society Management and Logging System · Admin App
        </p>
      </div>
    </main>
  )
}
