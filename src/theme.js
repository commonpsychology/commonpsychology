// src/theme.js
export const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}

export const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(224,247,255,0.6) 55%, rgba(255,255,255,0.74) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(200,238,255,0.72) 55%, rgba(255,255,255,0.84) 100%)',
  border:    `1px solid ${C.borderFaint}`,
  borderHov: `1px solid ${C.skyBright}88`,
  shadow:    '0 4px 18px rgba(0,191,255,0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
  shadowHov: '0 20px 44px rgba(0,191,255,0.2), 0 6px 16px rgba(0,191,255,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
}