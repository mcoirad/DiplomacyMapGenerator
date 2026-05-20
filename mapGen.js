/*
  2025 dario.technology
  https://editor.p5js.org/mcoirad/full/om-x0gXQF
*/

let noiseCanvas;
let uniqueTerritoryMap;
let cityNamesOverlay;
let noiseScale = 0.015;
let noiseSeedValue = "";
let heightMap = [];
let waterLevel = 0.3;
let gradientType = "radial";
let noiseType = "basic";
let numCities = 70;
let cities = [];
let numWaterCities = 30;
let waterCities = [];
let minLandDistance = 20;
let noiseGrid = [];
let territories = [];
let cityGroups = [];
let X = 7; // Number of groups
let Y = 6; // Cities per group
let startingSupplyNum = 3;
let supplyCenters = [];
let selectedUngrouped = [];

let imageSourceValues = null;

let minWaterDistance = 100;

let noiseSeedInput;
let helpIsolatedPlayerRadio;
let modErosionCheck = false;
let buffNumCentralPlayers = 1;
let ensureWaterConnectedCheck = false;

let mapSize = 1000;

let cityNamesDict = {};

let cityConnections = new Set(); // Using a Set to avoid duplicates

let waterCityConnections = new Set(); // Tracks water-to-water connections
let landWaterCityConnections = new Set(); // Tracks water-to-land connections

let waterGroups = [];

let waterCityNames = {};

let cityBoundingBoxes = {};
let countryNamesList = [];
let countryNamesListStr = "";
let startingUnits = {};

let supplyDensity = 0.5;
let fleetDensity = 0.5;

let cityPlacementStrategy = "farthestNearest";

function setup() {
  createCanvas(mapSize, mapSize);

  noiseCanvas = createGraphics(mapSize, mapSize);
  uniqueTerritoryMap = createGraphics(mapSize, mapSize);

  let btn = createButton("Regenerate Map");
  btn.mousePressed(generateNoise);
  btn.position(10, height + 10);

  let noiseSeedLabel = createSpan("Random Seed:");
  noiseSeedLabel.position(150, height + 10);
  noiseSeedInput = createInput("12345");
  noiseSeedInput.position(250, height + 10);

  let mapSizeLabel = createSpan("Map Size:");
  mapSizeLabel.position(450, height + 10);
  mapSizeInput = createInput("800");
  mapSizeInput.position(550, height + 10);

  let gradientSelectLabel = createSpan("Noise Bias:");
  gradientSelectLabel.position(10, height + 40);
  let gradientSelect = createSelect();
  gradientSelect.option("radial");
  gradientSelect.option("horizontal");
  gradientSelect.option("vertical");
  gradientSelect.option("mediterranean");
  gradientSelect.option("peninsula");
  gradientSelect.option("fjords");
  gradientSelect.option("archipelago");

  gradientSelect.option("spiral");
  gradientSelect.option("sinusoidal");
  gradientSelect.option("ridge");
  gradientSelect.option("manylakes");
  gradientSelect.option("uploadedimage");
  gradientSelect.option("diamond");
  //gradientSelect.option("concentric"); // I don't really like these
  gradientSelect.option("strata");
  gradientSelect.option("sinusoidal4way");
  //gradientSelect.option("radialbumps");
  gradientSelect.option("quadrant");
  //gradientSelect.option("valley");
  gradientSelect.option("atoll");
  gradientSelect.option("plateau");
  gradientSelect.option("riverdelta");
  gradientSelect.option("isthmus");
  gradientSelect.option("canyon");
  gradientSelect.option("volcano");
  gradientSelect.option("inlet");

  gradientSelect.option("none");
  gradientSelect.changed(() => {
    gradientType = gradientSelect.value();
    //generateNoise();
  });
  gradientSelect.position(150, height + 40);

  let noiseSelectLabel = createSpan("Noise Generator:");
  noiseSelectLabel.position(300, height + 40);
  let noiseSelect = createSelect();
  noiseSelect.option("basic");
  noiseSelect.option("fractal");
  noiseSelect.option("directional");
  noiseSelect.option("hybridfractal");

  noiseSelect.changed(() => {
    noiseType = noiseSelect.value();
    //generateNoise();
  });
  noiseSelect.position(450, height + 40);

  let waterLevelLabel = createSpan("Water Level: 0.3 (0-1)");
  waterLevelLabel.position(350, height + 100);
  let waterLevelSelect = createSlider(0, 1, 0.3, 0.05);
  waterLevelSelect.position(500, height + 100);
  waterLevelSelect.changed(() => {
    waterLevel = waterLevelSelect.value();
    waterLevelLabel.html(`Water Level: ${waterLevel}`);
  });

  let gradientScaleLabel = createSpan("Noise Scale:");
  gradientScaleLabel.position(10, height + 70);
  let gradientSlider = createSlider(0.001, 0.025, 0.015, 0.001);
  gradientSlider.position(150, height + 70);
  gradientSlider.size(80);
  gradientSlider.changed(() => {
    noiseScale = gradientSlider.value();
    //generateNoise();
  });

  let placementLabel = createSpan("Player Placement Algorithm:");
  placementLabel.position(300, height + 70);
  let placementDropdown = createSelect();
  placementDropdown.option("farthestNearest");
  placementDropdown.option("farthestAverage");
  placementDropdown.option("farthestFromCenter");
  placementDropdown.option("gridBased");
  placementDropdown.option("random");
  placementDropdown.position(500, height + 70);
  placementDropdown.changed(() => {
    cityPlacementStrategy = placementDropdown.value();
  });

  let numPlayersLabel = createSpan("Number of Players: 7 (2-20)");
  numPlayersLabel.position(10, height + 100);
  let numPlayersSelect = createSlider(2, 20, 7, 1);
  numPlayersSelect.position(200, height + 100);
  numPlayersSelect.changed(() => {
    X = numPlayersSelect.value();
    numPlayersLabel.html(`Number of Players: ${X}`);
  });

  let numPlayerCitiesLabel = createSpan("Regions per player: 6 (3-20)");
  numPlayerCitiesLabel.position(10, height + 130);
  let numPlayersCitiesSelect = createSlider(3, 20, 6, 1);
  numPlayersCitiesSelect.position(200, height + 130);
  numPlayersCitiesSelect.changed(() => {
    Y = numPlayersCitiesSelect.value();
    numPlayerCitiesLabel.html(`Regions per player: ${Y}`);
  });

  let numWaterRegionsLabel = createSpan("Num water regions: 20 (5-200)");
  numWaterRegionsLabel.position(350, height + 130);
  let numWaterRegionsSelect = createSlider(5, 200, 20, 1);
  numWaterRegionsSelect.position(550, height + 130);
  numWaterRegionsSelect.changed(() => {
    numWaterCities = numWaterRegionsSelect.value();
    numWaterRegionsLabel.html(`Num water regions: ${numWaterCities}`);
  });

  let numCitiesLabel = createSpan("Num Land Regions: 60 (20-200)");
  numCitiesLabel.position(10, height + 160);
  let numCitiesSelect = createSlider(20, 200, 60, 1);
  numCitiesSelect.position(200, height + 160);
  numCitiesSelect.changed(() => {
    numCities = numCitiesSelect.value();
    numCitiesLabel.html(`Total Regions: ${numCities}`);
  });

  let minLandDistanceLabel = createSpan("Min Land Dist: 20 (5-200)");
  minLandDistanceLabel.position(350, height + 160);
  let minLandDistanceSelect = createSlider(5, 200, 20, 5);
  minLandDistanceSelect.position(550, height + 160);
  minLandDistanceSelect.changed(() => {
    minLandDistance = minLandDistanceSelect.value();
    minLandDistanceLabel.html(`Min Land Dist: ${minLandDistance}`);
  });

  let startingSupplyLabel = createSpan("Starting Bases: 3 (1-20)");
  startingSupplyLabel.position(10, height + 190);
  let startingSupplySelect = createSlider(1, 20, 3, 1);
  startingSupplySelect.position(200, height + 190);
  startingSupplySelect.changed(() => {
    startingSupplyNum = startingSupplySelect.value();
    startingSupplyLabel.html(`Starting Bases: ${startingSupplyNum}`);
  });

  let minWaterDistanceLabel = createSpan("Min Water Dist: 100 (5-300)");
  minWaterDistanceLabel.position(350, height + 190);
  let minWaterDistanceSelect = createSlider(5, 300, 100, 5);
  minWaterDistanceSelect.position(550, height + 190);
  minWaterDistanceSelect.changed(() => {
    minWaterDistance = minWaterDistanceSelect.value();
    minWaterDistanceLabel.html(`Min Water Dist: ${minWaterDistance}`);
  });

  let isolatedPlayerLabel = createSpan(
    "Help Most Isolated Player (adds nearby supply center)"
  );
  isolatedPlayerLabel.position(10, height + 220);
  helpIsolatedPlayerRadio = createRadio();
  helpIsolatedPlayerRadio.position(30, height + 250);
  helpIsolatedPlayerRadio.size(60);

  // Add a few color options.
  helpIsolatedPlayerRadio.option("No");
  helpIsolatedPlayerRadio.option("Yes");

  // Choose a default option.
  helpIsolatedPlayerRadio.selected("Yes");

  let buffCentralPlayersLabel = createSpan(
    "Buff X Most Central Players (adds Home SC): 1 (0-6)"
  );
  buffCentralPlayersLabel.position(10, height + 300);
  let buffCentralPlayersSelect = createSlider(0, 6, 1, 1);
  buffCentralPlayersSelect.position(400, height + 300);
  buffCentralPlayersSelect.changed(() => {
    buffNumCentralPlayers = buffCentralPlayersSelect.value();
    buffCentralPlayersLabel.html(
      `Buff X Most Central Players : ${buffNumCentralPlayers}`
    );
  });

  modErosionCheck = createCheckbox("Simulate erosion/Flatten", false);
  modErosionCheck.position(500, height + 220);

  let imageInputLabel = createSpan(
    "Image input (use 'uploadedimage' as Noise Bias)"
  );
  imageInputLabel.position(450, height + 250);
  imageInput = createFileInput(handleImageUpload);
  imageInput.position(450, height + 270);

  ensureWaterConnectedCheck = createCheckbox(
    "Draw Rivers/Ensure all water areas connected (can take awhile)",
    false
  );
  ensureWaterConnectedCheck.position(10, height + 330);

  ensurePlayerWaterConnectedCheck = createCheckbox(
    "Draw Rivers/Ensure each player can access the water (can take awhile)",
    false
  );
  ensurePlayerWaterConnectedCheck.position(10, height + 360);

  let supplyDensityLabel = createSpan(
    "Neutral Supply Center Density: 0.5 (0-1)"
  );
  supplyDensityLabel.position(10, height + 390);
  let supplyDensitySelect = createSlider(0, 1, 0.5, 0.1);
  supplyDensitySelect.position(300, height + 390);
  supplyDensitySelect.changed(() => {
    supplyDensity = supplyDensitySelect.value();
    supplyDensityLabel.html(`Neutral Supply Center Density: ${supplyDensity}`);
  });

  let fleetCenterDensityLabel = createSpan("Starting fleet Density: 0.5 (0-1)");
  fleetCenterDensityLabel.position(10, height + 420);
  let fleetDensitySelect = createSlider(0, 1, 0.5, 0.1);
  fleetDensitySelect.position(250, height + 420);
  fleetDensitySelect.changed(() => {
    fleetDensity = fleetDensitySelect.value();
    fleetCenterDensityLabel.html(`Starting fleet Density: ${fleetDensity}`);
  });

  let downloadButton = createButton("Export as webDip variant (experimental)");
  downloadButton.mousePressed(downloadPHPMapAsZip);
  downloadButton.position(10, height + 450);

  generateNoise();
}

