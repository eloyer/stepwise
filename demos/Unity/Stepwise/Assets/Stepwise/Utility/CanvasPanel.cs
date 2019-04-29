﻿using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using UnityEngine.Video;
using TMPro;

public enum BackgroundSize
{
    Cover,
    Contain
}

public class CanvasPanel : MonoBehaviour
{
    public float cameraScaleFactor = 1;

	private RectTransform _rectTransform;
	private TextMeshProUGUI _text;
	private RawImage _image;
    private RectTransform _imageRectTransform;
    private VideoPlayer _videoPlayer;
    private AudioSource _audioSource;
    private RawImage _background;
	private RawImage _textBackground;
	private RectTransform _parentRectTransform;
    private float [] _margins;
	private float [] _textMargins;
	private float [] _textPadding;
    private Camera _camera;
    private Vector3 _cameraBasePosition;
    private Vector3 _mainCameraBasePosition;
    private float _layoutTransitionDuration = .5f;
    private float _imageTransitionDuration = .5f;
    private BackgroundSize _backgroundSize = BackgroundSize.Cover;

    // Use this for initialization
    void Start ()
    {
        _margins = new float[4];
        _textMargins = new float [4];
		_textPadding = new float [4];

		_rectTransform = GetComponent<RectTransform> ();
		_parentRectTransform = _rectTransform.parent.GetComponent<RectTransform> ();

		GameObject go = new GameObject ("Background");
		_background = go.AddComponent (typeof (RawImage)) as RawImage;
		_background.gameObject.SetActive (false);
		_background.raycastTarget = false;
		RectTransform rectTransform = go.GetComponent<RectTransform> ();
		rectTransform.anchorMin = Vector2.zero;
		rectTransform.anchorMax = Vector2.one;
		rectTransform.sizeDelta = Vector2.zero;
		rectTransform.SetParent (_rectTransform, false);

		go = new GameObject ("Media");
		_image = go.AddComponent (typeof (RawImage)) as RawImage;
		_image.gameObject.SetActive (false);
		_image.raycastTarget = false;
        _audioSource = go.AddComponent<AudioSource>();
        _audioSource.enabled = false;
        _audioSource.playOnAwake = false;
        _videoPlayer = go.AddComponent<VideoPlayer>();
        _videoPlayer.enabled = false;
        _videoPlayer.playOnAwake = false;
        _videoPlayer.aspectRatio = VideoAspectRatio.FitOutside;
        _videoPlayer.source = VideoSource.Url;
        _videoPlayer.audioOutputMode = VideoAudioOutputMode.AudioSource;
        _videoPlayer.EnableAudioTrack(0, true);
        _videoPlayer.SetTargetAudioSource(0, _audioSource);
        _imageRectTransform = go.GetComponent<RectTransform> ();
        _imageRectTransform.anchorMin = Vector2.zero;
        _imageRectTransform.anchorMax = Vector2.one;
        _imageRectTransform.sizeDelta = Vector2.zero;
        _imageRectTransform.SetParent (_rectTransform, false);

		go = new GameObject ("TextBackground");
		_textBackground = go.AddComponent (typeof (RawImage)) as RawImage;
		_textBackground.gameObject.SetActive (false);
		_textBackground.raycastTarget = false;
		_textBackground.color = Color.clear;
		rectTransform = go.GetComponent<RectTransform> ();
		rectTransform.anchorMin = Vector2.zero;
		rectTransform.anchorMax = Vector2.one;
		rectTransform.sizeDelta = Vector2.zero;
		rectTransform.pivot = Vector2.zero;
		rectTransform.SetParent (_rectTransform, false);

		go = new GameObject ("Text");
		_text = go.AddComponent (typeof (TextMeshProUGUI)) as TextMeshProUGUI;
		_text.fontSize = 96;
		_text.color = Color.black;
        _text.alignment = TextAlignmentOptions.Center;
		_text.raycastTarget = false;
		rectTransform = go.GetComponent<RectTransform> ();
		rectTransform.anchorMin = Vector2.zero;
		rectTransform.anchorMax = Vector2.one;
		rectTransform.sizeDelta = Vector2.zero;
		rectTransform.pivot = Vector2.zero;
		go.GetComponent<RectTransform> ().SetParent (_rectTransform, false);
	}

	// accepts coordinates where 0,0 is bottom left corner
	public void SetLayout (Rect layout)
	{
        if (_rectTransform != null)
        {
            Vector2 anchorMinStart = _rectTransform.anchorMin;
            Vector2 anchorMaxStart = _rectTransform.anchorMax;
            Vector2 anchorMinEnd = new Vector2(layout.xMin, layout.yMin);
            Vector2 anchorMaxEnd = new Vector2(layout.xMax, layout.yMax);
            _rectTransform.sizeDelta = Vector2.zero;
            LeanTween.value(gameObject, 0, 1, _layoutTransitionDuration).setEase(LeanTweenType.easeInOutSine).setOnUpdate((float val) => {
                _rectTransform.anchorMin = Vector2.Lerp(anchorMinStart, anchorMinEnd, val);
                _rectTransform.anchorMax = Vector2.Lerp(anchorMaxStart, anchorMaxEnd, val);
                UpdateMargins();
            });
        }
    }

