import type { WebGLGenerator } from "../../types";
import { GLSL_PREAMBLE as G } from "./gl-preamble";

export const sceneShadersGenerators: WebGLGenerator[] = [
	{
		id: "aurora-bands",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=UV;
  float y=uv.y;
  float bands=3.+P.x*3.;
  float wobble=sin(uv.y*6.+P.y*10.+T*.5)*.08+sin(uv.y*11.+P.z*8.+T*.3)*.04;
  float x=uv.x+wobble;
  float v=0.;
  v+=sin((y*bands+x*.5+P.w*5.+T*.2)*3.14159)*.5+.5;
  v+=sin((y*bands*1.7+x*.3+Q.x*7.+T*.15)*3.14159)*.25;
  v=clamp(v,0.,1.);
  vec3 mid=mix(C1,C2,.5)*1.2;
  vec3 col;
  if(v<.5) col=mix(C2*.6,mid,v*2.);
  else col=mix(mid,C1,v*2.-1.);
  col+=C1*exp(-abs(v-.7)*8.)*.15;
  col=clamp(col,0.,1.);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "layered-ridges",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  vec3 col=C2*.4;
  float layers=4.+P.x*3.;
  for(float i=0.;i<7.;i++){
    if(i>=layers) break;
    float t=i/layers;
    float ridge=0.;
    ridge+=sin(uv.x*3.14159*(2.+i)+P.y*10.+i*2.3)*.15;
    ridge+=sin(uv.x*3.14159*(4.+i*.7)+P.z*8.+i*1.7)*.08;
    ridge+=sin(uv.x*3.14159*(7.+i*1.3)+P.w*6.+i*3.1)*.04;
    float ridgeY=.15+t*.7+ridge;
    if(uv.y>ridgeY){
      col=mix(C2,C1,t*.8+.2);
      col*=.6+t*.4;
    }
  }
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "ink-drop",
		animated: true,
		fragmentSource:
			G +
			`uniform float T;
void main(){
  vec2 uv=UV;
  vec2 b1=vec2(P.x,P.y)+vec2(sin(T*.4)*.03,cos(T*.5)*.03);
  vec2 b2=vec2(P.z,P.w)+vec2(sin(T*.3+2.)*.03,cos(T*.6+1.)*.03);
  vec2 b3=vec2(Q.x,Q.y)+vec2(sin(T*.5+4.)*.02,cos(T*.4+3.)*.03);
  float f=0.;
  f+=.15/(.01+length(uv-b1));
  f+=.12/(.01+length(uv-b2));
  f+=.1/(.01+length(uv-b3));
  f=clamp(f*.03,0.,1.);
  float w1=1./(.01+length(uv-b1));
  float w2=1./(.01+length(uv-b2));
  float wt=w1+w2+1./(.01+length(uv-b3));
  float blend=w1/wt;
  vec3 col=mix(C2,C1,blend);
  col=mix(C2*.3,col,smoothstep(.2,.6,f));
  col+=mix(C1,C2,.5)*exp(-abs(f-.5)*6.)*.1;
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "bokeh",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  vec3 col=mix(C2,C1,.15)*.3;
  for(float i=0.;i<7.;i++){
    vec2 center=vec2(h11(S+i*.73),h11(S+i*.73+.5));
    float radius=.1+h11(S+i*.73+.3)*.2;
    float d=length(uv-center);
    float circle=smoothstep(radius,radius-.02,d);
    float glow=exp(-d/radius*2.)*.3;
    float t=h11(S+i*.73+.7);
    vec3 circCol=mix(C1,C2,t);
    col+=circCol*(circle*.3+glow*.15);
    col+=circCol*smoothstep(.02,0.,abs(d-radius))*.2;
  }
  col=clamp(col,0.,1.);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "silk-fold",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=UV;
  float angle=P.x*3.14159;
  vec2 ruv=vec2(cos(angle)*uv.x+sin(angle)*uv.y,-sin(angle)*uv.x+cos(angle)*uv.y);
  float fold=0.;
  fold+=sin(ruv.x*6.28*2.+P.y*10.)*.3;
  fold+=sin(ruv.x*6.28*3.5+P.z*8.)*.15;
  fold+=sin(ruv.x*6.28*5.+P.w*6.)*.08;
  float v=ruv.y+fold;
  float shade=sin(v*6.28*1.5)*.5+.5;
  float spec=pow(max(sin(v*6.28*1.5+.5),0.),8.)*.3;
  vec3 col=mix(C2,C1,shade);
  col+=vec3(1)*spec*.2;
  col+=mix(C1,C2,.5)*smoothstep(.45,.55,shade)*.1;
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "prism-split",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float angle=P.x*3.14159;
  float ru=cos(angle)*uv.x+sin(angle)*uv.y;
  float rv=-sin(angle)*uv.x+cos(angle)*uv.y;
  float beam=exp(-rv*rv*40.);
  float spread=abs(ru)*.8;
  float spectral=rv*3./(spread+.3);
  vec3 rainbow;
  float t=clamp(spectral*.5+.5,0.,1.);
  rainbow=hsl2rgb(vec3(t*.8,.9,.55));
  vec3 bg=mix(C2,C1,.1)*.15;
  vec3 col=bg;
  float dispersion=smoothstep(0.,.3,spread)*beam;
  col=mix(col,rainbow,dispersion*.8);
  float center=exp(-ru*ru*20.)*beam;
  col+=vec3(1)*center*.5;
  col+=C1*exp(-length(uv+vec2(.3,0.))*2.)*.08;
  col+=C2*exp(-length(uv-vec2(.3,0.))*2.)*.08;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "angular-gradient",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float a=atan(uv.y,uv.x)/6.28318+.5;
  float s1=P.x,s2=P.y,s3=P.z;
  float lo=min(s1,min(s2,s3));
  float hi=max(s1,max(s2,s3));
  float md=s1+s2+s3-lo-hi;
  float t1=smoothstep(lo-.1,lo+.1,a);
  float t2=smoothstep(md-.1,md+.1,a);
  float t3=smoothstep(hi-.1,hi+.1,a);
  vec3 col=C2;
  col=mix(col,C1,t1);
  col=mix(col,mix(C1,C2,.5),t2);
  col=mix(col,C2,t3);
  float r=length(uv);
  col*=.85+.15*(1.-r);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "faceted-gem",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float a=atan(uv.y,uv.x);
  float r=length(uv);
  float n=floor(P.x*4.+5.);
  float facetA=floor(a/(6.28318/n))*6.28318/n+3.14159/n;
  float lightAngle=P.y*6.28;
  float facetShade=cos(facetA-lightAngle)*.5+.5;
  float zone;
  if(r<.25) zone=.9;
  else if(r<.55) zone=facetShade*.6+.3;
  else zone=facetShade*.4+.1;
  float spec=pow(max(cos(facetA-lightAngle-P.z),0.),12.)*.4;
  spec*=step(.25,r)*step(r,.7);
  vec3 col=mix(C2,C1,zone);
  col+=vec3(1)*spec;
  float edgeA=abs(fract(a/(6.28318/n))-.5)*2.;
  float edgeR=abs(r-.25)<.02||abs(r-.55)<.02?1.:0.;
  float edge=step(.92,edgeA)+edgeR;
  col=mix(col,C2*.3,edge*.3);
  gl_FragColor=vec4(col,1.);}`,
	},
	{
		id: "tide-pool",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float cx=P.x-.5,cy=P.y-.5;
  float r=length(uv-vec2(cx,cy)*.6);
  float a=atan(uv.y-cy*.6,uv.x-cx*.6);
  float w=sin(a*3.+P.z*10.)*.08+sin(a*7.+P.w*8.)*.04+sin(a*11.+Q.x*6.)*.02;
  float d=r+w;
  float bands=5.;
  float band=fract(d*bands*.8);
  float bandIdx=floor(d*bands*.8);
  float t=mod(bandIdx,3.)/2.;
  vec3 col;
  if(t<.25) col=C1;
  else if(t<.75) col=mix(C1,C2,.5)*1.1;
  else col=C2;
  float edge=smoothstep(.0,.08,band)*smoothstep(1.,.92,band);
  col*=.7+edge*.3;
  col+=C1*exp(-r*4.)*.15;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
	{
		id: "eclipse",
		fragmentSource:
			G +
			`void main(){
  vec2 uv=(FC/R)*2.-1.;
  float r1=length(uv);
  float mainCirc=smoothstep(.82,.78,r1);
  vec2 off=vec2(P.x-.5,P.y-.5)*.7;
  float r2=length(uv-off);
  float occluder=smoothstep(.72,.68,r2);
  float crescent=mainCirc*(1.-occluder);
  float corona=exp(-(r1-.8)*(r1-.8)*30.)*.5;
  corona*=(1.-occluder*.7);
  vec3 bg=C2*.08;
  vec3 col=bg;
  col+=C1*corona;
  col+=mix(C1,vec3(1),.3)*crescent;
  float innerGlow=exp(-abs(r1-.75)*20.)*crescent*.3;
  col+=C1*innerGlow;
  gl_FragColor=vec4(clamp(col,0.,1.),1.);}`,
	},
];
