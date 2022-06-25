const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 0.9;
const BLOCK_SIZE = 25;
const WIDTH_IN_BLOCKS = calculateValueInBlocks(WIDTH);
const HEIGHT_IN_BLOCKS = calculateValueInBlocks(HEIGHT);

const MAX_MASS = 25;
const MIN_MASS = 1;
const COMPRESSION = 0.02;
const MAX_WATER_SPEED = 5;
const MIN_FLOW = 1;

const CENTER_WIDTH = calculateCenter(WIDTH);
const CENTER_HEIGHT = calculateCenter(HEIGHT);

const JUMP_HEIGHT = 3;
const PLAYER_REACH = BLOCK_SIZE * 50;

/**
 * Calculate the value in blocks, rounded up to the nearest multiple of block size.
 */
function calculateValueInBlocks(value) {
  let returnValue;
  if (value % BLOCK_SIZE === 0) {
    returnValue = value / BLOCK_SIZE;
  } else {
    returnValue = Math.ceil(value / BLOCK_SIZE);
  }
  console.log(`${value} is ${returnValue} blocks`);
  return returnValue;
}

function calculateCenter(size) {
  if (size % 2 == 0) {
    return size / 2;
  } else {
    return (size - 1) / 2;
  }
}
