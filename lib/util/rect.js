class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Rect {
  constructor(p1x, p1y, p2x, p2y) {
    this.p1 = new Point(p1x, p1y);
    this.p2 = new Point(p2x, p2y);
  }

  containsPoint(point) {
    return this.p1.x <= point.x &&
      point.x <= this.p2.x &&
      this.p1.y <= point.y &&
      point.y <= this.p2.y;
  }

  contains(rect) {
    return this.containsPoint(rect.p1) && this.containsPoint(rect.p2)
  }
}