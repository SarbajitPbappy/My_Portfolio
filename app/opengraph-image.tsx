import { ImageResponse } from 'next/og'
import { siteConfig } from '@/lib/site'

// Route segment config
export const runtime = 'edge'
export const alt = `${siteConfig.name} — ${siteConfig.shortTitle}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #0c4a6e 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              fontSize: 30,
              color: '#7dd3fc',
              fontWeight: 600,
              letterSpacing: 1,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 9999,
                background: '#38bdf8',
              }}
            />
            {siteConfig.shortTitle}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 34,
              color: '#cbd5e1',
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            {siteConfig.jobTitle}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            fontSize: 24,
            color: '#e2e8f0',
          }}
        >
          {['Deep Learning', 'Computer Vision', 'Explainable AI', 'Federated Learning'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  padding: '10px 22px',
                  borderRadius: 9999,
                  border: '1px solid rgba(148,163,184,0.4)',
                  background: 'rgba(15,23,42,0.4)',
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
