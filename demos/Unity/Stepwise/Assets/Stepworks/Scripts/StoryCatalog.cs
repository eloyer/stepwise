using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using SimpleJSON;
using UnityEngine.EventSystems;
using Opertoon.Stepwise;

public class StoryCatalog : MonoBehaviour {

	public Transform storyItemPrefab;
	public Conductor conductor;

	private Transform _storyListContent;

	// Use this for initialization
	void Start () {
		_storyListContent = transform.Find("Viewport/Content");
		StartCoroutine(GetStories());
	}

	public IEnumerator GetStories() {
		using (WWW www = new WWW("http://step.works/index.php/script/json")) {
			yield return www;
			JSONArray stories = JSON.Parse(www.text).AsArray;
			JSONNode storyData;
			StoryItem storyItem;
			int n = stories.Count;
			for (int i = 0; i < n; i++) {
				storyData = stories[i];
				storyItem = Instantiate(storyItemPrefab, _storyListContent).GetComponent<StoryItem>();
				storyItem.SetStoryData(storyData);
			}
		}
	}

	public void HandleStorySelect(JSONNode storyData) {
		StartCoroutine(LoadStory(GetXMLUrlFromStoryUrl(storyData["link"])));
	}

	public string GetXMLUrlFromStoryUrl(string storyUrl) {
		return storyUrl.Replace("/script/", "/script/raw/");
	}

	private IEnumerator LoadStory(string storyUrl) {
		using (WWW www = new WWW(storyUrl)) {
			yield return www;
			conductor.Load(www.text);
		}
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
