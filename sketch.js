let continuePlaying = false;

let frequency = 0.002;
let amplitude = 1;
let seed = 0;
let debug = true;

let sky = "sky";
let grass = "grass";
let dirt = "dirt";
let stone = "stone";
let iron = "iron";
let diamond = "diamond";
let water = "water";

let grassContainer = document.getElementById("grass");
let dirtContainer = document.getElementById("dirt");
let stoneContainer = document.getElementById("stone");
let diamondContainer = document.getElementById("diamond");
let ironContainer = document.getElementById("iron");
let waterContainer = document.getElementById("water");
let restartButton = document.getElementById("restart");
let activeContainer = waterContainer;

let grassToCollect = 128;
let dirtToCollect = 64;
let stoneToCollect = 32;
let ironToCollect = 16;
let diamondToCollect = 8;

let skyColor = [0, 0, 120];
let grassColor = [0, 180, 0];
let dirtColor = [115, 118, 83];
let stoneColor = [58, 50, 50];
let ironColor = [161, 157, 148];
let diamondColor = [69, 172, 165];
let waterColor = [212, 241, 249];
let playerColor = [255, 0, 0];

let grid = [];
let masses = [];
let newMasses = [];
let playerAddedMasses = [];

let diamondChance = 5;
let ironChance = 8;
let deltaTime = 0;

let player = {
  x: findCenterNodeX(CENTER_WIDTH),
  y: 0,
  isFalling: false,
  inventory: {
    grass: 0,
    dirt: 0,
    stone: 0,
    iron: 0,
    diamond: 0,
    water: 999,
  },
  selectedBlockType: water,
};

let nonSolidBlocks = [water, sky, player];

function setup() {
  frameRate(60);
  setSeed();
  createCanvas(WIDTH, HEIGHT);
  generateTerrain();
  doEventListeners();
  setActiveContainer(waterContainer);
  let node = findNode(0, 0);
  setAndDrawBlockType(node, water);
}

function draw() {
  drawTerrain();
  doPlayerMovement();
  updatePlayerInventory();
  checkIfPlayerWon();

  doLiquidTick();
  if (mouseIsPressed) {
    mousePressed();
  }
  drawDebug();
}

function findTopBlock(x) {
  let topBlock = findNode(x, 0);
  while (topBlock && topBlock.blockType === sky) {
    topBlock = findNode(x, topBlock.y - BLOCK_SIZE);
  }
}

function doLiquidTick() {
  let now = Date.now();
  if (now - deltaTime) {
    deltaTime = now;
    simulateWater();
  }
}

function drawTerrain() {
  for (let i = 0; i < grid.length; i++) {
    let node = grid[i];
    let { x, y, blockType } = node;

    if (node.blockType === water) {
      let mass = findMass(x, y);
      rectMode(CORNER);
      fill(skyColor);
      rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      rectMode(CORNERS);
      fill(waterColor);
      // fill rect with water up to the block_size / mass value
      rect(
        x,
        y + (BLOCK_SIZE - (BLOCK_SIZE * mass.value) / BLOCK_SIZE),
        x + BLOCK_SIZE,
        y + BLOCK_SIZE
      );
    } else {
      rectMode(CORNER);
      fill(getBlockTypeColor(blockType));
      rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
  }
}

function checkIfPlayerWon() {
  if (continuePlaying) {
    return;
  }
  if (
    player.inventory.diamond >= diamondToCollect ||
    player.inventory.iron >= ironToCollect ||
    player.inventory.stone >= stoneToCollect ||
    player.inventory.dirt >= dirtToCollect ||
    player.inventory.grass >= grassToCollect
  ) {
    continuePlaying = true;
    if (window.confirm("You Won! Play Again?")) {
      restart();
    }
  }
}

function doEventListeners() {
  restartButton.addEventListener("click", () => {
    restart();
  });
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  grassContainer.addEventListener("click", () => {
    player.selectedBlockType = grass;
    setActiveContainer(grassContainer);
  });
  dirtContainer.addEventListener("click", () => {
    player.selectedBlockType = dirt;
    setActiveContainer(dirtContainer);
  });
  stoneContainer.addEventListener("click", () => {
    player.selectedBlockType = stone;
    setActiveContainer(stoneContainer);
  });
  diamondContainer.addEventListener("click", () => {
    player.selectedBlockType = diamond;
    setActiveContainer(diamondContainer);
  });
  ironContainer.addEventListener("click", () => {
    player.selectedBlockType = iron;
    setActiveContainer(ironContainer);
  });
  waterContainer.addEventListener("click", () => {
    player.selectedBlockType = water;
    setActiveContainer(waterContainer);
  });
}

function setActiveContainer(container) {
  activeContainer.classList.remove("active");
  container.classList.add("active");
  activeContainer = container;
}

function restart() {
  let url = window.location.href;
  window.location.href = url.substring(0, url.lastIndexOf("/"));
}

function setSeed() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("seed")) {
    seed = urlParams.get("seed");
  }
  noiseSeed(seed);
  randomSeed(seed);
}

