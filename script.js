// Game state
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let seconds = 0;
let timerInterval = null;
let isProcessing = false;

// Card icons - fruits, animals, and flowers
const cardIcons = [
    '🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍑', '🍒', '🍉', '🍍',  // Fruits
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',  // Animals
    '🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🏵️', '🌿', '🍀'   // Flowers
];

// DOM elements
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timeDisplay = document.getElementById('time');
const newGameBtn = document.getElementById('new-game-btn');
const gridSizeSelect = document.getElementById('grid-size');
const victoryScreen = document.getElementById('victory-screen');
const finalMovesDisplay = document.getElementById('final-moves');
const finalTimeDisplay = document.getElementById('final-time');
const playAgainBtn = document.getElementById('play-again-btn');

// Initialize game
function initGame() {
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    isProcessing = false;

    // Update displays
    movesDisplay.textContent = '0';
    timeDisplay.textContent = '0:00';

    // Stop timer if running
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Hide victory screen
    victoryScreen.classList.add('hidden');

    // Get grid size
    const gridSize = parseInt(gridSizeSelect.value);
    const numPairs = gridSize / 2;

    // Create card pairs
    const selectedIcons = cardIcons.slice(0, numPairs);
    const cardPairs = [...selectedIcons, ...selectedIcons];

    // Shuffle cards
    shuffleArray(cardPairs);

    // Clear game board
    gameBoard.innerHTML = '';

    // Update grid class
    gameBoard.className = 'game-board';
    gameBoard.classList.add(`grid-${gridSize}`);

    // Create card elements
    cardPairs.forEach((icon, index) => {
        const card = createCard(icon, index);
        cards.push(card);
        gameBoard.appendChild(card.element);
    });
}

// Create a card element
function createCard(icon, index) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.index = index;
    cardElement.setAttribute('role', 'button');
    cardElement.setAttribute('tabindex', '0');
    cardElement.setAttribute('aria-label', `Card ${index + 1}, hidden`);

    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.textContent = '?';

    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    const cardIcon = document.createElement('span');
    cardIcon.className = 'card-icon';
    cardIcon.textContent = icon;
    cardBack.appendChild(cardIcon);

    cardElement.appendChild(cardFront);
    cardElement.appendChild(cardBack);

    cardElement.addEventListener('click', () => handleCardClick(index));
    
    // Add keyboard support
    cardElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(index);
        }
    });

    return {
        element: cardElement,
        icon: icon,
        isFlipped: false,
        isMatched: false
    };
}

// Handle card click
function handleCardClick(index) {
    const card = cards[index];

    // Ignore if processing, card already flipped, or card already matched
    if (isProcessing || card.isFlipped || card.isMatched) {
        return;
    }

    // Start timer on first click
    if (!timerInterval && moves === 0) {
        startTimer();
    }

    // Flip the card
    flipCard(index);

    // Add to flipped cards
    flippedCards.push(index);

    // Check if two cards are flipped
    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        movesDisplay.textContent = moves;

        // Check for match
        const [firstIndex, secondIndex] = flippedCards;
        const firstCard = cards[firstIndex];
        const secondCard = cards[secondIndex];

        if (firstCard.icon === secondCard.icon) {
            // Match found
            setTimeout(() => {
                markAsMatched(firstIndex);
                markAsMatched(secondIndex);
                matchedPairs++;

                // Check if game is won
                if (matchedPairs === cards.length / 2) {
                    setTimeout(() => {
                        endGame();
                    }, 500);
                }

                flippedCards = [];
                isProcessing = false;
            }, 600);
        } else {
            // No match
            setTimeout(() => {
                unflipCard(firstIndex);
                unflipCard(secondIndex);
                flippedCards = [];
                isProcessing = false;
            }, 1000);
        }
    }
}

// Flip a card
function flipCard(index) {
    const card = cards[index];
    card.element.classList.add('flipped');
    card.isFlipped = true;
    card.element.setAttribute('aria-label', `Card ${index + 1}, showing ${getIconName(card.icon)}`);
}

// Unflip a card
function unflipCard(index) {
    const card = cards[index];
    card.element.classList.remove('flipped');
    card.isFlipped = false;
    card.element.setAttribute('aria-label', `Card ${index + 1}, hidden`);
}

// Mark card as matched
function markAsMatched(index) {
    const card = cards[index];
    card.element.classList.add('matched');
    card.isMatched = true;
    card.element.setAttribute('aria-label', `Card ${index + 1}, matched ${getIconName(card.icon)}`);
    card.element.setAttribute('tabindex', '-1');
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        updateTimeDisplay();
    }, 1000);
}

// Update time display
function updateTimeDisplay() {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
    timeDisplay.textContent = timeString;
}

// End game
function endGame() {
    // Stop timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Update final stats
    finalMovesDisplay.textContent = moves;
    finalTimeDisplay.textContent = timeDisplay.textContent;

    // Show victory screen
    victoryScreen.classList.remove('hidden');
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Get icon name for accessibility
function getIconName(icon) {
    const iconNames = {
        '🍎': 'apple',
        '🍊': 'orange',
        '🍋': 'lemon',
        '🍌': 'banana',
        '🍇': 'grapes',
        '🍓': 'strawberry',
        '🍑': 'peach',
        '🍒': 'cherry',
        '🍉': 'watermelon',
        '🍍': 'pineapple',
        '🐶': 'dog',
        '🐱': 'cat',
        '🐭': 'mouse',
        '🐹': 'hamster',
        '🐰': 'rabbit',
        '🦊': 'fox',
        '🐻': 'bear',
        '🐼': 'panda',
        '🐨': 'koala',
        '🐯': 'tiger',
        '🌸': 'cherry blossom',
        '🌺': 'hibiscus',
        '🌻': 'sunflower',
        '🌷': 'tulip',
        '🌹': 'rose',
        '💐': 'bouquet',
        '🌼': 'blossom',
        '🏵️': 'rosette',
        '🌿': 'herb',
        '🍀': 'clover'
    };
    return iconNames[icon] || 'icon';
}

// Event listeners
newGameBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);
gridSizeSelect.addEventListener('change', initGame);

// Initialize game on page load
initGame();
