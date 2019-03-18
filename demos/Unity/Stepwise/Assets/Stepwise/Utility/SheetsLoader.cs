using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using System.Text;
using System.Xml;
using UnityEngine.Networking;
using SimpleJSON;
using System.Text.RegularExpressions;
using System.IO;

namespace Opertoon.Stepwise
{
	[RequireComponent (typeof (Conductor))]
	public class SheetsAction
	{
		public string type;
		public JSONObject config;
		public XmlElement payload;

		public SheetsAction (string actionType)
		{
			type = actionType;
			config = new JSONObject();
		}
	}

	public class SheetsLoader : MonoBehaviour
    {
		public string sheetsURL;

		[TextArea(20,20)]
		public string outputXML;

        private Dictionary<string,XmlElement> _sequencesByCharacter;
        private string[] _restrictedCharacterIds = { "metadata", "pulse", "comments", "instructions" };
        private XmlDocument _script;
		private Conductor _conductor;

        // Use this for initialization
        void Start()
        {
			_conductor = GetComponent<Conductor> ();
			_sequencesByCharacter = new Dictionary<string, XmlElement> ();
			GetXMLFromSheet (sheetsURL, HandleSuccess);
        }

        private void HandleSuccess(XmlDocument document)
        {
            Debug.Log("success");
			StringWriter sw = new StringWriter ();
			XmlTextWriter xw = new XmlTextWriter (sw);
			_script.WriteTo (xw);
			outputXML = sw.ToString ();
			Debug.Log (sw.ToString());
			_conductor.Load (sw.ToString ());
        }

        public void GetXMLFromSheet(string sheetId, HandleXMLFromSheetSuccess success)
        {
            string url;
            // sheetId contains a Google Sheets id
            if (!sheetId.Contains("https://"))
            {
                url = "https://spreadsheets.google.com/feeds/list/" + sheetId + "/1/public/values?alt=json";
            }
            // or a Google Sheets edit URL
            else if (sheetId.Contains("edit#"))
            {
                string[] temp = sheetId.Split('/');
                url = "https://spreadsheets.google.com/feeds/list/" + temp[5] + "/1/public/values?alt=json";
            }
            // otherwise, assume this is a correctly formed Google Sheets JSON URL
            else
            {
                url = sheetId;
            }
            _script = new XmlDocument();
            _script.LoadXml("<stepwise><title>Untitled</title><description></description><primaryCredits></primaryCredits><secondaryCredits></secondaryCredits><version>1</version><sequence id=\"global\" repeat=\"+\"></sequence></stepwise>");
            StartCoroutine(GetJSONFromSheet(url, success));
        }

        private IEnumerator GetJSONFromSheet(string url, HandleXMLFromSheetSuccess success)
        {
            using (UnityWebRequest webRequest = UnityWebRequest.Get(url))
            {
                yield return webRequest.SendWebRequest();
				if (webRequest.isNetworkError || webRequest.isHttpError) {
					Debug.Log ("Error on loading JSON from Google Sheets document.");
				} else {
					JSONNode data = JSON.Parse (webRequest.downloadHandler.text);
					_script.GetElementsByTagName ("title") [0].InnerText = data ["feed"] ["title"] ["$t"];
					_script.GetElementsByTagName ("primaryCredits") [0].InnerText = data ["feed"] ["author"] [0] ["name"] ["$t"];
					JSONArray entry = data ["feed"] ["entry"].AsArray;
					AddMetadataFromEntry (entry [0]);
					AddCharactersFromEntry (entry [0]);
					AddActionsFromEntries (entry);
					TrimTrailingEntrySteps ();
					success (_script);
				}
            }
		}

