/*
  2025 dario.technology
  https://editor.p5js.org/mcoirad/full/om-x0gXQF
*/

let noiseCanvas;
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
let modErosionCheck = true;
let buffNumCentralPlayers = 1;
let ensureWaterConnectedCheck = false;

let mapSize = 1000;

let cityNamesDict = {}; 


  let cityConnections = new Set(); // Using a Set to avoid duplicates

  let waterCityConnections = new Set(); // Tracks water-to-water connections
  let landWaterCityConnections = new Set(); // Tracks water-to-land connections

let waterGroups = [];
function setup() {
  
  createCanvas(mapSize, mapSize);
    
  noiseCanvas = createGraphics(mapSize, mapSize);

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
  gradientSelect.option("spiral");
  gradientSelect.option("sinusoidal");
  gradientSelect.option("ridge");
  gradientSelect.option("verysinusoidal");
  gradientSelect.option("uploadedimage");
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
  
  let buffCentralPlayersLabel = createSpan("Buff X Most Central Players (adds Home SC): 1 (0-6)");
  buffCentralPlayersLabel.position(10, height + 300);
  let buffCentralPlayersSelect = createSlider(0, 6, 1, 1);
  buffCentralPlayersSelect.position(400, height + 300);
  buffCentralPlayersSelect.changed(() => {
    buffNumCentralPlayers = buffCentralPlayersSelect.value();
    buffCentralPlayersLabel.html(`Buff X Most Central Players : ${buffNumCentralPlayers}`);
  });

  modErosionCheck = createCheckbox("Erosion", true);
  modErosionCheck.position(500, height + 220);
  
  let imageInputLabel = createSpan("Image input (can be used as Noise Bias)");
  imageInputLabel.position(450, height + 250);
  imageInput = createFileInput(handleImageUpload);
  imageInput.position(450, height + 270);
  
  ensureWaterConnectedCheck = createCheckbox("Draw Rivers/Ensure all water areas connected (can take awhile)", false);
  ensureWaterConnectedCheck.position(10, height + 330);

  generateNoise();
}

function generateNoise() {
  createCanvas(parseInt(mapSizeInput.value()), parseInt(mapSizeInput.value()));
  noiseCanvas = createGraphics(width, height);
  clear();
  noiseSeedValue = noiseSeedInput.value();
  if (noiseSeedValue == "") {
    noiseSeedValue = millis();
    //console.log(noiseSeedValue);
  }
  noiseSeed(noiseSeedValue);
  randomSeed(noiseSeedValue);
  noiseCanvas.loadPixels();
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
  let numIterations = 0;
  while (waterGroups.length > 1 && numIterations < 10 && ensureWaterConnectedCheck.checked()){
    let closestCities = findClosestCitiesBetweenGroups(waterGroups[0], waterGroups[1]);
  console.log("Drawing a river!");
  drawRiver(closestCities[0][0], closestCities[0][1], closestCities[1][0], closestCities[1][1], 3);
  doMapGeneration();
    numIterations += 1;
  }
}

function doMapGeneration(){
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
    }
  }
  //drawRiver(200, 200, 600, 600);
  noiseCanvas.updatePixels();
  placeCities();
  placeWaterCities();
  cityGroups = assignCityGroups(X, Y);
  assignGroupColors();
  generateTerritories();
  generateWaterTerritories();
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
}else if (noiseType === "hybridfractal") {
   let value = noise(x * noiseScale, y * noiseScale);
  let frequency = 2.0;
  let amplitude = 1.0;
  let gain = 0.5;
  let offset = 1.0;

  for (let i = 1; i < 5; i++) {
    let signal = abs(noise(x * noiseScale * frequency, y * noiseScale * frequency));
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
  } else if (gradientType === "verysinusoidal") {
    let plate = abs(sin((x / width) * PI * 5) + cos((y / height) * PI * 5));
    return plate * (dist(x, y, centerX, centerY) / maxDist);

  }else if (gradientType === "none") {
    gradientValue = 0;
  } else if (gradientType === "uploadedimage"){
    gradientValue = imageSourceValues[x][y];
    return gradientValue;
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

  cityConnections = new Set(); // Using a Set to avoid duplicates

  function weight(x1, y1, x2, y2) {
    let horiz = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    let vert = heightMap[x2][y2] - heightMap[x1][y1];
    if (vert > 0) vert *= 500;
    let diff = 1 + 0.25 * Math.pow(vert / horiz, 2);
    return horiz * diff;
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
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (territories[x][y] !== null) {
        let cityIndex = territories[x][y];
        let city = cities[cityIndex];
        let groupIndex = cityToGroup.get(city);
        let isBorder = false;
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
              let connection = JSON.stringify([
                [city.x, city.y],
                [connectedCity.x, connectedCity.y],
              ]);

              // Store as string to avoid duplicates
              cityConnections.add(connection);
              isBorder = true;
            }
          }
        }

        if (isBorder) {
          noiseCanvas.set(x, y, color(128)); // Gray border
        } else {
          noiseCanvas.set(x, y, groupColors[groupIndex]); // Group color
        }
      }
    }
  }
  noiseCanvas.updatePixels();

  // Convert cityConnections back to a list of coordinate pairs
  cityConnections = Array.from(cityConnections).map((connection) =>
    JSON.parse(connection)
  );

  console.log("City Connections:", cityConnections);
}


