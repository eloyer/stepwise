/**
 * Converts a Google Sheets document into Stepwise XML and
 * returns the results as a DOM element.
 *
 * @author Erik Loyer / http://erikloyer.com
 */

(function($) {

    var extensionMethods = {

    	sequencesByCharacter: {},
    	restrictedCharacterIds: ['metadata','pulse','comments','instructions'],

	 	getXMLFromSheet: function(sheetId, success, apiKey) {
      if (!apiKey) {
        console.log('The Google Sheets API v4 requires an API key to retrieve data.');
        return;
      }
	 		var me = this;
	 		var url;
	 		// sheetId contains a Google Sheets id
	 		if (sheetId.indexOf('https://') == -1) {
        url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheetId + "?includeGridData=true&key=" + apiKey;
			// or a Google Sheets edit URL
	 		} else if (sheetId.indexOf('edit#') != -1) {
				var temp = sheetId.split('/');
        url = "https://sheets.googleapis.com/v4/spreadsheets/" + temp[5] + "?includeGridData=true&key=" + apiKey;
  		// otherwise, assume this is a correctly formed Google Sheets JSON URL
	 		} else {
	 			url = sheetId;
	 		}
			var script = $('<stepwise><title>Untitled</title><description></description><primaryCredits></primaryCredits><secondaryCredits></secondaryCredits><version>1</version><sequence id="global" repeat="+"></sequence></stepwise>');
			$.getJSON(url, function(data) {
				script.find('title').text(data.properties.title);
				var rowData = data.sheets[0].data[0].rowData;
				me.addMetadataFromRows(script, rowData[0], rowData[1]);
				me.addCharactersFromRow(script, rowData[0]);
				me.addActionsFromRows(script, rowData);
			  me.trimTrailingEmptySteps(script);
				success(script[0]);
			});
		},

		trimTrailingEmptySteps: function(script) {
			var me = this;
			script.find('sequence').each(function() {
				var children = $(this).children();
				var element;
				var i, n = children.length;
				var indexOfFirstTrailingEmptyStep = -1;
				for (i=0; i<n; i++) {
					element = children.eq(i);
					if (me.isStepEmpty(element)) {
						if (indexOfFirstTrailingEmptyStep == -1) {
							indexOfFirstTrailingEmptyStep = i;
						}
					} else {
						indexOfFirstTrailingEmptyStep = -1;
					}
				}
				if (indexOfFirstTrailingEmptyStep != -1) {
					children.slice(indexOfFirstTrailingEmptyStep).remove();
				}
			});
		},

		propertyIsColumnHeader: function(property) {
			return (property.userEnteredValue.trim() != '');
		},

		characterIdIsRestricted: function(id) {
      return this.restrictedCharacterIds.indexOf(id.toLowerCase()) != -1;
			/*var isRestricted = false;
			$(this.restrictedCharacterIds).each(function() {
				if (this.indexOf(id.toLowerCase()) != -1) {
					isRestricted = true;
				}
			});
			return isRestricted;*/
		},

		addMetadataFromRows: function(script, topRow, secondRow) {
			var temp, param, value;
      topRow.values.forEach((value, index) => {
        if (value.userEnteredValue) {
          let str;
          if (value.userEnteredValue.stringValue) {
            str = value.userEnteredValue.stringValue.toLowerCase();
          } else {
            str = value.userEnteredValue.numberValue.toString();
          }
          switch (str) {

            case 'metadata':
            temp = secondRow.values[index].userEnteredValue.stringValue.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g); // split on commas outside of double quotes
            temp.forEach(item => {
              temp = item.trim().split(':');
              param = temp.shift();
              value = temp.join(':');
              value = value.replace(/^"|"$/g, '');
              switch (param) {
                case 'title':
                script.find('title').text(value.trim());
                break;
                case 'primaryCredits':
                script.find('primaryCredits').text(value.trim());
                break;
                case 'secondaryCredits':
                script.find('secondaryCredits').text(value.trim());
                break;
                case 'description':
                script.find('description').text(value.trim());
                break;
                case 'version':
                script.find('version').text(value.trim());
                break;
                case 'pulse':
                temp = value.split("/");
                var element = $('<pulse beatsPerMinute="' + temp[0] + '" pulsesPerBeat="' + temp[1] +'"/>');
                if (temp.length > 2) {
                  element.attr("swing", temp[2]);
                }
                script.append(element);
                break;
              }
            });
            break;

            case 'pulse':
            temp = secondRow.values[index].userEnteredValue.stringValue.split("/");
            var element = $('<pulse beatsPerMinute="' + temp[0] + '" pulsesPerBeat="' + temp[1] +'"/>');
            if (temp.length > 2) {
              element.attr("swing", temp[2]);
            }
            script.append(element);
            break;
          }
        }
      })
		},

		addActionsFromRows: function(script, rows) {
			var me = this;
			var actions, group;

      rows.forEach((row, index) => {
        if (index > 0) {
  				var globalGroup = $("<group></group>");
  				actionsByCharacter = me.getActionsFromRow(script, row);
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
        }
			});
			// if the first character's actions are part of a custom sequence, then make sure that sequence
			// is the first to be executed by moving the global sequence to the end of the script
			var firstCharacterId = script.find('character').eq(0).attr('id');
			if (me.sequencesByCharacter[firstCharacterId] != null) {
				script.append(script.find('#global'));
			}
			script.find('group').each(function() {
				if ($(this).children().length == 1) {
					$(this).children().unwrap();
				}
			})
		},

		getActionsFromRow: function(script, row) {
			var action,
				actionsByCharacter = {},
				me = this;
      this.characterData.forEach(character => {
        let id = character.id;
				actionsByCharacter[id] = [];
        if (row.values[character.column]) {
          let userEnteredValue = row.values[character.column].userEnteredValue;
          if (userEnteredValue) {
            if (userEnteredValue.stringValue == ' ') {
              actionsByCharacter[id].push($('<nothing character="'+id+'" explicit="true"/>'));
            } else if (userEnteredValue.stringValue == '') {
              actionsByCharacter[id].push($('<nothing character="'+id+'"/>'));
            } else {
              let subActionStr = userEnteredValue.stringValue;
              if (!subActionStr) {
                subActionStr = userEnteredValue.numberValue.toString();
              }
              var subActions = subActionStr.split("\n");
              subActions.forEach(subAction => {
                action = me.getActionFromCell(subAction);
                if (action != null) {
                  switch (action.type) {
                    case 'config':
                    for (var index in me.sequencesByCharacter) {
                      me.sequencesByCharacter[index].find('nothing').attr('explicit', 'true');
                    }
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
                    action.payload.attr("character", id);
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
			});
			return actionsByCharacter;
		},

		propertyIsCharacterId: function(property) {
			return ((property.indexOf("gsx$") != -1) && !this.characterIdIsRestricted(property.substr(4)));
		},

    getCharacterDataFromHeaderString: function(str, column) {
      let name = this.getCharacterNameFromHeaderString(str);
      let id = name.toLowerCase();
      let characterData = {
        id: id,
        firstName: name,
        column: column,
        visible: this.getCharacterVisibilityFromHeaderString(str)
      }
      return characterData;
    },

		getCharacterNameFromHeaderString: function(str) {
			if (!this.getCharacterVisibilityFromHeaderString(str)) {
				str = str.substr(0, str.length-7);
			}
			return str;
		},

		getCharacterVisibilityFromHeaderString: function(str) {
			return !((str.indexOf("-hidden") == (str.length - 7)) && str.indexOf("-hidden") != -1);
		},

		getActionFromCell: function(cell) {
			if (cell != "") {
				var temp, command, param, value, content, source,
					append = false;
				if (cell[0] == '$') {
					temp = cell.split(':');
					command = temp.shift().toLowerCase();
					content = source = temp.join(':');
				} else {
					command = '$speak';
					content = source = cell;
				}

				if (command != '$sequence') {
					var contentMatch = /[^+@]*/g;
					var contentResults = contentMatch.exec(content);
					if (contentResults != null) {
						content = contentResults[0];
					}
					if (content[0] == "&") {
						append = true;
						content = content.substr(1);
					}
				}

				var delayMatch = /\+([\d])*(.[\d]*)(?![^+@])/g;
				var delayResults = delayMatch.exec(source);
				if (delayResults != null) {
					var delay = parseFloat(delayResults);
				}

				var toneMatch = /@[^+@]+/g;
				var toneResults = toneMatch.exec(source);
				if (toneResults != null) {
					var tone = toneResults[0].substr(1);
				}

				/*var durationMatch = /=[^@+=]+/g;
				var durationResults = durationMatch.exec(source);
				if (durationResults != null) {
					var duration = durationResults[0].substr(1);
				}*/

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
						param = temp.shift();
						value = temp.join(':');
						switch (param) {
							case 'shuffle':
							config.shuffle = true;
							break;
							case 'hidden':
							config.visible = false;
							break;
							case 'repeat':
							config.repeat = value.trim();
							if (config.repeat == 'forever') {
								config.repeat = '+';
							}
							break;
							case 'grouping':
							config.grouping = value.trim();
							break;
							case 'id':
							config.id = value.trim();
							break;
						}
					});
					action.type = 'config';
					action.payload = config;
					break;

					case '$sample':
					case '$reset':
          content = content.trim();
					script = $('<' + command.substr(1) + '>' + content + '</' + command.substr(1) + '>');
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

					case '$option':
					temp = content.split(',');
					content = temp[0]
					script = $('<' + command.substr(1) + '>' + content + '</' + command.substr(1) + '>');
					config = {
						type: null,
						destination: null
					};
					$(temp).each(function() {
						temp = this.trim().split(':');
						param = temp.shift();
						value = temp.join(':');
						switch (param) {
							case 'type':
							config.type = value;
							break;
							case 'destination':
							config.destination = value;
							break;
						}
					});
					if (config.type) {
						script.attr('type', config.type);
					}
					if (config.destination != null) {
						script.attr('destination', config.destination);
					}
					action.type = 'command';
					action.payload = config;
					break;

					case '$setsequence':
					temp = content.split(',');
					content = temp[0]
					script = $('<' + command.substr(1) + '>' + content + '</' + command.substr(1) + '>');
					config = {
						atdate: null,
						autostart: false
					};
					$(temp).each(function() {
						temp = this.trim().split(':');
						param = temp.shift();
						value = temp.join(':');
						switch (param) {
							case 'atdate':
							config.atdate = value;
							break;
							case 'autostart':
							config.autostart = true;
							break;
						}
					});
					if (config.autostart) {
						script.attr('autostart', config.autostart);
					}
					if (config.atdate != null) {
						script.attr('atdate', config.atdate);
					}
					action.type = 'command';
					action.payload = config;
					break;

					case '$sing':
					case '$speak':
					case '$nothing':
					script = $('<' + command.substr(1) + '/>');
					action.type = 'utterance';
					break;

					default:
					script = $('<' + command.substr(1) + '/>');
					action.type = 'command';
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
					/*if (duration != null) {
						script.attr("duration", duration);
					}*/
					action.payload = script;
				}
				return action;
			}
			return null;
		},

		isStepEmpty: function(step) {
			var isEmpty = false;
			var me = this;
			if (step.is('nothing') && step.attr('explicit') != 'true') {
				isEmpty = true;
			} else if (step.is('group')) {
				isEmpty = true;
				var i, n = step.children().length;
				for (i=0; i<n; i++) {
					if (!me.isStepEmpty(step.children().eq(i))) {
						isEmpty = false;
						break;
					}
				}
			}
			return isEmpty;
		},

		addCharactersFromRow: function(script, topRow) {
			var id, name, character, characterData;
			var characterIds = [];
      this.characterData = []
      topRow.values.forEach((value, index) => {
        if (value.userEnteredValue) {
          let headerString = value.userEnteredValue.stringValue;
          if (!headerString) {
            headerString = value.userEnteredValue.numberValue.toString();
          }
          let characterData = this.getCharacterDataFromHeaderString(headerString, index);
  				if ((characterIds.indexOf(characterData.id) == -1) && !this.characterIdIsRestricted(characterData.id)) {
  					character = $('<character id="' + characterData.id + '" firstName="' + characterData.firstName + '"></character>');
  					if (!characterData.visible) {
  						character.attr("visible", "false");
  					}
  					script.append(character);
            this.characterData.push(characterData);
  					characterIds.push(characterData.id);
  				}
        }
			});
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
