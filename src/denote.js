/**
 * denote.js 0.0.1
 * Copyright 2018 Josh Panter
 * Licensed under GPLv3
 */
(function (global) {
    'use strict';

    /**
     * denote
     *
     * Render Quilljs Deltas to Tomboy Note XML
     *
     * @author Josh Panter <joshu@unfettered.net>
     *
     * @param {string|object} delta The Delta to parse.
     * @return {denote}
     */
    var denote = function denote(delta) {
        if (typeof delta === "string")
            this._delta = JSON.parse(delta);
        else if (typeof delta === "object")
            this._delta = delta;
        else
            throw new TypeError("The delta has an unsupported type. Only string and object supported.");

        this._tokens = denote.TOKENS;

        this._lines = [];
        this._Iline = 0;
        this._Itoken = 0;
        this._Ilist = 0;
        this._Tlist = [];
    };

    /**
     * The list of tags to use when tokenizing.
     * @var {object}
     */
    denote.TOKENS = {
	   line: "{content}\r\n",
       size: {
            small: "<size:small>{content}</size:small>",
            large: "<size:large>{content}</size:large>",
            huge: "<size:huge>{content}</size:huge>"
        },
        bold: "<bold>{content}</bold>",
        italic: "<italic>{content}</italic>",
        underline: "<underline>{content}</underline>",
        strike: "<strikethrough>{content}</strikethrough>",
        background: {
            yellow: "<highlight>{content}</highlight>"
        },
        code: "<monospace>{content}</monospace>",
        list: {
            bullet: "<list>{content}</list>",
            item: "<list-item dir=\"ltr\">{content}</list-item>"
        },
        linkURL: "<link:url>{content}</link:url>",
        linkInternal: "<link:internal>{content}</link:internal>"
    };

    /**
     * note tags to use when tokenizing.
     * @var {object}
     */
    denote.prototype._tokens = denote.TOKENS;

    /**
     * The Delta.
     * @var {object}
     */
    denote.prototype._delta = {};

    /**
     * Stores currently parsed lines.
     * @var {string[]}
     */
    denote.prototype._lines = [];

    /**
     * Save the current token index.
     * @var {number}
     */
    denote.prototype._Itoken = 0;

    /**
     * Save the current line index.
     * @var {number}
     */
    denote.prototype._Iline = 0;

    /**
     * Save the current list indent level.
     * @var {number}
     */
    denote.prototype._Ilist = 0;

    /**
     * Save the current list type.
     * @var {number}
     */
    denote.prototype._Tlist = 0;

    /**
     * Parses the Delta.
     * @return {denote}
     */
    denote.prototype.parse = function () {
        if (typeof this._delta.ops === "undefined")
            throw new Error("Malformed Delta, missing the 'ops' argument.");

        // Explore the Delta and parse all 'op'
        this._delta.ops.forEach(function (op) {
            // New lines...
            if (/^(\n+)$/.test(op.insert))
                this._linify(op);
            else {
                // Add new lines on ending "new line" character
                if (/^.+\\n$/.test(op.insert))
                    this._Iline++;
                // All the rest !
                else
                    this._tokenize(op);
            }

            // Count the number of 'op' explored
            this._Itoken++;
        }, this);

        return this;
    };

    /**
     * Returns the note value of the Delta.
     * @return {string}
     */
    denote.prototype.toNote = function () {
        for (var i = 0; i < this._lines.length; i++) {
            this._lines[i] = this._tokens.line
                .split("{content}").join(this._lines[i]);
        }
        return this._lines.join("");
    };

    /**
     * Tokenize
     * @param {object} op
     * @param {boolean} overwrite
     */
    denote.prototype._tokenize = function (op, overwrite) {
        var note = op.insert;

        if (typeof op.attributes === "object") {
            for (var token in op.attributes) {
                switch (token) {

                    case "size":
                       		 note = this._tokens.size[op.attributes.size]
                            .split("{content}").join(note);
						break;

                    case "bold":
                        if (op.attributes.bold)
                            note = this._tokens.bold
                            .split("{content}").join(note);
                        break;

                    case "italic":
                        if (op.attributes.italic)
                            note = this._tokens.italic
                            .split("{content}").join(note);
                        break;

                    case "underline":
                        if (op.attributes.underline)
                            note = this._tokens.underline
                            .split("{content}").join(note);
                        break;

                    case "strike":
                        if (op.attributes.strike)
                            note = this._tokens.strike
                            .split("{content}").join(note);
                        break;

                    case "background":
                       		 note = this._tokens.background[op.attributes.background]
                            .split("{content}").join(note);
						break;

                    case "code":
                        if (op.attributes.code)
                            note = this._tokens.code
                            .split("{content}").join(note);
                        break;

                    case "link":
						// look for a GUID/UUID at the end of the URL
						var regexGuid = /([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;
						var link = op.attributes.link;
						var isGuid = regexGuid.test(link);
						if (isGuid !== true) {
		                    note = this._tokens.linkURL
		                        .split("{content}").join(link);
						}
						else {
		                    note = this._tokens.linkInternal
		                        .split("{content}").join(note);
                        break;
						}
                }
            }
        } else {
            var parts = note.split("\n");
            if (parts.length > 1) {
                for (var i = 0; i < parts.length; i++) {
                    this._appendLine(parts[i], overwrite);
                    this._Iline++;
                }
                this._Iline--;
                return;
            }
        }

        this._appendLine(note, overwrite);
    };

    /**
     * Linify
     * @param {object} op
     */
    denote.prototype._linify = function (op) {
        op.lineCount = op.insert.split("\n").length - 1 > 1 ? op.insert.split("\n").length - 1 : 1;
        // If we have to apply a line style...
        if (typeof op.attributes !== "undefined") {
            op.insert = this._lines[this._Iline];
            // Don't break lists when linifying...
            if (typeof op.attributes.list !== "undefined") {
                this._listify(op);
            }
            // Tokenize the line...
            else {
                this._tokenize(op, true);
            }
        }
        for (var i = 0; i < op.lineCount; i++) {
            this._appendLine("");
            this._Iline++;
        }
    };

    /**
     * Listify FIXME: New list-items in Tomboy are <list-item dir="ltr">, I have not been able to impliment that without breaking indentation
     * @param {object} op
     */
    denote.prototype._listify = function (op) {
        // The current indent level
        var current_indent = op.attributes.indent || 0;

        // Store the type of list on every indent level
        var current_type = "list";

        // Ensuring that the current line has a value
        this._appendLine("");

        var current = "";

        if (this._Tlist[current_indent] && this._Ilist === current_indent && this._Tlist[current_indent] !== current_type) {
            current = this._lines[this._Iline].replace(new RegExp("^(.+)<\/(" + this._Tlist[current_indent] + ")>([^<]+)$"), "$3");
            this._lines[this._Iline] = this._lines[this._Iline].substr(0, this._lines[this._Iline].length - current.length);
            this._Iline++;
            this._appendLine(current, true);
        }

        this._Tlist[current_indent] = current_type;

        // We are adding a new item on the list...
        var note = this._lines[this._Iline].replace(new RegExp("<\/list-item><\/" + this._Tlist[this._Ilist] + ">([^<]+)$"), "</list-item><list-item>$1");

        // If we are currently in a list...
        if (/^<(list)>.+/.test(note)) {
            // If we are on the current list level
            if (current_indent === this._Ilist) {
                note += "</list-item><list-item>";
            }
            // If the current list level is greater than the last one, create a sub list
            else if (current_indent > this._Ilist) {
                current = note.replace(/^(.+)<list-item>([^<]+)$/g, "$2");
                note = note.substr(0, note.length - current.length - "</list-item><list-item>".length) + "<" + this._Tlist[current_indent] + "><list-item>" + current + "</list-item><list-item>";
            }
            // If the current list level is lower than the last one, back to the parent list
            else if (current_indent < this._Ilist) {
                current = note.replace(/^(.+)<list-item>([^<]+)$/g, "$2");
                note = note.substr(0, note.length - current.length - "<list-item>".length);
                var closing = "</list-item>";
                for (var i = this._Ilist; i > current_indent; i--) {
                    closing += "</" + this._Tlist[i] + "></list-item>";
                }
                closing += "<list-item>";
                note = note.replace(/<\/list-item>$/, closing) + current + "</list-item><list-item>";
            }
        }
        // Otherwise create a new list
        else {
            note = "<" + this._Tlist[current_indent] + "><list-item>" + note + "</list-item><list-item>";
        }

        // Suppose that we are on the last item and close the list
        if (current_indent === this._Ilist)
        note = note.replace(/<list-item>$/, "</" + this._Tlist[current_indent] + ">");

        // Update the note
        this._lines[this._Iline] = note;

        // Update the list indent level
        this._Ilist = current_indent;

        // Stay on the current line while we are parsing the list
        this._Iline -= op.lineCount;
    };

    /**
     * Append a text on the current line
     * @param {string} text
     * @param {boolean} overwrite
     */
    denote.prototype._appendLine = function (text, overwrite) {
        if (typeof this._lines[this._Iline] === "undefined" || overwrite === true)
            this._lines[this._Iline] = text;
        else
            this._lines[this._Iline] += text;
    };

    if (typeof define === 'function' && define.amd) {
        define([], function factory() { return denote; });
    } else if (typeof module === "object" && module.exports) {
        module.exports = denote;
    } else {
        global.denote = denote;
    }

})(this);
