//todo add preloader gif logo

const baseUrl = "assets/";
        
const gameWidth = $(window).width();
const gameHeight = 600;
var groundScale = Math.round(gameWidth/gameHeight);

var config = {
    type: Phaser.AUTO,
    width: gameWidth,
    height: gameHeight,
    backgroundColor: "#5EAB98",
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var ground;
var cursors;

const MAX_VELOCITY_FOX = 350;
const MIN_VELOCITY_FOX = 150;
const MAX_FOOD_IN_GAME = 10;
const DELAY_ADD_FOOD = 70;

var foxVelocity = 150;
var expSpeed = 1;
var foodGroup;
var foodInGame = 0;
var count = 0;
var isEat = false;

var game = new Phaser.Game(config);

function preload ()
{
  this.load.image('ground', (baseUrl + 'ground.png'));
  this.load.atlas('fox-walk', (baseUrl + 'foxAnimations/fox_walk.png'), (baseUrl + 'foxAnimations/fox_walk.json'));
  this.load.atlas('fox-run', (baseUrl + 'foxAnimations/fox_run.png'), (baseUrl + 'foxAnimations/fox_run.json'));
  this.load.atlas('fox-jump', (baseUrl + 'foxAnimations/fox_jump.png'), (baseUrl + 'foxAnimations/fox_jump.json'));
  this.load.atlas('fox-eat', (baseUrl + 'foxAnimations/fox_eat.png'), (baseUrl + 'foxAnimations/fox_eat.json'));
  this.load.atlas('fox-idle', (baseUrl + 'foxAnimations/fox_idle.png'), (baseUrl + 'foxAnimations/fox_idle.json'));
  this.load.atlas('chicken-idle', (baseUrl + 'chickenAnimations/chicken_idle.png'), (baseUrl + 'chickenAnimations/chicken_idle.json'));
  this.load.atlas('chicken-fall', (baseUrl + 'chickenAnimations/chicken_fall.png'), (baseUrl + 'chickenAnimations/chicken_fall.json'));
  this.load.atlas('chicken-land', (baseUrl + 'chickenAnimations/chicken_land.png'), (baseUrl + 'chickenAnimations/chicken_land.json'));
  this.load.atlas('chicken-peckingOnce', (baseUrl + 'chickenAnimations/chicken_peckingOnce.png'), (baseUrl + 'chickenAnimations/chicken_peckingOnce.json'));
  this.load.atlas('chicken-peckingTwice', (baseUrl + 'chickenAnimations/chicken_peckingTwice.png'), (baseUrl + 'chickenAnimations/chicken_peckingTwice.json'));
}

function create ()
{
    $("#game img").remove();
  
    ground = this.physics.add.staticImage(0, (gameHeight-32), 'ground').setScale((gameWidth/10), 1).refreshBody();
    player = this.physics.add.sprite(gameWidth/2, 250, 'fox-walk');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setScale(1, 1);
    foodGroup = this.add.group();
    console.log(player);
    player.body.debugShowBody = true;

    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('fox-walk', { prefix: 'fox_walk/frame', start: 0, end: 23 }),
        frameRate: 24,
        repeat: -1
    });

    this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNames('fox-run', { prefix: 'fox_run/frame', start: 0, end: 11 }),
        frameRate: 24,
        repeat: -1
    });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNames('fox-jump', { prefix: 'fox_jump/frame', start: 0, end: 27 }),
        frameRate: 24,
        repeat: -1
    });

    this.anims.create({
        key: 'eat',
        frames: this.anims.generateFrameNames('fox-eat', { prefix: 'fox_eat/frame', start: 0, end: 19 }),
        frameRate: 24,
        repeat: 0
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNames('fox-idle', { prefix: 'fox_idle/frame', start: 0, end: 54 }),
        frameRate: 24,
        repeat: -1
    });

    this.anims.create({
        key: 'chickenFall',
        frames: this.anims.generateFrameNames('chicken-fall', { prefix: 'chicken_fall/frame', start: 0, end: 24 }),
        frameRate: 24,
        repeat: 0
    });

    this.anims.create({
        key: 'chickenLand',
        frames: this.anims.generateFrameNames('chicken-land', { prefix: 'chicken_land/frame', start: 0, end: 24 }),
        frameRate: 24,
        repeat: 0
    });

    this.anims.create({
        key: 'chickenIdle',
        frames: this.anims.generateFrameNames('chicken-idle', { prefix: 'chicken_idle/frame', start: 0, end: 66 }),
        frameRate: 24,
        repeat: -1
    });

    this.anims.create({
        key: 'chickenPeckingOnce',
        frames: this.anims.generateFrameNames('chicken-peckingOnce', { prefix: 'chicken_peckingOnce/frame', start: 0, end: 31 }),
        frameRate: 24,
        repeat: 0
    });

    this.anims.create({
        key: 'chickenPeckingTwice',
        frames: this.anims.generateFrameNames('chicken-peckingTwice', { prefix: 'chicken_peckingTwice/frame', start: 0, end: 39 }),
        frameRate: 24,
        repeat: 0
    });
    
    addFood(this);

    cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.collider(player, ground);

    this.physics.add.collider(foodGroup, ground);
    
    /* FOX AND CHICKEN COLLISION*/
    this.physics.add.overlap(player, foodGroup, playerCollideFood, null, this);
}

