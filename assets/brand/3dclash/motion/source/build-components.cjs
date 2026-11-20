const fs = require('node:fs');
const path = require('node:path');
const {animatedSVG,svgCSS} = require('./build-motion.cjs');
const ROOT=path.resolve(__dirname,'..');
const artwork=Object.fromEntries(['orbit','breathe','resolve','settle','reveal'].map(k=>[k,animatedSVG(k,'inherit').replace('role="img"','aria-hidden="true" focusable="false"')]));
const css=`${svgCSS}
:host{display:inline-flex;vertical-align:middle;color:inherit;max-width:100%}
.wrap{display:inline-flex;align-items:center;gap:.65em;color:inherit}
.art{display:inline-flex;width:var(--clash3d-motion-size,32px);height:var(--clash3d-motion-size,32px);flex:none}
.art svg{width:100%;height:100%;display:block}
.label{font:inherit}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.wrap[data-paused] *{animation-play-state:paused!important}
.wrap[data-reduced] *{animation:none!important;transition:none!important}
.controlled .om-spin{transform:rotate(var(--phase-angle,0deg));transition:transform 240ms cubic-bezier(.4,0,.2,1)}
.wide{display:block;width:var(--clash3d-reveal-width,320px);max-width:100%}.wide .art{display:block;width:100%;height:auto}.wide svg{height:auto}
@media(prefers-reduced-motion:reduce){.controlled .om-spin{transition:none}}
`;
const js=`/** 3DClash motion v1.0. Native elements; no runtime dependencies. */
const ART=${JSON.stringify(artwork)};
const CSS=${JSON.stringify(css)};
const Base=globalThis.HTMLElement||class {};
const phases=['observe','resolve','check','apply'];
const normalSize=(value,fallback,max=512)=>{const n=Number(value);return Number.isFinite(n)&&n>0?Math.min(max,Math.max(12,n)):fallback;};
function setup(el,kind,wide=false){el.attachShadow({mode:'open'});el.shadowRoot.innerHTML='<style>'+CSS+'</style><span class="wrap'+(wide?' wide':'')+'"><span class="art"></span><span class="label"></span></span>';el._kind='';el._wide=wide;}
function sync(el,kind){
  const wrap=el.shadowRoot.querySelector('.wrap'),art=el.shadowRoot.querySelector('.art'),label=el.shadowRoot.querySelector('.label');
  if(el._kind!==kind){art.innerHTML=ART[kind];el._kind=kind;}
  wrap.toggleAttribute('data-paused',el.hasAttribute('paused'));wrap.toggleAttribute('data-reduced',el.hasAttribute('reduced'));
  el.style.setProperty('--clash3d-motion-size',normalSize(el.getAttribute('size'),32)+'px');
  el.style.setProperty('--clash3d-reveal-width',normalSize(el.getAttribute('width'),320,4096)+'px');
  return {wrap,art,label};
}
export class Clash3DLoaderElement extends Base{
  static get observedAttributes(){return ['variant','size','label','show-label','paused','reduced'];}
  constructor(){super();setup(this,'orbit');}
  connectedCallback(){this._sync();}
  attributeChangedCallback(){if(this.shadowRoot)this._sync();}
  _sync(){const requested=this.getAttribute('variant'),kind=['orbit','breathe','resolve'].includes(requested)?requested:'orbit';const {wrap,label}=sync(this,kind);wrap.setAttribute('role','status');wrap.setAttribute('aria-live','polite');label.className=this.hasAttribute('show-label')?'label':'label sr-only';const content=this.getAttribute('label')||'Loading';if(label.textContent!==content)label.textContent=content;}
}
export class Clash3DPhaseElement extends Base{
  static get observedAttributes(){return ['phase','size','label','paused','reduced'];}
  constructor(){super();setup(this,'orbit');}
  connectedCallback(){this._sync();}
  attributeChangedCallback(){if(this.shadowRoot)this._sync();}
  _sync(){const requested=this.getAttribute('phase'),phase=phases.includes(requested)?requested:'observe';const {wrap,art,label}=sync(this,'orbit');wrap.classList.add('controlled');art.querySelector('svg').classList.remove('om-orbit');wrap.style.setProperty('--phase-angle',phases.indexOf(phase)*90+'deg');wrap.setAttribute('role','status');wrap.setAttribute('aria-live','polite');label.className='label';const content=this.getAttribute('label')||phase[0].toUpperCase()+phase.slice(1);if(label.textContent!==content)label.textContent=content;}
}
export class Clash3DRevealElement extends Base{
  static get observedAttributes(){return ['size','width','label','paused','reduced'];}
  get kind(){return 'reveal';}
  constructor(){super();setup(this,'reveal',this.kind==='reveal');}
  connectedCallback(){this._sync();}
  attributeChangedCallback(){if(this.shadowRoot)this._sync();}
  _sync(){const {wrap,label}=sync(this,this.kind);wrap.setAttribute('role','img');wrap.setAttribute('aria-label',this.getAttribute('label')||(this.kind==='settle'?'3DClash completed action':'3DClash'));label.hidden=true;}
  replay(){this.shadowRoot.querySelector('.art').innerHTML=ART[this.kind];}
}
export class Clash3DSettleElement extends Clash3DRevealElement{get kind(){return 'settle';}}
if(typeof customElements!=='undefined')for(const [tag,ctor] of [['clash3d-loader',Clash3DLoaderElement],['clash3d-phase',Clash3DPhaseElement],['clash3d-reveal',Clash3DRevealElement],['clash3d-settle',Clash3DSettleElement]])if(!customElements.get(tag))customElements.define(tag,ctor);
`;
const types=`export type Clash3DLoaderVariant = 'orbit' | 'breathe' | 'resolve';
export type Clash3DPhase = 'observe' | 'resolve' | 'check' | 'apply';
export declare class Clash3DLoaderElement extends HTMLElement {}
export declare class Clash3DPhaseElement extends HTMLElement {}
export declare class Clash3DRevealElement extends HTMLElement { replay(): void; }
export declare class Clash3DSettleElement extends Clash3DRevealElement {}
declare global { interface HTMLElementTagNameMap {
  'clash3d-loader': Clash3DLoaderElement;
  'clash3d-phase': Clash3DPhaseElement;
  'clash3d-reveal': Clash3DRevealElement;
  'clash3d-settle': Clash3DSettleElement;
} }
`;
const react=`import { createElement, type CSSProperties } from 'react';
import '../web/3dclash-motion.js';
export type Phase = 'observe' | 'resolve' | 'check' | 'apply';
type Shared = { size?: number; label?: string; paused?: boolean; reduced?: boolean; className?: string; style?: CSSProperties };
const flags = (paused?: boolean, reduced?: boolean) => ({ paused: paused ? '' : undefined, reduced: reduced ? '' : undefined });
export function Clash3DLoader({variant='orbit',size=32,label='Loading',showLabel=false,paused,reduced,className,style}: Shared & {variant?:'orbit'|'breathe'|'resolve';showLabel?:boolean}) {
  return createElement('clash3d-loader', {variant,size:String(size),label,'show-label':showLabel?'':undefined,...flags(paused,reduced),class:className,style});
}
export function Clash3DPhaseIndicator({phase,size=32,label,paused,reduced,className,style}: Shared & {phase:Phase}) {
  return createElement('clash3d-phase', {phase,size:String(size),label,...flags(paused,reduced),class:className,style});
}
export function Clash3DLogoReveal({width=320,label='3DClash',paused,reduced,className,style}: Omit<Shared,'size'> & {width?:number}) {
  return createElement('clash3d-reveal', {width:String(width),label,...flags(paused,reduced),class:className,style});
}
export function Clash3DComplete({size=48,label='Action completed',paused,reduced,className,style}: Shared) {
  return createElement('clash3d-settle', {size:String(size),label,...flags(paused,reduced),class:className,style});
}
`;
function write(rel,data){fs.mkdirSync(path.dirname(path.join(ROOT,rel)),{recursive:true});fs.writeFileSync(path.join(ROOT,rel),data);}
write('web/3dclash-motion.js',js);write('web/3dclash-motion.d.ts',types);write('web/3dclash-motion.css',css);write('react/Clash3DMotion.tsx',react);
write('web/example.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>3DClash motion / Integration</title><style>body{font:16px system-ui;color:#11161B;background:#F5F7F8;max-width:920px;margin:48px auto;padding:24px}section{padding:24px;margin:16px 0;background:white}button{font:inherit;padding:10px 16px;margin:12px 8px 0 0}h1{font-size:28px}clash3d-loader{margin-right:24px}.navy{background:#052640;color:white}</style><script type="module" src="3dclash-motion.js"></script><h1>3DClash / Native motion components</h1><section><clash3d-loader label="Loading models" show-label></clash3d-loader><clash3d-loader variant="breathe" label="Preparing model" size="48"></clash3d-loader><clash3d-loader variant="resolve" label="Checking geometry" size="48"></clash3d-loader></section><section><clash3d-phase id="phase" phase="observe" size="48"></clash3d-phase><div><button data-phase="observe">Observe</button><button data-phase="resolve">Resolve</button><button data-phase="check">Check</button><button data-phase="apply">Apply</button></div></section><section class="navy"><clash3d-reveal id="reveal" width="480"></clash3d-reveal><div><button id="replay">Replay reveal</button></div></section><section><clash3d-settle id="complete" size="64" label="Completed"></clash3d-settle><button id="finish">Complete action</button></section><script>document.querySelectorAll('[data-phase]').forEach(b=>b.onclick=()=>document.getElementById('phase').setAttribute('phase',b.dataset.phase));document.getElementById('replay').onclick=()=>document.getElementById('reveal').replay();document.getElementById('finish').onclick=()=>document.getElementById('complete').replay();</script></html>`);
console.log(JSON.stringify({webComponentModule:'web/3dclash-motion.js',reactWrapper:'react/Clash3DMotion.tsx'}));
