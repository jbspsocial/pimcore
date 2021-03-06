/**
 * Pimcore
 *
 * This source file is available under two different licenses:
 * - GNU General Public License version 3 (GPLv3)
 * - Pimcore Enterprise License (PEL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) 2009-2016 pimcore GmbH (http://www.pimcore.org)
 * @license    http://www.pimcore.org/license     GPLv3 and PEL
 */

pimcore.registerNS("pimcore.document.tags.link");
pimcore.document.tags.link = Class.create(pimcore.document.tag, {

    initialize: function(id, name, options, data, inherited) {

        if (!data) {
            data = {};
        }

        this.defaultData = {
            type: "internal",
            path: "",
            parameters: "",
            anchor: "",
            accesskey: "",
            rel: "",
            tabindex: "",
            target: "",
            "class": "",
            attributes: ""
        };

        this.data = mergeObject(this.defaultData, data);

        this.id = id;
        this.name = name;
        this.setupWrapper();
        this.options = this.parseOptions(options);


        Ext.get(id).setStyle({
            display:"inline"
        });
        Ext.get(id).insertHtml("beforeEnd",'<span class="pimcore_tag_link_text">' + this.getLinkContent() + '</span>');

        var button = new Ext.Button({
            iconCls: "pimcore_icon_link pimcore_icon_overlay_edit",
            cls: "pimcore_edit_link_button",
            listeners: {
                "click": this.openEditor.bind(this)
            }
        });
        button.render(id);
    },

    openEditor: function () {

        // disable the global dnd handler in this editmode/frame
        window.dndManager.disable();

        this.window = pimcore.helpers.editmode.openLinkEditPanel(this.data, {
            empty: this.empty.bind(this),
            cancel: this.cancel.bind(this),
            save: this.save.bind(this)
        });
    },


    getLinkContent: function () {

        var text = "[" + t("not_set") + "]";
        if (this.data.text) {
            text = this.data.text;
        }
        if (this.data.path) {
            return '<a href="' + this.data.path + '" class="' + this.options["class"] + ' ' + this.data["class"] + '">' + text + '</a>';
        }
        return text;
    },

    onNodeDrop: function (target, dd, e, data) {
        var record = data.records[0].data;

        if(this.dndAllowed(data)){
            this.fieldPath.setValue(data.path);
            return true;
        } else {
            return false;
        }
    },

    onNodeOver: function(target, dd, e, data) {
        var record = data.records[0].data;

        if (this.dndAllowed(data)) {
            return Ext.dd.DropZone.prototype.dropAllowed;
        }
        else {
            return Ext.dd.DropZone.prototype.dropNotAllowed;
        }
    },

    dndAllowed: function(data) {

        if (data.elementType == "asset" && data.type != "folder") {
            return true;
        } else if (data.elementType == "document"
                            && (data.type=="page" || data.type=="hardlink"
                                                                            || data.type=="link")){
            return true;
        }
        return false;

    },

    save: function () {

        // enable the global dnd dropzone again
        window.dndManager.enable();

        var values = this.window.getComponent("form").getForm().getFieldValues();
        this.data = values;

        // close window
        this.window.close();

        // set text
        Ext.get(this.id).query(".pimcore_tag_link_text")[0].innerHTML = this.getLinkContent();

        this.reload();
    },

    reload : function () {
        if (this.options.reload) {
            this.reloadDocument();
        }
    },

    empty: function () {

        // enable the global dnd dropzone again
        window.dndManager.enable();

        // close window
        this.window.close();

        this.data = this.defaultData;

        // set text
        Ext.get(this.id).query(".pimcore_tag_link_text")[0].innerHTML = this.getLinkContent();
    },

    cancel: function () {

        // enable the global dnd dropzone again
        window.dndManager.enable();

        this.window.close();
    },

    getValue: function () {
        return this.data;
    },

    getType: function () {
        return "link";
    }
});