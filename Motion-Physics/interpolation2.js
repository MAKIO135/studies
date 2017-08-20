/*
    This page presents a collection of polynomial functions for shaping, tweening, and easing signals in the range [0...1]
    - Blinn-Wyvill Approximation to the Raised Inverted Cosine
    - Double-Cubic Seat
    - Double-Cubic Seat with Linear Blend
    - Double-Odd-Polynomial Seat
    - Symmetric Double-Polynomial Sigmoids
    - Quadratic Through a Given Point
    - Exponential Ease-In and Ease-Out
    - Double-Exponential Seat
    - Double-Exponential Sigmoid
    - The Logistic Sigmoid
    - Quadratic Bezier
    - Cubic Bezier
    - Cubic Bezier (Nearly) Through Two Given Points
    - Circular Interpolation: Ease-In and Ease-Out 
    - Double-Circle Seat
    - Double-Circle Sigmoid
    - Double-Elliptic Seat
    - Double-Elliptic Sigmoid
    - Double-Linear with Circular Fillet
    - Circular Arc Through a Given Point
 */

var interpolator = function( end, f ){
    return function( d, i, a ){
        var interpolation = d3.interpolate( a, end );
        return function( t ){
            return interpolation( f( t ) );
        };
    };
};

/***********************************************
 * http://www.flong.com/texts/code/shapers_poly/
 **********************************************/
/*
    Blinn-Wyvill Approximation to the Raised Inverted Cosine

    Trigonometric functions like cos() and sin() are ubiquitous in natural sciences, engineering and animation, but they can be expensive to compute. If a situation calls for millions of trigonometric operations per second, substantial speed optimizations can be obtained by using an approximation constructed from simple arithmetic functions. An example is the Blinn-Wyvill polynomial approximation to the Raised Inverted Cosine, which diverges from the authentic (scaled) trigonometric function by less than 0.1% within the range [0...1]. It also shares some of the Raised Inverted Cosine's key properties, having flat derivatives at 0 and 1, and the value 0.5 at x=0.5. It has the strong advantage that it is relatively efficient to compute, since it is comprised exclusively from simple arithmetic operations and cacheable fractions. Unlike the Raised Inverted Cosine, it does not have infinite derivatives, but since it is a sixth-order function, this limitation is unlikely to be noticed in practice.

    This would be a useful approximation for the cos() and sin() trigonometric functions for a small microprocessor (such as an Arduino) which has limited speed and math capabilities.
*/
function blinnWyvillCosineApproximation( _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    if( _debug ){
        var epsilon = 10e-6;
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var x2 = x * x,
            x4 = x2 * x2,
            x6 = x4 * x2,
            fa = 4 / 9,
            fb = 17 / 9,
            fc = 22 / 9,
            y = fa * x6 - fb * x4 + fc * x2;

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    };
}

/*
    Double-Cubic Seat

    This seat-shaped function is formed by joining two 3rd-order polynomial (cubic) curves. The curves meet with a horizontal inflection point at the control coordinate (a,b) in the unit square.
*/
function doubleCubicSeat( a, b, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0;
    var max_param_b = 1;
    a = Math.min( max_param_a, Math.max( min_param_a, a ) );   
    b = Math.min( max_param_b, Math.max( min_param_b, b ) );
    b = 1 - b;

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y;
        if ( x <= a ){
              y = b - b * Math.pow( 1 - x / a, 3 );
        } else {
              y = b + ( 1 - b ) * Math.pow( ( x - a ) / ( 1 - a ), 3 );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    };
}

/*
    Double-Cubic Seat with Linear Blend

    This modified version of the Double-Cubic Seat function uses a single variable to control the location of its inflection point along the diagonal of the unit square. A second parameter is used to blend this curve with the Identity Function (y=x). Here, we use the variable b to control the amount of this blend, which has the effect of tilting the slope of the curve's plateau in the vicinity of its inflection point. The adjustable flattening around the inflection point makes this a useful shaping function for lensing or magnifying evenly-spaced data.
*/
function doubleCubicSeatWithLinearBlend( a, b, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0;
    var max_param_b = 1;
    a = Math.min( max_param_a, Math.max( min_param_a, a ) );    
    b = Math.min( max_param_b, Math.max( min_param_b, b ) ); 
    b = 1 - b; //reverse for intelligibility.

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y;
        if ( x <= a ){
            y = b * x + ( 1 - b ) * a * ( 1 - Math.pow( 1 - x / a, 3) );
        } else {
            y = b * x + ( 1 - b ) * ( a + ( 1 - a ) * Math.pow( ( x - a ) / ( 1 - a ), 3) );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    };
}

