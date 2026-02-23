/**
 * Landing page HTML — served at / — showcases the embeddable widget approach.
 *
 * Uses demo iframes that pass pre-baked JSON via ?data=<base64> so no
 * Anthropic API key is needed to view the demo.
 */

export const landingHtml = String.raw`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>NBA Stats Embeds — Powered by Claude AI</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: #020817;
      color: #e2e8f0;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Layout ── */
    .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }

    /* ── Hero ── */
    .hero {
      padding: 64px 20px 40px;
      text-align: center;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3);
      color: #a5b4fc; border-radius: 999px;
      padding: 4px 14px; font-size: .8rem; font-weight: 600;
      letter-spacing: .04em; text-transform: uppercase;
      margin-bottom: 20px;
    }
    .badge-dot { width: 6px; height: 6px; background: #6366f1; border-radius: 50%; }
    h1 {
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 900;
      color: #f1f5f9;
      line-height: 1.1;
      letter-spacing: -.02em;
      margin-bottom: 16px;
    }
    h1 em { font-style: normal; color: #6366f1; }
    .tagline {
      font-size: 1.1rem; color: #94a3b8;
      max-width: 520px; margin: 0 auto 32px;
    }
    .platform-badges {
      display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;
      margin-bottom: 40px;
    }
    .platform-badge {
      background: #1e293b; border: 1px solid #334155;
      color: #94a3b8; border-radius: 6px;
      padding: 4px 12px; font-size: .85rem;
    }

    /* ── Section headings ── */
    .section { padding: 48px 0; }
    .section-label {
      font-size: .75rem; font-weight: 700; letter-spacing: .1em;
      text-transform: uppercase; color: #6366f1; margin-bottom: 8px;
    }
    h2 { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; margin-bottom: 12px; }
    .section-desc { color: #94a3b8; margin-bottom: 28px; max-width: 560px; }

    /* ── Widget demo ── */
    .widget-demo { margin-bottom: 36px; }
    .widget-label {
      font-size: .75rem; font-weight: 600; letter-spacing: .08em;
      text-transform: uppercase; color: #64748b; margin-bottom: 8px;
    }
    .widget-frame {
      width: 100%; border: 0; border-radius: 12px;
      display: block; background: #0f172a;
      transition: opacity .3s;
    }

    /* ── Code snippet ── */
    .snippet-wrap {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 12px; overflow: hidden; margin-top: 10px;
    }
    .snippet-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 14px;
      background: #1e293b; border-bottom: 1px solid #334155;
      font-size: .75rem; color: #64748b;
    }
    .copy-btn {
      background: #334155; border: 0; color: #94a3b8;
      border-radius: 4px; padding: 3px 10px; font-size: .75rem;
      cursor: pointer; transition: background .15s;
    }
    .copy-btn:hover { background: #475569; color: #e2e8f0; }
    .copy-btn.copied { background: #14532d; color: #86efac; }
    pre {
      padding: 16px; overflow-x: auto;
      font-size: .82rem; line-height: 1.6;
      color: #cbd5e1;
    }
    .kw { color: #93c5fd; }    /* keyword: <iframe */
    .attr { color: #a5b4fc; }  /* attribute name */
    .val { color: #86efac; }   /* attribute value */
    .cm { color: #64748b; }    /* comment */

    /* ── How it works ── */
    .steps { display: flex; flex-direction: column; gap: 16px; }
    .step {
      display: flex; gap: 16px; align-items: flex-start;
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 12px; padding: 18px 20px;
    }
    .step-num {
      flex-shrink: 0; width: 32px; height: 32px;
      background: rgba(99,102,241,.15); border: 1px solid rgba(99,102,241,.3);
      border-radius: 8px; color: #818cf8;
      font-size: .85rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }
    .step h3 { font-size: 1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 3px; }
    .step p { font-size: .9rem; color: #94a3b8; }
    .step code {
      background: #1e293b; color: #a5b4fc;
      border-radius: 4px; padding: 1px 6px; font-size: .85em;
    }

    /* ── MCP section ── */
    .mcp-card {
      background: #0f172a; border: 1px solid #1e293b;
      border-radius: 16px; padding: 28px;
    }
    .mcp-card h3 { font-size: 1.1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 6px; }
    .mcp-card p { color: #94a3b8; font-size: .9rem; margin-bottom: 16px; }

    /* ── Footer ── */
    footer {
      padding: 24px 20px; text-align: center;
      color: #475569; font-size: .85rem;
      border-top: 1px solid #1e293b;
    }

    /* ── Divider ── */
    hr { border: none; border-top: 1px solid #1e293b; margin: 8px 0; }
  </style>
</head>
<body>

<!-- ── Hero ──────────────────────────────────────────────────────────────── -->
<div class="hero">
  <div class="badge"><span class="badge-dot"></span> Powered by Claude AI</div>
  <h1>NBA Stats Widgets<br>for <em>any</em> blog platform</h1>
  <p class="tagline">
    Paste one line of HTML. Claude looks up the real stats.
    Your readers see live, beautiful data — automatically.
  </p>
  <div class="platform-badges">
    <span class="platform-badge">Hashnode</span>
    <span class="platform-badge">WordPress</span>
    <span class="platform-badge">Ghost</span>
    <span class="platform-badge">Substack</span>
    <span class="platform-badge">Medium</span>
    <span class="platform-badge">Any CMS</span>
  </div>
</div>

<!-- ── Live demos ─────────────────────────────────────────────────────────── -->
<div class="container">
  <div class="section">
    <div class="section-label">Live demos</div>
    <h2>See it in action</h2>
    <p class="section-desc">
      These widgets load exactly the same way they do when embedded in a real blog post.
    </p>

    <!-- Player compare -->
    <div class="widget-demo">
      <div class="widget-label">Player comparison widget</div>
      <iframe id="f-compare" class="widget-frame" height="540"
        title="Curry vs Klay career shooting comparison" loading="lazy"></iframe>

      <div class="snippet-wrap" style="margin-top:12px;">
        <div class="snippet-bar">
          <span>Copy to your post</span>
          <button class="copy-btn" data-target="snip-compare">Copy</button>
        </div>
        <pre id="snip-compare"><span class="cm">&lt;!-- NBA Stats Widget --&gt;</span>
<span class="kw">&lt;iframe</span>
  <span class="attr">src</span>=<span class="val">"https://nba-mdx-mcp.tonyjmartinez.workers.dev/embed?component=player-compare&amp;player1=Stephen+Curry&amp;player2=Klay+Thompson&amp;season=Career"</span>
  <span class="attr">width</span>=<span class="val">"100%"</span> <span class="attr">height</span>=<span class="val">"540"</span>
  <span class="attr">style</span>=<span class="val">"border:0;border-radius:12px;display:block;max-width:720px;margin:0 auto;"</span>
  <span class="attr">loading</span>=<span class="val">"lazy"</span>
  <span class="attr">title</span>=<span class="val">"Stephen Curry vs Klay Thompson (Career)"</span>
<span class="kw">&gt;&lt;/iframe&gt;</span></pre>
      </div>
    </div>

    <hr style="margin:36px 0;">

    <!-- Leaderboard -->
    <div class="widget-demo">
      <div class="widget-label">Leaderboard widget</div>
      <iframe id="f-leaderboard" class="widget-frame" height="300"
        title="All-time 3P% leaders" loading="lazy"></iframe>

      <div class="snippet-wrap" style="margin-top:12px;">
        <div class="snippet-bar">
          <span>Copy to your post</span>
          <button class="copy-btn" data-target="snip-leaderboard">Copy</button>
        </div>
        <pre id="snip-leaderboard"><span class="cm">&lt;!-- NBA Stats Widget --&gt;</span>
<span class="kw">&lt;iframe</span>
  <span class="attr">src</span>=<span class="val">"https://nba-mdx-mcp.tonyjmartinez.workers.dev/embed?component=leaderboard&amp;stat=fg3_pct&amp;season=All-Time"</span>
  <span class="attr">width</span>=<span class="val">"100%"</span> <span class="attr">height</span>=<span class="val">"300"</span>
  <span class="attr">style</span>=<span class="val">"border:0;border-radius:12px;display:block;max-width:720px;margin:0 auto;"</span>
  <span class="attr">loading</span>=<span class="val">"lazy"</span>
  <span class="attr">title</span>=<span class="val">"All-Time 3P% Leaders"</span>
<span class="kw">&gt;&lt;/iframe&gt;</span></pre>
      </div>
    </div>

    <hr style="margin:36px 0;">

    <!-- Stat highlight -->
    <div class="widget-demo">
      <div class="widget-label">Stat highlight widget</div>
      <iframe id="f-highlight" class="widget-frame" height="155"
        title="Curry career 3P% highlight" loading="lazy"></iframe>

      <div class="snippet-wrap" style="margin-top:12px;">
        <div class="snippet-bar">
          <span>Copy to your post</span>
          <button class="copy-btn" data-target="snip-highlight">Copy</button>
        </div>
        <pre id="snip-highlight"><span class="cm">&lt;!-- NBA Stats Widget --&gt;</span>
<span class="kw">&lt;iframe</span>
  <span class="attr">src</span>=<span class="val">"https://nba-mdx-mcp.tonyjmartinez.workers.dev/embed?component=stat-highlight&amp;player1=Stephen+Curry&amp;stat=fg3_pct"</span>
  <span class="attr">width</span>=<span class="val">"100%"</span> <span class="attr">height</span>=<span class="val">"155"</span>
  <span class="attr">style</span>=<span class="val">"border:0;border-radius:12px;display:block;max-width:720px;margin:0 auto;"</span>
  <span class="attr">loading</span>=<span class="val">"lazy"</span>
  <span class="attr">title</span>=<span class="val">"Stephen Curry stat highlight"</span>
<span class="kw">&gt;&lt;/iframe&gt;</span></pre>
      </div>
    </div>
  </div>

  <!-- ── How it works ───────────────────────────────────────────────────────── -->
  <div class="section">
    <div class="section-label">How it works</div>
    <h2>Zero setup for your readers</h2>
    <p class="section-desc">
      Authors generate a snippet once. Everyone who reads the post gets live stats — forever.
    </p>
    <div class="steps">
      <div class="step">
        <div class="step-num">1</div>
        <div>
          <h3>Write on your platform of choice</h3>
          <p>Hashnode, WordPress, Ghost, Substack — wherever you publish, keep publishing there.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div>
          <h3>Ask Claude to generate an embed</h3>
          <p>Use the MCP tool: <code>generate_embed(component="player-compare", player1="Jokic", player2="SGA")</code>. Claude outputs the ready-to-paste snippet.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div>
          <h3>Paste the &lt;iframe&gt; into your post</h3>
          <p>Drop it into an HTML block in Hashnode, a Custom HTML block in WordPress, or an HTML card in Ghost. Done.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div>
          <h3>Readers see real stats, automatically</h3>
          <p>When someone loads the post, Claude looks up the actual stats in real time and renders the widget. No stale data, no manual updates.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ── MCP connect ────────────────────────────────────────────────────────── -->
  <div class="section">
    <div class="section-label">For authors</div>
    <h2>Connect via MCP</h2>
    <div class="mcp-card">
      <h3>Add to Claude Desktop</h3>
      <p>Connect this MCP server to Claude Desktop, then use the <code>generate_embed</code> tool to create widgets for any player, stat, or comparison.</p>
      <div class="snippet-wrap">
        <div class="snippet-bar">
          <span>claude_desktop_config.json</span>
          <button class="copy-btn" data-target="snip-mcp">Copy</button>
        </div>
        <pre id="snip-mcp">{
  <span class="attr">"mcpServers"</span>: {
    <span class="val">"nba-stats"</span>: {
      <span class="attr">"command"</span>: <span class="val">"npx"</span>,
      <span class="attr">"args"</span>: [<span class="val">"mcp-remote"</span>, <span class="val">"https://nba-mdx-mcp.tonyjmartinez.workers.dev/mcp"</span>]
    }
  }
}</pre>
      </div>
    </div>
  </div>
</div>

<footer>
  NBA Stats Embeds &mdash; powered by <a href="https://anthropic.com" style="color:#6366f1;text-decoration:none;">Claude AI</a>
</footer>

<script>
(function () {
  // ── Pre-baked demo data (no API key needed to view the landing page) ──────

  var compareData = {
    player1: {
      name: "Stephen Curry", team: "Golden State Warriors", position: "PG",
      height: "6'2\"", weight: "185 lbs",
      stats: { ppg: 24.8, rpg: 4.7, apg: 6.4, fg_pct: 47.3, fg3_pct: 42.8, ft_pct: 90.9 }
    },
    player2: {
      name: "Klay Thompson", team: "Golden State Warriors", position: "SG",
      height: "6'6\"", weight: "215 lbs",
      stats: { ppg: 19.5, rpg: 3.5, apg: 2.3, fg_pct: 45.7, fg3_pct: 41.9, ft_pct: 84.6 }
    },
    season: "Career"
  };

  var leaderboardData = {
    title: "All-Time Three-Point Percentage Leaders (Min. 500 Attempts)",
    statLabel: "3P%",
    entries: [
      { rank: 1, name: "Stephen Curry",  team: "GSW",      value: 42.8 },
      { rank: 2, name: "Steve Nash",     team: "Multiple", value: 42.8 },
      { rank: 3, name: "Klay Thompson",  team: "GSW",      value: 41.9 },
      { rank: 4, name: "Joe Harris",     team: "Multiple", value: 41.5 },
      { rank: 5, name: "Mike Miller",    team: "Multiple", value: 40.9 }
    ]
  };

  var highlightData = {
    value: "42.8% Career 3P%",
    label: "The greatest three-point shooting percentage in NBA history among players with 500+ attempts",
    playerName: "Stephen Curry",
    color: "#FFC72C"
  };

  function embedUrl(component, data) {
    return "/embed?component=" + component + "&data=" + btoa(JSON.stringify(data));
  }

  document.getElementById("f-compare").src      = embedUrl("player-compare", compareData);
  document.getElementById("f-leaderboard").src  = embedUrl("leaderboard",    leaderboardData);
  document.getElementById("f-highlight").src    = embedUrl("stat-highlight", highlightData);

  // ── Auto-resize iframes on message from embed ─────────────────────────────
  window.addEventListener("message", function (e) {
    if (!e.data || e.data.type !== "nba-embed-resize") return;
    ["f-compare", "f-leaderboard", "f-highlight"].forEach(function (id) {
      var f = document.getElementById(id);
      if (f && f.contentWindow === e.source) f.height = e.data.height + 24;
    });
  });

  // ── Copy buttons ──────────────────────────────────────────────────────────
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.getElementById(btn.dataset.target);
      if (!target) return;
      navigator.clipboard.writeText(target.innerText).then(function () {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 2000);
      });
    });
  });
})();
</script>

</body>
</html>
`;
