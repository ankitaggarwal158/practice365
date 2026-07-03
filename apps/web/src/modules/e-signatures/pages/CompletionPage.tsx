export default function CompletionPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-surface-900/40 border border-white/[0.06] p-8 rounded-2xl animate-fade-in">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-success/10 text-success text-2xl font-bold">
          ✓
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Signature Submitted</h2>
          <p className="text-sm text-surface-200/60 leading-relaxed">
            Thank you! Your legally binding electronic signature has been successfully applied to the document.
          </p>
        </div>
        <p className="text-[10px] text-surface-200/30">
          You may close this tab now. The coordinator will be notified of your completion.
        </p>
      </div>
    </div>
  );
}
