/**
 * Causes a water block to fill any adjacent empty blocks.
 * A block is empty if it has a blockType of sky.
 */
function simulateWater() {
  let neighbors = [];
  for (let i = 0; i < grid.length; i++) {
    let node = grid[i];
    if (node.blockType !== water || node.isFlowing === false) {
      continue;
    }
    let { x, y } = node;
    let node_neighbors = getBlocksAtOrBelowNode(x, y);
    for (let neighbor of node_neighbors) {
      if (!neighbors.includes(neighbor)) {
        neighbors.push(neighbor);
      }
    }
    node.isFlowing = false;
    console.log(node);
  }
  flowToNeighbors(neighbors);
}

function flowToNeighbors(neighbors) {
  for (let neighbor of neighbors) {
    if (neighbor.blockType === sky || neighbor.blockType === player) {
      neighbor.blockType = water;
      neighbor.isFlowing = true;
    } else {
      neighbor.isFlowing = false;
    }
  }
}

function getBlocksAtOrBelowNode(x, y) {
  let neighbors = [];
  let right_neighbor = findNode(x + BLOCK_SIZE, y);
  let left_neighbor = findNode(x - BLOCK_SIZE, y);
  let bottom_neighbor = findNode(x, y + BLOCK_SIZE);
  if (right_neighbor) {
    neighbors.push(right_neighbor);
  }
  if (left_neighbor) {
    neighbors.push(left_neighbor);
  }
  if (bottom_neighbor) {
    neighbors.push(bottom_neighbor);
  }

  return neighbors;
}

function updateFluidSimulationAtNode(node, shouldBeFlowing) {
  if (node.blockType === water) {
    node.isFlowing = shouldBeFlowing;
  }
  let neighbors = getNeighbors(node);
  for (let neighbor of neighbors) {
    if (neighbor.blockType === water) {
      neighbor.isFlowing = shouldBeFlowing;
    }
  }
}

function getNeighbors(node) {
  let neighbors = [];
  neighbors.push(findNode(node.x - BLOCK_SIZE, node.y));
  neighbors.push(findNode(node.x + BLOCK_SIZE, node.y));
  neighbors.push(findNode(node.x, node.y + BLOCK_SIZE));
  neighbors.push(findNode(node.x, node.y - BLOCK_SIZE));

  return neighbors;
}
