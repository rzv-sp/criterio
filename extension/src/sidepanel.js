console.log("Side Panel cargado");

const statusEl = document.getElementById("status");
const sourceCard = document.getElementById("source-card");
const signalsCard = document.getElementById("signals-card");
const signalsList = document.getElementById("signals-list");

function updateUI(data) {
  if (!data) {
    statusEl.style.display = "block";
    statusEl.textContent = "Sin datos de la página";
    sourceCard.style.display = "none";
    signalsCard.style.display = "none";
    return;
  }

  // Fuente
  if (data.source) {
    document.getElementById("source-name").textContent = data.source.name || "Desconocido";
    document.getElementById("source-bias").textContent = data.source.bias || "—";
    document.getElementById("source-reliability").textContent = data.source.reliability || "—";
    document.getElementById("source-notes").textContent = data.source.notes || "";
    sourceCard.style.display = "block";
    statusEl.style.display = "none";
  } else {
    statusEl.style.display = "block";
    statusEl.textContent = "Fuente no catalogada";
    sourceCard.style.display = "none";
  }

  // Señales
  signalsList.innerHTML = "";
  const counts = data.signals || {};
  let total = 0;
  for (const [key, value] of Object.entries(counts)) {
    if (value > 0) {
      total += value;
      const div = document.createElement("div");
      div.className = "signal-item";
      div.innerHTML = `<span>${key}</span><strong>${value}</strong>`;
      signalsList.appendChild(div);
    }
  }
  if (total === 0) {
    signalsList.innerHTML = `<div class="muted">Ninguna señal detectada</div>`;
  }
  signalsCard.style.display = "block";
}

async function refresh() {
  console.log("Intentando refrescar...");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      updateUI(null);
      return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "getAnalysis" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Error de mensaje:", chrome.runtime.lastError.message);
        statusEl.style.display = "block";
        statusEl.textContent = "Recarga la página de la noticia";
        return;
      }
      console.log("Respuesta recibida:", response);
      updateUI(response);
    });
  } catch (err) {
    console.error(err);
  }
}

// Refrescar cada 1.5 segundos
setInterval(refresh, 1500);

// Refrescar también al activar la pestaña
chrome.tabs.onActivated.addListener(() => setTimeout(refresh, 300));
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status === "complete") setTimeout(refresh, 800);
});

// Primera carga
refresh();
Pasos importantes

Sustituye todo el sidepanel.js con el código de arriba y haz commit.
Descarga el ZIP nuevo y sustituye la carpeta.
En chrome://extensions quita la extensión y vuelve a cargarla (no solo recargar).
Abre una noticia.
Abre el Side Panel.
Haz clic derecho dentro del Side Panel → Inspeccionar.
Mira la pestaña Consola. Deberías ver mensajes como “Intentando refrescar...” y “Respuesta recibida”.
Dime qué mensajes aparecen en esa consola del Side Panel cuando cambias de noticia. Con eso sabremos exactamente dónde está fallando.
