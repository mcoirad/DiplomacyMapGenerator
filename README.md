# DiplomacyMapGenerator

Random Map Generation for Diplomacy Board Game

* Customize the number of players, number of starting supply centers, neutral supply center density, fleet density etc.
* Customize terrain generation with 20+ preset map types that filter perlin noise various ways
* Even create a map based off of an existing image with image upload
* Balancing features such as guarantees to water access, boost central players etc.
* WebDip compatible variant exporter
* Map sizes as big as your computer can handle

Demo: [Diplomacy Map ProcGen by mcoirad -p5.js Web Editor](https://editor.p5js.org/mcoirad/full/nzCdQVbmY )

## Run locally

This project is a static site. From the repository root:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

The app is configured to deploy from GitHub Actions. In GitHub, set
`Settings -> Pages -> Build and deployment -> Source` to `GitHub Actions`.
Pushes to `main` will publish the static site.

Runtime dependencies are checked into the repository:

* `p5.js` is loaded locally instead of from the p5.js editor or a CDN.
* `vendor/simple-zip.js` provides the ZIP export helper used by the webDip
  variant download.


![Randomly Generated Map for Diplomacy Board Game](./example.png)
