import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

interface HeatLayerProps {
  points: Array<[number, number, number]>
  options?: {
    minOpacity?: number
    maxZoom?: number
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
  }
}

export default function HeatLayer({ points, options = {} }: HeatLayerProps) {
  const map = useMap()

  useEffect(() => {
    const defaultOptions = {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      minOpacity: 0.3,
      gradient: {
        0.2: '#3b82f6',
        0.4: '#06b6d4',
        0.6: '#f59e0b',
        0.8: '#f97316',
        1.0: '#ef4444',
      },
      ...options,
    }

    const heat = L.heatLayer(points, defaultOptions).addTo(map)

    return () => {
      map.removeLayer(heat)
    }
  }, [map, points, options])

  return null
}
