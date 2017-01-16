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
        $.extend(this.options, options);
    	Gibber.init();
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

    		'gibberfmbass2',
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
			"acoustic_bass": "bass",
			"acoustic_grand_piano": "piano",
			"acoustic_guitar_nylon": "guitar",
			"acoustic_guitar_steel": "guitar",
			"agogo": "percussive",
			"alto_sax": "reed",
			"applause": "soundeffects",
			"bagpipe": "ethnic",
			"banjo": "ethnic",
			"baritone_sax": "reed",
			"bassoon": "reed",
			"bird_tweet": "soundeffects",
			"blown_bottle": "pipe",
			"brass_section": "brass",
			"breath_noise": "soundeffects",
			"bright_acoustic_piano": "piano",
			"celesta": "chromaticpercussion",
			"cello": "strings",
			"choir_aahs": "ensemble",
			"church_organ": "organ",
			"clarinet": "reed",
			"clavinet": "piano",
			"contrabass": "strings",
			"distortion_guitar": "guitar",
			"drawbar_organ": "organ",
			"dulcimer": "chromaticpercussion",
			"electric_bass_finger": "bass",
			"electric_bass_pick": "bass",
			"electric_grand_piano": "piano",
			"electric_guitar_clean": "guitar",
			"electric_guitar_jazz": "guitar",
			"electric_guitar_muted": "guitar",
			"electric_piano_1": "piano",
			"electric_piano_2": "piano",
			"english_horn": "reed",
			"fiddle": "ethnic",
			"flute": "pipe",
			"french_horn": "brass",
			"fretless_bass": "bass",
			"fx_1_rain": "syntheffects",
			"fx_2_soundtrack": "syntheffects",
			"fx_3_crystal": "syntheffects",
			"fx_4_atmosphere": "syntheffects",
			"fx_5_brightness": "syntheffects",
			"fx_6_goblins": "syntheffects",
			"fx_7_echoes": "syntheffects",
			"fx_8_scifi": "syntheffects",
			"glockenspiel": "chromaticpercussion",
			"guitar_fret_noise": "soundeffects",
			"guitar_harmonics": "guitar",
			"gunshot": "soundeffects",
			"harmonica": "organ",
			"harpsichord": "piano",
			"helicopter": "soundeffects",
			"honkytonk_piano": "piano",
			"kalimba": "ethnic",
			"koto": "ethnic",
			"lead_1_square": "synthlead",
			"lead_2_sawtooth": "synthlead",
			"lead_3_calliope": "synthlead",
			"lead_4_chiff": "synthlead",
			"lead_5_charang": "synthlead",
			"lead_6_voice": "synthlead",
			"lead_7_fifths": "synthlead",
			"lead_8_bass__lead": "synthlead",
			"marimba": "chromaticpercussion",
			"melodic_tom": "percussive",
			"music_box": "chromaticpercussion",
			"muted_trumpet": "brass",
			"oboe": "reed",
			"ocarina": "pipe",
			"orchestra_hit": "ensemble",
			"orchestral_harp": "strings",
			"overdriven_guitar": "guitar",
			"pad_1_new_age": "synthpad",
			"pad_2_warm": "synthpad",
			"pad_3_polysynth": "synthpad",
			"pad_4_choir": "synthpad",
			"pad_5_bowed": "synthpad",
			"pad_6_metallic": "synthpad",
			"pad_7_halo": "synthpad",
			"pad_8_sweep": "synthpad",
			"pan_flute": "pipe",
			"percussive_organ": "organ",
			"piccolo": "pipe",
			"pizzicato_strings": "strings",
			"recorder": "pipe",
			"reed_organ": "organ",
			"reverse_cymbal": "percussive",
			"rock_organ": "organ",
			"seashore": "soundeffects",
			"shakuhachi": "pipe",
			"shamisen": "ethnic",
			"shanai": "ethnic",
			"sitar": "ethnic",
			"slap_bass_1": "bass",
			"slap_bass_2": "bass",
			"soprano_sax": "reed",
			"steel_drums": "percussive",
			"string_ensemble_1": "ensemble",
			"string_ensemble_2": "ensemble",
			"synth_bass_1": "bass",
			"synth_bass_2": "bass",
			"synth_brass_1": "brass",
			"synth_brass_2": "brass",
			"synth_choir": "ensemble",
			"synth_drum": "percussive",
			"synth_strings_1": "ensemble",
			"synth_strings_2": "ensemble",
			"taiko_drum": "percussive",
			"tango_accordion": "organ",
			"telephone_ring": "soundeffects",
			"tenor_sax": "reed",
			"timpani": "strings",
			"tinkle_bell": "percussive",
			"tremolo_strings": "strings",
			"trombone": "brass",
			"trumpet": "brass",
			"tuba": "brass",
			"tubular_bells": "chromaticpercussion",
			"vibraphone": "chromaticpercussion",
			"viola": "strings",
			"violin": "strings",
			"voice_oohs": "ensemble",
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
				if (this.unpitchedInstruments.indexOf(instrumentName) != -1) {
					instrument.amp = amplitude;
					instrument.note();
				} else {
					instrument.amp = amplitude;
					instrument.note(note);
				}
		   	}
		},

	    bindToInstance: {
	    	value: function(stepwiseInstance) {
		    	var me = this;
		    	this.instance = stepwiseInstance;
		    	$(this.instance.element).bind("executeStep", function(event, step) {
			    	//if ((me.stepTargetIsInstrument(step) || (step.command == "sing")) && (step.content != "")) { 
		    		var instrumentName = me.getInstrumentNameForStep(step);
			    	if ((instrumentName != null) && me.isValidNoteName(step.content)) {
						
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
						me.playNoteWithInstrument(step.content, instrumentName, amplitude);
					}
			    });
		    }
		},

		addInstrument: {
			value: function(instrumentName, instrument, isUnpitched) {
				if (isUnpitched == null) {
					isUnpitched = false;
				}
				if (isUnpitched) {
					this.unpitchedInstruments[instrumentName] = instrumentName;
				}
				console.log(instrumentName);
				console.log(instrument);
				this.gibberInstruments.push(instrumentName);
				this.ensemble[instrumentName] = instrument;
				console.log(this);
			}
		},

	    getInstrumentNameForStep: {
	    	value: function(step) {
		    	if (step.target.id != null) {
		    		var str = step.target.id.toLowerCase();
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

})(jQuery);