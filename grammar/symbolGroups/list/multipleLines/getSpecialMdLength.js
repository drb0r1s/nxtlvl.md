export default function getSpecialMdLength(specialSymbol) {
    if(!specialSymbol) return 0;

    const elements = {
        start: "(",
        md: specialSymbol,
        break: "<br>"
    };

    let length = 0;
    Object.values(elements).forEach(element => { length += element.length });

    return length;
}