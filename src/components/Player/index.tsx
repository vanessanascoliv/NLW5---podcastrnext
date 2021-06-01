import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';


import {usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import Episode from '../../pages/episodes/[slug]';

export function Player( ){
    const audioRef = useRef<HTMLAudioElement>(null);//armazenando elemento de audio do HTML
    //Criando um estado para a parte do progresso, ou seja qto tempo em segundo pecorrido
    const [progress, setProgress] = useState(0);

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        isLooping,
        isShuffling,
        tooglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        playNext,
        playPrevious,
        clearPlayingState,
        hasNext,
        hasPrevious,
    } = usePlayer();

    //essa função será execultada toda vez que o isPlaying tiver seu valor alterado
    useEffect(() => {
        if(!audioRef.current){
            return;
        }
        if(isPlaying){
            audioRef.current.play()
        }else {
            audioRef.current.pause();
        }
    },[isPlaying])

    function setupProgressListener() {
   // sempre que mudar de um som p outro o current time sempre voltará para a estaca 0
        audioRef.current.currentTime = 0;
        //Retornará o tempo atual do Palyer
        audioRef.current.addEventListener('timeupdate' , () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    }
//amount é o numero de duração até onde o usuário arrastou a bolinha
    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }
    // Se tiver proximo episodio ele toca se não ele limpa o estado
    function handleEpisodeEnded() {
        if (hasNext) {
            playNext()
        }else {
            clearPlayingState()
        }
    }

    
    //determinando qual episodio que estar tocando
    const episode = episodeList[currentEpisodeIndex]

    return(
        <div className = {styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora </strong>
            </header>

            { episode? (
                <div className= {styles.currentEpisode}>
                    <Image
                    width={592}
                    height={592}
                    src={episode.thumbnail}
                    objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>    
            ) : (
                <div className = {styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>   
            ) }
            {/* só será aplicado o styles.empty caso não tenha nenhum episódio tocando*/}
             <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                     { episode ? (
                         <Slider 
                          max={episode.duration} //tempo maximo
                          value={progress} // o tanto que o episodio progrediu
                          onChange= {handleSeek}// o q acontece qdo o usuário arasta a bolinha
                          trackStyle = {{backgroundColor: '#04b361'}}//cor do slider da parte de progresso
                          railStyle = {{backgroundColor:'#9f75ff'}}//codr da parte do slider q não teve progresso
                          handleStyle= {{borderColor: '04b361', borderWidth: 4}} //bolinha do slider
                         />
                     ): ( 
                       <div className={styles.emptySlider}/>
                    )}
                    </div>
             {/*tempo max: Pega o tempo max, mas se não tiver nenhum episodio tocandoo  tempo de duração vai ser 0 */}
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>
                
                {/* inserindo o audio, ele só execulta o que esta depois  && caso o primeiro caso seja valido*/}
                { episode && (
                    <audio 
                    src = {episode.url}
                    autoPlay //Ao dar play o audio já inicia
                    onEnded = {handleEpisodeEnded}//execultado qdo o audio chega no final
                    ref = {audioRef}
                    loop = {isLooping}
                    onPlay = { () => setPlayingState(true)} //permite dar play pelo teclado
                    onPause = { () => setPlayingState(false)}//permite dar pause pelo teclado
                    onLoadedMetadata = {setupProgressListener} //Dispara assim q o audio começa a tocar
                     />
                )}

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={!episode || episodeList.length === 1}
                        onClick = {toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"/>

                    </button>
                    <button type="button" onClick={playPrevious}disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                    </button>
                    <button 
                      type="button"
                      className={styles.playButton}
                      disabled={!episode}
                      onClick={tooglePlay}
                      >
                       { isPlaying ? 
                            (<img src="/pause.svg" alt="Pausado"/>)
                            :
                            (<img src="/play.svg" alt="Tocar"/>)
                         
                       }
                    </button>

                    <button type="button" onClick= {playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxiam"/>
                    </button>
                    <button 
                        type="button"
                        disabled= {!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}>
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
             </footer>
        </div>

    );
}