/* ===== settings.js =====
   The Config tab: export, import, wipe data, domain migrator. */

function migrateDomains() {
    const oldStr = document.getElementById('inpOldDomain').value;
    const newStr = document.getElementById('inpNewDomain').value;

    if(!oldStr || !newStr) {
        alert("Please enter both the old domain and the new domain.");
        return;
    }

    let count = 0;
    manga.forEach(m => {
        if(m.link && m.link.includes(oldStr)) {
            m.link = m.link.split(oldStr).join(newStr);
            count++;
        }
    });

    if(count > 0) {
        localStorage.setItem('mangaLibData_Orange', JSON.stringify(manga));
        renderLibrary();
        alert(`Successfully updated ${count} links!`);
        document.getElementById('inpOldDomain').value = '';
        document.getElementById('inpNewDomain').value = '';
    } else {
        alert("No matching links were found in your library.");
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            let importedManga = Array.isArray(data) ? data : (data.manga || []);

            importedManga = importedManga.map(m => ({...m, id: m.id || generateId()}));
            manga = importedManga; 

            localStorage.setItem('mangaLibData_Orange', JSON.stringify(manga));
            renderLibrary();

            alert(`Success! Imported ${manga.length} titles into your library.`);
            switchTab('library');

            document.getElementById('fileInput').value = '';

        } catch(err) { 
            alert("Error parsing JSON. Please make sure the file format is correct."); 
        }
    };
    reader.readAsText(file);
}

function exportData() {
    const blob = new Blob([JSON.stringify(manga, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mangalib_backup.json';
    a.click();
}

function clearData() { 
    if(confirm("Permanently wipe library? This cannot be undone.")) { 
        manga = []; 
        localStorage.removeItem('mangaLibData_Orange'); 
        renderLibrary(); 
        alert("Library cleared.");
    } 
}
