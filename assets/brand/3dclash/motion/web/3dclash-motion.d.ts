export type Clash3DLoaderVariant = 'orbit' | 'breathe' | 'resolve';
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
