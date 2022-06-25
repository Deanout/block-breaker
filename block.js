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
  if (nodeX < 0 || nodeY < 0) {
    return null;
  }
  if (nodeX > WIDTH || nodeY > HEIGHT) {
    return null;
  }
  let xIndex = nodeX / BLOCK_SIZE;
  let yIndex = nodeY / BLOCK_SIZE;
  let index = yIndex + xIndex * HEIGHT_IN_BLOCKS;

  return searchSpace[index];
  // for (let i = 0; i < searchSpace.length; i++) {
  //   if (searchSpace[i].x === nodeX && searchSpace[i].y === nodeY) {
  //     return searchSpace[i];
  //   }
  // }
}

function findCenterNodeX(width) {
  let centerNodeX = width - (width % BLOCK_SIZE);
  return centerNodeX;
}
