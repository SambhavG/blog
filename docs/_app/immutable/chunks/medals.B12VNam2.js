import{s as x,a as f,e as w,n as k}from"./scheduler.DVE4yslD.js";import{S as T,i as z,f as $,h as C,m as I,t as M,j,k as q,e as m,s as v,c as d,g as p,a as g,b as c,d as u}from"./index.hm2RE5aj.js";import{M as D,g as N,a as y}from"./mdsvex.CxU8vHfN.js";function Y(r){let e,l='This is a quick writeup about a <a href="https://sambhavg.github.io/medal" rel="nofollow">visualization</a> I made a couple weeks ago where I used three.js to put together an interactive 3D layer cake of medal sorting schemes, where each scheme assigned a different value to silver and bronze medals with respect to gold. The visualization was inspired by a <a href="https://www.nytimes.com/interactive/2024/07/29/upshot/olympics-medal-table-paris.html" rel="nofollow">New York Times</a> piece in which they identified that most of the schemes for ranking Olympic teams by the number of gold, silver, and bronze medals are actually just points in a 2D space, where one dimension is the value of silver with respect to gold, and the other is the value of bronze with respect to silver.',o,n,t="This accounts for all points-based schemes - you can come up with weirder schemes like points = gold^3 + silver^2 + bronze, but most schemes fall somewhere on this 2D plane. If we add the restriction that better medals are always worth at least as many points, we get a quarter of a plane, and if we scale the axis in the other direction exponentially, we get an enclosed square.",s,i,_="The NYT shows all their squares separately, but you can actually interleave the planes with each other by representing placement with not color, but height. This is what I do with my visualization: I keep the medal value axes the same, but I stack the planes in 3D so you can see all of the rankings at once. I don’t claim it’s easier to understand than the NYT version (it’s probably much harder), but that’s the idea. I also smooth out the planes so they don’t sharply snap up and down at the border lines you can see in the NYT version.";return{c(){e=m("p"),e.innerHTML=l,o=v(),n=m("p"),n.textContent=t,s=v(),i=m("p"),i.textContent=_},l(a){e=d(a,"P",{"data-svelte-h":!0}),p(e)!=="svelte-36z1pt"&&(e.innerHTML=l),o=g(a),n=d(a,"P",{"data-svelte-h":!0}),p(n)!=="svelte-sgczjc"&&(n.textContent=t),s=g(a),i=d(a,"P",{"data-svelte-h":!0}),p(i)!=="svelte-1d2f683"&&(i.textContent=_)},m(a,h){c(a,e,h),c(a,o,h),c(a,n,h),c(a,s,h),c(a,i,h)},p:k,d(a){a&&(u(e),u(o),u(n),u(s),u(i))}}}function P(r){let e,l;const o=[r[0],b];let n={$$slots:{default:[Y]},$$scope:{ctx:r}};for(let t=0;t<o.length;t+=1)n=f(n,o[t]);return e=new D({props:n}),{c(){$(e.$$.fragment)},l(t){C(e.$$.fragment,t)},m(t,s){I(e,t,s),l=!0},p(t,[s]){const i=s&1?N(o,[s&1&&y(t[0]),s&0&&y(b)]):{};s&2&&(i.$$scope={dirty:s,ctx:t}),e.$set(i)},i(t){l||(M(e.$$.fragment,t),l=!0)},o(t){j(e.$$.fragment,t),l=!1},d(t){q(e,t)}}}const b={title:"Sorting Medals",description:"Every possible way to rank the Olympic teams, now in 3D",date:"2024-08-31",published:!0};function S(r,e,l){return r.$$set=o=>{l(0,e=f(f({},e),w(o)))},e=w(e),[e]}class E extends T{constructor(e){super(),z(this,e,S,P,x,{})}}export{E as default,b as metadata};
