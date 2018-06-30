using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using Opertoon.Stepwise;

public class StepworksTextEntry : MonoBehaviour {

	public InputField inputField;
	public Conductor conductor;

	// Use this for initialization
	void Start () {
		
	}

	public void LoadScript() {
		Debug.Log(inputField.text);
		conductor.Load(inputField.text);
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
