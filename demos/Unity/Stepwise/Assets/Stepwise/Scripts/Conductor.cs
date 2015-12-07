﻿using UnityEngine;
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
				if ( text.IndexOf( "<stepwise>" ) != -1 ) {
					xmlDoc = new XmlDocument();
					try {
						xmlDoc.LoadXml( text );
						score = new Score( xmlDoc.DocumentElement );
						score.Init();
					}
					catch {
						return false;
					}
				} else {
					score = new Score( text );
				}
			} else {
				return false;
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
