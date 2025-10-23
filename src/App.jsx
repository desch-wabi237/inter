import React, { useState, useEffect, useRef, useCallback } from 'react';

// ===========================================
// --- 1. Mises à jour des Définitions et Constantes ---
// ===========================================
const PROMO_CODE = "JAX72"; // Nouveau code promo
const BOT_NAME = "INTERPRONOSTIC"; // Nouveau nom du chat

// Liens affiliés et sociaux (Conservés)
const AFFILIATE_LINK = "https://refpa58144.com/L?tag=d_4708581m_1573c_&site=4708581&ad=1573";
const WHATSAPP_LINK = "https://whatsapp.com/channel/0029VbBRgnhEawdxneZ5To1i";
const TELEGRAM_LINK = "https://t.me/+tuopCS5aGEk3ZWZk";
const MELBET_LINK = "https://melbet.com";

// La route que le client va appeler (Conservée)
const API_ROUTE = "/api/chat"; 

// ===========================================
// --- 2. LOGIQUE D'INTÉGRATION GEMINI (Conservée) ---
// ===========================================
// NOTE: Cette fonction est conservée intacte pour respecter la structure et l'API
const getAiResponse = async (userQuery, maxRetries = 5) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // L'appel API a été conservé
            const response = await fetch(API_ROUTE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // La structure du body est conservée (ne prend que userQuery pour l'instant)
                body: JSON.stringify({ userQuery }) 
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Erreur Serverless: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();
            
            if (text) {
                return text;
            } else {
                throw new Error("Réponse de l'API vide ou mal formée.");
            }

        } catch (error) {
            console.error("Tentative API échouée:", error);
            if (attempt === maxRetries - 1) {
                return `🚨 Erreur de connexion au service IA : ${error.message}. Si vous êtes en local, assurez-vous que votre fonction Serverless (\`/api/chat.js\`) est lancée. Code promo : **${PROMO_CODE}**.`;
            }
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return `🚨 Erreur interne. Le service IA est temporairement indisponible. Code promo : **${PROMO_CODE}**.`;
};