		private void TrimTrailingEntrySteps ()
		{
			XmlNodeList sequences = _script.GetElementsByTagName ("sequence");
			int n = sequences.Count;
			XmlNode sequence;
			XmlNodeList children;
			XmlNode element;
			int indexOfFirstTrailingEmptyStep;
			int o;
			for (int i = 0; i < n; i++) {
				sequence = sequences [i];
				children = sequence.ChildNodes;
				o = children.Count;
				indexOfFirstTrailingEmptyStep = -1;
				for (int j = 0; j < o; j++) {
					element = children [j];
					if (IsStepEmpty(element)) {
						if (indexOfFirstTrailingEmptyStep == -1) {
							indexOfFirstTrailingEmptyStep = j;
						}
					} else {
						indexOfFirstTrailingEmptyStep = -1;
					}
				}
				if (indexOfFirstTrailingEmptyStep != -1) {
					for (int j = 0; j < o; j++) {
						sequence.RemoveChild (children [j]);
					}
				}
			}
		}

		private bool PropertyIsColumnHeader(string property)
		{
			return property.Contains ("gsx$");
		}

		private bool CharacterIdIsRestricted(string id)
		{
			bool isRestricted = false;
			int n = _restrictedCharacterIds.Length;
			for (int i = 0; i < n; i++) {
				if (_restrictedCharacterIds[i].Contains(id.ToLower())) {
					isRestricted = true;
					break;
				}
			}
			return isRestricted;
		}

		private void AddMetadataFromEntry(JSONNode entry)
		{
			string strA, strB, param, value;
			string [] tempA;
			List<string> tempB;
			XmlElement element;
			foreach (var key in entry.Keys) {
				if (PropertyIsColumnHeader(key)) {
					strA = key.Substring (4);
					switch (strA) {

					case "metadata":
						strB = entry [key] ["$t"];
						tempA = Regex.Split(strB, @",(?=(?:[^""]*""[^""]*"")*[^""]*$)"); // split on commas outside of double quotes
						int n = tempA.Length;
						for (int i = 0; i < n; i++) {
							tempB = new List<string> (tempA[i].Trim().Split(':'));
							param = tempB [0];
							tempB.RemoveAt (0);
							value = String.Join (":", tempB.ToArray ());
							switch (param) {

							case "title":
							case "primaryCredits":
							case "secondaryCredits":
							case "description":
							case "version":
								_script.GetElementsByTagName (param) [0].InnerText = value.Trim ();
								break;

							case "pulse":
								tempA = value.Split ('\\');
								element = _script.CreateElement ("pulse");
								element.SetAttribute ("beatsPerMinute", tempA [0]);
								element.SetAttribute ("pulsesPerBeat", tempA [1]);
								if (tempA.Length > 2) {
									element.SetAttribute ("swing", tempA [2]);
								}
								_script.DocumentElement.AppendChild (element);
								break;
							}
						}
						break;

					case "pulse":
						strB = entry [key] ["$t"];
						tempA = strB.Split ('/');
						element = _script.CreateElement ("pulse");
						element.SetAttribute ("beatsPerMinute", tempA [0]);
						element.SetAttribute ("pulsesPerBeat", tempA [1]);
						if (tempA.Length > 2) {
							element.SetAttribute ("swing", tempA [2]);
						}
						_script.DocumentElement.AppendChild (element);
						break;
					}
				}
			}
		}

