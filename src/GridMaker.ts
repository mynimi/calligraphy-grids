export interface GridPageBasicOptions {
  documentWidth?: number;
  documentHeight?: number;
  addAreaBox?: boolean;
  color?: string;
  stroke?: number;
}

export interface GridPageExtendedOptions {
  documentMarginTop?: number;
  documentMarginBottom?: number;
  documentMarginLeft?: number;
  documentMarginRight?: number;
  areaStrokeWidth?: number;
  areaStrokeColor?: string;
  areaBorderRadius?: number;
  addTitle?: boolean;
}

export interface GridPageTechnicalOptions {
  coordinateDecimalPlaceMax?: number;
  textFontSize?: number;
  textLineHeight?: number;
}

export type OutputType = 'dom' | 'string';

export type RequiredFields<T> = { [K in keyof T]-?: T[K] };

export type GridPageConfig = GridPageBasicOptions &
  GridPageExtendedOptions &
  GridPageTechnicalOptions;

export class GridMaker {
  #defaults: RequiredFields<GridPageConfig>;
  #config: RequiredFields<GridPageConfig>;
  #prettyName: string = this.generateGridName('pretty');
  #fileName: string = this.generateGridName('file');
  readonly #defaultStrokeSize: number = 0.2;
  readonly #defaultStrokeColor: string = '#000000';
  readonly #copyrightSizeFactor: number = 0.7;
  readonly #textBuffer: number = 2;
  readonly #fontColor: string = '#808080';
  readonly #copyRightText: string =
    '© grid code.halfapx.com/guideline-generator/';
  readonly #addCopyright: boolean = true;
  #maskId: string = '';

  get maskId(): string {
    return this.#maskId;
  }

  set maskId(id: string) {
    this.#maskId = id;
  }

  get defaultValues(): RequiredFields<GridPageConfig> {
    return this.#defaults;
  }

  get width(): number {
    return this.#config.documentWidth;
  }

  get height(): number {
    return this.#config.documentHeight;
  }

  private get textHeight(): number {
    return (
      this.#config.textFontSize * this.#config.textLineHeight + this.#textBuffer
    );
  }

  get marginTop(): number {
    return this.#config.addTitle
      ? this.#config.documentMarginTop + this.textHeight
      : this.#config.documentMarginTop;
  }

  get marginBottom(): number {
    return this.#addCopyright
      ? this.#config.documentMarginBottom +
          this.textHeight * this.#copyrightSizeFactor
      : this.#config.documentMarginBottom;
  }

  get marginLeft(): number {
    return this.#config.documentMarginLeft;
  }

  get marginRight(): number {
    return this.#config.documentMarginRight;
  }

  get gridWidth(): number {
    return (
      this.width -
      this.#config.documentMarginLeft -
      this.#config.documentMarginRight
    );
  }

  get gridHeight(): number {
    return this.height - this.marginTop - this.marginBottom;
  }

  get prettyName(): string {
    return this.#prettyName;
  }

  get fileName(): string {
    return this.#fileName;
  }

  set prettyName(text: string) {
    this.#prettyName = text;
  }

  set fileName(text: string) {
    this.#fileName = text;
  }

  constructor(options: Partial<GridPageConfig> = {}) {
    this.#defaults = {
      documentWidth: 210,
      documentHeight: 297,
      documentMarginTop: 10,
      documentMarginBottom: 10,
      documentMarginLeft: 7,
      documentMarginRight: 7,
      color: this.#defaultStrokeColor,
      stroke: this.#defaultStrokeSize,
      addAreaBox: true,
      areaBorderRadius: 5,
      areaStrokeWidth: this.#defaultStrokeSize,
      areaStrokeColor: this.#defaultStrokeColor,
      coordinateDecimalPlaceMax: 2,
      textFontSize: 4,
      textLineHeight: 1.2,
      addTitle: true,
    };

