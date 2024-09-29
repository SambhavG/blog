import{s as me,a as J,e as ce,b as fe,n as we}from"./scheduler.DVE4yslD.js";import{S as ve,i as ye,f as ge,h as be,m as _e,t as xe,j as Ce,k as ke,e as l,s as o,H as Te,c as p,g as r,a as h,n as Pe,l as B,b as a,d as s}from"./index.hm2RE5aj.js";import{M as Ie,g as Me,a as ue}from"./mdsvex.CxU8vHfN.js";import"./paths.BA9AkrOw.js";function Ne(N){let n,f="This is essentially a random thought I had, then decided to code up and see what the code would spit out.",d,u,i="Here’s the thing: if you vote in the US presidential election (ignoring all down-ballot races) and your candidate wins by more than one vote, then <em>technically</em>, your vote was a waste of time. Indeed, you could have stayed home and the election would have turned out exactly the same as it did thanks to your vote.",c,m,Q="<em>Obvously</em>, this by itself is not particularly useful or insightful, especially for presidential candidates who aren’t interested in winning each of their states by the minimum possible margin so that all their voters feel maximally valued.",q,g,X="However, it can be extended to the following: in some presidential election outcomes, it’s possible for one state to be near the center for votes cast, and for that state to thus essentially (in some sense) determine the outcome of the entire election (such as Florida in the 2000 election). Thus, if you’re a voter in this state and you help your candidate win by 1, your vote decided the election; indeed, had you stayed home, the outcome of the election would be a stalemate rather than a victory.",L,b,Y="In the US we talk a lot about how fair or unfair the electoral college is (usually qualitatively, but sometimes quantitatively as well), and this gives me the opportunity to present a toy metric (for entertainment only) of vote value: compared to the other swing states, how likely is my vote in my swing state to decide the US election?",A,w,Z="Assumptions",$,_,ee=`<li>The value of your vote is directly proportional to (1) the probability that your state will tip the election, and (2) the probability that your vote will tip the state assuming your state tipped the election.
<ul><li>In other words, what is the relative probability that your party could not have won the election had you not cast your vote?</li></ul></li> <li>In any election outcome, the state that “tips the election” is found as follows: we order the states by % lead of one party. If (1) one party “barely wins” and (2) they win by a margin of electoral votes that is less than the value of the state that they won by the smallest percentage, that state tipped the election. In other words, the tipping state casts the 270th vote for the winning party while no other states were closer but went to the winning party. Clearly not all elections will have a tipping state - we’ll consider these landslides and ignore them.</li>`,z,x,te="Note that the two probabilities are not independent; the higher the chance that our vote will tip the state, the higher the chance that our state will tip the election since it will be among the states with near-50/50 outcomes at the center of the spread. The higher the chance that our state will tip the election, the higher the chance that our vote will tip the state since a state that can tip the election is more likely to get near-50/50 outcomes. We try to roughly control for this in our experiment.",W,v,ae="Methodology",G,C,se='<li>Lock all non-swing states. For this we look at Nate Silver’s polling estimations, which show Pennsylvania, Michigan, Georgia, North Carolina, Wisconsin, Arizona, and Nevada with a less than 4 margin either way (this cutoff is arbitrary and you could run this experiment with all 50 states if you wanted). Virginia has some weird and few recent polls, but we will mark it solid D to keep things simple. We also ignore the split votes in Nebraska and Maine. <a href="https://www.270towin.com/maps/kyvld" rel="nofollow">This is our map</a>.</li> <li>Sample an election outcome. Assume all states are independent, so the chance of national polling bias is not higher than any other arrangement of polling biases among the swing states. To sample an election, we sample an outcome for each state. To sample a state, we find Nate Silver’s estimated poll numbers, the average number of people in each poll used (turned out to be ~800 except for Pennsylvania, which had larger polls), and the number of people who voted in 2020 for each state (pulled from <a href="https://www.kff.org/other/state-indicator/number-of-voters-and-voter-registration-in-thousands-as-a-share-of-the-voter-population" rel="nofollow">here</a> for November 2020). Several aspects of this are rather imprecise, but this whole experiment is very hand-rolled in terms of statistics so I’m not very concerned. This is just for fun.</li> <li>If there is a tipping state, observe what range of outcomes in that state would make it a tipping state. For example, anywhere between +.0001 and +3% for the winning party, if the next closest state for the winning party was won by 3%. A tipping state for the winning party would usually be a tipping state for the losing party too (though I’ll roughly ignore deadlock scenarios), so this would turn into some margin like -2% to 3%.</li> <li>Compute the probability that this state will be won by 1 vote for the winning party (constant for all states), but divide that by the probability that the outcome will be between -2% and +3%. In other words, we don’t care about the outcomes where the state is outside that range because it wouldn’t have been a tipping state in the first place. Actually, sometimes a small state like Nevada can swap with a big state and the big state will still be the tipping state; the way we check in practice sweeps the state across the spread until it would be a tipping state on either side to find the boundaries.</li> <li>Run steps 2-4 for a couple thousand trials (I did 30,000, but my code was pretty slow).</li> <li>Take an average of all the tipping vote probabilities for every time each state was a tipping state; multiply that by the probability that the state was a tipping state to get relative numbers for each state. Scale up so that the lowest state has a 1x vote share.</li>',O,k,ne="In reality, the value of a vote may be more accurately defined as relative to the inverse of the multiplicative margin over the losing party; if we win by 2x, our vote is worth 50% of what it would be worth in an election where we barely win, for example. This makes sense from a candidate’s perspective, as the value of more votes should smoothly decrease as the predicted margin of victory increases. It also means I don’t get to run this experiment.",R,y,ie="Results",U,H,le,F,T,oe="I initially ran for 500 trials or so and got a high number for Nevada, around 2.5, while everything else was vanishingly small. I assumed this was a fluke that would go away with a higher sample, but it turned out to only magnify.",E,P,pe="Actually, if we print out the intermediate values, we can get more reasoning for why Nevada is so high:",V,S,de=`<pre class="shiki poimandres" style="background-color:#1b1e28;color:#a6accd" tabindex="0"><code><span class="line"><span>Relative probability that </span></span>
<span class="line"><span>your vote tips the state </span></span>
<span class="line"><span>(if the state tips the election):</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Nevada: 23.06</span></span>
<span class="line"><span>Arizona: 7.21</span></span>
<span class="line"><span>Wisconsin: 3.44</span></span>
<span class="line"><span>North Carolina: 2.03</span></span>
<span class="line"><span>Michigan: 2.01</span></span>
<span class="line"><span>Georgia: 1.78</span></span>
<span class="line"><span>Pennsylvania: 1.00</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Probability that state </span></span>
<span class="line"><span>will tip the election:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Pennsylvania: 0.29</span></span>
<span class="line"><span>Georgia: 0.16</span></span>
<span class="line"><span>Michigan: 0.15</span></span>
<span class="line"><span>North Carolina: 0.14</span></span>
<span class="line"><span>Wisconsin: 0.10</span></span>
<span class="line"><span>Arizona: 0.09</span></span>
<span class="line"><span>Nevada: 0.07</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Relative probability that </span></span>
<span class="line"><span>your vote will tip the election:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Nevada: 5.77</span></span>
<span class="line"><span>Arizona: 2.24</span></span>
<span class="line"><span>Wisconsin: 1.16</span></span>
<span class="line"><span>Pennsylvania: 1.03</span></span>
<span class="line"><span>Michigan: 1.02</span></span>
<span class="line"><span>Georgia: 1.01</span></span>
<span class="line"><span>North Carolina: 1.00</span></span></code></pre>`,j,I,he="The chance that Nevada will tip the election is the lowest, but the probability that the winner will win by 1 (when Nevada is tipping) is so high that it more than cancels out. Arizona sees a similar but smaller bump. Interestingly, despite having the highest chance of tipping the election (proportional to being the biggest), since Pennsylvania has the smallest (and disproportinately smallest) chance of being tipped by one vote, the value of a Pennsylvania vote by this metric gets squashed.",D,M,re="The small states are helped out by the conditioning we do on the fact that we only care about tipping votes with respect to the outcomes where the state is a tipping state. Even though the state ends up at the center less often, when it does, it seems to have its outcomes squashed to a thinner set compared to the wider states which can afford a wider range of outcomes while still managing to hold the spotlight of tipping the election. This squashing effect appears to more than counteract the contrasting negative of not holding the spotlight as often.";return{c(){n=l("p"),n.textContent=f,d=o(),u=l("p"),u.innerHTML=i,c=o(),m=l("p"),m.innerHTML=Q,q=o(),g=l("p"),g.textContent=X,L=o(),b=l("p"),b.textContent=Y,A=o(),w=l("h2"),w.textContent=Z,$=o(),_=l("ol"),_.innerHTML=ee,z=o(),x=l("p"),x.textContent=te,W=o(),v=l("h2"),v.textContent=ae,G=o(),C=l("ol"),C.innerHTML=se,O=o(),k=l("p"),k.textContent=ne,R=o(),y=l("h2"),y.textContent=ie,U=o(),H=l("img"),F=o(),T=l("p"),T.textContent=oe,E=o(),P=l("p"),P.textContent=pe,V=o(),S=new Te(!1),j=o(),I=l("p"),I.textContent=he,D=o(),M=l("p"),M.textContent=re,this.h()},l(e){n=p(e,"P",{"data-svelte-h":!0}),r(n)!=="svelte-1spjttn"&&(n.textContent=f),d=h(e),u=p(e,"P",{"data-svelte-h":!0}),r(u)!=="svelte-1k6r7c8"&&(u.innerHTML=i),c=h(e),m=p(e,"P",{"data-svelte-h":!0}),r(m)!=="svelte-1dyqqd9"&&(m.innerHTML=Q),q=h(e),g=p(e,"P",{"data-svelte-h":!0}),r(g)!=="svelte-19hq579"&&(g.textContent=X),L=h(e),b=p(e,"P",{"data-svelte-h":!0}),r(b)!=="svelte-9jyggm"&&(b.textContent=Y),A=h(e),w=p(e,"H2",{id:!0,"data-svelte-h":!0}),r(w)!=="svelte-9536am"&&(w.textContent=Z),$=h(e),_=p(e,"OL",{"data-svelte-h":!0}),r(_)!=="svelte-1lt7p9v"&&(_.innerHTML=ee),z=h(e),x=p(e,"P",{"data-svelte-h":!0}),r(x)!=="svelte-1x7l4t4"&&(x.textContent=te),W=h(e),v=p(e,"H2",{id:!0,"data-svelte-h":!0}),r(v)!=="svelte-1mjb784"&&(v.textContent=ae),G=h(e),C=p(e,"OL",{"data-svelte-h":!0}),r(C)!=="svelte-1yxu8bk"&&(C.innerHTML=se),O=h(e),k=p(e,"P",{"data-svelte-h":!0}),r(k)!=="svelte-ex30en"&&(k.textContent=ne),R=h(e),y=p(e,"H2",{id:!0,"data-svelte-h":!0}),r(y)!=="svelte-1ai6hiq"&&(y.textContent=ie),U=h(e),H=p(e,"IMG",{src:!0}),F=h(e),T=p(e,"P",{"data-svelte-h":!0}),r(T)!=="svelte-bacs03"&&(T.textContent=oe),E=h(e),P=p(e,"P",{"data-svelte-h":!0}),r(P)!=="svelte-jhj9zi"&&(P.textContent=pe),V=h(e),S=Pe(e,!1),j=h(e),I=p(e,"P",{"data-svelte-h":!0}),r(I)!=="svelte-qs8zvd"&&(I.textContent=he),D=h(e),M=p(e,"P",{"data-svelte-h":!0}),r(M)!=="svelte-1josuej"&&(M.textContent=re),this.h()},h(){B(w,"id","assumptions"),B(v,"id","methodology"),B(y,"id","results"),fe(H.src,le="./election_infographic.png")||B(H,"src",le),S.a=j},m(e,t){a(e,n,t),a(e,d,t),a(e,u,t),a(e,c,t),a(e,m,t),a(e,q,t),a(e,g,t),a(e,L,t),a(e,b,t),a(e,A,t),a(e,w,t),a(e,$,t),a(e,_,t),a(e,z,t),a(e,x,t),a(e,W,t),a(e,v,t),a(e,G,t),a(e,C,t),a(e,O,t),a(e,k,t),a(e,R,t),a(e,y,t),a(e,U,t),a(e,H,t),a(e,F,t),a(e,T,t),a(e,E,t),a(e,P,t),a(e,V,t),S.m(de,e,t),a(e,j,t),a(e,I,t),a(e,D,t),a(e,M,t)},p:we,d(e){e&&(s(n),s(d),s(u),s(c),s(m),s(q),s(g),s(L),s(b),s(A),s(w),s($),s(_),s(z),s(x),s(W),s(v),s(G),s(C),s(O),s(k),s(R),s(y),s(U),s(H),s(F),s(T),s(E),s(P),s(V),S.d(),s(j),s(I),s(D),s(M))}}}function He(N){let n,f;const d=[N[0],K];let u={$$slots:{default:[Ne]},$$scope:{ctx:N}};for(let i=0;i<d.length;i+=1)u=J(u,d[i]);return n=new Ie({props:u}),{c(){ge(n.$$.fragment)},l(i){be(n.$$.fragment,i)},m(i,c){_e(n,i,c),f=!0},p(i,[c]){const m=c&1?Me(d,[c&1&&ue(i[0]),c&0&&ue(K)]):{};c&2&&(m.$$scope={dirty:c,ctx:i}),n.$set(m)},i(i){f||(xe(n.$$.fragment,i),f=!0)},o(i){Ce(n.$$.fragment,i),f=!1},d(i){ke(n,i)}}}const K={title:"Tipping the Election",description:"How likely are you to tip the US presidential election if you're a swing state voter, compared to the other swing states?",date:"2024-09-05",published:!0};function Se(N,n,f){return N.$$set=d=>{f(0,n=J(J({},n),ce(d)))},n=ce(n),[n]}class je extends ve{constructor(n){super(),ye(this,n,Se,He,me,{})}}const ze=Object.freeze(Object.defineProperty({__proto__:null,default:je,metadata:K},Symbol.toStringTag,{value:"Module"}));export{ze as _};