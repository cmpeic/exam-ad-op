import Link from "next/link";

export default function NotFound() {
  return (
    <main className="py-16 text-center">
      <p className="font-display text-6xl font-bold text-gradient">404</p>
      <h1 className="mt-3 font-display text-xl font-semibold text-ink">Este paso no está en el pipeline</h1>
      <p className="mt-2 text-sm text-muted">La página que buscas no existe.</p>
      <Link href="/" className="mt-6 inline-block rounded-2xl bg-primary px-5 py-3 font-semibold text-bg">
        Volver al inicio
      </Link>
    </main>
  );
}