function generateNoise() {
  createCanvas(parseInt(mapSizeInput.value()), parseInt(mapSizeInput.value()));
  noiseCanvas = createGraphics(width, height);
  uniqueTerritoryMap = createGraphics(width, height);
  clear();
  noiseSeedValue = noiseSeedInput.value();
  if (noiseSeedValue == "") {
    noiseSeedValue = millis();
    //console.log(noiseSeedValue);
  }
  noiseSeed(noiseSeedValue);
  randomSeed(noiseSeedValue);
  noiseCanvas.loadPixels();
  uniqueTerritoryMap.loadPixels();
  noiseGrid = [];

  for (let x = 0; x < width; x++) {
    noiseGrid[x] = [];
    heightMap[x] = [];
    for (let y = 0; y < height; y++) {
      let noiseVal = getNoise(x, y);
      let distFactor = getGradientFactor(x, y);
      noiseVal *= 1 - distFactor;
      noiseGrid[x][y] = noiseVal > waterLevel ? 1 : 0; // 1 = land, 0 = water
      heightMap[x][y] = noiseVal;
    }
  }

  doMapGeneration();

  // Ensure all water zones are connected if feature is set
  let numIterations = 0;
  while (waterGroups.length > 1 && ensureWaterConnectedCheck.checked()) {
    let closestCities = findClosestCitiesBetweenGroups(
      waterGroups[0],
      waterGroups[1]
    );
    console.log("Drawing a river!");
    drawRiver(
      closestCities[0][0],
      closestCities[0][1],
      closestCities[1][0],
      closestCities[1][1],
      2
    );
    doMapGeneration();
    numIterations += 1;
    if (numIterations > 10) {
      console.error(
        `Hit max iterations of ${numIterations} on attempting to connect all waterzones.`
      );
      break;
    }
  }

  // Ensure each player has access to the water if feature is set
  let cityGroupsWithoutWater = findCityGroupsWithoutWaterAccess();
  console.log(cityGroupsWithoutWater);
  numIterations = 0;
  while (
    cityGroupsWithoutWater.length > 0 &&
    numIterations < 10 &&
    ensurePlayerWaterConnectedCheck.checked()
  ) {
    let closestCities = findClosestCitiesBetweenGroups(
      cityGroupsWithoutWater[0].map((city) => [city.x, city.y]),
      waterCities.map((city) => [city.x, city.y])
    );
    drawRiver(
      closestCities[0][0],
      closestCities[0][1],
      closestCities[1][0],
      closestCities[1][1],
      2
    );
    doMapGeneration();
    cityGroupsWithoutWater = findCityGroupsWithoutWaterAccess();
    numIterations += 1;
    if (numIterations >= 10) {
      console.error(
        `Hit max iterations of ${numIterations} on attempting to connect all players to waterzones.`
      );
      break;
    }
  }
  generateCountryNames();
  assignStartingUnits();
  cityNamesOverlay = generateCityNamesOverlay();
}

function doMapGeneration() {
  //drawRiver(250, 120, 740, 600, 2);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let current = noiseGrid[x][y];
      let isBorder = false;

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let nx = x + dx;
          let ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (noiseGrid[nx][ny] !== current) {
              isBorder = true;
            }
          }
        }
      }

      let col = isBorder
        ? color(1)
        : current
          ? color(50, 50, 50)
          : color(32, 159, 201);
      noiseCanvas.set(x, y, col);
      uniqueTerritoryMap.set(x, y, col);
    }
  }
  //drawRiver(200, 200, 600, 600);
  noiseCanvas.updatePixels();
  uniqueTerritoryMap.updatePixels();
  placeCities();
  placeWaterCities();
  cityGroups = assignCityGroups(X, Y);
  assignGroupColors();
  generateTerritories();
  generateWaterTerritories();
  if (true) {
    // make an option that can be enabled
    findAndAssignExtraCities(3);
    generateTerritories();
    generateWaterTerritories();
  }

  supplyCenters = generateSupplyCenters();
  if (helpIsolatedPlayerRadio.value() == "Yes") {
    helpExpandPlayer(leastExpansivePlayer());
  }
  assignCityNames();
  waterGroups = getWaterRegionGroups();
}

function getNoise(x, y) {
  if (noiseType == "basic") {
    return noise(x * noiseScale, y * noiseScale);
  } else if (noiseType == "fractal") {
    let value = 0;
    let scale = 1;
    let amplitude = 1;
    for (let i = 0; i < 4; i++) {
      // 4 octaves for depth
      value +=
        noise(x * noiseScale * scale, y * noiseScale * scale) * amplitude;
      scale *= 2;
      amplitude *= 0.5;
    }
    return value;
  } else if (noiseType === "directional") {
    let angle = noise(x * noiseScale, y * noiseScale) * TWO_PI;
    return sin(angle) * 0.5 + 0.5;
  } else if (noiseType === "hybridfractal") {
    let value = noise(x * noiseScale, y * noiseScale);
    let frequency = 2.0;
    let amplitude = 1.0;
    let gain = 0.5;
    let offset = 1.0;

    for (let i = 1; i < 5; i++) {
      let signal = abs(
        noise(x * noiseScale * frequency, y * noiseScale * frequency)
      );
      signal = offset - signal;
      signal *= signal;
      value += signal * amplitude;
      frequency *= 2.0;
      amplitude *= gain;
    }
    return value;
  }
}

function getGradientFactor(x, y) {
  let centerX = width / 2;
  let centerY = height / 2;
  let maxDist = dist(0, 0, centerX, centerY);

  let gradientValue = 0; // Default value
  let riverEffect = 0;

  if (gradientType === "radial") {
    gradientValue = dist(x, y, centerX, centerY) / maxDist - x / width / 3;
  } else if (gradientType === "horizontal") {
    gradientValue = x / width - dist(x, y, centerX, centerY) / maxDist / 2;
  } else if (gradientType === "vertical") {
    gradientValue = y / height - dist(x, y, centerX, centerY) / maxDist / 2;
  } else if (gradientType === "mediterranean") {
    gradientValue =
      1 - dist(x, y, centerX, centerY) / maxDist - x / width / 1.5;
  } else if (gradientType === "sinusoidal") {
    gradientValue =
      (sin((x / width) * PI * 2) + sin((y / height) * PI * 2)) / 2;
  } else if (gradientType === "spiral") {
    gradientValue =
      sin(dist(x, y, centerX, centerY) * 0.1) * 0.5 -
      dist(x, y, centerX, centerY) / maxDist / 2;
  } else if (gradientType === "ridge") {
    gradientValue = abs((y - centerY) / centerY);
  } else if (gradientType === "manylakes") {
    let plate = abs(sin((x / width) * PI * 4) + cos((y / height) * PI * 4));
    return plate * 0.6 - dist(x, y, centerX, centerY) / maxDist;
  } else if (gradientType === "none") {
    gradientValue = 0;
  } else if (gradientType === "uploadedimage") {
    gradientValue = imageSourceValues[x][y];
    return gradientValue;
  } else if (gradientType === "concentric") {
    gradientValue = sin(dist(x, y, centerX, centerY) * 0.2) * 0.5;
  } else if (gradientType === "diamond") {
    gradientValue = (abs(x - centerX) + abs(y - centerY)) / maxDist;
  } else if (gradientType === "sinusoidal4way") {
    gradientValue = (sin(x * 0.01) + cos(y * 0.01)) * 0.5;
  } else if (gradientType === "quadrant") {
    gradientValue =
      (x < centerX ? y / height : (height - y) / height) -
      dist(x, y, centerX, centerY) / maxDist / 3;
  } else if (gradientType === "radialbumps") {
    gradientValue = (sin(dist(x, y, centerX, centerY) * 0.3) + 1) / 2;
  } else if (gradientType === "strata") {
    gradientValue = y / height + sin(y * 0.01) * 0.3;
  } else if (gradientType === "valley") {
    gradientValue =
      abs(y - centerY) / height - dist(x, y, centerX, centerY) / maxDist / 2;
  } else if (gradientType === "fjords") {
    let fjordEffect = sin(y * 0.02) * 0.4;
    gradientValue =
      x / width - fjordEffect - dist(x, y, centerX, centerY) / maxDist / 2;
  } else if (gradientType === "peninsula") {
    let dx = x - centerX * 0.5; // Offset to one side
    let dy = y - centerY;
    let radialFactor = dist(dx, dy, 0, 0) / maxDist;
    gradientValue = radialFactor - (x / width) * 0.3;
  } else if (gradientType === "archipelago") {
    gradientValue =
      1 -
      (sin(x * 0.015) * cos(y * 0.015)) / 2 -
      dist(x, y, centerX, centerY) / maxDist;
  } else if (gradientType === "atoll") {
    let radialFactor = dist(x, y, centerX, centerY) / maxDist;
    gradientValue = 1 - sin(radialFactor * PI * 1.6) * 0.4 - radialFactor * 0.8;
  } else if (gradientType === "plateau") {
    gradientValue = (y / height) * 0.7 + sin(x * 0.02) * 0.1;
  } else if (gradientType === "riverdelta") {
    let riverEffect = abs(sin(x * 0.01)) * 0.4;
    gradientValue =
      1 - riverEffect - dist(x, y, centerX, centerY) / maxDist / 2;
  } else if (gradientType === "isthmus") {
    let dx = abs(x - centerX);
    let landmassFactor = exp(-pow((dx / width) * 4, 4)); // Keeps a narrow land bridge
    gradientValue =
      -landmassFactor + (dist(x, y, centerX, centerY) / maxDist) * 2;
  } else if (gradientType === "canyon") {
    let canyonX = width * 0.5;
    let depth = exp(-pow(((x - canyonX) / width) * 5, 2));
    gradientValue = depth - (y / height) * 0.4;
  } else if (gradientType === "volcano") {
    let radialFactor = dist(x, y, centerX, centerY) / maxDist;
    gradientValue =
      exp(-pow(radialFactor * 3, 2)) - exp(-pow(radialFactor * 8, 2));
  } else if (gradientType === "inlet") {
    let ridgeLine = sin((x / width) * PI * 2) * 0.3;
    gradientValue =
      1 -
      abs(y / height - ridgeLine) * 2 -
      dist(x, y, centerX, centerY) / maxDist / 2;
  }

  if (modErosionCheck.checked()) {
    gradientValue *= 1 - sin((x / width) * PI) * sin((y / height) * PI);
  }

  return gradientValue;
}