		private void AddActionsFromEntries (JSONArray entries)
		{
			int n = entries.Count;
			int o;
			Dictionary<string, List<SheetsAction>> actionsByCharacter;
			XmlElement group;
			XmlElement sequence;
			List<SheetsAction> actions;
			for (int i = 0; i < n; i++) {
				XmlElement globalGroup = _script.CreateElement ("group");
				actionsByCharacter = GetActionsFromEntry (entries [i]);
				foreach (string prop in actionsByCharacter.Keys) {
					if (!_sequencesByCharacter.ContainsKey(prop)) {
						sequence = _script.SelectSingleNode ("//*[@id = 'global']") as XmlElement;
						group = globalGroup;
					} else {
						sequence = _sequencesByCharacter [prop];
						group = _script.CreateElement ("group");
					}
					actions = actionsByCharacter [prop];
					if (actions.Count > 1) {
						o = actions.Count;
						for (int j = 0; j < o; j++) {
							group.AppendChild (actions [j].payload);
						}
					} else if (actions.Count == 1) {
						group.AppendChild (actions [0].payload);
					}
					if (group.ChildNodes.Count > 0) {
						sequence.AppendChild (group);
					}
				}
			}
			// if the first character's actions are part of a custom sequence, then make sure that sequence
			// is the first to be executed by moving the global sequence to the end of the script
			XmlElement firstCharacter = _script.GetElementsByTagName ("character") [0] as XmlElement;
			string firstCharacterId = firstCharacter.GetAttribute ("id");
			if (_sequencesByCharacter.ContainsKey(firstCharacterId)) {
				_script.AppendChild (_script.SelectSingleNode ("//*[@id = 'global']"));
			}
			XmlNodeList groups = _script.GetElementsByTagName ("group");
			XmlElement groupElement;
			n = groups.Count;
			for (int i = 0; i < n; i++) {
				groupElement = groups [i] as XmlElement;
				if (groupElement.ChildNodes.Count == 1) {
					// unwrap the child
					XmlElement parent = groupElement.ParentNode as XmlElement;
					XmlNode child = groupElement.ChildNodes [0];
					parent.ReplaceChild (child, groupElement);
				}
			}
		}

		private Dictionary<string, List<SheetsAction>> GetActionsFromEntry(JSONNode entry)
		{
			SheetsAction action;
			string id;
			XmlElement element;
			XmlNodeList nodes;
			Dictionary<string, List<SheetsAction>> actionsByCharacter = new Dictionary<string, List<SheetsAction>> ();
			foreach (var prop in entry.Keys) {
				if (PropertyIsCharacterId(prop)) {
					id = GetCharacterIdFromProperty (prop);
					actionsByCharacter [id] = new List<SheetsAction> ();
					if (entry[prop] != null) {
						if (entry[prop]["$t"] == " ") {
							action = new SheetsAction ("command");
							action.payload = _script.CreateElement ("nothing");
							action.payload.SetAttribute ("character", id);
							action.payload.SetAttribute ("explicit", "true");
							actionsByCharacter [id].Add (action);
						} else if (entry[prop]["$t"] == "") {
							action = new SheetsAction ("command");
							action.payload = _script.CreateElement ("nothing");
							action.payload.SetAttribute ("character", id);
							actionsByCharacter [id].Add (action);
						} else {
							string cell = entry [prop] ["$t"].ToString ();
							if (cell != "") {
								cell = cell.Substring (1, Mathf.Max (0, cell.Length - 2)); // remove outer quotes
								cell = cell.Replace ("\\n", "\n");
								string [] subActions = cell.Split (new char [] { '\n' });
								int n = subActions.Length;
								for (int i = 0; i < n; i++) {
									action = GetActionFromCell (subActions [i]);
									if (action != null) {
										switch (action.type) {
										case "config":
											foreach (var index in _sequencesByCharacter.Keys) {
												nodes = _sequencesByCharacter [index].GetElementsByTagName ("nothing");
												foreach (XmlElement node in nodes) {
													node.SetAttribute ("explicit", "true");
												}
											}
											element = _script.CreateElement ("sequence");
											_script.DocumentElement.AppendChild (element);
											_sequencesByCharacter [id] = element;
											if (action.config ["shuffle"].AsBool) {
												element.SetAttribute ("shuffle", "true");
											}
											if (action.config ["visible"] != null) {
												element = _script.SelectSingleNode ("//*[@id = '" + id + "']") as XmlElement;
												element.SetAttribute ("visible", action.config ["visible"] ? "true" : "false");
											}
											if (action.config ["repeat"] != null) {
												element.SetAttribute ("repeat", action.config ["repeat"]);
											}
											if (action.config ["grouping"] != null) {
												element.SetAttribute ("grouping", action.config ["grouping"]);
											}
											if (action.config ["id"] != null) {
												element.SetAttribute ("id", action.config ["id"]);
											}
											break;
										case "command":
										case "utterance":
											action.payload.SetAttribute ("character", id);
											actionsByCharacter [id].Add (action);
											break;
										}
									}
								}
							}
						}
					}
				}
			}
			return actionsByCharacter;
		}

