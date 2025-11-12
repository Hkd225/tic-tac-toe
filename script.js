 document.addEventListener('DOMContentLoaded', () => {
            // Elemen DOM
            const board = document.getElementById('board');
            const cells = document.querySelectorAll('.cell');
            const status = document.getElementById('status');
            const winsElement = document.getElementById('wins');
            const lossesElement = document.getElementById('losses');
            const drawsElement = document.getElementById('draws');
            const newGameBtn = document.getElementById('new-game');
            const resetStatsBtn = document.getElementById('reset-stats');
            const playerOptions = document.querySelectorAll('.control-group:first-child .option');
            const difficultyOptions = document.querySelectorAll('.control-group:last-child .option');
            const roundInfo = document.getElementById('round-info');

            // State game
            let gameState = ['', '', '', '', '', '', '', '', ''];
            let currentPlayer = 'X';
            let playerSymbol = 'X';
            let aiSymbol = 'O';
            let gameActive = false;
            let difficulty = 'easy';
            let round = 1;
            let firstPlayer = 'X'; // Pemain yang jalan pertama di round ini
            
            // Statistik
            let stats = {
                wins: 0,
                losses: 0,
                draws: 0
            };

            // Load statistik
            function loadStats() {
                const savedStats = localStorage.getItem('ticTacToeStats');
                if (savedStats) {
                    stats = JSON.parse(savedStats);
                    updateStatsDisplay();
                }
            }

            // Save statistik
            function saveStats() {
                localStorage.setItem('ticTacToeStats', JSON.stringify(stats));
            }

            // Update tampilan statistik
            function updateStatsDisplay() {
                winsElement.textContent = stats.wins;
                lossesElement.textContent = stats.losses;
                drawsElement.textContent = stats.draws;
            }

            // Inisialisasi game
            function initGame() {
                loadStats();
                
                // Event listeners
                cells.forEach(cell => {
                    cell.addEventListener('click', handleCellClick);
                });

                newGameBtn.addEventListener('click', startNewGame);
                resetStatsBtn.addEventListener('click', resetStats);

                playerOptions.forEach(option => {
                    option.addEventListener('click', handlePlayerSelection);
                });

                difficultyOptions.forEach(option => {
                    option.addEventListener('click', handleDifficultySelection);
                });

                startNewGame();
            }

            // Handle pemilihan simbol
            function handlePlayerSelection(e) {
                playerOptions.forEach(option => option.classList.remove('selected'));
                e.target.classList.add('selected');
                
                playerSymbol = e.target.id === 'player-x' ? 'X' : 'O';
                aiSymbol = playerSymbol === 'X' ? 'O' : 'X';
                
                startNewGame();
            }

            // Handle pemilihan kesulitan
            function handleDifficultySelection(e) {
                difficultyOptions.forEach(option => option.classList.remove('selected'));
                e.target.classList.add('selected');
                
                difficulty = e.target.getAttribute('data-difficulty');
                
                if (gameActive && currentPlayer === aiSymbol) {
                    makeAIMove();
                }
            }

            // Mulai game baru
            function startNewGame() {
                gameState = ['', '', '', '', '', '', '', '', ''];
                gameActive = true;
                
                // Tentukan pemain pertama untuk round ini
                // Jika round ganjil, pemain yang dipilih jalan pertama
                // Jika round genap, AI jalan pertama
                firstPlayer = round % 2 === 1 ? playerSymbol : aiSymbol;
                currentPlayer = firstPlayer;
                
                cells.forEach(cell => {
                    cell.textContent = '';
                    cell.classList.remove('x', 'o', 'winning-cell');
                });
                
                updateRoundInfo();
                
                if (currentPlayer === playerSymbol) {
                    status.textContent = 'Giliran Anda!';
                } else {
                    status.textContent = 'Giliran AI...';
                    setTimeout(makeAIMove, 500);
                }
            }

            // Update info round
            function updateRoundInfo() {
                roundInfo.textContent = `Round ${round} - ${firstPlayer === playerSymbol ? 'Anda' : 'AI'} mulai`;
            }

            // Handle klik sel
            function handleCellClick(e) {
                const index = parseInt(e.target.getAttribute('data-index'));
                
                if (gameState[index] !== '' || !gameActive || currentPlayer !== playerSymbol) {
                    return;
                }
                
                makeMove(index, playerSymbol);
                
                if (gameActive) {
                    currentPlayer = aiSymbol;
                    status.textContent = 'AI berpikir...';
                    setTimeout(makeAIMove, 800);
                }
            }

            // Buat langkah
            function makeMove(index, symbol) {
                gameState[index] = symbol;
                cells[index].textContent = symbol;
                cells[index].classList.add(symbol.toLowerCase());
                
                const winInfo = checkWinner();
                if (winInfo) {
                    endGame(winInfo.winner, winInfo.winningCells);
                    return;
                }
                
                if (!gameState.includes('')) {
                    endGame('draw');
                }
            }

            // Buat langkah AI
            function makeAIMove() {
                if (!gameActive || currentPlayer !== aiSymbol) return;
                
                let move;
                
                switch (difficulty) {
                    case 'easy':
                        move = getRandomMove();
                        break;
                    case 'medium':
                        move = Math.random() < 0.7 ? getBestMove() : getRandomMove();
                        break;
                    case 'hard':
                    default:
                        move = getBestMove();
                        break;
                }
                
                makeMove(move, aiSymbol);
                
                if (gameActive) {
                    currentPlayer = playerSymbol;
                    status.textContent = 'Giliran Anda!';
                }
            }

            // Dapatkan langkah acak
            function getRandomMove() {
                const availableMoves = gameState
                    .map((cell, index) => cell === '' ? index : null)
                    .filter(cell => cell !== null);
                
                return availableMoves[Math.floor(Math.random() * availableMoves.length)];
            }

            // Dapatkan langkah terbaik dengan Minimax
            function getBestMove() {
                return minimax(gameState, aiSymbol).index;
            }

            // Algoritma Minimax
            function minimax(newBoard, player) {
                const winInfo = checkWinnerForBoard(newBoard);
                if (winInfo && winInfo.winner === aiSymbol) {
                    return { score: 10 };
                } else if (winInfo && winInfo.winner === playerSymbol) {
                    return { score: -10 };
                } else if (!newBoard.includes('')) {
                    return { score: 0 };
                }
                
                const moves = [];
                
                for (let i = 0; i < newBoard.length; i++) {
                    if (newBoard[i] === '') {
                        const move = {};
                        move.index = i;
                        newBoard[i] = player;
                        
                        if (player === aiSymbol) {
                            move.score = minimax(newBoard, playerSymbol).score;
                        } else {
                            move.score = minimax(newBoard, aiSymbol).score;
                        }
                        
                        newBoard[i] = '';
                        moves.push(move);
                    }
                }
                
                let bestMove;
                if (player === aiSymbol) {
                    let bestScore = -Infinity;
                    for (let i = 0; i < moves.length; i++) {
                        if (moves[i].score > bestScore) {
                            bestScore = moves[i].score;
                            bestMove = i;
                        }
                    }
                } else {
                    let bestScore = Infinity;
                    for (let i = 0; i < moves.length; i++) {
                        if (moves[i].score < bestScore) {
                            bestScore = moves[i].score;
                            bestMove = i;
                        }
                    }
                }
                
                return moves[bestMove];
            }

            // Periksa pemenang untuk board tertentu
            function checkWinnerForBoard(board) {
                const winPatterns = [
                    [0, 1, 2], [3, 4, 5], [6, 7, 8],
                    [0, 3, 6], [1, 4, 7], [2, 5, 8],
                    [0, 4, 8], [2, 4, 6]
                ];
                
                for (const pattern of winPatterns) {
                    const [a, b, c] = pattern;
                    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                        return {
                            winner: board[a],
                            winningCells: pattern
                        };
                    }
                }
                
                return null;
            }

            // Periksa pemenang untuk board saat ini
            function checkWinner() {
                return checkWinnerForBoard(gameState);
            }

            // Akhiri game
            function endGame(winner, winningCells = []) {
                gameActive = false;
                
                winningCells.forEach(index => {
                    cells[index].classList.add('winning-cell');
                });
                
                if (winner === 'draw') {
                    status.textContent = 'Round Seri!';
                    stats.draws++;
                    // Lanjut ke round berikutnya
                    setTimeout(nextRound, 1500);
                } else if (winner === playerSymbol) {
                    status.textContent = 'Anda Menang Round Ini! 🎉';
                    stats.wins++;
                    // Lanjut ke round berikutnya
                    setTimeout(nextRound, 1500);
                } else {
                    status.textContent = 'AI Menang Round Ini!';
                    stats.losses++;
                    // Lanjut ke round berikutnya
                    setTimeout(nextRound, 1500);
                }
                
                updateStatsDisplay();
                saveStats();
            }

            // Lanjut ke round berikutnya
            function nextRound() {
                round++;
                startNewGame();
            }

            // Reset statistik
            function resetStats() {
                if (confirm('Reset statistik?')) {
                    stats = { wins: 0, losses: 0, draws: 0 };
                    round = 1;
                    updateStatsDisplay();
                    saveStats();
                    startNewGame();
                }
            }

            // Inisialisasi game
            initGame();
        });