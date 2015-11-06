using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;
using System;

namespace Opertoon.Stepwise {

	public enum SpeechTone {
		WHISPER,
		NORMAL,
		SHOUT
	}
	
	public enum TemperatureUnits {
		FAHRENHEIT,
		CELSIUS
	}
	
	public enum WeatherConditions {
		SUNNY,
		CLOUDY,
		RAINY
	}   

	public class Conductor : MonoBehaviour {

		public TextAsset dataFile;

		[HideInInspector]
		public Score score;

		protected XmlDocument xmlDoc;

		// Use this for initialization
		void Start () {

			if ( dataFile != null ) {
				Load( dataFile );
			}

			Step.OnStepExecuted += HandleStepExecuted;

		}
		
		public virtual bool Load( TextAsset file ) {

			if ( file != null ) {
				return Load ( file.text );
			}

			return false;
		}

		public virtual bool Load( string text ) {
			
			if ( text != null ) {
				xmlDoc = new XmlDocument();
				try {
					xmlDoc.LoadXml( text );
					score = new Score( xmlDoc.DocumentElement );
					score.Init();
				}
				catch {
					return false;
				}
			}

			return true;
		}

		public virtual bool LoadPlainText( string text ) {

			if ( text != null ) {

				score = new Score();
				string[] lines = text.Split( new string[] { "\r\n", "\n" }, StringSplitOptions.None );

				if ( lines.Length > 0 ) {
					score.title = lines[ 0 ].Trim();
				}
				if ( lines.Length > 1 ) {
					score.primaryCredits = lines[ 1 ].Trim ();
				}
				if ( lines.Length > 2 ) {
					score.description = lines[ 2 ].Trim ();
				}

				if ( score.title == "" ) {
					score.title = "Untitled";
				}
				if ( score.primaryCredits == "" ) {
					score.primaryCredits = "Author unknown";
				}

				int i;
				int n = lines.Length;
				string line;
				string lineLower;
				string key;
				for ( i = 0; i < n; i++ ) {

					line = lines[ i ];
					lineLower = line.ToLower();

					key = "stepwise.title:";
					if ( lineLower.StartsWith( key ) ) {
						score.title = line.Remove( 0, key.Length );
					}
					key = "stepwise.credit:";
					if ( lineLower.StartsWith( key ) ) {
						score.primaryCredits = line.Remove( 0, key.Length );
					}
					key = "stepwise.description:";
					if ( lineLower.StartsWith( key ) ) {
						score.description = line.Remove( 0, key.Length );
					}
				}

				score.sequences = new Sequence[ 1 ];
				Sequence sequence = new Sequence( text, score );
				score.sequences[ 0 ] = sequence;
				score.sequencesById = new Hashtable();
				score.sequencesById[ sequence.id ] = sequence;
				score.Init();
			}

			return true;
		}

		public virtual void Reset() {
			score.Reset();
		}

		public virtual Step NextStep() {
			return score.NextStep();
		}

		public virtual void HandleStepExecuted( Step step ) {
			
			if ( step.parentScore == score ) {
				switch ( step.command ) {
					
				case "setdate":
					score.SetDate( step.date );
					break;
					
				case "setlocation":
					score.SetLocation( ( Location ) step.target );
					break;
					
				case "setsequence":
					score.SetSequence( ( Sequence ) step.target, step.atDate, step.autoStart );
					break;
					
				case "settemperature":
					score.SetTemperature( float.Parse ( step.content ), step.units );
					break;
					
				case "setweather":
					score.SetWeather( step.weather );
					break;
					
				case "group":
					step.ExecuteSubsteps();
					break;
					
				}
			}

		}

	}
}