function placeCities() {
  cities = [];
  let attempts = 1000;
  while (cities.length < numCities && attempts > 0) {
    let x = floor(random(width));
    let y = floor(random(height));

    // Ensure city is placed on land
    if (noiseGrid[x][y] < waterLevel) {
      attempts--;
      continue;
    }

    let valid = true;
    for (let city of cities) {
      if (dist(x, y, city.x, city.y) < minLandDistance) {
        valid = false;
        break;
      }
    }

    if (valid) {
      cities.push({ x, y });
    }
    attempts--;
  }
}

function placeWaterCities() {
  waterCities = [];
  let attempts = 1000;
  while (waterCities.length < numWaterCities && attempts > 0) {
    let x = floor(random(width));
    let y = floor(random(height));

    // Ensure city is placed on land
    if (noiseGrid[x][y] > waterLevel) {
      attempts--;
      continue;
    }

    let valid = true;
    for (let city of waterCities) {
      if (dist(x, y, city.x, city.y) < minWaterDistance) {
        valid = false;
        break;
      }
    }

    if (valid) {
      waterCities.push({ x, y });
    }
    attempts--;
  }
}

function findAndAssignExtraCities(numExtraCities) {
  let unassignedLandSets = [];
  let visited = new Set();

  // Find unassigned land areas
  function floodFill(startX, startY) {
    let stack = [[startX, startY]];
    let landSet = new Set();

    while (stack.length > 0) {
      let [x, y] = stack.pop();
      let key = `${x},${y}`;

      if (visited.has(key)) continue;
      visited.add(key);
      landSet.add([x, y]);

      let neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];

      for (let [nx, ny] of neighbors) {
        let nKey = `${nx},${ny}`;
        if (
          nx >= 0 &&
          nx < width &&
          ny >= 0 &&
          ny < height &&
          !visited.has(nKey) &&
          noiseGrid[nx][ny] > waterLevel && // Must be land
          territories[nx][ny] === null // Must not already belong to a territory
        ) {
          stack.push([nx, ny]);
        }
      }
    }

    return landSet;
  }

  // Identify and group unassigned land areas
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let key = `${x},${y}`;
      if (
        !visited.has(key) &&
        noiseGrid[x][y] > waterLevel && // Must be land
        territories[x][y] === null // Must not already belong to a territory
      ) {
        let newLandSet = floodFill(x, y);
        if (newLandSet.size > 0) {
          unassignedLandSets.push(newLandSet);
        }
      }
    }
  }

  unassignedLandSets.sort((a, b) => b.size - a.size);

  // Assign up to numExtraCities extra cities in these regions
  let extraCities = [];
  for (let i = 0; i < numExtraCities && unassignedLandSets.length > 0; i++) {
    let chosenSet = Array.from(unassignedLandSets[0]); // Convert Set to Array
    let randomPoint = chosenSet[floor(random(chosenSet.length))]; // Pick a random point

    let newCity = { x: randomPoint[0], y: randomPoint[1] };
    cities.push(newCity);
    extraCities.push(newCity);

    // Mark the territory as occupied
    //territories[newCity.x][newCity.y] = cities.length - 1;

    // Remove the processed set
    unassignedLandSets.shift();
  }

  console.log(`Added ${extraCities.length} extra cities:`, extraCities);
  return extraCities;
}

function generateTerritories() {
  territories = Array.from(Array(width), () => new Array(height).fill(null));
  let queue = new PriorityQueue({
    comparator: (a, b) => a.score - b.score, // Min-heap, lowest score first
  });

  let cityToGroup = new Map();
  cityGroups.forEach((group, groupIndex) => {
    group.forEach((city) => {
      cityToGroup.set(city, groupIndex);
    });
  });

  let cityConnectionsSet = new Set(); // Use a Set to avoid duplicates
  cityConnections = []; // Store the final unique connections

  function weight(x1, y1, x2, y2) {
    let horiz = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    let vert = heightMap[x2][y2] - heightMap[x1][y1];
    if (vert > 0) vert *= 500;
    let diff = 1 + 0.25 * Math.pow(vert / horiz, 2);
    return horiz * diff;
  }

  let territoryColors = {}; // Store colors for each land territory

  let usedColors = new Set(); // Track used colors

  function getUniqueColor() {
    let r, g, b, newColor;
    do {
      r = floor(random(50, 200));
      g = floor(random(50, 200));
      b = floor(random(50, 200));
      newColor = color(r, g, b);
    } while (usedColors.has(newColor.toString())); // Ensure uniqueness
    usedColors.add(newColor.toString());
    return newColor;
  }

  let visited = new Set();

  for (let i = 0; i < cities.length; i++) {
    let city = cities[i];
    let key = `${city.x},${city.y}`;
    territories[city.x][city.y] = i;
    visited.add(key);
    queue.queue({ x: city.x, y: city.y, cityIndex: i, score: 0 });
  }

  while (queue.length > 0) {
    let { x, y, cityIndex, score } = queue.dequeue();
    let neighbors = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];

    for (let { dx, dy } of neighbors) {
      let nx = x + dx;
      let ny = y + dy;
      let key = `${nx},${ny}`;
      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        !visited.has(key) &&
        noiseGrid[nx][ny] > waterLevel
      ) {
        let newScore = score + weight(x, y, nx, ny);
        territories[nx][ny] = cityIndex;
        visited.add(key);
        queue.queue({ x: nx, y: ny, cityIndex, score: newScore });
      }
    }
  }

  noiseCanvas.loadPixels();
  uniqueTerritoryMap.loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (territories[x][y] !== null) {
        let cityIndex = territories[x][y];
        let city = cities[cityIndex];
        let groupIndex = cityToGroup.get(city);
        let isBorder = false;

        if (!territoryColors[cityIndex]) {
          territoryColors[cityIndex] = getUniqueColor();
        }

        noiseCanvas.set(x, y, groupColors[groupIndex]);
        uniqueTerritoryMap.set(x, y, territoryColors[cityIndex]);

        let neighbors = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ];

        for (let { dx, dy } of neighbors) {
          let nx = x + dx;
          let ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (
              territories[nx][ny] !== null &&
              territories[nx][ny] !== cityIndex
            ) {
              let connectedCityIndex = territories[nx][ny];
              let connectedCity = cities[connectedCityIndex];

              // Create a unique key for the connection, ensuring consistent ordering
              let connectionKey =
                city.x < connectedCity.x ||
                  (city.x === connectedCity.x && city.y < connectedCity.y)
                  ? `${city.x},${city.y}-${connectedCity.x},${connectedCity.y}`
                  : `${connectedCity.x},${connectedCity.y}-${city.x},${city.y}`;

              // Add only if it's not already present
              if (!cityConnectionsSet.has(connectionKey)) {
                cityConnectionsSet.add(connectionKey);
                cityConnections.push([
                  [city.x, city.y],
                  [connectedCity.x, connectedCity.y],
                ]);
              }

              isBorder = true;
            }
          }
        }

        if (isBorder) {
          noiseCanvas.set(x, y, color(128)); // Black for borders
          uniqueTerritoryMap.set(x, y, color(128));
        }
      }
    }
  }
  noiseCanvas.updatePixels();
  uniqueTerritoryMap.updatePixels();

  console.log("City Connections:", cityConnections);
}

