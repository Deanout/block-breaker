const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 0.9;
const BLOCK_SIZE = 25;
const JUMP_HEIGHT = 3;

let continuePlaying = false;

let frequency = 0.002;
let amplitude = 1;
let seed = 0;

let sky = "sky";
let grass = "grass";
let dirt = "dirt";
let stone = "stone";
let iron = "iron";
let diamond = "diamond";

let grassContainer = document.getElementById("grass");
let dirtContainer = document.getElementById("dirt");
let stoneContainer = document.getElementById("stone");
let diamondContainer = document.getElementById("diamond");
let ironContainer = document.getElementById("iron");
let restartButton = document.getElementById("restart");
let activeContainer = grassContainer;

let grassToCollect = 5;
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
let playerColor = [255, 0, 0];

let grid = [];

let diamondChance = 5;
let ironChance = 8;

let player = {
  x: 0,
  y: 0,
  isFalling: false,
  inventory: {
    grass: 0,
    dirt: 0,
    stone: 0,
    iron: 0,
    diamond: 0,
  },
  selectedBlockType: grass,
};

function setup() {
  frameRate(15);
  setSeed();
  createCanvas(WIDTH, HEIGHT);
  generateTerrain();
  doEventListeners();
  setActiveContainer(grassContainer);
}

function draw() {
  doPlayerMovement();
  updatePlayerInventory();
  checkIfPlayerWon();
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
      findNode(player.x, player.y - BLOCK_SIZE).blockType === sky
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
  if (node.blockType === sky) {
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
    findNode(player.x + BLOCK_SIZE, player.y).blockType === sky
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
    findNode(player.x - BLOCK_SIZE, player.y).blockType === sky
  ) {
    updatePlayerPosition(player.x - BLOCK_SIZE, player.y);
  }
}

function findNode(x, y) {
  let nodeX = x - (x % BLOCK_SIZE);
  let nodeY = y - (y % BLOCK_SIZE);
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].x === nodeX && grid[i].y === nodeY) {
      return grid[i];
    }
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
  return distance <= BLOCK_SIZE * 1.5;
}

function interactWithBlock(node) {
  if (mouseButton === LEFT && node.blockType !== sky) {
    mineBlock(node);
    return;
  }
  if (mouseButton === RIGHT && node.blockType === sky) {
    placeBlock(node);
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
    default:
      break;
  }
}

function setAndDrawBlockType(node, blockType) {
  node.blockType = blockType;
  fill(getBlockTypeColor(blockType));
  rect(node.x, node.y, BLOCK_SIZE, BLOCK_SIZE);
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
    default:
      return grassContainer;
  }
}
