import type { DesignRect, NavHotspot } from '@/types/spec'

export const DESIGN_WIDTH = 1280
export const TEMPLATE_NAV_HEIGHT = 43

// Coordinates aligned to SVG path groups in PAGE_Navbar / PAGE_* templates (1280x43).
export const templateNavHotspots: NavHotspot[] = [
  { key: 'hero', label: 'Hero', x: 380, y: 6, width: 66, height: 28, action: { kind: 'section', target: 'hero' }, glass: true },
  { key: 'profile', label: 'Profile', x: 447, y: 6, width: 78, height: 28, action: { kind: 'section', target: 'profile' }, glass: true },
  { key: 'prestasi', label: 'Prestasi', x: 525, y: 6, width: 58, height: 28, action: { kind: 'section', target: 'prestasi' }, glass: true },
  { key: 'skills', label: 'Skills', x: 582, y: 6, width: 84, height: 28, action: { kind: 'section', target: 'skills' }, glass: true },
  { key: 'penugasan', label: 'Penugasan', x: 664, y: 6, width: 100, height: 28, action: { kind: 'section', target: 'penugasan' }, glass: true },
  { key: 'kontak', label: 'Kontak', x: 758, y: 6, width: 66, height: 28, action: { kind: 'section', target: 'kontak' }, glass: true },
  { key: 'linkedin', label: 'LinkedIn', x: 827, y: 9, width: 68, height: 23, action: { kind: 'external', target: 'https://www.linkedin.com' }, glass: false },
]

// Coordinates inferred from HERO SVG path groups (custom navbar layout).
export const heroNavHotspots: NavHotspot[] = [
  { key: 'hero', label: 'Hero', x: 430, y: 13, width: 66, height: 28, action: { kind: 'section', target: 'hero' }, glass: true },
  { key: 'profile', label: 'Profile', x: 498, y: 13, width: 78, height: 28, action: { kind: 'section', target: 'profile' }, glass: true },
  { key: 'prestasi', label: 'Prestasi', x: 576, y: 13, width: 58, height: 28, action: { kind: 'section', target: 'prestasi' }, glass: true },
  { key: 'skills', label: 'Skills', x: 631, y: 13, width: 84, height: 28, action: { kind: 'section', target: 'skills' }, glass: true },
  { key: 'penugasan', label: 'Penugasan', x: 714, y: 13, width: 100, height: 28, action: { kind: 'section', target: 'penugasan' }, glass: true },
  { key: 'kontak', label: 'Kontak', x: 807, y: 13, width: 66, height: 28, action: { kind: 'section', target: 'kontak' }, glass: true },
]

export const prestasiListLayouts: readonly DesignRect[][] = [
  [
    { x: 61, y: 274, width: 396, height: 101 },
    { x: 61, y: 390, width: 332, height: 62 },
    { x: 61, y: 465, width: 332, height: 62 },
    { x: 61, y: 540, width: 332, height: 62 },
  ],
  [
    { x: 61, y: 274, width: 332, height: 62 },
    { x: 61, y: 351, width: 396, height: 101 },
    { x: 61, y: 465, width: 332, height: 62 },
    { x: 61, y: 540, width: 332, height: 62 },
  ],
  [
    { x: 61, y: 274, width: 332, height: 62 },
    { x: 61, y: 351, width: 332, height: 62 },
    { x: 61, y: 426, width: 396, height: 101 },
    { x: 61, y: 540, width: 332, height: 62 },
  ],
  [
    { x: 61, y: 274, width: 332, height: 62 },
    { x: 61, y: 351, width: 332, height: 62 },
    { x: 61, y: 426, width: 332, height: 62 },
    { x: 61, y: 501, width: 396, height: 101 },
  ],
] as const
