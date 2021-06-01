import { createContext, useState, ReactNode, useContext } from 'react';

//typagem dos dados que vão ser passados no array de episodeList quando for dado o player
type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
};

//criação da typagem das informações que vão ser salvas dentro do contexto
type PlayerContextData = {
    episodeList: Episode[];
    currentEpisodeIndex: number;//indice atual do episodio que estar tocando
    isPlaying: boolean //verifica se o episodio selecionado esta tocando ou não
    play: (episode: Episode) => void;
    playList:(list: Episode[], index: number) => void;
    tooglePlay: () => void;
    toggleLoop: () => void;
    toggleShuffle: () => void;
    isLooping: boolean;
    isShuffling: boolean;
    setPlayingState: (state: boolean) => void;
    clearPlayingState: () => void;
    playNext: () => void;
    playPrevious: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
};

//Dentro do createContext eu passo o formato dos dados que o contexto vai iniciar
//então posso passar um objeto vazio e dizer que ele tem a estrutura do PlayerContextData
export const PlayerContext = createContext({} as PlayerContextData);

//Nome do componente + props //tipando o children 
//children pode ser  qualquer coisa que for colocada dentro do arquivo _app.tsx, pode ser HTML, React
//por poder ser qualquer coisa o tipo dele é ReactNode propriedade do react para definir o tipo dochildren
type PlayerContextProviderProps = {
  children: ReactNode;

}

export function PlayerContextProvider({children}: PlayerContextProviderProps){
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setISPlaying] = useState(false);
  const [isLooping, setIsLoooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  //criando a função para manipular o episodeList e currentEpisodeIndex
  //essa função recebe como parametro um episode que vai ser jogado dentro de setEpisodeList
  //toca apenas um episodio
  function play(episode: Episode){
    setEpisodeList([episode]);
    setCurrentEpisodeIndex(0);
    setISPlaying(true);
  }

//function para tocar uma lista de episodios
function playList(list: Episode[], index: number){
  setEpisodeList(list);
  setCurrentEpisodeIndex(index);
  setISPlaying(true)

}
// verifica se estiver tocando = 'pause' se estiver pausado= 'play'
  function tooglePlay(){
    setISPlaying(!isPlaying);// se tiver true tranforma em false e false em true
  }

  function toggleLoop(){
    setIsLoooping(!isLooping);
  }

  function toggleShuffle(){
    setIsShuffling(!isShuffling);
  }

  // função recebe se esta tocando ou não, ou seja, recebe true ou false
  function setPlayingState(state: boolean){
    setISPlaying(state);
  }
  //Função para limpar o Play como se não tivesse tocado nenhuma música
  function clearPlayingState() {
    setEpisodeList([]);
    setCurrentEpisodeIndex(0);
  }
  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length

// ir para o proximo episodio
  function playNext(){
     if(isShuffling){
       const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length)

       setCurrentEpisodeIndex(nextRandomEpisodeIndex);

     
     } else if(hasNext){
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  }
// voltar p o episodio anterior
  function playPrevious(){
    if(hasPrevious){
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  }

  return (
    <PlayerContext.Provider 
      value= {{
        episodeList,
        currentEpisodeIndex,
        play,
        playList,
        isPlaying,
        isLooping,
        isShuffling,
        tooglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        clearPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        
        }}
    >
        {children}
    </PlayerContext.Provider>
  )
}

//o modelo abaixo é uma forma de deixar mais simples a importação do contexto p dentro dos outros componentes
//dessa forma qdo outro componnete quiser usar o play basta inserir o usePlayer
export const usePlayer = () => {
  return useContext(PlayerContext);
}

