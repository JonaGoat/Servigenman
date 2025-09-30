type XLSXNamespace = {
  utils: {
    aoa_to_sheet: (data: unknown[][]) => unknown;
    book_new: () => unknown;
    book_append_sheet: (wb: unknown, ws: unknown, name: string) => void;
  };
  writeFile: (workbook: unknown, filename: string) => void;
};

type WindowWithXLSX = Window & {
  XLSX?: XLSXNamespace;
};

type InventoryItem = {
  id: number;
  recurso: string;
  categoria: string;
  cantidad: number;
  precio: number;
  foto: string;
  info: string;
};

type CleanupFn = () => void;

type FilterOptions = {
  resetPage?: boolean;
};

const INVENTORY_KEY = "inventarioData";
const CATS_KEY = "categoriasInventario";

const filasPorPagina = 10;
let paginaActual = 1;

export function initializeInventoryPage(): CleanupFn {
  if (typeof document === "undefined") {
    return () => {};
  }

  const cleanupFns: CleanupFn[] = [];

  bootstrapInventario();
  ordenarTabla();
  filtrarTabla({ resetPage: true });
  paginaActual = 1;
  actualizarPaginacion();
  initCategoriasDesdeTablaYListas();
  aplicarPresetCategoria();

  const form = document.getElementById("formAgregar");
  if (form) {
    const submitHandler = (event: Event) => {
      void agregarRecurso(event as SubmitEvent);
    };
    form.addEventListener("submit", submitHandler);
    cleanupFns.push(() => form.removeEventListener("submit", submitHandler));
  }

  const filtroInputs: Array<[string, keyof GlobalEventHandlersEventMap]> = [
    ["filtroIdRango", "input"],
    ["filtroRecurso", "input"],
    ["filtroCategoria", "input"],
    ["filtroInfo", "input"],
    ["ordenarPor", "change"],
  ];

  filtroInputs.forEach(([id, evt]) => {
    const element = document.getElementById(id) as HTMLElement | null;
    if (!element) return;

    if (id === "ordenarPor") {
      const handler: EventListener = () => {
        ordenarTabla();
        actualizarPaginacion();
      };
      element.addEventListener(evt, handler);
      cleanupFns.push(() => element.removeEventListener(evt, handler));
      return;
    }

    if (id === "filtroRecurso") {
      const handler: EventListener = () => {
        actualizarSugerencias();
        filtrarTabla({ resetPage: true });
      };
      element.addEventListener(evt, handler);
      cleanupFns.push(() => element.removeEventListener(evt, handler));
      return;
    }

    const handler: EventListener = () => filtrarTabla({ resetPage: true });
    element.addEventListener(evt, handler);
    cleanupFns.push(() => element.removeEventListener(evt, handler));
  });

  const botonLimpiar = document.querySelector(
    "#filtros .boton-limpiar"
  ) as HTMLButtonElement | null;
  if (botonLimpiar) {
    const handler = () => limpiarFiltros();
    botonLimpiar.addEventListener("click", handler);
    cleanupFns.push(() => botonLimpiar.removeEventListener("click", handler));
  }

  const exportToggle = document.querySelector(
    ".boton-exportar"
  ) as HTMLButtonElement | null;
  if (exportToggle) {
    const handler = () => toggleExportMenu();
    exportToggle.addEventListener("click", handler);
    cleanupFns.push(() => exportToggle.removeEventListener("click", handler));
  }

  const submenuButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".submenu-btn")
  );
  submenuButtons.forEach((button) => {
    const handler = () => {
      const submenuId = button.dataset.submenu;
      if (submenuId) {
        toggleSubmenu(submenuId);
      }
    };
    button.addEventListener("click", handler);
    cleanupFns.push(() => button.removeEventListener("click", handler));
  });

  const exportLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-export]")
  );
  exportLinks.forEach((link) => {
    const handler = (event: MouseEvent) => {
      event.preventDefault();
      const action = link.dataset.export;
      if (!action) return;
      if (action === "excel-visible") {
        exportarExcel("visible");
      } else if (action === "excel-todo") {
        exportarExcel("todo");
      } else if (action === "csv-visible") {
        exportarCSV("visible");
      } else if (action === "csv-todo") {
        exportarCSV("todo");
      }
      closeAllMenus();
    };
    link.addEventListener("click", handler);
    cleanupFns.push(() => link.removeEventListener("click", handler));
  });

  const exportContainer = document.querySelector(".exportar-dropdown");
  if (exportContainer) {
    const handler = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      if (!event.target.closest(".exportar-dropdown")) {
        closeAllMenus();
      }
    };
    document.addEventListener("click", handler);
    cleanupFns.push(() => document.removeEventListener("click", handler));
  }

  const btnPrev = document.getElementById("btnAnterior");
  if (btnPrev) {
    const handler = () => cambiarPagina(-1);
    btnPrev.addEventListener("click", handler);
    cleanupFns.push(() => btnPrev.removeEventListener("click", handler));
  }

  const btnNext = document.getElementById("btnSiguiente");
  if (btnNext) {
    const handler = () => cambiarPagina(1);
    btnNext.addEventListener("click", handler);
    cleanupFns.push(() => btnNext.removeEventListener("click", handler));
  }

  const themeSwitch = document.getElementById("themeSwitch") as
    | HTMLInputElement
    | null;
  if (themeSwitch) {
    const handler = () => updateTheme(themeSwitch.checked);
    themeSwitch.addEventListener("change", handler);
    cleanupFns.push(() => themeSwitch.removeEventListener("change", handler));
    applyStoredTheme();
  }

  const filtroRecurso = document.getElementById("filtroRecurso");
  if (filtroRecurso) {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#sugerenciasRecurso")) {
        const sug = document.getElementById("sugerenciasRecurso");
        if (sug) {
          sug.innerHTML = "";
          sug.className = "autocomplete-box";
        }
      }
    };
    document.addEventListener("click", handler);
    cleanupFns.push(() => document.removeEventListener("click", handler));
  }

  const tabla = document.querySelector<HTMLTableElement>("#tablaRecursos");
  if (tabla) {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLButtonElement)) return;
      const action = target.dataset.action;
      if (!action) return;
      if (action === "edit") {
        editarFila(target);
      } else if (action === "delete") {
        eliminarFila(target);
      } else if (action === "save") {
        void guardarFila(target);
      } else if (action === "cancel") {
        cancelarEdicion(target);
      }
    };
    tabla.addEventListener("click", handler);
    cleanupFns.push(() => tabla.removeEventListener("click", handler));
  }

  return () => {
    cleanupFns.forEach((fn) => fn());
  };
}

