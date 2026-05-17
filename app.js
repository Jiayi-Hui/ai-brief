(async function() {
  const container = document.getElementById('briefsContainer');
  const dateNav = document.getElementById('dateNav');

  let allBriefs = [];
  let activeDate = 'all';

  async function load() {
    try {
      const res = await fetch('briefs.json?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to load');
      allBriefs = await res.json();
      render();
    } catch (e) {
      container.innerHTML = `
        <div class="empty">
          <div class="empty-icon">(!)</div>
          <p>数据加载失败，请稍后刷新</p>
        </div>
      `;
      console.error(e);
    }
  }

  function renderNav() {
    const dates = allBriefs.map(b => b.date);
    const chips = dates.slice(0, 14);

    dateNav.innerHTML = `
      <button class="date-chip ${activeDate === 'all' ? 'active' : ''}" data-date="all">全部</button>
      ${chips.map(d => `
        <button class="date-chip ${activeDate === d ? 'active' : ''}" data-date="${d}">${d.slice(5)}</button>
      `).join('')}
    `;

    dateNav.querySelectorAll('.date-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeDate = btn.dataset.date;
        render();
      });
    });
  }

  function renderBriefs() {
    const filtered = activeDate === 'all'
      ? allBriefs
      : allBriefs.filter(b => b.date === activeDate);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty">
          <div class="empty-icon">(...)</div>
          <p>暂无简报数据</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(brief => `
      <article class="brief-card" data-date="${brief.date}">
        <div class="brief-date">${brief.date}</div>
        ${brief.entries.map(entry => `
          <section class="entry">
            <h3>${escapeHtml(entry.title)}</h3>
            <div class="entry-body">${escapeHtml(entry.body).replace(/\n/g, '<br>')}</div>
          </section>
        `).join('')}
      </article>
    `).join('');
  }

  function render() {
    renderNav();
    renderBriefs();
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  setInterval(load, 5 * 60 * 1000);

  await load();
})();
