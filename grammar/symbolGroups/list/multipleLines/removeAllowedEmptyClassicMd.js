export default function removeAllowedEmptyClassicMd(innerContent, symbol) {
    if(symbol.tag !== "blockquote" && symbol.tag !== "details") return innerContent;
    
    let newInnerContent = "";
    
    const lines = innerContent.split("\n");
    const emptyLine = /^[<>\s]+$/g

    lines.forEach((line, index) => {
        const noBrLine = line.substring(line.length - 4) === "<br>" ? line.substring(0, line.length - 4) : line;
        
        if(noBrLine.match(emptyLine)) newInnerContent += `<br>${index === lines.length - 1 ? "" : "\n"}`;
        else newInnerContent += `${line}${index === lines.length - 1 ? "" : "\n"}`;
    });

    return newInnerContent;
}