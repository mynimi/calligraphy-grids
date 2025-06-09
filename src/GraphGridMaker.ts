import {
  GridMaker,
  IGridMaker,
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

export interface IGraphGridPage extends IGridMaker {
  graphDefaultValues: RequiredFields<GraphGridPageConfig>;
}

export class GraphGridPage extends GridMaker implements IGraphGridPage {
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
    const horizontalReps = Math.floor(this.gridHeight / cellSize);
    const horizontalRemainder = this.gridHeight % cellSize;
    const verticalReps = Math.floor(this.gridWidth / cellSize);
    const verticalRemainder = this.gridWidth % cellSize;

    let pathData = '';

    // Horizontal lines
    let yLineStart = this.marginTop + horizontalRemainder / 2;
    for (let i = 0; i <= horizontalReps; i++) {
      pathData += `M${this.formatCoordinate(this.marginLeft)} ${this.formatCoordinate(yLineStart)} L${this.formatCoordinate(xEnd)} ${this.formatCoordinate(yLineStart)} `;
      yLineStart += cellSize;
    }

    // Vertical lines
    let xLineStart = this.marginLeft + verticalRemainder / 2;
    for (let i = 0; i <= verticalReps; i++) {
      pathData += `M${this.formatCoordinate(xLineStart)} ${this.formatCoordinate(this.marginTop)} L${this.formatCoordinate(xLineStart)} ${this.formatCoordinate(yEnd)} `;
      xLineStart += cellSize;
    }

    let gridParent = this.createGroup(
      'grid',
      'calli-grid',
      this.maskId ? this.maskId : undefined,
    );

    gridParent += `<path d="${pathData.trim()}" stroke="${this.#config.lineColor!}" stroke-width="${this.#config.gridStrokeWidth}" fill="none" />`;

    gridParent += '</g>';

    return gridParent;
  }

  private generateName(type: 'pretty' | 'file'): string {
    const separator = type === 'pretty' ? ' ' : '_';
    const name = `graph${separator}${this.#config.cellSize!}mm`;
    return `${name}`;
  }
}