function generateWaterTerritories() {
  waterTerritories = Array.from(Array(width), () => new Array(height).fill(null));
  let queue = [];
  
  waterCityConnections = new Set(); // Tracks water-to-water connections
  landWaterCityConnections = new Set(); // Tracks water-to-land connections

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
              let connection = JSON.stringify([[city.x, city.y], [connectedCity.x, connectedCity.y]]);
              waterCityConnections.add(connection);
              isWaterBorder = true;
            } else if (neighborLandCityIndex !== null && noiseGrid[nx][ny] > waterLevel) {
              // Water-to-land connection
              let landCity = cities[neighborLandCityIndex];
              let connection = JSON.stringify([[city.x, city.y], [landCity.x, landCity.y]]);
              landWaterCityConnections.add(connection);
              isLandWaterBorder = true;
            }
          }
        }

        let pixelColor = noiseCanvas.get(x, y);
        if (isWaterBorder) {
          noiseCanvas.set(x, y, color(128)); // Gray for water-to-water borders
        } else if (isLandWaterBorder) {
          noiseCanvas.set(x, y, color(0)); // Keep water-to-land borders black
        } else if (pixelColor[0] != 0 || pixelColor[1] != 0 || pixelColor[2] != 0) {
          noiseCanvas.set(x, y, color(32, 159, 201)); // Water color
        }
      }
    }
  }
  noiseCanvas.updatePixels();

  // Convert sets back to lists of coordinate pairs
  waterCityConnections = Array.from(waterCityConnections).map((connection) => JSON.parse(connection));
  landWaterCityConnections = Array.from(landWaterCityConnections).map((connection) => JSON.parse(connection));

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
    let farthestCity = null;
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
        farthestCity = city;
      }
    }

    if (farthestCity) {
      let groupIndex = groups.findIndex((g) => g.length === 0);
      groups[groupIndex].push(farthestCity);
      selectedCities.add(farthestCity);
      remainingCities.splice(remainingCities.indexOf(farthestCity), 1);
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

function generateSupplyCenters() {
  let supplyCenters = [];

  // Select 3 random cities from each city group
  for (let group of cityGroups) {
    if (group.length >= startingSupplyNum) {
      let selected = [];
      while (selected.length < startingSupplyNum) {
        let randomCity = group[floor(random(group.length))];
        if (!selected.includes(randomCity)) {
          selected.push(randomCity);
          supplyCenters.push(randomCity);
        }
      }
    } else {
      supplyCenters.push(...group); // If fewer than 3 cities, add all
    }
  }

  // Add one additional supply center to the most central city groups
  const centralGroups = mostCentralPlayers(cityGroups.length); // Get all groups ranked by centrality
  for (let i = 0; i < buffNumCentralPlayers; i++) {
    let groupIndex = centralGroups[i];
    let group = cityGroups[groupIndex];

    // Select one more random city from the group that's not already a supply center
    let additionalCity = null;
    while (!additionalCity) {
      let randomCity = group[floor(random(group.length))];
      if (!supplyCenters.includes(randomCity)) {
        additionalCity = randomCity;
        supplyCenters.push(additionalCity);
      }
    }
  }

  // Identify cities not in any group
  let groupedCities = new Set(cityGroups.flat());
  let ungroupedCities = cities.filter((city) => !groupedCities.has(city));

  // Randomly select half of the ungrouped cities
  let numToSelect = floor(ungroupedCities.length / 2);
  selectedUngrouped = [];
  while (selectedUngrouped.length < numToSelect) {
    let randomCity = ungroupedCities[floor(random(ungroupedCities.length))];
    if (!selectedUngrouped.includes(randomCity)) {
      selectedUngrouped.push(randomCity);
      supplyCenters.push(randomCity);
    }
  }

  return supplyCenters;
}

function handleImageUpload(file) {
  if (file.type !== 'image') {
    console.error('Uploaded file is not an image.');
    return null;
  }

  // Load and process the image
  loadImage(file.data, (img) => {
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

    console.log('Grayscale array generated:', grayscaleArray);
    imageSourceValues = grayscaleArray; // Return the 2D grayscale array
  }, (err) => {
    console.error('Failed to load image:', err);
    imageSourceValues = null;
  });
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
  return groupAverages.slice(0, numToReturn).map(group => group.groupIndex);
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
}

function drawCityNames() {
  
  let padding = 10;

  for (let city of cities) {
    let cityKey = `${city.x},${city.y}`;
    let cityName = cityNamesDict[cityKey];

    if (cityName) {
      let textX = city.x;
      let textY = city.y + 10;

      // Adjust position if near the edges
      if (textX < padding) textX = padding;
      if (textX > width - padding) textX = width - padding;
      if (textY < padding) textY = padding;
      if (textY > height - padding) textY = height - padding;

      text(cityName, textX, textY);
    }
  }
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
      for (let [cityA, cityB] of waterCityConnections.concat(landWaterCityConnections)) {
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
        let newGroup = exploreGroup(waterCity)
            .filter(city => waterCities.some(w => w.x === city[0] && w.y === city[1])); // Ensure only water cities remain

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


function drawRiver(startX, startY, endX, endY, maxDistanceAffected=0) {
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
      // We've reached the endpoint, now apply soft brush river effect
      for (let [px, py] of path) {
        noiseGrid[px][py] = 0.01; // Set exact river path to water (0.01)

        // **Soft brush effect using Perlin noise & Gaussian decay**
        for (let dx = -maxDistanceAffected; dx <= maxDistanceAffected; dx++) {
          for (let dy = -maxDistanceAffected; dy <= maxDistanceAffected; dy++) {
            let nx = px + dx;
            let ny = py + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              let distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance <= maxDistanceAffected) {
                let falloff = Math.exp(-Math.pow(distance / maxDistanceAffected, 2)); // **Gaussian decay**
                let terrainFactor = noise(nx * 0.02, ny * 0.02) * 0.5 + 0.5; // **Adds terrain blending**
                
                noiseGrid[nx][ny] *= falloff * terrainFactor ; // Apply a **non-linear** soft effect
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

      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(nKey)) {
        let newScore = score + weight(x, y, nx, ny);
        queue.queue({ x: nx, y: ny, score: newScore, path: [...path] });
      }
    }
  }
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
  for (let waterCityGroup of waterGroups){
    for (let waterCity of waterCityGroup){
      ellipse(waterCity[0], waterCity[1], 15, 15);
    }
  }
}



function draw() {
  background(230);
  image(noiseCanvas, 0, 0);
  //drawLandWaterConnections();

  fill(0, 0, 0);
  noStroke();
  //for (let city of cities) {
  //  ellipse(city.x, city.y, 5, 5);
  //}
  for (let supplyCenter of supplyCenters) {
    ellipse(supplyCenter.x, supplyCenter.y, 10, 10);
  }
  fill(255, 255, 255);
  for (let supplyCenter of supplyCenters) {
    ellipse(supplyCenter.x, supplyCenter.y, 8, 8);
  }
  fill(0, 0, 0);
  for (let supplyCenter of supplyCenters) {
    ellipse(supplyCenter.x, supplyCenter.y, 6, 6);
  }
  //for (let waterCity of waterCities){
  // ellipse(waterCity.x, waterCity.y, 10, 10);
  //}
  addSig();
    textSize(10);
  textFont('Courier New');
noSmooth()
      strokeWeight(1);
      textAlign(CENTER, CENTER);

  //drawCityNames();
}