		private bool PropertyIsCharacterId(string property)
		{
			return (property.IndexOf ("gsx$") != -1 && !CharacterIdIsRestricted (property.Substring (4)));
		}

		private string GetCharacterIdFromProperty(string property)
		{
			string str = property.Substring (4);
			if (!GetCharacterVisibilityFromProperty(property)) {
				str = str.Substring (0, str.Length - 7);
			}
			return str;
		}

		private bool GetCharacterVisibilityFromProperty(string property)
		{
			return !(property.IndexOf ("-hidden") == (property.Length - 7));
		}

		private SheetsAction GetActionFromCell(string cell)
		{
			if (cell != "") {
				if (cell != "") {
					List<string> tempA, tempB;
					string command, param, value, content, source;
					bool append = false;
					if (cell [0] == '$') {
						tempA = new List<string> (cell.Split (':'));
						command = tempA [0].ToLower ();
						tempA.RemoveAt (0);
						content = source = String.Join (":", tempA.ToArray ());
					} else {
						command = "$speak";
						content = source = cell;
					}

					if (command != "$sequence") {
						Regex contentMatch = new Regex (@"[^+@=]*");
						Match contentResults = contentMatch.Match (content);
						if (contentResults.Success) {
							content = contentResults.Value;
						}
                        if (content.Length > 0)
                        {
                            if (content[0] == '&')
                            {
                                append = true;
                                content = content.Substring(1);
                            }
                        }
					}

					float delay = Single.NaN;
					Regex delayMatch = new Regex (@"\+([\d])*(.[\d]*)(?![^+@=])");
					Match delayResults = delayMatch.Match (source);
					if (delayResults.Success) {
						delay = float.Parse (delayResults.Value);
					}

					string tone = null;
					Regex toneMatch = new Regex (@"@[^+@=]+");
					Match toneResults = toneMatch.Match (source);
					if (toneResults.Success) {
						tone = toneResults.Value.Substring (1);
					}

					string duration = null;
					Regex durationmatch = new Regex (@"=[^@+=]+");
					Match durationResults = durationmatch.Match (source);
					if (durationResults.Success) {
						duration = durationResults.Value.Substring (1);
					}

					XmlElement script = null;
					SheetsAction action;
					int n;
					switch (command) {
					case "$sequence":
						tempA = new List<string> (content.Split (','));
						action = new SheetsAction ("config");
						action.config ["shuffle"] = false;
						n = tempA.Count;
						for (int i = 0; i < n; i++) {
							tempB = new List<string> (tempA [i].Trim ().Split (':'));
							param = tempB [0];
							tempB.RemoveAt (0);
							value = String.Join (":", tempB.ToArray ());
							switch (param) {
							case "shuffle":
								action.config ["shuffle"] = true;
								break;
							case "hidden":
								action.config ["visible"] = false;
								break;
							case "repeat":
								action.config ["repeat"] = value.Trim ();
								if (action.config ["repeat"] == "forever") {
									action.config ["repeat"] = "+";
								}
								break;
							case "grouping":
								action.config ["grouping"] = value.Trim ();
								break;
							case "id":
								action.config ["id"] = value.Trim ();
								break;
							}
						}
						break;

					case "$sample":
					case "$reset":
						script = _script.CreateElement (command.Substring (1));
						script.InnerXml = content;
						action = new SheetsAction ("command");
						break;

					case "$setbackcolor":
					case "$setdate":
					case "$setforecolor":
					case "$setmidcolor":
					case "$settime":
					case "$setweather":
						script = _script.CreateElement (command.Substring (1));
						action = new SheetsAction ("command");
						break;

					case "$option":
						tempA = new List<string> (content.Split (','));
						content = tempA [0];
						script = _script.CreateElement (command.Substring (1));
						script.InnerXml = content;
						action = new SheetsAction ("command");
						action.config ["type"] = null;
						action.config ["destination"] = null;
						n = tempA.Count;
						for (int i = 0; i < n; i++) {
							tempB = new List<string> (tempA [i].Trim ().Split (':'));
							param = tempB [0];
							tempB.RemoveAt (0);
							value = String.Join (":", tempB.ToArray ());
							switch (param) {
							case "type":
								action.config ["type"] = value;
								break;
							case "destination":
								action.config ["destination"] = value;
								break;
							}
						}
						if (action.config ["type"] != null) {
							script.SetAttribute ("type", action.config ["type"]);
						}
						if (action.config ["destination"] != null) {
							script.SetAttribute ("destination", action.config ["destination"]);
						}
						break;

					case "$setsequence":
						tempA = new List<string> (content.Split (','));
						content = tempA [0];
						script = _script.CreateElement (command.Substring (1));
						script.InnerXml = content;
						action = new SheetsAction ("command");
						action.config ["atdate"] = null;
						action.config ["autostart"] = false;
						n = tempA.Count;
						for (int i = 0; i < n; i++) {
							tempB = new List<string> (tempA [i].Trim ().Split (':'));
							param = tempB [0];
							tempB.RemoveAt (0);
							value = String.Join (":", tempB.ToArray ());
							switch (param) {
							case "atdate":
								action.config ["atdate"] = value;
								break;
							case "autostart":
								action.config ["autostart"] = true;
								break;
							}
						}
						if (action.config ["autostart"]) {
							script.SetAttribute ("autostart", action.config ["autostart"]);
						}
						if (action.config ["atdate"] != null) {
							script.SetAttribute ("atdate", action.config ["atdate"]);
						}
						break;

					case "$sing":
					case "$speak":
					case "$nothing":
						script = _script.CreateElement (command.Substring (1));
						action = new SheetsAction ("utterance");
						break;

					default:
						script = _script.CreateElement (command.Substring (1));
						action = new SheetsAction ("command");
						break;
					}
					if (script != null) {
						script.InnerXml = content;
						if (append) {
							script.SetAttribute ("append", "true");
						}
						if (!Single.IsNaN (delay)) {
							script.SetAttribute ("delay", delay.ToString ());
						}
						if (tone != null) {
							tone = ParseTone (tone);
							script.SetAttribute ("tone", tone);
						}
						if (duration != null) {
							script.SetAttribute ("duration", duration);
						}
						action.payload = script;
					}
					return action;
				}
			}
			return null;
		}

