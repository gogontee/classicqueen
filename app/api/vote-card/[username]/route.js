// app/api/vote-card/[username]/route.js
import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(request, { params }) {
  const username = params.username;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: candidate } = await supabase
    .from('candidates')
    .select('username, full_name, country, photo, status')
    .eq('username', username)
    .eq('status', 'Approved')
    .maybeSingle();

  const rawName =
    candidate?.full_name || candidate?.username || username || 'CANDIDATE';

  const cardName = rawName.split(' ')[0].toUpperCase();

  const photoUrl = candidate?.photo || '';
  const country = candidate?.country || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(180deg, #2E1503 0%, #1a0d02 50%, #0a0703 100%)',
          padding: '32px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold outer border */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: '3px solid #9A7B4F',
            borderRadius: '28px',
            padding: '24px',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.55) 100%)',
          }}
        >
          {/* Title — VOTE (white) + gap + NAME (gold) */}
<div
  style={{
    display: 'flex',
    fontSize: 56,
    fontWeight: 800,
    letterSpacing: '2px',
    marginBottom: 20,
  }}
>
  <span style={{ color: '#ffffff', marginRight: 16 }}>VOTE</span>
  <span style={{ color: '#f5d76e' }}>{cardName}</span>
</div>

          {/* Candidate photo — 3:4 aspect */}
          <div
            style={{
              display: 'flex',
              width: 540,
              height: 720,
              borderRadius: 24,
              overflow: 'hidden',
              border: '3px solid rgba(201,162,39,0.5)',
              background: '#1a1a1a',
              marginBottom: 24,
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt={cardName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9A7B4F',
                  fontSize: 140,
                  fontWeight: 800,
                }}
              >
                {cardName.charAt(0)}
              </div>
            )}
          </div>

          {/* Click to Vote button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 48px',
              background: 'linear-gradient(90deg, #9A7B4F 0%, #6b4423 100%)',
              color: '#ffffff',
              fontSize: 28,
              fontWeight: 800,
              borderRadius: 20,
              letterSpacing: '0.5px',
              marginBottom: 22,
            }}
          >
            {'❤️  Click to Vote'}
          </div>

          {/* Country + brand line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '3px',
            }}
          >
            {country ? `${country} • ` : ''}CLASSIC QUEEN INTERNATIONAL 2026
          </div>
        </div>
      </div>
    ),
    {
      width: 900,
      height: 1200,
    }
  );
}