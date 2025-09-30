/* eslint-disable @typescript-eslint/no-explicit-any */

type InventoryItem = {
  id: number;
  recurso: string;
  categoria: string;
  cantidad: number;
  precio: number;
  foto: string;
  info: string;
};

type CategorySummary = {
  name: string;
  resourceCount: number;
  totalQuantity: number;
  totalValue: number;
};

type CleanupFn = () => void;

type ChartConfiguration = {
  type: string;
  data: Record<string, any>;
  options?: Record<string, any>;
};

type ChartHandle = {
  destroy: () => void;
};

type ChartLibrary = {
  new (
    context: CanvasRenderingContext2D | HTMLCanvasElement,
    config: ChartConfiguration
  ): ChartHandle;
  getChart?: (
    context: string | HTMLCanvasElement
  ) => ChartHandle | undefined;
};

type WindowWithChart = Window & {
  Chart?: ChartLibrary;
};

const INVENTORY_KEY = "inventarioData";
const CATS_KEY = "categoriasInventario";
const DEFAULT_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    recurso: "Bombas sumergibles 1HP",
    categoria: "Bombas de agua",
    cantidad: 5,
    precio: 120,
    foto: "",
    info: "Equipo básico",
  },
  {
    id: 2,
    recurso: "Kit reparación rodamientos",
    categoria: "Repuestos",
    cantidad: 2,
    precio: 45.5,
    foto: "",
    info: "Incluye grasa",
  },
];

const numberFormatter = new Intl.NumberFormat("es-CO");
const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

let pieChart: ChartHandle | null = null;
let barChart: ChartHandle | null = null;
let chartWaitTimeout: number | null = null;

export function initializeBudgetPage(): CleanupFn {
  if (typeof document === "undefined") {
    return () => {};
  }

  const cleanupFns: CleanupFn[] = [];

  const refresh = () => {
    renderBudget();
  };

  cleanupFns.push(
    setupThemeToggle(refresh),
    setupStorageSync(refresh),
    setupFocusSync(refresh)
  );

  renderBudget();
  ensureChartLibrary(() => {
    renderBudget();
  });

  updateCurrentYear();

  return () => {
    cleanupFns.forEach((fn) => fn());
    if (chartWaitTimeout !== null) {
      window.clearTimeout(chartWaitTimeout);
      chartWaitTimeout = null;
    }
    destroyCharts();
  };
}

function renderBudget() {
  const inventory = loadInventory();
  const storedCategories = loadJSON<string[]>(CATS_KEY, []);
  const summaries = buildCategorySummaries(inventory, storedCategories);

  renderKpis(inventory, summaries);
  renderCategoryTable(summaries);
  renderCharts(inventory, summaries);
}

function loadInventory(): InventoryItem[] {
  return loadJSON<InventoryItem[]>(INVENTORY_KEY, DEFAULT_INVENTORY);
}

function buildCategorySummaries(
  items: InventoryItem[],
  storedCategories: string[]
): CategorySummary[] {
  const summaries = new Map<string, CategorySummary>();
  const allCategories = new Set<string>(storedCategories);
  items.forEach((item) => {
    if (item.categoria) {
      allCategories.add(item.categoria);
    }
  });

  allCategories.forEach((name) => {
    summaries.set(name, {
      name,
      resourceCount: 0,
      totalQuantity: 0,
      totalValue: 0,
    });
  });

  items.forEach((item) => {
    const key = item.categoria || "Sin categoría";
    if (!summaries.has(key)) {
      summaries.set(key, {
        name: key,
        resourceCount: 0,
        totalQuantity: 0,
        totalValue: 0,
      });
    }
    const summary = summaries.get(key);
    if (!summary) {
      return;
    }

    summary.resourceCount += 1;
    summary.totalQuantity += item.cantidad ?? 0;
    summary.totalValue += (item.cantidad ?? 0) * (item.precio ?? 0);
  });

  return Array.from(summaries.values()).sort((a, b) => {
    if (b.totalValue === a.totalValue) {
      return a.name.localeCompare(b.name, "es");
    }
    return b.totalValue - a.totalValue;
  });
}

