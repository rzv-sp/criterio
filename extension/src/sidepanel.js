// Side Panel de Criterio - Actualización automática fiable

const statusEl = document.getElementById("status");
const sourceCard = document.getElementById("source-card");
const signalsCard = document.getElementById("signals-card");
const signalsList = document.getElementById("signals-list");

let refreshInterval = null;

function showSource(source) {
  if (!source) {
    statusEl.textContent = "Fuente no catalogada";
    sourceCard.style.display = "none";
    return;
  }
  document.getElementById("source-name").textContent = source.name || "—";
  document.getElementById("source-bias").textContent = source.bias || "—";
  document.getElementById("source-reliability").textContent = source.reliability || "—";
  document.getElementById("source-notes").textContent = source.notes || "";
  sourceCard.style.display = "block";
  statusEl.style.display = "none";
}

function showSignals(counts = {}) {
  signalsList.innerHTML = "";
  const labels = {
    loaded: "Lenguaje cargado",
    weak: "Atribución débil",
    certainty: "Certeza excesiva",
    official: "Documentos oficiales"
  };

  let hasAny = false;
  for (const [key, count] of Object.entries(counts)) {
    if (count > 0) {
      hasAny = true;
      const div = document.createElement("div");
      div.className = "signal-item";
      div.innerHTML = `<span>${labels[key] || key}</span><strong>${count}</strong>`;
      signalsList.appendChild(div);
    }
  }

  if (!hasAny) {
    signalsList.innerHTML = `<div class="muted">No se han detectado señales destacadas.</div>`;
  }
  signalsCard.style.display = "block";
}

async function requestAnalysis() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { action: "getAnalysis" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        statusEl.style.display = "block";
        statusEl.textContent = "Analizando página...";
        return;
      }
      showSource(response.source);
      showSignals(response.signals);
    });
  } catch (e) {
    console.error("Error en requestAnalysis:", e);
  }
}

// Iniciar actualización automática cada 2 segundos mientras el panel esté abierto
function startAutoRefresh() {
  requestAnalysis(); // Primera vez inmediata
  refreshInterval = setInterval(requestAnalysis, 2000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Arrancar al abrir el panel
startAutoRefresh();

// Opcional: parar cuando se cierra el panel (ahorra recursos)
window.addEventListener("unload", stopAutoRefresh);
