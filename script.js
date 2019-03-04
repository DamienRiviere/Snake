window.onload = function() {

    var canvasWidth = 900; // Largeur du canvas
    var canvasHeight = 600; // Hauteur du canvas
    var blockSize = 30; // Taille d'un block
    var ctx; // Contexte
    var delay = 100; // Délais de rafraichissement du canvas
    var snakee; // Le serpent
    var applee;
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var score;
    var timeout;
    // Appel de la fonction init au chargement de la page
    init();

    /**
     * Permet d'intialiser le canvas et le serpent
     */
    function init() {
        var canvas = document.createElement('canvas'); // Création d'un élément canvas
        canvas.width = canvasWidth; // Largeur du canvas
        canvas.height = canvasHeight; // Hauteur du canvas
        canvas.style.border = "30px solid gray"; // Bordure du canvas
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
        document.body.appendChild(canvas); // Injection du canvas dans le body
        ctx = canvas.getContext('2d'); // Contexte du canvas
        snakee = new Snake([[6,4], [5,4], [4,4], [3,4], [2,4]], "right"); // Instanciation du serpent avec ses coordonnées en arguments et sa direction par défaut
        applee = new Apple([10, 10]); // Instanciation de la pomme avec ses coordonnées en arguments
        score = 0;
        refreshCanvas(); // Appel de la fonction pour rafraichir le canvas
    }
    
    /**
     * Permet de rafraichir le canvas et d'initialiser les fonctions du serpent
     */
    function refreshCanvas() {
        snakee.advance(); // Permet de faire avancer le serpent
        if(snakee.checkCollision()) {
            gameOver();
        } else {
            if(snakee.isEatingApple(applee)) {
                score++;
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                } while(applee.isOnSnake(snakee));
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Supprime tout contenu précédemment dessiner
            drawScore();
            snakee.draw(); // Permet de dessigner le serpent
            applee.draw(); // Permet de dessiner la pomme
            timeout = setTimeout(refreshCanvas, delay); // Raffraichis le canvas en fonction du délais
        }  
    }

    /**
     * Constructeur du serpent
     * 
     * @param {*} body 
     */
    function Snake(body, direction) {
        this.body = body; // Récupération des coordonnées (body)
        this.direction = direction;
        this.ateApple = false;
        // Permet de dessiner le serpent
        this.draw = function() {
            ctx.save(); // Sauvegarde du contenu du canvas
            ctx.fillStyle = "#ff0000";
            // Pour chaque entrée dans le body on dessine un block
            for(var i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore(); // Restaure le contenu du canvas
        };
        // Permet de faire avancer le serpent
        this.advance = function() {
            var nextPosition = this.body[0].slice(); // On copie la premiere entrée du body
            // Permet de faire avancer le serpent suivant la direction choisit
            switch(this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("Invalid Direction");
            }
            this.body.unshift(nextPosition); // On ajoute la nouvelle position en première entrée du body
            if(!this.ateApple) {
                this.body.pop(); // Puis on supprime la dernière entrée du body
            } else {
                this.ateApple = false;
            }   
        };
        // Attribue les directions qui sont autorisées
        this.setDirection = function(newDirection) {
            var allowedDirections;
            switch(this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw("Invalid Direction");
            }
            if(allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };
        // Check si le serpent est rentré dans un mur ou dans son corps
        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if(isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            }

            for(var i = 0; i < rest.length; i++) {
                if(snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };
        // Permet au serpent de manger la pomme
        this.isEatingApple = function(appleToEat) {
            var head = this.body[0];
            if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1] ) {
                return true;
            } else {
                return false;
            }
        };
    }

    /**
     * Constructeur de la pomme
     * 
     * @param {} position 
     */
    function Apple(position) {
        this.position = position;
        // Permet de dessiner la pomme
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize / 2;
            var x = this.position[0] * blockSize + radius;
            var y = this.position[1] * blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI*2, true);
            ctx.fill();
            ctx.restore();
        };
        // Permet de donner une nouvelle position à la pomme
        this.setNewPosition = function() {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };
        // Permet de savoir si la pomme apparait sur le serpent
        this.isOnSnake = function(snakeToCheck) {
            var isOnSnake = false;

            for(var i = 0; i < snakeToCheck.body.length; i++) {
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }
            }

            return isOnSnake;
        };
    }

    /**
     * Permet de dessiner un block à partir du x, y, de la hauteur et largeur
     * 
     * @param {*} ctx 
     * @param {*} position 
     */
    function drawBlock(ctx, position) {
        var x = position[0] * blockSize; // Calcul du x d'un block
        var y = position[1] * blockSize; // Calcul du y d'un block
        ctx.fillRect(x, y, blockSize, blockSize); // On dessine les blocks du serpents à partir de leurs positions
    }

    /**
     * Permet de récupérer la touche entrée par l'utilisateur
     */
    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;
        var newDirection;

        switch(key) {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }

    /**
     * Permet de relancer une nouvelle partie
     */
    function restart() {
        snakee = new Snake([[6,4], [5,4], [4,4], [3,4], [2,4]], "right"); // Instanciation du serpent avec ses coordonnées en arguments et sa direction par défaut
        applee = new Apple([10, 10]); // Instanciation de la pomme avec ses coordonnées en arguments
        score = 0;
        clearTimeout(timeout);
        refreshCanvas(); // Appel de la fonction pour rafraichir le canvas
    }

    function drawScore() {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }

    /**
     * Permet d'afficher le game over
     */
    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyez sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyez sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }

}