function renderKpis(items: InventoryItem[], summaries: CategorySummary[]) {
  const container = document.getElementById("budgetKpis");
  if (!container) return;

  container.innerHTML = "";

  const totalValue = items.reduce(
    (acc, item) => acc + (item.cantidad ?? 0) * (item.precio ?? 0),
    0
  );
  const totalUnits = items.reduce((acc, item) => acc + (item.cantidad ?? 0), 0);
  const averageTicket = items.length ? totalValue / items.length : 0;
  const leader = summaries[0];

  const cards = [
    {
      title: "Valor total inventario",
      value: currencyFormatter.format(totalValue),
    },
    {
      title: "Recursos registrados",
      value: numberFormatter.format(items.length),
    },
    {
      title: "Unidades totales",
      value: numberFormatter.format(totalUnits),
    },
    {
      title: "Ticket promedio por recurso",
      value: currencyFormatter.format(averageTicket),
    },
  ];

  if (leader) {
    cards.push({
      title: "Categoría con mayor inversión",
      value: `${leader.name} · ${currencyFormatter.format(leader.totalValue)}`,
    });
  }

  cards.forEach((card) => {
    const article = document.createElement("article");
    article.className = "kpi-card";
    article.innerHTML = `
      <p class="kpi-title">${card.title}</p>
      <p class="kpi-value">${card.value}</p>
    `;
    container.appendChild(article);
  });
}

function renderCategoryTable(summaries: CategorySummary[]) {
  const tbody = document.querySelector<HTMLTableSectionElement>(
    "#tablaResumenCat tbody"
  );
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!summaries.length) {
    const emptyRow = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.className = "table-empty";
    cell.textContent = "No hay categorías registradas todavía.";
    emptyRow.appendChild(cell);
    tbody.appendChild(emptyRow);
    return;
  }

  summaries.forEach((summary) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${summary.name}</td>
      <td class="text-right">${numberFormatter.format(summary.resourceCount)}</td>
      <td class="text-right">${numberFormatter.format(summary.totalQuantity)}</td>
      <td class="text-right">${currencyFormatter.format(summary.totalValue)}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderCharts(
  items: InventoryItem[],
  summaries: CategorySummary[]
) {
  const Chart = getChartLibrary();
  if (!Chart) {
    return;
  }

  const pieColors = getPalette(summaries.length);

  const pieCanvas = document.getElementById("chartPie") as
    | HTMLCanvasElement
    | null;
  if (pieCanvas) {
    if (pieChart) {
      pieChart.destroy();
      pieChart = null;
    } else if (Chart.getChart?.(pieCanvas)) {
      Chart.getChart(pieCanvas)?.destroy();
    }
    pieChart = new Chart(pieCanvas, {
      type: "doughnut",
      data: {
        labels: summaries.map((summary) => summary.name),
        datasets: [
          {
            data: summaries.map((summary) => summary.totalValue),
            backgroundColor: pieColors,
            borderWidth: 1,
            borderColor: pieColors.map(() => "rgba(255,255,255,0.12)"),
          },
        ],
      },
      options: buildSharedChartOptions({
        isDark: isDarkTheme(),
        doughnut: true,
      }),
    });
  }

  const resourceValues = items
    .map((item) => ({
      label: item.recurso || `Recurso ${item.id}`,
      value: (item.cantidad ?? 0) * (item.precio ?? 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const barColors = getPalette(resourceValues.length);

  const barCanvas = document.getElementById("chartBar") as
    | HTMLCanvasElement
    | null;
  if (barCanvas) {
    if (barChart) {
      barChart.destroy();
      barChart = null;
    } else if (Chart.getChart?.(barCanvas)) {
      Chart.getChart(barCanvas)?.destroy();
    }
    barChart = new Chart(barCanvas, {
      type: "bar",
      data: {
        labels: resourceValues.map((item) => item.label),
        datasets: [
          {
            label: "Valor total",
            data: resourceValues.map((item) => item.value),
            backgroundColor: barColors,
            borderRadius: 8,
          },
        ],
      },
      options: buildSharedChartOptions({ isDark: isDarkTheme() }),
    });
  }
}

function buildSharedChartOptions({
  isDark,
  doughnut = false,
}: {
  isDark: boolean;
  doughnut?: boolean;
}) {
  const axisColor = isDark ? "#cbd5f5" : "#475569";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.2)"
    : "rgba(148, 163, 184, 0.3)";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: axisColor,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label(context: any) {
            const value = Number(context.raw ?? 0);
            return `${context.label}: ${currencyFormatter.format(value)}`;
          },
        },
      },
    },
    scales: doughnut
      ? undefined
      : {
          x: {
            ticks: {
              color: axisColor,
              callback(
                value: string | number,
                index: number,
                ticks: Array<{ label?: string }>
              ) {
                const label = ticks[index]?.label ?? String(value);
                return label.length > 16 ? `${label.slice(0, 16)}…` : label;
              },
            },
            grid: {
              color: gridColor,
            },
          },
          y: {
            ticks: {
              color: axisColor,
              callback(value: number | string) {
                if (typeof value === "string") {
                  return value;
                }
                return currencyFormatter.format(value as number);
              },
            },
            grid: {
              color: gridColor,
            },
          },
        },
  };
}

