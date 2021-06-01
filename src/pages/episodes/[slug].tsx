import { ptBR } from 'date-fns/locale';
import { format, parseISO} from 'date-fns';
import  Image  from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticPaths, GetStaticProps } from 'next';

import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from '../episodes/episode.module.scss';
import { useContext } from 'react';
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    publishedAt: string;
    duration: number;
    durationAsString: string;
    description: string;
    url: string;
};

type EpisodeProps = {
    episode: Episode;
};

export default function Episode({ episode }: EpisodeProps){
    //outra forma de usar o contexto é const {} = useContext(PlayerContext)
    const {play} = usePlayer();

     return (
       <div  className={styles.episode}>
           <div className={styles.thumbnailContainer}>
              <Head>
               <title>{episode.title}| Podcastr</title>
              </Head>
               <Link href="/">{/*Ao clicar no botaõ voltamos pr a Home*/}
               <button type="button">
                   <img src="/arrow-left.svg" alt= "Voltar"/>
               </button>
               </Link>
               <Image
                width={700}
                height={160}
                src={episode.thumbnail}
                objectFit="cover"
               />
               <button type="button" onClick={() => play(episode)}>
                   <img src="/play.svg" alt="Tocar episódios" />
               </button>
           </div>
           <header>
               <h1>{episode.title}</h1>
               <span>{episode.members} </span>
               <span>{episode.publishedAt}</span>
               <span>{episode.durationAsString}</span>
           </header>

           <div className={styles.description} dangerouslySetInnerHTML ={{__html:episode.description}} />
         
       </div>
    )
}
/* o getStaticPaths serve para trabalhar páginas staticas com conteúdo dinamico
ou seja em toda a Rota que utilize o cochete ex: [slug].
É obrigado utilizar esse Método  em toda ropta que utiliza GetStaticProps
*/
export const getStaticPaths: GetStaticPaths = async () => { 
    //código abaixo vai fazer q seja gerado de forma estaticas o 2 últimos episodios
    const { data } = await api.get('episodes',{
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })
    //pecorro os episodes acima atrávés do id
    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })
    //repasso a conmstante paths definida acima
    return {
        paths,
        fallback: 'blocking'
    }
}

//para receber o slug que esta sendo acessado eu uso o parametro ctx(contexto)
export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;
    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
        id:data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url:data.file.url,
    };

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, //chamada a API vai ser feita 1 vez ao dia(24hrs)
    }
}
