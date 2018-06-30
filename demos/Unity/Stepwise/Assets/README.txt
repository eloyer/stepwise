==================
Stepwise for Unity
==================

View this document online at https://github.com/eloyer/stepwise/wiki/Getting-started-with-Stepwise-for-Unity

== Installation ==

First, install the Stepwise for Unity package, located in this repository at src/Unity/StepwiseForUnity_[version num].unitypackage.

To use Stepwise in your Unity project, at a minimum you'll need to add the Conductor component to a game object in your scene. The Conductor component includes a slot for a TextAsset—if you drop a plain text file or Stepwise XML file into that slot, the Conductor will load it automatically when the scene starts. The HelloWorld scene includes an example of this usage.

== HelloWorld Scene ==

This very simple implementation of Stepwise includes a Stepwise game object with a Conductor component that is pre-filled with a simple Stepwise XML "Hello World" script. The script will be loaded automatically when the scene starts. You can also leave the Data File slot empty and load a script from code, in either plain text or Stepwise XML formats, using the Conductor object's Load methods.

That same game object also includes a StepLogger component which updates two fields in the scene's Canvas object to indicate the current status of the story and its output. Check the source of the StepLogger to see how to subscribe to important Stepwise events like OnScoreLoading, OnScorePrepared, and most important, OnStepExecuted.

== StepworksCatalog Scene ==

The StepworksCatalog scene interfaces with Stepworks (http://step.works), a website where users can create their own Stepwise stories, and where a catalog of existing stories is hosted.

The StepworksCatalog component loads the current library of stories hosted on Stepworks. Clicking on a story loads it into the scene's instance of Stepwise and starts it running.

Many of the Stepworks stories contain features which are too complex for this simple player to properly handle; multiple characters, images, video, and audio, musical notes, etc. Taken together, they make use of most of the full range of what's possible in Stepwise. When you're creating your own Stepwise clients, how you want to support those features is up to you. Exploring the "Browse" section of the Stepworks website will give you a sense of how some of these features might be supported.

In addition, the StepworksCatalog scene includes a plain text input option, to demonstrate how users can create their own simple stories. At present, the plain text parser can only create simple linear looping stories, but this will likely be expanded in future.

Note that one way to create more complex stories is to visit the Stepworks website and use its Google Sheets authoring features. Every time a Google Sheets script is loaded into the Stepworks website, the Stepwise XML script that results is output to the console of the web browser. The script can be copied from there and pasted into a text file in your Unity project.

For more details on using Stepwise in your Unity project, check the Stepwise Unity API Reference (https://github.com/eloyer/stepwise/wiki/Stepwise-Unity-API-Reference).