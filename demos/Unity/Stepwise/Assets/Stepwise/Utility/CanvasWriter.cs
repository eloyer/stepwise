using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using Opertoon.Stepwise;
using System.Text.RegularExpressions;
using System;
using TMPro;

public class CanvasWriter : MonoBehaviour
{

    public Conductor conductor;
    public Canvas canvas;
	public Vector2 grid;
	public List<Character> visibleCharacters;
	public Vector2 unitSize;

	private bool _scoreIsPrepared;
	private List<CanvasPanel> _panels;
	private RawImage _stageBackground;
	private RectTransform _rectTransform;

    // Use this for initialization
    void Start()
    {
		StartCoroutine (Init ());
	}

	private IEnumerator Init()
	{
		yield return 0;
		if (conductor != null) {
			conductor.OnStepExecuted += HandleStepExecuted;
			conductor.OnScoreLoading += HandleScoreLoading;
			conductor.OnScorePrepared += HandleScorePrepared;
		}
		_rectTransform = canvas.GetComponent<RectTransform> ();
		CreateStageBackground ();
	}

	private void CreateStageBackground()
	{
		GameObject go = new GameObject ("StageBackground");
		_stageBackground = go.AddComponent (typeof (RawImage)) as RawImage;
		_stageBackground.gameObject.SetActive (false);
		RectTransform rectTransform = go.GetComponent<RectTransform> ();
		rectTransform.anchorMin = Vector2.zero;
		rectTransform.anchorMax = Vector2.one;
		rectTransform.sizeDelta = Vector2.zero;
		rectTransform.SetParent (canvas.transform, false);
	}

	private string GetBasename(string path, string suffix = "")
	{
		string b = Regex.Replace (path, "^.*[/\\\\]", "");
		if (suffix != "" && b.Substring(b.Length - suffix.Length) == suffix) {
			b = b.Substring (0, b.Length - suffix.Length);
		}
		return b;
	}

	private string GetFilenameExtension(string str)
	{
		string [] array = str.Split ('?');
		str = array [0];
		array = str.Split ('#');
		str = array [0];
		string basename = GetBasename (str);
		if (basename.IndexOf('.') == -1) {
			return "";
		}
		string[] temp = basename.Split ('.');
		string ext = temp [temp.Length - 1];
		int n;
		bool isNumeric = int.TryParse (ext, out n);
		if (isNumeric) {
			return "";
		}
		if (ext.Length > 0) {
			if (ext [ext.Length - 1] == '#') {
				ext = ext.Substring (0, ext.Length - 1);
			}
		}
		return ext.ToLower ();
	}

	private void HandleScoreLoading (Conductor conductor)
	{
		Debug.Log ("score loading");
	}

	private void HandleScorePrepared (Score score)
	{
		Debug.Log ("score prepared");
		_scoreIsPrepared = true;
		SetupCanvas ();
	}

