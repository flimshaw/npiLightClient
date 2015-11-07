var SPI = require('pi-spi')
  , tinycolor = require('tinycolor2');

var spi = SPI.initialize("/dev/spidev0.0");

var HEADER = [0,0,0,0]
  , FOOTER = [0xff,0xff,0xff,0xff]
  , LED_COUNT = 8
  , COLOR_BUFFER = new Array(LED_COUNT);




function getEmptyBuffer() {

  var buffer = new Array(LED_COUNT);

  // initialize the buffer with black
  for( var i = 0; i < LED_COUNT; i++ ) {
    buffer[i] = tinycolor("#000");
    // COLOR_BUFFER[i].spin( ( i - 4 ) * 5);
  }

  return buffer;

}

COLOR_BUFFER = getEmptyBuffer();

function error(d, e) {
  // if(e) console.error(e);
}

function updateStrand( buffer ) {

  // start a new array beginning with the packet header
  var newArray = [0,0,0,0];

  // loop through each LED and append its information to the packet
  for( var i = 0; i < buffer.length; i++ ) {
    var c = buffer[i].toRgb();
    newArray.push( 0xfe, c.g, c.b, c.r );
  }

  newArray = newArray.concat( FOOTER );

  var newBuff = new Buffer( newArray );

  spi.transfer( newBuff, newBuff.length, error );

}

function getRandomColor() {
  return( [ 0xfe, parseInt( Math.random() * 0xff ), parseInt( Math.random() * 0xff ), parseInt( Math.random() * 0xff ) ] );
}

function getColor( r, g, b ) {
  return( [ 0xfe, parseInt(g), parseInt(b), parseInt(r) ])
}

function randomColor() {

  colors = [];

  while( colors.length < LED_COUNT * 4 ) {
    colors = colors.concat( getColor(0, 0, 255) );
  }

  var newBuff = new Buffer( HEADER.concat( colors.concat( FOOTER ) ) );

  // spi.transfer( newBuff, newBuff.length, error );

}

function cloneBuffer() {

  var newBuffer = new Array(LED_COUNT);

  for( var i = 0; i < LED_COUNT; i++ ) {
    newBuffer[i] = tinycolor(COLOR_BUFFER[i].toString());
  }

  return newBuffer;
}

var TICK = 0;


var newBuff = getEmptyBuffer();


function update() {

  TICK++;

  var c = "#000";

  if( TICK % 25 == 0 && Math.random() > .5 ) {
    c = tinycolor.random();
  }

  if( TICK % 1 == 0 ) {
    COLOR_BUFFER.pop();
    COLOR_BUFFER.unshift( tinycolor( c ) );
  }

  for( var i = 0; i < LED_COUNT; i++ ) {

    if( COLOR_BUFFER[i].getBrightness() > 0  ) {
      newBuff[i] = COLOR_BUFFER[i];
    } else {
      newBuff[i] = tinycolor.mix( newBuff[i], tinycolor("000"), 28);
      if( newBuff[i].getBrightness() < 16 ) newBuff[i] = tinycolor("000");
    }
  }

  updateStrand( newBuff );
}

setInterval( update, 16 );
