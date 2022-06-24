function findNode(x, y) {
  let nodeX = x - (x % BLOCK_SIZE);
  let nodeY = y - (y % BLOCK_SIZE);
  if (nodeX < 0 || nodeY < 0) {
    return null;
  }
  if (nodeX > WIDTH || nodeY > HEIGHT) {
    return null;
  }
  for (let i = 0; i < grid.length; i++) {
    if (grid[i].x === nodeX && grid[i].y === nodeY) {
      return grid[i];
    }
  }
}

function findCenterNodeX(width) {
  let centerNodeX = width - (width % BLOCK_SIZE);
  return centerNodeX;
}
