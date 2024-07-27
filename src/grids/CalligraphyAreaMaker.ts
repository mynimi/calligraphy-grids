import {
  GridMaker,
  type GridPageBasicOptions,
  type GridPageExtendedOptions,
  type GridPageTechnicalOptions,
  type RequiredFields,
} from './GridMaker';

interface Point {
  x: number;
  y: number;
}

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

export class CalligraphyAreaPage extends GridMaker {
  #defaults: RequiredFields<CalligraphyAreaPageConfig>;
  #config: RequiredFields<CalligraphyAreaPageConfig>;
  #prettyName: string;
  #fileName: string;

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
    const horizontalReps = this.gridHeight / xHeight;
    const horizontalRemainder = this.gridHeight % xHeight;
    const lineStart = this.marginLeft;
    const lineEnd = this.width - this.marginRight;
    const color = this.#config.lineColor;
    const stroke = this.#config.gridStrokeWidth;
    const dotSize = this.#config.gridStrokeWidth;
    const rectCenterX = this.marginLeft + this.gridWidth / 2;
    const rectCenterY = this.marginTop + this.gridHeight / 2;
    const rectDiagonal = Math.sqrt(
      Math.pow(this.gridWidth, 2) + Math.pow(this.gridHeight, 2),
    );
    const lineAngle = 180 - this.#config.slantAngle;
    const slantSpacing = this.#config.slantAngleGap;
    // we're using the diagonal length as a basis to ensure we cover the entire area with our function
    const slantReps = rectDiagonal / slantSpacing;

    let gridParent = this.createGroup(
      'grid',
      'calli-grid',
      this.maskId ? this.maskId : undefined,
    );

    let horizontalLines = this.createGroup('horizontal-lines');
    let yLineStart = this.marginTop + horizontalRemainder / 2;
    for (let i = 0; i <= horizontalReps; i++) {
      const line = this.drawSolidLine(
        'horizontal',
        yLineStart,
        lineStart,
        lineEnd,
        color,
        stroke,
      );
      if (this.#config.addDividerLines) {
        if (i < horizontalReps) {
          const gridPos = yLineStart + xHeight / 2;
          const line = this.drawDashedLine(
            'horizontal',
            gridPos,
            lineStart,
            lineEnd,
            dotSize,
            color,
          );
          horizontalLines += line;
        }
      }
      yLineStart += xHeight;
      horizontalLines += line;
    }
    gridParent += horizontalLines;

    let slantLines = this.createGroup('slant-lines');

    const angleRad = (lineAngle * Math.PI) / 180;
    const centerLineLength = rectDiagonal / 2;
    const lineStartX = rectCenterX - centerLineLength * Math.cos(angleRad);
    const lineStartY = rectCenterY - centerLineLength * Math.sin(angleRad);
    const lineEndX = rectCenterX + centerLineLength * Math.cos(angleRad);
    const lineEndY = rectCenterY + centerLineLength * Math.sin(angleRad);

    const line = this.drawLineWithinArea(
      lineStartX,
      lineStartY,
      lineEndX,
      lineEndY,
      color,
      stroke,
    );
    slantLines += line;
    let distance = slantSpacing;
    for (let i = 0; i < slantReps; i++) {
      // draw lines to the left and right of center line
      const linesLeft = this.createParallelLine(
        lineStartX,
        lineStartY,
        lineEndX,
        lineEndY,
        distance,
        color,
        stroke,
        this.#config.slantLineMinLength,
      );
      const linesRight = this.createParallelLine(
        lineStartX,
        lineStartY,
        lineEndX,
        lineEndY,
        distance * -1,
        color,
        stroke,
        this.#config.slantLineMinLength,
      );
      slantLines += linesLeft;
      slantLines += linesRight;
      distance += slantSpacing;
    }

