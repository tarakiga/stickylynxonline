export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background text-text-primary min-h-screen">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 shadow-premium"></div>
      <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Stickylynx</h1>
      <p className="text-text-secondary max-w-md mb-8">
        The core application has been initialized with our custom design system. You are ready to start building the Dashboard and Editor.
      </p>
      <div className="flex gap-4">
        <button className="btn-primary font-bold px-6 py-3 rounded-full shadow-sm cursor-not-allowed">
          Login to Dashboard
        </button>
        <button className="bg-surface border border-divider hover:bg-divider font-bold px-6 py-3 rounded-full shadow-sm transition-colors text-text-primary cursor-not-allowed">
          View Example Page
        </button>
      </div>
    </main>
  );
}