function generateTerrain() {
  for (let x = 0; x < WIDTH; x += BLOCK_SIZE) {
    for (let y = 0; y < HEIGHT; y += BLOCK_SIZE) {
      let noiseValue = noise(x * frequency, y * frequency) * amplitude;
      let node = {
        x: x,
        y: y,
        density: noiseValue,
        blockType: sky,
      };
      grid.push(node);
      let mass = {
        x: x,
        y: y,
        value: 0,
      };
      masses.push(mass);
      let newMass = Object.assign({}, mass);
      newMasses.push(newMass);
      let index = grid.indexOf(node);
      paintTerrainTiles(node, index);
      paintOres(node, index);
    }
  }
}

function paintTerrainTiles(node, index) {
  let { x, y, density } = node;
  let noiseAmount = density * y;
  let yLevel = HEIGHT - y;
  if (noiseAmount < yLevel) {
    grid[index].blockType = sky;
    fill(skyColor);
    rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }
  if (noiseAmount > yLevel * 0.6) {
    grid[index].blockType = grass;
    fill(grassColor);
    rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }
  if (noiseAmount > yLevel * 0.8) {
    grid[index].blockType = dirt;
    fill(dirtColor);
    rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }
  if (noiseAmount > yLevel) {
    grid[index].blockType = stone;
    fill(stoneColor);
    rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }
}

function paintOres(node, index) {
  paintDiamonds(node, index);
  paintIron(node, index);
}
function paintDiamonds(node, index) {
  let { x, y, density } = node;
  let noiseAmount = density * y;
  let yLevel = HEIGHT - y;
  if (noiseAmount > yLevel * 2 && diamondChance > random(100)) {
    grid[index].blockType = diamond;
    fill(diamondColor);
    rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }
}

function paintIron(node, index) {
  let { x, y, density } = node;
  let noiseAmount = density * y;
  let yLevel = HEIGHT - y;
  if (noiseAmount > yLevel * 1.5 && ironChance > random(100)) {
    grid[index].blockType = iron;
    fill(ironColor);
    rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
  }
}

function doPlayerMovement() {
  drawPlayer();
  doPlayerMoveLeft();
  doPlayerMoveRight();
  doPlayerFall();
  if (!player.isFalling) {
    doPlayerJump();
  }
}

function doPlayerJump() {
  for (let i = 0; i < JUMP_HEIGHT; i++) {
    if (
      keyIsDown(UP_ARROW) &&
      (findNode(player.x, player.y - BLOCK_SIZE).blockType === sky ||
        findNode(player.x, player.y - BLOCK_SIZE).blockType === water)
    ) {
      updatePlayerPosition(player.x, player.y - BLOCK_SIZE);
    }
  }
}

function drawPlayer() {
  fill(playerColor);
  rect(player.x, player.y, BLOCK_SIZE, BLOCK_SIZE);
}
function doPlayerFall() {
  if (player.y + BLOCK_SIZE > HEIGHT) {
    player.isFalling = false;
    return;
  }
  let node = findNode(player.x, player.y + BLOCK_SIZE);
  if (node.blockType === sky || node.blockType === water) {
    player.isFalling = true;
    updatePlayerPosition(player.x, player.y + BLOCK_SIZE);
  } else {
    player.isFalling = false;
  }
}

function doPlayerMoveRight() {
  if (player.x + BLOCK_SIZE > WIDTH) {
    return;
  }
  if (
    keyIsDown(RIGHT_ARROW) &&
    (findNode(player.x + BLOCK_SIZE, player.y).blockType === sky ||
      findNode(player.x + BLOCK_SIZE, player.y).blockType === water)
  ) {
    updatePlayerPosition(player.x + BLOCK_SIZE, player.y);
  }
}

