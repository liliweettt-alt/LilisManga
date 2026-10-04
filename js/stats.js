/* ===== stats.js =====
   The Stats tab: numbers, yearly goal and charts. */

function updateStats() {

    document.getElementById('stat-total-works').innerText = manga.length;
    document.getElementById('stat-reading').innerText = manga.filter(m => m.progress === 'READING').length;
    document.getElementById('stat-finished').innerText = manga.filter(m => m.progress === 'READ').length;

    const ratedTitles = manga.filter(m => m.rating > 0);
    if (ratedTitles.length > 0) {
        const avg = ratedTitles.reduce((sum, m) => sum + parseInt(m.rating), 0) / ratedTitles.length;
        document.getElementById('stat-avg-rating').innerText = avg.toFixed(1);

        const topRated = ratedTitles.reduce((prev, current) => (parseInt(prev.rating) > parseInt(current.rating)) ? prev : current);
        document.getElementById('stat-top-rated').innerText = topRated.name;
    } else {
        document.getElementById('stat-avg-rating').innerText = '-';
        document.getElementById('stat-top-rated').innerText = 'None';
    }

    const finishedMonths = new Set();
    const currentYear = new Date().getFullYear();
    let finishedThisYear = 0;
    const monthlyCounts = new Array(12).fill(0);

    manga.forEach(m => {
        if(m.finishedDates) {
            m.finishedDates.forEach(d => {
                const date = new Date(d);
                finishedMonths.add(`${date.getFullYear()}-${date.getMonth()}`);

                if (date.getFullYear() === currentYear) {
                    finishedThisYear++;
                    monthlyCounts[date.getMonth()]++;
                }
            });
        }
    });

    let streak = 0;
    let currDate = new Date();
    let checkY = currDate.getFullYear();
    let checkM = currDate.getMonth();

    if (!finishedMonths.has(`${checkY}-${checkM}`)) {
        checkM--;
        if (checkM < 0) { checkM = 11; checkY--; }
    }

    while(finishedMonths.has(`${checkY}-${checkM}`)) {
        streak++;
        checkM--;
        if (checkM < 0) { checkM = 11; checkY--; }
    }
    document.getElementById('stat-streak').innerText = streak;

    document.getElementById('goalCount').innerText = finishedThisYear;
    document.getElementById('goalTotal').innerText = readingGoal;
    const percent = Math.min((finishedThisYear / readingGoal) * 100, 100);
    document.getElementById('goalBar').style.width = percent + '%';

    const counts = { 'READ': 0, 'READING': 0, 'TBR': 0 };
    manga.forEach(m => { if(counts[m.progress] !== undefined) counts[m.progress]++; });

    const ctxDoughnut = document.getElementById('chartProgress').getContext('2d');
    if(chartProgressInstance) chartProgressInstance.destroy();
    chartProgressInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Read', 'Reading', 'TBR'],
            datasets: [{ 
                data: [counts['READ'], counts['READING'], counts['TBR']], 
                backgroundColor: ['#f59e0b', '#4b5563', '#1f2937'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: { 
            responsive: true, maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { weight: 'bold' } } } },
            cutout: '70%'
        }
    });

    const ctxBar = document.getElementById('chartMonthly').getContext('2d');
    if(chartMonthlyInstance) chartMonthlyInstance.destroy();
    chartMonthlyInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Finished Titles',
                data: monthlyCounts,
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { stepSize: 1, color: '#9ca3af' } },
                x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 10 } } }
            }
        }
    });
}

function setGoal() {
    const g = prompt("Set yearly manga goal:", readingGoal);
    if(g && !isNaN(g) && parseInt(g) > 0) { 
        readingGoal = parseInt(g); 
        localStorage.setItem('mangaGoal', readingGoal); 
        updateStats(); 
    }
}
