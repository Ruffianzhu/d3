d3.cielab = function(l, a, b) {
  return arguments.length === 1
      ? (l instanceof d3_Cielab ? d3_cielab(l.l, l.a, l.b)
      : d3_rgb_parse("" + l, d3_rgb_xyz, d3_hsl_xyz).cielab())
      : d3_cielab(+l, +a, +b);
};

function d3_cielab(l, a, b) {
  return new d3_Cielab(l, a, b);
}

function d3_Cielab(l, a, b) {
  this.l = l;
  this.a = a;
  this.b = b;
}

d3_Cielab.prototype.rgb = function() {
  return d3_cielab_rgb(this.l, this.a, this.b);
};

d3_Cielab.prototype.hsl = function() {
  return this.rgb().hsl();
};

d3_Cielab.prototype.xyz = function() {
  return d3_cielab_xyz(this.l, this.a, this.b);
};

d3_Cielab.prototype.cielch = function() {
  return d3_cielab_cielch(this.l, this.a, this.b);
};

/* 18 chosen to correspond roughly to RGB brighter/darker */
d3_Cielab.prototype.brighter = function(k) {
  return d3_cielab(Math.min(100, this.l + 18 * (arguments.length ? k : 1)), this.a, this.b);
};

d3_Cielab.prototype.darker = function(k) {
  return d3_cielab(Math.max(0, this.l - 18 * (arguments.length ? k : 1)), this.a, this.b);
};

d3_Cielab.prototype.toString = function() {
  return this.rgb().toString();
};

function d3_cielab_xyz(l, a, b) {
  var y = (l + 16) / 116;
  var x = a / 500 + y;
  var z = y - b / 200;

  function v(x) {
    var p = x * x * x;
    return p > 0.008856 ? p : (x - 16 / 116) / 7.787;
  }

  return d3_xyz(v(x) * 95.047, v(y) * 100.000, v(z) * 108.883);
}

function d3_cielab_rgb(l, a, b) {
  var y = (l + 16) / 116;
  var x = a / 500 + y;
  var z = y - b / 200;

  function v(x) {
    var p = x * x * x;
    return p > 0.008856 ? p : (x - 16 / 116) / 7.787;
  }

  var x = v(x) * 95.047;
  var y = v(y) * 100.000;
  var z = v(z) * 108.883;

  x /= 100;
  y /= 100;
  z /= 100;

  var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  var g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  var b = x * 0.0557 + y * -0.2040 + z * 1.0570;

  function w(r) {
    return r > 0.0031308 ? 1.055 * Math.pow(r, (1 / 2.4)) - 0.055 : 12.92 * r;
  }

  function ww(h) {
    return Math.round(w(h) * 255);
  }

  return d3_rgb(ww(r), ww(g), ww(b));
}

function d3_cielab_cielch(l, a, b) {
  var h = Math.atan2(b, a);

  h = h > 0 ? (h / Math.PI) * 180 : 360 - (Math.abs(h) / Math.PI) * 180;

  c = Math.sqrt(a * a + b * b);

  return d3_cielch(l, c, h);
}

