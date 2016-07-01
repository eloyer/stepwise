/**
 * Creates a flocking.js synthesizer that can play notes.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	GibberSynth: new GibberSynth()

    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function GibberSynth() {
    	Gibber.init();
    	this.drums = EDrums();
    	this.bus = Bus().fx.add(Reverb({roomSize: Add(.25, .65)}));
    	this.drums.send(this.bus, 1);
    	this.drums.kick.decay = 1;
    	this.synth = Synth({ maxVoices:4, waveform:'PWM', attack:ms(1), decay:ms(250) });
    	this.synth.send(this.bus, 1);
    	//this.drums.snare.decay = 1;
    	//this.drums.snare.snappy = 1.5 

		//r = Reverb({roomSize: Add(.25, .5)})

		//this.drums.kick.fx.add( r )

    	this.noteNames = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
   }

    GibberSynth.prototype.bindToInstance = function(stepwiseInstance) {
    	var me = this;
    	this.instance = stepwiseInstance;
    	$(this.instance.element).bind("executeStep", function(event, step) {
	    	if ((me.stepTargetIsInstrument(step) || (step.command == "sing")) && (step.content != "")) { 
				
				/*var volume;
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
				me.drums.kick.amp = volume;*/

				var noteNum = me.noteNameToMidiNoteNum( step.content )
				var freq = me.midiNoteNumToFrequency( noteNum );

				switch (step.target.id) {

					case "kick":
					me.drums.kick.note();
					break;

					case "snare":
					me.drums.snare.note();
					break;

					case "hihat":
					me.drums.hat.amp = .25 + (Math.random() * .5);
					me.drums.hat.note();
					break;

					case "bass":
					me.synth.note(freq);
					break;
				}
				//me.drums.kick.amp = .5;
			}
	    });
    }

    GibberSynth.prototype.bindToElement = function(element) {
    	this.element = element;
    }

    GibberSynth.prototype.bindToCharacter = function(character) {
    	this.character = character;
    }

    GibberSynth.prototype.stepTargetIsInstrument = function(step) {
    	if (step.target.id != null) {
    		var str = step.target.id.toLowerCase();
    		return ((str == "pad") || (str == "bass") || (str == "kick") || (str == "snare") || (str == "hihat"));
    	}
    	return false;
    }   

	GibberSynth.prototype.noteNameToMidiNoteNum = function( noteName ) {
		var octavePortionLength;
		if ( noteName.length == 4 ) {
			octavePortionLength = 2;
		} else {
			octavePortionLength = 1;
		}
		var name = noteName.substring( 0, noteName.length - octavePortionLength );
		var octave = parseInt( noteName.substring( noteName.length - octavePortionLength ) );
		octave += 2;
		return ( octave * 12 ) + this.noteNames[ name ];
	}   

	GibberSynth.prototype.midiNoteNumToFrequency = function( midiNoteNum ) {
		return Math.pow( 2, ( midiNoteNum - 69 ) / 12.0 ) * 440.0;
	}   

})(jQuery);