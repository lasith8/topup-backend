const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ඔයාගේ අලුත් API Key එක මෙතන දාන්න (pxn_live_ අකුරු වලින් පටන් ගන්න එක)
const apiKey = "pxn_live_d16507916f4900f9593d00a6794b55c9"; 
const API_BASE_URL = "https://gorqunkfwiddhmihrkcv.supabase.co/functions/v1/reseller-topup-api/v1";

// 1. පාරිභෝගිකයාගේ නම සෙවීම (Chamidu's API භාවිතයෙන්)
app.post('/api/verify-player', async (req, res) => {
    const { playerId } = req.body;

    try {
        // Chamidu ගේ API Link එක සහ ඔයාගේ API Key එක
        const CHAMIDU_API_URL = `https://api.chamindu.site/api/v1/freefire/stalk?uid=${playerId}&api_key=chama_api_c9874780f49a6f66d0e3fb70eb9acecb`; 
        
        const response = await fetch(CHAMIDU_API_URL);
        const data = await response.json();

        // API එකෙන් සාර්ථකව දත්ත ආවා නම් (status: true)
        if (data.status === true && data.data && data.data.nickname) {
            return res.json({ 
                success: true, 
                checked: true, 
                nickname: data.data.nickname 
            });
        } else {
            return res.json({ 
                success: false, 
                message: "ID එක වැරදියි හෝ නම සොයාගත නොහැක." 
            });
        }

    } catch (error) {
        console.error("Lookup Error:", error);
        res.status(500).json({ success: false, message: "Server Communication Error" });
    }
});

// 2. ඩයමන්ඩ් යැවීම (Orders API)
app.post('/api/place-order', async (req, res) => {
    const { playerId, gameId, productId } = req.body;
    const idempotencyKey = crypto.randomUUID(); 

    console.log(`[Order Processing] Player: ${playerId} | Product: ${productId}`);

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({
                game: gameId,
                player_id: playerId,
                items: [
                    { package_id: productId, quantity: 1 } // මෙතන id වෙනුවට package_id ලෙස වෙනස් කළා
                ]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Top-up අසාර්ථකයි:", data.error);
            return res.status(response.status).json({ 
                success: false, 
                message: data.error?.message || data.error || "Top-up failed" 
            });
        }

        console.log("Top-up එක සාර්ථකයි!");
        res.json({ success: true, message: "ඩයමන්ඩ් සාර්ථකව යවන ලදී!" });

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = app;

app.listen(PORT, () => {
    console.log(`Auto Top-up Server එක http://localhost:${PORT} හි ධාවනය වේ...`);
});