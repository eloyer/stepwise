using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace Opertoon.Stepwise {
	public class Step {
		
		public string id;
		public XmlNode data;
		public string command;
		public string itemRef;
		public string content;
		public long date;
		public long atDate;
		public bool autoStart;
		public object target;
		public SpeechTone tone;
		public TemperatureUnits units;
		public WeatherConditions weather;
		public List<Step> substeps;
		public Score parentScore;
		
		[HideInInspector]
		public delegate void StepExecuted( Step step );
		[HideInInspector]
		public static event StepExecuted OnStepExecuted;

		public Step( string text, Score score ) {

			parentScore = score;

			command = "narrate";
			content = text;
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
				if ( data.Attributes.GetNamedItem( "tone" ) != null ) {
					tone = (SpeechTone) System.Enum.Parse ( typeof(SpeechTone), data.Attributes.GetNamedItem( "units" ).InnerXml.ToUpper() );
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
				weather = content != null ? (WeatherConditions) System.Enum.Parse ( typeof(WeatherConditions), content.ToUpper() ) : WeatherConditions.SUNNY;
				break;
				
			case "setdate":
				date = DateTime.Parse( content ).Ticks;
				break;
				
			case "setsequence":
				if ( data.Attributes.GetNamedItem( "atDate" ) != null ) {
					atDate = long.Parse( data.Attributes.GetNamedItem( "atDate" ).InnerXml );
				}
				if ( data.Attributes.GetNamedItem( "autoStart" ) != null ) {
					autoStart = data.Attributes.GetNamedItem( "autoStart" ).InnerXml == "true" ? true : false;
				}
				break;
				
			}

		}

		public void Init() {

			int i, n;
			
			switch ( command ) {
				
			case "speak":
			case "think":
				target = parentScore.GetItemForId( "character", data.Attributes.GetNamedItem( "character" ).InnerXml );
				break;
				
			case "setlocation":
				target = parentScore.GetItemForId( "location", content );
				break;

			case "setsequence":
				target = parentScore.GetItemForId( "sequence", content );
				break;
				
			}
			
			n = substeps.Count;
			for ( i = 0; i < n; i++ ) {
				substeps[ i ].Init();
			}

		}

		public Step Execute() {
			HandleStepExecuted( this );  
			return this;
		}
		
		public void HandleStepExecuted( Step step ) {
			if ( OnStepExecuted != null ) {
				OnStepExecuted( step );
			}
		} 

		public void ExecuteSubsteps() {

			int i;
			int n = substeps.Count;
			Step step;

			for ( i = 0; i < n; i++ ) {
				step = substeps[ i ];
				step.Execute();
			}
		}
	}
}