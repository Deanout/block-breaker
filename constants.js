const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 0.9;
const BLOCK_SIZE = 25;
const JUMP_HEIGHT = 3;
const PLAYER_REACH = BLOCK_SIZE * 500;

const MAX_MASS = BLOCK_SIZE;
const MIN_MASS = 1;
const COMPRESSION = 0.02;
const MAX_WATER_SPEED = 5;
const MIN_FLOW = 1;

const TREE_GROWTH_STAGES = 7;
const TREE_GROWTH_RATE = 10;
const TREE_PLANT_RATE = 10;

const LEAF_DECAY_RATE = 10;
const LEAF_WOOD_RANGE = 4;
const LEAF_WOOD_RANGE_IN_BLOCKS = LEAF_WOOD_RANGE * BLOCK_SIZE;
const SAPLING_DROP_RATE = 8;

const CAVE_DENSITY = 25;
const CAVE_ITERATIONS = 5;

const WIDTH_IN_BLOCKS = calculateValueInBlocks(WIDTH);
const HEIGHT_IN_BLOCKS = calculateValueInBlocks(HEIGHT);
const CENTER_WIDTH = calculateCenter(WIDTH);
const CENTER_HEIGHT = calculateCenter(HEIGHT);

function calculateCenter(size) {
  if (size % 2 === 0) {
    return size / 2;
  }
  return (size - 1) / 2;
}
/**
 * Calculate the value in blocks,
 * rounded up to the nearest multiple of block size.
 */
function calculateValueInBlocks(value) {
  let returnValue;
  if (value % BLOCK_SIZE === 0) {
    returnValue = value / BLOCK_SIZE;
  } else {
    returnValue = Math.ceil(value / BLOCK_SIZE);
  }
  console.log(`${value} in blocks is ${returnValue} blocks`);
  return returnValue;
}
