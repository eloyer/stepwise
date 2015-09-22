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
            propertyName: "value"
        };
        
    $.fn[pluginName] = function ( options ) {
        return this.each( function () {
            if ( !$.data(this, "plugin_" + pluginName )) {
                $.data( this, "plugin_" + pluginName, new Stepwise( this, options ));
            }
        });
    }

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
        // Place initialization logic here
        // We already have access to the DOM element and
        // the options via the instance, e.g. this.element
        // and this.options
        
        if ( this.options.url != null ) {
        	this.load( this.options.url );
        }
    };
    
    Stepwise.prototype.load = function( url ) {
    
    	var me = this;
    
    	if ( url != null ) {
    		$.ajax({
    			type: "GET",
    			url: url,
    			dataType: "xml",
    			success: function( data ) {
			    	me.score = new Score( $( data ).find( "stepwise" ).first(), me.element );
			    	me.score.init();
			    	console.log( "ready" );
    			},
    			error: function( request, status, error ) {
    			
    				switch ( status ) {
    				
    					case "parsererror":
    					console.log( "stepwise error on load: the XML could not be parsed." );
    					break;
    					
    				}
    				
    			}
    		});
    	}

    }
	
	Stepwise.prototype.nextStep = function() {
		return this.score.nextStep();
	}  
		
	Stepwise.prototype.handleExecuteStep = function( event, step ) {
	
		var stepwise = $( this ).data( "plugin_stepwise" );
	
		switch ( step.command ) {
		
			case "narrate":
			case "speak":
			case "think":
			$( this ).text( step.data.text() );
			break;

			case "setdate":
			stepwise.score.setDate( step.date );
			break;
			
			case "setlocation":
			stepwise.score.setLocation( step.location );
			break;
			
			case "setsequence":
			stepwise.score.setSequence( step.target, step.atDate, step.autoStart );
			break;
			
			case "settemperature":
			stepwise.score.setTemperature( step.content, step.units );
			break;
			
			case "setweather":
			stepwise.score.setWeather( step.content );
			break;
			
			case "group":
			step.executeSubsteps();
			break;
			
		}
		
		if ( stepwise.options.success != null ) {
			stepwise.options.success( event, step );
		}
	
	}
	 
	function Score( data, element ) {
	
		var me = this;
	
		this.title = data.find( "title" ).first().text();
		this.description = data.find( "description" ).first().text();
		this.primaryCredits = data.find( "primaryCredits" ).first().text();
		this.secondaryCredits = data.find( "secondaryCredits" ).first().text();
		this.version = data.find( "version" ).first().text();
		this.element = element;
		
		this.sequences = [];
		this.sequencesById = {};
		var sequence;
		data.find( "sequence" ).each( function() {
			sequence = new Sequence( $( this ), me.element );
			if ( sequence.id == null ) {
				sequence.id = "sequence" + me.sequences.length;
			}
			me.sequences.push( sequence );
			me.sequencesById[ sequence.id ] = sequence;
		});
		
		this.sequenceIndex = 0;
		this.currentSequence = null;
		this.sequenceQueue = [];
		
		this.characters = [];
		this.charactersById = {};
		var character;
		data.find( "character" ).each( function() {
			character = new Character( $( this ), me.element );
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
			location = new Location( $( this ), me.element );
			if ( location.id == null ) {
				location.id = "location" + me.locations.length;
			}
			me.locations.push( location );
			me.locationsById[ location.id ] = location;
		});
		this.currentLocation = new Location( $( '<location id="defaultLocation" lat="0" lon="0">Default Location</location>' ) );
		
		this.currentTemperature = 24;
		this.currentTemperatureUnits = TemperatureUnits.CELSIUS;
		
		this.currentWeather = WeatherConditions.SUNNY;

		this.currentDate = new Date();
		
	}
	
	Score.prototype.init = function() {
	
		var i;
		var n = this.sequences.length;
		for ( i = 0; i < n; i++ ) {
			this.sequences[ i ].init();
		}
	
	}

	Score.prototype.nextStep = function() {
	
		this.updateCurrentSequence();

		//console.log( this.currentSequence.id + ' ' + this.currentSequence.isExhausted );
		 
		// if the sequence hasn't been exhausted, execute its next step
		if ( !this.currentSequence.isExhausted ) { 
			return this.currentSequence.nextStep(); 
		} 
		
		return false;
	
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
	 * Given a sequence, makes it the current sequence.
	 *
	 * @param sequence		The sequence to make current.
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
	
	/**
	 * Given a location, makes it the current location.
	 *
	 * @param location		The location to make current.
	 */
	Score.prototype.setLocation = function( location ) {
	
		var index = this.locations.indexOf( location );
		if ( index != -1 ) {
			this.currentLocation = location;
		}
		
	}
	
	/**
	 * Given a temperature, makes it the current temperature.
	 *
	 * @param temperature		The temperature to make current.
	 */
	Score.prototype.setTemperature = function( temperature, units ) {
		this.currentTemperature = temperature;
		this.currentTemperatureUnits = units;
	}
	
	/**
	 * Given weather conditions, makes them the current weather conditions.
	 *
	 * @param weather		The weather conditions to make current.
	 */
	Score.prototype.setWeather = function( weather ) {
		this.currentWeather = weather;
	}

	/**
	 * Given a date, makes it the current date.
	 *
	 * @param date 			The date to make current.
	 */
	Score.prototype.setDate = function( date ) {
		this.currentDate = date;
	}
	
	function Sequence( data, element ) {
	
		var me = this;

		this.id = $( data ).attr( "id" );
		this.element = element;
		this.shuffle = $( data ).attr( "shuffle" ) == "true" ? true : false;
		this.repeat = false;
		this.count = -1;
		if ( $( data ).attr( "repeat" ) != null ) {
			this.repeat = ( $( data ).attr( "repeat" ) != null );
			this.count = parseInt( $( data ).attr( "repeat" ) );
			if ( isNaN( this.count ) ) {
				this.count = -1; // repeat infinitely
			}
		}
		this.steps = [];
		this.stepIndex = -1;
		this.isCompleted = false;
		this.isExhausted = false;
		this.completions = 0;
		this.usedIndexes = [];
		
		this.steps = [];
		var step;
		data.children().each( function() {
			var step = new Step( $( this ), me.element );
			me.steps.push( step );
		});
		
	}
	
	Sequence.prototype.init = function() {
	
		var i;
		var n = this.steps.length;
		for ( i = 0; i < n; i++ ) {
			this.steps[ i ].init();
		}
	
	}
	 
	Sequence.prototype.reset = function() {
		this.stepIndex = -1; 
		this.isCompleted = false;
	}
	
	Sequence.prototype.nextStep = function() {
	
		var result;

		//console.log( this.id + ' ' + this.isExhausted + ' ' + this.shuffle + ' ' + this.isCompleted );
	  
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

		var plugin = $( this.element ).data( "plugin_stepwise" );

		var i, step,
			n = this.steps.length;

		if ( date == null ) {
			date = plugin.score.currentDate;
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
		WHISPER: "whisper",
		NORMAL: "normal",
		SHOUT: "shout"
	}
	
	var TemperatureUnits = {
		FAHRENHEIT: "fahrenheit",
		CELSIUS: "celsius"
	}
	
	var WeatherConditions = {
		SUNNY: "sunny",
		CLOUDY: "cloudy",
		RAINY: "rainy"
	}
		
	function Step( data, element ) {
	
		var me = this;
	
		this.data = $( data );
		this.element = element;
		this.command = data.prop( "tagName" ).toLowerCase();
		this.itemRef = data.attr( "itemRef" );
		this.content = data.text();
		this.substeps = [];
		
		var step;
		data.children().each( function() {
			var step = new Step( $( this ), me.element );
			me.substeps.push( step );
		});
		
		switch ( this.command ) {
		
			case "speak":
			this.tone = SpeechTone[ data.attr( "tone" ) != null ? data.attr( "tone" ).toUpperCase() : null ];
			if ( this.tone == null ) {
				this.tone = SpeechTone.NORMAL;
			}
			break;
			
			case "settemperature":
			this.units = TemperatureUnits[ data.attr( "units" ) != null ? data.attr( "units" ).toUpperCase() : null ];
			if ( this.units == null ) {
				this.units = TemperatureUnits.CELSIUS;
			}
			break;
			
			case "setweather":
			this.content = WeatherConditions[ content != null ? content.toUpperCase() : null ];
			if ( this.content == null ) {
				this.content = WeatherConditions.SUNNY;
			}
			break;

			case "setdate":
			this.date = new Date( this.content );
			break;

			case "setsequence":
			this.atDate = data.attr( "atDate" );
			this.autoStart = data.attr( "autoStart" ) == "true" ? true : false;
			break;
		
		}
	
	}
	
	Step.prototype.init = function() {
	
		var i, n,
			plugin = $( this.element ).data( "plugin_stepwise" );
	
		switch ( this.command ) {
		
			case "speak":
			case "think":
			this.target = plugin.score.getItemForId( "character", this.data.attr( "character" ) );
			break;
			
			case "setlocation":
			this.target = plugin.score.getItemForId( "location", this.data.text() );
			break;
			
			case "setsequence":
			this.target = plugin.score.getItemForId( "sequence", this.data.text() );
			break;
		
		}

		n = this.substeps.length;
		for ( i = 0; i < n; i++ ) {
			this.substeps[ i ].init();
		}
		
	}
		
	Step.prototype.execute = function() {
		$( this.element ).trigger( "executeStep", this );
		return this;
	}
	
	Step.prototype.executeSubsteps = function() {
		var i;
		var n = this.substeps.length;
		var step;
		for ( i = 0; i < n; i++ ) {
			step = this.substeps[ i ];
			step.execute();
		}
	}
	
	function Character( data, element ) {
	
		this.data = $( data );
		this.element = element;
		this.id = data.attr( "id" );
		this.firstName = data.attr( "firstName" );
		this.lastName = data.attr( "lastName" );
	
	}
	
	function Location( data, element ) {
	
		this.data = $( data );
		this.element = element;
		this.id = data.attr( "id" );
		this.latitude = parseFloat( data.prop( "lat" ) );
		this.longitude = parseFloat( data.attr( "lon" ) );
		this.name = data.text();
	
	}
	
})( jQuery, window, document );
