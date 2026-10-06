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
    const input = e.target;
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        // Always reset the picker, so choosing the SAME file again still works
        input.value = '';

        // Step 1: read the file
        let importedManga;
        try {
            const data = JSON.parse(ev.target.result);
            importedManga = Array.isArray(data) ? data : (data.manga || []);
        } catch (err) {
            alert("Error parsing JSON. Please make sure the file format is correct.");
            return;
        }

        importedManga = importedManga
            .filter(m => m && typeof m === 'object')
            .map(m => ({...m, id: m.id || generateId()}));

        if (importedManga.length === 0) {
            alert("No titles were found in that file.");
            return;
        }

        // Step 2: save it
        manga = importedManga;
        localStorage.setItem('mangaLibData_Orange', JSON.stringify(manga));

        // Step 3: show it (a problem here is logged, not hidden behind a wrong message)
        try {
            renderLibrary();
        } catch (err) {
            console.error('Imported, but could not draw the library:', err);
        }

        alert(`Success! Imported ${manga.length} titles into your library.`);
        switchTab('library');
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
