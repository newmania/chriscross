let currentGrid = [];
let solution = [];
const gridSize = 10;

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

async function loadLevel(imgUrl) {
    solution = await processImage(imgUrl);
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
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.addEventListener('click', (e) => toggleCell(r, c, e));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                markCell(r, c);
            });
            if (currentGrid[r][c] === 1) cell.classList.add('filled');
            if (currentGrid[r][c] === -1) cell.classList.add('marked');
            gridEl.appendChild(cell);
        }
    }
}

function toggleCell(r, c, e) {
    if (currentGrid[r][c] === 1) {
        currentGrid[r][c] = 0;
    } else {
        currentGrid[r][c] = 1;
    }
    renderGame();
}

function markCell(r, c) {
    if (currentGrid[r][c] === -1) {
        currentGrid[r][c] = 0;
    } else {
        currentGrid[r][c] = -1;
    }
    renderGame();
}

document.getElementById('check-win').addEventListener('click', () => {
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
    alert(won ? "You Won!" : "Keep trying!");
});

document.getElementById('reset').addEventListener('click', () => {
    currentGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    renderGame();
});

// Initial load
loadLevel('alex_square.JPG');