	private void HandleStepExecuted (Step step)
	{
		//Debug.Log(step.command+" "+step.target+" "+step.content);
		Character character = step.target as Character;
		int index = visibleCharacters.IndexOf (character);
		CanvasPanel panel = null;
		if (index != -1) {
			panel = _panels [index];
		}
		if (panel != null) {
			Color color;
			int integer;
            float floatValue;
			switch (step.command) {
    			case "speak":
    			case "narrate":
    			case "sing":
    			case "think":
    			case "setbackgroundimage":
    				if (step.command == "setbackgroundimage") {
                        if (step.content == "none")
                        {
                            panel.ClearImage();
                        }
                        break;
    				}
    				string extension = GetFilenameExtension (step.content);
    				switch (extension) {
        				case "gif":
        				case "png":
        				case "jpg":
        					panel.SetImage (step.content);
        					break;
        				case "mp3":
        				case "ogg":
        				case "wav":
        				case "m4a":
        					break;
        				case "mp4":
                        case "mov":
                            panel.SetVideo(step.content);
        					break;
        				default:
        					panel.SetText (step.content);
        					break;
    				}
    				break;
    			case "setgrid":
    				SetGrid(ParseVector2FromString(step.content));
    				break;
    			case "setlayout":
    				SetPanelLayout (panel, ParseRectFromString(step.content));
    				break;
    			case "setstagecolor":
    				if (ColorUtility.TryParseHtmlString(step.content, out color)) {
    					SetStageBackgroundColor (color);
    				}
    				break;
    			case "setbackcolor":
    				if (ColorUtility.TryParseHtmlString (step.content, out color)) {
    					panel.SetBackgroundColor (color);
    				}
    				break;
    			case "setforecolor":
    				if (ColorUtility.TryParseHtmlString (step.content, out color)) {
    					panel.SetTextColor (color);
    				}
    				break;
    			case "setfont":
    				panel.SetTextFont (step.content);
    				break;
    			case "setposition":
    			case "moveto":
    				panel.SetPosition (ParsePositionFromStringForPanel (step.content, panel));
    				break;
    			case "setsize":
    			case "changesize":
    				SetPanelSize (panel, ParseVector2FromString(step.content));
    				break;
                case "setmargin":
                    panel.SetMargins(ParseBordersFromString(step.content));
                    break;
    			case "settextalign":
    				panel.SetTextAlign (ParseTextAnchorFromString (step.content));
    				break;
    			case "setcaptionmargin":
    			case "setpadding":
    				panel.SetTextMargins (ParseBordersFromString (step.content));
    				break;
    			case "setcaptionbackgroundcolor":
    				if (ColorUtility.TryParseHtmlString (step.content, out color)) {
    					panel.SetTextBackgroundColor (color);
    				}
    				break;
    			case "setcaptionpadding":
    				panel.SetTextPadding (ParseBordersFromString (step.content));
    				break;
    			case "setfontsize":
    				if (int.TryParse(step.content, out integer)) {
    					panel.SetTextSize (integer);
    				}
    				break;
                case "setlineheight":
                    if (float.TryParse(step.content, out floatValue)) {
                        panel.SetTextLineSpacing(floatValue);
                    }
                    break;
                case "setletterspacing":
                    if (float.TryParse(step.content, out floatValue))
                    {
                        panel.SetTextCharacterSpacing(floatValue);
                    }
                    break;
                case "settexttransform":
                    panel.SetTextTransform(ParseTextTransformFromString(step.content));
                    break;
                case "setcamera":
                    panel.SetCamera(step.content);
                    break;
                case "pause":
                    panel.Pause();
                    break;
                case "play":
                    panel.Play();
                    break;
                case "setloop":
                    panel.SetLoop(step.content == "true" ? true : false);
                    break;
                case "setlayouttransition":
                    if (float.TryParse(step.content, out floatValue))
                    {
                        panel.SetLayoutTransition(floatValue);
                    }
                    break;
                /*case "setimagetransition":
                    if (float.TryParse(step.content, out floatValue))
                    {
                        panel.SetImageTransition(floatValue);
                    }
                    break;*/
            }
		}
	}

    private FontStyles ParseTextTransformFromString(string transformString)
    {
        FontStyles fontStyle = FontStyles.Normal;
        switch (transformString)
        {
            case "uppercase":
                fontStyle = FontStyles.UpperCase;
                break;
            case "lowercase":
                fontStyle = FontStyles.LowerCase;
                break;
        }
        return fontStyle;
    }

