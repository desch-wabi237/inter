// api/chat.js – Version Hugging Face Inference API
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 1. Définition des constantes sécurisées
    const HF_API_KEY = process.env.HF_API_KEY;
    const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
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

    // 3. Vérification de la méthode
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 4. Vérification de la clé API
    if (!HF_API_KEY) {
        console.error("❌ Clé API Hugging Face manquante dans les variables d'environnement");
        return res.status(500).json({ error: "Configuration serveur manquante" });
    }

    // 5. Extraction de la requête utilisateur
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

    // 6. Prompt système
    const SYSTEM_PROMPT = `
Vous êtes un assistant amical nommé INTER PRONOSTIC qui aide les utilisateurs à profiter du code promo JAX72 pour obtenir des bonus sur 1xBet et Melbet. 
Votre rôle est d'encourager les inscriptions avec ce code et d'expliquer les avantages.

## Instructions:
1. Répondez toujours en 3 phrases maximum — soyez naturel et conversationnel comme un humain.
2. Adaptez-vous automatiquement à la langue de l'utilisateur (français, anglais, espagnol, etc.).
3. Mettez en avant ces points clés :
   - Le code promo JAX72 offre des bonus à l'inscription.
   - Pour télécharger les coupons de grosses cotes et scores exacts, ils DOIVENT utiliser le code JAX72.
   - Faire un premier dépôt de 5000F ou 10$ pour activer tous les avantages.
4. Partagez toujours ces liens :
   - 📱 Chaîne WhatsApp (pronostics gratuits quotidiens): ${WHATSAPP_LINK}
   - 📱 Canal Telegram (pronostics gratuits quotidiens): ${TELEGRAM_LINK}
   - 🎰 Inscription 1xBet: https://1xbet.com
   - 🎯 Inscription Melbet: https://melbet.com

## Ton et Style:
- Amical et encourageant, jamais agressif.
- Enthousiaste mais crédible.
- Concis (3 phrases max !).
- Naturel comme une conversation entre amis.
`;

    // 7. Construction du payload Hugging Face
    const payload = {
        inputs: `${SYSTEM_PROMPT}\n\nQuestion de l'utilisateur: ${userQuery}`,
        parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            repetition_penalty: 1.1,
        }
    };

    try {
        console.log("🔄 Appel à l'API Hugging Face...");

        // CORRECTION : Utiliser MODEL_URL au lieu de API_URL
        const hfResponse = await fetch(MODEL_URL, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${HF_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const responseData = await hfResponse.json();

        if (!hfResponse.ok) {
            console.error("❌ Erreur Hugging Face API:", responseData);
            return res.status(hfResponse.status).json({ 
                error: responseData.error || 'Erreur API Hugging Face' 
            });
        }

        // Hugging Face renvoie souvent un tableau [{ generated_text: "..." }]
        const text = Array.isArray(responseData)
            ? responseData[0]?.generated_text
            : responseData?.generated_text;

        if (!text) {
            console.error("❌ Réponse vide de Hugging Face:", responseData);
            return res.status(500).json({ error: "Réponse IA vide" });
        }

        console.log("✅ Réponse Hugging Face reçue avec succès");

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(text.trim());

    } catch (error) {
        console.error("💥 Erreur serveur:", error);
        return res.status(500).json({ 
            error: "Erreur interne du serveur",
            details: error.message 
        });
    }
};