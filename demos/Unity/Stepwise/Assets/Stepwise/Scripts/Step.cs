using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace Opertoon.Stepwise {

	[Serializable]
	public class Step {
		
		public string id;
		public Score parentScore;
		public string type;
		public XmlNode data;
		public string command;
		public string itemRef;
		public string content;
		public DateTime date;
		public DateTime atDate;
		public bool autoStart;
		public object target;
		public SpeechTone tone;
		public TemperatureUnits units;
		public WeatherConditions weather;
		public float delay;
		public List<Step> substeps;
		public bool isSubstep;
		public bool append;
		public object destination;

		public Step( string text, Score score ) {

			parentScore = score;

			command = "narrate";
			content = text;
			tone = SpeechTone.NORMAL;
			delay = 0;
			substeps = new List<Step>();

			ParseCommand();

		}

		public Step( XmlElement xml, Score score ) {

			int i, n;
			XmlNodeList elements;
			Step step;

			data = xml;
			command = data.Name.ToLower();
			if ( data.Attributes.GetNamedItem( "itemRef" ) != null ) {
				itemRef = data.Attributes.GetNamedItem( "itemRef" ).InnerXml;
			}
			if ( data.Attributes.GetNamedItem( "append" ) != null ) {
				append = data.Attributes.GetNamedItem( "append" ).InnerXml == "true" ? true : false;
			}
			if ( data.Attributes.GetNamedItem( "delay" ) != null ) {
				delay = float.Parse( data.Attributes.GetNamedItem( "delay" ).InnerXml ) * .001f;
			}
			if ( data.Attributes.GetNamedItem( "type" ) != null ) {
				type = data.Attributes.GetNamedItem( "type" ).InnerXml;
			}

			content = data.InnerText;
			parentScore = score;

			elements = xml.ChildNodes;
			n = elements.Count;
			substeps = new List<Step>();
			for ( i = 0; i < n; i++ ) {
				if ( elements[ i ].NodeType == XmlNodeType.Element ) {
					step = new Step( ( XmlElement ) elements[ i ], parentScore );
					substeps.Add( step );
				}
			}
			ParseCommand();
		}

		public void ParseCommand() {

			switch ( command ) {
				
			case "speak":
			case "sing":
				if ( data.Attributes.GetNamedItem( "tone" ) != null ) {
					tone = (SpeechTone) System.Enum.Parse ( typeof(SpeechTone), data.Attributes.GetNamedItem( "tone" ).InnerXml.ToUpper() );
				} else {
					tone = SpeechTone.NORMAL;
				}
				break;
				
			case "settemperature":
				if ( data.Attributes.GetNamedItem( "units" ) != null ) {
					units = (TemperatureUnits) System.Enum.Parse ( typeof(TemperatureUnits), data.Attributes.GetNamedItem( "units" ).InnerXml.ToUpper() );
				} else {
					units = TemperatureUnits.CELSIUS;
				}
				break;
				
			case "setweather":
				weather = content != null ? (WeatherConditions) System.Enum.Parse ( typeof(WeatherConditions), content.ToUpper() ) : WeatherConditions.CLEAR;
				break;
				
			case "setdate":
			case "settime":
				date = DateTime.Parse( content );
				break;

			case "setsequence":
				if ( data.Attributes.GetNamedItem( "atDate" ) != null ) {
					atDate = DateTime.Parse( data.Attributes.GetNamedItem( "atDate" ).InnerXml );
				}
				if ( data.Attributes.GetNamedItem( "autoStart" ) != null ) {
					autoStart = data.Attributes.GetNamedItem( "autoStart" ).InnerXml == "true" ? true : false;
				}
				break;
				
			}

		}

		public void Init() {
			Init ( false );
		}

		public void Init( bool substep ) {

			int i, n;

			isSubstep = substep;
			
			switch ( command ) {

			case "narrate":
				target = new Character(); // perhaps this should be changed to actual narrator character?
				break;
				
			case "speak":
			case "think":
			case "sing":
				target = parentScore.GetItemForId( "character", data.Attributes.GetNamedItem( "character" ).InnerXml );
				(target as Character).SetVisibilityForStep(this);
				break;
				
			case "setlocation":
				target = parentScore.GetItemForId( "location", content );
				break;

			case "setsequence":
			case "sample":
			case "reset":
				target = parentScore.GetItemForId( "sequence", content );
				break;

			case "option":
				target = parentScore.GetItemForId( "character", data.Attributes.GetNamedItem( "character" ).InnerXml);
				switch (type) {

				case "sequence":
					destination = parentScore.GetItemForId( "sequence", data.Attributes.GetNamedItem( "destination" ).InnerXml);
					break;

				case "url":
					destination = data.Attributes.GetNamedItem( "destination" ).InnerXml;
					break;

				}
				break;

			default:
				if ( data.Attributes.GetNamedItem( "character" ) != null ) {
					target = parentScore.GetItemForId( "character", data.Attributes.GetNamedItem( "character" ).InnerXml);
				} else {
					target = new Character();
				}
				break;
			}
			
			n = substeps.Count;
			for ( i = 0; i < n; i++ ) {
				substeps[ i ].Init( true );
			}

		}

		public Step Execute() {
			if (delay == 0) {
				parentScore.parentConductor.HandleStepExecuted (this);
			} else {
				parentScore.parentConductor.ScheduleDelayedStep(this, (delay * parentScore.pulse * (1.0f / (parentScore.timeScale + .0001f))));
			}
			return this;
		}

		public void ExecuteSubsteps() {
			int n = substeps.Count;
			for (int i = 0; i < n; i++) {
				substeps[i].Execute();
			}
		}
	}
}