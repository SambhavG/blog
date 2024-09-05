import{s as ot,a as N,e as nt,n as it}from"./scheduler.DVE4yslD.js";import{S as st,i as rt,f as ut,h as mt,m as dt,t as ht,j as ft,k as pt,e as i,s as u,c as s,g as r,a as m,l as q,b as n,d as a}from"./index.hm2RE5aj.js";import{M as ct,g as xt,a as at}from"./mdsvex.CxU8vHfN.js";function vt(I){let l,c="Contents",p,h,o='<li><a href="#introduction">Introduction</a></li> <li><a href="#one-flop">One FLOP</a></li> <li><a href="#matrix-multiplication">Matrix Multiplication</a></li> <li><a href="#attention">Attention</a></li>',d,f,Y="Introduction",O,w,D="You’re a [era before computers were invented] century metallurgist who’s a master of their craft, particularly skilled at producing very accurately machined gears. One day, printed on 256 million double-sided sheets of paper (assuming 2,500 characters per side of page), you stumble across the weights of Llama 3 8B, along with a document explaining the role of each number in the computation. With the help of a mathematician friend, you fully understand the computation graph of the LLM. Could you build Llama 3 8B with gears?",$,y,E="Obviously we’re going to need a lot of simplification of details here - I’m looking for a roughly correct order estimate of the number of gears required to pull this off.",B,b,G="One thing I could do is just look at (1) the number of gears required for a floating point operation (FLOP) and (2) number of FLOPs in a modern LLM, and I’d get an interesting number, but I’d like to go in more detail than that.",H,x,J="One FLOP",A,_,K="Let’s say we have two numbers x and y between -1 and 1 which we want to multiply together. The value of y will be completely static and non-programmable, like a weight of the model, and x will be dynamic and provided as input via the rotation of an axle (so the axle will be rotated x times). We need to rotate a rod by xy rotations.",F,C,Q="This is pretty simple in gear arithmetic: if gear A has m teeth and gear B has n teeth, then one rotation of gear A will lead to m teeth meshing with gear B, on which the number of rotations of gear B will be one for every set of n teeth on it that end up meshing with gear A, so m/n total rotations on gear B. Now we need to find m and n such that (1) the gears physically work, and (2) x*m/n = xy. We need m/n = y, so m = ny. We know bounds on y, so we just need to set m to an arbitrary number like 20 and n to 20/y. For cases where y is really small, creating an unreasonably large gear B, we could gear down until each gear in the chain had a reasonable number of teeth; I’ll multiply by a scaling factor of 1.2 to account for this. If y is negative, we can add a second gear to flip the sign; let’s assume half of the model’s multiplicative weights are negative (I’m not going to check this against the real weights) and multiply by 1.25.",T,k,R="In general, we need about 3 gears to convert a rotation of some amount into a rotation of that amount multiplied by a fixed floating point number that we know in advance.",j,L,V="Addition is tricky, because we generally want control over both (or all) inputs. To add numbers, we’ll probably need to have the input gears couple and decouple with an output gear one by one. We’ll assume we have someone who can pull some levers to make this happen seamlessly. To add n numbers, we’ll need n+1 gears for a gear on each of the n input axles and one on the output axle (all of these gears will be the same size; they can either be arranged all on the same plane as the output or the output gear can be really tall).",W,v,X="Matrix Multiplication",z,M,Z="Let’s multiply two matrices of size m x n and n x k. Using the default matrix multiplication algorithm, this requires mnk multiplications and mk different n-additions (one for each element of the output matrix) so in total we’ll need 3mnk + m(n+1)k = mk(4n+1) gears.",S,g,tt="Attention",U,P,et="For the attention operation, there’s some more moving parts.";return{c(){l=i("h2"),l.textContent=c,p=u(),h=i("ul"),h.innerHTML=o,d=u(),f=i("h2"),f.textContent=Y,O=u(),w=i("p"),w.textContent=D,$=u(),y=i("p"),y.textContent=E,B=u(),b=i("p"),b.textContent=G,H=u(),x=i("h2"),x.textContent=J,A=u(),_=i("p"),_.textContent=K,F=u(),C=i("p"),C.textContent=Q,T=u(),k=i("p"),k.textContent=R,j=u(),L=i("p"),L.textContent=V,W=u(),v=i("h2"),v.textContent=X,z=u(),M=i("p"),M.textContent=Z,S=u(),g=i("h2"),g.textContent=tt,U=u(),P=i("p"),P.textContent=et,this.h()},l(t){l=s(t,"H2",{id:!0,"data-svelte-h":!0}),r(l)!=="svelte-mkui86"&&(l.textContent=c),p=m(t),h=s(t,"UL",{"data-svelte-h":!0}),r(h)!=="svelte-vcrqno"&&(h.innerHTML=o),d=m(t),f=s(t,"H2",{id:!0,"data-svelte-h":!0}),r(f)!=="svelte-p88ani"&&(f.textContent=Y),O=m(t),w=s(t,"P",{"data-svelte-h":!0}),r(w)!=="svelte-bqn39"&&(w.textContent=D),$=m(t),y=s(t,"P",{"data-svelte-h":!0}),r(y)!=="svelte-12xvc4d"&&(y.textContent=E),B=m(t),b=s(t,"P",{"data-svelte-h":!0}),r(b)!=="svelte-1n2cfcr"&&(b.textContent=G),H=m(t),x=s(t,"H2",{id:!0,"data-svelte-h":!0}),r(x)!=="svelte-o25ndl"&&(x.textContent=J),A=m(t),_=s(t,"P",{"data-svelte-h":!0}),r(_)!=="svelte-1lavmap"&&(_.textContent=K),F=m(t),C=s(t,"P",{"data-svelte-h":!0}),r(C)!=="svelte-1sjkfbn"&&(C.textContent=Q),T=m(t),k=s(t,"P",{"data-svelte-h":!0}),r(k)!=="svelte-1qwlsb1"&&(k.textContent=R),j=m(t),L=s(t,"P",{"data-svelte-h":!0}),r(L)!=="svelte-1ses1uq"&&(L.textContent=V),W=m(t),v=s(t,"H2",{id:!0,"data-svelte-h":!0}),r(v)!=="svelte-1tu5yox"&&(v.textContent=X),z=m(t),M=s(t,"P",{"data-svelte-h":!0}),r(M)!=="svelte-1yp6evn"&&(M.textContent=Z),S=m(t),g=s(t,"H2",{id:!0,"data-svelte-h":!0}),r(g)!=="svelte-1tpa33m"&&(g.textContent=tt),U=m(t),P=s(t,"P",{"data-svelte-h":!0}),r(P)!=="svelte-1gwsq7s"&&(P.textContent=et),this.h()},h(){q(l,"id","contents"),q(f,"id","introduction"),q(x,"id","one-flop"),q(v,"id","matrix-multiplication"),q(g,"id","attention")},m(t,e){n(t,l,e),n(t,p,e),n(t,h,e),n(t,d,e),n(t,f,e),n(t,O,e),n(t,w,e),n(t,$,e),n(t,y,e),n(t,B,e),n(t,b,e),n(t,H,e),n(t,x,e),n(t,A,e),n(t,_,e),n(t,F,e),n(t,C,e),n(t,T,e),n(t,k,e),n(t,j,e),n(t,L,e),n(t,W,e),n(t,v,e),n(t,z,e),n(t,M,e),n(t,S,e),n(t,g,e),n(t,U,e),n(t,P,e)},p:it,d(t){t&&(a(l),a(p),a(h),a(d),a(f),a(O),a(w),a($),a(y),a(B),a(b),a(H),a(x),a(A),a(_),a(F),a(C),a(T),a(k),a(j),a(L),a(W),a(v),a(z),a(M),a(S),a(g),a(U),a(P))}}}function gt(I){let l,c;const p=[I[0],lt];let h={$$slots:{default:[vt]},$$scope:{ctx:I}};for(let o=0;o<p.length;o+=1)h=N(h,p[o]);return l=new ct({props:h}),{c(){ut(l.$$.fragment)},l(o){mt(l.$$.fragment,o)},m(o,d){dt(l,o,d),c=!0},p(o,[d]){const f=d&1?xt(p,[d&1&&at(o[0]),d&0&&at(lt)]):{};d&2&&(f.$$scope={dirty:d,ctx:o}),l.$set(f)},i(o){c||(ht(l.$$.fragment,o),c=!0)},o(o){ft(l.$$.fragment,o),c=!1},d(o){pt(l,o)}}}const lt={title:"Building a Mechanical LLM",description:"How many gears would it take to build a modern LLM?",date:"2024-07-05",published:!1};function wt(I,l,c){return I.$$set=p=>{c(0,l=N(N({},l),nt(p)))},l=nt(l),[l]}class Ct extends st{constructor(l){super(),rt(this,l,wt,gt,ot,{})}}export{Ct as default,lt as metadata};
