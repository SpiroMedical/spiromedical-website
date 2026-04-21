/* /js/shader.js */

const vertSrc = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos, 0., 1.); }`;

const fragSrc = `
precision mediump float;
uniform vec2 u_res, u_mouse;
uniform float u_time;

vec3 mod289(vec3 x){ return x - floor(x*(1./289.))*289.; }
vec2 mod289(vec2 x){ return x - floor(x*(1./289.))*289.; }
vec3 permute(vec3 x){ return mod289((x*34.+1.)*x); }

float snoise(vec2 v){
  const vec4 C = vec4(.211324865,.366025404,-.577350269,.024390244);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.);
  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.,i1.y,1.)) + i.x + vec3(0.,i1.x,1.));
  vec3 m = max(.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.);
  m = m*m*m*m;
  vec3 x  = 2.*fract(p*C.www) - 1.;
  vec3 h  = abs(x) - .5;
  vec3 ox = floor(x + .5);
  vec3 a0 = x - ox;
  m *= 1.79284291 - .85373472*(a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x*x0.x  + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.*dot(m, g);
}

void main(){
  vec2 uv    = gl_FragCoord.xy / u_res;
  vec2 mouse = u_mouse / u_res;
  vec2 toM   = uv - mouse;
  float mInf = smoothstep(.9, 0., length(toM)) * .18;
  vec2 d     = uv + toM * mInf;
  float t    = u_time * .18;
  vec2 mOff  = (mouse - .5) * .12;

  float n1 = snoise(d*2.2 + vec2(t*.7,  t*.4) + mOff)       * .5 + .5;
  float n2 = snoise(d*4.5 - vec2(t*.5,  t*.8) - mOff*1.5)   * .5 + .5;
  float n3 = snoise(d*1.2 + vec2(t*.3, -t*.2) + mOff*.5)    * .5 + .5;
  float n  = n1*.55 + n2*.25 + n3*.2;

  vec3 c1  = vec3(.08,.16,.32);
  vec3 c2  = vec3(.10,.25,.42);
  vec3 c3  = vec3(.07,.42,.52);
  vec3 c4  = vec3(.05,.12,.22);
  vec3 col = mix(c1, c2, n);
  col = mix(col, c3, pow(n,3.)*.35);
  col = mix(col, c4, (1.-uv.y)*.4);

  float vig = 1. - smoothstep(.4, 1.2, length((uv-.5)*vec2(1.4,1.)));
  col *= vig*.85 + .15;
  gl_FragColor = vec4(col, 1.);
}`;

export function makeShader(canvas) {
  const gl = canvas.getContext('webgl');

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes   = gl.getUniformLocation(prog, 'u_res');
  const uTime  = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize);
  resize();

  return { gl, uRes, uTime, uMouse };
}