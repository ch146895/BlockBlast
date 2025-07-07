// DOM Elements
const gridElement = document.getElementById('grid');
const shapeSelectionElement = document.getElementById('shape-selection');
const resetButton = document.getElementById('reset');
const helpButton = document.getElementById('help');
const endScreen = document.getElementById('end-screen');
const endMessage = document.getElementById('end-message');
const restartButton = document.getElementById('restart');
const shareButton = document.getElementById('share');
const helpModal = document.getElementById('help-modal');
const closeHelpButton = document.getElementById('close-help');
const levelUpElement = document.getElementById('level-up');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');

// Game configuration
const GRID_SIZE = 8;
const SHAPES_PER_ROUND = 4;
const LEVEL_THRESHOLD = 1000;

// Game state
let grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
let selectedShape = null;
let selectedColor = '';
let score = 0;
let highScore = localStorage.getItem('blockBlastHighScore') || 0;
let level = 1;
let gameActive = true;
let availableShapes = [];

// All possible shapes with their variations
const allShapes = [
    // 2x2 Square
    { shape: [[1, 1], [1, 1]], name: 'Square 2x2', id: 'Square-0', color: '#00BCD4' },

    // 3x3 Square
    { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], name: 'Square 3x3', id: 'Square-1', color: '#FFEB3B' },

    // 4-block Line (horizontal)
    { shape: [[1, 1, 1, 1]], name: 'Line 4', id: 'Line-0', color: '#8BC34A' },

    // 5-block Line (horizontal)
    { shape: [[1, 1, 1, 1, 1]], name: 'Line 5', id: 'Line-1', color: '#9C27B0' },

    // 4-block Line (vertical)
    { shape: [[1], [1], [1], [1]], name: 'Line 4 (Vertical)', id: 'Line-2', color: '#FF4081' },

    // 5-block Line (vertical)
    { shape: [[1], [1], [1], [1], [1]], name: 'Line 5 (Vertical)', id: 'Line-3', color: '#E040FB' },

    // L-shape (rotated variations)
    { shape: [[1, 1, 0], [1, 1, 1]], name: 'L-shape', id: 'L-0', color: '#FF5252' },
    { shape: [[1, 0], [1, 0], [1, 1]], name: 'L-shape rotated 90', id: 'L-1', color: '#4CAF50' },
    { shape: [[1, 1], [0, 1], [0, 1]], name: 'L-shape rotated 180', id: 'L-2', color: '#FF9800' },
    { shape: [[0, 1], [0, 1], [1, 1]], name: 'L-shape rotated 270', id: 'L-3', color: '#2196F3' },

    // T-shape (rotated variations)
    { shape: [[1, 1, 1], [0, 1, 0]], name: 'T-shape', id: 'T-0', color: '#9C27B0' },
    { shape: [[0, 1], [1, 1], [0, 1]], name: 'T-shape rotated 90', id: 'T-1', color: '#00BCD4' },
    { shape: [[0, 1, 0], [1, 1, 1]], name: 'T-shape rotated 180', id: 'T-2', color: '#E91E63' },
    { shape: [[1, 0], [1, 1], [1, 0]], name: 'T-shape rotated 270', id: 'T-3', color: '#FF4081' },

    // Z-shape (rotated variations)
    { shape: [[1, 1, 0], [0, 1, 1]], name: 'Z-shape', id: 'Z-0', color: '#4CAF50' },
    { shape: [[0, 1], [1, 1], [1, 0]], name: 'Z-shape rotated 90', id: 'Z-1', color: '#F44336' },

    // S-shape (rotated variations)
    { shape: [[0, 1, 1], [1, 1, 0]], name: 'S-shape', id: 'S-0', color: '#2E7D32' },
    { shape: [[1, 0], [1, 1], [0, 1]], name: 'S-shape rotated 90', id: 'S-1', color: '#03A9F4' },

    // Custom shapes
    { shape: [[1, 0, 1], [1, 1, 1]], name: 'U-shape', id: 'U-0', color: '#FFC107' },
    { shape: [[1, 1, 1], [1, 0, 1]], name: 'U-shape rotated', id: 'U-1', color: '#3F51B5' },
    { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], name: 'Diamond', id: 'Diamond-0', color: '#E91E63' },
    { shape: [[1, 0, 0], [1, 1, 0], [1, 1, 1]], name: 'Stair', id: 'Stair-0', color: '#FF9800' }
];

