import {
  GridMaker,
  IGridMaker,
  PathInfo,
  type GridPageBasicOptions,
  type GridPageExtendedOptions,
  type GridPageTechnicalOptions,
  type RequiredFields,
} from './GridMaker';

export type CalligraphyAreaPageBasicOptions = GridPageBasicOptions & {
  lineColor?: string;
  xHeight?: number;
  slantAngle?: number;
};

export type CalligraphyAreaPageExtendedOptions = GridPageExtendedOptions & {
  gridStrokeWidth?: number;
  slantAngleGap?: number;
  slantLineMinLength?: number;
  addDividerLines?: boolean;
};

export type CalligraphyAreaPageTechOptions = GridPageTechnicalOptions;

export type CalligraphyAreaPageConfig = CalligraphyAreaPageBasicOptions &
  CalligraphyAreaPageExtendedOptions &
  CalligraphyAreaPageTechOptions;

export interface ICalligraphyAreaPage extends IGridMaker {
  calligraphyAreaDefaultValues: RequiredFields<CalligraphyAreaPageConfig>;
}

export class CalligraphyAreaPage extends GridMaker implements ICalligraphyAreaPage {
  #defaults: RequiredFields<CalligraphyAreaPageConfig>;
  #config: RequiredFields<CalligraphyAreaPageConfig>;
  #prettyName: string;
  #fileName: string;
  #pathEls = ['grid', 'slant', 'divider'];
  #paths: PathInfo[] = [];

  get calligraphyAreaDefaultValues(): RequiredFields<CalligraphyAreaPageConfig> {
    return this.#defaults;
  }

  constructor(options: Partial<CalligraphyAreaPageConfig> = {}) {
    super(options);
    const parentDefaults = this.defaultValues;
    this.#defaults = {
      ...parentDefaults,
      lineColor: parentDefaults.color,
      gridStrokeWidth: parentDefaults.stroke,
      xHeight: 7,
      slantAngle: 55, // must be below 90
      slantAngleGap: 10,
      addDividerLines: true,
      slantLineMinLength: 10,
    };
    if ('color' in options) {
      this.#defaults.lineColor = options.color || this.#defaults.lineColor;
    }
    if ('stroke' in options) {
      this.#defaults.gridStrokeWidth = options.stroke || this.#defaults.gridStrokeWidth;
    }
    this.#config = { ...this.#defaults, ...options };
    this.#prettyName = this.generateName('pretty');
    this.#fileName = this.generateName('file');

    super.fileName = this.#fileName;
    super.prettyName = this.#prettyName;

    this.#pathEls.forEach((key) => {
      const strokeWidth = this.getStrokeWidthForKey(key);
      const strokeDasharray = key === 'divider' ? `0, ${strokeWidth * 3}` : undefined;
      const strokeLinecap = key === 'divider' ? 'round' : undefined;
      const declaration: PathInfo = this.initializePathInfo(
        key,
        this.#config.lineColor,
        strokeWidth,
        strokeDasharray,
        strokeLinecap,
      );
      this.#paths.push(declaration);
    });
  }

  makeSVG(): SVGElement {
    const svg = super.makeSVG();
    svg.innerHTML += this.addCalligraphyArea();
    return svg;
  }

  makeSVGString(): string {
    let svgString = super.makeSVGString(false);
    svgString += this.addCalligraphyArea();
    svgString += '</svg>';
    return svgString;
  }

  private addCalligraphyArea(): string {
    const xHeight = this.#config.xHeight;
    const reps = Math.floor(this.gridHeight / xHeight);
    const gap = (this.gridHeight - reps * xHeight) / (reps - 1);
    let yLineStart = this.marginTop;
    const lineStart = this.marginLeft;
    const lineEnd = this.width - this.marginRight;

    for (let i = 0; i < reps; i++) {
      this.updatePathDeclaration('grid', this.createLinePathDefinition(lineStart, yLineStart, lineEnd, yLineStart));
      if (this.#config.addDividerLines) {
        const y = yLineStart + xHeight / 2;
        this.updatePathDeclaration('divider', this.createLinePathDefinition(lineStart, y, lineEnd, y));
      }
      yLineStart += xHeight + gap;
    }

    const angleRad = (this.#config.slantAngle * Math.PI) / 180;
    const dx = this.gridHeight / Math.tan(angleRad);
    const totalWidth = this.gridWidth + dx;
    const spacing = this.#config.slantAngleGap;
    const repsSlant = Math.ceil(totalWidth / spacing);

    for (let i = -Math.floor(repsSlant / 2); i <= Math.ceil(repsSlant / 2); i++) {
      const x = this.marginLeft + i * spacing;
      const y1 = this.marginTop + this.gridHeight;
      const x2 = x + dx;
      const y2 = this.marginTop;
      this.updatePathDeclaration('slant', this.createLinePathDefinition(x, y1, x2, y2));
    }

    let groupWrapper = this.createGroup('calligraphy-area-lines', this.generateUniqueId('calli-area-lines'), this.maskId);
    this.#paths.forEach((pathObj) => {
      if (pathObj.d.trim()) {
        groupWrapper += `<path
          d="${pathObj.d.trim()}"
          id="${pathObj.id}"
          stroke="${pathObj.stroke}"
          stroke-width="${pathObj.strokeWidth}"
          ${pathObj.strokeDasharray ? `stroke-dasharray="${pathObj.strokeDasharray}"` : ''}
          ${pathObj.strokeLinecap ? `stroke-linecap="${pathObj.strokeLinecap}"` : ''}
        />`;
      }
    });
    groupWrapper += '</g>';
    return groupWrapper;
  }

  private generateName(type: 'pretty' | 'file'): string {
    const angleLabel = type === 'pretty' ? '°' : 'deg';
    const separator = type === 'pretty' ? ' ' : '_';
    const angle = `${this.#config.slantAngle}${angleLabel}`;
    const xHeight = `${this.#config.xHeight}mm`;
    return `${angle}${separator}${xHeight}`;
  }

  private getStrokeWidthForKey(key: string): number {
    switch (key) {
      case 'divider':
        return this.#config.gridStrokeWidth * 2;
      default:
        return this.#config.gridStrokeWidth;
    }
  }

  private updatePathDeclaration(key: string, d: string) {
    const pathObj = this.#paths.find((p) => p.key === key);
    if (pathObj) {
      pathObj.d += d;
    } else {
      console.warn(`Path declaration for key "${key}" not found.`);
    }
  }
}
