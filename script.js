const mazeContainer = document.getElementById('mazeContainer');
const rows = 20;
const cols = 20;
let maze = [];
let start = null;
let end = null;

// Create a maze grid
function createMaze() {
    mazeContainer.innerHTML = '';
    maze = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => toggleCell(r, c, cell));
            mazeContainer.appendChild(cell);
        }
    }
}

// Toggle between start, end, and wall cells
function toggleCell(r, c, cell) {
    if (cell.classList.contains('start')) {
        cell.classList.remove('start');
        start = null;
    } else if (cell.classList.contains('end')) {
        cell.classList.remove('end');
        end = null;
    } else if (start === null) {
        cell.classList.add('start');
        start = { r, c };
    } else if (end === null) {
        cell.classList.add('end');
        end = { r, c };
    } else {
        cell.classList.toggle('wall');
    }
}

// Generate a random maze with animation
document.getElementById('randomMaze').addEventListener('click', createRandomMaze);

async function createRandomMaze() {
    resetMaze();
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (Math.random() < 0.3) {
                maze[r][c] = 1; // 1 represents a wall
                const cell = mazeContainer.children[r * cols + c];
                cell.classList.add('wall');
                await sleep(10); // Add a small delay for animation
            }
        }
    }
}

// Sleep function for adding delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start pathfinding
document.getElementById('startPathfinding').addEventListener('click', () => {
    if (start && end) {
        const algorithm = document.getElementById('algorithmSelect').value;
        switch (algorithm) {
            case 'BFS':
                bfs(start, end, 'bfs');
                break;
            case 'DFS':
                dfs(start, end, 'dfs');
                break;
            case 'Dijkstra':
                dijkstra(start, end, 'dijkstra');
                break;
            case 'A*':
                aStar(start, end, 'a-star');
                break;
            default:
                alert('Unknown algorithm.');
        }
    } else {
        alert('Please select a start and end point.');
    }
});

// Reset the maze
document.getElementById('resetMaze').addEventListener('click', resetMaze);

function resetMaze() {
    createMaze();
    start = null;
    end = null;
}

// Automatic pathfinding (called when checkbox is toggled)
document.getElementById('automaticMode').addEventListener('change', async (e) => {
    if (e.target.checked) {
        await runAutomaticPathfinding();
    }
});

// Function to run automatic pathfinding
async function runAutomaticPathfinding() {
    resetMaze(); // Reset the maze
    createRandomMaze(); // Generate random walls
    
    // Randomly choose start and end points, ensure they're not walls
    const randomStart = getRandomEmptyCell();
    const randomEnd = getRandomEmptyCell();
    
    const startCell = mazeContainer.children[randomStart.r * cols + randomStart.c];
    const endCell = mazeContainer.children[randomEnd.r * cols + randomEnd.c];
    
    startCell.classList.add('start');
    endCell.classList.add('end');
    
    start = randomStart;
    end = randomEnd;

    const algorithm = document.getElementById('algorithmSelect').value;
    switch (algorithm) {
        case 'BFS':
            await bfs(start, end, 'bfs');
            break;
        case 'DFS':
            await dfs(start, end, 'dfs');
            break;
        case 'Dijkstra':
            await dijkstra(start, end, 'dijkstra');
            break;
        case 'A*':
            await aStar(start, end, 'a-star');
            break;
        default:
            alert('Unknown algorithm.');
    }
}

// Helper function to get a random empty cell (not a wall)
function getRandomEmptyCell() {
    let r, c;
    do {
        r = Math.floor(Math.random() * rows);
        c = Math.floor(Math.random() * cols);
    } while (maze[r][c] === 1); // Keep generating until we get an empty cell
    return { r, c };
}

