import{s as M,n as I}from"../chunks/scheduler.Bbwc-GOu.js";import{S as N,i as U,s as S,e as v,A as F,d as u,a as P,c as g,q as k,n as d,b as O,z as p,B as G,u as w,v as y,w as z}from"../chunks/index.bS2X9F8q.js";import{t as H,e as L}from"../chunks/config.mvX_qwoG.js";import{f as T}from"../chunks/utils.BzZo_9Im.js";async function J({fetch:n}){return{posts:await(await n("api/posts")).json()}}const Y=Object.freeze(Object.defineProperty({__proto__:null,load:J},Symbol.toStringTag,{value:"Module"}));function B(n,t,l){const o=n.slice();return o[1]=t[l],o}function D(n){let t,l,o=n[1].title+"",r,a,s,i,e=T(n[1].date)+"",f,_,m,E=n[1].description+"",b,j;return{c(){t=v("li"),l=v("a"),r=w(o),s=S(),i=v("p"),f=w(e),_=S(),m=v("p"),b=w(E),j=S(),this.h()},l(h){t=g(h,"LI",{class:!0});var c=k(t);l=g(c,"A",{href:!0,class:!0});var q=k(l);r=y(q,o),q.forEach(u),s=P(c),i=g(c,"P",{class:!0});var A=k(i);f=y(A,e),A.forEach(u),_=P(c),m=g(c,"P",{class:!0});var C=k(m);b=y(C,E),C.forEach(u),j=P(c),c.forEach(u),this.h()},h(){d(l,"href",a=n[1].slug),d(l,"class","title svelte-1tkp6cl"),d(i,"class","date svelte-1tkp6cl"),d(m,"class","description svelte-1tkp6cl"),d(t,"class","post svelte-1tkp6cl")},m(h,c){O(h,t,c),p(t,l),p(l,r),p(t,s),p(t,i),p(i,f),p(t,_),p(t,m),p(m,b),p(t,j)},p(h,c){c&1&&o!==(o=h[1].title+"")&&z(r,o),c&1&&a!==(a=h[1].slug)&&d(l,"href",a),c&1&&e!==(e=T(h[1].date)+"")&&z(f,e),c&1&&E!==(E=h[1].description+"")&&z(b,E)},d(h){h&&u(t)}}}function K(n){let t,l,o;document.title=H;let r=L(n[0].posts),a=[];for(let s=0;s<r.length;s+=1)a[s]=D(B(n,r,s));return{c(){t=S(),l=v("section"),o=v("ul");for(let s=0;s<a.length;s+=1)a[s].c();this.h()},l(s){F("svelte-fbczdu",document.head).forEach(u),t=P(s),l=g(s,"SECTION",{});var e=k(l);o=g(e,"UL",{class:!0});var f=k(o);for(let _=0;_<a.length;_+=1)a[_].l(f);f.forEach(u),e.forEach(u),this.h()},h(){d(o,"class","posts svelte-1tkp6cl")},m(s,i){O(s,t,i),O(s,l,i),p(l,o);for(let e=0;e<a.length;e+=1)a[e]&&a[e].m(o,null)},p(s,[i]){if(i&1){r=L(s[0].posts);let e;for(e=0;e<r.length;e+=1){const f=B(s,r,e);a[e]?a[e].p(f,i):(a[e]=D(f),a[e].c(),a[e].m(o,null))}for(;e<a.length;e+=1)a[e].d(1);a.length=r.length}},i:I,o:I,d(s){s&&(u(t),u(l)),G(a,s)}}}function Q(n,t,l){let{data:o}=t;return n.$$set=r=>{"data"in r&&l(0,o=r.data)},[o]}class Z extends N{constructor(t){super(),U(this,t,Q,K,M,{data:0})}}export{Z as component,Y as universal};