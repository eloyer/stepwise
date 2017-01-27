# Stepwise

>"Press SPACE BAR to continue."

>"Click to continue."

>"Tap to continue."

These actions are like turning pages in a book. They're digital ways of saying "next, please." They carry an element of suspense, because we don't know exactly what we're going to get next, but also an element of performance, because while the author controls the "what," we control the "when."

Stepwise is about building artful experiences around this simple mechanic of suspense and performance.

How many digital reading experiences do we have each day that boil down to single repeated actions that deliver new content each time? Social media feeds, e-books, digital comics, one-button games...

...and what would happen if that mechanic was abstracted from all of those particular forms, and put to work explicitly for storytelling purposes? If discrete steps could represent characters and their acts of speech, thought, or song. Narration. Date and time. Geolocation. Weather. Rhythm. Melody. Repetition. Randomness.

This is what Stepwise does. Because it's simple, it can easily be used to power a wide range of experiences. Because it's standardized, content from one experience can easily be reused in another.

Most interactive stories operate at the scale of plot mechanics: "Should this character do X or Y?" with the results apparent over the course of minutes or hours. Stepwise operates at the scale of musical performance: "When does it feel right to move ahead?" with the results apparent in seconds.

Stepwise is a multimodal content sequencer—a library for one-button storytelling. 

## Powered by Stepwise
+ [Stepworks](http://step.works), a collection of experiments in one-button storytelling
+ [Strange Rain 2.0](http://opertoon.com/strange-rain/) for Apple TV, which uses the Unity version of the library
+ [I feel the earth move](http://erikloyer.com/einstein/), adaptation of an excerpt from Philip Glass' opera *Einstein on the Beach* (requires Chrome)


## How does it work?
Simple. Call the plugin with the content you want to display in steps, and the DOM element where you want it to be displayed:

```javascript
$("div#output").stepwise("1 2 3 4");
```

Now, whenever a key is pressed or `<div id="output">` is clicked, `<div id="output">` will be successively updated with `1`, `2`, `3`, and `4`.

[View demo on CodePen](http://codepen.io/eloyer/pen/XdxKMm)

## Stepwise XML
Stepwise content is delivered in [Stepwise XML](wiki/Stepwise-XML-Reference) format (though the library will also various other input formats that it parses into Stepwise XML, as in the string example above). Here's a "hello world" example:

```xml
<?xml version="1.0" encoding="utf-8"?>
<stepwise>
	<title>Hello world</title>
    <sequence repeat="+">
      <narrate>Hello,</narrate>
      <narrate>world.</narrate>
    </sequence>
</stepwise>
```
[View demo on CodePen](http://codepen.io/eloyer/pen/KzBbMW)

## Where can I use Stepwise?
Currently the library includes both a jQuery plugin and a Unity client (though the Unity client is currently far behind the plugin). The development of additional clients is welcomed and encouraged.

## How can I learn more?
Explore these links from the wiki:

- [Getting started with the Stepwise jQuery plugin](wiki/Getting-started-with-the-Stepwise-jQuery-plugin)
- [Loading content](wiki/Loading-content)
- [Creating Stepwise content in Google Sheets](wiki/Creating-Stepwise-content-in-Google-Sheets)
- [Working with output](wiki/Working-with-output)
- [Stepwise XML Reference](wiki/Stepwise-XML-Reference)

## License
Stepwise is released under an MIT License.
