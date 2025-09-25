/* ---------------- Configuración blockchain ---------------- */
const contractAddress = "0xTU_CONTRATO_AQUI"; // Reemplaza con tu dirección real
const abi = [
  "function reward(address to, uint256 amount) public"
];

let provider, signer, contract;

// Elementos del DOM
const connectButton = document.getElementById("connectButton");
const accountEl = document.getElementById("account");
const claimButton = document.getElementById("claimButton");
const statusEl = document.getElementById("status");
const puntajeEl = document.getElementById("puntaje");
const gameArea = document.getElementById("gameArea");

// Juego
let puntaje = 0;
puntajeEl.textContent = puntaje;

// Cursor personalizado
const cursor = document.createElement("div");
cursor.classList.add("cursor");
document.body.appendChild(cursor);
document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

/* ---------------- Funciones de juego ---------------- */
// Mueve solo la mosca que se hace click dentro de gameArea
function moverMoscaEl(el) {
  const w = el.clientWidth || 100;
  const h = el.clientHeight || 100;

  const rect = gameArea.getBoundingClientRect();
  const x = Math.random() * (rect.width - w);
  const y = Math.random() * (rect.height - h);
  const rotacion = Math.random() * 360;

  el.dataset.x = x;
  el.dataset.y = y;
  el.dataset.rot = rotacion;

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = `rotate(${rotacion}deg) scale(1)`;
}

function aumentarPuntaje() {
  puntaje++;
  puntajeEl.textContent = puntaje;
  actualizarEstadoClaim();
}

function setupMoscaClick(mosca) {
  mosca.addEventListener("click", (ev) => {
    ev.stopPropagation();
    mosca.style.transform = mosca.style.transform + " scale(1.1)";
    setTimeout(() => moverMoscaEl(mosca), 70);
    agregarMosca();
    aumentarPuntaje();
  });
}

function agregarMosca() {
  const nuevaMosca = document.createElement("img");
  nuevaMosca.src = "imagenes/mosca.png";
  nuevaMosca.alt = "Mosca";
  nuevaMosca.classList.add("mosca");
  nuevaMosca.style.width = "100px";
  nuevaMosca.style.height = "auto";
  nuevaMosca.style.position = "absolute";
  nuevaMosca.style.cursor = "pointer";

  setupMoscaClick(nuevaMosca);
  gameArea.appendChild(nuevaMosca);
  moverMoscaEl(nuevaMosca);
  return nuevaMosca;
}

// Inicializamos mosca del DOM
const moscaInit = document.getElementById("mosca");
if (moscaInit) {
  moscaInit.classList.add("mosca");
  setupMoscaClick(moscaInit);
  moverMoscaEl(moscaInit);
} else {
  agregarMosca();
}

/* ---------------- Funciones MetaMask / ethers.js ---------------- */
function actualizarEstadoClaim() {
  claimButton.disabled = !(provider && signer && puntaje > 0 && contract);
}

async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("No se detectó MetaMask.");
      return;
    }
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const account = await signer.getAddress();
    accountEl.textContent = account;
    statusEl.textContent = "Conectado a MetaMask";

    try {
      contract = new ethers.Contract(contractAddress, abi, signer);
      statusEl.textContent += " — Contrato cargado.";
    } catch (err) {
      console.warn("Error creando contrato:", err);
      statusEl.textContent += " — Error cargando contrato.";
    }

    actualizarEstadoClaim();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error en la conexión.";
  }
}

async function cobrarRecompensa() {
  if (!contract || !signer) {
    alert("No conectado o contrato no cargado.");
    return;
  }
  if (puntaje <= 0) {
    alert("No tienes puntaje para cobrar.");
    return;
  }

  const decimals = 18;
  const amount = ethers.BigNumber.from(puntaje.toString()).mul(ethers.BigNumber.from(10).pow(decimals));

  try {
    statusEl.textContent = "Enviando transacción...";
    claimButton.disabled = true;
    const tx = await contract.reward(await signer.getAddress(), amount);
    statusEl.textContent = `Transacción enviada: ${tx.hash} — esperando confirmación...`;
    await tx.wait();
    statusEl.textContent = "Recompensa pagada correctamente ✅";
    puntaje = 0;
    puntajeEl.textContent = puntaje;
    actualizarEstadoClaim();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error en la transacción.";
    actualizarEstadoClaim();
  }
}

/* ---------------- Eventos botones ---------------- */
connectButton.addEventListener("click", connectWallet);
claimButton.addEventListener("click", cobrarRecompensa);

/* ---------------- Manejo cambios de cuenta / red ---------------- */
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      accountEl.textContent = "No conectado";
      statusEl.textContent = "Conexión perdida";
      provider = null;
      signer = null;
      contract = null;
      actualizarEstadoClaim();
    } else {
      accountEl.textContent = accounts[0];
      if (provider) {
        signer = provider.getSigner();
        try {
          contract = new ethers.Contract(contractAddress, abi, signer);
        } catch (err) { contract = null; }
        actualizarEstadoClaim();
      }
    }
  });

  window.ethereum.on("chainChanged", (chainId) => {
    statusEl.textContent = `Red cambiada: ${chainId}. Recarga recomendada.`;
  });
}
