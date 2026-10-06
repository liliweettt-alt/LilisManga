function populateFilterDropdowns() {
    const tagSet = new Set();
    manga.forEach(m => { (Array.isArray(m.tags) ? m.tags : []).forEach(t => tagSet.add(String(t).trim())); });
    const tags = Array.from(tagSet).sort((a,b) => a.localeCompare(b));

    const filterSelect = document.getElementById('filterTags');
    const currentFilter = filterSelect.value;
    filterSelect.innerHTML = `<option value="all">Tag: All</option>`;
    tags.forEach(t => { if(t) filterSelect.innerHTML += `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`; });
    if(tags.includes(currentFilter)) filterSelect.value = currentFilter;

    const helperSelect = document.getElementById('selTagsHelper');
    helperSelect.innerHTML = `<option value="">Select used...</option>`;
    tags.forEach(t => { if(t) helperSelect.innerHTML += `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`; });
}

function togglePin(id) {
    const m = manga.find(x => x.id === id);
    if(m) {
        m.pinned = !m.pinned;
        localStorage.setItem('mangaLibData_Orange', JSON.stringify(manga));
        renderLibrary();
    }
}

const PROGRESS_LABELS = { READING: 'Reading', TBR: 'To read', READ: 'Finished' };
const STATUS_LABELS = { WIP: 'Ongoing', COMPLETE: 'Complete' };

function toggleDetails(btn, id) {
    const panel = btn.closest('.manga-card').querySelector('.details-panel');
    const wasOpen = expandedCards.has(id);
    if (wasOpen) expandedCards.delete(id); else expandedCards.add(id);
    panel.hidden = wasOpen;
    btn.setAttribute('aria-expanded', String(!wasOpen));
    btn.setAttribute('aria-label', wasOpen ? 'Show summary and notes' : 'Hide summary and notes');
}

function buildCard(m) {
    const card = document.createElement('article');
    card.className = 'manga-card animate-in';

    const progressLabel = PROGRESS_LABELS[m.progress] || m.progress || '';
    const statusLabel = STATUS_LABELS[m.status] || m.status || '';
    const stateClass = m.progress === 'READING' ? 'meta-state reading' : 'meta-state';
    const stateHtml = `<span class="${stateClass}">${escapeHtml(progressLabel)}</span>`;
    const metaLeft = statusLabel ? `${stateHtml} · ${escapeHtml(statusLabel)}` : stateHtml;
    const rating = Math.max(0, Math.min(5, Math.round(Number(m.rating) || 0)));
    const ratingHtml = rating
        ? `<span class="card-stars" aria-label="${rating} of 5 stars">${'★'.repeat(rating)}<span class="off">${'★'.repeat(5 - rating)}</span></span>`
        : '';

    const coverHtml = m.coverUrl
        ? `<img src="${escapeHtml(m.coverUrl)}" loading="lazy" class="card-cover" alt="Cover">`
        : '';
    const tagsHtml = (Array.isArray(m.tags) && m.tags.length > 0)
        ? `<div class="card-tags">${m.tags.slice(0, 4).map(escapeHtml).join(' · ')}</div>`
        : '';

    const cur = Number(m.currentChapter) || 0;
    const total = Number(m.chapters) || 0;
    let progressHtml;
    if (cur && total) {
        const pct = Math.min(100, Math.round((cur / total) * 100));
        progressHtml = `<div class="progress-bar"><i style="width:${pct}%"></i></div>
                        <div class="ch-text">${cur} <b>/ ${total} ch</b></div>`;
    } else {
        progressHtml = `<div class="ch-text">${cur || total || 0} <b>ch</b></div>`;
    }

    const summary = (m.summary || '').trim();
    const notes = (m.notes || '').trim();
    const hasDetails = summary || notes;
    const isOpen = expandedCards.has(m.id);

    const toggleHtml = hasDetails
        ? `<button class="icon-btn toggle-btn" aria-expanded="${isOpen}" aria-label="${isOpen ? 'Hide' : 'Show'} summary and notes"><i class="fa-solid fa-chevron-down"></i></button>`
        : '';
    const summaryBlock = summary
        ? `<div><div class="detail-label">Summary</div><p class="detail-text">${escapeHtml(summary)}</p></div>`
        : '';
    const notesBlock = notes
        ? `<div><div class="detail-label">My notes</div><p class="detail-text notes-text">${escapeHtml(notes)}</p></div>`
        : '';
    const panelHtml = hasDetails
        ? `<div class="details-panel" ${isOpen ? '' : 'hidden'}>${summaryBlock}${notesBlock}</div>`
        : '';

    card.innerHTML = `
        <div class="card-row">
            ${coverHtml}
            <div class="card-body">
                <div class="card-top">
                    <h3 class="card-title">${escapeHtml(m.name)}</h3>
                    <button class="pin-btn ${m.pinned ? 'on' : ''}" aria-pressed="${!!m.pinned}" aria-label="${m.pinned ? 'Unpin' : 'Pin'}"><i class="fa-solid fa-thumbtack"></i></button>
                </div>
                <div class="card-meta"><span>${metaLeft}</span>${ratingHtml}</div>
                ${tagsHtml}
                <div class="card-bottom">
                    <div class="card-progress">${progressHtml}</div>
                    ${toggleHtml}
                    <button class="icon-btn open-btn" aria-label="Open link"><i class="fa-solid fa-link"></i></button>
                </div>
            </div>
        </div>
        ${panelHtml}
    `;

    // --- clicks (added with JavaScript instead of onclick="..." in the HTML)
    card.querySelector('.card-row').addEventListener('click', () => openEditModal(m.id));
    card.querySelector('.pin-btn').addEventListener('click', e => { e.stopPropagation(); togglePin(m.id); });
    card.querySelector('.open-btn').addEventListener('click', e => { e.stopPropagation(); openLink(m.link); });
    const toggleBtn = card.querySelector('.toggle-btn');
    if (toggleBtn) toggleBtn.addEventListener('click', e => { e.stopPropagation(); toggleDetails(toggleBtn, m.id); });

    return card;
}

