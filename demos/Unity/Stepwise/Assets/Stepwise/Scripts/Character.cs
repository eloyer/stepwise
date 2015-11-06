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
		public Score parentScore;
		
		public Character( XmlElement xml, Score score ) {

			parentScore = score;

			data = xml;
			id = xml.Attributes.GetNamedItem( "id" ).InnerXml;
			firstName = xml.Attributes.GetNamedItem( "firstName" ).InnerXml;
			lastName = xml.Attributes.GetNamedItem( "lastName" ).InnerXml;  

		}
	}
}