	// accepts coordinates where 0,0 is bottom left corner
	public void SetPosition(Vector2 position)
	{
        if (_rectTransform != null)
        {
            Vector2 anchorMinStart = _rectTransform.anchorMin;
            Vector2 anchorMaxStart = _rectTransform.anchorMax;
            Vector2 anchorMinEnd = position;
            Vector2 anchorMaxEnd = anchorMaxStart + (position - _rectTransform.anchorMin);
            LeanTween.value(gameObject, 0, 1, _layoutTransitionDuration).setEase(LeanTweenType.easeInOutSine).setOnUpdate((float val) =>
            {
                _rectTransform.anchorMin = Vector2.Lerp(anchorMinStart, anchorMinEnd, val);
                _rectTransform.anchorMax = Vector2.Lerp(anchorMaxStart, anchorMaxEnd, val);
            });

        }
    }

	public void SetSize(Vector2 size)
	{
        if (_rectTransform != null)
        {
            Vector2 anchorMinStart = _rectTransform.anchorMin;
            Vector2 anchorMaxStart = _rectTransform.anchorMax;
            Vector2 anchorMinEnd = new Vector2(_rectTransform.anchorMin.x, _rectTransform.anchorMax.y - size.y);
            Vector2 anchorMaxEnd = new Vector2(_rectTransform.anchorMin.x + size.x, _rectTransform.anchorMax.y);
            LeanTween.value(gameObject, 0, 1, _layoutTransitionDuration).setEase(LeanTweenType.easeInOutSine).setOnUpdate((float val) => {
                _rectTransform.anchorMin = Vector2.Lerp(anchorMinStart, anchorMinEnd, val);
                _rectTransform.anchorMax = Vector2.Lerp(anchorMaxStart, anchorMaxEnd, val);
                UpdateMargins();
                CorrectImageAspectRatio();
            });
        }
    }

    public void SetMargins(float[] margins)
    {
        if (margins.Length == 4)
        {
            SetMargins(margins[0], margins[1], margins[2], margins[3]);
        }
    }

    public void SetMargins(float top, float right, float bottom, float left)
    {
        StoreMargins(top, right, bottom, left);
        UpdateMargins();
    }

    public void UpdateMargins()
    {
        _rectTransform.offsetMin = new Vector2(_margins[3], _margins[2]);
        _rectTransform.offsetMax = new Vector2(-_margins[1], -_margins[0]);
    }

    public void SetText(string text)
	{
        Color color = _text.color;
        var seq = LeanTween.sequence();
        seq.append(LeanTween.value(gameObject, 1, 0, .125f).setEase(LeanTweenType.easeInOutSine).setOnUpdate((float val) =>
        {
            color.a = val;
            _text.color = color;
        }));
        seq.append((object obj) =>
        {
            _text.text = text;
        }, null);
        seq.append(LeanTween.value(gameObject, 0, 1, .125f).setEase(LeanTweenType.easeInOutSine).setOnUpdate((float val) =>
        {
            color.a = val;
            _text.color = color;
        }));
    }

	public void SetTextColor(Color color)
	{
		_text.color = color;
	}

	public void SetTextFont(string fontPath)
	{
		_text.font = Resources.Load<TMP_FontAsset> (fontPath);
	}

	public void SetTextAlign(TextAlignmentOptions textAnchor)
	{
		_text.alignment = textAnchor;
	}

	public void SetTextSize(int size)
	{
		_text.fontSize = size * 2;
    }

    public void SetTextLineSpacing(float lineSpacing)
    {
        _text.lineSpacing = lineSpacing;
    }

    public void SetTextCharacterSpacing(float characterSpacing)
    {
        _text.characterSpacing = characterSpacing;
    }

    public void SetTextTransform(FontStyles textTransform)
    {
        _text.fontStyle = textTransform;
    }

    public void ClearImage()
    {
        SetImageTexture(null);
    }

    public void SetImage(string url)
	{
		StartCoroutine (LoadImage (url));
	}

    public void SetVideo(string filename)
    {
        StartCoroutine(LoadVideo(filename));
    }

    public void Pause()
    {
        _videoPlayer.Pause();
        _audioSource.Pause();
    }

    public void Play()
    {
        _videoPlayer.Play();
        _audioSource.Play();
    }

    public void SetLoop(bool loop)
    {
        _videoPlayer.isLooping = loop;
        _audioSource.loop = loop;
    }

