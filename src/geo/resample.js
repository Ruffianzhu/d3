import "cartesian";
import "stream";

function d3_geo_resample(project) {
  var δ2 = .5, // precision, px²
      maxDepth = 16;

  function resample(stream) {
    var λ0, x0, y0, a0, b0, c0; // previous point

    var resample = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() { stream.polygonStart(); resample.lineStart = polygonLineStart; },
      polygonEnd: function() { stream.polygonEnd(); resample.lineStart = lineStart; }
    };

    function point(x, y) {
      x = project(x, y);
      stream.point(x[0], x[1]);
    }

    function lineStart() {
      x0 = NaN;
      resample.point = linePoint;
      stream.lineStart();
    }

    function linePoint(λ, φ) {
      var c = d3_geo_cartesian([λ, φ]), p = project(λ, φ), buffer = [];
      resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, buffer);
      streamLine(buffer, stream);
      stream.point(x0, y0);
    }

    function lineEnd() {
      resample.point = point;
      stream.lineEnd();
    }

    function polygonLineStart() {
      var λ00, φ00, x00, y00, a00, b00, c00; // first point

      lineStart();

      resample.point = function(λ, φ) {
        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resample.point = linePoint;
      };

      resample.lineEnd = function() {
        var buffer = [];
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, buffer);
        streamLine(buffer, stream);
        resample.lineEnd = lineEnd;
        lineEnd();
      };
    }

    function streamLine(line, stream) {
      for (var i = 0, n = line.length, point; i < n; ++i) {
        stream.point((point = line[i])[0], point[1]);
      }
    }

    return resample;
  }

  function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, buffer) {
    var dx = x1 - x0,
        dy = y1 - y0,
        d2 = dx * dx + dy * dy;
    if (d2 > 4 * δ2 && depth--) {
      var a = a0 + a1,
          b = b0 + b1,
          c = c0 + c1,
          m = Math.sqrt(a * a + b * b + c * c),
          φ2 = Math.asin(c /= m),
          λ2 = Math.abs(Math.abs(c) - 1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a),
          p = project(λ2, φ2),
          x2 = p[0],
          y2 = p[1],
          dx2 = x2 - x0,
          dy2 = y2 - y0,
          dz = dy * dx2 - dx * dy2,
          tooFar = false;
      if (dz * dz / d2 > δ2 || Math.abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || (tooFar = dx2 * dx2 + dy2 * dy2 > 256 * δ2)) {
        var s0 = resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, buffer);
        buffer.push(p);
        var s1 = resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, buffer);
        return !tooFar || s0 || s1 || (buffer.pop(), false);
      }
    }
  }

  resample.precision = function(_) {
    if (!arguments.length) return Math.sqrt(δ2);
    maxDepth = (δ2 = _ * _) > 0 && 16;
    return resample;
  };

  return resample;
}
