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
				script.find('title').text(data.feed.title.$t);
				script.find('primaryCredits').text(data.feed.author[0].name.$t);
				var entry = data.feed.entry;
				me.addMetadataFromEntry(script, entry[0]);
				me.addCharactersFromEntry(script, entry[0]);
				me.addActionsFromEntries(script, entry);
				success(script[0]);
			});
		},

		addCharactersFromEntry: function(script, entry) {
			var i, id, character;
			var characterIds = [];
			for (i in entry) {
				if (this.propertyIsColumnHeader(i)) {
					id = this.getCharacterIdFromProperty(i);
					if ((characterIds.indexOf(id) == -1) && !this.characterIdIsRestricted(id)) {
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

		propertyIsColumnHeader: function(property) {
			return (property.indexOf("gsx$") != -1);
		},

		characterIdIsRestricted: function(id) {
			return (["pulse"].indexOf(id.toLowerCase()) != -1);
		},

		addMetadataFromEntry: function(script, entry) {
			var i, temp;
			for (i in entry) {
				if (this.propertyIsColumnHeader(i)) {
					var str = i.substr(4);
					switch (str) {

						case "pulse":
						temp = entry[i].$t.split("/");
						var element = $('<pulse beatsPerMinute="' + temp[0] + '" pulsesPerBeat="' + temp[1] +'"/>');
						if (temp.length > 2) {
							element.attr("swing", temp[2]);
						}
						script.append(element);
						break;

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
				me = this;
			for (var prop in entry) {
				if (this.propertyIsCharacterId(prop)) {
					id = this.getCharacterIdFromProperty(prop);
					if (entry[prop] != null) {
						var subActions = entry[prop].$t.split("\n");
						$(subActions).each(function() {
							action = me.getActionFromCell(this);
							if (action != null) {
								action.attr("character", id);
								actions.push(action);
							}
						});
					}
				}
			}
			return actions;
		},

		propertyIsCharacterId: function(property) {
			return ((property.indexOf("gsx$") != -1) && !this.characterIdIsRestricted(property.substr(4)));
		},

		getCharacterIdFromProperty: function(property) {
			var str = property.substr(4);
			if (!this.getCharacterVisibilityFromProperty(property)) {
				str = str.substr(0, str.length-7);
			}
			return str;
		},

		getCharacterVisibilityFromProperty: function(property) {
			return !(property.indexOf("-hidden") == (property.length - 7));
		},

		getActionFromCell: function(cell) {
			if (cell != "") {
				var temp,
					append = false;
				temp = cell.split("::");
				command = temp[0];
				content = temp[temp.length-1];
				if (content[0] == "&") {
					append = true;
					content = content.substr(1);
				}
				if (content.indexOf("+") != -1) { 
					temp = content.split("+");
					var delay = parseInt(temp[temp.length-1]);
					if (!isNaN(delay)) {
						temp.pop();
					}
					content = temp.join("+");
				}
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
				if (append) {
					action.attr("append","true");
				}
				if (!isNaN(delay)) {
					action.attr("delay", delay);
				}
				return action;
			}
			return null;
		}

    };

    $.extend(true, $.fn.stepwise, extensionMethods);

})(jQuery);
