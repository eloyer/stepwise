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

    function AbstractEffect(options) {
        this.options = {
            useCharacterNames: true,
            createBreakTags: true,
            includeTemporal: true,
            includeEnvironmental: true,
            includeGeographic: true
        };
        $.extend(this.options, options);
        this.bindings = [];
        this.lastCharacter = null;
    }

    AbstractEffect.prototype.bindings = null;

    AbstractEffect.prototype.bindToInstance = function(stepwiseInstance) {
    	var me = this;
    	this.instance = stepwiseInstance;
        this.visibleCharacterCount = this.getVisibleCharacterCount();
        $(this.instance.element).bind("executeStep", function(event, step) {
            var bindings = me.eligibleBindingsForStep(step);
            for (var i in bindings) {
                switch (step.command) {

                    case "speak":
                    case "narrate":
                    case "think":
                    me.displayStep(step, bindings[i].element, me.parseCharacterAction(step));
                    break;

                    case "setlocation":
                    if (me.options.includeGeographic) {
                        me.displayStep(step, bindings[i].element, '<br />' + step.target.name);
                    }
                    break;

                    case "settemperature":
                    if (me.options.includeEnvironmental) {
                       me.displayStep(step, bindings[i].element, '<br />' + me.parseTemperature(step));
                    }
                    break;

                    case "setweather":
                    // do nothing
                    break;

                    case "setdate":
                    if (me.options.includeTemporal) {
                        me.displayStep(step, bindings[i].element, '<br />' + step.date.toDateString());
                    }
                    break;

                    case "settime":
                    if (me.options.includeTemporal) {
                        me.displayStep(step, bindings[i].element, '<br />' + step.date.toLocaleTimeString());
                    }
                    break;

                }                
            }

	    });
    }

    AbstractEffect.prototype.getVisibleCharacterCount = function() {
        var count = 0;
        var i, n = this.instance.score.characters.length;
        for (i=0; i<n; i++) {
            if (this.instance.score.characters[i].visible) {
                count++;
            }
        }
        return count;
    }

    AbstractEffect.prototype.parseCharacterAction = function(step) {
        var text = step.content;
        if (this.options.useCharacterNames && (this.visibleCharacterCount > 1)) {
            var currentCharacter = step.target;
            if (currentCharacter.visible) {
                var isNewCharacter = (currentCharacter != this.lastCharacter);
                if (isNewCharacter) {
                    switch (step.command) {

                        case 'speak':
                        case 'narrate':
                        text = '<br />' + currentCharacter.fullName.toUpperCase() + ": " + text;
                        break;

                        case 'think':
                        text = '<br />' + currentCharacter.fullName.toUpperCase() + ": [" + text + "]";
                        break;

                    }
                    this.lastCharacter = currentCharacter;
                }
            }
        }
        if (this.options.createBreakTags) {
            text = text.replace(/(?:\\r\\n|\\r|\\n)/g, '<br />');
        }
        return text;
    }

    AbstractEffect.prototype.parseTemperature = function(step) {
        var text = step.content + "°";
        switch (step.units) {
            
            case TemperatureUnits.CELSIUS:
            text = '<br />' + text + "C";
            break;
                
            case TemperatureUnits.FAHRENHEIT:
            text = '<br />' + text + "F";
            break;
            
        }
        return text;
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

    AbstractEffect.prototype.displayStep = function(step, element, processedContent) {
    	var okToDisplay = true;
    	if (step.target != null) {
    		okToDisplay = step.target.visible;
    	}
    	if (okToDisplay) {
	    	if (!step.append) {
	    		$(element).empty();
	    	}
	    	$(element).append(processedContent);
    	}
    }

})(jQuery);
