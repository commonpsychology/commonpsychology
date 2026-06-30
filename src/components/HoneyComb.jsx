// src/components/Honeycomb.jsx — reusable honeycomb word-pattern for hero/header sections
import { useState, useEffect, useRef } from 'react'

function Hexagon({ word, opacity, delay }) {
  return (
    <div
      style={{
        width: 104,
        height: 120,
        margin: '-8px 3px',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: 'rgba(255,255,255,0.16)',
        border: '1px solid rgba(255,255,255,0.26)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 9px',
        flexShrink: 0,
        opacity,
        animation: `honeyFloat 7s ease-in-out ${delay}s infinite`,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.95)',
          letterSpacing: 0.3,
          lineHeight: 1.25,
          textShadow: '0 1px 3px rgba(15,40,90,0.4)',
        }}
      >
        {word}
      </span>
    </div>
  )
}

/**
 * Honeycomb word-pattern overlay for hero/header sections.
 * Drop it as the FIRST child inside any `position:relative; overflow:hidden`
 * header container — it fills the container and sits behind the content
 * (as long as your text content has `position:relative; zIndex:1`, which
 * all the hero sections in this project already do).
 */
export default function Honeycomb({ words, rows = 4, perRow = 8 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        WebkitMaskImage: 'radial-gradient(ellipse 95% 100% at 50% 30%, black 45%, transparent 95%)',
        maskImage: 'radial-gradient(ellipse 95% 100% at 50% 30%, black 45%, transparent 95%)',
      }}
    >
      <style>{`
        @keyframes honeyFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', marginLeft: rowIdx % 2 === 1 ? 53 : 0 }}>
            {Array.from({ length: perRow }).map((_, colIdx) => {
              const wordIdx = (rowIdx * perRow + colIdx) % words.length
              const distFromCenterRow = Math.abs(rowIdx - (rows - 1) / 2)
              const baseOpacity = 0.7 - distFromCenterRow * 0.14
              return (
                <Hexagon
                  key={colIdx}
                  word={words[wordIdx]}
                  opacity={Math.max(0.2, baseOpacity)}
                  delay={(rowIdx * perRow + colIdx) * 0.14}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}