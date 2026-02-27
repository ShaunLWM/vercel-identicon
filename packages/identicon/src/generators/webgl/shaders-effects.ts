import type { WebGLGenerator } from "../../types";
import { GLSL_PREAMBLE as G } from "./gl-preamble";

export const effectsShadersGenerators: WebGLGenerator[] = [
	{
		id: "neon-glow",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  vec3 col=vec3(0.);
  float n=3.+floor(P.x*4.);
  for(float i=0.;i<7.;i++){
    if(i>=n) break;
    float a=P.y*6.28318+i*6.28318/n;
    vec2 dir=vec2(cos(a),sin(a));
    float d=abs(dot(uv,vec2(-dir.y,dir.x)));
    float along=dot(uv,dir);
    float t=i/n;
    vec3 lineCol=mix(C1,C2,t);
    float seg=smoothstep(.55,.45,abs(along));
    float line=exp(-d*d*120.)*seg;
    col+=lineCol*line;
    col+=lineCol*exp(-d*d*20.)*seg*.3;
  }
  col=clamp(col,0.,1.);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "caustics",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV*3.+vec2(P.x,P.y)*2.;
  float c=0.;
  for(int i=0;i<4;i++){
    float fi=float(i);
    vec2 q=uv+vec2(h11(S+fi*.3),h11(S+fi*.7));
    c+=1./(abs(sin(q.x+sin(q.y+fi))+sin(q.y+sin(q.x+fi*1.3)))+.05);
  }
  c=c*.06;
  float bright=pow(clamp(c,0.,1.),1.5);
  vec3 col=mix(C2*.2,C1,bright);
  col+=C1*pow(bright,4.)*.5;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "metaballs",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float f=0.;
  vec2 centers[5];
  centers[0]=vec2(P.x-.5,P.y-.5)*.8;
  centers[1]=vec2(P.z-.5,P.w-.5)*.8;
  centers[2]=vec2(Q.x-.5,Q.y-.5)*.8;
  centers[3]=vec2(Q.z-.5,Q.w-.5)*.6;
  centers[4]=vec2(h11(S+.9)-.5,h11(S+1.1)-.5)*.6;
  float weights[5];
  weights[0]=.18;weights[1]=.15;weights[2]=.13;weights[3]=.11;weights[4]=.1;
  vec3 col=vec3(0.);
  float wsum=0.;
  for(int i=0;i<5;i++){
    float d=length(uv-centers[i]);
    float w=weights[i]/(d*d+.001);
    f+=w;
    float t=float(i)*.25;
    col+=mix(C1,C2,t)*w;
    wsum+=w;
  }
  col/=wsum;
  float inside=smoothstep(.95,1.05,f);
  float edge=smoothstep(.75,.95,f)*(1.-inside);
  vec3 bg=mix(C2,C1,.05)*.15;
  gl_FragColor=vec4(mix(bg,col,inside)+C1*edge*.4,1.);}`,
	},
	{
		id: "julia-set",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  uv*=1.4;
  vec2 c=vec2(P.x*1.6-1.,.3+P.y*.4)*.7;
  vec2 z=uv;
  float iter=0.;
  for(int i=0;i<48;i++){
    if(dot(z,z)>4.) break;
    z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
    iter+=1.;
  }
  float t=iter/48.;
  vec3 col=mix(C2*.1,C1,smoothstep(0.,.6,t));
  col=mix(col,C2,smoothstep(.6,.95,t));
  col+=C1*pow(smoothstep(.4,.6,t),3.)*.4;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "voronoi-crystal",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV*4.+vec2(P.x,P.y)*2.;
  vec2 i=floor(uv);
  vec2 f=fract(uv);
  float md=8.;float md2=8.;
  vec2 mc=vec2(0.);
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 n=vec2(float(x),float(y));
    vec2 r=h22(i+n)+n-f;
    float d=dot(r,r);
    if(d<md){md2=md;md=d;mc=r;}
    else if(d<md2){md2=d;}
  }
  float edge=smoothstep(0.,.06,sqrt(md2)-sqrt(md));
  float cell=h12(floor(uv-mc+.5));
  vec3 col=mix(C1,C2,cell);
  col*=.5+.5*edge;
  col+=C1*(1.-edge)*.15;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "electric-plasma",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV*2.;
  float v=0.;
  v+=sin(uv.x*4.+P.x*10.);
  v+=sin(uv.y*4.+P.y*10.);
  v+=sin((uv.x+uv.y)*3.+P.z*8.);
  vec2 c=uv+vec2(sin(P.w*6.28),cos(Q.x*6.28))*.5;
  v+=sin(sqrt(c.x*c.x+c.y*c.y)*6.+Q.y*8.);
  v=v*.25+.5;
  vec3 col=hsl2rgb(vec3(H+v*.3,.85,.5+v*.2));
  col=mix(col,C1,smoothstep(.3,.7,v)*.4);
  col+=C2*pow(abs(sin(v*6.28316)),8.)*.3;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "liquid-marble",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float angle=P.x*3.14159;
  vec2 ruv=vec2(cos(angle)*uv.x-sin(angle)*uv.y,sin(angle)*uv.x+cos(angle)*uv.y);
  vec2 q=ruv*3.;
  q.x+=fbm(ruv*2.+vec2(P.y*4.,P.z*4.));
  q.y+=fbm(ruv*2.+vec2(P.w*4.,Q.x*4.));
  float f=fbm(q+vec2(Q.y*2.,Q.z*2.));
  vec3 col=mix(C2,C1,clamp(f*1.5-.1,0.,1.));
  col=mix(col,mix(C1,C2,.5),clamp(f*f*2.-.2,0.,1.));
  col+=C1*smoothstep(.6,.75,f)*.2;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "stained-glass",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV*3.5+vec2(P.x,P.y)*1.5;
  vec2 i=floor(uv);
  vec2 f=fract(uv);
  float md=8.;float md2=8.;
  vec2 mc=vec2(0.);
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 n=vec2(float(x),float(y));
    vec2 rp=h22(i+n)*.7+.15+n-f;
    float d=dot(rp,rp);
    if(d<md){md2=md;md=d;mc=rp;}
    else if(d<md2){md2=d;}
  }
  float edge=1.-smoothstep(.0,.07,sqrt(md2)-sqrt(md));
  float cell=h12(floor(uv-mc+.5));
  vec3 col=mix(C1,C2,cell)*.9;
  col*=.7+h12(floor(uv-mc+.5)+.3)*.3;
  col=mix(col,vec3(.05),edge);
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "topographic-map",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float f=fbm(uv*3.+vec2(P.x*4.,P.y*4.));
  f+=fbm(uv*6.+vec2(P.z*3.,P.w*3.))*.4;
  float contours=12.+P.x*8.;
  float banded=fract(f*contours);
  float line=smoothstep(0.,.06,banded)*smoothstep(1.,.94,banded);
  float elevation=clamp(f,0.,1.);
  vec3 lo=C2*.6;
  vec3 hi=C1;
  vec3 col=mix(lo,hi,elevation);
  col*=.75+line*.25;
  col=mix(col,C2*.2,smoothstep(.04,.0,banded));
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "circuit-board",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  vec2 grid=uv*8.+vec2(P.x,P.y)*4.;
  vec2 cell=fract(grid)-.5;
  vec2 id=floor(grid);
  float ch=h12(id+S);
  float cv=h12(id+S+.3);
  float trace=0.;
  if(ch>.4) trace=max(trace,smoothstep(.12,.08,abs(cell.y))*(smoothstep(-.5,-.35,cell.x)+smoothstep(.35,.5,cell.x)==0.?1.:0.));
  if(cv>.4) trace=max(trace,smoothstep(.12,.08,abs(cell.x))*(smoothstep(-.5,-.35,cell.y)+smoothstep(.35,.5,cell.y)==0.?1.:0.));
  float pad=smoothstep(.18,.14,length(cell));
  trace=max(trace,pad*step(.55,h12(id+S+.7)));
  vec3 bg=C2*.12;
  vec3 col=mix(bg,C1,trace);
  col+=C2*pad*.15;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "coral-growth",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float f=0.;
  vec2 p=uv;
  float scale=1.;
  for(int i=0;i<5;i++){
    p=abs(p)/dot(p,p)-vec2(.5+P.x*.3,.2+P.y*.2);
    f+=exp(-dot(p,p)*scale*.5)*scale;
    scale*=.6;
  }
  f=clamp(f*.4,0.,1.);
  float branch=pow(f,1.8);
  vec3 col=mix(C2*.1,C2,smoothstep(0.,.3,f));
  col=mix(col,C1,smoothstep(.3,.7,branch));
  col+=mix(C1,vec3(1.),.4)*pow(branch,3.)*.5;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "galaxy-spiral",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float r=length(uv);
  float a=atan(uv.y,uv.x);
  float arms=2.+floor(P.x*3.);
  float spin=P.y*6.28+a*arms-r*4.;
  float arm=pow(max(cos(spin)*.5+.5,0.),3.);
  float disk=exp(-r*r*3.)*arm;
  disk+=exp(-r*r*8.)*.4;
  float stars=0.;
  for(float i=0.;i<8.;i++){
    vec2 sc=vec2(h11(S+i*.53)-.5,h11(S+i*.53+.3)-.5)*1.8;
    stars+=exp(-length(uv-sc)*length(uv-sc)*200.)*(.5+h11(S+i*.53+.6)*.5);
  }
  vec3 col=mix(C2*.05,C1,clamp(disk,0.,1.));
  col+=C2*exp(-r*r*20.)*.6;
  col+=vec3(1)*stars*.5;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
];
