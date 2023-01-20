import { SyntaxPatterns } from "../../Syntax.js";

export default function classic({ content, symbol, matches }) {
    let parsedContent = content;
    let addingDifference = 0;
    
    matches.forEach((match, index) => {
        const tag = `<${index % 2 === 0 ? "" : "/"}${symbol.tag}>`;
        const realPosition = match.position + addingDifference;

        parsedContent = parsedContent.substring(0, realPosition) + tag + parsedContent.substring(realPosition);
        addingDifference += tag.length;
    });

    const pattern = SyntaxPatterns.getPattern("classic", symbol);
    const removeMd = new RegExp(pattern, "gm");

    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}