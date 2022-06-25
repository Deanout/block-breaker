function simulateWater() {
  addPendingPlayerPlacedFluids();
  calculateRemainingMasses();
  copyMasses();
  setBlockTypesByMass();

  cleanupMassBoundaries();
}

function addPendingPlayerPlacedFluids() {
  while (playerAddedMasses.length > 0) {
    let massToAdd = playerAddedMasses.pop();
    let node = findNode(massToAdd.x, massToAdd.y);
    node.blockType = water;
    let newMass = findNewMass(massToAdd.x, massToAdd.y);

    newMass.value += massToAdd.value;
  }
}

function calculateRemainingMasses() {
  for (let x = 0; x < WIDTH; x += BLOCK_SIZE) {
    for (let y = 0; y < HEIGHT; y += BLOCK_SIZE) {
      let node = findNode(x, y);

      if (!nonSolidBlocks.includes(node.blockType)) {
        continue;
      }
      let mass = findMass(x, y);
      let remainingMass = mass.value;
      if (remainingMass <= 0) {
        continue;
      }
      remainingMass = pushWaterToBlockBelow(
        x,
        y,
        nonSolidBlocks,
        remainingMass
      );
      if (remainingMass <= 0) {
        continue;
      }
      remainingMass = pushWaterToBlockLeft(x, y, nonSolidBlocks, remainingMass);
      if (remainingMass <= 0) {
        continue;
      }
      remainingMass = pushWaterToBlockRight(
        x,
        y,
        nonSolidBlocks,
        remainingMass
      );
      if (remainingMass <= 0) {
        continue;
      }
      remainingMass = pushWaterToBlockAbove(
        x,
        y,
        nonSolidBlocks,
        remainingMass
      );
    }
  }
}

function setBlockTypesByMass() {
  for (let x = 1; x < WIDTH - 1; x += BLOCK_SIZE) {
    for (let y = 1; y < HEIGHT - 1; y += BLOCK_SIZE) {
      let node = findNode(x, y);
      let mass = findMass(x, y);
      if (!nonSolidBlocks.includes(node.blockType)) {
        continue;
      }
      if (mass.value > MIN_MASS) {
        node.blockType = water;
      } else {
        node.blockType = sky;
        mass.value = 0;
      }
    }
  }
}

function copyMasses() {
  newMasses.forEach((newMass) => {
    let mass = findMass(newMass.x, newMass.y);
    mass.value = newMass.value;
  });
  for (let x = 0; x < WIDTH; x += BLOCK_SIZE) {
    for (let y = 0; y < HEIGHT; y += BLOCK_SIZE) {
      let mass = findMass(x, y);
      let newMass = findNewMass(x, y);
      mass.value = newMass.value;
    }
  }
}

function pushWaterToBlockBelow(x, y, nonSolidBlocks, remainingMass) {
  let blockBelow = findNode(x, y + BLOCK_SIZE);
  if (nonSolidBlocks.includes(blockBelow.blockType)) {
    let mass = findMass(x, y + BLOCK_SIZE);
    let Flow =
      checkHowToDistributeWaterVertically(remainingMass + mass.value) -
      mass.value;

    if (Flow > MIN_FLOW) {
      // Smooth flow
      Flow *= 0.5;
    }

    let minOfMaxSpeedAndRemainingMass = Math.min(
      MAX_WATER_SPEED,
      remainingMass
    );
    Flow = clamp(Flow, 0, minOfMaxSpeedAndRemainingMass);
    let topNewMass = findNewMass(x, y);
    let bottomNewMass = findNewMass(x, y + BLOCK_SIZE);
    topNewMass.value -= Flow;
    bottomNewMass.value += Flow;
    remainingMass -= Flow;
  }
  return remainingMass;
}

