import Link from "next/link";

import "./not-found.css";

export default function NotFound() {
  return (
    <main className="not-found" role="main">
      <div className="not-found__glow" aria-hidden />
      <section className="not-found__card" aria-labelledby="not-found-title">
        <span className="not-found__tag">Error 404</span>
        <h1 id="not-found-title" className="not-found__title">
          Página no encontrada
        </h1>
        <p className="not-found__description">
          La dirección que intentas abrir no existe o fue movida. Revisa el enlace
          ingresado o vuelve al panel principal para continuar trabajando.
        </p>
        <div className="not-found__actions">
          <Link className="not-found__button" href="/inicio">
            Volver al inicio
          </Link>
          <Link className="not-found__secondary" href="/inventario">
            Ir al inventario
          </Link>
        </div>
        <p className="not-found__hint">
          ¿Necesitas ayuda? Ponte en contacto con soporte interno para reportar el
          enlace roto.
        </p>
      </section>
    </main>
  );
}
