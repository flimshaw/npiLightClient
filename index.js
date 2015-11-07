// button is attaced to pin 17, led to 18
var GPIO = require('onoff').Gpio,
    button = new GPIO(17, 'in', 'both'),
    myLedStripe = require('ledstripe'),
    sleep = require('sleep'),
    Twitter = require('twitter');

var numLEDs = 4,
    ledStripeType = 'LPD8806',
    spiChannel = 0,
    ledBuffer = new Buffer( numLEDs * 3),
    colorBuffer = [],
    buttonStatus = 0,
    updateInterval = 50,
    currentColor = [0,0,0],
    tweetColor = [0,0xff,0x99];

// default to off for all leds
for( var i = 0; i < numLEDs; i++ ) {
  colorBuffer.push( [0,0,0] );
}

myLedStripe.connect( numLEDs, ledStripeType, spiChannel );

// blink three times at startup
for( var i = 0; i < 3; i++ ) {
  myLedStripe.fill(0x00, 0xff, 0x00);
  sleep.usleep( 250000 );
  myLedStripe.fill(0x00, 0x00, 0x00);
  sleep.usleep( 250000 );
}

var client = new Twitter({
  consumer_key: 'VC9jz2n0IsAiV7VLEy2vQ',
  consumer_secret: 'ANhMXs75Ui43v1w8K48LnBJYkL5FL7nHHqxbnCzs',
  access_token_key: '11426712-uL9idsz8japVGMuDbfaR7HRXl64Ek45BbLsyVRmJh',
  access_token_secret: '1OqfgkoPP89qdD27M9Vxs3xH9pxUVV0fEDaVIekOLg1eS'
});

function unshiftColor( color ) {
  colorBuffer.unshift( color );
}

client.stream('statuses/filter', {track: 'FML'}, function(stream) {                                                                                         
  stream.on('data', function(tweet) {
    unshiftColor( tweetColor );
    console.log(tweet.text);
  });

  stream.on('error', function(error) {
    throw error;
  });
});

myLedStripe.fill(0x00, 0x00, 0x00);

// helper to get a random color
function getRandomColor() {
  return( [ parseInt( Math.random() * 255 ), parseInt( Math.random() * 255 ), parseInt( Math.random() * 255 ) ] );
}

// set an interval to update our buffer
function updateColors() {

  colorBuffer.pop();

  if( colorBuffer.length <= 4 ) {

    if( buttonStatus === 1 ) {
      unshiftColor( currentColor );
    } else {
      unshiftColor( [0,0,0] );
    }

  }

  for( var i = 0; i < numLEDs; i++ ) {
   ledBuffer[(3*i)] = colorBuffer[i][0];
   ledBuffer[(3*i)+1] = colorBuffer[i][1];
   ledBuffer[(3*i)+2] = colorBuffer[i][2];  
  }

  myLedStripe.sendRgbBuf( ledBuffer );
}

setInterval( updateColors, updateInterval );

// set listener for button presses
button.watch( function( err, value ) {

  buttonStatus = value;
  currentColor = getRandomColor();

});
