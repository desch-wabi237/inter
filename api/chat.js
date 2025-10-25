// api/chat.js – Version Hugging Face Inference API corrigée
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 1. Définition des constantes sécurisées
    const HF_API_KEY = process.env.HF_API_KEY;
    // MODÈLE CORRIGÉ - Utilisation d'un modèle qui existe vraiment
    const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";
    const PROMO_CODE = "JAX72";
    const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
    const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
    const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

    // 2. Gestion CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Vérification de la clé API
    if (!HF_API_KEY) {
        console.error("❌ Clé API Hugging Face manquante");
        return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    // Extraction de la requête utilisateur
    let userQuery;
    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        userQuery = body.userQuery;
        
        if (!userQuery || typeof userQuery !== 'string') {
            return res.status(400).json({ error: 'Requête utilisateur invalide' });
        }
    } catch (error) {
        console.error("❌ Erreur de parsing du corps:", error);
        return res.status(400).json({ error: 'Format de requête invalide' });
    }

    // Prompt système
    const SYSTEM_PROMPT = `Vous êtes INTER PRONOSTIC, assistant pour les codes promo betting. Répondez en 3 phrases max. Code: ${PROMO_CODE}. Liens: WhatsApp ${WHATSAPP_LINK}, Telegram ${TELEGRAM_LINK}. Soyez concis et amical.`;

    // Construction du payload optimisé
    const payload = {
        inputs: `<s>[INST] ${SYSTEM_PROMPT}

Question: ${userQuery} [/INST]`,
        parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.9,
            repetition_penalty: 1.1,
            do_sample: true
        }
    };

    try {
        console.log("🔄 Appel à l'API Hugging Face...");

        const hfResponse = await fetch(MODEL_URL, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // Gestion robuste de la réponse
        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error("❌ Erreur Hugging Face:", hfResponse.status, errorText);
            return res.status(500).json({ 
                error: "Service temporairement indisponible",
                details: `Erreur ${hfResponse.status}: ${errorText}`
            });
        }

        const responseData = await hfResponse.json();

        // Extraction du texte généré
        let generatedText = '';
        if (Array.isArray(responseData) && responseData[0]?.generated_text) {
            generatedText = responseData[0].generated_text;
        } else if (responseData?.generated_text) {
            generatedText = responseData.generated_text;
        } else {
            console.error("❌ Format de réponse inattendu:", responseData);
            // Réponse de fallback
            generatedText = `Bonjour! Utilisez le code ${PROMO_CODE} pour bénéficier des bonus sur 1xBet et Melbet. Rejoignez nos chaînes WhatsApp et Telegram pour des pronostics gratuits!`;
        }

        // Nettoyage de la réponse
        const cleanText = generatedText
            .replace(/<\/?s>/g, '')
            .replace(/\[INST\].*?\[\/INST\]/g, '')
            .replace(/<\|.*?\|>/g, '')
            .trim();

        console.log("✅ Réponse générée avec succès");

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(cleanText);

    } catch (error) {
        console.error("💥 Erreur serveur:", error);
        // Réponse de fallback en cas d'erreur
        const fallbackResponse = `Salut! N'oublie pas d'utiliser le code ${PROMO_CODE} pour tes inscriptions. 📱 Rejoins-nous sur WhatsApp: ${WHATSAPP_LINK} et Telegram: ${TELEGRAM_LINK} pour des pronostics quotidiens!`;
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(fallbackResponse);
    }
};