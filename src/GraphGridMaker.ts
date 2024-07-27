import {
  GridMaker,
  type GridPageBasicOptions,
  type GridPageExtendedOptions,
  type GridPageTechnicalOptions,
  type RequiredFields,
} from './GridMaker';

export type GraphGridPageBasicOptions = GridPageBasicOptions & {
  lineColor?: string;
  cellSize?: number;
};

export type GraphGridPageExtendedOptions = GridPageExtendedOptions & {
  gridStrokeWidth?: number;
};

export type GraphGridPageTechOptions = GridPageTechnicalOptions;

export type GraphGridPageConfig = GraphGridPageBasicOptions &
  GraphGridPageExtendedOptions &
  GraphGridPageTechOptions;

export class GraphGridPage extends GridMaker {
  #defaults: RequiredFields<GraphGridPageConfig>;
  #config: RequiredFields<GraphGridPageConfig>;
  #prettyName: string;
  #fileName: string;

  get graphDefaultValues(): RequiredFields<GraphGridPageConfig> {
    return this.#defaults;
  }

  constructor(options: Partial<GraphGridPageConfig> = {}) {
    super(options);
    const parentDefaults = this.defaultValues;
    this.#defaults = {
      ...parentDefaults,
      lineColor: parentDefaults.color,
      gridStrokeWidth: parentDefaults.stroke,
      cellSize: 5,
    };
    if ('color' in options) {
      this.#defaults.lineColor = options.color || this.#defaults.lineColor;
    }
    if ('stroke' in options) {
      this.#defaults.gridStrokeWidth =
        options.stroke || this.#defaults.gridStrokeWidth;
    }
    this.#config = { ...this.#defaults, ...options };
    this.#prettyName = this.generateName('pretty');
    this.#fileName = this.generateName('file');

    super.fileName = this.#fileName;
    super.prettyName = this.#prettyName;
  }

  makeSVG(): SVGElement {
    const svg = super.makeSVG();
    svg.innerHTML += this.addGraphGrid();
    return svg;
  }

  makeSVGString(): string {
    let svgString = super.makeSVGString(false);
    svgString += this.addGraphGrid();
    svgString += '</svg>';
    return svgString;
  }

  private addGraphGrid(): string {
    const cellSize = this.#config.cellSize!;
    const xEnd = this.width - this.marginRight;
    const yEnd = this.height - this.marginBottom;
    const horizontalReps = this.gridHeight / cellSize;
    const horizontalRemainder = this.gridHeight % cellSize;
    const verticalReps = this.gridWidth / cellSize;
    const verticalRemainder = this.gridWidth % cellSize;

    let gridParent = this.createGroup(
      'grid',
      'calli-grid',
      this.maskId ? this.maskId : undefined,
    );

    let yLineStart = this.marginTop + horizontalRemainder / 2;
    for (let i = 0; i <= horizontalReps; i++) {
      const line = this.drawSolidLine(
        'horizontal',
        yLineStart,
        this.marginLeft,
        xEnd,
        this.#config.lineColor,
        this.#config.gridStrokeWidth,
      );
      yLineStart += cellSize;
      gridParent += line;
    }

    let xLineStart = this.marginLeft + verticalRemainder / 2;
    for (let i = 0; i <= verticalReps; i++) {
      const line = this.drawSolidLine(
        'vertical',
        xLineStart,
        this.marginTop,
        yEnd,
        this.#config.lineColor,
        this.#config.gridStrokeWidth,
      );
      xLineStart += cellSize;
      gridParent += line;
    }

    gridParent += '</g>';

    return gridParent;
  }

  private generateName(type: 'pretty' | 'file'): string {
    const separator = type === 'pretty' ? ' ' : '_';
    const name = `graph${separator}${this.#config.cellSize!}mm`;
    return `${name}`;
  }
}
