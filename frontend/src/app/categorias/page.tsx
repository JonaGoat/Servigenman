"use client";

import { useEffect } from "react";
import Link from "next/link";

import { AnimatedBackground } from "../(auth)/login/components/AnimatedBackground";
import { useBodyClass } from "../(auth)/login/hooks/useBodyClass";
import { initializeCategoriesPage } from "./interaction";
import "../(auth)/login/styles.css";
import "../inventario/styles.css";
import "./styles.css";

export default function CategoriesPage() {
  useBodyClass();

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const cleanup = initializeCategoriesPage();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const layoutClass = "inventory-layout";
    document.body.classList.add(layoutClass);
    return () => {
      document.body.classList.remove(layoutClass);
    };
  }, []);

  return (
    <>
      <AnimatedBackground />
      <div className="categories-page">
        <header className="inventory-header">
          <div className="inventory-header__inner">
            <div className="header-bar">
              <h1>Gestión de Inventario - Recursos Internos</h1>
              <div className="header-actions">
                <input type="checkbox" id="themeSwitch" hidden />
                <label
                  htmlFor="themeSwitch"
                  className="switch"
                  aria-label="Cambiar tema claro/oscuro"
                />
                <span id="themeLabel" className="theme-label">
                  Claro
                </span>
              </div>
            </div>
            <nav>
              <ul>
                <li>
                  <Link href="/inicio">Inicio</Link>
                </li>
                <li>
                  <Link href="/inventario">Inventario</Link>
                </li>
                <li>
                  <Link href="/categorias" aria-current="page">
                    Categorías
                  </Link>
                </li>
                <li>
                  <Link href="/presupuesto">Presupuesto</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <div className="categories-shell">
          <main className="categories-main">
            <section className="categories-hero">
              <div>
                <h2>Categorías</h2>
                <p>
                  Haz clic en una tarjeta para ver únicamente los recursos de esa
                  categoría dentro del inventario.
                </p>
              </div>
              <p className="categories-hero__hint">
                Actualiza las categorías desde el inventario. Los cambios se
                sincronizan automáticamente.
              </p>
            </section>

            <section className="categories-section">
              <header className="categories-section__header">
                <h3>Explora los recursos por categoría</h3>
                <p>
                  Navega entre los carruseles superiores e inferiores para
                  identificar tendencias, cantidades disponibles y valor
                  acumulado por cada segmento.
                </p>
              </header>

              <div className="category-carousel" data-row="top">
                <button className="cat-nav prev" aria-label="Anterior">
                  ‹
                </button>
                <div className="category-track" />
                <button className="cat-nav next" aria-label="Siguiente">
                  ›
                </button>
              </div>

              <div className="category-carousel" data-row="bottom">
                <button className="cat-nav prev" aria-label="Anterior">
                  ‹
                </button>
                <div className="category-track" />
                <button className="cat-nav next" aria-label="Siguiente">
                  ›
                </button>
              </div>

              <p id="categoriesEmptyState" className="categories-empty" hidden>
                No hay categorías registradas todavía. Agrega recursos en el
                inventario para construir este resumen visual.
              </p>
            </section>
          </main>

          <footer className="categories-footer">
            <p>Versión 1.1 - Proyecto Personal para Portafolio</p>
          </footer>
        </div>
      </div>
    </>
  );
}