    this.#defaults.areaStrokeColor = options.color || this.#defaultStrokeColor;
    this.#defaults.areaStrokeWidth = options.stroke || this.#defaultStrokeSize;
    this.#config = { ...this.#defaults, ...options };
  }

  makeSVG(): SVGElement {
    const svg = this.createDocument('dom') as SVGElement;
    svg.innerHTML = this.addSVGContent();
    return svg;
  }

  makeSVGString(addCloseTag: boolean = true): string {
    let svgString = this.createDocument('string') as string;
    svgString += this.addSVGContent();
    if (addCloseTag) {
      svgString += '</svg>';
    }
    return svgString;
  }

  addSVGContent(): string {
    let string = '';
    if (this.#addCopyright) {
      string += this.addCopyright();
    }
    if (this.#config.addTitle) {
      string += this.addTitle();
    }
    if (this.#config.addAreaBox) {
      string += this.addMask();
      string += this.addRectangle('transparent', this.#config.areaStrokeColor);
    }
    return string;
  }

  createGroup(className?: string, idName?: string, maskId?: string): string {
    return /*html*/ `
        <g 
          ${className ? `class="${className}"` : ''} 
          ${idName ? `id="${idName}"` : ''} 
          ${maskId ? `clip-path="url(#${maskId})"` : ''}
        >`;
  }

  addLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    stroke: number,
    srokeDashArray?: string,
    strokeLineCap?: 'round' | 'square' | 'butt',
  ): string {
    const formatX1 = this.formatCoordinate(x1);
    const formatX2 = this.formatCoordinate(x2);
    const formatY1 = this.formatCoordinate(y1);
    const formatY2 = this.formatCoordinate(y2);
    return /*html*/ `
        <line 
          x1="${formatX1}" 
          y1="${formatY1}" 
          x2="${formatX2}" 
          y2="${formatY2}" 
          stroke="${color}" 
          stroke-width="${stroke}"
          ${srokeDashArray ? `stroke-dasharray="${srokeDashArray}"` : ''}
          ${strokeLineCap ? `stroke-linecap="${strokeLineCap}"` : ''}
        />
      `;
  }

  drawSolidLine(
    orientation: 'horizontal' | 'vertical',
    gridPos: number,
    lineStart: number,
    lineEnd: number,
    color: string,
    stroke: number,
  ): string {
    let x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0;
    if (orientation === 'horizontal') {
      x1 = lineStart;
      x2 = lineEnd;
      y1 = y2 = gridPos;
    }
    if (orientation === 'vertical') {
      y1 = lineStart;
      y2 = lineEnd;
      x1 = x2 = gridPos;
    }

    const line = this.addLine(x1, y1, x2, y2, color, stroke);
    return line;
  }

  drawDashedLine(
    orientation: 'horizontal' | 'vertical',
    gridPos: number,
    lineStart: number,
    lineEnd: number,
    dotRadius: number,
    dotColor: string,
  ): string {
    const dotSize = dotRadius * 2;
    const dotGap = dotRadius * 4;
    let x1 = 0,
      x2 = 0,
      y1 = 0,
      y2 = 0;
    if (orientation === 'horizontal') {
      x1 = lineStart;
      x2 = lineEnd;
      y1 = y2 = gridPos;
    }
    if (orientation === 'vertical') {
      y1 = lineStart;
      y2 = lineEnd;
      x1 = x2 = gridPos;
    }

    return this.addLine(
      x1,
      y1,
      x2,
      y2,
      dotColor,
      dotSize,
      `0,${dotGap.toString()}`,
      'round',
    );
  }

  drawSlantLine(
    lineHeight: number,
    angle: number,
    xStart: number,
    yStart: number,
    color: string,
    stroke: number,
  ): string {
    const xEnd = xStart + lineHeight / Math.tan((angle * Math.PI) / 180);
    const yEnd = yStart - lineHeight;

    const line = this.addLine(xStart, yStart, xEnd, yEnd, color, stroke);

    return line;
  }

  formatCoordinate(n: number): string {
    return parseFloat(
      n.toFixed(this.#config.coordinateDecimalPlaceMax),
    ).toString();
  }

  private generateUniqueId(baseId: string): string {
    const uniqueIdSuffix = Math.random().toString(36).substr(2, 5); // Generating a random unique string
    return `${baseId}-${uniqueIdSuffix}`;
  }

  private addTitle(): string {
    const titleFontSize = this.#config.textFontSize!;
    const titleTopPos =
      titleFontSize * this.#config.textLineHeight! +
      this.#config.documentMarginTop!;
    const titleLeftPos =
      this.#config.documentWidth! - this.#config.documentMarginRight!;

    return this.addText(
      this.prettyName,
      titleFontSize,
      'end',
      titleTopPos,
      titleLeftPos,
    );
  }

  private addCopyright(): string {
    const fontSize = this.#config.textFontSize! * this.#copyrightSizeFactor;
    const topPos = this.height - this.#config.documentMarginBottom!;
    const leftPos = this.#config.documentMarginLeft!;

    return this.addText(
      this.#copyRightText,
      fontSize,
      'start',
      topPos,
      leftPos,
    );
  }

  protected generateGridName(type: 'pretty' | 'file'): string {
    const separator = type === 'pretty' ? ' ' : '_';
    const name = `grid${separator}page`;
    return `${name}`;
  }

  private createDocument(output: OutputType): SVGElement | string {
    if (output === 'dom') {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const viewBox = `0 0 ${this.width} ${this.height}`;
      svg.setAttribute('viewBox', viewBox);
      svg.setAttribute('id', this.generateUniqueId('grid-page'));
      return svg;
    } else {
      const svgString = `
        <svg 
          viewBox="0 0 ${this.width} ${this.height}" 
          id="${this.generateUniqueId('grid-page')}"
        >`;
      return svgString;
    }
  }

  private addMask(): string {
    const maskId = this.generateUniqueId('mask');
    this.maskId = maskId;
    return /*html*/ `
      <defs>
        <clipPath id="${maskId}">
          ${this.addRectangle('white', 'black')}
        </clipPath>
      </defs>
      `;
  }

  private addRectangle(fillColor: string, strokeColor: string): string {
    return /*html*/ `
        <rect
          x="${this.marginLeft}"
          y="${this.marginTop}"
          width="${this.gridWidth}"
          height="${this.gridHeight}"
          rx="${this.#config.areaBorderRadius}"
          fill="${fillColor}"
          stroke-width="${this.#config.areaStrokeWidth}"
          stroke="${strokeColor}"
        />
      `;
  }

  private addText(
    text: string,
    fontSize: number,
    textAnchor: 'start' | 'end',
    topPos: number,
    leftPos: number,
  ): string {
    return /*html*/ `
          <text
            x="${leftPos}"
            y="${topPos}"
            text-anchor="${textAnchor}"
            font-size="${fontSize}"
            fill="${this.#fontColor}"
            font-family="Arial, sans-serif"
          >
            ${text}
          </text>
        `;
  }
}
