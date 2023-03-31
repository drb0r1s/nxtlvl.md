import Convert from "./Convert.js";

export default function generateTags(symbol, editClasses, custom) {
    let attributes = {};

    formatClasses();
    if(custom) formatCustom();
    
    let validSymbolTag = editClasses ? editClasses.tag ? editClasses.tag : symbol.tag : symbol.tag;
    const tags = { opened: formatOpenedTag(), closed: `</${validSymbolTag}>` };

    return tags;

    function formatClasses() {
        const clearMd = symbol.md.replace(/\\+/g, "");
    
        const defaultClasses = {
            group: Convert.camelToKebab(symbol.group),
            tag: symbol.tag,
            md: clearMd
        };
    
        const classes = {...defaultClasses, ...editClasses};
        let classContent = "nxtlvl";
    
        Object.values(classes).forEach(value => { classContent += ` ${value}` });
        attributes.class = classContent;
    }

    function formatCustom() {
        Object.keys(custom).forEach((key, index) => {
            const value = Object.values(custom)[index];
            const attributesValue = getAttributesValue(key);

            const validValue = attributesValue ? `${attributesValue} ${value}` : value;
            attributes = {...attributes, [Convert.camelToKebab(key)]: validValue};
        });

        function getAttributesValue(attributesKey) {
            let result = null;
            
            Object.keys(attributes).forEach((key, index) => {
                if(Convert.kebabToCamel(attributesKey) === key) result = Object.values(attributes)[index];
            });

            return result;
        }
    }

    function formatOpenedTag() {
        let tag = `<${validSymbolTag}`;

        Object.keys(attributes).forEach((key, index) => {
            const value = Object.values(attributes)[index];
            tag += ` ${key}="${value}"`;
        });

        tag += ">";
        return tag;
    }
}