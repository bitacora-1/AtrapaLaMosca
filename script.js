document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos del DOM ---
  const connectBtn = document.getElementById('connectBtn');
  const accountSpan = document.getElementById('account');
  const scoreSpan = document.getElementById('score');
  const mosca = document.getElementById('mosca');

  let currentAccount = null;
  let score = 0;

  // --- MetaMask ---
  function isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
  }

  async function connectWallet() {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask no está instalada. Instalala y recargá la página.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
      setupListeners();
    } catch (err) {
      console.error('Error al conectar:', err);
      alert('Error al conectar con MetaMask. Revisá la consola.');
    }
  }

  function handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
      accountSpan.textContent = 'No conectado';
      currentAccount = null;
    } else {
      currentAccount = accounts[0];
      accountSpan.textContent = `${currentAccount.substring(0,6)}...${currentAccount.slice(-4)}`;
    }
  }

  function setupListeners() {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Red cambiada:', chainId);
    });
  }

  connectBtn.addEventListener('click', connectWallet);

  async function tryAutoConnect() {
    if (!isMetaMaskInstalled()) return;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
        setupListeners();
      }
    } catch (err) {
      console.error('Error verificando cuentas:', err);
    }
  }

  // --- Juego: Atrapa la Mosca ---
  function moverMosca(moscaElem) {
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    const rotacion = Math.random() * 360;
    moscaElem.style.left = `${x}px`;
    moscaElem.style.top = `${y}px`;
    moscaElem.style.transform = `rotate(${rotacion}deg) scale(1)`;
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
    document.body.appendChild(nuevaMosca);

    moverMosca(nuevaMosca);

    nuevaMosca.addEventListener("click", () => {
      score++;
      scoreSpan.textContent = score;
      moverMosca(nuevaMosca);
      agregarMosca();

      if (currentAccount) {
        console.log(`Podrías mandar recompensa a ${currentAccount}`);
      }
    });
  }

  // --- Ajustar la primera mosca ---
  mosca.style.width = "100px";
  mosca.style.height = "auto";
  mosca.style.position = "absolute";
  mosca.style.cursor = "pointer";

  moverMosca(mosca);
  mosca.addEventListener("click", () => {
    score++;
    scoreSpan.textContent = score;
    moverMosca(mosca);
    agregarMosca();

    if (currentAccount) {
      console.log(`Podrías mandar recompensa a ${currentAccount}`);
    }
  });

  tryAutoConnect();
});

