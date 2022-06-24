const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight * 0.9;
const BLOCK_SIZE = 25;

const CENTER_WIDTH = calculateCenter(WIDTH);
const CENTER_HEIGHT = calculateCenter(HEIGHT);

const JUMP_HEIGHT = 3;
const PLAYER_REACH = BLOCK_SIZE * 5;

function calculateCenter(size) {
  if (size % 2 == 0) {
    return size / 2;
  } else {
    return (size - 1) / 2;
  }
}
