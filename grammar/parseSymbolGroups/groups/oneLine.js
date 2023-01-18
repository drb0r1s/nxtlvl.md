export default function oneLine(content, symbol) {
    let parsedContent = content;
    
    const matches = parsedContent.match(symbol.pattern) || [];
    
    matches.forEach(match => {
        if(symbol.tag === "h") parsedContent = parsedContent.replace(match, `<h${match.trim().length}>`);
        else parsedContent = parsedContent.replace(match, `<${symbol.tag}>`);
    });
            
    const positions = {
        start: [...parsedContent.matchAll(/^<(h[1-6]|blockquote)>/gm)],
        end: [...parsedContent.matchAll(/(?<=^<(h[1-6]|blockquote)>.*)<br>/gm)]
    };
        
    let lineEnd = {};

    positions.start.forEach((startTag, index) => {
        const tag = startTag[0].substring(1, startTag[0].length - 1);
        lineEnd = {...lineEnd, [tag]: positions.end[index].index};
    });

    let addingDifference = 0;

    Object.keys(lineEnd).forEach((tagName, index) => {
        const tag = `</${tagName}>`;
        const position = Object.values(lineEnd)[index] + addingDifference;

        parsedContent = parsedContent.substring(0, position) + tag + parsedContent.substring(position);

        addingDifference += tag.length;
    });

    return parsedContent;
}