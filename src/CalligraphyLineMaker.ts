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

interface PathInfo {
  key: string;
  d: string;
  id: string;
  strokeWidth: number;
  strokeDasharray?: string;
  strokeLinecap?: string;
  stroke?: string;
}

export class CalligraphyLinePage extends GridMaker {
  #defaults: RequiredFields<CalligraphyLinePageConfig>;
  #config: RequiredFields<CalligraphyLinePageConfig>;
  #prettyName: string;
  #fileName: string;
  #pathEls = ['grid', 'slant', 'divider', 'baseLine', 'xHeightIndicator'];
  #paths: PathInfo[] = [];

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

  get ratio() {
    return {
      ascender: this.#config.ratioAscender,
      base: this.#config.ratioBase,
      descender: this.#config.ratioDescender,
    };
  }

  get normalizedRatio() {
    const factor = 1 / this.#config.ratioBase;
    return {
      ascender: this.#config.ratioAscender * factor,
      base: 1,
      descender: this.#config.ratioDescender * factor,
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

    // Initialize paths with empty 'd' strings but style stuff
    this.#pathEls.forEach((key) => {
      const strokeWidth = this.getStrokeWidthForKey(key);
      const strokeDasharray =
        key === 'divider' ? `0, ${strokeWidth * 3}` : undefined;
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
    const buffer = this.#config.addAreaBox ? this.#config.areaBlockBuffer : 0;
    const height = this.gridHeight - buffer * 2;
    const lineReps = Math.floor(height / this.lineHeight);
    const lineGap = (height - lineReps * this.lineHeight) / (lineReps - 1);
    let yLineStart = this.marginTop + buffer;

    for (let i = 0; i < lineReps; i++) {
      this.generateCalligraphyLineDefinitions(
        yLineStart,
        this.marginLeft,
        this.width - this.marginRight,
      );
      yLineStart += this.lineHeight + lineGap;
    }

    let groupWrapper = this.createGroup(
      'calligraphy-lines',
      this.generateUniqueId('calli-lines'),
      this.maskId ? this.maskId : undefined,
    );

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

  private generateCalligraphyLineDefinitions(
    gridPos: number,
    lineStart: number,
    lineEnd: number,
  ): void {
    const { ascender, base, descender } = this.normalizedRatio;
    const xHeight = this.xHeight;

    const yAsc = gridPos;
    const yX = yAsc + ascender * xHeight;
    const yBase = yX + base * xHeight;
    const yDesc = yBase + descender * xHeight;

    const ascenderLine = this.createLinePathDefinition(lineStart, yAsc, lineEnd, yAsc);
    const xHeightLine = this.createLinePathDefinition(lineStart, yX, lineEnd, yX);
    const baseLine = this.createLinePathDefinition(lineStart, yBase, lineEnd, yBase);
    const descenderLine = this.createLinePathDefinition(lineStart, yDesc, lineEnd, yDesc);

    this.updatePathDeclaration('grid', ascenderLine);
    this.updatePathDeclaration('grid', xHeightLine);
    this.updatePathDeclaration('baseLine', baseLine);
    this.updatePathDeclaration('grid', descenderLine);

    if (this.#config.showXHeightIndicator) {
      const x = lineStart + this.#config.xHeightIndicatorStrokeWidth * 0.5;
      this.updatePathDeclaration(
        'xHeightIndicator',
        this.createLinePathDefinition(x, yX, x, yBase),
      );
    }

    if (this.#config.addDividerLines) {
      const baseRatio = this.ratio.base;
      const ascRatio = this.ratio.ascender;
      const descRatio = this.ratio.descender;
      const dividerGapBase = xHeight / baseRatio;
      const dividerGapAsc =
        (xHeight * this.normalizedRatio.ascender) / ascRatio;
      const dividerGapDesc =
        (xHeight * this.normalizedRatio.descender) / descRatio;

      // Base area dividers
      for (let i = 1; i < baseRatio; i++) {
        const y = yX + dividerGapBase * i;
        this.updatePathDeclaration(
          'divider',
          this.createLinePathDefinition(lineStart, y, lineEnd, y),
        );
      }

      // Ascender area dividers
      for (let i = 1; i < ascRatio; i++) {
        const y = yAsc + dividerGapAsc * i;
        this.updatePathDeclaration(
          'divider',
          this.createLinePathDefinition(lineStart, y, lineEnd, y),
        );
      }

      // Descender area dividers
      for (let i = 1; i < descRatio; i++) {
        const y = yBase + dividerGapDesc * i;
        this.updatePathDeclaration(
          'divider',
          this.createLinePathDefinition(lineStart, y, lineEnd, y),
        );
      }
    }

    if (this.#config.slantAngle > 0) {
      this.addSlantLines(yDesc, lineStart);
    }
  }

  private addSlantLines(baseY: number, lineStart: number): void {
    const reps = this.#config.slantLinesPerLine;
    const height = this.lineHeight;
    const angleRad = (this.#config.slantAngle * Math.PI) / 180;
    const dx = height / Math.tan(angleRad);
    const totalWidth = this.gridWidth - dx;
    const gap = totalWidth / (reps - 1);

    for (let i = 0; i < reps; i++) {
      const x = lineStart + i * gap;
      const y1 = baseY;
      const x2 = x + dx;
      const y2 = baseY - height;
      this.updatePathDeclaration('slant', this.createLinePathDefinition(x, y1, x2, y2));
    }
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

  private updatePathDeclaration(key: string, d: string) {
    const pathObj = this.#paths.find((p) => p.key === key);
    if (pathObj) {
      pathObj.d += d;
    } else {
      console.warn(`Path declaration for key "${key}" not found.`);
    }
  }

  private getStrokeWidthForKey(key: string): number {
    switch (key) {
      case 'xHeightIndicator':
        return this.#config.xHeightIndicatorStrokeWidth;
      case 'baseLine':
        return this.#config.gridBaseLineStrokeWidth;
      case 'divider':
        return this.#config.gridStrokeWidth * 2;
      default:
        return this.#config.gridStrokeWidth;
    }
  }

  private initializePathInfo(
    name: string,
    stroke: string,
    strokeWidth: number,
    strokeDasharray?: string,
    strokeLinecap?: string,
  ): PathInfo {
    return {
      key: name,
      d: '',
      id: this.generateUniqueId(name),
      stroke: stroke,
      strokeWidth: strokeWidth,
      strokeDasharray: strokeDasharray,
      strokeLinecap: strokeLinecap,
    };
  }
}
