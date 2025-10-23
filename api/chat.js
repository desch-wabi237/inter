// api/chat.js - Version Corrigée (Meilleure pratique pour System Prompt)
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    // 1. Définition des constantes sécurisées
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    // Note: Utiliser gemini-2.5-flash est recommandé pour des performances optimales
    const MODEL = 'gemini-2.5-flash'; 
    const PROMO_CODE = "TAR72";
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

    // 6. Prompt système (comme instruction système dédiée)
const SYSTEM_PROMPT = `
Vous êtes un assistant amical nommé TAR72PRONOSTIC qui aide les utilisateurs à profiter du code promo ${PROMO_CODE} pour obtenir des bonus sur 1xBet et Melbet. 
Votre rôle est d’encourager les inscriptions avec ce code et d’expliquer les avantages.

## Instructions:
1. Répondez toujours en 3 phrases maximum — soyez naturel et conversationnel comme un humain.
2. Adaptez-vous automatiquement à la langue de l’utilisateur (français, anglais, espagnol, etc.).
3. Mettez en avant ces points clés :
   - Le code promo ${PROMO_CODE} offre des bonus à l’inscription.
   - Pour télécharger les coupons de grosses cotes et scores exacts, ils DOIVENT utiliser le code ${PROMO_CODE}.
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

⚠️ Toujours mentionner clairement que le code **${PROMO_CODE}** est OBLIGATOIRE pour télécharger les coupons premium !
`;


    // 7. Construction du payload Gemini
    const payload = {
        // Le contenu est uniquement la requête utilisateur pour ce tour de conversation
        contents: [{
            parts: [{
                text: userQuery
            }]
        }],
        // La configuration pour la génération (température, etc.)
        generationConfig: {
            temperature: 0.7,
            // Les autres configurations topK/topP sont souvent inutiles avec un bon prompt système
            // et peuvent être omises, mais on les laisse ici si l'utilisateur y tient.
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        },
        // **CORRECTION MAJEURE : Utiliser systemInstruction pour le Prompt Système**
        config: {
            systemInstruction: SYSTEM_PROMPT
        }
    };

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        console.log(`🔄 Appel à l'API Gemini (${MODEL})...`);
        
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