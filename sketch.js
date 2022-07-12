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
let water = "water";
let wood = "wood";
let leaf = "leaf";
let sapling = "sapling";

let grassContainer = document.getElementById("grass");
let dirtContainer = document.getElementById("dirt");
let stoneContainer = document.getElementById("stone");
let diamondContainer = document.getElementById("diamond");
let ironContainer = document.getElementById("iron");
let waterContainer = document.getElementById("water");
let woodContainer = document.getElementById("wood");
let leafContainer = document.getElementById("leaf");
let saplingContainer = document.getElementById("sapling");
let restartButton = document.getElementById("restart");
let activeContainer = waterContainer;

let grassCounter = document.getElementById("grass-counter");
let dirtCounter = document.getElementById("dirt-counter");
let stoneCounter = document.getElementById("stone-counter");
let ironCounter = document.getElementById("iron-counter");
let diamondCounter = document.getElementById("diamond-counter");
let waterCounter = document.getElementById("water-counter");
let woodCounter = document.getElementById("wood-counter");
let leafCounter = document.getElementById("leaf-counter");
let saplingCounter = document.getElementById("sapling-counter");

let grassToCollect = 128;
let dirtToCollect = 64;
let stoneToCollect = 32;
let ironToCollect = 16;
let diamondToCollect = 8;

let skyColor = [212, 241, 249];
let grassColor = [0, 180, 0];
let dirtColor = [115, 118, 83];
let stoneColor = [58, 50, 50];
let ironColor = [161, 157, 148];
let diamondColor = [69, 172, 165];
let waterColor = [90, 188, 216];
let woodColor = [91, 45, 0];
let leafColor = [5, 131, 5, 127.5];
let saplingColor = [191, 199, 49];

let playerColor = [255, 0, 0];

let grid = [];
let masses = [];
let newMasses = [];
let playerAddedMasses = [];
let saplings = [];

let diamondChance = 5;
let ironChance = 8;

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
    wood: 30,
    leaf: 60,
    sapling: 5,
  },
  selectedBlockType: water,
};

let noCollisionBlocks = [sky, water];
let nonSolidBlocks = [water, sky, player];

function setup() {
  frameRate(15);
  setSeed();
  createCanvas(WIDTH, HEIGHT);
  generateTerrain();
  simulateCaves();
  generateTrees();
  doEventListeners();
  setActiveContainer(waterContainer);
  let node = findNode(0, 0);
  setAndDrawBlockType(node, water);
}

