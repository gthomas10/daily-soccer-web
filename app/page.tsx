import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Daily Soccer Report — Coming Soon",
  description:
    "AI-powered daily soccer coverage. Every league. Every morning. Launching soon on Apple Podcasts and Spotify.",
  openGraph: {
    title: "The Daily Soccer Report — Coming Soon",
    description:
      "AI-powered daily soccer coverage. Every league. Every morning.",
    images: ["/logo.png"],
  },
};

export default function ComingSoonPage() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: COMING_SOON_HTML,
      }}
    />
  );
}

const COMING_SOON_HTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:       #39B54A;
    --green-dark:  #2A8C38;
    --green-glow:  rgba(57, 181, 74, 0.18);
    --bg:          #080C08;
    --bg-card:     #0F1510;
    --border:      rgba(57, 181, 74, 0.2);
    --text:        #F0F4F0;
    --muted:       #7A8C7A;
    --white:       #FFFFFF;
  }

  html, body {
    height: 100%;
    font-family: 'Inter', sans-serif;
    background-color: var(--bg);
    color: var(--text);
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(57,181,74,0.12) 0%, transparent 70%),
      repeating-linear-gradient(0deg, transparent, transparent 58px, rgba(57,181,74,0.025) 58px, rgba(57,181,74,0.025) 60px),
      repeating-linear-gradient(90deg, transparent, transparent 58px, rgba(57,181,74,0.025) 58px, rgba(57,181,74,0.025) 60px);
    pointer-events: none;
    z-index: 0;
  }

  .page {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    gap: 0;
  }

  .logo-wrap { margin-bottom: 32px; animation: fadeDown 0.7s ease both; }
  .logo-wrap img {
    width: 160px; height: 160px; object-fit: contain;
    filter: drop-shadow(0 0 32px rgba(57,181,74,0.35));
  }

  .headline { text-align: center; margin-bottom: 16px; animation: fadeDown 0.7s 0.1s ease both; }
  .headline h1 {
    font-size: clamp(2rem, 6vw, 3.25rem); font-weight: 900;
    letter-spacing: -0.03em; line-height: 1.1; color: var(--white);
  }
  .headline h1 span { color: var(--green); }

  .sub {
    text-align: center; font-size: clamp(0.95rem, 2.5vw, 1.15rem);
    font-weight: 400; color: var(--muted); max-width: 500px;
    line-height: 1.6; margin-bottom: 48px; animation: fadeDown 0.7s 0.2s ease both;
  }

  .card {
    width: 100%; max-width: 480px; background: var(--bg-card);
    border: 1px solid var(--border); border-radius: 16px; padding: 36px 32px;
    box-shadow: 0 0 0 1px rgba(57,181,74,0.08), 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: fadeUp 0.7s 0.3s ease both;
  }

  .card-label {
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--green); margin-bottom: 12px;
  }
  .card-title { font-size: 1.25rem; font-weight: 700; color: var(--white); margin-bottom: 6px; }
  .card-desc { font-size: 0.88rem; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }

  .form-row { display: flex; gap: 10px; }
  .form-row input[type="email"] {
    flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px; padding: 13px 16px; font-family: inherit; font-size: 0.9rem;
    color: var(--white); outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .form-row input[type="email"]::placeholder { color: var(--muted); }
  .form-row input[type="email"]:focus { border-color: var(--green); box-shadow: 0 0 0 3px var(--green-glow); }
  .btn-notify {
    background: var(--green); color: #fff; border: none; border-radius: 10px;
    padding: 13px 22px; font-family: inherit; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; white-space: nowrap; transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(57,181,74,0.3);
  }
  .btn-notify:hover { background: var(--green-dark); box-shadow: 0 6px 24px rgba(57,181,74,0.45); }
  .btn-notify:active { transform: scale(0.97); }

  .form-note { font-size: 0.75rem; color: var(--muted); margin-top: 10px; text-align: center; }

  .divider {
    display: flex; align-items: center; gap: 12px; margin: 28px 0;
    color: var(--muted); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase;
  }
  .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .platforms { display: flex; gap: 12px; }
  .platform-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 9px;
    padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); text-decoration: none; color: var(--text);
    font-size: 0.82rem; font-weight: 600; transition: border-color 0.2s, background 0.2s;
    cursor: not-allowed; opacity: 0.7;
  }
  .platform-btn:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.07); }
  .platform-btn .coming-tag {
    font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--muted); margin-left: 2px;
  }

  .footer {
    margin-top: 48px; text-align: center; font-size: 0.78rem; color: var(--muted);
    animation: fadeUp 0.7s 0.5s ease both; line-height: 1.7;
  }
  .footer a { color: var(--green); text-decoration: none; }
  .footer a:hover { text-decoration: underline; }

  @keyframes fadeDown { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 480px) {
    .card { padding: 28px 20px; }
    .form-row { flex-direction: column; }
    .platforms { flex-direction: column; }
  }
</style>

<div class="page">
  <div class="logo-wrap">
    <img src="/logo.png" alt="The Daily Soccer Report" />
  </div>

  <div class="headline">
    <h1>The World's Football.<br /><span>Delivered Daily.</span></h1>
  </div>

  <p class="sub">
    AI-powered daily soccer coverage across every major league and tournament.
    Available soon on Apple Podcasts and Spotify.
  </p>

  <div class="card">
    <div class="card-label">Early Access</div>
    <div class="card-title">Be first to know when we launch</div>
    <div class="card-desc">Drop your email and we'll reach out the moment the first episode drops.</div>

    <div class="form-row">
      <input type="email" placeholder="your@email.com" id="cs-email" />
      <button class="btn-notify" onclick="window.location.href='mailto:manager@dailysoccerreport.com?subject=Launch%20Notification&body=Please%20notify%20me%20at%20'+encodeURIComponent(document.getElementById('cs-email').value)">Notify Me</button>
    </div>

    <p class="form-note">No spam. One email when we go live. That's it.</p>

    <div class="divider">Coming soon on</div>

    <div class="platforms">
      <a href="#" class="platform-btn" aria-disabled="true">
        Apple Podcasts <span class="coming-tag">Soon</span>
      </a>
      <a href="#" class="platform-btn" aria-disabled="true">
        Spotify <span class="coming-tag">Soon</span>
      </a>
    </div>
  </div>

  <div class="footer">
    <p>&copy; 2026 The Daily Soccer Report. All rights reserved.</p>
    <p style="margin-top:6px;">
      Questions? <a href="mailto:manager@dailysoccerreport.com">manager@dailysoccerreport.com</a>
    </p>
  </div>
</div>
`;
