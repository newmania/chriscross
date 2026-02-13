let currentGrid = [];
let solution = [];
const gridSize = 10;
let currentLevelIndex = 0;
let isGameWon = false;

const levels = [
    {
        name: "Alex",
        image: "alex_square.JPG",
        quote: "Keep moving forward, one square at a time."
    },
    {
        name: "Christopher",
        image: "christopher_square.jpg",
        quote: "Precision is the key to every puzzle."
    },
    {
        name: "Sarah & Mike",
        image: "sarahmike_square.jpg",
        quote: "The best puzzles are the ones we solve together."
    }
];

async function processImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = gridSize;
            canvas.height = gridSize;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, gridSize, gridSize);
            const imageData = ctx.getImageData(0, 0, gridSize, gridSize).data;
            const grid = [];
            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
                grid.push(luminance < 128 ? 1 : 0);
            }
            const rows = [];
            for (let i = 0; i < gridSize; i++) {
                rows.push(grid.slice(i * gridSize, (i + 1) * gridSize));
            }
            resolve(rows);
        };
        img.src = url;
    });
}

function calculateHints(line) {
    const hints = [];
    let count = 0;
    for (const cell of line) {
        if (cell === 1) {
            count++;
        } else if (count > 0) {
            hints.push(count);
            count = 0;
        }
    }
    if (count > 0) hints.push(count);
    return hints.length > 0 ? hints : [0];
}

async function loadLevel(index) {
    if (index >= levels.length) {
        alert("Congratulations! You've completed all levels!");
        return;
    }
    
    currentLevelIndex = index;
    isGameWon = false;
    const level = levels[currentLevelIndex];
    
    // Reset UI
    const revealImg = document.getElementById('reveal-image');
    revealImg.classList.remove('visible');
    revealImg.src = ''; // Clear source for surprise
    document.getElementById('post-win-container').classList.add('hidden');
    document.getElementById('grid').style.opacity = '1';
    
    solution = await processImage(level.image);
    currentGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    renderGame();
}

function renderGame() {
    const gridEl = document.getElementById('grid');
    const rowHintsEl = document.getElementById('row-hints');
    const colHintsEl = document.getElementById('col-hints');

    gridEl.innerHTML = '';
    rowHintsEl.innerHTML = '';
    colHintsEl.innerHTML = '';

    // Render hints
    for (let i = 0; i < gridSize; i++) {
        // Row hints
        const rowHints = calculateHints(solution[i]);
        const rowBox = document.createElement('div');
        rowBox.className = 'hint-box';
        rowHints.forEach(h => {
            const span = document.createElement('span');
            span.className = 'hint';
            span.textContent = h;
            rowBox.appendChild(span);
        });
        rowHintsEl.appendChild(rowBox);

        // Column hints
        const col = solution.map(row => row[i]);
        const colHints = calculateHints(col);
        const colBox = document.createElement('div');
        colBox.className = 'hint-box';
        colHints.forEach(h => {
            const span = document.createElement('span');
            span.className = 'hint';
            span.textContent = h;
            colBox.appendChild(span);
        });
        colHintsEl.appendChild(colBox);
    }

    // Render cells
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (r === 4) cell.classList.add('row-marker'); // 5-cell marker
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            if (!isGameWon) {
                cell.addEventListener('click', (e) => toggleCell(r, c, cell));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    markCell(r, c, cell);
                });
            }
            
            if (currentGrid[r][c] === 1) cell.classList.add('filled');
            if (currentGrid[r][c] === -1) cell.classList.add('marked');
            gridEl.appendChild(cell);
        }
    }
}

function toggleCell(r, c, cellEl) {
    if (isGameWon) return;
    
    // If user clicks an empty cell that SHOULD be filled
    if (currentGrid[r][c] === 0 || currentGrid[r][c] === -1) {
        if (solution[r][c] === 1) {
            currentGrid[r][c] = 1;
            renderGame();
            checkWin();
        } else {
            // Mistake: show red X
            cellEl.classList.add('error');
            setTimeout(() => {
                cellEl.classList.remove('error');
            }, 1000);
        }
    } else if (currentGrid[r][c] === 1) {
        // Allow unfilling (optional, but standard)
        currentGrid[r][c] = 0;
        renderGame();
    }
}

function markCell(r, c, cellEl) {
    if (isGameWon) return;
    
    // Check if user is trying to mark a cell that SHOULD be filled
    if (currentGrid[r][c] === 0 && solution[r][c] === 1) {
        // Mistake: show heart error
        cellEl.classList.add('error');
        setTimeout(() => {
            cellEl.classList.remove('error');
        }, 1000);
        return;
    }

    if (currentGrid[r][c] === -1) {
        currentGrid[r][c] = 0;
    } else if (currentGrid[r][c] === 0) {
        currentGrid[r][c] = -1;
    }
    renderGame();
}

function checkWin() {
    let won = true;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const sol = solution[r][c];
            const curr = currentGrid[r][c] === 1 ? 1 : 0;
            if (sol !== curr) {
                won = false;
                break;
            }
        }
    }
    if (won) {
        handleWin();
    }
}

function handleWin() {
    isGameWon = true;
    const level = levels[currentLevelIndex];
    
    // Set image source ONLY now for the surprise
    const revealImg = document.getElementById('reveal-image');
    revealImg.src = level.image;
    revealImg.classList.add('visible');
    
    document.getElementById('quote').textContent = level.quote;
    document.getElementById('post-win-container').classList.remove('hidden');
    
    document.getElementById('grid').style.opacity = '0';
}

document.getElementById('next-level').addEventListener('click', () => {
    loadLevel(currentLevelIndex + 1);
});

document.getElementById('reset').addEventListener('click', () => {
    if (isGameWon) return;
    currentGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    renderGame();
});

// Initial load
loadLevel(0);
