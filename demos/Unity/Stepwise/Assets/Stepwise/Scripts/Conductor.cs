using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using System.IO;

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

		private XmlDocument xmlDoc;
		private Score score;
		
		// Use this for initialization
		void Start () {

			if ( dataFile != null ) {
				Load( dataFile );
			}

			Step.OnStepExecuted += HandleStepExecuted;

		}
		
		public void Load( TextAsset file ) {

			if ( file != null ) {
				xmlDoc = new XmlDocument();
				xmlDoc.LoadXml( dataFile.text );
				score = new Score( xmlDoc.DocumentElement );
				score.Init();
			}
			
		}

		public Step NextStep() {
			return score.NextStep();
		}

		public void HandleStepExecuted( Step step ) {
			
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