function generateWaterTerritories() {
  waterTerritories = Array.from(Array(width), () =>
    new Array(height).fill(null)
  );
  let queue = [];

  let waterCityConnectionsSet = new Set(); // Tracks unique water-to-water connections
  let landWaterCityConnectionsSet = new Set(); // Tracks unique water-to-land connections
  waterCityConnections = []; // Final list
  landWaterCityConnections = []; // Final list

  let seaColor = color(32, 159, 201);

  for (let i = 0; i < waterCities.length; i++) {
    let city = waterCities[i];
    waterTerritories[city.x][city.y] = i;
    queue.push({ x: city.x, y: city.y, cityIndex: i });
  }

  while (queue.length > 0) {
    let { x, y, cityIndex } = queue.shift();
    let neighbors = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];

    for (let { dx, dy } of neighbors) {
      let nx = x + dx;
      let ny = y + dy;
      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        waterTerritories[nx][ny] === null &&
        noiseGrid[nx][ny] < waterLevel
      ) {
        waterTerritories[nx][ny] = cityIndex;
        queue.push({ x: nx, y: ny, cityIndex });
      }
    }
  }

  noiseCanvas.loadPixels();
  uniqueTerritoryMap.loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (waterTerritories[x][y] !== null) {
        let cityIndex = waterTerritories[x][y];
        let city = waterCities[cityIndex];
        let isWaterBorder = false;
        let isLandWaterBorder = false;
        let neighbors = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ];

        for (let { dx, dy } of neighbors) {
          let nx = x + dx;
          let ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            let neighborCityIndex = waterTerritories[nx][ny];
            let neighborLandCityIndex = territories[nx][ny];

            if (neighborCityIndex !== null && neighborCityIndex !== cityIndex) {
              // Water-to-water connection
              let connectedCity = waterCities[neighborCityIndex];

              // Ensure unique ordering
              let connectionKey =
                city.x < connectedCity.x ||
                  (city.x === connectedCity.x && city.y < connectedCity.y)
                  ? `${city.x},${city.y}-${connectedCity.x},${connectedCity.y}`
                  : `${connectedCity.x},${connectedCity.y}-${city.x},${city.y}`;

              if (!waterCityConnectionsSet.has(connectionKey)) {
                waterCityConnectionsSet.add(connectionKey);
                waterCityConnections.push([
                  [city.x, city.y],
                  [connectedCity.x, connectedCity.y],
                ]);
              }

              isWaterBorder = true;
            } else if (
              neighborLandCityIndex !== null &&
              noiseGrid[nx][ny] > waterLevel
            ) {
              // Water-to-land connection
              let landCity = cities[neighborLandCityIndex];

              // Ensure unique ordering
              let connectionKey =
                city.x < landCity.x ||
                  (city.x === landCity.x && city.y < landCity.y)
                  ? `${city.x},${city.y}-${landCity.x},${landCity.y}`
                  : `${landCity.x},${landCity.y}-${city.x},${city.y}`;

              if (!landWaterCityConnectionsSet.has(connectionKey)) {
                landWaterCityConnectionsSet.add(connectionKey);
                landWaterCityConnections.push([
                  [city.x, city.y],
                  [landCity.x, landCity.y],
                ]);
              }

              isLandWaterBorder = true;
            }
          }
        }

        let pixelColor = noiseCanvas.get(x, y);
        if (isWaterBorder) {
          noiseCanvas.set(x, y, color(128)); // Gray for water-to-water borders
          uniqueTerritoryMap.set(x, y, color(128));
        } else if (isLandWaterBorder) {
          noiseCanvas.set(x, y, color(0)); // Keep water-to-land borders black
          uniqueTerritoryMap.set(x, y, color(0));
        } else if (
          pixelColor[0] !== 0 ||
          pixelColor[1] !== 0 ||
          pixelColor[2] !== 0
        ) {
          noiseCanvas.set(x, y, color(32, 159, 201)); // Water color
          uniqueTerritoryMap.set(x, y, color(32, 159, 201)); // Water color
        }
      }
    }
  }
  noiseCanvas.updatePixels();
  uniqueTerritoryMap.updatePixels();
  console.log("Water City Connections:", waterCityConnections);
  console.log("Land-Water City Connections:", landWaterCityConnections);
}

function assignTerritoryColorsOld() {
  territoryColors = cities.map(() =>
    color(random(100, 255), random(100, 255), random(100, 255))
  );
}

function assignTerritoryColors() {
  let saturation = 100;
  let brightness = 50;
  territoryColors = cities.map(() =>
    color(
      `hsb(${Math.round(random(0, 360))}, ${Math.round(
        random(50, 100)
      )}%, ${Math.round(random(90, 100))}%)`
    )
  );
  console.log(territoryColors);
}

function assignGroupColors() {
  const numColors = X; // Set the length of groupColors
  groupColors = Array.from({ length: numColors }, (_, i) => {
    const hue = Math.round((i * 360) / numColors) % 360; // Evenly spaced hues
    const saturation = Math.round(random(50, 100));
    const brightness = Math.round(random(90, 100));
    return color(`hsb(${hue}, ${saturation}%, ${brightness}%)`);
  });
  console.log(groupColors);
}

function assignCityGroups(X, Y) {
  if (X > cities.length) {
    console.error("X is greater than the number of cities available.");
    return [];
  }

  let groups = Array.from({ length: X }, () => []);
  let selectedCities = new Set();
  let remainingCities = [...cities];

  let firstCity = remainingCities.splice(
    floor(random(remainingCities.length)),
    1
  )[0];
  groups[0].push(firstCity);
  selectedCities.add(firstCity);

  while (groups.flat().length < X && remainingCities.length > 0) {
    let selectedCity = null;

    if (cityPlacementStrategy === "farthestNearest") {
      let maxMinDist = -1;
      for (let city of remainingCities) {
        let minDist = Infinity;
        for (let group of groups) {
          for (let member of group) {
            let d = dist(city.x, city.y, member.x, member.y);
            if (d < minDist) minDist = d;
          }
        }
        if (minDist > maxMinDist) {
          maxMinDist = minDist;
          selectedCity = city;
        }
      }
    } else if (cityPlacementStrategy === "farthestAverage") {
      let maxAvgDist = -1;
      for (let city of remainingCities) {
        let totalDist = 0;
        let count = 0;
        for (let group of groups) {
          for (let member of group) {
            totalDist += dist(city.x, city.y, member.x, member.y);
            count++;
          }
        }
        let avgDist = count > 0 ? totalDist / count : 0;
        if (avgDist > maxAvgDist) {
          maxAvgDist = avgDist;
          selectedCity = city;
        }
      }
    } else if (cityPlacementStrategy === "farthestFromCenter") {
      let centerX = width / 2;
      let centerY = height / 2;
      let maxDist = -1;
      for (let city of remainingCities) {
        let d = dist(city.x, city.y, centerX, centerY);
        if (d > maxDist) {
          maxDist = d;
          selectedCity = city;
        }
      }
    } else if (cityPlacementStrategy === "gridBased") {
      let cellSize = Math.sqrt((width * height) / X);
      let takenCells = new Set(
        groups.map(
          (c) =>
            `${Math.floor(c[0]?.x / cellSize)},${Math.floor(
              c[0]?.y / cellSize
            )}`
        )
      );
      for (let city of remainingCities) {
        let cellKey = `${Math.floor(city.x / cellSize)},${Math.floor(
          city.y / cellSize
        )}`;
        if (!takenCells.has(cellKey)) {
          selectedCity = city;
          break;
        }
      }

      // fallback
      if (!selectedCity) selectedCity = remainingCities[0];
    } else if (cityPlacementStrategy === "random") {
      selectedCity = random(remainingCities);
    }

    if (selectedCity) {
      let groupIndex = groups.findIndex((g) => g.length === 0);
      groups[groupIndex].push(selectedCity);
      selectedCities.add(selectedCity);
      remainingCities.splice(remainingCities.indexOf(selectedCity), 1);
    }
  }

  let iterationLimit = 10000;
  let iterations = 0;

  while (selectedCities.size < cities.length && iterations < iterationLimit) {
    for (let i = 0; i < X; i++) {
      if (groups[i].length >= Y) continue;

      let closestCity = null;
      let minDist = Infinity;

      for (let city of cities) {
        if (selectedCities.has(city)) continue;

        let d = dist(city.x, city.y, groups[i][0].x, groups[i][0].y);
        if (d < minDist) {
          minDist = d;
          closestCity = city;
        }
      }

      if (closestCity) {
        groups[i].push(closestCity);
        selectedCities.add(closestCity);
        iterations -= 500;
      }
    }

    if (selectedCities.size >= cities.length) break;
    iterations++;
  }

  return groups;
}

function isAdjacentToAnyOtherGroupSC(city, currentGroupIndex) {
  const cityKey = `${city.x},${city.y}`;
  console.log(`Checking for ${cityKey}`);

  for (let [a, b] of cityConnections) {
    const aKey = `${a[0]},${a[1]}`;
    const bKey = `${b[0]},${b[1]}`;

    if (aKey === cityKey || bKey === cityKey) {
      const neighbor = aKey === cityKey ? b : a;
      const neighborKey = `${neighbor[0]},${neighbor[1]}`;

      for (let i = 0; i < cityGroups.length; i++) {
        if (i === currentGroupIndex) continue;

        for (let groupCity of cityGroups[i]) {
          if (
            neighborKey === `${groupCity.x},${groupCity.y}` &&
            supplyCenters.some(
              (sc) => sc.x === groupCity.x && sc.y === groupCity.y
            )
          ) {
            console.log(`found neighbor at ${neighborKey}`);
            return true; // Neighbor is a supply center in a different group
          }
        }
      }
    }
  }

  return false;
}