function ensureChartLibrary(callback: () => void) {
  if (getChartLibrary()) {
    chartWaitTimeout = null;
    callback();
    return;
  }

  chartWaitTimeout = window.setTimeout(() => {
    ensureChartLibrary(callback);
  }, 250);
}

function destroyCharts() {
  pieChart?.destroy();
  pieChart = null;
  barChart?.destroy();
  barChart = null;
}

function setupThemeToggle(refresh: () => void): CleanupFn {
  const toggle = document.getElementById("themeSwitch") as HTMLInputElement | null;
  const handler = () => {
    updateTheme(Boolean(toggle?.checked));
    refresh();
  };
  toggle?.addEventListener("change", handler);
  applyStoredTheme();
  return () => toggle?.removeEventListener("change", handler);
}

function setupStorageSync(refresh: () => void): CleanupFn {
  const handler = (event: StorageEvent) => {
    if (!event.key || [INVENTORY_KEY, CATS_KEY, "theme"].includes(event.key)) {
      refresh();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function setupFocusSync(refresh: () => void): CleanupFn {
  const handler = () => refresh();
  window.addEventListener("focus", handler);
  return () => window.removeEventListener("focus", handler);
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed;
  } catch (error) {
    console.error("Error reading storage", error);
    return fallback;
  }
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

function getPalette(count: number) {
  const base = [
    "#6d78ff",
    "#2ad1ff",
    "#55efc4",
    "#ffeaa7",
    "#a29bfe",
    "#ff7675",
    "#74b9ff",
    "#81ecec",
    "#fab1a0",
    "#fd79a8",
    "#fdcb6e",
    "#00cec9",
  ];
  if (count <= base.length) {
    return base.slice(0, Math.max(count, 0));
  }
  const colors: string[] = [];
  for (let index = 0; index < count; index += 1) {
    colors.push(base[index % base.length]);
  }
  return colors;
}

function isDarkTheme() {
  return document.body.getAttribute("data-theme") === "dark";
}

function getChartLibrary(): ChartLibrary | null {
  if (typeof window === "undefined") {
    return null;
  }
  return (window as WindowWithChart).Chart ?? null;
}

function updateCurrentYear() {
  const target = document.getElementById("year");
  if (target) {
    target.textContent = String(new Date().getFullYear());
  }
}
