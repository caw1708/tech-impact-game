class Game {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 800;
        
        // Game constants
        this.BOARD_SIZE = 700;
        this.SQUARE_SIZE = 100;
        this.PLAYER_SIZE = 30;
        
        // Game state
        this.players = [];
        this.currentPlayer = 0;
        this.gameStarted = false;
        this.gameWon = false;
        this.currentQuestion = null;
        
        // Create board positions
        this.boardPositions = this.createBoardPositions();
        
        // Create ladders and wildcards
        this.ladders = [
            [2, 22],  // From position 2 to 22
            [4, 32],  // From position 4 to 32
            [24, 33]  // From position 24 to 33
        ];
        
        this.wildcardPositions = [8, 21, 35, 42]; // Positions of wildcard spaces
        
        // Questions data
        this.questions = {
            easy: [
                {
                    question: "How has remote work technology changed workplace dynamics?",
                    correct: "Increased flexibility but blurred work-life boundaries",
                    wrong: [
                        "Enhanced team collaboration but reduced individual productivity",
                        "Improved communication while increasing operational costs",
                        "Strengthened company culture but complicated project management"
                    ],
                    moves: 2
                }
            ],
            hard: [
                {
                    question: "How has quantum computing potential impacted current cryptography?",
                    correct: "Spurred development of quantum-resistant algorithms while raising security concerns",
                    wrong: [
                        "Enhanced encryption methods while obsoleting existing security systems",
                        "Accelerated cryptographic research while destabilizing current protocols",
                        "Improved computational security while increasing implementation costs"
                    ],
                    moves: 4
                }
            ]
        };
        
        // Start game loop
        this.gameLoop();
        
        // Add event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.setupPlayerSelection();
        this.setupWildcardButtons();
    }
    
    createBoardPositions() {
        const positions = [];
        const startX = 50;
        const startY = 700;
        const squareSize = 100;
        
        for (let row = 0; row < 7; row++) {
            const y = startY - (row * squareSize);
            
            if (row % 2 === 0) {
                // Left to right
                for (let col = 0; col < 7; col++) {
                    positions.push({
                        x: startX + (col * squareSize) + squareSize/2,
                        y: y + squareSize/2
                    });
                }
            } else {
                // Right to left
                for (let col = 6; col >= 0; col--) {
                    positions.push({
                        x: startX + (col * squareSize) + squareSize/2,
                        y: y + squareSize/2
                    });
                }
            }
        }
        
        return positions;
    }
    
    setupPlayerSelection() {
        const buttons = document.querySelectorAll('.player-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const players = parseInt(button.dataset.players);
                this.startGame(players);
            });
        });
    }
    
    setupWildcardButtons() {
        const acceptButton = document.querySelector('#wildcard-choice .accept');
        const skipButton = document.querySelector('#wildcard-choice .skip');
        
        acceptButton.addEventListener('click', () => this.handleWildcardChoice(true));
        skipButton.addEventListener('click', () => this.handleWildcardChoice(false));
    }
    
    startGame(playerCount) {
        const startPos = this.boardPositions[0];
        const playerColors = ['#000000', '#FF3232', '#32FF32', '#FFFF32'];
        
        this.players = Array(playerCount).fill().map((_, i) => ({
            position: {...startPos},
            targetPosition: {...startPos},
            boardPosition: 0,
            isMoving: false,
            isActive: false,
            color: playerColors[i]
        }));
        
        // Update UI
        const playerInfo = document.getElementById('player-info');
        playerInfo.innerHTML = `
            <h3>Player 1's Turn</h3>
            <p>Score: 1</p>
        `;
        
        this.currentPlayer = 0;
        this.gameStarted = true;
    }
    
    gameLoop() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.drawBoard();
        
        // Draw players
        this.drawPlayers();
        
        // Request next frame
        requestAnimationFrame(() => this.gameLoop());
    }
    
    drawBoard() {
        // Draw squares
        const startX = 50;
        const startY = 50;
        const squareSize = 100;
        
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const x = startX + (col * squareSize);
                const y = startY + (row * squareSize);
                
                // Draw square
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 1;
                this.ctx.fillRect(x, y, squareSize, squareSize);
                this.ctx.strokeRect(x, y, squareSize, squareSize);
                
                // Draw position number
                const position = row * 7 + (row % 2 === 0 ? col : 6 - col);
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(position + 1, x + squareSize/2, y + squareSize/2);
            }
        }
        
        // Draw ladders
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 5;
        for (const [start, end] of this.ladders) {
            const startPos = this.boardPositions[start];
            const endPos = this.boardPositions[end];
            this.ctx.beginPath();
            this.ctx.moveTo(startPos.x, startPos.y);
            this.ctx.lineTo(endPos.x, endPos.y);
            this.ctx.stroke();
        }
        
        // Draw wildcards
        this.ctx.fillStyle = '#FFD700';
        for (const position of this.wildcardPositions) {
            const pos = this.boardPositions[position];
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw "?" symbol
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('?', pos.x, pos.y);
        }
    }
    
    drawPlayers() {
        if (!this.gameStarted) return;
        
        this.players.forEach((player, index) => {
            // Update player position with animation
            if (player.isMoving) {
                const dx = player.targetPosition.x - player.position.x;
                const dy = player.targetPosition.y - player.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 5) {
                    player.position.x += dx * 0.1;
                    player.position.y += dy * 0.1;
                } else {
                    player.position = {...player.targetPosition};
                    player.isMoving = false;
                }
            }
            
            // Draw player
            this.ctx.fillStyle = player.color;
            this.ctx.beginPath();
            this.ctx.arc(player.position.x, player.position.y, this.PLAYER_SIZE, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw player border
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw player number
            this.ctx.fillStyle = player.color === '#000000' ? '#FFFFFF' : '#000000';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(index + 1, player.position.x, player.position.y);
        });
        
        // Draw current player indicator
        if (this.players.length > 0) {
            const currentPlayer = this.players[this.currentPlayer];
            this.ctx.strokeStyle = '#FF4081';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(currentPlayer.position.x, currentPlayer.position.y, this.PLAYER_SIZE + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    handleKeyPress(event) {
        if (!this.gameStarted || this.gameWon) return;
        
        switch (event.code) {
            case 'Space':
                this.handleSpacePress();
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
                const answer = parseInt(event.key) - 1;
                this.handleAnswerSelection(answer);
                break;
            case 'Escape':
                this.gameWon = true;
                break;
        }
    }
    
    handleSpacePress() {
        if (!this.gameStarted || this.players.length === 0) return;
        
        const player = this.players[this.currentPlayer];
        if (!player.isActive) {
            player.isActive = true;
            this.askQuestion();
        }
    }
    
    askQuestion(isWildcard = false) {
        const questions = isWildcard ? 
            Math.random() < 0.5 ? this.questions.easy : this.questions.hard :
            this.questions.easy;
            
        const question = questions[Math.floor(Math.random() * questions.length)];
        const options = [question.correct, ...question.wrong];
        this.shuffleArray(options);
        
        this.currentQuestion = {
            text: question.question,
            correct: question.correct,
            options: options,
            moves: question.moves
        };
        
        // Show question box
        const questionBox = document.getElementById('question-box');
        const questionText = document.getElementById('question-text');
        const answersDiv = document.getElementById('answers');
        const overlay = document.querySelector('.overlay');
        
        questionText.textContent = question.question;
        answersDiv.innerHTML = options.map((option, index) => `
            <button class="answer-button" onclick="game.handleAnswerSelection(${index})">
                ${index + 1}. ${option}
            </button>
        `).join('');
        
        overlay.classList.remove('hidden');
        questionBox.classList.remove('hidden');
    }
    
    handleAnswerSelection(answerIndex) {
        if (!this.currentQuestion) return;
        
        const selectedAnswer = this.currentQuestion.options[answerIndex];
        const isCorrect = selectedAnswer === this.currentQuestion.correct;
        
        // Visual feedback
        const buttons = document.querySelectorAll('.answer-button');
        buttons.forEach((button, index) => {
            if (index === answerIndex) {
                button.style.backgroundColor = isCorrect ? '#90EE90' : '#FFB6C6';
            }
            if (this.currentQuestion.options[index] === this.currentQuestion.correct) {
                button.style.backgroundColor = '#90EE90';
            }
            button.disabled = true;
        });
        
        // Wait for animation and move player
        setTimeout(() => {
            const moves = isCorrect ? this.currentQuestion.moves : -1;
            this.movePlayer(moves);
            
            // Hide question box
            document.getElementById('question-box').classList.add('hidden');
            document.querySelector('.overlay').classList.add('hidden');
            this.currentQuestion = null;
            
            // Check for wildcard
            if (this.checkWildcard()) {
                this.showWildcardChoice();
            } else {
                this.nextTurn();
            }
        }, 2000);
    }
    
    movePlayer(spaces) {
        const player = this.players[this.currentPlayer];
        let newPosition = player.boardPosition + spaces;
        
        // Keep within bounds
        if (newPosition < 0) newPosition = 0;
        if (newPosition >= this.boardPositions.length) {
            newPosition = this.boardPositions.length - 1;
            this.gameWon = true;
        }
        
        // Check for ladders
        for (const [start, end] of this.ladders) {
            if (newPosition === start) {
                newPosition = end;
                break;
            }
        }
        
        // Update player position
        player.boardPosition = newPosition;
        player.targetPosition = this.boardPositions[newPosition];
        player.isMoving = true;
        
        // Update score display
        const playerInfo = document.getElementById('player-info');
        playerInfo.innerHTML = `
            <h3>Player ${this.currentPlayer + 1}'s Turn</h3>
            <p>Score: ${newPosition + 1}</p>
        `;
    }
    
    checkWildcard() {
        const player = this.players[this.currentPlayer];
        return this.wildcardPositions.includes(player.boardPosition);
    }
    
    showWildcardChoice() {
        document.getElementById('wildcard-choice').classList.remove('hidden');
        document.querySelector('.overlay').classList.remove('hidden');
    }
    
    handleWildcardChoice(accepted) {
        document.getElementById('wildcard-choice').classList.add('hidden');
        
        if (accepted) {
            this.askQuestion(true);
        } else {
            document.querySelector('.overlay').classList.add('hidden');
            this.nextTurn();
        }
    }
    
    nextTurn() {
        const player = this.players[this.currentPlayer];
        player.isActive = false;
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// Start the game when the page loads
window.onload = () => {
    window.game = new Game();
}; 