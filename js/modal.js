/* ===== modal.js =====
   The Add/Edit popup: form, stars, finish dates, save and delete. */

function toggleDateUI() {
    const isRead = document.getElementById('inpProgress').value === 'READ';
    document.getElementById('dateSection').classList.toggle('hidden', !isRead);
}

function addDate() {
    const d = document.getElementById('newDate').value;
    if(d) { tempDates.push(d); renderDateList(); document.getElementById('newDate').value = ''; }
}

function removeDate(idx) { tempDates.splice(idx, 1); renderDateList(); }

function renderDateList() {
    const container = document.getElementById('dateList');
    container.innerHTML = tempDates.map((d, i) => `
        <div class="flex justify-between items-center bg-[#2a2a2a] p-3 rounded-xl text-xs border border-[#333]">
            <span class="font-bold text-orange-400">${d}</span>
            <button type="button" onclick="removeDate(${i})" class="text-gray-500"><i class="fa-solid fa-circle-xmark"></i></button>
        </div>
    `).join('');
}

function setRatingUI(val) {
    document.getElementById('inpRating').value = val;
    const stars = document.getElementById('starContainer').children;
    for(let i=0; i<5; i++) {
        if(i < val) {
            stars[i].classList.remove('text-[#333]');
            stars[i].classList.add('text-amber-500');
        } else {
            stars[i].classList.remove('text-amber-500');
            stars[i].classList.add('text-[#333]');
        }
    }
}

function pickSuggestion(inputId, selectId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);
    const val = select.value;
    if(!val) return;

    let current = input.value.split(',').map(s => s.trim()).filter(s => s);
    if(!current.includes(val)) {
        current.push(val);
        input.value = current.join(', ');
    }
    select.value = ''; 
}

function openEditModal(id) {
    const m = manga.find(x => x.id === id || String(x.id) === String(id));
    if(!m) return;

    document.getElementById('editId').value = m.id;
    document.getElementById('inpName').value = m.name;
    document.getElementById('inpLink').value = m.link || '';
    document.getElementById('inpCover').value = m.coverUrl || '';
    document.getElementById('inpProgress').value = m.progress;
    document.getElementById('inpStatus').value = m.status;
    document.getElementById('inpCurrentChapter').value = m.currentChapter || '';
    document.getElementById('inpChapters').value = m.chapters || '';
    document.getElementById('inpSummary').value = m.summary || '';
    document.getElementById('inpNotes').value = m.notes || '';
    document.getElementById('inpTags').value = (m.tags || []).join(', ');

    setRatingUI(m.rating || 0);
    tempDates = m.finishedDates ? [...m.finishedDates] : [];

    renderDateList(); 
    toggleDateUI();

    document.getElementById('btnSubmitModal').innerText = "Save Changes";
    document.getElementById('btnDelete').classList.remove('hidden');
    document.getElementById('mangaModal').classList.remove('hidden');
}

function openAddModal() {
    document.getElementById('mangaForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('inpCover').value = '';
    setRatingUI(0);
    tempDates = []; 

    renderDateList(); 
    toggleDateUI();

    document.getElementById('btnSubmitModal').innerText = "Add to Library";
    document.getElementById('btnDelete').classList.add('hidden');
    document.getElementById('mangaModal').classList.remove('hidden');
}

function closeModal() { 
    document.getElementById('mangaModal').classList.add('hidden'); 
}

function handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;

    const existing = id ? manga.find(x => x.id === id || String(x.id) === String(id)) : null;

    const obj = {
        id: id || generateId(),
        name: document.getElementById('inpName').value,
        link: document.getElementById('inpLink').value,
        coverUrl: document.getElementById('inpCover').value,
        progress: document.getElementById('inpProgress').value,
        status: document.getElementById('inpStatus').value,
        currentChapter: parseInt(document.getElementById('inpCurrentChapter').value) || 0,
        chapters: parseInt(document.getElementById('inpChapters').value) || 0,
        rating: parseInt(document.getElementById('inpRating').value) || 0,
        summary: document.getElementById('inpSummary').value,
        notes: document.getElementById('inpNotes').value,
        pinned: existing ? existing.pinned : false,
        tags: document.getElementById('inpTags').value.split(',').map(t => t.trim()).filter(t => t),
        finishedDates: [...tempDates]
    };

    if(id) {
        const idx = manga.findIndex(x => x.id === id || String(x.id) === String(id));
        if (idx !== -1) {
            manga[idx] = obj;
        } else {
            manga.unshift(obj);
        }
    } else { 
        manga.unshift(obj); 
    }

    localStorage.setItem('mangaLibData_Orange', JSON.stringify(manga));
    renderLibrary(); 
    closeModal();
}

function deleteManga() {
    if(confirm("Delete this entry?")) {
        const id = document.getElementById('editId').value;
        manga = manga.filter(x => x.id !== id && String(x.id) !== String(id));
        localStorage.setItem('mangaLibData_Orange', JSON.stringify(manga));
        renderLibrary(); 
        closeModal();
    }
}