// Initialize the game
function initGame() {
    // Reset game state
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    score = 0;
    level = 1;
    gameActive = true;
    
    // Update displays
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
    
    // Create the grid
    createGrid();
    
    // Get initial shapes
    availableShapes = getRandomShapes();
    renderShapes();
    
    // Hide end screen if visible
    endScreen.classList.remove('active');
}

// Create the grid
function createGrid() {
    gridElement.innerHTML = '';
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            
            if (grid[row][col] && grid[row][col].color) {
                cellElement.style.backgroundColor = grid[row][col].color;
            }
            
            gridElement.appendChild(cellElement);
        }
    }
}

// Get random shapes
function getRandomShapes() {
    const shuffledShapes = [...allShapes].sort(() => 0.5 - Math.random());
    return shuffledShapes.slice(0, SHAPES_PER_ROUND);
}

// Render available shapes
function renderShapes() {
    shapeSelectionElement.innerHTML = '';
    
    availableShapes.forEach((shapeData) => {
        const shapeElement = document.createElement('div');
        shapeElement.className = 'shape';
        shapeElement.setAttribute('data-shape-id', shapeData.id);
        
        shapeElement.addEventListener('click', () => {
            if (gameActive) {
                // Deselect any previously selected shapes
                document.querySelectorAll('.shape.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Select this shape
                shapeElement.classList.add('selected');
                selectedShape = shapeData.shape;
                selectedColor = shapeData.color;
                
                // Clear any highlights on the grid
                clearHighlights();
            }
        });
        
        const preview = document.createElement('div');
        preview.className = 'shape-preview';
        
        // Create a visual representation of the shape
        const maxRows = 4;
        const maxCols = 4;
        
        for (let row = 0; row < maxRows; row++) {
            for (let col = 0; col < maxCols; col++) {
                const block = document.createElement('div');
                block.className = 'cell';
                
                if (shapeData.shape[row] && shapeData.shape[row][col]) {
                    block.style.backgroundColor = shapeData.color;
                }
                
                preview.appendChild(block);
            }
        }
        
        shapeElement.appendChild(preview);
        shapeSelectionElement.appendChild(shapeElement);
    });
}

// Clear all highlights from the grid
function clearHighlights() {
    document.querySelectorAll('.cell.highlight, .cell.temp-highlight').forEach(cell => {
        cell.classList.remove('highlight', 'temp-highlight');
    });
}

// Highlight cells for shape placement preview
function highlightPreview(startRow, startCol) {
    // Clear previous highlights
    clearHighlights();
    
    if (!selectedShape) return;
    
    let cellsToHighlight = [];
    let filledCellsToHighlight = [];
    let rowsToCheck = new Set();
    let colsToCheck = new Set();

    // Determine which cells to highlight based on the selected shape
    for (let row = 0; row < selectedShape.length; row++) {
        for (let col = 0; col < selectedShape[row].length; col++) {
            if (selectedShape[row][col]) {
                const newRow = startRow + row;
                const newCol = startCol + col;

                // Ensure we're within bounds
                if (newRow < GRID_SIZE && newCol < GRID_SIZE) {
                    const index = newRow * GRID_SIZE + newCol;
                    cellsToHighlight.push(index);
                    rowsToCheck.add(newRow);
                    colsToCheck.add(newCol);

                    // Check if the cell is already filled
                    if (grid[newRow][newCol] && grid[newRow][newCol].filled) {
                        filledCellsToHighlight.push(index);
                    }
                }
            }
        }
    }

    // Highlight the preview cells for the shape
    cellsToHighlight.forEach(index => {
        if (index >= 0 && index < gridElement.children.length) {
            gridElement.children[index].classList.add('highlight');
        }
    });

    // Highlight filled cells in red (conflict)
    filledCellsToHighlight.forEach(index => {
        if (index >= 0 && index < gridElement.children.length) {
            gridElement.children[index].classList.add('temp-highlight');
        }
    });

    // Check if any row is about to be completed
    rowsToCheck.forEach(row => {
        if (canCompleteRow(row, cellsToHighlight)) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const index = row * GRID_SIZE + col;
                gridElement.children[index].classList.add('highlight');
            }
        }
    });

    // Check if any column is about to be completed
    colsToCheck.forEach(col => {
        if (canCompleteCol(col, cellsToHighlight)) {
            for (let row = 0; row < GRID_SIZE; row++) {
                const index = row * GRID_SIZE + col;
                gridElement.children[index].classList.add('highlight');
            }
        }
    });
}

