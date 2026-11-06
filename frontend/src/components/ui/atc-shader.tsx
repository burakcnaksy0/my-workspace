import React, { useEffect, useRef } from 'react';

const VERTEX_SHADER_SOURCE = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  u_res;
uniform float u_time;

// robust tanh fallback
float tanh1(float x){ float e = exp(2.0*x); return (e-1.0)/(e+1.0); }
vec4 tanh4(vec4 v){ return vec4(tanh1(v.x), tanh1(v.y), tanh1(v.z), tanh1(v.w)); }

void main(){
  vec3 FC = vec3(gl_FragCoord.xy, 0.0);
  vec3 r  = vec3(u_res, max(u_res.x, u_res.y));
  float t = u_time;

  vec4 o = vec4(0.0);

  // === XorDev ATC Tunnel algorithm ===
  vec3 p = vec3(0.0);
  vec3 v = vec3(1.0, 2.0, 6.0);
  float i = 0.0, z = 1.0, d = 1.0, f = 1.0;

  for ( ; i++ < 5e1;
        o.rgb += (cos((p.x + z + v) * 0.1) + 1.0) / d / f / z )
  {
    p = z * normalize(FC * 2.0 - r.xyy);

    vec4 m = cos((p + sin(p)).y * 0.4 + vec4(0.0, 33.0, 11.0, 0.0));
    p.xz = mat2(m) * p.xz;

    p.x += t / 0.2;

    z += ( d = length(cos(p / v) * v + v.zxx / 7.0) /
           ( f = 2.0 + d / exp(p.y * 0.2) ) );
  }

  o = tanh4(0.2 * o);
  o.a = 1.0;
  fragColor = o;
}
`;

export interface ATCShaderProps {
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
  opacity?: number;
  overlay?: boolean;
  overlayClassName?: string;
}

export const ATCShader: React.FC<ATCShaderProps> = ({
  className = '',
  style,
  speed = 0.35,
  opacity = 1.0,
  overlay = true,
  overlayClassName = 'bg-slate-950/70 backdrop-blur-[2px]',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const errorRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (typeof canvas.getContext !== 'function') return;

    let gl: WebGL2RenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl2', {
        premultipliedAlpha: false,
        alpha: true,
        powerPreference: 'low-power',
      });
    } catch {
      return;
    }

    if (!gl) {
      return;
    }

    const compileShader = (type: number, source: string) => {
      const shader = gl!.createShader(type);
      if (!shader) throw new Error('Failed to create shader');
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        const info = gl!.getShaderInfoLog(shader) || 'Shader compile error';
        gl!.deleteShader(shader);
        throw new Error(info);
      }
      return shader;
    };

    const linkProgram = (vsSource: string, fsSource: string) => {
      const vs = compileShader(gl!.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl!.FRAGMENT_SHADER, fsSource);
      const program = gl!.createProgram();
      if (!program) throw new Error('Failed to create program');
      gl!.attachShader(program, vs);
      gl!.attachShader(program, fs);
      gl!.linkProgram(program);
      if (!gl!.getProgramParameter(program, gl!.LINK_STATUS)) {
        const info = gl!.getProgramInfoLog(program) || 'Program link error';
        gl!.deleteProgram(program);
        throw new Error(info);
      }
      return program;
    };

    let program: WebGLProgram;
    try {
      program = linkProgram(VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (errorRef.current) {
        errorRef.current.textContent = `Shader error: ${msg}`;
      }
      return;
    }

    gl.useProgram(program);

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const uResLoc = gl.getUniformLocation(program, 'u_res');
    const uTimeLoc = gl.getUniformLocation(program, 'u_time');

    const handleResize = () => {
      if (!canvas || !gl) return;
      // Raymarching is heavy, and shader is blurred by backdrop-blur overlay.
      // 0.65-0.75 DPR saves ~60% GPU time with zero perceptual loss.
      const dpr = Math.max(0.5, Math.min(0.75, (window.devicePixelRatio || 1) * 0.6));
      const width = Math.max(1, Math.floor((canvas.clientWidth || window.innerWidth) * dpr));
      const height = Math.max(1, Math.floor((canvas.clientHeight || window.innerHeight) * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uResLoc, width, height);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    let animationId = 0;
    let isMounted = true;
    const startTime = performance.now();

    const render = () => {
      if (!isMounted || !gl) return;
      if (document.hidden) {
        // Pause animation when tab is not visible to eliminate background delay
        return;
      }
      const elapsedSeconds = ((performance.now() - startTime) / 1000) * speed;
      gl.uniform1f(uTimeLoc, elapsedSeconds);
      gl.clearColor(0.04, 0.05, 0.09, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && isMounted) {
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    render();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (quadBuffer && gl) gl.deleteBuffer(quadBuffer);
      if (program && gl) gl.deleteProgram(program);
    };
  }, [speed]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          opacity,
        }}
      />
      {overlay && (
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${overlayClassName}`}
        />
      )}
      <pre
        ref={errorRef}
        className="absolute top-2 left-2 text-red-400 text-xs pointer-events-none empty:hidden font-mono"
      />
    </div>
  );
};

export default ATCShader;
export const ShaderDemo_ATC = ATCShader;
