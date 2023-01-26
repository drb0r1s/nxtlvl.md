export default function multipleLines({ content, symbol, matches }) {
    let parsedContent = content;
    
    const pairs = [];
    let pairTemplate = {};

    const specialSymbols = [];
    const clearMd = symbol.md.replace(/\\+/g, "");
    
    matches.forEach((match, index) => {
        if(match.md === `(${clearMd}<br>` || match.md === `${clearMd})<br>`) return specialSymbols.push(match);
        
        const eol = match.position + match.md.length;
        const nextMatch = matches[index + 1];

        if(Object.keys(pairTemplate).length === 0) pairTemplate = { start: match.position, end: eol };
        
        if(!nextMatch || (eol + 1 !== nextMatch.position)) {
            pairs.push(pairTemplate);
            pairTemplate = {};
        }
        
        else if(eol + 1 === nextMatch.position) pairTemplate = {...pairTemplate, end: nextMatch.position + nextMatch.md.length};
    });

    let addingDifference = 0;

    pairs.forEach(pair => addPairs(pair));

    const specialPairs = [];

    specialSymbols.forEach((specialSymbol, index) => {
        if(!specialSymbols[index + 1]) return;
        
        const isOpened = {
            current: specialSymbol.md[0] === "(",
            next: specialSymbols[index + 1] ? specialSymbols[index + 1].md[0] === "(" : false
        };
        
        if(isOpened.current && (isOpened.current !== isOpened.next)) specialPairs.push({ start: specialSymbol.position, end: specialSymbols[index + 1].position }); 
    });

    specialPairs.forEach(specialPair => addPairs(specialPair));

    const patterns = {
        classicMd: `(?<=<${symbol.tag}>)${symbol.md}\\s+(?!<br>)|^${symbol.md}\\s+(?!<br>)`,
        nxtlvlMd: `(?<=<${symbol.tag}>)\\(${symbol.md}(\\s+)?<br>|(?<=<\\/${symbol.tag}>)${symbol.md}\\)(\\s+)?<br>`
    };

    const remove = {
        classicMd: new RegExp(patterns.classicMd, "gm"),
        nxtlvlMd: new RegExp(patterns.nxtlvlMd, "gm")
    };

    parsedContent = parsedContent.replace(remove.classicMd, "");
    parsedContent = parsedContent.replace(remove.nxtlvlMd, "");

    return parsedContent;

    function addPairs(pair) {
        const tags = { opened: `<${symbol.tag}>`, closed: `</${symbol.tag}>` };
        const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };

        parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + parsedContent.substring(realPositions.start, realPositions.end) + tags.closed + parsedContent.substring(realPositions.end);
        addingDifference += tags.opened.length + tags.closed.length;
    }
}