function generateSupplyCenters() {
  supplyCenters = [];

  // Select X random cities from each city group
  for (let groupIndex = 0; groupIndex < cityGroups.length; groupIndex++) {
    let group = cityGroups[groupIndex];
    let selected = [];
    let attempts = 0;
    let didSelectWaterCity = false;

    if (group.length >= startingSupplyNum) {
      while (
        selected.length < startingSupplyNum &&
        selected.length < group.length &&
        attempts < 100
      ) {
        let candidateCity = null;

        // First attempt: Water-adjacent
        if (!didSelectWaterCity && ensurePlayerWaterConnectedCheck.checked()) {
          let waterAdjacent = group.filter(
            (city) =>
              !selected.includes(city) &&
              isCityInLandWaterConnections(city) &&
              !isAdjacentToAnyOtherGroupSC(city, groupIndex)
          );

          if (waterAdjacent.length > 0) {
            candidateCity = random(waterAdjacent);
            didSelectWaterCity = true;
          }
        }

        // Otherwise pick any non-adjacent, non-selected city
        if (!candidateCity) {
          let shuffledGroup = shuffle(group);
          for (let city of shuffledGroup) {
            if (
              !selected.includes(city) &&
              !isAdjacentToAnyOtherGroupSC(city, groupIndex)
            ) {
              candidateCity = city;
              break;
            }
          }
        }

        if (candidateCity) {
          selected.push(candidateCity);
          supplyCenters.push(candidateCity);
        } else {
          console.error(
            `Group ${groupIndex}: Couldn't find non-bordering supply center after ${attempts} attempts.`
          );
          // add random city
          let shuffledGroup = shuffle(group);
          candidateCity = shuffledGroup[0];
          selected.push(candidateCity);
          supplyCenters.push(candidateCity);
          //break;
        }

        attempts++;
      }
    } else {
      supplyCenters.push(...group);
    }
  }

  // Add one additional supply center to the most central city groups
  const centralGroups = mostCentralPlayers(cityGroups.length);
  for (let i = 0; i < buffNumCentralPlayers; i++) {
    let groupIndex = centralGroups[i];
    let group = cityGroups[groupIndex];

    let additionalCity = null;
    while (!additionalCity) {
      let randomCity = group[floor(random(group.length))];
      if (!supplyCenters.includes(randomCity)) {
        additionalCity = randomCity;
        supplyCenters.push(additionalCity);
      }
    }
  }

  // Identify ungrouped cities
  let groupedCities = new Set(cityGroups.flat());
  let ungroupedCities = cities.filter((city) => !groupedCities.has(city));

  // Determine the number of ungrouped cities to turn into supply centers based on supplyDensity
  let numToSelect = floor(ungroupedCities.length * supplyDensity);
  selectedUngrouped = [];

  // Iterate through all city groups until we reach the supplyDensity target
  while (selectedUngrouped.length < numToSelect) {
    let addedThisRound = false;

    for (let group of cityGroups) {
      let groupSupplyCenters = group.filter((city) =>
        supplyCenters.includes(city)
      );

      if (groupSupplyCenters.length === 0) continue; // Skip groups with no supply centers

      let bestCity = null;
      let bestAvgDistance = Infinity;

      // Find the closest ungrouped city to this group's supply centers
      for (let city of ungroupedCities) {
        if (selectedUngrouped.includes(city)) continue;

        let totalDistance = groupSupplyCenters.reduce(
          (sum, sc) => sum + dist(city.x, city.y, sc.x, sc.y),
          0
        );
        let avgDistance = totalDistance / groupSupplyCenters.length;

        if (avgDistance < bestAvgDistance) {
          bestAvgDistance = avgDistance;
          bestCity = city;
        }
      }
      // sometimes ignore and assign randomly
      if (random([false, false])) {
        bestCity = shuffle(ungroupedCities)[0];
      }
      if (bestCity) {
        selectedUngrouped.push(bestCity);
        supplyCenters.push(bestCity);
        addedThisRound = true;
      }
      if (selectedUngrouped.length >= numToSelect) break; // Stop if we hit the target
    }

    if (!addedThisRound) break; // Stop if no more valid cities were found
  }

  return supplyCenters;
}

function isCityInLandWaterConnections(city) {
  let cityArray = [city.x, city.y]; // Convert city object to array format

  for (let connection of landWaterCityConnections) {
    if (
      JSON.stringify(connection[0]) === JSON.stringify(cityArray) ||
      JSON.stringify(connection[1]) === JSON.stringify(cityArray)
    ) {
      return true; // City is found in a land-water connection
    }
  }

  return false; // City is not in landWaterCityConnections
}

function handleImageUpload(file) {
  if (file.type !== "image") {
    console.error("Uploaded file is not an image.");
    return null;
  }

  // Load and process the image
  loadImage(
    file.data,
    (img) => {
      // Create a new graphics object with exact 800x800 dimensions
      let processedCanvas = createGraphics(800, 800);
      processedCanvas.image(img, 0, 0, 800, 800); // Stretch to 800x800

      // Convert to grayscale and store in a 2D array
      let grayscaleArray = [];
      processedCanvas.loadPixels();

      for (let x = 0; x < 800; x++) {
        grayscaleArray[x] = [];
        for (let y = 0; y < 800; y++) {
          let index = (x + y * 800) * 4;
          let r = processedCanvas.pixels[index];
          let g = processedCanvas.pixels[index + 1];
          let b = processedCanvas.pixels[index + 2];
          let gray = (r + g + b) / (3 * 255); // Normalize to range 0-1
          grayscaleArray[x][y] = gray;
        }
      }

      console.log("Grayscale array generated:", grayscaleArray);
      imageSourceValues = grayscaleArray; // Return the 2D grayscale array
    },
    (err) => {
      console.error("Failed to load image:", err);
      imageSourceValues = null;
    }
  );
}

function mostCentralPlayers(numToReturn = 1) {
  let groupAverages = [];

  for (let i = 0; i < cityGroups.length; i++) {
    let totalDistance = 0;
    let cityCount = cityGroups[i].length;

    for (let city of cityGroups[i]) {
      let sumDistances = 0;
      let comparisons = 0;

      for (let j = 0; j < cityGroups.length; j++) {
        if (i === j) continue; // Skip the same group

        for (let otherCity of cityGroups[j]) {
          sumDistances += dist(city.x, city.y, otherCity.x, otherCity.y);
          comparisons++;
        }
      }

      totalDistance += sumDistances / comparisons;
    }

    let avgDistance = totalDistance / cityCount;
    groupAverages.push({ groupIndex: i, avgDistance });
  }

  // Sort groups by average distance in ascending order
  groupAverages.sort((a, b) => a.avgDistance - b.avgDistance);

  // Return the indices of the top 'numToReturn' most central players
  return groupAverages.slice(0, numToReturn).map((group) => group.groupIndex);
}

function leastExpansivePlayer() {
  let groupAverages = [];

  for (let i = 0; i < cityGroups.length; i++) {
    let totalDistance = 0;
    let cityCount = cityGroups[i].length;

    for (let city of cityGroups[i]) {
      let minDistance = Infinity;

      for (let supplyCenter of selectedUngrouped) {
        let d = dist(city.x, city.y, supplyCenter.x, supplyCenter.y);
        if (d < minDistance) {
          minDistance = d;
        }
      }

      totalDistance += minDistance;
    }

    let avgDistance = totalDistance / cityCount;
    groupAverages.push({ groupIndex: i, avgDistance });
    console.log(
      `City Group ${i} - Average Distance to Nearest Ungrouped Supply Center: ${avgDistance}`
    );
  }

  groupAverages.sort((a, b) => b.avgDistance - a.avgDistance);
  return groupAverages[0].groupIndex; // Return the least expansive player’s group index
}

function helpExpandPlayer(leastExpansiveIndex) {
  let targetGroup = cityGroups[leastExpansiveIndex];
  let bestCity = null;
  let bestAvgDistance = Infinity;

  for (let city of cities) {
    if (supplyCenters.includes(city)) continue; // Skip if already a supply center
    if (cityGroups.flat().includes(city)) continue; // Skip if already in a city group

    let totalDistance = 0;
    for (let groupCity of targetGroup) {
      totalDistance += dist(city.x, city.y, groupCity.x, groupCity.y);
    }
    let avgDistance = totalDistance / targetGroup.length;

    if (avgDistance < bestAvgDistance) {
      bestAvgDistance = avgDistance;
      bestCity = city;
    }
  }

  if (bestCity) {
    supplyCenters.push(bestCity);
    console.log(
      `Added city at (${bestCity.x}, ${bestCity.y}) to help expand Player ${leastExpansiveIndex}`
    );
  } else {
    console.log(
      "No suitable city found to help expand the least expansive player."
    );
  }
}

function addSig() {
  let xOffset = width - 40;
  let yOffset = height - 15;
  let size = 3;

  stroke(0);
  strokeWeight(2);
  noFill();

  beginShape();
  vertex(xOffset + 5, yOffset);
  vertex(xOffset + 5, yOffset - size * 3);
  vertex(xOffset + size * 2 + 5, yOffset - size * 3);
  vertex(xOffset + size * 3 + 5, yOffset - size * 2);
  vertex(xOffset + size * 3 + 5, yOffset - size);
  vertex(xOffset + size * 2 + 5, yOffset);
  vertex(xOffset + 5, yOffset);
  endShape();

  beginShape();
  vertex(xOffset + size * 5, yOffset);
  vertex(xOffset + size * 5, yOffset - size * 3);
  vertex(xOffset + size * 6, yOffset - size);
  vertex(xOffset + size * 7, yOffset - size * 3);
  vertex(xOffset + size * 7, yOffset);
  endShape();

  beginShape();
  vertex(xOffset + size * 8, yOffset);
  vertex(xOffset + size * 8, yOffset - size * 3);
  vertex(xOffset + size * 9, yOffset - size);
  vertex(xOffset + size * 10, yOffset - size * 3);
  vertex(xOffset + size * 10, yOffset);
  endShape();
}

function assignCityNames() {
  let usedNames = new Set(); // Store used names to prevent duplicates
  cityNamesDict = {}; // Reset dictionary

  for (let city of cities) {
    let name;
    do {
      name = getRandomRegionName(); // Generate a random name
    } while (usedNames.has(name)); // Ensure uniqueness

    usedNames.add(name);
    cityNamesDict[`${city.x},${city.y}`] = name; // Store name in dictionary
  }

  waterCityNames = getWaterCityNames();

  cityBoundingBoxes = generateCityBoundingBoxes();
}

function checkOverlap(box1, box2) {
  return (
    box1.x < box2.x + box2.w &&
    box1.x + box1.w > box2.x &&
    box1.y < box2.y + box2.h &&
    box1.y + box1.h > box2.y
  );
}

function findNewTextPosition(city) {
  let attempts = 10;

  while (attempts > 0) {
    let randX = city.x + floor(random(-15, 15)); // Small random offset
    let randY = city.y + floor(random(-15, 15));

    // Ensure new position is inside the city’s territory
    if (
      territories[randX] &&
      territories[randX][randY] === cities.indexOf(city)
    ) {
      let textW = textWidth(cityNamesDict[`${city.x},${city.y}`]);
      let textH = textSize();
      return {
        x: constrain(randX - textW / 2, 5, width - textW - 5),
        y: constrain(randY - textH / 2, 5, height - textH - 5),
      };
    }

    attempts--;
  }

  return null; // Couldn't find a new position
}

