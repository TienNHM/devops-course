<template>
  <div class="hero-code" aria-label="Ví dụ file compose.yaml của ứng dụng Club Management trong khóa học">
    <div class="bar">
      <span class="dot" /><span class="dot" /><span class="dot" />
      <span class="name">compose.yaml</span>
    </div>
    <pre class="cs"><code><span class="p">services</span>:
  <span class="p">backend</span>:
    <span class="p">build</span>: <span class="s">./backend</span>
    <span class="p">depends_on</span>:
      <span class="p">postgres</span>:
        <span class="p">condition</span>: <span class="k">service_healthy</span>
    <span class="p">restart</span>: <span class="s">unless-stopped</span>

  <span class="p">postgres</span>:
    <span class="p">image</span>: <span class="s">postgres:17-alpine</span>
    <span class="p">volumes</span>:
      - <span class="s">postgres-data:/var/lib/postgresql/data</span>
    <span class="p">healthcheck</span>:
      <span class="p">test</span>: [<span class="s">"CMD-SHELL"</span>, <span class="s">"pg_isready -U club"</span>]</code></pre>
    <ul class="meta">
      <li>Healthcheck · Buổi 14</li>
      <li>Volume · Buổi 12</li>
      <li>Compose · Buổi 13</li>
      <li>Restart policy · Buổi 14</li>
    </ul>
  </div>
</template>

<style scoped>
.hero-code {
  width: 100%;
  max-width: 480px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  box-shadow: var(--vp-shadow-3);
  overflow: hidden;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.6;
  text-align: left;
}
.bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.dot { width: 10px; height: 10px; border-radius: 50%; background: var(--vp-c-default-3); }
.name { margin-left: 8px; color: var(--vp-c-text-3); }
.cs { margin: 0; padding: 14px 16px; overflow-x: auto; color: var(--vp-c-text-1); }
.k { color: var(--vp-c-brand-1); font-weight: 600; }
.p { color: var(--vp-c-tip-1); }
.s { color: var(--vp-c-warning-1); }
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0 16px 14px;
  font-size: 11.5px;
}
.meta li {
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
}
</style>
