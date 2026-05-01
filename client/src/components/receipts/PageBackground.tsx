export default function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-sky-200/25 blur-3xl" />
      <div className="absolute right-0 top-12 h-96 w-96 rounded-full bg-slate-300/35 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-white blur-3xl" />
    </div>
  );
}
