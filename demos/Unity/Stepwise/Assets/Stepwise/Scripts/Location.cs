using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace Opertoon.Stepwise {
	public class Location {
		
		public string id;
		public XmlElement data;
		public float latitude;
		public float longitude;
		public string name;
		public Score parentScore;

		public Location( XmlElement xml, Score score ) {
			data = xml;
			parentScore = score;
			id = xml.Attributes.GetNamedItem( "id" ).InnerXml;
			latitude = float.Parse( xml.Attributes.GetNamedItem( "lat" ).InnerXml );
			longitude = float.Parse( xml.Attributes.GetNamedItem( "lon" ).InnerXml );
			name = xml.InnerText; 	
		}
	}
}
