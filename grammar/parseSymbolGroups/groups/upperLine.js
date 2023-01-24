import { SyntaxPatterns } from "../../Syntax.js";

export default function upperLine({ content, symbol, matches }) {
    let parsedContent = content;
    let addingDifference = 0;

    matches.forEach(match => {
        const tag = `<${symbol.tag}>${match.md}</${symbol.tag}>{delete}`;
        const realPosition = match.position + addingDifference;

        parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
        addingDifference += tag.length;
    });

    const matchesPattern = "{delete}.+";
    const removeMatches = new RegExp(matchesPattern, "gm");

    parsedContent = parsedContent.replace(removeMatches, "");

    const pattern = `^${symbol.md}{1,}(?=<br>)`;
    const removeMd = new RegExp(pattern, "gm");
    
    const removeMdMatches = [...parsedContent.matchAll(removeMd)];

    const upperLineSyntax = SyntaxPatterns.getSyntax({ group: "upperLine" });
    const ignoreSymbols = [];

    upperLineSyntax.forEach(symbol => ignoreSymbols.push(symbol.md));

    removeMdMatches.forEach(match => {
        if(match.index === 0) return;
        let stop = false;

        for(let i = match.index - 6; i >= 0; i--) if(!stop) {
            if(!parsedContent[i]) stop = true;


        }
    });


    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}