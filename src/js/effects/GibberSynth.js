/**
 * Creates a Gibber synthesizer that can play notes.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {
	 	GibberSynth: GibberSynth
    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function GibberSynth(instance, options) {
    	$.fn.stepwise.effects.AbstractEffect.call(this, instance, options);
        var localOptions = {
            instrumentsToIgnore: []
        };
        $.extend(this.options, localOptions);
        $.extend(this.options, options);
        if (!window.gibberHasBeenInitialized) {
          var me = this;
          var play = function() {
            console.log('Initial gesture received');
          	me.drums = EDrums();
          	me.bus = Bus().fx.add(Reverb({roomSize: Add(.25, .65)}));
          	me.drums.send(me.bus, 1);
          	me.drums.kick.decay = 1;
          }
          Gibber.init(play);
        }
		window.gibberHasBeenInitialized = true;
    	this.unpitchedInstruments = [
    		"gibberdrumkick",
    		"gibberdrumsnare",
    		"gibberdrumhat",
    		"gibberhatopen",
    		"gibbercowbell",
    		"gibberclave"
    	];
    	this.gibberInstruments = [
    		'gibberdrumkick',
    		'gibberdrumsnare',
    		'gibberdrumhat',

    		'gibberhatopen',
    		'gibberconga',
    		'gibbercowbell',
    		'gibberclave',
    		'gibbertom',

    		'gibbersynthshort',
    		'gibbersynthbleep',
    		'gibbersynthrhodes',
    		'gibbersynthcalvin',

    		'gibbermonoshort',
    		'gibbermonobass',
    		'gibbermonowinsome',
    		'gibbermonodark',
    		'gibbermonodark2',
    		'gibbermonoeasy',
    		'gibbermonoeasyfx',
    		'gibbermononoise',
    		'gibbermonolead',

    		'gibberfmbass',
    		'gibberfmstabs',
    		'gibberfmgong',
    		'gibberfmdrum',
    		'gibberfmdrum2',
    		'gibberfmbrass',
    		'gibberfmclarinet',
    		'gibberfmglockenspiel',
    		'gibberfmnoise',

    		'gibberpluck'
    	];
    	this.generalMIDIFamilyToGibberInstrumentMap = {
    		"piano": "gibbersynthshort",
    		"chromaticpercussion": "gibberfmglockenspiel",
    		"organ": "gibbersynthrhodes",
    		"guitar": "gibberpluck",
    		"bass": "gibbermonodark",
    		"strings": "gibbersynthrhodes",
    		"ensemble": "gibbersynthrhodes",
    		"brass": "gibberfmbrass",
    		"reed": "gibberfmclarinet",
    		"pipe": "gibberfmclarinet",
    		"synthlead": "gibbermonoeasyfx",
    		"lead": "gibbermonoeasyfx",
    		"synthpad": "gibbersynthrhodes",
    		"pad": "gibbersynthrhodes",
    		"syntheffects": "gibbermonowinsome",
    		"ethnic": "gibberfmstabs",
    		"percussive": "gibberclave",
    		"soundeffects": "gibberfmnoise",
    		"kick": "gibberdrumkick",
    		"snare": "gibberdrumsnare",
    		"hat": "gibberdrumhat",
    		"hatopen": "gibberhatopen",
    		"conga": "gibberconga",
    		"cowbell": "gibbercowbell",
    		"clave": "gibberclave",
    		"tom": "gibbertom"
    	}
    	this.generalMIDIInstrumentToFamilyMap = {
			"accordion": "organ",
			"acousticbass": "bass",
			"acousticgrandpiano": "piano",
			"acousticguitarnylon": "guitar",
			"acousticguitarsteel": "guitar",
			"agogo": "percussive",
			"altosax": "reed",
			"applause": "soundeffects",
			"bagpipe": "ethnic",
			"banjo": "ethnic",
			"baritonesax": "reed",
			"bassoon": "reed",
			"birdtweet": "soundeffects",
			"blownbottle": "pipe",
			"brasssection": "brass",
			"breathnoise": "soundeffects",
			"brightacousticpiano": "piano",
			"celesta": "chromaticpercussion",
			"cello": "strings",
			"choiraahs": "ensemble",
			"churchorgan": "organ",
			"clarinet": "reed",
			"clavinet": "piano",
			"contrabass": "strings",
			"distortionguitar": "guitar",
			"drawbarorgan": "organ",
			"dulcimer": "chromaticpercussion",
			"electricbassfinger": "bass",
			"electricbasspick": "bass",
			"electricgrandpiano": "piano",
			"electricguitarclean": "guitar",
			"electricguitarjazz": "guitar",
			"electricguitarmuted": "guitar",
			"electricpiano1": "piano",
			"electricpiano2": "piano",
			"englishhorn": "reed",
			"fiddle": "ethnic",
			"flute": "pipe",
			"frenchhorn": "brass",
			"fretlessbass": "bass",
			"fx1rain": "syntheffects",
			"fx2soundtrack": "syntheffects",
			"fx3crystal": "syntheffects",
			"fx4atmosphere": "syntheffects",
			"fx5brightness": "syntheffects",
			"fx6goblins": "syntheffects",
			"fx7echoes": "syntheffects",
			"fx8scifi": "syntheffects",
			"glockenspiel": "chromaticpercussion",
			"guitarfretnoise": "soundeffects",
			"guitarharmonics": "guitar",
			"gunshot": "soundeffects",
			"harmonica": "organ",
			"harpsichord": "piano",
			"helicopter": "soundeffects",
			"honkytonkpiano": "piano",
			"kalimba": "ethnic",
			"koto": "ethnic",
			"lead1square": "synthlead",
			"lead2sawtooth": "synthlead",
			"lead3calliope": "synthlead",
			"lead4chiff": "synthlead",
			"lead5charang": "synthlead",
			"lead6voice": "synthlead",
			"lead7fifths": "synthlead",
			"lead8basslead": "synthlead",
			"marimba": "chromaticpercussion",
			"melodictom": "percussive",
			"musicbox": "chromaticpercussion",
			"mutedtrumpet": "brass",
			"oboe": "reed",
			"ocarina": "pipe",
			"orchestrahit": "ensemble",
			"orchestralharp": "strings",
			"overdrivenguitar": "guitar",
			"pad1newage": "synthpad",
			"pad2warm": "synthpad",
			"pad3polysynth": "synthpad",
			"pad4choir": "synthpad",
			"pad5bowed": "synthpad",
			"pad6metallic": "synthpad",
			"pad7halo": "synthpad",
			"pad8sweep": "synthpad",
			"panflute": "pipe",
			"percussiveorgan": "organ",
			"piccolo": "pipe",
			"pizzicatostrings": "strings",
			"recorder": "pipe",
			"reedorgan": "organ",
			"reversecymbal": "percussive",
			"rockorgan": "organ",
			"seashore": "soundeffects",
			"shakuhachi": "pipe",
			"shamisen": "ethnic",
			"shanai": "ethnic",
			"sitar": "ethnic",
			"slapbass1": "bass",
			"slapbass2": "bass",
			"sopranosax": "reed",
			"steeldrums": "percussive",
			"stringensemble1": "ensemble",
			"stringensemble2": "ensemble",
			"synthbass1": "bass",
			"synthbass2": "bass",
			"synthbrass1": "brass",
			"synthbrass2": "brass",
			"synthchoir": "ensemble",
			"synthdrum": "percussive",
			"synthstrings1": "ensemble",
			"synthstrings2": "ensemble",
			"taikodrum": "percussive",
			"tangoaccordion": "organ",
			"telephonering": "soundeffects",
			"tenorsax": "reed",
			"timpani": "strings",
			"tinklebell": "percussive",
			"tremolostrings": "strings",
			"trombone": "brass",
			"trumpet": "brass",
			"tuba": "brass",
			"tubularbells": "chromaticpercussion",
			"vibraphone": "chromaticpercussion",
			"viola": "strings",
			"violin": "strings",
			"voiceoohs": "ensemble",
			"whistle": "pipe",
			"woodblock": "percussive",
			"xylophone": "chromaticpercussion"
    	}
    	// accounts for the fact that Google Sheet won't allow underscores in column names
    	for (var prop in this.generalMIDIInstrumentToFamilyMap) {
    		var newProp = prop.replace('_', '');
    		this.generalMIDIInstrumentToFamilyMap[newProp] = this.generalMIDIInstrumentToFamilyMap[prop];
    	}
    	this.drums = EDrums();
    	this.bus = Bus().fx.add(Reverb({roomSize: Add(.25, .65)}));
    	this.drums.send(this.bus, 1);
    	this.drums.kick.decay = 1;
    	this.ensemble = {};
    	this.noteNames = { "C":0, "C#":1, "Db":1, "D":2, "D#":3, "Eb":3, "E":4, "F":5, "F#":6, "Gb":6, "G":7, "G#":8, "Ab":8, "A":9, "A#":10, "Bb":10, "B":11 };
   	}

    GibberSynth.prototype = Object.create($.fn.stepwise.effects.AbstractEffect.prototype, {

   		playNoteWithInstrument: {
   			value: function(note, instrumentName, amplitude) {
		   		var instrument = this.ensemble[instrumentName];
				if (instrument == null) {
					switch (instrumentName) {

						case "gibbersynthshort":
						case "gibbersynthbleep":
						case "gibbersynthrhodes":
						case "gibbersynthcalvin":
						instrument = Synth(instrumentName.substr(11));
						break;

						case "gibbermonoshort":
						case "gibbermonolead":
						case "gibbermonobass":
						case "gibbermonowinsome":
						case "gibbermonodark":
						case "gibbermonodark2":
						case "gibbermonoeasy":
						case "gibbermonoeasyfx":
						case "gibbermononoise":
						instrument = Mono(instrumentName.substr(10));
						break;

						case 'gibberfmbass':
						case 'gibberfmnoise':
						case 'gibberfmstabs':
						case 'gibberfmgong':
						case 'gibberfmdrum':
						case 'gibberfmdrum2':
						case 'gibberfmbrass':
						case 'gibberfmclarinet':
						case 'gibberfmglockenspiel':
						instrument = FM(instrumentName.substr(8));
						break;

						case "gibberdrumkick":
						case "gibberdrumsnare":
						case "gibberdrumhat":
						instrument = this.drums[instrumentName.substr(10)];
						break;

						case "gibberpluck":
						instrument = Pluck();
						break;

						case "gibberclave":
						instrument = Clave();
						break;

						case "gibberconga":
						instrument = Conga();
						break;

						case "gibbertom":
						instrument = Tom();
						break;

						case "gibbercowbell":
						instrument = Cowbell();
						break;

						case "gibberhatopen":
						instrument = Hat();
						instrument.decay = 48000;
						break;

					}
					this.ensemble[instrumentName] = instrument;
					instrument.send(this.bus, 1);
				}
				instrument.amp = amplitude;
				if (this.unpitchedInstruments.indexOf(instrumentName) != -1) {
					instrument.note();
				} else {
					instrument.note(note);
				}
		   	}
		},

		displayStep: {
            value: function(step, element, processedContent) {
                var instrumentName = this.getInstrumentNameForStep(step);
		    	if ((instrumentName != null) && this.isValidNoteName(step.content)) {

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
					this.playNoteWithInstrument(this.transposeNoteNameByOctaves(step.content, 1), instrumentName, amplitude);
				}
            },
            enumerable: true,
            configurable: true,
            writable: true
        },

		setInstrument: {
			value: function(instrumentName, instrument, isUnpitched) {
				if (isUnpitched == null) {
					isUnpitched = false;
				}
				if (isUnpitched) {
					this.unpitchedInstruments[instrumentName] = instrumentName;
				}
				if (this.gibberInstruments.indexOf(instrumentName) == -1) {
					this.gibberInstruments.push(instrumentName);
				}
				this.ensemble[instrumentName] = instrument;
			}
		},

		transposeNoteNameByOctaves: {
			value: function(noteName, octaves) {
				var octavePortionLength;
				if (noteName.length == 4) {
					octavePortionLength = 2;
				} else {
					octavePortionLength = 1;
				}
				var name = noteName.substring(0, noteName.length - octavePortionLength);
				var octave = parseInt(noteName.substring(name.length));
				octave += octaves;
				return name + octave;
			}
		},

	    getInstrumentNameForStep: {
	    	value: function(step) {
		    	if (step.target.id != null) {
		    		var str = step.target.id.toLowerCase();
		    		if (this.options.instrumentsToIgnore.indexOf(str) == -1) {
			    		if (this.generalMIDIFamilyToGibberInstrumentMap[str] != null) {
							return this.generalMIDIFamilyToGibberInstrumentMap[str];
						} else if (this.generalMIDIInstrumentToFamilyMap[str] != null) {
							return this.generalMIDIFamilyToGibberInstrumentMap[this.generalMIDIInstrumentToFamilyMap[str]];
			    		} else if (this.gibberInstruments.indexOf(str) != -1) {
			    			return str;
						} else {
							return null;
						}
		    		}
		    	}
		    	return null;
		    }
	    },

		isValidNoteName: {
			value: function(noteName) {
				var octavePortionLength;
				if (noteName.length == 4) {
					octavePortionLength = 2;
				} else {
					octavePortionLength = 1;
				}
				var name = noteName.substring(0, noteName.length - octavePortionLength);
				return this.noteNames[name] != null;
			}
		},

		noteNameToMidiNoteNum: {
			value: function( noteName ) {
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
		},

		midiNoteNumToFrequency: {
			value: function( midiNoteNum ) {
				return Math.pow( 2, ( midiNoteNum - 69 ) / 12.0 ) * 440.0;
			}
		}
	});

    GibberSynth.prototype.constructor = GibberSynth;

})(jQuery);
