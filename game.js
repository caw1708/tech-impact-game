class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set fixed canvas size
        this.canvas.width = 700;
        this.canvas.height = 700;
        
        // Game settings
        this.GRID_SIZE = 7;
        this.CELL_SIZE = 80;
        this.PLAYER_SIZE = 25;
        this.MARGIN = 50;
        
        // Initialize game state
        this.players = [];
        this.currentPlayer = 0;
        this.gameStarted = false;
        this.gameWon = false;
        this.currentQuestion = null;
        
        // Calculate board positions
        this.positions = [];
        this.createBoardPositions();
        
        // Define ladders (from, to)
        this.ladders = [
            [2, 22],
            [7, 14],
            [16, 26],
            [29, 38],
            [41, 46]
        ];
        
        // Define wildcard positions
        this.wildcards = [5, 18, 27, 35];
        
        // Start game loop
        this.gameLoop();
        
        // Add event listeners
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.setupPlayerSelection();
        this.setupWildcardButtons();
    }

    createBoardPositions() {
        // Clear existing positions
        this.positions = [];
        
        // Calculate starting point to center the board
        const startX = (this.canvas.width - (this.GRID_SIZE * this.CELL_SIZE)) / 2;
        const startY = (this.canvas.height - (this.GRID_SIZE * this.CELL_SIZE)) / 2;
        
        // Create positions array
        for (let row = this.GRID_SIZE - 1; row >= 0; row--) {
            // For even rows (counting from bottom), go left to right
            // For odd rows, go right to left
            const isEvenRow = (this.GRID_SIZE - 1 - row) % 2 === 0;
            
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const actualCol = isEvenRow ? col : (this.GRID_SIZE - 1 - col);
                
                this.positions.push({
                    x: startX + (actualCol * this.CELL_SIZE) + (this.CELL_SIZE / 2),
                    y: startY + (row * this.CELL_SIZE) + (this.CELL_SIZE / 2)
                });
            }
        }
    }

    drawBoard() {
        // Clear canvas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate board position
        const startX = (this.canvas.width - (this.GRID_SIZE * this.CELL_SIZE)) / 2;
        const startY = (this.canvas.height - (this.GRID_SIZE * this.CELL_SIZE)) / 2;
        
        // Draw board background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(
            startX - 5,
            startY - 5,
            this.GRID_SIZE * this.CELL_SIZE + 10,
            this.GRID_SIZE * this.CELL_SIZE + 10
        );
        
        // Draw grid
        let number = 1;
        for (let row = this.GRID_SIZE - 1; row >= 0; row--) {
            const isEvenRow = (this.GRID_SIZE - 1 - row) % 2 === 0;
            
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const x = startX + (col * this.CELL_SIZE);
                const y = startY + (row * this.CELL_SIZE);
                
                // Draw cell
                this.ctx.fillStyle = '#ffffff';
                this.ctx.strokeStyle = '#cccccc';
                this.ctx.lineWidth = 1;
                
                this.ctx.beginPath();
                this.ctx.rect(x, y, this.CELL_SIZE, this.CELL_SIZE);
                this.ctx.fill();
                this.ctx.stroke();
                
                // Draw number
                this.ctx.fillStyle = '#333333';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const displayNumber = isEvenRow ? 
                    number + col : 
                    number + (this.GRID_SIZE - 1 - col);
                
                this.ctx.fillText(
                    displayNumber.toString(),
                    x + this.CELL_SIZE/2,
                    y + this.CELL_SIZE/2
                );
            }
            number += this.GRID_SIZE;
        }
        
        // Draw ladders
        this.drawLadders();
        
        // Draw wildcards
        this.drawWildcards();
    }

    drawLadders() {
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 6;
        
        for (const [start, end] of this.ladders) {
            const startPos = this.positions[start - 1];
            const endPos = this.positions[end - 1];
            
            // Calculate ladder properties
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;
            const angle = Math.atan2(dy, dx);
            const spacing = 12;
            
            // Draw rails
            for (let offset = -1; offset <= 1; offset += 2) {
                this.ctx.beginPath();
                this.ctx.moveTo(
                    startPos.x + Math.cos(angle + Math.PI/2) * spacing * offset,
                    startPos.y + Math.sin(angle + Math.PI/2) * spacing * offset
                );
                this.ctx.lineTo(
                    endPos.x + Math.cos(angle + Math.PI/2) * spacing * offset,
                    endPos.y + Math.sin(angle + Math.PI/2) * spacing * offset
                );
                this.ctx.stroke();
            }
            
            // Draw rungs
            const length = Math.sqrt(dx * dx + dy * dy);
            const steps = Math.floor(length / 30);
            this.ctx.lineWidth = 4;
            
            for (let i = 1; i < steps; i++) {
                const t = i / steps;
                const x = startPos.x + dx * t;
                const y = startPos.y + dy * t;
                
                this.ctx.beginPath();
                this.ctx.moveTo(
                    x + Math.cos(angle + Math.PI/2) * spacing,
                    y + Math.sin(angle + Math.PI/2) * spacing
                );
                this.ctx.lineTo(
                    x - Math.cos(angle + Math.PI/2) * spacing,
                    y - Math.sin(angle + Math.PI/2) * spacing
                );
                this.ctx.stroke();
            }
        }
    }

    drawWildcards() {
        for (const position of this.wildcards) {
            const pos = this.positions[position - 1];
            
            // Draw yellow circle
            this.ctx.fillStyle = '#FFD700';
            this.ctx.strokeStyle = '#FFA500';
            this.ctx.lineWidth = 3;
            
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.PLAYER_SIZE, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
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
            const pos = this.positions[player.position - 1];
            
            // Calculate offset for multiple players
            const samePositionPlayers = this.players.filter(p => p.position === player.position);
            const playerIndex = samePositionPlayers.findIndex(p => p === player);
            const totalPlayers = samePositionPlayers.length;
            
            let offsetX = 0;
            let offsetY = 0;
            
            if (totalPlayers > 1) {
                const angle = (2 * Math.PI * playerIndex) / totalPlayers;
                const radius = this.PLAYER_SIZE;
                offsetX = Math.cos(angle) * radius;
                offsetY = Math.sin(angle) * radius;
            }
            
            // Draw player
            this.ctx.fillStyle = player.color;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(pos.x + offsetX, pos.y + offsetY, this.PLAYER_SIZE, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw player number
            this.ctx.fillStyle = player.color === '#000000' ? '#FFFFFF' : '#000000';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText((index + 1).toString(), pos.x + offsetX, pos.y + offsetY);
            
            // Draw current player indicator
            if (index === this.currentPlayer) {
                this.ctx.strokeStyle = '#FF4081';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(pos.x + offsetX, pos.y + offsetY, this.PLAYER_SIZE + 5, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    gameLoop() {
        this.drawBoard();
        this.drawPlayers();
        requestAnimationFrame(() => this.gameLoop());
    }

    setupPlayerSelection() {
        const buttons = document.querySelectorAll('.player-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const playerCount = parseInt(button.dataset.players);
                this.startGame(playerCount);
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
        const colors = ['#000000', '#FF3232', '#32FF32', '#FFFF32'];
        
        this.players = Array(playerCount).fill().map((_, i) => ({
            position: 1,
            color: colors[i],
            isActive: false
        }));
        
        this.currentPlayer = 0;
        this.gameStarted = true;
        
        // Update UI
        const playerInfo = document.getElementById('player-info');
        playerInfo.innerHTML = `
            <h3>Player 1's Turn</h3>
            <p>Score: 1</p>
        `;
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

    movePlayer(spaces) {
        const player = this.players[this.currentPlayer];
        let newPosition = player.position + spaces;
        
        // Keep within bounds
        if (newPosition < 1) newPosition = 1;
        if (newPosition > 49) {
            newPosition = 49;
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
        player.position = newPosition;
        
        // Update score display
        const playerInfo = document.getElementById('player-info');
        playerInfo.innerHTML = `
            <h3>Player ${this.currentPlayer + 1}'s Turn</h3>
            <p>Score: ${newPosition}</p>
        `;
    }

    checkWildcard() {
        const player = this.players[this.currentPlayer];
        return this.wildcards.includes(player.position);
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

    // Add your existing question-related methods here (askQuestion, handleAnswerSelection, etc.)
    // They remain unchanged from your current implementation
}

// Start the game when the page loads
window.onload = () => {
    window.game = new Game();
};