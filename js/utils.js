/* ===== utils.js =====
   Small helper functions used by other files. */

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function ensureDataIntegrity() {
    let changed = false;
    manga.forEach(m => {
        if (!m.id) {
            m.id = generateId();
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('mangaLibData_Orange', JSON.stringify(manga));
    }
}
