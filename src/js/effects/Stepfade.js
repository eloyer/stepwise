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

    function Stepfade() {
        $.fn.stepwise.effects.AbstractEffect.call(this);
    }

    Stepfade.prototype = Object.create($.fn.stepwise.effects.AbstractEffect.prototype, {

        displayStep: {
            value: function(step, element) {
                var okToDisplay = true;
                if (step.target != null) {
                    okToDisplay = step.target.visible;
                }
                if (okToDisplay) {
                    if (!step.append) {
                        $(element).empty();
                    }
                    var text = step.content.replace(/(?:\\r\\n|\\r|\\n)/g, '<br />');
                    var content = $('<span>' + text + '</span>');
                    $(element).append(content);
                    content.css('opacity',0).animate({left: '+=25px',opacity: 1}, 250);
                }
            },
            enumerable: true,
            configurable: true,
            writable: true
        }

    });

    Stepfade.prototype.constructor = Stepfade;

})(jQuery);
