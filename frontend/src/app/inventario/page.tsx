"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import Script from "next/script";

import { AnimatedBackground } from "../(auth)/login/components/AnimatedBackground";
import { useBodyClass } from "../(auth)/login/hooks/useBodyClass";
import { initializeInventoryPage } from "./interaction";
import "../(auth)/login/styles.css";
import "./styles.css";

export default function InventoryPage() {
  useBodyClass();

  useEffect(() => {
    if (typeof document === "undefined") {
      return () => {};
    }
    const cleanup = initializeInventoryPage();
    return () => {
      cleanup();
    };
  }, []);

  // Agrega/quita la clase en <body> para estilos del inventario
  useEffect(() => {
    if (typeof document === "undefined") {
      return () => {};
    }
    const inventoryClass = "inventory-layout";
    document.body.classList.add(inventoryClass);
    return () => {
      document.body.classList.remove(inventoryClass);
    };
  }, []);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
        strategy="afterInteractive"
      />
      <AnimatedBackground />

      <div className="inventory-page">
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
                  <a href="/inicio">Inicio</a>
                </li>
                <li>
                  <a href="/inventario" aria-current="page">
                    Inventario
                  </a>
                </li>
                <li>
                  <a href="/categorias">Categorías</a>
                </li>
                <li>
                  <a href="/presupuesto">Presupuesto</a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <div className="inventory-shell">
          <main className="inventory-main">
            <section className="inventory-card">
              <div className="inventory-card__heading">
                <h2>Listado de Recursos</h2>
                <p>Administra, filtra y exporta el inventario corporativo.</p>
              </div>

              <section className="inventory-section">
                <h3>Agregar nuevo recurso</h3>
                <form id="formAgregar" className="inventory-form">
                  <div className="form-grid">
                    <label className="visually-hidden" htmlFor="nuevoRecurso">
                      Nombre del recurso
                    </label>
                    <input
                      type="text"
                      id="nuevoRecurso"
                      placeholder="Nombre del recurso"
                      required
                    />

                    <label className="visually-hidden" htmlFor="nuevaCategoria">
                      Categoría
                    </label>
                    <input
                      type="text"
                      id="nuevaCategoria"
                      list="categoriasFormulario"
                      placeholder="Categoría"
                      required
                    />
                    <datalist id="categoriasFormulario">
                      <option value="Bombas de agua" />
                      <option value="Herramientas" />
                      <option value="Materiales eléctricos" />
                      <option value="Repuestos" />
                      <option value="Lubricantes" />
                    </datalist>

                    <label className="visually-hidden" htmlFor="nuevaCantidad">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      id="nuevaCantidad"
                      placeholder="Cantidad"
                      min="0"
                      step="1"
                      required
                    />

                    <label className="visually-hidden" htmlFor="nuevoPrecio">
                      Precio
                    </label>
                    <input
                      type="number"
                      id="nuevoPrecio"
                      placeholder="Precio"
                      min="0"
                      step="0.01"
                      required
                    />

                    <label className="visualmente-hidden" htmlFor="nuevaFoto">
                      Foto
                    </label>
                    <input type="file" id="nuevaFoto" accept="image/*" />

                    <label className="visually-hidden" htmlFor="nuevaInfo">
                      Información adicional
                    </label>
                    <input
                      type="text"
                      id="nuevaInfo"
                      placeholder="Información (comentario)"
                    />
                  </div>

                  <button type="submit" className="boton-agregar">
                    Agregar
                  </button>
                </form>
              </section>

              <section className="inventory-section">
                <h3>Filtrar y ordenar</h3>
                <div id="filtros" className="filters-panel">
                  <input
                    type="text"
                    id="filtroIdRango"
                    className="filtro-input"
                    placeholder="ID exacto o rango (ej: 2, 3-6, -10, 5-)"
                  />

                  <div className="autocomplete-container">
                    <input
                      type="text"
                      id="filtroRecurso"
                      className="filtro-input"
                      placeholder="Filtrar por Recurso"
                      autoComplete="off"
                    />
                    <div id="sugerenciasRecurso" className="autocomplete-box" />
                  </div>

                  <input
                    type="text"
                    id="filtroCategoria"
                    className="filtro-input"
                    list="categorias"
                    placeholder="Filtrar por Categoría"
                  />
                  <datalist id="categorias">
                    <option value="Bombas de agua" />
                    <option value="Herramientas" />
                    <option value="Materiales eléctricos" />
                    <option value="Repuestos" />
                    <option value="Lubricantes" />
                  </datalist>

                  <input
                    type="text"
                    id="filtroInfo"
                    className="filtro-input"
                    placeholder="Filtrar por Información"
                  />

                  <select id="ordenarPor" className="filtro-input" defaultValue="id-desc">
                    <option value="">Ordenar por...</option>
                    <option value="id-asc">ID ↑</option>
                    <option value="id-desc">ID ↓</option>
                    <option value="recurso-asc">Recurso A-Z</option>
                    <option value="recurso-desc">Recurso Z-A</option>
                    <option value="categoria-asc">Categoría A-Z</option>
                    <option value="categoria-desc">Categoría Z-A</option>
                    <option value="cantidad-asc">Cantidad ↑</option>
                    <option value="cantidad-desc">Cantidad ↓</option>
                    <option value="precio-asc">Precio ↑</option>
                    <option value="precio-desc">Precio ↓</option>
                  </select>

                  <button type="button" className="boton-limpiar">
                    Limpiar filtros
                  </button>

                  <div className="exportar-dropdown">
                    <button type="button" className="boton-exportar">
                      Exportar ▼
                    </button>
                    <div id="exportMenu" className="dropdown-content">
                      <div className="submenu">
                        <button type="button" className="submenu-btn" data-submenu="excelSub">
                          Excel ▸
                        </button>
                        <div id="excelSub" className="submenu-content">
                          <a href="#" data-export="excel-visible">Visible</a>
                          <a href="#" data-export="excel-todo">Todo</a>
                        </div>
                      </div>
                      <div className="submenu">
                        <button type="button" className="submenu-btn" data-submenu="csvSub">
                          CSV ▸
                        </button>
                        <div id="csvSub" className="submenu-content">
                          <a href="#" data-export="csv-visible">Visible</a>
                          <a href="#" data-export="csv-todo">Todo</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="tabla-scroll">
                <table id="tablaRecursos">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Recurso</th>
                      <th>Categoría</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Foto</th>
                      <th>Información</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr data-match="1">
                      <td>1</td>
                      <td>Bombas sumergibles 1HP</td>
                      <td>Bombas de agua</td>
                      <td>5</td>
                      <td>120.00</td>
                      <td data-foto=""><img className="thumb" src="" alt="" /></td>
                      <td>Equipo básico</td>
                      <td>
                        <div className="tabla-acciones">
                          <button type="button" className="boton-editar" data-action="edit">Editar</button>
                          <button type="button" className="boton-eliminar" data-action="delete">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                    <tr data-match="1">
                      <td>2</td>
                      <td>Kit reparación rodamientos</td>
                      <td>Repuestos</td>
                      <td>2</td>
                      <td>45.50</td>
                      <td data-foto=""><img className="thumb" src="" alt="" /></td>
                      <td>Incluye grasa</td>
                      <td>
                        <div className="tabla-acciones">
                          <button type="button" className="boton-editar" data-action="edit">Editar</button>
                          <button type="button" className="boton-eliminar" data-action="delete">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="paginacion">
                <button type="button" id="btnAnterior">Anterior</button>
                <span id="infoPagina">Página 1</span>
                <button type="button" id="btnSiguiente">Siguiente</button>
              </div>
            </section>
          </main>

          <footer className="inventory-footer">
            <p>Versión 1.1 - Proyecto Personal para Portafolio</p>
          </footer>
        </div>
      </div>
    </>
  );
}
