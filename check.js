async function getGamesList() {
    const apiKey = "pxn_live_d16507916f4900f9593d00a6794b55c9";
    
    try {
        const response = await fetch("https://gorqunkfwiddhmihrkcv.supabase.co/functions/v1/reseller-topup-api/v1/games", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        const data = await response.json();
        console.log("=== Games List ===");
        console.log(JSON.stringify(data, null, 2)); 
    } catch (error) {
        console.error("Error:", error);
    }
}

getGamesList();