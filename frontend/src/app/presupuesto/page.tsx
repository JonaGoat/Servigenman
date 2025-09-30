"use client";

import { useEffect } from "react";
import Link from "next/link";
import Script from "next/script";

import { AnimatedBackground } from "../(auth)/login/components/AnimatedBackground";
import { useBodyClass } from "../(auth)/login/hooks/useBodyClass";
import { initializeBudgetPage } from "./interaction";
import "../(auth)/login/styles.css";
import "../inventario/styles.css";
import "./styles.css";

export default function BudgetPage() {
  useBodyClass();

  useEffect(() => {
    if (typeof document === "undefined") {
      return () => {};
    }

    const layoutClass = "inventory-layout";
    document.body.classList.add(layoutClass);
    return () => {
      document.body.classList.remove(layoutClass);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return () => {};
    }

    const cleanup = initializeBudgetPage();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="afterInteractive"
      />
      <AnimatedBackground />

      <div className="budget-page">
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
                  <Link href="/categorias">Categorías</Link>
                </li>
                <li>
                  <Link href="/presupuesto" aria-current="page">
                    Presupuesto
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <div className="budget-shell">
          <main className="budget-main">
            <section className="budget-wrap">
              <header className="budget-header">
                <h2>Presupuesto</h2>
                <p>
                  Resumen financiero a partir de los recursos del inventario
                  (precio × cantidad).
                </p>
              </header>

              <section className="kpi-grid" id="budgetKpis" aria-live="polite" />

              <section className="chart-grid">
                <article className="panel" data-panel="pie">
                  <h3>Distribución del valor por categoría</h3>
                  <canvas id="chartPie" aria-label="Distribución del valor por categoría" />
                </article>
                <article className="panel" data-panel="bar">
                  <h3>Top 10 recursos por valor</h3>
                  <canvas id="chartBar" aria-label="Top 10 recursos por valor" />
                </article>
              </section>

              <section className="panel">
                <header className="panel-header">
                  <h3>Resumen por categoría</h3>
                  <p className="panel-caption">
                    Cantidades y valor estimado consolidados según la división de
                    categorías sincronizada con el inventario.
                  </p>
                </header>
                <div className="table-wrapper">
                  <table className="table-sm" id="tablaResumenCat">
                    <thead>
                      <tr>
                        <th scope="col">Categoría</th>
                        <th scope="col" className="text-right">
                          Recursos distintos
                        </th>
                        <th scope="col" className="text-right">
                          Unidades
                        </th>
                        <th scope="col" className="text-right">
                          Valor total
                        </th>
                      </tr>
                    </thead>
                    <tbody />
                  </table>
                </div>
              </section>
            </section>
          </main>

          <footer className="budget-footer">
            <p>
              &copy; <span id="year" /> Gestión de Inventario
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
