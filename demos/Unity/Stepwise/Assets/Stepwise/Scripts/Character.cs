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
		
		public Character( XmlElement xml, Score score ) {
			data = xml;
			parentScore = score;
			id = xml.Attributes.GetNamedItem( "id" ).InnerXml;
			firstName = xml.Attributes.GetNamedItem( "firstName" ).InnerXml;
			lastName = xml.Attributes.GetNamedItem( "lastName" ).InnerXml;  
			fullName = firstName + (( lastName == "" ) ? "" : " " + lastName );
		}
	}
}
