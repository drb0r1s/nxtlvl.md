export default function isSpecial(content, symbol) {
    let result = false;
    getMd().forEach(md => { if(content.startsWith(`(${md}<br>`) || content.startsWith(`${md})<br>`)) result = md });

    return result;

    function getMd() {
        const result = [];

        switch(symbol.tag) {
            case "blockquote":
                result.push(">");
                break;
            case "details":
                result.push("<");
                break;
            case "ol":
                const olMd = getOlMd();
                if(olMd) result.push(olMd);
                break;
            case "ul":
                result.push("*", "+", "-");
                break;
            default: ;
        }

        return result;

        function getOlMd() {
            let result = "";
            let i = content[0] === "(" ? 1 : 0;
        
            while(!isNaN(parseInt(content[i]))) {
                result += content[i];
                i++;
            }

            if(result) result += ".";
            return result;
        }
    }
}