function doPlayerMoveLeft() {
  if (player.x - BLOCK_SIZE < 0) {
    return;
  }
  if (
    keyIsDown(LEFT_ARROW) &&
    (findNode(player.x - BLOCK_SIZE, player.y).blockType === sky ||
      findNode(player.x - BLOCK_SIZE, player.y).blockType === water)
  ) {
    updatePlayerPosition(player.x - BLOCK_SIZE, player.y);
  }
}

function updatePlayerPosition(newX, newY) {
  setPreviousPlayerPosition();
  player.x = newX;
  player.y = newY;
  setNewPlayerPosition();
}

function setPreviousPlayerPosition() {
  fill(skyColor);
  rect(player.x, player.y, BLOCK_SIZE, BLOCK_SIZE);
}

function setNewPlayerPosition() {
  fill(playerColor);
  rect(player.x, player.y, BLOCK_SIZE, BLOCK_SIZE);
}

function mousePressed() {
  let node = findNode(mouseX, mouseY);
  if (node && playerCanInteractWithBlock(node)) {
    interactWithBlock(node);
  }
}

function playerCanInteractWithBlock(node) {
  // check if node is 1 block from player
  let distance = dist(node.x, node.y, player.x, player.y);
  return distance <= PLAYER_REACH;
}

function interactWithBlock(node) {
  if (
    mouseButton === LEFT &&
    node.blockType !== sky &&
    node.blockType !== water
  ) {
    mineBlock(node);
    return;
  }
  if (
    mouseButton === RIGHT &&
    (node.blockType === sky || node.blockType === water)
  ) {
    placeBlock(node);
    return;
  }
  if (mouseButton === CENTER && node.blockType !== sky) {
    let container = getContainerByBlockType(node.blockType);
    setActiveContainer(container);
    player.selectedBlockType = node.blockType;
  }
}

function mineBlock(node) {
  let blockType = node.blockType;

  addBlockTypeToInventory(blockType);
  setAndDrawBlockType(node, sky);
}

function addBlockTypeToInventory(blockType) {
  switch (blockType) {
    case grass:
      player.inventory.grass++;
      break;
    case dirt:
      player.inventory.dirt++;
      break;
    case stone:
      player.inventory.stone++;
      break;
    case diamond:
      player.inventory.diamond++;
      break;
    case iron:
      player.inventory.iron++;
      break;
    case water:
      player.inventory.water++;
      break;
    default:
      break;
  }
}

function setAndDrawBlockType(node, blockType) {
  node.blockType = blockType;
  if (blockType === water) {
    let newMass = {
      x: node.x,
      y: node.y,
      value: MAX_MASS,
    };
    playerAddedMasses.push(newMass);
  }
}

function getBlockTypeColor(blockType) {
  switch (blockType) {
    case sky:
      return skyColor;
    case grass:
      return grassColor;
    case dirt:
      return dirtColor;
    case stone:
      return stoneColor;
    case diamond:
      return diamondColor;
    case iron:
      return ironColor;
    case water:
      return waterColor;
    default:
      return skyColor;
  }
}

function placeBlock(node) {
  let blockType = player.selectedBlockType;
  if (playerHasEnoughResources(blockType)) {
    player.inventory[blockType]--;
    setAndDrawBlockType(node, blockType);
  }
}

function playerHasEnoughResources(blockType) {
  switch (blockType) {
    case grass:
      return player.inventory.grass > 0;
    case dirt:
      return player.inventory.dirt > 0;
    case stone:
      return player.inventory.stone > 0;
    case diamond:
      return player.inventory.diamond > 0;
    case iron:
      return player.inventory.iron > 0;
    case water:
      return player.inventory.water > 0;
    default:
      return false;
  }
}

function updatePlayerInventory() {
  grassContainer.innerHTML = player.inventory.grass;
  dirtContainer.innerHTML = player.inventory.dirt;
  stoneContainer.innerHTML = player.inventory.stone;
  diamondContainer.innerHTML = player.inventory.diamond;
  ironContainer.innerHTML = player.inventory.iron;
  waterContainer.innerHTML = player.inventory.water;
}

function getContainerByBlockType(blockType) {
  switch (blockType) {
    case grass:
      return grassContainer;
    case dirt:
      return dirtContainer;
    case stone:
      return stoneContainer;
    case diamond:
      return diamondContainer;
    case iron:
      return ironContainer;
    case water:
      return waterContainer;
    default:
      return grassContainer;
  }
}
