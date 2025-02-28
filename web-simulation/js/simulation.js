// Physics simulation using Matter.js
class PhysicsSimulation {
    constructor() {
        // Ball types configuration
        this.ballTypes = {
            light: { mass: 2, radius: 10, color: '#ffeb3b' },
            medium: { mass: 5, radius: 15, color: '#ff9800' },
            heavy: { mass: 10, radius: 20, color: '#f44336' },
            huge: { mass: 20, radius: 30, color: '#9c27b0' }
        };
        
        // Current state
        this.currentBallType = 'medium';
        this.popMode = false;
        this.balls = [];
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 500; // Update FPS every 500ms
        this.lastFpsUpdate = 0;
        this.fps = 0;
        
        // Set up canvas
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Initialize physics engine
        this.setupPhysics();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start the simulation
        this.start();
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas dimensions
        this.canvas.width = rect.width;
        this.canvas.height = 500; // Fixed height
        
        // Calculate centers
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Hexagon size based on canvas
        this.hexagonRadius = Math.min(this.canvas.width, this.canvas.height) * 0.35;
    }
    
    setupPhysics() {
        // Matter.js modules
        const Engine = Matter.Engine,
              Render = Matter.Render,
              Runner = Matter.Runner,
              Bodies = Matter.Bodies,
              Composite = Matter.Composite,
              Body = Matter.Body,
              Vector = Matter.Vector;
        
        // Create engine
        this.engine = Engine.create({
            gravity: { x: 0, y: 0.5 } // Reduced gravity for web version
        });
        
        // Create runner
        this.runner = Runner.create();
        
        // Create hexagon walls
        this.createHexagonWalls();
        
        // Start the engine
        Runner.run(this.runner, this.engine);
    }
    
    createHexagonWalls() {
        const Bodies = Matter.Bodies,
              Composite = Matter.Composite,
              Body = Matter.Body;
        
        // Create a container for walls
        this.walls = [];
        
        // Create a static body for the hexagon
        this.hexagonBody = Bodies.rectangle(this.centerX, this.centerY, 10, 10, { 
            isStatic: true,
            render: { visible: false }
        });
        
        // Create six segments for the hexagon
        for (let i = 0; i < 6; i++) {
            const angle1 = (2 * Math.PI * i / 6);
            const angle2 = (2 * Math.PI * (i + 1) / 6);
            
            const x1 = this.hexagonRadius * Math.cos(angle1);
            const y1 = this.hexagonRadius * Math.sin(angle1);
            const x2 = this.hexagonRadius * Math.cos(angle2);
            const y2 = this.hexagonRadius * Math.sin(angle2);
            
            const wall = Bodies.rectangle(
                this.centerX + (x1 + x2) / 2,
                this.centerY + (y1 + y2) / 2,
                Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                5,
                {
                    angle: Math.atan2(y2 - y1, x2 - x1),
                    isStatic: true,
                    friction: 0.1,
                    restitution: 0.9, // Bouncy walls
                    collisionFilter: { group: 1 },
                    render: { visible: true }
                }
            );
            
            this.walls.push(wall);
            Composite.add(this.engine.world, wall);
        }
        
        // Add the body to the world
        Composite.add(this.engine.world, this.hexagonBody);
    }
    
    createBall(x, y, type = this.currentBallType) {
        const Bodies = Matter.Bodies,
              Composite = Matter.Composite;
        
        const ballConfig = this.ballTypes[type];
        
        // Create the ball
        const ball = Bodies.circle(x, y, ballConfig.radius, {
            mass: ballConfig.mass,
            restitution: 0.8, // Bouncy
            friction: 0.2,
            frictionAir: 0.01,
            render: { fillStyle: ballConfig.color }
        });
        
        // Store the ball type for rendering
        ball.ballType = type;
        
        // Add ball to the world
        Composite.add(this.engine.world, ball);
        
        // Add to our balls array
        this.balls.push(ball);
        
        // Update ball count in UI
        this.updateBallCount();
        
        return ball;
    }
    
    removeBall(ball) {
        const Composite = Matter.Composite;
        
        // Remove from physics world
        Composite.remove(this.engine.world, ball);
        
        // Remove from our array
        const index = this.balls.indexOf(ball);
        if (index > -1) {
            this.balls.splice(index, 1);
        }
        
        // Update ball count in UI
        this.updateBallCount();
    }
    
    updateBallCount() {
        const ballCountElement = document.getElementById('ball-count');
        const isEnglish = document.documentElement.lang === 'en';
        ballCountElement.textContent = isEnglish ? 
            `Balls: ${this.balls.length}` : 
            `Bolde: ${this.balls.length}`;
    }
    
    setCurrentBallType(type) {
        if (this.ballTypes[type]) {
            this.currentBallType = type;
        }
    }
    
    setPopMode(active) {
        this.popMode = active;
    }
    