function findRandomPointInTerritory(xOrig, yOrig, isLand) {
  let attempts = 50; // Max attempts to find a valid point

  while (attempts > 0) {
    let randX = xOrig + floor(random(-35, 35));
    let randY = yOrig + floor(random(-35, 35));

    // Ensure new position is inside the city's own territory
    if (isLand) {
      if (
        territories[randX] &&
        territories[randX][randY] === territories[xOrig][yOrig]
      ) {
        return { x: randX, y: randY };
      }
    } else {
      if (
        waterTerritories[randX] &&
        waterTerritories[randX][randY] === waterTerritories[xOrig][yOrig]
      ) {
        return { x: randX, y: randY };
      }
    }

    attempts--;
  }
  console.error("Couldn't find new position within territory");
  return null; // Couldn't find a valid position
}
function generateCityBoundingBoxes() {
  let padding = 5; // Minimum distance from edges
  let maxIterations = 20; // Max attempts to resolve text overlaps
  let cityBoundingBoxes = {}; // Store text bounding boxes for both land and water cities

  // Step 1: Generate initial bounding boxes for land cities
  for (let city of cities) {
    let cityKey = `${city.x},${city.y}`;
    let cityName = cityNamesDict[cityKey];

    if (cityName) {
      let textW = textWidth(cityName);
      let textH = textSize();
      let textX = city.x - textW / 2;
      let textY = city.y - textH / 2 + 10; // Offset slightly for land cities

      // Ensure text is inside the canvas
      textX = constrain(textX, padding, width - textW - padding);
      textY = constrain(textY, padding, height - textH - padding);

      cityBoundingBoxes[cityKey] = {
        x: textX,
        y: textY,
        w: textW,
        h: textH,
        xOrig: city.x,
        yOrig: city.y,
        isLand: true,
      };
    }
  }

  // Step 2: Generate initial bounding boxes for water cities
  for (let cityKey in waterCityNames) {
    let [x, y] = cityKey.split(",").map(Number);
    let cityName = waterCityNames[cityKey];

    if (cityName) {
      let textW = textWidth(cityName);
      let textH = textSize();
      let textX = x - textW / 2;
      let textY = y - textH / 2; // No extra offset for water cities

      // Ensure text is inside the canvas
      textX = constrain(textX, padding, width - textW - padding);
      textY = constrain(textY, padding, height - textH - padding);

      cityBoundingBoxes[cityKey] = {
        x: textX,
        y: textY,
        w: textW,
        h: textH,
        xOrig: x,
        yOrig: y,
        isLand: false,
      };
    }
  }

  // Step 3: Resolve overlaps by repositioning text within each city's own territory
  for (let i = 0; i < maxIterations; i++) {
    let moved = false;

    for (let cityKey1 in cityBoundingBoxes) {
      let box1 = cityBoundingBoxes[cityKey1];

      for (let cityKey2 in cityBoundingBoxes) {
        if (cityKey1 === cityKey2) continue; // Skip self-comparison

        let box2 = cityBoundingBoxes[cityKey2];

        // Check for overlap
        if (
          box1.x < box2.x + box2.w &&
          box1.x + box1.w > box2.x &&
          box1.y < box2.y + box2.h &&
          box1.y + box1.h > box2.y
        ) {
          // Try moving the text to a random position within its own territory
          let attempts = 10;
          while (attempts > 0) {
            let newPos = findRandomPointInTerritory(
              box1.xOrig,
              box1.yOrig,
              box1.isLand
            );

            if (newPos) {
              let textW = textWidth(
                cityNamesDict[cityKey1] || waterCityNames[cityKey1]
              );
              let textH = textSize();
              let randX = constrain(
                newPos.x - textW / 2,
                padding,
                width - textW - padding
              );
              let randY = constrain(
                newPos.y - textH / 2,
                padding,
                height - textH - padding
              );

              // Ensure the new position doesn't overlap any other city's text
              let overlaps = false;
              for (let otherKey in cityBoundingBoxes) {
                if (otherKey === cityKey1) continue;
                let otherBox = cityBoundingBoxes[otherKey];
                if (
                  randX < otherBox.x + otherBox.w &&
                  randX + box1.w > otherBox.x &&
                  randY < otherBox.y + otherBox.h &&
                  randY + box1.h > otherBox.y
                ) {
                  overlaps = true;
                  break;
                }
              }

              if (!overlaps) {
                box1.x = randX;
                box1.y = randY;
                moved = true;
                break;
              }
            }
            attempts--;
          }
        }
      }
    }
    if (i == maxIterations) {
      console.error(
        "Reached max iterations when attempting to place city name and avoid overlap!"
      );
    }
    if (!moved) break; // Stop if no overlaps remain
  }

  return cityBoundingBoxes;
}

function generateCityNamesOverlay() {
  cityNamesOverlay = createGraphics(width, height);
  cityNamesOverlay.clear(); // Ensures full transparency

  drawCityNames(cityNamesOverlay); // ✅ Ensures all drawing happens on the graphics

  return cityNamesOverlay;
}

function drawCityNames(canvas) {
  canvas.fill(0); // White text
  canvas.textStyle(BOLD);
  canvas.stroke(255); // Black outline
  canvas.strokeWeight(2);
  canvas.textSize(9);
  canvas.textAlign(LEFT, TOP);
  canvas.textFont("Lucida Sans");

  // Step 1: Draw all city names at final positions
  for (let cityKey in cityBoundingBoxes) {
    let box = cityBoundingBoxes[cityKey];
    let cityName = cityNamesDict[cityKey] || waterCityNames[cityKey]; // Get name from either dictionary

    if (cityName) {
      canvas.text(cityName, box.x, box.y);
    }
  }

  // Step 2: Draw supply centers
  canvas.fill(0, 0, 0);
  canvas.noStroke();
  for (let supplyCenter of supplyCenters) {
    canvas.ellipse(supplyCenter.x, supplyCenter.y, 10, 10);
  }

  canvas.fill(255, 255, 255);
  for (let supplyCenter of supplyCenters) {
    canvas.ellipse(supplyCenter.x, supplyCenter.y, 8, 8);
  }

  canvas.fill(0, 0, 0);
  for (let supplyCenter of supplyCenters) {
    canvas.ellipse(supplyCenter.x, supplyCenter.y, 6, 6);
  }

  // Step 3: Add signature
  addSig(canvas);

  // Step 4: Text formatting adjustments
  canvas.textSize(10);

  canvas.noSmooth();
  canvas.strokeWeight(1);
  canvas.textAlign(CENTER, CENTER);
}

function getWaterRegionGroups() {
  let visited = new Set();
  let waterRegionGroups = [];

  function exploreGroup(startCity) {
    let queue = [[startCity.x, startCity.y]]; // Convert object to array before adding
    let group = new Set();

    while (queue.length > 0) {
      let city = queue.pop();
      let cityKey = JSON.stringify(city); // Store as string for consistency

      if (visited.has(cityKey)) continue;

      visited.add(cityKey);
      group.add(cityKey); // Store as string for uniformity

      // Check direct water-to-water connections
      for (let [cityA, cityB] of waterCityConnections.concat(
        landWaterCityConnections
      )) {
        let cityAKey = JSON.stringify(cityA);
        let cityBKey = JSON.stringify(cityB);

        if (cityAKey === cityKey && !visited.has(cityBKey)) {
          queue.push(cityB);
        } else if (cityBKey === cityKey && !visited.has(cityAKey)) {
          queue.push(cityA);
        }
      }
    }

    return Array.from(group).map(JSON.parse); // Convert stored JSON strings back to arrays
  }

  for (let waterCity of waterCities) {
    let cityKey = JSON.stringify([waterCity.x, waterCity.y]); // Convert to array
    if (!visited.has(cityKey)) {
      let newGroup = exploreGroup(waterCity).filter((city) =>
        waterCities.some((w) => w.x === city[0] && w.y === city[1])
      ); // Ensure only water cities remain

      if (newGroup.length > 0) {
        waterRegionGroups.push(newGroup);
      }
    }
  }

  return waterRegionGroups;
}

function findClosestCitiesBetweenGroups(groupA, groupB) {
  let minDistance = Infinity;
  let closestPair = null;

  for (let cityA of groupA) {
    for (let cityB of groupB) {
      let distance = dist(cityA[0], cityA[1], cityB[0], cityB[1]);
      if (distance < minDistance) {
        minDistance = distance;
        closestPair = [cityA, cityB];
      }
    }
  }

  return closestPair;
}

function drawRiver(startX, startY, endX, endY, maxDistanceAffected = 2) {
  let queue = new PriorityQueue({
    comparator: (a, b) => a.score - b.score, // Min-heap, lowest score first
  });

  let visited = new Set();

  function weight(x1, y1, x2, y2) {
    let horiz = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    let vert = heightMap[x2][y2] - heightMap[x1][y1];
    if (vert > 0) vert *= 1000; // Rivers prefer downhill paths
    let diff = 1 + 0.25 * Math.pow(vert / horiz, 2);
    return horiz * diff;
  }

  queue.queue({ x: startX, y: startY, score: 0, path: [] });

  while (queue.length > 0) {
    let { x, y, score, path } = queue.dequeue();
    let key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    path.push([x, y]); // Keep track of the river path

    if (x === endX && y === endY) {
      // We've reached the endpoint, now apply water
      for (let [px, py] of path) {
        noiseGrid[px][py] = 0; // Ensure exact river path is water

        // **Ensure complete erosion in nearby tiles**
        for (let dx = -maxDistanceAffected; dx <= maxDistanceAffected; dx++) {
          for (let dy = -maxDistanceAffected; dy <= maxDistanceAffected; dy++) {
            let nx = px + dx;
            let ny = py + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              let distance = Math.sqrt(dx * dx + dy * dy);

              if (distance <= maxDistanceAffected + 1) {
                noiseGrid[nx][ny] = 0; // **Ensure full conversion to water**
              }
            }
          }
        }
      }
      return; // Exit once the river is created
    }

    let neighbors = [
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
    ];

    for (let { dx, dy } of neighbors) {
      let nx = x + dx;
      let ny = y + dy;
      let nKey = `${nx},${ny}`;

      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        !visited.has(nKey)
      ) {
        let newScore = score + weight(x, y, nx, ny);
        queue.queue({ x: nx, y: ny, score: newScore, path: [...path] });
      }
    }
  }
}

