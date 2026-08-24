# Credits & Attribution

<sub>🏠 [Home](README.md) • 🧭 [Docs](docs/README.md) • 🔨 [Build](docs/BUILD.md) • 🤝 [Contributing](CONTRIBUTING.md)</sub>

---

This document is the **complete third-party inventory** for Kurukshetra FPS across
all three platform builds (Android/Web · Quest 3 VR/MR · Desktop/macOS). The
project's own source code is MIT-licensed (see [`LICENSE`](./LICENSE)); everything
listed here is owned by its respective author/provider under the license stated.

> [!IMPORTANT]
> **Several bundled 3D models are CC-BY 4.0 and require attribution** in any
> distributed build. The ready-to-paste in-game credits block is at the
> [end of this file](#in-game-credits-block-copy-paste).

**Contents**

- [Software dependencies](#software-dependencies)
- [Bundled art assets](#bundled-art-assets)
  - [Procedural / generated content](#procedural--generated-content)
  - [Boss models (glTF) — provenance to confirm](#boss-models-gltf--provenance-to-confirm)
  - [Mumbai & SVNIT PBR textures](#mumbai--svnit-pbr-textures)
  - [Desktop "realism" models & HDRI (pcx)](#desktop-realism-models--hdri-pcx)
  - [Fonts](#fonts)
  - [Audio](#audio)
  - [App icons](#app-icons)
- [Items flagged for maintainer review](#items-flagged-for-maintainer-review)
- [In-game credits block (copy-paste)](#in-game-credits-block-copy-paste)

---

## Software dependencies

All are permissively licensed (MIT/Apache/BSD) and installed via npm — none are
vendored into this repository. Versions reflect the three `package.json` files.

| Package | Used by | License |
| --- | --- | --- |
| **three** (Three.js) `^0.169` (android/pc), `^0.184` (vr) | Core 3D engine + `examples/jsm` addons (GLTFLoader, SkeletonUtils, BufferGeometryUtils, RGBELoader, VRButton, …) | **MIT** — © three.js authors |
| **vite** | Dev server + bundler | MIT |
| **@capacitor/core · cli · android · ios** | Android/iOS web-native wrapper (android build) | MIT |
| **electron** + **electron-builder** | macOS desktop `.app`/`.dmg` (pcx) | MIT |
| **@bubblewrap/cli** | PWA → Quest TWA APK (vrx) | Apache-2.0 |
| **@vitejs/plugin-basic-ssl** | HTTPS dev cert for WebXR (vrx) | MIT |
| **puppeteer** | Headless QA / smoke tests (dev only) | Apache-2.0 |
| **concurrently** | Run Vite + Electron together (pcx dev) | MIT |

Three.js (and the `examples/jsm` addons used here) is MIT-licensed; keep its
copyright notice when redistributing the bundle.

---

## Bundled art assets

### Procedural / generated content

The **overwhelming majority** of what you see is **generated in code at runtime**
and has **no third-party license**:

- **All worlds** — Kurukshetra, Mumbai and SVNIT are procedurally built from
  primitives (`src/world/**`).
- **All enemies** (dinosaurs, aliens, robots, ambient warriors) — procedural,
  instanced meshes built from Three.js primitives (`src/entities/**`).
- **The weapon, VFX, HUD, menus** — procedural geometry + DOM/CanvasTexture.
- **Audio & music** — 100% **procedural Web Audio** (oscillators/noise/filters);
  there are **no audio files** in the project (`src/engine/audio.js`).

### Boss models (glTF) — provenance to confirm

Three skinned "hybrid boss" models ship in `public/models/`:

| File | Used by | Animation rig (clip names) | Most likely source | License |
| --- | --- | --- | --- | --- |
| `boss-dino.glb` | `src/entities/dinosaurs.js` (Colossus) | `TRex_Idle/Walk/Run/Attack/Death/Jump` | Quaternius **Ultimate Animated Dinosaurs** (T-Rex) | CC0 1.0 *(to confirm — see below)* |
| `boss-alien.glb` | `src/entities/aliens.js` (Mega-Warlord) | `CharacterArmature\|Idle/Walk/Run/Punch/Death/Wave/Yes/No/Duck/HitReact/…` | Quaternius **Ultimate Animated Character/Monster** pack | CC0 1.0 *(to confirm — see below)* |
| `boss-robot.glb` | `src/entities/robots.js` (Titan-Mech) | `Idle/Walk/Run/Jump/Dance/Death/Punch/Sitting/Standing/ThumbsUp/WalkJump/Wave/Yes/No` | **"Robot Expressive"** by Tomás Laulhé (Quaternius), modified by Don McCurdy — bundled with three.js examples | **CC0 1.0** (high confidence) |

> [!WARNING]
> **These three files ship in `public/models/` with no embedded license
> metadata** (their glTF `asset` block only records the `FBX2glTF` generator). The
> animation clip names are a strong match for **Quaternius CC0** packs — and
> `boss-robot.glb`'s clip set is an exact match for three.js's CC0 *Robot
> Expressive* — so they are almost certainly CC0 (no attribution required). The
> same files were also used in the original desktop fork alongside its
> confirmed-CC0 Quaternius assets, which corroborates the provenance. **The
> maintainer should confirm each file's origin and record it here before
> publishing.** See
> [Items flagged for maintainer review](#items-flagged-for-maintainer-review).

### Mumbai & SVNIT PBR textures

`public/textures/mumbai/*.jpg` and `public/textures/svnit/*.jpg` (asphalt,
concrete, facade, marble, paving, sand, grass, dirt, bark — color/normal/rough
maps). Per the source headers (`src/world/mumbai/textures.js`,
`src/world/svnit/textures.js`):

> *"Real photographic CC0 textures (from **ambientCG**, public-domain/CC0)."*

**License: CC0 1.0** (public domain, no attribution required). Source:
[ambientCG.com](https://ambientcg.com/). The Kurukshetra world does not use these —
it relies on procedural materials.

### Desktop "realism" models & HDRI (pcx)

The desktop build's optional "realism pass" bundles ~20 game-ready glTF models and
one HDRI. They are fully documented, per-asset, in
[`pcx/public/models/realistic/CREDITS.md`](../../pcx/public/models/realistic/CREDITS.md)
(the authoritative list). Summary:

| Asset group | Author(s) | License |
| --- | --- | --- |
| Characters, vehicles, dinosaurs, aliens, monsters (Quaternius packs, via Poly Pizza) | Quaternius | **CC0 1.0** (17 assets) |
| `Robot Expressive`, `ToyCar` | Quaternius / Khronos | CC0 1.0 |
| `CesiumMan`, `Cesium Milk Truck` | © Cesium | **CC-BY 4.0** (attribution required) |
| `Fox` | mesh © PixelMannen (CC0); rig/anim © tomkranis (CC-BY 4.0); textures © AsoboStudio & scurest (CC-BY 4.0) | **CC0 + CC-BY 4.0** |
| HDRI `kloofendal_43d_clear_puresky_1k.hdr` | "Kloofendal 43d Clear (Pure Sky)" by **Greg Zaal / Poly Haven** | **CC0 1.0** — [polyhaven.com](https://polyhaven.com/a/kloofendal_43d_clear_puresky) |

CC-BY assets (CesiumMan, Cesium Milk Truck, Fox rig/anim/textures) **require
attribution** — included in the credits block below.

### Fonts

The UI uses the **system font stack** `'Georgia', 'Times New Roman', serif` and
`'Courier New', monospace`. **No font files are bundled or redistributed**, so no
font license applies.

### Audio

All sound and music are **synthesized at runtime via the Web Audio API** — there
are **no third-party audio assets** in this project.

### App icons

App / PWA icons are generated from the project's own SVG art (see
`vrx/public/icon.svg` and the `genicons` tooling). Original work, covered by the
project's MIT license.

---

## Items flagged for maintainer review

These need a human decision before a public open-source release:

1. **Boss glTF provenance (`public/models/boss-{dino,alien,robot}.glb`).** Almost
   certainly **CC0 (Quaternius / three.js Robot Expressive)** based on rig/clip
   names, but they ship **without embedded license metadata** in the canonical
   `androidx` repo. **Action:** confirm the exact source pack for each, and record
   it here. If any cannot be confirmed CC0, replace it with a known-CC0 model.
2. **Copyright line / author name.** `LICENSE` and this file use *"Kurukshetra FPS
   contributors"* and the year **2026**. Set the real copyright holder before
   publishing.
3. **Trademarks & real-world references.** "Mumbai", "SVNIT Surat" and named
   landmarks (Taj, Marine Drive) are real-world references; confirm this is
   acceptable for your distribution context. The game's mythological theming
   (Mahabharata) is public-domain lore.
4. **`com.cloudai.*` application IDs.** The Android (`com.cloudai.mahabharatfps`),
   Quest (`com.cloudai.kurukshetravr`) and desktop
   (`com.cloudai.kurukshetra.desktop`) IDs encode an organization namespace —
   change them to your own before store submission.

---

## In-game credits block (copy-paste)

Surface this (or equivalent) in an in-game "Credits / About" screen for any
distributed build.

```
KURUKSHETRA FPS
Game code © 2026 Kurukshetra FPS contributors — MIT License.

Engine: Three.js (MIT) — © three.js authors.

3D models:
- Quaternius (quaternius.com) — CC0 1.0.
- "Robot Expressive" by Tomás Laulhé (Quaternius), mod. Don McCurdy — CC0 1.0 (three.js).
- "ToyCar" — Khronos glTF Sample Assets — CC0 1.0.
- "CesiumMan" and "Cesium Milk Truck" © Cesium — CC-BY 4.0.
- "Fox" — mesh © PixelMannen (CC0); rig & animation © tomkranis (CC-BY 4.0);
  textures © AsoboStudio & scurest (CC-BY 4.0).

Textures: ambientCG — CC0 1.0.
HDRI: "Kloofendal 43d Clear (Pure Sky)" by Greg Zaal / Poly Haven — CC0 1.0.

Audio: procedural (Web Audio API) — no third-party samples.
```