function getXLSX(): XLSXNamespace | null {
  if (typeof window === "undefined") return null;
  return (window as WindowWithXLSX).XLSX ?? null;
}

function loadJSON<T>(key: string, defVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : defVal;
  } catch (error) {
    console.error("Error parsing storage", error);
    return defVal;
  }
}

function saveJSON(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (error) {
    console.error("Error saving storage", error);
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function nextIdFromStorage(): number {
  const arr = loadJSON<InventoryItem[]>(
    INVENTORY_KEY,
    snapshotInventarioDesdeTabla()
  );
  return arr.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
}

function renderInventarioToDOM(arr: InventoryItem[]) {
  const tbody = document.querySelector<HTMLTableSectionElement>(
    "#tablaRecursos tbody"
  );
  if (!tbody) return;
  tbody.innerHTML = "";

  arr.forEach((item) => {
    const tr = document.createElement("tr");
    tr.dataset.match = "1";
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.recurso}</td>
      <td>${item.categoria}</td>
      <td>${item.cantidad ?? 0}</td>
      <td>${Number(item.precio ?? 0).toFixed(2)}</td>
      <td data-foto="${item.foto ? "1" : ""}">
        ${
          item.foto
            ? `<img class="thumb" src="${item.foto}" alt="" />`
            : '<img class="thumb" src="" alt="" />'
        }
      </td>
      <td>${item.info ? item.info : ""}</td>
      <td>
        <div class="tabla-acciones">
          <button type="button" class="boton-editar" data-action="edit">Editar</button>
          <button type="button" class="boton-eliminar" data-action="delete">Eliminar</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

function snapshotInventarioDesdeTabla(): InventoryItem[] {
  const rows = Array.from(
    document.querySelectorAll<HTMLTableRowElement>("#tablaRecursos tbody tr")
  );
  return rows.map((tr) => {
    const tds = tr.querySelectorAll<HTMLTableCellElement>("td");
    const img = tds[5]?.querySelector<HTMLImageElement>("img");
    return {
      id: Number.parseInt(tds[0]?.innerText ?? "0", 10),
      recurso: tds[1]?.innerText.trim() ?? "",
      categoria: tds[2]?.innerText.trim() ?? "",
      cantidad: Number.parseInt(tds[3]?.innerText || "0", 10) || 0,
      precio: Number.parseFloat(tds[4]?.innerText || "0") || 0,
      foto: img?.src ?? "",
      info: tds[6]?.innerText.trim() ?? "",
    };
  });
}

function persistInventario() {
  const items = snapshotInventarioDesdeTabla();
  saveJSON(INVENTORY_KEY, items);
}

function bootstrapInventario() {
  let data = loadJSON<InventoryItem[] | null>(INVENTORY_KEY, null);
  if (Array.isArray(data) && data.length) {
    renderInventarioToDOM(data);
  } else {
    data = snapshotInventarioDesdeTabla();
    saveJSON(INVENTORY_KEY, data);
  }

  const cats = loadJSON<string[] | null>(CATS_KEY, null);
  if (!Array.isArray(cats) || !cats.length) {
    const set = new Set(
      (data ?? [])
        .map((item) => item?.categoria)
        .filter((value): value is string => Boolean(value))
    );
    saveJSON(CATS_KEY, Array.from(set).sort((a, b) => a.localeCompare(b, "es")));
  }
}

function filtrarTabla({ resetPage = true }: FilterOptions = {}) {
  const inputIdRango =
    (document.getElementById("filtroIdRango") as HTMLInputElement | null)
      ?.value.trim() ?? "";

  let idExacto: number | null = null;
  let idDesde: number | null = null;
  let idHasta: number | null = null;

  if (inputIdRango.includes("-")) {
    const partes = inputIdRango.split("-");
    if (partes[0] !== "" && !Number.isNaN(Number(partes[0]))) {
      idDesde = Number.parseInt(partes[0], 10);
    }
    if (partes[1] !== "" && !Number.isNaN(Number(partes[1]))) {
      idHasta = Number.parseInt(partes[1], 10);
    }
  } else if (!Number.isNaN(Number(inputIdRango)) && inputIdRango !== "") {
    idExacto = Number.parseInt(inputIdRango, 10);
  }

  const inputRecurso = (
    (document.getElementById("filtroRecurso") as HTMLInputElement | null)
      ?.value || ""
  ).toLowerCase();
  const inputCategoria = (
    (document.getElementById("filtroCategoria") as HTMLInputElement | null)
      ?.value || ""
  ).toLowerCase();
  const inputInfo = (
    (document.getElementById("filtroInfo") as HTMLInputElement | null)?.value ||
    ""
  ).toLowerCase();

  const filas = document.querySelectorAll<HTMLTableRowElement>(
    "#tablaRecursos tbody tr"
  );

  filas.forEach((fila) => {
    const celdaId = Number.parseInt(fila.cells[0]?.innerText ?? "0", 10);
    const celdaRecurso = fila.cells[1]?.innerText.toLowerCase() ?? "";
    const celdaCategoria = fila.cells[2]?.innerText.toLowerCase() ?? "";
    const celdaInfo = fila.cells[6]?.innerText.toLowerCase() ?? "";

    const coincideId =
      (idExacto === null || celdaId === idExacto) &&
      (idDesde === null || celdaId >= idDesde) &&
      (idHasta === null || celdaId <= idHasta);

    const mostrar =
      coincideId &&
      celdaRecurso.includes(inputRecurso) &&
      celdaCategoria.includes(inputCategoria) &&
      celdaInfo.includes(inputInfo);

    fila.dataset.match = mostrar ? "1" : "0";
    fila.style.display = mostrar ? "" : "none";
  });

  if (resetPage) paginaActual = 1;
  actualizarPaginacion();
  persistInventario();
}

function ordenarTabla() {
  const sel = document.getElementById("ordenarPor") as HTMLSelectElement | null;
  if (!sel) return;

  const criterio = sel.value;
  const tbody = document.querySelector<HTMLTableSectionElement>(
    "#tablaRecursos tbody"
  );
  if (!tbody) return;

  const filas = Array.from(tbody.querySelectorAll("tr"));

  let columnaIndex = 0;
  let ascendente = true;

  switch (criterio) {
    case "id-asc":
      columnaIndex = 0;
      ascendente = true;
      break;
    case "id-desc":
      columnaIndex = 0;
      ascendente = false;
      break;
    case "recurso-asc":
      columnaIndex = 1;
      ascendente = true;
      break;
    case "recurso-desc":
      columnaIndex = 1;
      ascendente = false;
      break;
    case "categoria-asc":
      columnaIndex = 2;
      ascendente = true;
      break;
    case "categoria-desc":
      columnaIndex = 2;
      ascendente = false;
      break;
    case "cantidad-asc":
      columnaIndex = 3;
      ascendente = true;
      break;
    case "cantidad-desc":
      columnaIndex = 3;
      ascendente = false;
      break;
    case "precio-asc":
      columnaIndex = 4;
      ascendente = true;
      break;
    case "precio-desc":
      columnaIndex = 4;
      ascendente = false;
      break;
    default:
      return;
  }

  filas.sort((a, b) => {
    const valorA = a.cells[columnaIndex]?.innerText.trim().toLowerCase() ?? "";
    const valorB = b.cells[columnaIndex]?.innerText.trim().toLowerCase() ?? "";

    if ([0, 3, 4].includes(columnaIndex)) {
      const numA = Number.parseFloat(valorA.replace(",", ".")) || 0;
      const numB = Number.parseFloat(valorB.replace(",", ".")) || 0;
      return ascendente ? numA - numB : numB - numA;
    }

    if (valorA < valorB) return ascendente ? -1 : 1;
    if (valorA > valorB) return ascendente ? 1 : -1;
    return 0;
  });

  filas.forEach((fila) => tbody.appendChild(fila));
  persistInventario();
}

function limpiarFiltros() {
  const ids = ["filtroIdRango", "filtroRecurso", "filtroCategoria", "filtroInfo"];
  ids.forEach((id) => {
    const element = document.getElementById(id) as HTMLInputElement | null;
    if (element) element.value = "";
  });
  const sugerencias = document.getElementById("sugerenciasRecurso");
  if (sugerencias) sugerencias.innerHTML = "";
  filtrarTabla();
}

function actualizarSugerencias() {
  const recursoInput = document.getElementById("filtroRecurso") as
    | HTMLInputElement
    | null;
  const sugerenciasDiv = document.getElementById("sugerenciasRecurso");
  if (!recursoInput || !sugerenciasDiv) return;

  const texto = recursoInput.value.toLowerCase();
  sugerenciasDiv.innerHTML = "";

  if (texto.length < 2) {
    sugerenciasDiv.className = "autocomplete-box";
    return;
  }

  sugerenciasDiv.className = "autocomplete-box show";

  const arr = loadJSON<InventoryItem[]>(
    INVENTORY_KEY,
    snapshotInventarioDesdeTabla()
  );
  const recursosUnicos = Array.from(
    new Set(arr.map((item) => item.recurso))
  ).sort((a, b) => a.localeCompare(b, "es"));

  const sugerencias = recursosUnicos
    .filter((recurso) => recurso.toLowerCase().includes(texto))
    .slice(0, 12);

  sugerencias.forEach((opcion) => {
    const div = document.createElement("div");
    div.className = "sugerencia-item";
    const regex = new RegExp(`(${texto})`, "gi");
    div.innerHTML = opcion.replace(regex, "<strong>$1</strong>");
    div.addEventListener("click", () => {
      recursoInput.value = opcion;
      sugerenciasDiv.innerHTML = "";
      sugerenciasDiv.className = "autocomplete-box";
      filtrarTabla({ resetPage: true });
    });
    sugerenciasDiv.appendChild(div);
  });
}

function editarFila(button: HTMLButtonElement) {
  const fila = button.closest("tr");
  if (!fila) return;
  const celdas = fila.querySelectorAll<HTMLTableCellElement>("td");

  const original = {
    recurso: celdas[1]?.innerText ?? "",
    categoria: celdas[2]?.innerText ?? "",
    cantidad: celdas[3]?.innerText ?? "0",
    precio: celdas[4]?.innerText ?? "0",
    imgSrc: celdas[5]?.querySelector("img")?.src ?? "",
    info: celdas[6]?.innerText ?? "",
  };

  fila.dataset.original = JSON.stringify(original);

  celdas[1].innerHTML = `<input type="text" value="${original.recurso}" class="editar-input" />`;
  celdas[2].innerHTML = `<input type="text" value="${original.categoria}" class="editar-input" />`;
  celdas[3].innerHTML = `<input type="number" value="${original.cantidad}" min="0" step="1" class="editar-input" />`;
  celdas[4].innerHTML = `<input type="number" value="${original.precio}" min="0" step="0.01" class="editar-input precio" />`;
  celdas[5].innerHTML = `
    <div>
      ${
        original.imgSrc
          ? `<img class="thumb" src="${original.imgSrc}" alt="" />`
          : '<img class="thumb" src="" alt="" />'
      }
      <input type="file" class="editar-foto" accept="image/*" style="display:block; margin-top:6px;" />
    </div>`;
  celdas[6].innerHTML = `<input type="text" value="${original.info}" class="editar-input info" />`;
  celdas[7].innerHTML = `
    <div class="tabla-acciones">
      <button type="button" class="boton-guardar" data-action="save">Guardar</button>
      <button type="button" class="boton-cancelar" data-action="cancel">Cancelar</button>
    </div>`;
}

async function guardarFila(button: HTMLButtonElement) {
  const fila = button.closest("tr");
  if (!fila) return;
  const celdas = fila.querySelectorAll<HTMLTableCellElement>("td");

  const nuevoRecurso = celdas[1]?.querySelector<HTMLInputElement>("input")?.value.trim() ?? "";
  const nuevaCategoria =
    celdas[2]?.querySelector<HTMLInputElement>("input")?.value.trim() ?? "";
  const nuevaCantidad = Number.parseInt(
    celdas[3]?.querySelector<HTMLInputElement>("input")?.value || "0",
    10
  );
  const nuevoPrecio = Number.parseFloat(
    celdas[4]?.querySelector<HTMLInputElement>("input")?.value || "0"
  );

  const fileInput = celdas[5]?.querySelector<HTMLInputElement>("input[type='file']");
  const imgElement = celdas[5]?.querySelector<HTMLImageElement>("img");
  const nuevaInfo = celdas[6]?.querySelector<HTMLInputElement>("input")?.value.trim() ?? "";

  let fotoDataURL = imgElement?.src ?? "";
  if (fileInput && fileInput.files && fileInput.files[0]) {
    fotoDataURL = await readFileAsDataURL(fileInput.files[0]);
  }

  celdas[1].innerText = nuevoRecurso;
  celdas[2].innerText = nuevaCategoria;
  celdas[3].innerText = Number.isNaN(nuevaCantidad) ? "0" : String(nuevaCantidad);
  celdas[4].innerText = Number.isNaN(nuevoPrecio)
    ? "0.00"
    : nuevoPrecio.toFixed(2);
  celdas[5].innerHTML = `<img class="thumb" src="${fotoDataURL || ""}" alt="" />`;
  celdas[6].innerText = nuevaInfo;
  celdas[7].innerHTML = `
    <div class="tabla-acciones">
      <button type="button" class="boton-editar" data-action="edit">Editar</button>
      <button type="button" class="boton-eliminar" data-action="delete">Eliminar</button>
    </div>`;

  fila.dataset.original = "";
  persistInventario();
  const arr = loadJSON<InventoryItem[]>(
    INVENTORY_KEY,
    snapshotInventarioDesdeTabla()
  );
  renderInventarioToDOM(arr);
  filtrarTabla({ resetPage: false });
  ordenarTabla();
  actualizarPaginacion();
}

function cancelarEdicion(button: HTMLButtonElement) {
  const fila = button.closest("tr");
  if (!fila) return;
  const originalRaw = fila.dataset.original;
  if (!originalRaw) return;

  const original = JSON.parse(originalRaw) as {
    recurso: string;
    categoria: string;
    cantidad: string;
    precio: string;
    imgSrc: string;
    info: string;
  };

  const celdas = fila.querySelectorAll<HTMLTableCellElement>("td");
  celdas[1].innerText = original.recurso;
  celdas[2].innerText = original.categoria;
  celdas[3].innerText = original.cantidad;
  celdas[4].innerText = Number(original.precio || 0).toFixed(2);
  celdas[5].innerHTML = `<img class="thumb" src="${original.imgSrc || ""}" alt="" />`;
  celdas[6].innerText = original.info;
  celdas[7].innerHTML = `
    <div class="tabla-acciones">
      <button type="button" class="boton-editar" data-action="edit">Editar</button>
      <button type="button" class="boton-eliminar" data-action="delete">Eliminar</button>
    </div>`;
  fila.dataset.original = "";
  filtrarTabla();
  ordenarTabla();
  actualizarPaginacion();
}

function eliminarFila(button: HTMLButtonElement) {
  if (!window.confirm("¿Estás seguro de que deseas eliminar este recurso?")) {
    return;
  }

  const fila = button.closest("tr");
  fila?.remove();
  persistInventario();
  const arr = loadJSON<InventoryItem[]>(
    INVENTORY_KEY,
    snapshotInventarioDesdeTabla()
  );
  renderInventarioToDOM(arr);
  filtrarTabla({ resetPage: false });
  ordenarTabla();
  actualizarPaginacion();
}

async function agregarRecurso(event: SubmitEvent) {
  event.preventDefault();

  const recurso =
    (document.getElementById("nuevoRecurso") as HTMLInputElement | null)?.value.trim() ??
    "";
  const categoria =
    (document.getElementById("nuevaCategoria") as HTMLInputElement | null)?.value.trim() ??
    "";
  const cantidad = Number.parseInt(
    (document.getElementById("nuevaCantidad") as HTMLInputElement | null)?.value ||
      "0",
    10
  );
  const precio = Number.parseFloat(
    (document.getElementById("nuevoPrecio") as HTMLInputElement | null)?.value || "0"
  );
  const file = (document.getElementById("nuevaFoto") as HTMLInputElement | null)
    ?.files?.[0] ?? null;
  const info =
    (document.getElementById("nuevaInfo") as HTMLInputElement | null)?.value.trim() ?? "";

  if (!recurso || !categoria) return;

  const arr = loadJSON<InventoryItem[]>(
    INVENTORY_KEY,
    snapshotInventarioDesdeTabla()
  );
  let fotoDataURL = "";
  if (file) {
    fotoDataURL = await readFileAsDataURL(file);
  }

  const nuevo: InventoryItem = {
    id: nextIdFromStorage(),
    recurso,
    categoria,
    cantidad: Number.isNaN(cantidad) ? 0 : cantidad,
    precio: Number.isNaN(precio) ? 0 : precio,
    foto: fotoDataURL,
    info,
  };

  arr.push(nuevo);
  saveJSON(INVENTORY_KEY, arr);
  renderInventarioToDOM(arr);
  syncDatalistsCategoria(categoria);

  const form = document.getElementById("formAgregar") as HTMLFormElement | null;
  form?.reset();

  const paginaPrev = paginaActual;
  filtrarTabla({ resetPage: false });
  ordenarTabla();
  persistInventario();

  const totalFiltradas = document.querySelectorAll(
    "#tablaRecursos tbody tr[data-match='1']"
  ).length;
  const totalPaginas = Math.max(1, Math.ceil(totalFiltradas / filasPorPagina));
  paginaActual = Math.min(paginaPrev, totalPaginas);
  actualizarPaginacion();
}

function syncDatalistsCategoria(catNueva: string) {
  if (!catNueva) return;
  const dlForm = document.getElementById("categoriasFormulario") as
    | HTMLDataListElement
    | null;
  const dlFilt = document.getElementById("categorias") as
    | HTMLDataListElement
    | null;

  const normalized = catNueva.toLowerCase();

  if (
    dlForm &&
    !Array.from(dlForm.options).some(
      (option) => option.value.toLowerCase() === normalized
    )
  ) {
    const opt = document.createElement("option");
    opt.value = catNueva;
    dlForm.appendChild(opt);
  }

  if (
    dlFilt &&
    !Array.from(dlFilt.options).some(
      (option) => option.value.toLowerCase() === normalized
    )
  ) {
    const opt = document.createElement("option");
    opt.value = catNueva;
    dlFilt.appendChild(opt);
  }

  const cats = loadJSON<string[]>(CATS_KEY, []);
  if (!cats.some((cat) => cat.toLowerCase() === normalized)) {
    cats.push(catNueva);
    saveJSON(CATS_KEY, cats);
  }
}

function toggleExportMenu() {
  const menu = document.getElementById("exportMenu");
  if (!menu) return;
  menu.classList.toggle("show");
  if (!menu.classList.contains("show")) {
    document
      .querySelectorAll<HTMLElement>(".submenu-content")
      .forEach((submenu) => submenu.classList.remove("show"));
  }
}

function toggleSubmenu(id: string) {
  document.querySelectorAll<HTMLElement>(".submenu-content").forEach((submenu) => {
    if (submenu.id !== id) submenu.classList.remove("show");
  });
  const sub = document.getElementById(id);
  sub?.classList.toggle("show");
}

function closeAllMenus() {
  document.getElementById("exportMenu")?.classList.remove("show");
  document
    .querySelectorAll<HTMLElement>(".submenu-content")
    .forEach((submenu) => submenu.classList.remove("show"));
}

function exportarCSV(opcion: "visible" | "todo") {
  const filas = opcion === "visible" ? filasPaginaActual() : filasFiltradas();
  const encabezados = encabezadosTabla();
  const datos = datosDesdeFilas(filas);

  const lineas: string[] = [];
  lineas.push(encabezados.join(","));
  datos.forEach((arr) => {
    const linea = arr.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",");
    lineas.push(linea);
  });

  const blob = new Blob([lineas.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opcion === "visible" ? "inventario_visible.csv" : "inventario_todo.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportarExcel(opcion: "visible" | "todo") {
  const filas = opcion === "visible" ? filasPaginaActual() : filasFiltradas();
  const encabezados = encabezadosTabla();
  const datos = [encabezados, ...datosDesdeFilas(filas)];
  const xlsx = getXLSX();
  if (!xlsx) {
    console.warn("Biblioteca XLSX no disponible");
    return;
  }
  const ws = xlsx.utils.aoa_to_sheet(datos as unknown[][]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Inventario");
  xlsx.writeFile(
    wb,
    opcion === "visible" ? "inventario_visible.xlsx" : "inventario_todo.xlsx"
  );
}

function filasFiltradas(): HTMLTableRowElement[] {
  const tbody = document.querySelector<HTMLTableSectionElement>(
    "#tablaRecursos tbody"
  );
  if (!tbody) return [];
  return Array.from(tbody.querySelectorAll("tr")).filter(
    (tr) => tr.dataset.match === "1"
  );
}

function filasPaginaActual(): HTMLTableRowElement[] {
  const todas = filasFiltradas();
  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  return todas.slice(inicio, fin);
}

function datosDesdeFilas(filas: HTMLTableRowElement[]) {
  return filas.map((tr) => {
    const tds = tr.querySelectorAll<HTMLTableCellElement>("td");
    const tieneFoto = Boolean(tds[5]?.querySelector("img")?.src);
    return [
      tds[0]?.innerText ?? "",
      tds[1]?.innerText ?? "",
      tds[2]?.innerText ?? "",
      tds[3]?.innerText ?? "",
      tds[4]?.innerText ?? "",
      tieneFoto ? "sí" : "no",
      tds[6]?.innerText ?? "",
    ];
  });
}

function encabezadosTabla() {
  return ["ID", "Recurso", "Categoría", "Cantidad", "Precio", "Foto", "Información"];
}

function actualizarPaginacion() {
  const tbody = document.querySelector<HTMLTableSectionElement>(
    "#tablaRecursos tbody"
  );
  if (!tbody) return;
  const filas = Array.from(tbody.querySelectorAll("tr"));
  const filtradas = filas.filter((fila) => fila.dataset.match === "1");

  const total = filtradas.length;
  const totalPaginas = Math.max(1, Math.ceil(total / filasPorPagina));
  if (paginaActual > totalPaginas) paginaActual = totalPaginas;
  if (paginaActual < 1) paginaActual = 1;

  filtradas.forEach((fila) => {
    fila.style.display = "none";
  });

  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  filtradas.slice(inicio, fin).forEach((fila) => {
    fila.style.display = "";
  });

  const info = document.getElementById("infoPagina");
  if (info) {
    info.textContent = `Página ${paginaActual} de ${totalPaginas}`;
  }

  const btnAnterior = document.getElementById("btnAnterior") as HTMLButtonElement | null;
  const btnSiguiente = document.getElementById("btnSiguiente") as
    | HTMLButtonElement
    | null;
  if (btnAnterior) btnAnterior.disabled = paginaActual <= 1;
  if (btnSiguiente) btnSiguiente.disabled = paginaActual >= totalPaginas;

  persistInventario();
}

function cambiarPagina(direccion: number) {
  paginaActual += direccion;
  actualizarPaginacion();
}

function updateTheme(isDark: boolean) {
  const body = document.body;
  const label = document.getElementById("themeLabel");
  if (isDark) {
    body.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    if (label) label.textContent = "Oscuro";
  } else {
    body.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    if (label) label.textContent = "Claro";
  }
}

function applyStoredTheme() {
  const saved = localStorage.getItem("theme");
  const body = document.body;
  const toggle = document.getElementById("themeSwitch") as HTMLInputElement | null;
  const label = document.getElementById("themeLabel");
  if (saved === "dark") {
    body.setAttribute("data-theme", "dark");
    if (toggle) toggle.checked = true;
    if (label) label.textContent = "Oscuro";
  } else {
    body.removeAttribute("data-theme");
    if (toggle) toggle.checked = false;
    if (label) label.textContent = "Claro";
  }
}

function initCategoriasDesdeTablaYListas() {
  const set = new Set<string>();
  document.querySelectorAll<HTMLTableRowElement>("#tablaRecursos tbody tr").forEach((tr) => {
    const cat = tr.cells[2]?.innerText.trim();
    if (cat) set.add(cat);
  });

  document.querySelectorAll<HTMLDataListElement>("#categorias option").forEach((opt) => {
    const value = opt.value.trim();
    if (value) set.add(value);
  });

  document
    .querySelectorAll<HTMLDataListElement>("#categoriasFormulario option")
    .forEach((opt) => {
      const value = opt.value.trim();
      if (value) set.add(value);
    });

  localStorage.setItem(CATS_KEY, JSON.stringify(Array.from(set)));
}

function aplicarPresetCategoria() {
  const preset = localStorage.getItem("presetCategoria");
  if (!preset) return;
  const input = document.getElementById("filtroCategoria") as HTMLInputElement | null;
  if (input) {
    input.value = preset;
    filtrarTabla({ resetPage: true });
  }
  localStorage.removeItem("presetCategoria");
}
