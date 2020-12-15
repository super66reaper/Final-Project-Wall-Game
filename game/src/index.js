import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

//BASICS
//Move Vertical*
//Dash To The Right*
//Start at left of screen and get to right side to progress*
//Darkness from left side forcing you to move at constant rate*
//Walls that player has to dodge*
//Level system with arrays that level loader loads into game*

//REACT
//Spreadsheet that I learned about to import levels*
//-Uploads should always be saved-*
//Game loads up levels from spreadsheet*
//Game displays position when adding walls to confirm*
//Delete for levels*

//LEVELS
//array of walls*
//walls have a position and a width, height*

//What I would have liked to add:
//Styles and better looking game with html
//Deleting Levels to work
//Proper finish and level loop

//Errors:
//Not deleting all levels resulting in dublicate id
//Deleting works but you have to reset website to get to work
//When adding new levels, levels is not defined and bugs out
//Server randomly crashes when adding new walls

//I tried my best but it was very difficult, I would still like to work on this project though cause I have learned a lot and find this lots of fun to figure out

ReactDOM.render(<App/>,document.getElementById('root'))