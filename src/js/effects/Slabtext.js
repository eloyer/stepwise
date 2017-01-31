/**
 * Uses the Slabtext jQuery plugin to display text as headlines.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {
	 	Slabtext: Slabtext
    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function Slabtext(instance, options) {
        $.fn.stepwise.effects.AbstractEffect.call(this, instance, options);
    	this.contentBuffer = "";
        var localOptions = {
            clearHeight: -1,
            fontRatio: .78,
            maxFontSize: 999,
            minCharsPerLine: 5,
            viewportBreakpoint: 600
        };
        $.extend(this.options, localOptions);
        $.extend(this.options, options);
    }

    Slabtext.prototype = Object.create($.fn.stepwise.effects.AbstractEffect.prototype, {

        displayStep: {
            value: function(step, element, processedContent) {
                var okToDisplay = true;
                if ((step.target != null) && (step.target.visible != null)) {
                    okToDisplay = step.target.visible;
                }
                if (okToDisplay) {
                    if (!step.append && !this.options.appendOnly) {
                        this.contentBuffer = "";
                    }
                    if (this.options.clearHeight != -1) {
                        if ($(element).height() > this.options.clearHeight) {
                            this.contentBuffer = "";
                        }   
                    }
                    this.contentBuffer += processedContent;
                    $(element).text(this.contentBuffer);
                    $(element).slabText({
                        fontRatio: this.options.fontRatio,
                        maxFontSize: this.options.maxFontSize,
                        minCharsPerLine: this.options.minCharsPerLine,
                        viewportBreakpoint: this.options.viewportBreakpoint
                    });
                    this.callDisplayStepHandlers(step, element);
                }
            },
            enumerable: true,
            configurable: true,
            writable: true
        }

    });

    Slabtext.prototype.constructor = Slabtext;

})(jQuery);
