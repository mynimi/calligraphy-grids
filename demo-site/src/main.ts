import './style.css'
import {CalligraphyAreaPage, CalligraphyLinePage, DotGridPage, GraphGridPage, type CalligraphyAreaPageConfig, type CalligraphyLinePageConfig, type DotGridPageConfig, type GraphGridPageConfig, type GridPageConfig} from "../../src/index";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Grid Maker</h1>
  <h2>Previews in Action</h2>
  <h3>Defaults:</h3>
  <div data-previews></div>
  <h3>Square Mini Previews:</h3>
  <div data-previews-mini></div>
`

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
  ratioAscender: 3,
  ratioBase: 2,
  ratioDescender: 3,
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

console.log(new CalligraphyLinePage().makeSVGString());