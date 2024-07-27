import {
  GridMaker,
  type GridPageBasicOptions,
  type GridPageExtendedOptions,
  type GridPageTechnicalOptions,
  type RequiredFields,
} from './GridMaker';

export type DotGridPageBasicOptions = GridPageBasicOptions & {
  lineColor?: string;
  cellSize?: number;
};

export type DotGridPageExtendedOptions = GridPageExtendedOptions & {
  dotSize?: number;
};

export type DotGridPageTechOptions = GridPageTechnicalOptions;

export type DotGridPageConfig = DotGridPageBasicOptions &
  DotGridPageExtendedOptions &
  DotGridPageTechOptions;

export class DotGridPage extends GridMaker {
  #defaults: RequiredFields<DotGridPageConfig>;
  #config: RequiredFields<DotGridPageConfig>;
  #prettyName: string;
  #fileName: string;

  get dotDefaultValues(): RequiredFields<DotGridPageConfig> {
    return this.#defaults;
  }

  constructor(options: Partial<DotGridPageConfig> = {}) {
    super(options);
    const parentDefaults = this.defaultValues;
    this.#defaults = {
      ...parentDefaults,
      lineColor: parentDefaults.color,
      dotSize: 0.4,
      cellSize: 5,
    };
    if ('color' in options) {
      this.#defaults.lineColor = options.color || this.#defaults.lineColor;
    }
    if ('stroke' in options) {
      this.#defaults.dotSize = options.stroke || this.#defaults.dotSize;
    }
    this.#config = { ...this.#defaults, ...options };
    this.#prettyName = this.generateName('pretty');
    this.#fileName = this.generateName('file');

    super.fileName = this.#fileName;
    super.prettyName = this.#prettyName;
  }

  makeSVG(): SVGElement {
    const svg = super.makeSVG();
    svg.innerHTML += this.addDotGrid();
    return svg;
  }

  makeSVGString(): string {
    let svgString = super.makeSVGString(false);
    svgString += this.addDotGrid();
    svgString += '</svg>';
    return svgString;
  }

  private addDotGrid(): string {
    const cellSize = this.#config.cellSize!;
    const horizontalReps = this.gridHeight / cellSize;
    const horizontalRemainder = this.gridHeight % cellSize;
    const verticalReps = this.gridWidth / cellSize;
    const verticalRemainder = this.gridWidth % cellSize;
    const horizontalIntersections: number[] = [];
    const verticalIntersections: number[] = [];

    let yLineStart = this.marginTop + horizontalRemainder / 2;
    for (let i = 0; i <= horizontalReps; i++) {
      horizontalIntersections.push(yLineStart);
      yLineStart += cellSize;
    }

    let xLineStart = this.marginLeft + verticalRemainder / 2;
    for (let i = 0; i <= verticalReps; i++) {
      verticalIntersections.push(xLineStart);
      xLineStart += cellSize;
    }

    let gridParent = this.createGroup(
      'grid',
      'calli-grid',
      this.maskId ? this.maskId : undefined,
    );

    for (const horizontalPoint of horizontalIntersections) {
      for (const verticalPoint of verticalIntersections) {
        const dot = `<circle cx="${this.formatCoordinate(verticalPoint)}" cy="${this.formatCoordinate(
          horizontalPoint,
        )}" r="${this.#config.dotSize! / 2}" fill="${this.#config.lineColor!}" />`;
        gridParent += dot;
      }
    }
    gridParent += '</g>';
    return gridParent;
  }

  private generateName(type: 'pretty' | 'file'): string {
    const separator = type === 'pretty' ? ' ' : '_';
    const name = `dot${separator}grid${separator}${this.#config.cellSize!}mm`;
    return `${name}`;
  }
}