function update ()
{
    count++;
  
    if(count == DELAY_ADD_FOOD && foodInGame < MAX_FOOD_IN_GAME){
        addFood(this);
        count = 0;
        foodInGame ++;
    }
    
    if (!isEat) {
        if (cursors.left.isDown)
        {
            updateFoxSpeed();
            player.setVelocityX(-foxVelocity);
            player.flipX = false;
            
            if(foxVelocity >= (MAX_VELOCITY_FOX - MIN_VELOCITY_FOX)) {
                // run
                player.anims.play('run', true);
            } else {
                // walk
                player.anims.play('walk', true);
            }
        } else if (cursors.right.isDown)
        {
            updateFoxSpeed();
            player.setVelocityX(foxVelocity);
            player.flipX = true;
            
            if(foxVelocity >= (MAX_VELOCITY_FOX - MIN_VELOCITY_FOX)) {
                // run
                player.anims.play('run', true);
            } else {
                // walk
                player.anims.play('walk', true);
            }
        } else if (cursors.space.isDown)
        {
            //player.anims.play('jump', true); // bug to fix
        } else {
            foxVelocity = 150;
            expSpeed = 1;
            player.setVelocityX(0);
            player.anims.play('idle', true);
        }
    }
}

function updateFoxSpeed() {
    expSpeed += expSpeed*0.02;
    if(foxVelocity < MAX_VELOCITY_FOX) foxVelocity += expSpeed;
}

/* FOX EAT CHICKEN*/
function playerCollideFood(theplayer, food) {
    isEat = true;
    foxVelocity = 150;
    expSpeed = 1;
    player.setVelocityX(0);
    player.anims.play('eat');
    player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, function () {
        isEat = false;
    });
    foodInGame--;
    count = 0;
    food.destroy();
  /*score++;
  scoreText.text = 'Score: ' + score;*/
}

/* ADD CHICKEN IN THE GAME */
function addFood(theGame) {
    let posX = Phaser.Math.Between(0, gameWidth);
    let posY = -111; // food height
    let food = theGame.physics.add.sprite(posX, posY, 'chicken-idle');
    let randomFlip = Phaser.Math.Between(0, 1);
    let randomAnim = Phaser.Math.Between(0, 1);
    
    food.flipX = randomFlip ? true : false;
    food.setScale(0.8, 0.8);
    food.setBounce(0.2);
    food.setGravityY(400);
    food.setCollideWorldBounds(true);
    
    food.isLand = false;
    
    food.anims.play('chickenFall', true);
    food.chain(['chickenLand', 'chickenIdle']);
    
    setInterval(function(){
        setTimeout(function(){
            if (randomAnim === 1) {
                food.playAfterRepeat('chickenPeckingOnce');
            } else {
                food.playAfterRepeat('chickenPeckingTwice');
            }
        }, Phaser.Math.Between(500, 5000));
        
        food.anims.play('chickenIdle', true);
        
    }, 3000);
    
    foodGroup.add(food);
    
    // todo: add random pecking + walk oposite fox when he's walking 
}