/*
    Double-Odd-Polynomial Seat

    The previous Double-Cubic Seat function can be generalized to a form which uses any odd integer exponent. In the code below, the parameter n controls the flatness or breadth of the plateau region in the vicinity of the point (a,b). A good working range for n is the set of whole numbers from 1 to about 20.

    Odd-powered polynomials, such as cubics and quintics, lend themselves very naturally to creating seat-shaped curves. This example is parametrically blended with the Identity Function (y=x), as regulated by the parameter a; the shaping function passes through the corners of the unit square (0,0) and (1,1) and symmetrically through the midpoint (0.5, 0.5). It is also relatively efficient to compute.
*/
function doubleOddPolynomialSeat( a, b, n, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0;
    var max_param_b = 1;
    a = Math.min( max_param_a, Math.max( min_param_a, a ) );    
    b = Math.min( max_param_b, Math.max( min_param_b, b ) ); 
    var p = 2 * n + 1;

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y;
        if ( x <= a ){
            y = b - b * Math.pow( 1 - x / a, p );
        } else {
            y = b + ( 1 - b ) * Math.pow( ( x - a ) / ( 1 - a ), p );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    };
}

/*
    Symmetric Double-Polynomial Sigmoids

    It is possible to generate sigmoid patterns by joining a symmetric pair of polynomials at the center of the unit square. The exponents in these equations (controlled by the integer parameter n) control the steepness of the wall separating the squelched values from the boosted ones; a suggested range for the whole number n is from 1 to about 10. Of these, the sigmoid created with a 2nd-order (quadratic) exponent comes closest to the Raised Inverted Cosine, approximating it to within 2.8%.

    The Symmetric Double-Polynomial Sigmoids presented here create an S-shape with flat tangents at 0 and 1, and with the special property that f(0.5) = 0.5.
*/
function doublePolynomialSigmoid( n, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    if( _debug ){
        var epsilon = 10e-6;
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y;
        if ( n % 2 === 0 ){ 
            // even polynomial
            if ( x <= 0.5 ){
                y = Math.pow( 2 * x, n ) / 2;
            } else {
                y = 1 - Math.pow( 2 * ( x - 1 ), n ) / 2;
            }
        }
        else { 
            // odd polynomial
            if ( x <= 0.5 ){
                y = Math.pow( 2 * x, n ) / 2;
            } else {
                y = 1 + Math.pow( 2 * ( x - 1 ), n ) / 2;
            }
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    };
}

/*
    Quadratic Through a Given Point

    This function defines an axis-aligned quadratic (parabola) which passes through a user-supplied point (a,b) in the unit square. Caution: Not all points in the unit square will produce curves which pass through the locations (0,0) and (1,1).
*/
function quadraticThroughAGivenPoint( a, b, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0;
    var max_param_b = 1;
    a = Math.min( max_param_a, Math.max( min_param_a, a ) );    
    b = Math.min( max_param_b, Math.max( min_param_b, b ) );
    b = 1 - b;
    
    var A = ( 1 - b ) / ( 1 - a ) - ( b / a );
    var B = ( A * ( a * a ) - b ) / a;

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = A * ( x * x ) - B * ( x );
        y = Math.min( 1,Math.max( 0,y ) ); 

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/**********************************************
 * http://www.flong.com/texts/code/shapers_exp/
 *********************************************/
/*
    Exponential Ease-In and Ease-Out

    In this implementation of an exponential shaping function, the control parameter a permits the designer to vary the function from an ease-out form to an ease-in form.
*/
function exponentialEasing( a, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) );

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y, _a;
        if ( a < 0.5 ){
            // emphasis
            _a = 2 * a;
            y = Math.pow( x, _a );
        } else {
            // de-emphasis
            _a = 2 * ( a - 0.5 );
            y = Math.pow( x, 1 / ( 1 - _a ) );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    Double-Exponential Seat

    A seat-shaped function can be created with a coupling of two exponential functions. This has nicer derivatives than the cubic function, and more continuous control in some respects, at the expense of greater CPU cycles. The recommended range for the control parameter a is from 0 to 1. Note that these equations are very similar to the Double-Exponential Sigmoid described below.
*/
function doubleExponentialSeat( a, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime 10e-2
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    a = Math.min( max_param_a, Math.max( min_param_a, a ) ); 
    
    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = 0;
        if ( x <= 0.5 ){
          y = ( Math.pow( 2 * x, 1 - a ) ) / 2;
        } else {
          y = 1 - ( Math.pow( 2 * ( 1 - x ), 1 - a ) ) / 2;
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    Double-Exponential Sigmoid

    The same doubling-and-flipping scheme can be used to create sigmoids from pairs of exponential functions. These have the advantage that the control parameter a can be continously varied between 0 and 1, and are therefore very useful as adjustable-contrast functions. However, they are more expensive to compute than the polynomial sigmoid flavors. The Double-Exponential Sigmoid approximates the Raised Inverted Cosine to within 1% when the parameter a is approximately 0.426.
*/
function doubleExponentialSigmoid( a, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    a = Math.min( max_param_a, Math.max( min_param_a, a ) );
    a = 1 - a; // for sensible results
    
    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = 0;
        if ( x <= 0.5 ){
            y = ( Math.pow( 2 * x, 1 / a ) ) / 2;
        } else {
            y = 1 - ( Math.pow( 2 * ( 1 - x ), 1 / a ) ) / 2;
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    The Logistic Sigmoid

    The so-called "Logistic Curve" is an elegant sigmoidal function which is believed by many scientists to best represent the growth of organic populations and many other natural phenomena. In software engineering, it is often used for weighting signal-response functions in neural networks. In this implementation, the parameter a regulates the slope or "growth rate" of the sigmoid during its rising portion. When a=0, this version of the Logistic function collapses to the Identity Function (y=x). The Logistic Sigmoid has very natural rates of change, but is expensive to calculate due to the use of many exponential functions.
*/
function logisticSigmoid( a, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    // n.b.: this Logistic Sigmoid has been normalized.
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) );
    a = ( 1 / ( 1 - a ) - 1 );
    
    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var A = 1 / ( 1 + Math.exp( 0 - ( ( x - 0.5 ) * a * 2 ) ) );
        var B = 1 / ( 1 + Math.exp( a ) );
        var C = 1 / ( 1 + Math.exp( 0 - a ) ); 
        var y = ( A - B ) / ( C - B );

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/**********************************************
 * http://www.flong.com/texts/code/shapers_bez/
 *********************************************/
/*
    Quadratic Bezier

    This function defines a 2nd-order (quadratic) Bezier curve with a single user-specified spline control point (at the coordinate a,b) in the unit square. This function is guaranteed to have the same entering and exiting slopes as the Double-Linear Interpolator. Put another way, this curve allows the user to precisely specify its rate of change at its endpoints in the unit square.
*/
function quadraticBezier( a, b, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    // adapted from BEZMATH.PS ( 1993 )
    // by Don Lancaster, SYNERGETICS Inc. 
    // http://www.tinaja.com/text/bezmath.html

    var epsilon = 10e-6;
    a = Math.max( 0, Math.min( 1, a ) ); 
    b = Math.max( 0, Math.min( 1, b ) ); 
    if ( a === 0.5 ){
        a += epsilon;
    }
    b = 1 - b;

    // solve t from x ( an inverse operation )
    var om2a = 1 - 2 * a;

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: a * __debugSize,
                y2: ( 1 - b ) * __debugSize,
                stroke: __debugColor
            } );

        _g.append( 'line' )
            .attr( {
                x1: a * __debugSize,
                y1: ( 1 - b ) * __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var t = ( Math.sqrt( a * a + om2a * x ) - a ) / om2a;
        var y = ( 1 - 2 * b ) * ( t * t ) + ( 2 * b ) * t;

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    Cubic Bezier

    The Cubic Bezier is a workhorse of computer graphics; most designers will recognize it from Adobe Illustrator and other popular vector-based drawing programs. Here, this extremely flexible curve is used in as a signal-shaping function, which requires the user to specify two locations in the unit square (at the coordinates a,b and c,d) as its control points. By setting the two control points (a,b) and (c,d) to various locations, the Bezier curve can be used to produce sigmoids, seat-shaped functions, ease-ins and ease-outs.

    Bezier curves are customarily defined in such a way that y and x are both functions of another variable t. In order to obtain y as a function of x, it is necessary to first solve for t using successive approximation, making the code longer than one might first expect. The implementation here is adapted from the Bezmath Postscript library by Don Lancaster.
*/
function cubicBezier( a, b, c, d, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    // Helper functions:
    function slopeFromT( t, A, B, C ){
        var dtdx = 1 / ( 3 * A * t * t + 2 * B * t + C ); 
        return dtdx;
    }

    function xFromT( t, A, B, C, D ){
        var x = A * ( t * t * t ) + B * ( t * t ) + C * t + D;
        return x;
    }

    function yFromT( t, E, F, G, H ){
        var y = E * ( t * t * t ) + F * ( t * t ) + G * t + H;
        return y;
    }
    
    var y0a = 0; // initial y
    var x0a = 0; // initial x 
    var y1a = 1-b; // 1st influence y   
    var x1a = a; // 1st influence x 
    var y2a = 1-d; // 2nd influence y
    var x2a = c; // 2nd influence x
    var y3a = 1; // final y 
    var x3a = 1; // final x 

    var A = x3a - 3 * x2a + 3 * x1a - x0a;
    var B = 3 * x2a - 6 * x1a + 3 * x0a;
    var C = 3 * x1a - 3 * x0a;   
    var D = x0a;

    var E = y3a - 3 * y2a + 3 * y1a - y0a;      
    var F = 3 * y2a - 6 * y1a + 3 * y0a;                   
    var G = 3 * y1a - 3 * y0a;                   
    var H = y0a;

    if( _debug ){
        var epsilon = 10e-6;
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: b * __debugSize
            } );

        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: a * __debugSize,
                y2: b * __debugSize,
                stroke: __debugColor
            } );

        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: c * __debugSize,
                cy: d * __debugSize
            } );
            
        _g.append( 'line' )
            .attr( {
                x1: c * __debugSize,
                y1: d * __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
            
        _g.append( 'line' )
            .attr( {
                x1: a * __debugSize,
                y1: b * __debugSize,
                x2: c * __debugSize,
                y2: d * __debugSize,
                stroke: __debugColor
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        // Solve for t given x ( using Newton-Raphelson ), then solve for y given t.
        // Assume for the first guess that t = x.
        var currentt = x;
        nRefinementIterations = 5;
        for ( var i = 0; i < nRefinementIterations; i ++ ){
            var currentx = xFromT( currentt, A, B, C, D ); 
            var currentslope = slopeFromT( currentt, A, B, C );
            currentt -= ( currentx - x ) * currentslope;
            currentt = Math.min( 1, Math.max( 0, currentt ) );  
        }

        var y = yFromT ( currentt, E, F, G, H );

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    Cubic Bezier (Nearly) Through Two Given Points

    This shaping function asks the user to specify two points in the unit square. The algorithm then attempts to generate a curve which passes through these points as closely as possible. The curves are not guaranteed to pass through the two points, but come quite close in most instances. The method is adapted from Don Lancaster.
*/
function cubicBezierNearlyThroughTwoPoints( a, b, c, d, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    // Helper functions. 
    function B0 ( t ){
        return ( 1 - t ) * ( 1 - t ) * ( 1 - t );
    }
    function B1 ( t ){
        return 3 * t * ( 1 - t ) * ( 1 - t );
    }
    function B2 ( t ){
        return 3 * t * t * ( 1 - t );
    }
    function B3 ( t ){
        return t * t * t;
    }
    function findx ( t, x0, x1, x2, x3 ){
        return x0 * B0( t ) + x1 * B1( t ) + x2 * B2( t ) + x3 * B3( t );
    }
    function findy ( t, y0, y1, y2, y3 ){
        return y0 * B0( t ) + y1 * B1( t ) + y2 * B2( t ) + y3 * B3( t );
    }

    var y = 0;
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0 + epsilon;
    var max_param_b = 1 - epsilon;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) );
    b = Math.max( min_param_b, Math.min( max_param_b, b ) );

    var x0 = 0; 
    var y0 = 0;
    var x4 = a; 
    var y4 = 1 - b;
    var x5 = c; 
    var y5 = 1 - d;
    var x3 = 1; 
    var y3 = 1;
    var x1, y1, x2, y2; // to be solved.

    // arbitrary but reasonable 
    // t-values for interior control points
    var t1 = 0.3;
    var t2 = 0.7;

    var B0t1 = B0( t1 );
    var B1t1 = B1( t1 );
    var B2t1 = B2( t1 );
    var B3t1 = B3( t1 );
    var B0t2 = B0( t2 );
    var B1t2 = B1( t2 );
    var B2t2 = B2( t2 );
    var B3t2 = B3( t2 );

    var ccx = x4 - x0 * B0t1 - x3 * B3t1;
    var ccy = y4 - y0 * B0t1 - y3 * B3t1;
    var ffx = x5 - x0 * B0t2 - x3 * B3t2;
    var ffy = y5 - y0 * B0t2 - y3 * B3t2;

    x2 = ( ccx - ( ffx * B1t1 ) / B1t2 ) / ( B2t1 - ( B1t1 * B2t2 ) / B1t2 );
    y2 = ( ccy - ( ffy * B1t1 ) / B1t2 ) / ( B2t1 - ( B1t1 * B2t2 ) / B1t2 );
    x1 = ( ccx - x2 * B2t1 ) / B1t1;
    y1 = ( ccy - y2 * B2t1 ) / B1t1;

    x1 = Math.max( 0 + epsilon, Math.min( 1 - epsilon, x1 ) );
    x2 = Math.max( 0 + epsilon, Math.min( 1 - epsilon, x2 ) );

    var cubicBez = cubicBezier( x1, 1 - y1, x2, 1 - y2 );

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: b * __debugSize
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: c * __debugSize,
                cy: d * __debugSize
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        // Note that this function also requires cubicBezier()!
        y = cubicBez( x );
        y = Math.max( 0, Math.min( 1, y ) );

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/***********************************************
 * http://www.flong.com/texts/code/shapers_circ/
 **********************************************/
/*
    Circular Interpolation: Ease-In and Ease-Out

    A circular arc offers a quick and easy-to-code method for easing in or out of the unit square. The computational efficiency of the function is diminished by its use of a square root, however.
*/
function circularEaseIn( _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    if( _debug ){
        var epsilon = 10e-6;
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = 1 - Math.sqrt( 1 - x * x );

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

function circularEaseOut( _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    if( _debug ){
        var epsilon = 10e-6;
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = Math.sqrt( 1 - ( 1 - x ) * ( 1 - x ) );

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    Double-Circle Seat

    This shaping function is formed by the meeting of two circular arcs, which join with a horizontal tangent. The parameter a, in the range [0...1], governs the location of the curve's inflection point along the diagonal of the unit square.
*/
function doubleCircleSeat( a, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var min_param_a = 0;
    var max_param_a = 1;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) ); 

    if( _debug ){
        var epsilon = 10e-6;
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - a ) * __debugSize
            } );

        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = 0;
        if ( x <= a ){
            y = Math.sqrt( a * a - ( x - a ) * ( x - a ) );
        } else {
            y = 1 - Math.sqrt( ( 1 - a ) * ( 1 - a ) - ( x - a ) * ( x - a ) );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    Double-Circle Sigmoid

    This sigmoidal shaping function is formed by the meeting of two circular arcs, which join with a vertical tangent. The parameter a, in the range [0...1], governs the location of the curve's inflection point along the diagonal of the unit square.
*/
function doubleCircleSigmoid( a, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var min_param_a = 0;
    var max_param_a = 1;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) ); 

    if( _debug ){
        var epsilon = 10e-6;
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - a ) * __debugSize
            } );

        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = 0;
        if ( x <= a ){
            y = a - Math.sqrt( a * a - x * x );
        } else {
            y = a + Math.sqrt( ( 1 - a ) * ( 1 - a ) - ( x - 1 ) * ( x - 1 ) );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}

/*
    Double-Elliptic Seat

    This seat-shaped function is created by the joining of two elliptical arcs, and is a generalization of the Double-Circle Seat. The two arcs meet at the coordinate (a,b) with a horizontal tangent.
*/
function doubleEllipticSeat( a, b, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0;
    var max_param_b = 1;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) ); 
    b = Math.max( min_param_b, Math.min( max_param_b, b ) ); 

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );

        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        var y = 0;
        if ( x <= a ){
            y = ( b / a ) * Math.sqrt( a * a - ( x - a ) * ( x - a ) );
        } else {
            y = 1 - ( ( 1 - b ) / ( 1 - a ) )*Math.sqrt( ( 1 - a ) * ( 1 - a ) - ( x - a ) * ( x - a ) );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    };
}

/*
    Double-Elliptic Sigmoid

    This sigmoid-shaped function is created by the joining of two elliptical arcs, and is a generalization of the Double-Circle Sigmoid. The arcs meet at the coordinate (a, b) in the unit square with a vertical tangent.
*/
function doubleEllipticSigmoid( a, b, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0;
    var max_param_b = 1;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) ); 
    b = Math.max( min_param_b, Math.min( max_param_b, b ) );

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );

        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }
 
    return function( x ){
        var y = 0;
        if ( x <= a ){
            y = b * ( 1 - ( Math.sqrt( a * a - x * x ) / a ) );
        } else {
            y = b + ( ( 1 - b ) / ( 1 - a ) ) * Math.sqrt( ( 1 - a ) * ( 1 - a ) - ( x - 1 ) * ( x - 1 ) );
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    };
}

