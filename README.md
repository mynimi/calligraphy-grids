# Calligraphy Grids
Classes to create Calligraphy Grids.

[Online Version](https://code.halfapx.com/guideline-generator/) that combines
it with a form and PDF Export, as well as a quick print style.

## How to use

### Install

```console
npm i --D calligraphy-grids
```

### Get SVG
Depending on whether or not you have the document available, you'd implement
it either as an SVG element, or via SVG string.

There are Types for all the different Configs available.

Docs on that are a WIP.

start with this in your HTML

```html
<div data-previews></div>
<div data-previews-mini></div>
```

We will then render the Mini Previews with a modified version of the defaults,
and the regular ones with the defaults.

The `makeSVG()` method creates a DOM Element, that can be appended to an element.

While `makeSVGString()` creates just a string that can then be added to an element as innerHTML.

```ts
import { CalligraphyAreaPage, CalligraphyLinePage, DotGridPage, GraphGridPage } from "calligraphy-grids";

const gridConfigShared: GridPageConfig = {
  documentWidth: 40,
  documentHeight: 40,
  documentMarginTop: 2,
  documentMarginBottom: 0,
  documentMarginLeft: 2,
  documentMarginRight: 2,
  areaBorderRadius: 3,
  addTitle: false,
  textFontSize: 0,
  textLineHeight: 0,
};

const lineConfig: CalligraphyLinePageConfig = {
  ...gridConfigShared,
  xHeight: 4,
  areaBlockBuffer: 2,
};

const areaConfig: CalligraphyAreaPageConfig = {
  ...gridConfigShared,
  xHeight: 10,
};

const dotConfig: DotGridPageConfig = {
  ...gridConfigShared,
  cellSize: 5,
  dotSize: 1,
};

const graphConfig: GraphGridPageConfig = {
  ...gridConfigShared,
  gridStrokeWidth: 0.4,
  cellSize: 5,
};

const calligraphyLineGrid = new CalligraphyLinePage(lineConfig);
const calligraphyAreaGrid = new CalligraphyAreaPage(areaConfig);
const dotGrid = new DotGridPage(dotConfig);
const graphGrid = new GraphGridPage(graphConfig);

const previewWrapper = document.querySelector('[data-previews]');
const miniPreviewWrapper = document.querySelector('[data-previews-mini]');
miniPreviewWrapper!.appendChild(calligraphyLineGrid.makeSVG());
miniPreviewWrapper!.appendChild(calligraphyAreaGrid.makeSVG());
miniPreviewWrapper!.appendChild(dotGrid.makeSVG());
miniPreviewWrapper!.appendChild(graphGrid.makeSVG());

previewWrapper!.innerHTML = '';
previewWrapper!.innerHTML += new CalligraphyLinePage().makeSVGString();
previewWrapper!.innerHTML += new CalligraphyAreaPage().makeSVGString();
previewWrapper!.innerHTML += new DotGridPage().makeSVGString();
previewWrapper!.innerHTML += new GraphGridPage().makeSVGString();
```

### In Use
There is a small demo-site with vite in the git project, `demo-site`

run

```console
cd demo-site
npm ci
npm run dev
```

to see previews
