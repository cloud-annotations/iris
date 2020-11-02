interface Size {
  width: number;
  height: number;
  padding?: number;
}

interface Point {
  x: number;
  y: number;
}

interface Box extends Point {
  width: number;
  height: number;
}

class RetinaCanvas {
  private readonly dp: number;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;
  private readonly padding: number;

  private offsetX = 0;
  private offsetY = 0;
  private scaledWidth = 0;
  private scaledHeight = 0;

  constructor(
    canvas: HTMLCanvasElement,
    { width, height, padding = 64 }: Size
  ) {
    this.dp = window.devicePixelRatio;
    this.width = width;
    this.height = height;
    this.padding = padding;

    canvas.width = width * this.dp;
    canvas.height = height * this.dp;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw Error();
    }

    this.ctx = ctx;
  }

  private x(x: number) {
    return this.px(this.offsetX + x * this.scaledWidth);
  }

  private y(y: number) {
    return this.px(this.offsetY + y * this.scaledHeight);
  }

  private w(w: number) {
    return this.px(w * this.scaledWidth);
  }

  private h(h: number) {
    return this.px(h * this.scaledHeight);
  }

  private px(px: number) {
    return Math.round(px * this.dp);
  }

  drawImage(imageData: HTMLImageElement) {
    const { naturalWidth, naturalHeight } = imageData;

    const spaceMaxWidth = this.width - 2 * this.padding;
    const spaceMaxHeight = this.height - 2 * this.padding;

    const maxWidth = Math.min(spaceMaxWidth, naturalWidth);
    const maxHeight = Math.min(spaceMaxHeight, naturalHeight);

    const rs = maxWidth / maxHeight;
    const ri = naturalWidth / naturalHeight;

    if (rs > ri) {
      this.scaledWidth = (naturalWidth * maxHeight) / naturalHeight;
      this.scaledHeight = maxHeight;
    } else {
      this.scaledWidth = maxWidth;
      this.scaledHeight = (naturalHeight * maxWidth) / naturalWidth;
    }

    this.offsetX = this.padding + (spaceMaxWidth - this.scaledWidth) / 2;
    this.offsetY = this.padding + (spaceMaxHeight - this.scaledHeight) / 2;

    this.ctx.drawImage(
      imageData,
      this.px(this.offsetX),
      this.px(this.offsetY),
      this.px(this.scaledWidth),
      this.px(this.scaledHeight)
    );
  }

  drawBox(box: Box) {
    this.drawMoveBox(box);

    this.drawAnchor({
      x: box.x,
      y: box.y,
    });

    this.drawAnchor({
      x: box.x + box.width,
      y: box.y,
    });

    this.drawAnchor({
      x: box.x + box.width,
      y: box.y + box.height,
    });

    this.drawAnchor({
      x: box.x,
      y: box.y + box.height,
    });
  }

  private drawAnchor(point: Point) {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(
      this.x(point.x),
      this.y(point.y),
      this.px(4.5),
      0,
      Math.PI * 2,
      true
    );
    this.ctx.fill();

    this.ctx.fillStyle = "#bebebe";
    this.ctx.beginPath();
    this.ctx.arc(
      this.x(point.x),
      this.y(point.y),
      this.px(3.5),
      0,
      Math.PI * 2,
      true
    );
    this.ctx.fill();
  }

  private strokeRect(box: Box, { color, dash = [], offset, size }: any) {
    this.ctx.save();

    this.ctx.lineWidth = this.px(size);

    const inlineFix = this.ctx.lineWidth / 2;

    this.ctx.strokeStyle = color;

    this.ctx.setLineDash(dash.map((d: number) => this.px(d)));

    this.ctx.lineDashOffset = this.px(offset);
    this.ctx.strokeRect(
      this.x(box.x) + inlineFix,
      this.y(box.y) + inlineFix,
      this.w(box.width) - 2 * inlineFix,
      this.h(box.width) - 2 * inlineFix
    );
    this.ctx.restore();
  }

  private drawMoveBox(box: Box) {
    this.strokeRect(box, {
      color: "black",
      dash: [4, 4],
      offset: 4,
      size: 1,
    });

    this.strokeRect(box, {
      color: "white",
      dash: [4, 4],
      offset: 0,
      size: 1,
    });
  }
}

export default RetinaCanvas;
