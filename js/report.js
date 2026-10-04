/* ===== report.js =====
   The Log tab: reading history grouped by month. */

function updateReport() {
    const container = document.getElementById('reportContent');
    const allReads = [];
    manga.forEach(m => {
        if(m.finishedDates) m.finishedDates.forEach(d => allReads.push({ name: m.name, date: new Date(d) }));
    });
    if(!allReads.length) { container.innerHTML = '<p class="text-center text-gray-600 py-10">No history found.</p>'; return; }
    allReads.sort((a,b) => b.date - a.date);

    const months = {};
    allReads.forEach(r => {
        const m = r.date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if(!months[m]) months[m] = [];
        months[m].push(r);
    });

    container.innerHTML = '';
    Object.entries(months).forEach(([name, reads]) => {
        container.innerHTML += `
            <div class="bg-[#1a1a1a] rounded-3xl border border-[#333] overflow-hidden">
                <div class="bg-orange-500/10 px-6 py-3 text-[10px] font-black text-orange-500 uppercase tracking-widest">${name}</div>
                <div class="p-6 space-y-3">
                    ${reads.map(r => `<div class="flex justify-between items-center text-sm font-bold"><span>${escapeHtml(r.name)}</span><span class="text-gray-600 text-[10px] font-mono">${r.date.getDate()}</span></div>`).join('')}
                </div>
            </div>
        `;
    });
}
