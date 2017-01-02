/**
 * Fades in each added bit of text.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	Stepfade: Stepfade

    };

    $.extend(true, $.fn.stepwise.effects, extensionMethods);

    function Stepfade(options) {
        $.fn.stepwise.effects.AbstractEffect.call(this);
        var localOptions = {
            fadeDuration: 250,
            appendOnly: false
        };
        $.extend(this.options, localOptions);
        $.extend(this.options, options);
    }

    Stepfade.prototype = Object.create($.fn.stepwise.effects.AbstractEffect.prototype, {

        displayStep: {
            value: function(step, element, processedContent) {
                var okToDisplay = true;
                if ((step.target != null) && (step.target.visible != null)) {
                    okToDisplay = step.target.visible;
                }
                if (processedContent == null) {
                    okToDisplay = false;
                }
                if (okToDisplay) {
                    if (!step.append && !this.options.appendOnly) {
                        $(element).empty();
                    }
                    var content = $('<span>' + processedContent + '</span>');
                    if ((step.tone != "normal") && (step.tone != null)) {
                        content.addClass('tone-'+step.tone);
                    }
                    $(element).append(content);
                    content.css('opacity',0).animate({left: '+=25px',opacity: 1}, this.options.fadeDuration);
                    this.callDisplayStepHandlers(step, content);
                }
            },
            enumerable: true,
            configurable: true,
            writable: true
        }

    });

    Stepfade.prototype.constructor = Stepfade;

})(jQuery);
