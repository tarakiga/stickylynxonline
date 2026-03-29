"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/Button"

type PropertyGalleryCarouselImage = {
  id: string
  url: string
  label: string
}

export function PropertyGalleryCarousel({
  title,
  images,
}: {
  title: string
  images: PropertyGalleryCarouselImage[]
}) {
  const [activeIndex, setActiveIndex] = React.useState(0)
  const totalImages = images.length
  const activeImage = images[activeIndex]

  React.useEffect(() => {
    if (activeIndex > totalImages - 1) {
      setActiveIndex(Math.max(0, totalImages - 1))
    }
  }, [activeIndex, totalImages])

  if (totalImages === 0 || !activeImage) return null

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? totalImages - 1 : current - 1))
  }

  const goToNext = () => {
    setActiveIndex((current) => (current === totalImages - 1 ? 0 : current + 1))
  }

  return (
    <section className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">Photo Gallery</p>
          <h2 className="mt-1 text-2xl font-bold text-text-primary">Walk through the space</h2>
        </div>
        <div className="rounded-full border border-divider bg-surface px-3 py-1 text-xs font-semibold text-text-secondary shadow-sm">
          {activeIndex + 1} / {totalImages}
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-divider bg-surface shadow-premium">
        <div className="relative">
          <div
            className="min-h-[340px] w-full bg-cover bg-center sm:min-h-[420px] lg:min-h-[520px]"
            style={{ backgroundImage: `url("${activeImage.url.replace(/"/g, '\\"')}")` }}
            role="img"
            aria-label={activeImage.label || title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/10 to-transparent" />

          {totalImages > 1 ? (
            <>
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goToPrevious}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-white/20 bg-surface/85 px-0 py-0 shadow-premium backdrop-blur"
                >
                  <ChevronLeft size={18} />
                </Button>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goToNext}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-white/20 bg-surface/85 px-0 py-0 shadow-premium backdrop-blur"
                >
                  <ChevronRight size={18} />
                </Button>
              </div>
            </>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="rounded-[1.4rem] border border-white/15 bg-slate-950/45 px-4 py-3 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Featured Image</p>
              <p className="mt-1 text-sm font-semibold text-white">{activeImage.label || title}</p>
            </div>
          </div>
        </div>

        {totalImages > 1 ? (
          <div className="border-t border-divider px-4 py-4 sm:px-5">
            <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {images.map((image, index) => {
                const isActive = index === activeIndex

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`overflow-hidden rounded-[1.4rem] border text-left transition-all ${isActive ? "border-primary shadow-premium" : "border-divider hover:border-primary/30"}`}
                  >
                    <div
                      className="h-24 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${image.url.replace(/"/g, '\\"')}")` }}
                      role="img"
                      aria-label={image.label || `${title} thumbnail ${index + 1}`}
                    />
                    <div className={`px-3 py-2 text-xs font-semibold ${isActive ? "bg-primary/5 text-primary" : "bg-background text-text-secondary"}`}>
                      {image.label || `Photo ${index + 1}`}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
