import{s as k,n as m,l as V,c as O,u as H,g as L,d as N,k as D}from"../chunks/scheduler.DVE4yslD.js";import{S as q,i as E,e as d,c as h,g as F,l as f,b as y,d as c,v as z,u as g,w as B,A as b,o as w,y as G,j as p,r as P,t as v,C as R,f as S,s as A,h as M,a as C,m as T,k as j}from"../chunks/index.DcLpJe-d.js";import{u as J,t as K}from"../chunks/config.DxTTfmVZ.js";const Q=!0;async function U({url:l}){return{url:l.pathname}}const ue=Object.freeze(Object.defineProperty({__proto__:null,load:U,prerender:Q},Symbol.toStringTag,{value:"Module"}));function W(l){let e,r='<p class="svelte-1fvv9s8">Made by <a href="https://sambhavg.github.io/" target="_blank">Sambhav Gupta</a></p>';return{c(){e=d("footer"),e.innerHTML=r,this.h()},l(a){e=h(a,"FOOTER",{class:!0,"data-svelte-h":!0}),F(e)!=="svelte-egjb02"&&(e.innerHTML=r),this.h()},h(){f(e,"class","svelte-1fvv9s8")},m(a,s){y(a,e,s)},p:m,i:m,o:m,d(a){a&&c(e)}}}class X extends q{constructor(e){super(),E(this,e,null,W,k,{})}}function Y(l,{delay:e=0,duration:r=400,easing:a=V}={}){const s=+getComputedStyle(l).opacity;return{delay:e,duration:r,easing:a,css:t=>`opacity: ${t*s}`}}localStorage.getItem("color-scheme");function Z(l){let e,r,a,s=K+"",t;return{c(){e=d("nav"),r=d("a"),a=d("b"),t=z(s),this.h()},l(n){e=h(n,"NAV",{class:!0});var o=g(e);r=h(o,"A",{href:!0,class:!0});var _=g(r);a=h(_,"B",{class:!0});var i=g(a);t=B(i,s),i.forEach(c),_.forEach(c),o.forEach(c),this.h()},h(){f(a,"class","svelte-1kqq7cd"),f(r,"href",J),f(r,"class","title svelte-1kqq7cd"),f(e,"class","svelte-1kqq7cd")},m(n,o){y(n,e,o),b(e,r),b(r,a),b(a,t)},p:m,i:m,o:m,d(n){n&&c(e)}}}class x extends q{constructor(e){super(),E(this,e,null,Z,k,{})}}function I(l){let e,r,a;const s=l[2].default,t=O(s,l,l[1],null);return{c(){e=d("div"),t&&t.c(),this.h()},l(n){e=h(n,"DIV",{class:!0});var o=g(e);t&&t.l(o),o.forEach(c),this.h()},h(){f(e,"class","transition svelte-vcdv4c")},m(n,o){y(n,e,o),t&&t.m(e,null),a=!0},p(n,o){t&&t.p&&(!a||o&2)&&H(t,s,n,n[1],a?N(s,n[1],o,null):L(n[1]),null)},i(n){a||(v(t,n),n&&(r||D(()=>{r=R(e,Y,{}),r.start()})),a=!0)},o(n){p(t,n),a=!1},d(n){n&&c(e),t&&t.d(n)}}}function ee(l){let e=l[0],r,a,s=I(l);return{c(){s.c(),r=w()},l(t){s.l(t),r=w()},m(t,n){s.m(t,n),y(t,r,n),a=!0},p(t,[n]){n&1&&k(e,e=t[0])?(G(),p(s,1,1,m),P(),s=I(t),s.c(),v(s,1),s.m(r.parentNode,r)):s.p(t,n)},i(t){a||(v(s),a=!0)},o(t){p(s),a=!1},d(t){t&&c(r),s.d(t)}}}function te(l,e,r){let{$$slots:a={},$$scope:s}=e,{url:t}=e;return l.$$set=n=>{"url"in n&&r(0,t=n.url),"$$scope"in n&&r(1,s=n.$$scope)},[t,s,a]}class se extends q{constructor(e){super(),E(this,e,te,ee,k,{url:0})}}function ae(l){let e;const r=l[1].default,a=O(r,l,l[2],null);return{c(){a&&a.c()},l(s){a&&a.l(s)},m(s,t){a&&a.m(s,t),e=!0},p(s,t){a&&a.p&&(!e||t&4)&&H(a,r,s,s[2],e?N(r,s[2],t,null):L(s[2]),null)},i(s){e||(v(a,s),e=!0)},o(s){p(a,s),e=!1},d(s){a&&a.d(s)}}}function ne(l){let e,r,a,s,t,n,o,_;return r=new x({}),t=new se({props:{url:l[0].url,$$slots:{default:[ae]},$$scope:{ctx:l}}}),o=new X({}),{c(){e=d("div"),S(r.$$.fragment),a=A(),s=d("main"),S(t.$$.fragment),n=A(),S(o.$$.fragment),this.h()},l(i){e=h(i,"DIV",{class:!0});var u=g(e);M(r.$$.fragment,u),a=C(u),s=h(u,"MAIN",{class:!0});var $=g(s);M(t.$$.fragment,$),$.forEach(c),n=C(u),M(o.$$.fragment,u),u.forEach(c),this.h()},h(){f(s,"class","svelte-9rv88k"),f(e,"class","layout svelte-9rv88k")},m(i,u){y(i,e,u),T(r,e,null),b(e,a),b(e,s),T(t,s,null),b(e,n),T(o,e,null),_=!0},p(i,[u]){const $={};u&1&&($.url=i[0].url),u&4&&($.$$scope={dirty:u,ctx:i}),t.$set($)},i(i){_||(v(r.$$.fragment,i),v(t.$$.fragment,i),v(o.$$.fragment,i),_=!0)},o(i){p(r.$$.fragment,i),p(t.$$.fragment,i),p(o.$$.fragment,i),_=!1},d(i){i&&c(e),j(r),j(t),j(o)}}}function re(l,e,r){let{$$slots:a={},$$scope:s}=e,{data:t}=e;return l.$$set=n=>{"data"in n&&r(0,t=n.data),"$$scope"in n&&r(2,s=n.$$scope)},[t,a,s]}class ce extends q{constructor(e){super(),E(this,e,re,ne,k,{data:0})}}export{ce as component,ue as universal};
