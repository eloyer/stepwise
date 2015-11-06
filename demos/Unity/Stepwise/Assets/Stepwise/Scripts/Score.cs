using UnityEngine;
using UnityEngine.UI;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace Opertoon.Stepwise {
	public class Score {

		public string title;
		public string description;
		public string primaryCredits;
		public string secondaryCredits;
		public string version;
		public Sequence[] sequences;
		public Hashtable sequencesById;
		public int sequenceIndex = 0;
		public Sequence currentSequence;
		public List<Sequence> sequenceQueue;
		public Character[] characters;
		public Hashtable charactersById;
		public Location[] locations;
		public Hashtable locationsById;
		public Location currentLocation;
		public float currentTemperature;
		public TemperatureUnits currentTemperatureUnits;
		public WeatherConditions currentWeather;
		public long currentDate;

		public Score() {

			sequenceQueue = new List<Sequence>();

			XmlDocument doc = new XmlDocument();
			doc.LoadXml( "<location id=\"defaultLocation\" lat=\"0\" lon=\"0\">Default Location</location>" );
			currentLocation = new Location( doc.DocumentElement );
			
			currentTemperature = 24f;
			currentTemperatureUnits = TemperatureUnits.CELSIUS;
			
			currentWeather = WeatherConditions.SUNNY;
			
			currentDate = DateTime.Now.Ticks;

		}

		public Score( XmlElement xml ) {

			int i, n;
			XmlNodeList elements;
			Sequence sequence;
			Character character;
			Location location;

			sequenceQueue = new List<Sequence>();

			elements = xml.GetElementsByTagName( "title" );
			if ( elements.Count > 0 ) {
				title = elements[ 0 ].InnerText;
			}
			
			elements = xml.GetElementsByTagName( "description" );
			if ( elements.Count > 0 ) {
				description = elements[ 0 ].InnerText;
			}
			
			elements = xml.GetElementsByTagName( "primaryCredits" );
			if ( elements.Count > 0 ) {
				primaryCredits = elements[ 0 ].InnerText;
			}
			
			elements = xml.GetElementsByTagName( "secondaryCredits" );
			if ( elements.Count > 0 ) {
				secondaryCredits = elements[ 0 ].InnerText;
			}
			
			elements = xml.GetElementsByTagName( "version" );
			if ( elements.Count > 0 ) {
				version = elements[ 0 ].InnerText;
			}

			elements = xml.GetElementsByTagName( "sequence" );
			n = elements.Count;
			sequences = new Sequence[ n ];
			sequencesById = new Hashtable();
			for ( i = 0; i < n; i++ ) {
				sequence = new Sequence( ( XmlElement ) elements[ i ], this );
				sequences[ i ] = sequence;
				if ( sequence.id == null ) {
					sequence.id = "sequence" + i;
				}
				sequencesById[ sequence.id ] = sequence;
			}
			
			elements = xml.GetElementsByTagName( "character" );
			n = elements.Count;
			characters = new Character[ n ];
			charactersById = new Hashtable();
			for ( i = 0; i < n; i++ ) {
				character = new Character( ( XmlElement ) elements[ i ], this );
				characters[ i ] = character;
				if ( character.id == null ) {
					character.id = "character" + i;
				}
				charactersById[ character.id ] = character;
			}
			
			elements = xml.GetElementsByTagName( "location" );
			n = elements.Count;
			locations = new Location[ n ];
			locationsById = new Hashtable();
			for ( i = 0; i < n; i++ ) {
				location = new Location( ( XmlElement ) elements[ i ] );
				locations[ i ] = location;
				if ( location.id == null ) {
					location.id = "location" + i;
				}
				locationsById[ location.id ] = location;
			}
			XmlDocument doc = new XmlDocument();
			doc.LoadXml( "<location id=\"defaultLocation\" lat=\"0\" lon=\"0\">Default Location</location>" );
			currentLocation = new Location( doc.DocumentElement );
			
			currentTemperature = 24f;
			currentTemperatureUnits = TemperatureUnits.CELSIUS;
			
			currentWeather = WeatherConditions.SUNNY;
			
			currentDate = DateTime.Now.Ticks;

		}

		public virtual void Init() {
			int i;
			int n = sequences.Length;
			for ( i = 0; i < n; i++ ) {
				sequences[ i ].Init();
			}
		}
		
		public virtual void Reset() {
			
			int i;
			int n = sequences.Length;
			for ( i = 0; i < n; i++ ) {
				sequences[ i ].Reset();
			}
			
			sequenceIndex = 0;
			currentSequence = null;
			sequenceQueue.Clear();
		}    

		public virtual Step NextStep() {

			Step step = null;

			UpdateCurrentSequence();

			// Debug.Log( currentSequence.id + " " + currentSequence.isExhausted );
			
			// if the sequence hasn't been exhausted, execute its next step
			if ( !currentSequence.isExhausted ) { 
				step = currentSequence.NextStep(); 
			} 
			
			return step;

		}

		public virtual void UpdateCurrentSequence() {

			Sequence sequence;

			//Debug.Log ( "next step for score" );
			
			// if there are sequences in the queue, get the current one
			if ( sequenceQueue.Count > 0 ) { 
				sequence = sequenceQueue[ sequenceQueue.Count - 1 ]; 
				
				// if it's already completed, then
				if ( sequence.isCompleted ) {
					
					// remove it from the queue
					if ( sequenceQueue.Count > 0) {
						sequenceQueue.RemoveAt( sequenceQueue.Count - 1 );
					}
					
					// if there's still a queue, then grab the next sequence from it
					if ( sequenceQueue.Count > 0 ) {
						sequence = sequenceQueue[ sequenceQueue.Count - 1 ];
						
						// otherwise, grab the current non-queue sequence
					} else {
						sequence = sequences[ sequenceIndex ]; 
					}
				} 
				
				// grab the current non-queue sequence
			} else {
				sequence = sequences[ sequenceIndex ];
			}
			
			//Debug.Log( "current sequence: " + sequence.id );
			
			// if the sequence hasn't been exhausted, make it current
			if ( !sequence.isExhausted ) { 
				currentSequence = sequence;
			}

		}

		/**
		 * Given a sequence, makes it the current sequence.
		 *
		 * @param sequence		The sequence to make current.
		 * @param atDate		If specified, will attempt to cue up the sequence to the same date.
		 * @param autoStart		If true, the sequence will automatically play its first step.
		 */
		public virtual void SetSequence( Sequence sequence, bool autoStart ) {
			SetSequence( sequence, 0, autoStart );
		}

		public virtual void SetSequence( Sequence sequence, long atDate, bool autoStart ) {

			//Debug.Log ( "set sequence: " + sequence.id + " " + autoStart );

			int index = Array.IndexOf( sequences, sequence );
			if ( index != -1 ) {
				sequenceIndex = index;
				currentSequence = sequence;
				if ( atDate != 0 ) {
					currentSequence.MatchDate( atDate );
				}
				if ( autoStart ) {
					currentSequence.NextStep();
				}
			}

		}

		public virtual void PlaySequence( Sequence sequence ) {
			currentSequence = sequence;
			sequenceQueue.Add( sequence );
			sequence.NextStep();
		}

		/**
		 * Given an id and a type, returns the corresponding object.
		 *
		 * @param	type	The type of item to be retrieved.
		 * @param	id		The id of the sequence to be retrieved.
		 */
		public virtual object GetItemForId( string type, string id ) {

			switch ( type ) {
				
			case "character":
				return charactersById[ id ];
				
			case "location":
				return locationsById[ id ];
				
			case "sequence":
				return sequencesById[ id ];

			default:
				return null;
				
			}

		}

		/**
		 * Given a location, makes it the current location.
		 *
		 * @param location		The location to make current.
		 */
		public virtual void SetLocation( Location location ) {
			int index = Array.IndexOf( locations, location );
			if ( index != -1 ) {
				currentLocation = location;
			}
		}

		/**
		 * Given a temperature, makes it the current temperature.
		 *
		 * @param temperature		The temperature to make current.
		 */
		public virtual void SetTemperature( float temperature, TemperatureUnits units ) {
			currentTemperature = temperature;
			currentTemperatureUnits = units;
		}

		/**
		 * Given weather conditions, makes them the current weather conditions.
		 *
		 * @param weather		The weather conditions to make current.
		 */
		public virtual void SetWeather( WeatherConditions weather ) {
			currentWeather = weather;
		}

		/**
		 * Given a date, makes it the current date.
		 *
		 * @param date 			The date to make current.
		 */
		public virtual void SetDate( long dateTicks ) {
			currentDate = dateTicks;
		}

	}
}
