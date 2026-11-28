const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./bot-CogKpRux-v2.js","./storage-p873letz-v2.js"])))=>i.map(i=>d[i]);
import{j as a,_ as ld}from"./index-hir2p94X-v2.js";import{r as Ie}from"./index-CHcDgKyw-v2.js";import{i as cd,c as dd,d as Po,a as Ki,s as vr,l as rc,h as No,b as xa,e as hd,f as Do,t as ud,g as fd,j as pd,O as md,k as gd,m as ac,n as Ts,o as rt,p as je,q as dr,r as Xt,T as Yn,u as va,v as Lo,w as _d,R as xd,x as Ms,y as vd}from"./mapSource-BOvvVzCo-v2.js";import{n as Md,s as Ma,g as Sd,c as yd,f as oe,M as sn,l as oc,a as Mi,b as gt,B as Ns,p as lc,d as bd,e as Ed,h as cc,i as dc,m as Td,t as Si,E as Mr,S as Sr,j as wd,L as yr,k as Io,o as Ad,q as hc,P as Sa,r as Rd,u as hr,v as uc,w as br,x as Cd,y as Pd,z as Nd,A as Dd,C as Ci,D as Xi,F as Ld,G as Id,H as Ud,I as Fd}from"./storage-p873letz-v2.js";function Bd(n){if(n==null||Number.isNaN(n))return"–";const e=Math.abs(n);return e>=1e12?(n/1e12).toFixed(e>=1e13?1:2)+"万亿":e>=1e8?(n/1e8).toFixed(e>=1e10?0:1).replace(/\.0$/,"")+"亿":e>=1e4?(n/1e4).toFixed(e>=1e6?0:1).replace(/\.0$/,"")+"万":String(Math.round(n))}function Od(n){return n>=1e8?(n/1e8).toFixed(1)+"亿":n>=1e6?Math.round(n/1e4)+"万":(n/1e4).toFixed(1)+"万"}const Uo=[[1e12,"T"],[1e9,"B"],[1e6,"M"],[1e3,"K"]];function fc(n,e){if(n==null||Number.isNaN(n))return e(n);const t=e(n),i=/^-?1000(?:\.0+)?([KMB])$/.exec(t);if(!i)return t;const s=Uo.findIndex(([,r])=>r===i[1]);return e(Math.sign(n)*Uo[s-1][0])}const kd=n=>fc(n,Bd),jd=n=>fc(n,Od),Os='"Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Songti SC", "STSong", "Noto Serif CJK SC", "Source Han Serif SC", "Noto Serif SC", serif',Ss='-apple-system, system-ui, "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif',Lr={full:{name:"full",h:22,bigPx:12.5,big:`600 12.5px ${Os}`,small:`600 9.6px ${Os}`,pop:`700 10.5px ${Ss}`,capMin:32,spec:18,star:10,chev:7,yieldH:17,yieldIcon:12,yieldFont:`600 10px ${Ss}`,yieldGap:13},compact:{name:"compact",h:18,bigPx:11,big:`600 11px ${Os}`,small:`600 8.4px ${Os}`,pop:`700 9.5px ${Ss}`,capMin:27,spec:14,star:8.5,chev:6,yieldH:15,yieldIcon:11,yieldFont:`600 9px ${Ss}`,yieldGap:11}},Er=4,Nn=11,pc=`700 7.6px ${Ss}`,$i=6,zd=.005,Hd=.05,Gd=7,Vd=25e4,Fo=5,Bo=4,Oo=8,Wd=.35,mc=["#ecd08a","#a8833f","#4f3a1b"],Xd=["#fff4c4","#e6bd55","#8d6418"],gc="rgba(6,8,12,0.75)",ko={agriculture:["y-food","#4f7a2a"],mining:["r-coal_mine","#6a5038"],construction:["y-production","#8a5426"],manufacturing:["y-production","#8a5426"],wholesale:["y-gold","#7a6420"],retail:["y-gold","#7a6420"],utilities:["r-hydro","#2a5f86"],information:["y-science","#25557e"],finance:["y-gold","#7a6420"],real_estate:["l-home","#6b4a2f"],professional:["y-science","#25557e"],education:["l-degrees","#2a3f7a"],health:["l-uninsured","#7a2f2f"],arts:["y-culture","#5b3a7e"],accommodation:["y-culture","#5b3a7e"]},$d=.02,jo=new WeakMap;function zo(n){if(!n)return null;let e=0;for(const i of Object.values(n))Number.isFinite(i)&&(e+=i);if(!(e>0))return null;const t={};for(const[i,s]of Object.entries(n))Number.isFinite(s)&&(t[i]=s/e);return t}function qd(n,e){const t=e?.nation?.jobs??e?.jobs;if(!t||!n.jobs)return null;let i=jo.get(t);i===void 0&&(i=zo(t),jo.set(t,i));const s=zo(n.jobs);if(!i||!s)return null;let r=null;for(const[o,l]of Object.entries(s)){if(l<$d||!(i[o]>0))continue;const d=No(`i-${o}`)?[`i-${o}`,ko[o]?.[1]||"#3a4a5e"]:ko[o];if(!d||!No(d[0]))continue;const h=l/i[o];(!r||h>r.lq)&&(r={key:o,lq:h,icon:d[0],bg:d[1]})}return r&&r.lq>=1.15?r:null}function Ho(n){return n.name+n.population+(n.popLabel??"")+"|"+(n.growth??"")+"|"+(n.yields?.gold??"")+"|"+(n.yields?.food??"")}function Yd(n){let e=n.growth;return e&&typeof e=="object"&&(e=e.rate??(e.pct!=null?e.pct/100:e.value)),Number.isFinite(e)?Math.abs(e)>1.5?e/100:e:null}function Kd(n){const e=[];for(const t of n){const i=e[e.length-1],r=t.toLowerCase()!==t.toUpperCase()?t===t.toUpperCase():i?i.big:!0;i&&i.big===r?i.t+=r?t:t.toUpperCase():e.push({t:r?t:t.toUpperCase(),big:r})}return e}const Go=new Map;function Zd(n,e,t,i,s){const r=`${e.id}|${s.name}`;let o=Go.get(r);if(o&&o.nation===i&&o.yields===t&&o.cityRef===Ho(e))return o;n.save();const l=Kd(e.name);let d=0;for(const N of l)n.font=N.big?s.big:s.small,N.w=n.measureText(N.t).width,d+=N.w;const h=cd(e);h&&(d+=s.star+3),n.font=s.pop;const c=e.popLabel??jd(e.population),u=n.measureText(c).width,p=Yd(e),m=p==null?0:s.chev+3,_=Math.ceil(Math.max(s.capMin,u+m+14));n.font=s.yieldFont;const x=(t||[]).map(N=>{const R=kd(e.yields?.[N.key]);return{yd:N,t:R,w:n.measureText(R).width}}),g=x.reduce((N,R)=>N+s.yieldIcon+2+R.w+s.yieldGap,0)-s.yieldGap,f=p==null?"":`${p>=0?"+":"−"}${Math.abs(p*100).toFixed(1)}%`,w=f?n.measureText(f).width:0;n.restore();const E=qd(e,i),b=E?s.spec+3:0,A=_+8+d+8+b,P=x.length?Math.ceil(g+18):0;return o={runs:l,nameW:d,capital:h,pop:c,popW:u,chevW:m,capW:_,parts:x,yieldsW:g,tierW:P,spec:E,specW:b,plateW:A,growth:p,growthTxt:f,growthW:w,nation:i,yields:t,cityRef:Ho(e)},Go.set(r,o),o}function mn(n,e,t,i,s,r){r=Math.max(0,Math.min(r,i/2,s/2)),n.beginPath(),n.moveTo(e+r,t),n.arcTo(e+i,t,e+i,t+s,r),n.arcTo(e+i,t+s,e,t+s,r),n.arcTo(e,t+s,e,t,r),n.arcTo(e,t,e+i,t,r),n.closePath()}function Jn(n,e,t,i){const s=n.createLinearGradient(0,e,0,t);return i.forEach((r,o)=>s.addColorStop(o/(i.length-1),r)),s}function Vo(n,e,t,i,s,r,o,l){mn(n,e,t,i,s,r),n.fillStyle=Jn(n,t,t+s,o),n.fill(),n.lineWidth=1,n.strokeStyle=gc,mn(n,e-.5,t-.5,i+1,s+1,r+.5),n.stroke();const d=1.6,h=[e+d,t+d,i-2*d,s-2*d,Math.max(1,r-d)];return mn(n,...h),n.fillStyle=Jn(n,h[1],h[1]+h[3],l),n.fill(),n.lineWidth=.8,n.strokeStyle="rgba(0,0,0,0.55)",n.beginPath(),n.moveTo(h[0]+h[4],h[1]+.4),n.lineTo(h[0]+h[2]-h[4],h[1]+.4),n.stroke(),n.strokeStyle="rgba(255,235,190,0.12)",n.beginPath(),n.moveTo(h[0]+h[4],h[1]+h[3]-.4),n.lineTo(h[0]+h[2]-h[4],h[1]+h[3]-.4),n.stroke(),h}function Wo(n,e,t,i){n.beginPath();for(let s=0;s<10;s++){const r=-Math.PI/2+s*Math.PI/5,o=s%2?i*.45:i;n[s?"lineTo":"moveTo"](e+Math.cos(r)*o,t+Math.sin(r)*o)}n.closePath()}function Jd(n,e,t,i,s){const r=Math.abs(s)<zd,o=Math.abs(s)>=Hd,l=s>=0;if(n.beginPath(),r){const d=i*.36;n.moveTo(e,t-d),n.lineTo(e+d,t),n.lineTo(e,t+d),n.lineTo(e-d,t),n.closePath()}else{const d=i/2,h=i*(o?.42:.6),c=h*.55,u=l?-1:1,p=m=>{const _=x=>t+m+u*(h/2-x);n.moveTo(e,_(0)),n.lineTo(e+d,_(h-c)),n.lineTo(e+d,_(h)),n.lineTo(e,_(c)),n.lineTo(e-d,_(h)),n.lineTo(e-d,_(h-c)),n.closePath()};o?(p(-h*.55),p(h*.55)):p(0)}n.lineJoin="round",n.lineWidth=1.6,n.strokeStyle="rgba(10,8,4,0.8)",n.stroke(),n.fillStyle=r?"#e8dcb4":l?"#8ff07c":"#ff8a72",n.fill()}function ys(n,e,t,i,s,r){n.fillStyle=r?"rgba(255,255,255,0.35)":"rgba(0,0,0,0.75)",n.fillText(e,t,i+1),n.fillStyle=s,n.fillText(e,t,i)}const Xo=new Map;function Qd(n,e){let t=Xo.get(e);return t==null&&(n.save(),n.font=pc,t=n.measureText(e.toUpperCase()).width+e.length*.5,n.restore(),Xo.set(e,t)),t}function eh(n,e,t,i,s){const r=s.label.toUpperCase(),o=Math.min(i-16,Math.ceil(Qd(n,s.label)+12)),l=e+(i-o)/2,d=t-Nn+1,h=s.rgb;n.save(),n.shadowColor="rgba(0,0,0,0.55)",n.shadowBlur=3,n.shadowOffsetY=1,mn(n,l,d,o,Nn+4,3.5),n.fillStyle=Jn(n,d,d+Nn+4,mc),n.fill(),n.restore(),mn(n,l+1.2,d+1.2,o-2.4,Nn+2,2.6),n.fillStyle=Jn(n,d,d+Nn,[Ki(vr(h,.22)),Ki(h),Ki(vr(h,-.35))]),n.fill(),n.save(),mn(n,l+1.2,d+1.2,o-2.4,Nn-1.2,2.6),n.clip(),n.font=pc,n.textAlign="center",n.textBaseline="middle";const c=rc(h)>.36;"letterSpacing"in n&&(n.letterSpacing="0.5px"),ys(n,r,l+o/2,d+1.2+(Nn-1.2)/2+.3,c?"#17110a":"#fff8e6",c),n.restore()}function _c(n,e,t,i,s,r,o,{selected:l,showYields:d,ptr:h=null,badge:c=null}){const u=r.h;c&&eh(n,e,t,i,c);const p=l?Xd:mc,m=d&&s.parts.length?r.yieldH:0,_=t+u+(m?m-2:0);if(n.save(),n.shadowColor="rgba(0,0,0,0.6)",n.shadowBlur=5,n.shadowOffsetY=2,n.fillStyle="rgba(0,0,0,0.9)",mn(n,e,t,i,u,5),n.fill(),m){const q=Math.min(i-10,s.tierW),H=e+(i-q)/2;mn(n,H,t+u-4,q,m+2,4),n.fill()}n.restore(),l&&(n.save(),n.shadowColor="rgba(255,214,110,0.95)",n.shadowBlur=7,n.strokeStyle="rgba(255,226,140,0.9)",n.lineWidth=2,mn(n,e-1,t-1,i+2,u+2,6),n.stroke(),n.restore());const x=e+(h??i/2);if(n.beginPath(),n.moveTo(x-4.5,_-1),n.lineTo(x+4.5,_-1),n.lineTo(x,_+Er),n.closePath(),n.fillStyle=Jn(n,_-1,_+Er,[p[1],p[2]]),n.fill(),n.lineWidth=.8,n.strokeStyle=gc,n.stroke(),m){const q=Math.min(i-10,s.tierW),H=e+(i-q)/2,ie=t+u-4,[he,X,te,_e]=Vo(n,H,ie,q,m+2,4,[p[1],p[2],p[2]],["#0c1118","#121a24"]);n.save(),mn(n,he,X,te,_e,3),n.clip(),n.font=r.yieldFont,n.textAlign="left",n.textBaseline="middle";const ue=X+2+(_e-2)/2;let O=H+(q-s.yieldsW)/2;s.parts.forEach((Q,Z)=>{if(Z){const ye=O-r.yieldGap/2;n.beginPath(),n.moveTo(ye,ue-1.8),n.lineTo(ye+1.8,ue),n.lineTo(ye,ue+1.8),n.lineTo(ye-1.8,ue),n.closePath(),n.fillStyle="rgba(201,164,92,0.55)",n.fill()}const ge=O+r.yieldIcon/2;Po(n,Q.yd.icon||`y-${Q.yd.key}`,ge,ue,r.yieldIcon,{medallion:!1,color:Q.yd.color,shadow:!1})||(n.fillStyle=Q.yd.color,n.beginPath(),n.arc(ge,ue,3.5,0,Math.PI*2),n.fill()),ys(n,Q.t,O+r.yieldIcon+2,ue+.5,"#ece2c8",!1),O+=r.yieldIcon+2+Q.w+r.yieldGap}),n.restore()}const[g,f,w,E,b]=Vo(n,e,t,i,u,5,p,["#2b3849","#18212d","#0e141b"]);n.save(),mn(n,g,f,w,E,b),n.clip();const A=e+s.capW,P=Math.min(5,u*.24),N=()=>{n.beginPath(),n.moveTo(g-1,f-1),n.lineTo(A-P,f-1),n.lineTo(A,f+E/2),n.lineTo(A-P,f+E+1),n.lineTo(g-1,f+E+1),n.closePath()};N(),n.fillStyle=Jn(n,f,f+E,[Ki(vr(o,.3)),Ki(o),Ki(vr(o,-.32))]),n.fill(),n.save(),N(),n.clip(),n.fillStyle=Jn(n,f,f+E*.5,["rgba(255,255,255,0.28)","rgba(255,255,255,0.04)"]),n.fillRect(g,f,s.capW,E*.5),n.restore(),n.lineWidth=1.6,n.strokeStyle="rgba(0,0,0,0.6)",n.beginPath(),n.moveTo(A-P+.8,f-1),n.lineTo(A+.8,f+E/2),n.lineTo(A-P+.8,f+E+1),n.stroke(),n.lineWidth=.8,n.strokeStyle="rgba(255,255,255,0.35)",n.beginPath(),n.moveTo(A-P-.9,f-1),n.lineTo(A-.9,f+E/2),n.lineTo(A-P-.9,f+E+1),n.stroke(),n.textBaseline="middle",n.textAlign="left",n.font=r.pop;const R=rc(o)>.36,S=e+(s.capW-P*.5)/2+.5,y=Math.round(S-(s.popW+s.chevW)/2);ys(n,s.pop,y,t+u/2+.5,R?"#17110a":"#fffaf0",R),s.growth!=null&&Jd(n,y+s.popW+3+r.chev/2,t+u/2,r.chev,s.growth);const C=A+6,z=e+i-4-s.specW;let B=(C+z)/2-s.nameW/2;const k=t+u/2+.5;if(n.textAlign="left",s.capital){const q=r.star/2,H=B+q,ie=k-.5;Wo(n,H,ie+.8,q),n.fillStyle="rgba(0,0,0,0.7)",n.fill(),Wo(n,H,ie,q),n.fillStyle=Jn(n,ie-q,ie+q,["#fff3b8","#e6b23c","#a8761c"]),n.fill(),B+=r.star+3}const ee=l?"#ffeaa6":"#f4e8c8",$=k+r.bigPx*.35;n.textBaseline="alphabetic";for(const q of s.runs)n.font=q.big?r.big:r.small,ys(n,q.t,B,$,ee,!1),B+=q.w;d&&s.growthTxt&&(z-C-s.nameW)/2>s.growthW+10&&(n.font=r.yieldFont,n.textAlign="right",n.textBaseline="middle",ys(n,s.growthTxt,z-3,k,s.growth>=0?"#9be88f":"#ff9a8a",!1)),n.restore(),s.spec&&Po(n,s.spec.icon,e+i-2.5-r.spec/2,t+u/2,r.spec,{bg:s.spec.bg})}const th=500,si=new Map;function nh(n,e){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(n,e);if(typeof document>"u")return null;const t=document.createElement("canvas");return t.width=n,t.height=e,t}function ih(n,e,t,i,s,r,o,l){let d=si.get(n);if(d&&d.m===e)return si.delete(n),si.set(n,d),d;const h=l.badge?Nn:0,c=s+$i*2,u=r+$i*2+Er+h,p=nh(Math.ceil(c*o),Math.ceil(u*o)),m=p&&p.getContext("2d");return m?(m.scale(o,o),_c(m,$i,$i+h,s,e,t,i,l),d={m:e,canvas:p,cssW:c,cssH:u},si.set(n,d),si.size>th&&si.delete(si.keys().next().value),d):null}function sh(n,e,t){return n===!0?e===t:n instanceof Set?n.has(e)||n.has(e.id):Array.isArray(n)?n.some(i=>i===e||i===e.id||i&&i.id===e.id):typeof n=="object"?n===e||n.id===e.id:n===e.id}const $o=new Map;function rh(n,e){const t=n.get?.(e.id);if(!t||!t.label)return null;let i=$o.get(t.color);if(!i){const s=/^#[0-9a-f]{6}$/i.test(t.color||"")?parseInt(t.color.slice(1),16):6976644;i=[s>>16&255,s>>8&255,s&255],$o.set(t.color,i)}return{label:t.label,color:t.color,rgb:i}}function ah(n){return n<5?2e6:n<8?7e5:n<14?25e4:n<24?15e4:n<40?1e5:n<70?4e4:0}function oh(n,e,t,i,s,r=i.nation){const{grid:o}=t,l=o.R*e.scale,d=ah(l),h=l>24,c=l<8?Lr.compact:Lr.full,u=c===Lr.compact?8500:320*90,p=Math.max(6,Math.round(e.w*e.h/u*.3)),m=Math.max(3,Math.min(Gd,Math.round(e.w*e.h/Vd))),_=typeof n.getTransform=="function"?n.getTransform():null,x=_?Math.max(.5,Math.round(Math.hypot(_.a,_.b)*4)/4):1,g=[],f=[],w=i.selectedCity||null,E=i.hoverCell>=0?t.cityByCell?.get(i.hoverCell)??null:null,b=i.bannerFocus||null,A=i.cities,P=i.bannerBounds?.x0??0,N=i.bannerBounds?.x1??e.w,R=i.cityBadges||null,S=z=>g.some(B=>z.x<B.x+B.w&&B.x<z.x+z.w&&z.y<B.y+B.h&&B.y<z.y+z.h);let y=0,C=0;for(let z=w?-1:0;z<A.length;z++){const B=z<0,k=B?w:A[z];if(!B){if(k===w)continue;if(k.population<d||y>=p)break}if(k.cell==null)continue;const[ee,$]=e.toScreen(o.cx(k.cell),o.cy(k.cell));if(ee<-200||$<-80||ee>e.w+200||$>e.h+100)continue;const q=b==null||sh(b,k,w),H=Zd(n,k,s,r,c),ie=B||k===E||(b!=null?q:C<m);let he=h&&H.parts.length>0&&ie;const X=R&&h?rh(R,k):null;let te,_e,ue,O,Q,Z,ge;const ye=()=>{if(te=Math.ceil(he?Math.max(H.plateW,H.tierW+12):H.plateW),_e=c.h+(he?c.yieldH-2:0),ue=Math.round(ee-te/2),Z=null,ee>=P-24&&ee<=N+24&&N-P>te+16){const me=Math.max(P+Oo,Math.min(N-Oo-te,ue));me!==ue&&(ue=me,Z=Math.round(Math.max(9,Math.min(te-9,ee-ue))))}O=Math.round($-Math.max(10,l*(dd(k,l)?.55:.75))-_e),ge=he&&X?Nn:0,Q={x:ue-Fo,y:O-Bo-ge,w:te+2*Fo,h:_e+Er+2*Bo+ge}};if(ye(),S(Q)&&he&&(he=!1,ye()),S(Q))continue;g.push(Q);const Le=ue+te>0&&ue<e.w&&O+_e>0&&O<e.h;!B&&Le&&(y++,he&&k!==E&&C++);const Ze=t.stateColor[t.raw.owner[k.cell]]||[190,190,190],We=w===k,D=!We&&t.dim&&t.dim[k.cell],it=Math.min(q||k===E?1:Wd,D?.5:1),De=ge?X:null,qe={selected:We,showYields:he,ptr:Z,badge:De},Re=`${k.id}|${c.name}|${he?1:0}|${We?1:0}|${x}|${Ze.join(",")}|${te}|${Z??""}|${De?`${De.label}|${De.color}`:""}`,Je=ih(Re,H,c,Ze,te,_e,x,qe);if(it<1&&(n.globalAlpha=it),Je){let me=ue-$i,Fe=O-$i-ge;_&&_.b===0&&_.c===0&&_.a>0&&_.d>0&&(me=(Math.round(_.a*me+_.e)-_.e)/_.a,Fe=(Math.round(_.d*Fe+_.f)-_.f)/_.d),n.drawImage(Je.canvas,me,Fe,Je.cssW,Je.cssH)}else n.save(),_c(n,ue,O,te,H,c,Ze,qe),n.restore();n.globalAlpha=1,f.push({x:ue,y:O-ge,w:te,h:_e+ge,city:k,specialty:H.spec?.key??null})}return f}const qo=Math.sqrt(3)/2,Yo=300,Ko=[0,1,2,3,4,5].map(n=>Math.cos(n*Math.PI/3)),Zo=[0,1,2,3,4,5].map(n=>Math.sin(n*Math.PI/3)),ws=10,lh=18,ch=18,ya=30;function dh(n,e,t){for(let i=0;i<6;i++)if(n.neighbour(e,i)===t)return i;return-1}function Jo(n,e,t,i=null){const{grid:s}=n,r=s.R,o=new Map,l=(h,c,u,p,m)=>{let _=o.get(h);_||o.set(h,_=[]),_.push({d:c,cls:u,vx:p,vy:m})};for(const[h,c,u]of e){const p=dh(s,h,c);if(p<0)continue;const m=i?i(h,c):0;let _=-Zo[p],x=Ko[p];x+.3*_<0&&(_=-_,x=-x),l(h,p,u,m*_,m*x),l(c,(p+3)%6,u,m*_,m*x)}const d=new Map;for(const[h,c]of o){const u=s.cx(h),p=s.cy(h),m=`${Math.floor(u/Yo)},${Math.floor(p/Yo)}`;let _=d.get(m);_||d.set(m,_={x0:1/0,y0:1/0,x1:-1/0,y1:-1/0,paths:{}}),_.x0=Math.min(_.x0,u-r),_.y0=Math.min(_.y0,p-r),_.x1=Math.max(_.x1,u+r),_.y1=Math.max(_.y1,p+r);for(const x of t){const g=c.filter(A=>A.cls===x);if(!g.length)continue;const f=_.paths[x]||(_.paths[x]=new Path2D),w=g.map(A=>[u+r*qo*Ko[A.d]+A.vx,p+r*qo*Zo[A.d]+A.vy]);let E=0,b=0;for(const A of g)E+=A.vx,b+=A.vy;if(E=u+E/g.length,b=p+b/g.length,g.length===2)f.moveTo(w[0][0],w[0][1]),f.quadraticCurveTo(E,b,w[1][0],w[1][1]);else for(const A of w)f.moveTo(E,b),f.lineTo(A[0],A[1])}}return[...d.values()]}function hh(n,e){const t=Array.isArray(e?.roads)?e.roads:[],i=Array.isArray(e?.rail)?e.rail:[],s=new Map;for(const[l,d,h]of t)s.set(l<d?`${l},${d}`:`${d},${l}`,h);const r=n.grid.R,o=(l,d)=>s.has(l<d?`${l},${d}`:`${d},${l}`)?.2*r:0;return{roads:Jo(n,t,[1,0]),rail:Jo(n,i,[1,0],o),roadLinks:s,counts:{roads:t.length,rail:i.length}}}function xc(n,e,t){const i=[];for(const s of n)s.x1<e.x0-t||s.x0>e.x1+t||s.y1<e.y0-t||s.y0>e.y1+t||i.push(s);return i}function cn(n,e,t){for(const i of e)i.paths[t]&&n.stroke(i.paths[t])}const mi=(n,e,t)=>Math.max(e,Math.min(t,n));function uh(n){return{inter:mi(n*.095,1.7,9),major:mi(n*.06,1.1,5.5)}}function fh(n,e,t,i){if(!e||i.Rpx<ws)return;const s=t.s,r=i.Rpx,o=xc(e.roads,t,2*(i.Rpx/s));if(!o.length)return;const{inter:l,major:d}=uh(r),h=mi((r-ws)/4,.55,1);n.lineCap="round",n.lineJoin="round";const c=n.globalAlpha;n.globalAlpha=c*h,r>=lh&&(n.strokeStyle="rgba(74,56,34,.55)",n.lineWidth=(d+1.4)/s,cn(n,o,1),n.strokeStyle="#c9ab78",n.lineWidth=d/s,cn(n,o,1),r>=ya&&(n.strokeStyle="rgba(120,92,56,.45)",n.lineWidth=Math.max(.6,d*.18)/s,n.setLineDash([d*.9/s,d*1.6/s]),cn(n,o,1),n.setLineDash([]))),n.strokeStyle="rgba(52,40,26,.8)",n.lineWidth=(l+2.2)/s,cn(n,o,0),n.strokeStyle="#a98f63",n.lineWidth=(l+.8)/s,cn(n,o,0),n.strokeStyle="#e6d6ad",n.lineWidth=l/s,cn(n,o,0),r>=ya&&(n.lineCap="butt",n.strokeStyle="rgba(138,112,72,.5)",n.lineWidth=l*.92/s,n.setLineDash([.7/s,l*.75/s]),cn(n,o,0),n.setLineDash([]),n.lineCap="round",n.strokeStyle="rgba(255,250,232,.55)",n.lineWidth=Math.max(.6,l*.16)/s,cn(n,o,0)),n.globalAlpha=c}function ph(n,e,t,i){if(!e||i.Rpx<ws)return;const s=t.s,r=i.Rpx,o=xc(e.rail,t,2*(r/s));if(!o.length)return;const l=mi((r-ws)/4,.55,1),d=n.globalAlpha;n.globalAlpha=d*l,n.lineJoin="round";const h=r>=ch?[1,0]:[0];for(const c of h){const u=c===0?1:.72,p=mi(r*.11,2.6,9)*u,m=mi(r*.022,.9,2.4)*u;if(n.lineCap="round",n.strokeStyle=r>=16?"rgba(168,154,132,.55)":"rgba(226,214,190,.5)",n.lineWidth=(r>=16?p+1:m+2.6)/s,cn(n,o,c),r>=16){n.lineCap="butt",n.strokeStyle=c===0?"#4a3424":"rgba(74,52,36,.85)",n.lineWidth=p/s;const _=mi(r*.06,2.2,6);n.setLineDash([Math.max(.9,_*.45)/s,_/s]),cn(n,o,c),n.setLineDash([])}n.lineCap="round",n.strokeStyle="#2a2522",n.lineWidth=(m+(r>=16?0:.5))/s,cn(n,o,c),r>=ya&&(n.strokeStyle="rgba(210,214,222,.7)",n.lineWidth=Math.max(.5,m*.35)/s,cn(n,o,c))}n.globalAlpha=d}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const go="179",mh=0,Qo=1,gh=2,vc=1,_h=2,Pn=3,ti=0,$t=1,Ln=2,Qn=0,Zi=1,el=2,tl=3,nl=4,xh=5,fi=100,vh=101,Mh=102,Sh=103,yh=104,bh=200,Eh=201,Th=202,wh=203,ba=204,Ea=205,Ah=206,Rh=207,Ch=208,Ph=209,Nh=210,Dh=211,Lh=212,Ih=213,Uh=214,Ta=0,wa=1,Aa=2,es=3,Ra=4,Ca=5,Pa=6,Na=7,Mc=0,Fh=1,Bh=2,ei=0,Oh=1,kh=2,jh=3,zh=4,Hh=5,Gh=6,Vh=7,Sc=300,ts=301,ns=302,Da=303,La=304,Cr=306,Ia=1e3,gi=1001,Ua=1002,vn=1003,Wh=1004,ks=1005,_n=1006,Ir=1007,_i=1008,Fn=1009,yc=1010,bc=1011,As=1012,_o=1013,bi=1014,In=1015,Ds=1016,xo=1017,vo=1018,Rs=1020,Ec=35902,Tc=1021,wc=1022,xn=1023,Cs=1026,Ps=1027,Ac=1028,Mo=1029,Rc=1030,So=1031,yo=1033,ur=33776,fr=33777,pr=33778,mr=33779,Fa=35840,Ba=35841,Oa=35842,ka=35843,ja=36196,za=37492,Ha=37496,Ga=37808,Va=37809,Wa=37810,Xa=37811,$a=37812,qa=37813,Ya=37814,Ka=37815,Za=37816,Ja=37817,Qa=37818,eo=37819,to=37820,no=37821,gr=36492,io=36494,so=36495,Cc=36283,ro=36284,ao=36285,oo=36286,Xh=3200,$h=3201,qh=0,Yh=1,Zn="",nn="srgb",is="srgb-linear",Tr="linear",ut="srgb",Pi=7680,il=519,Kh=512,Zh=513,Jh=514,Pc=515,Qh=516,eu=517,tu=518,nu=519,sl=35044,rl="300 es",Sn=2e3,wr=2001;class rs{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const i=t[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Ot=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ur=Math.PI/180,lo=180/Math.PI;function Ls(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ot[n&255]+Ot[n>>8&255]+Ot[n>>16&255]+Ot[n>>24&255]+"-"+Ot[e&255]+Ot[e>>8&255]+"-"+Ot[e>>16&15|64]+Ot[e>>24&255]+"-"+Ot[t&63|128]+Ot[t>>8&255]+"-"+Ot[t>>16&255]+Ot[t>>24&255]+Ot[i&255]+Ot[i>>8&255]+Ot[i>>16&255]+Ot[i>>24&255]).toLowerCase()}function Ke(n,e,t){return Math.max(e,Math.min(t,n))}function iu(n,e){return(n%e+e)%e}function Fr(n,e,t){return(1-t)*n+t*e}function ds(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Wt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class pt{constructor(e=0,t=0){pt.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Is{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,l){let d=i[s+0],h=i[s+1],c=i[s+2],u=i[s+3];const p=r[o+0],m=r[o+1],_=r[o+2],x=r[o+3];if(l===0){e[t+0]=d,e[t+1]=h,e[t+2]=c,e[t+3]=u;return}if(l===1){e[t+0]=p,e[t+1]=m,e[t+2]=_,e[t+3]=x;return}if(u!==x||d!==p||h!==m||c!==_){let g=1-l;const f=d*p+h*m+c*_+u*x,w=f>=0?1:-1,E=1-f*f;if(E>Number.EPSILON){const A=Math.sqrt(E),P=Math.atan2(A,f*w);g=Math.sin(g*P)/A,l=Math.sin(l*P)/A}const b=l*w;if(d=d*g+p*b,h=h*g+m*b,c=c*g+_*b,u=u*g+x*b,g===1-l){const A=1/Math.sqrt(d*d+h*h+c*c+u*u);d*=A,h*=A,c*=A,u*=A}}e[t]=d,e[t+1]=h,e[t+2]=c,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,o){const l=i[s],d=i[s+1],h=i[s+2],c=i[s+3],u=r[o],p=r[o+1],m=r[o+2],_=r[o+3];return e[t]=l*_+c*u+d*m-h*p,e[t+1]=d*_+c*p+h*u-l*m,e[t+2]=h*_+c*m+l*p-d*u,e[t+3]=c*_-l*u-d*p-h*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,l=Math.cos,d=Math.sin,h=l(i/2),c=l(s/2),u=l(r/2),p=d(i/2),m=d(s/2),_=d(r/2);switch(o){case"XYZ":this._x=p*c*u+h*m*_,this._y=h*m*u-p*c*_,this._z=h*c*_+p*m*u,this._w=h*c*u-p*m*_;break;case"YXZ":this._x=p*c*u+h*m*_,this._y=h*m*u-p*c*_,this._z=h*c*_-p*m*u,this._w=h*c*u+p*m*_;break;case"ZXY":this._x=p*c*u-h*m*_,this._y=h*m*u+p*c*_,this._z=h*c*_+p*m*u,this._w=h*c*u-p*m*_;break;case"ZYX":this._x=p*c*u-h*m*_,this._y=h*m*u+p*c*_,this._z=h*c*_-p*m*u,this._w=h*c*u+p*m*_;break;case"YZX":this._x=p*c*u+h*m*_,this._y=h*m*u+p*c*_,this._z=h*c*_-p*m*u,this._w=h*c*u-p*m*_;break;case"XZY":this._x=p*c*u-h*m*_,this._y=h*m*u-p*c*_,this._z=h*c*_+p*m*u,this._w=h*c*u+p*m*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],l=t[5],d=t[9],h=t[2],c=t[6],u=t[10],p=i+l+u;if(p>0){const m=.5/Math.sqrt(p+1);this._w=.25/m,this._x=(c-d)*m,this._y=(r-h)*m,this._z=(o-s)*m}else if(i>l&&i>u){const m=2*Math.sqrt(1+i-l-u);this._w=(c-d)/m,this._x=.25*m,this._y=(s+o)/m,this._z=(r+h)/m}else if(l>u){const m=2*Math.sqrt(1+l-i-u);this._w=(r-h)/m,this._x=(s+o)/m,this._y=.25*m,this._z=(d+c)/m}else{const m=2*Math.sqrt(1+u-i-l);this._w=(o-s)/m,this._x=(r+h)/m,this._y=(d+c)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ke(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,l=t._x,d=t._y,h=t._z,c=t._w;return this._x=i*c+o*l+s*h-r*d,this._y=s*c+o*d+r*l-i*h,this._z=r*c+o*h+i*d-s*l,this._w=o*c-i*l-s*d-r*h,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,r=this._z,o=this._w;let l=o*e._w+i*e._x+s*e._y+r*e._z;if(l<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,l=-l):this.copy(e),l>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;const d=1-l*l;if(d<=Number.EPSILON){const m=1-t;return this._w=m*o+t*this._w,this._x=m*i+t*this._x,this._y=m*s+t*this._y,this._z=m*r+t*this._z,this.normalize(),this}const h=Math.sqrt(d),c=Math.atan2(h,l),u=Math.sin((1-t)*c)/h,p=Math.sin(t*c)/h;return this._w=o*u+this._w*p,this._x=i*u+this._x*p,this._y=s*u+this._y*p,this._z=r*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class W{constructor(e=0,t=0,i=0){W.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(al.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(al.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,l=e.z,d=e.w,h=2*(o*s-l*i),c=2*(l*t-r*s),u=2*(r*i-o*t);return this.x=t+d*h+o*u-l*c,this.y=i+d*c+l*h-r*u,this.z=s+d*u+r*c-o*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,l=t.y,d=t.z;return this.x=s*d-r*l,this.y=r*o-i*d,this.z=i*l-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Br.copy(this).projectOnVector(e),this.sub(Br)}reflect(e){return this.sub(Br.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Ke(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Br=new W,al=new Is;class Xe{constructor(e,t,i,s,r,o,l,d,h){Xe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,l,d,h)}set(e,t,i,s,r,o,l,d,h){const c=this.elements;return c[0]=e,c[1]=s,c[2]=l,c[3]=t,c[4]=r,c[5]=d,c[6]=i,c[7]=o,c[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],l=i[3],d=i[6],h=i[1],c=i[4],u=i[7],p=i[2],m=i[5],_=i[8],x=s[0],g=s[3],f=s[6],w=s[1],E=s[4],b=s[7],A=s[2],P=s[5],N=s[8];return r[0]=o*x+l*w+d*A,r[3]=o*g+l*E+d*P,r[6]=o*f+l*b+d*N,r[1]=h*x+c*w+u*A,r[4]=h*g+c*E+u*P,r[7]=h*f+c*b+u*N,r[2]=p*x+m*w+_*A,r[5]=p*g+m*E+_*P,r[8]=p*f+m*b+_*N,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],l=e[5],d=e[6],h=e[7],c=e[8];return t*o*c-t*l*h-i*r*c+i*l*d+s*r*h-s*o*d}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],l=e[5],d=e[6],h=e[7],c=e[8],u=c*o-l*h,p=l*d-c*r,m=h*r-o*d,_=t*u+i*p+s*m;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/_;return e[0]=u*x,e[1]=(s*h-c*i)*x,e[2]=(l*i-s*o)*x,e[3]=p*x,e[4]=(c*t-s*d)*x,e[5]=(s*r-l*t)*x,e[6]=m*x,e[7]=(i*d-h*t)*x,e[8]=(o*t-i*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,l){const d=Math.cos(r),h=Math.sin(r);return this.set(i*d,i*h,-i*(d*o+h*l)+o+e,-s*h,s*d,-s*(-h*o+d*l)+l+t,0,0,1),this}scale(e,t){return this.premultiply(Or.makeScale(e,t)),this}rotate(e){return this.premultiply(Or.makeRotation(-e)),this}translate(e,t){return this.premultiply(Or.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Or=new Xe;function Nc(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Ar(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function su(){const n=Ar("canvas");return n.style.display="block",n}const ol={};function Ji(n){n in ol||(ol[n]=!0,console.warn(n))}function ru(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}const ll=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),cl=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function au(){const n={enabled:!0,workingColorSpace:is,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ut&&(s.r=Un(s.r),s.g=Un(s.g),s.b=Un(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ut&&(s.r=Qi(s.r),s.g=Qi(s.g),s.b=Qi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Zn?Tr:this.spaces[s].transfer},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ji("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ji("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[is]:{primaries:e,whitePoint:i,transfer:Tr,toXYZ:ll,fromXYZ:cl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:nn},outputColorSpaceConfig:{drawingBufferColorSpace:nn}},[nn]:{primaries:e,whitePoint:i,transfer:ut,toXYZ:ll,fromXYZ:cl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:nn}}}),n}const nt=au();function Un(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Qi(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let Ni;class ou{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Ni===void 0&&(Ni=Ar("canvas")),Ni.width=e.width,Ni.height=e.height;const s=Ni.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Ni}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ar("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Un(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Un(t[i]/255)*255):t[i]=Un(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let lu=0;class bo{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:lu++}),this.uuid=Ls(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,l=s.length;o<l;o++)s[o].isDataTexture?r.push(kr(s[o].image)):r.push(kr(s[o]))}else r=kr(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function kr(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?ou.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let cu=0;const jr=new W;class jt extends rs{constructor(e=jt.DEFAULT_IMAGE,t=jt.DEFAULT_MAPPING,i=gi,s=gi,r=_n,o=_i,l=xn,d=Fn,h=jt.DEFAULT_ANISOTROPY,c=Zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:cu++}),this.uuid=Ls(),this.name="",this.source=new bo(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=h,this.format=l,this.internalFormat=null,this.type=d,this.offset=new pt(0,0),this.repeat=new pt(1,1),this.center=new pt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(jr).x}get height(){return this.source.getSize(jr).y}get depth(){return this.source.getSize(jr).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Sc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ia:e.x=e.x-Math.floor(e.x);break;case gi:e.x=e.x<0?0:1;break;case Ua:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ia:e.y=e.y-Math.floor(e.y);break;case gi:e.y=e.y<0?0:1;break;case Ua:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}jt.DEFAULT_IMAGE=null;jt.DEFAULT_MAPPING=Sc;jt.DEFAULT_ANISOTROPY=1;class wt{constructor(e=0,t=0,i=0,s=1){wt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const d=e.elements,h=d[0],c=d[4],u=d[8],p=d[1],m=d[5],_=d[9],x=d[2],g=d[6],f=d[10];if(Math.abs(c-p)<.01&&Math.abs(u-x)<.01&&Math.abs(_-g)<.01){if(Math.abs(c+p)<.1&&Math.abs(u+x)<.1&&Math.abs(_+g)<.1&&Math.abs(h+m+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const E=(h+1)/2,b=(m+1)/2,A=(f+1)/2,P=(c+p)/4,N=(u+x)/4,R=(_+g)/4;return E>b&&E>A?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=P/i,r=N/i):b>A?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=P/s,r=R/s):A<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),i=N/r,s=R/r),this.set(i,s,r,t),this}let w=Math.sqrt((g-_)*(g-_)+(u-x)*(u-x)+(p-c)*(p-c));return Math.abs(w)<.001&&(w=1),this.x=(g-_)/w,this.y=(u-x)/w,this.z=(p-c)/w,this.w=Math.acos((h+m+f-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this.w=Ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this.w=Ke(this.w,e,t),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Ke(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class du extends rs{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:_n,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new wt(0,0,e,t),this.scissorTest=!1,this.viewport=new wt(0,0,e,t);const s={width:e,height:t,depth:i.depth},r=new jt(s);this.textures=[];const o=i.count;for(let l=0;l<o;l++)this.textures[l]=r.clone(),this.textures[l].isRenderTargetTexture=!0,this.textures[l].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const t={minFilter:_n,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new bo(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Ei extends du{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Dc extends jt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=vn,this.minFilter=vn,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class hu extends jt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=vn,this.minFilter=vn,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Us{constructor(e=new W(1/0,1/0,1/0),t=new W(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(dn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(dn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=dn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,l=r.count;o<l;o++)e.isMesh===!0?e.getVertexPosition(o,dn):dn.fromBufferAttribute(r,o),dn.applyMatrix4(e.matrixWorld),this.expandByPoint(dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),js.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),js.copy(i.boundingBox)),js.applyMatrix4(e.matrixWorld),this.union(js)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,dn),dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(hs),zs.subVectors(this.max,hs),Di.subVectors(e.a,hs),Li.subVectors(e.b,hs),Ii.subVectors(e.c,hs),kn.subVectors(Li,Di),jn.subVectors(Ii,Li),ri.subVectors(Di,Ii);let t=[0,-kn.z,kn.y,0,-jn.z,jn.y,0,-ri.z,ri.y,kn.z,0,-kn.x,jn.z,0,-jn.x,ri.z,0,-ri.x,-kn.y,kn.x,0,-jn.y,jn.x,0,-ri.y,ri.x,0];return!zr(t,Di,Li,Ii,zs)||(t=[1,0,0,0,1,0,0,0,1],!zr(t,Di,Li,Ii,zs))?!1:(Hs.crossVectors(kn,jn),t=[Hs.x,Hs.y,Hs.z],zr(t,Di,Li,Ii,zs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Tn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Tn=[new W,new W,new W,new W,new W,new W,new W,new W],dn=new W,js=new Us,Di=new W,Li=new W,Ii=new W,kn=new W,jn=new W,ri=new W,hs=new W,zs=new W,Hs=new W,ai=new W;function zr(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){ai.fromArray(n,r);const l=s.x*Math.abs(ai.x)+s.y*Math.abs(ai.y)+s.z*Math.abs(ai.z),d=e.dot(ai),h=t.dot(ai),c=i.dot(ai);if(Math.max(-Math.max(d,h,c),Math.min(d,h,c))>l)return!1}return!0}const uu=new Us,us=new W,Hr=new W;class Eo{constructor(e=new W,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):uu.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;us.subVectors(e,this.center);const t=us.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(us,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Hr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(us.copy(e.center).add(Hr)),this.expandByPoint(us.copy(e.center).sub(Hr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const wn=new W,Gr=new W,Gs=new W,zn=new W,Vr=new W,Vs=new W,Wr=new W;class fu{constructor(e=new W,t=new W(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,wn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=wn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(wn.copy(this.origin).addScaledVector(this.direction,t),wn.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Gr.copy(e).add(t).multiplyScalar(.5),Gs.copy(t).sub(e).normalize(),zn.copy(this.origin).sub(Gr);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Gs),l=zn.dot(this.direction),d=-zn.dot(Gs),h=zn.lengthSq(),c=Math.abs(1-o*o);let u,p,m,_;if(c>0)if(u=o*d-l,p=o*l-d,_=r*c,u>=0)if(p>=-_)if(p<=_){const x=1/c;u*=x,p*=x,m=u*(u+o*p+2*l)+p*(o*u+p+2*d)+h}else p=r,u=Math.max(0,-(o*p+l)),m=-u*u+p*(p+2*d)+h;else p=-r,u=Math.max(0,-(o*p+l)),m=-u*u+p*(p+2*d)+h;else p<=-_?(u=Math.max(0,-(-o*r+l)),p=u>0?-r:Math.min(Math.max(-r,-d),r),m=-u*u+p*(p+2*d)+h):p<=_?(u=0,p=Math.min(Math.max(-r,-d),r),m=p*(p+2*d)+h):(u=Math.max(0,-(o*r+l)),p=u>0?r:Math.min(Math.max(-r,-d),r),m=-u*u+p*(p+2*d)+h);else p=o>0?-r:r,u=Math.max(0,-(o*p+l)),m=-u*u+p*(p+2*d)+h;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Gr).addScaledVector(Gs,p),m}intersectSphere(e,t){wn.subVectors(e.center,this.origin);const i=wn.dot(this.direction),s=wn.dot(wn)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),l=i-o,d=i+o;return d<0?null:l<0?this.at(d,t):this.at(l,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,l,d;const h=1/this.direction.x,c=1/this.direction.y,u=1/this.direction.z,p=this.origin;return h>=0?(i=(e.min.x-p.x)*h,s=(e.max.x-p.x)*h):(i=(e.max.x-p.x)*h,s=(e.min.x-p.x)*h),c>=0?(r=(e.min.y-p.y)*c,o=(e.max.y-p.y)*c):(r=(e.max.y-p.y)*c,o=(e.min.y-p.y)*c),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),u>=0?(l=(e.min.z-p.z)*u,d=(e.max.z-p.z)*u):(l=(e.max.z-p.z)*u,d=(e.min.z-p.z)*u),i>d||l>s)||((l>i||i!==i)&&(i=l),(d<s||s!==s)&&(s=d),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,wn)!==null}intersectTriangle(e,t,i,s,r){Vr.subVectors(t,e),Vs.subVectors(i,e),Wr.crossVectors(Vr,Vs);let o=this.direction.dot(Wr),l;if(o>0){if(s)return null;l=1}else if(o<0)l=-1,o=-o;else return null;zn.subVectors(this.origin,e);const d=l*this.direction.dot(Vs.crossVectors(zn,Vs));if(d<0)return null;const h=l*this.direction.dot(Vr.cross(zn));if(h<0||d+h>o)return null;const c=-l*zn.dot(Wr);return c<0?null:this.at(c/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Pt{constructor(e,t,i,s,r,o,l,d,h,c,u,p,m,_,x,g){Pt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,l,d,h,c,u,p,m,_,x,g)}set(e,t,i,s,r,o,l,d,h,c,u,p,m,_,x,g){const f=this.elements;return f[0]=e,f[4]=t,f[8]=i,f[12]=s,f[1]=r,f[5]=o,f[9]=l,f[13]=d,f[2]=h,f[6]=c,f[10]=u,f[14]=p,f[3]=m,f[7]=_,f[11]=x,f[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Pt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/Ui.setFromMatrixColumn(e,0).length(),r=1/Ui.setFromMatrixColumn(e,1).length(),o=1/Ui.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),l=Math.sin(i),d=Math.cos(s),h=Math.sin(s),c=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const p=o*c,m=o*u,_=l*c,x=l*u;t[0]=d*c,t[4]=-d*u,t[8]=h,t[1]=m+_*h,t[5]=p-x*h,t[9]=-l*d,t[2]=x-p*h,t[6]=_+m*h,t[10]=o*d}else if(e.order==="YXZ"){const p=d*c,m=d*u,_=h*c,x=h*u;t[0]=p+x*l,t[4]=_*l-m,t[8]=o*h,t[1]=o*u,t[5]=o*c,t[9]=-l,t[2]=m*l-_,t[6]=x+p*l,t[10]=o*d}else if(e.order==="ZXY"){const p=d*c,m=d*u,_=h*c,x=h*u;t[0]=p-x*l,t[4]=-o*u,t[8]=_+m*l,t[1]=m+_*l,t[5]=o*c,t[9]=x-p*l,t[2]=-o*h,t[6]=l,t[10]=o*d}else if(e.order==="ZYX"){const p=o*c,m=o*u,_=l*c,x=l*u;t[0]=d*c,t[4]=_*h-m,t[8]=p*h+x,t[1]=d*u,t[5]=x*h+p,t[9]=m*h-_,t[2]=-h,t[6]=l*d,t[10]=o*d}else if(e.order==="YZX"){const p=o*d,m=o*h,_=l*d,x=l*h;t[0]=d*c,t[4]=x-p*u,t[8]=_*u+m,t[1]=u,t[5]=o*c,t[9]=-l*c,t[2]=-h*c,t[6]=m*u+_,t[10]=p-x*u}else if(e.order==="XZY"){const p=o*d,m=o*h,_=l*d,x=l*h;t[0]=d*c,t[4]=-u,t[8]=h*c,t[1]=p*u+x,t[5]=o*c,t[9]=m*u-_,t[2]=_*u-m,t[6]=l*c,t[10]=x*u+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(pu,e,mu)}lookAt(e,t,i){const s=this.elements;return Jt.subVectors(e,t),Jt.lengthSq()===0&&(Jt.z=1),Jt.normalize(),Hn.crossVectors(i,Jt),Hn.lengthSq()===0&&(Math.abs(i.z)===1?Jt.x+=1e-4:Jt.z+=1e-4,Jt.normalize(),Hn.crossVectors(i,Jt)),Hn.normalize(),Ws.crossVectors(Jt,Hn),s[0]=Hn.x,s[4]=Ws.x,s[8]=Jt.x,s[1]=Hn.y,s[5]=Ws.y,s[9]=Jt.y,s[2]=Hn.z,s[6]=Ws.z,s[10]=Jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],l=i[4],d=i[8],h=i[12],c=i[1],u=i[5],p=i[9],m=i[13],_=i[2],x=i[6],g=i[10],f=i[14],w=i[3],E=i[7],b=i[11],A=i[15],P=s[0],N=s[4],R=s[8],S=s[12],y=s[1],C=s[5],z=s[9],B=s[13],k=s[2],ee=s[6],$=s[10],q=s[14],H=s[3],ie=s[7],he=s[11],X=s[15];return r[0]=o*P+l*y+d*k+h*H,r[4]=o*N+l*C+d*ee+h*ie,r[8]=o*R+l*z+d*$+h*he,r[12]=o*S+l*B+d*q+h*X,r[1]=c*P+u*y+p*k+m*H,r[5]=c*N+u*C+p*ee+m*ie,r[9]=c*R+u*z+p*$+m*he,r[13]=c*S+u*B+p*q+m*X,r[2]=_*P+x*y+g*k+f*H,r[6]=_*N+x*C+g*ee+f*ie,r[10]=_*R+x*z+g*$+f*he,r[14]=_*S+x*B+g*q+f*X,r[3]=w*P+E*y+b*k+A*H,r[7]=w*N+E*C+b*ee+A*ie,r[11]=w*R+E*z+b*$+A*he,r[15]=w*S+E*B+b*q+A*X,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],l=e[5],d=e[9],h=e[13],c=e[2],u=e[6],p=e[10],m=e[14],_=e[3],x=e[7],g=e[11],f=e[15];return _*(+r*d*u-s*h*u-r*l*p+i*h*p+s*l*m-i*d*m)+x*(+t*d*m-t*h*p+r*o*p-s*o*m+s*h*c-r*d*c)+g*(+t*h*u-t*l*m-r*o*u+i*o*m+r*l*c-i*h*c)+f*(-s*l*c-t*d*u+t*l*p+s*o*u-i*o*p+i*d*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],l=e[5],d=e[6],h=e[7],c=e[8],u=e[9],p=e[10],m=e[11],_=e[12],x=e[13],g=e[14],f=e[15],w=u*g*h-x*p*h+x*d*m-l*g*m-u*d*f+l*p*f,E=_*p*h-c*g*h-_*d*m+o*g*m+c*d*f-o*p*f,b=c*x*h-_*u*h+_*l*m-o*x*m-c*l*f+o*u*f,A=_*u*d-c*x*d-_*l*p+o*x*p+c*l*g-o*u*g,P=t*w+i*E+s*b+r*A;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const N=1/P;return e[0]=w*N,e[1]=(x*p*r-u*g*r-x*s*m+i*g*m+u*s*f-i*p*f)*N,e[2]=(l*g*r-x*d*r+x*s*h-i*g*h-l*s*f+i*d*f)*N,e[3]=(u*d*r-l*p*r-u*s*h+i*p*h+l*s*m-i*d*m)*N,e[4]=E*N,e[5]=(c*g*r-_*p*r+_*s*m-t*g*m-c*s*f+t*p*f)*N,e[6]=(_*d*r-o*g*r-_*s*h+t*g*h+o*s*f-t*d*f)*N,e[7]=(o*p*r-c*d*r+c*s*h-t*p*h-o*s*m+t*d*m)*N,e[8]=b*N,e[9]=(_*u*r-c*x*r-_*i*m+t*x*m+c*i*f-t*u*f)*N,e[10]=(o*x*r-_*l*r+_*i*h-t*x*h-o*i*f+t*l*f)*N,e[11]=(c*l*r-o*u*r-c*i*h+t*u*h+o*i*m-t*l*m)*N,e[12]=A*N,e[13]=(c*x*s-_*u*s+_*i*p-t*x*p-c*i*g+t*u*g)*N,e[14]=(_*l*s-o*x*s-_*i*d+t*x*d+o*i*g-t*l*g)*N,e[15]=(o*u*s-c*l*s+c*i*d-t*u*d-o*i*p+t*l*p)*N,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,l=e.y,d=e.z,h=r*o,c=r*l;return this.set(h*o+i,h*l-s*d,h*d+s*l,0,h*l+s*d,c*l+i,c*d-s*o,0,h*d-s*l,c*d+s*o,r*d*d+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,l=t._z,d=t._w,h=r+r,c=o+o,u=l+l,p=r*h,m=r*c,_=r*u,x=o*c,g=o*u,f=l*u,w=d*h,E=d*c,b=d*u,A=i.x,P=i.y,N=i.z;return s[0]=(1-(x+f))*A,s[1]=(m+b)*A,s[2]=(_-E)*A,s[3]=0,s[4]=(m-b)*P,s[5]=(1-(p+f))*P,s[6]=(g+w)*P,s[7]=0,s[8]=(_+E)*N,s[9]=(g-w)*N,s[10]=(1-(p+x))*N,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let r=Ui.set(s[0],s[1],s[2]).length();const o=Ui.set(s[4],s[5],s[6]).length(),l=Ui.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],hn.copy(this);const h=1/r,c=1/o,u=1/l;return hn.elements[0]*=h,hn.elements[1]*=h,hn.elements[2]*=h,hn.elements[4]*=c,hn.elements[5]*=c,hn.elements[6]*=c,hn.elements[8]*=u,hn.elements[9]*=u,hn.elements[10]*=u,t.setFromRotationMatrix(hn),i.x=r,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,o,l=Sn,d=!1){const h=this.elements,c=2*r/(t-e),u=2*r/(i-s),p=(t+e)/(t-e),m=(i+s)/(i-s);let _,x;if(d)_=r/(o-r),x=o*r/(o-r);else if(l===Sn)_=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(l===wr)_=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+l);return h[0]=c,h[4]=0,h[8]=p,h[12]=0,h[1]=0,h[5]=u,h[9]=m,h[13]=0,h[2]=0,h[6]=0,h[10]=_,h[14]=x,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,i,s,r,o,l=Sn,d=!1){const h=this.elements,c=2/(t-e),u=2/(i-s),p=-(t+e)/(t-e),m=-(i+s)/(i-s);let _,x;if(d)_=1/(o-r),x=o/(o-r);else if(l===Sn)_=-2/(o-r),x=-(o+r)/(o-r);else if(l===wr)_=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+l);return h[0]=c,h[4]=0,h[8]=0,h[12]=p,h[1]=0,h[5]=u,h[9]=0,h[13]=m,h[2]=0,h[6]=0,h[10]=_,h[14]=x,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Ui=new W,hn=new Pt,pu=new W(0,0,0),mu=new W(1,1,1),Hn=new W,Ws=new W,Jt=new W,dl=new Pt,hl=new Is;class Bn{constructor(e=0,t=0,i=0,s=Bn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],l=s[8],d=s[1],h=s[5],c=s[9],u=s[2],p=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-c,m),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(p,h),this._z=0);break;case"YXZ":this._x=Math.asin(-Ke(c,-1,1)),Math.abs(c)<.9999999?(this._y=Math.atan2(l,m),this._z=Math.atan2(d,h)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ke(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,m),this._z=Math.atan2(-o,h)):(this._y=0,this._z=Math.atan2(d,r));break;case"ZYX":this._y=Math.asin(-Ke(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,m),this._z=Math.atan2(d,r)):(this._x=0,this._z=Math.atan2(-o,h));break;case"YZX":this._z=Math.asin(Ke(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-c,h),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(l,m));break;case"XZY":this._z=Math.asin(-Ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,h),this._y=Math.atan2(l,r)):(this._x=Math.atan2(-c,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return dl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dl,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return hl.setFromEuler(this),this.setFromQuaternion(hl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Bn.DEFAULT_ORDER="XYZ";class Lc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let gu=0;const ul=new W,Fi=new Is,An=new Pt,Xs=new W,fs=new W,_u=new W,xu=new Is,fl=new W(1,0,0),pl=new W(0,1,0),ml=new W(0,0,1),gl={type:"added"},vu={type:"removed"},Bi={type:"childadded",child:null},Xr={type:"childremoved",child:null};class rn extends rs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:gu++}),this.uuid=Ls(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=rn.DEFAULT_UP.clone();const e=new W,t=new Bn,i=new Is,s=new W(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Pt},normalMatrix:{value:new Xe}}),this.matrix=new Pt,this.matrixWorld=new Pt,this.matrixAutoUpdate=rn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=rn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Lc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Fi.setFromAxisAngle(e,t),this.quaternion.multiply(Fi),this}rotateOnWorldAxis(e,t){return Fi.setFromAxisAngle(e,t),this.quaternion.premultiply(Fi),this}rotateX(e){return this.rotateOnAxis(fl,e)}rotateY(e){return this.rotateOnAxis(pl,e)}rotateZ(e){return this.rotateOnAxis(ml,e)}translateOnAxis(e,t){return ul.copy(e).applyQuaternion(this.quaternion),this.position.add(ul.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(fl,e)}translateY(e){return this.translateOnAxis(pl,e)}translateZ(e){return this.translateOnAxis(ml,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(An.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Xs.copy(e):Xs.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),fs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?An.lookAt(fs,Xs,this.up):An.lookAt(Xs,fs,this.up),this.quaternion.setFromRotationMatrix(An),s&&(An.extractRotation(s.matrixWorld),Fi.setFromRotationMatrix(An),this.quaternion.premultiply(Fi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(gl),Bi.child=e,this.dispatchEvent(Bi),Bi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(vu),Xr.child=e,this.dispatchEvent(Xr),Xr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),An.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),An.multiply(e.parent.matrixWorld)),e.applyMatrix4(An),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(gl),Bi.child=e,this.dispatchEvent(Bi),Bi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,e,_u),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fs,xu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(l=>({...l,boundingBox:l.boundingBox?l.boundingBox.toJSON():void 0,boundingSphere:l.boundingSphere?l.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(l=>({...l})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(l,d){return l[d.uuid]===void 0&&(l[d.uuid]=d.toJSON(e)),d.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const l=this.geometry.parameters;if(l!==void 0&&l.shapes!==void 0){const d=l.shapes;if(Array.isArray(d))for(let h=0,c=d.length;h<c;h++){const u=d[h];r(e.shapes,u)}else r(e.shapes,d)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const l=[];for(let d=0,h=this.material.length;d<h;d++)l.push(r(e.materials,this.material[d]));s.material=l}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let l=0;l<this.children.length;l++)s.children.push(this.children[l].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let l=0;l<this.animations.length;l++){const d=this.animations[l];s.animations.push(r(e.animations,d))}}if(t){const l=o(e.geometries),d=o(e.materials),h=o(e.textures),c=o(e.images),u=o(e.shapes),p=o(e.skeletons),m=o(e.animations),_=o(e.nodes);l.length>0&&(i.geometries=l),d.length>0&&(i.materials=d),h.length>0&&(i.textures=h),c.length>0&&(i.images=c),u.length>0&&(i.shapes=u),p.length>0&&(i.skeletons=p),m.length>0&&(i.animations=m),_.length>0&&(i.nodes=_)}return i.object=s,i;function o(l){const d=[];for(const h in l){const c=l[h];delete c.metadata,d.push(c)}return d}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}rn.DEFAULT_UP=new W(0,1,0);rn.DEFAULT_MATRIX_AUTO_UPDATE=!0;rn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const un=new W,Rn=new W,$r=new W,Cn=new W,Oi=new W,ki=new W,_l=new W,qr=new W,Yr=new W,Kr=new W,Zr=new wt,Jr=new wt,Qr=new wt;class gn{constructor(e=new W,t=new W,i=new W){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),un.subVectors(e,t),s.cross(un);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){un.subVectors(s,t),Rn.subVectors(i,t),$r.subVectors(e,t);const o=un.dot(un),l=un.dot(Rn),d=un.dot($r),h=Rn.dot(Rn),c=Rn.dot($r),u=o*h-l*l;if(u===0)return r.set(0,0,0),null;const p=1/u,m=(h*d-l*c)*p,_=(o*c-l*d)*p;return r.set(1-m-_,_,m)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Cn)===null?!1:Cn.x>=0&&Cn.y>=0&&Cn.x+Cn.y<=1}static getInterpolation(e,t,i,s,r,o,l,d){return this.getBarycoord(e,t,i,s,Cn)===null?(d.x=0,d.y=0,"z"in d&&(d.z=0),"w"in d&&(d.w=0),null):(d.setScalar(0),d.addScaledVector(r,Cn.x),d.addScaledVector(o,Cn.y),d.addScaledVector(l,Cn.z),d)}static getInterpolatedAttribute(e,t,i,s,r,o){return Zr.setScalar(0),Jr.setScalar(0),Qr.setScalar(0),Zr.fromBufferAttribute(e,t),Jr.fromBufferAttribute(e,i),Qr.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Zr,r.x),o.addScaledVector(Jr,r.y),o.addScaledVector(Qr,r.z),o}static isFrontFacing(e,t,i,s){return un.subVectors(i,t),Rn.subVectors(e,t),un.cross(Rn).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return un.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),un.cross(Rn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return gn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return gn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return gn.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return gn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return gn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,l;Oi.subVectors(s,i),ki.subVectors(r,i),qr.subVectors(e,i);const d=Oi.dot(qr),h=ki.dot(qr);if(d<=0&&h<=0)return t.copy(i);Yr.subVectors(e,s);const c=Oi.dot(Yr),u=ki.dot(Yr);if(c>=0&&u<=c)return t.copy(s);const p=d*u-c*h;if(p<=0&&d>=0&&c<=0)return o=d/(d-c),t.copy(i).addScaledVector(Oi,o);Kr.subVectors(e,r);const m=Oi.dot(Kr),_=ki.dot(Kr);if(_>=0&&m<=_)return t.copy(r);const x=m*h-d*_;if(x<=0&&h>=0&&_<=0)return l=h/(h-_),t.copy(i).addScaledVector(ki,l);const g=c*_-m*u;if(g<=0&&u-c>=0&&m-_>=0)return _l.subVectors(r,s),l=(u-c)/(u-c+(m-_)),t.copy(s).addScaledVector(_l,l);const f=1/(g+x+p);return o=x*f,l=p*f,t.copy(i).addScaledVector(Oi,o).addScaledVector(ki,l)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Ic={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gn={h:0,s:0,l:0},$s={h:0,s:0,l:0};function ea(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class ot{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=nn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=nt.workingColorSpace){return this.r=e,this.g=t,this.b=i,nt.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=nt.workingColorSpace){if(e=iu(e,1),t=Ke(t,0,1),i=Ke(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=ea(o,r,e+1/3),this.g=ea(o,r,e),this.b=ea(o,r,e-1/3)}return nt.colorSpaceToWorking(this,s),this}setStyle(e,t=nn){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],l=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=nn){const i=Ic[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Un(e.r),this.g=Un(e.g),this.b=Un(e.b),this}copyLinearToSRGB(e){return this.r=Qi(e.r),this.g=Qi(e.g),this.b=Qi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=nn){return nt.workingToColorSpace(kt.copy(this),e),Math.round(Ke(kt.r*255,0,255))*65536+Math.round(Ke(kt.g*255,0,255))*256+Math.round(Ke(kt.b*255,0,255))}getHexString(e=nn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.workingToColorSpace(kt.copy(this),t);const i=kt.r,s=kt.g,r=kt.b,o=Math.max(i,s,r),l=Math.min(i,s,r);let d,h;const c=(l+o)/2;if(l===o)d=0,h=0;else{const u=o-l;switch(h=c<=.5?u/(o+l):u/(2-o-l),o){case i:d=(s-r)/u+(s<r?6:0);break;case s:d=(r-i)/u+2;break;case r:d=(i-s)/u+4;break}d/=6}return e.h=d,e.s=h,e.l=c,e}getRGB(e,t=nt.workingColorSpace){return nt.workingToColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=nn){nt.workingToColorSpace(kt.copy(this),e);const t=kt.r,i=kt.g,s=kt.b;return e!==nn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Gn),this.setHSL(Gn.h+e,Gn.s+t,Gn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Gn),e.getHSL($s);const i=Fr(Gn.h,$s.h,t),s=Fr(Gn.s,$s.s,t),r=Fr(Gn.l,$s.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const kt=new ot;ot.NAMES=Ic;let Mu=0;class Pr extends rs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Mu++}),this.uuid=Ls(),this.name="",this.type="Material",this.blending=Zi,this.side=ti,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ba,this.blendDst=Ea,this.blendEquation=fi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ot(0,0,0),this.blendAlpha=0,this.depthFunc=es,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=il,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Pi,this.stencilZFail=Pi,this.stencilZPass=Pi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Zi&&(i.blending=this.blending),this.side!==ti&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==ba&&(i.blendSrc=this.blendSrc),this.blendDst!==Ea&&(i.blendDst=this.blendDst),this.blendEquation!==fi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==es&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==il&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Pi&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Pi&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Pi&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const l in r){const d=r[l];delete d.metadata,o.push(d)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class To extends Pr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Bn,this.combine=Mc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Rt=new W,qs=new pt;let Su=0;class bn{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Su++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=sl,this.updateRanges=[],this.gpuType=In,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)qs.fromBufferAttribute(this,t),qs.applyMatrix3(e),this.setXY(t,qs.x,qs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix3(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyMatrix4(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.applyNormalMatrix(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Rt.fromBufferAttribute(this,t),Rt.transformDirection(e),this.setXYZ(t,Rt.x,Rt.y,Rt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=ds(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Wt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=ds(t,this.array)),t}setX(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=ds(t,this.array)),t}setY(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=ds(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=ds(t,this.array)),t}setW(e,t){return this.normalized&&(t=Wt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),i=Wt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),i=Wt(i,this.array),s=Wt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=Wt(t,this.array),i=Wt(i,this.array),s=Wt(s,this.array),r=Wt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==sl&&(e.usage=this.usage),e}}class Uc extends bn{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Fc extends bn{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class yi extends bn{constructor(e,t,i){super(new Float32Array(e),t,i)}}let yu=0;const ln=new Pt,ta=new rn,ji=new W,Qt=new Us,ps=new Us,Ft=new W;class wi extends rs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:yu++}),this.uuid=Ls(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Nc(e)?Fc:Uc)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Xe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ln.makeRotationFromQuaternion(e),this.applyMatrix4(ln),this}rotateX(e){return ln.makeRotationX(e),this.applyMatrix4(ln),this}rotateY(e){return ln.makeRotationY(e),this.applyMatrix4(ln),this}rotateZ(e){return ln.makeRotationZ(e),this.applyMatrix4(ln),this}translate(e,t,i){return ln.makeTranslation(e,t,i),this.applyMatrix4(ln),this}scale(e,t,i){return ln.makeScale(e,t,i),this.applyMatrix4(ln),this}lookAt(e){return ta.lookAt(e),ta.updateMatrix(),this.applyMatrix4(ta.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ji).negate(),this.translate(ji.x,ji.y,ji.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new yi(i,3))}else{const i=Math.min(e.length,t.count);for(let s=0;s<i;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Us);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new W(-1/0,-1/0,-1/0),new W(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];Qt.setFromBufferAttribute(r),this.morphTargetsRelative?(Ft.addVectors(this.boundingBox.min,Qt.min),this.boundingBox.expandByPoint(Ft),Ft.addVectors(this.boundingBox.max,Qt.max),this.boundingBox.expandByPoint(Ft)):(this.boundingBox.expandByPoint(Qt.min),this.boundingBox.expandByPoint(Qt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Eo);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new W,1/0);return}if(e){const i=this.boundingSphere.center;if(Qt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const l=t[r];ps.setFromBufferAttribute(l),this.morphTargetsRelative?(Ft.addVectors(Qt.min,ps.min),Qt.expandByPoint(Ft),Ft.addVectors(Qt.max,ps.max),Qt.expandByPoint(Ft)):(Qt.expandByPoint(ps.min),Qt.expandByPoint(ps.max))}Qt.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Ft.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Ft));if(t)for(let r=0,o=t.length;r<o;r++){const l=t[r],d=this.morphTargetsRelative;for(let h=0,c=l.count;h<c;h++)Ft.fromBufferAttribute(l,h),d&&(ji.fromBufferAttribute(e,h),Ft.add(ji)),s=Math.max(s,i.distanceToSquared(Ft))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new bn(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),l=[],d=[];for(let R=0;R<i.count;R++)l[R]=new W,d[R]=new W;const h=new W,c=new W,u=new W,p=new pt,m=new pt,_=new pt,x=new W,g=new W;function f(R,S,y){h.fromBufferAttribute(i,R),c.fromBufferAttribute(i,S),u.fromBufferAttribute(i,y),p.fromBufferAttribute(r,R),m.fromBufferAttribute(r,S),_.fromBufferAttribute(r,y),c.sub(h),u.sub(h),m.sub(p),_.sub(p);const C=1/(m.x*_.y-_.x*m.y);isFinite(C)&&(x.copy(c).multiplyScalar(_.y).addScaledVector(u,-m.y).multiplyScalar(C),g.copy(u).multiplyScalar(m.x).addScaledVector(c,-_.x).multiplyScalar(C),l[R].add(x),l[S].add(x),l[y].add(x),d[R].add(g),d[S].add(g),d[y].add(g))}let w=this.groups;w.length===0&&(w=[{start:0,count:e.count}]);for(let R=0,S=w.length;R<S;++R){const y=w[R],C=y.start,z=y.count;for(let B=C,k=C+z;B<k;B+=3)f(e.getX(B+0),e.getX(B+1),e.getX(B+2))}const E=new W,b=new W,A=new W,P=new W;function N(R){A.fromBufferAttribute(s,R),P.copy(A);const S=l[R];E.copy(S),E.sub(A.multiplyScalar(A.dot(S))).normalize(),b.crossVectors(P,S);const C=b.dot(d[R])<0?-1:1;o.setXYZW(R,E.x,E.y,E.z,C)}for(let R=0,S=w.length;R<S;++R){const y=w[R],C=y.start,z=y.count;for(let B=C,k=C+z;B<k;B+=3)N(e.getX(B+0)),N(e.getX(B+1)),N(e.getX(B+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new bn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,m=i.count;p<m;p++)i.setXYZ(p,0,0,0);const s=new W,r=new W,o=new W,l=new W,d=new W,h=new W,c=new W,u=new W;if(e)for(let p=0,m=e.count;p<m;p+=3){const _=e.getX(p+0),x=e.getX(p+1),g=e.getX(p+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,g),c.subVectors(o,r),u.subVectors(s,r),c.cross(u),l.fromBufferAttribute(i,_),d.fromBufferAttribute(i,x),h.fromBufferAttribute(i,g),l.add(c),d.add(c),h.add(c),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(x,d.x,d.y,d.z),i.setXYZ(g,h.x,h.y,h.z)}else for(let p=0,m=t.count;p<m;p+=3)s.fromBufferAttribute(t,p+0),r.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),c.subVectors(o,r),u.subVectors(s,r),c.cross(u),i.setXYZ(p+0,c.x,c.y,c.z),i.setXYZ(p+1,c.x,c.y,c.z),i.setXYZ(p+2,c.x,c.y,c.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Ft.fromBufferAttribute(e,t),Ft.normalize(),e.setXYZ(t,Ft.x,Ft.y,Ft.z)}toNonIndexed(){function e(l,d){const h=l.array,c=l.itemSize,u=l.normalized,p=new h.constructor(d.length*c);let m=0,_=0;for(let x=0,g=d.length;x<g;x++){l.isInterleavedBufferAttribute?m=d[x]*l.data.stride+l.offset:m=d[x]*c;for(let f=0;f<c;f++)p[_++]=h[m++]}return new bn(p,c,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new wi,i=this.index.array,s=this.attributes;for(const l in s){const d=s[l],h=e(d,i);t.setAttribute(l,h)}const r=this.morphAttributes;for(const l in r){const d=[],h=r[l];for(let c=0,u=h.length;c<u;c++){const p=h[c],m=e(p,i);d.push(m)}t.morphAttributes[l]=d}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let l=0,d=o.length;l<d;l++){const h=o[l];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const d=this.parameters;for(const h in d)d[h]!==void 0&&(e[h]=d[h]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const d in i){const h=i[d];e.data.attributes[d]=h.toJSON(e.data)}const s={};let r=!1;for(const d in this.morphAttributes){const h=this.morphAttributes[d],c=[];for(let u=0,p=h.length;u<p;u++){const m=h[u];c.push(m.toJSON(e.data))}c.length>0&&(s[d]=c,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const l=this.boundingSphere;return l!==null&&(e.data.boundingSphere=l.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const h in s){const c=s[h];this.setAttribute(h,c.clone(t))}const r=e.morphAttributes;for(const h in r){const c=[],u=r[h];for(let p=0,m=u.length;p<m;p++)c.push(u[p].clone(t));this.morphAttributes[h]=c}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let h=0,c=o.length;h<c;h++){const u=o[h];this.addGroup(u.start,u.count,u.materialIndex)}const l=e.boundingBox;l!==null&&(this.boundingBox=l.clone());const d=e.boundingSphere;return d!==null&&(this.boundingSphere=d.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const xl=new Pt,oi=new fu,Ys=new Eo,vl=new W,Ks=new W,Zs=new W,Js=new W,na=new W,Qs=new W,Ml=new W,er=new W;class yn extends rn{constructor(e=new wi,t=new To){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const l=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const l=this.morphTargetInfluences;if(r&&l){Qs.set(0,0,0);for(let d=0,h=r.length;d<h;d++){const c=l[d],u=r[d];c!==0&&(na.fromBufferAttribute(u,e),o?Qs.addScaledVector(na,c):Qs.addScaledVector(na.sub(t),c))}t.add(Qs)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ys.copy(i.boundingSphere),Ys.applyMatrix4(r),oi.copy(e.ray).recast(e.near),!(Ys.containsPoint(oi.origin)===!1&&(oi.intersectSphere(Ys,vl)===null||oi.origin.distanceToSquared(vl)>(e.far-e.near)**2))&&(xl.copy(r).invert(),oi.copy(e.ray).applyMatrix4(xl),!(i.boundingBox!==null&&oi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,oi)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,l=r.index,d=r.attributes.position,h=r.attributes.uv,c=r.attributes.uv1,u=r.attributes.normal,p=r.groups,m=r.drawRange;if(l!==null)if(Array.isArray(o))for(let _=0,x=p.length;_<x;_++){const g=p[_],f=o[g.materialIndex],w=Math.max(g.start,m.start),E=Math.min(l.count,Math.min(g.start+g.count,m.start+m.count));for(let b=w,A=E;b<A;b+=3){const P=l.getX(b),N=l.getX(b+1),R=l.getX(b+2);s=tr(this,f,e,i,h,c,u,P,N,R),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const _=Math.max(0,m.start),x=Math.min(l.count,m.start+m.count);for(let g=_,f=x;g<f;g+=3){const w=l.getX(g),E=l.getX(g+1),b=l.getX(g+2);s=tr(this,o,e,i,h,c,u,w,E,b),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(d!==void 0)if(Array.isArray(o))for(let _=0,x=p.length;_<x;_++){const g=p[_],f=o[g.materialIndex],w=Math.max(g.start,m.start),E=Math.min(d.count,Math.min(g.start+g.count,m.start+m.count));for(let b=w,A=E;b<A;b+=3){const P=b,N=b+1,R=b+2;s=tr(this,f,e,i,h,c,u,P,N,R),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const _=Math.max(0,m.start),x=Math.min(d.count,m.start+m.count);for(let g=_,f=x;g<f;g+=3){const w=g,E=g+1,b=g+2;s=tr(this,o,e,i,h,c,u,w,E,b),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}}function bu(n,e,t,i,s,r,o,l){let d;if(e.side===$t?d=i.intersectTriangle(o,r,s,!0,l):d=i.intersectTriangle(s,r,o,e.side===ti,l),d===null)return null;er.copy(l),er.applyMatrix4(n.matrixWorld);const h=t.ray.origin.distanceTo(er);return h<t.near||h>t.far?null:{distance:h,point:er.clone(),object:n}}function tr(n,e,t,i,s,r,o,l,d,h){n.getVertexPosition(l,Ks),n.getVertexPosition(d,Zs),n.getVertexPosition(h,Js);const c=bu(n,e,t,i,Ks,Zs,Js,Ml);if(c){const u=new W;gn.getBarycoord(Ml,Ks,Zs,Js,u),s&&(c.uv=gn.getInterpolatedAttribute(s,l,d,h,u,new pt)),r&&(c.uv1=gn.getInterpolatedAttribute(r,l,d,h,u,new pt)),o&&(c.normal=gn.getInterpolatedAttribute(o,l,d,h,u,new W),c.normal.dot(i.direction)>0&&c.normal.multiplyScalar(-1));const p={a:l,b:d,c:h,normal:new W,materialIndex:0};gn.getNormal(Ks,Zs,Js,p.normal),c.face=p,c.barycoord=u}return c}class Fs extends wi{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const l=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const d=[],h=[],c=[],u=[];let p=0,m=0;_("z","y","x",-1,-1,i,t,e,o,r,0),_("z","y","x",1,-1,i,t,-e,o,r,1),_("x","z","y",1,1,e,i,t,s,o,2),_("x","z","y",1,-1,e,i,-t,s,o,3),_("x","y","z",1,-1,e,t,i,s,r,4),_("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(d),this.setAttribute("position",new yi(h,3)),this.setAttribute("normal",new yi(c,3)),this.setAttribute("uv",new yi(u,2));function _(x,g,f,w,E,b,A,P,N,R,S){const y=b/N,C=A/R,z=b/2,B=A/2,k=P/2,ee=N+1,$=R+1;let q=0,H=0;const ie=new W;for(let he=0;he<$;he++){const X=he*C-B;for(let te=0;te<ee;te++){const _e=te*y-z;ie[x]=_e*w,ie[g]=X*E,ie[f]=k,h.push(ie.x,ie.y,ie.z),ie[x]=0,ie[g]=0,ie[f]=P>0?1:-1,c.push(ie.x,ie.y,ie.z),u.push(te/N),u.push(1-he/R),q+=1}}for(let he=0;he<R;he++)for(let X=0;X<N;X++){const te=p+X+ee*he,_e=p+X+ee*(he+1),ue=p+(X+1)+ee*(he+1),O=p+(X+1)+ee*he;d.push(te,_e,O),d.push(_e,ue,O),H+=6}l.addGroup(m,H,S),m+=H,p+=q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Fs(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ss(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Ht(n){const e={};for(let t=0;t<n.length;t++){const i=ss(n[t]);for(const s in i)e[s]=i[s]}return e}function Eu(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Bc(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}const Tu={clone:ss,merge:Ht};var wu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Au=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ni extends Pr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=wu,this.fragmentShader=Au,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ss(e.uniforms),this.uniformsGroups=Eu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Oc extends rn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Pt,this.projectionMatrix=new Pt,this.projectionMatrixInverse=new Pt,this.coordinateSystem=Sn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Vn=new W,Sl=new pt,yl=new pt;class pn extends Oc{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=lo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ur*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return lo*2*Math.atan(Math.tan(Ur*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Vn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Vn.x,Vn.y).multiplyScalar(-e/Vn.z),Vn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Vn.x,Vn.y).multiplyScalar(-e/Vn.z)}getViewSize(e,t){return this.getViewBounds(e,Sl,yl),t.subVectors(yl,Sl)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ur*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const d=o.fullWidth,h=o.fullHeight;r+=o.offsetX*s/d,t-=o.offsetY*i/h,s*=o.width/d,i*=o.height/h}const l=this.filmOffset;l!==0&&(r+=e*l/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const zi=-90,Hi=1;class Ru extends rn{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new pn(zi,Hi,e,t);s.layers=this.layers,this.add(s);const r=new pn(zi,Hi,e,t);r.layers=this.layers,this.add(r);const o=new pn(zi,Hi,e,t);o.layers=this.layers,this.add(o);const l=new pn(zi,Hi,e,t);l.layers=this.layers,this.add(l);const d=new pn(zi,Hi,e,t);d.layers=this.layers,this.add(d);const h=new pn(zi,Hi,e,t);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,l,d]=t;for(const h of t)this.remove(h);if(e===Sn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),l.up.set(0,1,0),l.lookAt(0,0,1),d.up.set(0,1,0),d.lookAt(0,0,-1);else if(e===wr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),l.up.set(0,-1,0),l.lookAt(0,0,1),d.up.set(0,-1,0),d.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const h of t)this.add(h),h.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,l,d,h,c]=this.children,u=e.getRenderTarget(),p=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,l),e.setRenderTarget(i,3,s),e.render(t,d),e.setRenderTarget(i,4,s),e.render(t,h),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),e.render(t,c),e.setRenderTarget(u,p,m),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class kc extends jt{constructor(e=[],t=ts,i,s,r,o,l,d,h,c){super(e,t,i,s,r,o,l,d,h,c),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Cu extends Ei{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new kc(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Fs(5,5,5),r=new ni({name:"CubemapFromEquirect",uniforms:ss(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:$t,blending:Qn});r.uniforms.tEquirect.value=t;const o=new yn(s,r),l=t.minFilter;return t.minFilter===_i&&(t.minFilter=_n),new Ru(1,10,this).update(e,o),t.minFilter=l,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}class bs extends rn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Pu={type:"move"};class ia{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new bs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new bs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new W,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new W),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new bs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new W,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new W),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const l=this._targetRay,d=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){o=!0;for(const x of e.hand.values()){const g=t.getJointPose(x,i),f=this._getHandJoint(h,x);g!==null&&(f.matrix.fromArray(g.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=g.radius),f.visible=g!==null}const c=h.joints["index-finger-tip"],u=h.joints["thumb-tip"],p=c.position.distanceTo(u.position),m=.02,_=.005;h.inputState.pinching&&p>m+_?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&p<=m-_&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else d!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(d.matrix.fromArray(r.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,r.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(r.linearVelocity)):d.hasLinearVelocity=!1,r.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(r.angularVelocity)):d.hasAngularVelocity=!1));l!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,this.dispatchEvent(Pu)))}return l!==null&&(l.visible=s!==null),d!==null&&(d.visible=r!==null),h!==null&&(h.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new bs;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class Nu extends rn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Bn,this.environmentIntensity=1,this.environmentRotation=new Bn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}const sa=new W,Du=new W,Lu=new Xe;class hi{constructor(e=new W(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=sa.subVectors(i,t).cross(Du.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(sa),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Lu.getNormalMatrix(e),s=this.coplanarPoint(sa).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const li=new Eo,Iu=new pt(.5,.5),nr=new W;class jc{constructor(e=new hi,t=new hi,i=new hi,s=new hi,r=new hi,o=new hi){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const l=this.planes;return l[0].copy(e),l[1].copy(t),l[2].copy(i),l[3].copy(s),l[4].copy(r),l[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Sn,i=!1){const s=this.planes,r=e.elements,o=r[0],l=r[1],d=r[2],h=r[3],c=r[4],u=r[5],p=r[6],m=r[7],_=r[8],x=r[9],g=r[10],f=r[11],w=r[12],E=r[13],b=r[14],A=r[15];if(s[0].setComponents(h-o,m-c,f-_,A-w).normalize(),s[1].setComponents(h+o,m+c,f+_,A+w).normalize(),s[2].setComponents(h+l,m+u,f+x,A+E).normalize(),s[3].setComponents(h-l,m-u,f-x,A-E).normalize(),i)s[4].setComponents(d,p,g,b).normalize(),s[5].setComponents(h-d,m-p,f-g,A-b).normalize();else if(s[4].setComponents(h-d,m-p,f-g,A-b).normalize(),t===Sn)s[5].setComponents(h+d,m+p,f+g,A+b).normalize();else if(t===wr)s[5].setComponents(d,p,g,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),li.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),li.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(li)}intersectsSprite(e){li.center.set(0,0,0);const t=Iu.distanceTo(e.center);return li.radius=.7071067811865476+t,li.applyMatrix4(e.matrixWorld),this.intersectsSphere(li)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(nr.x=s.normal.x>0?e.max.x:e.min.x,nr.y=s.normal.y>0?e.max.y:e.min.y,nr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(nr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Uu extends jt{constructor(e,t,i,s,r,o,l,d,h){super(e,t,i,s,r,o,l,d,h),this.isCanvasTexture=!0,this.needsUpdate=!0}}class zc extends jt{constructor(e,t,i=bi,s,r,o,l=vn,d=vn,h,c=Cs,u=1){if(c!==Cs&&c!==Ps)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const p={width:e,height:t,depth:u};super(p,s,r,o,l,d,c,i,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new bo(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Bs extends wi{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,l=Math.floor(i),d=Math.floor(s),h=l+1,c=d+1,u=e/l,p=t/d,m=[],_=[],x=[],g=[];for(let f=0;f<c;f++){const w=f*p-o;for(let E=0;E<h;E++){const b=E*u-r;_.push(b,-w,0),x.push(0,0,1),g.push(E/l),g.push(1-f/d)}}for(let f=0;f<d;f++)for(let w=0;w<l;w++){const E=w+h*f,b=w+h*(f+1),A=w+1+h*(f+1),P=w+1+h*f;m.push(E,b,P),m.push(b,A,P)}this.setIndex(m),this.setAttribute("position",new yi(_,3)),this.setAttribute("normal",new yi(x,3)),this.setAttribute("uv",new yi(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Bs(e.width,e.height,e.widthSegments,e.heightSegments)}}class Fu extends Pr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Xh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Bu extends Pr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class Hc extends Oc{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,l=s+t,d=s-t;if(this.view!==null&&this.view.enabled){const h=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,o=r+h*this.view.width,l-=c*this.view.offsetY,d=l-c*this.view.height}this.projectionMatrix.makeOrthographic(r,o,l,d,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Ou extends pn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}function bl(n,e,t,i){const s=ku(i);switch(t){case Tc:return n*e;case Ac:return n*e/s.components*s.byteLength;case Mo:return n*e/s.components*s.byteLength;case Rc:return n*e*2/s.components*s.byteLength;case So:return n*e*2/s.components*s.byteLength;case wc:return n*e*3/s.components*s.byteLength;case xn:return n*e*4/s.components*s.byteLength;case yo:return n*e*4/s.components*s.byteLength;case ur:case fr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case pr:case mr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ba:case ka:return Math.max(n,16)*Math.max(e,8)/4;case Fa:case Oa:return Math.max(n,8)*Math.max(e,8)/2;case ja:case za:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Ha:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ga:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Va:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Wa:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case Xa:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case $a:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case qa:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Ya:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Ka:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Za:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Ja:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Qa:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case eo:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case to:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case no:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case gr:case io:case so:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Cc:case ro:return Math.ceil(n/4)*Math.ceil(e/4)*8;case ao:case oo:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ku(n){switch(n){case Fn:case yc:return{byteLength:1,components:1};case As:case bc:case Ds:return{byteLength:2,components:1};case xo:case vo:return{byteLength:2,components:4};case bi:case _o:case In:return{byteLength:4,components:1};case Ec:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:go}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=go);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Gc(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function ju(n){const e=new WeakMap;function t(l,d){const h=l.array,c=l.usage,u=h.byteLength,p=n.createBuffer();n.bindBuffer(d,p),n.bufferData(d,h,c),l.onUploadCallback();let m;if(h instanceof Float32Array)m=n.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)m=n.HALF_FLOAT;else if(h instanceof Uint16Array)l.isFloat16BufferAttribute?m=n.HALF_FLOAT:m=n.UNSIGNED_SHORT;else if(h instanceof Int16Array)m=n.SHORT;else if(h instanceof Uint32Array)m=n.UNSIGNED_INT;else if(h instanceof Int32Array)m=n.INT;else if(h instanceof Int8Array)m=n.BYTE;else if(h instanceof Uint8Array)m=n.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)m=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:p,type:m,bytesPerElement:h.BYTES_PER_ELEMENT,version:l.version,size:u}}function i(l,d,h){const c=d.array,u=d.updateRanges;if(n.bindBuffer(h,l),u.length===0)n.bufferSubData(h,0,c);else{u.sort((m,_)=>m.start-_.start);let p=0;for(let m=1;m<u.length;m++){const _=u[p],x=u[m];x.start<=_.start+_.count+1?_.count=Math.max(_.count,x.start+x.count-_.start):(++p,u[p]=x)}u.length=p+1;for(let m=0,_=u.length;m<_;m++){const x=u[m];n.bufferSubData(h,x.start*c.BYTES_PER_ELEMENT,c,x.start,x.count)}d.clearUpdateRanges()}d.onUploadCallback()}function s(l){return l.isInterleavedBufferAttribute&&(l=l.data),e.get(l)}function r(l){l.isInterleavedBufferAttribute&&(l=l.data);const d=e.get(l);d&&(n.deleteBuffer(d.buffer),e.delete(l))}function o(l,d){if(l.isInterleavedBufferAttribute&&(l=l.data),l.isGLBufferAttribute){const c=e.get(l);(!c||c.version<l.version)&&e.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}const h=e.get(l);if(h===void 0)e.set(l,t(l,d));else if(h.version<l.version){if(h.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(h.buffer,l,d),h.version=l.version}}return{get:s,remove:r,update:o}}var zu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hu=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Gu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Vu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Wu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Xu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$u=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT )
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN )
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,qu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Yu=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Ku=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Zu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ju=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Qu=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,ef=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,tf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,nf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,sf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,rf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,af=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,of=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,lf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,cf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,df=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,hf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,uf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ff=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,pf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,mf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,gf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,_f=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xf="gl_FragColor = linearToOutputTexel( gl_FragColor );",vf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Mf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Sf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif

#endif`,yf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,bf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ef=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Tf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,wf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Af=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Rf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Cf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Pf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Nf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Df=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Lf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,If=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Uf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ff=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Bf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Of=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,kf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,jf=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,zf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Hf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Gf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Vf=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Wf=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Xf=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$f=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,qf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Yf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Kf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Zf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Qf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ep=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,tp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,np=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ip=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,sp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,ap=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,op=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,dp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,hp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,up=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,fp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,pp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,mp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,gp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,_p=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,xp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Mp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Sp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,yp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,bp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSEDEPTHBUF
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSEDEPTHBUF
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare , distribution.x );
		#endif
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;

		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Ep=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Tp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,wp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Ap=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Rp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Cp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Pp=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Np=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Dp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Lp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ip=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Up=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Fp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Bp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Op=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,kp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,jp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const zp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Hp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vp=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$p=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,qp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSEDEPTHBUF
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Yp=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Kp=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Zp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Jp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qp=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,em=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,tm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,nm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,im=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,am=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,om=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,lm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,cm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,um=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,fm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,pm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,gm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_m=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,xm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,vm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Mm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,$e={alphahash_fragment:zu,alphahash_pars_fragment:Hu,alphamap_fragment:Gu,alphamap_pars_fragment:Vu,alphatest_fragment:Wu,alphatest_pars_fragment:Xu,aomap_fragment:$u,aomap_pars_fragment:qu,batching_pars_vertex:Yu,batching_vertex:Ku,begin_vertex:Zu,beginnormal_vertex:Ju,bsdfs:Qu,iridescence_fragment:ef,bumpmap_pars_fragment:tf,clipping_planes_fragment:nf,clipping_planes_pars_fragment:sf,clipping_planes_pars_vertex:rf,clipping_planes_vertex:af,color_fragment:of,color_pars_fragment:lf,color_pars_vertex:cf,color_vertex:df,common:hf,cube_uv_reflection_fragment:uf,defaultnormal_vertex:ff,displacementmap_pars_vertex:pf,displacementmap_vertex:mf,emissivemap_fragment:gf,emissivemap_pars_fragment:_f,colorspace_fragment:xf,colorspace_pars_fragment:vf,envmap_fragment:Mf,envmap_common_pars_fragment:Sf,envmap_pars_fragment:yf,envmap_pars_vertex:bf,envmap_physical_pars_fragment:If,envmap_vertex:Ef,fog_vertex:Tf,fog_pars_vertex:wf,fog_fragment:Af,fog_pars_fragment:Rf,gradientmap_pars_fragment:Cf,lightmap_pars_fragment:Pf,lights_lambert_fragment:Nf,lights_lambert_pars_fragment:Df,lights_pars_begin:Lf,lights_toon_fragment:Uf,lights_toon_pars_fragment:Ff,lights_phong_fragment:Bf,lights_phong_pars_fragment:Of,lights_physical_fragment:kf,lights_physical_pars_fragment:jf,lights_fragment_begin:zf,lights_fragment_maps:Hf,lights_fragment_end:Gf,logdepthbuf_fragment:Vf,logdepthbuf_pars_fragment:Wf,logdepthbuf_pars_vertex:Xf,logdepthbuf_vertex:$f,map_fragment:qf,map_pars_fragment:Yf,map_particle_fragment:Kf,map_particle_pars_fragment:Zf,metalnessmap_fragment:Jf,metalnessmap_pars_fragment:Qf,morphinstance_vertex:ep,morphcolor_vertex:tp,morphnormal_vertex:np,morphtarget_pars_vertex:ip,morphtarget_vertex:sp,normal_fragment_begin:rp,normal_fragment_maps:ap,normal_pars_fragment:op,normal_pars_vertex:lp,normal_vertex:cp,normalmap_pars_fragment:dp,clearcoat_normal_fragment_begin:hp,clearcoat_normal_fragment_maps:up,clearcoat_pars_fragment:fp,iridescence_pars_fragment:pp,opaque_fragment:mp,packing:gp,premultiplied_alpha_fragment:_p,project_vertex:xp,dithering_fragment:vp,dithering_pars_fragment:Mp,roughnessmap_fragment:Sp,roughnessmap_pars_fragment:yp,shadowmap_pars_fragment:bp,shadowmap_pars_vertex:Ep,shadowmap_vertex:Tp,shadowmask_pars_fragment:wp,skinbase_vertex:Ap,skinning_pars_vertex:Rp,skinning_vertex:Cp,skinnormal_vertex:Pp,specularmap_fragment:Np,specularmap_pars_fragment:Dp,tonemapping_fragment:Lp,tonemapping_pars_fragment:Ip,transmission_fragment:Up,transmission_pars_fragment:Fp,uv_pars_fragment:Bp,uv_pars_vertex:Op,uv_vertex:kp,worldpos_vertex:jp,background_vert:zp,background_frag:Hp,backgroundCube_vert:Gp,backgroundCube_frag:Vp,cube_vert:Wp,cube_frag:Xp,depth_vert:$p,depth_frag:qp,distanceRGBA_vert:Yp,distanceRGBA_frag:Kp,equirect_vert:Zp,equirect_frag:Jp,linedashed_vert:Qp,linedashed_frag:em,meshbasic_vert:tm,meshbasic_frag:nm,meshlambert_vert:im,meshlambert_frag:sm,meshmatcap_vert:rm,meshmatcap_frag:am,meshnormal_vert:om,meshnormal_frag:lm,meshphong_vert:cm,meshphong_frag:dm,meshphysical_vert:hm,meshphysical_frag:um,meshtoon_vert:fm,meshtoon_frag:pm,points_vert:mm,points_frag:gm,shadow_vert:_m,shadow_frag:xm,sprite_vert:vm,sprite_frag:Mm},ve={common:{diffuse:{value:new ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new ot(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},Mn={basic:{uniforms:Ht([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:Ht([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new ot(0)}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:Ht([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new ot(0)},specular:{value:new ot(1118481)},shininess:{value:30}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:Ht([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:Ht([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new ot(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:Ht([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:Ht([ve.points,ve.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:Ht([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:Ht([ve.common,ve.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:Ht([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:Ht([ve.sprite,ve.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distanceRGBA:{uniforms:Ht([ve.common,ve.displacementmap,{referencePosition:{value:new W},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distanceRGBA_vert,fragmentShader:$e.distanceRGBA_frag},shadow:{uniforms:Ht([ve.lights,ve.fog,{color:{value:new ot(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};Mn.physical={uniforms:Ht([Mn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new ot(0)},specularColor:{value:new ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};const ir={r:0,b:0,g:0},ci=new Bn,Sm=new Pt;function ym(n,e,t,i,s,r,o){const l=new ot(0);let d=r===!0?0:1,h,c,u=null,p=0,m=null;function _(E){let b=E.isScene===!0?E.background:null;return b&&b.isTexture&&(b=(E.backgroundBlurriness>0?t:e).get(b)),b}function x(E){let b=!1;const A=_(E);A===null?f(l,d):A&&A.isColor&&(f(A,1),b=!0);const P=n.xr.getEnvironmentBlendMode();P==="additive"?i.buffers.color.setClear(0,0,0,1,o):P==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function g(E,b){const A=_(b);A&&(A.isCubeTexture||A.mapping===Cr)?(c===void 0&&(c=new yn(new Fs(1,1,1),new ni({name:"BackgroundCubeMaterial",uniforms:ss(Mn.backgroundCube.uniforms),vertexShader:Mn.backgroundCube.vertexShader,fragmentShader:Mn.backgroundCube.fragmentShader,side:$t,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(P,N,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(c)),ci.copy(b.backgroundRotation),ci.x*=-1,ci.y*=-1,ci.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(ci.y*=-1,ci.z*=-1),c.material.uniforms.envMap.value=A,c.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,c.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Sm.makeRotationFromEuler(ci)),c.material.toneMapped=nt.getTransfer(A.colorSpace)!==ut,(u!==A||p!==A.version||m!==n.toneMapping)&&(c.material.needsUpdate=!0,u=A,p=A.version,m=n.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null)):A&&A.isTexture&&(h===void 0&&(h=new yn(new Bs(2,2),new ni({name:"BackgroundMaterial",uniforms:ss(Mn.background.uniforms),vertexShader:Mn.background.vertexShader,fragmentShader:Mn.background.fragmentShader,side:ti,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(h)),h.material.uniforms.t2D.value=A,h.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,h.material.toneMapped=nt.getTransfer(A.colorSpace)!==ut,A.matrixAutoUpdate===!0&&A.updateMatrix(),h.material.uniforms.uvTransform.value.copy(A.matrix),(u!==A||p!==A.version||m!==n.toneMapping)&&(h.material.needsUpdate=!0,u=A,p=A.version,m=n.toneMapping),h.layers.enableAll(),E.unshift(h,h.geometry,h.material,0,0,null))}function f(E,b){E.getRGB(ir,Bc(n)),i.buffers.color.setClear(ir.r,ir.g,ir.b,b,o)}function w(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0)}return{getClearColor:function(){return l},setClearColor:function(E,b=1){l.set(E),d=b,f(l,d)},getClearAlpha:function(){return d},setClearAlpha:function(E){d=E,f(l,d)},render:x,addToRenderList:g,dispose:w}}function bm(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=p(null);let r=s,o=!1;function l(y,C,z,B,k){let ee=!1;const $=u(B,z,C);r!==$&&(r=$,h(r.object)),ee=m(y,B,z,k),ee&&_(y,B,z,k),k!==null&&e.update(k,n.ELEMENT_ARRAY_BUFFER),(ee||o)&&(o=!1,b(y,C,z,B),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function d(){return n.createVertexArray()}function h(y){return n.bindVertexArray(y)}function c(y){return n.deleteVertexArray(y)}function u(y,C,z){const B=z.wireframe===!0;let k=i[y.id];k===void 0&&(k={},i[y.id]=k);let ee=k[C.id];ee===void 0&&(ee={},k[C.id]=ee);let $=ee[B];return $===void 0&&($=p(d()),ee[B]=$),$}function p(y){const C=[],z=[],B=[];for(let k=0;k<t;k++)C[k]=0,z[k]=0,B[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:z,attributeDivisors:B,object:y,attributes:{},index:null}}function m(y,C,z,B){const k=r.attributes,ee=C.attributes;let $=0;const q=z.getAttributes();for(const H in q)if(q[H].location>=0){const he=k[H];let X=ee[H];if(X===void 0&&(H==="instanceMatrix"&&y.instanceMatrix&&(X=y.instanceMatrix),H==="instanceColor"&&y.instanceColor&&(X=y.instanceColor)),he===void 0||he.attribute!==X||X&&he.data!==X.data)return!0;$++}return r.attributesNum!==$||r.index!==B}function _(y,C,z,B){const k={},ee=C.attributes;let $=0;const q=z.getAttributes();for(const H in q)if(q[H].location>=0){let he=ee[H];he===void 0&&(H==="instanceMatrix"&&y.instanceMatrix&&(he=y.instanceMatrix),H==="instanceColor"&&y.instanceColor&&(he=y.instanceColor));const X={};X.attribute=he,he&&he.data&&(X.data=he.data),k[H]=X,$++}r.attributes=k,r.attributesNum=$,r.index=B}function x(){const y=r.newAttributes;for(let C=0,z=y.length;C<z;C++)y[C]=0}function g(y){f(y,0)}function f(y,C){const z=r.newAttributes,B=r.enabledAttributes,k=r.attributeDivisors;z[y]=1,B[y]===0&&(n.enableVertexAttribArray(y),B[y]=1),k[y]!==C&&(n.vertexAttribDivisor(y,C),k[y]=C)}function w(){const y=r.newAttributes,C=r.enabledAttributes;for(let z=0,B=C.length;z<B;z++)C[z]!==y[z]&&(n.disableVertexAttribArray(z),C[z]=0)}function E(y,C,z,B,k,ee,$){$===!0?n.vertexAttribIPointer(y,C,z,k,ee):n.vertexAttribPointer(y,C,z,B,k,ee)}function b(y,C,z,B){x();const k=B.attributes,ee=z.getAttributes(),$=C.defaultAttributeValues;for(const q in ee){const H=ee[q];if(H.location>=0){let ie=k[q];if(ie===void 0&&(q==="instanceMatrix"&&y.instanceMatrix&&(ie=y.instanceMatrix),q==="instanceColor"&&y.instanceColor&&(ie=y.instanceColor)),ie!==void 0){const he=ie.normalized,X=ie.itemSize,te=e.get(ie);if(te===void 0)continue;const _e=te.buffer,ue=te.type,O=te.bytesPerElement,Q=ue===n.INT||ue===n.UNSIGNED_INT||ie.gpuType===_o;if(ie.isInterleavedBufferAttribute){const Z=ie.data,ge=Z.stride,ye=ie.offset;if(Z.isInstancedInterleavedBuffer){for(let Le=0;Le<H.locationSize;Le++)f(H.location+Le,Z.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let Le=0;Le<H.locationSize;Le++)g(H.location+Le);n.bindBuffer(n.ARRAY_BUFFER,_e);for(let Le=0;Le<H.locationSize;Le++)E(H.location+Le,X/H.locationSize,ue,he,ge*O,(ye+X/H.locationSize*Le)*O,Q)}else{if(ie.isInstancedBufferAttribute){for(let Z=0;Z<H.locationSize;Z++)f(H.location+Z,ie.meshPerAttribute);y.isInstancedMesh!==!0&&B._maxInstanceCount===void 0&&(B._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let Z=0;Z<H.locationSize;Z++)g(H.location+Z);n.bindBuffer(n.ARRAY_BUFFER,_e);for(let Z=0;Z<H.locationSize;Z++)E(H.location+Z,X/H.locationSize,ue,he,X*O,X/H.locationSize*Z*O,Q)}}else if($!==void 0){const he=$[q];if(he!==void 0)switch(he.length){case 2:n.vertexAttrib2fv(H.location,he);break;case 3:n.vertexAttrib3fv(H.location,he);break;case 4:n.vertexAttrib4fv(H.location,he);break;default:n.vertexAttrib1fv(H.location,he)}}}}w()}function A(){R();for(const y in i){const C=i[y];for(const z in C){const B=C[z];for(const k in B)c(B[k].object),delete B[k];delete C[z]}delete i[y]}}function P(y){if(i[y.id]===void 0)return;const C=i[y.id];for(const z in C){const B=C[z];for(const k in B)c(B[k].object),delete B[k];delete C[z]}delete i[y.id]}function N(y){for(const C in i){const z=i[C];if(z[y.id]===void 0)continue;const B=z[y.id];for(const k in B)c(B[k].object),delete B[k];delete z[y.id]}}function R(){S(),o=!0,r!==s&&(r=s,h(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:l,reset:R,resetDefaultState:S,dispose:A,releaseStatesOfGeometry:P,releaseStatesOfProgram:N,initAttributes:x,enableAttribute:g,disableUnusedAttributes:w}}function Em(n,e,t){let i;function s(h){i=h}function r(h,c){n.drawArrays(i,h,c),t.update(c,i,1)}function o(h,c,u){u!==0&&(n.drawArraysInstanced(i,h,c,u),t.update(c,i,u))}function l(h,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,h,0,c,0,u);let m=0;for(let _=0;_<u;_++)m+=c[_];t.update(m,i,1)}function d(h,c,u,p){if(u===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<h.length;_++)o(h[_],c[_],p[_]);else{m.multiDrawArraysInstancedWEBGL(i,h,0,c,0,p,0,u);let _=0;for(let x=0;x<u;x++)_+=c[x]*p[x];t.update(_,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=l,this.renderMultiDrawInstances=d}function Tm(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const N=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(N.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(N){return!(N!==xn&&i.convert(N)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function l(N){const R=N===Ds&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(N!==Fn&&i.convert(N)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&N!==In&&!R)}function d(N){if(N==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";N="mediump"}return N==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=t.precision!==void 0?t.precision:"highp";const c=d(h);c!==h&&(console.warn("THREE.WebGLRenderer:",h,"not supported, using",c,"instead."),h=c);const u=t.logarithmicDepthBuffer===!0,p=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),f=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),A=_>0,P=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:d,textureFormatReadable:o,textureTypeReadable:l,precision:h,logarithmicDepthBuffer:u,reversedDepthBuffer:p,maxTextures:m,maxVertexTextures:_,maxTextureSize:x,maxCubemapSize:g,maxAttributes:f,maxVertexUniforms:w,maxVaryings:E,maxFragmentUniforms:b,vertexTextures:A,maxSamples:P}}function wm(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new hi,l=new Xe,d={value:null,needsUpdate:!1};this.uniform=d,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const m=u.length!==0||p||i!==0||s;return s=p,i=u.length,m},this.beginShadows=function(){r=!0,c(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,p){t=c(u,p,0)},this.setState=function(u,p,m){const _=u.clippingPlanes,x=u.clipIntersection,g=u.clipShadows,f=n.get(u);if(!s||_===null||_.length===0||r&&!g)r?c(null):h();else{const w=r?0:i,E=w*4;let b=f.clippingState||null;d.value=b,b=c(_,p,E,m);for(let A=0;A!==E;++A)b[A]=t[A];f.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=w}};function h(){d.value!==t&&(d.value=t,d.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function c(u,p,m,_){const x=u!==null?u.length:0;let g=null;if(x!==0){if(g=d.value,_!==!0||g===null){const f=m+x*4,w=p.matrixWorldInverse;l.getNormalMatrix(w),(g===null||g.length<f)&&(g=new Float32Array(f));for(let E=0,b=m;E!==x;++E,b+=4)o.copy(u[E]).applyMatrix4(w,l),o.normal.toArray(g,b),g[b+3]=o.constant}d.value=g,d.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,g}}function Am(n){let e=new WeakMap;function t(o,l){return l===Da?o.mapping=ts:l===La&&(o.mapping=ns),o}function i(o){if(o&&o.isTexture){const l=o.mapping;if(l===Da||l===La)if(e.has(o)){const d=e.get(o).texture;return t(d,o.mapping)}else{const d=o.image;if(d&&d.height>0){const h=new Cu(d.height);return h.fromEquirectangularTexture(n,o),e.set(o,h),o.addEventListener("dispose",s),t(h.texture,o.mapping)}else return null}}return o}function s(o){const l=o.target;l.removeEventListener("dispose",s);const d=e.get(l);d!==void 0&&(e.delete(l),d.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}const qi=4,El=[.125,.215,.35,.446,.526,.582],pi=20,ra=new Hc,Tl=new ot;let aa=null,oa=0,la=0,ca=!1;const ui=(1+Math.sqrt(5))/2,Gi=1/ui,wl=[new W(-ui,Gi,0),new W(ui,Gi,0),new W(-Gi,0,ui),new W(Gi,0,ui),new W(0,ui,-Gi),new W(0,ui,Gi),new W(-1,1,-1),new W(1,1,-1),new W(-1,1,1),new W(1,1,1)],Rm=new W;class Al{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100,r={}){const{size:o=256,position:l=Rm}=r;aa=this._renderer.getRenderTarget(),oa=this._renderer.getActiveCubeFace(),la=this._renderer.getActiveMipmapLevel(),ca=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const d=this._allocateTargets();return d.depthBuffer=!0,this._sceneToCubeUV(e,i,s,d,l),t>0&&this._blur(d,0,0,t),this._applyPMREM(d),this._cleanup(d),d}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Pl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Cl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(aa,oa,la),this._renderer.xr.enabled=ca,e.scissorTest=!1,sr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ts||e.mapping===ns?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),aa=this._renderer.getRenderTarget(),oa=this._renderer.getActiveCubeFace(),la=this._renderer.getActiveMipmapLevel(),ca=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:_n,minFilter:_n,generateMipmaps:!1,type:Ds,format:xn,colorSpace:is,depthBuffer:!1},s=Rl(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Rl(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Cm(r)),this._blurMaterial=Pm(r,e,t)}return s}_compileMaterial(e){const t=new yn(this._lodPlanes[0],e);this._renderer.compile(t,ra)}_sceneToCubeUV(e,t,i,s,r){const d=new pn(90,1,t,i),h=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,p=u.autoClear,m=u.toneMapping;u.getClearColor(Tl),u.toneMapping=ei,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));const x=new To({name:"PMREM.Background",side:$t,depthWrite:!1,depthTest:!1}),g=new yn(new Fs,x);let f=!1;const w=e.background;w?w.isColor&&(x.color.copy(w),e.background=null,f=!0):(x.color.copy(Tl),f=!0);for(let E=0;E<6;E++){const b=E%3;b===0?(d.up.set(0,h[E],0),d.position.set(r.x,r.y,r.z),d.lookAt(r.x+c[E],r.y,r.z)):b===1?(d.up.set(0,0,h[E]),d.position.set(r.x,r.y,r.z),d.lookAt(r.x,r.y+c[E],r.z)):(d.up.set(0,h[E],0),d.position.set(r.x,r.y,r.z),d.lookAt(r.x,r.y,r.z+c[E]));const A=this._cubeSize;sr(s,b*A,E>2?A:0,A,A),u.setRenderTarget(s),f&&u.render(g,d),u.render(e,d)}g.geometry.dispose(),g.material.dispose(),u.toneMapping=m,u.autoClear=p,e.background=w}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===ts||e.mapping===ns;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Pl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Cl());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new yn(this._lodPlanes[0],r),l=r.uniforms;l.envMap.value=e;const d=this._cubeSize;sr(t,0,0,3*d,2*d),i.setRenderTarget(t),i.render(o,ra)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),l=wl[(s-r-1)%wl.length];this._blur(e,r-1,r,o,l)}t.autoClear=i}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,l){const d=this._renderer,h=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const c=3,u=new yn(this._lodPlanes[s],h),p=h.uniforms,m=this._sizeLods[i]-1,_=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*pi-1),x=r/_,g=isFinite(r)?1+Math.floor(c*x):pi;g>pi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${pi}`);const f=[];let w=0;for(let N=0;N<pi;++N){const R=N/x,S=Math.exp(-R*R/2);f.push(S),N===0?w+=S:N<g&&(w+=2*S)}for(let N=0;N<f.length;N++)f[N]=f[N]/w;p.envMap.value=e.texture,p.samples.value=g,p.weights.value=f,p.latitudinal.value=o==="latitudinal",l&&(p.poleAxis.value=l);const{_lodMax:E}=this;p.dTheta.value=_,p.mipInt.value=E-i;const b=this._sizeLods[s],A=3*b*(s>E-qi?s-E+qi:0),P=4*(this._cubeSize-b);sr(t,A,P,3*b,2*b),d.setRenderTarget(t),d.render(u,ra)}}function Cm(n){const e=[],t=[],i=[];let s=n;const r=n-qi+1+El.length;for(let o=0;o<r;o++){const l=Math.pow(2,s);t.push(l);let d=1/l;o>n-qi?d=El[o-n+qi-1]:o===0&&(d=0),i.push(d);const h=1/(l-2),c=-h,u=1+h,p=[c,c,u,c,u,u,c,c,u,u,c,u],m=6,_=6,x=3,g=2,f=1,w=new Float32Array(x*_*m),E=new Float32Array(g*_*m),b=new Float32Array(f*_*m);for(let P=0;P<m;P++){const N=P%3*2/3-1,R=P>2?0:-1,S=[N,R,0,N+2/3,R,0,N+2/3,R+1,0,N,R,0,N+2/3,R+1,0,N,R+1,0];w.set(S,x*_*P),E.set(p,g*_*P);const y=[P,P,P,P,P,P];b.set(y,f*_*P)}const A=new wi;A.setAttribute("position",new bn(w,x)),A.setAttribute("uv",new bn(E,g)),A.setAttribute("faceIndex",new bn(b,f)),e.push(A),s>qi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Rl(n,e,t){const i=new Ei(n,e,t);return i.texture.mapping=Cr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function sr(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Pm(n,e,t){const i=new Float32Array(pi),s=new W(0,1,0);return new ni({name:"SphericalGaussianBlur",defines:{n:pi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:wo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function Cl(){return new ni({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:wo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function Pl(){return new ni({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:wo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function wo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Nm(n){let e=new WeakMap,t=null;function i(l){if(l&&l.isTexture){const d=l.mapping,h=d===Da||d===La,c=d===ts||d===ns;if(h||c){let u=e.get(l);const p=u!==void 0?u.texture.pmremVersion:0;if(l.isRenderTargetTexture&&l.pmremVersion!==p)return t===null&&(t=new Al(n)),u=h?t.fromEquirectangular(l,u):t.fromCubemap(l,u),u.texture.pmremVersion=l.pmremVersion,e.set(l,u),u.texture;if(u!==void 0)return u.texture;{const m=l.image;return h&&m&&m.height>0||c&&m&&s(m)?(t===null&&(t=new Al(n)),u=h?t.fromEquirectangular(l):t.fromCubemap(l),u.texture.pmremVersion=l.pmremVersion,e.set(l,u),l.addEventListener("dispose",r),u.texture):null}}}return l}function s(l){let d=0;const h=6;for(let c=0;c<h;c++)l[c]!==void 0&&d++;return d===h}function r(l){const d=l.target;d.removeEventListener("dispose",r);const h=e.get(d);h!==void 0&&(e.delete(d),h.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function Dm(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&Ji("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function Lm(n,e,t,i){const s={},r=new WeakMap;function o(u){const p=u.target;p.index!==null&&e.remove(p.index);for(const _ in p.attributes)e.remove(p.attributes[_]);p.removeEventListener("dispose",o),delete s[p.id];const m=r.get(p);m&&(e.remove(m),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function l(u,p){return s[p.id]===!0||(p.addEventListener("dispose",o),s[p.id]=!0,t.memory.geometries++),p}function d(u){const p=u.attributes;for(const m in p)e.update(p[m],n.ARRAY_BUFFER)}function h(u){const p=[],m=u.index,_=u.attributes.position;let x=0;if(m!==null){const w=m.array;x=m.version;for(let E=0,b=w.length;E<b;E+=3){const A=w[E+0],P=w[E+1],N=w[E+2];p.push(A,P,P,N,N,A)}}else if(_!==void 0){const w=_.array;x=_.version;for(let E=0,b=w.length/3-1;E<b;E+=3){const A=E+0,P=E+1,N=E+2;p.push(A,P,P,N,N,A)}}else return;const g=new(Nc(p)?Fc:Uc)(p,1);g.version=x;const f=r.get(u);f&&e.remove(f),r.set(u,g)}function c(u){const p=r.get(u);if(p){const m=u.index;m!==null&&p.version<m.version&&h(u)}else h(u);return r.get(u)}return{get:l,update:d,getWireframeAttribute:c}}function Im(n,e,t){let i;function s(p){i=p}let r,o;function l(p){r=p.type,o=p.bytesPerElement}function d(p,m){n.drawElements(i,m,r,p*o),t.update(m,i,1)}function h(p,m,_){_!==0&&(n.drawElementsInstanced(i,m,r,p*o,_),t.update(m,i,_))}function c(p,m,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,m,0,r,p,0,_);let g=0;for(let f=0;f<_;f++)g+=m[f];t.update(g,i,1)}function u(p,m,_,x){if(_===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let f=0;f<p.length;f++)h(p[f]/o,m[f],x[f]);else{g.multiDrawElementsInstancedWEBGL(i,m,0,r,p,0,x,0,_);let f=0;for(let w=0;w<_;w++)f+=m[w]*x[w];t.update(f,i,1)}}this.setMode=s,this.setIndex=l,this.render=d,this.renderInstances=h,this.renderMultiDraw=c,this.renderMultiDrawInstances=u}function Um(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,l){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=l*(r/3);break;case n.LINES:t.lines+=l*(r/2);break;case n.LINE_STRIP:t.lines+=l*(r-1);break;case n.LINE_LOOP:t.lines+=l*r;break;case n.POINTS:t.points+=l*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Fm(n,e,t){const i=new WeakMap,s=new wt;function r(o,l,d){const h=o.morphTargetInfluences,c=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,u=c!==void 0?c.length:0;let p=i.get(l);if(p===void 0||p.count!==u){let S=function(){N.dispose(),i.delete(l),l.removeEventListener("dispose",S)};p!==void 0&&p.texture.dispose();const m=l.morphAttributes.position!==void 0,_=l.morphAttributes.normal!==void 0,x=l.morphAttributes.color!==void 0,g=l.morphAttributes.position||[],f=l.morphAttributes.normal||[],w=l.morphAttributes.color||[];let E=0;m===!0&&(E=1),_===!0&&(E=2),x===!0&&(E=3);let b=l.attributes.position.count*E,A=1;b>e.maxTextureSize&&(A=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);const P=new Float32Array(b*A*4*u),N=new Dc(P,b,A,u);N.type=In,N.needsUpdate=!0;const R=E*4;for(let y=0;y<u;y++){const C=g[y],z=f[y],B=w[y],k=b*A*4*y;for(let ee=0;ee<C.count;ee++){const $=ee*R;m===!0&&(s.fromBufferAttribute(C,ee),P[k+$+0]=s.x,P[k+$+1]=s.y,P[k+$+2]=s.z,P[k+$+3]=0),_===!0&&(s.fromBufferAttribute(z,ee),P[k+$+4]=s.x,P[k+$+5]=s.y,P[k+$+6]=s.z,P[k+$+7]=0),x===!0&&(s.fromBufferAttribute(B,ee),P[k+$+8]=s.x,P[k+$+9]=s.y,P[k+$+10]=s.z,P[k+$+11]=B.itemSize===4?s.w:1)}}p={count:u,texture:N,size:new pt(b,A)},i.set(l,p),l.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)d.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let m=0;for(let x=0;x<h.length;x++)m+=h[x];const _=l.morphTargetsRelative?1:1-m;d.getUniforms().setValue(n,"morphTargetBaseInfluence",_),d.getUniforms().setValue(n,"morphTargetInfluences",h)}d.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),d.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:r}}function Bm(n,e,t,i){let s=new WeakMap;function r(d){const h=i.render.frame,c=d.geometry,u=e.get(d,c);if(s.get(u)!==h&&(e.update(u),s.set(u,h)),d.isInstancedMesh&&(d.hasEventListener("dispose",l)===!1&&d.addEventListener("dispose",l),s.get(d)!==h&&(t.update(d.instanceMatrix,n.ARRAY_BUFFER),d.instanceColor!==null&&t.update(d.instanceColor,n.ARRAY_BUFFER),s.set(d,h))),d.isSkinnedMesh){const p=d.skeleton;s.get(p)!==h&&(p.update(),s.set(p,h))}return u}function o(){s=new WeakMap}function l(d){const h=d.target;h.removeEventListener("dispose",l),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:r,dispose:o}}const Vc=new jt,Nl=new zc(1,1),Wc=new Dc,Xc=new hu,$c=new kc,Dl=[],Ll=[],Il=new Float32Array(16),Ul=new Float32Array(9),Fl=new Float32Array(4);function as(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=Dl[s];if(r===void 0&&(r=new Float32Array(s),Dl[s]=r),e!==0){i.toArray(r,0);for(let o=1,l=0;o!==e;++o)l+=t,n[o].toArray(r,l)}return r}function Nt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Dt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Nr(n,e){let t=Ll[e];t===void 0&&(t=new Int32Array(e),Ll[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Om(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function km(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;n.uniform2fv(this.addr,e),Dt(t,e)}}function jm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Nt(t,e))return;n.uniform3fv(this.addr,e),Dt(t,e)}}function zm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;n.uniform4fv(this.addr,e),Dt(t,e)}}function Hm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Nt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Dt(t,e)}else{if(Nt(t,i))return;Fl.set(i),n.uniformMatrix2fv(this.addr,!1,Fl),Dt(t,i)}}function Gm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Nt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Dt(t,e)}else{if(Nt(t,i))return;Ul.set(i),n.uniformMatrix3fv(this.addr,!1,Ul),Dt(t,i)}}function Vm(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Nt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Dt(t,e)}else{if(Nt(t,i))return;Il.set(i),n.uniformMatrix4fv(this.addr,!1,Il),Dt(t,i)}}function Wm(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Xm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;n.uniform2iv(this.addr,e),Dt(t,e)}}function $m(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;n.uniform3iv(this.addr,e),Dt(t,e)}}function qm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;n.uniform4iv(this.addr,e),Dt(t,e)}}function Ym(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Km(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Nt(t,e))return;n.uniform2uiv(this.addr,e),Dt(t,e)}}function Zm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Nt(t,e))return;n.uniform3uiv(this.addr,e),Dt(t,e)}}function Jm(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Nt(t,e))return;n.uniform4uiv(this.addr,e),Dt(t,e)}}function Qm(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Nl.compareFunction=Pc,r=Nl):r=Vc,t.setTexture2D(e||r,s)}function eg(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Xc,s)}function tg(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||$c,s)}function ng(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Wc,s)}function ig(n){switch(n){case 5126:return Om;case 35664:return km;case 35665:return jm;case 35666:return zm;case 35674:return Hm;case 35675:return Gm;case 35676:return Vm;case 5124:case 35670:return Wm;case 35667:case 35671:return Xm;case 35668:case 35672:return $m;case 35669:case 35673:return qm;case 5125:return Ym;case 36294:return Km;case 36295:return Zm;case 36296:return Jm;case 35678:case 36198:case 36298:case 36306:case 35682:return Qm;case 35679:case 36299:case 36307:return eg;case 35680:case 36300:case 36308:case 36293:return tg;case 36289:case 36303:case 36311:case 36292:return ng}}function sg(n,e){n.uniform1fv(this.addr,e)}function rg(n,e){const t=as(e,this.size,2);n.uniform2fv(this.addr,t)}function ag(n,e){const t=as(e,this.size,3);n.uniform3fv(this.addr,t)}function og(n,e){const t=as(e,this.size,4);n.uniform4fv(this.addr,t)}function lg(n,e){const t=as(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function cg(n,e){const t=as(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function dg(n,e){const t=as(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function hg(n,e){n.uniform1iv(this.addr,e)}function ug(n,e){n.uniform2iv(this.addr,e)}function fg(n,e){n.uniform3iv(this.addr,e)}function pg(n,e){n.uniform4iv(this.addr,e)}function mg(n,e){n.uniform1uiv(this.addr,e)}function gg(n,e){n.uniform2uiv(this.addr,e)}function _g(n,e){n.uniform3uiv(this.addr,e)}function xg(n,e){n.uniform4uiv(this.addr,e)}function vg(n,e,t){const i=this.cache,s=e.length,r=Nr(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Dt(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Vc,r[o])}function Mg(n,e,t){const i=this.cache,s=e.length,r=Nr(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Dt(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Xc,r[o])}function Sg(n,e,t){const i=this.cache,s=e.length,r=Nr(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Dt(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||$c,r[o])}function yg(n,e,t){const i=this.cache,s=e.length,r=Nr(t,s);Nt(i,r)||(n.uniform1iv(this.addr,r),Dt(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Wc,r[o])}function bg(n){switch(n){case 5126:return sg;case 35664:return rg;case 35665:return ag;case 35666:return og;case 35674:return lg;case 35675:return cg;case 35676:return dg;case 5124:case 35670:return hg;case 35667:case 35671:return ug;case 35668:case 35672:return fg;case 35669:case 35673:return pg;case 5125:return mg;case 36294:return gg;case 36295:return _g;case 36296:return xg;case 35678:case 36198:case 36298:case 36306:case 35682:return vg;case 35679:case 36299:case 36307:return Mg;case 35680:case 36300:case 36308:case 36293:return Sg;case 36289:case 36303:case 36311:case 36292:return yg}}class Eg{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=ig(t.type)}}class Tg{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=bg(t.type)}}class wg{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const l=s[r];l.setValue(e,t[l.id],i)}}}const da=/(\w+)(\])?(\[|\.)?/g;function Bl(n,e){n.seq.push(e),n.map[e.id]=e}function Ag(n,e,t){const i=n.name,s=i.length;for(da.lastIndex=0;;){const r=da.exec(i),o=da.lastIndex;let l=r[1];const d=r[2]==="]",h=r[3];if(d&&(l=l|0),h===void 0||h==="["&&o+2===s){Bl(t,h===void 0?new Eg(l,n,e):new Tg(l,n,e));break}else{let u=t.map[l];u===void 0&&(u=new wg(l),Bl(t,u)),t=u}}}class _r{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Ag(r,o,this)}}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const l=t[r],d=i[l.id];d.needsUpdate!==!1&&l.setValue(e,d.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function Ol(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Rg=37297;let Cg=0;function Pg(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const l=o+1;i.push(`${l===e?">":" "} ${l}: ${t[o]}`)}return i.join(`
`)}const kl=new Xe;function Ng(n){nt._getMatrix(kl,nt.workingColorSpace,n);const e=`mat3( ${kl.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(n)){case Tr:return[e,"LinearTransferOETF"];case ut:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function jl(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const l=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Pg(n.getShaderSource(e),l)}else return r}function Dg(n,e){const t=Ng(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Lg(n,e){let t;switch(e){case Oh:t="Linear";break;case kh:t="Reinhard";break;case jh:t="Cineon";break;case zh:t="ACESFilmic";break;case Gh:t="AgX";break;case Vh:t="Neutral";break;case Hh:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const rr=new W;function Ig(){nt.getLuminanceCoefficients(rr);const n=rr.x.toFixed(4),e=rr.y.toFixed(4),t=rr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ug(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Es).join(`
`)}function Fg(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Bg(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let l=1;r.type===n.FLOAT_MAT2&&(l=2),r.type===n.FLOAT_MAT3&&(l=3),r.type===n.FLOAT_MAT4&&(l=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:l}}return t}function Es(n){return n!==""}function zl(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Hl(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Og=/^[ \t]*#include +<([\w\d./]+)>/gm;function co(n){return n.replace(Og,jg)}const kg=new Map;function jg(n,e){let t=$e[e];if(t===void 0){const i=kg.get(e);if(i!==void 0)t=$e[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return co(t)}const zg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gl(n){return n.replace(zg,Hg)}function Hg(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Vl(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Gg(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===vc?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===_h?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===Pn&&(e="SHADOWMAP_TYPE_VSM"),e}function Vg(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ts:case ns:e="ENVMAP_TYPE_CUBE";break;case Cr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Wg(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case ns:e="ENVMAP_MODE_REFRACTION";break}return e}function Xg(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Mc:e="ENVMAP_BLENDING_MULTIPLY";break;case Fh:e="ENVMAP_BLENDING_MIX";break;case Bh:e="ENVMAP_BLENDING_ADD";break}return e}function $g(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function qg(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,l=t.fragmentShader;const d=Gg(t),h=Vg(t),c=Wg(t),u=Xg(t),p=$g(t),m=Ug(t),_=Fg(r),x=s.createProgram();let g,f,w=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Es).join(`
`),g.length>0&&(g+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(Es).join(`
`),f.length>0&&(f+=`
`)):(g=[Vl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reversedDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Es).join(`
`),f=[Vl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+d:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reversedDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ei?"#define TONE_MAPPING":"",t.toneMapping!==ei?$e.tonemapping_pars_fragment:"",t.toneMapping!==ei?Lg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,Dg("linearToOutputTexel",t.outputColorSpace),Ig(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Es).join(`
`)),o=co(o),o=zl(o,t),o=Hl(o,t),l=co(l),l=zl(l,t),l=Hl(l,t),o=Gl(o),l=Gl(l),t.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,g=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,f=["#define varying in",t.glslVersion===rl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===rl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);const E=w+g+o,b=w+f+l,A=Ol(s,s.VERTEX_SHADER,E),P=Ol(s,s.FRAGMENT_SHADER,b);s.attachShader(x,A),s.attachShader(x,P),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function N(C){if(n.debug.checkShaderErrors){const z=s.getProgramInfoLog(x)||"",B=s.getShaderInfoLog(A)||"",k=s.getShaderInfoLog(P)||"",ee=z.trim(),$=B.trim(),q=k.trim();let H=!0,ie=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(H=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,A,P);else{const he=jl(s,A,"vertex"),X=jl(s,P,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+ee+`
`+he+`
`+X)}else ee!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ee):($===""||q==="")&&(ie=!1);ie&&(C.diagnostics={runnable:H,programLog:ee,vertexShader:{log:$,prefix:g},fragmentShader:{log:q,prefix:f}})}s.deleteShader(A),s.deleteShader(P),R=new _r(s,x),S=Bg(s,x)}let R;this.getUniforms=function(){return R===void 0&&N(this),R};let S;this.getAttributes=function(){return S===void 0&&N(this),S};let y=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return y===!1&&(y=s.getProgramParameter(x,Rg)),y},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Cg++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=A,this.fragmentShader=P,this}let Yg=0;class Kg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Zg(e),t.set(e,i)),i}}class Zg{constructor(e){this.id=Yg++,this.code=e,this.usedTimes=0}}function Jg(n,e,t,i,s,r,o){const l=new Lc,d=new Kg,h=new Set,c=[],u=s.logarithmicDepthBuffer,p=s.vertexTextures;let m=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(S){return h.add(S),S===0?"uv":`uv${S}`}function g(S,y,C,z,B){const k=z.fog,ee=B.geometry,$=S.isMeshStandardMaterial?z.environment:null,q=(S.isMeshStandardMaterial?t:e).get(S.envMap||$),H=q&&q.mapping===Cr?q.image.height:null,ie=_[S.type];S.precision!==null&&(m=s.getMaxPrecision(S.precision),m!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",m,"instead."));const he=ee.morphAttributes.position||ee.morphAttributes.normal||ee.morphAttributes.color,X=he!==void 0?he.length:0;let te=0;ee.morphAttributes.position!==void 0&&(te=1),ee.morphAttributes.normal!==void 0&&(te=2),ee.morphAttributes.color!==void 0&&(te=3);let _e,ue,O,Q;if(ie){const et=Mn[ie];_e=et.vertexShader,ue=et.fragmentShader}else _e=S.vertexShader,ue=S.fragmentShader,d.update(S),O=d.getVertexShaderID(S),Q=d.getFragmentShaderID(S);const Z=n.getRenderTarget(),ge=n.state.buffers.depth.getReversed(),ye=B.isInstancedMesh===!0,Le=B.isBatchedMesh===!0,Ze=!!S.map,We=!!S.matcap,D=!!q,it=!!S.aoMap,De=!!S.lightMap,qe=!!S.bumpMap,Re=!!S.normalMap,Je=!!S.displacementMap,me=!!S.emissiveMap,Fe=!!S.metalnessMap,Qe=!!S.roughnessMap,lt=S.anisotropy>0,T=S.clearcoat>0,v=S.dispersion>0,j=S.iridescence>0,J=S.sheen>0,re=S.transmission>0,Y=lt&&!!S.anisotropyMap,Ne=T&&!!S.clearcoatMap,fe=T&&!!S.clearcoatNormalMap,we=T&&!!S.clearcoatRoughnessMap,Ce=j&&!!S.iridescenceMap,ae=j&&!!S.iridescenceThicknessMap,Me=J&&!!S.sheenColorMap,Oe=J&&!!S.sheenRoughnessMap,Pe=!!S.specularMap,xe=!!S.specularColorMap,Ve=!!S.specularIntensityMap,I=re&&!!S.transmissionMap,de=re&&!!S.thicknessMap,pe=!!S.gradientMap,be=!!S.alphaMap,le=S.alphaTest>0,ne=!!S.alphaHash,Te=!!S.extensions;let Ge=ei;S.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(Ge=n.toneMapping);const at={shaderID:ie,shaderType:S.type,shaderName:S.name,vertexShader:_e,fragmentShader:ue,defines:S.defines,customVertexShaderID:O,customFragmentShaderID:Q,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:m,batching:Le,batchingColor:Le&&B._colorsTexture!==null,instancing:ye,instancingColor:ye&&B.instanceColor!==null,instancingMorph:ye&&B.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:Z===null?n.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:is,alphaToCoverage:!!S.alphaToCoverage,map:Ze,matcap:We,envMap:D,envMapMode:D&&q.mapping,envMapCubeUVHeight:H,aoMap:it,lightMap:De,bumpMap:qe,normalMap:Re,displacementMap:p&&Je,emissiveMap:me,normalMapObjectSpace:Re&&S.normalMapType===Yh,normalMapTangentSpace:Re&&S.normalMapType===qh,metalnessMap:Fe,roughnessMap:Qe,anisotropy:lt,anisotropyMap:Y,clearcoat:T,clearcoatMap:Ne,clearcoatNormalMap:fe,clearcoatRoughnessMap:we,dispersion:v,iridescence:j,iridescenceMap:Ce,iridescenceThicknessMap:ae,sheen:J,sheenColorMap:Me,sheenRoughnessMap:Oe,specularMap:Pe,specularColorMap:xe,specularIntensityMap:Ve,transmission:re,transmissionMap:I,thicknessMap:de,gradientMap:pe,opaque:S.transparent===!1&&S.blending===Zi&&S.alphaToCoverage===!1,alphaMap:be,alphaTest:le,alphaHash:ne,combine:S.combine,mapUv:Ze&&x(S.map.channel),aoMapUv:it&&x(S.aoMap.channel),lightMapUv:De&&x(S.lightMap.channel),bumpMapUv:qe&&x(S.bumpMap.channel),normalMapUv:Re&&x(S.normalMap.channel),displacementMapUv:Je&&x(S.displacementMap.channel),emissiveMapUv:me&&x(S.emissiveMap.channel),metalnessMapUv:Fe&&x(S.metalnessMap.channel),roughnessMapUv:Qe&&x(S.roughnessMap.channel),anisotropyMapUv:Y&&x(S.anisotropyMap.channel),clearcoatMapUv:Ne&&x(S.clearcoatMap.channel),clearcoatNormalMapUv:fe&&x(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:we&&x(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Ce&&x(S.iridescenceMap.channel),iridescenceThicknessMapUv:ae&&x(S.iridescenceThicknessMap.channel),sheenColorMapUv:Me&&x(S.sheenColorMap.channel),sheenRoughnessMapUv:Oe&&x(S.sheenRoughnessMap.channel),specularMapUv:Pe&&x(S.specularMap.channel),specularColorMapUv:xe&&x(S.specularColorMap.channel),specularIntensityMapUv:Ve&&x(S.specularIntensityMap.channel),transmissionMapUv:I&&x(S.transmissionMap.channel),thicknessMapUv:de&&x(S.thicknessMap.channel),alphaMapUv:be&&x(S.alphaMap.channel),vertexTangents:!!ee.attributes.tangent&&(Re||lt),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!ee.attributes.color&&ee.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!ee.attributes.uv&&(Ze||be),fog:!!k,useFog:S.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ge,skinning:B.isSkinnedMesh===!0,morphTargets:ee.morphAttributes.position!==void 0,morphNormals:ee.morphAttributes.normal!==void 0,morphColors:ee.morphAttributes.color!==void 0,morphTargetsCount:X,morphTextureStride:te,numDirLights:y.directional.length,numPointLights:y.point.length,numSpotLights:y.spot.length,numSpotLightMaps:y.spotLightMap.length,numRectAreaLights:y.rectArea.length,numHemiLights:y.hemi.length,numDirLightShadows:y.directionalShadowMap.length,numPointLightShadows:y.pointShadowMap.length,numSpotLightShadows:y.spotShadowMap.length,numSpotLightShadowsWithMaps:y.numSpotLightShadowsWithMaps,numLightProbes:y.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:n.shadowMap.enabled&&C.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ge,decodeVideoTexture:Ze&&S.map.isVideoTexture===!0&&nt.getTransfer(S.map.colorSpace)===ut,decodeVideoTextureEmissive:me&&S.emissiveMap.isVideoTexture===!0&&nt.getTransfer(S.emissiveMap.colorSpace)===ut,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Ln,flipSided:S.side===$t,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Te&&S.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Te&&S.extensions.multiDraw===!0||Le)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return at.vertexUv1s=h.has(1),at.vertexUv2s=h.has(2),at.vertexUv3s=h.has(3),h.clear(),at}function f(S){const y=[];if(S.shaderID?y.push(S.shaderID):(y.push(S.customVertexShaderID),y.push(S.customFragmentShaderID)),S.defines!==void 0)for(const C in S.defines)y.push(C),y.push(S.defines[C]);return S.isRawShaderMaterial===!1&&(w(y,S),E(y,S),y.push(n.outputColorSpace)),y.push(S.customProgramCacheKey),y.join()}function w(S,y){S.push(y.precision),S.push(y.outputColorSpace),S.push(y.envMapMode),S.push(y.envMapCubeUVHeight),S.push(y.mapUv),S.push(y.alphaMapUv),S.push(y.lightMapUv),S.push(y.aoMapUv),S.push(y.bumpMapUv),S.push(y.normalMapUv),S.push(y.displacementMapUv),S.push(y.emissiveMapUv),S.push(y.metalnessMapUv),S.push(y.roughnessMapUv),S.push(y.anisotropyMapUv),S.push(y.clearcoatMapUv),S.push(y.clearcoatNormalMapUv),S.push(y.clearcoatRoughnessMapUv),S.push(y.iridescenceMapUv),S.push(y.iridescenceThicknessMapUv),S.push(y.sheenColorMapUv),S.push(y.sheenRoughnessMapUv),S.push(y.specularMapUv),S.push(y.specularColorMapUv),S.push(y.specularIntensityMapUv),S.push(y.transmissionMapUv),S.push(y.thicknessMapUv),S.push(y.combine),S.push(y.fogExp2),S.push(y.sizeAttenuation),S.push(y.morphTargetsCount),S.push(y.morphAttributeCount),S.push(y.numDirLights),S.push(y.numPointLights),S.push(y.numSpotLights),S.push(y.numSpotLightMaps),S.push(y.numHemiLights),S.push(y.numRectAreaLights),S.push(y.numDirLightShadows),S.push(y.numPointLightShadows),S.push(y.numSpotLightShadows),S.push(y.numSpotLightShadowsWithMaps),S.push(y.numLightProbes),S.push(y.shadowMapType),S.push(y.toneMapping),S.push(y.numClippingPlanes),S.push(y.numClipIntersection),S.push(y.depthPacking)}function E(S,y){l.disableAll(),y.supportsVertexTextures&&l.enable(0),y.instancing&&l.enable(1),y.instancingColor&&l.enable(2),y.instancingMorph&&l.enable(3),y.matcap&&l.enable(4),y.envMap&&l.enable(5),y.normalMapObjectSpace&&l.enable(6),y.normalMapTangentSpace&&l.enable(7),y.clearcoat&&l.enable(8),y.iridescence&&l.enable(9),y.alphaTest&&l.enable(10),y.vertexColors&&l.enable(11),y.vertexAlphas&&l.enable(12),y.vertexUv1s&&l.enable(13),y.vertexUv2s&&l.enable(14),y.vertexUv3s&&l.enable(15),y.vertexTangents&&l.enable(16),y.anisotropy&&l.enable(17),y.alphaHash&&l.enable(18),y.batching&&l.enable(19),y.dispersion&&l.enable(20),y.batchingColor&&l.enable(21),y.gradientMap&&l.enable(22),S.push(l.mask),l.disableAll(),y.fog&&l.enable(0),y.useFog&&l.enable(1),y.flatShading&&l.enable(2),y.logarithmicDepthBuffer&&l.enable(3),y.reversedDepthBuffer&&l.enable(4),y.skinning&&l.enable(5),y.morphTargets&&l.enable(6),y.morphNormals&&l.enable(7),y.morphColors&&l.enable(8),y.premultipliedAlpha&&l.enable(9),y.shadowMapEnabled&&l.enable(10),y.doubleSided&&l.enable(11),y.flipSided&&l.enable(12),y.useDepthPacking&&l.enable(13),y.dithering&&l.enable(14),y.transmission&&l.enable(15),y.sheen&&l.enable(16),y.opaque&&l.enable(17),y.pointsUvs&&l.enable(18),y.decodeVideoTexture&&l.enable(19),y.decodeVideoTextureEmissive&&l.enable(20),y.alphaToCoverage&&l.enable(21),S.push(l.mask)}function b(S){const y=_[S.type];let C;if(y){const z=Mn[y];C=Tu.clone(z.uniforms)}else C=S.uniforms;return C}function A(S,y){let C;for(let z=0,B=c.length;z<B;z++){const k=c[z];if(k.cacheKey===y){C=k,++C.usedTimes;break}}return C===void 0&&(C=new qg(n,y,S,r),c.push(C)),C}function P(S){if(--S.usedTimes===0){const y=c.indexOf(S);c[y]=c[c.length-1],c.pop(),S.destroy()}}function N(S){d.remove(S)}function R(){d.dispose()}return{getParameters:g,getProgramCacheKey:f,getUniforms:b,acquireProgram:A,releaseProgram:P,releaseShaderCache:N,programs:c,dispose:R}}function Qg(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let l=n.get(o);return l===void 0&&(l={},n.set(o,l)),l}function i(o){n.delete(o)}function s(o,l,d){n.get(o)[l]=d}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function e_(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Wl(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Xl(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(u,p,m,_,x,g){let f=n[e];return f===void 0?(f={id:u.id,object:u,geometry:p,material:m,groupOrder:_,renderOrder:u.renderOrder,z:x,group:g},n[e]=f):(f.id=u.id,f.object=u,f.geometry=p,f.material=m,f.groupOrder=_,f.renderOrder=u.renderOrder,f.z=x,f.group=g),e++,f}function l(u,p,m,_,x,g){const f=o(u,p,m,_,x,g);m.transmission>0?i.push(f):m.transparent===!0?s.push(f):t.push(f)}function d(u,p,m,_,x,g){const f=o(u,p,m,_,x,g);m.transmission>0?i.unshift(f):m.transparent===!0?s.unshift(f):t.unshift(f)}function h(u,p){t.length>1&&t.sort(u||e_),i.length>1&&i.sort(p||Wl),s.length>1&&s.sort(p||Wl)}function c(){for(let u=e,p=n.length;u<p;u++){const m=n[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:d,finish:c,sort:h}}function t_(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new Xl,n.set(i,[o])):s>=r.length?(o=new Xl,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function n_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new W,color:new ot};break;case"SpotLight":t={position:new W,direction:new W,color:new ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new W,color:new ot,distance:0,decay:0};break;case"HemisphereLight":t={direction:new W,skyColor:new ot,groundColor:new ot};break;case"RectAreaLight":t={color:new ot,position:new W,halfWidth:new W,halfHeight:new W};break}return n[e.id]=t,t}}}function i_(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let s_=0;function r_(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function a_(n){const e=new n_,t=i_(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)i.probe.push(new W);const s=new W,r=new Pt,o=new Pt;function l(h){let c=0,u=0,p=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let m=0,_=0,x=0,g=0,f=0,w=0,E=0,b=0,A=0,P=0,N=0;h.sort(r_);for(let S=0,y=h.length;S<y;S++){const C=h[S],z=C.color,B=C.intensity,k=C.distance,ee=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)c+=z.r*B,u+=z.g*B,p+=z.b*B;else if(C.isLightProbe){for(let $=0;$<9;$++)i.probe[$].addScaledVector(C.sh.coefficients[$],B);N++}else if(C.isDirectionalLight){const $=e.get(C);if($.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const q=C.shadow,H=t.get(C);H.shadowIntensity=q.intensity,H.shadowBias=q.bias,H.shadowNormalBias=q.normalBias,H.shadowRadius=q.radius,H.shadowMapSize=q.mapSize,i.directionalShadow[m]=H,i.directionalShadowMap[m]=ee,i.directionalShadowMatrix[m]=C.shadow.matrix,w++}i.directional[m]=$,m++}else if(C.isSpotLight){const $=e.get(C);$.position.setFromMatrixPosition(C.matrixWorld),$.color.copy(z).multiplyScalar(B),$.distance=k,$.coneCos=Math.cos(C.angle),$.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),$.decay=C.decay,i.spot[x]=$;const q=C.shadow;if(C.map&&(i.spotLightMap[A]=C.map,A++,q.updateMatrices(C),C.castShadow&&P++),i.spotLightMatrix[x]=q.matrix,C.castShadow){const H=t.get(C);H.shadowIntensity=q.intensity,H.shadowBias=q.bias,H.shadowNormalBias=q.normalBias,H.shadowRadius=q.radius,H.shadowMapSize=q.mapSize,i.spotShadow[x]=H,i.spotShadowMap[x]=ee,b++}x++}else if(C.isRectAreaLight){const $=e.get(C);$.color.copy(z).multiplyScalar(B),$.halfWidth.set(C.width*.5,0,0),$.halfHeight.set(0,C.height*.5,0),i.rectArea[g]=$,g++}else if(C.isPointLight){const $=e.get(C);if($.color.copy(C.color).multiplyScalar(C.intensity),$.distance=C.distance,$.decay=C.decay,C.castShadow){const q=C.shadow,H=t.get(C);H.shadowIntensity=q.intensity,H.shadowBias=q.bias,H.shadowNormalBias=q.normalBias,H.shadowRadius=q.radius,H.shadowMapSize=q.mapSize,H.shadowCameraNear=q.camera.near,H.shadowCameraFar=q.camera.far,i.pointShadow[_]=H,i.pointShadowMap[_]=ee,i.pointShadowMatrix[_]=C.shadow.matrix,E++}i.point[_]=$,_++}else if(C.isHemisphereLight){const $=e.get(C);$.skyColor.copy(C.color).multiplyScalar(B),$.groundColor.copy(C.groundColor).multiplyScalar(B),i.hemi[f]=$,f++}}g>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ve.LTC_FLOAT_1,i.rectAreaLTC2=ve.LTC_FLOAT_2):(i.rectAreaLTC1=ve.LTC_HALF_1,i.rectAreaLTC2=ve.LTC_HALF_2)),i.ambient[0]=c,i.ambient[1]=u,i.ambient[2]=p;const R=i.hash;(R.directionalLength!==m||R.pointLength!==_||R.spotLength!==x||R.rectAreaLength!==g||R.hemiLength!==f||R.numDirectionalShadows!==w||R.numPointShadows!==E||R.numSpotShadows!==b||R.numSpotMaps!==A||R.numLightProbes!==N)&&(i.directional.length=m,i.spot.length=x,i.rectArea.length=g,i.point.length=_,i.hemi.length=f,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=b+A-P,i.spotLightMap.length=A,i.numSpotLightShadowsWithMaps=P,i.numLightProbes=N,R.directionalLength=m,R.pointLength=_,R.spotLength=x,R.rectAreaLength=g,R.hemiLength=f,R.numDirectionalShadows=w,R.numPointShadows=E,R.numSpotShadows=b,R.numSpotMaps=A,R.numLightProbes=N,i.version=s_++)}function d(h,c){let u=0,p=0,m=0,_=0,x=0;const g=c.matrixWorldInverse;for(let f=0,w=h.length;f<w;f++){const E=h[f];if(E.isDirectionalLight){const b=i.directional[u];b.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(g),u++}else if(E.isSpotLight){const b=i.spot[m];b.position.setFromMatrixPosition(E.matrixWorld),b.position.applyMatrix4(g),b.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(g),m++}else if(E.isRectAreaLight){const b=i.rectArea[_];b.position.setFromMatrixPosition(E.matrixWorld),b.position.applyMatrix4(g),o.identity(),r.copy(E.matrixWorld),r.premultiply(g),o.extractRotation(r),b.halfWidth.set(E.width*.5,0,0),b.halfHeight.set(0,E.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),_++}else if(E.isPointLight){const b=i.point[p];b.position.setFromMatrixPosition(E.matrixWorld),b.position.applyMatrix4(g),p++}else if(E.isHemisphereLight){const b=i.hemi[x];b.direction.setFromMatrixPosition(E.matrixWorld),b.direction.transformDirection(g),x++}}}return{setup:l,setupView:d,state:i}}function $l(n){const e=new a_(n),t=[],i=[];function s(c){h.camera=c,t.length=0,i.length=0}function r(c){t.push(c)}function o(c){i.push(c)}function l(){e.setup(t)}function d(c){e.setupView(t,c)}const h={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:h,setupLights:l,setupLightsView:d,pushLight:r,pushShadow:o}}function o_(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let l;return o===void 0?(l=new $l(n),e.set(s,[l])):r>=o.length?(l=new $l(n),o.push(l)):l=o[r],l}function i(){e=new WeakMap}return{get:t,dispose:i}}const l_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,c_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function d_(n,e,t){let i=new jc;const s=new pt,r=new pt,o=new wt,l=new Fu({depthPacking:$h}),d=new Bu,h={},c=t.maxTextureSize,u={[ti]:$t,[$t]:ti,[Ln]:Ln},p=new ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:l_,fragmentShader:c_}),m=p.clone();m.defines.HORIZONTAL_PASS=1;const _=new wi;_.setAttribute("position",new bn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new yn(_,p),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=vc;let f=this.type;this.render=function(P,N,R){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||P.length===0)return;const S=n.getRenderTarget(),y=n.getActiveCubeFace(),C=n.getActiveMipmapLevel(),z=n.state;z.setBlending(Qn),z.buffers.depth.getReversed()?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const B=f!==Pn&&this.type===Pn,k=f===Pn&&this.type!==Pn;for(let ee=0,$=P.length;ee<$;ee++){const q=P[ee],H=q.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",q,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);const ie=H.getFrameExtents();if(s.multiply(ie),r.copy(H.mapSize),(s.x>c||s.y>c)&&(s.x>c&&(r.x=Math.floor(c/ie.x),s.x=r.x*ie.x,H.mapSize.x=r.x),s.y>c&&(r.y=Math.floor(c/ie.y),s.y=r.y*ie.y,H.mapSize.y=r.y)),H.map===null||B===!0||k===!0){const X=this.type!==Pn?{minFilter:vn,magFilter:vn}:{};H.map!==null&&H.map.dispose(),H.map=new Ei(s.x,s.y,X),H.map.texture.name=q.name+".shadowMap",H.camera.updateProjectionMatrix()}n.setRenderTarget(H.map),n.clear();const he=H.getViewportCount();for(let X=0;X<he;X++){const te=H.getViewport(X);o.set(r.x*te.x,r.y*te.y,r.x*te.z,r.y*te.w),z.viewport(o),H.updateMatrices(q,X),i=H.getFrustum(),b(N,R,H.camera,q,this.type)}H.isPointLightShadow!==!0&&this.type===Pn&&w(H,R),H.needsUpdate=!1}f=this.type,g.needsUpdate=!1,n.setRenderTarget(S,y,C)};function w(P,N){const R=e.update(x);p.defines.VSM_SAMPLES!==P.blurSamples&&(p.defines.VSM_SAMPLES=P.blurSamples,m.defines.VSM_SAMPLES=P.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),P.mapPass===null&&(P.mapPass=new Ei(s.x,s.y)),p.uniforms.shadow_pass.value=P.map.texture,p.uniforms.resolution.value=P.mapSize,p.uniforms.radius.value=P.radius,n.setRenderTarget(P.mapPass),n.clear(),n.renderBufferDirect(N,null,R,p,x,null),m.uniforms.shadow_pass.value=P.mapPass.texture,m.uniforms.resolution.value=P.mapSize,m.uniforms.radius.value=P.radius,n.setRenderTarget(P.map),n.clear(),n.renderBufferDirect(N,null,R,m,x,null)}function E(P,N,R,S){let y=null;const C=R.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(C!==void 0)y=C;else if(y=R.isPointLight===!0?d:l,n.localClippingEnabled&&N.clipShadows===!0&&Array.isArray(N.clippingPlanes)&&N.clippingPlanes.length!==0||N.displacementMap&&N.displacementScale!==0||N.alphaMap&&N.alphaTest>0||N.map&&N.alphaTest>0||N.alphaToCoverage===!0){const z=y.uuid,B=N.uuid;let k=h[z];k===void 0&&(k={},h[z]=k);let ee=k[B];ee===void 0&&(ee=y.clone(),k[B]=ee,N.addEventListener("dispose",A)),y=ee}if(y.visible=N.visible,y.wireframe=N.wireframe,S===Pn?y.side=N.shadowSide!==null?N.shadowSide:N.side:y.side=N.shadowSide!==null?N.shadowSide:u[N.side],y.alphaMap=N.alphaMap,y.alphaTest=N.alphaToCoverage===!0?.5:N.alphaTest,y.map=N.map,y.clipShadows=N.clipShadows,y.clippingPlanes=N.clippingPlanes,y.clipIntersection=N.clipIntersection,y.displacementMap=N.displacementMap,y.displacementScale=N.displacementScale,y.displacementBias=N.displacementBias,y.wireframeLinewidth=N.wireframeLinewidth,y.linewidth=N.linewidth,R.isPointLight===!0&&y.isMeshDistanceMaterial===!0){const z=n.properties.get(y);z.light=R}return y}function b(P,N,R,S,y){if(P.visible===!1)return;if(P.layers.test(N.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&y===Pn)&&(!P.frustumCulled||i.intersectsObject(P))){P.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,P.matrixWorld);const B=e.update(P),k=P.material;if(Array.isArray(k)){const ee=B.groups;for(let $=0,q=ee.length;$<q;$++){const H=ee[$],ie=k[H.materialIndex];if(ie&&ie.visible){const he=E(P,ie,S,y);P.onBeforeShadow(n,P,N,R,B,he,H),n.renderBufferDirect(R,null,B,he,P,H),P.onAfterShadow(n,P,N,R,B,he,H)}}}else if(k.visible){const ee=E(P,k,S,y);P.onBeforeShadow(n,P,N,R,B,ee,null),n.renderBufferDirect(R,null,B,ee,P,null),P.onAfterShadow(n,P,N,R,B,ee,null)}}const z=P.children;for(let B=0,k=z.length;B<k;B++)b(z[B],N,R,S,y)}function A(P){P.target.removeEventListener("dispose",A);for(const R in h){const S=h[R],y=P.target.uuid;y in S&&(S[y].dispose(),delete S[y])}}}const h_={[Ta]:wa,[Aa]:Pa,[Ra]:Na,[es]:Ca,[wa]:Ta,[Pa]:Aa,[Na]:Ra,[Ca]:es};function u_(n,e){function t(){let I=!1;const de=new wt;let pe=null;const be=new wt(0,0,0,0);return{setMask:function(le){pe!==le&&!I&&(n.colorMask(le,le,le,le),pe=le)},setLocked:function(le){I=le},setClear:function(le,ne,Te,Ge,at){at===!0&&(le*=Ge,ne*=Ge,Te*=Ge),de.set(le,ne,Te,Ge),be.equals(de)===!1&&(n.clearColor(le,ne,Te,Ge),be.copy(de))},reset:function(){I=!1,pe=null,be.set(-1,0,0,0)}}}function i(){let I=!1,de=!1,pe=null,be=null,le=null;return{setReversed:function(ne){if(de!==ne){const Te=e.get("EXT_clip_control");ne?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),de=ne;const Ge=le;le=null,this.setClear(Ge)}},getReversed:function(){return de},setTest:function(ne){ne?Z(n.DEPTH_TEST):ge(n.DEPTH_TEST)},setMask:function(ne){pe!==ne&&!I&&(n.depthMask(ne),pe=ne)},setFunc:function(ne){if(de&&(ne=h_[ne]),be!==ne){switch(ne){case Ta:n.depthFunc(n.NEVER);break;case wa:n.depthFunc(n.ALWAYS);break;case Aa:n.depthFunc(n.LESS);break;case es:n.depthFunc(n.LEQUAL);break;case Ra:n.depthFunc(n.EQUAL);break;case Ca:n.depthFunc(n.GEQUAL);break;case Pa:n.depthFunc(n.GREATER);break;case Na:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}be=ne}},setLocked:function(ne){I=ne},setClear:function(ne){le!==ne&&(de&&(ne=1-ne),n.clearDepth(ne),le=ne)},reset:function(){I=!1,pe=null,be=null,le=null,de=!1}}}function s(){let I=!1,de=null,pe=null,be=null,le=null,ne=null,Te=null,Ge=null,at=null;return{setTest:function(et){I||(et?Z(n.STENCIL_TEST):ge(n.STENCIL_TEST))},setMask:function(et){de!==et&&!I&&(n.stencilMask(et),de=et)},setFunc:function(et,Lt,It){(pe!==et||be!==Lt||le!==It)&&(n.stencilFunc(et,Lt,It),pe=et,be=Lt,le=It)},setOp:function(et,Lt,It){(ne!==et||Te!==Lt||Ge!==It)&&(n.stencilOp(et,Lt,It),ne=et,Te=Lt,Ge=It)},setLocked:function(et){I=et},setClear:function(et){at!==et&&(n.clearStencil(et),at=et)},reset:function(){I=!1,de=null,pe=null,be=null,le=null,ne=null,Te=null,Ge=null,at=null}}}const r=new t,o=new i,l=new s,d=new WeakMap,h=new WeakMap;let c={},u={},p=new WeakMap,m=[],_=null,x=!1,g=null,f=null,w=null,E=null,b=null,A=null,P=null,N=new ot(0,0,0),R=0,S=!1,y=null,C=null,z=null,B=null,k=null;const ee=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let $=!1,q=0;const H=n.getParameter(n.VERSION);H.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(H)[1]),$=q>=1):H.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),$=q>=2);let ie=null,he={};const X=n.getParameter(n.SCISSOR_BOX),te=n.getParameter(n.VIEWPORT),_e=new wt().fromArray(X),ue=new wt().fromArray(te);function O(I,de,pe,be){const le=new Uint8Array(4),ne=n.createTexture();n.bindTexture(I,ne),n.texParameteri(I,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(I,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Te=0;Te<pe;Te++)I===n.TEXTURE_3D||I===n.TEXTURE_2D_ARRAY?n.texImage3D(de,0,n.RGBA,1,1,be,0,n.RGBA,n.UNSIGNED_BYTE,le):n.texImage2D(de+Te,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,le);return ne}const Q={};Q[n.TEXTURE_2D]=O(n.TEXTURE_2D,n.TEXTURE_2D,1),Q[n.TEXTURE_CUBE_MAP]=O(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Q[n.TEXTURE_2D_ARRAY]=O(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Q[n.TEXTURE_3D]=O(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),l.setClear(0),Z(n.DEPTH_TEST),o.setFunc(es),qe(!1),Re(Qo),Z(n.CULL_FACE),it(Qn);function Z(I){c[I]!==!0&&(n.enable(I),c[I]=!0)}function ge(I){c[I]!==!1&&(n.disable(I),c[I]=!1)}function ye(I,de){return u[I]!==de?(n.bindFramebuffer(I,de),u[I]=de,I===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=de),I===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=de),!0):!1}function Le(I,de){let pe=m,be=!1;if(I){pe=p.get(de),pe===void 0&&(pe=[],p.set(de,pe));const le=I.textures;if(pe.length!==le.length||pe[0]!==n.COLOR_ATTACHMENT0){for(let ne=0,Te=le.length;ne<Te;ne++)pe[ne]=n.COLOR_ATTACHMENT0+ne;pe.length=le.length,be=!0}}else pe[0]!==n.BACK&&(pe[0]=n.BACK,be=!0);be&&n.drawBuffers(pe)}function Ze(I){return _!==I?(n.useProgram(I),_=I,!0):!1}const We={[fi]:n.FUNC_ADD,[vh]:n.FUNC_SUBTRACT,[Mh]:n.FUNC_REVERSE_SUBTRACT};We[Sh]=n.MIN,We[yh]=n.MAX;const D={[bh]:n.ZERO,[Eh]:n.ONE,[Th]:n.SRC_COLOR,[ba]:n.SRC_ALPHA,[Nh]:n.SRC_ALPHA_SATURATE,[Ch]:n.DST_COLOR,[Ah]:n.DST_ALPHA,[wh]:n.ONE_MINUS_SRC_COLOR,[Ea]:n.ONE_MINUS_SRC_ALPHA,[Ph]:n.ONE_MINUS_DST_COLOR,[Rh]:n.ONE_MINUS_DST_ALPHA,[Dh]:n.CONSTANT_COLOR,[Lh]:n.ONE_MINUS_CONSTANT_COLOR,[Ih]:n.CONSTANT_ALPHA,[Uh]:n.ONE_MINUS_CONSTANT_ALPHA};function it(I,de,pe,be,le,ne,Te,Ge,at,et){if(I===Qn){x===!0&&(ge(n.BLEND),x=!1);return}if(x===!1&&(Z(n.BLEND),x=!0),I!==xh){if(I!==g||et!==S){if((f!==fi||b!==fi)&&(n.blendEquation(n.FUNC_ADD),f=fi,b=fi),et)switch(I){case Zi:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case el:n.blendFunc(n.ONE,n.ONE);break;case tl:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case nl:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Zi:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case el:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case tl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case nl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}w=null,E=null,A=null,P=null,N.set(0,0,0),R=0,g=I,S=et}return}le=le||de,ne=ne||pe,Te=Te||be,(de!==f||le!==b)&&(n.blendEquationSeparate(We[de],We[le]),f=de,b=le),(pe!==w||be!==E||ne!==A||Te!==P)&&(n.blendFuncSeparate(D[pe],D[be],D[ne],D[Te]),w=pe,E=be,A=ne,P=Te),(Ge.equals(N)===!1||at!==R)&&(n.blendColor(Ge.r,Ge.g,Ge.b,at),N.copy(Ge),R=at),g=I,S=!1}function De(I,de){I.side===Ln?ge(n.CULL_FACE):Z(n.CULL_FACE);let pe=I.side===$t;de&&(pe=!pe),qe(pe),I.blending===Zi&&I.transparent===!1?it(Qn):it(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),r.setMask(I.colorWrite);const be=I.stencilWrite;l.setTest(be),be&&(l.setMask(I.stencilWriteMask),l.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),l.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),me(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?Z(n.SAMPLE_ALPHA_TO_COVERAGE):ge(n.SAMPLE_ALPHA_TO_COVERAGE)}function qe(I){y!==I&&(I?n.frontFace(n.CW):n.frontFace(n.CCW),y=I)}function Re(I){I!==mh?(Z(n.CULL_FACE),I!==C&&(I===Qo?n.cullFace(n.BACK):I===gh?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ge(n.CULL_FACE),C=I}function Je(I){I!==z&&($&&n.lineWidth(I),z=I)}function me(I,de,pe){I?(Z(n.POLYGON_OFFSET_FILL),(B!==de||k!==pe)&&(n.polygonOffset(de,pe),B=de,k=pe)):ge(n.POLYGON_OFFSET_FILL)}function Fe(I){I?Z(n.SCISSOR_TEST):ge(n.SCISSOR_TEST)}function Qe(I){I===void 0&&(I=n.TEXTURE0+ee-1),ie!==I&&(n.activeTexture(I),ie=I)}function lt(I,de,pe){pe===void 0&&(ie===null?pe=n.TEXTURE0+ee-1:pe=ie);let be=he[pe];be===void 0&&(be={type:void 0,texture:void 0},he[pe]=be),(be.type!==I||be.texture!==de)&&(ie!==pe&&(n.activeTexture(pe),ie=pe),n.bindTexture(I,de||Q[I]),be.type=I,be.texture=de)}function T(){const I=he[ie];I!==void 0&&I.type!==void 0&&(n.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function v(){try{n.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function j(){try{n.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{n.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function re(){try{n.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Y(){try{n.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ne(){try{n.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function fe(){try{n.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function we(){try{n.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ce(){try{n.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ae(){try{n.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Me(I){_e.equals(I)===!1&&(n.scissor(I.x,I.y,I.z,I.w),_e.copy(I))}function Oe(I){ue.equals(I)===!1&&(n.viewport(I.x,I.y,I.z,I.w),ue.copy(I))}function Pe(I,de){let pe=h.get(de);pe===void 0&&(pe=new WeakMap,h.set(de,pe));let be=pe.get(I);be===void 0&&(be=n.getUniformBlockIndex(de,I.name),pe.set(I,be))}function xe(I,de){const be=h.get(de).get(I);d.get(de)!==be&&(n.uniformBlockBinding(de,be,I.__bindingPointIndex),d.set(de,be))}function Ve(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),c={},ie=null,he={},u={},p=new WeakMap,m=[],_=null,x=!1,g=null,f=null,w=null,E=null,b=null,A=null,P=null,N=new ot(0,0,0),R=0,S=!1,y=null,C=null,z=null,B=null,k=null,_e.set(0,0,n.canvas.width,n.canvas.height),ue.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),l.reset()}return{buffers:{color:r,depth:o,stencil:l},enable:Z,disable:ge,bindFramebuffer:ye,drawBuffers:Le,useProgram:Ze,setBlending:it,setMaterial:De,setFlipSided:qe,setCullFace:Re,setLineWidth:Je,setPolygonOffset:me,setScissorTest:Fe,activeTexture:Qe,bindTexture:lt,unbindTexture:T,compressedTexImage2D:v,compressedTexImage3D:j,texImage2D:Ce,texImage3D:ae,updateUBOMapping:Pe,uniformBlockBinding:xe,texStorage2D:fe,texStorage3D:we,texSubImage2D:J,texSubImage3D:re,compressedTexSubImage2D:Y,compressedTexSubImage3D:Ne,scissor:Me,viewport:Oe,reset:Ve}}function f_(n,e,t,i,s,r,o){const l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,d=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new pt,c=new WeakMap;let u;const p=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(T,v){return m?new OffscreenCanvas(T,v):Ar("canvas")}function x(T,v,j){let J=1;const re=lt(T);if((re.width>j||re.height>j)&&(J=j/Math.max(re.width,re.height)),J<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const Y=Math.floor(J*re.width),Ne=Math.floor(J*re.height);u===void 0&&(u=_(Y,Ne));const fe=v?_(Y,Ne):u;return fe.width=Y,fe.height=Ne,fe.getContext("2d").drawImage(T,0,0,Y,Ne),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+re.width+"x"+re.height+") to ("+Y+"x"+Ne+")."),fe}else return"data"in T&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+re.width+"x"+re.height+")."),T;return T}function g(T){return T.generateMipmaps}function f(T){n.generateMipmap(T)}function w(T){return T.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?n.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function E(T,v,j,J,re=!1){if(T!==null){if(n[T]!==void 0)return n[T];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let Y=v;if(v===n.RED&&(j===n.FLOAT&&(Y=n.R32F),j===n.HALF_FLOAT&&(Y=n.R16F),j===n.UNSIGNED_BYTE&&(Y=n.R8)),v===n.RED_INTEGER&&(j===n.UNSIGNED_BYTE&&(Y=n.R8UI),j===n.UNSIGNED_SHORT&&(Y=n.R16UI),j===n.UNSIGNED_INT&&(Y=n.R32UI),j===n.BYTE&&(Y=n.R8I),j===n.SHORT&&(Y=n.R16I),j===n.INT&&(Y=n.R32I)),v===n.RG&&(j===n.FLOAT&&(Y=n.RG32F),j===n.HALF_FLOAT&&(Y=n.RG16F),j===n.UNSIGNED_BYTE&&(Y=n.RG8)),v===n.RG_INTEGER&&(j===n.UNSIGNED_BYTE&&(Y=n.RG8UI),j===n.UNSIGNED_SHORT&&(Y=n.RG16UI),j===n.UNSIGNED_INT&&(Y=n.RG32UI),j===n.BYTE&&(Y=n.RG8I),j===n.SHORT&&(Y=n.RG16I),j===n.INT&&(Y=n.RG32I)),v===n.RGB_INTEGER&&(j===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),j===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),j===n.UNSIGNED_INT&&(Y=n.RGB32UI),j===n.BYTE&&(Y=n.RGB8I),j===n.SHORT&&(Y=n.RGB16I),j===n.INT&&(Y=n.RGB32I)),v===n.RGBA_INTEGER&&(j===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),j===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),j===n.UNSIGNED_INT&&(Y=n.RGBA32UI),j===n.BYTE&&(Y=n.RGBA8I),j===n.SHORT&&(Y=n.RGBA16I),j===n.INT&&(Y=n.RGBA32I)),v===n.RGB&&j===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),v===n.RGBA){const Ne=re?Tr:nt.getTransfer(J);j===n.FLOAT&&(Y=n.RGBA32F),j===n.HALF_FLOAT&&(Y=n.RGBA16F),j===n.UNSIGNED_BYTE&&(Y=Ne===ut?n.SRGB8_ALPHA8:n.RGBA8),j===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),j===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Y}function b(T,v){let j;return T?v===null||v===bi||v===Rs?j=n.DEPTH24_STENCIL8:v===In?j=n.DEPTH32F_STENCIL8:v===As&&(j=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===bi||v===Rs?j=n.DEPTH_COMPONENT24:v===In?j=n.DEPTH_COMPONENT32F:v===As&&(j=n.DEPTH_COMPONENT16),j}function A(T,v){return g(T)===!0||T.isFramebufferTexture&&T.minFilter!==vn&&T.minFilter!==_n?Math.log2(Math.max(v.width,v.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?v.mipmaps.length:1}function P(T){const v=T.target;v.removeEventListener("dispose",P),R(v),v.isVideoTexture&&c.delete(v)}function N(T){const v=T.target;v.removeEventListener("dispose",N),y(v)}function R(T){const v=i.get(T);if(v.__webglInit===void 0)return;const j=T.source,J=p.get(j);if(J){const re=J[v.__cacheKey];re.usedTimes--,re.usedTimes===0&&S(T),Object.keys(J).length===0&&p.delete(j)}i.remove(T)}function S(T){const v=i.get(T);n.deleteTexture(v.__webglTexture);const j=T.source,J=p.get(j);delete J[v.__cacheKey],o.memory.textures--}function y(T){const v=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(v.__webglFramebuffer[J]))for(let re=0;re<v.__webglFramebuffer[J].length;re++)n.deleteFramebuffer(v.__webglFramebuffer[J][re]);else n.deleteFramebuffer(v.__webglFramebuffer[J]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[J])}else{if(Array.isArray(v.__webglFramebuffer))for(let J=0;J<v.__webglFramebuffer.length;J++)n.deleteFramebuffer(v.__webglFramebuffer[J]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let J=0;J<v.__webglColorRenderbuffer.length;J++)v.__webglColorRenderbuffer[J]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[J]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const j=T.textures;for(let J=0,re=j.length;J<re;J++){const Y=i.get(j[J]);Y.__webglTexture&&(n.deleteTexture(Y.__webglTexture),o.memory.textures--),i.remove(j[J])}i.remove(T)}let C=0;function z(){C=0}function B(){const T=C;return T>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),C+=1,T}function k(T){const v=[];return v.push(T.wrapS),v.push(T.wrapT),v.push(T.wrapR||0),v.push(T.magFilter),v.push(T.minFilter),v.push(T.anisotropy),v.push(T.internalFormat),v.push(T.format),v.push(T.type),v.push(T.generateMipmaps),v.push(T.premultiplyAlpha),v.push(T.flipY),v.push(T.unpackAlignment),v.push(T.colorSpace),v.join()}function ee(T,v){const j=i.get(T);if(T.isVideoTexture&&Fe(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&j.__version!==T.version){const J=T.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Q(j,T,v);return}}else T.isExternalTexture&&(j.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,j.__webglTexture,n.TEXTURE0+v)}function $(T,v){const j=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&j.__version!==T.version){Q(j,T,v);return}t.bindTexture(n.TEXTURE_2D_ARRAY,j.__webglTexture,n.TEXTURE0+v)}function q(T,v){const j=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&j.__version!==T.version){Q(j,T,v);return}t.bindTexture(n.TEXTURE_3D,j.__webglTexture,n.TEXTURE0+v)}function H(T,v){const j=i.get(T);if(T.version>0&&j.__version!==T.version){Z(j,T,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,j.__webglTexture,n.TEXTURE0+v)}const ie={[Ia]:n.REPEAT,[gi]:n.CLAMP_TO_EDGE,[Ua]:n.MIRRORED_REPEAT},he={[vn]:n.NEAREST,[Wh]:n.NEAREST_MIPMAP_NEAREST,[ks]:n.NEAREST_MIPMAP_LINEAR,[_n]:n.LINEAR,[Ir]:n.LINEAR_MIPMAP_NEAREST,[_i]:n.LINEAR_MIPMAP_LINEAR},X={[Kh]:n.NEVER,[nu]:n.ALWAYS,[Zh]:n.LESS,[Pc]:n.LEQUAL,[Jh]:n.EQUAL,[tu]:n.GEQUAL,[Qh]:n.GREATER,[eu]:n.NOTEQUAL};function te(T,v){if(v.type===In&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===_n||v.magFilter===Ir||v.magFilter===ks||v.magFilter===_i||v.minFilter===_n||v.minFilter===Ir||v.minFilter===ks||v.minFilter===_i)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(T,n.TEXTURE_WRAP_S,ie[v.wrapS]),n.texParameteri(T,n.TEXTURE_WRAP_T,ie[v.wrapT]),(T===n.TEXTURE_3D||T===n.TEXTURE_2D_ARRAY)&&n.texParameteri(T,n.TEXTURE_WRAP_R,ie[v.wrapR]),n.texParameteri(T,n.TEXTURE_MAG_FILTER,he[v.magFilter]),n.texParameteri(T,n.TEXTURE_MIN_FILTER,he[v.minFilter]),v.compareFunction&&(n.texParameteri(T,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(T,n.TEXTURE_COMPARE_FUNC,X[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===vn||v.minFilter!==ks&&v.minFilter!==_i||v.type===In&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){const j=e.get("EXT_texture_filter_anisotropic");n.texParameterf(T,j.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function _e(T,v){let j=!1;T.__webglInit===void 0&&(T.__webglInit=!0,v.addEventListener("dispose",P));const J=v.source;let re=p.get(J);re===void 0&&(re={},p.set(J,re));const Y=k(v);if(Y!==T.__cacheKey){re[Y]===void 0&&(re[Y]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,j=!0),re[Y].usedTimes++;const Ne=re[T.__cacheKey];Ne!==void 0&&(re[T.__cacheKey].usedTimes--,Ne.usedTimes===0&&S(v)),T.__cacheKey=Y,T.__webglTexture=re[Y].texture}return j}function ue(T,v,j){return Math.floor(Math.floor(T/j)/v)}function O(T,v,j,J){const Y=T.updateRanges;if(Y.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,v.width,v.height,j,J,v.data);else{Y.sort((ae,Me)=>ae.start-Me.start);let Ne=0;for(let ae=1;ae<Y.length;ae++){const Me=Y[Ne],Oe=Y[ae],Pe=Me.start+Me.count,xe=ue(Oe.start,v.width,4),Ve=ue(Me.start,v.width,4);Oe.start<=Pe+1&&xe===Ve&&ue(Oe.start+Oe.count-1,v.width,4)===xe?Me.count=Math.max(Me.count,Oe.start+Oe.count-Me.start):(++Ne,Y[Ne]=Oe)}Y.length=Ne+1;const fe=n.getParameter(n.UNPACK_ROW_LENGTH),we=n.getParameter(n.UNPACK_SKIP_PIXELS),Ce=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,v.width);for(let ae=0,Me=Y.length;ae<Me;ae++){const Oe=Y[ae],Pe=Math.floor(Oe.start/4),xe=Math.ceil(Oe.count/4),Ve=Pe%v.width,I=Math.floor(Pe/v.width),de=xe,pe=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Ve),n.pixelStorei(n.UNPACK_SKIP_ROWS,I),t.texSubImage2D(n.TEXTURE_2D,0,Ve,I,de,pe,j,J,v.data)}T.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,fe),n.pixelStorei(n.UNPACK_SKIP_PIXELS,we),n.pixelStorei(n.UNPACK_SKIP_ROWS,Ce)}}function Q(T,v,j){let J=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(J=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(J=n.TEXTURE_3D);const re=_e(T,v),Y=v.source;t.bindTexture(J,T.__webglTexture,n.TEXTURE0+j);const Ne=i.get(Y);if(Y.version!==Ne.__version||re===!0){t.activeTexture(n.TEXTURE0+j);const fe=nt.getPrimaries(nt.workingColorSpace),we=v.colorSpace===Zn?null:nt.getPrimaries(v.colorSpace),Ce=v.colorSpace===Zn||fe===we?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ce);let ae=x(v.image,!1,s.maxTextureSize);ae=Qe(v,ae);const Me=r.convert(v.format,v.colorSpace),Oe=r.convert(v.type);let Pe=E(v.internalFormat,Me,Oe,v.colorSpace,v.isVideoTexture);te(J,v);let xe;const Ve=v.mipmaps,I=v.isVideoTexture!==!0,de=Ne.__version===void 0||re===!0,pe=Y.dataReady,be=A(v,ae);if(v.isDepthTexture)Pe=b(v.format===Ps,v.type),de&&(I?t.texStorage2D(n.TEXTURE_2D,1,Pe,ae.width,ae.height):t.texImage2D(n.TEXTURE_2D,0,Pe,ae.width,ae.height,0,Me,Oe,null));else if(v.isDataTexture)if(Ve.length>0){I&&de&&t.texStorage2D(n.TEXTURE_2D,be,Pe,Ve[0].width,Ve[0].height);for(let le=0,ne=Ve.length;le<ne;le++)xe=Ve[le],I?pe&&t.texSubImage2D(n.TEXTURE_2D,le,0,0,xe.width,xe.height,Me,Oe,xe.data):t.texImage2D(n.TEXTURE_2D,le,Pe,xe.width,xe.height,0,Me,Oe,xe.data);v.generateMipmaps=!1}else I?(de&&t.texStorage2D(n.TEXTURE_2D,be,Pe,ae.width,ae.height),pe&&O(v,ae,Me,Oe)):t.texImage2D(n.TEXTURE_2D,0,Pe,ae.width,ae.height,0,Me,Oe,ae.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){I&&de&&t.texStorage3D(n.TEXTURE_2D_ARRAY,be,Pe,Ve[0].width,Ve[0].height,ae.depth);for(let le=0,ne=Ve.length;le<ne;le++)if(xe=Ve[le],v.format!==xn)if(Me!==null)if(I){if(pe)if(v.layerUpdates.size>0){const Te=bl(xe.width,xe.height,v.format,v.type);for(const Ge of v.layerUpdates){const at=xe.data.subarray(Ge*Te/xe.data.BYTES_PER_ELEMENT,(Ge+1)*Te/xe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,le,0,0,Ge,xe.width,xe.height,1,Me,at)}v.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,le,0,0,0,xe.width,xe.height,ae.depth,Me,xe.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,le,Pe,xe.width,xe.height,ae.depth,0,xe.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?pe&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,le,0,0,0,xe.width,xe.height,ae.depth,Me,Oe,xe.data):t.texImage3D(n.TEXTURE_2D_ARRAY,le,Pe,xe.width,xe.height,ae.depth,0,Me,Oe,xe.data)}else{I&&de&&t.texStorage2D(n.TEXTURE_2D,be,Pe,Ve[0].width,Ve[0].height);for(let le=0,ne=Ve.length;le<ne;le++)xe=Ve[le],v.format!==xn?Me!==null?I?pe&&t.compressedTexSubImage2D(n.TEXTURE_2D,le,0,0,xe.width,xe.height,Me,xe.data):t.compressedTexImage2D(n.TEXTURE_2D,le,Pe,xe.width,xe.height,0,xe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?pe&&t.texSubImage2D(n.TEXTURE_2D,le,0,0,xe.width,xe.height,Me,Oe,xe.data):t.texImage2D(n.TEXTURE_2D,le,Pe,xe.width,xe.height,0,Me,Oe,xe.data)}else if(v.isDataArrayTexture)if(I){if(de&&t.texStorage3D(n.TEXTURE_2D_ARRAY,be,Pe,ae.width,ae.height,ae.depth),pe)if(v.layerUpdates.size>0){const le=bl(ae.width,ae.height,v.format,v.type);for(const ne of v.layerUpdates){const Te=ae.data.subarray(ne*le/ae.data.BYTES_PER_ELEMENT,(ne+1)*le/ae.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ne,ae.width,ae.height,1,Me,Oe,Te)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ae.width,ae.height,ae.depth,Me,Oe,ae.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Pe,ae.width,ae.height,ae.depth,0,Me,Oe,ae.data);else if(v.isData3DTexture)I?(de&&t.texStorage3D(n.TEXTURE_3D,be,Pe,ae.width,ae.height,ae.depth),pe&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ae.width,ae.height,ae.depth,Me,Oe,ae.data)):t.texImage3D(n.TEXTURE_3D,0,Pe,ae.width,ae.height,ae.depth,0,Me,Oe,ae.data);else if(v.isFramebufferTexture){if(de)if(I)t.texStorage2D(n.TEXTURE_2D,be,Pe,ae.width,ae.height);else{let le=ae.width,ne=ae.height;for(let Te=0;Te<be;Te++)t.texImage2D(n.TEXTURE_2D,Te,Pe,le,ne,0,Me,Oe,null),le>>=1,ne>>=1}}else if(Ve.length>0){if(I&&de){const le=lt(Ve[0]);t.texStorage2D(n.TEXTURE_2D,be,Pe,le.width,le.height)}for(let le=0,ne=Ve.length;le<ne;le++)xe=Ve[le],I?pe&&t.texSubImage2D(n.TEXTURE_2D,le,0,0,Me,Oe,xe):t.texImage2D(n.TEXTURE_2D,le,Pe,Me,Oe,xe);v.generateMipmaps=!1}else if(I){if(de){const le=lt(ae);t.texStorage2D(n.TEXTURE_2D,be,Pe,le.width,le.height)}pe&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Me,Oe,ae)}else t.texImage2D(n.TEXTURE_2D,0,Pe,Me,Oe,ae);g(v)&&f(J),Ne.__version=Y.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function Z(T,v,j){if(v.image.length!==6)return;const J=_e(T,v),re=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,T.__webglTexture,n.TEXTURE0+j);const Y=i.get(re);if(re.version!==Y.__version||J===!0){t.activeTexture(n.TEXTURE0+j);const Ne=nt.getPrimaries(nt.workingColorSpace),fe=v.colorSpace===Zn?null:nt.getPrimaries(v.colorSpace),we=v.colorSpace===Zn||Ne===fe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);const Ce=v.isCompressedTexture||v.image[0].isCompressedTexture,ae=v.image[0]&&v.image[0].isDataTexture,Me=[];for(let ne=0;ne<6;ne++)!Ce&&!ae?Me[ne]=x(v.image[ne],!0,s.maxCubemapSize):Me[ne]=ae?v.image[ne].image:v.image[ne],Me[ne]=Qe(v,Me[ne]);const Oe=Me[0],Pe=r.convert(v.format,v.colorSpace),xe=r.convert(v.type),Ve=E(v.internalFormat,Pe,xe,v.colorSpace),I=v.isVideoTexture!==!0,de=Y.__version===void 0||J===!0,pe=re.dataReady;let be=A(v,Oe);te(n.TEXTURE_CUBE_MAP,v);let le;if(Ce){I&&de&&t.texStorage2D(n.TEXTURE_CUBE_MAP,be,Ve,Oe.width,Oe.height);for(let ne=0;ne<6;ne++){le=Me[ne].mipmaps;for(let Te=0;Te<le.length;Te++){const Ge=le[Te];v.format!==xn?Pe!==null?I?pe&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,0,0,Ge.width,Ge.height,Pe,Ge.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,Ve,Ge.width,Ge.height,0,Ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,0,0,Ge.width,Ge.height,Pe,xe,Ge.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te,Ve,Ge.width,Ge.height,0,Pe,xe,Ge.data)}}}else{if(le=v.mipmaps,I&&de){le.length>0&&be++;const ne=lt(Me[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,be,Ve,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(ae){I?pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Me[ne].width,Me[ne].height,Pe,xe,Me[ne].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,Ve,Me[ne].width,Me[ne].height,0,Pe,xe,Me[ne].data);for(let Te=0;Te<le.length;Te++){const at=le[Te].image[ne].image;I?pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,0,0,at.width,at.height,Pe,xe,at.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,Ve,at.width,at.height,0,Pe,xe,at.data)}}else{I?pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Pe,xe,Me[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,Ve,Pe,xe,Me[ne]);for(let Te=0;Te<le.length;Te++){const Ge=le[Te];I?pe&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,0,0,Pe,xe,Ge.image[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Te+1,Ve,Pe,xe,Ge.image[ne])}}}g(v)&&f(n.TEXTURE_CUBE_MAP),Y.__version=re.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function ge(T,v,j,J,re,Y){const Ne=r.convert(j.format,j.colorSpace),fe=r.convert(j.type),we=E(j.internalFormat,Ne,fe,j.colorSpace),Ce=i.get(v),ae=i.get(j);if(ae.__renderTarget=v,!Ce.__hasExternalTextures){const Me=Math.max(1,v.width>>Y),Oe=Math.max(1,v.height>>Y);re===n.TEXTURE_3D||re===n.TEXTURE_2D_ARRAY?t.texImage3D(re,Y,we,Me,Oe,v.depth,0,Ne,fe,null):t.texImage2D(re,Y,we,Me,Oe,0,Ne,fe,null)}t.bindFramebuffer(n.FRAMEBUFFER,T),me(v)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,J,re,ae.__webglTexture,0,Je(v)):(re===n.TEXTURE_2D||re>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,J,re,ae.__webglTexture,Y),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ye(T,v,j){if(n.bindRenderbuffer(n.RENDERBUFFER,T),v.depthBuffer){const J=v.depthTexture,re=J&&J.isDepthTexture?J.type:null,Y=b(v.stencilBuffer,re),Ne=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,fe=Je(v);me(v)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,fe,Y,v.width,v.height):j?n.renderbufferStorageMultisample(n.RENDERBUFFER,fe,Y,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,Y,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ne,n.RENDERBUFFER,T)}else{const J=v.textures;for(let re=0;re<J.length;re++){const Y=J[re],Ne=r.convert(Y.format,Y.colorSpace),fe=r.convert(Y.type),we=E(Y.internalFormat,Ne,fe,Y.colorSpace),Ce=Je(v);j&&me(v)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ce,we,v.width,v.height):me(v)?l.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ce,we,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,we,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Le(T,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,T),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=i.get(v.depthTexture);J.__renderTarget=v,(!J.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),ee(v.depthTexture,0);const re=J.__webglTexture,Y=Je(v);if(v.depthTexture.format===Cs)me(v)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,re,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,re,0);else if(v.depthTexture.format===Ps)me(v)?l.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,re,0,Y):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,re,0);else throw new Error("Unknown depthTexture format")}function Ze(T){const v=i.get(T),j=T.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==T.depthTexture){const J=T.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),J){const re=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,J.removeEventListener("dispose",re)};J.addEventListener("dispose",re),v.__depthDisposeCallback=re}v.__boundDepthTexture=J}if(T.depthTexture&&!v.__autoAllocateDepthBuffer){if(j)throw new Error("target.depthTexture not supported in Cube render targets");const J=T.texture.mipmaps;J&&J.length>0?Le(v.__webglFramebuffer[0],T):Le(v.__webglFramebuffer,T)}else if(j){v.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[J]),v.__webglDepthbuffer[J]===void 0)v.__webglDepthbuffer[J]=n.createRenderbuffer(),ye(v.__webglDepthbuffer[J],T,!1);else{const re=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Y=v.__webglDepthbuffer[J];n.bindRenderbuffer(n.RENDERBUFFER,Y),n.framebufferRenderbuffer(n.FRAMEBUFFER,re,n.RENDERBUFFER,Y)}}else{const J=T.texture.mipmaps;if(J&&J.length>0?t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),ye(v.__webglDepthbuffer,T,!1);else{const re=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Y=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,Y),n.framebufferRenderbuffer(n.FRAMEBUFFER,re,n.RENDERBUFFER,Y)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function We(T,v,j){const J=i.get(T);v!==void 0&&ge(J.__webglFramebuffer,T,T.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),j!==void 0&&Ze(T)}function D(T){const v=T.texture,j=i.get(T),J=i.get(v);T.addEventListener("dispose",N);const re=T.textures,Y=T.isWebGLCubeRenderTarget===!0,Ne=re.length>1;if(Ne||(J.__webglTexture===void 0&&(J.__webglTexture=n.createTexture()),J.__version=v.version,o.memory.textures++),Y){j.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(v.mipmaps&&v.mipmaps.length>0){j.__webglFramebuffer[fe]=[];for(let we=0;we<v.mipmaps.length;we++)j.__webglFramebuffer[fe][we]=n.createFramebuffer()}else j.__webglFramebuffer[fe]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){j.__webglFramebuffer=[];for(let fe=0;fe<v.mipmaps.length;fe++)j.__webglFramebuffer[fe]=n.createFramebuffer()}else j.__webglFramebuffer=n.createFramebuffer();if(Ne)for(let fe=0,we=re.length;fe<we;fe++){const Ce=i.get(re[fe]);Ce.__webglTexture===void 0&&(Ce.__webglTexture=n.createTexture(),o.memory.textures++)}if(T.samples>0&&me(T)===!1){j.__webglMultisampledFramebuffer=n.createFramebuffer(),j.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,j.__webglMultisampledFramebuffer);for(let fe=0;fe<re.length;fe++){const we=re[fe];j.__webglColorRenderbuffer[fe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,j.__webglColorRenderbuffer[fe]);const Ce=r.convert(we.format,we.colorSpace),ae=r.convert(we.type),Me=E(we.internalFormat,Ce,ae,we.colorSpace,T.isXRRenderTarget===!0),Oe=Je(T);n.renderbufferStorageMultisample(n.RENDERBUFFER,Oe,Me,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+fe,n.RENDERBUFFER,j.__webglColorRenderbuffer[fe])}n.bindRenderbuffer(n.RENDERBUFFER,null),T.depthBuffer&&(j.__webglDepthRenderbuffer=n.createRenderbuffer(),ye(j.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Y){t.bindTexture(n.TEXTURE_CUBE_MAP,J.__webglTexture),te(n.TEXTURE_CUBE_MAP,v);for(let fe=0;fe<6;fe++)if(v.mipmaps&&v.mipmaps.length>0)for(let we=0;we<v.mipmaps.length;we++)ge(j.__webglFramebuffer[fe][we],T,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,we);else ge(j.__webglFramebuffer[fe],T,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);g(v)&&f(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ne){for(let fe=0,we=re.length;fe<we;fe++){const Ce=re[fe],ae=i.get(Ce);let Me=n.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Me=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Me,ae.__webglTexture),te(Me,Ce),ge(j.__webglFramebuffer,T,Ce,n.COLOR_ATTACHMENT0+fe,Me,0),g(Ce)&&f(Me)}t.unbindTexture()}else{let fe=n.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(fe=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(fe,J.__webglTexture),te(fe,v),v.mipmaps&&v.mipmaps.length>0)for(let we=0;we<v.mipmaps.length;we++)ge(j.__webglFramebuffer[we],T,v,n.COLOR_ATTACHMENT0,fe,we);else ge(j.__webglFramebuffer,T,v,n.COLOR_ATTACHMENT0,fe,0);g(v)&&f(fe),t.unbindTexture()}T.depthBuffer&&Ze(T)}function it(T){const v=T.textures;for(let j=0,J=v.length;j<J;j++){const re=v[j];if(g(re)){const Y=w(T),Ne=i.get(re).__webglTexture;t.bindTexture(Y,Ne),f(Y),t.unbindTexture()}}}const De=[],qe=[];function Re(T){if(T.samples>0){if(me(T)===!1){const v=T.textures,j=T.width,J=T.height;let re=n.COLOR_BUFFER_BIT;const Y=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ne=i.get(T),fe=v.length>1;if(fe)for(let Ce=0;Ce<v.length;Ce++)t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ne.__webglMultisampledFramebuffer);const we=T.texture.mipmaps;we&&we.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ne.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ne.__webglFramebuffer);for(let Ce=0;Ce<v.length;Ce++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(re|=n.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(re|=n.STENCIL_BUFFER_BIT)),fe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ne.__webglColorRenderbuffer[Ce]);const ae=i.get(v[Ce]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,ae,0)}n.blitFramebuffer(0,0,j,J,0,0,j,J,re,n.NEAREST),d===!0&&(De.length=0,qe.length=0,De.push(n.COLOR_ATTACHMENT0+Ce),T.depthBuffer&&T.resolveDepthBuffer===!1&&(De.push(Y),qe.push(Y),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,qe)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,De))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),fe)for(let Ce=0;Ce<v.length;Ce++){t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.RENDERBUFFER,Ne.__webglColorRenderbuffer[Ce]);const ae=i.get(v[Ce]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ne.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Ce,n.TEXTURE_2D,ae,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ne.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&d){const v=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function Je(T){return Math.min(s.maxSamples,T.samples)}function me(T){const v=i.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function Fe(T){const v=o.render.frame;c.get(T)!==v&&(c.set(T,v),T.update())}function Qe(T,v){const j=T.colorSpace,J=T.format,re=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||j!==is&&j!==Zn&&(nt.getTransfer(j)===ut?(J!==xn||re!==Fn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",j)),v}function lt(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(h.width=T.naturalWidth||T.width,h.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(h.width=T.displayWidth,h.height=T.displayHeight):(h.width=T.width,h.height=T.height),h}this.allocateTextureUnit=B,this.resetTextureUnits=z,this.setTexture2D=ee,this.setTexture2DArray=$,this.setTexture3D=q,this.setTextureCube=H,this.rebindTextures=We,this.setupRenderTarget=D,this.updateRenderTargetMipmap=it,this.updateMultisampleRenderTarget=Re,this.setupDepthRenderbuffer=Ze,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=me}function p_(n,e){function t(i,s=Zn){let r;const o=nt.getTransfer(s);if(i===Fn)return n.UNSIGNED_BYTE;if(i===xo)return n.UNSIGNED_SHORT_4_4_4_4;if(i===vo)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Ec)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===yc)return n.BYTE;if(i===bc)return n.SHORT;if(i===As)return n.UNSIGNED_SHORT;if(i===_o)return n.INT;if(i===bi)return n.UNSIGNED_INT;if(i===In)return n.FLOAT;if(i===Ds)return n.HALF_FLOAT;if(i===Tc)return n.ALPHA;if(i===wc)return n.RGB;if(i===xn)return n.RGBA;if(i===Cs)return n.DEPTH_COMPONENT;if(i===Ps)return n.DEPTH_STENCIL;if(i===Ac)return n.RED;if(i===Mo)return n.RED_INTEGER;if(i===Rc)return n.RG;if(i===So)return n.RG_INTEGER;if(i===yo)return n.RGBA_INTEGER;if(i===ur||i===fr||i===pr||i===mr)if(o===ut)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ur)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===fr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===pr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ur)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===fr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===pr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===mr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Fa||i===Ba||i===Oa||i===ka)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Fa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ba)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Oa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===ka)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ja||i===za||i===Ha)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===ja||i===za)return o===ut?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ha)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Ga||i===Va||i===Wa||i===Xa||i===$a||i===qa||i===Ya||i===Ka||i===Za||i===Ja||i===Qa||i===eo||i===to||i===no)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Ga)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Va)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Wa)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Xa)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===$a)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===qa)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ya)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Ka)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Za)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ja)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Qa)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===eo)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===to)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===no)return o===ut?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===gr||i===io||i===so)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===gr)return o===ut?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===io)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===so)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Cc||i===ro||i===ao||i===oo)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===gr)return r.COMPRESSED_RED_RGTC1_EXT;if(i===ro)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===ao)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===oo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Rs?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}class qc extends jt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}}const m_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,g_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class __{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const i=new qc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new ni({vertexShader:m_,fragmentShader:g_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new yn(new Bs(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class x_ extends rs{constructor(e,t){super();const i=this;let s=null,r=1,o=null,l="local-floor",d=1,h=null,c=null,u=null,p=null,m=null,_=null;const x=new __,g={},f=t.getContextAttributes();let w=null,E=null;const b=[],A=[],P=new pt;let N=null;const R=new pn;R.viewport=new wt;const S=new pn;S.viewport=new wt;const y=[R,S],C=new Ou;let z=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(O){let Q=b[O];return Q===void 0&&(Q=new ia,b[O]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(O){let Q=b[O];return Q===void 0&&(Q=new ia,b[O]=Q),Q.getGripSpace()},this.getHand=function(O){let Q=b[O];return Q===void 0&&(Q=new ia,b[O]=Q),Q.getHandSpace()};function k(O){const Q=A.indexOf(O.inputSource);if(Q===-1)return;const Z=b[Q];Z!==void 0&&(Z.update(O.inputSource,O.frame,h||o),Z.dispatchEvent({type:O.type,data:O.inputSource}))}function ee(){s.removeEventListener("select",k),s.removeEventListener("selectstart",k),s.removeEventListener("selectend",k),s.removeEventListener("squeeze",k),s.removeEventListener("squeezestart",k),s.removeEventListener("squeezeend",k),s.removeEventListener("end",ee),s.removeEventListener("inputsourceschange",$);for(let O=0;O<b.length;O++){const Q=A[O];Q!==null&&(A[O]=null,b[O].disconnect(Q))}z=null,B=null,x.reset();for(const O in g)delete g[O];e.setRenderTarget(w),m=null,p=null,u=null,s=null,E=null,ue.stop(),i.isPresenting=!1,e.setPixelRatio(N),e.setSize(P.width,P.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(O){r=O,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(O){l=O,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||o},this.setReferenceSpace=function(O){h=O},this.getBaseLayer=function(){return p!==null?p:m},this.getBinding=function(){return u},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(O){if(s=O,s!==null){if(w=e.getRenderTarget(),s.addEventListener("select",k),s.addEventListener("selectstart",k),s.addEventListener("selectend",k),s.addEventListener("squeeze",k),s.addEventListener("squeezestart",k),s.addEventListener("squeezeend",k),s.addEventListener("end",ee),s.addEventListener("inputsourceschange",$),f.xrCompatible!==!0&&await t.makeXRCompatible(),N=e.getPixelRatio(),e.getSize(P),typeof XRWebGLBinding<"u"&&(u=new XRWebGLBinding(s,t)),u!==null&&"createProjectionLayer"in XRWebGLBinding.prototype){let Z=null,ge=null,ye=null;f.depth&&(ye=f.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Z=f.stencil?Ps:Cs,ge=f.stencil?Rs:bi);const Le={colorFormat:t.RGBA8,depthFormat:ye,scaleFactor:r};p=u.createProjectionLayer(Le),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),E=new Ei(p.textureWidth,p.textureHeight,{format:xn,type:Fn,depthTexture:new zc(p.textureWidth,p.textureHeight,ge,void 0,void 0,void 0,void 0,void 0,void 0,Z),stencilBuffer:f.stencil,colorSpace:e.outputColorSpace,samples:f.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{const Z={antialias:f.antialias,alpha:!0,depth:f.depth,stencil:f.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,Z),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),E=new Ei(m.framebufferWidth,m.framebufferHeight,{format:xn,type:Fn,colorSpace:e.outputColorSpace,stencilBuffer:f.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(d),h=null,o=await s.requestReferenceSpace(l),ue.setContext(s),ue.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function $(O){for(let Q=0;Q<O.removed.length;Q++){const Z=O.removed[Q],ge=A.indexOf(Z);ge>=0&&(A[ge]=null,b[ge].disconnect(Z))}for(let Q=0;Q<O.added.length;Q++){const Z=O.added[Q];let ge=A.indexOf(Z);if(ge===-1){for(let Le=0;Le<b.length;Le++)if(Le>=A.length){A.push(Z),ge=Le;break}else if(A[Le]===null){A[Le]=Z,ge=Le;break}if(ge===-1)break}const ye=b[ge];ye&&ye.connect(Z)}}const q=new W,H=new W;function ie(O,Q,Z){q.setFromMatrixPosition(Q.matrixWorld),H.setFromMatrixPosition(Z.matrixWorld);const ge=q.distanceTo(H),ye=Q.projectionMatrix.elements,Le=Z.projectionMatrix.elements,Ze=ye[14]/(ye[10]-1),We=ye[14]/(ye[10]+1),D=(ye[9]+1)/ye[5],it=(ye[9]-1)/ye[5],De=(ye[8]-1)/ye[0],qe=(Le[8]+1)/Le[0],Re=Ze*De,Je=Ze*qe,me=ge/(-De+qe),Fe=me*-De;if(Q.matrixWorld.decompose(O.position,O.quaternion,O.scale),O.translateX(Fe),O.translateZ(me),O.matrixWorld.compose(O.position,O.quaternion,O.scale),O.matrixWorldInverse.copy(O.matrixWorld).invert(),ye[10]===-1)O.projectionMatrix.copy(Q.projectionMatrix),O.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{const Qe=Ze+me,lt=We+me,T=Re-Fe,v=Je+(ge-Fe),j=D*We/lt*Qe,J=it*We/lt*Qe;O.projectionMatrix.makePerspective(T,v,j,J,Qe,lt),O.projectionMatrixInverse.copy(O.projectionMatrix).invert()}}function he(O,Q){Q===null?O.matrixWorld.copy(O.matrix):O.matrixWorld.multiplyMatrices(Q.matrixWorld,O.matrix),O.matrixWorldInverse.copy(O.matrixWorld).invert()}this.updateCamera=function(O){if(s===null)return;let Q=O.near,Z=O.far;x.texture!==null&&(x.depthNear>0&&(Q=x.depthNear),x.depthFar>0&&(Z=x.depthFar)),C.near=S.near=R.near=Q,C.far=S.far=R.far=Z,(z!==C.near||B!==C.far)&&(s.updateRenderState({depthNear:C.near,depthFar:C.far}),z=C.near,B=C.far),C.layers.mask=O.layers.mask|6,R.layers.mask=C.layers.mask&3,S.layers.mask=C.layers.mask&5;const ge=O.parent,ye=C.cameras;he(C,ge);for(let Le=0;Le<ye.length;Le++)he(ye[Le],ge);ye.length===2?ie(C,R,S):C.projectionMatrix.copy(R.projectionMatrix),X(O,C,ge)};function X(O,Q,Z){Z===null?O.matrix.copy(Q.matrixWorld):(O.matrix.copy(Z.matrixWorld),O.matrix.invert(),O.matrix.multiply(Q.matrixWorld)),O.matrix.decompose(O.position,O.quaternion,O.scale),O.updateMatrixWorld(!0),O.projectionMatrix.copy(Q.projectionMatrix),O.projectionMatrixInverse.copy(Q.projectionMatrixInverse),O.isPerspectiveCamera&&(O.fov=lo*2*Math.atan(1/O.projectionMatrix.elements[5]),O.zoom=1)}this.getCamera=function(){return C},this.getFoveation=function(){if(!(p===null&&m===null))return d},this.setFoveation=function(O){d=O,p!==null&&(p.fixedFoveation=O),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=O)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(C)},this.getCameraTexture=function(O){return g[O]};let te=null;function _e(O,Q){if(c=Q.getViewerPose(h||o),_=Q,c!==null){const Z=c.views;m!==null&&(e.setRenderTargetFramebuffer(E,m.framebuffer),e.setRenderTarget(E));let ge=!1;Z.length!==C.cameras.length&&(C.cameras.length=0,ge=!0);for(let We=0;We<Z.length;We++){const D=Z[We];let it=null;if(m!==null)it=m.getViewport(D);else{const qe=u.getViewSubImage(p,D);it=qe.viewport,We===0&&(e.setRenderTargetTextures(E,qe.colorTexture,qe.depthStencilTexture),e.setRenderTarget(E))}let De=y[We];De===void 0&&(De=new pn,De.layers.enable(We),De.viewport=new wt,y[We]=De),De.matrix.fromArray(D.transform.matrix),De.matrix.decompose(De.position,De.quaternion,De.scale),De.projectionMatrix.fromArray(D.projectionMatrix),De.projectionMatrixInverse.copy(De.projectionMatrix).invert(),De.viewport.set(it.x,it.y,it.width,it.height),We===0&&(C.matrix.copy(De.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale)),ge===!0&&C.cameras.push(De)}const ye=s.enabledFeatures;if(ye&&ye.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&u){const We=u.getDepthInformation(Z[0]);We&&We.isValid&&We.texture&&x.init(We,s.renderState)}if(ye&&ye.includes("camera-access")&&(e.state.unbindTexture(),u))for(let We=0;We<Z.length;We++){const D=Z[We].camera;if(D){let it=g[D];it||(it=new qc,g[D]=it);const De=u.getCameraImage(D);it.sourceTexture=De}}}for(let Z=0;Z<b.length;Z++){const ge=A[Z],ye=b[Z];ge!==null&&ye!==void 0&&ye.update(ge,Q,h||o)}te&&te(O,Q),Q.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Q}),_=null}const ue=new Gc;ue.setAnimationLoop(_e),this.setAnimationLoop=function(O){te=O},this.dispose=function(){}}}const di=new Bn,v_=new Pt;function M_(n,e){function t(g,f){g.matrixAutoUpdate===!0&&g.updateMatrix(),f.value.copy(g.matrix)}function i(g,f){f.color.getRGB(g.fogColor.value,Bc(n)),f.isFog?(g.fogNear.value=f.near,g.fogFar.value=f.far):f.isFogExp2&&(g.fogDensity.value=f.density)}function s(g,f,w,E,b){f.isMeshBasicMaterial||f.isMeshLambertMaterial?r(g,f):f.isMeshToonMaterial?(r(g,f),u(g,f)):f.isMeshPhongMaterial?(r(g,f),c(g,f)):f.isMeshStandardMaterial?(r(g,f),p(g,f),f.isMeshPhysicalMaterial&&m(g,f,b)):f.isMeshMatcapMaterial?(r(g,f),_(g,f)):f.isMeshDepthMaterial?r(g,f):f.isMeshDistanceMaterial?(r(g,f),x(g,f)):f.isMeshNormalMaterial?r(g,f):f.isLineBasicMaterial?(o(g,f),f.isLineDashedMaterial&&l(g,f)):f.isPointsMaterial?d(g,f,w,E):f.isSpriteMaterial?h(g,f):f.isShadowMaterial?(g.color.value.copy(f.color),g.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(g,f){g.opacity.value=f.opacity,f.color&&g.diffuse.value.copy(f.color),f.emissive&&g.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(g.map.value=f.map,t(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,t(f.alphaMap,g.alphaMapTransform)),f.bumpMap&&(g.bumpMap.value=f.bumpMap,t(f.bumpMap,g.bumpMapTransform),g.bumpScale.value=f.bumpScale,f.side===$t&&(g.bumpScale.value*=-1)),f.normalMap&&(g.normalMap.value=f.normalMap,t(f.normalMap,g.normalMapTransform),g.normalScale.value.copy(f.normalScale),f.side===$t&&g.normalScale.value.negate()),f.displacementMap&&(g.displacementMap.value=f.displacementMap,t(f.displacementMap,g.displacementMapTransform),g.displacementScale.value=f.displacementScale,g.displacementBias.value=f.displacementBias),f.emissiveMap&&(g.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,g.emissiveMapTransform)),f.specularMap&&(g.specularMap.value=f.specularMap,t(f.specularMap,g.specularMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest);const w=e.get(f),E=w.envMap,b=w.envMapRotation;E&&(g.envMap.value=E,di.copy(b),di.x*=-1,di.y*=-1,di.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(di.y*=-1,di.z*=-1),g.envMapRotation.value.setFromMatrix4(v_.makeRotationFromEuler(di)),g.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=f.reflectivity,g.ior.value=f.ior,g.refractionRatio.value=f.refractionRatio),f.lightMap&&(g.lightMap.value=f.lightMap,g.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,g.lightMapTransform)),f.aoMap&&(g.aoMap.value=f.aoMap,g.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,g.aoMapTransform))}function o(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,f.map&&(g.map.value=f.map,t(f.map,g.mapTransform))}function l(g,f){g.dashSize.value=f.dashSize,g.totalSize.value=f.dashSize+f.gapSize,g.scale.value=f.scale}function d(g,f,w,E){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.size.value=f.size*w,g.scale.value=E*.5,f.map&&(g.map.value=f.map,t(f.map,g.uvTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,t(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function h(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.rotation.value=f.rotation,f.map&&(g.map.value=f.map,t(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,t(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function c(g,f){g.specular.value.copy(f.specular),g.shininess.value=Math.max(f.shininess,1e-4)}function u(g,f){f.gradientMap&&(g.gradientMap.value=f.gradientMap)}function p(g,f){g.metalness.value=f.metalness,f.metalnessMap&&(g.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,g.metalnessMapTransform)),g.roughness.value=f.roughness,f.roughnessMap&&(g.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,g.roughnessMapTransform)),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)}function m(g,f,w){g.ior.value=f.ior,f.sheen>0&&(g.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),g.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(g.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,g.sheenColorMapTransform)),f.sheenRoughnessMap&&(g.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,g.sheenRoughnessMapTransform))),f.clearcoat>0&&(g.clearcoat.value=f.clearcoat,g.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(g.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,g.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(g.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===$t&&g.clearcoatNormalScale.value.negate())),f.dispersion>0&&(g.dispersion.value=f.dispersion),f.iridescence>0&&(g.iridescence.value=f.iridescence,g.iridescenceIOR.value=f.iridescenceIOR,g.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(g.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,g.iridescenceMapTransform)),f.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),f.transmission>0&&(g.transmission.value=f.transmission,g.transmissionSamplerMap.value=w.texture,g.transmissionSamplerSize.value.set(w.width,w.height),f.transmissionMap&&(g.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,g.transmissionMapTransform)),g.thickness.value=f.thickness,f.thicknessMap&&(g.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=f.attenuationDistance,g.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(g.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(g.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=f.specularIntensity,g.specularColor.value.copy(f.specularColor),f.specularColorMap&&(g.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,g.specularColorMapTransform)),f.specularIntensityMap&&(g.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,g.specularIntensityMapTransform))}function _(g,f){f.matcap&&(g.matcap.value=f.matcap)}function x(g,f){const w=e.get(f).light;g.referencePosition.value.setFromMatrixPosition(w.matrixWorld),g.nearDistance.value=w.shadow.camera.near,g.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function S_(n,e,t,i){let s={},r={},o=[];const l=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function d(w,E){const b=E.program;i.uniformBlockBinding(w,b)}function h(w,E){let b=s[w.id];b===void 0&&(_(w),b=c(w),s[w.id]=b,w.addEventListener("dispose",g));const A=E.program;i.updateUBOMapping(w,A);const P=e.render.frame;r[w.id]!==P&&(p(w),r[w.id]=P)}function c(w){const E=u();w.__bindingPointIndex=E;const b=n.createBuffer(),A=w.__size,P=w.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,A,P),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,b),b}function u(){for(let w=0;w<l;w++)if(o.indexOf(w)===-1)return o.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(w){const E=s[w.id],b=w.uniforms,A=w.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let P=0,N=b.length;P<N;P++){const R=Array.isArray(b[P])?b[P]:[b[P]];for(let S=0,y=R.length;S<y;S++){const C=R[S];if(m(C,P,S,A)===!0){const z=C.__offset,B=Array.isArray(C.value)?C.value:[C.value];let k=0;for(let ee=0;ee<B.length;ee++){const $=B[ee],q=x($);typeof $=="number"||typeof $=="boolean"?(C.__data[0]=$,n.bufferSubData(n.UNIFORM_BUFFER,z+k,C.__data)):$.isMatrix3?(C.__data[0]=$.elements[0],C.__data[1]=$.elements[1],C.__data[2]=$.elements[2],C.__data[3]=0,C.__data[4]=$.elements[3],C.__data[5]=$.elements[4],C.__data[6]=$.elements[5],C.__data[7]=0,C.__data[8]=$.elements[6],C.__data[9]=$.elements[7],C.__data[10]=$.elements[8],C.__data[11]=0):($.toArray(C.__data,k),k+=q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,z,C.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(w,E,b,A){const P=w.value,N=E+"_"+b;if(A[N]===void 0)return typeof P=="number"||typeof P=="boolean"?A[N]=P:A[N]=P.clone(),!0;{const R=A[N];if(typeof P=="number"||typeof P=="boolean"){if(R!==P)return A[N]=P,!0}else if(R.equals(P)===!1)return R.copy(P),!0}return!1}function _(w){const E=w.uniforms;let b=0;const A=16;for(let N=0,R=E.length;N<R;N++){const S=Array.isArray(E[N])?E[N]:[E[N]];for(let y=0,C=S.length;y<C;y++){const z=S[y],B=Array.isArray(z.value)?z.value:[z.value];for(let k=0,ee=B.length;k<ee;k++){const $=B[k],q=x($),H=b%A,ie=H%q.boundary,he=H+ie;b+=ie,he!==0&&A-he<q.storage&&(b+=A-he),z.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=b,b+=q.storage}}}const P=b%A;return P>0&&(b+=A-P),w.__size=b,w.__cache={},this}function x(w){const E={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(E.boundary=4,E.storage=4):w.isVector2?(E.boundary=8,E.storage=8):w.isVector3||w.isColor?(E.boundary=16,E.storage=12):w.isVector4?(E.boundary=16,E.storage=16):w.isMatrix3?(E.boundary=48,E.storage=48):w.isMatrix4?(E.boundary=64,E.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),E}function g(w){const E=w.target;E.removeEventListener("dispose",g);const b=o.indexOf(E.__bindingPointIndex);o.splice(b,1),n.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function f(){for(const w in s)n.deleteBuffer(s[w]);o=[],s={},r={}}return{bind:d,update:h,dispose:f}}class y_{constructor(e={}){const{canvas:t=su(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:l=!1,premultipliedAlpha:d=!0,preserveDrawingBuffer:h=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=o;const _=new Uint32Array(4),x=new Int32Array(4);let g=null,f=null;const w=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ei,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const b=this;let A=!1;this._outputColorSpace=nn;let P=0,N=0,R=null,S=-1,y=null;const C=new wt,z=new wt;let B=null;const k=new ot(0);let ee=0,$=t.width,q=t.height,H=1,ie=null,he=null;const X=new wt(0,0,$,q),te=new wt(0,0,$,q);let _e=!1;const ue=new jc;let O=!1,Q=!1;const Z=new Pt,ge=new W,ye=new wt,Le={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ze=!1;function We(){return R===null?H:1}let D=i;function it(M,U){return t.getContext(M,U)}try{const M={alpha:!0,depth:s,stencil:r,antialias:l,premultipliedAlpha:d,preserveDrawingBuffer:h,powerPreference:c,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${go}`),t.addEventListener("webglcontextlost",pe,!1),t.addEventListener("webglcontextrestored",be,!1),t.addEventListener("webglcontextcreationerror",le,!1),D===null){const U="webgl2";if(D=it(U,M),D===null)throw it(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let De,qe,Re,Je,me,Fe,Qe,lt,T,v,j,J,re,Y,Ne,fe,we,Ce,ae,Me,Oe,Pe,xe,Ve;function I(){De=new Dm(D),De.init(),Pe=new p_(D,De),qe=new Tm(D,De,e,Pe),Re=new u_(D,De),qe.reversedDepthBuffer&&p&&Re.buffers.depth.setReversed(!0),Je=new Um(D),me=new Qg,Fe=new f_(D,De,Re,me,qe,Pe,Je),Qe=new Am(b),lt=new Nm(b),T=new ju(D),xe=new bm(D,T),v=new Lm(D,T,Je,xe),j=new Bm(D,v,T,Je),ae=new Fm(D,qe,Fe),fe=new wm(me),J=new Jg(b,Qe,lt,De,qe,xe,fe),re=new M_(b,me),Y=new t_,Ne=new o_(De),Ce=new ym(b,Qe,lt,Re,j,m,d),we=new d_(b,j,qe),Ve=new S_(D,Je,qe,Re),Me=new Em(D,De,Je),Oe=new Im(D,De,Je),Je.programs=J.programs,b.capabilities=qe,b.extensions=De,b.properties=me,b.renderLists=Y,b.shadowMap=we,b.state=Re,b.info=Je}I();const de=new x_(b,D);this.xr=de,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const M=De.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=De.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(M){M!==void 0&&(H=M,this.setSize($,q,!1))},this.getSize=function(M){return M.set($,q)},this.setSize=function(M,U,G=!0){if(de.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=M,q=U,t.width=Math.floor(M*H),t.height=Math.floor(U*H),G===!0&&(t.style.width=M+"px",t.style.height=U+"px"),this.setViewport(0,0,M,U)},this.getDrawingBufferSize=function(M){return M.set($*H,q*H).floor()},this.setDrawingBufferSize=function(M,U,G){$=M,q=U,H=G,t.width=Math.floor(M*G),t.height=Math.floor(U*G),this.setViewport(0,0,M,U)},this.getCurrentViewport=function(M){return M.copy(C)},this.getViewport=function(M){return M.copy(X)},this.setViewport=function(M,U,G,V){M.isVector4?X.set(M.x,M.y,M.z,M.w):X.set(M,U,G,V),Re.viewport(C.copy(X).multiplyScalar(H).round())},this.getScissor=function(M){return M.copy(te)},this.setScissor=function(M,U,G,V){M.isVector4?te.set(M.x,M.y,M.z,M.w):te.set(M,U,G,V),Re.scissor(z.copy(te).multiplyScalar(H).round())},this.getScissorTest=function(){return _e},this.setScissorTest=function(M){Re.setScissorTest(_e=M)},this.setOpaqueSort=function(M){ie=M},this.setTransparentSort=function(M){he=M},this.getClearColor=function(M){return M.copy(Ce.getClearColor())},this.setClearColor=function(){Ce.setClearColor(...arguments)},this.getClearAlpha=function(){return Ce.getClearAlpha()},this.setClearAlpha=function(){Ce.setClearAlpha(...arguments)},this.clear=function(M=!0,U=!0,G=!0){let V=0;if(M){let F=!1;if(R!==null){const ce=R.texture.format;F=ce===yo||ce===So||ce===Mo}if(F){const ce=R.texture.type,Se=ce===Fn||ce===bi||ce===As||ce===Rs||ce===xo||ce===vo,Ae=Ce.getClearColor(),Ee=Ce.getClearAlpha(),ze=Ae.r,He=Ae.g,Ue=Ae.b;Se?(_[0]=ze,_[1]=He,_[2]=Ue,_[3]=Ee,D.clearBufferuiv(D.COLOR,0,_)):(x[0]=ze,x[1]=He,x[2]=Ue,x[3]=Ee,D.clearBufferiv(D.COLOR,0,x))}else V|=D.COLOR_BUFFER_BIT}U&&(V|=D.DEPTH_BUFFER_BIT),G&&(V|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",pe,!1),t.removeEventListener("webglcontextrestored",be,!1),t.removeEventListener("webglcontextcreationerror",le,!1),Ce.dispose(),Y.dispose(),Ne.dispose(),me.dispose(),Qe.dispose(),lt.dispose(),j.dispose(),xe.dispose(),Ve.dispose(),J.dispose(),de.dispose(),de.removeEventListener("sessionstart",It),de.removeEventListener("sessionend",qt),En.stop()};function pe(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function be(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;const M=Je.autoReset,U=we.enabled,G=we.autoUpdate,V=we.needsUpdate,F=we.type;I(),Je.autoReset=M,we.enabled=U,we.autoUpdate=G,we.needsUpdate=V,we.type=F}function le(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function ne(M){const U=M.target;U.removeEventListener("dispose",ne),Te(U)}function Te(M){Ge(M),me.remove(M)}function Ge(M){const U=me.get(M).programs;U!==void 0&&(U.forEach(function(G){J.releaseProgram(G)}),M.isShaderMaterial&&J.releaseShaderCache(M))}this.renderBufferDirect=function(M,U,G,V,F,ce){U===null&&(U=Le);const Se=F.isMesh&&F.matrixWorld.determinant()<0,Ae=St(M,U,G,V,F);Re.setMaterial(V,Se);let Ee=G.index,ze=1;if(V.wireframe===!0){if(Ee=v.getWireframeAttribute(G),Ee===void 0)return;ze=2}const He=G.drawRange,Ue=G.attributes.position;let Ye=He.start*ze,ht=(He.start+He.count)*ze;ce!==null&&(Ye=Math.max(Ye,ce.start*ze),ht=Math.min(ht,(ce.start+ce.count)*ze)),Ee!==null?(Ye=Math.max(Ye,0),ht=Math.min(ht,Ee.count)):Ue!=null&&(Ye=Math.max(Ye,0),ht=Math.min(ht,Ue.count));const yt=ht-Ye;if(yt<0||yt===1/0)return;xe.setup(F,V,Ae,G,Ee);let xt,mt=Me;if(Ee!==null&&(xt=T.get(Ee),mt=Oe,mt.setIndex(xt)),F.isMesh)V.wireframe===!0?(Re.setLineWidth(V.wireframeLinewidth*We()),mt.setMode(D.LINES)):mt.setMode(D.TRIANGLES);else if(F.isLine){let ke=V.linewidth;ke===void 0&&(ke=1),Re.setLineWidth(ke*We()),F.isLineSegments?mt.setMode(D.LINES):F.isLineLoop?mt.setMode(D.LINE_LOOP):mt.setMode(D.LINE_STRIP)}else F.isPoints?mt.setMode(D.POINTS):F.isSprite&&mt.setMode(D.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)Ji("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),mt.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(De.get("WEBGL_multi_draw"))mt.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{const ke=F._multiDrawStarts,vt=F._multiDrawCounts,tt=F._multiDrawCount,Kt=Ee?T.get(Ee).bytesPerElement:1,Ri=me.get(V).currentProgram.getUniforms();for(let Zt=0;Zt<tt;Zt++)Ri.setValue(D,"_gl_DrawID",Zt),mt.render(ke[Zt]/Kt,vt[Zt])}else if(F.isInstancedMesh)mt.renderInstances(Ye,yt,F.count);else if(G.isInstancedBufferGeometry){const ke=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,vt=Math.min(G.instanceCount,ke);mt.renderInstances(Ye,yt,vt)}else mt.render(Ye,yt)};function at(M,U,G){M.transparent===!0&&M.side===Ln&&M.forceSinglePass===!1?(M.side=$t,M.needsUpdate=!0,dt(M,U,G),M.side=ti,M.needsUpdate=!0,dt(M,U,G),M.side=Ln):dt(M,U,G)}this.compile=function(M,U,G=null){G===null&&(G=M),f=Ne.get(G),f.init(U),E.push(f),G.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),M!==G&&M.traverseVisible(function(F){F.isLight&&F.layers.test(U.layers)&&(f.pushLight(F),F.castShadow&&f.pushShadow(F))}),f.setupLights();const V=new Set;return M.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;const ce=F.material;if(ce)if(Array.isArray(ce))for(let Se=0;Se<ce.length;Se++){const Ae=ce[Se];at(Ae,G,F),V.add(Ae)}else at(ce,G,F),V.add(ce)}),f=E.pop(),V},this.compileAsync=function(M,U,G=null){const V=this.compile(M,U,G);return new Promise(F=>{function ce(){if(V.forEach(function(Se){me.get(Se).currentProgram.isReady()&&V.delete(Se)}),V.size===0){F(M);return}setTimeout(ce,10)}De.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let et=null;function Lt(M){et&&et(M)}function It(){En.stop()}function qt(){En.start()}const En=new Gc;En.setAnimationLoop(Lt),typeof self<"u"&&En.setContext(self),this.setAnimationLoop=function(M){et=M,de.setAnimationLoop(M),M===null?En.stop():En.start()},de.addEventListener("sessionstart",It),de.addEventListener("sessionend",qt),this.render=function(M,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),de.enabled===!0&&de.isPresenting===!0&&(de.cameraAutoUpdate===!0&&de.updateCamera(U),U=de.getCamera()),M.isScene===!0&&M.onBeforeRender(b,M,U,R),f=Ne.get(M,E.length),f.init(U),E.push(f),Z.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),ue.setFromProjectionMatrix(Z,Sn,U.reversedDepth),Q=this.localClippingEnabled,O=fe.init(this.clippingPlanes,Q),g=Y.get(M,w.length),g.init(),w.push(g),de.enabled===!0&&de.isPresenting===!0){const ce=b.xr.getDepthSensingMesh();ce!==null&&os(ce,U,-1/0,b.sortObjects)}os(M,U,0,b.sortObjects),g.finish(),b.sortObjects===!0&&g.sort(ie,he),Ze=de.enabled===!1||de.isPresenting===!1||de.hasDepthSensing()===!1,Ze&&Ce.addToRenderList(g,M),this.info.render.frame++,O===!0&&fe.beginShadows();const G=f.state.shadowsArray;we.render(G,M,U),O===!0&&fe.endShadows(),this.info.autoReset===!0&&this.info.reset();const V=g.opaque,F=g.transmissive;if(f.setupLights(),U.isArrayCamera){const ce=U.cameras;if(F.length>0)for(let Se=0,Ae=ce.length;Se<Ae;Se++){const Ee=ce[Se];se(V,F,M,Ee)}Ze&&Ce.render(M);for(let Se=0,Ae=ce.length;Se<Ae;Se++){const Ee=ce[Se];ls(g,M,Ee,Ee.viewport)}}else F.length>0&&se(V,F,M,U),Ze&&Ce.render(M),ls(g,M,U);R!==null&&N===0&&(Fe.updateMultisampleRenderTarget(R),Fe.updateRenderTargetMipmap(R)),M.isScene===!0&&M.onAfterRender(b,M,U),xe.resetDefaultState(),S=-1,y=null,E.pop(),E.length>0?(f=E[E.length-1],O===!0&&fe.setGlobalState(b.clippingPlanes,f.state.camera)):f=null,w.pop(),w.length>0?g=w[w.length-1]:g=null};function os(M,U,G,V){if(M.visible===!1)return;if(M.layers.test(U.layers)){if(M.isGroup)G=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(U);else if(M.isLight)f.pushLight(M),M.castShadow&&f.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||ue.intersectsSprite(M)){V&&ye.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Z);const Se=j.update(M),Ae=M.material;Ae.visible&&g.push(M,Se,Ae,G,ye.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||ue.intersectsObject(M))){const Se=j.update(M),Ae=M.material;if(V&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),ye.copy(M.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),ye.copy(Se.boundingSphere.center)),ye.applyMatrix4(M.matrixWorld).applyMatrix4(Z)),Array.isArray(Ae)){const Ee=Se.groups;for(let ze=0,He=Ee.length;ze<He;ze++){const Ue=Ee[ze],Ye=Ae[Ue.materialIndex];Ye&&Ye.visible&&g.push(M,Se,Ye,G,ye.z,Ue)}}else Ae.visible&&g.push(M,Se,Ae,G,ye.z,null)}}const ce=M.children;for(let Se=0,Ae=ce.length;Se<Ae;Se++)os(ce[Se],U,G,V)}function ls(M,U,G,V){const F=M.opaque,ce=M.transmissive,Se=M.transparent;f.setupLightsView(G),O===!0&&fe.setGlobalState(b.clippingPlanes,G),V&&Re.viewport(C.copy(V)),F.length>0&&Be(F,U,G),ce.length>0&&Be(ce,U,G),Se.length>0&&Be(Se,U,G),Re.buffers.depth.setTest(!0),Re.buffers.depth.setMask(!0),Re.buffers.color.setMask(!0),Re.setPolygonOffset(!1)}function se(M,U,G,V){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;f.state.transmissionRenderTarget[V.id]===void 0&&(f.state.transmissionRenderTarget[V.id]=new Ei(1,1,{generateMipmaps:!0,type:De.has("EXT_color_buffer_half_float")||De.has("EXT_color_buffer_float")?Ds:Fn,minFilter:_i,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace}));const ce=f.state.transmissionRenderTarget[V.id],Se=V.viewport||C;ce.setSize(Se.z*b.transmissionResolutionScale,Se.w*b.transmissionResolutionScale);const Ae=b.getRenderTarget(),Ee=b.getActiveCubeFace(),ze=b.getActiveMipmapLevel();b.setRenderTarget(ce),b.getClearColor(k),ee=b.getClearAlpha(),ee<1&&b.setClearColor(16777215,.5),b.clear(),Ze&&Ce.render(G);const He=b.toneMapping;b.toneMapping=ei;const Ue=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),f.setupLightsView(V),O===!0&&fe.setGlobalState(b.clippingPlanes,V),Be(M,G,V),Fe.updateMultisampleRenderTarget(ce),Fe.updateRenderTargetMipmap(ce),De.has("WEBGL_multisampled_render_to_texture")===!1){let Ye=!1;for(let ht=0,yt=U.length;ht<yt;ht++){const xt=U[ht],mt=xt.object,ke=xt.geometry,vt=xt.material,tt=xt.group;if(vt.side===Ln&&mt.layers.test(V.layers)){const Kt=vt.side;vt.side=$t,vt.needsUpdate=!0,ct(mt,G,V,ke,vt,tt),vt.side=Kt,vt.needsUpdate=!0,Ye=!0}}Ye===!0&&(Fe.updateMultisampleRenderTarget(ce),Fe.updateRenderTargetMipmap(ce))}b.setRenderTarget(Ae,Ee,ze),b.setClearColor(k,ee),Ue!==void 0&&(V.viewport=Ue),b.toneMapping=He}function Be(M,U,G){const V=U.isScene===!0?U.overrideMaterial:null;for(let F=0,ce=M.length;F<ce;F++){const Se=M[F],Ae=Se.object,Ee=Se.geometry,ze=Se.group;let He=Se.material;He.allowOverride===!0&&V!==null&&(He=V),Ae.layers.test(G.layers)&&ct(Ae,U,G,Ee,He,ze)}}function ct(M,U,G,V,F,ce){M.onBeforeRender(b,U,G,V,F,ce),M.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),F.onBeforeRender(b,U,G,V,M,ce),F.transparent===!0&&F.side===Ln&&F.forceSinglePass===!1?(F.side=$t,F.needsUpdate=!0,b.renderBufferDirect(G,U,V,F,M,ce),F.side=ti,F.needsUpdate=!0,b.renderBufferDirect(G,U,V,F,M,ce),F.side=Ln):b.renderBufferDirect(G,U,V,F,M,ce),M.onAfterRender(b,U,G,V,F,ce)}function dt(M,U,G){U.isScene!==!0&&(U=Le);const V=me.get(M),F=f.state.lights,ce=f.state.shadowsArray,Se=F.state.version,Ae=J.getParameters(M,F.state,ce,U,G),Ee=J.getProgramCacheKey(Ae);let ze=V.programs;V.environment=M.isMeshStandardMaterial?U.environment:null,V.fog=U.fog,V.envMap=(M.isMeshStandardMaterial?lt:Qe).get(M.envMap||V.environment),V.envMapRotation=V.environment!==null&&M.envMap===null?U.environmentRotation:M.envMapRotation,ze===void 0&&(M.addEventListener("dispose",ne),ze=new Map,V.programs=ze);let He=ze.get(Ee);if(He!==void 0){if(V.currentProgram===He&&V.lightsStateVersion===Se)return Gt(M,Ae),He}else Ae.uniforms=J.getUniforms(M),M.onBeforeCompile(Ae,b),He=J.acquireProgram(Ae,Ee),ze.set(Ee,He),V.uniforms=Ae.uniforms;const Ue=V.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Ue.clippingPlanes=fe.uniform),Gt(M,Ae),V.needsLights=Et(M),V.lightsStateVersion=Se,V.needsLights&&(Ue.ambientLightColor.value=F.state.ambient,Ue.lightProbe.value=F.state.probe,Ue.directionalLights.value=F.state.directional,Ue.directionalLightShadows.value=F.state.directionalShadow,Ue.spotLights.value=F.state.spot,Ue.spotLightShadows.value=F.state.spotShadow,Ue.rectAreaLights.value=F.state.rectArea,Ue.ltc_1.value=F.state.rectAreaLTC1,Ue.ltc_2.value=F.state.rectAreaLTC2,Ue.pointLights.value=F.state.point,Ue.pointLightShadows.value=F.state.pointShadow,Ue.hemisphereLights.value=F.state.hemi,Ue.directionalShadowMap.value=F.state.directionalShadowMap,Ue.directionalShadowMatrix.value=F.state.directionalShadowMatrix,Ue.spotShadowMap.value=F.state.spotShadowMap,Ue.spotLightMatrix.value=F.state.spotLightMatrix,Ue.spotLightMap.value=F.state.spotLightMap,Ue.pointShadowMap.value=F.state.pointShadowMap,Ue.pointShadowMatrix.value=F.state.pointShadowMatrix),V.currentProgram=He,V.uniformsList=null,He}function At(M){if(M.uniformsList===null){const U=M.currentProgram.getUniforms();M.uniformsList=_r.seqWithValue(U.seq,M.uniforms)}return M.uniformsList}function Gt(M,U){const G=me.get(M);G.outputColorSpace=U.outputColorSpace,G.batching=U.batching,G.batchingColor=U.batchingColor,G.instancing=U.instancing,G.instancingColor=U.instancingColor,G.instancingMorph=U.instancingMorph,G.skinning=U.skinning,G.morphTargets=U.morphTargets,G.morphNormals=U.morphNormals,G.morphColors=U.morphColors,G.morphTargetsCount=U.morphTargetsCount,G.numClippingPlanes=U.numClippingPlanes,G.numIntersection=U.numClipIntersection,G.vertexAlphas=U.vertexAlphas,G.vertexTangents=U.vertexTangents,G.toneMapping=U.toneMapping}function St(M,U,G,V,F){U.isScene!==!0&&(U=Le),Fe.resetTextureUnits();const ce=U.fog,Se=V.isMeshStandardMaterial?U.environment:null,Ae=R===null?b.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:is,Ee=(V.isMeshStandardMaterial?lt:Qe).get(V.envMap||Se),ze=V.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,He=!!G.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ue=!!G.morphAttributes.position,Ye=!!G.morphAttributes.normal,ht=!!G.morphAttributes.color;let yt=ei;V.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(yt=b.toneMapping);const xt=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,mt=xt!==void 0?xt.length:0,ke=me.get(V),vt=f.state.lights;if(O===!0&&(Q===!0||M!==y)){const zt=M===y&&V.id===S;fe.setState(V,M,zt)}let tt=!1;V.version===ke.__version?(ke.needsLights&&ke.lightsStateVersion!==vt.state.version||ke.outputColorSpace!==Ae||F.isBatchedMesh&&ke.batching===!1||!F.isBatchedMesh&&ke.batching===!0||F.isBatchedMesh&&ke.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&ke.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&ke.instancing===!1||!F.isInstancedMesh&&ke.instancing===!0||F.isSkinnedMesh&&ke.skinning===!1||!F.isSkinnedMesh&&ke.skinning===!0||F.isInstancedMesh&&ke.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&ke.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&ke.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&ke.instancingMorph===!1&&F.morphTexture!==null||ke.envMap!==Ee||V.fog===!0&&ke.fog!==ce||ke.numClippingPlanes!==void 0&&(ke.numClippingPlanes!==fe.numPlanes||ke.numIntersection!==fe.numIntersection)||ke.vertexAlphas!==ze||ke.vertexTangents!==He||ke.morphTargets!==Ue||ke.morphNormals!==Ye||ke.morphColors!==ht||ke.toneMapping!==yt||ke.morphTargetsCount!==mt)&&(tt=!0):(tt=!0,ke.__version=V.version);let Kt=ke.currentProgram;tt===!0&&(Kt=dt(V,U,F));let Ri=!1,Zt=!1,cs=!1;const Mt=Kt.getUniforms(),an=ke.uniforms;if(Re.useProgram(Kt.program)&&(Ri=!0,Zt=!0,cs=!0),V.id!==S&&(S=V.id,Zt=!0),Ri||y!==M){Re.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Mt.setValue(D,"projectionMatrix",M.projectionMatrix),Mt.setValue(D,"viewMatrix",M.matrixWorldInverse);const Vt=Mt.map.cameraPosition;Vt!==void 0&&Vt.setValue(D,ge.setFromMatrixPosition(M.matrixWorld)),qe.logarithmicDepthBuffer&&Mt.setValue(D,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Mt.setValue(D,"isOrthographic",M.isOrthographicCamera===!0),y!==M&&(y=M,Zt=!0,cs=!0)}if(F.isSkinnedMesh){Mt.setOptional(D,F,"bindMatrix"),Mt.setOptional(D,F,"bindMatrixInverse");const zt=F.skeleton;zt&&(zt.boneTexture===null&&zt.computeBoneTexture(),Mt.setValue(D,"boneTexture",zt.boneTexture,Fe))}F.isBatchedMesh&&(Mt.setOptional(D,F,"batchingTexture"),Mt.setValue(D,"batchingTexture",F._matricesTexture,Fe),Mt.setOptional(D,F,"batchingIdTexture"),Mt.setValue(D,"batchingIdTexture",F._indirectTexture,Fe),Mt.setOptional(D,F,"batchingColorTexture"),F._colorsTexture!==null&&Mt.setValue(D,"batchingColorTexture",F._colorsTexture,Fe));const on=G.morphAttributes;if((on.position!==void 0||on.normal!==void 0||on.color!==void 0)&&ae.update(F,G,Kt),(Zt||ke.receiveShadow!==F.receiveShadow)&&(ke.receiveShadow=F.receiveShadow,Mt.setValue(D,"receiveShadow",F.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(an.envMap.value=Ee,an.flipEnvMap.value=Ee.isCubeTexture&&Ee.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&U.environment!==null&&(an.envMapIntensity.value=U.environmentIntensity),Zt&&(Mt.setValue(D,"toneMappingExposure",b.toneMappingExposure),ke.needsLights&&Ut(an,cs),ce&&V.fog===!0&&re.refreshFogUniforms(an,ce),re.refreshMaterialUniforms(an,V,H,q,f.state.transmissionRenderTarget[M.id]),_r.upload(D,At(ke),an,Fe)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(_r.upload(D,At(ke),an,Fe),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Mt.setValue(D,"center",F.center),Mt.setValue(D,"modelViewMatrix",F.modelViewMatrix),Mt.setValue(D,"normalMatrix",F.normalMatrix),Mt.setValue(D,"modelMatrix",F.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){const zt=V.uniformsGroups;for(let Vt=0,Dr=zt.length;Vt<Dr;Vt++){const ii=zt[Vt];Ve.update(ii,Kt),Ve.bind(ii,Kt)}}return Kt}function Ut(M,U){M.ambientLightColor.needsUpdate=U,M.lightProbe.needsUpdate=U,M.directionalLights.needsUpdate=U,M.directionalLightShadows.needsUpdate=U,M.pointLights.needsUpdate=U,M.pointLightShadows.needsUpdate=U,M.spotLights.needsUpdate=U,M.spotLightShadows.needsUpdate=U,M.rectAreaLights.needsUpdate=U,M.hemisphereLights.needsUpdate=U}function Et(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(M,U,G){const V=me.get(M);V.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),me.get(M.texture).__webglTexture=U,me.get(M.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:G,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,U){const G=me.get(M);G.__webglFramebuffer=U,G.__useDefaultFramebuffer=U===void 0};const _t=D.createFramebuffer();this.setRenderTarget=function(M,U=0,G=0){R=M,P=U,N=G;let V=!0,F=null,ce=!1,Se=!1;if(M){const Ee=me.get(M);if(Ee.__useDefaultFramebuffer!==void 0)Re.bindFramebuffer(D.FRAMEBUFFER,null),V=!1;else if(Ee.__webglFramebuffer===void 0)Fe.setupRenderTarget(M);else if(Ee.__hasExternalTextures)Fe.rebindTextures(M,me.get(M.texture).__webglTexture,me.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const Ue=M.depthTexture;if(Ee.__boundDepthTexture!==Ue){if(Ue!==null&&me.has(Ue)&&(M.width!==Ue.image.width||M.height!==Ue.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Fe.setupDepthRenderbuffer(M)}}const ze=M.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(Se=!0);const He=me.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(He[U])?F=He[U][G]:F=He[U],ce=!0):M.samples>0&&Fe.useMultisampledRTT(M)===!1?F=me.get(M).__webglMultisampledFramebuffer:Array.isArray(He)?F=He[G]:F=He,C.copy(M.viewport),z.copy(M.scissor),B=M.scissorTest}else C.copy(X).multiplyScalar(H).floor(),z.copy(te).multiplyScalar(H).floor(),B=_e;if(G!==0&&(F=_t),Re.bindFramebuffer(D.FRAMEBUFFER,F)&&V&&Re.drawBuffers(M,F),Re.viewport(C),Re.scissor(z),Re.setScissorTest(B),ce){const Ee=me.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,Ee.__webglTexture,G)}else if(Se){const Ee=U;for(let ze=0;ze<M.textures.length;ze++){const He=me.get(M.textures[ze]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+ze,He.__webglTexture,G,Ee)}}else if(M!==null&&G!==0){const Ee=me.get(M.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Ee.__webglTexture,G)}S=-1},this.readRenderTargetPixels=function(M,U,G,V,F,ce,Se,Ae=0){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=me.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Se!==void 0&&(Ee=Ee[Se]),Ee){Re.bindFramebuffer(D.FRAMEBUFFER,Ee);try{const ze=M.textures[Ae],He=ze.format,Ue=ze.type;if(!qe.textureFormatReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qe.textureTypeReadable(Ue)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=M.width-V&&G>=0&&G<=M.height-F&&(M.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Ae),D.readPixels(U,G,V,F,Pe.convert(He),Pe.convert(Ue),ce))}finally{const ze=R!==null?me.get(R).__webglFramebuffer:null;Re.bindFramebuffer(D.FRAMEBUFFER,ze)}}},this.readRenderTargetPixelsAsync=async function(M,U,G,V,F,ce,Se,Ae=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=me.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Se!==void 0&&(Ee=Ee[Se]),Ee)if(U>=0&&U<=M.width-V&&G>=0&&G<=M.height-F){Re.bindFramebuffer(D.FRAMEBUFFER,Ee);const ze=M.textures[Ae],He=ze.format,Ue=ze.type;if(!qe.textureFormatReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qe.textureTypeReadable(Ue))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ye=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Ye),D.bufferData(D.PIXEL_PACK_BUFFER,ce.byteLength,D.STREAM_READ),M.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Ae),D.readPixels(U,G,V,F,Pe.convert(He),Pe.convert(Ue),0);const ht=R!==null?me.get(R).__webglFramebuffer:null;Re.bindFramebuffer(D.FRAMEBUFFER,ht);const yt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await ru(D,yt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Ye),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,ce),D.deleteBuffer(Ye),D.deleteSync(yt),ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,U=null,G=0){const V=Math.pow(2,-G),F=Math.floor(M.image.width*V),ce=Math.floor(M.image.height*V),Se=U!==null?U.x:0,Ae=U!==null?U.y:0;Fe.setTexture2D(M,0),D.copyTexSubImage2D(D.TEXTURE_2D,G,0,0,Se,Ae,F,ce),Re.unbindTexture()};const Yt=D.createFramebuffer(),st=D.createFramebuffer();this.copyTextureToTexture=function(M,U,G=null,V=null,F=0,ce=null){ce===null&&(F!==0?(Ji("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ce=F,F=0):ce=0);let Se,Ae,Ee,ze,He,Ue,Ye,ht,yt;const xt=M.isCompressedTexture?M.mipmaps[ce]:M.image;if(G!==null)Se=G.max.x-G.min.x,Ae=G.max.y-G.min.y,Ee=G.isBox3?G.max.z-G.min.z:1,ze=G.min.x,He=G.min.y,Ue=G.isBox3?G.min.z:0;else{const on=Math.pow(2,-F);Se=Math.floor(xt.width*on),Ae=Math.floor(xt.height*on),M.isDataArrayTexture?Ee=xt.depth:M.isData3DTexture?Ee=Math.floor(xt.depth*on):Ee=1,ze=0,He=0,Ue=0}V!==null?(Ye=V.x,ht=V.y,yt=V.z):(Ye=0,ht=0,yt=0);const mt=Pe.convert(U.format),ke=Pe.convert(U.type);let vt;U.isData3DTexture?(Fe.setTexture3D(U,0),vt=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Fe.setTexture2DArray(U,0),vt=D.TEXTURE_2D_ARRAY):(Fe.setTexture2D(U,0),vt=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const tt=D.getParameter(D.UNPACK_ROW_LENGTH),Kt=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Ri=D.getParameter(D.UNPACK_SKIP_PIXELS),Zt=D.getParameter(D.UNPACK_SKIP_ROWS),cs=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,xt.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,xt.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,ze),D.pixelStorei(D.UNPACK_SKIP_ROWS,He),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ue);const Mt=M.isDataArrayTexture||M.isData3DTexture,an=U.isDataArrayTexture||U.isData3DTexture;if(M.isDepthTexture){const on=me.get(M),zt=me.get(U),Vt=me.get(on.__renderTarget),Dr=me.get(zt.__renderTarget);Re.bindFramebuffer(D.READ_FRAMEBUFFER,Vt.__webglFramebuffer),Re.bindFramebuffer(D.DRAW_FRAMEBUFFER,Dr.__webglFramebuffer);for(let ii=0;ii<Ee;ii++)Mt&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,me.get(M).__webglTexture,F,Ue+ii),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,me.get(U).__webglTexture,ce,yt+ii)),D.blitFramebuffer(ze,He,Se,Ae,Ye,ht,Se,Ae,D.DEPTH_BUFFER_BIT,D.NEAREST);Re.bindFramebuffer(D.READ_FRAMEBUFFER,null),Re.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(F!==0||M.isRenderTargetTexture||me.has(M)){const on=me.get(M),zt=me.get(U);Re.bindFramebuffer(D.READ_FRAMEBUFFER,Yt),Re.bindFramebuffer(D.DRAW_FRAMEBUFFER,st);for(let Vt=0;Vt<Ee;Vt++)Mt?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,on.__webglTexture,F,Ue+Vt):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,on.__webglTexture,F),an?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,zt.__webglTexture,ce,yt+Vt):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,zt.__webglTexture,ce),F!==0?D.blitFramebuffer(ze,He,Se,Ae,Ye,ht,Se,Ae,D.COLOR_BUFFER_BIT,D.NEAREST):an?D.copyTexSubImage3D(vt,ce,Ye,ht,yt+Vt,ze,He,Se,Ae):D.copyTexSubImage2D(vt,ce,Ye,ht,ze,He,Se,Ae);Re.bindFramebuffer(D.READ_FRAMEBUFFER,null),Re.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else an?M.isDataTexture||M.isData3DTexture?D.texSubImage3D(vt,ce,Ye,ht,yt,Se,Ae,Ee,mt,ke,xt.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(vt,ce,Ye,ht,yt,Se,Ae,Ee,mt,xt.data):D.texSubImage3D(vt,ce,Ye,ht,yt,Se,Ae,Ee,mt,ke,xt):M.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,ce,Ye,ht,Se,Ae,mt,ke,xt.data):M.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,ce,Ye,ht,xt.width,xt.height,mt,xt.data):D.texSubImage2D(D.TEXTURE_2D,ce,Ye,ht,Se,Ae,mt,ke,xt);D.pixelStorei(D.UNPACK_ROW_LENGTH,tt),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Kt),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Ri),D.pixelStorei(D.UNPACK_SKIP_ROWS,Zt),D.pixelStorei(D.UNPACK_SKIP_IMAGES,cs),ce===0&&U.generateMipmaps&&D.generateMipmap(vt),Re.unbindTexture()},this.copyTextureToTexture3D=function(M,U,G=null,V=null,F=0){return Ji('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,U,G,V,F)},this.initRenderTarget=function(M){me.get(M).__webglFramebuffer===void 0&&Fe.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?Fe.setTextureCube(M,0):M.isData3DTexture?Fe.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?Fe.setTexture2DArray(M,0):Fe.setTexture2D(M,0),Re.unbindTexture()},this.resetState=function(){P=0,N=0,R=null,Re.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}}const xi=({lens:n,grid:e,routes:t,names:i})=>`${n}|${Number(e)}${Number(t)}${Number(i)}`,Yc=n=>({width:Math.ceil(n.cssW*n.dpr),height:Math.ceil(n.cssH*n.dpr)});function b_(n,e,t){const i=[];for(let s=0;s<e;s+=t)for(let r=0;r<n;r+=t){const o=Math.min(t,n-r),l=Math.min(t,e-s),d=+(r>0),h=+(s>0);i.push({x:r,y:s,w:o,h:l,left:d,top:h,sw:o+d+ +(r+o<n),sh:l+h+ +(s+l<e)})}return i}class E_{constructor(e){this.scene=e,this.network=hh(e.w,e.infra),this.cityById=new Map(e.cities.map(t=>[Number(t.id),t])),this.routes=[{id:"routes",z:55,draw:(t,i,s,r)=>{fh(t,this.network,i,r),ph(t,this.network,i,r)}}]}network;lens=null;cityById;routes;paint(e,t){const i=this.passes(e,t);for(let s=i.next();;s=i.next())if(s.done)return s.value}async paintCooperative(e,t,i){const s=this.passes(e,t);let r=performance.now();for(let o=s.next();;o=s.next()){if(o.done)return o.value;if(performance.now()-r>=12){if(await new Promise(l=>setTimeout(l,0)),i())return null;r=performance.now()}}}*passes(e,t){let i=performance.now(),s=0;const{width:r,height:o}=Yc(t.vp);e.width!==r&&(e.width=r),e.height!==o&&(e.height=o);const l=e.getContext("2d");if(!l)throw new Error("无法创建底图绘制缓冲。");const{w:d,lenses:h}=this.scene,c=t.lens==="terrain"?null:h[t.lens];(this.lens!==t.lens||!d.colors)&&(xa(d,c),this.lens=t.lens);const u={},p=Do(),m={stamps:0,cities:0,citySpills:0,planHits:0,planMisses:0,planCells:0,patternPathHits:0,patternPathMisses:0,spriteBytes:0,citySpriteBytes:0,patternBytes:0,retainedSpriteBytes:0,spriteHits:0,spriteMisses:0},_=hd(l,t.vp,d,{lens:c,timings:u,counts:m,selectedCity:t.selectedCity===null?null:this.cityById.get(t.selectedCity),layers:t.routes?this.routes:[],grid:t.grid,labels:t.names});for(let g=_.next();!g.done;g=_.next())s+=performance.now()-i,yield,i=performance.now();const x=Do(ud(d));return m.spriteBytes=x.pixels*4,m.citySpriteBytes=fd()*4,m.patternBytes=x.patternPixels*4,m.retainedSpriteBytes=x.retainedPixels*4,m.spriteHits=x.hits-p.hits,m.spriteMisses=x.misses-p.misses,{paintMs:s+performance.now()-i,sections:u,spriteCache:x.count,art:m}}}function Wn(n){"close"in n?n.close():n.width=n.height=0}async function T_(n,e){const{x:t,y:i,left:s,top:r,sw:o,sh:l}=e;
/* Crop in canvas coordinates. Some WebKit versions misplace bitmap crops when flipY is requested. */
const d=document.createElement("canvas");return d.width=o,d.height=l,d.getContext("2d").drawImage(n,t-s,i-r,o,l,0,0,o,l),{...e,image:d}}class w_{constructor(e){this.gl=e,this.extension=e.getExtension("EXT_disjoint_timer_query_webgl2")}extension;pending=[];samples=[];begin(){const e=this.extension;if(!e||this.pending.length>=8)return null;const t=this.gl.createQuery();return t&&this.gl.beginQuery(e.TIME_ELAPSED_EXT,t),t}end(e,t){!e||!this.extension||(this.gl.endQuery(this.extension.TIME_ELAPSED_EXT),this.pending.push({query:e,bytes:t}))}read(){const e=this.extension;if(!e)return this.samples.slice();for(;this.pending.length&&this.gl.getQueryParameter(this.pending[0].query,this.gl.QUERY_RESULT_AVAILABLE);){if(this.gl.getParameter(e.GPU_DISJOINT_EXT)){this.clear();break}const{query:t,bytes:i}=this.pending.shift();this.samples.push({ms:Number(this.gl.getQueryParameter(t,this.gl.QUERY_RESULT))/1e6,bytes:i}),this.gl.deleteQuery(t),this.samples.length>4096&&this.samples.shift()}return this.samples.slice()}clear(){for(const{query:e}of this.pending)this.gl.deleteQuery(e);this.pending.length=0}restore(){this.extension=this.gl.getExtension("EXT_disjoint_timer_query_webgl2")}}const ho={maxDpr:2,maxSurfaceBytes:28*2**20,maxCacheBytes:128*2**20,tileEdge:512,uploadBytes:4*2**20,uploadMs:3,adaptive:!0};class A_{constructor(e){this.profile=e,this.edge=e.tileEdge}slow=0;averageMsPerMiB=2;edge;mayUpload(e,t,i){const s=this.averageMsPerMiB*e/1048576,r=this.profile.adaptive?s*1.3+.25:s;return t+e<=this.profile.uploadBytes&&(t===0||i<this.profile.uploadMs&&i+r<=this.profile.uploadMs)}observe(e,t,i){t>=16384*4&&(this.averageMsPerMiB=.75*this.averageMsPerMiB+.25*e*2**20/t),!(!this.profile.adaptive||i!==this.edge||this.edge===256)&&(this.slow=e>this.profile.uploadMs?this.slow+1:Math.max(0,this.slow-1),this.slow>=2&&(this.edge=this.edge===1022?512:256,this.slow=0))}}function R_(n){const e=n.getExtension("WEBGL_debug_renderer_info");return{webgl2:!0,gpu:String(e?n.getParameter(e.UNMASKED_RENDERER_WEBGL):n.getParameter(n.RENDERER)),maxTextureSize:Number(n.getParameter(n.MAX_TEXTURE_SIZE)),maxArrayLayers:Number(n.getParameter(n.MAX_ARRAY_TEXTURE_LAYERS)),maxTextureUnits:Number(n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS)),maxCombinedUnits:Number(n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS)),maxRenderbufferSize:Number(n.getParameter(n.MAX_RENDERBUFFER_SIZE)),maxViewport:Array.from(n.getParameter(n.MAX_VIEWPORT_DIMS)),highp:n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT)?.precision??0,highpIntRange:n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_INT)?.rangeMax??0}}function ar(n,e,t,i){const[s,r]=n.toKm([e.x,e.y]),o=t/(e.width/1e3);return{x:s,y:r,scale:o,w:t,h:i,toScreen:(l,d)=>[(l-s)*o+t/2,(d-r)*o+i/2],toWorld:(l,d)=>[(l-t/2)/o+s,(d-i/2)/o+r],view:()=>({x0:s-t/2/o,y0:r-i/2/o,x1:s+t/2/o,y1:r+i/2/o})}}const C_=160,ql=140,or=.001,P_=12e3,lr=n=>n.sw*n.sh*4,ha=n=>n.width*n.height*4,ua=n=>{const{width:e,height:t}=Yc(n);return e*t*4};function fn(n,e){return{x0:Math.max(n.x0,e.x0),x1:Math.min(n.x1,e.x1),y0:Math.max(n.y0,e.y0),y1:Math.min(n.y1,e.y1)}}function Kn(n){return Math.max(0,n.x1-n.x0)*Math.max(0,n.y1-n.y0)}function Vi(n,e){return Kn(fn(n,e))/Kn(n)}function Yl(n,e,t,{x:i,y:s,w:r,h:o}){const l=(n.x1-n.x0)/e,d=(n.y1-n.y0)/t;return{x0:n.x0+i*l,y0:n.y0+s*d,x1:n.x0+(i+r)*l,y1:n.y0+(s+o)*d}}class N_{constructor(e,t,i,s,r,o=ho){this.canvas=e,this.overlay=t,this.onContext=s,this.onFrame=r,this.profile=o;const l=e.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!l)throw new Error("此浏览器无法创建 WebGL2 上下文。");if(this.capabilities=R_(l),this.capabilities.maxTextureSize<4096||!this.capabilities.highp||!this.capabilities.highpIntRange)throw new Error("此设备的 WebGL2 纹理尺寸或片元精度低于原型要求。");this.scene="w"in i?i:pd(i),this.renderer=new y_({canvas:e,context:l}),this.renderer.info.autoReset=!1,this.renderer.setClearColor(new ot(md)),this.camera.position.z=10,this.octx=t.getContext("2d"),this.budget=new A_(o);const d=new URLSearchParams(location.search);if(d.has("bench")&&d.has("gpu-timing")&&(this.gpuTimer=new w_(l)),!Number.isFinite(o.uploadMs)||o.uploadMs<=0||o.uploadBytes<(o.tileEdge+2)**2*4||o.uploadBytes>4*2**20)throw new RangeError("Invalid atlas upload profile");xa(this.scene.w,null),this.startWorker(),e.addEventListener("webglcontextlost",this.contextLost),e.addEventListener("webglcontextrestored",this.contextRestored)}renderer;scene3=new Nu;camera=new Hc(-1,1,1,-1,.1,100);quad=new Bs(1,1);octx;budget;gpuTimer;painter;worker=null;workerTimer=0;workerJob=null;current=null;backdrop=null;incoming=null;capture=null;exportBytes=0;retiringTileBytes=0;workerArtBytes=0;mainArtBytes=0;raf=0;confirmGl=!1;settleTimer=0;nextId=0;epoch=0;lastMotion=0;lastCameraLead=[0,0];lastInput=null;desired=null;previousView=null;lastGl=null;lastOverlay=null;cssWidth=0;cssHeight=0;dpr=1;appliedLens="terrain";staticPaints=0;disposed=!1;paintTrace=[];rasterEvents=[];scene;capabilities;colorsVersion=0;hits=[];lost=!1;stats=null;contextLost=e=>{e.preventDefault(),this.lost=!0,this.lastGl=this.lastOverlay=null,this.epoch++,this.gpuTimer?.clear(),this.rejectCapture(new DOMException("显示上下文已丢失。","AbortError")),this.stats=null,this.releaseFrame(this.incoming),this.releaseFrame(this.backdrop),this.incoming=this.backdrop=null,this.current&&this.releaseMeshes(this.current),this.onContext(!0)};contextRestored=()=>{if(this.lost=!1,this.gpuTimer?.restore(),this.current&&this.desired){const e=this.current,t=ar(this.scene,this.desired.view,this.desired.width,this.desired.height);this.incoming=this.makeFrame(e.request,e.source,{...e.trace,id:++this.nextId,tileEdge:this.budget.edge,uploads:[],batches:[],splitMs:0,displayed:!1,displayMs:null},performance.now(),t),this.current=null}this.onContext(!1),this.scheduleFrame()};update(e){this.desired=e,this.scheduleFrame()}noteCameraInput(){this.lastInput=performance.now()}getPaintTrace(){return this.paintTrace.slice()}getRasterEvents(){return this.rasterEvents.slice()}record(e,t,i){const{id:s,vp:r}=e;this.rasterEvents.push({id:s,at:performance.now(),state:t,style:xi(e),scale:r.s,bytes:i}),this.rasterEvents.length>1024&&this.rasterEvents.shift()}getRenderedView(){return this.previousView}getGpuUploadTrace(){return this.gpuTimer?.read()??[]}pixelRatio(e,t){return Math.min(devicePixelRatio||1,this.profile.maxDpr,this.capabilities.maxViewport[0]/e,this.capabilities.maxViewport[1]/t,this.capabilities.maxRenderbufferSize/Math.max(e,t),Math.sqrt(this.profile.maxSurfaceBytes/(4*(e+1)*(t+1))))}
// City selection is rendered by the overlay and does not change the terrain raster.
key(e,t,i,s=this.pixelRatio(t,i)){return`${xi(e)}|${s}|${t}x${i}`}makeRequest(e,t,i){const s=e.view(),r=e.scale,o=this.pixelRatio(e.w,e.h),l=this.profile.maxSurfaceBytes/(4*o*o),d=(Math.sqrt((e.w-e.h)**2+4*l)-e.w-e.h)/4,h=Math.max(0,Math.min(C_,Math.floor(d)-1)),c=h/r,u=c*i[0]*.6,p=c*i[1]*.6,{lens:m,grid:_,routes:x,names:g,selectedCity:f}=t;return{id:++this.nextId,key:this.key(t,e.w,e.h,o),lens:m,grid:_,routes:x,names:g,selectedCity:f,vp:{x0:s.x0-c+u,y0:s.y0-c+p,x1:s.x1+c+u,y1:s.y1+c+p,s:r,dpr:o,cssW:e.w+2*h,cssH:e.h+2*h}}}startWorker(){if(!(typeof Worker>"u"||typeof OffscreenCanvas>"u"||typeof createImageBitmap!="function"||new URLSearchParams(location.search).has("main-raster")))try{const e=new Worker(new URL(""+new URL("staticMap.worker-DvLbC59N.js",import.meta.url).href,import.meta.url),{type:"module"});this.worker=e,e.onmessage=({data:o})=>this.receiveRaster(o),e.onerror=o=>{o.preventDefault(),this.stopWorker()},e.onmessageerror=()=>this.stopWorker();const{w:t,cities:i,lenses:s,infra:r}=this.scene;e.postMessage({init:{raw:t.raw,stateLabels:t.stateLabels,cities:i,lenses:s,infra:r}})}catch{this.stopWorker()}}stopWorker(){this.worker?.terminate(),this.worker=null,this.workerJob?.kind==="map"&&this.record(this.workerJob.request,"discarded",0),this.workerJob=null,this.workerArtBytes=0,clearTimeout(this.workerTimer),this.scheduleFrame()}receiveRaster(e){if("error"in e){this.stopWorker();return}const t="cancelled"in e?e.cancelled:e.id,i=this.workerJob;if(!i||i.request.id!==t){"image"in e&&e.image.close();return}this.workerJob=null,clearTimeout(this.workerTimer);const s=performance.now(),r=this.desired,{request:o,kind:l,epoch:d,start:h}=i;if("timing"in e&&(this.workerArtBytes=this.artBytes(e.timing)),"cancelled"in e)this.record(o,"cancelled",0);else if(this.disposed||this.lost||d!==this.epoch)e.image.close(),l==="map"&&this.record(o,"discarded",0);else if(this.resolveMatchingCapture(o,e.image,"worker"),l==="map"&&!i.cancelled&&r&&o.key===this.key(r.opts,r.width,r.height)){this.releaseFrame(this.incoming);const c=ar(this.scene,r.view,r.width,r.height);this.incoming=this.makeFrame(o,e.image,{...e.timing,id:e.id,mode:"worker",splitMs:0,tileEdge:this.budget.edge,transferMs:Math.max(0,performance.timeOrigin+s-e.finishedAt),roundTripMs:s-h,uploads:[],batches:[],displayed:!1,displayMs:null},h,c)}else e.image.close(),l==="map"&&this.record(o,"discarded",0);this.scheduleFrame()}paintOnMain(e){this.painter??=new E_({...this.scene,w:{...this.scene.w}});const t=document.createElement("canvas");try{return{image:t,timing:{...this.painter.paint(t,e),rasterizeMs:0}}}catch(i){throw Wn(t),i}}submit(e,t,i){const s=performance.now();if(t==="map"&&this.record(e,"requested"),this.worker){this.workerJob={request:e,start:s,kind:t,epoch:this.epoch,cancelled:!1};try{this.worker.postMessage({request:e}),this.workerTimer=window.setTimeout(()=>this.stopWorker(),P_);return}catch{this.stopWorker()}}let r;try{r=this.paintOnMain(e)}catch(o){if(t==="capture"){this.rejectCapture(o);return}throw o}this.mainArtBytes=this.artBytes(r.timing),this.resolveMatchingCapture(e,r.image,"main"),t==="map"?this.incoming=this.makeFrame(e,r.image,{...r.timing,id:e.id,mode:"main",transferMs:0,roundTripMs:performance.now()-s,splitMs:0,tileEdge:this.budget.edge,uploads:[],batches:[],displayed:!1,displayMs:null},s,i):Wn(r.image)}makeFrame(e,t,i,s,r){const o=this.budget.edge,l=r.view(),d=b_(t.width,t.height,o).map(h=>{const c=Yl(e.vp,t.width,t.height,h);return{tile:h,visible:Kn(fn(l,c))>0,distance:Math.hypot((c.x0+c.x1)/2-r.x,(c.y0+c.y1)/2-r.y)}});return d.sort((h,c)=>Number(c.visible)-Number(h.visible)||h.distance-c.distance),this.paintTrace.push(i),this.paintTrace.length>256&&this.paintTrace.shift(),{request:e,source:t,trace:i,start:s,area:d.map(h=>h.tile),edge:o,ready:[],uploaded:[],preparing:!1,prepared:0,preparedBytes:0,released:!1,gpuBytes:0,group:new bs}}prepareTiles(e){if(e.preparing||e.prepared>=e.area.length)return;const t=[];let i=0;for(;e.prepared<e.area.length&&t.length<8;){const r=e.area[e.prepared],o=lr(r);if(e.preparedBytes+i+o>this.profile.uploadBytes)break;e.prepared++,i+=o,t.push(r)}if(!t.length)return;e.preparing=!0,e.preparedBytes+=i;const s=performance.now();Promise.allSettled(t.map(r=>T_(e.source,r))).then(r=>{e.trace.splitMs+=performance.now()-s,e.preparing=!1;const o=r.flatMap(l=>l.status==="fulfilled"?[l.value]:[]);if(e.released||this.lost||o.length!==r.length){for(const l of o)Wn(l.image);e.preparedBytes-=i,e.released&&(this.retiringTileBytes-=i),!e.released&&!this.lost&&(this.releaseFrame(e),this.incoming===e&&(this.incoming=null),this.stopWorker())}else e.ready.push(...o);this.scheduleFrame()})}uploadTile(e,t){const i=this.profile.adaptive?performance.now():0,{image:s,w:r,h:o,left:l,top:d,sw:h,sh:c}=t,u=Yl(e.request.vp,e.source.width,e.source.height,t),p=new Uu(s);p.flipY=!0,p.colorSpace=nn,p.generateMipmaps=!1,p.minFilter=p.magFilter=_n,p.offset.set(l/h,(c-d-o)/c),p.repeat.set(r/h,o/c),p.needsUpdate=!0;const m=new yn(this.quad,new To({map:p,toneMapped:!1,depthTest:!1,depthWrite:!1}));m.position.set((u.x0+u.x1)/2,-(u.y0+u.y1)/2,0),m.scale.set(u.x1-u.x0,u.y1-u.y0,1),m.renderOrder=2;const _=performance.now();this.renderer.initTexture(p);const x=performance.now()-_,g=lr(t);return Wn(s),p.image=null,e.group.add(m),e.uploaded.push(u),e.gpuBytes+=g,e.preparedBytes-=g,e.trace.uploads.push({ms:x,bytes:g}),this.budget.observe(this.profile.adaptive?performance.now()-i:x,g,e.edge),x}releaseMeshes(e){this.scene3.remove(e.group);for(const t of e.group.children)t.material.map.dispose(),t.material.dispose();e.group.clear(),e.gpuBytes=0}releaseFrame(e){if(!(!e||e.released)){e.released=!0,this.releaseMeshes(e);for(const t of e.ready)Wn(t.image),e.preparedBytes-=lr(t);e.preparing&&(this.retiringTileBytes+=e.preparedBytes),e.ready=[],Wn(e.source)}}artBytes({art:e}){return e.spriteBytes+e.citySpriteBytes+e.patternBytes+e.retainedSpriteBytes}cacheBytes(){let e=this.exportBytes+this.retiringTileBytes+(this.workerJob?ua(this.workerJob.request.vp):0);for(const t of[this.current,this.backdrop,this.incoming])t&&(e+=ha(t.source)+t.gpuBytes+t.preparedBytes);return e}reserve(e){return this.backdrop&&this.cacheBytes()+e>this.profile.maxCacheBytes&&(this.releaseFrame(this.backdrop),this.backdrop=null),this.cacheBytes()+e<=this.profile.maxCacheBytes}refreshOverlay(){this.lastOverlay=null,this.scheduleFrame()}scheduleFrame(){this.raf||!this.desired||this.lost||this.disposed||(this.raf=requestAnimationFrame(()=>{this.raf=0,!(!this.desired||this.lost)&&(this.render(this.desired),this.onFrame())}))}commit(e){const t=this.current;if(t&&t.request.key===e.request.key&&t.request.vp.s<e.request.vp.s*.8&&(!this.backdrop||t.request.vp.s<this.backdrop.request.vp.s)){this.releaseFrame(this.backdrop),this.backdrop=t;for(const i of t.group.children)i.renderOrder=0}else this.releaseFrame(t);this.current=e,this.incoming=null,e.group.visible=!0,this.scene3.add(e.group);for(const i of e.group.children)i.renderOrder=1;e.trace.displayed=!0,e.trace.displayMs=performance.now()-e.start,this.staticPaints++,this.record(e.request,"committed"),this.appliedLens!==e.request.lens&&(this.appliedLens=e.request.lens,xa(this.scene.w,this.appliedLens==="terrain"?null:this.scene.lenses[this.appliedLens]),this.colorsVersion++)}updateRaster(e,t,i,s){const r=this.key(t,e.w,e.h),o=e.view();this.backdrop&&this.backdrop.request.key!==r&&(this.releaseFrame(this.backdrop),this.backdrop=null);const l=this.current?.request,d=this.incoming?.request,h=l?Vi(o,l.vp):0,c=h>=1-1e-6,u=R=>Math.abs(Math.log(e.scale/R.s)),p=R=>{if(R.key!==r)return!0;const S=Vi(o,R.vp);return l?.key===r&&(S<h-1e-6||c&&u(R.vp)>u(l.vp)+or)?!0:!!l&&i&&(S<1-1e-6||u(R.vp)>or)};d&&p(d)&&(this.record(d,"discarded",this.incoming.trace.uploads.reduce((R,S)=>R+S.bytes,0)),this.releaseFrame(this.incoming),this.incoming=null);const m=this.workerJob;m?.kind==="map"&&!m.cancelled&&p(m.request)&&(m.cancelled=!0,this.worker?.postMessage({cancel:m.request.id}));const _=l?e.scale/l.vp.s:1,x=_>=1.65||_<.75,g=this.dpr<1.5&&x;if((l?.key!==r||!c||g||i&&Math.abs(_-1)>or)&&!this.incoming&&!this.workerJob){const R=i?this.dpr>=1.5&&c&&x&&l?.key===r?this.lastCameraLead:[0,0]:s,S=this.makeRequest(e,t,R);this.reserve(2*ua(S.vp)+this.profile.uploadBytes)&&this.submit(S,"map",e)}const w=this.incoming;let E=0,b=0,A=0;if(!w)return{ms:E,bytes:b};const P=performance.now(),N=w.ready.length?this.gpuTimer?.begin()??null:null;try{for(;w.ready.length;){const R=w.ready[0],S=lr(R);if(!this.budget.mayUpload(S,b,performance.now()-P))break;E+=this.uploadTile(w,R),w.ready.shift(),b+=S,A++}}finally{this.gpuTimer?.end(N,b)}return A&&w.trace.batches.push({ms:performance.now()-P,bytes:b,tiles:A}),w.uploaded.length===w.area.length?this.commit(w):(this.current?.request.key===w.request.key&&this.scene3.add(w.group),w.group.visible=this.current?.request.key===w.request.key,this.prepareTiles(w)),(w.ready.length||this.current===w)&&this.scheduleFrame(),{ms:E,bytes:b}}render(e){const{view:t,width:i,height:s,opts:r}=e;if(i<=1||s<=1)return;const o=performance.now(),l=this.pixelRatio(i,s);(l!==this.dpr||i!==this.cssWidth||s!==this.cssHeight)&&(this.renderer.setPixelRatio(l),this.renderer.setSize(i,s,!1),this.overlay.width=Math.round(i*l),this.overlay.height=Math.round(s*l),this.dpr=l,this.cssWidth=i,this.cssHeight=s);const d=this.previousView,h=d?[Math.sign(t.x-d.view.x),Math.sign(d.view.y-t.y)]:[0,0];(!d||d.width!==i||d.height!==s||d.view.x!==t.x||d.view.y!==t.y||d.view.width!==t.width)&&(this.lastMotion=o,this.lastCameraLead=h,clearTimeout(this.settleTimer),this.settleTimer=window.setTimeout(()=>this.scheduleFrame(),ql)),this.previousView=e;const c=ar(this.scene,t,i,s),u=this.capture;if(u&&!this.workerJob){const H=u.request.vp.dpr,ie=Math.floor(u.cam.w*H)*Math.floor(u.cam.h*H)*4;this.reserve(ua(u.request.vp)+ie)&&this.submit(u.request,"capture",u.cam)}const p=this.updateRaster(c,r,o-this.lastMotion>=ql,h),m=i/(2*c.scale),_=s/(2*c.scale);this.camera.left=-m,this.camera.right=m,this.camera.top=_,this.camera.bottom=-_,this.camera.position.set(c.x,-c.y,10),this.camera.updateProjectionMatrix();const x=this.current?.request,g=x?.vp,f=c.view(),w=g?Vi(f,g):0,E=this.backdrop?.request.vp;let b=w;if(E&&this.backdrop&&(this.backdrop.group.visible=w<1-1e-6,b+=Vi(f,E)-(g?Vi(f,fn(g,E)):0)),this.incoming&&b>=1-1e-6&&(this.incoming.group.visible=!1),g&&this.incoming?.group.visible&&b<1-1e-6)for(const H of this.incoming.uploaded){const ie=Kn(fn(f,H))-Kn(fn(fn(f,H),g)),he=E?Kn(fn(fn(f,H),E))-Kn(fn(fn(fn(f,H),E),g)):0;b+=(ie-he)/Kn(f)}const A=this.incoming?.group.visible?this.incoming:null,P=this.backdrop?.group.visible?this.backdrop:null,N=this.lastGl,R=this.confirmGl;this.confirmGl=!1;const S=R||!N||N.x!==c.x||N.y!==c.y||N.scale!==c.scale||N.width!==i||N.height!==s||N.dpr!==l||N.current!==this.current||N.backdrop!==P||N.partial!==A||N.tiles!==(A?.uploaded.length??0);S&&(this.renderer.info.reset(),this.renderer.render(this.scene3,this.camera),this.lastGl={x:c.x,y:c.y,scale:c.scale,width:i,height:s,dpr:l,current:this.current,backdrop:P,partial:A,tiles:A?.uploaded.length??0},!R&&(this.current||A)&&(this.confirmGl=!0,this.scheduleFrame()));const y=x?xi(x):null,C=xi(r),z=x?{...r,names:x.names,hoverCell:y===C?r.hoverCell:-1}:r,B=this.lastOverlay;x&&(!B||B.cam.x!==c.x||B.cam.y!==c.y||B.cam.scale!==c.scale||B.cam.w!==i||B.cam.h!==s||B.dpr!==l||B.opts.names!==z.names||B.opts.hoverCell!==z.hoverCell||B.opts.selectedCell!==z.selectedCell||B.opts.selectedCity!==z.selectedCity||B.opts.bannerRight!==z.bannerRight)&&(this.hits=this.drawOverlay(this.octx,c,l,z,!0),this.lastOverlay={cam:c,dpr:l,opts:z});const k=g?this.scene.w.grid.range(g.x0,g.y0,g.x1,g.y1):null,ee=k?Math.max(0,k.r1-k.r0+1)*Math.max(0,k.c1-k.c0+1):0;this.gpuTimer?.read();const $=this.cacheBytes(),q=this.workerArtBytes+this.mainArtBytes;this.stats={frameMs:performance.now()-o,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,instances:(this.current?.trace.art.stamps??0)+(this.current?.trace.art.cities??0)+(this.current?.trace.art.citySpills??0),textureBytes:(this.current?.gpuBytes??0)+(this.backdrop?.gpuBytes??0)+(this.incoming?.gpuBytes??0),bufferWidth:this.canvas.width,bufferHeight:this.canvas.height,staticMs:this.current?.trace.paintMs??0,staticPaints:this.staticPaints,cells:ee,banners:this.hits.length,spriteCache:this.current?.trace.spriteCache??0,staticCurrent:x?.key===this.key(r,i,s)&&w>=1-1e-6&&Math.abs(c.scale/x.vp.s-1)<=or,displayedStyle:y,requestedStyle:C,tileEdge:this.budget.edge,displayedRequest:this.current?.trace.id??null,rasterPending:!!(this.workerJob||this.incoming),terrainStamps:this.current?.trace.art.stamps??0,rasterCities:(this.current?.trace.art.cities??0)+(this.current?.trace.art.citySpills??0),routesDrawn:!!x?.routes&&this.scene.w.grid.R*x.vp.s>=ws,workerMode:this.worker?"worker":"main",uploadMs:p.ms,uploadBytes:p.bytes,cacheBytes:$,artCacheBytes:q,totalTrackedCacheBytes:$+q,webglRendered:S,inputToFrameMs:this.lastInput===null?null:performance.now()-this.lastInput,coverage:Math.max(0,Math.min(1,b)),lod:this.scene.w.grid.R*c.scale<10?"far":this.scene.w.grid.R*c.scale<22?"mid":this.scene.w.grid.R*c.scale<44?"near":"close"},this.lastInput=null}drawOverlay(e,t,i,s,r){const{w:o,h:l}=t,d=s.selectedCity===null?null:this.scene.cityById.get(s.selectedCity)??null;return e.setTransform(1,0,0,1,0,0),r&&e.clearRect(0,0,e.canvas.width,e.canvas.height),e.setTransform(i*t.scale,0,0,i*t.scale,i*(o/2-t.x*t.scale),i*(l/2-t.y*t.scale)),gd(e,t,this.scene.w,{selectedCity:d,hoverCell:s.hoverCell,selectedCell:s.selectedCell},0),s.selectedCell>=0&&!d&&this.outlineCell(e,s.selectedCell,t.scale),e.setTransform(i,0,0,i,0,0),s.names?oh(e,t,this.scene.w,{cities:this.scene.cities,selectedCity:d,hoverCell:s.hoverCell,bannerBounds:s.bannerRight!==null?{x0:0,x1:s.bannerRight}:null},this.scene.yields,this.scene.nation):[]}outlineCell(e,t,i){const s=this.scene.w.grid,r=s.cx(t),o=s.cy(t);e.beginPath(),s.corners.forEach(([l,d],h)=>e[h?"lineTo":"moveTo"](r+l,o+d)),e.closePath(),e.lineJoin="round",e.strokeStyle="rgba(255,214,110,.5)",e.lineWidth=Math.max(5/i,s.R*.16),e.stroke(),e.strokeStyle="#ffe9a8",e.lineWidth=Math.max(2/i,s.R*.05),e.stroke()}matchesCapture(e,t){return e.key===t.request.key&&Math.abs(t.cam.scale/e.vp.s-1)<1e-9&&Vi(t.cam.view(),e.vp)>=1-1e-9}resolveMatchingCapture(e,t,i){const s=this.capture;if(!(!s||!this.matchesCapture(e,s))){this.capture=null,s.signal.removeEventListener("abort",s.onAbort);try{const{cam:r,opts:o}=s,l=r.view(),d=e.vp,h=document.createElement("canvas");h.width=Math.floor(r.w*d.dpr),h.height=Math.floor(r.h*d.dpr);const c=h.getContext("2d");try{const m=t.width/(d.x1-d.x0),_=t.height/(d.y1-d.y0);c.drawImage(t,(l.x0-d.x0)*m,(l.y0-d.y0)*_,(l.x1-l.x0)*m,(l.y1-l.y0)*_,0,0,h.width,h.height),this.drawOverlay(c,r,d.dpr,o,!1)}catch(m){throw Wn(h),m}const u=ha(h);this.exportBytes+=u;let p=!1;s.resolve({canvas:h,ctx:c,scale:h.width/r.w,mode:i,estimatedPeakBytes:this.cacheBytes()+(i==="cache"?0:ha(t)),release:()=>{p||(p=!0,this.exportBytes-=u,Wn(h),this.scheduleFrame())}})}catch(r){s.reject(r)}}}rejectCapture(e){const t=this.capture;t&&(this.capture=null,t.signal.removeEventListener("abort",t.onAbort),t.reject(e))}snapshot(e,t){return new Promise((i,s)=>{if(this.lost||this.disposed||t.aborted)throw new DOMException("截图已取消。","AbortError");if(this.capture||e.width<=1||e.height<=1)throw new Error("当前无法导出地图。");const r=ar(this.scene,e.view,e.width,e.height),o={...e.opts},l=this.makeRequest(r,o,[0,0]),d=()=>this.rejectCapture(new DOMException("截图已取消。","AbortError"));this.capture={request:l,cam:r,opts:o,resolve:i,reject:s,signal:t,onAbort:d},t.addEventListener("abort",d,{once:!0});const h=l.vp.dpr,c=Math.floor(r.w*h)*Math.floor(r.h*h)*4;for(const u of[this.current,this.incoming,this.backdrop])if(!(!u||this.cacheBytes()+c>this.profile.maxCacheBytes)&&(this.resolveMatchingCapture(u.request,u.source,"cache"),!this.capture))return;this.scheduleFrame()})}dispose(){this.disposed=!0,this.rejectCapture(new DOMException("截图已取消。","AbortError")),clearTimeout(this.settleTimer),clearTimeout(this.workerTimer),cancelAnimationFrame(this.raf),this.worker?.terminate(),this.canvas.removeEventListener("webglcontextlost",this.contextLost),this.canvas.removeEventListener("webglcontextrestored",this.contextRestored),this.releaseFrame(this.incoming),this.releaseFrame(this.current),this.releaseFrame(this.backdrop),this.gpuTimer?.clear(),this.quad.dispose(),this.renderer.dispose()}}const xr=(n,e,t)=>Math.max(e,Math.min(t,n));function Ao(n,e){return{x:xr(n.x,e[0],e[2]),y:xr(n.y,e[1],e[3]),width:xr(n.width,6e4,6e6)}}function uo(n,e,t,i,s){const r=n.width/e;return[n.x+(i-e/2)*r,n.y-(s-t/2)*r]}function D_(n,e,t,[i,s]){const r=e/n.width;return[(i-n.x)*r+e/2,(n.y-s)*r+t/2]}function Kc(n,e,t,i,s,r,o){const l=uo(n,e,t,...i),d=xr(n.width*r,6e4,6e6);return Ao({x:l[0]-(s[0]-e/2)*d/e,y:l[1]+(s[1]-t/2)*d/e,width:d},o)}const ms=n=>{const e=document.querySelector(n)?.getBoundingClientRect();return e&&e.width>0?e:void 0},cr=120,Kl=n=>(n.right-n.left)*(n.bottom-n.top);function Zc(n,e,t){const i=n.width,s=n.height,r={left:0,top:0,right:i,bottom:s},o=e?ms('[data-testid="game-panel"]'):void 0;o&&(o.width>i*.6?r.bottom=Math.max(s*.3,o.top-n.top-12):r.right=Math.max(i*.3,o.left-n.left-12-56));const l=ms('[aria-label="地图透镜"]');l&&(r.bottom=Math.max(r.top+cr,Math.min(r.bottom,l.top-n.top-8)));const d=ms('section[aria-label="小地图"]'),h=d&&d.left-n.left<i*.5?{right:d.right-n.left+8,top:d.top-n.top-8}:null,c=ms('[data-testid="guide-card"]')??ms('[data-testid="opening-card"]'),u=c?{right:c.right-n.left+12,bottom:c.bottom-n.top+12}:t?{right:Math.min(330,i-24)+24,bottom:380}:null,p=_=>({left:Math.min(_.left,_.right-cr),top:Math.min(_.top,_.bottom-cr),right:_.right,bottom:_.bottom});let m=u?[p({...r,left:u.right}),p({...r,top:u.bottom})]:[r];return h&&(m=m.flatMap(_=>_.left<h.right&&_.bottom>h.top?[p({..._,left:Math.max(_.left,h.right)}),p({..._,bottom:Math.max(_.top+cr,h.top)})]:[_])),m.reduce((_,x)=>Kl(x)>Kl(_)?x:_)}const fa={terrain:{name:"地形地貌",sub:"山脉、平原与河湖",scale:"",unit:""},population:{name:"人口密度",sub:"观察聚落分布",scale:"population",unit:"人/km²"},economy:{name:"经济活动",sub:"观察经济活动强度",scale:"economy",unit:"合成指数"}},pa=(n,e)=>[(n[0]+e[0])/2,(n[1]+e[1])/2],gs=(n,e)=>Math.hypot(n[0]-e[0],n[1]-e[1]);function L_(n,e){const t=new Map,i=new AbortController,s={signal:i.signal};let r,o=!1,l=!1,d=!1,h=!1,c=null,u=0,p=0,m=0,_=[0,0],x=null;const g=()=>{cancelAnimationFrame(m),_=[0,0]},f=R=>{const S=n.getBoundingClientRect();return[R.clientX-S.left,R.clientY-S.top]},w=R=>R===e.canvas||R instanceof Element&&R.closest("[data-map-marker]")!==null,E=()=>[n.clientWidth,n.clientHeight];
let hoverFrame = 0;
let pendingHover = null;
let hoverActive = false;
function queueHover(event) {
  pendingHover = event;
  if (hoverFrame) return;
  hoverFrame = requestAnimationFrame(() => {
    hoverFrame = 0;
    const latest = pendingHover;
    pendingHover = null;
    hoverActive = true;
    e.hover(f(latest));
  });
}
function clearHover() {
  cancelAnimationFrame(hoverFrame);
  hoverFrame = 0;
  pendingHover = null;
  if (hoverActive) {
    hoverActive = false;
    e.hover(null);
  }
}
function b(R,S,y){e.setView(Kc(e.getView(),...E(),R,S,y,e.bounds))}function A(R,S){const y=e.getView(),C=y.width/n.clientWidth;e.setView(Ao({...y,x:y.x-R*C,y:y.y+S*C},e.bounds))}function P(R){function S(y){const C=Math.min(y-R,32);R=y;const z=Math.exp(-C/103);_=[_[0]*z,_[1]*z],!(Math.hypot(..._)<.04)&&(A(_[0]*C,_[1]*C),m=requestAnimationFrame(S))}matchMedia("(prefers-reduced-motion: reduce)").matches||(m=requestAnimationFrame(S))}n.addEventListener("wheel",R=>{if(!w(R.target))return;R.preventDefault(),g();const S=f(R);b(S,S,Math.exp(Math.max(-140,Math.min(140,R.deltaY*(R.deltaMode===1?16:R.deltaMode===2?n.clientHeight:1)))*.0027))},{...s,passive:!1}),n.addEventListener("pointerdown",R=>{if(R.button!==0||!w(R.target))return;e.canvas.focus({preventScroll:!0}),n.setPointerCapture(R.pointerId),g(),clearTimeout(r);const S=f(R),y=performance.now();if(t.set(R.pointerId,{start:S,position:S,type:R.pointerType}),t.size===1)o=l=d=h=!1,c=null,u=p=y,R.pointerType!=="mouse"&&(r=setTimeout(()=>{o=!0,x=null,e.inspect(S)},400));else{d=!0,o=!1,x=null,clearHover();const[C,z]=t.values();c=pa(C.position,z.position),t.size>2&&(h=!0)}},s),n.addEventListener("pointermove",R=>{const y=t.get(R.pointerId);if(!y){if(R.pointerType==="mouse"){if(w(R.target))queueHover(R);else clearHover()}return}const S=f(R),C=y.position,[z,B]=t.values(),k=B?pa(z.position,B.position):S,ee=B?gs(z.position,B.position):0;if(y.position=S,B&&(y===z||y===B)){const ie=pa(z.position,B.position),he=gs(z.position,B.position);gs(y.start,S)>9&&(h=!0),h&&ee>2&&he>2&&b(k,ie,ee/he);return}if(t.size!==1||o||!l&&gs(y.start,S)<5)return;const $=l?C:y.start;l=!0,d&&(h=!0),x=null,clearTimeout(r),clearHover(),A(S[0]-$[0],S[1]-$[1]);const q=performance.now(),H=Math.max(10,q-p);_=[(S[0]-$[0])/H,(S[1]-$[1])/H],p=q},s);function N(R,S){const y=t.get(R.pointerId);if(!y)return;t.delete(R.pointerId),clearTimeout(r),S&&(h=l=!0,x=null);const C=performance.now();if(t.size===1&&d){const k=t.values().next().value;k.start=k.position,_=[0,0],p=C,l=h}if(t.size)return;const z=f(R),B=y.type!=="mouse";S||o||(d?!h&&c&&C-u<320&&b(c,c,1.35):l?B&&C-p<65&&P(C):B&&x&&C-x.at<300&&gs(x.point,z)<35?(x=null,b(z,z,.67)):(e.tap(z,B),x=B?{at:C,point:z}:null))}return n.addEventListener("pointerup",R=>N(R,!1),s),n.addEventListener("pointercancel",R=>N(R,!0),s),n.addEventListener("lostpointercapture",R=>N(R,!0),s),n.addEventListener("pointerleave",()=>clearHover(),s),n.addEventListener("contextmenu",R=>{w(R.target)&&(R.preventDefault(),e.inspect(f(R)))},s),n.addEventListener("dblclick",R=>{if(!w(R.target)||R.sourceCapabilities?.firesTouchEvents)return;const S=f(R);b(S,S,.66)},s),n.addEventListener("keydown",R=>{if(R.target!==e.canvas)return;const S=R.key.toLowerCase();if(["arrowleft","a","arrowright","d","arrowup","w","arrowdown","s"].includes(S)){R.preventDefault();const y=R.shiftKey?160:62;A(["a","arrowleft"].includes(S)?y:["d","arrowright"].includes(S)?-y:0,["w","arrowup"].includes(S)?y:["s","arrowdown"].includes(S)?-y:0)}else if(S==="+"||S==="="||S==="-"){R.preventDefault();const[y,C]=E(),z=[y/2,C/2];b(z,z,S==="-"?1.32:.76)}},s),()=>{i.abort(),clearTimeout(r),g(),cancelAnimationFrame(hoverFrame)}}const I_={map:a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"}),a.jsx("path",{d:"M9 3v15M15 6v15"})]}),layers:a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"m12 3 9 5-9 5L3 8z"}),a.jsx("path",{d:"m3 12 9 5 9-5M3 16l9 5 9-5"})]}),mountain:a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"m2 19 7-12 4 7 3-5 6 10z"}),a.jsx("path",{d:"m6.6 11 2.4 2 2.3-2M16 5h.01"})]}),people:a.jsxs(a.Fragment,{children:[a.jsx("circle",{cx:"9",cy:"8",r:"3"}),a.jsx("path",{d:"M3 20v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2m1-15a3 3 0 0 1 0 6m1 3a4 4 0 0 1 4 4v2"})]}),economy:a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"M3 20h18M6 16v-4m6 4V7m6 9V4"}),a.jsx("path",{d:"M3 5v15"})]}),route:a.jsxs(a.Fragment,{children:[a.jsx("circle",{cx:"5",cy:"6",r:"2"}),a.jsx("circle",{cx:"19",cy:"18",r:"2"}),a.jsx("path",{d:"M7 6h9a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h9"})]}),hex:a.jsx("path",{d:"m12 2 8.66 5v10L12 22l-8.66-5V7z"}),eye:a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"}),a.jsx("circle",{cx:"12",cy:"12",r:"2.5"})]}),book:a.jsx(a.Fragment,{children:a.jsx("path",{d:"M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zM12 6v14"})}),search:a.jsxs(a.Fragment,{children:[a.jsx("circle",{cx:"10.5",cy:"10.5",r:"5.5"}),a.jsx("path",{d:"m15 15 5 5"})]}),crosshair:a.jsxs(a.Fragment,{children:[a.jsx("circle",{cx:"12",cy:"12",r:"6"}),a.jsx("path",{d:"M12 2v5m0 10v5M2 12h5m10 0h5"})]}),plus:a.jsx("path",{d:"M12 5v14M5 12h14"}),minus:a.jsx("path",{d:"M5 12h14"}),close:a.jsx("path",{d:"m6 6 12 12M18 6 6 18"}),arrow:a.jsx("path",{d:"M4 12h15m-6-6 6 6-6 6"}),pin:a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"M19 10c0 5-7 10-7 10s-7-5-7-10a7 7 0 1 1 14 0z"}),a.jsx("circle",{cx:"12",cy:"10",r:"2"})]}),city:a.jsx(a.Fragment,{children:a.jsx("path",{d:"M2 20h20M5 20V9l4 2 3-5 3 5 4-2v11M9 20v-5h6v5M4 9h16M12 6V3"})}),camera:a.jsxs(a.Fragment,{children:[a.jsx("path",{d:"M3 7h4l2-3h6l2 3h4v13H3z"}),a.jsx("circle",{cx:"12",cy:"13",r:"4"})]}),info:a.jsxs(a.Fragment,{children:[a.jsx("circle",{cx:"12",cy:"12",r:"9"}),a.jsx("path",{d:"M12 11v5m0-8h.01"})]}),pointer:a.jsx("path",{d:"m4 3 14 8-7 2-3 7z"}),compass:a.jsxs(a.Fragment,{children:[a.jsx("circle",{cx:"12",cy:"12",r:"9"}),a.jsx("path",{d:"m15.5 7-2 6-5 4 2-6z"})]})};function qn({name:n,size:e=20}){return a.jsx("svg",{width:e,height:e,viewBox:"0 0 24 24","aria-hidden":"true",fill:"none",stroke:"currentColor",strokeWidth:"1.55",strokeLinecap:"round",strokeLinejoin:"round",children:I_[n]})}const fo=["housing","school","hospital","civic"],U_={housing:"住房",school:"学位",hospital:"医疗",civic:"社区服务"},Jc={housing:1,school:.2,hospital:.35,civic:.3},po=(n,e,t)=>n.cities[e][t];function Qc(n,e,t){const i=n.cities[e].pop;return Math.max(0,i-po(n,e,t)/Jc[t])}const ed=(n,e,t)=>{const i=yd(n,e,t);return(Math.min(1e4,i.housingRatioBp)+Math.min(1e4,i.eduBp)+Math.min(1e4,i.healthBp))/3/1e4},td=(n,e)=>{const t=e.cities.map((i,s)=>({i:s,c:ed(n,e,s)})).sort((i,s)=>i.c-s.c||i.i-s.i);return t.slice(0,Math.max(1,Math.floor(t.length/5))).map(i=>i.i)},nd=(n,e,t)=>t.reduce((i,s)=>i+ed(n,e,s),0)/Math.max(1,t.length),Zl=(n,e)=>nd(n,e,td(n,e)),Yi=n=>Number((n/1e4).toFixed(1)),Jl=n=>{let e=0,t=0;return n.cities.forEach((i,s)=>{const r=fo.map(o=>Qc(n,s,o));e+=Math.max(...r),t+=Math.min(i.pop,r.reduce((o,l)=>o+l,0))}),[Yi(e),Yi(t)]};function F_(n,e,t){const i=fo.map(d=>({kind:d,start:0,filled:0})),s=new Set;n.cities.forEach((d,h)=>fo.forEach((c,u)=>{const p=Qc(e,h,c),m=(po(t,h,c)-po(e,h,c))/Jc[c];i[u].start+=p,i[u].filled+=Math.min(p,Math.max(0,m)),m>0&&s.add(h)}));const r=Ma(i,d=>d.start),o=Ma(i,d=>d.filled),l=td(e,n);return{startPersonTimesWan:Yi(r),filledPersonTimesWan:Yi(o),filledPct:r>0?Number((o/r*100).toFixed(1)):0,byKind:i.map(d=>({kind:d.kind,name:U_[d.kind],startWan:Yi(d.start),filledWan:Yi(d.filled),pct:d.start>0?Number((d.filled/d.start*100).toFixed(1)):0})),startPersonsWan:Jl(e),nowPersonsWan:Jl(t),benefited:s.size,cities:n.cities.length,lowStart:Number(Zl(e,n).toFixed(4)),lowNow:Number(Zl(t,n).toFixed(4)),lowStartGroupNow:Number(nd(t,n,l).toFixed(4)),lowGroupSize:l.length}}function B_(n){const e=Sd(n.cities),t=Math.max(1,n.baseline.gini);return{giniNowBp:e,giniStartBp:n.baseline.gini,changePct:Number(((e-t)/t*100).toFixed(1)),score:Math.round(Math.min(100,Math.max(0,45+(t-e)/t*400)))}}function O_(n){const e=n.history;if(e.length<4||n.baseline.gdp<=0)return null;const t=e[e.length-1].gdp,i=Ma(e.slice(-4),h=>h.gdp)/4,s=e.length,r=s-1.5,o=(h,c)=>(Math.pow(h,4/c)-1)*100,l=t/n.baseline.gdp,d=i/n.baseline.gdp;return{turn:s,finalAnnual:t*4,avg4Annual:i*4,startAnnual:n.baseline.gdp*4,finalCumPct:Number(((l-1)*100).toFixed(1)),avg4CumPct:Number(((d-1)*100).toFixed(1)),finalYearlyPct:Number(o(l,s).toFixed(2)),avg4YearlyPct:Number(o(d,r).toFixed(2)),finalAt:s,avg4At:r}}function k_(n,e,t){return{region:B_(t),service:F_(n,e,t),growth:O_(t),nation:Md(t)}}const j_="_muted_rf0a3_5",z_="_note_rf0a3_6",H_="_top_rf0a3_9",G_="_brand_rf0a3_15",V_="_emblem_rf0a3_16",W_="_brandText_rf0a3_17",X_="_quarter_rf0a3_18",$_="_yields_rf0a3_21",q_="_spacer_rf0a3_24",Y_="_trialTag_rf0a3_25",K_="_tbButtons_rf0a3_26",Z_="_btn_rf0a3_27",J_="_hint_rf0a3_32",Q_="_bar_rf0a3_39",ex="_cats_rf0a3_41",tx="_cat_rf0a3_41",nx="_status_rf0a3_46",ix="_fiscal_rf0a3_49",sx="_fiscalMain_rf0a3_52",rx="_pay_rf0a3_57",ax="_afford_rf0a3_65",ox="_quote_rf0a3_68",lx="_budget_rf0a3_72",cx="_report_rf0a3_74",dx="_endTurn_rf0a3_76",hx="_flyout_rf0a3_81",ux="_flyHead_rf0a3_83",fx="_flyRow_rf0a3_87",px="_tool_rf0a3_88",mx="_steppers_rf0a3_94",gx="_step_rf0a3_94",_x="_techNote_rf0a3_101",xx="_panel_rf0a3_104",vx="_openPanel_rf0a3_106",Mx="_tabs_rf0a3_107",Sx="_collapse_rf0a3_111",yx="_body_rf0a3_112",bx="_cityHead_rf0a3_113",Ex="_stripe_rf0a3_114",Tx="_kind_rf0a3_115",wx="_chips_rf0a3_117",Ax="_popLine_rf0a3_120",Rx="_close_rf0a3_123",Cx="_gold_rf0a3_124",Px="_sec_rf0a3_126",Nx="_row_rf0a3_130",Dx="_tiles_rf0a3_133",Lx="_spark_rf0a3_137",Ix="_groups_rf0a3_139",Ux="_buildRow_rf0a3_142",Fx="_order_rf0a3_148",Bx="_btnRow_rf0a3_148",Ox="_mini_rf0a3_148",kx="_lock_rf0a3_151",jx="_draft_rf0a3_151",zx="_facts_rf0a3_152",Hx="_modes_rf0a3_160",Gx="_go_rf0a3_124",Vx="_linkRow_rf0a3_166",Wx="_linkName_rf0a3_169",Xx="_progress_rf0a3_173",$x="_projBtn_rf0a3_178",qx="_rank_rf0a3_180",Yx="_foot_rf0a3_184",Kx="_gradeLine_rf0a3_186",Zx="_scoreLine_rf0a3_186",Jx="_grade_rf0a3_186",Qx="_goal_rf0a3_191",e0="_mission_rf0a3_197",t0="_news_rf0a3_202",n0="_toast_rf0a3_207",i0="_scrim_rf0a3_211",s0="_modal_rf0a3_212",r0="_modalBody_rf0a3_218",a0="_slots_rf0a3_223",o0="_bondRow_rf0a3_223",l0="_switches_rf0a3_223",c0="_headline_rf0a3_225",d0="_kpis_rf0a3_226",h0="_kpi_rf0a3_226",u0="_causes_rf0a3_231",f0="_events_rf0a3_233",p0="_dimBars_rf0a3_235",m0="_policyGrid_rf0a3_237",g0="_pgroup_rf0a3_238",_0="_slider_rf0a3_239",x0="_sum_rf0a3_253",v0="_help_rf0a3_266",M0="_lbl_rf0a3_272",S0="_layer_rf0a3_290",y0="_guide_rf0a3_293",b0="_benefit_rf0a3_302",E0="_roads_rf0a3_307",T0="_finalTable_rf0a3_319",w0="_powerMain_rf0a3_328",A0="_alertBox_rf0a3_334",R0="_optGrid_rf0a3_338",C0="_opt_rf0a3_338",P0="_optLead_rf0a3_342",N0="_alertText_rf0a3_351",D0="_readHead_rf0a3_354",L0="_readRow_rf0a3_355",I0="_readKind_rf0a3_360",L={muted:j_,note:z_,top:H_,brand:G_,emblem:V_,brandText:W_,quarter:X_,yields:$_,yield:"_yield_rf0a3_21",spacer:q_,trialTag:Y_,tbButtons:K_,btn:Z_,hint:J_,bar:Q_,cats:ex,cat:tx,status:nx,fiscal:ix,fiscalMain:sx,pay:rx,afford:ax,quote:ox,budget:lx,report:cx,endTurn:dx,flyout:hx,flyHead:ux,flyRow:fx,tool:px,steppers:mx,step:gx,techNote:_x,panel:xx,openPanel:vx,tabs:Mx,collapse:Sx,body:yx,cityHead:bx,stripe:Ex,kind:Tx,chips:wx,popLine:Ax,close:Rx,gold:Cx,sec:Px,row:Nx,tiles:Dx,spark:Lx,groups:Ix,buildRow:Ux,order:Fx,btnRow:Bx,mini:Ox,lock:kx,draft:jx,facts:zx,modes:Hx,go:Gx,linkRow:Vx,linkName:Wx,progress:Xx,projBtn:$x,rank:qx,foot:Yx,gradeLine:Kx,scoreLine:Zx,grade:Jx,goal:Qx,mission:e0,news:t0,toast:n0,scrim:i0,modal:s0,modalBody:r0,slots:a0,bondRow:o0,switches:l0,headline:c0,kpis:d0,kpi:h0,causes:u0,events:f0,dimBars:p0,policyGrid:m0,pgroup:g0,slider:_0,sum:x0,help:v0,lbl:M0,layer:S0,guide:y0,benefit:b0,roads:E0,finalTable:T0,powerMain:w0,alertBox:A0,optGrid:R0,opt:C0,optLead:P0,alertText:N0,readHead:D0,readRow:L0,readKind:I0};function On(n){return Ie.useSyncExternalStore(n.subscribe,n.getVersion)}const U0=()=>()=>{},F0=()=>0;function B0(n){return Ie.useSyncExternalStore(n?n.subscribe:U0,n?n.getVersion:F0)}function Bt({id:n,size:e=16}){return a.jsx("span",{style:{display:"inline-flex",flex:"none",lineHeight:0},"aria-hidden":"true",dangerouslySetInnerHTML:{__html:ac(n,{size:e})}})}const id={housing:"l-home",school:"d-campus",hospital:"i-health",civic:"l-amenities",commerce:"d-commercial-hub",farm:"l-farmland",industry:"d-industrial-zone",coal:"r-coal_plant",green:"l-forest",clean:"r-solar",tech:"y-science"},sd={road:"t-road",rail:"t-rail",hsr:"t-rail"},O0=(n,e=2)=>`${n>=0?"+":"−"}${(Math.abs(n)/100).toFixed(e)}%`,k0=n=>n==="municipality"?"直辖市":n==="direct_county"?"省直辖县级":"地级行政区",j0={gold:"#d9b45a",good:"#7fbf3f",bad:"#e0645e",warn:"#e8a23a"};function Ti({value:n,tone:e="gold"}){return a.jsx("span",{style:{display:"block",height:6,borderRadius:3,background:"rgba(0,0,0,.45)",boxShadow:"inset 0 0 0 1px rgba(201,164,92,.25)",overflow:"hidden"},children:a.jsx("i",{style:{display:"block",height:"100%",width:`${Math.max(0,Math.min(1,n))*100}%`,background:j0[e]}})})}function rd({items:n,testid:e}){return a.jsxs("table",{className:L.pay,"data-testid":e,children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"拨款顺序"}),a.jsx("th",{children:"本季应付"}),a.jsx("th",{children:"轮到时现金"}),a.jsx("th",{children:"缺口"})]})}),a.jsx("tbody",{children:n.map((t,i)=>a.jsxs("tr",{"data-testid":`pay-${t.key==="project"?t.projectId:t.key}`,"data-short":t.short>0,"data-new":t.isNew,title:t.parts?t.parts.map(s=>`${s.name} ${oe(s.amount)}`).join("；"):void 0,children:[a.jsxs("td",{children:[a.jsx("i",{children:i+1}),t.name,t.isNew&&a.jsx("em",{children:"新"})]}),a.jsx("td",{children:oe(t.due)}),a.jsx("td",{children:oe(t.cashBefore)}),a.jsx("td",{children:t.short>0?a.jsx("b",{children:oe(t.short)}):"—"})]},`${t.key}${t.projectId??""}`))})]})}const Ql=n=>`${(n/100).toFixed(2)}%`,z0=n=>`${n>=0?"+":"−"}${(Math.abs(n)/100).toFixed(2)} 点`;function H0(n,e){const[t,i]=n.guideCities,s=oc(n.world.cities[t],n.world.cities[i]),r=n.guideLink,o=r?n.state.projects.find(l=>l.link===r.id&&!l.applied):null;switch(e){case"tool":return n.dock==="transport"?{n:"1/7",title:"选「公路」",body:"在弹出的交通选项里点「公路」。"}:{n:"1/7",title:"点底栏「交通」",body:`成都和重庆相距约 ${s} 公里，还没有线路相连。先点底栏的「交通」，再选「公路」。`};case"pickA":return{n:"2/7",title:"点地图上的起点",body:"点成都（或重庆）作为起点。发光的圈就是这两座城市。"};case"pickB":{const l=n.tool.type==="link"?n.tool.first:null;return{n:"3/7",title:"再点终点",body:`起点是${l===null?"":n.cityName(l)}，现在点另一端：${l===t?n.cityName(i):n.cityName(t)}。`}}case"draft":return{n:"4/7",title:"看线路草稿",body:"右侧写着造价、工期、本季付款和轮到它时国库还剩多少。确认请点「下达建设」；不想建点「放弃」。"};case"otherDraft":return{n:"4/7",title:"这是另一条线路",body:"引导只跟着成都—重庆。想继续，先点「放弃」，再点成都和重庆；也可以随时点「跳过引导」自由建设。"};case"queued":return{n:"5/7",title:"已列入本季度计划",body:"点右下角「结束季度」，工程从这一季开始拨款。想改主意可以在右侧撤销。"};case"building":return{n:"6/7",title:"施工中",body:`已施工 ${o?.done??0}/${o?.quarters??2} 个季度。地图上虚线是施工中的路，继续点「结束季度」。`};case"ready":return{n:"7/7",title:"已竣工，等待通车",body:"路已经修好，但要到下个季度才正式通车。地图上绿色的线就是“竣工待启用”。再点一次「结束季度」。"}}}const G0={tool:"transport",draft:"order",queued:"end",building:"end",ready:"end"};function Ro(n){const e=n.guideStep;return e?e==="tool"?n.dock==="transport"?"road":"transport":G0[e]??null:null}function V0({s:n}){On(n);const e=n.guideStep;if(!e||n.modal)return null;const t=H0(n,e),[i,s]=n.guideCities;return a.jsxs("aside",{className:L.guide,"data-testid":"guide-card","data-step":e,"aria-label":"成渝公路引导",children:[a.jsxs("header",{children:[a.jsx("span",{children:"第一项工程 · 成渝公路"}),a.jsx("small",{children:t.n})]}),a.jsx("h4",{children:t.title}),a.jsx("p",{children:t.body}),a.jsxs("footer",{children:[a.jsx("button",{"data-testid":"guide-frame",onClick:()=>n.focusPair(i,s),children:"看两座城"}),a.jsx("button",{"data-testid":"guide-skip",onClick:()=>n.skipGuide(),children:"跳过引导"})]})]})}function W0({s:n}){On(n);const e=n.spotlight;if(!e||n.modal)return null;const t=`${e.nameA}—${e.nameB}${sn[e.mode]}`;return a.jsxs("aside",{className:L.guide,"data-testid":"opening-card","data-link":e.link,"aria-label":"线路通车",children:[a.jsxs("header",{children:[a.jsx("span",{children:"线路通车"}),a.jsxs("small",{children:[e.km," 公里"]})]}),a.jsxs("h4",{children:[t,"正式通车"]}),a.jsx("ul",{className:L.benefit,children:e.rows.map(i=>a.jsxs("li",{"data-testid":`opening-row-${i.name}`,children:[a.jsx("b",{children:i.name}),a.jsxs("span",{children:["市场通达度 ",Ql(i.before)," → ",a.jsx("em",{children:Ql(i.after)})]}),a.jsx("i",{"data-tone":i.after>=i.before?"good":"bad",children:z0(i.after-i.before)})]},i.city))}),a.jsx("p",{className:L.note,children:"通达度是这座城市连到其他市场的程度，来自本局结算，不是预设值；它会影响本地产能利用、投资流入和居住吸引力，对 GDP 的实际影响要看之后几个季度的结算，这里不直接换算。"}),a.jsxs("footer",{children:[a.jsx("button",{"data-testid":"opening-report",onClick:()=>n.open("report"),disabled:!n.lastReport,children:"看季度报告"}),a.jsx("button",{className:L.go,"data-testid":"opening-dismiss",onClick:()=>n.dismissSpotlight(),children:"知道了"})]})]})}const ec={road:1,rail:2,hsr:3};
function campaignPlanName(quarters) {
  return quarters === 20 ? "“十四五”规划" : `${quarters} 季度规划`;
}
function X0({s:n,search:e}){On(n);const t=n.nation,i=n.state.history,s=i[i.length-1],r=i[i.length-2],o=s&&r&&r.gdp>0?Math.round((s.gdp-r.gdp)*1e4/r.gdp):null,l=s?s.balance:null,d=n.state.mode==="sandbox";return a.jsxs("header",{className:L.top,"data-testid":"game-top",children:[a.jsxs("div",{className:L.brand,title:"华夏文明 · ChinaCiv",children:[a.jsx("span",{className:L.emblem,"aria-hidden":"true",children:"华"}),a.jsx("span",{className:L.brandText,children:"华夏文明"})]}),a.jsxs("div",{className:L.quarter,"data-testid":"quarter",title:d?"沙盒：无期限":`试验情景规划期共 ${n.planTurns} 个季度`,children:[a.jsx("b",{children:n.label}),a.jsx("span",{children:d?"沙盒":n.campaignOver?"规划期已结束":`第 ${n.state.turn+1}/${n.planTurns} 季`})]}),a.jsxs("div",{className:L.yields,children:[a.jsxs("span",{className:L.yield,"data-testid":"top-gdp",title:"全国年化 GDP（四个季度合计口径）及环比",children:[a.jsx(Bt,{id:"y-gold",size:16}),oe(t.gdpAnnual),o!==null&&a.jsx("small",{"data-tone":o>=0?"good":"bad",children:O0(o)})]}),a.jsxs("span",{className:L.yield,"data-testid":"top-pop",title:"全国人口（试验情景）",children:[a.jsx(Bt,{id:"pop",size:16}),Mi(t.pop)]}),a.jsxs("span",{className:L.yield,"data-testid":"top-cash",title:"国库现金与上季度财政收支",children:[a.jsx(Bt,{id:"l-income",size:16}),oe(t.govCash),l!==null&&a.jsxs("small",{"data-tone":l>=0?"good":"bad",children:[l>=0?"结余":"赤字"," ",oe(Math.abs(l))]})]}),a.jsxs("span",{className:L.yield,title:"失业率","data-tone":t.unemployBp>900?"bad":void 0,children:[a.jsx(Bt,{id:"unemployment",size:16}),gt(t.unemployBp)]}),a.jsx(GamePowerStatus,{s:n}),a.jsxs("span",{className:L.yield,title:"国债余额 / 年化 GDP","data-tone":t.debtRatioBp>6e3?"warn":void 0,children:[a.jsx(Bt,{id:"i-finance",size:16}),gt(t.debtRatioBp,0)]})]}),a.jsx("div",{className:L.spacer}),e,a.jsx("span",{className:L.trialTag,title:"城市人口、产出与全部经济参数是游戏参数，不是统计数据",children:"试验情景·非统计数据"}),a.jsxs("div",{className:L.tbButtons,children:[a.jsxs("button",{className:L.btn,onClick:()=>n.setTab("goals"),title:"规划目标与发展任务",children:[a.jsx(Bt,{id:"g-prosperity",size:14}),a.jsx("span",{className:L.lbl,children:"目标"})]}),a.jsxs("button",{className:L.btn,"data-testid":"menu-btn",onClick:()=>n.open("menu"),title:"存档、读档与设置",children:[a.jsx(Bt,{id:"layers",size:14}),a.jsx("span",{className:L.lbl,children:"菜单"})]})]})]})}function $0({s:n}){On(n);const e=lc(n.world,n.state,n.pendingCommands()),t=n.energyPending;return a.jsxs("button",{className:L.yield,"data-testid":"top-power","data-alert":t,"data-tone":e.satisfactionBp<9e3?"warn":void 0,onClick:()=>n.setTab("power"),title:"本季供电满足度；点开电力面板",children:[a.jsx(Bt,{id:"r-coal_plant",size:16}),gt(e.satisfactionBp,0),t&&a.jsx("small",{"data-tone":"bad",className:L.alertText,children:"能源预警"})]})}function q0({s:n}){On(n);const e=n.tool;if(e.type==="none")return null;const t=e.type==="build"?`建设「${Ns[e.kind].name}」：点击地图上的城市，在右侧确认后下达`:e.first===null?`${sn[e.mode]}：点击起点城市`:`${sn[e.mode]}：起点 ${n.cityName(e.first)}，请点击终点城市`;return a.jsxs("div",{className:L.hint,role:"status","data-testid":"tool-hint",children:[a.jsx("span",{children:t}),a.jsx("button",{onClick:()=>n.disarm(),children:"取消 Esc"})]})}const Y0=[{id:"build",name:"建设",icon:"i-construction"},{id:"transport",name:"交通",icon:"t-rail"},{id:"industry",name:"产业",icon:"y-production"},{id:"policy",name:"政策",icon:"i-public_admin"},{id:"tech",name:"科技",icon:"y-science"}],K0={build:["housing","school","hospital","civic","coal","clean","green"],industry:["farm","industry","commerce"],tech:["tech"]};function Z0({s:n}){On(n);const e=n.pending.length,t=Ro(n),i=n.campaignOver&&n.state.mode==="campaign";return a.jsxs("footer",{className:L.bar,"data-testid":"game-bar",children:[n.dock&&a.jsx(Q0,{s:n}),a.jsx("div",{className:L.cats,role:"toolbar","aria-label":"操作",children:Y0.map(s=>a.jsxs("button",{"data-testid":`bar-${s.id}`,"data-guide":s.id==="transport"&&t==="transport","aria-pressed":s.id==="policy"?n.modal==="policy":n.dock===s.id,className:L.cat,onClick:()=>s.id==="policy"?n.open("policy"):n.setDock(s.id),children:[a.jsx(Bt,{id:s.icon,size:22}),a.jsx("span",{children:s.name})]},s.id))}),a.jsxs("div",{className:L.status,children:[a.jsx("b",{"data-testid":"orders-count",children:e?`本季度计划 ${e} 项`:"本季度还没有指令"}),a.jsx("span",{children:n.tool.type!=="none"?`已选工具：${n.tool.type==="build"?Ns[n.tool.kind].name:sn[n.tool.mode]} · 点击地图上的城市`:e?`首季拨款约 ${oe(n.pending.reduce((s,r)=>s+r.firstCost,0))}`:"选城市，从底栏挑项目或线路"})]}),a.jsx(J0,{s:n}),a.jsxs("button",{className:L.report,"data-testid":"report-btn",disabled:!n.lastReport,onClick:()=>n.open("report"),title:"查看上一季度报告",children:[a.jsx(Bt,{id:"pedia",size:16}),"报告"]}),a.jsx("button",{className:L.endTurn,"data-testid":"end-turn","data-guide":t==="end",disabled:n.busy||i,onClick:()=>{n.endQuarter()},children:n.busy?"结算中…":i?"规划期已结束":a.jsxs(a.Fragment,{children:["结束季度",a.jsxs("small",{children:[n.label," ▶"]})]})})]})}function J0({s:n}){const e=n.plan;if(!e.ok)return a.jsxs("button",{className:L.fiscal,"data-testid":"outlook","data-short":"true",onClick:()=>n.open("policy"),children:[a.jsx("span",{className:L.fiscalMain,children:a.jsx("i",{"data-tone":"bad",children:"预算预演失败"})}),a.jsx("small",{children:e.failure})]});const t=[e.bondIssued?`发债 +${oe(e.bondIssued)}`:"",e.repaid?`还债 −${oe(e.repaid)}`:"",`利息 −${oe(e.interest)}`].filter(Boolean).join(" · ");return a.jsxs("button",{className:L.fiscal,"data-testid":"outlook","data-short":e.shortTotal>0,onClick:()=>n.open("policy"),title:"真实拨款顺序的预演：点开看每项拨款轮到时还剩多少现金、缺多少",children:[a.jsxs("span",{className:L.fiscalMain,children:[a.jsxs("i",{children:["现金 ",a.jsx("b",{children:oe(e.cashOpen)})]}),a.jsxs("i",{children:["应付 ",a.jsx("b",{children:oe(e.dueTotal)})]}),e.shortTotal>0?a.jsxs("i",{"data-tone":"bad",children:["缺口 ",a.jsx("b",{children:oe(e.shortTotal)})]}):a.jsxs("i",{"data-tone":"good",children:["够付 · 余 ",a.jsx("b",{children:oe(e.cashOpen-e.paidTotal)})]})]}),a.jsxs("small",{children:["融资：",t," · 税收 ",oe(e.taxes.total)," 季末入账"]})]})}function Q0({s:n}){const e=n.dock,t=n.state.turn,i=n.state.mode==="campaign";return a.jsxs("div",{className:L.flyout,"data-testid":"flyout",role:"group","aria-label":"可选项目",children:[a.jsxs("div",{className:L.flyHead,children:[a.jsx("b",{children:e==="transport"?"交通":e==="build"?"建设":e==="industry"?"产业":"科技"}),a.jsx("span",{children:e==="transport"?"选好线路类型，依次点击两座城市":"选好项目，再点击地图上的城市；城市规模决定造价与效果"}),a.jsx("button",{onClick:()=>n.setDock(e),"aria-label":"收起",children:"×"})]}),a.jsxs("div",{className:L.flyRow,children:[e==="transport"&&yr.map(s=>{const r=i&&t<Io[s].turn,o=Ad[s],l=n.tool.type==="link"&&n.tool.mode===s;return a.jsxs("button",{className:L.tool,"data-testid":`tool-${s}`,"data-armed":l,"data-locked":r,"data-guide":s==="road"&&Ro(n)==="road",disabled:r,onClick:()=>l?n.disarm():n.armLink(s),children:[a.jsx(Bt,{id:sd[s],size:26}),a.jsx("b",{children:sn[s]}),a.jsx("small",{children:r?Io[s].phase:`${o.yiPerKm} 亿/公里 · 每季约 ${o.kmPerQuarter} 公里`})]},s)}),e!=="transport"&&K0[e].map(s=>{const r=Ns[s],o=i&&t<r.unlock,l=n.tool.type==="build"&&n.tool.kind===s;return a.jsxs("button",{className:L.tool,"data-testid":`tool-${s}`,"data-armed":l,"data-locked":o,disabled:o,onClick:()=>l?n.disarm():n.armBuild(s),children:[a.jsx(Bt,{id:id[s],size:26}),a.jsx("b",{children:r.name}),a.jsx("small",{children:o?r.phase:`约 ${r.baseYi} 亿起 · ${r.quarters} 季度`})]},s)}),e==="industry"&&a.jsx("div",{className:L.steppers,children:["subAgri","subManu","subServ"].map(s=>a.jsx(tc,{s:n,field:s},s))}),e==="tech"&&a.jsxs("div",{className:L.steppers,children:[a.jsx(tc,{s:n,field:"subTech"}),a.jsxs("span",{className:L.techNote,children:["全国技术进步率 +",(n.nation.techBp/100).toFixed(3),"%/季：科技园区和科技扶持都会抬高它，劳动生产率上升既带来增长，也会让岗位增长跟不上。"]})]})]})]})}function tc({s:n,field:e}){On(n);const t=Sa[e],i=n.policyValue(e),s=n.state.policy[e],r=n.policyWait(e),o=n.pendingPolicy(e)!==null,l=r>0||!o&&n.policyPointsUsed()>=3;return a.jsxs("div",{className:L.step,"data-pending":o,title:t.note,children:[a.jsx("span",{children:t.name}),a.jsx("button",{"aria-label":`降低${t.name}`,disabled:l||i<=t.min,onClick:()=>n.queuePolicy(e,i-t.step),children:"−"}),a.jsx("b",{"data-testid":`policy-${e}`,children:t.unit==="level"?`${i} 级`:gt(i,1)}),a.jsx("button",{"aria-label":`提高${t.name}`,disabled:l||i>=t.max,onClick:()=>n.queuePolicy(e,i+t.step),children:"＋"}),o&&a.jsx("em",{children:t.unit==="level"?`现 ${s} 级`:`现 ${gt(s,1)}`}),r>0&&a.jsxs("em",{children:["还需 ",r," 季"]})]})}const ev=[["city","城市"],["goals","目标"],["projects","项目"],["power","电力"],["news","动态"]];function tv({s:n,locate:e}){if(On(n),!n.panelOpen)return a.jsx("button",{className:L.openPanel,"data-testid":"panel-open",onClick:()=>n.setPanelOpen(!0),children:"展开面板"});const t=n.state.projects.filter(i=>i.project.status==="building").length;return a.jsxs("section",{className:L.panel,"aria-label":"城市与国家面板","data-testid":"game-panel",children:[a.jsxs("div",{className:L.tabs,role:"tablist",children:[ev.map(([i,s])=>a.jsxs("button",{role:"tab","aria-selected":n.tab===i,"data-testid":`tab-${i}`,onClick:()=>n.setTab(i),children:[s,i==="projects"&&t+n.pending.length>0&&a.jsx("b",{children:t+n.pending.length}),i==="power"&&n.energyPending&&a.jsx("b",{"data-testid":"power-alert",children:"!"})]},i)),a.jsx("button",{className:L.collapse,onClick:()=>n.setPanelOpen(!1),"aria-label":"收起面板",title:"收起面板",children:"›"})]}),a.jsxs("div",{className:L.body,children:[n.tab==="city"&&a.jsx(iv,{s:n,locate:e}),n.tab==="goals"&&a.jsx(uv,{s:n}),n.tab==="projects"&&a.jsx(fv,{s:n,locate:e}),n.tab==="power"&&a.jsx(nv,{s:n}),n.tab==="news"&&a.jsx(pv,{s:n})]})]})}function bt({title:n,children:e}){return a.jsxs("div",{className:L.sec,children:[a.jsx("h3",{children:n}),e]})}function tn({label:n,value:e,tone:t,bar:i}){return a.jsxs("div",{className:L.row,children:[a.jsx("span",{children:n}),a.jsx("b",{"data-tone":t,children:e}),i!==void 0&&a.jsx(Ti,{value:i,tone:t})]})}const _s=n=>(Math.abs(n)/100).toFixed(1);function nv({s:n}){const e=lc(n.world,n.state,n.pendingCommands()),t=n.plan,i=t.items.find(h=>h.key==="energy"),s=n.state.energy,r=e.event,o=s.log,l=e.satisfactionBp<8500?"bad":e.satisfactionBp<9500?"warn":"good",d=r&&s.from>=0?`${Si(s.from)}–${Si(s.until-1)}`:"";return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:L.cityHead,children:[a.jsx("span",{className:L.stripe}),a.jsx("div",{className:L.kind,children:"全国电网 · 试验情景"}),a.jsx("h2",{children:"电力"}),a.jsx("p",{className:L.muted,children:"电网按全国一张网计算，不分城市：这里的数字是全国的。"})]}),a.jsxs(bt,{title:"本季供电",children:[a.jsxs("div",{className:L.powerMain,"data-testid":"power-main",children:[a.jsx("span",{children:"本季供电满足度"}),a.jsx("b",{"data-testid":"power-satisfaction","data-tone":l,children:gt(e.satisfactionBp)}),e.shortageBp>0?a.jsxs("i",{"data-testid":"power-gap","data-kind":"shortage","data-tone":"bad",children:["装机缺口 ",gt(e.shortageBp)]}):a.jsxs("i",{"data-testid":"power-gap","data-kind":"reserve","data-tone":"good",children:["备用容量 ",gt(e.reserveBp)]})]}),a.jsx(Ti,{value:e.satisfactionBp/1e4,tone:l}),a.jsx(tn,{label:"装机 / 需求",value:gt(e.ratioBp)}),a.jsxs("p",{className:L.note,"data-testid":"power-units",children:["电力需求 ",oe(e.need),"，装机 ",oe(e.supply),"（按产出容量折算的模型单位，不是兆瓦）。",e.shortageBp>0?`装机比需求少 ${oe(e.shortage)}：缺口越大，各行业开工越不足。`:e.reserveBp>0?`装机比需求多 ${oe(e.reserve)}：备用容量不增加产出，只增加维护开支。`:"装机和需求刚好相当。"]}),(e.offsetBp!==0||e.reliefBp!==0)&&a.jsxs("p",{className:L.note,"data-testid":"power-event-line",children:["满足度的算法：装机本身可满足 ",a.jsx("b",{children:gt(e.capturedBp)}),"；能源事件 ",a.jsxs("b",{children:[e.offsetBp<0?"−":"+",_s(e.offsetBp)," 点"]}),e.reliefBp?a.jsxs(a.Fragment,{children:["；应对措施 ",a.jsxs("b",{children:["+",_s(e.reliefBp)," 点"]})]}):"","；合计 ",a.jsx("b",{children:gt(e.satisfactionBp)}),"。 事件的影响单独算，不和装机缺口相加。",e.source==="settlement"?"（按本季结算的实际读数）":""]})]}),n.energyPending&&a.jsx(bt,{title:"能源预警",children:a.jsxs("div",{className:L.alertBox,"data-testid":"energy-pending",children:[a.jsxs("p",{children:["燃料供应趋紧，下个季度的结算起，全国电力供应将受冲击。",a.jsx("b",{children:"本季下达指令前要先作决定"}),"：紧急保供、错峰生产，或不采取措施。"]}),a.jsx("p",{className:L.note,children:n.energyQueued?`已选：${Mr[n.energyQueued]}（结束季度时生效，之前可以改选）`:"还没有选，不选的话“结束季度”会先把这张决策卡打开。"}),a.jsx("button",{className:L.go,"data-testid":"energy-open",onClick:()=>n.open("energy"),children:n.energyQueued?"查看或改选":"处理能源事件"})]})}),r&&r.phase==="active"&&a.jsxs(bt,{title:"能源事件进行中",children:[a.jsx(tn,{label:"你的决定",value:`${Mr[r.choice??"none"]}${r.byDefault?"（按默认）":""}`}),a.jsx(tn,{label:"持续",value:`${d}（${s.until-s.from} 个季度），还剩 ${r.quartersLeft} 个季度`}),r.choice==="subsidy"&&i&&a.jsxs("p",{className:L.note,"data-testid":"power-subsidy-line",children:["本季保供补贴应付 ",oe(i.due),"，轮到它时国库现金 ",oe(i.cashBefore),i.short>0?`，缺 ${oe(i.short)}（缓解按实付比例打折）`:"，够付","。"]}),r.choice==="stagger"&&e.curtailBp>0&&a.jsxs("p",{className:L.note,"data-testid":"power-curb-line",children:[r.sectorsCurtailed.map(h=>Sr[h]).join("、"),"产能临时下调 ",_s(e.curtailBp),"%。"]})]}),r&&r.phase==="done"&&a.jsx(bt,{title:"能源事件",children:a.jsxs("p",{className:L.note,"data-testid":"power-done",children:["能源事件已经结束（",d,"）：冲击、补贴和限产都已撤销。"]})}),o.length>0&&a.jsxs(bt,{title:"已结算的季度",children:[a.jsxs("table",{className:L.pay,"data-testid":"power-log",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"季度"}),a.jsx("th",{children:"满足度"}),a.jsx("th",{children:"冲击"}),a.jsx("th",{children:"应对"}),a.jsx("th",{children:"实付补贴"})]})}),a.jsx("tbody",{children:o.map(h=>a.jsxs("tr",{"data-testid":`power-log-${h.turn}`,children:[a.jsx("td",{children:Si(h.turn)}),a.jsx("td",{children:gt(h.adequacyBp)}),a.jsxs("td",{children:["−",_s(h.shockBp)]}),a.jsx("td",{children:h.reliefBp?`+${_s(h.reliefBp)}`:"—"}),a.jsx("td",{children:h.paid?oe(h.paid):"—"})]},h.turn))})]}),a.jsx("p",{className:L.note,children:"满足度、冲击和应对的单位是百分点。这些是历次结算的实际结果。"})]})]})}function iv({s:n,locate:e}){const t=n.selected,[i,s]=Ie.useState("全部");if(t===null)return a.jsx(hv,{s:n,locate:e});const r=n.world.cities[t],o=n.city(t),l=bd.filter(u=>i==="全部"||Ns[u].group===i),d=n.tool.type==="build"?n.tool.kind:null;d&&l.includes(d)&&(l.splice(l.indexOf(d),1),l.unshift(d));const h=n.pendingFor(t),c=o.unemployBp;return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:L.cityHead,children:[a.jsx("span",{className:L.stripe}),a.jsxs("div",{className:L.kind,children:[k0(r.kind)," · ",r.province]}),a.jsx("h2",{"data-testid":"city-name",children:r.label}),a.jsxs("div",{className:L.chips,children:[a.jsx("span",{children:"试验情景数据"}),o.tags.map(u=>a.jsx("span",{"data-warn":/紧张|不足|较重|闭塞|流出/.test(u),children:u},u))]}),a.jsxs("div",{className:L.popLine,children:[a.jsx(Bt,{id:"pop",size:15}),a.jsx("b",{"data-testid":"city-pop",children:Mi(o.pop)})," 人 ",a.jsxs("small",{"data-tone":o.popChange>=0?"good":"bad",children:["本季迁移 ",o.popChange>=0?"+":"−",Mi(Math.abs(o.popChange))]})]}),a.jsx("button",{className:L.close,onClick:()=>n.select(null),"aria-label":"取消选择",children:"×"}),a.jsx("button",{className:L.gold,onClick:()=>e(t),children:"定位到地图 ›"})]}),n.linkDraft&&a.jsx(ov,{s:n}),a.jsxs(bt,{title:"产出",children:[a.jsxs("div",{className:L.tiles,children:[a.jsxs("div",{children:[a.jsx(Bt,{id:"y-gold",size:20}),a.jsx("b",{children:oe(o.gdp*4)}),a.jsx("small",{children:"年化产出"})]}),a.jsxs("div",{children:[a.jsx(Bt,{id:"g-prosperity",size:20}),a.jsxs("b",{children:[o.gdpPerCap.toFixed(2)," 万"]}),a.jsx("small",{children:"人均产出/年"})]}),a.jsxs("div",{children:[a.jsx(Bt,{id:"l-income",size:20}),a.jsxs("b",{children:[o.incomePerCap.toFixed(2)," 万"]}),a.jsx("small",{children:"人均收入/年"})]})]}),a.jsx(dv,{values:o.gdpHist})]}),a.jsxs(bt,{title:"民生与就业",children:[a.jsx(tn,{label:"失业率",value:gt(c),tone:c>1e3?"bad":c>700?"warn":"good",bar:Math.min(1,c/2e3)}),a.jsx(tn,{label:"住房（住房容量 / 人口）",value:gt(o.housingRatioBp,0),tone:o.housingRatioBp<9700?"bad":o.housingRatioBp<10200?"warn":"good",bar:Math.min(1,o.housingRatioBp/13e3)}),a.jsx(tn,{label:"学位覆盖",value:gt(o.eduBp,0),tone:o.eduBp<8500?"warn":"good",bar:Math.min(1,o.eduBp/13e3)}),a.jsx(tn,{label:"医疗覆盖",value:gt(o.healthBp,0),tone:o.healthBp<8500?"warn":"good",bar:Math.min(1,o.healthBp/13e3)}),a.jsx(tn,{label:"社区与养老服务",value:gt(o.civicBp,0),bar:Math.min(1,o.civicBp/13e3)}),a.jsx(tn,{label:"污染指数",value:gt(o.pollutionBp,0),tone:o.pollutionBp>3500?"bad":o.pollutionBp>2500?"warn":"good",bar:Math.min(1,o.pollutionBp/6e3)}),a.jsx(tn,{label:"市场通达度",value:gt(o.access,0)}),a.jsx(tn,{label:"居住吸引力",value:gt(o.attract,0),tone:o.attract>=1e4?"good":"warn"})]}),a.jsx(bt,{title:"产业结构（本季产出）",children:o.sectors.map(u=>a.jsx(tn,{label:u.name,value:`${oe(u.out)} · ${gt(u.share,0)}`,bar:u.share/1e4},u.id))}),h.length>0&&a.jsx(bt,{title:"本季度计划",children:h.map(u=>a.jsx(Co,{s:n,o:u},u.id))}),a.jsxs(bt,{title:"建设项目",children:[a.jsx("div",{className:L.groups,children:["全部","住房","公共服务","产业","能源","环境"].map(u=>a.jsx("button",{"aria-pressed":i===u,onClick:()=>s(u),children:u},u))}),l.map(u=>a.jsx(sv,{s:n,kind:u,city:t,preview:Ed(n.state,n.world,u,t)},u))]}),a.jsx(bt,{title:"交通线路",children:a.jsx(cv,{s:n,city:t})}),o.projects.length>0&&a.jsx(bt,{title:"在建",children:o.projects.map(u=>a.jsx(ad,{name:u.name,done:u.done,quarters:u.quarters,stalled:u.stalled},u.id))}),a.jsx("p",{className:L.foot,children:"城市人口与产出为试验情景参数，不是统计数据。"})]})}function Co({s:n,o:e}){const t=n.orderPayment(e.id),i=(e.cmd.type==="build"||e.cmd.type==="link")&&n.plan.commands.find(s=>s.id===e.id)?.accepted===!1;return a.jsxs("div",{className:L.order,"data-testid":`order-row-${e.id}`,children:[a.jsxs("span",{children:[e.label,a.jsx("small",{children:e.note}),t&&a.jsxs("small",{"data-tone":t.short>0?"bad":void 0,children:["本季付 ",oe(t.due),"，轮到时现金 ",oe(t.cashBefore),t.short>0?`，缺 ${oe(t.short)}（停工待款）`:""]}),i&&a.jsx("small",{"data-tone":"bad",children:n.plan.commands.find(s=>s.id===e.id)?.reason})]}),a.jsx("button",{onClick:()=>n.cancelOrder(e.id),children:"撤销"})]})}function sv({s:n,kind:e,city:t,preview:i}){const s=n.pending.some(o=>o.cmd.type==="build"&&o.cmd.city===t&&o.cmd.kind===e),r=n.tool.type==="build"&&n.tool.kind===e;return a.jsxs("article",{className:L.buildRow,"data-armed":r,"data-locked":!i.open&&!s,"data-testid":`build-${e}`,children:[a.jsx(Bt,{id:id[e],size:24}),a.jsxs("div",{children:[a.jsxs("h4",{children:[i.name,a.jsx("small",{children:i.group})]}),a.jsxs("div",{className:L.facts,children:[a.jsxs("span",{children:["造价 ",a.jsx("b",{children:oe(i.cost)})]}),a.jsxs("span",{children:["工期 ",a.jsxs("b",{children:[i.quarters," 季度"]})]}),a.jsxs("span",{children:["维护 ",a.jsx("b",{children:i.maintenance?`${oe(i.maintenance)}/季`:"无"})]})]}),a.jsx("p",{children:i.effect}),!i.open&&!s&&a.jsx("p",{className:L.lock,children:i.reason}),i.open&&!s&&a.jsx(rv,{s:n,due:i.firstDue,testid:`afford-${e}`})]}),a.jsx("button",{"data-testid":`order-${e}`,disabled:!i.open||s,onClick:()=>n.queueBuild(e,t),children:s?"已计划":"下达"})]})}function rv({s:n,due:e,testid:t}){const i=n.roomAfterQueue,s=e<=i;return a.jsxs("p",{className:L.afford,"data-fits":s,"data-testid":t,children:["本季首期 ",a.jsx("b",{children:oe(e)}),"：",s?`现金够付，付完还剩 ${oe(i-e)}`:`排在全部拨款之后，现金只剩 ${oe(Math.max(0,i))}，会停工待款`]})}function av({q:n}){return n.accepted?a.jsxs("div",{className:L.quote,"data-testid":"link-quote","data-short":n.short>0,children:[a.jsxs("span",{children:["本季付款 ",a.jsx("b",{children:oe(n.due)})]}),a.jsxs("span",{children:["轮到它时国库还剩 ",a.jsx("b",{children:oe(n.cashBefore)})]}),n.short>0?a.jsxs("span",{"data-tone":"bad",children:["缺口 ",a.jsx("b",{children:oe(n.short)}),"，本季不会动工"]}):a.jsxs("span",{"data-tone":"good",children:["够付，付完余 ",a.jsx("b",{children:oe(n.cashBefore-n.due)})]}),a.jsx("span",{children:n.displaced.length?`会挤占：${n.displaced.map(e=>`${e.name} 少拨 ${oe(e.lost)}`).join("；")}`:"不挤占已在建或已列入的工程（它排在它们之后拨款）"})]}):a.jsx("p",{className:L.lock,"data-testid":"link-quote",children:n.reason})}function ov({s:n}){const e=n.linkDraft,t=hc(n.state,n.world,e.a,e.b,e.mode);return a.jsxs("div",{className:L.draft,"data-testid":"link-draft",children:[a.jsxs("h4",{children:["拟建线路：",n.cityName(e.a)," — ",n.cityName(e.b)]}),a.jsx("div",{className:L.modes,children:yr.map(i=>a.jsx("button",{"aria-pressed":e.mode===i,onClick:()=>{n.linkDraft={...e,mode:i},n.emit()},children:sn[i]},i))}),a.jsx(lv,{p:t}),!t.open&&a.jsx("p",{className:L.lock,children:t.reason}),t.open&&a.jsx(av,{q:n.quote({id:"draft",type:"link",a:e.a,b:e.b,mode:e.mode})}),a.jsxs("div",{className:L.btnRow,children:[a.jsx("button",{onClick:()=>{n.linkDraft=null,n.emit()},children:"放弃"}),a.jsxs("button",{className:L.go,"data-testid":"order-link","data-guide":Ro(n)==="order",disabled:!t.open,onClick:()=>n.queueLink(e.a,e.b,e.mode),children:["下达",t.from?"升级":"建设"]})]})]})}function lv({p:n}){return a.jsxs("div",{className:L.facts,children:[a.jsxs("span",{children:["距离 ",a.jsxs("b",{children:[n.km," 公里"]})]}),a.jsxs("span",{children:["造价 ",a.jsx("b",{children:oe(n.cost)})]}),a.jsxs("span",{children:["工期 ",a.jsxs("b",{children:[n.quarters," 季度"]})]}),a.jsxs("span",{children:["维护 ",a.jsxs("b",{children:[oe(n.maintenance),"/季"]})]}),n.from&&a.jsxs("span",{children:["现状 ",a.jsx("b",{children:sn[n.from]}),"（复用 40%）"]})]})}function cv({s:n,city:e}){const t=n.city(e),i=new Set(t.links.map(o=>o.other)),s=n.world.cities.filter(o=>o.id!==e&&!i.has(o.id)).map(o=>({c:o,km:oc(n.world.cities[e],o)})).sort((o,l)=>o.km-l.km).slice(0,5),r=(o,l,d)=>{const h=hc(n.state,n.world,o,l,d);return a.jsxs("button",{disabled:!h.open,title:h.open?`${sn[d]} ${h.km} 公里，${oe(h.cost)}，${h.quarters} 季度`:h.reason,"data-testid":`link-${d}-${l}`,onClick:()=>n.queueLink(o,l,d),children:[sn[d],a.jsx("small",{children:oe(h.cost)})]},d)};return a.jsxs(a.Fragment,{children:[t.links.length===0&&a.jsx("p",{className:L.muted,children:"这座城市还没有线路。没有线路的城市市场通达度低、迁入意愿弱。"}),t.links.map(o=>a.jsxs("div",{className:L.linkRow,children:[a.jsxs("span",{children:[a.jsx(Bt,{id:o.mode?sd[o.mode]:"i-construction",size:16}),o.otherName,a.jsxs("small",{children:[o.mode?sn[o.mode]:"首次施工中",o.building&&o.mode?` → ${sn[o.building]}施工中`:""," · ",o.km," 公里"]})]}),a.jsx("span",{className:L.mini,children:!o.building&&yr.filter(l=>ec[l]>(o.mode?ec[o.mode]:0)).map(l=>r(e,o.other,l))})]},o.id)),a.jsx("h5",{children:"连接新的城市（最近的 5 座）"}),s.map(({c:o,km:l})=>a.jsxs("div",{className:L.linkRow,children:[a.jsxs("span",{children:[a.jsx("button",{className:L.linkName,onClick:()=>n.select(o.id,!0),children:o.label}),a.jsxs("small",{children:[l," 公里"]})]}),a.jsx("span",{className:L.mini,children:yr.map(d=>r(e,o.id,d))})]},o.id)),a.jsx("p",{className:L.muted,children:"也可以在底栏点“交通”，选线路类型后在地图上依次点击两座城市。"})]})}function ad({name:n,done:e,quarters:t,stalled:i}){return a.jsxs("div",{className:L.progress,children:[a.jsxs("span",{children:[n,i&&a.jsx("em",{children:"停工：国库资金不足"})]}),a.jsxs("small",{children:[e,"/",t," 季度"]}),a.jsx(Ti,{value:e/t,tone:i?"bad":"gold"})]})}function dv({values:n}){const e=n.filter(o=>o>0);if(e.length<2)return null;const t=Math.min(...e),i=Math.max(...e),s=Math.max(1,i-t),r=e.map((o,l)=>`${l/(e.length-1)*100},${22-(o-t)/s*18}`).join(" ");return a.jsx("svg",{className:L.spark,viewBox:"0 0 100 24",preserveAspectRatio:"none","aria-label":"最近几个季度的产出走势",children:a.jsx("polyline",{points:r,fill:"none",stroke:"#ecd08e",strokeWidth:"1.6",vectorEffect:"non-scaling-stroke"})})}function hv({s:n,locate:e}){const t=n.state.cities.map(i=>i).sort((i,s)=>s.gdp-i.gdp).slice(0,10);return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:L.cityHead,children:[a.jsx("span",{className:L.stripe}),a.jsx("div",{className:L.kind,children:"全国 · 试验情景"}),a.jsx("h2",{children:"选择一座城市"}),a.jsx("p",{className:L.muted,children:"点击地图上的城市旗标，或在顶栏搜索。选中后可以在这里建设项目、修建线路。"})]}),a.jsx(bt,{title:"产出最高的 10 座城市",children:t.map(i=>a.jsxs("button",{className:L.rank,onClick:()=>{n.select(i.id,!0),e(i.id)},children:[a.jsx("span",{children:n.cityName(i.id)}),a.jsxs("small",{children:[Mi(i.pop)," 人"]}),a.jsx("b",{children:oe(i.gdp*4)})]},i.id))})]})}function Xn({label:n,value:e,note:t,testid:i}){return a.jsxs("div",{className:L.readRow,"data-testid":i,children:[a.jsx("b",{children:n}),a.jsx("span",{children:e}),a.jsx("small",{children:t})]})}const ma=n=>`${(n*100).toFixed(1)}%`,Wi=n=>n>=1e4?`${(n/1e4).toFixed(2)} 亿`:`${n.toFixed(n>=100?0:1)} 万`;function od({s:n}){const e=Ie.useMemo(()=>k_(n.world,n.startState,n.state),[n,n.state]),{region:t,service:i,growth:s}=e,r=n.state.turn;return a.jsxs("div",{"data-testid":"readable",children:[a.jsx("p",{className:L.readHead,children:"区域协调：城市间人均产出差距"}),a.jsx(Xn,{testid:"readable-region",label:"人口加权基尼",value:a.jsx(a.Fragment,{children:(t.giniNowBp/1e4).toFixed(3)}),note:a.jsxs(a.Fragment,{children:["起点 ",(t.giniStartBp/1e4).toFixed(3),"，",t.changePct>0?"扩大":t.changePct<0?"缩小":"持平"," ",Math.abs(t.changePct),"%。区域协调分 ",a.jsx("b",{children:t.score})," = 45 + 基尼相对起点下降的百分比 × 4（限 0–100）。 这一项只衡量各城市人均产出相差多少，不含公共服务覆盖——服务的变化在下面单列。"]})}),a.jsx("p",{className:L.readHead,children:"公共服务（单列，不计入总分）"}),a.jsx(Xn,{testid:"readable-fill",label:"填补原服务缺口",value:`${i.filledPct}%`,note:a.jsxs(a.Fragment,{children:["按",a.jsx("b",{children:"人次"}),"算：起点缺口 ",Wi(i.startPersonTimesWan),"人次，新增容量可覆盖 ",Wi(i.filledPersonTimesWan),"人次。住房、学位、医疗、社区服务四类相加，同一居民同时缺学位和医疗就算两次。",i.byKind.map(o=>a.jsxs("span",{className:L.readKind,children:[o.name," ",o.pct,"%"]},o.kind))]})}),a.jsx(Xn,{testid:"readable-persons",label:"不同的人数（去重）",value:`${Wi(i.startPersonsWan[0])}–${Wi(i.startPersonsWan[1])}人`,note:a.jsxs(a.Fragment,{children:["起点至少缺一类服务的",a.jsx("b",{children:"不同"}),"人数。模型只记每座城市的容量，不记谁缺什么，所以只能给区间。现在是 ",Wi(i.nowPersonsWan[0]),"–",Wi(i.nowPersonsWan[1]),"人；人口在变，不能直接和起点相减。"]})}),a.jsx(Xn,{testid:"readable-benefited",label:"受益城市",value:`${i.benefited} / ${i.cities}`,note:"新增了至少一类服务容量的城市数；有容量增加不等于这座城市的缺口已经补完。"}),a.jsx(Xn,{testid:"readable-low",label:"覆盖较低的城市",value:a.jsxs(a.Fragment,{children:[ma(i.lowStart)," → ",ma(i.lowNow)]}),note:a.jsxs(a.Fragment,{children:["覆盖最低的 1/5 城市（共 ",i.lowGroupSize," 座，起点和现在各取当时最低的一批）。起点最低的那批城市现在是 ",ma(i.lowStartGroupNow),"。覆盖 = 住房、教育、医疗三项的平均，每项最高 100%（不含社区服务）。人口迁入会让覆盖下降，所以它可能一边建一边降。"]})}),a.jsx("p",{className:L.readHead,children:"增长：末季和近四季并列"}),s?a.jsxs(a.Fragment,{children:[a.jsx(Xn,{testid:"readable-growth-final",label:"末季年化 GDP",value:oe(s.finalAnnual),note:a.jsxs(a.Fragment,{children:["第 ",s.turn," 季 GDP × 4。较起点 ",s.finalCumPct,"%，折合每年 ",s.finalYearlyPct,"%。"]})}),a.jsx(Xn,{testid:"readable-growth-avg4",label:"近四季平均（年化）",value:oe(s.avg4Annual),note:a.jsxs(a.Fragment,{children:["第 ",s.turn-3,"–",s.turn," 季 GDP 平均 × 4。较起点 ",s.avg4CumPct,"%，折合每年 ",s.avg4YearlyPct,"%（它代表第 ",s.avg4At," 季，所以折年用 ",s.avg4At," 季）。受冲击的那一季会让两个数拉开。"]})}),a.jsx(Xn,{testid:"readable-growth-start",label:"起点（年化）",value:oe(s.startAnnual),note:"起点季度 GDP × 4，两项都和它比。起点之前没有历史季度，所以起点的“四季平均”就是这个值。"})]}):a.jsxs("p",{className:L.muted,"data-testid":"readable-growth-wait",children:n.state.mode==="campaign"&&n.planTurns<4?`本局规划期共 ${n.planTurns} 个季度，计算四季平均 GDP 需要至少 4 个季度。`:["满 4 个季度后显示（现在已结算 ",r," 个）。"]}),a.jsx("p",{className:L.note,children:"以上都只是读数：总分仍是五维加权加任务奖励，权重和评级没有改。"})]})}function uv({s:n}){const e=cc(n.state),t=dc(n.state,n.nation),i=Td(n.state),s=n.state.history,r=s.length>=2?(()=>{const o=Math.min(...s.map(h=>h.gdp)),l=Math.max(...s.map(h=>h.gdp)),d=Math.max(1,l-o);return s.map((h,c)=>`${c/(s.length-1)*100},${34-(h.gdp-o)/d*30}`).join(" ")})():"";return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:L.cityHead,children:[a.jsx("span",{className:L.stripe}),a.jsx("div",{className:L.kind,children:n.state.mode==="sandbox"?"沙盒 · 无规划期限":`${campaignPlanName(n.planTurns)}（试验情景）`}),a.jsx("h2",{children:"目标与评价"}),a.jsxs("div",{className:L.gradeLine,children:[a.jsx("span",{className:L.grade,"data-grade":t.grade,"data-testid":"grade",children:t.grade}),a.jsxs("span",{"data-testid":"score-line",children:["总分 ",a.jsx("b",{children:t.total})," = 五维加权 ",t.weighted," + 任务奖励 ",t.bonus," · 规划目标 ",t.goalsMet,"/",t.goalsTotal,"（单列，不计入总分）"]})]}),n.state.mode==="campaign"&&a.jsxs(a.Fragment,{children:[a.jsx(Ti,{value:Math.min(1,n.state.turn/n.planTurns)}),a.jsxs("small",{className:L.muted,children:["规划进度 ",Math.min(n.state.turn,n.planTurns),"/",n.planTurns," 季度"]})]})]}),a.jsxs(bt,{title:"综合评分（不只看 GDP）",children:[t.dims.map(o=>a.jsx(tn,{label:`${o.name}（权重 ${o.weight}）`,value:`${o.score}`,tone:o.score>=70?"good":o.score>=50?void 0:"bad",bar:o.score/100},o.id)),t.dims.map(o=>a.jsxs("p",{className:L.note,children:[a.jsx("b",{children:o.name}),"：",o.note]},o.id))]}),a.jsx(bt,{title:"这些分数各是什么意思",children:a.jsx(od,{s:n})}),a.jsx(bt,{title:n.state.mode==="campaign"&&n.planTurns===20?"五年规划目标":"规划目标",children:e.map(o=>a.jsxs("div",{className:L.goal,"data-met":o.met,children:[a.jsxs("div",{children:[a.jsx("b",{children:o.name}),a.jsx("small",{children:o.target})]}),a.jsx("span",{children:o.current}),a.jsx(Ti,{value:o.progress,tone:o.met?"good":"gold"})]},o.id))}),a.jsx(bt,{title:"发展任务",children:i.map(o=>a.jsxs("div",{className:L.mission,"data-done":o.doneAt!==null,"data-open":o.open,"data-testid":`mission-${o.m.id}`,"data-have":o.have,children:[a.jsxs("b",{children:[o.doneAt!==null?"✓ ":"",o.m.name]}),a.jsx("small",{children:o.open?o.m.text:`第 ${o.m.from+1} 季度起开放${n.state.mode==="campaign"&&o.m.from>=n.planTurns?"，超出本局规划期":""}`}),o.open&&o.doneAt===null&&a.jsxs("span",{children:[Math.min(o.have,o.need),"/",o.need]}),o.doneAt!==null&&a.jsxs("span",{children:["第 ",o.doneAt+1," 季"]})]},o.m.id))}),r&&a.jsx(bt,{title:"GDP 走势（季度）",children:a.jsx("svg",{className:L.spark,style:{height:38},viewBox:"0 0 100 38",preserveAspectRatio:"none",children:a.jsx("polyline",{points:r,fill:"none",stroke:"#ecd08e",strokeWidth:"1.6",vectorEffect:"non-scaling-stroke"})})})]})}function fv({s:n,locate:e}){const t=n.state.projects.filter(i=>i.project.status==="building");return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:L.cityHead,children:[a.jsx("span",{className:L.stripe}),a.jsx("div",{className:L.kind,children:"项目"}),a.jsx("h2",{children:"在建与计划"})]}),a.jsxs(bt,{title:`本季度计划（${n.pending.length}）`,children:[n.pending.length===0&&a.jsx("p",{className:L.muted,children:"还没有计划。选一座城市，从“建设项目”里下达。"}),n.pending.map(i=>a.jsx(Co,{s:n,o:i},i.id))]}),a.jsxs(bt,{title:`在建项目（${t.length}）`,children:[t.length===0&&a.jsx("p",{className:L.muted,children:"目前没有在建项目。"}),t.map(i=>{const s=i.kind==="link"?(()=>{const o=n.state.links.find(l=>l.id===i.link);return o?`${n.cityName(o.a)}—${n.cityName(o.b)} ${i.mode?sn[i.mode]:""}`:"线路"})():`${n.cityName(i.city)} · ${Ns[i.kind].name}`,r=i.kind==="link"?n.state.links.find(o=>o.id===i.link)?.a:i.city;return a.jsx("button",{className:L.projBtn,onClick:()=>{r!==void 0&&(n.select(r,!0),e(r))},children:a.jsx(ad,{name:s,done:i.done,quarters:i.quarters,stalled:i.stalled})},i.project.id)})]})]})}function pv({s:n}){return a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:L.cityHead,children:[a.jsx("span",{className:L.stripe}),a.jsx("div",{className:L.kind,children:"动态"}),a.jsx("h2",{children:"事件与通知"})]}),a.jsxs(bt,{title:"最近发生的事",children:[n.news.length===0&&a.jsx("p",{className:L.muted,children:"结束第一个季度后，这里会记录完工、事件和任务进展。"}),n.news.slice(0,40).map((e,t)=>a.jsxs("div",{className:L.news,"data-tone":e.tone,children:[a.jsx("small",{children:e.label}),a.jsx("span",{children:e.text})]},t))]}),n.state.modifiers.length>0&&a.jsx(bt,{title:"仍在生效的冲击",children:n.state.modifiers.map(e=>a.jsxs("div",{className:L.news,"data-tone":"info",children:[a.jsxs("small",{children:["至第 ",e.until+1," 季"]}),a.jsx("span",{children:wd(e,n.state.turn)})]},e.id))})]})}function Ai({title:n,onClose:e,children:t,wide:i,testid:s,foot:r}){return a.jsx("div",{className:L.scrim,role:"presentation",children:a.jsxs("div",{className:L.modal,"data-wide":i,role:"dialog","aria-modal":"true","aria-label":n,"data-testid":s,children:[a.jsxs("header",{children:[a.jsx("h2",{children:n}),a.jsx("button",{onClick:e,"aria-label":"关闭",children:"×"})]}),a.jsx("div",{className:L.modalBody,children:t}),r&&a.jsx("footer",{children:r})]})})}function mv({s:n,exit:e}){switch(On(n),n.modal){case"report":return a.jsx(_v,{s:n});case"policy":return a.jsx(vv,{s:n});case"menu":return a.jsx(Sv,{s:n,exit:e});case"final":return a.jsx(yv,{s:n,exit:e});case"help":return a.jsx(Pv,{s:n});case"migration":return a.jsx(Av,{s:n});case"energy":return a.jsx(Rv,{s:n});default:return null}}function gv(n){const e=n.budget,t=n.forecast,i=`融资：${e.bondIssued?`发债 +${oe(e.bondIssued)}，`:""}${e.repaid?`还债 −${oe(e.repaid)}，`:""}利息 −${oe(e.interest)}；税收 ${oe(e.taxes.total)} 在拨款之后入账，季末国库现金 ${oe(e.cashEnd)}。`;if(!t)return i;const s=e.cashEnd-t.cashEnd;if(s===0&&e.shortTotal===t.shortTotal)return`${i}下单前的预览与实际结算完全一致。`;const r=n.shocks.length?`本季发生了随机事件（${n.shocks.map(o=>o.split("：")[0]).join("、")}），预览不含事件。`:"";return`${i}下单前预览的季末现金是 ${oe(t.cashEnd)}，实际 ${oe(e.cashEnd)}，相差 ${oe(Math.abs(s))}。${r}`}function $n({label:n,a:e,b:t,fmt:i,good:s}){const r=t-e,o=r===0?null:r>0==(s==="up");return a.jsxs("div",{className:L.kpi,children:[a.jsx("small",{children:n}),a.jsx("b",{children:i(t)}),a.jsx("span",{"data-tone":o===null?void 0:o?"good":"bad",children:r===0?"持平":`${r>0?"▲":"▼"} ${i(Math.abs(r))}`})]})}function _v({s:n}){const e=n.lastReport;if(!e)return null;const{before:t,after:i}=e;return a.jsxs(Ai,{title:`${e.label} 季度报告`,onClose:()=>n.closeModal(),wide:!0,testid:"report",foot:a.jsx("button",{className:L.go,"data-testid":"report-close",onClick:()=>n.closeModal(),children:"继续"}),children:[a.jsx("p",{className:L.headline,"data-testid":"report-headline",children:e.headline}),a.jsxs("div",{className:L.kpis,children:[a.jsx($n,{label:"年化 GDP",a:t.gdpAnnual,b:i.gdpAnnual,fmt:oe,good:"up"}),a.jsx($n,{label:"人口",a:t.pop,b:i.pop,fmt:Mi,good:"up"}),a.jsx($n,{label:"失业率",a:t.unemployBp,b:i.unemployBp,fmt:s=>gt(s,2),good:"down"}),a.jsx($n,{label:"人均可支配收入（万元/年）",a:t.incomePerCap,b:i.incomePerCap,fmt:s=>s.toFixed(2),good:"up"}),a.jsx($n,{label:"污染指数",a:t.pollutionBp,b:i.pollutionBp,fmt:s=>gt(s,1),good:"down"}),a.jsx($n,{label:"国库现金",a:t.govCash,b:i.govCash,fmt:oe,good:"up"}),a.jsx($n,{label:"债务/年化 GDP",a:t.debtRatioBp,b:i.debtRatioBp,fmt:s=>gt(s,1),good:"down"}),a.jsx($n,{label:"城市间人均产出差距（基尼）",a:t.giniBp,b:i.giniBp,fmt:s=>(s/1e4).toFixed(3),good:"down"})]}),a.jsx("h3",{children:"为什么会这样"}),a.jsx("ol",{className:L.causes,"data-testid":"report-causes",children:e.causes.map((s,r)=>a.jsx("li",{children:s},r))}),(e.linkOpens.length>0||e.completed.some(s=>s.link!==void 0))&&a.jsxs(a.Fragment,{children:[a.jsx("h3",{children:"线路"}),a.jsxs("ul",{className:L.roads,"data-testid":"report-roads",children:[e.linkOpens.map(s=>a.jsxs("li",{"data-testid":`report-road-open-${s.link}`,children:[a.jsxs("div",{children:[a.jsxs("b",{children:[s.nameA,"—",s.nameB,sn[s.mode],"正式通车"]}),a.jsx("span",{children:s.rows.map(r=>`${r.name} 通达度 ${(r.before/100).toFixed(2)}% → ${(r.after/100).toFixed(2)}%`).join("；")})]}),a.jsx("button",{"data-testid":"report-road-link",onClick:()=>n.focusLink(s.link),children:"在地图上查看"})]},`o${s.link}`)),e.completed.filter(s=>s.link!==void 0).map(s=>a.jsxs("li",{"data-testid":`report-road-ready-${s.link}`,children:[a.jsxs("div",{children:[a.jsx("b",{children:s.name}),a.jsx("span",{children:"竣工但尚未启用，下个季度正式通车。"})]}),a.jsx("button",{"data-testid":"report-road-link",onClick:()=>n.focusLink(s.link),children:"在地图上查看"})]},`c${s.link}`))]})]}),e.budget&&a.jsxs(a.Fragment,{children:[a.jsx("h3",{children:"预算执行"}),a.jsx(rd,{items:e.budget.items,testid:"report-budget"}),a.jsx("p",{className:L.note,"data-testid":"report-forecast",children:gv(e)})]}),e.energy&&a.jsx(Cv,{s:n,r:e}),(e.events.length>0||e.commands.some(s=>!s.accepted))&&a.jsxs(a.Fragment,{children:[a.jsx("h3",{children:"本季度发生的事"}),a.jsxs("ul",{className:L.events,children:[e.events.map((s,r)=>a.jsx("li",{children:s},r)),e.commands.filter(s=>!s.accepted).map(s=>a.jsxs("li",{"data-tone":"bad",children:["有一项指令未能执行：",s.reason]},s.id))]})]}),(e.movers.up.length>0||e.movers.down.length>0)&&a.jsxs(a.Fragment,{children:[a.jsx("h3",{children:"人口流动"}),a.jsxs("p",{className:L.note,children:[e.movers.up.map(s=>`${s.name} +${Mi(s.delta)}`).join("，"),e.movers.down.length?`；流出：${e.movers.down.map(s=>`${s.name} −${Mi(-s.delta)}`).join("，")}`:""]})]}),a.jsx("h3",{children:"GDP 核算"}),a.jsxs("p",{className:L.note,children:["消费 ",oe(e.accounts.consumption)," + 政府 ",oe(e.accounts.government)," + 投资 ",oe(e.accounts.investment)," + 出口 ",oe(e.accounts.exports)," − 进口 ",oe(e.accounts.imports)," = ",oe(e.accounts.gdp),"； 生产法与支出法差额 ",e.accounts.residual,"（必须为 0）。"]}),a.jsx("h3",{children:"本季评分"}),a.jsxs("div",{className:L.scoreLine,children:[a.jsx("span",{className:L.grade,"data-grade":e.score.grade,children:e.score.grade}),a.jsxs("span",{children:["综合 ",e.score.total," 分 · 目标 ",e.score.goalsMet,"/",e.score.goalsTotal]}),a.jsx("div",{className:L.dimBars,children:e.score.dims.map(s=>a.jsxs("div",{children:[a.jsxs("small",{children:[s.name," ",s.score]}),a.jsx(Ti,{value:s.score/100,tone:s.score>=70?"good":s.score>=50?"gold":"bad"})]},s.id))})]})]})}const xv=[{name:"税收",fields:["incomeTaxBp","corpTaxBp","prodTaxBp"]},{name:"公共支出",fields:["eduBp","healthBp","welfareBp"]},{name:"环境",fields:["envLevel"]},{name:"产业扶持",fields:["subAgri","subManu","subServ","subTech"]}];function vv({s:n}){const e=n.plan,[t,i]=Ie.useState(0),[s,r]=Ie.useState(0),o=n.policyPointsUsed(),l=(d,h)=>Sa[d].unit==="bp"?gt(h,1):`${h} 级`;return a.jsx(Ai,{title:"政策与预算",onClose:()=>n.closeModal(),wide:!0,testid:"policy-modal",foot:a.jsxs(a.Fragment,{children:[a.jsxs("span",{className:L.muted,children:["改革点数 ",o,"/",Ci.reformPointsPerQuarter,"（每季度最多调整 ",Ci.reformPointsPerQuarter," 项，同一项隔 ",Ci.sameReformGapQuarters," 季才能再调）"]}),a.jsx("button",{className:L.go,onClick:()=>n.closeModal(),children:"完成"})]}),children:a.jsxs("div",{className:L.policyGrid,children:[a.jsxs("div",{children:[xv.map(d=>a.jsxs("section",{className:L.pgroup,children:[a.jsx("h3",{children:d.name}),d.fields.map(h=>{const c=Sa[h],u=n.policyValue(h),p=n.state.policy[h],m=n.pendingPolicy(h)!==null,_=n.policyWait(h),x=_>0||!m&&o>=Ci.reformPointsPerQuarter;return a.jsxs("label",{className:L.slider,"data-pending":m,children:[a.jsxs("span",{children:[a.jsx("b",{children:c.name}),a.jsx("small",{children:c.note})]}),a.jsx("input",{type:"range",min:c.min,max:c.max,step:c.step,value:u,disabled:x,"data-testid":`slider-${h}`,"aria-label":c.name,onChange:g=>n.queuePolicy(h,Number(g.target.value))}),a.jsxs("output",{children:[l(h,u),m&&a.jsxs("em",{children:[" 现 ",l(h,p)]}),_>0&&a.jsxs("em",{children:[" 还需 ",_," 季"]})]})]},h)})]},d.name)),a.jsxs("section",{className:L.pgroup,children:[a.jsx("h3",{children:"国债"}),a.jsxs("p",{className:L.note,children:["余额 ",oe(e.debtBefore),"，年利率 ",gt(Ci.bondRateBp,2),"，上限 ",(Ci.debtCapBp/100).toFixed(0),"%，还能发约 ",n.bondRoom()," 亿。"]}),a.jsxs("div",{className:L.bondRow,children:[a.jsx("input",{type:"number",min:0,step:100,value:t||"",placeholder:"发债（亿元）","aria-label":"发债金额（亿元）",onChange:d=>i(Math.max(0,Math.floor(Number(d.target.value)||0)))}),a.jsx("button",{"data-testid":"bond-btn",onClick:()=>{n.queueBond(t)&&i(0)},children:"列入发债"}),a.jsx("input",{type:"number",min:0,step:100,value:s||"",placeholder:"还债（亿元）","aria-label":"还债金额（亿元）",onChange:d=>r(Math.max(0,Math.floor(Number(d.target.value)||0)))}),a.jsx("button",{onClick:()=>{n.queueRepay(s)&&r(0)},children:"列入还债"})]})]})]}),a.jsx(Mv,{s:n})]})})}function Mv({s:n}){const e=n.plan;if(!e.ok)return a.jsxs("aside",{className:L.budget,"data-testid":"budget",children:[a.jsx("h3",{children:"本季度预算预览"}),a.jsxs("p",{className:L.note,"data-tone":"bad",children:["预演失败：",e.failure]})]});const t=e.commands.filter(i=>!i.accepted);return a.jsxs("aside",{className:L.budget,"data-testid":"budget",children:[a.jsx("h3",{children:"本季度预算预览"}),a.jsx("p",{className:L.note,children:"这是真实结算的预演：金额、债务限制和拨款顺序与结算相同，只有本季可能发生的随机事件不在其中。"}),a.jsx("h4",{children:"① 期初现金与融资（融资不是财政收入）"}),a.jsx("table",{"data-testid":"budget-financing",children:a.jsxs("tbody",{children:[a.jsxs("tr",{children:[a.jsx("td",{children:"季初国库现金"}),a.jsx("td",{children:oe(e.cashStart)})]}),e.bondAsked>0&&a.jsxs("tr",{"data-testid":"fin-bond",children:[a.jsxs("td",{children:["发行国债",e.bondIssued<e.bondAsked&&a.jsxs("em",{children:["（申请 ",oe(e.bondAsked),"，未获批）"]})]}),a.jsxs("td",{"data-tone":"good",children:["+",oe(e.bondIssued)]})]}),e.repayAsked>0&&a.jsxs("tr",{"data-testid":"fin-repay",children:[a.jsxs("td",{children:["提前还债",e.repaid<e.repayAsked&&a.jsxs("em",{children:["（申请 ",oe(e.repayAsked),"，实际只能还 ",oe(e.repaid),"）"]})]}),a.jsxs("td",{children:["−",oe(e.repaid)]})]}),a.jsxs("tr",{children:[a.jsxs("td",{children:["国债利息",e.bondIssued>0&&a.jsx("em",{children:"（新债本季即付息）"})]}),a.jsxs("td",{children:["−",oe(e.interest)]})]}),e.principalDue>0&&a.jsxs("tr",{children:[a.jsx("td",{children:"到期本金"}),a.jsxs("td",{children:["−",oe(e.principalDue)]})]}),a.jsxs("tr",{className:L.sum,"data-testid":"cash-open",children:[a.jsx("td",{children:"可用于拨款的现金"}),a.jsx("td",{children:oe(e.cashOpen)})]})]})}),a.jsx("h4",{children:"② 按顺序拨款"}),a.jsx(rd,{items:e.items,testid:"budget-order"}),a.jsxs("p",{className:L.note,"data-testid":"budget-verdict","data-tone":e.shortTotal>0?"bad":"good",children:[e.shortTotal>0?`应付合计 ${oe(e.dueTotal)}，现金不够，缺口 ${oe(e.shortTotal)}。`:`应付合计 ${oe(e.dueTotal)}，现金够付，付完余 ${oe(e.cashOpen-e.paidTotal)}。`,e.stalled.length>0&&` 停工待款：${e.stalled.map(i=>`${i.name}（缺 ${oe(i.short)}）`).join("、")}。`,e.items.some(i=>i.key!=="project"&&i.short>0)&&` 排在工程之前的${e.items.filter(i=>i.key!=="project"&&i.short>0).map(i=>i.name).join("、")}也被削减了。`]}),e.displaced.length>0&&a.jsxs("p",{className:L.note,"data-tone":"warn","data-testid":"budget-displaced",children:["你的计划挤占了：",e.displaced.map(i=>`${i.name} 少拨 ${oe(i.lost)}`).join("；"),"。"]}),a.jsx("h4",{children:"③ 季末税收（拨款之后才入账，不能用来付本季的账）"}),a.jsx("table",{"data-testid":"budget-taxes",children:a.jsxs("tbody",{children:[a.jsxs("tr",{children:[a.jsx("td",{children:"增值税及流转税"}),a.jsxs("td",{children:["+",oe(e.taxes.prod)]})]}),a.jsxs("tr",{children:[a.jsx("td",{children:"企业所得税"}),a.jsxs("td",{children:["+",oe(e.taxes.profit)]})]}),a.jsxs("tr",{children:[a.jsx("td",{children:"个人所得税"}),a.jsxs("td",{children:["+",oe(e.taxes.income)]})]}),a.jsxs("tr",{className:L.sum,children:[a.jsx("td",{children:"税收合计（财政收入）"}),a.jsx("td",{children:oe(e.taxes.total)})]}),a.jsxs("tr",{className:L.sum,children:[a.jsx("td",{children:"季末国库现金"}),a.jsx("td",{children:oe(e.cashEnd)})]})]})}),t.length>0&&a.jsxs("p",{className:L.note,"data-tone":"bad",children:["有指令不会被执行：",t.map(i=>i.reason).join("；")]}),n.pending.length>0&&a.jsxs(a.Fragment,{children:[a.jsx("h4",{children:"已列入的指令"}),n.pending.map(i=>a.jsx(Co,{s:n,o:i},i.id))]})]})}function Sv({s:n,exit:e}){const t=Ie.useRef(null),[,i]=Ie.useState(0),s=()=>i(l=>l+1),r=l=>l==="auto"?"自动存档":`存档 ${l}`,o=l=>new Date(l).toLocaleString("zh-CN",{hour12:!1});return a.jsxs(Ai,{title:"游戏菜单",onClose:()=>n.closeModal(),testid:"menu-modal",foot:a.jsx("button",{className:L.go,onClick:()=>n.closeModal(),children:"回到游戏"}),children:[a.jsx("h3",{children:"存档与读档"}),a.jsx("ul",{className:L.slots,children:Nd.map(l=>{const d=Dd(l);return a.jsxs("li",{children:[a.jsxs("div",{children:[a.jsx("b",{children:r(l)}),a.jsx("span",{children:d?`${d.turnLabel} · ${d.mode==="sandbox"?"沙盒":`战役 · ${d.campaignTurns??20} 季度`} · 年化 GDP ${d.gdp} · ${o(d.savedAt)}`:"空"})]}),a.jsx("button",{"data-testid":`save-${l}`,disabled:l==="auto",onClick:()=>{n.saveTo(l),s()},children:"存档"}),a.jsx("button",{"data-testid":`load-${l}`,disabled:!d,onClick:()=>{n.loadFrom(l),s()},children:"读档"}),a.jsx(bv,{id:l,refresh:s})]},l)})}),a.jsxs("div",{className:L.btnRow,children:[a.jsx("button",{onClick:()=>n.exportFile(),children:"导出存档文件"}),a.jsx("button",{onClick:()=>t.current?.click(),children:"导入存档文件…"}),a.jsx("input",{ref:t,type:"file",accept:".json,application/json",hidden:!0,onChange:async l=>{const d=l.target.files?.[0];l.target.value="",d&&(n.importText(await d.text(),d.name),s())}})]}),a.jsx(Ev,{s:n}),a.jsx("h3",{children:"设置"}),a.jsx("div",{className:L.switches,children:[["autosave","每季度自动存档"],["autoReport","结束季度后弹出报告"],["effects","地图动画"],["guide","新游戏时显示成渝开局引导"]].map(([l,d])=>a.jsxs("button",{role:"switch","aria-checked":n.settings[l],onClick:()=>n.updateSettings({[l]:!n.settings[l]}),children:[a.jsx("span",{children:d}),a.jsx("i",{"data-on":n.settings[l]})]},l))}),a.jsxs("div",{className:L.btnRow,children:[a.jsx("button",{"data-testid":"guide-replay",disabled:!n.guideCities||!!n.guideLink?.mode,title:n.guideLink?.mode?"成渝公路已经通车":"从当前进度重新显示成渝开局引导",onClick:()=>{n.startGuide(),n.closeModal()},children:"成渝开局引导"}),a.jsx("button",{onClick:()=>n.open("help"),children:"操作说明"}),a.jsx("button",{"data-testid":"exit-btn",onClick:()=>{n.settings.autosave&&n.saveTo("auto"),e()},children:"保存并返回主菜单"})]})]})}function yv({s:n,exit:e}){const t=dc(n.state,n.nation),i=cc(n.state),s={S:"规划超额完成，增长、民生、财政与生态都站得住。",A:"规划完成得很好，仍有个别短板。",B:"规划基本完成，几个维度之间的取舍还有改进空间。",C:"规划勉强过关，短板明显。",D:"规划未达预期，请回头看看哪几个维度被牺牲了。"}[t.grade],r=Cd.filter(o=>n.state.missionDone[o.id]!==void 0);return a.jsxs(Ai,{title:`${campaignPlanName(n.planTurns)}（试验情景）评价`,onClose:()=>n.closeModal(),wide:!0,testid:"final",foot:a.jsxs(a.Fragment,{children:[a.jsx("button",{onClick:()=>n.exportFile(),children:"导出存档"}),a.jsx("button",{onClick:e,children:"返回主菜单"}),a.jsx("button",{className:L.go,onClick:()=>n.closeModal(),children:"继续经营"})]}),children:[a.jsxs("div",{className:L.scoreLine,children:[a.jsx("span",{className:L.grade,"data-grade":t.grade,"data-big":"true",children:t.grade}),a.jsxs("span",{children:["总分 ",a.jsx("b",{"data-testid":"final-total",children:t.total})," 分 · 等级按总分评定"]})]}),a.jsx("p",{children:`已结算本局规划期的 ${n.planTurns} 个季度。`}),a.jsx("p",{children:s}),a.jsx("table",{className:L.finalTable,"data-testid":"final-lines",children:a.jsxs("tbody",{children:[a.jsxs("tr",{children:[a.jsx("th",{children:"五维加权分"}),a.jsxs("td",{"data-testid":"final-weighted",children:[a.jsx("b",{children:t.weighted})," / 100"]}),a.jsx("td",{children:"下面五个维度按权重加权，不含任务奖励"})]}),a.jsxs("tr",{children:[a.jsx("th",{children:"任务奖励"}),a.jsx("td",{"data-testid":"final-bonus",children:a.jsxs("b",{children:["+",t.bonus]})}),a.jsxs("td",{children:["完成发展任务 ",t.missions,"/",t.missionsTotal," 项，每项 +",uc,"，最多 +",Pd]})]}),a.jsxs("tr",{className:L.sum,children:[a.jsx("th",{children:"总分"}),a.jsxs("td",{children:[a.jsx("b",{children:t.total}),t.capped?"（封顶 100）":""]}),a.jsx("td",{children:"五维加权分 + 任务奖励，最高 100"})]}),a.jsxs("tr",{children:[a.jsx("th",{children:"规划目标"}),a.jsxs("td",{"data-testid":"final-goals",children:[a.jsx("b",{children:t.goalsMet})," / ",t.goalsTotal]}),a.jsx("td",{children:"单独列出，不计入总分"})]})]})}),a.jsx("h3",{children:"五个维度"}),a.jsx("div",{className:L.dimBars,style:{gridTemplateColumns:"repeat(5, 1fr)"},children:t.dims.map(o=>a.jsxs("div",{children:[a.jsxs("small",{children:[o.name," ",o.score,"（权重 ",o.weight,"%）"]}),a.jsx(Ti,{value:o.score/100,tone:o.score>=70?"good":o.score>=50?"gold":"bad"}),a.jsx("small",{className:L.muted,children:o.note})]},o.id))}),a.jsx("h3",{children:"这些分数各是什么意思（单列，不计入总分）"}),a.jsx(od,{s:n}),a.jsx("h3",{children:"规划目标"}),a.jsx("ul",{className:L.events,children:i.map(o=>a.jsxs("li",{"data-tone":o.met?"good":void 0,children:[o.met?"✓":"✗"," ",o.name,"：",o.target,"（",o.current,"）"]},o.id))}),a.jsx("h3",{children:"已完成的发展任务"}),a.jsx("ul",{className:L.events,children:r.length?r.map(o=>a.jsxs("li",{"data-tone":"good",children:["✓ ",o.name,"（",Si(n.state.missionDone[o.id]),"）"]},o.id)):a.jsx("li",{children:"没有完成任何任务"})}),a.jsx("p",{className:L.note,children:"这是试验情景的结算：数值和目标都是游戏设计值，不代表真实的国家规划或统计。继续经营时评价不再更新。"})]})}const Rr=(n,e)=>`chinaciv-game${Ud(n)??"old"}-original-${e}.json`;function bv({id:n,refresh:e}){const t=Fd(n);return a.jsxs(a.Fragment,{children:[t.backup&&a.jsxs("button",{"data-testid":`original-${n}`,title:`这个位置原来是 ${Xi(t.backupRules)} 存档，原文已另存一份，可下载后用 ${Xi(t.backupRules)} 版本打开`,onClick:()=>br(Rr(t.backupRules,n),t.backup),children:["下载 ",Xi(t.backupRules)," 原档"]}),t.current&&!t.currentProtected&&a.jsxs("button",{"data-testid":`unprotected-${n}`,"data-tone":"bad",title:"这个位置里还是旧版存档，原文没有备份成功。先下载它，再继续存档",onClick:()=>{br(Rr(t.currentRules,`${n}-slot`),t.current),e()},children:["下载此处的 ",Xi(t.currentRules)," 存档（没有备份）"]})]})}function Ev({s:n}){const e=n.migrationNote;return!e||e.source!=="file"?null:a.jsxs("p",{className:L.note,"data-testid":"file-original-row",children:["本局是从文件",e.fileName?`“${e.fileName}”`:"","导入的 ",Xi(e.migration.from)," 存档。",a.jsx("button",{"data-testid":"file-original",onClick:()=>br(Rr(e.migration.from,"import"),e.original),children:"另存这份导入文件的原文"})]})}function Tv(n){const e=n.migrationNote,t=Xi(e.migration.from);if(e.source==="file")return{file:!0,game:t,fileName:e.fileName,text:`你导入的${e.fileName?`文件“${e.fileName}”`:"文件"}没有被修改，游戏不会写回它；它仍在你自己的设备上，是可以回退的原件。这次是从文件导入，没有读取存档位，所以不会生成存档位备份。`};const i=e.source,s=Ld(i)===e.original,r=i==="auto"?"自动存档位":`存档 ${i}`;if(s)return{file:!1,game:t,ok:!0,text:`“${r}”的原文已另存一份（读回核对一致），菜单里该存档位旁边有“下载 ${t} 原档”。`};const o=e.backup,l=o?.kind==="conflict"?"这个存档位已有另一份旧版原档备份，不会覆盖它":o?.kind==="failed"?`浏览器报错：${o.reason}`:Id(o)?"备份写入后又不见了":"没有进行备份";return{file:!1,game:t,ok:!1,text:`“${r}”的原文没有备份成功（${l}）。存档位里的内容目前没有被改动，但在备份成功之前，游戏不会往这个位置写新存档（自动存档也会跳过）。请现在点下面的“下载原档”留一份。`}}function wv(n){const e=n.state;return e.mode!=="campaign"?"第 3 版新增的能源事件只在战役里出现，沙盒没有它。":e.energy.phase!=="idle"?"这个存档里的能源事件已经发生过。":e.turn>hr.lastArm?`第 3 版新增了一件能源事件。这个存档已经过了它能被触发的最后季度（第 ${hr.lastArm+1} 季度），所以不会遇到它。`:`第 3 版新增了一件能源事件，在这个存档里还没有发生。它会在成渝线路通车后不久出现；没修成渝线的话，最迟从第 ${hr.fallbackArm+1} 季度起也会出现。发现之后的下一个季度，要你在“电力”面板里决定怎么应对。`}function Av({s:n}){const e=n.migrationNote;if(!e)return null;const{migration:t,source:i}=e,s=t.revoked.length,r=Tv(n),o=r.game;return a.jsxs(Ai,{title:`已读取 ${o} 存档`,onClose:()=>n.closeModal(),testid:"migration",foot:a.jsx("button",{className:L.go,"data-testid":"migration-ok",onClick:()=>n.closeModal(),children:"知道了，继续游戏"}),children:[a.jsxs("p",{"data-testid":"migration-intro",children:["这份存档来自 ",o,"（规则 ",t.from,"），当前规则是 ",t.to,"。存档的校验通过：城市、资金、工程、政策和线路都原样读入，没有改动。"]}),a.jsx("p",{"data-testid":"migration-result",children:s===0?"发展任务的奖励按新规则重新核对后全部保留，没有收回任何奖励。":`发展任务按新规则重新核对：住房、学校、医院三类任务现在要求建在 3 座不同的城市。下面 ${s} 项奖励不满足，已经收回：`}),s>0&&a.jsx("ul",{className:L.events,"data-testid":"migration-revoked",children:t.revoked.map(l=>a.jsxs("li",{"data-tone":"bad","data-id":l.id,children:[l.name,"：原在 ",Si(l.since)," 获得，现在只覆盖 ",l.have,"/",l.need," 座城市"]},l.id))}),s>0&&a.jsxs("p",{className:L.note,"data-testid":"migration-reearn",children:["收回的任务以后在条件满足的那个季度会重新获得（条件：",t.revoked.map(l=>`${l.name}要覆盖 ${l.need} 座不同的城市，现在是 ${l.have} 座`).join("；"),"）。任务奖励只影响终局的“任务奖励”加分（每项 +",uc,"），不影响经济和其他任何数值。"]}),a.jsx("p",{className:L.note,"data-testid":"migration-energy",children:wv(n)}),a.jsx("p",{className:L.note,"data-testid":"migration-original","data-source":i==="file"?"file":"slot","data-backup":r.file?"n/a":r.ok?"ok":"none",children:r.text}),a.jsx("div",{className:L.btnRow,children:a.jsx("button",{"data-testid":"migration-download",onClick:()=>br(Rr(t.from,i==="file"?"import":i),e.original),children:i==="file"?"另存这份导入文件的原文":`下载${i==="auto"?"自动存档位":`存档 ${i}`}的 ${o} 原档`})}),a.jsxs("p",{className:L.note,children:["再次存档会用新格式保存，",o," 版本读不了新格式的存档；要回退，请用原档在 ",o," 版本里打开。"]})]})}const vi=n=>(Math.abs(n)/100).toFixed(1);function Rv({s:n}){const e=Rd(n.world,n.state,n.pendingCommands()),t=n.state.turn,i=n.energyQueued,s=c=>`${Si(t)}–${Si(t+c-1)}`,r=c=>e.options.find(u=>u.choice===c),o=r("subsidy"),l=r("stagger"),d=c=>c.map(u=>Sr[u]).join("、"),h=(c,u)=>a.jsx("button",{className:L.go,"data-testid":`energy-choose-${c}`,"aria-pressed":i===c,onClick:()=>n.queueEnergy(c),children:i===c?`已选：${u}`:`选${u}`});return a.jsxs(Ai,{title:"能源决定",onClose:()=>n.closeModal(),wide:!0,testid:"energy-modal",foot:a.jsxs(a.Fragment,{children:[a.jsx("span",{className:L.muted,children:"这里只写规则，和本季国库现金的预演；之后各季的产出不在这里预测，实际数字会在季度报告和“电力”页按结算结果显示。"}),a.jsx("button",{"data-testid":"energy-later",onClick:()=>n.closeModal(),children:"稍后再决定"})]}),children:[a.jsxs("p",{"data-testid":"energy-intro",children:[a.jsxs("b",{children:[e.shock.name,"（全国）"]}),"：",e.shock.text,"它压低的是全国电网的有效供电，不是某一座城市的；",s(e.shock.quarters),"（",e.shock.quarters," 个季度）每季使全国电力满足度下降 ",vi(e.shock.valueBp)," 个百分点，装机有富余也抵不掉。"]}),a.jsx("p",{className:L.note,"data-testid":"energy-status",children:i?`已选：${Mr[i]}。结束季度时生效，结束之前可以改选。`:"还没有选。三个答案都要明确选一个：什么都不做也要选“不采取措施”。"}),a.jsxs("div",{className:L.optGrid,children:[a.jsxs("article",{className:L.opt,"data-testid":"energy-opt-subsidy","data-chosen":i==="subsidy",children:[a.jsx("h4",{children:"紧急保供"}),a.jsx("p",{className:L.optLead,children:"政府出钱补贴电力供应商，把电保住。"}),a.jsxs("dl",{children:[a.jsx("dt",{children:"花多少钱"}),a.jsxs("dd",{"data-testid":"energy-subsidy-cost",children:["每季按全国当季产出的 ",(hr.subsidy.dueBp/100).toFixed(1),"% 拨付，本季应付 ",a.jsx("b",{children:oe(o.due)}),"。它排在运营、转移支付、产业补贴和全部工程款之前。"]}),a.jsx("dt",{children:"本季国库"}),a.jsxs("dd",{"data-testid":"energy-subsidy-cash",children:["轮到它时国库现金 ",oe(o.cashBefore),"：",o.short>0?a.jsxs(a.Fragment,{children:["只能付 ",oe(o.paid),"，缺 ",oe(o.short),"；缓解按实付比例打折。"]}):a.jsxs(a.Fragment,{children:["够付，付完余 ",oe(o.cashBefore-o.paid),"。"]})]}),a.jsx("dt",{children:"挤占什么"}),a.jsxs("dd",{"data-testid":"energy-subsidy-crowd",children:[o.stalledMore>0?a.jsxs(a.Fragment,{children:["本季多 ",a.jsx("b",{children:o.stalledMore})," 个工程因为现金先拨给了保供款而停工待款"]}):"本季不会让更多工程停工",o.displaced.length>0&&`；${o.displaced.slice(0,3).map(c=>`${c.name} 少拨 ${oe(c.lost)}`).join("；")}${o.displaced.length>3?` 等 ${o.displaced.length} 项`:""}`,"。"]}),a.jsx("dt",{children:"影响谁"}),a.jsx("dd",{children:"全国电网：各行业按各自对电力的依赖受益，钱从国库出。"}),a.jsx("dt",{children:"多久"}),a.jsxs("dd",{children:[o.quarters," 个季度（",s(o.quarters),"），到期补贴和缓解一起撤销。"]}),a.jsx("dt",{children:"能抵回"}),a.jsxs("dd",{children:["最多 ",vi(o.reliefBp)," 个百分点（按实付比例）。"]})]}),h("subsidy","紧急保供")]}),a.jsxs("article",{className:L.opt,"data-testid":"energy-opt-stagger","data-chosen":i==="stagger",children:[a.jsx("h4",{children:"错峰生产"}),a.jsx("p",{className:L.optLead,children:"让耗电大的行业错开高峰、临时少开工，把电让出来。"}),a.jsxs("dl",{children:[a.jsx("dt",{children:"花多少钱"}),a.jsx("dd",{"data-testid":"energy-stagger-cost",children:"不动用国库现金，不挤占任何拨款。"}),a.jsx("dt",{children:"代价"}),a.jsxs("dd",{"data-testid":"energy-stagger-curb",children:[d(l.sectors),"的产能全国统一临时下调 ",a.jsxs("b",{children:[vi(l.cutBp),"%"]}),"，这些行业的产出会比不限产时少。"]}),a.jsx("dt",{children:"影响谁"}),a.jsxs("dd",{children:[d(l.sectors),"；",d(["agri","serv"]),"不被限产。"]}),a.jsx("dt",{children:"多久"}),a.jsxs("dd",{children:[l.quarters," 个季度（",s(l.quarters),"），到期限产自动取消。"]}),a.jsx("dt",{children:"能抵回"}),a.jsxs("dd",{children:[vi(l.reliefBp)," 个百分点。"]})]}),h("stagger","错峰生产")]}),a.jsxs("article",{className:L.opt,"data-testid":"energy-opt-none","data-chosen":i==="none",children:[a.jsx("h4",{children:"不采取措施"}),a.jsx("p",{className:L.optLead,children:"不花钱，也不限产，让市场自己消化。"}),a.jsxs("dl",{children:[a.jsx("dt",{children:"花多少钱"}),a.jsx("dd",{children:"不花国库的钱。"}),a.jsx("dt",{children:"代价"}),a.jsx("dd",{children:"冲击照常压低满足度，没有任何缓解。"}),a.jsx("dt",{children:"多久"}),a.jsxs("dd",{children:["冲击持续 ",e.shock.quarters," 个季度（",s(e.shock.quarters),"），之后自动结束。"]})]}),h("none","不采取措施")]})]})]})}function Cv({s:n,r:e}){const t=e.energy,i=t.row,s=n.state.energy;return a.jsxs("div",{"data-testid":"report-energy",children:[a.jsx("h3",{children:"能源事件"}),t.foundNow&&a.jsxs("p",{"data-testid":"report-energy-found","data-tone":"bad",children:["能源预警：燃料供应趋紧，下个季度起全国电力供应将受冲击。下个季度下达指令前，要先在“电力”面板作决定。"," ",a.jsx("button",{"data-testid":"report-energy-open",onClick:()=>{n.setTab("power"),n.open("energy")},children:"现在就去决定"})]}),i&&a.jsxs(a.Fragment,{children:[a.jsxs("p",{"data-testid":"report-energy-line",children:[a.jsx("b",{children:Mr[i.choice]}),t.byDefault?"（没有下达决定，按默认处理）":""," · 第 ",i.turn-s.from+1,"/",s.until-s.from," 个季度",t.quartersLeft>0?`，之后还有 ${t.quartersLeft} 个季度`:"，这是最后一个季度"]}),a.jsxs("div",{className:L.facts,"data-testid":"report-energy-grid",children:[a.jsxs("span",{children:["全国电力满足度 ",a.jsxs("b",{children:[(i.adequacyBp/100).toFixed(1),"%"]})]}),a.jsxs("span",{children:["装机可满足 ",a.jsxs("b",{children:[(Math.min(1e4,i.ratioBp)/100).toFixed(1),"%"]})]}),a.jsxs("span",{children:["事件冲击 ",a.jsxs("b",{children:["−",vi(i.shockBp)," 点"]})]}),a.jsxs("span",{children:["应对措施 ",a.jsx("b",{children:i.reliefBp?`+${vi(i.reliefBp)} 点`:"无"})]})]}),a.jsxs("div",{className:L.facts,"data-testid":"report-energy-money",children:[i.choice==="subsidy"?a.jsxs(a.Fragment,{children:[a.jsxs("span",{children:["保供补贴应付 ",a.jsx("b",{children:oe(i.due)})]}),a.jsxs("span",{children:["实付 ",a.jsx("b",{children:oe(i.paid)}),i.paid<i.due?`（缺 ${oe(i.due-i.paid)}，缓解按 ${(i.paidBp/100).toFixed(0)}% 计）`:""]})]}):a.jsxs("span",{children:["保供补贴 ",a.jsx("b",{children:"无"})]}),a.jsxs("span",{children:["付款开始时国库现金 ",a.jsx("b",{children:oe(t.cashOpen)})]}),a.jsxs("span",{children:["季末国库现金 ",a.jsx("b",{children:oe(t.cashEnd)})]}),i.curtailBp>0&&a.jsxs("span",{children:["限产 ",a.jsxs("b",{children:[Sr.manu,"、",Sr.tech," 产能 −",vi(i.curtailBp),"%"]})]})]}),a.jsxs("table",{className:L.pay,"data-testid":"report-energy-sectors",children:[a.jsx("thead",{children:a.jsxs("tr",{children:[a.jsx("th",{children:"受影响的行业"}),a.jsx("th",{children:"上季产出"}),a.jsx("th",{children:"本季产出"}),a.jsx("th",{children:"本季出力"})]})}),a.jsx("tbody",{children:t.sectors.map(r=>a.jsxs("tr",{"data-testid":`report-energy-sector-${r.id}`,children:[a.jsx("td",{children:r.name}),a.jsx("td",{children:oe(r.outBefore)}),a.jsx("td",{children:oe(r.outAfter)}),a.jsx("td",{children:r.factorBp===null?"—":`${(r.factorBp/100).toFixed(1)}%`})]},r.id))})]}),a.jsx("p",{className:L.note,children:"“本季出力”是各行业实际开工的产能比例：电力缺口和错峰限产合在一起。这些数字都是本季结算的结果，不是预测。"})]}),t.expiredNow&&a.jsx("p",{"data-testid":"report-energy-expired",children:"能源冲击和你选的应对措施已经结束：本季没有冲击，没有保供补贴，也没有限产，临时影响已经撤销。"})]})}function Pv({s:n}){return a.jsxs(Ai,{title:"操作说明",onClose:()=>n.open("menu"),testid:"help",children:[a.jsxs("ol",{className:L.help,children:[a.jsxs("li",{children:[a.jsx("b",{children:"看地图"}),"：拖动、滚轮缩放；点击城市旗标选中，右侧面板显示这座城市的产出、民生和可建设项目。"]}),a.jsxs("li",{children:[a.jsx("b",{children:"下达指令"}),"：在右侧“建设项目”点",a.jsx("b",{children:"下达"}),"，或用底栏“建设/产业/科技”选项目后点城市。指令先列入本季度计划，可以随时撤销。"]}),a.jsxs("li",{children:[a.jsx("b",{children:"修路修铁路"}),"：底栏“交通”选公路/铁路/高铁，依次点两座城市，在右侧确认造价和工期后下达；已有线路可以升级。"]}),a.jsxs("li",{children:[a.jsx("b",{children:"调政策"}),"：底栏“政策”调税率、教育医疗和转移支付、环保、产业扶持，并看预算预览；也可以发债或还债。每季度最多调整 3 项。"]}),a.jsxs("li",{children:[a.jsx("b",{children:"结束季度"}),"：点右下角“结束季度”。工程按季度拨款，资金不足的项目会停工；结算后弹出季度报告，说明增长、就业、财政和人口变动的原因。"]}),a.jsxs("li",{children:[a.jsx("b",{children:"目标"}),"：顶栏“目标”或右侧“目标”页看规划目标、发展任务和综合评分。评分不只看 GDP，也看居民生活、区域协调、财政和环境。"]}),a.jsxs("li",{children:[a.jsx("b",{children:"存档"}),"：顶栏“菜单”可存档、读档、导出文件。每个季度会自动存档。"]}),a.jsxs("li",{children:[a.jsx("b",{children:"快捷键"}),"：Esc 取消当前选中的工具；/ 搜索城市；方向键或 WASD 移动地图。"]})]}),a.jsx("p",{className:L.note,children:"提示：这是试验情景，城市数据是游戏参数；你不能直接修改 GDP 或人口，只能通过投资、政策和预算影响它们。"})]})}const nc='12px "Songti SC","Noto Serif CJK SC","PingFang SC",serif',xs=(n,e,t)=>{const i=e[0]-n[0],s=e[1]-n[1],r=Math.hypot(i,s)||1,o=(t%2?1:-1)*Math.min(60,r*.07);return[(n[0]+e[0])/2-s/r*o,(n[1]+e[1])/2+i/r*o]},Dn=(n,e,t,i)=>{n.beginPath(),n.moveTo(e[0],e[1]),n.quadraticCurveTo(t[0],t[1],i[0],i[1])},vs=(n,e,t,i)=>{const s=1-i;return[s*s*n[0]+2*s*i*e[0]+i*i*t[0],s*s*n[1]+2*s*i*e[1]+i*i*t[1]]};function Nv(n,e,t,i,s,r){n.lineCap="round",n.lineJoin="round",n.setLineDash([]),s==="road"?(Dn(n,e,t,i),n.strokeStyle="rgba(24,16,6,.85)",n.lineWidth=4.4*r,n.stroke(),n.strokeStyle="#e2c27a",n.lineWidth=2.2*r,n.stroke()):s==="rail"?(Dn(n,e,t,i),n.strokeStyle="rgba(14,18,24,.9)",n.lineWidth=5*r,n.stroke(),n.strokeStyle="#d7dde3",n.lineWidth=3*r,n.stroke(),n.setLineDash([2*r,6*r]),n.strokeStyle="#27303a",n.lineWidth=3*r,n.stroke(),n.setLineDash([])):(Dn(n,e,t,i),n.strokeStyle="rgba(40,6,4,.9)",n.lineWidth=6.4*r,n.stroke(),n.strokeStyle="#e8503c",n.lineWidth=4*r,n.stroke(),n.setLineDash([9*r,6*r]),n.strokeStyle="#fff3e0",n.lineWidth=1.3*r,n.stroke(),n.setLineDash([]))}function Dv({s:n,camera:e,width:t,height:i}){const s=On(n),r=Ie.useRef(null),o=Ie.useRef([]),l=Ie.useRef(0);return Ie.useEffect(()=>{const d=r.current;if(!d||t<2||i<2)return;const h=window.devicePixelRatio||1;(d.width!==Math.round(t*h)||d.height!==Math.round(i*h))&&(d.width=Math.round(t*h),d.height=Math.round(i*h));const c=d.getContext("2d");let u=!0;const p=_=>{const{state:x,world:g}=n,f=n.settings.effects,w=t/e.width,E=Math.min(1.7,Math.max(.75,Math.sqrt(w/3e-4))),b=X=>D_(e,t,i,[g.cities[X].x,g.cities[X].y]),A=(X,te=60)=>X[0]>-te&&X[0]<t+te&&X[1]>-te&&X[1]<i+te;c.setTransform(h,0,0,h,0,0),c.clearRect(0,0,t,i);let P=!1,N=0,R=0,S=0;const y=X=>x.projects.find(te=>te.link===X&&!te.applied&&(te.project.status==="building"||te.project.status==="completed")),C=X=>{const te=y(X);return te&&te.project.status==="building"?{done:te.done/te.quarters,n:te.done,of:te.quarters,stalled:te.stalled,left:te.quarters-te.done}:null};for(const X of x.links){const te=b(X.a),_e=b(X.b);if(!(A(te,400)||A(_e,400)))continue;const ue=xs(te,_e,X.id);if(X.mode&&(Nv(c,te,ue,_e,X.mode,E),N++),X.building&&y(X.id)?.project.status==="completed"){S++;const O=f?.5+.5*Math.sin(_/350):1;Dn(c,te,ue,_e),c.lineCap="round",c.setLineDash([]),c.strokeStyle="rgba(8,24,10,.85)",c.lineWidth=6*E,c.stroke(),c.strokeStyle=`rgba(155,232,143,${.65+.35*O})`,c.lineWidth=3.4*E,c.stroke();const Q=vs(te,ue,_e,.5);if(c.fillStyle="#2d5a28",c.strokeStyle="#9be88f",c.lineWidth=1.4,c.beginPath(),c.arc(Q[0],Q[1],9,0,Math.PI*2),c.fill(),c.stroke(),c.font="bold 12px sans-serif",c.fillStyle="#d9ffd0",c.textAlign="center",c.textBaseline="middle",c.fillText("✓",Q[0],Q[1]+.5),c.textAlign="start",c.textBaseline="alphabetic",w>12e-5){c.font=nc,c.fillStyle="#d9ffd0",c.strokeStyle="rgba(0,0,0,.8)",c.lineWidth=3;const Z="已竣工，下季通车";c.strokeText(Z,Q[0]+14,Q[1]-8),c.fillText(Z,Q[0]+14,Q[1]-8)}f&&(P=!0)}else if(X.building){R++;const O=C(X.id);if(Dn(c,te,ue,_e),c.setLineDash([9*E,7*E]),c.lineDashOffset=f?-(_/60)%64:0,c.lineCap="butt",c.strokeStyle=O?.stalled?"#ff7a66":"#f6b04a",c.lineWidth=3*E,c.stroke(),c.setLineDash([]),c.lineDashOffset=0,O&&O.done>0){c.beginPath(),c.moveTo(te[0],te[1]);for(let Z=.05;Z<=O.done+1e-6;Z+=.05){const ge=vs(te,ue,_e,Math.min(Z,O.done));c.lineTo(ge[0],ge[1])}c.strokeStyle=O.stalled?"#ff7a66":"#ffd27a",c.lineWidth=3.6*E,c.lineCap="round",c.stroke()}const Q=vs(te,ue,_e,.5);if(w>12e-5&&O){c.font=nc,c.fillStyle="#ffe9b0",c.strokeStyle="rgba(0,0,0,.8)",c.lineWidth=3;const Z=`施工 ${O.n}/${O.of} 季度${O.stalled?" · 停工待款":""}`;c.strokeText(Z,Q[0]+6,Q[1]-6),c.fillText(Z,Q[0]+6,Q[1]-6)}f&&(P=!0)}}const z=n.pending.filter(X=>X.cmd.type==="link");for(const X of z){if(X.cmd.type!=="link")continue;const te=b(X.cmd.a),_e=b(X.cmd.b),ue=xs(te,_e,X.cmd.a*7+X.cmd.b);Dn(c,te,ue,_e),c.setLineDash([2,8*E]),c.lineCap="round",c.strokeStyle="#ffe9a8",c.lineWidth=3.4*E,c.stroke(),c.setLineDash([]);const O=vs(te,ue,_e,.5);c.fillStyle="rgba(16,25,35,.92)",c.strokeStyle="#ecd08e",c.lineWidth=1,c.beginPath(),c.arc(O[0],O[1],9,0,Math.PI*2),c.fill(),c.stroke(),c.font="11px sans-serif",c.fillStyle="#ecd08e",c.textAlign="center",c.textBaseline="middle",c.fillText("待",O[0],O[1]+.5),c.textAlign="start",c.textBaseline="alphabetic"}const B=n.linkDraft;if(B){const X=b(B.a),te=b(B.b),_e=xs(X,te,B.a*7+B.b);Dn(c,X,_e,te),c.setLineDash([10,7]),c.lineCap="round",c.strokeStyle="#ffffff",c.globalAlpha=.9,c.lineWidth=3*E,c.stroke(),c.setLineDash([]),c.globalAlpha=1}if(n.tool.type==="link"&&n.tool.first!==null){const X=b(n.tool.first),te=_/500%1;c.strokeStyle=`rgba(255,233,168,${.9-te*.7})`,c.lineWidth=2.4,c.beginPath(),c.arc(X[0],X[1],12+te*18,0,Math.PI*2),c.stroke(),P=!0}const k=new Set;for(const X of n.pending)X.cmd.type==="build"&&k.add(X.cmd.city);const ee=new Map;for(const X of x.projects)X.kind!=="link"&&X.project.status==="building"&&ee.set(X.city,(ee.get(X.city)??0)+1);o.current.length!==x.cities.length&&(o.current=x.cities.map(X=>6e3+1e4*Math.sqrt(X.pop/1e6)));for(let X=0;X<x.cities.length;X++){const te=x.cities[X],_e=6e3+1e4*Math.sqrt(te.pop/1e6);let ue=o.current[X];Math.abs(_e-ue)>1&&(ue+=(_e-ue)*(f?.12:1),P=!0,o.current[X]=ue);const O=b(X);if(!A(O,80))continue;const Q=Math.max(3,ue*w),Z=te.housing<te.pop*.97;c.beginPath(),c.arc(O[0],O[1],Q,0,Math.PI*2),c.fillStyle=Z?"rgba(224,100,94,.13)":"rgba(236,208,142,.11)",c.fill(),c.strokeStyle=Z?"rgba(255,150,130,.65)":"rgba(236,208,142,.55)",c.lineWidth=1.2,c.stroke();const ge=ee.get(X)??0;if(ge>0){R+=ge,c.save(),c.setLineDash([5,4]),c.lineDashOffset=f?-(_/90)%18:0,c.strokeStyle="#f6b04a",c.lineWidth=2,c.beginPath(),c.arc(O[0],O[1],Q+4,0,Math.PI*2),c.stroke(),c.restore();const ye=O[0]+(Q+4)*.72,Le=O[1]-(Q+4)*.72;c.fillStyle="#f6b04a",c.strokeStyle="#3a2408",c.lineWidth=1.2,c.beginPath(),c.arc(ye,Le,8,0,Math.PI*2),c.fill(),c.stroke(),c.font="bold 11px sans-serif",c.fillStyle="#2a1804",c.textAlign="center",c.textBaseline="middle",c.fillText(String(ge),ye,Le+.5),c.textAlign="start",c.textBaseline="alphabetic",f&&(P=!0)}k.has(X)&&(c.save(),c.setLineDash([2,5]),c.lineCap="round",c.strokeStyle="#ffe9a8",c.lineWidth=2.4,c.beginPath(),c.arc(O[0],O[1],Q+9,0,Math.PI*2),c.stroke(),c.restore())}for(const X of n.guideCityPulse){const te=b(X);if(!A(te,80))continue;const _e=_/900%1;c.strokeStyle=`rgba(255,233,168,${.95-_e*.8})`,c.lineWidth=3,c.beginPath(),c.arc(te[0],te[1],16+_e*26,0,Math.PI*2),c.stroke(),c.strokeStyle="#ffe9a8",c.lineWidth=2,c.beginPath(),c.arc(te[0],te[1],14,0,Math.PI*2),c.stroke(),P=!0}const $=(X,te)=>{const _e=x.links.find(ge=>ge.id===X);if(!_e)return null;const ue=b(_e.a),O=b(_e.b),Q=xs(ue,O,_e.id),Z=f?.5+.5*Math.sin(_/300):1;return c.save(),Dn(c,ue,Q,O),c.lineCap="round",c.strokeStyle=`rgba(255,246,200,${(te?.35:.25)+.25*Z})`,c.lineWidth=(te?14:11)*E,c.stroke(),c.restore(),{l:_e,a:ue,b:O}};n.flash&&_-n.flash.at<5e3&&($(n.flash.link,!1),P=!0);const q=n.spotlight;let H=0;const ie=[];if(q){const X=$(q.link,!0);if(X){H=1;const te=_/1100%1,_e=Zc(d.getBoundingClientRect(),n.panelOpen,!0),ue=X.a[0]<=X.b[0]?0:1;q.rows.forEach((O,Q)=>{const Z=Q===0?X.a:X.b;c.strokeStyle=`rgba(255,233,168,${.9-te*.8})`,c.lineWidth=3,c.beginPath(),c.arc(Z[0],Z[1],18+te*30,0,Math.PI*2),c.stroke(),c.strokeStyle="#fff3c0",c.lineWidth=3,c.beginPath(),c.arc(Z[0],Z[1],17,0,Math.PI*2),c.stroke();const ge=D=>`${(D/100).toFixed(2)}%`,ye=`${O.name} 通达度 ${ge(O.before)} → ${ge(O.after)}`;c.font='bold 13px "Songti SC","Noto Serif CJK SC",serif';const Le=c.measureText(ye).width+16,Ze=Math.min(Math.max(_e.left+8,Q===ue?Z[0]-Le+24:Z[0]-24),_e.right-Le-8),We=Math.min(Math.max(_e.top+8,Z[1]+30),_e.bottom-34);c.fillStyle="rgba(16,25,35,.95)",c.strokeStyle="#ecd08e",c.lineWidth=1.4,c.beginPath(),c.roundRect(Ze,We,Le,26,6),c.fill(),c.stroke(),c.fillStyle="#9be88f",c.textBaseline="middle",c.fillText(ye,Ze+8,We+13.5),c.textBaseline="alphabetic",ie.push({name:O.name,x:Ze,y:We,w:Le,h:26})}),P=!0}}d.dataset.spotlight=String(H),d.dataset.labels=JSON.stringify(ie);const he=new Map;for(const X of n.anims){const te=_-X.at;if(te>2600||!f)continue;const _e=te/2600;if(P=!0,X.kind==="done"){const ue=b(X.city);c.strokeStyle=`rgba(155,232,143,${1-_e})`,c.lineWidth=3,c.beginPath(),c.arc(ue[0],ue[1],14+_e*60,0,Math.PI*2),c.stroke(),c.font='bold 13px "Songti SC","Noto Serif CJK SC",serif',c.fillStyle=`rgba(190,245,170,${1-_e*_e})`,c.strokeStyle=`rgba(0,0,0,${.8*(1-_e)})`,c.lineWidth=3;const O=he.get(X.city)??0;he.set(X.city,O+1);const Q=`✓ ${X.text}`,Z=ue[1]-14-_e*26-O*16;c.strokeText(Q,ue[0]+12,Z),c.fillText(Q,ue[0]+12,Z)}else{const ue=b(X.a),O=b(X.b),Q=xs(ue,O,x.links.find(ge=>ge.a===X.a&&ge.b===X.b)?.id??0);c.save(),c.globalAlpha=1-_e,Dn(c,ue,Q,O),c.strokeStyle="#fff6c8",c.lineWidth=9*E,c.lineCap="round",c.stroke(),c.restore();const Z=vs(ue,Q,O,Math.min(1,_e*1.8));c.fillStyle="#fff6c8",c.beginPath(),c.arc(Z[0],Z[1],6,0,Math.PI*2),c.fill()}}return d.dataset.links=String(N),d.dataset.building=String(R),d.dataset.ready=String(S),d.dataset.planned=String(z.length+k.size),P},m=()=>{u&&(l.current=p(performance.now())?requestAnimationFrame(m):0)};return m(),()=>{u=!1,cancelAnimationFrame(l.current)}},[e,t,i,s,n]),a.jsx("canvas",{ref:r,className:L.layer,"aria-hidden":"true","data-testid":"game-layer"})}const Lv="_app_jtuq4_4",Iv="_mapArea_jtuq4_14",Uv="_noticeRow_jtuq4_15",Fv="_notice_jtuq4_15",Bv="_uicon_jtuq4_16",Ov="_muted_jtuq4_17",kv="_panel_jtuq4_18",jv="_iconBtn_jtuq4_24",zv="_topbar_jtuq4_31",Hv="_brand_jtuq4_39",Gv="_emblem_jtuq4_40",Vv="_brandText_jtuq4_41",Wv="_brandLatin_jtuq4_42",Xv="_yields_jtuq4_43",$v="_spacer_jtuq4_46",qv="_turn_jtuq4_47",Yv="_tbButtons_jtuq4_49",Kv="_btn_jtuq4_50",Zv="_btnIcon_jtuq4_58",Jv="_search_jtuq4_59",Qv="_searchIc_jtuq4_60",eM="_searchKbd_jtuq4_68",tM="_searchResults_jtuq4_74",nM="_srIc_jtuq4_77",iM="_srMain_jtuq4_78",sM="_srPop_jtuq4_81",rM="_mapCanvas_jtuq4_86",aM="_overlay_jtuq4_86",oM="_markers_jtuq4_90",lM="_marker_jtuq4_90",cM="_tooltip_jtuq4_93",dM="_touchTip_jtuq4_99",hM="_cityPanel_jtuq4_105",uM="_cpHead_jtuq4_106",fM="_stripe_jtuq4_107",pM="_cpKind_jtuq4_108",mM="_cpName_jtuq4_109",gM="_cpFull_jtuq4_110",_M="_chips_jtuq4_111",xM="_chip_jtuq4_111",vM="_cpPop_jtuq4_113",MM="_cpClose_jtuq4_116",SM="_goldBtn_jtuq4_117",yM="_goldIco_jtuq4_123",bM="_chev_jtuq4_124",EM="_cpSection_jtuq4_125",TM="_yieldGrid_jtuq4_129",wM="_yieldTile_jtuq4_130",AM="_val_jtuq4_132",RM="_lbl_jtuq4_133",CM="_statRow_jtuq4_134",PM="_sl_jtuq4_135",NM="_cmp_jtuq4_138",DM="_cpFoot_jtuq4_139",LM="_tools_jtuq4_142",IM="_leftStack_jtuq4_149",UM="_mapScale_jtuq4_153",FM="_minimap_jtuq4_155",BM="_viewport_jtuq4_158",OM="_lensArea_jtuq4_161",kM="_lensDock_jtuq4_165",jM="_lensBtn_jtuq4_166",zM="_active_jtuq4_172",HM="_lensMore_jtuq4_173",GM="_count_jtuq4_175",VM="_legend_jtuq4_176",WM="_lgHead_jtuq4_177",XM="_lgIc_jtuq4_178",$M="_lgTitle_jtuq4_179",qM="_lgDesc_jtuq4_180",YM="_ramp_jtuq4_181",KM="_ticks_jtuq4_182",ZM="_lgMeta_jtuq4_184",JM="_noData_jtuq4_186",QM="_layersPop_jtuq4_187",eS="_spTitle_jtuq4_188",tS="_mlRow_jtuq4_189",nS="_on_jtuq4_198",iS="_failure_jtuq4_202",sS="_toast_jtuq4_205",rS="_dialog_jtuq4_207",aS="_mapUpdating_jtuq4_247",K={app:Lv,mapArea:Iv,noticeRow:Uv,notice:Fv,uicon:Bv,muted:Ov,panel:kv,iconBtn:jv,topbar:zv,brand:Hv,emblem:Gv,brandText:Vv,brandLatin:Wv,yields:Xv,yield:"_yield_jtuq4_43",spacer:$v,turn:qv,tbButtons:Yv,btn:Kv,btnIcon:Zv,search:Jv,searchIc:Qv,searchKbd:eM,searchResults:tM,srIc:nM,srMain:iM,srPop:sM,mapCanvas:rM,overlay:aM,markers:oM,marker:lM,tooltip:cM,touchTip:dM,cityPanel:hM,cpHead:uM,stripe:fM,cpKind:pM,cpName:mM,cpFull:gM,chips:_M,chip:xM,cpPop:vM,cpClose:MM,goldBtn:SM,goldIco:yM,chev:bM,cpSection:EM,yieldGrid:TM,yieldTile:wM,val:AM,lbl:RM,statRow:CM,sl:PM,cmp:NM,cpFoot:DM,tools:LM,leftStack:IM,mapScale:UM,minimap:FM,viewport:BM,lensArea:OM,lensDock:kM,lensBtn:jM,active:zM,lensMore:HM,count:GM,legend:VM,lgHead:WM,lgIc:XM,lgTitle:$M,lgDesc:qM,ramp:YM,ticks:KM,lgMeta:ZM,noData:JM,layersPop:QM,spTitle:eS,mlRow:tS,on:nS,failure:iS,toast:sS,dialog:rS,mapUpdating:aS},ft=Xt.realData;Xt.lenses.includes("economy");const oS=null,ic=je.window.cols*je.window.rows,ga=Xt.notice,mo=(n,e="")=>Number.isFinite(n)?Ct.format(n)+e:"无数据",sc={terrain:"terrain",population:"l-people",economy:"y-gold"},lS={terrain:"地形地貌",population:"人口密度",economy:"经济活动"},Ct=new Intl.NumberFormat("zh-CN",{maximumFractionDigits:1}),_a=n=>Ct.format(Math.round(n/1e3)),cS=394;function Tt({id:n,size:e=16}){return a.jsx("span",{className:K.uicon,"aria-hidden":"true",dangerouslySetInnerHTML:{__html:ac(n,{size:e})}})}function dS(n){const e=n.getContext("2d"),{width:t,height:i}=n,[s,r]=rt.toKm([Ms[0],Ms[3]]),[o,l]=rt.toKm([Ms[2],Ms[1]]),d=t/(o-s),h=i/(l-r),c=rt.w.grid;e.fillStyle="#0d2a47",e.fillRect(0,0,t,i);const u=c.W*d+1,p=c.H*h+1,m=c.range(s,r,o,l);for(let _=m.r0;_<=m.r1;_++)for(let x=m.c0;x<=m.c1;x++){const g=_*c.cols+x;e.fillStyle=rt.w.colors[g],e.fillRect((c.cx(g)-c.W/2-s)*d,(c.cy(g)-c.H/2-r)*h,u,p)}}function hS({camera:n,ratio:e,move:t,version:i}){const s=Ie.useRef(null);Ie.useEffect(()=>{s.current&&dS(s.current)},[i]);const[r,o,l,d]=Ms,h=l-r,c=d-o,u=n.width/e/2,p=m=>`${m*100}%`;return a.jsx("section",{className:`${K.panel} ${K.minimap}`,"aria-label":"小地图",children:a.jsxs("button",{"aria-label":"在小地图上定位",onClick:m=>{const _=m.currentTarget.getBoundingClientRect();m.detail===0?t(Ts.x,Ts.y):t(r+(m.clientX-_.left)/_.width*h,d-(m.clientY-_.top)/_.height*c)},children:[a.jsx("canvas",{ref:s,width:460,height:Math.round(460*c/h)}),a.jsx("span",{className:K.viewport,style:{left:p((n.x-n.width/2-r)/h),top:p((d-n.y-u)/c),width:p(n.width/h),height:p(u*2/c)}})]})})}function en({icon:n,label:e,value:t,unit:i}){return a.jsxs("div",{className:K.statRow,children:[a.jsxs("span",{className:K.sl,children:[a.jsx(Tt,{id:n,size:14}),e]}),a.jsxs("span",{children:[a.jsx("b",{children:t}),i&&a.jsx("span",{className:K.cmp,children:i})]})]})}function uS({selected:n,close:e,locate:t}){const i=n.kind==="city"?je.cities[n.id]:null,s=n.kind==="edge"?je.network[n.id]:null,r=i?.anchorTile??(n.kind==="tile"?n.id:null),o=r===null?-1:je.tileIndex(r),l=o>=0?je.terrain[o]:Yn.Ocean,d=o>=0&&je.valid[o]!==0,h=r!==null?rt.province(r):null,c=o>=0&&!!je.real?.fog?.[o],u=c?"无数据":r!==null&&l>Yn.Lake?rt.coverName(r):va[l],p=r!==null?rt.w.raw.owner[rt.cellOfTile(r)]:-1,m=p>=0?`rgb(${rt.w.stateColor[p].join(",")})`:"#7d8794",_=i?[i.anchorX,i.anchorY]:s?s.points[Math.floor(s.points.length/2)]:r!==null?_d(je.grid,r):null,x=i?ft?"地名点":i.primary?"城镇":"合成聚落":s?"线路详情":"地块详情",g=je.real?.detail,[,f]=Ie.useState(0);Ie.useEffect(()=>{if(!g||r===null||o<0||g.loaded[o])return;let A=!0;return g.ensure(r).then(()=>{A&&f(P=>P+1)},()=>{A&&f(P=>P+1)}),()=>{A=!1}},[r]);const w=!!g&&o>=0&&!g.loaded[o],E=(A,P)=>w?"加载中":Number.isFinite(A)?P(A):"无数据",b=i?.label??s?.name??u;return a.jsxs("section",{className:`${K.panel} ${K.cityPanel}`,"aria-label":"地图详情",children:[a.jsxs("div",{className:K.cpHead,children:[a.jsx("span",{className:K.stripe,style:{background:m}}),a.jsx("div",{className:K.cpKind,children:x}),a.jsx("h2",{className:K.cpName,children:b}),a.jsx("div",{className:K.cpFull,children:i?`${i.pinyin.toUpperCase()} · ${Xt.regionName}`:s?`${Xt.regionName} · 合成${s.mode0==="rail"?"铁路":"公路"}`:`地块 #${r}`}),a.jsxs("div",{className:K.chips,children:[h&&a.jsxs("span",{className:K.chip,children:[h.name,h.foreign||ft?"":"（合成分区）"]}),a.jsx("span",{className:K.chip,children:ft?"真实数据 · 内部":"合成数据"})]}),i&&a.jsxs("div",{className:K.cpPop,children:[a.jsx(Tt,{id:"pop",size:15}),a.jsx("b",{children:mo(i.population)})," 人",ft?"（锚点格估计）":""," · 经济总量 ",a.jsx("b",{children:mo(i.economy)}),Number.isFinite(i.economy)?" 亿元":""]}),a.jsx("button",{className:K.iconBtn+" "+K.cpClose,onClick:e,"aria-label":"关闭详情",children:a.jsx(qn,{name:"close",size:14})}),_&&a.jsxs("button",{className:K.goldBtn,onClick:()=>t(_,i?7e5:9e5),children:[a.jsx("span",{className:K.goldIco,children:a.jsx(Tt,{id:"map",size:14})}),"定位到地图",a.jsx("span",{className:K.chev,children:"›"})]})]}),i&&a.jsxs("div",{className:K.cpSection,children:[a.jsx("h3",{children:"产出"}),a.jsxs("div",{className:K.yieldGrid,children:[a.jsxs("div",{className:K.yieldTile,children:[a.jsx(Tt,{id:"pop",size:20}),a.jsx("div",{className:K.val,children:Number.isFinite(i.population)?dr(i.population):"无数据"}),a.jsx("div",{className:K.lbl,children:"人口"})]}),ft?a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:K.yieldTile,children:[a.jsx(Tt,{id:"l-home",size:20}),a.jsx("div",{className:K.val,children:E(je.real.builtM2[o],A=>Ct.format(A/1e6))}),a.jsx("div",{className:K.lbl,children:"建成面积 km²"})]}),a.jsxs("div",{className:K.yieldTile,children:[a.jsx(Tt,{id:"y-gold",size:20}),a.jsx("div",{className:K.val,style:{color:"#8d99a6"},children:"无数据"}),a.jsx("div",{className:K.lbl,children:"经济总量"})]})]}):a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:K.yieldTile,children:[a.jsx(Tt,{id:"y-gold",size:20}),a.jsxs("div",{className:K.val,style:{color:"#f2c94c"},children:[Ct.format(i.economy),"亿"]}),a.jsx("div",{className:K.lbl,children:"经济总量"})]}),a.jsxs("div",{className:K.yieldTile,children:[a.jsx(Tt,{id:"l-income",size:20}),a.jsxs("div",{className:K.val,children:[Ct.format(i.economy*1e4/i.population),"万"]}),a.jsx("div",{className:K.lbl,children:"人均产出"})]})]})]})]}),a.jsxs("div",{className:K.cpSection,children:[a.jsx("h3",{children:i?"锚点地块":s?"线路":"地块"}),s?a.jsxs(a.Fragment,{children:[a.jsx(en,{icon:s.mode0==="rail"?"t-rail":"t-road",label:"交通方式",value:s.mode0==="rail"?"铁路":"公路"}),a.jsx(en,{icon:"map",label:"状态",value:"通行"}),a.jsx(en,{icon:"terrain",label:"途经地块",value:Ct.format(rt.routePaths.get(s.lineId)?.reduce((A,P)=>A+P.length,0)??0),unit:"格"})]}):a.jsxs(a.Fragment,{children:[a.jsx(en,{icon:"terrain",label:"地形",value:c?"无数据（AOI 外）":va[l]}),l>Yn.Lake&&r!==null&&a.jsx(en,{icon:"l-forest",label:ft?"主要覆盖":"地表覆盖",value:u}),ft&&r!==null&&a.jsx("p",{className:K.muted,children:w?"土地覆盖构成加载中…":rt.coverMix(r)?.slice(0,4).map(A=>`${A.name} ${A.percent}%`).join(" · ")||"WorldCover 无数据"}),l>Yn.Lake&&r!==null&&a.jsx(en,{icon:"l-farmland",label:"地势",value:xd[rt.reliefOf(r)]}),a.jsx(en,{icon:"l-home",label:ft?"平均海拔（DSM）":"海拔",value:l>Yn.Lake&&!(je.real?.demObserved&&!je.real.demObserved[o])?Ct.format(je.real?.elevMean?je.real.elevMean[o]:je.elevation[o]):"无数据",unit:l>Yn.Lake?"m":void 0}),a.jsx(en,{icon:"l-people",label:ft?"人口密度（估计）":"人口密度",value:d?Ct.format(je.population[o]):"无数据",unit:d?"人/km²":void 0}),ft&&o>=0&&a.jsx(en,{icon:"terrain",label:"起伏（P98−P2，DSM）",value:Ct.format(je.real.reliefM[o]),unit:"m"}),ft&&o>=0&&a.jsx(en,{icon:"l-home",label:"建成面积",value:E(je.real.builtM2[o],A=>Ct.format(A/1e6)),unit:w?void 0:"km²"}),ft&&o>=0&&a.jsx(en,{icon:"l-people",label:"估计人口",value:E(je.real.peopleEstimate[o],A=>Ct.format(A)),unit:w?void 0:"人"}),a.jsx(en,{icon:"y-gold",label:"经济活动",value:ft?"无数据":d?Ct.format(je.economy[o]):"无数据",unit:!ft&&d?"合成指数":void 0}),!i&&a.jsx(en,{icon:"g-land",label:"网格编号",value:String(r)})]})]}),(i||s)&&a.jsxs("div",{className:K.cpSection,children:[a.jsx("h3",{children:"概况"}),a.jsx("p",{className:K.muted,children:i?i.description:`${Xt.regionName}的合成${s.mode0==="rail"?"铁路":"公路"}。端点与线形均为程序生成，沿六边形格心绘制。`})]}),a.jsx("div",{className:K.cpFoot,children:ft?"真实数据样例 · 内部使用 · 来源与口径见“数据说明”":"合成数据 · 非真实地理与统计"})]})}function fS(n,e){return new Promise((t,i)=>{const s=()=>i(new DOMException("截图已取消。","AbortError"));if(e.aborted){s();return}e.addEventListener("abort",s,{once:!0});try{n.toBlob(r=>{e.removeEventListener("abort",s),r?t(r):i(new Error("PNG 编码失败。"))},"image/png")}catch(r){e.removeEventListener("abort",s),i(r)}})}const pS="地理底图为真实数据（内部使用）· 城市人口与产出是试验情景参数，非统计数据";
// These controls subscribe to game changes independently of camera and pointer updates.
const GamePowerStatus = Ie.memo($0);
const GameFooter = Ie.memo(Z0);
const GamePanel = Ie.memo(tv);
const GameToolHint = Ie.memo(q0);
const GameGuideCard = Ie.memo(V0);
const GameOpeningCard = Ie.memo(W0);
const GameModal = Ie.memo(mv);
function returnToMenu() {
  location.assign(location.pathname);
}
function compareCityPopulation(left, right) {
  return right.population - left.population;
}
function vS({game:n}={}){const e=Ie.useRef(null),t=Ie.useRef(null),i=Ie.useRef(null),s=Ie.useRef(null),r=Ie.useRef(null),o=Ie.useRef(null),l=Ie.useRef(Ts),d=Ie.useRef(null),h=Ie.useRef(null),[c,u]=Ie.useState(Ts),[p,m]=Ie.useState([1,1]),[_,x]=Ie.useState("terrain"),[g,f]=Ie.useState(n?n.settings.grid:!0),[w,E]=Ie.useState(!0),[b,A]=Ie.useState(!0),[P,N]=Ie.useState(oS),R=B0(n),S=n?n.selectedPoint():null,y=n?S!==null?{kind:"city",id:S}:null:P,[C,z]=Ie.useState(null),[B,k]=Ie.useState(null),[ee,$]=Ie.useState(""),[q,H]=Ie.useState(!1),[ie,he]=Ie.useState(!1),[X,te]=Ie.useState(""),[_e,ue]=Ie.useState(!1),[O,Q]=Ie.useState("guide"),[Z,ge]=Ie.useState(!1),[ye,Le]=Ie.useState(""),[Ze,We]=Ie.useState([]),[D,it]=Ie.useState(0),[De,qe]=Ie.useState(null),[Re,Je]=Ie.useState(!1),[me,Fe]=p,Qe=Ie.useRef({lens:_,grid:g,routes:w,selected:y,size:p,hits:Ze,names:b});Qe.current={lens:_,grid:g,routes:w,selected:y,size:p,hits:Ze,names:b};const lt=De!==xi(Qe.current);
const T = Ie.useCallback((view) => {
  const nextView = Ao(view, je.bounds);
  const previous = l.current;
  if (nextView.x !== previous.x || nextView.y !== previous.y || nextView.width !== previous.width) {
    o.current?.noteCameraInput();
    l.current = nextView;
    u(nextView);
  }
  k(null);
}, []);
function v([se,Be],ct=l.current.width){T({x:se,y:Be,width:ct})}function j(se){n?n.pickPoint(se):N(se),k(null)}
const J = Ie.useCallback((cityId) => {
  if (!n) return;
  const { x, y } = n.world.cities[cityId];
  T({ x, y, width: Math.min(l.current.width, 14e5) });
}, [n, T]);
function re(){T(Ts)}function Y(se){const Be=[me/2,Fe/2];T(Kc(l.current,me,Fe,Be,Be,se,je.bounds))}function Ne(se,Be){for(let ct=Qe.current.hits.length-1;ct>=0;ct--){const dt=Qe.current.hits[ct];if(se[0]>=dt.x-Be&&se[0]<=dt.x+dt.w+Be&&se[1]>=dt.y-Be&&se[1]<=dt.y+dt.h+4+Be)return Number(dt.city.id)}return null}function fe(se,Be){const ct=o.current,dt=ct?.getRenderedView(),At=ct?.stats;if(!dt||!At||At.displayedStyle!==xi(Qe.current)||dt.width!==Qe.current.size[0]||dt.height!==Qe.current.size[1])return;const{width:Gt,height:St,view:Ut}=dt,Et=Ne(se,Be?8:0);if(Et!==null)return{kind:"city",id:Et};const _t=uo(Ut,Gt,St,...se),Yt=Lo(je.grid,..._t),st=Yt===null?void 0:rt.w.cityByCell.get(rt.cellOfTile(Yt));if(st)return{kind:"city",id:Number(st.id)};if(At.routesDrawn){const M=(Be?22:7)*Ut.width/Gt,U=vd(_t,M);if(U!==null)return{kind:"edge",id:U}}return Yt===null||je.tileIndex(Yt)<0?null:{kind:"tile",id:Yt}}Ie.useLayoutEffect(()=>{const se=e.current,Be=t.current,ct=i.current;if(!se||!Be||!ct)return;const dt=()=>m([se.clientWidth,se.clientHeight]);dt();const At=new ResizeObserver(dt);At.observe(se);const Gt=new URLSearchParams(location.search),St=Gt.has("bench"),Ut=Number(Gt.get("raster-tile")),Et=St&&(Ut===256||Ut===512||Ut===1022)?{...ho,tileEdge:Ut,adaptive:!1}:ho;let _t;try{_t=new N_(Be,ct,rt,st=>{st&&d.current?.abort(),H(st)},()=>{qe(_t.stats?.displayedStyle??null),it(_t.colorsVersion),We(st=>st.length===_t.hits.length&&st.every((M,U)=>{const G=_t.hits[U];return M.city===G.city&&M.x===G.x&&M.y===G.y&&M.w===G.w&&M.h===G.h})?st:_t.hits.slice())},Et)}catch(st){return $(st.message),()=>At.disconnect()}o.current=_t,he(!0);const Yt=L_(se,{canvas:Be,bounds:je.bounds,getView:()=>l.current,setView:T,tap:(st,M)=>{const U=fe(st,M);U!==void 0&&j(U)},hover:st=>{if(!st||_t.stats?.displayedStyle!==xi(Qe.current)){z(null);return}const[M,U]=Qe.current.size;z({p:st,tile:Lo(je.grid,...uo(l.current,M,U,...st)),city:Ne(st,0)})},inspect:st=>{const M=fe(st,!0);if(!M)return;const U=M.kind==="city"?je.cities[M.id].label:M.kind==="edge"?je.network[M.id].name:rt.coverName(M.id)??va[je.terrain[je.tileIndex(M.id)]];k({p:st,label:U,selection:M})}});return St&&(window.atlasBench={getView:()=>l.current,setView:T,stats:()=>_t.stats,capabilities:_t.capabilities,paintTrace:()=>_t.getPaintTrace(),rasterEvents:()=>_t.getRasterEvents(),size:()=>Qe.current.size,getSelection:()=>Qe.current.selected,hits:()=>_t.hits,exportTrace:()=>h.current,gpuUploadTrace:()=>_t.getGpuUploadTrace(),routeProbe:st=>{const M=rt.routePaths.get(st)?.flat()??[];let U=M[0],G=-1;for(const V of M){const F=Math.min(...je.cities.map(ce=>Math.hypot(ce.anchorX-V[0],ce.anchorY-V[1])));F>G&&(G=F,U=V)}return U}}),()=>{St&&delete window.atlasBench,d.current?.abort(),Yt(),At.disconnect(),_t.dispose(),o.current=null}},[]);const we=y?.kind==="city"?je.cities[y.id]:null,Ce=y?.kind==="tile"?y.id:null,ae=C?.city??null,Me=ae!==null?rt.cityById.get(ae)?.cell??-1:C?.tile!=null?rt.cellOfTile(C.tile):-1,Oe=Ce!==null?rt.cellOfTile(Ce):-1,Pe=(n?n.panelOpen:y)&&me>760?me-cS:null,xe={lens:_,grid:g,routes:w,names:b,selectedCity:we?.id??null,selectedCell:Oe,hoverCell:Me,bannerRight:Pe};Ie.useLayoutEffect(()=>{o.current?.update({view:c,width:me,height:Fe,opts:xe})},[c,me,Fe,_,g,w,b,we?.id,Oe,Me,Pe,q]),Ie.useEffect(()=>{function se(Be){Be.key==="/"&&!r.current?.open&&!["INPUT","TEXTAREA"].includes(Be.target.tagName)&&(Be.preventDefault(),s.current?.focus()),Be.key==="Escape"&&(d.current?.abort(),k(null),ge(!1),n?.escape())}return window.addEventListener("keydown",se),()=>window.removeEventListener("keydown",se)},[]),Ie.useEffect(()=>{if(!n)return;const se={session:n,view:()=>({camera:l.current,size:Qe.current.size})};window.chinaciv=se;let Be=!0;return ld(()=>import("./bot-CogKpRux-v2.js"),__vite__mapDeps([0,1]),import.meta.url).then(ct=>{Be&&(se.advise=dt=>ct.advise(n.world,n.state,dt))}),()=>{Be=!1,delete window.chinaciv}},[n]);const Ve=Ie.useRef(null);Ie.useLayoutEffect(()=>{!n||!ie||Ve.current!==n.state&&(Ve.current=n.state,n.applyBanners(rt),o.current?.refreshOverlay())},[n,ie,R]),Ie.useEffect(()=>{n&&n.focusSeq>0&&n.selected!==null&&J(n.selected)},[n?.focusSeq]),Ie.useLayoutEffect(()=>{const se=n?.pairFocus;if(!n||!se||!ie)return;const Be=n.world.cities[se.a],ct=n.world.cities[se.b],dt=document.querySelector('canvas[aria-label="交互六边形地图"]')?.getBoundingClientRect(),[At,Gt]=Qe.current.size??[1e3,700],St=dt?Zc(dt,n.panelOpen,n.guideOn||!!n.spotlight):{left:0,top:0,right:At,bottom:Gt},Ut=St.right-St.left,Et=St.bottom-St.top,_t=Math.abs(Be.x-ct.x),Yt=Math.abs(Be.y-ct.y),st=Math.max(_t*At/(Ut*.62),Yt*At/(Et*.55),32e4),M=st/At,U=(St.left+St.right)/2,G=(St.top+St.bottom)/2;v([(Be.x+ct.x)/2-(U-At/2)*M,(Be.y+ct.y)/2+(G-Gt/2)*M],st)},[n?.pairFocus?.seq,ie]),Ie.useEffect(()=>{if(!ye)return;const se=setTimeout(()=>Le(""),2400);return()=>clearTimeout(se)},[ye]);function I(se){Q(se),r.current?.showModal()}async function de(){const se=o.current;if(!se||se.lost||d.current)return;const Be=new AbortController,{signal:ct}=Be;d.current=Be,h.current=null,Je(!0);const dt=performance.now(),At={view:{...l.current},width:me,height:Fe,opts:{...xe}};let Gt;try{const St=await se.snapshot(At,ct),{canvas:Ut,ctx:Et,scale:_t,mode:Yt,estimatedPeakBytes:st}=St;Gt=St.release,Et.setTransform(_t,0,0,_t,0,0);const M=`华夏文明 · ${ga}`;Et.font='600 13px "Songti SC","Noto Serif CJK SC",serif';const U=Et.measureText(M).width+24;Et.fillStyle="rgba(16,25,35,.92)",Et.strokeStyle="#c9a45c",Et.lineWidth=1,Et.beginPath(),Et.roundRect(12,At.height-40,U,28,4),Et.fill(),Et.stroke(),Et.fillStyle="#ecd08e",Et.fillText(M,24,At.height-21);const G=await fS(Ut,ct);if(ct.aborted)throw new DOMException("截图已取消。","AbortError");const V=URL.createObjectURL(G),F=document.createElement("a");F.href=V,F.download=`chinaciv-${Xt.id}.png`,F.click(),setTimeout(()=>URL.revokeObjectURL(V),2e3),h.current={status:"success",ms:performance.now()-dt,mode:Yt,estimatedPeakBytes:st,pngBytes:G.size,width:Ut.width,height:Ut.height},Le("已导出当前地图")}catch(St){const Ut=ct.aborted||St instanceof DOMException&&St.name==="AbortError";h.current={status:Ut?"cancelled":"error",ms:performance.now()-dt},Le(Ut?"已取消截图":"截图生成失败")}finally{Gt?.(),d.current===Be&&(d.current=null),Je(!1)}}
const pe = X.trim().toLowerCase();
const searchable = Ie.useMemo(() => {
  const cities = je.cities.filter((city) => !n || n.pointToCity.has(city.id));
  const ranked = cities.every((city) => Number.isFinite(city.population));
  if (ranked) cities.sort(compareCityPopulation);
  return { cities, ranked };
}, [n]);
const be = Ie.useMemo(() => {
  if (!pe) return [];
  const matchesQuery = (city) => city.label.includes(pe) || city.pinyin.includes(pe);
  if (!searchable.ranked) {
    return searchable.cities.filter(matchesQuery).sort(compareCityPopulation).slice(0, 8);
  }
  const matches = [];
  for (const city of searchable.cities) {
    if (matchesQuery(city)) matches.push(city);
    if (matches.length === 8) break;
  }
  return matches;
}, [pe, searchable]);
function le(se){const Be=je.cities[se];j({kind:"city",id:se}),v([Be.anchorX,Be.anchorY],116e4),ue(!1),te("")}function ne(se){se.key==="Enter"&&be.length&&le(be[0].id),se.key==="Escape"&&ue(!1)}const Te=c.width/Math.max(me,1)*90,Ge=10**Math.floor(Math.log10(Te)),at=Math.floor(Te/Ge)*Ge,et=at/c.width*me,Lt=lt||_==="terrain"?null:rt.lenses[_],It=C?.tile??null,qt=It===null?-1:je.tileIndex(It),En=(n?n.panelOpen:!!y)&&ie&&!q,os=[w,g,b].filter(Boolean).length,ls=a.jsxs("div",{className:K.search,role:"search",children:[a.jsx("span",{className:K.searchIc,children:a.jsx(Tt,{id:"search",size:14})}),a.jsx("input",{ref:s,type:"text",enterKeyHint:"search",placeholder:"搜索城镇","aria-label":"搜索城镇",value:X,onKeyDown:ne,autoComplete:"off",spellCheck:!1,onFocus:()=>ue(!0),onBlur:se=>{se.currentTarget.parentElement?.contains(se.relatedTarget)||ue(!1)},onChange:se=>{te(se.target.value),ue(!0)}}),a.jsx("kbd",{className:K.searchKbd,children:"/"}),_e&&pe&&a.jsx("div",{className:`${K.panel} ${K.searchResults}`,children:be.length?be.map(se=>a.jsxs("button",{onClick:()=>le(se.id),children:[a.jsx("span",{className:K.srIc,children:a.jsx(Tt,{id:"pop",size:15})}),a.jsxs("span",{className:K.srMain,children:[a.jsx("b",{children:se.label}),a.jsxs("span",{children:[se.pinyin," · ",rt.province(se.anchorTile)?.name??""]})]}),a.jsx("span",{className:K.srPop,children:dr(se.population)})]},se.id)):a.jsx("p",{children:"未找到城镇"})})]});return a.jsxs("div",{className:K.app,"data-panel":En?"open":"closed","data-game":n?"true":void 0,children:[n?a.jsx(X0,{s:n,search:ls}):a.jsxs("header",{className:K.topbar,children:[a.jsxs("div",{className:K.brand,title:"华夏文明 · ChinaCiv",children:[a.jsx("span",{className:K.emblem,"aria-hidden":"true",children:"华"}),a.jsx("span",{className:K.brandText,children:"华夏文明"}),a.jsx("span",{className:K.brandLatin,children:"ChinaCiv"})]}),a.jsxs("div",{className:K.yields,"aria-label":ft?"区域合计（真实数据）":"区域合计（合成）",children:[a.jsxs("span",{className:K.yield,title:ft?"区域估计人口（WorldPop 2020 模型估计，非普查）":"城镇人口合计（合成）",children:[a.jsx(Tt,{id:"pop",size:16}),dr(rt.totals.population)]}),a.jsxs("span",{className:K.yield,style:{color:ft?"#8d99a6":"#f2c94c"},title:ft?"经济数据尚未取得":"城镇经济总量合计（合成，亿元）",children:[a.jsx(Tt,{id:"y-gold",size:16}),ft?"无数据":`${Ct.format(rt.totals.economy)}亿`]}),a.jsxs("span",{className:K.yield,style:{color:"#7fbf3f"},title:ft?"地名点数量":"城镇数量（合成）",children:[a.jsx(Tt,{id:"y-food",size:16}),rt.totals.towns," 城镇"]}),a.jsxs("span",{className:K.yield,style:{color:"#4fa3e0"},title:"网格格数",children:[a.jsx(Tt,{id:"g-land",size:16}),Ct.format(ic)," 格"]})]}),a.jsx("div",{className:K.spacer}),ls,a.jsxs("div",{className:K.turn,children:[Xt.regionName," · ",a.jsx("b",{children:ft?"真实数据样例":"合成世界"})]}),a.jsxs("div",{className:K.tbButtons,children:[a.jsxs("button",{className:K.btn,"aria-label":"导出地图截图",title:"导出当前视图 PNG",onClick:de,disabled:!ie||q||Re,"aria-busy":Re,children:[a.jsx(Tt,{id:"share",size:14}),a.jsx("span",{className:K.lbl,children:Re?"生成中":"导出"})]}),a.jsx("button",{className:`${K.btn} ${K.btnIcon}`,"aria-label":"数据说明",title:"数据说明",onClick:()=>I("data"),children:a.jsx(Tt,{id:"help",size:14})}),a.jsxs("button",{className:K.btn,onClick:()=>I("guide"),title:"操作与图鉴说明",children:[a.jsx(Tt,{id:"pedia",size:14}),a.jsx("span",{className:K.lbl,children:"图鉴指南"})]})]})]}),a.jsxs("div",{className:K.mapArea,ref:e,"data-lens":_,"data-ready":ie,children:[a.jsx("canvas",{className:K.mapCanvas,ref:t,tabIndex:0,"aria-label":"交互六边形地图","aria-busy":ie&&lt}),n&&ie&&!q&&a.jsx(Dv,{s:n,camera:c,width:me,height:Fe}),a.jsx("canvas",{className:K.overlay,ref:i,"aria-hidden":"true"}),a.jsx("div",{className:K.markers,children:b&&ie&&!q&&!lt&&Ze.map(se=>{const Be=je.cities[Number(se.city.id)];return a.jsx("button",{"data-map-marker":!0,"aria-label":`查看${Be.label}详情`,className:K.marker,style:{left:se.x,top:se.y,width:se.w,height:se.h+4},onClick:ct=>{ct.detail===0&&j({kind:"city",id:Be.id})}},Be.id)})}),C&&!B&&!lt&&It!==null&&qt>=0&&ie&&a.jsx("div",{className:K.tooltip,style:{left:Math.min(C.p[0]+16,me-240),top:Math.min(C.p[1]+18,Fe-70)},children:ae!==null?n?a.jsx(a.Fragment,{children:n.pointToCity.has(ae)?a.jsxs(a.Fragment,{children:[a.jsx("b",{children:n.cityTip(ae)}),a.jsx("br",{}),a.jsx("span",{className:K.muted,children:"点击选择城市"})]}):a.jsxs(a.Fragment,{children:[a.jsx("b",{children:je.cities[ae].label}),a.jsx("br",{}),a.jsx("span",{className:K.muted,children:"不在试验情景的城市节点内"})]})}):a.jsxs(a.Fragment,{children:[a.jsx("b",{children:je.cities[ae].label})," · ",dr(je.cities[ae].population)," 人",ft?"（锚点格估计）":"",a.jsx("br",{}),a.jsx("span",{className:K.muted,children:"点击查看城镇详情"})]}):a.jsxs(a.Fragment,{children:[a.jsx("b",{children:je.land[qt]?je.terrain[qt]===Yn.Lake?"湖泊":rt.coverName(It):"海洋"}),je.land[qt]&&je.terrain[qt]>Yn.Lake?` · ${Ct.format(je.elevation[qt])} m`:"",a.jsx("br",{}),a.jsxs("span",{className:K.muted,children:[rt.province(It)?`${rt.province(It).name}${rt.province(It).foreign||ft?"":"（合成分区）"}`:je.land[qt]?`${Xt.regionName}内湖`:`${Xt.regionName}外海`,Lt&&je.land[qt]?` · ${Lt.name} ${je.valid[qt]?mo((_==="population"?je.population:je.economy)[qt]):"无数据"}`:""]})]})}),!n&&y&&ie&&!q&&a.jsx(uS,{selected:y,close:()=>j(null),locate:v}),n&&ie&&!q&&a.jsxs(a.Fragment,{children:[a.jsx(GamePanel,{s:n,locate:J}),a.jsx(GameToolHint,{s:n}),a.jsx(GameGuideCard,{s:n}),a.jsx(GameOpeningCard,{s:n})]}),B&&!lt&&a.jsxs("div",{className:`${K.panel} ${K.touchTip}`,role:"status",style:{left:Math.min(Math.max(12,B.p[0]-60),me-170),top:Math.max(10,B.p[1]-92)},children:[a.jsx("strong",{children:B.label}),a.jsxs("button",{onClick:()=>j(B.selection),children:["查看详情 ",a.jsx(qn,{name:"arrow",size:14})]})]}),ie&&!q&&a.jsxs(a.Fragment,{children:[a.jsxs("div",{className:`${K.panel} ${K.tools}`,children:[a.jsx("button",{"aria-label":"重置视野",title:"重置视野",onClick:re,children:a.jsx(qn,{name:"crosshair",size:17})}),a.jsx("button",{"aria-label":"放大",title:"放大",onClick:()=>Y(.72),children:a.jsx(qn,{name:"plus",size:17})}),a.jsx("button",{"aria-label":"缩小",title:"缩小",onClick:()=>Y(1.39),children:a.jsx(qn,{name:"minus",size:17})})]}),a.jsxs("div",{className:K.leftStack,children:[a.jsxs("div",{className:K.noticeRow,children:[a.jsx("span",{className:K.notice,children:n?pS:ga}),a.jsxs("span",{className:K.mapScale,children:[a.jsx("i",{style:{width:et}}),_a(at)," km"]})]}),a.jsx(hS,{camera:c,ratio:me/Fe,move:(se,Be)=>v([se,Be]),version:D})]}),a.jsxs("div",{className:K.lensArea,children:[Z&&a.jsxs("div",{className:`${K.panel} ${K.layersPop}`,role:"group","aria-label":"地图图层",children:[a.jsx("div",{className:K.spTitle,children:"地图图层"}),[{name:"交通网络",sub:ft?"公路与铁路：暂无数据":"公路与铁路（放大后显示）",icon:"t-rail",on:w,set:E},{name:"六边形网格",sub:"格线（放大后显示）",icon:"g-land",on:g,set:f},{name:"地名旗标",sub:"城镇旗标与分区名称",icon:"pop",on:b,set:A}].map(se=>a.jsxs("button",{role:"switch","aria-checked":se.on,className:K.mlRow,onClick:()=>se.set(!se.on),children:[a.jsx(Tt,{id:se.icon,size:16}),a.jsxs("span",{children:[a.jsx("b",{children:se.name}),a.jsx("small",{children:se.sub})]}),a.jsx("i",{className:se.on?K.on:""})]},se.name))]}),lt&&a.jsx("div",{className:`${K.panel} ${K.mapUpdating}`,role:"status",children:"地图图层更新中"}),Lt&&a.jsxs("section",{className:`${K.panel} ${K.legend}`,"aria-label":"图例",children:[a.jsxs("div",{className:K.lgHead,children:[a.jsx("span",{className:K.lgIc,children:a.jsx(Tt,{id:sc[_],size:14})}),a.jsx("span",{className:K.lgTitle,children:fa[_].name}),a.jsx("button",{className:K.iconBtn,"aria-label":"关闭透镜",onClick:()=>x("terrain"),children:a.jsx(qn,{name:"close",size:12})})]}),a.jsx("div",{className:K.lgDesc,children:ft?"每格 WorldPop 2020 模型估计人口密度（人/km²），对数色阶。非普查口径。":`${_==="population"?"每格合成人口密度，对数色阶。":"每格合成经济活动指数，对数色阶。"}数值由固定种子程序生成。`}),a.jsx("div",{className:K.ramp,style:{background:`linear-gradient(90deg, ${Lt.ramp.join(",")})`}}),a.jsxs("div",{className:K.ticks,children:[a.jsx("span",{style:{left:0},children:Ct.format(Lt.domain[0])}),a.jsx("span",{style:{left:"50%",transform:"translateX(-50%)"},children:Ct.format(Math.sqrt(Lt.domain[0]*Lt.domain[1]))}),a.jsxs("span",{style:{right:0},children:[Ct.format(Lt.domain[1]),"+"]})]}),a.jsxs("div",{className:K.lgMeta,children:[a.jsx("span",{children:fa[_].unit}),a.jsxs("span",{children:[a.jsx("i",{className:K.noData}),"无数据"]}),a.jsx("span",{children:ft?"真实数据":"合成数据"})]})]}),a.jsxs("div",{className:`${K.panel} ${K.lensDock}`,role:"toolbar","aria-label":"地图透镜",children:[Object.keys(fa).filter(se=>Xt.lenses.includes(se)).map(se=>a.jsxs("button",{className:`${K.lensBtn} ${se===_?K.active:""}`,"aria-pressed":se===_,onClick:()=>x(se===_&&se!=="terrain"?"terrain":se),children:[a.jsx(Tt,{id:sc[se],size:15}),a.jsx("span",{children:lS[se]})]},se)),a.jsxs("button",{className:`${K.lensBtn} ${K.lensMore}`,"aria-expanded":Z,"aria-label":"地图图层",onClick:()=>ge(!Z),children:[a.jsx(Tt,{id:"layers",size:15}),a.jsx("span",{children:"地图"}),a.jsx("b",{className:K.count,children:os})]})]})]})]}),(ee||q)&&a.jsxs("div",{className:`${K.panel} ${K.failure}`,role:"alert",children:[a.jsx(qn,{name:"map",size:30}),a.jsx("h2",{children:q?"正在恢复地图":"无法打开地图"}),a.jsx("p",{children:q?"WebGL2 上下文已中断，恢复后会重新绘制。":ee})]}),ye&&a.jsx("div",{className:K.toast,role:"status",children:ye})]}),n&&a.jsx(GameFooter,{s:n}),n&&n.toastText&&a.jsx("div",{className:L.toast,role:"status","data-testid":"toast",children:n.toastText}),n&&a.jsx(GameModal,{s:n,exit:returnToMenu}),a.jsxs("dialog",{ref:r,className:`${K.panel} ${K.dialog}`,children:[a.jsxs("header",{children:[a.jsx("h2",{children:O==="guide"?"图鉴指南":"数据说明"}),a.jsx("button",{className:K.iconBtn,onClick:()=>r.current?.close(),"aria-label":"关闭",children:a.jsx(qn,{name:"close",size:13})})]}),O==="guide"?a.jsxs(a.Fragment,{children:[a.jsxs("p",{children:["从",Xt.lenses.length>2?"地形、人口密度和经济活动三个":"地形和人口密度两个","透镜观察",Xt.regionName,"。点击城镇旗标、线路或地块查看详情；悬停地块可看到地表、海拔与所属分区。"]}),a.jsx("p",{children:"拖动、滚轮、方向键或 WASD 移动与缩放视野，按 / 搜索城镇。触控支持拖动、双指捏合、双击放大、双指轻点缩小及长按查看提示。"}),a.jsx("p",{className:K.muted,children:"视觉语言与地图绘制代码移植自 Andrej Karpathy 的 USACiv（karpathy.ai/usaciv，MIT 许可，版权声明见 LICENSE-USACIV.txt）。"})]}):ft?a.jsxs(a.Fragment,{children:[Xt.details.map((se,Be)=>a.jsx("p",{className:Be>=7?K.muted:void 0,children:se},Be)),a.jsx("p",{children:"图上的虚线只表示数据覆盖范围，灰色“无数据”区域是没有取得数据的地方，二者都不是国界、省界或其他行政边界。"}),a.jsxs("p",{children:["当前视野宽 ",_a(c.width)," km。"]})]}):a.jsxs(a.Fragment,{children:[a.jsxs("p",{children:[ga,"。地貌、聚落、分区、交通与指标均由固定种子程序生成，不代表真实地理、行政区划或统计数据。"]}),a.jsx("p",{children:"地表覆盖、地势等级、近海水深与“合成分区”是由合成地形推导的可视化分类。人口密度与经济活动透镜使用对数色阶，灰色表示无数据。"}),a.jsx("p",{children:"城镇美术分级按数据集规模放大 4 倍取档，旗标与面板中显示的人口仍为原合成数值。"}),a.jsxs("p",{children:["半径 12 km 尖顶六边形合成网格，共 ",Ct.format(ic)," 格；当前视野宽 ",_a(c.width)," km。"]})]})]})]})}export{vS as App};
