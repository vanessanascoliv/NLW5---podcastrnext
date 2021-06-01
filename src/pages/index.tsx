import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import head from 'next/head';
import { format, parseISO} from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import {usePlayer } from '../contexts/PlayerContext';

import styles from './home.module.scss';
import Head from 'next/head';



type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  duration: number;
  durationAsString: string;
  url: string;
}
type HomeProps = {
 latestEpisodes: Episode[];
 allEpisodes: Episode[];
}
export default function Home({latestEpisodes, allEpisodes}: HomeProps) {
  const {playList} = usePlayer();
  /*os 3 pontos(...) quer dizer que em vez de eu está atualizando as informações de dentro do 
  latestEpisodes e allEpisodes eu estou copiando os dados e  criando uma nova, melhorando a performace em memoria*/
  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className= {styles.homePage}>

    <Head>
      <title>Home | Podcastr</title>
    </Head>

      <section className= {styles.latestEpisodes}>
        <h2>Últimos lançamentos </h2>
        <ul>
          {latestEpisodes.map((episode, index) =>{
            return (
              //apropriedade key deve ser colocada no 1º elemnto q vem dentro do map
              <li key={episode.id}>
                {/*Image: propriedade do next para trabalhar com imagens mais pesadas*/}
                <Image width={192}
                 height={192}
                 src={episode.thumbnail}
                 alt={episode.title} 
                 objectFit="cover"
                 />

                <div className={styles.episodeDetails}>
                 <Link href={
                  `/episodes/${episode.id}`}>
                  <a >{episode.title}</a>
                  {/* usando o <Link> em vez de reccaregar tudo novamente só irar carregar a página que foi chamada*/}
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>
                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="play-green.svg" alt="Tocar episode"/>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className= {styles.allEpisodes}>
          <h2>Todos episódios</h2>
          <table cellSpacing={0}>
            <thead>{/*cabeçalho da tabela*/}
            <tr>
              <th></th>{/*imagem*/}
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>{/*Play*/}
            </tr>  
            </thead>
            <tbody>
             {allEpisodes.map((episode, index)=> {
               return(
                 <tr key={episode.id}>
                   <td style={{width: 72}}>
                     <Image 
                      width= {120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit= "cover"
                     />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                      <a >{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>     
                    <td style={{width: 100}}>{episode.publishedAt}</td>   
                    <td>{episode.durationAsString}</td> 
                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                        <img src="/play-green.svg" alt="Tocar episódio" />
                      </button>
                    </td> 
                    
                 </tr>
               )
             })}
            </tbody>
          </table>
      </section>


    </div>
  )
}
/*Utilizando a SSG é  feita a chamda a  API somente quando necessário criando um HTML estatico para as demais pessoas que acessarem 
a mesma página, não tendo assim a necessidade de toda vez ficar fazendo chamada a API. Esse recurso so funciona em produção. 
Para simular é necessário criar uma build */
//tipando os parametros da função e o retorno dela passando o GetStaticProps
//configurando o limite de podcast e ordenando pela data de publicação usando '?_limit=12&_sort=published_at&_order=desc'
export  const  getStaticProps: GetStaticProps = async () => { 
  const {data} = await api.get('episodes',{
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  })
  //formatando os dados que vem da API
  const episodes = data.map(episode => {
    return{
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format( parseISO(episode.published_at), 'd MMM yy ' ,{ locale: ptBR}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url,
    };
  })

  // separando os 2 ultimos episodes da listagem completa para isso criei duas variaveis

  const latestEpisodes = episodes.slice(0,2);//retorna 2 episodes

  const allEpisodes = episodes.slice(2, episodes.length);//retorna os demais episodes

  return {
    props:{
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8, // de 8 em 8hrs vai ser feita a chamada a  API e carregados novos dados.
  }
}
