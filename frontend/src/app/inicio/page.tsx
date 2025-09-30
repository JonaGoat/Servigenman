"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AnimatedBackground } from "../(auth)/login/components/AnimatedBackground";
import { useBodyClass } from "../(auth)/login/hooks/useBodyClass";
import "../(auth)/login/styles.css";
import "./styles.css";

type ResourcePreview = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  info: string;
};

type CategoryPreview = {
  name: string;
  resources: number;
  units: number;
  value: number;
};

type BudgetSnapshot = {
  label: string;
  value: number | string;
  detail: string;
  trend?: "up" | "down";
};

const FEATURED_RESOURCES: ResourcePreview[] = [
  {
    id: 1,
    name: "Bombas sumergibles 1HP",
    category: "Bombas de agua",
    quantity: 5,
    price: 120000,
    info: "Equipo básico para faenas rurales",
  },
  {
    id: 2,
    name: "Kit reparación rodamientos",
    category: "Repuestos",
    quantity: 2,
    price: 45500,
    info: "Incluye grasa industrial premium",
  },
  {
    id: 5,
    name: "Panel de control trifásico",
    category: "Materiales eléctricos",
    quantity: 3,
    price: 189000,
    info: "Tablero listo para montaje en terreno",
  },
];

const CATEGORY_PREVIEW: CategoryPreview[] = [
  {
    name: "Materiales eléctricos",
    resources: 18,
    units: 84,
    value: 4280000,
  },
  {
    name: "Bombas de agua",
    resources: 9,
    units: 21,
    value: 3515000,
  },
  {
    name: "Herramientas especializadas",
    resources: 6,
    units: 32,
    value: 1458000,
  },
];

const BUDGET_SNAPSHOT: BudgetSnapshot[] = [
  {
    label: "Ejecución trimestral",
    value: "54%",
    detail: "Meta Q2: 62%",
    trend: "up",
  },
  {
    label: "Gasto del mes",
    value: 1875000,
    detail: "Abril 2024",
    trend: "down",
  },
  {
    label: "Saldo disponible",
    value: 1640000,
    detail: "Reservado para urgencias",
  },
];

const THEME_STORAGE_KEY = "theme";