// Check if a row can be completed with current highlighted cells
function canCompleteRow(row, highlightedCells) {
    const rowCells = grid[row].map((cell, colIndex) => {
        const index = row * GRID_SIZE + colIndex;
        return (cell && cell.filled) || highlightedCells.includes(index);
    });
    
    return rowCells.every(cell => cell); // Return true if all cells in the row are filled
}

// Check if a column can be completed with current highlighted cells
function canCompleteCol(col, highlightedCells) {
    for (let row = 0; row < GRID_SIZE; row++) {
        const index = row * GRID_SIZE + col;
        if (!((grid[row][col] && grid[row][col].filled) || highlightedCells.includes(index))) {
            return false;
        }
    }
    return true;
}

// Check if shape can be placed
function canPlaceShape(shape, startRow, startCol) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newRow = startRow + row;
                const newCol = startCol + col;
                
                // Check if out of bounds
                if (newRow >= GRID_SIZE || newCol >= GRID_SIZE) {
                    return false;
                }
                
                // Check if cell is already filled
                if (grid[newRow][newCol] && grid[newRow][newCol].filled) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Place the shape in the grid
function placeShape(startRow, startCol) {
    if (!selectedShape || !canPlaceShape(selectedShape, startRow, startCol)) {
        return false;
    }
    
    // Place the shape on the grid
    for (let row = 0; row < selectedShape.length; row++) {
        for (let col = 0; col < selectedShape[row].length; col++) {
            if (selectedShape[row][col]) {
                grid[startRow + row][startCol + col] = { 
                    filled: true, 
                    color: selectedColor 
                };
            }
        }
    }
    
    // Calculate points for placing the shape
    const blockCount = selectedShape.flat().filter(Boolean).length;
    const basePoints = blockCount * 10;
    updateScore(basePoints);
    
    // Remove the used shape from available shapes
    availableShapes = availableShapes.filter(shape => shape.color !== selectedColor);
    
    // Refresh the grid display
    createGrid();
    
    // Check for completed rows and columns
    checkForClears();
    
    // Check if we need new shapes
    if (availableShapes.length === 0) {
        availableShapes = getRandomShapes();
    }
    
    // Render the updated shapes
    renderShapes();
    
    // Reset selection
    selectedShape = null;
    selectedColor = '';
    document.querySelectorAll('.shape.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Check if game can continue
    checkGameState();
    
    return true;
}

// Check for cleared rows and columns
function checkForClears() {
    let clearedRows = new Set();
    let clearedCols = new Set();
    
    // Check for completed rows
    for (let row = 0; row < GRID_SIZE; row++) {
        if (grid[row].every(cell => cell && cell.filled)) {
            clearedRows.add(row);
        }
    }
    
    // Check for completed columns
    for (let col = 0; col < GRID_SIZE; col++) {
        let isComplete = true;
        for (let row = 0; row < GRID_SIZE; row++) {
            if (!(grid[row][col] && grid[row][col].filled)) {
                isComplete = false;
                break;
            }
        }
        if (isComplete) {
            clearedCols.add(col);
        }
    }
    
    // Clear rows and columns if any were completed
    if (clearedRows.size > 0 || clearedCols.size > 0) {
        // Highlight the rows and columns that will be cleared
        highlightClearedLines(clearedRows, clearedCols);
        
        // Wait a moment to show the highlight before clearing
        setTimeout(() => {
            // Clear the rows
            clearedRows.forEach(row => {
                grid[row] = Array(GRID_SIZE).fill(0);
            });
            
            // Clear the columns
            clearedCols.forEach(col => {
                for (let row = 0; row < GRID_SIZE; row++) {
                    grid[row][col] = 0;
                }
            });
            
            // Calculate bonus points for cleared lines
            const linesCleared = clearedRows.size + clearedCols.size;
            const bonusPoints = linesCleared * 100;
            updateScore(bonusPoints);
            
            // Refresh the grid
            createGrid();
            
            // Check if level up
            checkLevelUp();
        }, 500);
    }
}

// Highlight rows and columns that will be cleared
function highlightClearedLines(rows, cols) {
    // Highlight rows
    rows.forEach(row => {
        for (let col = 0; col < GRID_SIZE; col++) {
            const index = row * GRID_SIZE + col;
            gridElement.children[index].classList.add('highlight');
        }
    });
    
    // Highlight columns
    cols.forEach(col => {
        for (let row = 0; row < GRID_SIZE; row++) {
            const index = row * GRID_SIZE + col;
            gridElement.children[index].classList.add('highlight');
        }
    });
}

// Update the score
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = `High Score: ${highScore}`;
        localStorage.setItem('blockBlastHighScore', highScore);
    }
}

