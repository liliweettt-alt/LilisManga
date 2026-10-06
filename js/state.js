let manga = [];
let tempDates = [];
let chartProgressInstance = null;
let chartMonthlyInstance = null;
let readingGoal = localStorage.getItem('mangaGoal') || 20;
let expandedCards = new Set();
