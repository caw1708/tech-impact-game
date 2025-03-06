class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Board settings
        this.CELL_SIZE = 85;
        this.CIRCLE_RADIUS = 35;
        this.GRID_SIZE = 7;
        
        // Define ladders (from, to)
        this.ladders = [
            [31, 12],  // Middle ladder
            [38, 33]   // Bottom ladder
        ];
        
        // Define special positions
        this.wildcards = [25, 11, 4, 36];  // Yellow question marks
        this.greenCircle = 7;  // Top right green circle
        
        // Calculate board positions
        this.positions = [];
        this.createBoardPositions();
        
        // Start game loop
        this.gameLoop();
    }

    createBoardPositions() {
        // Calculate starting point to center the board
        const startX = (this.canvas.width - (this.GRID_SIZE * this.CELL_SIZE)) / 2;
        const startY = (this.canvas.height - (this.GRID_SIZE * this.CELL_SIZE)) / 2;
        
        // Create positions array (7x7)
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                this.positions.push({
                    x: startX + (col * this.CELL_SIZE) + (this.CELL_SIZE / 2),
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
        
        // Draw red background
        this.ctx.fillStyle = '#B22222';
        this.ctx.fillRect(
            startX,
            startY,
            this.GRID_SIZE * this.CELL_SIZE,
            this.GRID_SIZE * this.CELL_SIZE
        );
        
        // Draw circles
        for (let i = 0; i < this.positions.length; i++) {
            const pos = this.positions[i];
            
            // Determine circle color
            let fillColor = '#FFFFFF';  // Default white
            if (i === this.greenCircle - 1) {
                fillColor = '#90EE90';  // Green circle
            } else if (this.wildcards.includes(i + 1)) {
                fillColor = '#FFD700';  // Yellow for wildcards
            }
            
            // Draw circle
            this.ctx.fillStyle = fillColor;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.CIRCLE_RADIUS, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw "?" on wildcards
            if (this.wildcards.includes(i + 1)) {
                this.ctx.fillStyle = '#000000';
                this.ctx.font = 'bold 30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('?', pos.x, pos.y);
            }
        }
        
        // Draw ladders
        this.drawLadders();
    }

    drawLadders() {
        for (const [start, end] of this.ladders) {
            const startPos = this.positions[start - 1];
            const endPos = this.positions[end - 1];
            
            // Draw ladder
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;
            const angle = Math.atan2(dy, dx);
            const spacing = 15;
            
            // Draw rails
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 8;
            
            // Draw side rails
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
            const steps = Math.floor(length / 25);
            this.ctx.lineWidth = 6;
            
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

    gameLoop() {
        this.drawBoard();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    window.game = new Game();
}; 