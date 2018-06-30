using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using SimpleJSON;

public class StoryItem : MonoBehaviour, ISelectHandler {

	public JSONNode storyData;

	private Text _title;
	private Text _description;

	// Use this for initialization
	void Start () {
		EventTrigger trigger = GetComponent<EventTrigger>();
		EventTrigger.Entry entry = new EventTrigger.Entry();
		entry.eventID = EventTriggerType.PointerClick;
		entry.callback.AddListener((data) => { OnSubmit((BaseEventData)data); });
		trigger.triggers.Add(entry);
	}

	public void SetStoryData(JSONNode data) {
		storyData = data;
		SetTitle(storyData["title"], storyData["description"]);
	}

	public void SetTitle(string title, string description) {
		if (_title == null) {
			_title = transform.Find("Title").GetComponent<Text>();
		}
		_title.text = title;
		if (_description == null) {
			_description = transform.Find("Description").GetComponent<Text>();
		}
		_description.text = description;
	}

	public void OnSelect(BaseEventData data) {
		
	}

	public void OnSubmit(BaseEventData data) {
		transform.parent.parent.parent.GetComponent<StoryCatalog>().HandleStorySelect(storyData);
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
