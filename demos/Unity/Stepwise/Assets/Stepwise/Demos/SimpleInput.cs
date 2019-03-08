using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Opertoon.Stepwise;
using UnityEngine.EventSystems;

public class SimpleInput : MonoBehaviour {

    public Conductor conductor;

	// Use this for initialization
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
        if (EventSystem.current.currentSelectedGameObject == null && Input.anyKeyDown)
        {
            conductor.NextStep();
        }
    }
}