    gridParent += slantLines;
    gridParent += '</g>';
    return gridParent;
  }

  private generateParallelCoordinates(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    distance: number,
  ): { x1: number; y1: number; x2: number; y2: number } {
    // Calculate offsets for the new line based on the distance provided
    const xOffset = distance;

    // Calculate new coordinates for the parallel line along the X-axis
    const newX1 = x1 + xOffset;
    const newY1 = y1;
    const newX2 = x2 + xOffset;
    const newY2 = y2;

    return { x1: newX1, y1: newY1, x2: newX2, y2: newY2 };
  }

  private drawLineWithinArea(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    stroke: number,
    maxLength?: number,
  ): string {
    const intersectionPoints = this.calculateIntersectionPoints(x1, y1, x2, y2); // Corrected parameter order
    let line = '';

    if (intersectionPoints.length > 0) {
      // Trim the line to start and end at the intersection points
      let trimmedX1 = x1;
      let trimmedY1 = y1;
      let trimmedX2 = x2;
      let trimmedY2 = y2;

      if (intersectionPoints.length >= 2) {
        trimmedX1 = intersectionPoints[0].x;
        trimmedY1 = intersectionPoints[0].y;
        trimmedX2 = intersectionPoints[1].x;
        trimmedY2 = intersectionPoints[1].y;
      }

      const trimmedLineLength = Math.sqrt(
        (trimmedX2 - trimmedX1) ** 2 + (trimmedY2 - trimmedY1) ** 2,
      );

      const lineColor = color;
      if (maxLength) {
        if (trimmedLineLength > maxLength) {
          line = this.addLine(
            trimmedX1,
            trimmedY1,
            trimmedX2,
            trimmedY2,
            lineColor,
            stroke,
          );
        }
      } else {
        line = this.addLine(
          trimmedX1,
          trimmedY1,
          trimmedX2,
          trimmedY2,
          lineColor,
          stroke,
        );
      }
    }
    return line;
  }

  private createParallelLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    distance: number,
    color: string,
    stroke: number,
    maxLength: number | undefined,
  ): string {
    const {
      x1: newX1,
      y1: newY1,
      x2: newX2,
      y2: newY2,
    } = this.generateParallelCoordinates(x1, y1, x2, y2, distance);
    return this.drawLineWithinArea(
      newX1,
      newY1,
      newX2,
      newY2,
      color,
      stroke,
      maxLength,
    );
  }

  private calculateIntersectionPoints(
    lineX1: number,
    lineY1: number,
    lineX2: number,
    lineY2: number,
  ): Point[] {
    const rectX = this.marginLeft;
    const rectY = this.marginTop;
    const rectWidth = this.gridWidth;
    const rectHeight = this.gridHeight;

    const slope = (lineY2 - lineY1) / (lineX2 - lineX1);
    const yIntercept = lineY1 - slope * lineX1;
    const isInsideRectangle = (x: number, y: number) =>
      x >= rectX &&
      x <= rectX + rectWidth &&
      y >= rectY &&
      y <= rectY + rectHeight;
    const topIntersectionX = (rectY - yIntercept) / slope;
    const bottomIntersectionX = (rectY + rectHeight - yIntercept) / slope;
    const leftIntersectionY = slope * rectX + yIntercept;
    const rightIntersectionY = slope * (rectX + rectWidth) + yIntercept;

    const intersectionPoints: Point[] = [];

    if (isInsideRectangle(topIntersectionX, rectY)) {
      intersectionPoints.push({ x: topIntersectionX, y: rectY });
    }
    if (isInsideRectangle(bottomIntersectionX, rectY + rectHeight)) {
      intersectionPoints.push({
        x: bottomIntersectionX,
        y: rectY + rectHeight,
      });
    }
    if (isInsideRectangle(rectX, leftIntersectionY)) {
      intersectionPoints.push({ x: rectX, y: leftIntersectionY });
    }
    if (isInsideRectangle(rectX + rectWidth, rightIntersectionY)) {
      intersectionPoints.push({ x: rectX + rectWidth, y: rightIntersectionY });
    }
    return intersectionPoints;
  }

  private generateName(type: 'pretty' | 'file'): string {
    const angleLabel = type === 'pretty' ? '°' : 'deg';
    const separator = type === 'pretty' ? ' ' : '_';

    const angle = `${this.#config.slantAngle}${angleLabel}`;
    const xHeight = `${this.#config.xHeight}mm`;

    return `${angle}${separator}${xHeight}`;
  }
}
