title = "Bubble Blaster";

description = `
    [Tap]
 Pop the Right
   Colors!
`;

characters = [];

options = {
    theme: "shapeDark",
    isShowingScore: true,
    isPlayingBgm: true,
    isReplayEnabled: true,
    seed: 3,
};

/**
 * @type {{
 * pos: Vector, vel: Vector, radius: number, targetRadius: number,
 * }[]}
 */

let circles;
let fallSpeed = 0.005;
let cursorX;
let cursorY;
let lineColorTimer = 0;
let lineColorChangeInterval = 180; // Change color every 3 seconds, 60fps
let currentLineColor = getRandomLineColor();

function update() {
    // Draw the cursor as a circle
    cursorX = input.pos.x;
    cursorY = input.pos.y;
    // make the cursor the same color as the circle that will be created
    color("black");
    arc(cursorX, cursorY, 1);

    // Initialize on the first frame
    if (!ticks) {
        circles = [];
    }

    // Change line color at regular intervals
    if (lineColorTimer <= 0) {
        currentLineColor = getRandomLineColor();
        lineColorTimer = lineColorChangeInterval;
    } else {
        lineColorTimer--;
    }

    // Create a new circle at regular intervals
    if (ticks % 30 === 0) {
        const newCircle = {
            pos: vec(Math.random() * 100, 12),
            vel: vec(0, 0.05),
            radius: 0,
            targetRadius: Math.random() * 10 + 2,
            color: getRandomCircleColor(),
        };
        circles.push(newCircle);
    }

    // Check if player tapped on a circle
    if (input.isJustPressed) {
        let isCircleTapped = false;
        remove(circles, (circle) => {
            if (circle.pos.distanceTo(input.pos) < circle.radius && currentLineColor === circle.color || circle.pos.distanceTo(input.pos) < circle.radius && currentLineColor === "black") {
                // Increase score based on the size of the circle popped, higher score for smaller circles
                play("click", {volume: 0.5});
                addScore(Math.floor(100 / circle.radius), circle.pos);

                isCircleTapped = true;
                return true;
            }
            if (circle.pos.distanceTo(input.pos) < circle.radius && currentLineColor != circle.color) {
                // Decrease score by 15 if wrong circle is popped
                play("explosion", { volume: 0.5 });
                addScore(-15);
                color("red");
                text("-15", input.pos.x - 10, input.pos.y - 10);

                isCircleTapped = true;
                return true;
            }
        });
        if (!isCircleTapped) {
            // Decrease score if player missed
            play("laser", { volume: 0.5 });
            addScore(-5);

            // Show the word "MISS!" slightly above the position of the tap
            color("red");
            text("MISS!", input.pos.x - 10, input.pos.y - 10);
        }
    }

    // Update and draw the circles
    remove(circles, (circle) => {
        circle.radius += (circle.targetRadius - circle.radius) * 0.05;
        circle.vel.y += fallSpeed;

        circle.pos.add(circle.vel);

        // Remove circles that go off the bottom of the screen
        if (circle.pos.y > 101) {
            // console.log("Circle removed. Color: " + circle.color);
            return true;
        }

        // Lose condition: if circle hits the bottom of the screen + 15 and is the same color as the line color, end game
        if (circle.pos.y > 100 && circle.color === currentLineColor) {
            end();
        }

        circles.forEach((otherCircle, index) => {
            if (circle !== otherCircle) {
                // Circle collision logic
                const d = circle.pos.distanceTo(otherCircle.pos) - circle.radius - otherCircle.radius;
                if (d < 0) {
                    const angle = otherCircle.pos.angleTo(circle.pos);
                    const overlap = circle.radius + otherCircle.radius - circle.pos.distanceTo(otherCircle.pos);

                    // Adjust positions so that the circles don't overlap
                    const moveBy = overlap / 2;
                    circle.pos.addWithAngle(angle, moveBy);
                    otherCircle.pos.addWithAngle(angle + PI, moveBy);

                    // Adjust velocities to bounce off each other
                    const averageBounce = (circle.vel.y + otherCircle.vel.y) / 2;
                    circle.vel.y = averageBounce;
                    otherCircle.vel.y = averageBounce;
                }
            }
        });

        // Draw the circle with the pre-generated color
        color(circle.color);
        arc(circle.pos, circle.radius, 2);

        // Stop circle from going off the sides
        if (circle.pos.x - circle.radius < 0 || circle.pos.x + circle.radius > 99) {
            circle.vel.x = 0;
            circle.pos.x = clamp(circle.pos.x, circle.radius, 99 - circle.radius);
        }
    });

    // Remove circles when they reach the target radius
    remove(circles, (circle) => circle.radius >= circle.targetRadius);

    // Draw the line
    drawLine();
}

// Simple color randomizer between 4 colors
function getRandomCircleColor() {
    const colors = ["red", "blue", "green", "yellow"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Simple color randomizer between 5 colors
function getRandomLineColor() {
    const colors = ["red", "blue", "green", "yellow", "black"];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Draw the line with the current color
function drawLine() {
    color(currentLineColor);
    rect(0, 0, 100, 10);
}
