// src/styles/oceanTheme.js
//
// Shared design tokens for the "Wellspring" ocean-blue visual system used
// across the homepage — donate flask, video reviews, testimonials, news,
// crisis line, resources, FAQ — so every section reads as one consistent
// product instead of a set of differently-themed components stitched
// together. Import TOKENS for colors and SECTION_GRADIENT_CSS for the
// shared sky-light -> white -> sky-light background + corner blobs that
// every section wrapper uses.

export const TOKENS = {
  oceanInk: '#003850',
  oceanDeep: '#005580',
  oceanCore: '#007BA8',
  oceanBright: '#00BFFF',
  oceanPale: '#F0FBFF',
  skyLight: '#EAF6FC',
  mist: '#F4FAF9',
  dim: '#4d7c94',
  bluePale: '#BEE9FB',
  white: '#FFFFFF',
}

// Reusable section chrome: gradient background + two soft blurred corner
// blobs, built as ::before/::after pseudo-elements so no extra markup is
// needed. Pass the wrapping section's className and drop the returned CSS
// into that component's <style> tag.
export function sectionGradientCSS(className) {
  return `
    .${className} {
      position: relative;
      overflow: hidden;
      background: linear-gradient(180deg, ${TOKENS.skyLight} 0%, ${TOKENS.white} 45%, ${TOKENS.skyLight} 100%);
    }
    .${className}::before,
    .${className}::after {
      content: '';
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      pointer-events: none;
      z-index: 0;
    }
    .${className}::before {
      width: 280px; height: 280px; top: -100px; left: -100px;
      background: radial-gradient(circle, rgba(0,191,255,0.12), transparent 70%);
    }
    .${className}::after {
      width: 240px; height: 240px; bottom: -90px; right: -90px;
      background: radial-gradient(circle, rgba(0,85,128,0.10), transparent 70%);
    }
  `
}