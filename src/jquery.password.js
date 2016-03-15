/*!
 * jquery.password.js
 * 
 * A handy jQuery plugin to allow you to check any password field live http://plugins.jquery.com/password/
 * Original author: @edmundgentle
 * Further changes, comments: @jheliker
 * 
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

; (function($, window, document, undefined) {
    'use strict';

    //Define global variables
    var pluginName = "password";
    var defaults = {
        minLength: 8,
        minAcceptableScore: 30,
        allowSpace: false,
        change: function() { },
        strengthIndicator: null,
        strengthIndicatorBars: '<div class="pw_strengthIndicator"><div class="strength weak">Weak</div><div class="strength medium">Medium</div><div class="strength strong">Strong</div></div>',
        personalInformation: [],
        checklist: null,
        dictionary: null,
        doubleType: null
    };
    //jQuery ($) global variables
    var $si = null;
    var $cl = null;
    var $dt = null;

    //Construct plugin
    function Plugin(element, options) {
        this.element = element;

        //Merge defaults and options into "settings"
        this.settings = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {

        init: function() {
            var $el = $(this.element);
            var settings = this.settings;
            
            //Parse through personalInformation and initialize an array within settings object
            $.each(settings.personalInformation, function(index, value) {
                if (typeof value == 'string') {
                    if ($(value).length > 0) {
                        settings.personalInformation[index] = $(value);
                    }
                }
            });
            //Initialize $dt if configured in settings 
            if (settings.doubleType != null) {
                if (typeof settings.doubleType == 'string') {
                    $dt = $(settings.doubleType);
                } else {
                    $dt = settings.doubleType;
                }
                $dt.on('keyup change', function() {
                    if ($cl != null) {
                        $cl.find('.pw_check_match').removeClass('pass');
                        if ($el.val() == $dt.val()) {
                            $cl.find('.pw_check_match').addClass('pass');
                        }
                    }
                });
            }
            var score = this.calculateScore($el, settings);
            if (settings.strengthIndicator != null) {
                if (typeof settings.strengthIndicator == 'string') {
                    $si = $(settings.strengthIndicator);
                } else {
                    $si = settings.strengthIndicator;
                }

                $si.html(settings.strengthIndicatorBars);

                this.updateStrengthIndicator(score, $si);
            }
            if (settings.checklist != null) {
                if (typeof settings.checklist == 'string') {
                    $cl = $(settings.checklist);
                } else {
                    $cl = settings.checklist;
                }
                $cl.html('<div class="pw_checklist"><ul><li class="pw_check_length">Length of at least ' + settings.minLength + ' characters</li><li class="pw_check_uclc">Contains uppercase and lowercase letters</li><li class="pw_check_nums">Contains numbers</li><li class="pw_check_special">Contains special characters</li><li class="pw_check_spaces">Doesn\'t contain spaces</li><li class="pw_check_personal">Doesn\'t contain personal information</li><li class="pw_check_dictionary">Doesn\'t contain common password words</li><li class="pw_check_match">Passwords match</li></ul></div>');
                if (settings.personalInformation.length == 0) {
                    $cl.find('.pw_check_personal').remove();
                }
                if (settings.allowSpace) {
                    $cl.find('.pw_check_spaces').remove();
                }
                if (settings.minLength < 1) {
                    $cl.find('.pw_check_length').remove();
                }
                if (settings.dictionary == null) {
                    $cl.find('.pw_check_dictionary').remove();
                }
                if ($dt == null) {
                    $cl.find('.pw_check_match').remove();
                }
                this.updateChecklist($el, $dt, score, $cl);
            }
            if (settings.dictionary != null) {
                $.getJSON(settings.dictionary, function(json) {
                    settings.dictionaryWords = json;
                });
            }
            //Maintain ref to "this" for on callback below
            var self = this;
            $el.on('keyup change', function(el) {
                var score = self.calculateScore($el, settings);
                if ($si != null) {
                    self.updateStrengthIndicator(score, $si);
                }
                if ($cl != null) {
                    self.updateChecklist($el, $dt, score, $cl);
                }
                settings.change.call(this, score[0], score[1], score[2]);
            });

            settings.change.call(this, score[0], score[1], score[2]);
        }, //end init function
        updateChecklist: function($el, $dt, score, $cl) {
            $cl.find('.pass').removeClass('pass');
            if ($.inArray('TOO_SHORT', score[1]) == -1) {
                $cl.find('.pw_check_length').addClass('pass');
            }
            if ($.inArray('NO_UPPERCASE_LETTERS', score[1]) == -1 && $.inArray('NO_LOWERCASE_LETTERS', score[1]) == -1) {
                $cl.find('.pw_check_uclc').addClass('pass');
            }
            if ($.inArray('NO_NUMBERS', score[1]) == -1) {
                $cl.find('.pw_check_nums').addClass('pass');
            }
            if ($.inArray('NO_SPECIAL_CHARACTERS', score[1]) == -1) {
                $cl.find('.pw_check_special').addClass('pass');
            }
            if ($.inArray('CONTAINS_SPACE', score[1]) == -1) {
                $cl.find('.pw_check_spaces').addClass('pass');
            }
            if ($.inArray('CONTAINS_PERSONAL_INFO', score[1]) == -1) {
                $cl.find('.pw_check_personal').addClass('pass');
            }
            if ($.inArray('CONTAINS_COMMON_WORD', score[1]) == -1) {
                $cl.find('.pw_check_dictionary').addClass('pass');
            }
            if ($.inArray('PASSWORDS_DO_NOT_MATCH', score[1]) == -1) {
                $cl.find('.pw_check_match').addClass('pass');
            }
        }, //end updateChecklist function
        updateStrengthIndicator: function(score, $si) {
            $si.find('.pass').removeClass('pass');
            if (score[2]) {
                $si.find('.weak').addClass('pass');
                if (score[0] >= 50) {
                    $si.find('.medium').addClass('pass');
                }
                if (score[0] >= 80) {
                    $si.find('.strong').addClass('pass');
                }
            }
        }, //end updateStrengthIndicator function
        calculateScore: function($el, settings) {
            var s = $el.val();
            if (typeof settings == 'object') {
                var score = 0;
                var max_score = 90;
                var pass = true;
                var errors = [];
                if (s.length >= settings.minLength) {
                    score += 10;
                } else {
                    errors.push('TOO_SHORT');
                    pass = false;
                }
                if (s.match(/[A-Z]/g) != null) {
                    score += 10;
                } else {
                    errors.push('NO_UPPERCASE_LETTERS');
                }
                if (s.match(/[a-z]/g) != null) {
                    score += 10;
                } else {
                    errors.push('NO_LOWERCASE_LETTERS');
                }
                if (s.match(/[0-9]/g) != null) {
                    score += 10;
                } else {
                    errors.push('NO_NUMBERS');
                }
                if (!settings.allowSpace && s.match(/ /g) != null) {
                    errors.push('CONTAINS_SPACE');
                    pass = false;
                }
                if (s.match(/(\W|_)/g) != null) {
                    score += 10;
                } else {
                    errors.push('NO_SPECIAL_CHARACTERS');
                }
                //Check for personal information
                var pi = [];
                $.each(settings.personalInformation, function(index, value) {
                    if (typeof value != 'string') {
                        value = value.val().toString();
                    }
                    if (value.length > 0) {
                        var v = value.toLowerCase().split(' ');
                        $.each(v, function(p, q) {
                            pi.push(q);
                            var n = q.match(/[1-2][0-9]{3}/g);
                            if (n) {
                                pi.push(n[0].substring(2, 4));
                            }
                        });
                    }
                });
                var fpi = false;
                $.each(pi, function(index, value) {
                    var regex = new RegExp(value, "gi");
                    if (s.match(regex) != null) {
                        fpi = true;
                    }
                });
                if (fpi) {
                    errors.push('CONTAINS_PERSONAL_INFO');
                } else if (s.length > 5) {
                    score += 20;
                }
                //Check for dictionary words (if defined)
                var fdi = false;
                if (settings.dictionaryWords !== undefined) {
                    $.each(settings.dictionaryWords, function(index, value) {
                        var regex = new RegExp(value, "gi");
                        if (s.match(regex) != null) {
                            fdi = true;
                        }
                    });
                }
                if (fdi) {
                    errors.push('CONTAINS_COMMON_WORD');
                } else if (s.length > 5) {
                    score += 20;
                }
                //Check if passwords match
                if ($el.val() != $dt.val()) {
                    pass = false;
                    errors.push('PASSWORDS_DO_NOT_MATCH');
                }
                var score_percent = (score / max_score) * 100;
                if (score_percent < settings.minAcceptableScore) {
                    pass = false;
                }
                if (s.length == 0) {
                    pass = false;
                    errors.push('EMPTY');
                }
                if ($el.attr('name') !== undefined) {
                    var els = $('input[name="' + $el.attr('name') + '_pass"]');
                    if (els.length > 0) {
                        els.val(pass);
                    } else {
                        $el.after('<input type="hidden" name="' + $el.attr('name') + '_pass" value="' + pass + '" />');
                    }
                }
                
                return [score_percent, errors, pass];
            } else {
                return null;
            }
        } //end calculateScore function

    };

    // Wrapper to prevent against multiple instantiations
    $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
