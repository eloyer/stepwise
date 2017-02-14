/**
 * Creates a Tone.js-based piano instrument.
 * Piano samples by University of Iowa Electronic Music Studios: http://theremin.music.uiowa.edu/MIS.html
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {
	 	TonePiano: TonePiano
    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function TonePiano(instance, options) {
        $.fn.stepwise.effects.AbstractEffect.call(this, instance, options);
        $.extend(this.options, options);
    	var reverb = new Tone.Freeverb(.7, 10000).toMaster();
        this.samplePaths = {};
    	this.pitchClassNumbers = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
    	this.samplePitchClasses = [ "A", "C", "Eb", "Gb" ];
        this.buildSamplePathsForPitchClass("A", this.options.pathToSamples, 7);
        this.buildSamplePathsForPitchClass("C", this.options.pathToSamples, 8);
        this.buildSamplePathsForPitchClass("Eb", this.options.pathToSamples, 7);
        this.buildSamplePathsForPitchClass("Gb", this.options.pathToSamples, 6);
        this.piano = new Tone.PolySynth(48, Tone.Sampler, this.samplePaths).toMaster();
        this.piano.volume.value = 15;
   }

    TonePiano.prototype = Object.create($.fn.stepwise.effects.AbstractEffect.prototype, {

        buildSamplePathsForPitchClass: {
            value: function(pitchClass, path, octaveCount) {
                var i;
                pathData = {}
                for (i=0; i<octaveCount; i++) {
                    pathData[i] = path + "UIowaPiano/" + pitchClass + i + ".wav";
                }
                this.samplePaths[pitchClass] = pathData;
            },
            enumerable: true,
            configurable: true,
            writable: true
        },

        stepTargetIsInstrument: {
            value: function(step) {
            	if (step.target.id != null) {
            		var str = step.target.id.toLowerCase();
            		return (str == "piano");
            	}
            	return false;
            },
            enumerable: true,
            configurable: true,
            writable: true
        },

        noteNameToPitchedSampleName: {
            value: function(noteName) {
        		var octavePortionLength, adjustedSamplePitchClass,
        			data = {};
        		if ( noteName.length == 4 ) {
        			octavePortionLength = 2;
        		} else {
        			octavePortionLength = 1;
        		}
        		var pitchClass = noteName.substring( 0, noteName.length - octavePortionLength );
        		var octave = parseInt( noteName.substring( noteName.length - octavePortionLength ) );
        		//octave++;
        		adjustedSamplePitchClass = this.pitchClassToAdjustedSamplePitchClass(pitchClass);
        		if (Math.abs(this.pitchClassNumbers[pitchClass] - this.pitchClassNumbers[adjustedSamplePitchClass.pitchClass]) >  Math.abs(adjustedSamplePitchClass.distance)) {
        			if (adjustedSamplePitchClass.distance < 0) {
        				octave++;
        			} else {
        				octave--;
        			}
        		}
        		data.sample = adjustedSamplePitchClass.pitchClass + "." + octave;
        		data.pitch = adjustedSamplePitchClass.distance;
        		return data;
            },
            enumerable: true,
            configurable: true,
            writable: true
        }, 

        pitchClassToAdjustedSamplePitchClass: {
            value:  function(pitchClass) {
            	var i, pitchDistance, invertedPitchDistance,
            		data = { pitchClass: null, distance: 999 },
            		n = this.samplePitchClasses.length;
            	for (i=0; i<n; i++) {
            		pitchDistance = this.pitchClassNumbers[pitchClass] - this.pitchClassNumbers[this.samplePitchClasses[i]];
            		if (pitchDistance > 0) {
            			invertedPitchDistance = pitchDistance - 12;
            		} else if (pitchDistance < 0) {
            			invertedPitchDistance = pitchDistance + 12;
            		} else {
            			invertedPitchDistance = 0;
            		}
            		if (Math.abs(invertedPitchDistance) < Math.abs(pitchDistance)) {
            			pitchDistance = invertedPitchDistance;
            		}
            		if (Math.abs(pitchDistance) < Math.abs(data.distance)) {
            			data.pitchClass = this.samplePitchClasses[i];
            			data.distance = pitchDistance;
            		}
            	}
            	return data;
            },
            enumerable: true,
            configurable: true,
            writable: true
        },

        displayStep: {
            value: function(step, element, processedContent) {
                if ((this.stepTargetIsInstrument(step) || (step.command == "sing")) && (step.content != "")) { 
                    var pitchedSampleName = this.noteNameToPitchedSampleName(step.content);
                    var i,
                        n = this.piano._freeVoices.length;
                    for (i=0; i<n; i++) {
                        this.piano._freeVoices[i].pitch = pitchedSampleName.pitch;
                    }
                    var amplitude;
                    switch (step.tone) {

                        case "whisper":
                        amplitude = 0.125;
                        break;

                        case "murmur":
                        amplitude = 0.25;
                        break;

                        case "shout":
                        amplitude = 0.75;
                        break;

                        case "scream":
                        amplitude = 0.875;
                        break;

                        default:
                        amplitude = 0.5;
                        break;

                    }
                    this.piano.triggerAttackRelease(pitchedSampleName.sample, "2", null, amplitude);
                }
            },
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

})(jQuery);