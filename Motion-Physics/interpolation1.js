console.clear();
var log = console.log;

var w = window.innerWidth, h = window.innerHeight;

var color = d3.rgb('#FB3550');

var svg = d3.select( 'body' )
    .append( 'svg' )
    .attr( {
        width: w,
        height: h
    } );

svg.append( 'line' )
    .attr({
        x1: 0,
        y1: h,
        x2: w,
        y2: 0,
        stroke: color
    } );

var circle = svg.append( 'circle' )
    .attr( {
        cy: h,
        cx: 0,
        r: 10,
        fill: color
    } );
//////////////////////////////////////////////////



//////////////////////////////////////////////////

function anim(){
    circle
      .attr( 'cx', 0 )
      .transition()
      .duration( 2000 )
      .ease( 'linear' )
      .attr( 'cx', w )
      .attrTween('cy', interpolator( h, 0, doubleCubicSeat( 0.5, 0.500001 ) ) );
}
anim();

svg.node().addEventListener( 'click', anim );

/////////////////////////////////////////