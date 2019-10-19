import React, { Component } from 'react';
import './App.css';
import { FaPlus, FaMinus} from "react-icons/fa";
import { IconContext } from "react-icons";
import SpotifyWebApi from 'spotify-web-api-js';
//import { importDefaultSpecifier } from '@babel/types';
//import { conditionalExpression } from '@babel/types';
var spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(){
    super();
    var params = this.getHashParams();
    var token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      images: false,
      currentlyPlaying: null,
      songDict:{}
  
    }
    
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }


  getTopArtists=()=>{
    spotifyApi.getMyTopArtists()
    .then((response)=>{ 
      this.setState({
          images: response.items.map(function (artist) { 
      return {"Artist": artist.name, "Image": artist.images[0].url, "ID": artist.id}
       }) 
    })
  })
  console.log(this.state.images)
  }

getRelatedArtists=(ArtistID)=>{
  console.log(ArtistID)
  spotifyApi.getArtistRelatedArtists(ArtistID)
  .then((response)=>{ 
    this.setState({
        images: response.artists.map(function (artist) { 
    return {"Artist": artist.name, 
            "Image": artist.images[0].url || 'http://pluspng.com/img-png/spotify-logo-png-open-2000.png', 
            "ID": artist.id }
     }) 
  })
}) 
}

playMusic=(artistID)=>{
  spotifyApi.getArtistTopTracks(artistID,"US")
  .then((response)=>{ 
    this.state.currentlyPlaying && this.state.currentlyPlaying.pause()
    this.setState({
        currentlyPlaying: new Audio(response.tracks[0].preview_url) || null
     }) 
     this.state.currentlyPlaying && this.state.currentlyPlaying.play()
  })
}

saveTopSong=(artistID)=>{
  spotifyApi.getArtistTopTracks(artistID,"US")
  .then((response)=>{ 
    console.log("first success")
    console.log(response.tracks[0].id)
     spotifyApi.addToMySavedTracks([response.tracks[0].id]) 
     })
    

}



stopMusic=()=>{
  this.state.currentlyPlaying && this.state.currentlyPlaying.pause()
  this.setState({
    currentlyPlaying: null
 }) 
}

  render() {
    return (
      <div className="App">
        
        <a href='http://localhost:8888' > 
        <button>Login To Spotify </button>
        </a>
      
          
         
          
        <div className="containerParent">
      
      {this.state.images && this.state.images.map((img) => (
       
        <div key= {img.ID} className="container">
        < img key= {img.Name} 
        className="circular--portrait" 
        alt={img.Artist} 
        src = {img.Image} 
        onClick={()=>this.getRelatedArtists(img.ID)}
        onMouseEnter={()=>this.playMusic(img.ID)}
        onMouseOut={()=>this.stopMusic()}
         />

         
        <div  key= {img.Name} className="centered">{img.Artist}</div>
      <FaPlus className='green-plus' size={35} onClick={()=>this.saveTopSong(img.ID)}/>
         </div>
       
          ))}
           
        </div>
      
       
        { this.state.loggedIn &&
          <button onClick={() => this.getTopArtists()}>
            Get Top Artists
          </button>
        }
      </div>
    );
  }
}

export default App;