import Remove from "../../Remove.js";
import generateTags from "../../../../../../functions/generateTags.js";
import addLi from "./addLi.js";
import nest from "../format/nest.js";
import getTagPositions from "./getTagPositions.js";

const Parse = { blockquote, details, list };
export default Parse;

function blockquote(pairs, content, symbol) {
    let newContent = content;
    let removingDifference = 0;
    
    pairs.forEach(pair => {
        const realPositions = { start: pair.start - removingDifference, end: pair.end - removingDifference };

        const pairContent = newContent.substring(realPositions.start, realPositions.end);
        let newPairContent = "";

        const lines = pairContent.split("\n");
        if(!lines[lines.length - 1]) lines.pop();

        const addNewLine = { current: false, next: false };
        const newLineRegex = /^[<>\s]*([0-9]+\.|[*+-]|<)\s+(?!$)/;

        lines.forEach((line, index) => {
            const noMdLine = Remove.md(line, symbol);
            
            if(index !== lines.length - 1) {
                const nextNoMdLine = Remove.md(lines[index + 1], symbol);
                addNewLine.next = nextNoMdLine.match(newLineRegex);
            }

            addNewLine.current = noMdLine.match(newLineRegex);
            const lineContent = addNewLine.current ? noMdLine : noMdLine.trim();

            if(!addNewLine.current && addNewLine.next) addNewLine.current = true;
            const additionalContent = index === lines.length - 1 ? "" : "\n";
            
            newPairContent += `${lineContent}${addNewLine.current ? additionalContent : ""}`;

            addNewLine.current = false;
            addNewLine.next = false;
        });

        const difference = Math.abs(pairContent.length - newPairContent.length);
        
        newContent = newContent.substring(0, realPositions.start) + newPairContent + newContent.substring(realPositions.end);
        removingDifference += difference;
    });

    return newContent;
}

function details(pairs, content, symbol) {
    let newContent = content;
    let addingDifference = 0;
    let asciiStatus = false;

    pairs.forEach(pair => {
        const pairContent = content.substring(pair.start, pair.end);
        let newPairContent = "";

        const tagPositions = getTagPositions("summary", pairContent);

        if(tagPositions) {
            const afterTag = pairContent.substring(tagPositions.end);
            const summaryEnd = afterTag.indexOf("</summary>");

            const afterTagSummaryContent = afterTag.substring(0, summaryEnd);
            if(!afterTagSummaryContent.includes("< ")) return;
        }
        
        const lines = pairContent.split("\n");
        if(!lines[lines.length - 1]) lines.pop();
        
        const isList = { current: false, next: false };
        const listRegex = /^[<>\s]*([0-9]+\.|[*+-])\s/;

        lines.forEach((line, index) => {
            const summaryContent = addSummary(line, index);
            
            if(index !== lines.length - 1) {
                const summaryContentNext = addSummary(lines[index + 1], index + 1);
                isList.next = summaryContentNext.match(listRegex);
            }

            isList.current = summaryContent.match(listRegex);
            if(!isList.current && isList.next) isList.current = true;

            const finalSummaryContent = isList.current ? summaryContent : summaryContent.trim();
            const additionalContent = index === lines.length - 1 ? "" : "\n";

            newPairContent += `${finalSummaryContent}${isList.current ? additionalContent : ""}`;

            isList.current = false;
            isList.next = false;
        });

        const pairContentDifference = Math.abs(pairContent.length - newPairContent.length);
        const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };

        newContent = newContent.substring(0, realPositions.start) + newPairContent + newContent.substring(realPositions.end);
        addingDifference += pairContentDifference;
    });

    return newContent;

    function addSummary(line, index) {
        let summaryContent = "";

        const tags = generateTags(symbol, { tag: "summary", md: "<" });
        const noMdLine = Remove.md(line, symbol);

        const asciiCase = { opened: "<pre class=\"nxtlvl one-line pre @\">", closed: "</pre>" };
        const ascii = { opened: noMdLine.startsWith(asciiCase.opened), closed: noMdLine.includes(asciiCase.closed) };

        if(ascii.opened && !asciiStatus) {
            summaryContent = `${tags.opened}${noMdLine}`;
            asciiStatus = true;
        }

        else if(ascii.closed && asciiStatus) {
            summaryContent = `${noMdLine}${tags.closed}`;
            asciiStatus = false;
        }

        else summaryContent = !index ? `${tags.opened}${noMdLine}${tags.closed}` : noMdLine;        

        return summaryContent;
    }
}

function list(pairs, content, symbol) {
    let newContent = content;
    let addingDifference = 0;

    const formattedPairs = nest(pairs);
    const { newContent: newContentValue, newAddingDifference: newAddingDifferenceValue } = addLi(formattedPairs, newContent, addingDifference, symbol);

    newContent = newContentValue;
    addingDifference = newAddingDifferenceValue;
    
    return newContent;
}