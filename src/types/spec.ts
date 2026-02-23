export type SectionId = 'hero' | 'profile' | 'prestasi' | 'skills' | 'penugasan' | 'kontak'

export type HotspotAction =
  | { kind: 'section'; target: SectionId }
  | { kind: 'external'; target: string }

export interface DesignRect {
  x: number
  y: number
  width: number
  height: number
}

export interface NavHotspot extends DesignRect {
  key: string
  label: string
  action: HotspotAction
  glass?: boolean
}

export interface PrestasiSlide {
  key: string
  title: string
  svgUrl: string
}
