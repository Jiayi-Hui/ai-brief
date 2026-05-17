const container = document.getElementById('contentContainer');
const loading = document.querySelector('.loading');
let currentTab = 'brief';

// Tab switching
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    loadContent();
  });
});

async function loadContent() {
  loading.style.display = 'block';
  container.innerHTML = '';
  
  try {
    if (currentTab === 'brief') {
      await loadBriefs();
    } else {
      await loadTechNotes();
    }
  } catch (err) {
    container.innerHTML = '<div class="error">加载失败，请刷新重试</div>';
    console.error(err);
  } finally {
    loading.style.display = 'none';
  }
}

async function loadBriefs() {
  const response = await fetch('./briefs.json?t=' + Date.now());
  if (!response.ok) throw new Error('Failed to load briefs');
  const data = await response.json();
  
  if (!data.briefs || data.briefs.length === 0) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">~</div>暂无简报</div>';
    return;
  }

  renderBriefs(data.briefs);
}

function renderBriefs(briefs) {
  container.innerHTML = briefs.map(brief => {
    if (brief.theme) return renderThemeBrief(brief);
    if (brief.entries) return renderLegacyBrief(brief);
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
      
      ${brief.opening ? `<div class="opening">${formatBody(brief.opening)}</div>` : ''}
      
      <div class="sections">${sections}</div>
      
      ${brief.closing ? `<div class="closing">${formatBody(brief.closing)}</div>` : ''}
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
      <div class="entries">${entries}</div>
    </article>
  `;
}

async function loadTechNotes() {
  const response = await fetch('./tech-notes.json?t=' + Date.now());
  if (!response.ok) throw new Error('Failed to load tech notes');
  const data = await response.json();
  
  if (!data.notes || data.notes.length === 0) {
    container.innerHTML = '<div class="empty"><div class="empty-icon">~</div>暂无技术笔记</div>';
    return;
  }

  renderTechNotes(data.notes);
}

function renderTechNotes(notes) {
  container.innerHTML = notes.map(note => {
    const sections = (note.sections || []).map(s => `
      <div class="tech-section">
        <div class="tech-section-title">${escapeHtml(s.title)}</div>
        <div class="tech-section-body">${formatBody(s.body)}</div>
      </div>
    `).join('');

    const metaTags = [];
    if (note.status) metaTags.push(`<span class="tech-tag ${note.status}">${note.status === 'in-progress' ? '进行中' : '已完成'}</span>`);
    if (note.stack) metaTags.push(`<span class="tech-tag">${escapeHtml(note.stack)}</span>`);

    return `
      <article class="tech-card">
        <header class="tech-header">
          <div class="tech-date">${escapeHtml(note.date)}</div>
          <h2 class="tech-title">${escapeHtml(note.title)}</h2>
        </header>
        
        ${note.context ? `<div class="tech-context">${escapeHtml(note.context)}</div>` : ''}
        
        <div class="tech-sections">${sections}</div>
        
        ${note.next ? `
          <div class="tech-section" style="border-top:1px dashed var(--border);margin-top:8px;">
            <div class="tech-section-title">Next</div>
            <div class="tech-section-body">${escapeHtml(note.next)}</div>
          </div>
        ` : ''}
        
        ${metaTags.length ? `<div class="tech-meta">${metaTags.join('')}</div>` : ''}
      </article>
    `;
  }).join('');
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
loadContent();

// Auto-refresh every 5 minutes
setInterval(loadContent, 5 * 60 * 1000);
