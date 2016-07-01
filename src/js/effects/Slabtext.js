/**
 * Uses the Slabtext jQuery plugin to display text as headlines.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	Slabtext: new Slabtext()

    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function Slabtext() {
    	this.contentBuffer = "";
    }

    Slabtext.prototype.bindToInstance = function(stepwiseInstance) {
    	var me = this;
    	this.instance = stepwiseInstance;
    	$(this.instance.element).bind("executeStep", function(event, step) {
    		switch (step.command) {

    			case "speak":
    			case "narrate":
	    		if (me.element != null) {
	    			if (me.character != null) {
	    				if (step.target.id == me.character.id) {
	    					me.displayStep(step);
	    				}
	    			} else {
	    				me.displayStep(step);
	    			}
	    		}
    			break;

    		}
	    });
    }

    Slabtext.prototype.bindToElement = function(element) {
    	this.element = element;
    }

    Slabtext.prototype.bindToCharacter = function(character) {
    	this.character = character;
    }

    Slabtext.prototype.displayStep = function(step) {
    	var okToDisplay = true;
    	if (step.target != null) {
    		okToDisplay = step.target.visible;
    	}
    	if (okToDisplay) {
	    	if (!step.append) {
	    		this.contentBuffer = "";
	    	}
	    	this.contentBuffer += step.content;
	    	$(this.element).text(this.contentBuffer);
			$(this.element).slabText({
				viewportBreakpoint: 600
			});
    	}
    }

})(jQuery);
