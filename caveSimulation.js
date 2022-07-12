/**
 * Main cellular automata function to generate caves.
 */
function simulateCaves() {
  for (let i = 0; i < CAVE_ITERATIONS; i++) {
    cells = structuredClone(grid);
    for (let j = 0; j < cells.length; j++) {
      let numFilledNeighbors = 0;
      let node = grid[j];
      let cell = cells[j];
      if (isAboveGround(cell, node)) {
        continue;
      }
      let neighbors = getNeighbors(cell);
      numFilledNeighbors = countFilledNeighbors(neighbors);
      updateBlockTypes(node, numFilledNeighbors);
    }
  }
}

/**
 * Returns true if the cell is above the ground level.
 */
function isAboveGround(cell, node) {
  let y = cell.y;
  let noiseAmount = node.density * y;
  let yLevel = HEIGHT - y;
  return noiseAmount < yLevel;
}

/**
 * Counts how many neighbors are not of type sky.
 */
function countFilledNeighbors(neighbors) {
  let numFilledNeighbors = 0;
  for (let i = 0; i < neighbors.length; i++) {
    let neighbor = neighbors[i];
    if (neighbor.blockType != sky) {
      numFilledNeighbors++;
    }
  }
  return numFilledNeighbors;
}
/**
 * Updates the block type of the node based on the number of filled neighbors.
 * If there are more than 4 filled neighbors, check for small air pockets
 * if there are 4 or fewer filled neighbors, set node to stone.
 */
function updateBlockTypes(node, numFilledNeighbors) {
  if (numFilledNeighbors > 4) {
    fillSmallGapsWithStone(node, numFilledNeighbors);
  } else {
    node.blockType = sky;
  }
}
/**
 * Fills small air pockets with stone.
 */
function fillSmallGapsWithStone(node, numFilledNeighbors) {
  if (numFilledNeighbors > 6 && node.blockType === sky) {
    node.blockType = stone;
  }
}

/**
 * Returns an array of neighboring cells.
 */
function getNeighbors(cell) {
  let neighbors = [];
  let x = cell.x;
  let y = cell.y;
  let xMin = x - BLOCK_SIZE;
  let xMax = x + BLOCK_SIZE;
  let yMin = y - BLOCK_SIZE;
  let yMax = y + BLOCK_SIZE;

  for (let i = xMin; i <= xMax; i += BLOCK_SIZE) {
    for (let j = yMin; j <= yMax; j += BLOCK_SIZE) {
      if (i === x && j === y) {
        continue;
      }
      let neighbor = getNeighbor(i, j);
      neighbors.push(neighbor);
    }
  }
  return neighbors;
}
/**
 * Gets a neighbor to check if it's filled.
 * Neighbors outside of world are set to stone.
 */
function getNeighbor(x, y) {
  let nodeX = x - (x % BLOCK_SIZE);
  let nodeY = y - (y % BLOCK_SIZE);

  let xIndex = nodeX / BLOCK_SIZE;
  let yIndex = nodeY / BLOCK_SIZE;

  let index = yIndex + xIndex * HEIGHT_IN_BLOCKS;
  let cell = cells[index];
  return getNeighborFromCell(x, y, cell);
}

/**
 * Returns a neighbor from a cell. If the cell is outside of the world,
 * sets the cell to stone.
 */
function getNeighborFromCell(x, y, cell) {
  if (y < 0 || y >= HEIGHT || x < 0 || x >= WIDTH) {
    cell = {
      blockType: stone,
    };
    return cell;
  }
  return cell;
}

/**
 * Seeds the cave with random sky blocks that can be used
 * to simulate caves.
 */
function seedCave(node) {
  if (CAVE_DENSITY > random(100)) {
    node.blockType = sky;
  }
}
