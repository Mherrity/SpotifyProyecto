import React, { Component } from 'react';
import './App.css';
import { FaPlus, 
        FaMinus,
        FaChevronRight,
        FaChevronLeft,
} from "react-icons/fa";
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
      songDict: {state : [] },
      Artists: {}
    } 
    this.getTopArtistsTwo=this.getTopArtistsTwo.bind(this)
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


  incrementSong=(ArtistID)=>{
   let index = this.state.Artists[ArtistID]['CurrentPlaying']
   let len = this.state.Artist[ArtistID].songDict.length

   this.setState(prevState => {
    let Artist = Object.assign({}, prevState.Artists);  // creating copy of state variable jasper
    Artist[ArtistID]['CurrentPlaying'] =  index+1===len ? 0 : index+1   // update the name property, assign a new value                 
    return {Artist};                                 // return new object jasper object
  })
 
  }

  decrementSong=(ArtistID)=>{
    let index = this.state.Artists[ArtistID]['CurrentPlaying']
    let len = this.state.Artist[ArtistID].songDict.length

    this.setState(prevState => {
     let Artist = Object.assign({}, prevState.Artists);  // creating copy of state variable jasper
     Artist[ArtistID]['CurrentPlaying'] =  index-1===-1 ? len-1 : index-1   // update the name property, assign a new value                 
     return {Artist};                                 // return new object jasper object
   })

   }
  
  makeSongDict=(response,artistID)=>{
    this.setState(prevState => {
      let Artist = Object.assign({}, prevState.Artists);  // creating copy of state variable jasper
      Artist[artistID]['songDict'] =  response.tracks.map((track)=>{
          return track.preview_url
      })                  // update the name property, assign a new value                 
      return {Artist};                                 // return new object jasper object
    })
  }





  getTopArtists=()=>{
    spotifyApi.getMyTopArtists()
    .then((response)=>{
      response.items.forEach((artist)=> { 
        this.setState(({ Artists }) => ({
         Artists: {
           ...Artists,
           [artist.id]: {"Image": artist.images[0].url, 
           "Name": artist.name, 
           "songDict": [], 
           "Pop": artist.popularity,
           "CurrentPlaying": 0,
            "CurrentlyShown": null }
         }
       }))
  })  
      this.setState({
          images: response.items.map(function (artist) { 
      return {"Artist": artist.name, "Image": artist.images[0].url, "ID": artist.id}
       }) 
    })
  })
  //this.getTopArtistsTwo()
  }



getRelatedArtists=(ArtistID)=>{
  console.log(ArtistID)
  spotifyApi.getArtistRelatedArtists(ArtistID)
  .then((response)=>{
    response.artists.forEach((artist)=> { 
      this.setState(({ Artists }) => ({
       Artists: {
         ...Artists,
         [artist.id]: {
          "Image": artist.images[0].url, 
         "Name": artist.name, 
         "songDict": null, 
         "Pop": artist.popularity,
         "CurrentPlaying": 0,
          "CurrentlyShown": null }
       }
     }))
   })  
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
    this.makeSongDict(response,artistID)
    this.state.currentlyPlaying && this.state.currentlyPlaying.pause()

    let index = this.state.Artists[artistID].CurrentPlaying
    this.setState({
        currentlyPlaying: new Audio(this.state.Artists[artistID].songDict[index]) || null
     }) 

     this.state.currentlyPlaying && this.state.currentlyPlaying.play()
     console.log(this.state.Artists)
  })
}


saveTopSong=(artistID)=>{
  spotifyApi.getArtistTopTracks(artistID,"US")
  .then((response)=>{ 
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
      <h1 className='Popularity'>{this.state.Artists[img.ID].Pop}</h1>
      <FaPlus className='green-plus' size={35} onClick={()=>this.saveTopSong(img.ID)}/>
      <FaChevronLeft className='chevron-left' size={20} onClick={()=>this.decrementSong(img.ID)} />
      <FaChevronRight className='chevron-right' size={20} onClick={()=>this.incrementSong(img.ID)} />
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