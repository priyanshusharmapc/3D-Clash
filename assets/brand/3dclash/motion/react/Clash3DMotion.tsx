import { createElement, type CSSProperties } from 'react';
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
