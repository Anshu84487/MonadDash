// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 400, // Standard mobile portrait width
    height: 700, // Standard mobile portrait height
    parent: 'game-container', // HTML element ID
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true // Uncomment to see physics bodies
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    backgroundColor: '#3b0f7e' // Dark purple background for game canvas
};

let game = new Phaser.Game(config);

let player;
let cursors;
let obstacles;
let score = 0;
let scoreText;
let gameOver = false;
let background;

// --- Preload Assets ---
function preload() {
    // Load your Monad runner
    this.load.image('runner', 'assets/images/runner.png'); 
    // Load your obstacle (pink owl or hedgehog)
    this.load.image('obstacle', 'assets/images/obstacle.png'); 
    // Background (if you have an image, otherwise we'll use a solid color/gradient)
    // this.load.image('background', 'assets/images/background.png'); 
}

// --- Create Game Elements ---
function create() {
    // Scrolling Background (using a simple rectangle for now, you can replace with an image)
    // If you have a background image:
    // background = this.add.tileSprite(0, 0, config.width, config.height, 'background').setOrigin(0, 0);
    // If no background image, use a graphics object for a simple scrolling effect
    background = this.add.graphics({ fillStyle: 0x3b0f7e });
    background.fillRect(0, 0, config.width, config.height); // Initial fill

    // Player (Runner)
    player = this.physics.add.sprite(config.width / 2, config.height - 100, 'runner');
    player.setCollideWorldBounds(true); // Player cannot go out of bounds
    player.setScale(0.5); // Adjust scale if your runner image is too big/small

    // Obstacles group
    obstacles = this.physics.add.group();

    // Spawn obstacles every X milliseconds
    this.time.addEvent({
        delay: 1500, // Spawn every 1.5 seconds
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
    });

    // Collision detection between player and obstacles
    this.physics.add.collider(player, obstacles, hitObstacle, null, this);

    // Score Text
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '24px', fill: '#FFF' });

    // Keyboard Input
    cursors = this.input.keyboard.createCursorKeys();
}

// --- Update Game Logic ---
function update() {
    if (gameOver) {
        return;
    }

    // --- Player Movement ---
    if (cursors.left.isDown) {
        player.setVelocityX(-200); // Move left
    } else if (cursors.right.isDown) {
        player.setVelocityX(200); // Move right
    } else {
        player.setVelocityX(0); // Stop if no key is pressed
    }

    // --- Scrolling Background Effect ---
    // If you're using a tileSprite:
    // background.tilePositionY -= 2; 

    // Obstacle movement (downwards)
    obstacles.children.entries.forEach(function(obstacle) {
        obstacle.setVelocityY(200); // Obstacles move downwards
        // Destroy obstacle if it goes off-screen to save memory
        if (obstacle.y > config.height + 50) {
            obstacle.destroy();
            score += 10; // Increase score for dodging an obstacle
            scoreText.setText('Score: ' + score);
        }
    });
}

// --- Custom Functions ---

function spawnObstacle() {
    if (gameOver) return;

    // Random X position for the obstacle
    let x = Phaser.Math.Between(50, config.width - 50); 
    // Create obstacle at the top of the screen
    let obstacle = obstacles.create(x, -50, 'obstacle'); 
    
    obstacle.setScale(0.7); // Adjust scale for obstacle
    obstacle.setImmovable(true); // Obstacles won't move when hit
    obstacle.body.allowGravity = false; // No gravity for obstacles
    obstacle.setVelocityY(200 + score / 5); // Obstacles move faster as score increases
}

function hitObstacle(player, obstacle) {
    this.physics.pause(); // Pause game physics
    player.setTint(0xff0000); // Red tint on player to indicate hit
    gameOver = true;

    this.add.text(config.width / 2, config.height / 2, 'GAME OVER', { 
        fontSize: '48px', 
        fill: '#f00' 
    }).setOrigin(0.5);

    // Restart game on click
    this.input.once('pointerdown', function () {
        this.scene.restart();
        score = 0;
        gameOver = false;
    }, this);
}
