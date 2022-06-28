function findNode(x, y) {
  return findByXY(x, y, grid);
}

function findMass(x, y) {
  return findByXY(x, y, masses);
}
function findNewMass(x, y) {
  return findByXY(x, y, newMasses);
}

function findByXY(x, y, searchSpace) {
  let nodeX = x - (x % BLOCK_SIZE);
  let nodeY = y - (y % BLOCK_SIZE);

  let xIndex = clamp(nodeX / BLOCK_SIZE, 0, WIDTH_IN_BLOCKS - 1);
  let yIndex = clamp(nodeY / BLOCK_SIZE, 0, HEIGHT_IN_BLOCKS - 1);

  let index = yIndex + xIndex * HEIGHT_IN_BLOCKS;
  return searchSpace[index];
}

function findCenterNodeX(width) {
  let centerNodeX = width - (width % BLOCK_SIZE);
  return centerNodeX;
}

function clearMassFromNode(x, y) {
  let mass = findMass(x, y);
  let newMass = findNewMass(x, y);
  mass.value = 0;
  newMass.value = 0;
}
