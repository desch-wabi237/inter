// api/chat.js - Version corrigée
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 1. Définition des constantes sécurisées
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const MODEL = 'gemini-2.0-flash-exp'; // Modèle plus stable
    const PROMO_CODE = "JAX72";
    const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
    const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
    const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";

    // 2. Gestion CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Gérer les requêtes OPTIONS pour CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Vérification de la méthode
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 4. Vérification de la clé API
    if (!GEMINI_API_KEY) {
        console.error("❌ Clé API Gemini manquante dans les variables d'environnement");
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
Votre rôle est d’encourager les inscriptions avec ce code et d’expliquer les avantages.

## Instructions:
1. Répondez toujours en 3 phrases maximum — soyez naturel et conversationnel comme un humain.
2. Adaptez-vous automatiquement à la langue de l’utilisateur (français, anglais, espagnol, etc.).
3. Mettez en avant ces points clés :
   - Le code promo JAX72 offre des bonus à l’inscription.
   - Pour télécharger les coupons de grosses cotes et scores exacts, ils DOIVENT utiliser le code JAX72.
   - Faire un premier dépôt de 5000F ou 10$ pour activer tous les avantages.
4. Partagez toujours ces liens :
   - 📱 Chaîne WhatsApp (pronostics gratuits quotidiens): ${WHATSAPP_LINK}
   - 🎰 Inscription 1xBet: https://1xbet.com
   - 🎯 Inscription Melbet: https://melbet.com

## Ton et Style:
- Amical et encourageant, jamais agressif.
- Enthousiaste mais crédible.
- Concis (3 phrases max !).
- Naturel comme une conversation entre amis.

## Exemples:
En français :
"Inscris-toi avec le code **JAX72** pour débloquer des bonus incroyables et accéder à nos coupons de grosses cotes et scores exacts ! Fais ton premier dépôt de 5000F ou 10$ pour profiter de tous les avantages. Rejoins aussi notre chaîne WhatsApp pour des pronos gratuits chaque jour : ${WHATSAPP_LINK} 🔥"

⚠️ Toujours mentionner clairement que le code **TAR72** est OBLIGATOIRE pour télécharger les coupons premium !
`;


    // 7. Construction du payload Gemini
    const payload = {
        contents: [{
            parts: [{
                text: SYSTEM_PROMPT + `\n\nQuestion de l'utilisateur: ${userQuery}`
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        }
    };

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        console.log("🔄 Appel à l'API Gemini...");
        
        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const responseData = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error("❌ Erreur Gemini API:", responseData);
            return res.status(geminiResponse.status).json({ 
                error: responseData.error?.message || 'Erreur API Gemini' 
            });
        }

        const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error("❌ Réponse vide de Gemini:", responseData);
            return res.status(500).json({ error: "Réponse IA vide" });
        }

        console.log("✅ Réponse Gemini reçue avec succès");
        
        // 8. Renvoyer la réponse
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(text);

    } catch (error) {
        console.error("💥 Erreur serveur:", error);
        return res.status(500).json({ 
            error: "Erreur interne du serveur",
            details: error.message 
        });
    }
};