function pushWaterToBlockLeft(x, y, nonSolidBlocks, remainingMass) {
  let blockLeft = findNode(x - BLOCK_SIZE, y);
  if (!blockLeft) {
    return remainingMass;
  }
  if (nonSolidBlocks.includes(blockLeft.blockType)) {
    let mass = findMass(x, y);
    let neighborMass = findMass(x - BLOCK_SIZE, y);
    // Equalize amount of water in this block and its neighbor
    let Flow = (mass.value - neighborMass.value) / 4;
    if (Flow > MIN_FLOW) {
      // Smooth flow
      Flow *= 0.5;
    }

    Flow = clamp(Flow, 0, remainingMass);
    let rightNewMass = findNewMass(x, y);
    let leftNewMass = findNewMass(x - BLOCK_SIZE, y);
    rightNewMass.value -= Flow;
    leftNewMass.value += Flow;
    remainingMass -= Flow;
  }
  return remainingMass;
}

function pushWaterToBlockRight(x, y, nonSolidBlocks, remainingMass) {
  let blockRight = findNode(x + BLOCK_SIZE, y);
  if (!blockRight) {
    return;
  }
  if (nonSolidBlocks.includes(blockRight.blockType)) {
    let mass = findMass(x, y);
    let neighborMass = findMass(x + BLOCK_SIZE, y);
    // Equalize amount of water in this block and its neighbor
    let Flow = (mass.value - neighborMass.value) / 4;
    if (Flow > MIN_FLOW) {
      // Smooth flow
      Flow *= 0.5;
    }

    Flow = clamp(Flow, 0, remainingMass);

    let leftNewMass = findNewMass(x, y);
    let rightNewMass = findNewMass(x + BLOCK_SIZE, y);

    leftNewMass.value -= Flow;
    rightNewMass.value += Flow;
    remainingMass -= Flow;
  }
  return remainingMass;
}

function pushWaterToBlockAbove(x, y, nonSolidBlocks, remainingMass) {
  let blockAbove = findNode(x, y - BLOCK_SIZE);
  if (!blockAbove) {
    return;
  }
  if (nonSolidBlocks.includes(blockAbove.blockType)) {
    // Equalize amount of water in this block and its neighbor
    let mass = findMass(x, y - BLOCK_SIZE);
    let Flow =
      remainingMass -
      checkHowToDistributeWaterVertically(remainingMass + mass.value);
    if (Flow > MIN_FLOW) {
      // Smooth flow
      Flow *= 0.5;
    }
    let minOfMaxSpeedAndRemainingMass = Math.min(
      MAX_WATER_SPEED,
      remainingMass
    );

    Flow = clamp(Flow, 0, minOfMaxSpeedAndRemainingMass);

    let bottomNewMass = findNewMass(x, y);
    let topNewMass = findNewMass(x, y - BLOCK_SIZE);

    bottomNewMass.value -= Flow;
    topNewMass.value += Flow;
    remainingMass -= Flow;
  }
  return remainingMass;
}

function checkHowToDistributeWaterVertically(total_mass) {
  let amountThatShouldBeBelow;
  if (total_mass <= 1) {
    amountThatShouldBeBelow = 1;
  } else if (total_mass < 2 * MAX_MASS + COMPRESSION) {
    amountThatShouldBeBelow =
      (MAX_MASS * MAX_MASS + total_mass * COMPRESSION) /
      (MAX_MASS + COMPRESSION);
  } else {
    amountThatShouldBeBelow = (total_mass + COMPRESSION) / 2;
  }
  return amountThatShouldBeBelow;
}

function cleanupMassBoundaries() {
  cleanupTopAndBottomMasses();
  cleanupLeftAndRightMasses();
}

function cleanupLeftAndRightMasses() {
  for (let y = 0; y < HEIGHT; y += BLOCK_SIZE) {
    let leftMass = findMass(0, y);
    let rightMass = findMass(WIDTH + BLOCK_SIZE, y);
    if (leftMass) {
      leftMass.value = 0;
    }
    if (rightMass) {
      rightMass.value = 0;
    }
  }
}

function cleanupTopAndBottomMasses() {
  for (let x = 0; x < WIDTH; x += BLOCK_SIZE) {
    let topMass = findMass(x, 0);
    let bottomMass = findMass(x, HEIGHT + BLOCK_SIZE);
    if (topMass) {
      topMass.value = 0;
    }
    if (bottomMass) {
      bottomMass.value = 0;
    }
  }
}
