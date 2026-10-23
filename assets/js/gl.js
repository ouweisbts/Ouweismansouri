/* Hero background — "liquid gold" fragment shader.
   Domain-warped fbm noise with a light that follows the pointer.
   Falls back to the CSS gradient on .hero__gl when WebGL is unavailable. */
(() => {
  const host = document.querySelector('.hero__gl');
  if (!host) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return;
  host.appendChild(canvas);

  const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
  const frag = `
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uScroll;uniform float uIntro;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.02;a*=.5;}return v;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.);
  float t=uTime*.045;
  vec2 q=vec2(fbm(p*1.4+vec2(0.,t)),fbm(p*1.4+vec2(5.2,1.3)-t));
  vec2 dm=(p-m);float dl=length(dm);
  vec2 r=vec2(fbm(p*1.4+3.2*q+vec2(1.7,9.2)+t*1.4+dm*.25),fbm(p*1.4+3.2*q+vec2(8.3,2.8)-t));
  float f=fbm(p*1.5+3.6*r);
  float light=smoothstep(1.,0.,dl);
  float silk=pow(smoothstep(.3,.92,f),1.8);
  float edge=smoothstep(.0,.035,abs(fract(f*6.)-.5)-.44);
  vec3 ink=vec3(.022,.021,.026);
  vec3 bronze=vec3(.26,.16,.07);
  vec3 gold=vec3(.96,.77,.44);
  vec3 col=mix(ink,bronze,smoothstep(.2,.8,f)*.7);
  col=mix(col,gold,silk*(.42+.9*light));
  col+=gold*.09*light;
  col+=gold*edge*.05*(.5+light);
  col*=smoothstep(1.6,.1,length((p-vec2(.25,.05))*vec2(.7,1.)));
  col*=(1.-uScroll*.75)*uIntro;
  col+=(hash(gl_FragCoord.xy+fract(uTime))-.5)*.025;
  gl_FragColor=vec4(col,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const vs = sh(gl.VERTEX_SHADER, vert), fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) { canvas.remove(); return; }
  const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uScroll = U('uScroll'), uIntro = U('uIntro');

  // Render below native resolution: the image is soft by nature, and it keeps the GPU cool.
  const SCALE = 0.55;
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight, d = Math.min(devicePixelRatio || 1, 2) * SCALE;
    canvas.width = Math.max(1, Math.round(w * d)); canvas.height = Math.max(1, Math.round(h * d));
    gl.viewport(0, 0, canvas.width, canvas.height); gl.uniform2f(uRes, canvas.width, canvas.height);
  };
  resize(); addEventListener('resize', resize);

  const mouse = { x: .68, y: .58, tx: .68, ty: .58 };
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; }, { passive: true });

  let visible = true, intro = 0, start = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) requestAnimationFrame(frame); }).observe(host);

  function frame(now) {
    if (!visible) return;
    const t = (now - start) / 1000;
    mouse.x += (mouse.tx - mouse.x) * .045; mouse.y += (mouse.ty - mouse.y) * .045;
    intro += (1 - intro) * .045;
    const sc = Math.min(Math.max(scrollY / innerHeight, 0), 1);
    gl.uniform1f(uTime, 12 + t); gl.uniform2f(uMouse, mouse.x, mouse.y); gl.uniform1f(uScroll, sc); gl.uniform1f(uIntro, intro);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduced) requestAnimationFrame(frame);
  }
  if (reduced) intro = 1;
  requestAnimationFrame(frame);
})();
