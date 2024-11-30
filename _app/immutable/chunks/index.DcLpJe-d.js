var J=Object.defineProperty;var K=(t,e,n)=>e in t?J(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var h=(t,e,n)=>K(t,typeof e!="symbol"?e+"":e,n);import{n as v,r as b,j as D,k as M,l as Q,m as B,p as X,q as Y,v as Z,w as tt,x as z,y as et,z as nt,A as it}from"./scheduler.DVE4yslD.js";const I=typeof window<"u";let st=I?()=>window.performance.now():()=>Date.now(),P=I?t=>requestAnimationFrame(t):v;const x=new Set;function G(t){x.forEach(e=>{e.c(t)||(x.delete(e),e.f())}),x.size!==0&&P(G)}function rt(t){let e;return x.size===0&&P(G),{promise:new Promise(n=>{x.add(e={c:t,f:n})}),abort(){x.delete(e)}}}let S=!1;function lt(){S=!0}function ot(){S=!1}function at(t,e,n,i){for(;t<e;){const s=t+(e-t>>1);n(s)<=i?t=s+1:e=s}return t}function ct(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if(t.nodeName==="HEAD"){const o=[];for(let a=0;a<e.length;a++){const u=e[a];u.claim_order!==void 0&&o.push(u)}e=o}const n=new Int32Array(e.length+1),i=new Int32Array(e.length);n[0]=-1;let s=0;for(let o=0;o<e.length;o++){const a=e[o].claim_order,u=(s>0&&e[n[s]].claim_order<=a?s+1:at(1,s,d=>e[n[d]].claim_order,a))-1;i[o]=n[u]+1;const f=u+1;n[f]=o,s=Math.max(f,s)}const l=[],r=[];let c=e.length-1;for(let o=n[s]+1;o!=0;o=i[o-1]){for(l.push(e[o-1]);c>=o;c--)r.push(e[c]);c--}for(;c>=0;c--)r.push(e[c]);l.reverse(),r.sort((o,a)=>o.claim_order-a.claim_order);for(let o=0,a=0;o<r.length;o++){for(;a<l.length&&r[o].claim_order>=l[a].claim_order;)a++;const u=a<l.length?l[a]:null;t.insertBefore(r[o],u)}}function ft(t,e){t.appendChild(e)}function F(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function ut(t){const e=L("style");return e.textContent="/* empty */",dt(F(t),e),e.sheet}function dt(t,e){return ft(t.head||t,e),e.sheet}function _t(t,e){if(S){for(ct(t),(t.actual_end_child===void 0||t.actual_end_child!==null&&t.actual_end_child.parentNode!==t)&&(t.actual_end_child=t.firstChild);t.actual_end_child!==null&&t.actual_end_child.claim_order===void 0;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?(e.claim_order!==void 0||e.parentNode!==t)&&t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else(e.parentNode!==t||e.nextSibling!==null)&&t.appendChild(e)}function ht(t,e,n){t.insertBefore(e,n||null)}function mt(t,e,n){S&&!n?_t(t,e):(e.parentNode!==t||e.nextSibling!=n)&&t.insertBefore(e,n||null)}function N(t){t.parentNode&&t.parentNode.removeChild(t)}function Rt(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function L(t){return document.createElement(t)}function pt(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function R(t){return document.createTextNode(t)}function jt(){return R(" ")}function Bt(){return R("")}function zt(t,e,n){n==null?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function Ot(t){return t.dataset.svelteH}function $t(t){return Array.from(t.childNodes)}function U(t){t.claim_info===void 0&&(t.claim_info={last_index:0,total_claimed:0})}function V(t,e,n,i,s=!1){U(t);const l=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const c=t[r];if(e(c)){const o=n(c);return o===void 0?t.splice(r,1):t[r]=o,s||(t.claim_info.last_index=r),c}}for(let r=t.claim_info.last_index-1;r>=0;r--){const c=t[r];if(e(c)){const o=n(c);return o===void 0?t.splice(r,1):t[r]=o,s?o===void 0&&t.claim_info.last_index--:t.claim_info.last_index=r,c}}return i()})();return l.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,l}function yt(t,e,n,i){return V(t,s=>s.nodeName===e,s=>{const l=[];for(let r=0;r<s.attributes.length;r++){const c=s.attributes[r];n[c.name]||l.push(c.name)}l.forEach(r=>s.removeAttribute(r))},()=>i(e))}function kt(t,e,n){return yt(t,e,n,L)}function gt(t,e){return V(t,n=>n.nodeType===3,n=>{const i=""+e;if(n.data.startsWith(i)){if(n.data.length!==i.length)return n.splitText(i.length)}else n.data=i},()=>R(e),!0)}function qt(t){return gt(t," ")}function O(t,e,n){for(let i=n;i<t.length;i+=1){const s=t[i];if(s.nodeType===8&&s.textContent.trim()===e)return i}return-1}function It(t,e){const n=O(t,"HTML_TAG_START",0),i=O(t,"HTML_TAG_END",n+1);if(n===-1||i===-1)return new H(e);U(t);const s=t.splice(n,i-n+1);N(s[0]),N(s[s.length-1]);const l=s.slice(1,s.length-1);if(l.length===0)return new H(e);for(const r of l)r.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1;return new H(e,l)}function Gt(t,e){e=""+e,t.data!==e&&(t.data=e)}function Ft(t,e,n,i){n==null?t.style.removeProperty(e):t.style.setProperty(e,n,"")}function xt(t,e,{bubbles:n=!1,cancelable:i=!1}={}){return new CustomEvent(t,{detail:e,bubbles:n,cancelable:i})}function Ut(t,e){const n=[];let i=0;for(const s of e.childNodes)if(s.nodeType===8){const l=s.textContent.trim();l===`HEAD_${t}_END`?(i-=1,n.push(s)):l===`HEAD_${t}_START`&&(i+=1,n.push(s))}else i>0&&n.push(s);return n}class wt{constructor(e=!1){h(this,"is_svg",!1);h(this,"e");h(this,"n");h(this,"t");h(this,"a");this.is_svg=e,this.e=this.n=null}c(e){this.h(e)}m(e,n,i=null){this.e||(this.is_svg?this.e=pt(n.nodeName):this.e=L(n.nodeType===11?"TEMPLATE":n.nodeName),this.t=n.tagName!=="TEMPLATE"?n:n.content,this.c(e)),this.i(i)}h(e){this.e.innerHTML=e,this.n=Array.from(this.e.nodeName==="TEMPLATE"?this.e.content.childNodes:this.e.childNodes)}i(e){for(let n=0;n<this.n.length;n+=1)ht(this.t,this.n[n],e)}p(e){this.d(),this.h(e),this.i(this.a)}d(){this.n.forEach(N)}}class H extends wt{constructor(n=!1,i){super(n);h(this,"l");this.e=this.n=null,this.l=i}c(n){this.l?this.n=this.l:super.c(n)}i(n){for(let i=0;i<this.n.length;i+=1)mt(this.t,this.n[i],n)}}function Vt(t,e){return new t(e)}const A=new Map;let E=0;function vt(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}function Nt(t,e){const n={stylesheet:ut(e),rules:{}};return A.set(t,n),n}function Tt(t,e,n,i,s,l,r,c=0){const o=16.666/i;let a=`{
`;for(let p=0;p<=1;p+=o){const g=e+(n-e)*l(p);a+=p*100+`%{${r(g,1-g)}}
`}const u=a+`100% {${r(n,1-n)}}
}`,f=`__svelte_${vt(u)}_${c}`,d=F(t),{stylesheet:_,rules:m}=A.get(d)||Nt(d,t);m[f]||(m[f]=!0,_.insertRule(`@keyframes ${f} ${u}`,_.cssRules.length));const y=t.style.animation||"";return t.style.animation=`${y?`${y}, `:""}${f} ${i}ms linear ${s}ms 1 both`,E+=1,f}function k(t,e){const n=(t.style.animation||"").split(", "),i=n.filter(e?l=>l.indexOf(e)<0:l=>l.indexOf("__svelte")===-1),s=n.length-i.length;s&&(t.style.animation=i.join(", "),E-=s,E||At())}function At(){P(()=>{E||(A.forEach(t=>{const{ownerNode:e}=t.stylesheet;e&&N(e)}),A.clear())})}let w;function Et(){return w||(w=Promise.resolve(),w.then(()=>{w=null})),w}function q(t,e,n){t.dispatchEvent(xt(`intro${n}`))}const T=new Set;let $;function Wt(){$={r:0,c:[],p:$}}function Jt(){$.r||b($.c),$=$.p}function bt(t,e){t&&t.i&&(T.delete(t),t.i(e))}function Kt(t,e,n,i){if(t&&t.o){if(T.has(t))return;T.add(t),$.c.push(()=>{T.delete(t),i&&(n&&t.d(1),i())}),t.o(e)}else i&&i()}const St={duration:0};function Qt(t,e,n){const i={direction:"in"};let s=e(t,n,i),l=!1,r,c,o=0;function a(){r&&k(t,r)}function u(){const{delay:d=0,duration:_=300,easing:m=Q,tick:y=v,css:p}=s||St;p&&(r=Tt(t,0,1,_,d,m,p,o++)),y(0,1);const g=st()+d,W=g+_;c&&c.abort(),l=!0,M(()=>q(t,!0,"start")),c=rt(C=>{if(l){if(C>=W)return y(1,0),q(t,!0,"end"),a(),l=!1;if(C>=g){const j=m((C-g)/_);y(j,1-j)}}return l})}let f=!1;return{start(){f||(f=!0,k(t),D(s)?(s=s(i),Et().then(u)):u())},invalidate(){f=!1},end(){l&&(a(),l=!1)}}}function Xt(t){t&&t.c()}function Yt(t,e){t&&t.l(e)}function Ct(t,e,n){const{fragment:i,after_update:s}=t.$$;i&&i.m(e,n),M(()=>{const l=t.$$.on_mount.map(et).filter(D);t.$$.on_destroy?t.$$.on_destroy.push(...l):b(l),t.$$.on_mount=[]}),s.forEach(M)}function Ht(t,e){const n=t.$$;n.fragment!==null&&(Z(n.after_update),b(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Mt(t,e){t.$$.dirty[0]===-1&&(nt.push(t),it(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function Zt(t,e,n,i,s,l,r=null,c=[-1]){const o=tt;z(t);const a=t.$$={fragment:null,ctx:[],props:l,update:v,not_equal:s,bound:B(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(o?o.$$.context:[])),callbacks:B(),dirty:c,skip_bound:!1,root:e.target||o.$$.root};r&&r(a.root);let u=!1;if(a.ctx=n?n(t,e.props||{},(f,d,..._)=>{const m=_.length?_[0]:d;return a.ctx&&s(a.ctx[f],a.ctx[f]=m)&&(!a.skip_bound&&a.bound[f]&&a.bound[f](m),u&&Mt(t,f)),d}):[],a.update(),u=!0,b(a.before_update),a.fragment=i?i(a.ctx):!1,e.target){if(e.hydrate){lt();const f=$t(e.target);a.fragment&&a.fragment.l(f),f.forEach(N)}else a.fragment&&a.fragment.c();e.intro&&bt(t.$$.fragment),Ct(t,e.target,e.anchor),ot(),X()}z(o)}class te{constructor(){h(this,"$$");h(this,"$$set")}$destroy(){Ht(this,1),this.$destroy=v}$on(e,n){if(!D(n))return v;const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(n),()=>{const s=i.indexOf(n);s!==-1&&i.splice(s,1)}}$set(e){this.$$set&&!Y(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const Dt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(Dt);export{_t as A,Ut as B,Qt as C,H,te as S,qt as a,mt as b,kt as c,N as d,L as e,Xt as f,Ot as g,Yt as h,Zt as i,Kt as j,Ht as k,zt as l,Ct as m,It as n,Bt as o,Rt as p,Ft as q,Jt as r,jt as s,bt as t,$t as u,R as v,gt as w,Gt as x,Wt as y,Vt as z};
