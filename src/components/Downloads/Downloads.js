import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import { ListItemIcon, Divider } from '@material-ui/core';
import { Button } from '@material-ui/core'
import { CheckCircleRounded, HighlightOffRounded, ArrowBackRounded } from '@material-ui/icons'
import Axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 'auto',
    backgroundColor: theme.palette.background.paper,
    marginTop: 10
  },
  stopButton: {
      color: '#FF6666', 
      paddingRight: 15
  },
  backButton: {
      marginBottom: 30
  },
  checkSymbol: {
    paddingLeft: 5
  }
}));

//www.2MovieRulz.gs - Anjali CBI (2019) Telugu (Org Vers) HDRip - x264 - MP3 - 700MB - ESub.mkv
export default function Downloads({ openDownloads, setDownloadsNumber }) {
  const classes = useStyles();
  const [ downloadedMovies, setDownloadedMovies ] = useState([]);
  const [ torrentStats, setTorrentStats ] = useState([]);

  useEffect(() => {
    Axios.get('http://localhost:6005/api/torrent/')
    .then(
      response => {
        if(response.data.length === undefined) { let newMovieArray = [response.data]; console.log(newMovieArray); setDownloadedMovies(newMovieArray)}
        else { setDownloadedMovies(response.data) }
        let count = 0;
        response.data.forEach(element => {
          if(element.status == 4) count = count+1;
        });

        setDownloadsNumber(count);
      })
    .catch(err => {     
      /**
       * Show error on the dialog box
       */
      console.log(err)
    })
    setInterval(requeseTorrentStats, 4000);
  }, [])

  const requeseTorrentStats = () => {
    Axios.get('http://localhost:6005/api/torrent/stats')
    .then(
      response => {
        setTorrentStats(response.data);
        console.log(response.data)
        let count = 0;
        response.data.forEach(element => {
          if(element.status == 6) window.location.reload();
          if(element.status == 4) count = count+1;
        });

        setDownloadsNumber(count);
        
      })
    .catch(err => {     
      /**
       * Show error on the dialog box
       */
      console.log(err)
    })
  }

  const parseMovieName = (movieName) => {
    if(movieName.includes(" - ")) return movieName.split(" - ")[1].split(")")[0].concat(")")
    return movieName.split("[")[0]
  }

  const parseDate = (dateString) => { 
    let monthMap = new Map();
    monthMap[1] = "Jan"; monthMap[2] = "Feb";
    monthMap[3] = "Mar"; monthMap[4] = "Apr";
    monthMap[5] = "May"; monthMap[6] = "Jun";
    monthMap[7] = "Jul"; monthMap[8] = "Aug";
    monthMap[9] = "Sept"; monthMap[10] = "Oct";
    monthMap[11] = "Nov"; monthMap[12] = "Dec";
    let date = new Date(dateString);
    let day = date.getDate()
    let month = monthMap[date.getMonth() + 1];
    let year = date.getFullYear()

    return `${month}, ${day}, ${year}`;
  }

  const didPressStop = (torrentId, movieId) => {
    Axios.delete('http://localhost:6005/api/torrent', { data: { torrentId: torrentId, movieId: parseInt(movieId) }})
    .then(() => {
        Axios.get('http://localhost:6005/api/torrent')
        .then(
          response => {
            if(response.data.length === undefined) { let newMovieArray = [response.data]; console.log(newMovieArray); setDownloadedMovies(newMovieArray);}
            else { setDownloadedMovies(response.data) }
            let count = 0;
            response.data.forEach(element => {
              if(element.status == 4) count = count+1;
            });
  
            setDownloadsNumber(count);
          })
        .catch(err => {     
          /**
           * Show error on the dialog box
           */
          console.log(err)
        })
    })
    .catch(err => {     
      /**
       * Show error on the dialog box
       */
      console.log(err)
    })
  }

  const downloadedMoviesElements = () => {
    let downloadedMoviesArray =  downloadedMovies.slice(0).reverse().map((element, index) => {
        torrentStats.forEach(responseElement => {
          // responseElement.name = responseElement.name.toLowerCase();
          // element.movieName = element.movieName.toLowerCase();
          // if(responseElement.name.includes(element.movieName)) { console.log("Got the movie"+element.movieName); element.eta = (responseElement.eta/60).toFixed(2); element.speed = (responseElement.rateDownload/1024).toFixed(2); element.percentageDone = ((responseElement.percentageDone) * 100); console.log(element.speed);}
          if(responseElement.id === element.movieId) { element.eta = (responseElement.eta/60).toFixed(2); element.speed = (responseElement.rateDownload/1024).toFixed(2); element.percentageDone = ((responseElement.percentageDone) * 100); }
        })
      if(downloadedMovies.length - index === 1) { return (
        <div key={index}>
          <ListItem>
            <ListItemText primary={ parseMovieName(element.movieName) } secondary={ element.status === 0 ? parseDate(element.addedOn): parseDate(element.addedOn) + ` | ETA: ${ element.eta === undefined ? 0 : element.eta } Min | Speed: ${ element.speed === undefined ? 0 : element.speed } Kbps` } />
            { element.status === 0 ? <ListItemIcon><CheckCircleRounded className={classes.checkSymbol}/></ListItemIcon>: <ListItemIcon><Button onClick={() => didPressStop(element.id, element.movieId)}><HighlightOffRounded className={ classes.stopButton } /></Button></ListItemIcon>}
          </ListItem>
        </div>
      )}
      return (<div key={index}>
                <ListItem >
                  <ListItemText primary={ parseMovieName(element.movieName) } secondary={ element.status === 0 ? parseDate(element.addedOn): parseDate(element.addedOn) + ` | ETA: ${ element.eta === undefined ? 0 : element.eta } Min | Speed: ${ element.speed === undefined ? 0 : element.speed } Kbps | ${ element.percentageDone === undefined ? 0 : element.percentageDone } %` } />
                  { element.status === 0 ? <ListItemIcon><CheckCircleRounded className={classes.checkSymbol}/></ListItemIcon>: <ListItemIcon><Button onClick={() => didPressStop(element.id, element.movieId)}><HighlightOffRounded className={ classes.stopButton } /></Button></ListItemIcon>}
                </ListItem>
                <Divider />
              </div>)});
    return downloadedMoviesArray;
  }

  return (
    <List className={classes.root}>
    {/* <Button className={classes.backButton} onClick={ openDownloads(false)}><ArrowBackRounded /></Button> */}
      { downloadedMoviesElements() }
      {/* <ListItem>
        <ListItemAvatar>
          <Avatar>
            <WorkIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Work" secondary="Jan 7, 2014" />
        <ListItemIcon><CheckCircleRounded /></ListItemIcon>
      </ListItem>
      <Divider /> */}
      {/* <ListItem>
        <ListItemAvatar>
          <Avatar>
            <BeachAccessIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary="Vacation" secondary="July 20, 2014" />
        <ListItemIcon><HighlightOffRounded className={classes.stopButton}/></ListItemIcon>
      </ListItem> */}
    </List>
  );
}
