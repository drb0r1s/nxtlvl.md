export default function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/gm, "\\$&");
}