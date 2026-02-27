let glCanvas: HTMLCanvasElement | null = null;
let gl: WebGLRenderingContext | null = null;
let vShader: WebGLShader | null = null;
let qBuf: WebGLBuffer | null = null;
const progCache = new Map<string, WebGLProgram>();

const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}";
const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

function ensureGL(): {
	gl: WebGLRenderingContext;
	canvas: HTMLCanvasElement;
} | null {
	if (typeof document === "undefined") return null;
	if (glCanvas && gl) return { gl, canvas: glCanvas };
	glCanvas = document.createElement("canvas");
	glCanvas.width = 64;
	glCanvas.height = 64;
	gl = glCanvas.getContext("webgl", {
		antialias: false,
		depth: false,
		preserveDrawingBuffer: true,
	});
	if (!gl) return null;
	vShader = gl.createShader(gl.VERTEX_SHADER);
	if (!vShader) return null;
	gl.shaderSource(vShader, VERT);
	gl.compileShader(vShader);
	if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) return null;
	qBuf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
	gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
	// Handle context loss
	glCanvas.addEventListener("webglcontextlost", () => {
		progCache.clear();
		gl = null;
		vShader = null;
		qBuf = null;
		glCanvas = null;
	});
	return { gl, canvas: glCanvas };
}

export function glRender(
	targetCanvas: HTMLCanvasElement,
	fragSrc: string,
	uniforms: Record<string, number | number[]>,
): void {
	const ctx = ensureGL();
	if (!ctx) return;
	const { gl, canvas } = ctx;

	const pxW = targetCanvas.width;
	const pxH = targetCanvas.height;
	if (canvas.width !== pxW || canvas.height !== pxH) {
		canvas.width = pxW;
		canvas.height = pxH;
	}

	let prog = progCache.get(fragSrc);
	if (!prog) {
		const fs = gl.createShader(gl.FRAGMENT_SHADER);
		if (!fs) return;
		gl.shaderSource(fs, fragSrc);
		gl.compileShader(fs);
		if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
			console.error("Shader compile error:", gl.getShaderInfoLog(fs));
			gl.deleteShader(fs);
			return;
		}
		prog = gl.createProgram();
		if (!prog || !vShader) {
			gl.deleteShader(fs);
			return;
		}
		gl.attachShader(prog, vShader);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			console.error("Program link error:", gl.getProgramInfoLog(prog));
			return;
		}
		progCache.set(fragSrc, prog);
	}

	gl.viewport(0, 0, pxW, pxH);
	// biome-ignore lint/correctness/useHookAtTopLevel: this isn't a hook
	gl.useProgram(prog);
	gl.bindBuffer(gl.ARRAY_BUFFER, qBuf);
	const pos = gl.getAttribLocation(prog, "a");
	gl.enableVertexAttribArray(pos);
	gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
	gl.uniform2f(gl.getUniformLocation(prog, "R"), pxW, pxH);

	for (const [k, v] of Object.entries(uniforms)) {
		const loc = gl.getUniformLocation(prog, k);
		if (!loc) continue;
		if (typeof v === "number") gl.uniform1f(loc, v);
		else if (Array.isArray(v)) {
			if (v.length === 2) gl.uniform2fv(loc, v);
			else if (v.length === 3) gl.uniform3fv(loc, v);
			else if (v.length === 4) gl.uniform4fv(loc, v);
		}
	}

	gl.drawArrays(gl.TRIANGLES, 0, 6);

	const ctx2d = targetCanvas.getContext("2d");
	if (ctx2d) {
		ctx2d.clearRect(0, 0, pxW, pxH);
		ctx2d.drawImage(canvas, 0, 0);
	}
}
