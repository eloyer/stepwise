using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace Opertoon.Stepwise {
	public class Sequence {

		public string id;
		public bool shuffle = false;
		public bool repeat = false;
		public int count = -1;
		public Step[] steps;
		public int stepIndex = -1;
		public bool isCompleted = false;
		public bool isExhausted = false;
		public int completions = 0;
		public List<int> usedIndexes;
		public Score parentScore;
		public float percentCompleted = 0f;

		public Sequence( XmlElement xml, Score score ) {

			int i, n;
			XmlNode attr;
			XmlNodeList elements;
			Step step;

			parentScore = score;
			
			attr = xml.Attributes.GetNamedItem( "id" );
			if ( attr != null ) {
				id = attr.InnerXml;
			}

			attr = xml.Attributes.GetNamedItem( "shuffle" );
			if ( attr != null ) {
				shuffle = attr.InnerXml == "true" ? true : false;
			}

			attr = xml.Attributes.GetNamedItem( "repeat" );
			if ( attr != null ) {
				repeat = true;
				if ( !int.TryParse( attr.InnerXml, out count ) ) {
					count = -1; // repeat infinitely
				}
			}

			usedIndexes = new List<int>();

			elements = xml.ChildNodes;
			n = elements.Count;
			steps = new Step[ n ];
			for ( i = 0; i < n; i++ ) {
				step = new Step( ( XmlElement ) elements[ i ], parentScore );
				steps[ i ] = step;
			}

		}

		public void Init() {

			int i;
			int n = steps.Length;
			for ( i = 0; i < n; i++ ) {
				steps[ i ].Init();
			}

		}

		public void Reset() {
			stepIndex = -1;
			isCompleted = false;
			percentCompleted = 0f;
		}

		public Step NextStep() {

			Step result = null;
			
			//Debug.Log( id + " " + isExhausted + " " + shuffle + " " + isCompleted );
			
			// if the sequence hasn't been exhausted, then
			if ( !isExhausted ) {
				
				// if the sequence is not shuffled, then
				if ( !shuffle ) { 
					
					// if the sequence has been completed and is set to repeat, then restart it
					if ( isCompleted && repeat ) { 
						//Debug.Log( "sequence was completed; resetting" );
						Reset();
					}
					
					stepIndex++;
					result = steps[ stepIndex ].Execute(); 

					percentCompleted = ( float )stepIndex / ( float )steps.Length;

					//Debug.Log( "step " + stepIndex );
					
					// if this is the last step in the sequence, then
					if ( stepIndex >= ( steps.Length - 1 )) { 
						completions++; 
						
						//Debug.Log( "sequence " + id + " reached its end" );
						
						// if the sequence is set to repeat, then
						if ( repeat ) {   
							//Debug.Log( "this is a repeating sequence" );
							
							if ( count > -1 ) {
								//Debug.Log( "a count has been specified" );
								if ( completions >= count ) {  
									//Debug.Log( "the count has been exhausted" );
									isExhausted = true;
								} else { 
									//Debug.Log( "resetting for another round" );
									Reset();
								}
							} else {
								//Debug.Log( "no count specified; resetting for another round" );
								Reset();
							}
							
							// otherwise, if the sequence is not set to repeat, then mark it as completed
						} else { 
							//Debug.Log( "this is a non-repeating sequence" );
							
							if ( count > -1 ) {
								//Debug.Log( "a count has been specified" );
								if ( completions >= count ) {
									//Debug.Log( "the count has been exhausted" );
									isExhausted = true;
								} else { 
									//Debug.Log( "the sequence is completed" );
									isCompleted = true;
								}
							} else { 
								//Debug.Log( "no count specified; sequence is completed" );
								isCompleted = true;
								isExhausted = true;
							}
						} 
					}

					// shuffled playback
				} else {
					//Debug.Log( "this is a shuffled sequence" );
					do {
						stepIndex = ( int ) Mathf.Floor( Random.value * steps.Length );
					} while ( usedIndexes.IndexOf( stepIndex ) != -1 );
					usedIndexes.Add( stepIndex );
					if ( usedIndexes.Count >= steps.Length ) {
						//Debug.Log( "used up all of the steps; starting over" );
						usedIndexes.Clear();
						usedIndexes.Add( stepIndex );
					}
					completions++;
					isCompleted = true;
					if (( count != -1 ) && ( completions >= count )) {
						//Debug.Log( "the count has been exhausted" );
						isExhausted = true;
					}
					result = steps[ stepIndex ].Execute(); 

					// TODO: Implement percentCompleted for shuffle memory
				}
				
			}
			
			return result;
		}

		public string GetCurrentStepId() {
			if ( stepIndex == -1 ) {
				return "";
			} else {
				return steps[ stepIndex ].id;
			}
		}

		public void MatchDate( long date = -1 ) {

			int i;
			Step step;
			int n = steps.Length;
			
			if ( date == -1 ) {
				date = parentScore.currentDate;
			}
			
			for ( i = 0; i < n; i++ ) {
				step = steps[ i ];
				if ( step.command == "setdate" ) {
					if ( System.DateTime.Now.Ticks == step.date ) {
						stepIndex = i;
						break;
					}
				}
			}

		}
	}
}