		private bool IsStepEmpty (XmlNode step)
		{
			return false;
		}

		private void AddCharactersFromEntry (JSONNode entry)
		{
			string id;
			XmlElement character;
			List<string> characterIds = new List<string> ();
			foreach (var i in entry.Keys) {
				if (PropertyIsColumnHeader(i)) {
					id = GetCharacterIdFromProperty (i);
					if (characterIds.IndexOf(id) == -1 && !CharacterIdIsRestricted(id)) {
						character = _script.CreateNode ("element", "character", "") as XmlElement;
						character.SetAttribute ("id", id);
						character.SetAttribute ("firstName", id);
						if (!GetCharacterVisibilityFromProperty(i)) {
							character.SetAttribute ("visible", "false");
						}
						_script.DocumentElement.AppendChild (character);
						characterIds.Add (id);
					}
				}
			}
		}

		private string ParseTone(string tone)
		{
			switch (tone) {

			case "pp":
			case "ppp":
				tone = "whisper";
				break;

			case "p":
				tone = "murmur";
				break;

			case "mp":
			case "mf":
				tone = "normal";
				break;

			case "f":
				tone = "shout";
				break;

			case "ff":
			case "fff":
				tone = "scream";
				break;

			}
			return tone;
		}
    }
}

public delegate void HandleXMLFromSheetSuccess(XmlDocument document);