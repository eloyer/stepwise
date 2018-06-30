using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class StepworksDropdown : MonoBehaviour {

	public Transform catalog;
	public Transform textEntry;

	// Use this for initialization
	void Start () {
		catalog.gameObject.SetActive(true);
		textEntry.gameObject.SetActive(false);
	}

	public void HandleSelectionChanged(int selectionIndex) {
		switch (selectionIndex) {
		case 0:
			catalog.gameObject.SetActive(true);
			textEntry.gameObject.SetActive(false);
			break;
		case 1:
			catalog.gameObject.SetActive(false);
			textEntry.gameObject.SetActive(true);
			break;
		}
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