// ===========================================
// --- 3. Composant Principal de l'Application (Refonte du Design et Nouvelles Features) ---
// ===========================================
const App = () => {
    // État principal (Conservé)
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            // Message initial mis à jour avec le nouveau nom et code promo
            text: `Salut l'ami ! Je suis **${BOT_NAME}**, ton expert en pronostics. Mon objectif est simple : t'assurer le **BONUS MAXIMAL** sur 1xBet et Melbet avec le code **${PROMO_CODE}**. Que puis-je analyser pour toi aujourd'hui ? (Tu peux m'envoyer un texte, un vocal, ou une image/PDF d'un match !) `, 
            sender: 'bot', 
            isTyping: false 
        }
    ]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    
    // Nouveaux états pour les fonctionnalités demandées
    const [selectedFile, setSelectedFile] = useState(null); // Pour l'image/PDF
    const [isRecording, setIsRecording] = useState(false); // Pour le message vocal
    const fileInputRef = useRef(null);

    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    // Fonction de formatage (Conservée mais mise à jour pour le nouveau PROMO_CODE)
    const formatMessageText = useCallback((text) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let parts = text.split(urlRegex);
        const regexBold = /\*\*(.*?)\*\*/g;

        return parts.map((part, index) => {
            if (urlRegex.test(part)) {
                const url = part.trim();
                let display = url.length > 50 ? url.substring(0, 50) + '...' : url;
                
                if (url.includes('1xbet') || url.includes('refpa58144')) {
                    display = "🚀 1xBet - Bonus Max pour les Pros 🏆"; // Texte mis à jour
                } else if (url.includes('melbet')) {
                    display = "🥇 MelBet - Plateforme de Paris Sportifs"; // Texte mis à jour
                } else if (url.includes('whatsapp')) {
                    display = "💬 Rejoindre notre WhatsApp";
                } else if (url.includes('telegram') || url.includes('t.me')) {
                    display = "📢 Rejoindre notre Telegram";
                }
                
                return (
                    <a 
                        key={index} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="link-anchor"
                    >
                        {display}
                    </a>
                );
            }
            
            const textWithBold = part.split(regexBold).map((subPart, i) => {
                if (i % 2 === 1) {
                    return <strong key={i} className="promo-code-bold">{subPart}</strong>;
                }
                return subPart;
            });

            return <span key={index}>{textWithBold}</span>;
        });
    }, []);

    // Gestion de l'envoi (Modifiée pour inclure les fichiers/vocaux)
    const handleSend = async (e) => {
        e.preventDefault();
        
        // Logique pour l'envoi de fichier (Image/PDF)
        if (selectedFile) {
            // TODO: Logique pour envoyer le fichier à l'API. 
            // Pour l'instant, on ajoute juste un message de l'utilisateur
            const fileMessage = { 
                id: Date.now(), 
                text: `[FICHIER] ${selectedFile.name} (Taille: ${(selectedFile.size / 1024).toFixed(1)} KB) - Prêt à être analysé !`, 
                sender: 'user', 
                file: selectedFile
            };
            setMessages(prev => [...prev, fileMessage]);
            setSelectedFile(null); // Réinitialiser le fichier
            
            // Simuler la réponse de l'IA pour l'analyse
            // Note: Vous devrez ajuster getAiResponse pour prendre le fichier en plus de la query
            setIsBotTyping(true);
            const botResponseText = await getAiResponse(`Analyse de fichier: ${selectedFile.name}`); 
            setIsBotTyping(false);
            
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: botResponseText,
                    sender: 'bot',
                    isTyping: false
                }]);
            }, 300);
            return;
        }

        // Logique pour l'envoi de texte standard
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        
        const newUserMessage = { 
            id: Date.now(), 
            text: trimmedInput, 
            sender: 'user', 
            isTyping: false 
        };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        
        setIsBotTyping(true);
        let botResponseText = "";

        try {
            // La fonction getAiResponse est appelée avec le texte standard
            botResponseText = await getAiResponse(trimmedInput);
        } catch (error) {
            console.error("Erreur de traitement:", error);
            botResponseText = "🚨 Une erreur de traitement inattendue est survenue.";
        } finally {
            setIsBotTyping(false);
        }

        setTimeout(() => {
            const newBotMessage = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: 'bot',
                isTyping: false
            };
            setMessages(prev => [...prev, newBotMessage]);
        }, 300); 
    };
    
    // ------------------------------------------
    // Nouveaux Handlers pour Vocal et Fichier
    // ------------------------------------------

    // Déclencher l'input de fichier
    const handleFileIconClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Gérer la sélection de fichier
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Vérification simple du type
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                setSelectedFile(file);
                setInput(`Analyse de ${file.name}`); // Remplir l'input pour inciter à l'envoi
            } else {
                alert("Seuls les fichiers image ou PDF sont supportés pour l'analyse.");
            }
        }
        // Réinitialiser l'input file pour permettre la resélection du même fichier
        event.target.value = null; 
    };

    // Gérer l'enregistrement vocal (Logique simplifiée pour l'UI)
    const toggleRecording = () => {
        if (isRecording) {
            // Arrêter l'enregistrement
            setIsRecording(false);
            // Simuler l'envoi d'un message vocal
            const voiceMessage = { 
                id: Date.now(), 
                text: "[VOCAL ENREGISTRÉ] Envoi du fichier audio pour interprétation...", 
                sender: 'user', 
                isVoice: true // Marqueur pour affichage futur
            };
            setMessages(prev => [...prev, voiceMessage]);
            
            // Simuler la réponse de l'IA
            // TODO: Logique pour envoyer le fichier vocal (audio/webm) à l'API
            setTimeout(async () => {
                setIsBotTyping(true);
                const botResponseText = await getAiResponse("Analyse de message vocal."); 
                setIsBotTyping(false);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: botResponseText,
                    sender: 'bot',
                    isTyping: false
                }]);
            }, 500);
            
        } else {
            // Commencer l'enregistrement (Nécessite MediaRecorder API)
            setIsRecording(true);
            setInput("🎙️ Enregistrement en cours...");
            // TODO: Implémenter la MediaRecorder API ici
        }
    };
    
    // --- Composant d'une Bulle de Message (Modifié pour Fichier/Vocal) ---
    const MessageBubble = ({ message }) => {
        const isBot = message.sender === 'bot';
        
        return (
            <div className={`message-row ${isBot ? 'bot-row' : 'user-row'}`}>
                <div 
                    className={`message-bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}
                >
                    {/* Affichage des nouveaux types de messages */}
                    {message.isVoice && (
                        <div className="voice-icon">
                            🔊 Fichier vocal 
                            {/* Optionnel: Ajouter un lecteur audio si un fichier est présent */}
                        </div>
                    )}
                    {message.file && (
                        <div className="file-preview">
                            🖼️ **Fichier à analyser:** {message.file.name}
                            {/* Optionnel: Afficher une miniature pour les images */}
                        </div>
                    )}
                    
                    {/* Affichage du texte par défaut / du texte pour les fichiers/vocaux */}
                    {formatMessageText(message.text)}
                </div>
            </div>
        );
    };

    // --- Rendu de l'interface ---
    return (
        <div className="app-container">
            <style jsx="true">{`
                /* =========================================== */
                /* --- 4. NOUVEAU DESIGN (Noir & Vert Émeraude) --- */
                /* =========================================== */
                
                /* Reset et base */
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    -webkit-tap-highlight-color: transparent;
                }

                .app-container {
                    min-height: 100dvh;
                    background: linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%); /* Fond très sombre */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    font-family: 'Poppins', sans-serif; /* Nouvelle police */
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    width: 100%;
                }
                
                .chat-card {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    background: #1f1f1f; /* Fond principal du chat */
                    overflow: hidden;
                    position: relative;
                }

                /* Header vert/sombre */
                .chat-header {
                    padding: 15px 20px;
                    background: linear-gradient(135deg, #1f1f1f 0%, #282828 100%);
                    border-bottom: 3px solid #00c476; /* Ligne d'accentuation vert émeraude */
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-height: 70px;
                    flex-shrink: 0;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    min-width: 0;
                }

                .status-dot {
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    margin-right: 12px;
                    flex-shrink: 0;
                    background-color: #00c476; /* Vert émeraude */
                    box-shadow: 0 0 5px #00c476;
                }

                .status-dot.typing {
                    background-color: #00c476;
                    animation: pulse 1.5s infinite;
                }

                .header-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #ffffff;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .header-subtitle {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    background: #00c476; /* Fond vert solide */
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-left: 8px;
                    white-space: nowrap;
                    letter-spacing: 0.5px;
                }
                
                /* Bannières des sites */
                .banner-container {
                    display: flex;
                    gap: 12px;
                    padding: 12px 15px;
                    background: #282828;
                    border-bottom: 1px solid #333;
                    flex-shrink: 0;
                }

                .bet-banner {
                    flex: 1;
                    padding: 12px 8px;
                    border-radius: 8px;
                    text-align: center;
                    text-decoration: none;
                    font-weight: 700;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    min-height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    color: white;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
                }

                /* Dégradé bleu/vert pour 1xBet */
                .bet-banner-1xbet {
                    background: linear-gradient(135deg, #1e90ff 0%, #00c476 100%);
                }

                .bet-banner-1xbet:hover {
                    background: linear-gradient(135deg, #3ea0ff 0%, #00d486 100%);
                    transform: translateY(-2px);
                }

                /* Dégradé jaune/orange pour MelBet */
                .bet-banner-melbet {
                    background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
                    color: #1f1f1f;
                }

                .bet-banner-melbet:hover {
                    background: linear-gradient(135deg, #ffe710 0%, #ff9c10 100%);
                    transform: translateY(-2px);
                }
                
                /* Zone des messages */
                .messages-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: #1f1f1f;
                    -webkit-overflow-scrolling: touch;
                }

                .message-row {
                    display: flex;
                    margin-bottom: 12px;
                }

                .bot-row {
                    justify-content: flex-start;
                }

                .user-row {
                    justify-content: flex-end;
                }

                .message-bubble {
                    max-width: 85%;
                    padding: 14px 18px;
                    border-radius: 20px;
                    font-size: 15px;
                    line-height: 1.5;
                    word-wrap: break-word;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .bot-bubble {
                    background: #282828;
                    border: 1px solid #333;
                    color: #e0e0e0;
                    border-bottom-left-radius: 4px;
                }

                .user-bubble {
                    background: linear-gradient(135deg, #00c476 0%, #00995c 100%); /* Vert émeraude */
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .promo-code-bold {
                    font-weight: 900;
                    color: #ffd700; /* Jaune or */
                }

                .link-anchor {
                    font-size: 14px;
                    font-weight: 700;
                    text-decoration: none;
                    color: #fff;
                    background: linear-gradient(135deg, #00c476 0%, #00a860 100%);
                    padding: 10px 14px;
                    border-radius: 8px;
                    display: block;
                    margin: 8px 0;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0, 196, 118, 0.4);
                }
                
                /* =========================================== */
                /* --- NOUVELLES FONCTIONNALITÉS (Input Area) --- */
                /* =========================================== */
                
                .input-form {
                    padding: 15px;
                    border-top: 1px solid #333;
                    display: flex;
                    align-items: flex-end; /* Aligner en bas */
                    background: #282828;
                    gap: 8px;
                    flex-shrink: 0;
                }

                .input-group {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    border-radius: 14px;
                    background: #333;
                    border: 1px solid #444;
                    min-height: 54px;
                    padding: 4px;
                }

                .chat-input {
                    flex: 1;
                    padding: 12px 14px;
                    border: none;
                    background: transparent;
                    color: #e0e0e0;
                    font-size: 16px;
                    resize: none; /* Empêche le redimensionnement */
                    min-height: 40px;
                    max-height: 150px; /* Limite la hauteur */
                    line-height: 1.4;
                    -webkit-appearance: none;
                    overflow-y: auto;
                    font-family: 'Poppins', sans-serif;
                }

                .chat-input:focus {
                    outline: none;
                }

                .chat-input::placeholder {
                    color: #888;
                }
                
                /* Boutons de Média */
                .media-button {
                    background: none;
                    border: none;
                    color: #888;
                    padding: 8px;
                    font-size: 24px;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }
                
                .media-button:hover:not(:disabled) {
                    color: #00c476;
                }
                
                .media-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Bouton d'Envoi (Vert Émeraude) */
                .chat-button {
                    padding: 14px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 16px;
                    background: linear-gradient(135deg, #00c476 0%, #00995c 100%);
                    color: white;
                    border: none;
                    min-height: 54px;
                    min-width: 54px;
                    -webkit-appearance: none;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 196, 118, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chat-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 196, 118, 0.6);
                }

                .chat-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }
                
                /* Indicateur Vocal */
                .record-indicator {
                    color: #ff4d4f; /* Rouge pour l'enregistrement */
                    animation: flash 1s infinite alternate;
                }
                
                @keyframes flash {
                    from { opacity: 1; }
                    to { opacity: 0.5; }
                }
                
                .typing-indicator-dots {
                    background: #282828;
                    border: 1px solid #333;
                    /* Reste inchangé */
                }
                
                /* Media Queries */
                @media (min-width: 769px) {
                    .chat-card {
                        max-width: 700px;
                        height: 90vh;
                        border-radius: 16px;
                    }
                    .input-group {
                        padding: 8px;
                    }
                    .chat-input {
                        font-size: 16px;
                    }
                }
            `}</style>

            <div className="chat-card">
                
                {/* En-tête du Chatbot (avec nouveau design et nom) */}
                <div className="chat-header">
                    <div className="header-content">
                        <span className={`status-dot ${isBotTyping ? 'typing' : 'idle'}`}></span>
                        <h1 className="header-title">
                            {BOT_NAME} <span className="header-subtitle">Code: {PROMO_CODE}</span>
                        </h1>
                    </div>
                </div>

                {/* Bannières 1xBet et MelBet (design mis à jour) */}
                <div className="banner-container">
                    <a href={AFFILIATE_LINK} target="_blank" rel="noopener noreferrer" className="bet-banner bet-banner-1xbet">
                        🎰 1xBet
                    </a>
                    <a href={MELBET_LINK} target="_blank" rel="noopener noreferrer" className="bet-banner bet-banner-melbet">
                        🎲 MelBet
                    </a>
                </div>

                {/* Zone des Messages (conservée) */}
                <div className="messages-area">
                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}
                    
                    {/* Indicateur de saisie du bot (conservé) */}
                    {isBotTyping && (
                        <div className="typing-indicator-container bot-row">
                            <div className="typing-indicator-dots">
                                <span className="dot" style={{ animationDelay: '0s' }}></span>
                                <span className="dot" style={{ animationDelay: '0.2s' }}></span>
                                <span className="dot" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Zone de Saisie (avec boutons Fichier et Vocal) */}
                <form onSubmit={handleSend} className="input-form">
                    
                    {/* Bouton Fichier (Image/PDF) */}
                    <input
                        type="file"
                        accept="image/*, application/pdf"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        disabled={isBotTyping || isRecording}
                    />
                    <button
                        type="button"
                        onClick={handleFileIconClick}
                        className="media-button"
                        title="Envoyer Image ou PDF"
                        disabled={isBotTyping || isRecording}
                    >
                        📁
                    </button>
                    
                    <div className="input-group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isRecording ? "Enregistrement vocal en cours..." : (selectedFile ? `Fichier prêt : ${selectedFile.name}` : "💬 Texte, ou cliquez sur les icônes pour fichier/vocal...")}
                            disabled={isBotTyping || isRecording}
                            className="chat-input"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    handleSend(e);
                                }
                            }}
                        />
                        
                        {/* Bouton Vocal */}
                        <button
                            type="button"
                            onClick={toggleRecording}
                            className={`media-button ${isRecording ? 'record-indicator' : ''}`}
                            title={isRecording ? "Arrêter l'enregistrement" : "Enregistrer un message vocal"}
                            disabled={isBotTyping || !!selectedFile}
                            style={{ color: isRecording ? '#ff4d4f' : '#888' }}
                        >
                            {isRecording ? '🛑' : '🎤'}
                        </button>
                    </div>

                    {/* Bouton d'Envoi */}
                    <button
                        type="submit"
                        disabled={!input.trim() || isBotTyping} 
                        className="chat-button"
                        title="Envoyer"
                    >
                        {isBotTyping ? '...' : '▶️'}
                    </button>
                </form>

            </div>
            
        </div>
    );
};

export default App;