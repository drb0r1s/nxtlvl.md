import Remove from "../../Remove.js";
import generateTags from "../../../../../../functions/generateTags.js";

export default function spaceFix(pairContent, symbol) {
    let spaceFixedContent = "";

    const addNewLine = { current: false, next: false };
    
    const patternTarget = `([0-9]+\\.|[*+-]|<|>)\\s+(?!$)`;
    const newLinePattern = "^[<>\\s]*" + patternTarget;
    const newLineRegex = new RegExp(newLinePattern);

    const lines = pairContent.split("\n");
    if(!lines[lines.length - 1]) lines.pop();

    lines.forEach((line, index) => {
        const targetLine = getTargetLine(line, index);

        if(index !== lines.length - 1) {
            const targetLineNext = getTargetLine(lines[index + 1], index + 1);
            addNewLine.next = targetLineNext.match(newLineRegex) ? true : false;
        }

        addNewLine.current = targetLine.match(newLineRegex) ? true : false;
        const targetLineContent = addNewLine.current ? targetLine : targetLine.trim();

        if(!addNewLine.current && addNewLine.next) addNewLine.current = true;
        
        let newLineStatus = index !== lines.length - 1;
        if(addNewLine.current && line.startsWith(">") && (index === lines.length - 1)) newLineStatus = true;

        const newLine = newLineStatus ? "\n" : "";
        spaceFixedContent += `${targetLineContent}${addNewLine.current ? newLine : ""}`;

        addNewLine.current = false;
        addNewLine.next = false;
    });

    return spaceFixedContent;

    function getTargetLine(line, index) {
        const targetLine = symbol.tag === "blockquote" ? Remove.md(line, symbol) : addSummary(line, index);
        return targetLine;
    }
    
    function addSummary(line, index) {
        let summaryContent = "";
    
        const tags = generateTags(symbol, { tag: "summary", md: "<" });
        const noMdLine = Remove.md(line, symbol);
    
        const asciiCase = { opened: "<pre class=\"nxtlvl one-line pre @\">", closed: "</pre>" };
        const ascii = { opened: noMdLine.startsWith(asciiCase.opened), closed: noMdLine.includes(asciiCase.closed) };
    
        if(ascii.opened) summaryContent = `${tags.opened}${noMdLine}`;
        else if(ascii.closed) summaryContent = `${noMdLine}${tags.closed}`;
        else summaryContent = !index ? `${tags.opened}${noMdLine}${tags.closed}` : noMdLine;
    
        return summaryContent;
    }
}