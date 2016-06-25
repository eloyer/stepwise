/**
 * Converts a Google Sheets document into Stepwise XML and
 * returns the results as a DOM element.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

	 	getXMLFromSheet: function(sheetId, success) {
	 		var me = this;
			var url = "https://spreadsheets.google.com/feeds/list/" + sheetId +"/1/public/values?alt=json";
			var script = $('<stepwise><title>Untitled</title><description></description><primaryCredits></primaryCredits><secondaryCredits></secondaryCredits><version>1</version><sequence repeat="+"></sequence></stepwise>');
			$.getJSON(url, function(data) {
				var entry = data.feed.entry;
				me.addCharactersFromEntry(script, entry[0]);
				me.addActionsFromEntries(script, entry);
				success(script[0]);
			});
		},

		addCharactersFromEntry: function(script, entry) {
			var i, id, character;
			var characterIds = [];
			for (i in entry) {
				if (i.indexOf("gsx$") != -1) {
					id = this.getCharacterIdFromProperty(i);
					if (characterIds.indexOf(id) == -1) {
						character = $('<character id="' + id + '"></character>');
						if (!this.getCharacterVisibilityFromProperty(i)) {
							character.attr("visible", "false");
						}
						script.append(character);
						characterIds.push(id);
					}
				}
			}
		},

		addActionsFromEntries: function(script, entries) {
			var me = this;
			var actions, group;
			$(entries).each(function() {
				actions = me.getActionsFromEntry(this);
				if (actions.length > 1) {
					group = $("<group></group>");
					$(actions).each(function() {
						group.append(this);
					})
					script.find("sequence").append(group);
				} else if (actions.length == 1) {
					script.find("sequence").append(actions[0]);
				}
			});	
		},

		getActionsFromEntry: function(entry) {
			var action,
				actions = [];
			for (var prop in entry) {
				if (this.propertyIsCharacterId(prop)) {
					id = this.getCharacterIdFromProperty(prop);
					action = this.getActionFromCell(entry[prop]);
					if (action != null) {
						action.attr("character", id);
						actions.push(action);
					}
				}
			}
			return actions;
		},

		propertyIsCharacterId: function(property) {
			return (property.indexOf("gsx$") != -1);
		},

		getCharacterIdFromProperty: function(property) {
			var str = property.substr(4);
			if (!this.getCharacterVisibilityFromProperty(property)) {
				str = str.substr(1, str.length-3);
			}
			return str;
		},

		getCharacterVisibilityFromProperty: function(property) {
			var str = property.substr(4);
			return !((str[0] == "(") && (str(str.length-1) == ")"));
		},

		getActionFromCell: function(cell) {
			if (cell != null) {
				if (cell.$t != "") {
					var temp = cell.$t.split("::");
					command = temp[0];
					content = temp[temp.length-1];
					var action;
					switch (command) {
						case "sing":
						action = $('<sing/>');
						break;
						default:
						action = $('<speak/>');
						break;
					}
					action.html(content);
					return action;
				}
			}
			return null;
		}

    };

    $.extend(true, $.fn.stepwise, extensionMethods);

})(jQuery);
