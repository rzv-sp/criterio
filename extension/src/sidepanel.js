/ Side Panel de Criterio - Versión con actualización automática

const statusEl = document.getElementById("status");
const sourceCard = document.getElementById("source-card");
const signalsCard = document.getElementById("signals-card");
const signalsList = document.getElementById("signals-list");

function showSource(source) {
  if (!source) {
    statusEl.textContent = "Fuente no catalogada";
    sourceCard.style.display = "none";
    return;
  }
  document.getElementById("source-name").textContent = source.name;
  document.getElementById("source-bias").textContent = source.bias;
  document.getElementById("source-reliability").textContent = source.reliability;
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
  const colors = {
    loaded: "loaded",
    weak: "weak",
    certainty: "certainty",
    official: "official"
  };

  let hasAny = false;
  for (const [key, count] of Object.entries(counts)) {
    if (count > 0) {
      hasAny = true;
      const div = document.createElement("div");
      div.className = "signal-item";
      div.innerHTML = `<span><span class="dot ${colors[key] || ""}"></span>${labels[key] || key}</span><strong>${count}</strong>`;
      signalsList.appendChild(div);
    }
  }

  if (!hasAny) {
    signalsList.innerHTML = `<div class="muted">No se han detectado señales destacadas.</div>`;
  }
  signalsCard.style.display = "block";
}

async function requestAnalysis() {
  statusEl.style.display = "block";
  statusEl.textContent = "Analizando...";
  sourceCard.style.display = "none";
  signalsCard.style.display = "none";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      statusEl.textContent = "No hay pestaña activa.";
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "getAnalysis" }, (response) => {
      if (chrome.runtime.lastError || !response) {
        statusEl.textContent = "No se pudo analizar esta página. Recarga la noticia.";
        return;
      }
      showSource(response.source);
      showSignals(response.signals);
    });
  } catch (e) {
    statusEl.textContent = "Error de conexión.";
    console.error(e);
  }
}

// Actualización automática
function setupAutoRefresh() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      setTimeout(requestAnalysis, 1000);
    }
  });

  chrome.tabs.onActivated.addListener(() => {
    setTimeout(requestAnalysis, 500);
  });
}

// Iniciar
requestAnalysis();