/*
    Double-Linear with Circular Fillet

    This pattern joins two straight lines with a circular arc whose radius is adjustable. The user specifies the fillet's radius (with parameter c) and the coordinate in the unit square where the lines would otherwise intersect (with parameters a and b). This pattern is adapted from Robert D. Miller's "Joining Two Lines with a Circular Arc Fillet", which appears in Graphics Gems III.
*/
function circularFillet( a, b, R, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var arcStartAngle;
    var arcEndAngle;
    var arcStartX, arcStartY;
    var arcEndX, arcEndY;
    var arcCenterX, arcCenterY;
    var arcRadius;
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0 + epsilon;
    var max_param_b = 1 - epsilon;
    a = Math.max( min_param_a, Math.min( max_param_a, a ) ); 
    b = Math.max( min_param_b, Math.min( max_param_b, b ) ); 

    // Return signed distance from line Ax + By + C = 0 to point P.
    function linetopoint( a, b, c, ptx, pty ){
        var lp = 0;
        var d = Math.sqrt( ( a * a ) + ( b * b ) );
        if ( d !== 0 ){
            lp = ( a * ptx + b * pty + c ) / d;
        }
        return lp;
    }

    // Compute the parameters of a circular arc fillet between lines L1 (p1 to p2) and L2 (p3 to p4) with radius R.  
    function computeFilletParameters ( p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y, r ){
        var c1 = p2x * p1y - p1x * p2y;
        var a1 = p2y - p1y;
        var b1 = p1x - p2x;
        var c2 = p4x * p3y - p3x * p4y;
        var a2 = p4y - p3y;
        var b2 = p3x - p4x;
        if ( ( a1 * b2 ) === ( a2 * b1 ) ){  /* Parallel or coincident lines */
            return;
        }

        var d1, d2;
        var mPx, mPy;
        mPx = ( p3x + p4x ) / 2;
        mPy = ( p3y + p4y ) / 2;
        d1 = linetopoint( a1, b1, c1, mPx, mPy );  /* Find distance p1p2 to p3 */
        if ( d1 === 0 ) {
            return; 
        }
        mPx = ( p1x + p2x ) / 2;
        mPy = ( p1y + p2y ) / 2;
        d2 = linetopoint( a2, b2, c2, mPx, mPy );  /* Find distance p3p4 to p2 */
        if ( d2 === 0 ) {
            return; 
        }

        var c1p, c2p, d;
        var rr = r;
        if ( d1 <= 0 ) {
            rr = -rr;
        }
        c1p = c1 - rr * Math.sqrt( ( a1 * a1 ) + ( b1 * b1 ) );  /* Line parallel l1 at d */
        rr = r;
        if ( d2 <= 0 ){
            rr = -rr;
        }
        c2p = c2 - rr * Math.sqrt( ( a2 * a2 ) + ( b2 * b2 ) );  /* Line parallel l2 at d */
        d = ( a1 * b2 ) - ( a2 * b1 );

        var pCx = ( c2p * b1 - c1p * b2 ) / d; /* Intersect constructed lines */
        var pCy = ( c1p * a2 - c2p * a1 ) / d; /* to find center of arc */
        var pAx = 0;
        var pAy = 0;
        var pBx = 0;
        var pBy = 0;
        var dP,cP;

        dP = ( a1 * a1 ) + ( b1 * b1 ); /* Clip or extend lines as required */
        if ( dP !== 0 ){
            cP = a1 * pCy - b1 * pCx;
            pAx = ( -a1 * c1 - b1 * cP ) / dP;
            pAy = ( a1 * cP - b1 * c1 ) / dP;
        }
        dP = (a2 * a2) + ( b2 * b2 );
        if ( dP !== 0 ){
            cP = a2 * pCy - b2 * pCx;
            pBx = ( -a2 * c2 - b2 * cP ) / dP;
            pBy = ( a2 * cP - b2 * c2 ) / dP;
        }

        var gv1x = pAx - pCx; 
        var gv1y = pAy - pCy;
        var gv2x = pBx - pCx; 
        var gv2y = pBy - pCy;

        var arcStart = Math.atan2( gv1y, gv1x ); 
        var arcAngle = 0;
        var dd = Math.sqrt( ( ( gv1x * gv1x ) + ( gv1y * gv1y ) ) * ( ( gv2x * gv2x ) + ( gv2y * gv2y ) ) );
        if (dd !== 0){
        arcAngle = Math.acos( ( gv1x * gv2x + gv1y * gv2y ) / dd );
        } 
        var crossProduct = gv1x * gv2y - gv2x * gv1y;
        if ( crossProduct < 0 ){ 
            arcStart -= arcAngle;
        }

        var arc1 = arcStart;
        var arc2 = arcStart + arcAngle;
        if ( crossProduct < 0 ){
            arc1 = arcStart + arcAngle;
            arc2 = arcStart;
        }

        arcCenterX = pCx;
        arcCenterY = pCy;
        arcStartAngle = arc1;
        arcEndAngle = arc2;
        arcRadius = r;
        arcStartX = arcCenterX + arcRadius * Math.cos( arcStartAngle );
        arcStartY = arcCenterY + arcRadius * Math.sin( arcStartAngle );
        arcEndX = arcCenterX + arcRadius * Math.cos( arcEndAngle );
        arcEndY = arcCenterY + arcRadius * Math.sin( arcEndAngle );
    }
  
    computeFilletParameters( 0, 0, a, b, a, b, 1, 1, R );

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );

        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: a * __debugSize,
                y2: ( 1 - b ) * __debugSize,
                stroke: __debugColor
            } );

        _g.append( 'line' )
            .attr( {
                x1: __debugSize,
                y1: 0,
                x2: a * __debugSize,
                y2: ( 1 - b ) * __debugSize,
                stroke: __debugColor
            } );

        _g.append( 'circle' )
            .attr( {
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize,
                r: 2,
                fill: __debugColor
            } );

        _g.append( 'circle' )
            .attr( { 
                r: R * __debugSize,
                fill: 'none',
                stroke: __debugColor,
                cx: arcCenterX * __debugSize,
                cy: ( 1 - arcCenterY ) * __debugSize
            } );

        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );

        var _d = 'M 0 0';
        var _p = _g.append( 'path' )
            .attr( {
                fill: 'none',
                stroke: __debugColor
            } );
    }

    return function( x ){
        var t = 0;
        var y = 0;
        x = Math.max( 0, Math.min( 1, x ) );
        
        if ( x <= arcStartX){
            t = x / arcStartX;
            y = t * arcStartY;
        }
        else if ( x >= arcEndX ){
            t = ( x - arcEndX ) / ( 1 - arcEndX );
            y = arcEndY + t * ( 1 - arcEndY );
        }
        else {
            if ( x >= arcCenterX ){
                y = arcCenterY - Math.sqrt( arcRadius * arcRadius - ( x - arcCenterX ) * ( x - arcCenterX ) ); 
            } else{
                y = arcCenterY + Math.sqrt( arcRadius * arcRadius - ( x - arcCenterX ) * ( x - arcCenterX ) ); 
            }
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }

        return y;
    }
}