function findCityGroupsWithoutWaterAccess() {
  let cityGroupsWithoutWater = [];

  for (let i = 0; i < cityGroups.length; i++) {
    let hasWaterAccess = false;

    for (let city of cityGroups[i]) {
      let cityKey = JSON.stringify([city.x, city.y]); // Convert city object to array format

      // Check if the city exists in any land-water connections
      for (let connection of landWaterCityConnections) {
        let city1Key = JSON.stringify(connection[0]);
        let city2Key = JSON.stringify(connection[1]);

        if (cityKey === city1Key || cityKey === city2Key) {
          hasWaterAccess = true;
          break;
        }
      }

      if (hasWaterAccess) break; // No need to check further if one city has water access
    }

    if (!hasWaterAccess) {
      cityGroupsWithoutWater.push(cityGroups[i]); // Add the entire group if no access to water
    }
  }

  return cityGroupsWithoutWater;
}

function drawLandWaterConnections() {
  stroke(0, 0, 255); // Blue color for water connections
  strokeWeight(2);

  for (let connection of landWaterCityConnections) {
    let [cityA, cityB] = connection;

    // Draw a blue line between the land city and the water city
    line(cityA[0], cityA[1], cityB[0], cityB[1]);
  }

  for (let connection of waterCityConnections) {
    let [cityA, cityB] = connection;

    // Draw a blue line between the land city and the water city
    line(cityA[0], cityA[1], cityB[0], cityB[1]);
  }
  for (let waterCityGroup of waterGroups) {
    for (let waterCity of waterCityGroup) {
      ellipse(waterCity[0], waterCity[1], 15, 15);
    }
  }
}

function getWaterCityNames() {
  let waterCityNamesDict = {};
  let nameOccurrences = {}; // Track occurrences of water city names

  function getClosestLandRegion(waterCity) {
    let minDist = Infinity;
    let closestRegion = null;

    for (let connection of landWaterCityConnections) {
      let landCity = null;

      if (isWaterCity(connection[0]) && !isWaterCity(connection[1])) {
        landCity = connection[1];
      } else if (isWaterCity(connection[1]) && !isWaterCity(connection[0])) {
        landCity = connection[0];
      }

      if (landCity) {
        let distValue = dist(
          waterCity.x,
          waterCity.y,
          landCity[0],
          landCity[1]
        );
        if (distValue < minDist) {
          minDist = distValue;
          closestRegion = {
            x: landCity[0],
            y: landCity[1],
            name: cityNamesDict[`${landCity[0]},${landCity[1]}`] || "Unnamed",
          };
        }
      }
    }
    return closestRegion;
  }

  function isWaterCity(cityArray) {
    return waterCities.some(
      (waterCity) =>
        waterCity.x === cityArray[0] && waterCity.y === cityArray[1]
    );
  }

  function getSuffix(landRegionName) {
    let vowels = ["a", "e", "i", "o", "u"];
    let lastChar = landRegionName.slice(-1).toLowerCase();
    let suffixes = vowels.includes(lastChar)
      ? ["tic", "fic", "dian"]
      : ["ic", "ian"];
    if (lastChar === "a") {
      return "n";
    }
    return suffixes[Math.floor(Math.random() * suffixes.length)];
  }

  function getWaterPrefixOrSuffix(waterCity) {
    let borderingWaterRegions = new Set();
    let borderingLand = false;

    for (let connection of waterCityConnections) {
      if (
        JSON.stringify(connection[0]) ===
        JSON.stringify([waterCity.x, waterCity.y])
      ) {
        borderingWaterRegions.add(JSON.stringify(connection[1]));
      } else if (
        JSON.stringify(connection[1]) ===
        JSON.stringify([waterCity.x, waterCity.y])
      ) {
        borderingWaterRegions.add(JSON.stringify(connection[0]));
      }
    }

    for (let connection of landWaterCityConnections) {
      if (
        JSON.stringify(connection[0]) ===
        JSON.stringify([waterCity.x, waterCity.y]) ||
        JSON.stringify(connection[1]) ===
        JSON.stringify([waterCity.x, waterCity.y])
      ) {
        borderingLand = true;
        break;
      }
    }

    if (!borderingLand) {
      return " Ocean";
    } else if (borderingWaterRegions.size === 1) {
      return "Bay of ";
    } else if (borderingWaterRegions.size > 1) {
      return " Sea";
    } else if (borderingLand) {
      return "Lake ";
    } else {
      return " Ocean";
    }
  }

  function getCardinalDirection(from, to) {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    let angle = atan2(dy, dx) * (180 / PI);

    if (angle >= -45 && angle < 45) return "East";
    if (angle >= 45 && angle < 135) return "South";
    if (angle >= 135 || angle < -135) return "West";
    return "North";
  }

  for (let waterCity of waterCities) {
    let closestLand = getClosestLandRegion(waterCity);
    let waterPrefixOrSuffix = getWaterPrefixOrSuffix(waterCity);
    let waterCityName;

    if (
      closestLand &&
      !waterPrefixOrSuffix.includes("Bay of") &&
      !waterPrefixOrSuffix.includes("Lake")
    ) {
      waterCityName = closestLand.name + getSuffix(closestLand.name);
    } else if (closestLand) {
      waterCityName = closestLand.name;
    } else {
      waterCityName = "Unnamed";
    }

    if (
      waterPrefixOrSuffix.includes("Bay of") ||
      waterPrefixOrSuffix.includes("Lake")
    ) {
      waterCityName = waterPrefixOrSuffix + waterCityName;
    } else {
      waterCityName = waterCityName + waterPrefixOrSuffix;
    }

    // Handle duplicate names by adding a direction
    while (waterCityName in nameOccurrences) {
      let direction = getCardinalDirection(closestLand, waterCity);
      waterCityName = direction + " " + waterCityName;
    }

    nameOccurrences[waterCityName] = (nameOccurrences[waterCityName] || 0) + 1;
    waterCityNamesDict[`${waterCity.x},${waterCity.y}`] = waterCityName;
  }

  return waterCityNamesDict;
}

function generateCityDataList() {
  let cityDataList = [];

  for (let city of cities) {
    let cityKey = `${city.x},${city.y}`;
    let cityName = cityNamesDict[cityKey] || waterCityNames[cityKey];

    // Determine city type: 'Land', 'Coast', or 'Sea'
    let cityType = "Land";
    if (waterCityNames[cityKey]) {
      cityType = "Sea"; // Water city
    } else {
      // Check if city appears in landWaterCityConnections (indicating it's on the coast)
      let isCoast = landWaterCityConnections.some(
        ([landCity, waterCity]) =>
          landCity[0] === city.x && landCity[1] === city.y
      );
      if (isCoast) {
        cityType = "Coast";
      }
    }

    // Check if it's a supply center
    let supplyStatus = supplyCenters.some(
      (sc) => sc.x === city.x && sc.y === city.y
    )
      ? "Yes"
      : "No";

    // Find city group index
    let groupIndex = 0;
    for (let i = 0; i < cityGroups.length; i++) {
      if (cityGroups[i].some((c) => c.x === city.x && c.y === city.y)) {
        groupIndex = i + 1; // Incremented by one
        break;
      }
    }

    // Compute coordinates
    let x = city.x;
    let y = city.y;
    let x2 = x * 2;
    let y2 = y * 2;

    // Create the formatted string
    let cityString = `array('${cityName}', '${cityType}', '${supplyStatus}', ${groupIndex}, ${x}, ${y}, ${x2}, ${y2}),`;

    cityDataList.push(cityString);
  }

  return cityDataList;
}

function generateConnectionDataList() {
  let connectionDataList = [];

  // Helper function to process a connection
  function processConnection(city1, city2, isWater, isLand) {
    let name1 =
      cityNamesDict[`${city1[0]},${city1[1]}`] ||
      waterCityNames[`${city1[0]},${city1[1]}`];
    let name2 =
      cityNamesDict[`${city2[0]},${city2[1]}`] ||
      waterCityNames[`${city2[0]},${city2[1]}`];

    if (name1 && name2) {
      let waterConnection = isWater ? "Yes" : "No";
      let landConnection = isLand ? "Yes" : "No";
      let connectionString = `array('${name1}','${name2}','${waterConnection}','${landConnection}'),`;
      connectionDataList.push(connectionString);
    }
  }

  // Process city-to-city (land) connections
  for (let [city1, city2] of cityConnections) {
    processConnection(city1, city2, false, true);
  }

  // Process water city-to-water city connections
  for (let [city1, city2] of waterCityConnections) {
    processConnection(city1, city2, true, false);
  }

  // Process land-to-water city connections
  for (let [city1, city2] of landWaterCityConnections) {
    processConnection(city1, city2, true, true);
  }

  return connectionDataList;
}

function generatePHPMapFile() {
  // Get city and connection data lists
  let cityDataList = generateCityDataList();
  let connectionDataList = generateConnectionDataList();

  // Convert arrays to formatted PHP strings
  let cityDataPHP = cityDataList.join("\n\t");
  let connectionDataPHP = connectionDataList.join("\n\t");

  // Construct the PHP file string
  return `<?php
// This file installs the map data for the AncMed variant
defined('IN_CODE') or die('This script can not be run by itself.');
require_once("variants/install.php");

InstallTerritory::$Territories=array();
$countries=$this->countries;
$territoryRawData=array(
\t${cityDataPHP}
);

foreach($territoryRawData as $territoryRawRow)
{
\tlist($name, $type, $supply, $countryID, $x, $y, $sx, $sy)=$territoryRawRow;
\tnew InstallTerritory($name, $type, $supply, $countryID, $x, $y, $sx, $sy);
}
unset($territoryRawData);

$bordersRawData=array(
\t${connectionDataPHP}
);

foreach($bordersRawData as $borderRawRow)
{
\tlist($from, $to, $fleets, $armies)=$borderRawRow;
\tInstallTerritory::$Territories[$to]->addBorder(InstallTerritory::$Territories[$from],$fleets,$armies);
}
unset($bordersRawData);

InstallTerritory::runSQL($this->mapID);
InstallCache::terrJSON($this->territoriesJSONFile(),$this->mapID);
?>`;
}