    private IEnumerator LoadVideo(string filename)
    {
        _videoPlayer.enabled = true;
        _image.gameObject.SetActive(true);
        if (_image.texture == null)
        {
            _image.color = Color.clear;
        }
        _audioSource.enabled = true;
        _audioSource.Pause();
        _videoPlayer.url = Application.streamingAssetsPath + "/" + filename;
        _videoPlayer.Prepare();
        while (!_videoPlayer.isPrepared)
        {
            yield return null;
        }
        SetImageTexture(_videoPlayer.texture);
        CorrectImageAspectRatio();
        _videoPlayer.Play();
        _audioSource.Play();
    }

    public void SetCamera(string cameraName)
    {
        GameObject go = GameObject.Find(cameraName);
        if (go != null)
        {
            _camera = go.GetComponent<Camera>();
            if (_camera != null)
            {
                _cameraBasePosition = _camera.transform.position;
                _mainCameraBasePosition = Camera.main.transform.position;
                SetImageTexture(_camera.targetTexture);
                _image.gameObject.SetActive(true);
                return;
            }
        }
        Debug.Log("Error: Couldn't find camera.");
    }

    public void SetBackgroundColor(Color color)
	{
		_background.color = color;
		_background.gameObject.SetActive (true);
	}

	public void SetTextBackgroundColor(Color color)
	{
		_textBackground.color = color;
		_textBackground.gameObject.SetActive (true);
	}

    public void SetBackgroundSize(BackgroundSize size)
    {
        _backgroundSize = size;
    }

    public void SetTextMargins(float[] margins)
	{
		if (margins.Length == 4) {
			SetTextMargins (margins [0], margins [1], margins [2], margins [3]);
		}
	}

	public void SetTextMargins(float top, float right, float bottom, float left)
	{
		StoreTextMargins (top, right, bottom, left);
		UpdateTextMarginsAndPadding ();
	}

	public void SetTextPadding (float [] padding)
	{
		if (padding.Length == 4) {
			SetTextPadding (padding [0], padding [1], padding [2], padding [3]);
		}
	}

	public void SetTextPadding (float top, float right, float bottom, float left)
	{
		StoreTextPadding (top, right, bottom, left);
		UpdateTextMarginsAndPadding ();
	}

    public void SetLayoutTransition(float duration)
    {
        _layoutTransitionDuration = duration;
    }

    public void SetImageTransition(float duration)
    {
        _imageTransitionDuration = duration;
    }

    public Vector2 GetSize()
	{
		return new Vector2 (_rectTransform.rect.width, _rectTransform.rect.height);
	}

	private void UpdateTextMarginsAndPadding()
	{
		RectTransform textRectTransform = _text.GetComponent<RectTransform> ();
		RectTransform textBackgroundRectTransform = _textBackground.GetComponent<RectTransform> ();
		textBackgroundRectTransform.anchoredPosition = new Vector2 (_textMargins [3], _textMargins [2]);
		textBackgroundRectTransform.sizeDelta = new Vector2 (-(_textMargins [1] + _textMargins [3]), -(_textMargins [0] + _textMargins [2]));
		textRectTransform.anchoredPosition = new Vector2 (_textMargins[3] + _textPadding[3], _textMargins[2] + _textPadding[2]);
		textRectTransform.sizeDelta = new Vector2 (-(_textMargins[1] + _textMargins[3] + _textPadding[1] + _textPadding[3]), -(_textMargins[0] + _textMargins[2] + _textPadding[0] + _textPadding[2]));
    }

    private void StoreMargins(float top, float right, float bottom, float left)
    {
        _margins[0] = top;
        _margins[1] = right;
        _margins[2] = bottom;
        _margins[3] = left;
    }

    private void StoreTextMargins(float top, float right, float bottom, float left)
	{
		_textMargins [0] = top;
		_textMargins [1] = right;
		_textMargins [2] = bottom;
		_textMargins [3] = left;
	}

	private void StoreTextPadding (float top, float right, float bottom, float left)
	{
		_textPadding [0] = top;
		_textPadding [1] = right;
		_textPadding [2] = bottom;
		_textPadding [3] = left;
	}

	private IEnumerator LoadImage(string url)
	{
		using (UnityWebRequest www = UnityWebRequestTexture.GetTexture (url)) {
			www.SendWebRequest ();
			while (!www.isDone) {
				yield return null;
			}
			if (!www.isNetworkError) {
                _camera = null;
				Texture2D texture = DownloadHandlerTexture.GetContent (www);
                Canvas.ForceUpdateCanvases();
                yield return 0;
                _image.gameObject.SetActive(true);
                SetImageTexture(texture);
            }
		}
	}

