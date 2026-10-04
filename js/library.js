/* ===== library.js =====
   The Books tab: filters, tags, pinning, drawing the manga cards. */

function populateFilterDropdowns() {
    const tagSet = new Set();
    manga.forEach(m => { (m.tags || []).forEach(t => tagSet.add(t.trim())); });
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

function renderLibrary() {
    populateFilterDropdowns(); 

    const list = document.getElementById('mangaList');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const progF = document.getElementById('filterProgress').value;
    const statF = document.getElementById('filterStatus').value;
    const tagF = document.getElementById('filterTags').value;
    const sortOpt = document.getElementById('sortOption').value;

    let filtered = manga.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search) || (m.tags || []).join(' ').toLowerCase().includes(search) || (m.summary || '').toLowerCase().includes(search);
        const matchesProg = progF === 'all' ? true : (progF === 'PINNED' ? m.pinned : m.progress === progF);
        const matchesStat = statF === 'all' || m.status === statF;
        const matchesTag = tagF === 'all' || (m.tags && m.tags.includes(tagF));
        return matchesSearch && matchesProg && matchesStat && matchesTag;
    });

    filtered.sort((a, b) => {

        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

        if (sortOpt === 'az') return a.name.localeCompare(b.name);
        if (sortOpt === 'chapters') return (b.chapters || 0) - (a.chapters || 0); 
        return 0; 
    });

    list.innerHTML = '';
    filtered.forEach(m => {
        const card = document.createElement('div');
        card.className = 'manga-card p-5 rounded-3xl animate-in flex flex-col relative';
        if(m.progress === 'READING') card.style.borderLeftColor = '#f59e0b';

        const safeName = escapeHtml(m.name);
        const safeSummary = escapeHtml(m.summary);

        const coverHtml = m.coverUrl ? `<img src="${escapeHtml(m.coverUrl)}" loading="lazy" class="w-[72px] h-[104px] object-cover rounded-lg shadow-md shrink-0 border border-white/5 bg-[#2a2a2a]" alt="Cover">` : '';
        const tagsHtml = (m.tags && m.tags.length > 0) ? `<div class="mt-2 flex flex-wrap gap-1">${m.tags.slice(0, 4).map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>` : '';
        const summaryHtml = m.summary ? `<p class="text-[11px] text-gray-400 italic mt-3 line-clamp-2 leading-relaxed">${safeSummary}</p>` : '';
        const ratingHtml = m.rating ? `<div class="mt-2 text-amber-500 text-[10px] tracking-widest">${'★'.repeat(m.rating)}${'<span class="text-gray-600">★</span>'.repeat(5-m.rating)}</div>` : '';

        const safeId = m.id.replace(/'/g, "\\'");

        let chText = '0';
        if (m.currentChapter && m.chapters) chText = `${m.currentChapter} / ${m.chapters}`;
        else if (m.currentChapter) chText = m.currentChapter;
        else if (m.chapters) chText = m.chapters;

        const pinClass = m.pinned ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500';

        card.innerHTML = `
            <div class="flex justify-between items-start cursor-pointer" onclick="openEditModal('${safeId}')">
                <div class="flex gap-4 flex-1 pr-3">
                    ${coverHtml}
                    <div>
                        <h3 class="font-extrabold text-xl text-white leading-tight mb-2 pr-6">${safeName}</h3>
                        <div class="flex flex-wrap gap-1.5">
                            <span class="badge-orange text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tighter">${m.status}</span>
                            <span class="text-[9px] bg-white/5 px-2 py-0.5 rounded font-bold text-gray-400 uppercase tracking-tighter">${m.progress}</span>
                        </div>
                        ${tagsHtml}
                        ${ratingHtml}
                    </div>
                </div>
                <div class="flex flex-col items-end gap-3 shrink-0">
                    <div class="flex gap-2">
                        <button onclick="event.stopPropagation(); togglePin('${safeId}')" class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${m.pinned ? 'bg-amber-500/10 text-amber-500' : 'bg-transparent text-gray-600 hover:bg-[#2a2a2a]'}"><i class="fa-solid fa-thumbtack"></i></button>
                        <button onclick="event.stopPropagation(); openLink('${m.link}')" class="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"><i class="fa-solid fa-link"></i></button>
                    </div>
                    <div class="text-right">
                        <span class="text-xl font-black text-white">${chText}</span>
                        <span class="text-[9px] text-gray-500 font-bold ml-0.5 tracking-widest">CH</span>
                    </div>
                </div>
            </div>
            <div onclick="openEditModal('${safeId}')" class="cursor-pointer">
                ${summaryHtml}
            </div>
        `;
        list.appendChild(card);
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
