/**
 * An abstract class for effects.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	AbstractEffect: AbstractEffect

    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function AbstractEffect() {
        this.bindings = [];
    }

    AbstractEffect.prototype.bindings = null;

    AbstractEffect.prototype.bindToInstance = function(stepwiseInstance) {
    	var me = this;
    	this.instance = stepwiseInstance;
    	$(this.instance.element).bind("executeStep", function(event, step) {
            var bindings = me.eligibleBindingsForStep(step);
            for (var i in bindings) {
                switch (step.command) {

                    case "speak":
                    case "narrate":
                    me.displayStep(step, bindings[i].element);
                    break;

                }                
            }

	    });
    }

    AbstractEffect.prototype.bindToElement = function(element) {
        this.bindings.push({ character: "*", element: element });
    }

    AbstractEffect.prototype.bindCharacterToElement = function(character, element) {
    	this.bindings.push({ character: character, element: element });
    }

    AbstractEffect.prototype.unbindFromElement = function(element) {
        var i,
            n = this.bindings.length;
        for (i=(n-1); i>=0; i--) {
            if (this.bindings[i].element == element) {
                this.bindings.splice(i, 1);
            }
        }
    }

    AbstractEffect.prototype.unbindCharacterFromElement = function(character, element) {
        var i, binding,
            n = this.bindings.length;
        for (i=(n-1); i>=0; i--) {
            binding = this.bindings[i];
            if ((binding.character == character) && (binding.element == element)) {
                this.bindings.splice(i, 1);
            }
        }
    }

    AbstractEffect.prototype.eligibleBindingsForStep = function(step) {
        var i, binding, characterMatch,
            eligibleBindings = [],
            n = this.bindings.length;
        for (i=(n-1); i>=0; i--) {
            binding = this.bindings[i];
            characterMatch = false;
            if (binding.character == "*") {
                characterMatch = true;
            } else if ((step.target.id == null) && (binding.character == null)) {
                characterMatch = true;
            } else if ((step.target.id != null) && (binding.character != null) && (step.target.id == binding.character.id)) {
                characterMatch = true;
            }
            if (characterMatch) {         
                eligibleBindings.push(binding);
            }
        }
        return eligibleBindings;
    }

    AbstractEffect.prototype.displayStep = function(step, element) {
    	var okToDisplay = true;
    	if (step.target != null) {
    		okToDisplay = step.target.visible;
    	}
    	if (okToDisplay) {
	    	if (!step.append) {
	    		$(element).empty();
	    	}
	    	$(element).append(content);
    	}
    }

})(jQuery);
