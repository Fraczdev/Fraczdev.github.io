export async function getDiscordGifUrl() {
    try {
        const response = await fetch("/.netlify/functions/getGifUrl");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.gifUrl;
    } catch (error) {
        console.warn("Discord GIF fetch failed:", error.message);
        return null;
    }
}