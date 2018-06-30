using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace Opertoon.Stepwise {
	public class Character {
		
		public string id;
		public XmlElement data;
		public string firstName;
		public string lastName;
		public string fullName;
		public Score parentScore;
		public bool visible = true;

		public Character() {
			
		}
		
		public Character( XmlElement xml, Score score ) {
			data = xml;
			parentScore = score;
			id = xml.Attributes.GetNamedItem( "id" ).InnerXml;
			if ( data.Attributes.GetNamedItem( "firstName" ) != null ) {
				firstName = xml.Attributes.GetNamedItem( "firstName" ).InnerXml;
			} else if ( data.Attributes.GetNamedItem( "firstname" ) != null ) {
					firstName = xml.Attributes.GetNamedItem( "firstname" ).InnerXml;
			}
			if ( data.Attributes.GetNamedItem( "lastName" ) != null ) {
				lastName = xml.Attributes.GetNamedItem( "lastName" ).InnerXml; 
			} else if ( data.Attributes.GetNamedItem( "lastname" ) != null ) {
				lastName = xml.Attributes.GetNamedItem( "lastname" ).InnerXml;
			}
			fullName = firstName + (( lastName == "" || lastName == null ) ? "" : " " + lastName );
			if ( data.Attributes.GetNamedItem( "visible" ) != null ) {
				visible = xml.Attributes.GetNamedItem( "visible" ).InnerXml == "true" ? true : false;  
			}
		}

		public void SetVisibilityForStep(Step step) {
			if (visible) {
				switch (step.command) {
				case "speak":
				case "think":
				case "sing":
				case "option":
					visible = true;
					break;
				}
			}
		}
	}
}
