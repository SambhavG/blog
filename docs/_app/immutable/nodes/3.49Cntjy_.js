const __vite__fileDeps=["../chunks/bend.DPk_Ipnh.js","../chunks/scheduler.Bbwc-GOu.js","../chunks/index.bS2X9F8q.js","../chunks/spread.CgU5AtxT.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import{_ as K}from"../chunks/preload-helper.D6kgxu3v.js";import{H as Q}from"../chunks/control.CYgJF_JY.js";import{s as W}from"../chunks/scheduler.Bbwc-GOu.js";import{S as X,i as Y,y as R,e as v,s as M,u as S,h as C,A as Z,c as h,d as l,a as O,q as P,v as L,j as x,n as m,z as i,b as U,m as V,w as G,f as N,p as tt,t as B,k as F,x as et}from"../chunks/index.bS2X9F8q.js";import{f as J}from"../chunks/utils.BzZo_9Im.js";const at=(n,e,s)=>{const o=n[e];return o?typeof o=="function"?o():Promise.resolve(o):new Promise((u,g)=>{(typeof queueMicrotask=="function"?queueMicrotask:setTimeout)(g.bind(null,new Error("Unknown variable dynamic import: "+e+(e.split("/").length!==s?". Note that variables only represent file names one level deep.":""))))})};function nt(n,e){throw new Q(n,e)}new TextEncoder;async function ot({params:n}){try{const e=await at(Object.assign({"../../posts/bend.md":()=>K(()=>import("../chunks/bend.DPk_Ipnh.js"),__vite__mapDeps([0,1,2,3]),import.meta.url)}),`../../posts/${n.slug}.md`,4);return{content:e.default,meta:e.metadata}}catch{nt(404,`Could not find ${n.slug}`)}}const pt=Object.freeze(Object.defineProperty({__proto__:null,load:ot},Symbol.toStringTag,{value:"Module"}));function rt(n){let e,s,o,u,g,c,f,y,b=n[0].meta.title+"",T,A,$,w=J(n[0].meta.date)+"",z,H,_,t,p;document.title=e=n[0].meta.title;var E=n[0].content;function j(a,r){return{}}return E&&(t=R(E,j())),{c(){s=v("meta"),o=v("meta"),g=M(),c=v("article"),f=v("hgroup"),y=v("h1"),T=S(b),A=M(),$=v("p"),z=S(w),H=M(),_=v("div"),t&&C(t.$$.fragment),this.h()},l(a){const r=Z("svelte-ylbs26",document.head);s=h(r,"META",{property:!0,content:!0}),o=h(r,"META",{property:!0,content:!0}),r.forEach(l),g=O(a),c=h(a,"ARTICLE",{class:!0});var d=P(c);f=h(d,"HGROUP",{});var k=P(f);y=h(k,"H1",{class:!0});var q=P(y);T=L(q,b),q.forEach(l),A=O(k),$=h(k,"P",{class:!0});var D=P($);z=L(D,w),D.forEach(l),k.forEach(l),H=O(d),_=h(d,"DIV",{class:!0});var I=P(_);t&&x(t.$$.fragment,I),I.forEach(l),d.forEach(l),this.h()},h(){m(s,"property","og:type"),m(s,"content","article"),m(o,"property","og:title"),m(o,"content",u=n[0].meta.title),m(y,"class","svelte-zpvgpv"),m($,"class","svelte-zpvgpv"),m(_,"class","prose svelte-zpvgpv"),m(c,"class","svelte-zpvgpv")},m(a,r){i(document.head,s),i(document.head,o),U(a,g,r),U(a,c,r),i(c,f),i(f,y),i(y,T),i(f,A),i(f,$),i($,z),i(c,H),i(c,_),t&&V(t,_,null),p=!0},p(a,[r]){if((!p||r&1)&&e!==(e=a[0].meta.title)&&(document.title=e),(!p||r&1&&u!==(u=a[0].meta.title))&&m(o,"content",u),(!p||r&1)&&b!==(b=a[0].meta.title+"")&&G(T,b),(!p||r&1)&&w!==(w=J(a[0].meta.date)+"")&&G(z,w),r&1&&E!==(E=a[0].content)){if(t){et();const d=t;N(d.$$.fragment,1,0,()=>{F(d,1)}),tt()}E?(t=R(E,j()),C(t.$$.fragment),B(t.$$.fragment,1),V(t,_,null)):t=null}},i(a){p||(t&&B(t.$$.fragment,a),p=!0)},o(a){t&&N(t.$$.fragment,a),p=!1},d(a){a&&(l(g),l(c)),l(s),l(o),t&&F(t)}}}function st(n,e,s){let{data:o}=e;return n.$$set=u=>{"data"in u&&s(0,o=u.data)},[o]}class ft extends X{constructor(e){super(),Y(this,e,st,rt,W,{data:0})}}export{ft as component,pt as universal};