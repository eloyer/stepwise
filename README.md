# Stepwise
> "Press SPACE BAR to continue."

>"Click to continue."

>"Tap to continue."

These actions are like turning pages in a book. They're digital ways of saying "next, please." They carry an element of suspense, because we don't know exactly what we're going to get next, but also an element of performance, because while the author controls the "what," we control the "when."

Stepwise is about building artful experiences around this simple mechanic of suspense and performance.

How many digital reading experiences do we have each day that boil down to single repeated actions that deliver new content each time? Social media feeds, e-books, digital comics, one-button games...

...and what would happen if that mechanic was abstracted from all of those particular forms, and put to work explicitly for storytelling purposes? If discrete steps could represent characters and their acts of speech, thought, or song. Narration. Date and time. Geolocation. Weather. Rhythm. Melody. Repetition. Randomness.

This is what Stepwise does. Because it's simple, it can easily be used to power a wide range of experiences. Because it's standardized, content from one experience can easily be reused in another.

Most interactive stories operate at the scale of plot mechanics: "Should this character do X or Y?" with the results apparent over the course of minutes or hours. Stepwise operates at the scale of musical performance: "When does it feel right to move ahead?" with the results apparent in seconds.

Stepwise is a library for one-button storytelling.


## How does it work?
In it's simplest form, working with Stepwise involves two steps:
1. Load content written in [Stepwise XML](#stepwise-xml) into the library.
2. Call Stepwise's `nextStep()` command whenever you need a new piece of content.

Here's a simple example using the library in its jQuery plugin form:

```javascript
// load the Stepwise document "story.xml" into the plugin and direct output to a div called "output"
$("div#output").stepwise({source:"story.xml"});

// store an instance of the plugin
var stepwise = $("div#output").data("plugin_stepwise");

// advance to the next step in the content whenever the mouse is clicked
$(document).mousedown(function() { stepwise.nextStep(); });
```

Now, whenever the mouse is clicked, `<div id="output">` will be updated with the content of the next step.

[View demo on CodePen](http://cdpn.io/XdxKMm)

## Stepwise XML
Stepwise content is delivered in Stepwise XML format (though the library will also accept plaintext, converting each line into a separate Stepwise XML step). Better documentation is coming, but for now here's a simple "hello world" example to get you started. What's shown here is just a subset of all of the features available--the current spec (which is constantly evolving) supports randomness, flow control, simple character and location modeling, narration, time & date, weather, geolocation, step groups, delayed action, music and more...

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
Currently the library includes both JavaScript (as a jQuery plugin) and Unity clients, and the development of additional clients is welcomed and encouraged.

## License
Stepwise is released under an MIT License.
