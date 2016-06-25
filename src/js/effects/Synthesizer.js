/**
 * Converts a Google Sheets document into Stepwise XML and
 * returns the results as a DOM element.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	Synthesizer: new Synthesizer()

    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function Synthesizer() {
    	this.noteNames = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
		this.environment = flock.init();
		this.environment.start();
		var fundamental = 440;
		this.synth = flock.synth.polyphonic({
		    synthDef: {
		        id: "carrier",
		        ugen: "flock.ugen.square",
		        freq: fundamental,
		        mul: {
		            id: "env",
		            ugen: "flock.ugen.asr",
		            attack: 0.02,
		            sustain: 1.0,
		            release: 0.1
		        }
		    }
		});
    }

    Synthesizer.prototype.bind = function(stepwiseInstance) {
    	var me = this;
    	this.instance = stepwiseInstance;
    	$(this.instance.element).bind("executeStep", function(event, step) {
	    	if ((me.stepTargetIsInstrument(step) || (step.command == "sing")) && (step.content != "")) { 
				
				var volume;
				switch ( step.tone ) {

					case "whisper":
					volume = 0.125;
					break;

					case "shout":
					volume = 0.925;
					break;

					default:
					volume = 0.5;
					break;

				}
				volume = Math.max( 0, Math.min( 1, volume + ( Math.random() * .1 - 0.05 )));
				volume *= .3;
				var noteNum = me.noteNameToMidiNoteNum( step.content )
				var freq = me.midiNoteNumToFrequency( noteNum );
				me.synth.noteOn( step.content, {"carrier.freq":freq});
				switch ( step.target.id.toLowerCase() ) {

					case "pad":
					setTimeout(function() { me.synth.noteOff( step.content ); }, 1000);
					break;

					case "bass":
					setTimeout(function() { me.synth.noteOff( step.content ); }, 100);
					break;

					default: 	
					break;

				}
			}
	    });
    }

    Synthesizer.prototype.stepTargetIsInstrument = function(step) {
    	if (step.target.id != null) {
    		var str = step.target.id.toLowerCase();
    		return ((str == "pad") || (str == "bass"));
    	}
    	return false;
    }

	Synthesizer.prototype.noteNameToMidiNoteNum = function( noteName ) {
		var octavePortionLength;
		if ( noteName.length == 4 ) {
			octavePortionLength = 2;
		} else {
			octavePortionLength = 1;
		}
		var name = noteName.substring( 0, noteName.length - octavePortionLength );
		var octave = parseInt( noteName.substring( noteName.length - octavePortionLength ) );
		octave += 1;
		return ( octave * 12 ) + this.noteNames[ name ];
	}   

	Synthesizer.prototype.midiNoteNumToFrequency = function( midiNoteNum ) {
		return Math.pow( 2, ( midiNoteNum - 69 ) / 12.0 ) * 440.0;
	}    

})(jQuery);
