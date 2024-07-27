import {
  GridMaker,
  type GridPageBasicOptions,
  type GridPageExtendedOptions,
  type GridPageTechnicalOptions,
  type RequiredFields,
} from './GridMaker';

export type CalligraphyLinePageBasicOptions = GridPageBasicOptions & {
  lineColor?: string;
  xHeight?: number;
  ratioAscender?: number;
  ratioBase?: number;
  ratioDescender?: number;
  slantAngle?: number;
};

export type CalligraphyLinePageExtendedOptions = GridPageExtendedOptions & {
  gridStrokeWidth?: number;
  gridBaseLineStrokeWidth?: number;
  areaBlockBuffer?: number;
  showXHeightIndicator?: boolean;
  xHeightIndicatorStrokeWidth?: number;
  slantLinesPerLine?: number;
  addDividerLines?: boolean;
};

export type CalligraphyLinePageTechOptions = GridPageTechnicalOptions;

export type CalligraphyLinePageConfig = CalligraphyLinePageBasicOptions &
  CalligraphyLinePageExtendedOptions &
  CalligraphyLinePageTechOptions;

export class CalligraphyLinePage extends GridMaker {
  #defaults: RequiredFields<CalligraphyLinePageConfig>;
  #config: RequiredFields<CalligraphyLinePageConfig>;
  #prettyName: string;
  #fileName: string;

  get calligraphyLineDefaultValues(): RequiredFields<CalligraphyLinePageConfig> {
    return this.#defaults;
  }

  get lineHeight(): number {
    const { ascender, base, descender } = this.normalizedRatio;
    return this.xHeight * (ascender + base + descender);
  }

  get xHeight(): number {
    return this.#config.xHeight;
  }

  get ratio(): { ascender: number; base: number; descender: number } {
    return {
      ascender: this.#config.ratioAscender,
      base: this.#config.ratioBase,
      descender: this.#config.ratioDescender,
    };
  }

  get normalizedRatio(): { ascender: number; base: number; descender: number } {
    const normalizationFactor = 1 / this.#config.ratioBase;
    return {
      ascender: this.#config.ratioAscender * normalizationFactor,
      base: 1,
      descender: this.#config.ratioDescender * normalizationFactor,
    };
  }

  constructor(options: Partial<CalligraphyLinePageConfig> = {}) {
    super(options);
    const parentDefaults = this.defaultValues;
    this.#defaults = {
      ...parentDefaults,
      lineColor: parentDefaults.color,
      gridStrokeWidth: parentDefaults.stroke,
      gridBaseLineStrokeWidth: 0.5,
      xHeight: 7,
      ratioAscender: 3,
      ratioBase: 2,
      ratioDescender: 3,
      slantAngle: 55,
      showXHeightIndicator: true,
      xHeightIndicatorStrokeWidth: 2,
      slantLinesPerLine: 10,
      areaBlockBuffer: 7,
      addDividerLines: true,
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
    svg.innerHTML += this.addCalligraphyLines();
    return svg;
  }

  makeSVGString(): string {
    let svgString = super.makeSVGString(false);
    svgString += this.addCalligraphyLines();
    svgString += '</svg>';
    return svgString;
  }

  private addCalligraphyLines(): string {
    let gridParent = this.createGroup(
      'grid',
      'calli-grid',
      this.maskId ? this.maskId : undefined,
    );
    const buffer = this.#config.addAreaBox ? this.#config.areaBlockBuffer : 0;
    const height = this.gridHeight - buffer * 2;
    const lineReps = Math.floor(height / this.lineHeight);
    const lineGap = (height - lineReps * this.lineHeight) / (lineReps - 1);
    let yLineStart = this.marginTop + buffer;

    for (let i = 0; i < lineReps; i++) {
      const line = this.addCalligraphyLine(
        yLineStart,
        this.marginLeft,
        this.width - this.marginRight,
      );
      gridParent += line;
      yLineStart += this.lineHeight + lineGap;
    }

    gridParent += '</g>';

    return gridParent;
  }

