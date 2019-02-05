function sprite(options) {
    var that = {},
        frameIndex = 0,
        tickCount = 0,
        tickPerFrame = options.tickPerFrame || 0,
        numberOfFrame = options.numberOfFrame || 1;

    that.context = options.context;
    that.w = options.w;
    that.h = options.h;
    that.img = options.img;
    that.x = options.x;
    that.y = options.y;
    that.r = (that.w / numberOfFrame) / 2;
    that.scaleRatio = 1;

    that.update = function() {
        tickCount += 1;

        if (tickCount > tickPerFrame) {
            tickCount = 0;

            if (frameIndex < numberOfFrame - 1) {
                frameIndex += 1;
            } else {
                frameIndex = 0;
            }
        }
    };

    that.render = function() {
        that.context.drawImage(that.img, frameIndex * that.w / numberOfFrame, 0, that.w / numberOfFrame, that.h, that.x, that.y, that.w / numberOfFrame, that.h);
    };

    that.getFrameWidth = function() {
        return that.w / numberOfFrame;
    };

    return that;
}

var knight, knightImage, level = 1,
    velocity = 1,
    numBush = 5,
    bush = [],
    bushImage,
    score = 0,
    life = 3,
    gameOver = "",
    zombie = [],
    numZombie = 3,
    canvas,
    love = [],
    loveImage, loveIndex,
    restart, restartImage,
    pause, pauseImage,
    play, playImage;

//get canvas     
canvas = document.getElementById("cnv");
canvas.width = 1024;
canvas.height = 480;

//knight sprite sheet     
knightImage = new Image();
knightImage.src = "images/character/run-knight.png";
//knight sprite    
knight = sprite({
    context: canvas.getContext("2d"),
    w: 1740,
    h: 210,
    img: knightImage,
    numberOfFrame: 10,
    tickPerFrame: 5,
    x: canvas.width,
    y: canvas.height - 210
});

//Restart Button
restartImage = new Image();
restartImage.src = "images/character/restart.png";
restart = sprite({
    context: canvas.getContext("2d"),
    w: 162,
    h: 77,
    img: restartImage,
    numberOfFrame: 1,
    tickPerFrame: 1,
    x: canvas.width / 2 - 80,
    y: canvas.height / 2 - 20
});

//Pause Button
pauseImage = new Image();
pauseImage.src = "images/character/pause.png";
pause = sprite({
    context: canvas.getContext("2d"),
    w: 70,
    h: 70,
    img: pauseImage,
    numberOfFrame: 1,
    tickPerFrame: 1,
    x: 10,
    y: 50
});

//Play Button
playImage = new Image();
playImage.src = "images/character/play.png";
play = sprite({
    context: canvas.getContext("2d"),
    w: 70,
    h: 70,
    img: playImage,
    numberOfFrame: 1,
    tickPerFrame: 1,
    x: 90,
    y: 50
});

//bush     
for (i = 0; i < numBush; i++) {
    spawnBush();
}
//zombie     
for (i = 0; i < numZombie; i++) {
    spawnZombie();
}
//life
for (i = 0; i < life; i++) {
    spawnLove();
}

gameLoop();

var status_pause = false;

function gameLoop() {
    if (life > 0 && !status_pause) {
        window.requestAnimationFrame(gameLoop);

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        pause.render();

        //play.render();
        //knight
        knight.update();
        knight.x -= level * velocity;
        if (knight.x < -128) {
            knight.x = canvas.width + Math.round(Math.random() * canvas.width);
        }
        knight.render();

        //bush   
        for (i = 0; i < bush.length; i++) {
            bush[i].update();
            bush[i].x += level * velocity / 2;
            bush[i].render();

            if (bush[i].x > canvas.width + 65) {
                bush[i].x = -80 - Math.floor(Math.random() * 3 + 1);
            }
        }

        //hud  
        drawHud();

        //zombie    
        for (var i = 0; i < zombie.length; i++) {
            zombie[i].update();
            zombie[i].x -= level * velocity;
            zombie[i].render();

            if (zombie[i].x < -128) {
                zombie[i].x = canvas.width + Math.random() * (canvas.width - zombie[i].getFrameWidth() * zombie[i].scaleRatio);
                life--;
                score -= 1;
            }

            if (score > level * 2) {
                level++;
                console.log(level);
            }

            var xZombie = zombie[i].x;
            var yZombie = zombie[i].y;
            var rZombie = zombie[i].r;
            var index = i;
            canvas.onclick = function(e) {
                var xAxis = e.clientX;
                var yAxis = e.clientY;

                var d_zombie = Math.sqrt(Math.pow((xZombie - xAxis), 2) + Math.pow((yZombie - yAxis), 2));

                if (d_zombie < rZombie) {
                    console.log("click zombie");
                    zombie[index].x = canvas.width;
                    score += 1;
                }

                var d_knight = Math.sqrt(Math.pow((knight.x - xAxis), 2) + Math.pow((knight.y - yAxis), 2));

                if (d_knight < knight.r) {
                    console.log("click knight");
                    life--;
                }
                var d_pause = Math.sqrt(Math.pow((pause.x - (xAxis - 159)), 2) + Math.pow((pause.y - yAxis), 2));

                if (d_pause < pause.r) {
                    console.log("click pause");
                    gameOver = "Paused";
                    drawHud();
                    status_pause = true;
                }
            }
        }

        //love.render();
        for (i = 0; i < love.length; i++) {
            love[i].update();
            if (life == 2) {
                love[2].x = -100;
            }
            if (life == 1) {
                love[1].x = -100;
            }
            if (life == 0) {
                love[0].x = -100;
            }
            love[i].render();
        }
    } else if (status_pause) {
        play.render();

        canvas.onclick = function(e) {
            var xAxis = e.clientX;
            var yAxis = e.clientY;

            var d_play = Math.sqrt(Math.pow((play.x - (xAxis - 130)), 2) + Math.pow((play.y - (yAxis - 8)), 2));

            if (d_play < play.r) {
                console.log("click play");
                gameOver = "";
                drawHud();
                status_pause = false;
                gameLoop();
            }
        }
    } else {
        gameOver = "Game Over";
        drawHud();
        restart.render();
        canvas.onclick = function(e) {
            var xAxis = e.clientX;
            var yAxis = e.clientY;

            var d_restart = Math.sqrt(Math.pow((restart.x - xAxis), 2) + Math.pow((restart.y - yAxis), 2));

            if (d_restart < restart.r) {
                console.log("click restart");
                life = 3;
                love = [];
                zombie = [];
                bush = [];
                knight.x = knight.x = canvas.width + Math.round(Math.random() * canvas.width);
                score = 0;
                level = 1;
                velocity = 1;
                gameOver = "";
                for (i = 0; i < numBush; i++) {
                    spawnBush();
                }
                for (i = 0; i < numZombie; i++) {
                    spawnZombie();
                }
                for (i = 0; i < life; i++) {
                    spawnLove();
                }
                gameLoop();
            }
        }
    }
}

