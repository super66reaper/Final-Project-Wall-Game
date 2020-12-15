import React, { useState, useEffect } from "react";
import Sketch from "react-p5";
import axios from 'axios';
// import Level from './components/Level'
// import p5Types from "p5";

//UI
let width = 1000;
let height = 500;

//Player Position
let x = 50;
let y = height / 2;

//Player Movement
let horizontalInput = 0;
let verticalInput = 0;
let speed = 5;

//Player Dash
let dashTime = 15;
let dashCounter = 15;
let dashFrames = 0;
let dashSpeed = 4;

//Player Health
let dead = false;

//MovingWall
let wallWaitPos = -500;
let wallX = wallWaitPos - width;
let wallSpeed = 2;
let trueWallX = -500;

//Levels
let currentLevel = 0;
let levelWalls;
let editing = false;

//Collisions
let previousPlayerX = x

let addingLevel = false;

function App() {
  return Main()
}

function Main() {
  const [levels, setLevels] = useState([])
  const [newWallX, setNewWallX] = useState('100')
  const [newWallY, setNewWallY] = useState('125')
  const [newWallWidth, setNewWallWidth] = useState('20')
  const [newWallHeight, setNewWallHeight] = useState('250')
  const [deleteLevelID, setDeleteLevelID] = useState('1')
  const url = 'http://localhost:3333/levels/'

  const hook = () => {
    //console.log('effect')
    axios
      .get(url)
      .then(response => {
        //console.log('promise fulfilled')
        setLevels(response.data)
    })
  }
  
  useEffect(hook, [])
  //console.log('render', levels.length, 'levels')

  const addWallToLevel = (event) => {
    event.preventDefault()
    if(currentLevel > 0 && editing) {  
      const newLevels = new Array(0);

      //Make New Array of Levels
      for(let i = 0; i < levels.length; i++) {
        const levelObject = {
          id: i + 1,
          levelWidth: levels[i].levelWidth,
          walls: levels[i].walls
        }
        
        if(i + 1 === currentLevel) {
          levelObject.walls.push({
            x: newWallX,
            y: newWallY,
            width: newWallWidth,
            height: newWallHeight
          })
        }

        newLevels.push(levelObject)
      }

      //Delete All Current Levels
      deleteAll().catch(err => console.log(err))

      //Add Levels
      console.log(newLevels)
      addLevels(newLevels)

      // loadLevel()
    }
  }

  const addWallToNewLevel = (event) => {
    event.preventDefault()
    addingLevel = true;

    //Create Level
    const levelObject = {
      id: levels.length + 1,
      levelWidth: 1000,
      walls: new Array(0)
    }

    //Add Wall
    levelObject.walls.push({
      x: newWallX,
      y: newWallY,
      width: newWallWidth,
      height: newWallHeight
    })

    axios 
      .post(url, levelObject)
      .then(response => {
        console.log(response.data)
        setLevels(levels.concat(response.data))
        addingLevel = false
    })
  }

  async function addLevels(levelsToAdd) {
    await Promise.all(
      levelsToAdd.map(element => axios.post(url, element))
    ).then(response => {
      setLevels(levels.concat(response.data))
      levelWalls = levels.walls
    })
  }

  //Deleting
  const deleteAllLevels = (event) => {
    event.preventDefault();

    currentLevel = 0
    loadLevel();

    deleteAll();
  }

  async function deleteAll() {
    await Promise.all(
      levels.map(element => axios.delete(url+element.id))
    ).then ( response => {
      setLevels(response.data)
    })
    loadLevel()
  }

  const deleteThisLevels = (event) => {
    event.preventDefault();
    deleteLevel(deleteLevelID)

    if(currentLevel === deleteLevelID) {
      currentLevel = 0;
    }
  }

  const deleteLevel = (id) => {
    console.log("deleting: " + id)
    axios.delete(url + id)
      .then(response => {
        setLevels(levels.concat(response.data))
    });
  }

  const loadLevel = () => {
    console.log("reseting")
    
    resetLevel()
    if(currentLevel > levels.length) {
      console.log("No level with id of: " + currentLevel)
      if(levels.length <= 0) {
        console.log("Reseting at level 0")
        currentLevel = 0
      }else {
        console.log("Reseting at level 1")
        currentLevel = 1
      }
    }
    if(currentLevel !== 0) {
      levelWalls = levels[currentLevel - 1].walls
    }
  }
  
  const resetLevel = () => {
    dashTime = 15;
    dashCounter = 0;
    dashFrames = 0;
    horizontalInput = 0;
    verticalInput = 0;
    x = 60;
    y = height / 2;
    dead = false

    wallX = wallWaitPos - width;
    wallSpeed = 2;
    trueWallX = -500;
  }

  function handleNewWallXChange(event) { setNewWallX(event.target.value); }
  function handleNewWallYChange(event) { setNewWallY(event.target.value); }
  function handleNewWallWidthChange(event) { setNewWallWidth(event.target.value); }
  function handleNewWallHeightChange(event) { setNewWallHeight(event.target.value); }
  function handleEditingChange() { 
    editing = !editing 
    if(!editing) {
      loadLevel();
    }
  }
  function changeDeleteLevelID(event) { setDeleteLevelID(event.target.value); }

  //Start
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(width, height).parent(canvasParentRef);
    
    dashCounter = dashTime;
  };
  
  //Update
  const draw = (p5) => {
    p5.background(100, 100, 100);

    //Text
    p5.textSize(25)
    p5.fill(255,255,255)
    p5.text("Level: " + currentLevel + "/" + levels.length, 15, 25)

    //Player
    if(!dead && !editing) {
      p5.fill(255, 255, 255);
      p5.ellipse(x, y, 70, 70);
    }
    
    x = x + (horizontalInput * speed);
    y = y + (verticalInput * speed);

    //MovingWall
    p5.fill(0, 0, 0);
    p5.rect(wallX, 0, width, height)
    moveWall();

    //LevelWalls
    if(currentLevel > 0 && levelWalls.length > 0) {
      for(let i = 0; i < levelWalls.length; i++) {
        p5.rect(levelWalls[i].x, levelWalls[i].y, levelWalls[i].width, levelWalls[i].height)
      }
      levelWalls.forEach(levelWall => {
        p5.rect(levelWall.x, levelWall.y, levelWall.width, levelWall.height)
      });
    }

    //Ghost Wall
    //Ghost Player
    if(editing) {
      p5.fill(111, 111, 111);
      p5.rect(newWallX, newWallY, newWallWidth, newWallHeight)
      p5.fill(25, 25, 50);
      p5.ellipse(x, y, 70, 70)

      wallSpeed = 0
      wallX = wallWaitPos - width
    }

    //Death
    if(dead) {
      p5.textSize(150);
      p5.fill(105, 0, 25);
      p5.text('You Died', width / 4, height / 2);
    }

    //Player
    dashTimer();

    //Collision
    testPlayerCollision();

    finish();
  };

  //Input
  const keyPressed = (p5) => {
    horizontalInput = 0;

    if (p5.keyCode === p5.RIGHT_ARROW && dashCounter <= 0) {
      dash();
    }

    verticalInput = 0;
    if (p5.keyCode === p5.UP_ARROW) {
      verticalInput = -1;
    } else if (p5.keyCode === p5.DOWN_ARROW) {
      verticalInput = 1;
    }else {
      verticalInput = 0;
    }
  }

  //Input
  const keyReleased = (p5) => {
    if(p5.keyCode === p5.UP_ARROW || p5.keyCode === p5.DOWN_ARROW) {
      verticalInput = 0;
    }
  }

  //Player Dash
  const dash = () => {
    dashCounter = dashTime;
    dashFrames = 5;
  }

  //Player Dash
  const dashTimer = () => {
    if(dashCounter > 0) {
      dashCounter--;
    }
    if(dashFrames > 0) {
      dashFrames --;
      horizontalInput = dashSpeed;
    }else {
      horizontalInput = 0;
    }
  }

  //Player Finish
  const finish = () => {
    if(x >= width) {
      //Next level
      console.log("Level Finished")
      currentLevel++;
      loadLevel();
    }
  }

  //Wall
  const moveWall = () => {
    if(trueWallX < width) {
      wallX = wallX + wallSpeed;
      trueWallX = wallX + width;
    }
  }

  //Collision
  const testPlayerCollision = () => {
    //Moving Wall
    if(trueWallX > x) {
      console.log("Player Died")
      dead = true;
    }

    //Test if preivous frame was before the wall
    if(currentLevel > 0) {
      if(levelWalls.length > 0) {
        for(let i = 0; i < levelWalls.length; i++) {
          let currentWall = levelWalls[i]
          let wallX = currentWall.x
          let wallY = currentWall.y
          let wallWidth = currentWall.width
          let wallHeight = currentWall.height
    
          //Test Y
          if(y > wallY && y < +wallY + +wallHeight) {
            //Test X
            if((x > wallX && x < +wallX + +wallWidth) || (previousPlayerX < wallX && x >= +wallX)) {
              console.log("Player Died")
              dead = true;
            }
          }
        }
      }
    }
    previousPlayerX = x
  }

  return (
    <div className="Main">
      <h1>Wall Game</h1>
      <Sketch setup={setup} draw={draw} keyPressed={keyPressed} keyReleased={keyReleased}/>
      <form>  
        <input type="checkbox" onChange = {handleEditingChange}/>
        <line>Editing</line>
      </form>

      <p>Wall Values(X, Y, Width, Height)</p>

      <input 
        value={newWallX}
        onChange = {handleNewWallXChange}
        />
        <input 
        value={newWallY}
        onChange = {handleNewWallYChange}
        />
        <input 
        value={newWallWidth}
        onChange = {handleNewWallWidthChange}
        />
        <input 
        value={newWallHeight}
        onChange = {handleNewWallHeightChange}
        />

      <form onSubmit={addWallToLevel}>
        <button type="submit">Add Wall</button>
      </form>
      <form onSubmit={addWallToNewLevel}>
        <button type="submit">Add To New Level</button>
      </form>
      <form onSubmit={deleteAllLevels}>
        <button type="submit">Delete All Levels</button>
      </form>
      <form onSubmit={deleteThisLevels}>
        <input
        value={deleteLevelID}
        onChange={changeDeleteLevelID}
        />
        <button type="submit">Delete This Level</button>
      </form>
    </div>
  )
}

export default App;