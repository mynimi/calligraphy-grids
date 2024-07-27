import {
  CalligraphyAreaPage,
  CalligraphyAreaPageConfig,
} from './grids/CalligraphyAreaMaker';
import {
  CalligraphyLinePage,
  CalligraphyLinePageConfig,
} from './grids/CalligraphyLineMaker';
import { DotGridPage, DotGridPageConfig } from './grids/DotGridMaker';
import { GraphGridPage, GraphGridPageConfig } from './grids/GraphGridMaker';
import { GridPageConfig } from './grids/GridMaker';

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
