/**
 * Fades in each added bit of text.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	Stepfade: new Stepfade()

    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function Stepfade() {
    }

    Stepfade.prototype.bindToInstance = function(stepwiseInstance) {
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

    Stepfade.prototype.bindToElement = function(element) {
    	this.element = element;
    }

    Stepfade.prototype.bindToCharacter = function(character) {
    	this.character = character;
    }

    Stepfade.prototype.displayStep = function(step) {
    	var okToDisplay = true;
    	if (step.target != null) {
    		okToDisplay = step.target.visible;
    	}
    	if (okToDisplay) {
	    	if (!step.append) {
	    		$(this.element).empty();
	    	}
            var text = step.content.replace(/(?:\\r\\n|\\r|\\n)/g, '<br />');
            var content = $('<span>' + text + '</span>');
	    	$(this.element).append(content);
            content.css('opacity',0).animate({left: '+=25px',opacity: 1}, 250);
    	}
    }

})(jQuery);
