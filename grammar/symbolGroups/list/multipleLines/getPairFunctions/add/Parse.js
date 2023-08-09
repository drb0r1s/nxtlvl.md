import Remove from "../../Remove.js";
import generateTags from "../../../../../../functions/generateTags.js";
import addLi from "./addLi.js";
import nest from "../format/nest.js";
import getTagPositions from "./getTagPositions.js";

const Parse = { collapsible, list };
export default Parse;

function collapsible(pairs, content, symbol) {
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

        lines.forEach((line, index) => {
            const summaryContent = addSummary(line, index);
            newPairContent += `${summaryContent}${index === lines.length - 1 ? "" : "\n"}`;
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