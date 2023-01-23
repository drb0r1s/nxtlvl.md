export default function multipleLines({ content, symbol, matches }) {
    let parsedContent = content;
    
    const pairs = [];
    let pairTemplate = {};

    console.log(matches)

    matches.forEach((match, index) => {
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

    pairs.forEach(pair => {
        const tags = { opened: `<${symbol.tag}>`, closed: `</${symbol.tag}>` };
        const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };

        parsedContent = parsedContent.substring(0, realPositions.start) + tags.opened + parsedContent.substring(realPositions.start, realPositions.end) + tags.closed + parsedContent.substring(realPositions.end);
        addingDifference += tags.opened.length + tags.closed.length;
    });

    const pattern = `((?<=<${symbol.tag}>)${symbol.md}|^${symbol.md})(\\s+)?(<br>)?`;
    const removeMd = new RegExp(pattern, "gm");

    console.log([...parsedContent.matchAll(removeMd)])

    parsedContent = parsedContent.replace(removeMd, "");

    return parsedContent;
}