import type { WebGLGenerator } from "../../types";
import { GLSL_PREAMBLE as G } from "./gl-preamble";

export const artShadersGenerators: WebGLGenerator[] = [
	{
		id: "rothko-fields",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float n=3.+floor(P.x*2.);
  float bandH=1./n;
  float idx=floor(uv.y/bandH);
  float t=idx/(n-1.);
  float edge=fract(uv.y/bandH);
  float soft=smoothstep(0.,.06,edge)*smoothstep(1.,.94,edge);
  vec3 col=mix(C2*.8,C1,t);
  col=mix(col*0.6,col,soft);
  float grain=h12(uv*R*0.5+S)*0.04-0.02;
  col=clamp(col+grain,0.,1.);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "mondrian-grid",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float cols=3.+floor(P.x*2.);
  float rows=3.+floor(P.y*2.);
  float gx=floor(uv.x*cols)/cols;
  float gy=floor(uv.y*rows)/rows;
  float cell=h12(vec2(gx,gy)+S);
  vec3 white=vec3(0.97);
  vec3 red=vec3(0.85,0.1,0.1);
  vec3 blue=vec3(0.1,0.2,0.75);
  vec3 yellow=vec3(0.97,0.82,0.1);
  vec3 col;
  if(cell<0.5) col=mix(C1,C2,h12(vec2(gx,gy)+S+1.));
  else if(cell<0.65) col=red;
  else if(cell<0.78) col=blue;
  else if(cell<0.88) col=yellow;
  else col=white;
  float lx=fract(uv.x*cols);
  float ly=fract(uv.y*rows);
  float line=step(lx,.04)+step(1.-lx,.04)+step(ly,.04)+step(1.-ly,.04);
  col=mix(col,vec3(0.05),clamp(line,0.,1.));
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "albers-squares",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  vec3 col=C2*.5;
  for(float i=0.;i<4.;i++){
    float s=1.-i*.2;
    float ox=(i/4.)*.15*(P.x-.5);
    float oy=(i/4.)*.15*(P.y-.5);
    vec2 d=abs(uv-vec2(ox,oy))-vec2(s);
    if(max(d.x,d.y)<0.){
      float t=i/4.;
      float hue=H+t*.25+P.z*.1;
      float sat=0.6+P.w*0.3;
      float lum=0.35+t*0.25;
      col=hsl2rgb(vec3(fract(hue),sat,lum));
    }
  }
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "lewitt-lines",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float n=12.+floor(P.x*8.);
  float angle=P.y*3.14159;
  vec2 ruv=uv*rot(angle);
  float dir=floor(S*4.);
  float phase=dir<1.?ruv.x:dir<2.?ruv.y:dir<3.?(ruv.x+ruv.y)*.707:(ruv.x-ruv.y)*.707;
  float stripe=fract(phase*n);
  float w=0.15+P.z*0.25;
  float line=smoothstep(0.,.02,stripe)*smoothstep(w,w-.02,stripe);
  vec3 col=mix(C2,C1,line);
  float cross2=fract((uv.x+uv.y)*n*.707);
  float line2=smoothstep(0.,.02,cross2)*smoothstep(w,w-.02,cross2)*0.4;
  col=mix(col,C1,line2*P.w);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "riley-waves",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float freq=6.+P.x*8.;
  float amp=0.04+P.y*0.06;
  float phase=P.z*6.28318;
  float wave=sin(uv.x*freq*3.14159+phase)*amp;
  float stripe=fract((uv.y+wave)*12.);
  float w=0.4+P.w*0.1;
  float band=smoothstep(0.,.03,stripe)*smoothstep(w,w-.03,stripe);
  float wave2=sin(uv.y*freq*3.14159+phase+1.57)*amp*.7;
  float stripe2=fract((uv.x+wave2)*12.+Q.x);
  float band2=smoothstep(0.,.03,stripe2)*smoothstep(w,w-.03,stripe2)*.5;
  vec3 col=C2;
  col=mix(col,C1,band);
  col=mix(col,mix(C1,C2,.5),band2);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "kandinsky-circles",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  vec3 col=mix(C2,C1,0.1)*.3;
  for(float i=0.;i<5.;i++){
    vec2 c=vec2(h11(S+i*.37)-.5,h11(S+i*.37+.5)-.5)*1.4;
    float r=0.1+h11(S+i*.37+.2)*.35;
    float d=length(uv-c);
    float t=h11(S+i*.37+.7);
    vec3 ring=hsl2rgb(vec3(fract(H+t*.4),0.7,0.55));
    float fill=smoothstep(r,r-.02,d);
    float border=smoothstep(r+.02,r,d)*smoothstep(r*.7,r*.72,d);
    col=mix(col,ring*0.8,fill*0.7);
    col=mix(col,ring,border);
  }
  vec2 lp=vec2(P.x-.5,P.y-.5)*1.5;
  float ld=abs(dot(uv-lp,vec2(-sin(P.z*3.14),cos(P.z*3.14))));
  col=mix(col,C1,smoothstep(.02,.0,ld)*0.4);
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "klee-tiles",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float cols=5.+floor(P.x*3.);
  float rows=5.+floor(P.y*3.);
  vec2 cell=vec2(floor(uv.x*cols)/cols,floor(uv.y*rows)/rows);
  vec2 local=vec2(fract(uv.x*cols),fract(uv.y*rows));
  float id=h12(cell+S);
  float hue=fract(H+id*.6+P.z*.3);
  float sat=0.5+h12(cell+S+1.)*.4;
  float lum=0.3+h12(cell+S+2.)*.4;
  vec3 col=hsl2rgb(vec3(hue,sat,lum));
  float margin=0.06;
  float inset=smoothstep(0.,margin,local.x)*smoothstep(1.,1.-margin,local.x)*
              smoothstep(0.,margin,local.y)*smoothstep(1.,1.-margin,local.y);
  col=mix(col*0.3,col,inset);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "escher-tessellation",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  uv*=2.5;
  vec2 g=uv*rot(P.x*1.5708);
  vec2 gi=floor(g);
  vec2 gf=fract(g)-.5;
  float checker=mod(gi.x+gi.y,2.);
  float id=h12(gi+S);
  vec2 p=gf*rot(P.y*3.14159+id*.5);
  float shape=sdBox(p,vec2(.42-.04*checker));
  float t=checker*.6+id*.4;
  vec3 col=mix(C2,C1,t);
  float edge=smoothstep(0.02,-0.02,shape);
  col=mix(col*.2,col,edge);
  col+=mix(C1,C2,.5)*(1.-edge)*smoothstep(0.,.06,shape)*0.2;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "pollock-drip",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  vec3 col=mix(C2*.85,C2,vnoise(uv*3.+S));
  for(float i=0.;i<8.;i++){
    float sx=h11(S+i*.41);
    float sy=h11(S+i*.41+.1);
    float ex=h11(S+i*.41+.2);
    float ey=h11(S+i*.41+.3);
    vec2 a=vec2(sx,sy),b=vec2(ex,ey);
    vec2 pa=uv-a,ba=b-a;
    float tt=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
    float d=length(pa-ba*tt);
    float w=0.003+h11(S+i*.41+.4)*0.012;
    float drip=smoothstep(w,w*.3,d);
    float t=h11(S+i*.41+.6);
    vec3 dripCol=mix(C1,hsl2rgb(vec3(fract(H+t*.3),0.8,0.4)),t);
    col=mix(col,dripCol,drip);
  }
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "malevich-suprematism",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  vec3 col=vec3(0.95);
  for(float i=0.;i<5.;i++){
    vec2 center=vec2(h11(S+i*.31)-.5,h11(S+i*.31+.5)-.5)*1.6;
    vec2 size=vec2(0.08+h11(S+i*.31+.2)*.4,0.05+h11(S+i*.31+.3)*.25);
    float angle=h11(S+i*.31+.4)*3.14159;
    vec2 p=(uv-center)*rot(-angle);
    float shape=sdBox(p,size);
    float t=h11(S+i*.31+.6);
    vec3 shapeCol=t<0.33?C1:t<0.66?C2:mix(C1,C2,t);
    col=mix(col,shapeCol,smoothstep(0.01,-0.01,shape));
  }
  float circ=sdCirc(uv-vec2(P.x-.5,P.y-.5)*.8,0.08+P.z*.15);
  col=mix(col,mix(C2,C1,.3),smoothstep(0.01,-0.01,circ));
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "delaunay-discs",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  vec3 col=C2*.15;
  for(float i=0.;i<6.;i++){
    float t=i/6.;
    float a=t*6.28318+P.x*3.14159;
    float r=0.2+h11(S+i*.53)*.5;
    vec2 center=vec2(cos(a),sin(a))*r*(0.4+P.y*.3);
    float radius=0.08+h11(S+i*.53+.3)*.25;
    float d=length(uv-center);
    float hue=fract(H+t*.5+P.z*.2);
    vec3 ringCol=hsl2rgb(vec3(hue,0.75,0.55));
    for(float j=0.;j<3.;j++){
      float rr=radius*(1.-j*.28);
      float ring=smoothstep(rr+.01,rr-.01,d)*smoothstep(rr*.65,rr*.67,d);
      col=mix(col,ringCol*(.5+j*.2),ring*.8);
    }
    col=mix(col,ringCol*.9,smoothstep(.015,0.,d-radius)*0.5);
  }
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "agnes-martin-grid",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float n=8.+floor(P.x*8.);
  float lw=0.008+P.y*0.006;
  float gx=fract(uv.x*n);
  float gy=fract(uv.y*n);
  float lineX=smoothstep(0.,lw,gx)*smoothstep(lw*2.,lw,gx);
  float lineY=smoothstep(0.,lw,gy)*smoothstep(lw*2.,lw,gy);
  float grid=max(lineX,lineY);
  vec3 base=mix(C2,vec3(0.97),0.6);
  vec3 lineCol=mix(C1,base,0.4);
  vec3 col=mix(base,lineCol,grid);
  float grain=h12(uv*R*0.8+S)*0.03-0.015;
  float vignette=1.-length(uv-vec2(.5))*.4;
  col=clamp(col+grain,0.,1.)*vignette;
  gl_FragColor=vec4(col,1.);}`,
	},
];
