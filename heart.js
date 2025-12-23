// heart.js — dibuja el corazón como un trazo animado con efecto rojo neón
(function(){
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  function resize(){
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  // Generar los puntos del trazo que forman el corazón
  function heartPoint(t, scale){
    const x = 16 * Math.sin(t) ** 3;
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
    return { x: x * scale, y: -y * scale };
  }

  const POINTS = 900; // resolución del trazo
  let SCALE = Math.min(window.innerWidth, window.innerHeight) / 45;
  let path = [];

  function buildPath(){
    SCALE = Math.min(window.innerWidth, window.innerHeight) / 45;
    path = new Array(POINTS);
    for(let i=0;i<POINTS;i++){
      const t = (i / POINTS) * Math.PI * 2;
      path[i] = heartPoint(t, SCALE);
    }
  }

  buildPath();

  // animación: progreso del trazo (0..1)
  let progress = 0;
  const drawSpeed = 0.02; // velocidad de dibujo (aumentada para visibilidad)

  // partículas breves para la punta (brillo)
  const sparks = [];

  function addSpark(x,y){
    sparks.push({x,y,alpha:1, size: 1 + Math.random()*2, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6});
    if(sparks.length > 250) sparks.shift();
  }

  // rotación del corazón sobre su propio eje
  let rotation = 0;
  const rotationSpeed = 0.01; // radians per frame (ajustable)

  // color neon
  const neon = '255,20,60';

  function draw(){
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    // limpiar canvas (mantener transparencia para mostrar el fondo CSS)
    ctx.clearRect(0,0,w,h);

    const cx = w/2;
    const cy = h/2 + 20;

    // actualizar progreso y rotación
    progress = Math.min(1, progress + drawSpeed);
    rotation += rotationSpeed;
    const cosA = Math.cos(rotation);
    const sinA = Math.sin(rotation);

    const endIndex = Math.floor(progress * (POINTS - 1));

    // glow layers
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // capa de glow exterior
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(${neon},0.08)`;
    ctx.lineWidth = 40;
    ctx.shadowColor = `rgba(${neon},0.9)`;
    ctx.shadowBlur = 60;
    ctx.beginPath();
    for(let i=0;i<=endIndex;i++){
      const p = path[i];
      const rx = p.x * cosA - p.y * sinA;
      const ry = p.x * sinA + p.y * cosA;
      const x = cx + rx;
      const y = cy + ry;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.restore();

    // capa de glow interior
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(${neon},0.18)`;
    ctx.lineWidth = 18;
    ctx.shadowColor = `rgba(${neon},0.95)`;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    for(let i=0;i<=endIndex;i++){
      const p = path[i];
      const rx = p.x * cosA - p.y * sinA;
      const ry = p.x * sinA + p.y * cosA;
      const x = cx + rx;
      const y = cy + ry;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.restore();

    // capa central (trazo sólido)
    ctx.save();
    ctx.strokeStyle = `rgba(${neon},1)`;
    ctx.lineWidth = 4.5;
    ctx.shadowColor = `rgba(${neon},0.9)`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for(let i=0;i<=endIndex;i++){
      const p = path[i];
      const rx = p.x * cosA - p.y * sinA;
      const ry = p.x * sinA + p.y * cosA;
      const x = cx + rx;
      const y = cy + ry;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.restore();

    // Añadir chispa en la punta para sensación de dibujado
    const head = path[Math.max(0, Math.min(endIndex, path.length-1))];
    if(head){
      const hx = cx + (head.x * cosA - head.y * sinA);
      const hy = cy + (head.x * sinA + head.y * cosA);
      addSpark(hx, hy);
    }

    // Dibujar sparks
    for(let i=sparks.length-1;i>=0;i--){
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy; s.alpha -= 0.03;
      if(s.alpha <= 0){ sparks.splice(i,1); continue; }
      ctx.fillStyle = `rgba(${neon},${(s.alpha*0.9).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  // reiniciar y permitir repetir
  function restart(){
    progress = 0;
    sparks.length = 0;
  }

  // click para reiniciar animación
  canvas.addEventListener('click', restart);

  // Reproducción de audio oculto: intenta iniciar la canción al primer clic del canvas
  const audioEl = document.getElementById('bg-audio');
  let audioStarted = false;
  function tryPlayAudio(){
    if(!audioEl || audioStarted) return;
    // volumen por defecto, se puede ajustar en el archivo
    try{ audioEl.volume = 0.6; }catch(e){}
    const p = audioEl.play();
    if(p && p.then){
      p.then(()=>{ audioStarted = true; }).catch(()=>{ /* reproducción bloqueada hasta interacción */ });
    }else{
      audioStarted = true;
    }
  }
  // también reproducir al primer gesto táctil/pointerdown por compatibilidad móvil
  function oneTimeStart(){ tryPlayAudio(); window.removeEventListener('pointerdown', oneTimeStart); }
  window.addEventListener('pointerdown', oneTimeStart, {passive:true});
  // también empezar al hacer click en el canvas
  canvas.addEventListener('click', tryPlayAudio);

  // rebuild path en resize
  window.addEventListener('resize', function(){
    resize();
    buildPath();
  });

  // iniciar loop de animación (canvas transparente para que se vea el fondo morado)
  requestAnimationFrame(draw);

})();
      const head = path[endIndex];