/*
    Circular Arc Through a Given Point

    This function defines a circular arc which passes through a user-specified point in the unit square. Unfortunately, not every location in the unit square lends itself to defining a circle which also is confined to the unit square; the user-supplied point must inhabit a zone close to the main (Identity) diagonal. This pattern is adapted from Paul Bourke's Equation of a Circle From 3 Points.
*/
function circularArcThroughAPoint( a, b, _debug, _debugX, _debugY, _debugSize, _debugColor, _debugTime ){
    var m_Centerx;
    var m_Centery;
    var m_dRadius;
    var epsilon = 10e-6;
    var min_param_a = 0 + epsilon;
    var max_param_a = 1 - epsilon;
    var min_param_b = 0 + epsilon;
    var max_param_b = 1 - epsilon;

    a = Math.min( max_param_a, Math.max( min_param_a, a ) );
    b = Math.min( max_param_b, Math.max( min_param_b, b ) );
    b = 1 - b;

    var pt1x = 0;
    var pt1y = 0;
    var pt2x = a;
    var pt2y = b;
    var pt3x = 1;
    var pt3y = 1;

    function IsPerpendicular( pt1x, pt1y, pt2x, pt2y, pt3x, pt3y ){
        // Check the given point are perpendicular to x or y axis 
        var yDelta_a = pt2y - pt1y;
        var xDelta_a = pt2x - pt1x;
        var yDelta_b = pt3y - pt2y;
        var xDelta_b = pt3x - pt2x;
        var epsilon = 10e-6;

        // checking whether the line of the two pts are vertical
        if ( Math.abs( xDelta_a ) <= epsilon && Math.abs( yDelta_b ) <= epsilon ) return false;
        if(Math.abs( yDelta_a ) <= epsilon ) return true;
        else if( Math.abs( yDelta_b ) <= epsilon ) return true;
        else if( Math.abs( xDelta_a ) <= epsilon ) return true;
        else if( Math.abs( xDelta_b ) <= epsilon ) return true;
        else return false;
    }

    function calcCircleFrom3Points ( pt1x, pt1y, pt2x, pt2y, pt3x, pt3y ){
        var yDelta_a = pt2y - pt1y;
        var xDelta_a = pt2x - pt1x;
        var yDelta_b = pt3y - pt2y;
        var xDelta_b = pt3x - pt2x;
        var epsilon = 10e-6;

        if ( Math.abs( xDelta_a ) <= epsilon && Math.abs( yDelta_b ) <= epsilon ){
            m_Centerx = 0.5 * ( pt2x + pt3x );
            m_Centery = 0.5 * ( pt1y + pt2y );
            m_dRadius = Math.sqrt( ( m_Centerx - pt1x ) * ( m_Centerx - pt1x ) + ( m_Centery - pt1y ) * ( m_Centery - pt1y ) );
            return;
        }

        // IsPerpendicular() assure that xDelta(s) are not zero
        var aSlope = yDelta_a / xDelta_a; 
        var bSlope = yDelta_b / xDelta_b;
        if ( Math.abs( aSlope - bSlope ) <= epsilon ){   
            // checking whether the given points are colinear.  
            return;
        }

        // calc center
        m_Centerx = ( aSlope * bSlope * ( pt1y - pt3y ) + bSlope * ( pt1x + pt2x ) - aSlope * ( pt2x + pt3x ) ) / ( 2 * ( bSlope - aSlope ) );
        m_Centery = -1 * ( m_Centerx - ( pt1x + pt2x ) / 2 ) / aSlope + ( pt1y + pt2y ) / 2;
        m_dRadius = Math.sqrt( ( m_Centerx - pt1x ) * ( m_Centerx - pt1x ) + ( m_Centery - pt1y ) * ( m_Centery - pt1y ) );
    }

    if ( ! IsPerpendicular( pt1x, pt1y, pt2x, pt2y, pt3x,pt3y ) ) calcCircleFrom3Points( pt1x, pt1y, pt2x, pt2y, pt3x, pt3y );
    else if ( ! IsPerpendicular( pt1x, pt1y, pt3x, pt3y, pt2x,pt2y ) ) calcCircleFrom3Points( pt1x, pt1y, pt3x, pt3y, pt2x, pt2y );
    else if ( ! IsPerpendicular( pt2x, pt2y, pt1x, pt1y, pt3x,pt3y ) ) calcCircleFrom3Points( pt2x, pt2y, pt1x, pt1y, pt3x, pt3y );
    else if ( ! IsPerpendicular( pt2x, pt2y, pt3x, pt3y, pt1x,pt1y ) ) calcCircleFrom3Points( pt2x, pt2y, pt3x, pt3y, pt1x, pt1y );
    else if ( ! IsPerpendicular( pt3x, pt3y, pt2x, pt2y, pt1x,pt1y ) ) calcCircleFrom3Points( pt3x, pt3y, pt2x, pt2y, pt1x, pt1y );
    else if ( ! IsPerpendicular( pt3x, pt3y, pt1x, pt1y, pt2x,pt2y ) ) calcCircleFrom3Points( pt3x, pt3y, pt1x, pt1y, pt2x, pt2y );
    else return 0;

    // constrain
    if ( ( m_Centerx > 0 ) && ( m_Centerx < 1 ) ){
        if ( a < m_Centerx ){
            m_Centerx = 1;
            m_Centery = 0;
            m_dRadius = 1;
        }
        else {
            m_Centerx = 0;
            m_Centery = 1;
            m_dRadius = 1;
        }
    }

    if( _debug ){
        var __debugX = _debugX || 5;
        var __debugY = _debugY || 5;
        var __debugSize = _debugSize || 100;
        var __debugColor = _debugColor || 'white';

        var _g = _debug.append( 'g' )
            .attr( 'transform', 'translate(' + __debugX +','+ __debugY +')');

        // background
        _g.append( 'rect' )
            .attr( {
                x: 0,
                y: 0,
                width: __debugSize,
                height: __debugSize,
                fill: __debugColor,
                opacity: 0.2
            } );

        // diagonal
        _g.append( 'line' )
            .attr( {
                x1: 0,
                y1: __debugSize,
                x2: __debugSize,
                y2: 0,
                stroke: __debugColor
            } );
        
        _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: a * __debugSize,
                cy: ( 1 - b ) * __debugSize
            } );
    
        // point
        var _c = _g.append( 'circle' )
            .attr( {
                r: 4,
                fill: __debugColor,
                cx: 0,
                cy: __debugSize
            } );
    
        // path
        var _d = 'M 0 ' + __debugSize;
        var _p = _g.append( 'path' )
            .attr( {
                stroke: __debugColor,
                fill: 'none',
                d: _d
            } );
    }

    return function( x ){
        x = Math.min( 1 - epsilon, Math.max( 0 + epsilon, x ) );
        var y = 0;
        if ( x >= m_Centerx ){
            y = m_Centery - Math.sqrt( m_dRadius * m_dRadius - ( x - m_Centerx ) * ( x - m_Centerx ) ); 
        } else {
            y = m_Centery + Math.sqrt( m_dRadius * m_dRadius - ( x - m_Centerx ) * ( x - m_Centerx ) ); 
        }

        if( _debug) {
            var _cx = x * __debugSize;
            var _cy = ( 1 - y ) * __debugSize;

            _c.attr( {
                cx: _cx,
                cy: _cy
            } );

            _d += ' L ' + _cx + ' ' + _cy;
            _p.attr( 'd', _d );

            if( y >= 1 - 10e-2 ) _g.transition().duration( _debugTime || 500 ).remove();
        }
        
        return y;
    };
}