  private addCalligraphyLine(
    gridPos: number,
    lineStart: number,
    lineEnd: number,
  ): Element | string {
    const {
      ascender: normalizedAscender,
      base: normalizedBase,
      descender: normalizedDescender,
    } = this.normalizedRatio;
    const gridPosAscenderLine = gridPos;
    const gridPosXHeightLine =
      gridPosAscenderLine + this.xHeight * normalizedAscender;
    const gridPosBaseLine = gridPosXHeightLine + this.xHeight * normalizedBase;
    const gridPosDescenderLine =
      gridPosBaseLine + this.xHeight * normalizedDescender;

    let lineGroup = this.createGroup('line');
    const ascender = this.addLineSection(
      'ascender',
      gridPosAscenderLine,
      lineStart,
      lineEnd,
      'down',
    );
    lineGroup += ascender;
    const base = this.addLineSection(
      'base',
      gridPosBaseLine,
      lineStart,
      lineEnd,
      'up',
    );
    lineGroup += base;
    const descender = this.addLineSection(
      'descender',
      gridPosDescenderLine,
      lineStart,
      lineEnd,
      'up',
    );
    lineGroup += descender;
    if (this.#config.slantAngle > 0) {
      const slantLines = this.addSlantLines(gridPosDescenderLine, lineStart);
      lineGroup += slantLines;
    }
    lineGroup += '</g>';
    return lineGroup;
  }

  private addSlantLines(gridPos: number, lineStart: number): string {
    let slantGroup = this.createGroup('slant-lines');
    const reps = this.#config.slantLinesPerLine;
    const endPosXFinalLine = this.gridWidth;
    const startPosXFinalLine =
      endPosXFinalLine -
      this.lineHeight / Math.tan((this.#config.slantAngle * Math.PI) / 180);
    const totalWidth = startPosXFinalLine;
    const spaceBetweenRepetitions = totalWidth / (reps - 1);
    let startPosX = lineStart;
    for (let i = 0; i < reps; i++) {
      const slantLine = this.drawSlantLine(
        this.lineHeight,
        this.#config.slantAngle,
        startPosX,
        gridPos,
        this.#config.lineColor,
        this.#config.gridStrokeWidth,
      );
      slantGroup += slantLine;
      startPosX += spaceBetweenRepetitions;
    }
    slantGroup += '</g>';
    return slantGroup;
  }

  private addLineSection(
    section: 'ascender' | 'base' | 'descender',
    gridPosLine: number,
    lineStart: number,
    lineEnd: number,
    dividerDrawingDirection: 'down' | 'up',
  ): Element | string {
    const ratios = this.ratio;
    const dividerGap = this.xHeight / ratios['base'];
    const ratio = ratios[section];
    const color = this.#config.lineColor;
    const stroke = this.#config.gridStrokeWidth;
    let group = this.createGroup(section);
    const gridPosXHeightLine = gridPosLine - this.xHeight;
    const gridPos = section !== 'base' ? gridPosLine : gridPosXHeightLine;
    const line1 = this.drawSolidLine(
      'horizontal',
      gridPos,
      lineStart,
      lineEnd,
      color,
      stroke,
    );
    group += line1;
    /**
     * the base section includes the x-Height Line (first solid line, and then additionally a thicker baseline)
     * and optionally a vertical xHeight Indicator
     */
    if (section === 'base') {
      const baseLine = this.drawSolidLine(
        'horizontal',
        gridPosLine,
        lineStart,
        lineEnd,
        color,
        this.#config.gridBaseLineStrokeWidth,
      );
      group += baseLine;
      if (this.#config.showXHeightIndicator) {
        const xHeightIndicator = this.drawSolidLine(
          'vertical',
          lineStart + this.#config.xHeightIndicatorStrokeWidth * 0.5,
          gridPosXHeightLine,
          gridPosLine,
          color,
          this.#config.xHeightIndicatorStrokeWidth,
        );
        group += xHeightIndicator;
      }
    }
    if (this.#config.addDividerLines) {
      for (let i = 1; i < ratio; i++) {
        const gap =
          dividerDrawingDirection == 'down' ? dividerGap : dividerGap * -1;
        const gridPos = gridPosLine + i * gap;
        const dotRadius = this.#config.gridStrokeWidth;
        const divider = this.drawDashedLine(
          'horizontal',
          gridPos,
          lineStart,
          lineEnd,
          dotRadius,
          color,
        );
        group += divider;
      }
    }
    group += '</g>';
    return group;
  }

  private generateName(type: 'pretty' | 'file'): string {
    const { ascender, base, descender } = this.ratio;
    const ratioSeparator = type === 'pretty' ? ':' : '-';
    const angleLabel = type === 'pretty' ? '°' : 'deg';
    const separator = type === 'pretty' ? ' ' : '_';

    const angle = `${this.#config.slantAngle}${angleLabel}`;
    const ratio = `${ascender}${ratioSeparator}${base}${ratioSeparator}${descender}`;
    const xHeight = `${this.xHeight}mm`;

    return `${angle}${separator}${ratio}${separator}${xHeight}`;
  }
}
