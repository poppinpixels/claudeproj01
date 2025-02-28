import pygame
import pymunk
import math
import sys
import random
from pygame.locals import *

# Initialize pygame and create window
pygame.init()
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Ball Bouncing in Spinning Hexagon")
clock = pygame.time.Clock()

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GREEN = (0, 255, 0)
PURPLE = (128, 0, 128)
ORANGE = (255, 165, 0)
YELLOW = (255, 255, 0)
BACKGROUND = (20, 20, 50)
BUTTON_COLOR = (70, 70, 90)
BUTTON_HOVER_COLOR = (90, 90, 110)
BUTTON_TEXT_COLOR = (230, 230, 230)

# Physics setup
space = pymunk.Space()
space.gravity = (0, 500)  # Gravity along y-axis (reduced for more interesting bounces)

# Hexagon parameters
hexagon_radius = 200
hexagon_center = (width // 2, height // 2)
rotation_speed = 0.3  # radians per second

# Ball parameters
DEFAULT_BALL_RADIUS = 15
ball_elasticity = 0.9
ball_friction = 0.2

# Ball types
ball_types = [
    {"name": "Light", "mass": 2, "radius": 10, "color": YELLOW},
    {"name": "Medium", "mass": 5, "radius": 15, "color": ORANGE},
    {"name": "Heavy", "mass": 10, "radius": 20, "color": RED},
    {"name": "Huge", "mass": 20, "radius": 30, "color": PURPLE}
]

# UI parameters
button_width = 100
button_height = 40
button_margin = 10
button_y = height - button_height - 20

# Define buttons for different ball types
buttons = []
for i, ball_type in enumerate(ball_types):
    button_x = button_margin + i * (button_width + button_margin)
    buttons.append({
        "rect": pygame.Rect(button_x, button_y, button_width, button_height),
        "text": ball_type["name"],
        "type": i
    })

# Pop button
pop_button = {
    "rect": pygame.Rect(width - button_width - button_margin, button_y, button_width, button_height),
    "text": "Pop Mode",
    "active": False
}

# Font for UI elements
font = pygame.font.Font(None, 24)

def create_ball(position=None, ball_type_idx=1):
    """Create a ball with physical properties based on ball type"""
    ball_type = ball_types[ball_type_idx]
    
    if position is None:
        # Random position within the hexagon
        angle = random.uniform(0, 2 * math.pi)
        distance = random.uniform(0, hexagon_radius * 0.7)
        position = (
            hexagon_center[0] + distance * math.cos(angle),
            hexagon_center[1] + distance * math.sin(angle)
        )
    
    body = pymunk.Body()
    body.position = position
    
    # Add some initial velocity
    body.velocity = (random.uniform(-100, 100), random.uniform(-100, 100))
    
    radius = ball_type["radius"]
    shape = pymunk.Circle(body, radius)
    shape.mass = ball_type["mass"]
    shape.elasticity = ball_elasticity
    shape.friction = ball_friction
    
    # Store a color for drawing and the ball type for reference
    shape.color = ball_type["color"]
    shape.ball_type_idx = ball_type_idx
    
    # Add to space
    space.add(body, shape)
    return body, shape

def is_point_in_circle(point, center, radius):
    """Check if a point is inside a circle"""
    return math.dist(point, center) <= radius

def draw_button(button, mouse_pos):
    """Draw an interactive button"""
    color = BUTTON_HOVER_COLOR if button["rect"].collidepoint(mouse_pos) else BUTTON_COLOR
    
    # Draw button background with border
    pygame.draw.rect(screen, color, button["rect"], border_radius=8)
    pygame.draw.rect(screen, WHITE, button["rect"], width=2, border_radius=8)
    
    # If it's the pop button and it's active, add a highlight
    if "active" in button and button["active"]:
        pygame.draw.rect(screen, (255, 100, 100), button["rect"], width=3, border_radius=8)
    
    # Draw button text
    text = font.render(button["text"], True, BUTTON_TEXT_COLOR)
    text_rect = text.get_rect(center=button["rect"].center)
    screen.blit(text, text_rect)

def create_hexagon_walls():
    """Create the six walls of the hexagon"""
    walls = []
    
    # Create a static body for the hexagon
    hexagon_body = pymunk.Body(body_type=pymunk.Body.KINEMATIC)
    hexagon_body.position = hexagon_center
    
    # Add the body to the space first
    space.add(hexagon_body)
    
    # Create six segments for the hexagon
    for i in range(6):
        angle1 = 2 * math.pi * i / 6
        angle2 = 2 * math.pi * (i + 1) / 6
        x1 = hexagon_radius * math.cos(angle1)
        y1 = hexagon_radius * math.sin(angle1)
        x2 = hexagon_radius * math.cos(angle2)
        y2 = hexagon_radius * math.sin(angle2)
        
        segment = pymunk.Segment(hexagon_body, (x1, y1), (x2, y2), 2)
        segment.elasticity = 0.9
        segment.friction = 0.5
        
        space.add(segment)
        walls.append(segment)
    
    return hexagon_body, walls

# Create objects
hexagon_body, hexagon_walls = create_hexagon_walls()

# Create multiple balls
balls = []
num_balls = 6
for _ in range(num_balls):
    ball = create_ball(ball_type_idx=random.randint(0, len(ball_types)-1))
    balls.append(ball)

# Track time for rotation
start_time = pygame.time.get_ticks()

# Current selected ball type
current_ball_type = 1  # Medium ball by default

# Main game loop
running = True
while running:
    # Get mouse position and state
    mouse_pos = pygame.mouse.get_pos()
    mouse_buttons = pygame.mouse.get_pressed()
    
    for event in pygame.event.get():
        if event.type == QUIT:
            running = False
        elif event.type == KEYDOWN:
            if event.key == K_ESCAPE:
                running = False
            elif event.key == K_r:
                # Reset simulation
                for ball_body, ball_shape in balls:
                    space.remove(ball_body, ball_shape)
                balls.clear()
                for _ in range(num_balls):
                    ball = create_ball(ball_type_idx=random.randint(0, len(ball_types)-1))
                    balls.append(ball)
        elif event.type == MOUSEBUTTONDOWN:
            if event.button == 1:  # Left click
                # Check if any button was clicked
                for button in buttons:
                    if button["rect"].collidepoint(mouse_pos):
                        current_ball_type = button["type"]
                        # If we're in pop mode, turn it off
                        pop_button["active"] = False
                
                # Check if pop button was clicked
                if pop_button["rect"].collidepoint(mouse_pos):
                    pop_button["active"] = not pop_button["active"]
                
                # If not clicking on UI and pop mode is active, try to pop a ball
                elif pop_button["active"]:
                    # Try to pop a ball if clicked on one
                    for i, (ball_body, ball_shape) in enumerate(balls):
                        ball_pos = ball_body.position
                        if is_point_in_circle(mouse_pos, (ball_pos.x, ball_pos.y), ball_shape.radius):
                            # Remove ball from space and list
                            space.remove(ball_body, ball_shape)
                            balls.pop(i)
                            break
                
                # If not clicking on UI and not in pop mode, add a new ball
                elif not any(button["rect"].collidepoint(mouse_pos) for button in buttons) and not pop_button["rect"].collidepoint(mouse_pos):
                    # Add a new ball at mouse position
                    ball = create_ball(position=mouse_pos, ball_type_idx=current_ball_type)
                    balls.append(ball)
    
    # Calculate rotation based on elapsed time
    elapsed_time = (pygame.time.get_ticks() - start_time) / 1000.0  # Convert to seconds
    rotation_angle = rotation_speed * elapsed_time
    
    # Update hexagon rotation
    hexagon_body.angle = rotation_angle
    
    # Update physics
    dt = 1.0 / 60.0
    space.step(dt)
    
    # Drawing
    screen.fill(BACKGROUND)
    
    # Draw the hexagon walls with glow effect
    for wall in hexagon_walls:
        a = wall.a.rotated(hexagon_body.angle) + hexagon_body.position
        b = wall.b.rotated(hexagon_body.angle) + hexagon_body.position
        
        # Draw glow effect
        for i in range(3, 0, -1):
            glow_color = (100 - i*20, 100 - i*20, 255 - i*20)
            pygame.draw.line(screen, glow_color, a, b, 6 + i*2)
        
        # Draw main line
        pygame.draw.line(screen, WHITE, a, b, 3)
    
    # Draw all balls
    for ball_body, ball_shape in balls:
        ball_pos = int(ball_body.position.x), int(ball_body.position.y)
        
        # Draw shadow
        pygame.draw.circle(screen, (20, 20, 20), 
                          (ball_pos[0] + 3, ball_pos[1] + 3), 
                          ball_shape.radius)
        
        # Draw ball
        pygame.draw.circle(screen, ball_shape.color, ball_pos, ball_shape.radius)
        
        # Draw highlight
        highlight_pos = (ball_pos[0] - ball_shape.radius//3, ball_pos[1] - ball_shape.radius//3)
        pygame.draw.circle(screen, (255, 255, 255, 128), 
                          highlight_pos, 
                          ball_shape.radius//3)
    
    # Draw UI buttons
    for button in buttons:
        draw_button(button, mouse_pos)
        
        # Highlight current type button
        if button["type"] == current_ball_type and not pop_button["active"]:
            pygame.draw.rect(screen, WHITE, button["rect"], width=3, border_radius=8)
    
    # Draw pop button
    draw_button(pop_button, mouse_pos)
    
    # Draw cursor hint
    if pop_button["active"]:
        # Show pop cursor
        cursor_text = "🗑️ Click on balls to pop them"
        pygame.mouse.set_cursor(pygame.SYSTEM_CURSOR_CROSSHAIR)
    else:
        # Show current ball type
        selected_type = ball_types[current_ball_type]
        cursor_text = f"🏀 {selected_type['name']} Ball (Mass: {selected_type['mass']})"
        pygame.mouse.set_cursor(pygame.SYSTEM_CURSOR_ARROW)
    
    # Display instructions
    cursor_surface = font.render(cursor_text, True, WHITE)
    screen.blit(cursor_surface, (width//2 - cursor_surface.get_width()//2, 15))
    
    info_text = f"Balls: {len(balls)} | Click: Add Ball | R: Reset | ESC: Exit"
    text_surface = font.render(info_text, True, WHITE)
    screen.blit(text_surface, (10, 10))
    
    fps = clock.get_fps()
    fps_text = f"FPS: {fps:.1f}"
    fps_surface = font.render(fps_text, True, WHITE)
    screen.blit(fps_surface, (10, 40))
    
    # Update display
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
sys.exit()