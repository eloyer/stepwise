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
        var localOptions = {
            supportsGeneralMIDI: false,
            sampleCount: 1, // number of sample pitch classes to use for interpolation
            fileExtension: "wav"
        };
        $.extend(this.options, localOptions);
        $.extend(this.options, options);
        var reverb = new Tone.Freeverb(.7, 10000).toMaster();
        this.samplePaths = {};
        this.samplePitchClasses = ["C", "Gb", "A", "Eb"];
        this.pitchClassNumbers = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
        this.pitchClassSampleOctaveCounts = {"A":7, "C":8, "Eb":7, "Gb":6};
        var i;
        var n = Math.min(this.options.sampleCount, this.samplePitchClasses.length);
        for (i=0; i<n; i++) {
            this.buildSamplePathsForPitchClass(this.samplePitchClasses[i], this.options.pathToSamples, this.pitchClassSampleOctaveCounts[this.samplePitchClasses[i]]);
        }
        this.piano = new Tone.Sampler(this.samplePaths, {'baseUrl': this.options.pathToSamples, 'onload': function() { console.log('loaded'); }}).toMaster();
        this.piano.volume.value = 15;
        this.supportedGeneralMIDIInstruments = [
            "accordion",
            "acousticbass",
            "acousticgrandpiano",
            "acousticguitarnylon",
            "acousticguitarsteel",
            "altosax",
            "bagpipe",
            "banjo",
            "baritonesax",
            "bassoon",
            "blownbottle",
            "brasssection",
            "brightacousticpiano",
            "celesta",
            "cello",
            "choiraahs",
            "churchorgan",
            "clarinet",
            "clavinet",
            "contrabass",
            "distortionguitar",
            "drawbarorgan",
            "dulcimer",
            "electricbassfinger",
            "electricbasspick",
            "electricgrandpiano",
            "electricguitarclean",
            "electricguitarjazz",
            "electricguitarmuted",
            "electricpiano1",
            "electricpiano2",
            "englishhorn",
            "fiddle",
            "flute",
            "frenchhorn",
            "fretlessbass",
            "glockenspiel",
            "guitarharmonics",
            "harmonica",
            "harpsichord",
            "honkytonkpiano",
            "kalimba",
            "koto",
            "lead1square",
            "lead2sawtooth",
            "lead3calliope",
            "lead4chiff",
            "lead5charang",
            "lead6voice",
            "lead7fifths",
            "lead8basslead",
            "marimba",
            "musicbox",
            "mutedtrumpet",
            "oboe",
            "ocarina",
            "orchestrahit",
            "orchestralharp",
            "overdrivenguitar",
            "pad1newage",
            "pad2warm",
            "pad3polysynth",
            "pad4choir",
            "pad5bowed",
            "pad6metallic",
            "pad7halo",
            "pad8sweep",
            "panflute",
            "percussiveorgan",
            "piccolo",
            "pizzicatostrings",
            "recorder",
            "reedorgan",
            "rockorgan",
            "seashore",
            "shakuhachi",
            "shamisen",
            "shanai",
            "sitar",
            "slapbass1",
            "slapbass2",
            "sopranosax",
            "steeldrums",
            "stringensemble1",
            "stringensemble2",
            "synthbass1",
            "synthbass2",
            "synthbrass1",
            "synthbrass2",
            "synthchoir",
            "synthstrings1",
            "synthstrings2",
            "tangoaccordion",
            "tenorsax",
            "timpani",
            "tinklebell",
            "tremolostrings",
            "trombone",
            "trumpet",
            "tuba",
            "tubularbells",
            "vibraphone",
            "viola",
            "violin",
            "voiceoohs",
            "whistle",
            "xylophone"
        ];
   }

    TonePiano.prototype = Object.create($.fn.stepwise.effects.AbstractEffect.prototype, {

        buildSamplePathsForPitchClass: {
            value: function(pitchClass, path, octaveCount) {
                var i;
                for (i=0; i<octaveCount; i++) {
                    this.samplePaths[pitchClass+i] = pitchClass + i + "." + this.options.fileExtension;
                }
            },
            enumerable: true,
            configurable: true,
            writable: true
        },

        stepTargetIsInstrument: {
            value: function(step) {
                if (step.target.id != null) {
                    var str = step.target.id.toLowerCase();
                    if (str == "piano") {
                        return true;
                    } else if (this.options.supportsGeneralMIDI && (this.supportedGeneralMIDIInstruments.indexOf(str) != -1)) {
                        return true;
                    } else {
                        return false;
                    }
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
                    n = Math.min(this.options.sampleCount, this.samplePitchClasses.length);
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
                    this.piano.triggerAttackRelease(step.content, "2", null, amplitude);
                }
            },
            enumerable: true,
            configurable: true,
            writable: true
        }
    });

})(jQuery);