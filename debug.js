let remainingMassCalculationTime = 0;
let massCopyTime = 0;
let setBlockTypesByMassTime = 0;
let boundaryCleanupTimer = 0;
let lastFrameTime = 0;

function drawDebug() {
  if (!debug) {
    return;
  }
  fill(111, 111, 111);
  rect(0, 0, 250, 250);
  fill(255, 255, 255);
  drawFPS();
  drawTimers();
  drawPlayerCoordinates();
  resetTimers();
}

function resetTimers() {
  lastFrameTime = Date.now();
  remainingMassCalculationTime = 0;
  massCopyTime = 0;
  setBlockTypesByMassTime = 0;
  boundaryCleanupTimer = 0;
}

function drawFPS() {
  let fps = Math.round(1000 / (Date.now() - lastFrameTime));
  text("FPS: " + fps, 10, 10);
}

function drawTimers() {
  text("Calculation time: " + remainingMassCalculationTime, 10, 20);
  text("Mass copy time: " + massCopyTime, 10, 30);
  text("Set block types time: " + setBlockTypesByMassTime, 10, 40);
  text("Boundary cleanup time: " + boundaryCleanupTimer, 10, 50);
}

function drawPlayerCoordinates() {
  let playerCoordinates = getPlayerCoordinates();
  text(
    `Player Position: (${playerCoordinates.x}, ${playerCoordinates.y})`,
    10,
    60
  );
}

function getPlayerCoordinates() {
  let playerX = Math.floor(player.x / BLOCK_SIZE);
  let playerY = Math.floor(player.y / BLOCK_SIZE);
  return {
    x: playerX,
    y: playerY,
  };
}