function spawnLove() {
    var loveIndex, loveImage;
    loveImage = new Image();
    loveIndex = love.length;
    loveImage.src = ("images/character/life.png");
    love[loveIndex] = sprite({
        context: canvas.getContext("2d"),
        w: 50,
        h: 40,
        img: loveImage,
        numberOfFrame: 1,
        tickPerFrame: 1,
        x: 0,
        y: 10
    });

    if (loveIndex == 0) {
        love[loveIndex].x = 90;
    }
    if (loveIndex == 1) {
        love[loveIndex].x = 140;
    }
    if (loveIndex == 2) {
        love[loveIndex].x = 190;
    }
}

function spawnBush() {
    var bushIndex, bushImage;
    bushImage = new Image();
    bushIndex = bush.length;

    bush[bushIndex] = sprite({
        context: canvas.getContext("2d"),
        img: bushImage,
        w: 0,
        h: 0,
        x: 0,
        y: 0,
        numberOfFrame: 1,
        tickPerFrame: 1
    });

    bush[bushIndex].x = 0 + Math.random() * (canvas.width - bush[bushIndex].getFrameWidth() * bush[bushIndex].scaleRatio);

    if (bushIndex == 0) {
        bush[bushIndex].w = 182;
        bush[bushIndex].h = 90;
        bush[bushIndex].y = canvas.height - 88;
    }
    if (bushIndex == 1) {
        bush[bushIndex].w = 100;
        bush[bushIndex].h = 64;
        bush[bushIndex].y = canvas.height - 62;
    }
    if (bushIndex == 2) {
        bush[bushIndex].w = 54;
        bush[bushIndex].h = 55;
        bush[bushIndex].y = canvas.height - 53;
    }
    if (bushIndex == 3) {
        bush[bushIndex].w = 53;
        bush[bushIndex].h = 76;
        bush[bushIndex].y = canvas.height - 74;
    }
    if (bushIndex == 4) {
        bush[bushIndex].w = 352;
        bush[bushIndex].h = 332;
        bush[bushIndex].y = canvas.height - 330;
    }
    bush[bushIndex].scaleRatio = Math.random() * 0.5 + 0.5;
    bushImage.src = "images/bush/bush" + bushIndex + ".png";
}

function drawHud() {
    var context = canvas.getContext("2d");

    //score      
    context.font = "bold 20px Consolas";
    context.textAlign = "start";
    context.fillStyle = "white";
    context.fillText("Score: " + score, canvas.width - 275, 40);

    //level    
    context.font = "bold 20px Consolas";
    context.textAlign = "start";
    context.fillStyle = "white";
    context.fillText("Level: " + level, canvas.width - 125, 40);

    //life    
    context.font = "bold 20px Consolas";
    context.textAlign = "start";
    context.fillStyle = "white";
    context.fillText("Life: ", 30, 40);

    //gameover   
    context.font = "bold 50px Consolas";
    context.textAlign = "center";
    context.fillStyle = "#193439";
    context.fillText(gameOver, context.canvas.width / 2, context.canvas.height / 2 - 32);
}

function spawnZombie() {
    var zombieIndex, zombieImage;
    zombieImage = new Image();
    zombieIndex = zombie.length;

    zombie[zombieIndex] = sprite({
        context: canvas.getContext("2d"),
        w: 1740,
        h: 210,
        img: zombieImage,
        numberOfFrame: 10,
        tickPerFrame: 5,
        x: canvas.width,
        y: canvas.height - 210
    });
    if ((zombieIndex % 2) == 1) {
        zombieImage.src = "images/character/zombie_female_run.png";
    } else {
        zombieImage.src = "images/character/zombie_male_run.png";
    }

    zombie[zombieIndex].x = canvas.width + Math.random() * (canvas.width - zombie[zombieIndex].getFrameWidth() * zombie[zombieIndex].scaleRatio);
    zombie[zombieIndex].y = canvas.height - 210;
    zombie[zombieIndex].scaleRatio = Math.random() * 0.5 + 0.5;
}