export default function InicioPage() {
  useBodyClass();

  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }),
    []
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return () => {};
    }

    const className = "home-layout";
    document.body.classList.add(className);

    return () => {
      document.body.classList.remove(className);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const shouldUseDark = savedTheme === "dark";
    setIsDarkTheme(shouldUseDark);
    applyTheme(shouldUseDark);
  }, []);

  useEffect(() => {
    applyTheme(isDarkTheme);
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme((previous) => {
      const next = !previous;

      try {
        window.localStorage.setItem(
          THEME_STORAGE_KEY,
          next ? "dark" : "light"
        );
      } catch {
        // Ignored — localStorage might be unavailable.
      }

      return next;
    });
  };

  return (
    <>
      <AnimatedBackground />
      <div className="home-page">
        <header className="home-header">
          <div className="home-header__inner">
            <div className="header-bar">
              <h1>Servigenman — Portal operativo</h1>
              <div className="header-actions">
                <input
                  type="checkbox"
                  id="themeSwitch"
                  hidden
                  checked={isDarkTheme}
                  onChange={toggleTheme}
                />
                <label
                  htmlFor="themeSwitch"
                  className="switch"
                  aria-label="Cambiar tema claro/oscuro"
                />
                <span id="themeLabel" className="theme-label">
                  {isDarkTheme ? "Oscuro" : "Claro"}
                </span>
              </div>
            </div>
            <nav className="home-nav">
              <ul>
                <li>
                  <Link href="/inicio" aria-current="page">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/inventario">Inventario</Link>
                </li>
                <li>
                  <Link href="/categorias">Categorías</Link>
                </li>
                <li>
                  <Link href="/presupuesto">Presupuesto</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="home-main">
          <section className="home-hero">
            <div className="home-hero__content">
              <p className="home-badge">Portal interno v1.1</p>
              <h2>Seguimiento integral de recursos en terreno</h2>
              <p>
                Centraliza el estado de tus activos críticos, recibe alertas de
                reposición y coordina los equipos técnicos con la visibilidad
                que proporciona el inventario interactivo.
              </p>
              <div className="home-actions">
                <Link className="home-cta" href="/inventario">
                  Ir al inventario
                </Link>
                <Link className="home-secondary" href="/presupuesto">
                  Ver resumen financiero
                </Link>
              </div>
            </div>
            <div className="home-hero__aside">
              <div className="home-summary">
                <p className="summary-label">Recursos gestionados</p>
                <p className="summary-value">+180</p>
                <p className="summary-caption">
                  Información sincronizada desde bodegas y cuadrillas móviles.
                </p>
              </div>
              <div className="home-summary">
                <p className="summary-label">Órdenes activas</p>
                <p className="summary-value">12</p>
                <p className="summary-caption">
                  Coordinación en línea entre técnicos y supervisores regionales.
                </p>
              </div>
            </div>
          </section>

          <section className="home-preview">
            <div className="home-preview__header">
              <div>
                <h3>Recursos destacados del inventario</h3>
                <p>
                  Una muestra rápida de los equipos priorizados para la próxima
                  mantención preventiva.
                </p>
              </div>
              <Link className="home-preview__link" href="/inventario">
                Ver inventario completo
              </Link>
            </div>

            <div className="home-table__wrapper">
              <table className="home-preview__table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Recurso</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Valor unitario</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURED_RESOURCES.map((resource) => (
                    <tr key={resource.id}>
                      <td>{resource.id}</td>
                      <td>{resource.name}</td>
                      <td>{resource.category}</td>
                      <td>{resource.quantity}</td>
                      <td>{currencyFormatter.format(resource.price)}</td>
                      <td>{resource.info}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="home-panels">
            <article className="home-panel">
              <h4>Planificación de categorías</h4>
              <p>
                Explora el carrusel de categorías para segmentar recursos, asignar
                responsables y activar filtros preconfigurados según cada área.
              </p>
              <div className="home-panel__preview" aria-label="Resumen rápido de categorías">
                <ul className="category-preview">
                  {CATEGORY_PREVIEW.map((category) => (
                    <li key={category.name} className="category-preview__item">
                      <div>
                        <p className="category-preview__name">{category.name}</p>
                        <p className="category-preview__meta">
                          {category.resources} recursos · {category.units} unidades
                        </p>
                      </div>
                      <p className="category-preview__value">
                        {currencyFormatter.format(category.value)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/categorias">Explorar categorías</Link>
            </article>
            <article className="home-panel">
              <h4>Monitoreo presupuestario</h4>
              <p>
                Visualiza el impacto financiero de los insumos mediante gráficas
                y KPI en la sección de presupuesto.
              </p>
              <div className="home-panel__preview" aria-label="Indicadores financieros destacados">
                <ul className="budget-preview">
                  {BUDGET_SNAPSHOT.map((item) => (
                    <li key={item.label} className="budget-preview__item">
                      <div className="budget-preview__header">
                        <p className="budget-preview__label">{item.label}</p>
                        {item.trend ? (
                          <span
                            className={`budget-preview__trend budget-preview__trend--${item.trend}`}
                            aria-hidden="true"
                          >
                            {item.trend === "up" ? "▲" : "▼"}
                          </span>
                        ) : null}
                      </div>
                      <p className="budget-preview__value">
                        {typeof item.value === "number"
                          ? currencyFormatter.format(item.value)
                          : item.value}
                      </p>
                      <p className="budget-preview__detail">{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/presupuesto">Abrir presupuesto</Link>
            </article>
          </section>
        </main>

        <footer className="home-footer">
          <small>
            © {new Date().getFullYear()} Servigenman. Plataforma interna para el
            seguimiento operativo.
          </small>
        </footer>
      </div>
    </>
  );
}

function applyTheme(useDark: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  const body = document.body;
  if (!body) {
    return;
  }

  if (useDark) {
    body.setAttribute("data-theme", "dark");
  } else {
    body.removeAttribute("data-theme");
  }
}
