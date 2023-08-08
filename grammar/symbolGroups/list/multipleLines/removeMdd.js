import Match from "../../../../functions/Match.js";

export default function removeMd(content, symbol, removeLastBrStatus) {
    let newContent = content;
    
    const patterns = {
        classicMd: "((?<=<blockquote.+\">)>(\\s*(?!\\s*[0-9]+\\.\\s+|\\s*\\*|\\s*\\+|\\s*-)?)|^>(\\s*(?!\\s*[0-9]+\\.\\s+|\\s*\\*|\\s*\\+|\\s*-))?)(?!(<br>|$))",
        nxtlvlMd: `\\(${symbol.md}\\s*<br>(?=<${symbol.tag}.+">)|(?<=<\\/${symbol.tag}>)${symbol.md}\\)\\s*<br>`
    };

    const remove = {
        classicMd: new RegExp(patterns.classicMd, "gm"),
        nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
    };
    
    newContent = newContent.replace(remove.classicMd, "");
    newContent = newContent.replace(remove.nxtlvlMd, "");

    if(removeLastBrStatus) removeLastBr();

    return newContent;
    
    function removeLastBr() {
        const targets = symbol.tag === "blockquote" ? ["blockquote"] : ["details", "summary"];
        
        targets.forEach(target => {
            const lastBrRegex = new RegExp(`(?<!\\s*<br>\\s*)<br>\\s*</${target}>`,"gm");
            const lastBrTags = Match.all(newContent, lastBrRegex);

            let removingDifference = 0;

            lastBrTags.forEach(lastBrTag => {
                const realPosition = lastBrTag.positions.start - removingDifference;
                const additional = { brTag: 4, newLine: target === "blockquote" ? lastBrTag.content.includes("\n") ? 1 : 0 : 0 };

                newContent = newContent.substring(0, realPosition) + newContent.substring(realPosition + additional.brTag + additional.newLine);
                removingDifference += additional.brTag + additional.newLine;
            });
        });
    }
}