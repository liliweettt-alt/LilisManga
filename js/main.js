/* ===== main.js =====
   Startup code and tab switching. Loaded LAST. */

document.addEventListener('DOMContentLoaded', () => {
    // Hook up the buttons FIRST, so they keep working even if something below fails
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('currentYear').innerText = new Date().getFullYear();
    document.getElementById('mangaForm').addEventListener('submit', handleFormSubmit);

    const stored = localStorage.getItem('mangaLibData_Orange');
    if (stored) {
        try {
            manga = JSON.parse(stored);
            ensureDataIntegrity();
            renderLibrary();
        } catch (err) {
            console.error('Could not load saved library:', err);
        }
    }
});

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`btn-${tab}`).classList.add('active');
    if(tab === 'dashboard') updateStats();
    if(tab === 'report') updateReport();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