// Check if player levels up
function checkLevelUp() {
    const newLevel = Math.floor(score / LEVEL_THRESHOLD) + 1;
    
    if (newLevel > level) {
        level = newLevel;
        showLevelUp();
    }
}

// Show level up animation
function showLevelUp() {
    levelUpElement.classList.add('active');
    
    setTimeout(() => {
        levelUpElement.classList.remove('active');
    }, 2000);
}

// Check if the game can continue
function checkGameState() {
    // Check if any shape can be placed anywhere on the grid
    let canContinue = false;
    
    for (const shapeData of availableShapes) {
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (canPlaceShape(shapeData.shape, row, col)) {
                    canContinue = true;
                    break;
                }
            }
            if (canContinue) break;
        }
        if (canContinue) break;
    }
    
    if (!canContinue) {
        endGame();
    }
}

// End the game
function endGame() {
    gameActive = false;
    endMessage.textContent = `Your Score: ${score}`;
    endScreen.classList.add('active');
}

// Event Listeners
gridElement.addEventListener('mouseover', (event) => {
    if (!gameActive || !selectedShape) return;
    
    const cell = event.target;
    if (!cell.classList.contains('cell')) return;
    
    const cellIndex = Array.from(gridElement.children).indexOf(cell);
    const startRow = Math.floor(cellIndex / GRID_SIZE);
    const startCol = cellIndex % GRID_SIZE;
    
    highlightPreview(startRow, startCol);
});

gridElement.addEventListener('mouseout', () => {
    if (!gameActive) return;
    clearHighlights();
});

gridElement.addEventListener('click', (event) => {
    if (!gameActive || !selectedShape) return;
    
    const cell = event.target;
    if (!cell.classList.contains('cell')) return;
    
    const cellIndex = Array.from(gridElement.children).indexOf(cell);
    const startRow = Math.floor(cellIndex / GRID_SIZE);
    const startCol = cellIndex % GRID_SIZE;
    
    placeShape(startRow, startCol);
});

// Reset button
resetButton.addEventListener('click', () => {
    initGame();
});

// Restart button on end screen
restartButton.addEventListener('click', () => {
    initGame();
});

// Share button
shareButton.addEventListener('click', () => {
    try {
        navigator.share({
            title: 'Block Blast',
            text: `I scored ${score} points in Block Blast! Can you beat my score?`
        });
    } catch (err) {
        alert(`I scored ${score} points in Block Blast!`);
    }
});

// Help button
helpButton.addEventListener('click', () => {
    helpModal.classList.add('active');
});

// Close help modal
closeHelpButton.addEventListener('click', () => {
    helpModal.classList.remove('active');
});

// Initialize the game when the page loads
window.addEventListener('load', () => {
    initGame();
});
