/* ===== main.js =====
   Startup code and tab switching. Loaded LAST. */

document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('mangaLibData_Orange');
    if (stored) { 
        manga = JSON.parse(stored); 
        ensureDataIntegrity();
        renderLibrary(); 
    }
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('currentYear').innerText = new Date().getFullYear();
    document.getElementById('mangaForm').addEventListener('submit', handleFormSubmit);
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
