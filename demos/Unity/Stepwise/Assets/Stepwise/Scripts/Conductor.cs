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
		NORMAL,
		MURMUR,
		WHISPER,
		SHOUT,
		SCREAM
	}
	
	public enum TemperatureUnits {
		FAHRENHEIT,
		CELSIUS
	}

	// adapted from http://openweathermap.org/weather-conditions
	public enum WeatherConditions {
		CLEAR,
		DRIZZLE,
		LIGHTRAIN,
		RAIN,
		HEAVYRAIN,
		THUNDERSTORM,
		SNOW,
		ATMOSPHERE,
		CLOUDS,
		EXTREME,
		ADDITIONAL
	}   

	public class Conductor : MonoBehaviour {

		public TextAsset dataFile;

		[HideInInspector]
		public Score score;

		protected XmlDocument xmlDoc;
		protected Dictionary<float,List<Step>> delayedSteps;
		protected List<float> delayedStepsToRemove;

		[HideInInspector]
		public delegate void ScoreLoading( Conductor conductor );
		[HideInInspector]
		public event ScoreLoading OnScoreLoading;

		[HideInInspector]
		public delegate void ScorePrepared( Score score );
		[HideInInspector]
		public event ScorePrepared OnScorePrepared;

		[HideInInspector]
		public delegate void StepExecuted ( Step step );
		[HideInInspector]
		public event StepExecuted OnStepExecuted;

		// Use this for initialization
		void Start () {

			delayedSteps = new Dictionary<float, List<Step>>();
			delayedStepsToRemove = new List<float>();

			StartCoroutine(Init());

		}

		public IEnumerator Init() {
			yield return 0;
			if (dataFile != null) {
				Debug.Log(Load(dataFile));
			}
		}

		public bool Load( TextAsset file ) {
			if (file != null) {
				return Load (file.text);
			}
			return false;
		}

		public virtual bool Load( string text ) {
			if ( text != null ) {
				try {
					OnScoreLoading(this);
				} catch {
					Debug.Log("Failed during initalization. Do you have an OnScoreLoading handler?");
				}
				if ( text.IndexOf( "<stepwise>" ) != -1 ) {
					xmlDoc = new XmlDocument();
					try {
						xmlDoc.LoadXml( text );
						score = new Score( xmlDoc.DocumentElement );
						score.SetConductor(this);
						score.Init();
						OnScorePrepared(score);
					} catch {
						Debug.Log("Failed during initalization. Do you have an OnScorePrepared handler?");
						return false;
					}
				} else {
					try {
						score = new Score( text );
						score.SetConductor(this);
						OnScorePrepared(score);
					} catch {
						Debug.Log("Failed during initalization. Do you have an OnScorePrepared handler?");
						return false;
					}
				}
			} else {
				return false;
			}
			return true;
		}

		public virtual void Reset() {
			score.Reset();
		}

		public void ScheduleDelayedStep(Step step, float delayInSeconds) {
			float eventTime = Time.time + delayInSeconds;
			if (delayedSteps.ContainsKey(eventTime)) {
				delayedSteps[eventTime].Add(step);
			} else {
				List<Step> steps = new List<Step>();
				steps.Add(step);
				delayedSteps.Add(eventTime, steps);
			}
		}

		public Step NextStep() {
			return score.NextStep(true);
		}

		public void HandleStepExecuted( Step step ) {

			OnStepExecuted (step);

			if ( step.parentScore == score ) {
				switch ( step.command ) {

				case "reset":
					if (step.target is Sequence) {
						((Sequence)step.target).Reset();
					} else {
						Debug.Log("Attempted to reset something that is not a sequence.");
					}
					break;

				case "sample":
					if (step.target is Sequence) {
						((Sequence)step.target).NextStep();
					} else {
						Debug.Log("Attempted to sample something that is not a sequence.");
					}
					break;

				// TODO: implement color handling
					
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

		public void Update() {
			delayedStepsToRemove.Clear();
			int i;
			int n;
			foreach(KeyValuePair<float, List<Step>> p in delayedSteps) {
				if (Time.time >= p.Key) {
					n = p.Value.Count;
					for (i=0; i<n; i++) {
						HandleStepExecuted(p.Value[i]);
					}
					delayedStepsToRemove.Add(p.Key);
				}
			}
			n = delayedStepsToRemove.Count;
			for (i = 0; i < n; i++) {
				delayedSteps.Remove(delayedStepsToRemove[i]);
			}
		}

	}
}
