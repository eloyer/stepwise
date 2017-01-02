/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */
 
 
;(function ( $, window, document, undefined ) {
 
    // undefined is used here as the undefined global
    // variable in ECMAScript 3 and is mutable (i.e. it can
    // be changed by someone else). undefined isn't really
    // being passed in so we can ensure that its value is
    // truly undefined. In ES5, undefined can no longer be
    // modified.
 
    // window and document are passed through as local
    // variables rather than as globals, because this (slightly)
    // quickens the resolution process and can be more
    // efficiently minified (especially when both are
    // regularly referenced in our plugin).
 
    // Create the defaults once
    var pluginName = "stepwise",
        defaults = {
            dataType: "xml",
            outputToElement: true
        };
        
    $.fn[pluginName] = function ( options ) {
        return this.each( function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName, new Stepwise( this, options ));
            }
        });
    }

    $.fn[pluginName].effects = {};

    // The actual plugin constructor
    function Stepwise( element, options ) {
    
    	var me = this;
 
        // jQuery has an extend method that merges the
        // contents of two or more objects, storing the
        // result in the first object. The first object
        // is generally empty because we don't want to alter
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;
     
        this.element = element;
        $( this.element ).bind( "executeStep", this.handleExecuteStep );

        this._defaults = defaults;
        this._name = pluginName;
 
 		this.init();
 		
    }
 
    Stepwise.prototype.init = function() {
         
    	var source = this.options.url;
    	if (source == null) {
    		source = this.options.source;
    	}
    	this.load( source, this.options.dataType );
        
    };
    
    Stepwise.prototype.load = function( source, dataType ) {
    
    	var me = this;
    
    	switch (dataType) {

    		case "dom":
    		this.score = new Score( $( source ), "xml", this.element );
    		this.score.init();
    		this.doOnLoadCallback(this);
    		break;

    		case "text":
    		this.score = new Score( source, "text", this.element );
    		this.score.init();
    		this.doOnLoadCallback(this);
    		break;

    		case "xml":
	    	$.ajax({
    			type: "GET",
    			url: source,
    			dataType: dataType,
    			success: ( dataType == "xml" ) ?
    			function( xml ) {
			    	me.score = new Score( $( xml ).find( "stepwise" ).first(), "xml", me.element );
			    	me.score.init();
			    	me.doOnLoadCallback(this);
    			} :
    			function( text ) {
 			    	me.score = new Score( text, "text", me.element );
			    	me.score.init();
			    	me.doOnLoadCallback(this);
    			},
    			error: function( request, status, error ) {
    			
    				switch ( status ) {
    				
    					case "parsererror":
    					console.log( "stepwise error on load: the XML could not be parsed." );
    					break;
    					
    				}
    				
    			}
    		});
	   		break;

    	}

    }

    Stepwise.prototype.doOnLoadCallback = function() {
		if ( this.options.onLoad != null ) {
			this.options.onLoad(this);
		}
    }

    Stepwise.prototype.reset = function() {
    	this.score.reset();
    }
	
	Stepwise.prototype.nextStep = function() {
		return this.score.nextStep();
	}  
	
	Stepwise.prototype.play = function() {
		this.score.play();
	} 
	
	Stepwise.prototype.stop = function() {
		this.score.stop();
	} 
		
	Stepwise.prototype.handleExecuteStep = function( event, step ) {
	
		var stepwise = $( this ).data( "plugin_stepwise" );
	
		switch ( step.command ) {
		
			case "narrate":
			case "speak":
			case "think":
			case "sing":
			if (stepwise.options.outputEnabled) {
				if ( step.target != null ) {
					if ( step.target.visible ) {
						stepwise.displayStepContent( step );
					}
				} else {
					stepwise.displayStepContent( step );
				}
			}
			break;

			case "sample":
			step.target.nextStep();
			break;

			case "setbackcolor":
			stepwise.score.setBackColor( step.content );
			break;

			case "setdate":
			stepwise.score.setDate( step.date );
			break;

			case "setforecolor":
			stepwise.score.setForeColor( step.content );
			break;
			
			case "setlocation":
			stepwise.score.setLocation( step.target );
			break;

			case "setmidcolor":
			stepwise.score.setMidColor( step.content );
			break;
			
			case "setsequence":
			stepwise.score.setSequence( step.target, step.atDate, step.autoStart );
			break;
			
			case "settemperature":
			stepwise.score.setTemperature( step.content, step.units );
			break;
			
			case "setweather":
			stepwise.score.setWeather( step.weather );
			break;
			
			case "group":
			step.executeSubsteps();
			break;
			
		}
		
		if ( stepwise.options.onStep != null ) {
			stepwise.options.onStep( event, step );
		}
	
	}

	Stepwise.prototype.displayStepContent = function(step) {
		if (!step.append) {
			$(this.element).empty();
		}
		$(this.element).append(step.content);
	}
	 
	function Score( data, dataType, element ) {

		this.element = element;
		this.isPlaying = false;
		this.setDefaults();
		this.parseMetadata( data, dataType );
		this.parseStory( data, dataType );
		this.init();

	}

	Score.prototype.setDefaults = function() {

		this.version = 1;
		this.type = "basic";
		this.timeScale = 1.0;
		
		this.sequenceQueue = [];
		this.sequenceIndex = 0;
		
		this.currentLocation = new Location( $("<location id=\"defaultLocation\" lat=\"0\" lon=\"0\">Default Location</location>") );
		
		this.currentTemperature = 24;
		this.currentTemperatureUnits = TemperatureUnits.CELSIUS;
		
		this.currentWeather = WeatherConditions.CLEAR;
		
		this.currentDate = Date.now();

		this.backColor = '#ffffff';
		this.midColor = '#888888';
		this.foreColor = '#000000';

	}

	Score.prototype.parseMetadata = function( data, dataType ) {
	
		var me = this;

		if ( data != null ) {
			if ( dataType != "xml" ) {

				lines = data.split(/\r?\n/);
				
				var i, line, lineLower, key,
					n = lines.Length,
					isUsingStepwiseKeys = false;

				for ( i = 0; i < n; i++ ) {
					
					line = lines[ i ];
					lineLower = line.toLowerCase();
					
					key = "stepwise.title:";
					if ( lineLower.indexOf( key ) == 0 ) {
						this.title = line.substr( key.length );
						isUsingStepwiseKeys = true;
					}
					key = "stepwise.credit:";
					if ( lineLower.indexOf( key ) == 0 ) {
						this.primaryCredits = line.substr( key.length );
						isUsingStepwiseKeys = true;
					}
					key = "stepwise.description:";
					if ( lineLower.indexOf( key ) == 0 ) {
						this.description = line.substr( key.length );
						isUsingStepwiseKeys = true;
					}
				}

				if ( !isUsingStepwiseKeys ) {
					if ( lines.length > 0 ) {
						this.title = lines[ 0 ].trim();
					}
					if ( lines.length > 1 ) {
						this.primaryCredits = lines[ 1 ].trim();
					}
					if ( lines.length > 2 ) {
						this.description = lines[ 2 ].trim();
					}
				}
				
				if ( this.title == "" ) {
					this.title = "Untitled";
				}
				if ( this.primaryCredits == "" ) {
					this.primaryCredits = "Author unknown";
				}
				this.version = 1;
				this.type = "basic";			

			} else {
			
				this.title = data.find( "title" ).first().text();
				this.description = data.find( "description" ).first().text();
				this.primaryCredits = data.find( "primaryCredits" ).first().text();
				this.secondaryCredits = data.find( "secondaryCredits" ).first().text();
				this.version = parseInt( data.find( "version" ).first().text() );
				var pulseData = data.find( "pulse" );
				if ( pulseData.length != 0 ) {
					this.beatsPerMinute = parseFloat( pulseData.first().attr( "beatsPerMinute" ) );
					this.pulsesPerBeat = parseFloat( pulseData.first().attr( "pulsesPerBeat" ) );
					this.swing = parseFloat( pulseData.first().attr( "swing" ) );
					if (isNaN(this.swing)) {
						this.swing = 1;
					}
					this.pulse = (( 60 * 1000 ) / this.beatsPerMinute ) / this.pulsesPerBeat;			
				}

			}
		}
	}

	Score.prototype.parseStory = function( data, dataType ) {

		var me = this;
				
		if ( data != null ) {

			this.characters = [];
			this.charactersById = {};
			this.sequences = [];
			this.sequencesById = {};
			this.sequenceQueue = [];
			var sequence;

			if ( dataType != "xml" ) {
				sequence = new Sequence( data, "text", this );
				this.sequences.push( sequence );
				this.sequencesById[ sequence.id ] = sequence;

			} else {
				data.find( "sequence" ).each( function() {
					sequence = new Sequence( $( this ), "xml", me );
					if ( sequence.id == null ) {
						sequence.id = "sequence" + me.sequences.length;
					}
					me.sequences.push( sequence );
					me.sequencesById[ sequence.id ] = sequence;
				});
				
				this.sequenceIndex = 0;
				this.currentSequence = null;
				
				var character;
				data.find( "character" ).each( function() {
					character = new Character( $( this ), me );
					if ( character.id == null ) {
						character.id = "character" + me.characters.length;
					}
					me.characters.push( character );
					me.charactersById[ character.id ] = character;
				});
				
				this.locations = [];
				this.locationsById = {};
				var location;
				data.find( "location" ).each( function() {
					location = new Location( $( this ), me );
					if ( location.id == null ) {
						location.id = "location" + me.locations.length;
					}
					me.locations.push( location );
					me.locationsById[ location.id ] = location;
				});
			}
		}
		
	}
	
	Score.prototype.init = function() {

		var i,
			n = this.sequences.length;

		for ( i = 0; i < n; i++ ) {
			this.sequences[ i ].init();
		}
	}

	Score.prototype.reset = function() {

		var i,
			n = this.sequences.Length;

		for ( i = 0; i < n; i++ ) {
			this.sequences[ i ].reset();
		}
		
		this.sequenceIndex = 0;
		this.currentSequence = null;
		this.sequenceQueue = [];
	}

	Score.prototype.nextStep = function() {

		var step = null;
	
		this.updateCurrentSequence();

		//console.log( this.currentSequence.id + ' ' + this.currentSequence.isExhausted );
		 
		// if the sequence hasn't been exhausted, execute its next step
		if ( !this.currentSequence.isExhausted ) { 
			step = this.currentSequence.nextStep(); 
		}

		var me = this;
		if (this.isPlaying) {
			this.timeout = setTimeout(function() { me.nextStep(); }, (this.pulse * step.duration * this.swing * (1.0 / (this.timeScale + .0001))));
		}
		
		return step;
	
	}   

	Score.prototype.play = function() {
		this.isPlaying = true;
		this.nextStep();
	}	

	Score.prototype.stop = function() {
		this.isPlaying = false;
		clearTimeout(this.timeout);
	}
	
	Score.prototype.updateCurrentSequence = function() {
	
		var sequence;  
		
		//console.log( 'next step for score' );
		
		// if there are sequences in the queue, get the current one
		if ( this.sequenceQueue.length > 0 ) { 
			sequence = this.sequenceQueue[ this.sequenceQueue.length - 1 ]; 
		 
		 	// if it's already completed, then
			if ( sequence.isCompleted ) {
			 
			 	// remove it from the queue
				if ( this.sequenceQueue.length > 0) {
					this.sequenceQueue.pop();
				}
				
				// if there's still a queue, then grab the next sequence from it
				if ( this.sequenceQueue.length > 0 ) {
					sequence = this.sequenceQueue[ this.sequenceQueue.length - 1 ];
					
				// otherwise, grab the current non-queue sequence
				} else {
					sequence = this.sequences[ this.sequenceIndex ]; 
				}
			} 
			
		// grab the current non-queue sequence
		} else {
			sequence = this.sequences[ this.sequenceIndex ];
		}
		
		//console.log( 'current sequence: ' + sequence.id );
		 
		// if the sequence hasn't been exhausted, make it current
		if ( !sequence.isExhausted ) { 
			this.currentSequence = sequence;
		}
	
	}
	
	/**
	 * Given a sequence id, makes it the current sequence.
	 *
	 * @param sequence		Id of the sequence to make current.
	 * @param atDate		If specified, will attempt to cue up the sequence to the same date.
	 * @param autoStart		If true, the sequence will automatically play its first step.
	 */
	Score.prototype.setSequence = function( sequence, atDate, autoStart ) {
	
		var index = this.sequences.indexOf( sequence );
		if ( index != -1 ) {
			this.sequenceIndex = index;
			this.currentSequence = sequence;
			if ( atDate != null ) {
				this.currentSequence.matchDate( atDate );
			}
			if ( autoStart ) {
				this.currentSequence.nextStep();
			}
		}
		
	}
	
	Score.prototype.playSequence = function( sequence ) {
		this.currentSequence = sequence;
		this.sequenceQueue.push( sequence );
		sequence.nextStep();
	}
	
	/**
	 * Given an id and a type, returns the corresponding object.
	 *
	 * @param	type	The type of item to be retrieved.
	 * @param	id		The id of the sequence to be retrieved.
	 */
	Score.prototype.getItemForId = function( type, id ) {

		switch ( type ) {
		
			case "character":
			return this.charactersById[ id ];
			break;
		
			case "location":
			return this.locationsById[ id ];
			break;
		
			case "sequence":
			return this.sequencesById[ id ];
			break;
		
		}
		
		return null;
	}
	
	Score.prototype.setBackColor = function( color ) {
		this.backColor = color;
	}
	
	Score.prototype.setForeColor = function( color ) {
		this.foreColor = color;
	}
	
	Score.prototype.setMidColor = function( color ) {
		this.midColor = color;
	}
	
	Score.prototype.setLocation = function( location ) {
	
		var index = this.locations.indexOf( location );
		if ( index != -1 ) {
			this.currentLocation = location;
		}
		
	}
	
	Score.prototype.setTemperature = function( temperature, units ) {
		this.currentTemperature = temperature;
		this.currentTemperatureUnits = units;
	}
	
	Score.prototype.setWeather = function( weather ) {
		this.currentWeather = weather;
	}

	Score.prototype.setDate = function( date ) {
		this.currentDate = date;
	}
	
	function Sequence( data, dataType, score ) {
	
		var me = this;

		this.parentScore = score;
		this.shuffle = false;
		this.repeat = false;
		this.count = -1;
		this.steps = [];
		this.stepIndex = -1;
		this.isCompleted = false;
		this.isExhausted = false;
		this.completions = 0;
		this.usedIndexes = [];
		this.percentCompleted = 0;

		if ( dataType != "xml" ) {
			this.id = "sequence" + this.parentScore.sequences.Length;
			this.repeat = true;

			var lines = data.split(/\r?\n/);

			var i, line, lineLower, step,
				n = lines.length;

			for ( i = 0; i < n; i++ ) {
				line = lines[ i ];
				lineLower = line.toLowerCase();
				if (( lineLower.indexOf( "stepwise.title:" ) != 0 ) && ( lineLower.indexOf( "stepwise.credit:" ) != 0 ) && ( lineLower.indexOf( "stepwise.description:" ) != 0 )) {
					step = new Step( line, "text", this.parentScore );
					this.steps.push( step );
				}
			}

		} else {

			this.id = $( data ).attr( "id" );
			if ( this.id == null ) {
				this.id = "sequence" + this.parentScore.sequences.Length;
			}
			this.shuffle = $( data ).attr( "shuffle" ) == "true" ? true : false;
			if ( $( data ).attr( "repeat" ) != null ) {
				this.repeat = ( $( data ).attr( "repeat" ) != null );
				this.count = parseInt( $( data ).attr( "repeat" ) );
				if ( isNaN( this.count ) ) {
					this.count = -1; // repeat infinitely
				}
			}
			this.grouping = $( data ).attr( "grouping" );

			var step;
			// construct groupings
			if (this.grouping != null) {
				var stepData, groupingInstruction,
					stepIndex = 0,
					groupingStepIndex = 0,
					groupedData = $('<data/>'),
					group = $('<group/>'),
					steps = data.children(),
					stepCount = steps.length;
				while (stepIndex < stepCount) {
					groupingInstruction = this.grouping[groupingStepIndex].toLowerCase();
					switch (groupingInstruction) {
						case 'x':
						case '&':
						stepData = steps.eq(stepIndex).clone();
						if (groupingStepIndex > 0) {
							stepData.attr('delay', groupingStepIndex);
						}
						if (groupingInstruction == '&') {
							stepData.attr('append', 'true');
							stepData.children().attr('append', 'true');
						}
						group.append(stepData);
						stepIndex++;
						break;
					}
					groupingStepIndex++;
					if ((groupingStepIndex == this.grouping.length) || (stepIndex == stepCount)) {
						groupingStepIndex = 0;
						console.log(group);
						groupedData.append(group);
						group = $('<group/>');
					}
				}
				groupedData.children().each( function() {
					step = new Step( $( this ), "xml", me.parentScore );
					me.steps.push( step );
				});

			} else {
				data.children().each( function() {
					step = new Step( $( this ), "xml", me.parentScore );
					me.steps.push( step );
				});
			}
		}
		
	}
	
	Sequence.prototype.init = function() {
	
		var i,
			n = this.steps.length;

		for ( i = 0; i < n; i++ ) {
			this.steps[ i ].init();
		}
	
	}
	 
	Sequence.prototype.reset = function() {
		this.stepIndex = -1; 
		this.isCompleted = false;
		this.isExhausted = false;
		this.percentCompleted = 0;
	}
	
	Sequence.prototype.nextStep = function() {
	
		var result = null;

		//console.log( this.id + ' ' + this.isExhausted + ' ' + this.shuffle + ' ' + this.isCompleted );
	  
	  	if ( this.steps.length > 0 ) {

		  	// if the sequence hasn't been exhausted, then
		 	if ( !this.isExhausted ) {
			 	
				// if the sequence is not shuffled, then
				if ( !this.shuffle ) { 
				 
				 	// if the sequence has been completed and is set to repeat, then restart it
					if ( this.isCompleted && this.repeat ) { 
						//console.log('sequence was completed; resetting');
						this.reset();
					}
						 
					this.stepIndex++;
					result = this.steps[ this.stepIndex ].execute(); 

					this.percentCompleted = this.stepIndex / parseFloat( this.steps.Count );
					
					//console.log( "step " + this.stepIndex );
					
					// if this is the last step in the sequence, then
					if ( this.stepIndex >= ( this.steps.length - 1 )) { 
						this.completions++; 
						
						//console.log('sequence ' + this.id + ' reached its end');
						
						// if the sequence is set to repeat, then
						if ( this.repeat ) {   
							//console.log('this is a repeating sequence');
						
							if ( this.count > -1 ) {
								//console.log('a count has been specified');
								if ( this.completions >= this.count ) {  
									//console.log('the count has been exhausted');
									this.isExhausted = true;
								} else { 
									//console.log('resetting for another round');
									this.reset();
								}
							} else {
								//console.log('no count specified; resetting for another round');
								this.reset();
							}
							
						// otherwise, if the sequence is not set to repeat, then mark it as completed
						} else { 
							//console.log('this is a non-repeating sequence');
						
							if ( this.count > -1 ) {
								//console.log('a count has been specified');
								if ( this.completions >= count ) {
									//console.log('the count has been exhausted');
									this.isExhausted = true;
								} else { 
									//console.log('the sequence is completed');
									this.isCompleted = true;
								}
							} else { 
								//console.log('no count specified; sequence is completed');
								this.isCompleted = true;
								this.isExhausted = true;
							}
						} 
					}
					
				// shuffled playback
				} else {
					//console.log( 'this is a shuffled sequence' );
					do {
						this.stepIndex = Math.floor( Math.random() * this.steps.length );
					} while ( this.usedIndexes.indexOf( this.stepIndex ) != -1 );
					this.usedIndexes.push( this.stepIndex );
					if ( this.usedIndexes.length >= this.steps.length ) {
						//console.log( 'used up all of the steps; starting over' );
						this.usedIndexes = [];
						this.usedIndexes.push( this.stepIndex );
					}
					this.completions++;
					this.isCompleted = true;
					if (( this.count != -1 ) && ( this.completions >= this.count )) {
						//console.log( 'the count has been exhausted' );
						this.isExhausted = true;
					}
					result = this.steps[ this.stepIndex ].execute(); 
				}
			}
		}
	
		return result;
	} 
	
	Sequence.prototype.getCurrentStepId = function() {
		if ( this.stepIndex == -1 ) {
			return "";
		} else {
			return this.steps[ this.stepIndex ].id;
		}
		return "";
	}   

	Sequence.prototype.matchDate = function( date ) {

		var i, step,
			n = this.steps.length;

		if ( date == null ) {
			date = this.parentScore.currentDate;
		}

		for ( i = 0; i < n; i++ ) {
			step = this.steps[ i ];
			if ( step.command == "setdate" ) {
				if ( date.getTime() === step.date.getTime() ) {
					this.stepIndex = i;
					break;
				}
			}
		}
	} 
	
	var SpeechTone = {
		NORMAL: "normal",
		MURMUR: "murmur",
		WHISPER: "whisper",
		SHOUT: "shout",
		SCREAM: "scream"
	}
	
	var TemperatureUnits = {
		FAHRENHEIT: "fahrenheit",
		CELSIUS: "celsius"
	}
	
	// adapted from http://openweathermap.org/weather-conditions
	var WeatherConditions = {
		CLEAR: "clear",
		DRIZZLE: "drizzle",
		LIGHTRAIN: "lightrain",
		RAIN: "rain",
		HEAVYRAIN: "heavyrain",
		THUNDERSTORM: "thunderstorm",
		SNOW: "snow",
		ATMOSPHERE: "atmosphere",
		CLOUDS: "clouds",
		EXTREME: "extreme",
		ADDITIONAL: "additional"
	}
		
	function Step( data, dataType, score ) {
	
		var me = this;
		this.parentScore = score;
		this.duration = 1;

		if ( dataType != "xml" ) {
			this.command = "narrate";
			this.content = data;
			this.tone = SpeechTone.NORMAL;
			this.delay = 0;
			this.substeps = [];

		} else {
	
			this.data = $( data );
			this.command = data.prop( "tagName" ).toLowerCase();
			this.itemRef = data.attr( "itemRef" );
			this.append = ( data.attr( "append" ) == "true" ) ? true : false;
			if ( data.attr( "delay" ) != null ) {
				this.delay = parseInt( data.attr( "delay" ) );
				this.duration = Math.max(this.duration, this.delay + 1);
			}

			this.content = data.text();
			this.substeps = [];
			
			var step;
			data.children().each( function() {
				var step = new Step( $( this ), "xml", me.parentScore );
				me.substeps.push( step );
				me.duration = Math.max(me.duration, step.duration);
			});

		}

		this.parseCommand();
	
	}

	Step.prototype.parseCommand = function() {
			
		switch ( this.command ) {
		
			case "speak":
			case "sing":
			this.tone = SpeechTone[ this.data.attr( "tone" ) != null ? this.data.attr( "tone" ).toUpperCase() : SpeechTone.NORMAL ];
			break;
			
			case "settemperature":
			this.units = TemperatureUnits[ this.data.attr( "units" ) != null ? this.data.attr( "units" ).toUpperCase() : TemperatureUnits.CELSIUS ];
    		break;
			
			case "setweather":
			this.weather = WeatherConditions[ this.content != null ? this.content.toUpperCase() : WeatherConditions.SUNNY ]; 
			break;

			case "setdate":
			case "settime":
			this.date = new Date( this.content );
			break;

			case "setsequence":
			this.atDate = this.data.attr( "atDate" );
			this.autoStart = this.data.attr( "autoStart" ) == "true" ? true : false;
			break;
		
		}

	}
	
	Step.prototype.init = function( substep ) {
	
		var i, n;

		if ( substep == null ) {
			substep = false;
		}
	
		switch ( this.command ) {
		
			case "speak":
			case "think":
			case "sing":
			this.target = this.parentScore.getItemForId( "character", this.data.attr( "character" ) );
			break;
			
			case "setlocation":
			this.target = this.parentScore.getItemForId( "location", this.content );
			break;
			
			case "setsequence":
			case "sample":
			this.target = this.parentScore.getItemForId( "sequence", this.content );
			break;

			default:
			this.target = { visible: true };
			break;
		
		}

		n = this.substeps.length;
		for ( i = 0; i < n; i++ ) {
			this.substeps[ i ].init( true );
		}
		
	}
		
	Step.prototype.execute = function() {
		var me = this;
		if ( this.delay == null ) {
			$( this.parentScore.element ).trigger( "executeStep", this );
		} else {
			var millisecondsToNextPulse = new Date().getMilliseconds() % this.parentScore.pulse;
			setTimeout( function() {
				$( me.parentScore.element ).trigger( "executeStep", me );
			}, /*millisecondsToNextPulse +*/ me.delay * me.parentScore.pulse * (1.0 / (me.parentScore.timeScale + .0001)) );
		}
		return this;
	}
	
	Step.prototype.executeSubsteps = function() {
		var i, step,
			n = this.substeps.length;
		for ( i = 0; i < n; i++ ) {
			step = this.substeps[ i ];
			step.execute();
		}
	}
	
	function Character( data, score ) {	
		this.data = $( data );
		this.parentScore = score;
		this.id = data.attr( "id" );
		this.firstName = data.attr( "firstName" );
		this.lastName = data.attr( "lastName" );
		this.fullName = this.firstName + (( this.lastName == "" ) ? "" : " " + this.lastName );
		this.visible = (( data.attr( "visible" ) == "true" ) || ( data.attr( "visible" ) == null )) ? true : false;	
	}
	
	function Location( data, score ) {	
		this.data = $( data );
		this.parentScore = score;
		this.id = data.attr( "id" );
		this.latitude = parseFloat( data.prop( "lat" ) );
		this.longitude = parseFloat( data.attr( "lon" ) );
		this.name = data.text();	
	}
	
})( jQuery, window, document );
