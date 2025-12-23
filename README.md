/* Estilos simples para centrar el canvas y fondo oscuro */
html, body {
  height: 100%;
  margin: 0;
}
body {
  display: flex;
  align-items: center;
  justify-content: center;
  /* Degradado morado -> negro inclinado 45 grados */
  background: linear-gradient(45deg, #3a0060 0%, #7a1fbf 35%, #000000 100%);
  color: #fff;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
}
canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}

/* pequeño texto de ayuda si se añade más tarde */
.help {
  position: absolute;
  top: 12px;
  left: 12px;
  color: rgba(255,255,255,0.75);
  font-size: 13px;
}
