/**
 * Creates a Tone.js synthesizer that can play notes.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	ToneSynth: new ToneSynth()

    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function ToneSynth() {

    	var reverb = new Tone.Freeverb(.3, 10000).toMaster();

    	this.synth = new Tone.PolySynth(4, Tone.MonoSynth).connect(Tone.Master);
    	this.synth.set({
			filter: {
				type: "lowpass",
				rolloff: -24
			},				
			filterEnvelope:{
				attack:0.06,
				decay:.1,
				sustain:1,
				release:.5,
				baseFrequency:100,
				octaves:3,
				exponent:2,
			}
		});
		this.synth.volume.value = -20;

    	this.drums = new Tone.Sampler({
    		BD: "../../../src/js/effects/samples/TR808WAV/BD/BD0010.wav",
    		SD: "../../../src/js/effects/samples/TR808WAV/SD/SD0010.wav",
    		CH: "../../../src/js/effects/samples/TR808WAV/CH/CH.wav"
    	}).connect(Tone.Master);
    	this.drums.volume.value = -6;
    	//this.drums = new Tone.PolySynth(4, Tone.Sampler).toMaster();

    	this.noteNames = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
   }

    ToneSynth.prototype.bindToInstance = function(stepwiseInstance) {
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
					me.drums.triggerAttackRelease("BD", "8n");
					break;

					case "snare":
					me.drums.triggerAttackRelease("SD", "8n");
					break;

					case "hihat":
					me.drums.triggerAttackRelease("CH", "8n");
					break;

					case "bass":
					case "pad":
					me.synth.triggerAttackRelease(step.content, "8n");
					break;
				}
				//me.drums.kick.amp = .5;
			}
	    });
    }

    ToneSynth.prototype.bindToElement = function(element) {
    	this.element = element;
    }

    ToneSynth.prototype.bindToCharacter = function(character) {
    	this.character = character;
    }

    ToneSynth.prototype.stepTargetIsInstrument = function(step) {
    	if (step.target.id != null) {
    		var str = step.target.id.toLowerCase();
    		return ((str == "pad") || (str == "bass") || (str == "kick") || (str == "snare") || (str == "hihat"));
    	}
    	return false;
    }   

	ToneSynth.prototype.noteNameToMidiNoteNum = function( noteName ) {
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

	ToneSynth.prototype.midiNoteNumToFrequency = function( midiNoteNum ) {
		return Math.pow( 2, ( midiNoteNum - 69 ) / 12.0 ) * 440.0;
	}   

})(jQuery);