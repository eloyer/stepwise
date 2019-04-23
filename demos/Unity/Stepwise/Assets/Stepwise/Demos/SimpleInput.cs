using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Opertoon.Stepwise;
using UnityEngine.EventSystems;

public class SimpleInput : MonoBehaviour {

    public Conductor conductor;
    public Canvas canvas;

	// Use this for initialization
	void Start () {
		
	}

    private IEnumerator DelayedReset()
    {
        yield return 0;
        conductor.Reset();
        yield return 0;
        conductor.NextStep();
    }

    // Update is called once per frame
    void Update () {
        if (EventSystem.current.currentSelectedGameObject == null && Input.anyKeyDown)
        {
            if (Input.GetKeyDown(KeyCode.Return))
            {
                canvas.gameObject.SetActive(true);
                StartCoroutine(DelayedReset());
            }
            else
            {
                conductor.NextStep();
            }
        }
    }
}
