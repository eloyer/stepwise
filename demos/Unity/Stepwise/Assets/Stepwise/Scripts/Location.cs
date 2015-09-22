﻿using UnityEngine;
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
		
		public Location( XmlElement xml ) {

			data = xml;
			id = xml.Attributes.GetNamedItem( "id" ).InnerXml;
			latitude = float.Parse( xml.Attributes.GetNamedItem( "lat" ).InnerXml );
			longitude = float.Parse( xml.Attributes.GetNamedItem( "lon" ).InnerXml );
			name = xml.Attributes.GetNamedItem( "id" ).InnerText; 	

		}
	}
}
