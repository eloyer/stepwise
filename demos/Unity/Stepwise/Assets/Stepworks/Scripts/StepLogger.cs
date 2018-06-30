using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Opertoon.Stepwise;
using UnityEngine.UI;
using UnityEngine.EventSystems;

public class StepLogger : MonoBehaviour {

	public Text messageField;
	public Text textField;

	private Conductor _conductor;
	private bool _scoreIsPrepared;

	// Use this for initialization
	void Start () {
		
		_conductor = gameObject.GetComponent<Conductor>();

		Step.OnStepExecuted += HandleStepExecuted;
		Conductor.OnScoreLoading += HandleScoreLoading;
		Conductor.OnScorePrepared += HandleScorePrepared;
	}

	public virtual void HandleScoreLoading(Conductor conductor) {
		Debug.Log("loading");
		messageField.text = "[ Loading story... ]";
		_scoreIsPrepared = false;
	}

	public virtual void HandleScorePrepared(Score score) {
		Debug.Log("score prepared");
		StartCoroutine(DelayedMessage("[ Story loaded. Click to continue. ]", .5f));
		_scoreIsPrepared = true;
		textField.text = "";
	}

	public virtual void HandleStepExecuted( Step step ) {
		//Debug.Log(step.command+" "+step.target+" "+step.content);
		switch (step.command) {
		case "speak":
		case "narrate":
		case "sing":
		case "think":
			Character character = step.target as Character;
			if (character.visible) {
				if (step.append) {
					textField.text += step.content;
				} else {
					textField.text = step.content;
				}
			}
			break;
		}
	}

	private IEnumerator DelayedMessage(string message, float delay) {
		yield return new WaitForSeconds(delay);
		messageField.text = message;
	}
	
	// Update is called once per frame
	void Update () {

		if (_scoreIsPrepared && EventSystem.current.currentSelectedGameObject == null && Input.anyKeyDown) {
			_conductor.NextStep();
		}

	}
}
