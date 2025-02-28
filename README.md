# ClaudeProj01

A project created with Claude Code to explore GitHub integration and other features.

## Overview

This repository serves as a playground for testing various features and capabilities of Claude Code, an AI-powered CLI tool.

## Features

- GitHub integration
- File manipulation
- Code generation
- Physics simulation (bouncing ball in spinning hexagon)

## Getting Started

1. Clone the repository
   ```
   git clone https://github.com/poppinpixels/claudeproj01.git
   ```

2. Navigate to the project directory
   ```
   cd claudeproj01
   ```

## Physics Simulation

The `bouncing_ball.py` program demonstrates colorful balls bouncing inside a spinning hexagon with realistic physics:

1. Install required dependencies:
   ```
   pip install pygame pymunk
   ```

2. Run the simulation:
   ```
   python3 bouncing_ball.py
   ```

3. Features:
   - Multiple colorful balls with realistic physics
   - Different ball types with varying mass and size
   - Rotating hexagon container with glowing walls
   - Balls bounce realistically with proper collision physics
   - Gravity and friction simulation
   - Interactive controls with buttons for different ball types
   - Ball popping functionality

4. Controls:
   - Click anywhere in the hexagon to add a ball of the selected type
   - Click the ball type buttons to switch between different ball weights
   - Click the "Pop Mode" button to enter ball removal mode
   - When in pop mode, click on balls to remove them
   - Press R to reset the simulation
   - Press ESC to exit
   - The hexagon rotates automatically
   - The balls are affected by gravity and bounce realistically off the walls

## Contributing

Feel free to submit pull requests or open issues to improve this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.