    private float[] ParseBordersFromString(string borderString)
	{
		float [] borders = new float [4];
		string [] temp = borderString.Trim().Split (' ');
		if (temp.Length == 1) {
			borders [0] = borders[1] = borders[2] = borders[3] = float.Parse(temp [0]);
		} else if (temp.Length == 2) {
			borders [0] = borders [2] = float.Parse(temp [0]);
			borders [1] = borders [3] = float.Parse(temp [1]);
		} else if (temp.Length == 3) {
			borders [0] = float.Parse(temp [0]);
			borders [1] = float.Parse(temp [1]);
			borders [2] = float.Parse(temp [2]);
			borders [3] = 0;
		} else {
			borders [0] = float.Parse(temp [0]);
			borders [1] = float.Parse(temp [1]);
			borders [2] = float.Parse(temp [2]);
			borders [3] = float.Parse(temp [3]);
		}
		return borders;
	}

	private Rect ParseRectFromString(string rectString)
	{
		string [] temp = rectString.Split (' ');
		return new Rect (float.Parse (temp [0]), float.Parse (temp [1]), float.Parse (temp [2]), float.Parse (temp [3]));
	}

	private Vector2 ParseVector2FromString(string vectorString)
	{
		string[] temp = vectorString.Split (' ');
		return new Vector2 (float.Parse (temp [0]), float.Parse (temp [1]));
	}

	private TextAlignmentOptions ParseTextAnchorFromString(string alignString)
	{
		string[] temp = alignString.Split (' ');
		TextAlignmentOptions textAnchor = TextAlignmentOptions.Center;
		if (temp.Length == 1 || temp.Length == 2) {
			switch (temp [0]) {
			case "left":
                textAnchor = TextAlignmentOptions.Left;
				break;
			case "right":
				textAnchor = TextAlignmentOptions.Right;
                break;
			}
			if (temp.Length == 2) {
				switch (temp [1]) {
				case "top":
					switch (temp [0]) {
					case "left":
						textAnchor = TextAlignmentOptions.TopLeft;
                        break;
					case "center":
						textAnchor = TextAlignmentOptions.Top;
						break;
					case "right":
						textAnchor = TextAlignmentOptions.TopRight;
                        break;
					}
					break;
				case "bottom":
					switch (temp [0]) {
					case "left":
						textAnchor = TextAlignmentOptions.BottomLeft;
                        break;
					case "center":
						textAnchor = TextAlignmentOptions.Bottom;
                        break;
					case "right":
						textAnchor = TextAlignmentOptions.BottomRight;
                        break;
					}
					break;
				}
			}
		}
		return textAnchor;
	}

	private Vector2 ParsePositionFromStringForPanel (string positionString, CanvasPanel panel)
	{
		Vector2 position = Vector2.zero;
		string [] temp = positionString.Split (' ');
		try {
			float x = float.Parse (temp [0]);
			float y = float.Parse (temp [1]);
			position.x = x;
			position.y = grid.y - y - (panel.GetSize ().y / unitSize.y);
		} catch (FormatException) {
			switch (temp [0]) {
			case "offleft":
			case "left":
			case "center":
			case "right":
			case "offright":
				position.x = ParseHorizontalPositionFromStringForPanel (temp [0], panel);
				break;
			case "offtop":
			case "top":
			case "bottom":
			case "offbottom":
				position.y = ParseVerticalPositionFromStringForPanel (temp [0], panel);
				break;
			}
			if (temp.Length > 1) {
				position.y = ParseVerticalPositionFromStringForPanel (temp [1], panel);
			} else if (temp.Length == 1) {
				if (temp [0] == "center") {
					position.y = ParseVerticalPositionFromStringForPanel (temp [0], panel);
				}
			}
		}
		position.x /= grid.x;
		position.y /= grid.y;
		return position;
	}

	private float ParseHorizontalPositionFromStringForPanel (string positionString, CanvasPanel panel)
	{
		float hpos = 0;
		switch (positionString) {
		case "offleft":
			hpos = -(panel.GetSize ().x / unitSize.x);
			break;
		case "left":
			hpos = 0;
			break;
		case "center":
			hpos = (grid.x - (panel.GetSize ().x / unitSize.x)) * .5f;
			break;
		case "right":
			hpos = grid.x - (panel.GetSize ().x / unitSize.x);
			break;
		case "offright":
			hpos = grid.x;
			break;
		}
		return hpos;
	}

