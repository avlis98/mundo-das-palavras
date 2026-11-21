import React from 'react';
import type { LearningLevel } from '../types';

interface IslandIllustrationProps {
  level: LearningLevel;
  locked?: boolean;
}

export const IslandIllustration: React.FC<IslandIllustrationProps> = ({ level, locked = false }) => {
  return (
    <svg
      viewBox="0 0 220 140"
      width="100%"
      height="130"
      style={{
        display: 'block',
        filter: locked ? 'grayscale(0.65) opacity(0.8)' : 'drop-shadow(0 8px 14px rgba(15, 16, 53, 0.35))',
      }}
      aria-hidden="true"
    >
      {/* Brilho na água */}
      <ellipse cx="110" cy="122" rx="88" ry="14" fill="rgba(56, 189, 248, 0.32)" />
      {/* Base rochosa da ilha flutuante */}
      <path
        d="M34 88 Q110 100 186 88 L156 122 Q110 134 64 122 Z"
        fill={level === 3 ? '#475569' : '#8B5A2B'}
        stroke="#1E1B4B"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M52 94 L78 120 L98 96 L124 124 L152 94"
        fill="none"
        stroke={level === 3 ? '#334155' : '#6B4226'}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Topo da ilha */}
      <ellipse
        cx="110"
        cy="86"
        rx="78"
        ry="18"
        fill={level === 3 ? '#64748B' : level === 6 ? '#38BDF8' : level === 7 ? '#FDE68A' : '#4ADE80'}
        stroke="#1E1B4B"
        strokeWidth="3"
      />

      {/* Ilustração temática de cada mundo */}
      {level === 1 && (
        <g>
          {/* Palmeira esquerda */}
          <path d="M58 84 Q54 58 62 42" stroke="#92400E" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M62 42 Q42 36 36 48 Q52 46 62 42 Z" fill="#16A34A" stroke="#1E1B4B" strokeWidth="2" />
          <path d="M62 42 Q64 22 78 28 Q70 38 62 42 Z" fill="#22C55E" stroke="#1E1B4B" strokeWidth="2" />
          <path d="M62 42 Q82 40 84 52 Q70 48 62 42 Z" fill="#15803D" stroke="#1E1B4B" strokeWidth="2" />
          {/* Letras 3D coloridas */}
          <rect x="84" y="48" width="24" height="26" rx="6" fill="#FACC15" stroke="#1E1B4B" strokeWidth="2.5" />
          <text x="96" y="67" textAnchor="middle" fontWeight="900" fontSize="16" fill="#1E1B4B">A</text>
          <rect x="112" y="42" width="24" height="26" rx="6" fill="#FB7185" stroke="#1E1B4B" strokeWidth="2.5" />
          <text x="124" y="61" textAnchor="middle" fontWeight="900" fontSize="16" fill="#FFFFFF">B</text>
          <rect x="140" y="50" width="24" height="26" rx="6" fill="#38BDF8" stroke="#1E1B4B" strokeWidth="2.5" />
          <text x="152" y="69" textAnchor="middle" fontWeight="900" fontSize="16" fill="#FFFFFF">C</text>
        </g>
      )}

      {level === 2 && (
        <g>
          {/* Lagoa azul */}
          <ellipse cx="110" cy="86" rx="44" ry="9" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          {/* Palmeira direita */}
          <path d="M158 82 Q164 56 154 40" stroke="#92400E" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M154 40 Q136 34 132 46 Q146 44 154 40 Z" fill="#22C55E" stroke="#1E1B4B" strokeWidth="2" />
          <path d="M154 40 Q174 34 178 46 Q164 44 154 40 Z" fill="#16A34A" stroke="#1E1B4B" strokeWidth="2" />
          {/* Notas musicais coloridas */}
          <text x="64" y="44" fontSize="26" fill="#FACC15" stroke="#1E1B4B" strokeWidth="1">♪</text>
          <text x="96" y="34" fontSize="28" fill="#F472B6" stroke="#1E1B4B" strokeWidth="1">♫</text>
          <text x="128" y="48" fontSize="24" fill="#38BDF8" stroke="#1E1B4B" strokeWidth="1">♪</text>
        </g>
      )}

      {level === 3 && (
        <g>
          {/* Montanha rochosa + Cristais */}
          <polygon points="75,82 110,30 145,82" fill="#475569" stroke="#1E1B4B" strokeWidth="2.5" />
          <polygon points="56,82 72,48 88,82" fill="#E879F9" stroke="#1E1B4B" strokeWidth="2" />
          <polygon points="100,82 112,38 124,82" fill="#22D3EE" stroke="#1E1B4B" strokeWidth="2" />
          <polygon points="134,82 148,50 162,82" fill="#C084FC" stroke="#1E1B4B" strokeWidth="2" />
          {/* Peças de quebra-cabeça coloridas */}
          <rect x="66" y="76" width="22" height="14" rx="4" fill="#FB7185" stroke="#1E1B4B" strokeWidth="2" />
          <rect x="98" y="78" width="22" height="14" rx="4" fill="#4ADE80" stroke="#1E1B4B" strokeWidth="2" />
          <rect x="130" y="76" width="22" height="14" rx="4" fill="#FACC15" stroke="#1E1B4B" strokeWidth="2" />
        </g>
      )}

      {level === 4 && (
        <g>
          {/* Árvores frondosas */}
          <circle cx="72" cy="48" r="18" fill="#16A34A" stroke="#1E1B4B" strokeWidth="2.5" />
          <circle cx="94" cy="38" r="20" fill="#22C55E" stroke="#1E1B4B" strokeWidth="2.5" />
          <circle cx="116" cy="48" r="16" fill="#15803D" stroke="#1E1B4B" strokeWidth="2.5" />
          {/* Pilha de livros */}
          <rect x="122" y="68" width="42" height="10" rx="3" fill="#EF4444" stroke="#1E1B4B" strokeWidth="2" />
          <rect x="126" y="58" width="38" height="10" rx="3" fill="#3B82F6" stroke="#1E1B4B" strokeWidth="2" />
          <rect x="124" y="48" width="40" height="10" rx="3" fill="#FACC15" stroke="#1E1B4B" strokeWidth="2" />
        </g>
      )}

      {level === 5 && (
        <g>
          {/* Balões de fala e livro aberto */}
          <rect x="64" y="44" width="46" height="28" rx="10" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="2.5" />
          <line x1="74" y1="54" x2="100" y2="54" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" />
          <line x1="74" y1="63" x2="94" y2="63" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <rect x="116" y="34" width="48" height="30" rx="10" fill="#FEF08A" stroke="#1E1B4B" strokeWidth="2.5" />
          <line x1="126" y1="45" x2="154" y2="45" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
          <line x1="126" y1="54" x2="146" y2="54" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {level === 6 && (
        <g>
          {/* Cidade futurista luminosa das histórias */}
          <rect x="68" y="36" width="26" height="48" rx="4" fill="#0EA5E9" stroke="#1E1B4B" strokeWidth="2.5" />
          <rect x="98" y="24" width="30" height="60" rx="4" fill="#6366F1" stroke="#1E1B4B" strokeWidth="2.5" />
          <rect x="132" y="42" width="24" height="42" rx="4" fill="#22D3EE" stroke="#1E1B4B" strokeWidth="2.5" />
          <circle cx="113" cy="38" r="6" fill="#FACC15" />
          <rect x="74" y="44" width="14" height="6" rx="2" fill="#E0F2FE" />
          <rect x="74" y="56" width="14" height="6" rx="2" fill="#E0F2FE" />
          <rect x="138" y="50" width="12" height="6" rx="2" fill="#FFFFFF" />
        </g>
      )}

      {level === 7 && (
        <g>
          {/* Arena / Oficina dourada da escrita */}
          <ellipse cx="110" cy="70" rx="48" ry="16" fill="#F59E0B" stroke="#1E1B4B" strokeWidth="2.5" />
          <ellipse cx="110" cy="66" rx="38" ry="11" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
          <rect x="74" y="46" width="8" height="22" rx="2" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2" />
          <rect x="138" y="46" width="8" height="22" rx="2" fill="#FBBF24" stroke="#1E1B4B" strokeWidth="2" />
          <text x="110" y="52" textAnchor="middle" fontSize="24">🪶</text>
        </g>
      )}

      {level === 8 && (
        <g>
          {/* Oficina de Ortografia: Escudo M antes de P e B */}
          <path d="M110 26 L142 40 V64 C142 78 126 88 110 92 C94 88 78 78 78 64 V40 Z" fill="#14B8A6" stroke="#1E1B4B" strokeWidth="2.5" />
          <text x="110" y="64" textAnchor="middle" fontWeight="900" fontSize="18" fill="#FFFFFF">M+PB</text>
        </g>
      )}

      {level === 9 && (
        <g>
          {/* Ilha da Pontuação: Placas brilhantes . ? ! */}
          <circle cx="74" cy="56" r="16" fill="#0EA5E9" stroke="#1E1B4B" strokeWidth="2.5" />
          <text x="74" y="63" textAnchor="middle" fontWeight="900" fontSize="22" fill="#FFFFFF">?</text>
          <circle cx="110" cy="42" r="18" fill="#F97316" stroke="#1E1B4B" strokeWidth="2.5" />
          <text x="110" y="50" textAnchor="middle" fontWeight="900" fontSize="24" fill="#FFFFFF">!</text>
          <circle cx="146" cy="56" r="16" fill="#10B981" stroke="#1E1B4B" strokeWidth="2.5" />
          <text x="146" y="62" textAnchor="middle" fontWeight="900" fontSize="22" fill="#FFFFFF">,</text>
        </g>
      )}

      {level === 10 && (
        <g>
          {/* Clube dos Leitores: Coroa e livro dourado */}
          <rect x="76" y="50" width="68" height="32" rx="6" fill="#7C3AED" stroke="#1E1B4B" strokeWidth="2.5" />
          <line x1="110" y1="50" x2="110" y2="82" stroke="#EDE9FE" strokeWidth="3" />
          <text x="110" y="42" textAnchor="middle" fontSize="26">👑</text>
        </g>
      )}
    </svg>
  );
};