function downloadPHPMapAsZip() {
  let phpContent = generatePHPMapFile();
  let phpVariant = generatePHPVariantFile();
  let phpDrawMap = generatePHPDrawMapFile();
  let phpPreAdj = generatePHPAdjudicatorPreGameFile();

  // Create a new ZIP archive
  let zip = new JSZip();
  zip.file("install.php", phpContent);
  zip.file("variant.php", phpVariant);
  zip.file("classes/drawMap.php", phpDrawMap);
  zip.file("classes/adjudicatorPreGame.php", phpPreAdj);

  // Generate the small map image
  let smallMap = uniqueTerritoryMap; // drawSmallMap();

  // Function to create a 2x resized version of a p5.Graphics object
  function resizeCanvas(graphics) {
    let newCanvas = createGraphics(graphics.width * 2, graphics.height * 2);
    newCanvas.noSmooth(); // Disable aliasing for pixel-perfect scaling
    newCanvas.image(graphics, 0, 0, newCanvas.width, newCanvas.height);
    return newCanvas;
  }

  let smallMap2x = resizeCanvas(smallMap);
  let cityNamesOverlay2x = resizeCanvas(cityNamesOverlay);

  // Convert graphics to PNGs and add to ZIP
  smallMap.canvas.toBlob(function (smallMapBlob) {
    if (!smallMapBlob) {
      console.error("Failed to create smallMap PNG Blob!");
      return;
    }
    zip.file("resources/smallmap.png", smallMapBlob); // Add original small map

    smallMap2x.canvas.toBlob(function (smallMap2xBlob) {
      if (!smallMap2xBlob) {
        console.error("Failed to create smallMap2x PNG Blob!");
        return;
      }
      zip.file("resources/map.png", smallMap2xBlob); // Add 2x small map

      cityNamesOverlay.canvas.toBlob(function (cityNamesBlob) {
        if (!cityNamesBlob) {
          console.error("Failed to create cityNamesOverlay PNG Blob!");
          return;
        }
        zip.file("resources/smallmapNames.png", cityNamesBlob); // Add original city names overlay

        cityNamesOverlay2x.canvas.toBlob(function (cityNames2xBlob) {
          if (!cityNames2xBlob) {
            console.error("Failed to create cityNamesOverlay2x PNG Blob!");
            return;
          }
          zip.file("resources/mapNames.png", cityNames2xBlob); // Add 2x city names overlay

          // Generate and download the ZIP file
          zip.generateAsync({ type: "blob" }).then(function (content) {
            let a = document.createElement("a");
            let url = URL.createObjectURL(content);
            a.href = url;
            a.download = "map_data.zip"; // Name of the ZIP file
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
          });
        }, "image/png");
      }, "image/png");
    }, "image/png");
  }, "image/png");
}

function generateCountryNames() {
  let countryNamesSet = new Set();

  // Generate unique country names until we have enough
  while (countryNamesSet.size < cityGroups.length) {
    countryNamesSet.add(getRandomCountryName());
  }
  countryNamesList = [...countryNamesSet];
  countryNamesListStr = Array.from(countryNamesSet)
    .map((name) => `'${name}'`)
    .join(", ");
  console.log(countryNamesList);
}

function generatePHPVariantFile() {
  return `<?php
/*
    Copyright (C) 2004-2009 Kestas J. Kuliukas

    This file is part of webDiplomacy.

    webDiplomacy is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    webDiplomacy is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with webDiplomacy.  If not, see <http://www.gnu.org/licenses/>.
 */

defined('IN_CODE') or die('This script can not be run by itself.');

/**
 * A variant randomly generated by Diplomacy Map ProcGen
 * https://github.com/mcoirad/DiplomacyMapGenerator
 */
class RandomMapVariant extends WDVariant {
    public $id=1;
    public $mapID=1;
    public $name='RandomMap';
    public $fullName='RandomMap';
    public $description='A randomly generated diplomacy map.';
    public $author='Diplomacy ProcGen';
    public $adapter='Dario Macieira Mitchell @kurli_kid'

    public $countries=array(${countryNamesListStr});

    public function __construct() {
        parent::__construct();

        // drawMap extended for country-colors and loading the classic map images
        $this->variantClasses['drawMap'] = 'RandomMap';

        /*
         * adjudicatorPreGame extended for country starting unit data
         */
        $this->variantClasses['adjudicatorPreGame'] = 'RandomMap';
    }

    public function turnAsDate($turn) {
        if ( $turn==-1 ) return l_t("Pre-game");
        else return ( $turn % 2 ? l_t("Autumn").", " : l_t("Spring").", " ).(floor($turn/2) + 1901);
    }

    public function turnAsDateJS() {
        return 'function(turn) {
            if( turn==-1 ) return l_t("Pre-game");
            else return ( turn%2 ? l_t("Autumn")+", " : l_t("Spring")+", " )+(Math.floor(turn/2) + 1901);
        };';
    }
}
?>`;
}

function generatePHPDrawMapFile() {
  let countryColorsList = groupColors
    .map((color, index) => {
      let r = red(color);
      let g = green(color);
      let b = blue(color);
      return `\t${index} => array(${r}, ${g}, ${b})`;
    })
    .join(",\n");

  return `<?php

defined('IN_CODE') or die('This script can not be run by itself.');

class RandomMapVariant_drawMap extends drawMap {

    protected $countryColors = array(
${countryColorsList}
    );

    protected function resources() {
        if( $this->smallmap )
        {
            return array(
                'map'     =>l_s('variants/RandomMap/resources/smallmap.png'),
                'army'    =>l_s('contrib/smallarmy.png'),
                'fleet'   =>l_s('contrib/smallfleet.png'),
                'names'   =>l_s('variants/RandomMap/resources/smallmapNames.png'),
                'standoff'=>l_s('images/icons/cross.png')
            );
        }
        else
        {
            return array(
                'map'     =>l_s('variants/RandomMap/resources/map.png'),
                'army'    =>l_s('contrib/army.png'),
                'fleet'   =>l_s('contrib/fleet.png'),
                'names'   =>l_s('variants/RandomMap/resources/mapNames.png'),
                'standoff'=>l_s('images/icons/cross.png')
            );
        }
    }

}

?>`;
}

function assignStartingUnits() {
  startingUnits = {}; // Dictionary to store city names and assigned unit type

  for (let group of cityGroups) {
    let supplyCentersInGroup = group.filter((city) =>
      supplyCenters.some(
        (supplyCity) => supplyCity.x === city.x && supplyCity.y === city.y
      )
    );

    let totalSupplyCenters = supplyCentersInGroup.length;
    let targetFleets = Math.ceil(totalSupplyCenters * fleetDensity); // Round up to ensure at least 1 fleet if density > 0

    let fleetCount = 0;

    for (let city of supplyCentersInGroup) {
      let cityKey = `${city.x},${city.y}`;
      let cityName = cityNamesDict[cityKey];

      if (!cityName) continue; // Skip if no city name is assigned

      let isCoastal = landWaterCityConnections.some(
        ([waterCity, landCity]) =>
          landCity[0] === city.x && landCity[1] === city.y
      );

      // Assign fleets first until we reach the target, but only to coastal cities
      if (fleetCount < targetFleets && isCoastal) {
        startingUnits[cityName] = "Fleet";
        fleetCount++;
      } else {
        startingUnits[cityName] = "Army";
      }
    }
  }

  return startingUnits;
}

function generatePHPAdjudicatorPreGameFile() {
  let countryUnitsList = cityGroups
    .map((group, index) => {
      let countryName = countryNamesList[index] || `Country${index + 1}`; // Default name if missing
      let units = group
        .filter((city) => {
          let cityKey = `${city.x},${city.y}`;
          return startingUnits[cityNamesDict[cityKey]] !== undefined; // Only include supply centers
        })
        .map((city) => {
          let cityKey = `${city.x},${city.y}`;
          let cityName = cityNamesDict[cityKey];
          let unitType = startingUnits[cityName];
          return `\t\t'${cityName}' => '${unitType}'`;
        })
        .join(",\n");

      return `\t'${countryName}' => array(\n${units}\n\t)`;
    })
    .join(",\n\n");

  return `<?php
defined('IN_CODE') or die('This script can not be run by itself.');

class RandomMapVariant_adjudicatorPreGame extends adjudicatorPreGame {

    protected $countryUnits = array(
${countryUnitsList}
    );

}

?>`;
}

function drawSmallMap() {
  let uniqueMap = createGraphics(width, height);

  let territoryColors = {}; // Dictionary to store unique colors for each land territory
  let usedColors = new Set(); // Keep track of used colors to avoid duplicates
  let seaColor = color(32, 159, 201); // Standard blue for water territories

  function getUniqueColor() {
    let r, g, b, newColor;
    do {
      r = floor(random(50, 200));
      g = floor(random(50, 200));
      b = floor(random(50, 200));
      newColor = color(r, g, b);
    } while (usedColors.has(newColor.toString())); // Ensure unique color

    usedColors.add(newColor.toString());
    return newColor;
  }

  uniqueMap.noStroke();
  let territoryIndex = 0;

  // Assign colors and draw land territories
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let key = `${territories[x][y]}`; // Unique ID for each land territory
      if (territories[x][y] !== null) {
        if (!territoryColors[key]) {
          territoryColors[key] = getUniqueColor();
        }
        uniqueMap.fill(territoryColors[key]);
        uniqueMap.rect(x, y, 1, 1);
      }
    }
  }

  // Assign sea blue and draw water territories
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (waterTerritories[x][y] !== null) {
        uniqueMap.fill(seaColor);
        uniqueMap.rect(x, y, 1, 1);
      }
    }
  }

  // Draw borders in black
  uniqueMap.stroke(0); // Black stroke for borders
  uniqueMap.strokeWeight(1);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (territories[x][y] !== null || waterTerritories[x][y] !== null) {
        let currentTerritory =
          territories[x][y] !== null
            ? territories[x][y]
            : waterTerritories[x][y];

        let neighbors = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ];

        for (let { dx, dy } of neighbors) {
          let nx = x + dx;
          let ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            let neighborTerritory =
              territories[nx][ny] !== null
                ? territories[nx][ny]
                : waterTerritories[nx][ny];

            if (
              neighborTerritory !== null &&
              neighborTerritory !== currentTerritory
            ) {
              uniqueMap.point(x, y); // Draw border point
              break;
            }
          }
        }
      }
    }
  }

  return uniqueMap;
}

function draw() {
  background(230);
  image(noiseCanvas, 0, 0);
  //drawCityNames(noiseCanvas);
  image(cityNamesOverlay, 0, 0);

  //drawLandWaterConnections();
  addSig();
}
