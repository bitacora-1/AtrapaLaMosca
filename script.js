/* ---------------------------------------------------
   Juego "Atrapa la Mosca" (versión estable)
   Moscas se mueven solo al hacer click
   --------------------------------------------------- */

let provider, signer, contract;

// Elementos del DOM
const connectButton = document.getElementById("connectButton");
const accountEl = document.getElementById("account");
const claimButton = document.getElementById("claimButton");
const statusEl = document.getElementById("status");
const puntajeEl = document.getElementById("puntaje");
const gameArea = document.getElementById("gameArea");

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

// Mover mosca dentro del área de juego
function moverMoscaEl(el) {
  const w = el.clientWidth || 100;
  const h = el.clientHeight || 100;
  const rect = gameArea.getBoundingClientRect();
  const x = Math.random() * (rect.width - w);
  const y = Math.random() * (rect.height - h);
  const rotacion = Math.random() * 360;

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = `rotate(${rotacion}deg) scale(1)`;
}

// Aumentar puntaje
function aumentarPuntaje() {
  puntaje++;
  puntajeEl.textContent = puntaje;
}

// Crear nueva mosca
function agregarMosca() {
  const nuevaMosca = document.createElement("img");
  nuevaMosca.src = "imagenes/mosca.png";
  nuevaMosca.alt = "Mosca";
  nuevaMosca.classList.add("mosca");
  nuevaMosca.style.width = "100px";
  nuevaMosca.style.height = "auto";
  nuevaMosca.style.position = "absolute";
  nuevaMosca.style.cursor = "pointer";

  nuevaMosca.addEventListener("click", (ev) => {
    ev.stopPropagation();
    moverMoscaEl(nuevaMosca);
    agregarMosca();
    aumentarPuntaje();
  });

  gameArea.appendChild(nuevaMosca);
  moverMoscaEl(nuevaMosca);
  return nuevaMosca;
}

// Mosca inicial
const moscaInit = document.getElementById("mosca");
if (moscaInit) {
  moscaInit.classList.add("mosca");
  moscaInit.addEventListener("click", (ev) => {
    ev.stopPropagation();
    moverMoscaEl(moscaInit);
    agregarMosca();
    aumentarPuntaje();
  });
  moverMoscaEl(moscaInit);
} else {
  agregarMosca();
}

/* ---------------- MetaMask (todavía básico) ---------------- */
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("No se detectó MetaMask. Instálala y vuelve a intentarlo.");
      return;
    }
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const account = await signer.getAddress();
    accountEl.textContent = account;
    statusEl.textContent = "Conectado a MetaMask";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error conectando MetaMask";
  }
}

connectButton.addEventListener("click", connectWallet);
