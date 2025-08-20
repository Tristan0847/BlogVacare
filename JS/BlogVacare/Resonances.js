document.addEventListener('DOMContentLoaded', function() {
    
    //#region Initialisation

    const body = document.body;
    
    // Élément qui contiendra les ondulations
    const waveOverlay = document.createElement('div');
    waveOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.4;
    `;
    body.appendChild(waveOverlay);
    
    // Initialisation du gradient
    body.style.backgroundRepeat = 'no-repeat';
    body.style.backgroundSize = '100% 100%';
    body.style.backgroundPosition = '50% 50%';
    body.style.backgroundAttachment = 'fixed';
    

    let activeWaves = [];
    const PULSE_INTERVAL = 8470; // 8.47 secondes 
    
    //#endregion

    //#region Classe d'ondulation

    /**
     * Classe représentant une ondulation horizontale
     */
    class HorizontalWave {

        /**
         * Constructeur de l'ondulation
         * Initialise le temps de début et la durée de l'ondulation
         */
        constructor() {
            this.startTime = Date.now();
            this.duration = 12000;
            this.id = Math.random();
        }
        
        /**
         * Méthode pour obtenir la progression de l'ondulation
         * @param {*} currentTime Temps actuel en millisecondes
         * @returns {number} Progression de l'ondulation (0 à 1)
         */
        getProgress(currentTime) {
            const elapsed = currentTime - this.startTime;
            return elapsed / this.duration;
        }
        
        /**
         * Retourne si l'ondulation est encore active
         * @param {*} currentTime Temps actuel en millisecondes
         * @returns {boolean} Vrai si l'ondulation est encore active, faux sinon
         */
        isActive(currentTime) {
            return this.getProgress(currentTime) < 1;
        }
        
        /**
         * Méthode pour obtenir les données de l'ondulation
         * @param {*} currentTime temps actuel en millisecondes
         * @returns {Object|null} Données de l'ondulation ou null si terminée
         */
        getWaveData(currentTime) {
            const progress = this.getProgress(currentTime);
            
            if (progress >= 1) return null;
            
            // Progression de l'ondulation depuis le centre vers un bord
            const wavePosition = progress * 100;
            
            // Intensité qui diminue avec le temps
            const baseIntensity = Math.max(0, 1 - progress);
            
            // Echos multiples (ondulations qui se suivent)
            const echo1 = Math.sin(progress * Math.PI * 12) * 0.2;
            const echo2 = Math.sin(progress * Math.PI * 6) * 0.4; 
            const echo3 = Math.sin(progress * Math.PI * 3) * 0.6; 
            const echo4 = Math.sin(progress * Math.PI * 1.5) * 0.8
            
            const totalIntensity = baseIntensity * (echo1 + echo2 + echo3 + echo4) * 0.4;
            
            return {
                position: wavePosition,
                intensity: Math.abs(totalIntensity)
            };
        }
    }

    //#endregion
    
    //#region Méthodes

    /**
     * Méthode pour créer les gradients d'ondulation
     * @returns 
     */
    function createWaveGradients() {
        const currentTime = Date.now();
        
        // Nettoyage des ondulations terminées
        activeWaves = activeWaves.filter(wave => wave.isActive(currentTime));
        
        if (activeWaves.length === 0) {
            waveOverlay.style.background = 'transparent';
        }
        else {
            const gradients = [];
            
            // Pour chaque ondulation active, on crée un gradient
            activeWaves.forEach(wave => {
                const waveData = wave.getWaveData(currentTime);

                // Si l'ondulation est terminée ou a une intensité trop faible, on l'ignore
                if (waveData && waveData.intensity >= 0.01)
                {
                    const { position, intensity } = waveData;
                    const opacity = Math.min(0.6, intensity);
                    
                    // Gradient linéaire horizontal qui crée des bandes uniformes
                    const centerPos = 50;
                    const waveSpread = (position / 100) * 50;
                    
                    gradients.push(`linear-gradient(to right,
                        transparent 0%,
                        transparent ${Math.max(0, centerPos - waveSpread - 8)}%,
                        rgba(0,0,0,${opacity}) ${Math.max(0, centerPos - waveSpread - 2)}%,
                        rgba(15,15,15,${opacity * 0.7}) ${Math.max(0, centerPos - waveSpread)}%,
                        rgba(0,0,0,${opacity}) ${Math.max(0, centerPos - waveSpread + 2)}%,
                        transparent ${Math.max(0, centerPos - waveSpread + 8)}%,
                        transparent ${Math.min(100, centerPos + waveSpread - 8)}%,
                        rgba(0,0,0,${opacity}) ${Math.min(100, centerPos + waveSpread - 2)}%,
                        rgba(15,15,15,${opacity * 0.7}) ${Math.min(100, centerPos + waveSpread)}%,
                        rgba(0,0,0,${opacity}) ${Math.min(100, centerPos + waveSpread + 2)}%,
                        transparent ${Math.min(100, centerPos + waveSpread + 8)}%,
                        transparent 100%
                    )`);
                }
                

            });
            
            waveOverlay.style.background = gradients.join(', ');
        }
    }
    
    /**
     * Méthode pour déclencher une nouvelle pulsation
     */
    function triggerPulse() {
        activeWaves.push(new HorizontalWave());
    }
    
    /**
     * Méthode d'animation qui met à jour les gradients d'ondulation
     */
    function animate() {
        createWaveGradients();
        requestAnimationFrame(animate);
    }
    
    //#endregion

    /**
     * Méthode pour démarrer les pulsations régulières
     */
    function startRegularPulses() {
        // Première pulsation immédiate
        triggerPulse();
        
        // Puis une pulsation toutes les 8.47 secondes
        setInterval(() => {
            triggerPulse();
        }, PULSE_INTERVAL);
    }
    
    // Démarre le système
    animate();
    startRegularPulses();
});