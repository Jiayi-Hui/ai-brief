const API_URL = './briefs.json';

const container = document.getElementById('briefs-container');
const loading = document.getElementById('loading');

async function loadBriefs() {
  try {
    const response = await fetch(API_URL + '?t=' + Date.now());
    if (!response.ok) throw new Error('Failed to load');
    const data = await response.json();
    
    if (!data.briefs || data.briefs.length === 0) {
      container.innerHTML = '<div class="no-briefs">暂无简报</div>';
      return;
    }

    renderBriefs(data.briefs);
  } catch (err) {
    container.innerHTML = '<div class="error">加载失败，请刷新重试</div>';
    console.error(err);
  } finally {
    loading.style.display = 'none';
  }
}

function renderBriefs(briefs) {
  container.innerHTML = briefs.map(brief => {
    // v3 theme-based structure
    if (brief.theme) {
      return renderThemeBrief(brief);
    }
    // v2 legacy fallback
    if (brief.entries) {
      return renderLegacyBrief(brief);
    }
    return '';
  }).join('');
}

function renderThemeBrief(brief) {
  const sections = (brief.sections || []).map(section => `
    <div class="section">
      <div class="section-subtitle">${escapeHtml(section.subtitle)}</div>
      <div class="section-body">${formatBody(section.body)}</div>
    </div>
  `).join('');

  return `
    <article class="brief-card">
      <header class="brief-header">
        <div class="brief-date">${escapeHtml(brief.date)}</div>
        <h2 class="brief-theme">${escapeHtml(brief.theme)}</h2>
      </header>
      
      ${brief.opening ? `
        <div class="opening">
          ${formatBody(brief.opening)}
        </div>
      ` : ''}
      
      <div class="sections">
        ${sections}
      </div>
      
      ${brief.closing ? `
        <div class="closing">
          ${formatBody(brief.closing)}
        </div>
      ` : ''}
    </article>
  `;
}

function renderLegacyBrief(brief) {
  const entries = brief.entries.map(entry => `
    <div class="entry">
      <div class="entry-title">${escapeHtml(entry.title)}</div>
      <div class="entry-body">${formatBody(entry.body)}</div>
    </div>
  `).join('');

  return `
    <article class="brief-card">
      <header class="brief-header">
        <div class="brief-date">${escapeHtml(brief.date)}</div>
        <h2 class="brief-theme">Anna每日认知切片</h2>
      </header>
      <div class="entries">
        ${entries}
      </div>
    </article>
  `;
}

function formatBody(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/\n/g, '<br>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load on page load
loadBriefs();

// Auto-refresh every 5 minutes
setInterval(loadBriefs, 5 * 60 * 1000);
