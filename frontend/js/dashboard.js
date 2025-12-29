// Dashboard Functions
let progressChart = null;

async function loadDashboard() {
    try {
        const [dashboardData, chartData] = await Promise.all([
            PerformanceAPI.getDashboard(),
            PerformanceAPI.getChartData(30)
        ]);

        // Use current user from auth if dashboard data is incomplete
        const skillLevels = dashboardData?.user?.skillLevels || currentUser?.skillLevels || {
            mathReflex: 1, memoryBoost: 1, logicPuzzles: 1,
            wordBuilder: 1, patternMatch: 1, quickQuiz: 1
        };

        renderSkillBars(skillLevels);
        renderStatsTable(dashboardData?.stats);
        renderWeakAreas(dashboardData?.weakAreas);
        renderRecentGames(dashboardData?.recentGames);
        renderProgressChart(chartData);
    } catch (error) {
        console.error('Dashboard load error:', error);
        // Show default dashboard even on error
        const defaultSkills = currentUser?.skillLevels || {
            mathReflex: 1, memoryBoost: 1, logicPuzzles: 1,
            wordBuilder: 1, patternMatch: 1, quickQuiz: 1
        };
        renderSkillBars(defaultSkills);
        renderStatsTable(null);
        renderWeakAreas([]);
        renderRecentGames([]);
        renderProgressChart([]);
    }
}

function renderSkillBars(skillLevels) {
    const container = document.getElementById('skillBars');
    if (!container) return;
    
    const gameNames = {
        mathReflex: '🔢 Math Reflex',
        memoryBoost: '🧠 Memory Boost',
        logicPuzzles: '🧩 Logic Puzzles',
        wordBuilder: '📝 Word Builder',
        patternMatch: '🎨 Pattern Match',
        quickQuiz: '⚡ Quick Quiz',
        colorHunt: '🌈 Color Hunt',
        shapeEscape: '🔺 Shape Escape'
    };

    // Filter only known games
    const knownGames = Object.keys(gameNames);
    
    container.innerHTML = Object.entries(skillLevels || {})
        .filter(([game]) => knownGames.includes(game))
        .map(([game, level]) => `
        <div class="skill-bar-item">
            <div class="skill-bar-header">
                <span class="skill-bar-name">${gameNames[game]}</span>
                <span class="skill-bar-level">${level}/10</span>
            </div>
            <div class="skill-bar">
                <div class="skill-bar-fill" style="width: ${level * 10}%"></div>
            </div>
        </div>
    `).join('');
}

function renderStatsTable(stats) {
    const container = document.getElementById('statsTable');
    if (!container) return;
    
    if (!stats) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No game data yet. Start playing to see your stats!</p>';
        return;
    }

    const gameNames = {
        mathReflex: 'Math Reflex',
        memoryBoost: 'Memory Boost',
        logicPuzzles: 'Logic Puzzles'
    };

    let totalGames = 0;
    let totalScore = 0;
    
    Object.values(stats).forEach(s => {
        totalGames += s.totalGamesPlayed || 0;
        totalScore += s.totalScore || 0;
    });

    container.innerHTML = `
        <div class="stats-row">
            <span>Total Games Played</span>
            <span style="color: var(--primary); font-weight: bold;">${totalGames}</span>
        </div>
        <div class="stats-row">
            <span>Total Score</span>
            <span style="color: var(--primary); font-weight: bold;">${totalScore.toLocaleString()}</span>
        </div>
        ${Object.entries(stats).map(([game, s]) => `
            <div class="stats-row">
                <span>${gameNames[game]} Accuracy</span>
                <span>${s.averageAccuracy ? Math.round(s.averageAccuracy) + '%' : 'N/A'}</span>
            </div>
        `).join('')}
        <div class="stats-row">
            <span>Best Streaks</span>
            <span>
                🔢 ${stats.mathReflex?.currentStreak || 0} |
                🧠 ${stats.memoryBoost?.currentStreak || 0} |
                🧩 ${stats.logicPuzzles?.currentStreak || 0}
            </span>
        </div>
    `;
}

function renderWeakAreas(weakAreas) {
    const container = document.getElementById('weakAreasList');
    if (!container) return;
    
    if (!weakAreas || weakAreas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
                <p>Great job! No weak areas detected.</p>
                <p style="font-size: 0.9rem;">Keep playing regularly to maintain your skills!</p>
            </div>
        `;
        return;
    }

    const gameNames = {
        mathReflex: '🔢 Math Reflex',
        memoryBoost: '🧠 Memory Boost',
        logicPuzzles: '🧩 Logic Puzzles',
        wordBuilder: '📝 Word Builder',
        patternMatch: '🎨 Pattern Match',
        quickQuiz: '⚡ Quick Quiz',
        colorHunt: '🌈 Color Hunt',
        shapeEscape: '🔺 Shape Escape'
    };

    container.innerHTML = weakAreas.map(area => `
        <div class="weak-area-item ${area.priority >= 3 ? 'high-priority' : ''}">
            <div class="weak-area-game">${gameNames[area.gameType]}</div>
            <div class="weak-area-reason">${area.reason}</div>
        </div>
    `).join('');
}

function renderRecentGames(games) {
    const container = document.getElementById('recentGamesList');
    if (!container) return;
    
    if (!games || games.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No games played yet</p>';
        return;
    }

    const gameIcons = {
        mathReflex: '🔢',
        memoryBoost: '🧠',
        logicPuzzles: '🧩',
        wordBuilder: '📝',
        patternMatch: '🎨',
        quickQuiz: '⚡',
        colorHunt: '🌈',
        shapeEscape: '🔺'
    };

    const gameNames = {
        mathReflex: 'Math Reflex',
        memoryBoost: 'Memory Boost',
        logicPuzzles: 'Logic Puzzles',
        wordBuilder: 'Word Builder',
        patternMatch: 'Pattern Match',
        quickQuiz: 'Quick Quiz',
        colorHunt: 'Color Hunt',
        shapeEscape: 'Shape Escape'
    };

    container.innerHTML = games.slice(0, 8).map(game => {
        const date = new Date(game.playedAt);
        const timeAgo = getTimeAgo(date);
        
        return `
            <div class="recent-game-item">
                <div class="recent-game-info">
                    <span class="recent-game-icon">${gameIcons[game.gameType]}</span>
                    <div>
                        <div class="recent-game-type">${gameNames[game.gameType]}</div>
                        <div class="recent-game-date">${timeAgo}</div>
                    </div>
                </div>
                <div class="recent-game-score">${game.score}</div>
            </div>
        `;
    }).join('');
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

function renderProgressChart(data) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (progressChart) {
        progressChart.destroy();
    }

    if (!data || data.length === 0) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('Play some games to see your progress chart!', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const labels = data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Math Reflex',
                    data: data.map(d => d.mathReflex.avgScore || null),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Memory Boost',
                    data: data.map(d => d.memoryBoost.avgScore || null),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Logic Puzzles',
                    data: data.map(d => d.logicPuzzles.avgScore || null),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f8fafc'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