function renderLibrary() {
    populateFilterDropdowns(); 

    const list = document.getElementById('mangaList');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const progF = document.getElementById('filterProgress').value;
    const statF = document.getElementById('filterStatus').value;
    const tagF = document.getElementById('filterTags').value;
    const sortOpt = document.getElementById('sortOption').value;

    let filtered = manga.filter(m => {
        const matchesSearch = (m.name || '').toLowerCase().includes(search) || (Array.isArray(m.tags) ? m.tags : []).join(' ').toLowerCase().includes(search) || (m.summary || '').toLowerCase().includes(search);
        const matchesProg = progF === 'all' ? true : (progF === 'PINNED' ? m.pinned : m.progress === progF);
        const matchesStat = statF === 'all' || m.status === statF;
        const matchesTag = tagF === 'all' || (Array.isArray(m.tags) && m.tags.includes(tagF));
        return matchesSearch && matchesProg && matchesStat && matchesTag;
    });

    filtered.sort((a, b) => {

        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

        if (sortOpt === 'az') return (a.name || '').localeCompare(b.name || '');
        if (sortOpt === 'chapters') return (b.chapters || 0) - (a.chapters || 0); 
        return 0; 
    });

    list.innerHTML = '';
    filtered.forEach(m => {
        try {
            list.appendChild(buildCard(m));
        } catch (err) {
            // If ONE title has odd data, show a small notice instead of breaking the whole list
            console.error('Could not draw card for:', m, err);
            const notice = document.createElement('div');
            notice.className = 'manga-card text-sm text-gray-400';
            notice.textContent = `Could not display "${m.name || 'Untitled'}". Press F12 and check the Console for details.`;
            list.appendChild(notice);
        }
    });

    if (filtered.length === 0) {
        list.innerHTML = `<p class="text-center text-gray-500 py-10">No titles match your criteria.</p>`;
    }
}

function openLink(link) {
    if(!link) return;
    if(link.startsWith('http')) window.open(link, '_blank');
    else window.open(`https://www.google.com/search?q=${encodeURIComponent(link)}`, '_blank');
}
