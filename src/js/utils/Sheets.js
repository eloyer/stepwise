/**
 * Converts a Google Sheets document into Stepwise XML and
 * returns the results as a DOM element.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

    	sequencesByCharacter: {},

	 	getXMLFromSheet: function(sheetId, success) {
	 		var me = this;
	 		var url;
	 		if (sheetId.indexOf('https://') == -1) {
				url = "https://spreadsheets.google.com/feeds/list/" + sheetId +"/1/public/values?alt=json";
	 		} else {
	 			url = sheetId;
	 		}
			var script = $('<stepwise><title>Untitled</title><description></description><primaryCredits></primaryCredits><secondaryCredits></secondaryCredits><version>1</version><sequence id="global" repeat="+"></sequence></stepwise>');
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
						character = $('<character id="' + id + '" firstName="' + id + '" lastName=""></character>');
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
				var globalGroup = $("<group></group>");
				actionsByCharacter = me.getActionsFromEntry(script, this);
				for (var prop in actionsByCharacter) {
					sequence = me.sequencesByCharacter[prop];
					if (sequence == null) {
						sequence = script.find('#global');
						group = globalGroup;
					} else {
						group = $("<group></group>");
					}
					actions = actionsByCharacter[prop];
					if (actions.length > 1) {
						$(actions).each(function() {
							group.append(this);
						})
					} else if (actions.length == 1) {
						group.append(actions[0]);
					}
					if (group.children().length > 0) {
						sequence.append(group);
					}
				}

			});
			// if the first character's actions are part of a custom sequence, then make sure that sequence
			// is the first to be executed by moving the global sequence to the end of the script
			var firstCharacterId = script.find('character').eq(0).attr('id');
			if (me.sequencesByCharacter[firstCharacterId] != null) {
				script.append(script.find('#global'));
			}
		},

		getActionsFromEntry: function(script, entry) {
			var action,
				actionsByCharacter = {},
				me = this;
			for (var prop in entry) {
				if (this.propertyIsCharacterId(prop)) {
					id = this.getCharacterIdFromProperty(prop);
					actionsByCharacter[id] = [];
					if (entry[prop] != null) {
						if (entry[prop].$t == ' ') {
							actionsByCharacter[id].push($('<nothing character="'+id+'"/>'));
						} else {
							var subActions = entry[prop].$t.split("\n");
							$(subActions).each(function() {
								action = me.getActionFromCell(this);
								if (action != null) {
									switch (action.type) {
										case 'config':
										me.sequencesByCharacter[id] = $('<sequence></sequence>').appendTo(script);
										if (action.payload.shuffle) {
											me.sequencesByCharacter[id].attr('shuffle', 'true');
										}
										if (action.payload.visible != null) {
											script.find('#'+id).attr('visible', action.payload.visible?'true':'false');
										} 
										if (action.payload.repeat != null) {
											me.sequencesByCharacter[id].attr('repeat', action.payload.repeat);
										}
										if (action.payload.grouping != null) {
											me.sequencesByCharacter[id].attr('grouping', action.payload.grouping);
										}
										if (action.payload.id != null) {
											me.sequencesByCharacter[id].attr('id', action.payload.id);
										}
										break;
										case 'command':
										actionsByCharacter[id].push(action.payload);
										break;
										case 'utterance':
										action.payload.attr("character", id);
										actionsByCharacter[id].push(action.payload);
										break;
									}
								}
							});
						}
					}
				}
			}
			return actionsByCharacter;
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
				var temp, command, content, source,
					append = false;
				if (cell[0] == '$') {
					temp = cell.split(':');
					command = temp.shift().toLowerCase();
					content = source = temp.join(':');
				} else {
					command = '$speak';
					content = source = cell;
				}
				var contentMatch = /[^+@]*/g;
				var contentResults = contentMatch.exec(content);
				if (contentResults != null) {
					content = contentResults[0];
				}
				if (content[0] == "&") {
					append = true;
					content = content.substr(1);
				}
				var delayMatch = /\+[\d](?![^+@])/g;
				var delayResults = delayMatch.exec(source);
				if (delayResults != null) {
					var delay = parseInt(delayResults);
				}
				var toneMatch = /@[^@+]+/g;
				var toneResults = toneMatch.exec(source);
				if (toneResults != null) {
					var tone = toneResults[0].substr(1);
				}
				var script,
					action = {};
				switch (command) {
					case '$sequence':
					temp = content.split(',');
					config = {
						shuffle: false
					};
					$(temp).each(function() {
						temp = this.trim().split(':');
						param = temp[0]
						switch (param) {
							case 'shuffle':
							config.shuffle = true;
							break;
							case 'hidden':
							config.visible = false;
							break;
							case 'repeat':
							config.repeat = temp[1].trim();
							break;
							case 'grouping':
							config.grouping = temp[1].trim();
							break;
							case 'id':
							config.id = temp[1].trim();
							break;
						}
					});
					action.type = 'config';
					action.payload = config;
					break;
					case '$sample':
					script = $('<sample>' + content + '</sample>');
					action.type = 'command';
					break;

					case '$setbackcolor':
					case '$setdate':
					case '$setforecolor':
					case '$setmidcolor':
					case '$settime':
					case '$setweather':
					script = $('<' + command.substr(1) + '/>');
					action.type = 'command';
					break;

					/*
					case '$setsequence':
					script = $('<setsequence/>');
					action.type = 'config';
					break;
					*/

					case '$sing':
					case '$speak':
					case '$nothing':
					script = $('<' + command.substr(1) + '/>');
					action.type = 'utterance';
					break;
				}
				if (script != null) {
					script.html(content);
					if (append) {
						script.attr("append","true");
					}
					if (!isNaN(delay)) {
						script.attr("delay", delay);
					}
					if (tone != null) {
						tone = this.parseTone(tone);
						script.attr("tone", tone);
					}
					action.payload = script;
				}
				return action;
			}
			return null;
		},

		parseTone: function(tone) {
			switch (tone) {

				case "pp":
				case "ppp":
				tone = "whisper";
				break;

				case "p":
				tone = "murmur";
				break;

				case "mp":
				case "mf":
				tone = "normal";
				break;

				case "f":
				tone = "shout";
				break;

				case "ff":
				case "fff":
				tone = "scream";
				break;

			}
			return tone;
		}

    };

    $.extend(true, $.fn.stepwise, extensionMethods);

})(jQuery);
