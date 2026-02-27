export const GLSL_PREAMBLE = `precision mediump float;
uniform vec2 R;uniform float S,H;uniform vec4 P,Q;uniform vec3 C1,C2;
#define UV (gl_FragCoord.xy/R)
#define FC gl_FragCoord.xy
float h12(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float h11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
vec2 h22(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}
mat2 rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
float sdCirc(vec2 p,float r){return length(p)-r;}
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float sdHex(vec2 p,float r){const vec3 k=vec3(-.866025,.5,.57735);p=abs(p);p-=2.*min(dot(k.xy,p),0.)*k.xy;p-=vec2(clamp(p.x,-k.z*r,k.z*r),r);return length(p)*sign(p.y);}
float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*.25;}
vec3 hsl2rgb(vec3 c){vec3 r=clamp(abs(mod(c.x*6.+vec3(0,4,2),6.)-3.)-1.,0.,1.);return c.z+c.y*(r-.5)*(1.-abs(2.*c.z-1.));}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h12(i),h12(i+vec2(1,0)),u.x),mix(h12(i+vec2(0,1)),h12(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vnoise(p);p*=2.;a*=.5;}return v;}
`;
