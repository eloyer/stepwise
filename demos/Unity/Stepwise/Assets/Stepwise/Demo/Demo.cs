using UnityEngine;
using System.Collections;
using Opertoon.Stepwise;
using UnityEngine.UI;

public class Demo : MonoBehaviour {

	public Text output;

	private Conductor conductor;

	// Use this for initialization
	void Start () {

		conductor = gameObject.GetComponent<Conductor>();

		Step.OnStepExecuted += HandleStepExecuted;

	}
	
	public void HandleStepExecuted( Step step ) {

		switch ( step.command ) {
			
		case "narrate":
		case "speak":
		case "think":
			output.text = step.content;
			break;
			
		}
		
	}

	// Update is called once per frame
	void Update () {

		if ( Input.GetMouseButtonDown( 0 ) ) {
			conductor.NextStep();
		}
	
	}
}
