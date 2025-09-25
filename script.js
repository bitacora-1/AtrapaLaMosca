document.addEventListener('DOMContentLoaded', () => {
  // --- Elementos del DOM ---
  const connectBtn = document.getElementById('connectBtn');
  const accountSpan = document.getElementById('account');
  const statusP = document.getElementById('status');
  const scoreSpan = document.getElementById('score');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

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
      statusP.textContent = 'Estado del juego: desconectado';
    } else {
      currentAccount = accounts[0];
      accountSpan.textContent = `${currentAccount.substring(0, 6)}...${currentAccount.slice(-4)}`;
      statusP.textContent = 'Estado del juego: conectado';
    }
  }

  function setupListeners() {
    if (!window.ethereum) return;
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Red cambiada:', chainId);
      statusP.textContent = `Red cambiada: ${chainId}`;
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
  const fly = { x: 100, y: 100, r: 18 };

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mosca
    ctx.beginPath();
    ctx.arc(fly.x, fly.y, fly.r, 0, Math.PI * 2);
    ctx.fillStyle = '#222';
    ctx.fill();
    ctx.closePath();

    // Score
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#333';
    ctx.fillText(`Score: ${score}`, 12, 24);
  }

  function randomizeFly() {
    fly.x = Math.random() * (canvas.width - 40) + 20;
    fly.y = Math.random() * (canvas.height - 40) + 20;
  }

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dist = Math.hypot(mx - fly.x, my - fly.y);

    if (dist <= fly.r) {
      score++;
      scoreSpan.textContent = score;
      statusP.textContent = `¡Mosca atrapada! Score: ${score}`;
      randomizeFly();

      if (currentAccount) {
        console.log(`Aquí podrías enviar recompensa a ${currentAccount}`);
      }
    }

    draw();
  });

  // Iniciar juego
  randomizeFly();
  draw();
  tryAutoConnect();
});
