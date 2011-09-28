d3.geo.bonne = function() {
  var scale = 200,
      translate = [480, 250],
      rotate = d3.geo.rotate(),
      origin, // origin in degrees
      y1, // parallel latitude in radians
      c1; // cot(y1)

  function bonne(coordinates) {
    coordinates = rotate(coordinates);
    var x = coordinates[0] * d3_geo_radians,
        y = coordinates[1] * d3_geo_radians;
    if (y1) {
      var p = c1 + y1 - y,
          E = x * Math.cos(y) / p;
      x = p * Math.sin(E);
      y = p * Math.cos(E) - c1;
    } else {
      x *= Math.cos(y);
      y *= -1;
    }
    return [
      scale * x + translate[0],
      scale * y + translate[1]
    ];
  }

  bonne.invert = function(coordinates) {
    var x = (coordinates[0] - translate[0]) / scale,
        y = (coordinates[1] - translate[1]) / scale;
    if (y1) {
      var c = c1 + y, p = Math.sqrt(x * x + c * c);
      y = c1 + y1 - p;
      x = p * Math.atan2(x, c) / Math.cos(y);
    } else {
      y *= -1;
      x /= Math.cos(y);
    }
    return rotate.invert([x / d3_geo_radians, y / d3_geo_radians]);
  };

  // 90° for Werner, 0° for Sinusoidal
  bonne.parallel = function(x) {
    if (!arguments.length) return y1 / d3_geo_radians;
    c1 = 1 / Math.tan(y1 = x * d3_geo_radians);
    return bonne;
  };

  bonne.origin = function(x) {
    if (!arguments.length) return origin;
    origin = [+x[0], +x[1]];
    rotate = d3.geo.rotate().z(-origin[0]).y(origin[1]);
    return bonne;
  };

  bonne.scale = function(x) {
    if (!arguments.length) return scale;
    scale = +x;
    return bonne;
  };

  bonne.translate = function(x) {
    if (!arguments.length) return translate;
    translate = [+x[0], +x[1]];
    return bonne;
  };

  return bonne.origin([0, 0]).parallel(45);
};
