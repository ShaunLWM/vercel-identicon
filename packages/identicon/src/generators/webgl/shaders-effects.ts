import type { WebGLGenerator } from "../../types";
import { GLSL_PREAMBLE as G } from "./gl-preamble";

export const effectsShadersGenerators: WebGLGenerator[] = [
	{
		id: "neon-glow",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=(FC/R)*2.-1.;
  float baseRot=P.x*6.28;
  uv*=rot(baseRot+T*.4);
  float n=floor(P.y*6.+3.);
  float a=atan(uv.y,uv.x);
  float r=length(uv);
  float breath=sin(T*2.)*.015+sin(T*3.7)*.008;
  float d=r-(.3+breath)-sin(a*n+T*.8)*(.12+sin(T*1.3)*.02);
  float core=smoothstep(.01,-.01,d);
  float flicker=1.+sin(T*17.3)*.04+sin(T*31.7)*.02+sin(T*53.1)*.015;
  float glowPulse=1.+sin(T*1.8)*.15;
  float g1=exp(-abs(d)*15.)*.8*flicker;
  float g2=exp(-abs(d)*(5.-sin(T*1.1)*.5))*.4*glowPulse;
  float g3=exp(-abs(d)*(2.-sin(T*.7)*.3))*.18*glowPulse;
  vec3 col=C2*(.08+sin(T*.5)*.02);
  vec3 glowCol=C1+vec3(sin(T*.6)*.06,sin(T*.8+1.)*.04,sin(T*1.1+2.)*.06);
  col+=glowCol*(g3+g2+g1);
  col+=vec3(1)*core*(.3*flicker);
  float hotspot=exp(-abs(d)*20.)*pow(max(sin(a*2.-T*2.),0.),4.)*.3;
  col+=C1*hotspot;
  col=min(col,vec3(1));
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
		id: "fractal-coral",
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
	{
		id: "bayer-4x4-animated",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=FC/R;
  float angle=P.x*6.28+T*.3;
  float t=clamp(((uv.x-.5)*cos(angle)+(uv.y-.5)*sin(angle))+.5,0.,1.);
  t+=sin(T*1.6)*.03;
  int bx=int(mod(floor(FC.x/2.),4.));
  int by=int(mod(floor(FC.y/2.),4.));
  float bay=0.;
  if(by==0){if(bx==0)bay=0.;else if(bx==1)bay=8.;else if(bx==2)bay=2.;else bay=10.;}
  else if(by==1){if(bx==0)bay=12.;else if(bx==1)bay=4.;else if(bx==2)bay=14.;else bay=6.;}
  else if(by==2){if(bx==0)bay=3.;else if(bx==1)bay=11.;else if(bx==2)bay=1.;else bay=9.;}
  else{if(bx==0)bay=15.;else if(bx==1)bay=7.;else if(bx==2)bay=13.;else bay=5.;}
  float threshold=bay/16.;
  vec3 col1=C1+vec3(sin(T*.5)*.04,sin(T*.7+1.)*.03,sin(T*.9+2.)*.04);
  vec3 col2=C2+vec3(sin(T*.6+3.)*.03,sin(T*.4+4.)*.04,sin(T*.8+5.)*.03);
  gl_FragColor=vec4(t>threshold?col1:col2,1.);}`,
	},
	{
		id: "ink-in-water",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=UV*3.+S*10.;
  float t=T*.2;
  vec2 q=vec2(fbm(uv+t*.3),fbm(uv+vec2(5.2,1.3)+t*.2));
  vec2 r=vec2(fbm(uv+q*4.+vec2(1.7,9.2)+P.x*2.+t*.1),fbm(uv+q*4.+vec2(8.3,2.8)+P.y*2.+t*.15));
  float f=fbm(uv+r*3.);
  float tendril=smoothstep(.3,.7,f);
  vec3 col=mix(C2,C1,tendril);
  float edge=exp(-abs(f-.5)*8.)*.3;
  col+=mix(C1,C2,.5)*edge;
  col+=C1*q.x*.1;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "supercell",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=(FC/R)*2.-1.;
  float r=length(uv);
  float a=atan(uv.y,uv.x);
  float spiral=a+r*3.+T*.3;
  float bands=sin(spiral*3.+P.x*6.)*sin(spiral*5.+P.y*4.)*.5+.5;
  float turb=fbm(uv*4.+vec2(cos(T*.2),sin(T*.15))+S*10.);
  float cloud=bands*.6+turb*.4;
  float eye=smoothstep(.15,.08,r);
  cloud=mix(cloud,0.,eye);
  vec3 dark=C2*.2;
  vec3 bright=C1*.9+vec3(.1);
  vec3 col=mix(dark,bright,cloud);
  col+=C1*smoothstep(.2,.12,r)*smoothstep(.08,.12,r)*.4;
  col*=smoothstep(1.,.5,r);
  col=mix(C2*.08,col,smoothstep(1.,.85,r));
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "warp-fabric",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=UV*2.+S*10.;
  float t=T*.15;
  vec2 q=vec2(fbm(uv+t*.3),fbm(uv+vec2(1,1)+t*.2));
  vec2 r=vec2(fbm(uv+q*4.+vec2(P.x*5.,P.y*5.)+t*.1),fbm(uv+q*4.+vec2(P.z*5.,P.w*5.)+t*.12));
  float f=fbm(uv+r*2.);
  vec3 col=mix(C2,C1,clamp(f,0.,1.));
  col=mix(col,C1*.6+C2*.4,clamp(length(q),0.,1.));
  col=mix(col,C1,clamp(r.x,0.,1.)*.5);
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "gradient-orb",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=UV;
  vec2 b1=vec2(P.x,P.y);
  vec2 b2=vec2(P.z,P.w);
  vec2 b3=vec2(Q.x,Q.y);
  vec2 c1=b1+vec2(sin(T*.7+b1.x*6.)*.08,cos(T*.9+b1.y*6.)*.08);
  vec2 c2=b2+vec2(sin(T*.6+2.1)*.1,cos(T*.8+1.3)*.07);
  vec2 c3=b3+vec2(sin(T*.5+4.2)*.07,cos(T*1.1+3.7)*.09);
  float breath=1.+sin(T*1.3)*.06;
  float d1=(1.-length(uv-c1)*1.5)*breath;
  float d2=(1.-length(uv-c2)*1.5)*(1.+sin(T*1.7+1.)*.05);
  float d3=(1.-length(uv-c3)*1.5)*(1.+sin(T*1.1+2.)*.05);
  vec3 col=vec3(0);
  col=1.-(1.-col)*(1.-C1*max(d1,0.));
  col=1.-(1.-col)*(1.-C2*max(d2,0.));
  vec3 c3col=mix(C1,C2,.5+sin(T*.4)*.15);
  col=1.-(1.-col)*(1.-c3col*max(d3,0.));
  col=clamp(col,0.,1.);
  gl_FragColor=vec4(col,1.);}`,
	},
];