    reset() {
        const Composite = Matter.Composite;
        
        // Remove all balls
        for (const ball of [...this.balls]) {
            this.removeBall(ball);
        }
        
        // Clear the balls array (just to be sure)
        this.balls = [];
        
        // Update the ball count
        this.updateBallCount();
    }
    
    setupEventListeners() {
        // Canvas click handling
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if in pop mode
            if (this.popMode) {
                this.popBallAtPosition(x, y);
            } else {
                this.createBall(x, y);
            }
        });
        
        // Window resize handling
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    popBallAtPosition(x, y) {
        // Find the ball that was clicked
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            const dx = ball.position.x - x;
            const dy = ball.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Get the radius for this ball type
            const radius = this.ballTypes[ball.ballType].radius;
            
            if (distance <= radius) {
                // Found a ball to pop
                this.removeBall(ball);
                return;
            }
        }
    }
    
    rotateHexagon(angle) {
        const Body = Matter.Body;
        
        // Rotate the hexagon body
        Body.setAngle(this.hexagonBody, angle);
        
        // Rotate each wall to maintain the hexagon shape
        for (let i = 0; i < 6; i++) {
            const baseAngle = (2 * Math.PI * i / 6);
            const nextAngle = (2 * Math.PI * (i + 1) / 6);
            
            const x1 = this.hexagonRadius * Math.cos(baseAngle + angle);
            const y1 = this.hexagonRadius * Math.sin(baseAngle + angle);
            const x2 = this.hexagonRadius * Math.cos(nextAngle + angle);
            const y2 = this.hexagonRadius * Math.sin(nextAngle + angle);
            
            const wall = this.walls[i];
            
            // Update wall position and rotation
            Body.setPosition(wall, {
                x: this.centerX + (x1 + x2) / 2,
                y: this.centerY + (y1 + y2) / 2
            });
            
            Body.setAngle(wall, Math.atan2(y2 - y1, x2 - x1));
        }
    }
    
    drawGlowingHexagon(angle) {
        this.ctx.save();
        
        // Set up the context for drawing
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(angle);
        
        // Draw each side of the hexagon with glow effect
        for (let i = 0; i < 6; i++) {
            const angle1 = (2 * Math.PI * i / 6);
            const angle2 = (2 * Math.PI * (i + 1) / 6);
            
            const x1 = this.hexagonRadius * Math.cos(angle1);
            const y1 = this.hexagonRadius * Math.sin(angle1);
            const x2 = this.hexagonRadius * Math.cos(angle2);
            const y2 = this.hexagonRadius * Math.sin(angle2);
            
            // Draw glow effect
            for (let j = 3; j > 0; j--) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(100, 100, 255, ${0.3 - j * 0.07})`;
                this.ctx.lineWidth = 6 + j * 2;
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
            
            // Draw main line
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawBall(ball) {
        const ballConfig = this.ballTypes[ball.ballType];
        const x = ball.position.x;
        const y = ball.position.y;
        const radius = ballConfig.radius;
        
        // Draw shadow
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.fillStyle = ballConfig.color;
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw highlight
        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.arc(x - radius/3, y - radius/3, radius/3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    calculateFps(timestamp) {
        // Calculate delta time since last frame
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        // Increment frame count
        this.frameCount++;
        
        // Update FPS periodically
        if (timestamp - this.lastFpsUpdate > this.fpsUpdateInterval) {
            // Calculate FPS
            this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
            
            // Update FPS display
            const fpsElement = document.getElementById('fps');
            fpsElement.textContent = `FPS: ${this.fps}`;
            
            // Reset counters
            this.lastFpsUpdate = timestamp;
            this.frameCount = 0;
        }
        
        return deltaTime;
    }
    
    render(timestamp) {
        // Calculate FPS
        const deltaTime = this.calculateFps(timestamp);
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate rotation angle based on time (complete rotation every 30 seconds)
        const rotationSpeed = 0.0001; // radians per millisecond
        const rotationAngle = (timestamp * rotationSpeed) % (Math.PI * 2);
        
        // Update physics rotation
        this.rotateHexagon(rotationAngle);
        
        // Draw glowing hexagon
        this.drawGlowingHexagon(rotationAngle);
        
        // Draw all balls
        for (const ball of this.balls) {
            this.drawBall(ball);
        }
        
        // Request next frame
        requestAnimationFrame(this.render.bind(this));
    }
    
    start() {
        // Create initial balls
        for (let i = 0; i < 6; i++) {
            // Create balls at random positions inside the hexagon
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.hexagonRadius * 0.7;
            const x = this.centerX + distance * Math.cos(angle);
            const y = this.centerY + distance * Math.sin(angle);
            
            // Random ball type
            const types = Object.keys(this.ballTypes);
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            this.createBall(x, y, randomType);
        }
        
        // Start rendering
        requestAnimationFrame(this.render.bind(this));
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.simulation = new PhysicsSimulation();
});