    private void SetImageTexture(Texture texture)
    {
        Color color;
        bool noImageYet = _image.texture == null;
        if (noImageYet)
        {
            color = Color.black;
            color.a = 0;
            _image.color = color;
            _image.texture = texture;
            CorrectImageAspectRatio();
        }
        else
        {
            color = Color.white;
        }
        _image.gameObject.SetActive(true);
        var seq = LeanTween.sequence();
        seq.append(LeanTween.value(gameObject, 1, 0, _imageTransitionDuration).setEase(LeanTweenType.easeInOutSine).setOnUpdate((float val) =>
        {
            if (noImageYet)
            {
                color.a = 0;
            }
            else
            {
                color.a = val;
            }
            _image.color = color;
        }));
        seq.append((object obj) =>
        {
            _image.texture = texture;
            CorrectImageAspectRatio();
            color = Color.white;
            color.a = 0;
            if (_image.texture == null)
            {
                _image.gameObject.SetActive(false);
                _videoPlayer.Pause();
                _videoPlayer.gameObject.SetActive(false);
            }
        }, null);
        seq.append(LeanTween.value(gameObject, 0, 1, _imageTransitionDuration).setEase(LeanTweenType.easeInOutSine).setOnUpdate((float val) =>
        {
            color.a = val;
            _image.color = color;
        }));
    }

    private void CorrectImageAspectRatio()
	{
		// simulates "fill" or "cover" image sizing for panel while maintaining image aspect ratio
		if (_image != null) {
			if (_image.texture != null)
            {
                float imageAspectRatio = _image.texture.width / (float)_image.texture.height;
                switch (_backgroundSize)
                {
                    case BackgroundSize.Cover:
                        Vector2 panelSize = _rectTransform.anchorMax - _rectTransform.anchorMin;
                        panelSize.x *= _parentRectTransform.sizeDelta.x;
                        panelSize.y *= _parentRectTransform.sizeDelta.y;
                        float panelAspectRatio = panelSize.x / panelSize.y;
                        Rect uvRect;
                        Vector2 sizedDimensions;
                        float normalizedDimension;
                        if (panelAspectRatio > imageAspectRatio)
                        {
                            sizedDimensions = new Vector2(panelSize.x, _image.texture.height * (panelSize.x / (float)_image.texture.width));
                            normalizedDimension = panelSize.y / sizedDimensions.y;
                            uvRect = new Rect(0, (1 - normalizedDimension) * .5f, 1, normalizedDimension);
                        }
                        else
                        {
                            sizedDimensions = new Vector2(_image.texture.width * (panelSize.y / (float)_image.texture.height), panelSize.y);
                            normalizedDimension = panelSize.x / sizedDimensions.x;
                            uvRect = new Rect((1 - normalizedDimension) * .5f, 0, normalizedDimension, 1);
                        }
                        _image.uvRect = uvRect;
                        break;

                    case BackgroundSize.Contain:
                        // Derived from https://forum.unity.com/threads/code-snippet-size-rawimage-to-parent-keep-aspect-ratio.381616/
                        float w = 0, h = 0;
                        var bounds = new Rect(0, 0, _rectTransform.rect.width, _rectTransform.rect.height);
                        Debug.Log(bounds);
                        if (Mathf.RoundToInt(_imageRectTransform.eulerAngles.z) % 180 == 90)
                        {
                            //Invert the bounds if the image is rotated
                            bounds.size = new Vector2(bounds.height, bounds.width);
                        }
                        //Size by height first
                        h = bounds.height;
                        w = h * imageAspectRatio;
                        if (w > bounds.width)
                        { //If it doesn't fit, fallback to width;
                            w = bounds.width;
                            h = w / imageAspectRatio;
                        }
                        _imageRectTransform.SetSizeWithCurrentAnchors(RectTransform.Axis.Horizontal, w);
                        _imageRectTransform.SetSizeWithCurrentAnchors(RectTransform.Axis.Vertical, h);
                        break;
                }
            }
		}
	}

    // Update is called once per frame
    void Update ()
	{
        if (_camera != null)
        {
            _camera.transform.position = _cameraBasePosition + ((Camera.main.transform.position - _mainCameraBasePosition) / cameraScaleFactor);

            /*Vector3 mainCamPos = Camera.main.transform.position;
            Quaternion mainCamRot = Camera.main.transform.rotation;

            Vector3 posCanvasToMainCam = mainCamPos - transform.position;

            // compute the rotation between the portal entry and the portal exit
            Quaternion rotCanvasToAnchor = _camera.transform.rotation * Quaternion.Inverse(transform.rotation);

            // move remote camera position
            Vector3 posAnchorToStereoCam = rotCanvasToAnchor * posCanvasToMainCam;
            _camera.transform.position = _camera.transform.position + posAnchorToStereoCam;

            // rotate remote camera
            _camera.transform.rotation = rotCanvasToAnchor * mainCamRot;*/
        }
	}
}
