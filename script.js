<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Atrapa la Mosca — Recompensas</title>

  <!-- OJO: si tenés una meta Content-Security-Policy que restringe eval/inline, comentalo en desarrollo.
       Ejemplo problemático: <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' ..."> 
       Mejor no usar 'unsafe-eval' en producción. -->
  <link rel="stylesheet" href="style.css" />

  <!-- Opcional: carga de iconos/images local en carpeta 'imagenes' -->
</head>
<body>
  <header>
    <h1>Atrapa la Mosca</h1>
    <div id="wallet-section">
      <button id="connectBtn">Conectar MetaMask</button>
      <span id="account" style="margin-left:12px;">No conectado</span>
    </div>
  </header>

  <main>
    <!-- Zona del juego -->
    <canvas id="gameCanvas" width="800" height="500" style="border:1px solid #ddd"></canvas>

    <section id="game-info">
      <p id="status">Estado del juego: listo</p>
      <p>Intenta atrapar la mosca y reclama recompensa (demo).</p>
    </section>
  </main>

  <footer>
    <small>Demo — Asegurate de no compartir claves privadas.</small>
  </footer>

  <!-- Carga del script al final para evitar problemas con elementos no cargados -->
  <script src="script.js"></script>
</body>
</html>
