/* script.js
   Juego "Atrapa la Mosca" + integración básica con MetaMask (ethers.js)
   Reemplaza contractAddress y abi por los de tu token cuando los tengas.
*/

/* ------------- Configuración blockchain (reemplazar) ------------- */
// Dirección del contrato (ejemplo vacío)
const contractAddress = "0xTU_CONTRATO_AQUI"; // <-- reemplazalo con la dirección real
// ABI mínimo con la función que usará tu contrato para recompensar.
// Asegúrate de cambiar el nombre y la firma según tu contrato.
// Ejemplo usa "reward(address,uint256)" — cámbialo si tu contrato usa "mint" o similar.
const abi = [
  "function reward(address to, uint256 amount) public"
];
/* ----------------------------------------------------------------- */

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

// Organización: mantener referencia a moscas por clase
function moverMoscaEl(el) {
  const w = el.clientWidth || 100;
  const h = el.clientHeight || 100;
  const x = Math.random() * (window.innerWidth - w - 10);
  const y = Math.random() * (window.innerHeight - h - 10);
  const rotacion = Math.random() * 360;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.transform = `rotate(${rotacion}deg) scale(1)`;
}

// aumenta puntaje y actualiza UI
function aumentarPuntaje() {
  puntaje++;
  puntajeEl.textContent = puntaje;
  actualizarEstadoClaim();
}

// crear una nueva mosca (elemento img)
function agregarMosca() {
  const nuevaMosca = document.createElement("img");
  nuevaMosca.src = "imagenes/mosca.png";
  nuevaMosca.alt = "Mosca";
  nuevaMosca.classList.add("mosca");
  nuevaMosca.style.width = "100px";
  nuevaMosca.style.height = "auto";
  nuevaMosca.style.position = "absolute";
  nuevaMosca.style.cursor = "pointer";

  // cuando la tocan: agregar otra, mover, sumar puntaje
  nuevaMosca.addEventListener("click", (ev) => {
    ev.stopPropagation();
    // pequeño efecto
    nuevaMosca.style.transform = nuevaMosca.style.transform + " scale(1.1)";
    setTimeout(() => {
      moverMoscaEl(nuevaMosca);
    }, 70);

    agregarMosca();
    aumentarPuntaje();
  });

  gameArea.appendChild(nuevaMosca);
  moverMoscaEl(nuevaMosca);
  return nuevaMosca;
}

// mosca inicial desde el DOM (#mosca)
const moscaInit = document.getElementById("mosca");
if (moscaInit) {
  // Asegurar clase .mosca para estilos
  moscaInit.classList.add("mosca");
  moscaInit.addEventListener("click", (ev) => {
    ev.stopPropagation();
    moscaInit.style.transform = moscaInit.style.transform + " scale(1.1)";
    setTimeout(() => moverMoscaEl(moscaInit), 70);
    agregarMosca();
    aumentarPuntaje();
  });
  moverMoscaEl(moscaInit);
} else {
  // si no existía, crear una
  agregarMosca();
}

// clicking outside moscas puede moverlas aleatoriamente (opcional)
document.addEventListener("click", () => {
  // mueve todas las moscas un poco
  document.querySelectorAll(".mosca").forEach(m => {
    moverMoscaEl(m);
  });
});

/* ------------- Integración MetaMask / ethers.js ------------- */

// Habilitar o deshabilitar el botón "Cobrar recompensa"
function actualizarEstadoClaim() {
  if (provider && signer && puntaje > 0 && contract) {
    claimButton.disabled = false;
  } else {
    claimButton.disabled = true;
  }
}

// Conectar a MetaMask
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("No se detectó MetaMask. Instálala y vuelve a intentarlo.");
      return;
    }
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    // solicitar cuentas
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    const account = await signer.getAddress();
    accountEl.textContent = `${account}`;
    statusEl.textContent = "Conectado a MetaMask";
    // inicializar contrato
    try {
      contract = new ethers.Contract(contractAddress, abi, signer);
      statusEl.textContent += " — Contrato cargado (reemplaza dirección/ABI si es necesario).";
    } catch (err) {
      console.warn("Error al crear instancia de contrato:", err);
      statusEl.textContent += " — Error cargando contrato (revisa dirección/ABI).";
    }
    actualizarEstadoClaim();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Conexión cancelada o error.";
  }
}

// Enviar transacción al contrato para recompensar tokens
async function cobrarRecompensa() {
  if (!contract || !signer) {
    alert("No estás conectado o el contrato no está cargado.");
    return;
  }
  if (puntaje <= 0) {
    alert("No tenés puntaje para cobrar.");
    return;
  }

  // Convención: convertir puntaje a cantidad de tokens ABI-dependiente.
  // Si tu token tiene 18 decimales y querés 1 token por punto:
  const decimals = 18; // cambia si tu token tiene otros decimales
  const amount = ethers.BigNumber.from(puntaje.toString()).mul(ethers.BigNumber.from(10).pow(decimals));

  try {
    statusEl.textContent = "Enviando transacción...";
    claimButton.disabled = true;

    // Llama a la función del contrato (ajusta el nombre si tu contrato usa otro)
    const tx = await contract.reward(await signer.getAddress(), amount);
    statusEl.textContent = `Transacción enviada: ${tx.hash} — esperando confirmación...`;
    await tx.wait();
    statusEl.textContent = "Recompensa pagada correctamente ✅";
    // opcional: resetear puntaje
    puntaje = 0;
    puntajeEl.textContent = puntaje;
    actualizarEstadoClaim();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error en la transacción. Revisa la consola.";
    actualizarEstadoClaim();
  }
}

/* ------------- Eventos botones ------------- */
connectButton.addEventListener("click", connectWallet);
claimButton.addEventListener("click", cobrarRecompensa);

/* ------------- Manejo cambios de cuenta / red ------------- */
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
      // recrear signer/contract si ya hay provider
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
    // recomendación: recargar la página para evitar inconsistencias de provider
    statusEl.textContent = `Red cambiada: ${chainId}. Recarga recomendada.`;
  });
}
