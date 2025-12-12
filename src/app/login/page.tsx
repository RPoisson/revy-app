// src/app/login/page.tsx

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 border border-black/10 rounded-2xl bg-white/80 p-6 shadow-sm">
        <p className="text-xs tracking-[0.2em] uppercase text-black/50">
          Studio Rêvy
        </p>
        <h1 className="font-[var(--font-playfair)] text-xl">
          Enter access code
        </h1>
        <p className="text-xs text-black/60">
          This early prototype is password protected. Enter the access code to
          view your bathroom style results.
        </p>

        <form action="/api/login" method="POST" className="space-y-4">
          <input
            type="password"
            name="code"
            placeholder="Access code"
            className="w-full rounded-full border border-black/20 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-black text-[#F8F5EE] px-4 py-2 text-sm hover:bg-black/90 transition"
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