	private float ParseVerticalPositionFromStringForPanel (string positionString, CanvasPanel panel)
	{
		float vpos = 0;
		switch (positionString) {
		case "offtop":
			vpos = grid.y;
			break;
		case "top":
			vpos = grid.y - (panel.GetSize ().y / unitSize.y);
			break;
		case "center":
			vpos = (grid.y - (panel.GetSize ().y / unitSize.y)) * .5f;
			break;
		case "bottom":
			vpos = 0;
			break;
		case "offbottom":
			vpos = -(panel.GetSize ().y / unitSize.y);
			break;
		}
		return vpos;
	}

	private void SetGrid(Vector2 dimensions)
	{
		SetGrid ((int)dimensions.x, (int)dimensions.y);
	}

	private void SetGrid(int columns, int rows)
	{
		grid.x = columns;
		grid.y = rows;
	}

	private void SetupCanvas()
	{
		visibleCharacters = conductor.score.GetVisibleCharacters ();
		if (visibleCharacters.Count < 4) {
			SetGrid (visibleCharacters.Count, 1);
		} else {
			int rowCount = (int)Mathf.Round (Mathf.Sqrt ((float)visibleCharacters.Count));
			int colCount = (int)Mathf.Ceil ((float)visibleCharacters.Count / (float)rowCount);
			SetGrid (colCount, rowCount);
		}
		CreatePanelsForVisibleCharacters ();
		StartCoroutine(SetPanelsToDefaultPositions ());
	}

	private void SetStageBackgroundColor(Color color)
	{
		_stageBackground.gameObject.SetActive (true);
		_stageBackground.color = color;
	}

	private void CreatePanelsForVisibleCharacters()
	{
		_panels = new List<CanvasPanel> ();
		int n = visibleCharacters.Count;
		for (int i = 0; i < n; i++) {
			_panels.Add (CreatePanelForCharacter (visibleCharacters [i]));
		}
	}

	private IEnumerator SetPanelsToDefaultPositions()
	{
		yield return 0;
		int n = _panels.Count;
		for (int i = 0; i < n; i++) {
			int row = (int)Mathf.Floor ((float)i / grid.x);
			int col = (int)((float)i % grid.x);
			SetPanelLayout (_panels [i], new Rect (col, row, 1, 1));
		}
	}

	private CanvasPanel CreatePanelForCharacter (Character character)
	{
		GameObject go = new GameObject (character.fullName);
		go.AddComponent (typeof (RectTransform));
		go.GetComponent<RectTransform> ().SetParent (canvas.transform, false);
		go.AddComponent (typeof (CanvasPanel));	
		return go.GetComponent<CanvasPanel> ();
	}

	// accepts coordinates where 0,0 is upper left corner
	public void SetPanelLayout (CanvasPanel panel, Rect gridLayout)
	{
		Rect canvasLayout = new Rect ();
		canvasLayout.x = gridLayout.xMin / grid.x;
		canvasLayout.y = (grid.y - gridLayout.yMin - gridLayout.height) / grid.y;
		canvasLayout.width = gridLayout.width / grid.x;
		canvasLayout.height = gridLayout.height / grid.y;
		panel.SetLayout (canvasLayout);
	}

	public void SetPanelSize(CanvasPanel panel, Vector2 gridSize)
	{
		Vector2 canvasSize = new Vector2 ();
		canvasSize.x = gridSize.x / grid.x;
		canvasSize.y = gridSize.y / grid.y;
		panel.SetSize (canvasSize);
	}

	// Update is called once per frame
	void Update ()
    {
		if (_rectTransform != null) {
			unitSize.x = _rectTransform.rect.width / grid.x;
			unitSize.y = _rectTransform.rect.height / grid.y;
		}
	}
}
 