function draw() {
  doGrowthStages();
  drawTerrain();
  doPlayerMovement();
  updatePlayerInventory();
  checkIfPlayerWon();
  doLiquidTick();
  if (mouseIsPressed) {
    mousePressed();
  }
}
function doLiquidTick() {
  simulateWater();
}
function doGrowthStages() {
  for (let i = 0; i < saplings.length; i++) {
    let sapling = saplings[i];
    let { x, y, growthStage } = sapling;
    if (growthStage < TREE_GROWTH_STAGES && random(100) < TREE_GROWTH_RATE) {
      sapling.growthStage++;
    } else if (growthStage >= TREE_GROWTH_STAGES) {
      createTree(x, y);
      saplings.splice(i, 1);
    }
  }
}
function createTree(x, y) {
  let treeHeight = random(3, 6) * BLOCK_SIZE;
  for (let i = 0; i <= treeHeight; i += BLOCK_SIZE) {
    if (i < treeHeight) {
      let node = findNode(x, y - i);
      setAndDrawBlockType(node, wood);
    }
    if (i > 2 * BLOCK_SIZE) {
      createLeaves(x, y, i);
    }
  }
  let canopyHeight = treeHeight - 2 * BLOCK_SIZE;
  for (let i = canopyHeight; i <= treeHeight; i += BLOCK_SIZE) {
    createLeaves(x, y, i);
  }
}
function createLeaves(x, y, i) {
  let numLeavesLeft = int(random(0, 3)) * BLOCK_SIZE;
  let numLeavesRight = int(random(0, 3)) * BLOCK_SIZE;
  for (let j = -numLeavesLeft; j <= numLeavesRight; j += BLOCK_SIZE) {
    let leafCandidateNode = findNode(x + j, y - i);
    if (leafCandidateNode.blockType !== wood) {
      setAndDrawBlockType(leafCandidateNode, leaf);
    }
  }
}
function drawTerrain() {
  for (let i = 0; i < grid.length; i++) {
    let node = grid[i];
    let { x, y, blockType } = node;
    if (node.blockType === leaf) {
      doLeafDecay(node);
    }
    if (node.blockType === water) {
      let mass = findMass(x, y);
      rectMode(CORNER);
      fill(skyColor);
      rect(x, y, BLOCK_SIZE, BLOCK_SIZE);

      rectMode(CORNERS);
      fill(waterColor);
      let startRectYOffset =
        BLOCK_SIZE - (BLOCK_SIZE * mass.value) / BLOCK_SIZE;
      rect(x, y + startRectYOffset, x + BLOCK_SIZE, y + BLOCK_SIZE);
      rectMode(CORNER);
    } else {
      fill(skyColor);
      rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
      fill(getBlockTypeColor(blockType));
      rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
  }
}

function doLeafDecay(node) {
  let { x, y } = node;
  let woodInRange = false;

  for (
    let i = -LEAF_WOOD_RANGE_IN_BLOCKS;
    i <= LEAF_WOOD_RANGE_IN_BLOCKS;
    i += BLOCK_SIZE
  ) {
    for (
      let j = -LEAF_WOOD_RANGE_IN_BLOCKS;
      j <= LEAF_WOOD_RANGE_IN_BLOCKS;
      j += BLOCK_SIZE
    ) {
      let node = findNode(x + i, y + j);
      if (node.blockType === wood) {
        woodInRange = true;
        return;
      }
    }
  }
  decayLeaf(node);
}

function decayLeaf(node) {
  if (random(100) < LEAF_DECAY_RATE) {
    node.blockType = sky;
    addBlockTypeToInventory(leaf);
    let dropSapling = random(100) < SAPLING_DROP_RATE;
    if (dropSapling) {
      addBlockTypeToInventory(sapling);
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
  woodContainer.addEventListener("click", () => {
    player.selectedBlockType = wood;
    setActiveContainer(woodContainer);
  });
  leafContainer.addEventListener("click", () => {
    player.selectedBlockType = leaf;
    setActiveContainer(leafContainer);
  });
  saplingContainer.addEventListener("click", () => {
    player.selectedBlockType = sapling;
    setActiveContainer(saplingContainer);
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
        growthStage: 0,
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
function generateTrees() {
  for (let x = 0; x < WIDTH; x += BLOCK_SIZE) {
    let node = findFirstNonEmptyNode(x);
    if (node === null) {
      return;
    }
    if (node.blockType === grass && random(100) <= TREE_PLANT_RATE) {
      let nodeAbove = findNode(x, node.y - BLOCK_SIZE);
      createTree(nodeAbove.x, nodeAbove.y);
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
    seedCave(node);
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
    let node = findNode(player.x, player.y - BLOCK_SIZE);
    if (keyIsDown(UP_ARROW) && noCollisionBlocks.includes(node.blockType)) {
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
  if (noCollisionBlocks.includes(node.blockType)) {
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
  let node = findNode(player.x + BLOCK_SIZE, player.y);
  if (keyIsDown(RIGHT_ARROW) && noCollisionBlocks.includes(node.blockType)) {
    updatePlayerPosition(player.x + BLOCK_SIZE, player.y);
  }
}

function doPlayerMoveLeft() {
  if (player.x - BLOCK_SIZE < 0) {
    return;
  }
  let node = findNode(player.x - BLOCK_SIZE, player.y);
  if (keyIsDown(LEFT_ARROW) && noCollisionBlocks.includes(node.blockType)) {
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
  if (mouseButton === LEFT && !noCollisionBlocks.includes(node.blockType)) {
    mineBlock(node);
    return;
  }
  if (mouseButton === RIGHT && noCollisionBlocks.includes(node.blockType)) {
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

  if (blockType === sapling) {
    let indexOfSapling = saplings.indexOf(node);
    saplings.splice(indexOfSapling, 1);
  }
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
    case wood:
      player.inventory.wood++;
      break;
    case leaf:
      player.inventory.leaf++;
      break;
    case sapling:
      player.inventory.sapling++;
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
  } else if (blockType === sapling) {
    saplings.push(node);
  } else {
    clearMassFromNode(node.x, node.y);
  }
  node.growthStage = 0;
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
    case wood:
      return woodColor;
    case leaf:
      return leafColor;
    case sapling:
      return saplingColor;
    default:
      return skyColor;
  }
}

function placeBlock(node) {
  let blockType = player.selectedBlockType;
  if (failedToPlaceBlock(node, blockType)) {
    return;
  }
  if (playerHasEnoughResources(blockType)) {
    player.inventory[blockType]--;
    setAndDrawBlockType(node, blockType);
  }
}
function failedToPlaceBlock(node, blockType) {
  if (blockType === sapling) {
    let nodeBelow = findNode(node.x, node.y + BLOCK_SIZE);
    if (nodeBelow.blockType !== grass) {
      return true;
    }
  }
  return false;
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
    case wood:
      return player.inventory.wood > 0;
    case leaf:
      return player.inventory.leaf > 0;
    case sapling:
      return player.inventory.sapling > 0;
    default:
      return false;
  }
}

function updatePlayerInventory() {
  grassCounter.innerHTML = player.inventory.grass;
  dirtCounter.innerHTML = player.inventory.dirt;
  stoneCounter.innerHTML = player.inventory.stone;
  diamondCounter.innerHTML = player.inventory.diamond;
  ironCounter.innerHTML = player.inventory.iron;
  waterCounter.innerHTML = player.inventory.water;
  woodCounter.innerHTML = player.inventory.wood;
  leafCounter.innerHTML = player.inventory.leaf;
  saplingCounter.innerHTML = player.inventory.sapling;
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
    case wood:
      return woodContainer;
    case leaf:
      return leafContainer;
    case sapling:
      return saplingContainer;
    default:
      return grassContainer;
  }
}
