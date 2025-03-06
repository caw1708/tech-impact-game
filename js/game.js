class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 1000;
        this.canvas.height = 1000;
        
        // Constants
        this.BOARD_SIZE = 800;
        this.SPACE_SIZE = 40;
        this.PLAYER_SIZE = 25;
        
        // Colors
        this.colors = {
            WHITE: '#FFFFFF',
            BLACK: '#000000',
            RED: '#FF3232',
            GREEN: '#32FF32',
            YELLOW: '#FFFF32',
            BOARD_BORDER: '#B40000',
            LADDER_COLOR: '#C86400',
            HIGHLIGHT_COLOR: '#FFD700',
            WINNER_GREEN: '#64FF96',
            WILDCARD_COLOR: '#FFD700'
        };
        
        // Game state
        this.boardPositions = this.createBoardPositions();
        this.ladders = this.createLadders();
        this.wildcardPositions = this.createWildcardPositions();
        this.currentPlayer = 0;
        this.players = [];
        this.gameWon = false;
        
        // Load assets
        this.loadAssets().then(() => {
            this.init();
        });
        
        // Event listeners
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
    }
    
    async loadAssets() {
        // Load pawn images
        this.pawnBlack = await this.loadImage('assets/pawn_black.png');
        this.pawnWhite = await this.loadImage('assets/pawn_white.png');
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    init() {
        // Initialize players
        this.selectPlayerCount();
    }
    
    selectPlayerCount() {
        // Create player selection UI with styled buttons
        const playerInfo = document.getElementById('player-info');
        playerInfo.style.pointerEvents = 'auto';  // Make buttons clickable
        playerInfo.innerHTML = `
            <h3>Select Number of Players</h3>
            <div class="player-select" style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="game.setPlayerCount(2)" style="padding: 10px 20px; border-radius: 5px; cursor: pointer;">2 Players</button>
                <button onclick="game.setPlayerCount(3)" style="padding: 10px 20px; border-radius: 5px; cursor: pointer;">3 Players</button>
                <button onclick="game.setPlayerCount(4)" style="padding: 10px 20px; border-radius: 5px; cursor: pointer;">4 Players</button>
            </div>
        `;
    }
    
    setPlayerCount(count) {
        // Create players
        const startPos = this.boardPositions[0];
        const playerColors = ['#000000', '#FFFF32', '#32FF32', '#FF3232'];
        
        this.players = Array(count).fill().map((_, i) => ({
            color: playerColors[i],
            position: {...startPos},
            targetPosition: {...startPos},
            isActive: false,
            score: 0,
            boardPosition: 0,
            isMoving: false,
            pawnType: i % 2 === 0 ? 'black' : 'white'
        }));
        
        // Start game loop
        this.gameLoop();
    }
    
    createBoardPositions() {
        const positions = [];
        const marginX = 150;
        const marginY = 150;
        const spacing = 100;
        
        // Create 7x7 grid
        for (let row = 6; row >= 0; row--) {
            const colRange = row % 2 === 0 ? 
                Array.from({length: 7}, (_, i) => i) : 
                Array.from({length: 7}, (_, i) => 6 - i);
            
            for (const col of colRange) {
                positions.push({
                    x: marginX + col * spacing,
                    y: marginY + row * spacing
                });
            }
        }
        
        return positions;
    }
    
    createLadders() {
        // Similar to Python version but adapted for JavaScript
        const ladders = [];
        const usedPositions = new Set();
        const targetRows = [[1, 2], [4, 5]];
        
        for (const [startRow, endRow] of targetRows) {
            let attempts = 0;
            let validLadder = false;
            
            while (!validLadder && attempts < 20) {
                const start = startRow * 7 + Math.floor(Math.random() * 7);
                const end = endRow * 7 + Math.floor(Math.random() * 7);
                
                if (!usedPositions.has(start) && !usedPositions.has(end)) {
                    usedPositions.add(start);
                    usedPositions.add(end);
                    ladders.push([start, end]);
                    validLadder = true;
                }
                
                attempts++;
            }
        }
        
        return ladders;
    }
    
    createWildcardPositions() {
        // Similar to Python version but adapted for JavaScript
        const usedPositions = new Set(
            this.ladders.flatMap(([start, end]) => [start, end])
        );
        
        const possiblePositions = [];
        for (let i = 7; i < this.boardPositions.length - 7; i++) {
            if (!usedPositions.has(i)) {
                const row = Math.floor(i / 7);
                if (row >= 1 && row <= 5) {
                    possiblePositions.push(i);
                }
            }
        }
        
        // Randomly select 4 positions
        return this.shuffleArray(possiblePositions).slice(0, 4);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update player positions
        for (const player of this.players) {
            if (player.isMoving) {
                const dx = player.targetPosition.x - player.position.x;
                const dy = player.targetPosition.y - player.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 10) {
                    player.position = {...player.targetPosition};
                    player.isMoving = false;
                } else {
                    const moveRatio = 10 / distance;
                    player.position.x += dx * moveRatio;
                    player.position.y += dy * moveRatio;
                }
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board squares
        const squareSize = 80;
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const x = col * squareSize + 50;
                const y = (6 - row) * squareSize + 50;
                
                // Draw square
                this.ctx.fillStyle = '#ffffff';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 1;
                this.ctx.fillRect(x, y, squareSize, squareSize);
                this.ctx.strokeRect(x, y, squareSize, squareSize);
                
                // Draw position number
                const position = row * 7 + (row % 2 === 0 ? col : 6 - col);
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '16px Arial';
                this.ctx.textAlign = 'center';
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
        
        // Draw wildcard spaces
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
        
        // Draw players
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
            const pawnImage = player.pawnType === 'black' ? this.pawnBlack : this.pawnWhite;
            const size = this.PLAYER_SIZE * 2.5;
            this.ctx.drawImage(pawnImage, 
                             player.position.x - size/2,
                             player.position.y - size/2,
                             size, size);
            
            // Draw player number
            this.ctx.fillStyle = '#000000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(index + 1, player.position.x, player.position.y - 30);
        });
        
        // Draw current player indicator
        const currentPlayer = this.players[this.currentPlayer];
        this.ctx.strokeStyle = '#FF4081';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(currentPlayer.position.x, currentPlayer.position.y, 25, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Update player info
        this.updatePlayerInfo();
        
        // Request next frame
        requestAnimationFrame(() => this.draw());
    }
    
    updatePlayerInfo() {
        const player = this.players[this.currentPlayer];
        if (player) {
            const playerInfo = document.getElementById('player-info');
            playerInfo.innerHTML = `
                <h3>Player ${this.currentPlayer + 1}'s Turn</h3>
                <p>Score: ${player.score}</p>
            `;
        }
    }
    
    handleKeyPress(event) {
        if (this.gameWon) return;
        
        switch (event.code) {
            case 'Space':
                this.handleSpacePress();
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
                this.handleAnswerSelection(parseInt(event.key) - 1);
                break;
            case 'Escape':
                // Handle game exit
                break;
        }
    }
    
    handleSpacePress() {
        const player = this.players[this.currentPlayer];
        if (!player.isActive) {
            player.isActive = true;
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        } else {
            this.askQuestion();
        }
    }
    
    // Add the questions data
    questions = {
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
            },
            // ... more easy questions ...
        ],
        medium: [
            {
                question: "How has social media influenced political discourse?",
                correct: "Created echo chambers while enabling broader political participation",
                wrong: [
                    "Enhanced information sharing while reducing factual verification",
                    "Increased political engagement while polarizing public opinion",
                    "Expanded democratic access while compromising meaningful debate"
                ],
                moves: 3
            },
            // ... more medium questions ...
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
            },
            // ... more hard questions ...
        ]
    };

    askQuestion() {
        // Select random difficulty
        const difficulties = ['easy', 'medium', 'hard'];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        
        // Select random question from difficulty
        const questionSet = this.questions[difficulty];
        const question = questionSet[Math.floor(Math.random() * questionSet.length)];
        
        // Create answer options
        const options = [question.correct, ...question.wrong];
        this.shuffleArray(options);
        
        // Store correct answer and moves
        this.currentQuestion = {
            text: question.question,
            correct: question.correct,
            moves: question.moves,
            options: options
        };
        
        // Show question box
        const questionBox = document.getElementById('question-box');
        const questionText = document.getElementById('question-text');
        const answersDiv = document.getElementById('answers');
        
        questionBox.classList.remove('hidden');
        questionText.textContent = question.question;
        
        // Create answer buttons
        answersDiv.innerHTML = options.map((option, index) => `
            <button class="answer-button" onclick="game.handleAnswerSelection(${index})">
                ${index + 1}. ${option}
            </button>
        `).join('');
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
            this.movePlayer(this.currentPlayer, moves);
            
            // Hide question box
            document.getElementById('question-box').classList.add('hidden');
            this.currentQuestion = null;
            
            // Switch to next player if not on wildcard
            if (!this.checkWildcard()) {
                this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
            }
        }, 2000);
    }

    movePlayer(playerIndex, spaces) {
        const player = this.players[playerIndex];
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
        player.score = newPosition + 1;
    }

    checkWildcard() {
        const player = this.players[this.currentPlayer];
        return this.wildcardPositions.includes(player.boardPosition);
    }
}

// Start the game when the page loads
window.onload = () => {
    window.game = new Game();
}; 