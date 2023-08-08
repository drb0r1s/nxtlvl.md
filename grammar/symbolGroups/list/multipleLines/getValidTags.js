import StartSpaces from "../../../../functions/StartSpaces.js";
import isSpecial from "./isSpecial.js";
import generateTags from "../../../../functions/generateTags.js";

export default function getValidTags(content, symbol, pair, isInner) {
    const md = { default: "", range: "", custom: "" };

    switch(symbol.tag) {
        case "blockquote":
            md.default = ">";
            break;
        case "details":
            md.default = "<";
            break;
        case "ol":
        case "ul":
            const specialSymbol = isSpecial(content, symbol);
            
            if(specialSymbol) {
                if(symbol.tag === "ol") md.default = specialSymbol.substring(0, specialSymbol.length - 1);
                else md.default = specialSymbol;
            }

            else {
                const trimmedContent = content.trim();

                const stopSymbol = symbol.tag === "ol" ? "." : " ";
                let stop = false;

                for(let i = 0; i < trimmedContent.length; i++) {
                    if(trimmedContent[i] === stopSymbol) stop = true; 
                    if(!stop) md.default += trimmedContent[i];
                }
            }

            md.default = md.default.trim();

            break;
        default: ;
    }

    if(symbol.tag === "ol") {
        const lines = content.split("\n");
        
        if(!lines[lines.length - 1]) lines.pop();
        if(lines.length <= 1) return generateTags(symbol, { md: md.default, ...getCustomMd() }, { start: md.default });
        
        const defaultSpaces = StartSpaces.count(lines[0]);

        let counter = parseInt(md.default) - 1;
        const innerSpecial = [];
        
        lines.forEach((line, index) => {
            const specialSymbol = isSpecial(line, symbol);
            const specialSymbolType = line[0] === "(" ? "opened" : "closed";
            
            if(!index && specialSymbol) return;

            if(specialSymbol && specialSymbolType === "opened") innerSpecial.push(specialSymbol);
            if(innerSpecial.length > 0) return;
            if(specialSymbol && specialSymbolType === "closed") innerSpecial.pop();

            if(defaultSpaces === StartSpaces.count(line)) counter++;
        });

        md.range = `${md.default}-${counter}`;
    }

    const tags = generateTags(symbol, { md: md.range ? md.range : md.default, ...getCustomMd() }, md.range ? { start: md.default } : null);
    return tags;

    function getCustomMd() {
        const result = { custom: "" };
        
        if(symbol.tag === "ol" || symbol.tag === "ul") {
            const innerListClasses = [];
            
            if(pair.inner) innerListClasses.push("has-inner-list");
            if(isInner) innerListClasses.push("inner-list");
    
            result.custom = innerListClasses.join(" ");
        }

        return result;
    }
}