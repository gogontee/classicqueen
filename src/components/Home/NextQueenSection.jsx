'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

const FADE_MS = 1200 // crossfade duration

const NextQueenSection = () => {
  const supabase = createClient()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch approved candidates with a photo
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, username, full_name, photo')
        .eq('status', 'Approved')
        .not('photo', 'is', null)
        .order('vote_count', { ascending: false })
        .limit(30)

      if (cancelled) return

      if (!error && data && data.length > 0) {
        setCandidates(data)
      }
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [supabase])

  if (loading) {
    return (
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-brown-900 tracking-tight">
              WHO BECOMES THE NEXT QUEEN?
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 mx-auto mt-1 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 max-w-3xl mx-auto">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`relative aspect-[3/4] rounded-lg bg-[#faf6ee] animate-pulse ${
                  i === 2 ? 'hidden sm:block' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (candidates.length === 0) return null

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-brown-900 tracking-tight">
            WHO BECOMES THE NEXT QUEEN?
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 mx-auto mt-1 rounded-full"></div>
        </div>

        {/* Slots — 2 on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 max-w-3xl mx-auto">
          <PhotoSlot
            candidates={candidates}
            startIndex={0}
            intervalMs={4000}
          />
          <PhotoSlot
            candidates={candidates}
            startIndex={Math.floor(candidates.length / 3)}
            intervalMs={4800}
          />
          <PhotoSlot
            candidates={candidates}
            startIndex={Math.floor((candidates.length * 2) / 3)}
            intervalMs={5600}
            className="hidden sm:block"
          />
        </div>

        {/* Vote CTA */}
        <div className="text-center mt-4 md:mt-6">
          <Link
            href="/candidates"
            className="inline-block px-5 md:px-6 py-2.5 bg-gradient-to-r from-brown-900 to-brown-800 hover:from-gold-600 hover:to-gold-500 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Click Here to Vote
          </Link>

          <p className="mt-2 text-brown-600 text-xs max-w-md mx-auto">
            Your vote decides who wears the crown. Support your Queen today.
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * PhotoSlot
 * ----------
 * Holds TWO stacked <img> elements at all times — an "outgoing" and an
 * "incoming". On every tick, the incoming fades in while the outgoing
 * fades out, both starting from full opacity in their respective layers.
 * Crossfade happens in place with no flicker and no blank frames.
 */
function PhotoSlot({ candidates, startIndex = 0, intervalMs = 4000, className = '' }) {
  // Two layers: A and B. The active layer holds the current photo,
  // the inactive layer holds the next photo and starts at opacity 0.
  // On tick we swap which layer is on top.
  const [layerA, setLayerA] = useState({
    src: candidates[startIndex % candidates.length]?.photo,
    opacity: 1,
    z: 2,
  })
  const [layerB, setLayerB] = useState({
    src: '',
    opacity: 0,
    z: 1,
  })
  const [topLayer, setTopLayer] = useState('A') // which layer is on top
  const indexRef = useRef(startIndex % candidates.length)

  // Advance the index and trigger the next crossfade
  const advance = () => {
    if (candidates.length === 0) return

    let nextIndex = (indexRef.current + 1) % candidates.length
    // Skip any candidate already shown in this slot's last shown src
    // (avoid immediate repeat)
    if (candidates[nextIndex]?.photo === layerA.src) {
      nextIndex = (nextIndex + 1) % candidates.length
    }
    indexRef.current = nextIndex

    const nextSrc = candidates[nextIndex]?.photo
    if (!nextSrc) return

    if (topLayer === 'A') {
      // Prepare B with next photo, start hidden
      setLayerB({ src: nextSrc, opacity: 0, z: 3 })
      // Give the browser a frame to paint B at opacity 0, then fade it in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLayerB((prev) => ({ ...prev, opacity: 1 }))
          setLayerA((prev) => ({ ...prev, opacity: 0 }))
        })
      })
      // After the fade ends, clear A and reset the tracking
      setTimeout(() => {
        setLayerA({ src: '', opacity: 0, z: 1 })
        setLayerB((prev) => ({ ...prev, z: 2 }))
        setTopLayer('B')
      }, FADE_MS + 50)
    } else {
      setLayerA({ src: nextSrc, opacity: 0, z: 3 })
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setLayerA((prev) => ({ ...prev, opacity: 1 }))
          setLayerB((prev) => ({ ...prev, opacity: 0 }))
        })
      })
      setTimeout(() => {
        setLayerB({ src: '', opacity: 0, z: 1 })
        setLayerA((prev) => ({ ...prev, z: 2 }))
        setTopLayer('A')
      }, FADE_MS + 50)
    }
  }

  useEffect(() => {
    if (candidates.length < 2) return
    const t = setInterval(advance, intervalMs)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.length, intervalMs, topLayer])

  // Safety: if `candidates` load after mount, seed the top layer
  useEffect(() => {
    if (candidates.length === 0) return
    if (layerA.src) return // already have a photo
    const first = candidates[indexRef.current % candidates.length]?.photo
    if (first) {
      setLayerA({ src: first, opacity: 1, z: 2 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.length])

  return (
    <div className={`relative ${className}`}>
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md bg-[#faf6ee]">
        {/* Layer A */}
        {layerA.src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={layerA.src}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: layerA.opacity,
              zIndex: layerA.z,
              transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              willChange: 'opacity',
            }}
          />
        )}

        {/* Layer B */}
        {layerB.src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={layerB.src}
            alt=""
            draggable={false}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: layerB.opacity,
              zIndex: layerB.z,
              transition: `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
              willChange: 'opacity',
            }}
          />
        )}

        {/* Gradient overlay — sits above both layers, never fades */}
        <div
          className="bg-gradient-to-t from-brown-900/60 via-brown-900/10 to-transparent pointer-events-none"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 5,
          }}
        />
      </div>
    </div>
  )
}

export default NextQueenSection