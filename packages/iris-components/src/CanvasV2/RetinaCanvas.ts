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
  private dp: number;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private padding: number;

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

  loadImage(imageData: HTMLImageElement) {
    const { naturalWidth, naturalHeight } = imageData;

    const spaceMaxWidth = this.width - 2 * this.padding;
    const spaceMaxHeight = this.height - 2 * this.padding;

    const maxWidth = Math.min(spaceMaxWidth, naturalWidth);
    const maxHeight = Math.min(spaceMaxHeight, naturalHeight);

    const rs = maxWidth / maxHeight;
    const ri = naturalWidth / naturalHeight;

    let scaledWidth;
    let scaledHeight;

    if (rs > ri) {
      scaledWidth = (naturalWidth * maxHeight) / naturalHeight;
      scaledHeight = maxHeight;
    } else {
      scaledWidth = maxWidth;
      scaledHeight = (naturalHeight * maxWidth) / naturalWidth;
    }

    const offsetX = this.padding + (spaceMaxWidth - scaledWidth) / 2;
    const offsetY = this.padding + (spaceMaxHeight - scaledHeight) / 2;

    this.ctx.drawImage(
      imageData,
      offsetX * this.dp,
      offsetY * this.dp,
      scaledWidth * this.dp,
      scaledHeight * this.dp
    );
  }

  drawAnchor({ x, y }: Point) {
    const scale = window.devicePixelRatio;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x * scale, y * scale, 4.5 * scale, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.fillStyle = "#bebebe";
    ctx.beginPath();
    ctx.arc(x * scale, y * scale, 3.5 * scale, 0, Math.PI * 2, true);
    ctx.fill();
  }

  drawMoveBox({ x, y, width, height }: Box) {
    const scale = window.devicePixelRatio;
    ctx.lineWidth = 1 * scale;

    ctx.strokeStyle = "black";
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.lineDashOffset = 4 * scale;
    ctx.strokeRect(x * scale, y * scale, width * scale + 1, height * scale + 1);

    ctx.strokeStyle = "white";
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.lineDashOffset = 0;
    ctx.strokeRect(x * scale, y * scale, width * scale + 1, height * scale + 1);
  }
}

export default RetinaCanvas;