// Breadth-First Search (BFS) algorithm with animation
async function bfs(start, end, algorithm) {
    const queue = [start];
    const visited = new Set();
    const parentMap = {};
    visited.add(`${start.r},${start.c}`);

    while (queue.length > 0) {
        const { r, c } = queue.shift();

        if (r === end.r && c === end.c) {
            await tracePath(parentMap, start, end, algorithm);
            return;
        }

        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`) && maze[nr][nc] === 0) {
                queue.push({ r: nr, c: nc });
                visited.add(`${nr},${nc}`);
                parentMap[`${nr},${nc}`] = `${r},${c}`;
                if (nr !== end.r || nc !== end.c) {
                    mazeContainer.children[nr * cols + nc].classList.add('visited');
                    await sleep(20); // Add delay for visualization
                }
            }
        }
    }
    alert('No path found!');
}

// Depth-First Search (DFS) algorithm with animation
async function dfs(start, end, algorithm) {
    const stack = [start];
    const visited = new Set();
    const parentMap = {};
    visited.add(`${start.r},${start.c}`);

    while (stack.length > 0) {
        const { r, c } = stack.pop();

        if (r === end.r && c === end.c) {
            await tracePath(parentMap, start, end, algorithm);
            return;
        }

        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`) && maze[nr][nc] === 0) {
                stack.push({ r: nr, c: nc });
                visited.add(`${nr},${nc}`);
                parentMap[`${nr},${nc}`] = `${r},${c}`;
                if (nr !== end.r || nc !== end.c) {
                    mazeContainer.children[nr * cols + nc].classList.add('visited');
                    await sleep(20); // Add delay for visualization
                }
            }
        }
    }
    alert('No path found!');
}

// Dijkstra's algorithm with animation
async function dijkstra(start, end, algorithm) {
    const distances = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const queue = [{ ...start, dist: 0 }];
    distances[start.r][start.c] = 0;
    const visited = new Set();
    const parentMap = {};

    while (queue.length > 0) {
        queue.sort((a, b) => a.dist - b.dist);
        const { r, c } = queue.shift();

        if (visited.has(`${r},${c}`)) continue;
        visited.add(`${r},${c}`);

        if (r === end.r && c === end.c) {
            await tracePath(parentMap, start, end, algorithm);
            return;
        }

        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`) && maze[nr][nc] === 0) {
                const newDist = distances[r][c] + 1;
                if (newDist < distances[nr][nc]) {
                    distances[nr][nc] = newDist;
                    queue.push({ r: nr, c: nc, dist: newDist });
                    parentMap[`${nr},${nc}`] = `${r},${c}`;
                    if (nr !== end.r || nc !== end.c) {
                        mazeContainer.children[nr * cols + nc].classList.add('visited');
                        await sleep(20); // Add delay for visualization
                    }
                }
            }
        }
    }
    alert('No path found!');
}

// A* algorithm with animation
async function aStar(start, end, algorithm) {
    const openList = [{ ...start, f: 0 }];
    const gCosts = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const parentMap = {};
    const heuristic = (r, c) => Math.abs(r - end.r) + Math.abs(c - end.c); // Manhattan distance
    gCosts[start.r][start.c] = 0;

    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const { r, c, f } = openList.shift();

        if (r === end.r && c === end.c) {
            await tracePath(parentMap, start, end, algorithm);
            return;
        }

        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && maze[nr][nc] === 0) {
                const tentativeG = gCosts[r][c] + 1;
                if (tentativeG < gCosts[nr][nc]) {
                    gCosts[nr][nc] = tentativeG;
                    const f = tentativeG + heuristic(nr, nc);
                    openList.push({ r: nr, c: nc, f });
                    parentMap[`${nr},${nc}`] = `${r},${c}`;
                    if (nr !== end.r || nc !== end.c) {
                        mazeContainer.children[nr * cols + nc].classList.add('visited');
                        await sleep(20); // Add delay for visualization
                    }
                }
            }
        }
    }
    alert('No path found!');
}

// Update the tracePath animation for smoother path drawing
async function tracePath(parentMap, start, end, algorithm) {
    let current = `${end.r},${end.c}`;
    const pathClass = `path-${algorithm}`;
    const path = [];

    while (current) {
        path.unshift(current);
        current = parentMap[current];
    }

    for (const coord of path) {
        const [r, c] = coord.split(',').map(Number);
        const cell = mazeContainer.children[r * cols + c];
        cell.classList.add(pathClass);
        await sleep(50); // Add delay for path tracing animation
    }
}

createMaze();
